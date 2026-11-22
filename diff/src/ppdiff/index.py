"""The index page for a diffs folder: every pair in the series, plus per-place history.

History follows each matcher's links from one snapshot to the next, so a place
keeps its identity across the series even when its name or address changes. A
place's history only continues while consecutive pairs share a file (the new file
of one pair is the old file of the next).
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from linkage import verdicts as verdict_store

from .html_utils import embed_json, escape_html
from .names import friendly_label, sort_scrapes

TEMPLATE = Path(__file__).with_name("index_template.html")


def pair_folders(out_dir: Path) -> list[Path]:
    """Find pair folders in the order of their older input files.

    Args:
        out_dir: The folder containing the pair reports.

    Returns:
        Pair folders ordered by their input filenames' scrape dates.

    Raises:
        ValueError: If dated and undated input filenames are mixed.
    """
    pairs = []
    for link in out_dir.glob("*/link.json"):
        data = json.loads(link.read_text())
        pairs.append((link.parent, Path(data["left"]["path"]), Path(data["right"]["path"])))
    ordered = sort_scrapes([path for _, old, new in pairs for path in (old, new)])
    rank = {path: i for i, path in enumerate(ordered)}
    return [folder for folder, _, _ in sorted(pairs, key=lambda pair: (rank[pair[1]], rank[pair[2]], str(pair[0])))]


def _describe(entry: dict[str, Any]) -> str:
    """Summarize a changed or possibly matched place for the history view.

    Args:
        entry: A changed-place record from one diff.

    Returns:
        A short list of non-cosmetic changes and any location note.
    """
    parts = [
        c["field"] + (f" ({c['direction']})" if c.get("direction") else "")
        for c in entry["changes"]
        if not c.get("cosmetic")
    ]
    loc = entry.get("location")
    if loc and loc.get("moved_m") is not None:
        km = loc["moved_m"] / 1000
        parts.append(f"moved {km:.1f} km" if km >= 1 else f"moved {round(loc['moved_m'])} m")
    elif loc and loc.get("note"):
        parts.append(loc["note"])
    return ", ".join(parts) or "changed"


def history(folders: list[Path], matcher: str) -> list[dict[str, Any]]:
    """Follow a matcher's links to build each place's history across files.

    Args:
        folders: Pair folders in chronological order.
        matcher: The matcher whose links should define place identity.

    Returns:
        Places that changed at least once, with their ordered events.
    """
    places: dict[int, dict[str, Any]] = {}
    ids: dict[int, int] = {}  # row index in the current file -> place id
    next_id = 0
    previous_new = None

    def new_place() -> int:
        """Create an empty place record and return its internal identifier.

        Returns:
            The identifier used to connect this place's events.
        """
        nonlocal next_id
        next_id += 1
        places[next_id] = {"name": None, "events": []}
        return next_id

    for folder in folders:
        diff_path = folder / f"diff-{matcher}.json"
        if not diff_path.exists():
            continue
        link_output = json.loads((folder / "link.json").read_text())
        result = next((r for r in link_output["results"] if r["matcher"] == matcher), None)
        if result is None:
            continue
        diff = json.loads(diff_path.read_text())
        old_file = link_output["left"]
        if (Path(old_file["path"]).name, old_file["sha256"]) != previous_new:
            ids = {}  # the chain broke: start fresh from this pair's old file
        when = friendly_label(link_output["right"]["path"])
        pair = folder.name

        def pid(old_index: int) -> int:
            """Get or create the history identifier for an old-file row.

            Args:
                old_index: The row index in this pair's older file.

            Returns:
                The place identifier for that row.
            """
            if old_index not in ids:
                ids[old_index] = new_place()
            return ids[old_index]

        def event(place_id: int, kind: str, text: str, name: str) -> None:
            """Record a change and update the place's latest name.

            Args:
                place_id: The place whose history should be updated.
                kind: The event type, such as ``"changed"`` or ``"removed"``.
                text: The short description shown in the history.
                name: The place's name in this event.

            Returns:
                ``None``.
            """
            places[place_id]["events"].append({"when": when, "pair": pair, "kind": kind, "text": text})
            places[place_id]["name"] = name

        changed = {e["old_index"]: e for e in diff["changed"]}
        possible = {e["old_index"]: e for e in diff["possible_matches"]}
        next_ids: dict[int, int] = {}
        for link in result["links"]:
            place_id = pid(link["left"])
            next_ids[link["right"]] = place_id
            if link["left"] in changed:
                e = changed[link["left"]]
                event(place_id, "changed", _describe(e), e["name"])
            elif link["left"] in possible:
                e = possible[link["left"]]
                event(place_id, "possible", f"possible match with {e['name']} (review band): {_describe(e)}", e["name"])
        for r in diff["removed"]:
            event(pid(r["old_index"]), "removed", "removed", r["name"])
        for a in diff["added"]:
            place_id = new_place()
            next_ids[a["new_index"]] = place_id
            event(place_id, "added", "added", a["name"])
        ids = next_ids
        new_file = link_output["right"]
        previous_new = (Path(new_file["path"]).name, new_file["sha256"])

    out = [{"name": p["name"], "events": p["events"]} for p in places.values() if p["events"]]
    return sorted(out, key=lambda p: (-len(p["events"]), p["name"] or ""))


def pair_rows(folders: list[Path]) -> list[dict[str, Any]]:
    """Collect the summaries shown for each pair in the index.

    Args:
        folders: Pair folders to include.

    Returns:
        One index-ready summary record per pair folder.
    """
    rows = []
    for folder in folders:
        link_output = json.loads((folder / "link.json").read_text())
        diffs = [json.loads(path.read_text()) for path in sorted(folder.glob("diff-*.json"))]
        summaries = {diff["matcher"]: diff["summary"] for diff in diffs}
        dis_path = folder / "disagreements.json"
        dis = json.loads(dis_path.read_text()) if dis_path.exists() else None
        disagreements = len(dis["items"]) if dis and len(dis["matchers"]) > 1 else None
        nothing = all(diff.get("nothing_changed") for diff in diffs)
        rows.append(
            {
                "folder": folder.name,
                "old": Path(link_output["left"]["path"]).name,
                "new": Path(link_output["right"]["path"]).name,
                "old_label": friendly_label(link_output["left"]["path"]),
                "new_label": friendly_label(link_output["right"]["path"]),
                "records": [link_output["left"]["records"], link_output["right"]["records"]],
                "summaries": summaries,
                "disagreements": disagreements,
                "agree": dis.get("agree") if dis else None,
                "left_records": dis.get("left_records") if dis else None,
                "old_sha256": link_output["left"]["sha256"],
                "new_sha256": link_output["right"]["sha256"],
                "nothing_changed": nothing and not disagreements,
            }
        )
    return rows


def write_index(out_dir: Path) -> Path:
    """Build the HTML index for all reports in a diffs folder.

    Args:
        out_dir: The folder containing the pair reports.

    Returns:
        The path to the written ``index.html`` file.
    """
    folders = pair_folders(out_dir)
    rows = pair_rows(folders)
    matchers = sorted(
        {m for row in rows for m in row["summaries"]},
        key=lambda matcher: ({"rapidfuzz": 0, "splink": 1}.get(matcher, 9), matcher),
    )
    election = out_dir.resolve().parent.name
    all_verdicts = verdict_store.load()
    pair_keys = {(r["old_sha256"], r["new_sha256"]) for r in rows}
    here = [v for v in all_verdicts if (v["old_sha256"], v["new_sha256"]) in pair_keys or v.get("election") == election]
    for r in rows:
        r["verdicts"] = sum(
            1
            for verdict in all_verdicts
            if (verdict["old_sha256"], verdict["new_sha256"]) == (r["old_sha256"], r["new_sha256"])
        )
    data = {
        "title": election,
        "verdict_labels": verdict_store.VERDICTS,
        "tally_here": verdict_store.tally(here),
        "tally_all": verdict_store.tally(all_verdicts),
        "pairs": rows,
        "matchers": matchers,
        "history": {m: history(folders, m) for m in matchers},
    }
    html = (
        TEMPLATE.read_text()
        .replace("{{TITLE}}", escape_html(f"{data['title']} diffs"))
        .replace("{{DATA}}", embed_json(data))
    )
    out = out_dir / "index.html"
    out.write_text(html)
    return out

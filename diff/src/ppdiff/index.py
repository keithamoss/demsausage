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

from .names import friendly_label
from .report import _embed, _html_escape

TEMPLATE = Path(__file__).with_name("index_template.html")


def pair_folders(out_dir: Path) -> list[Path]:
    """Pair folders in series order (folder names start with the old file's timestamped name)."""
    return sorted(p.parent for p in out_dir.glob("*/link.json"))


def _describe(entry: dict[str, Any]) -> str:
    parts = [c["field"] + (f" ({c['direction']})" if c.get("direction") else "") for c in entry["changes"] if not c.get("cosmetic")]
    loc = entry.get("location")
    if loc and loc.get("moved_m") is not None:
        km = loc["moved_m"] / 1000
        parts.append(f"moved {km:.1f} km" if km >= 1 else f"moved {round(loc['moved_m'])} m")
    elif loc and loc.get("note"):
        parts.append(loc["note"])
    return ", ".join(parts) or "changed"


def history(folders: list[Path], matcher: str) -> list[dict[str, Any]]:
    places: dict[int, dict[str, Any]] = {}
    ids: dict[int, int] = {}  # row index in the current file -> place id
    next_id = 0
    previous_new_sha = None

    def new_place(name: str | None = None) -> int:
        nonlocal next_id
        next_id += 1
        places[next_id] = {"name": name, "events": []}
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
        if link_output["left"]["sha256"] != previous_new_sha:
            ids = {}  # the chain broke: start fresh from this pair's old file
        when = friendly_label(link_output["right"]["path"])
        pair = folder.name

        def pid(old_index: int) -> int:
            if old_index not in ids:
                ids[old_index] = new_place()
            return ids[old_index]

        def event(place_id: int, kind: str, text: str, name: str) -> None:
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
        previous_new_sha = link_output["right"]["sha256"]

    out = [{"name": p["name"], "events": p["events"]} for p in places.values() if p["events"]]
    return sorted(out, key=lambda p: (-len(p["events"]), p["name"] or ""))


def pair_rows(folders: list[Path]) -> list[dict[str, Any]]:
    rows = []
    for folder in folders:
        link_output = json.loads((folder / "link.json").read_text())
        summaries = {}
        for diff_path in sorted(folder.glob("diff-*.json")):
            d = json.loads(diff_path.read_text())
            summaries[d["matcher"]] = d["summary"]
        dis_path = folder / "disagreements.json"
        dis = json.loads(dis_path.read_text()) if dis_path.exists() else None
        disagreements = len(dis["items"]) if dis and len(dis["matchers"]) > 1 else None
        nothing = all(json.loads(p.read_text()).get("nothing_changed") for p in folder.glob("diff-*.json"))
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
    folders = pair_folders(out_dir)
    rows = pair_rows(folders)
    matchers = sorted({m for r in rows for m in r["summaries"]}, key=lambda m: ({"rapidfuzz": 0, "splink": 1}.get(m, 9), m))
    election = out_dir.resolve().parent.name
    all_verdicts = verdict_store.load()
    pair_keys = {(r["old_sha256"], r["new_sha256"]) for r in rows}
    here = [v for v in all_verdicts if (v["old_sha256"], v["new_sha256"]) in pair_keys or v.get("election") == election]
    for r in rows:
        r["verdicts"] = sum(1 for v in all_verdicts if (v["old_sha256"], v["new_sha256"]) == (r["old_sha256"], r["new_sha256"]))
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
        .replace("{{TITLE}}", _html_escape(f"{data['title']} diffs"))
        .replace("{{DATA}}", _embed(data))
    )
    out = out_dir / "index.html"
    out.write_text(html)
    return out

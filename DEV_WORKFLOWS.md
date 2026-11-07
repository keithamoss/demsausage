# Development workflow

https://docs.gitlab.com/ee/topics/gitlab_flow.html

We run a modified version of the GitLab branching workflow.

1. `main` contains the latest code from development that is ready to be deployed
2. We fork `main` and work on `feature/*` or `bug-fix/*` or `hotfix/*` branches
3. We use a PR to merge these branches back into `main` when they're ready
4. When we're ready to deploy to staging, we use a PR to merge `main` into `staging` (triggering CI/CD)
5. When we're ready to deploy to production, we use a PR to merge `staging` into `production (triggering CI, with manual deployment)

## Local development environment

The recommended editor workflow is the VS Code Dev Container in this repository. It attaches VS Code to the existing `django` Compose service and starts the configured application stack. Python dependencies come from `django/uv.lock`; both frontend packages are installed with frozen pnpm lockfiles. Do not start a second Compose project while attached.

The base Django image contains runtime dependencies only; pytest and the other development dependencies are installed from the `dev` group during workspace creation. Workspace creation also installs pre-commit as a separate tool, so the repository's Git hooks run when you commit from inside the container.

Ruff is used for Python linting, import sorting, and formatting. Its configuration is in `django/pyproject.toml`; VS Code formats the whole Python file and applies Ruff lint fixes and import sorting when you save it explicitly. The existing Python code has Ruff findings and formatting differences, so saving an existing file can produce unrelated formatting/import changes; review them before committing. Ruff is not a commit gate yet. To run it manually:

```bash
cd django
ruff check .
ruff format --check .
```

`ruff check --fix .` applies safe lint fixes, while `ruff format .` applies formatting. Review the resulting changes before keeping them; do not format the entire existing codebase as part of routine setup.

When updating Python dependencies, change `django/pyproject.toml`, regenerate and review `django/uv.lock` with uv, then rebuild/reopen the Dev Container so the development group is installed. Do not use Poetry or create a project virtual environment. For frontend dependency changes, commit the relevant pnpm lockfile and rebuild/reopen the container.

After changing `.devcontainer/devcontainer.json` (for example its extensions or VS Code settings), use **Dev Containers: Rebuild Container**. Reopening or reattaching to an existing container keeps the configuration recorded when that container was created.

Run Django tests inside the attached workspace with `cd django && python -m pytest tests/ --tb=short -q`. Use the **Django: debug current pytest file (serial)** launch configuration for breakpoints. From a host terminal, the existing equivalent is `docker compose exec django bash -c "cd /app && pytest tests/ --tb=short -q"`. Do not run these workflows concurrently against the same test database. Run admin frontend tests with `cd admin-redesign && pnpm test`.

The existing host-terminal fallback remains `docker compose up`. Normal Dev Container closure stops the shared Compose project, including services started from the host in that same project; it does not remove persistent storage. A forced editor/host termination may require manual Compose cleanup.

Docker-outside-of-Docker uses the host daemon. Read-only Compose queries from the attached container can use the host-path alias:

```bash
docker compose \
  -f "$LOCAL_WORKSPACE_FOLDER/docker-compose.yml" \
  -f "$LOCAL_WORKSPACE_FOLDER/.devcontainer/compose.yml" \
  ps
```

The Compose files declare project `demsausage`; the path alias is required so bind sources resolve on the host. Do not use plain Compose commands to rebuild or recreate `django` while attached: they bypass the Dev Container Feature layer and disconnect the editor. Use **Dev Containers: Rebuild Container** instead. When working from the host with the Dev Container closed, `docker compose up` remains the base-stack fallback.

To inspect logs while attached, use the same host-path alias, for example `docker compose -f "$LOCAL_WORKSPACE_FOLDER/docker-compose.yml" -f "$LOCAL_WORKSPACE_FOLDER/.devcontainer/compose.yml" logs -f django`. From the host, `docker compose logs -f django` is unchanged.

## Other resources

https://www.gitkraken.com/learn/git/best-practices/git-branch-strategy
https://www.jetbrains.com/teamcity/ci-cd-guide/concepts/branching-strategy/

#!/usr/bin/env bash
set -euo pipefail

# VS Code runs this after creating or rebuilding the Dev Container. It prepares
# Python test tools and frontend packages; Compose handles normal app startup.
# This script does not run database migrations or start another app server.
echo "[devcontainer] Starting post-create setup..."

workspace_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
requirements_file="$(mktemp)"
trap 'rm -f "$requirements_file"' EXIT

# These package folders are Docker volumes. Confirm the volumes are mounted
# before changing ownership, so a missing mount cannot affect workspace files.
echo "[devcontainer] Preparing frontend package volumes..."
pnpm_store="$workspace_root/.pnpm-store"
if [ -L "$pnpm_store" ]; then
  printf 'Refusing to change ownership of symlinked pnpm store: %s\n' "$pnpm_store" >&2
  exit 1
fi
if ! mountpoint -q "$pnpm_store"; then
  printf 'Expected a mounted pnpm store volume at: %s\n' "$pnpm_store" >&2
  exit 1
fi
sudo chown -R "$(id -u):$(id -g)" "$pnpm_store"

# Each frontend needs its own writable node_modules volume.
for frontend in public-redesign admin-redesign; do
  dependency_path="$workspace_root/$frontend/node_modules"
  if [ -L "$dependency_path" ]; then
    printf 'Refusing to change ownership of symlinked dependency path: %s\n' "$dependency_path" >&2
    exit 1
  fi
  if ! mountpoint -q "$dependency_path"; then
    printf 'Expected a mounted dependency volume at: %s\n' "$dependency_path" >&2
    exit 1
  fi
  sudo chown -R "$(id -u):$(id -g)" "$dependency_path"
done

# Use the committed uv lock to install runtime and development Python packages
# into Django's shared system Python; do not create a separate virtualenv.
echo "[devcontainer] Installing Python dependencies (including dev)..."
cd "$workspace_root/django"
uv export \
  --locked \
  --all-groups \
  --no-emit-project \
  --format requirements.txt \
  --output-file "$requirements_file"
chmod 644 "$requirements_file"
sudo /bin/uv pip install \
  --python /usr/local/bin/python \
  --require-hashes \
  --no-deps \
  --no-progress \
  -r "$requirements_file"
echo "[devcontainer] Checking installed Python packages are compatible..."
sudo /bin/uv pip check --python /usr/local/bin/python

# The repository's Git hooks call pre-commit. Install it as a separate uv tool,
# so it cannot change Django's Python packages. pre-commit 4.7+ needs Python 3.11.
echo "[devcontainer] Installing pre-commit for Git hooks..."
sudo env UV_TOOL_DIR=/opt/uv-tools UV_TOOL_BIN_DIR=/usr/local/bin \
  /bin/uv tool install --python /usr/local/bin/python --no-progress pre-commit==4.6.2

# Install frontend packages from their lockfiles without changing those files.
for frontend in public-redesign admin-redesign; do
  echo "[devcontainer] Installing $frontend dependencies (pnpm)..."
  (cd "$workspace_root/$frontend" && pnpm install --frozen-lockfile)
done

echo "[devcontainer] Setup complete."

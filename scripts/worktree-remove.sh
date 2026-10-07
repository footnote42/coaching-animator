#!/usr/bin/env bash
# Remove a worktree made by worktree-add.sh. Unlinks the node_modules junction first:
# `git worktree remove` follows the junction and empties the main repo's node_modules.
# Usage: scripts/worktree-remove.sh <dir> [branch-to-delete]
set -euo pipefail
dir=${1:?usage: worktree-remove.sh <dir> [branch-to-delete]}
[ -e "$dir/node_modules" ] && cmd.exe //c rmdir "$(cygpath -w "$dir/node_modules")"
git worktree remove "$dir"
[ -n "${2:-}" ] && git branch -D "$2"
exit 0

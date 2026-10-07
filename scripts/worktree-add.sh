#!/usr/bin/env bash
# Create a worktree beside the repo that shares this repo's node_modules.
# Usage: scripts/worktree-add.sh <branch> [dir] [base]   (dir defaults to ../ca-<branch>, base to origin/main)
set -euo pipefail
branch=${1:?usage: worktree-add.sh <branch> [dir] [base]}
dir=${2:-../ca-${branch//\//-}}
base=${3:-origin/main}
git fetch -q origin
git worktree add -q -b "$branch" "$dir" "$base"
# mklink from bash fails ("Invalid switch"); a PowerShell junction works and needs no admin rights.
powershell.exe -NoProfile -Command "New-Item -ItemType Junction -Path '$(cygpath -w "$dir")\node_modules' -Target '$(cygpath -w "$PWD")\node_modules' | Out-Null"
echo "$dir"

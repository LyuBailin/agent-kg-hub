#!/usr/bin/env bash
# One-time setup: configure git to use .githooks/ instead of .git/hooks/.
#
# Run after each fresh clone:
#   scripts/setup-hooks.sh
#
# On Windows, Git Bash honors the shebang line in shell scripts even without
# `chmod +x`, so the hooks will work after this one-liner.

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

CURRENT=$(git config core.hooksPath || echo "")

if [ "$CURRENT" = ".githooks" ]; then
  echo "✓ Hooks already configured (core.hooksPath = .githooks)"
  echo "  Pre-commit will run: agents-scope (warn), inline-script (block), frontmatter-image (block)"
  exit 0
fi

git config core.hooksPath .githooks
echo "✓ Hooks installed at .githooks/"
echo ""
echo "  core.hooksPath  = $(git config core.hooksPath)"
echo ""
echo "Active pre-commit checks:"
echo "  - check-agents-md-scope.sh     (WARN:  防止 AGENTS.md 塞 volatile 内容)"
echo "  - check-astro-inline-script.sh (BLOCK: 防止 inline <script> 顶层 return 撞 Rollup)"
echo "  - check-frontmatter-image.sh   (BLOCK: 防止 frontmatter image: 路径写错)"
echo ""
echo "Bypass all checks:    git commit --no-verify"
echo "Inspect:              cat .githooks/README.md"
echo ""
echo "(如果之前 core.hooksPath = $(git config --unset core.hooksPath 2>/dev/null; git config core.hooksPath),想回滚用:)"
echo "  git config --unset core.hooksPath"

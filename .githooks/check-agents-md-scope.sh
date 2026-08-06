#!/usr/bin/env bash
# Check D (WARN): AGENTS.md scope guard.
# AGENTS.md is for **stable rules only**. Volatile content (commit hashes,
# dates, "current/latest" progress markers) belongs in CHANGELOG / ROADMAP.
#
# Why: W21 — AGENTS.md was initially drafted to include commit hashes and
# recent wave history. The user corrected scope: only rules, link to other
# docs for volatile content. This check catches scope drift on future commits.
#
# Doc: AGENTS.md 顶部 — "本文件不记录历史与状态"
#
# Severity: WARN (always exits 0). The dev may legitimately reference a
# commit SHA in a doc, or use a date in a non-progress context. Review and
# decide.

set -e

STAGED="$1"

for f in $STAGED; do
  if [ "$f" != "AGENTS.md" ]; then
    continue
  fi

  if [ ! -f "$f" ]; then
    # File deleted? Unusual; skip.
    continue
  fi

  # Patterns that suggest volatile content added to AGENTS.md:
  # - Git commit SHA (40 hex chars)
  # - YYYY-MM-DD date in a body line (not in a code block / frontmatter)
  # - "current/latest/today" + status markers
  VIOLATIONS=0

  # Use git diff to get the staged content (added lines, "^\+")
  DIFF=$(git diff --cached -- "$f" 2>/dev/null)

  if echo "$DIFF" | grep -E '^\+.*\b[0-9a-f]{40}\b' >/dev/null 2>&1; then
    echo "⚠️  AGENTS.md diff contains a git commit SHA — 是否 volatile?" >&2
    VIOLATIONS=$((VIOLATIONS + 1))
  fi

  if echo "$DIFF" | grep -E '^\+.*\b20[0-9]{2}-[0-9]{2}-[0-9]{2}\b' >/dev/null 2>&1; then
    echo "⚠️  AGENTS.md diff contains a YYYY-MM-DD date — 是否 volatile?" >&2
    VIOLATIONS=$((VIOLATIONS + 1))
  fi

  if echo "$DIFF" | grep -E '^\+.*(已完成|已完成|done|completed|完成|上线上|现在|当前|今天|本周|上周)' >/dev/null 2>&1; then
    echo "⚠️  AGENTS.md diff contains a status marker — 是否 volatile?" >&2
    VIOLATIONS=$((VIOLATIONS + 1))
  fi

  if [ "$VIOLATIONS" -gt 0 ]; then
    echo "" >&2
    echo "   提醒: AGENTS.md 只放跨 wave 适用的规则。" >&2
    echo "   进度 → CHANGELOG.md / 计划 → ROADMAP.md / 介绍 → README.md" >&2
    echo "   详情见 AGENTS.md 顶部" >&2
    echo "" >&2
  fi
done

# Always exit 0 — this is a WARN, not a BLOCK.
exit 0

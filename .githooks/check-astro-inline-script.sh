#!/usr/bin/env bash
# Check C (BLOCK): Astro inline <script> blocks must not contain bare top-level
# `return;` — Astro wraps inline scripts in a closure, and a top-level return
# triggers a Rollup parse error.
#
# Heuristic: if a staged .astro file contains both a <script> tag AND any
# `return;` token, flag for manual review. False positives are possible (e.g.
# legitimate `return;` inside a function) — bypass with `git commit --no-verify`
# if confirmed safe.
#
# Why: W18 — skip-to-content inline script had `if (!el) return;` at the top
# of the wrapped closure, which broke the build with "Unexpected return statement".
#
# Doc: references/astro-patterns.md §inline script

set -e

STAGED="$1"
ERRORS=0

for f in $STAGED; do
  case "$f" in
    *.astro)
      if [ ! -f "$f" ]; then
        continue
      fi

      HAS_SCRIPT=0
      HAS_RETURN=0

      # Crude but effective: does the file contain a <script> tag?
      if grep -qE '<script[[:space:]]' "$f" 2>/dev/null; then
        HAS_SCRIPT=1
      fi

      # Does the file contain a bare `return;` token (anywhere)?
      if grep -qE '\<return[[:space:]]*;[[:space:]]*$' "$f" 2>/dev/null; then
        HAS_RETURN=1
      fi

      if [ "$HAS_SCRIPT" = "1" ] && [ "$HAS_RETURN" = "1" ]; then
        echo "❌ $f: 检测到 <script> + bare 'return;'" >&2
        echo "   Astro 把 inline <script> 包在 closure 里,顶层 return 会触发 Rollup parse error" >&2
        echo "   修复: 把 'if (!x) return; doSomething();' 改成 'if (x) { doSomething(); }'" >&2
        echo "   详情: references/astro-patterns.md §inline script" >&2
        echo "   如果 'return;' 是合法的 function return,用 'git commit --no-verify' 跳过本检查" >&2
        ERRORS=$((ERRORS + 1))
      fi
      ;;
  esac
done

if [ "$ERRORS" -gt 0 ]; then
  echo "" >&2
  echo "共 $ERRORS 处可疑 'return;'。Commit 已阻止。" >&2
  exit 1
fi

exit 0

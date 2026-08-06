#!/usr/bin/env bash
# Check A (BLOCK): every frontmatter `image: ~/assets/images/...` must point to
# an existing file in src/assets/images/.
#
# Why: W20 — 19 cover images generated, but frontmatter had wrong path format
# (e.g. "cover-react-intro.png" vs expected "cover-concept-react-intro.png"),
# so findImage() returned null and article hero fell back to default.png.
#
# Doc: references/images-pipeline.md §命名规范

set -e

STAGED="$1"
ERRORS=0

for f in $STAGED; do
  case "$f" in
    src/data/post/*.md|src/data/post-en/*.md)
      # Extract first `image:` value from frontmatter (between --- markers)
      IMAGE=$(awk '
        BEGIN { in_fm = 0; found = 0 }
        /^---[[:space:]]*$/ { in_fm = !in_fm; if (in_fm == 0) exit; next }
        in_fm == 1 && /^image:[[:space:]]/ {
          # strip leading "image:" and any quotes
          val = $0
          sub(/^image:[[:space:]]+/, "", val)
          sub(/^["\x27]/, "", val)
          sub(/["\x27][[:space:]]*$/, "", val)
          if (val != "" && val != "null") { print val; exit }
        }
      ' "$f" 2>/dev/null)

      if [ -n "$IMAGE" ]; then
        # Resolve `~/assets/images/<file>` to `<repo>/src/assets/images/<file>`
        # (also handle bare `assets/...` or `src/assets/...` for robustness)
        RELATIVE="$IMAGE"
        case "$RELATIVE" in
          "~/"*)    RELATIVE="src/${RELATIVE#\~/}" ;;
          "assets/"*) RELATIVE="src/$RELATIVE" ;;
          "src/"*)  ;;
          *)        RELATIVE="src/assets/images/$(basename "$RELATIVE")" ;;
        esac

        if [ ! -f "$RELATIVE" ]; then
          echo "❌ $f: frontmatter image 路径不存在" >&2
          echo "   frontmatter: image: $IMAGE" >&2
          echo "   期望文件:    $RELATIVE" >&2
          echo "   修复: 见 references/images-pipeline.md §命名规范 (W20 教训)" >&2
          ERRORS=$((ERRORS + 1))
        fi
      fi
      ;;
  esac
done

if [ "$ERRORS" -gt 0 ]; then
  echo "" >&2
  echo "共 $ERRORS 处 frontmatter image 错误。Commit 已阻止。" >&2
  echo "Bypass: git commit --no-verify (谨慎,确认 image 路径正确后再用)" >&2
  exit 1
fi

exit 0

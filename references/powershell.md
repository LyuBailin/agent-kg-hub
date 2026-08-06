# PowerShell 5.1 + mavis tool 速查

> 本机 shell 是 PowerShell 5.1,**不是** bash。常见操作有专门的写法。

## 关键规则

| 想要 | ❌ 不要 | ✅ 用 |
|---|---|---|
| 删除文件 | `Remove-Item foo.txt` | `mavis-trash foo.txt` (回收站,可恢复) |
| grep 文件内容 | `Select-Object -Pattern` (匹配属性名,不是内容) | `Select-String -Path X -Pattern Y` |
| 多文件类型匹配 | `Get-ChildItem -Filter "*.{ts,tsx}"` (不支持多 pattern) | 多次 `-Filter` 或 `Where-Object { $_.Extension -in @('.ts','.tsx') }` |
| 链式命令 | `cmd1 && cmd2` (bash 语法) | `cmd1; cmd2` (分号) |
| `if` 在表达式中 | `if (cond) { ... } else { ... }` 当值用 | 用语句形式 `if (...) { ... } else { ... }`,不要套在赋值里 |
| git commit 多行 | `git commit -m "line1\nline2"` (PowerShell 会保留字面 `\n`) | 用 PowerShell 变量:`$msg = @'...'@; git commit -m $msg` |
| bash 工具 | `ls` / `head` / `tail` / `wc` / `find` | `Get-ChildItem` / `Select-Object -First` / `Select-Object -Last` / `Measure-Object` / `Get-ChildItem -Recurse` |
| Wildcard 字符串字面量 | `[wildcard]::new('*')` 直接用 | 字符串字面量不会触发 wildcard 匹配,报错"无效的通配符模式"时改用 `Select-String` |

## 已知会出现的"噪音"(不是真错)

- `git push` 末尾 `Command exited with code 1` — stderr 噪声,实际 push 成功
- `git add` 时 `warning: in the working copy of 'X', LF will be replaced by CRLF the next time Git touches it` — Windows autocrlf,无害
- 各种 `... : ...CategoryInfo : ... :String) [], RemoteException` — PowerShell 把 stderr 渲染成长字符串,过滤 `Select-String -Pattern` 时只过滤 stdout

## 文件名 / 通配符操作技巧

- **多模式过滤**:`Get-ChildItem -Path "src" -Recurse -File | Where-Object { $_.Extension -in @('.astro','.ts','.tsx') }`
- **批量重命名**:`Get-ChildItem -Filter "cover-*.png" | ForEach-Object { Rename-Item $_.FullName -NewName ($_.Name -replace 'oldPrefix-', 'newPrefix-') }`
- **避免 `Rename-Item` 触发二次 `Get-ChildItem`**:管道里的 `ForEach-Object` 拿到的 `$_.FullName` 是改名前的快照,不要边改边递归
- **测试文件存在**:`if (Test-Path $path) { ... }`,不要 try/catch

## mavis tool 用法

**`mavis` 是 tool,不是 shell 命令**。直接 `mavis cron ...` 在 PowerShell 里不会工作。

- 用 mavis 工具的 `command` 字段调,例如 `cron self`, `agent list`
- 子命令格式: `cron self`, `cron delete`, `agent create`
- 删除 cron:`mavis` 工具 with `command: "cron delete"` + `args: { cron_id: "..." }`
- 写文件 / 删文件:用专用工具 (Write / Edit / `mavis-trash`),**不要**用 `Out-File` (编码陷阱)

## git commit 最佳实践

```powershell
# ✅ 单行 + 短 body via heredoc
$msg = @"
feat(images): W20 - 19 unique article cover images

- Generated 19 cover PNGs at 1K
- Updated 38 frontmatter files
- Fixed import.meta.glob cache for new images

Closes #N
"@
git commit -m $msg
```

```powershell
# ❌ 错误:PowerShell 把 \n 当字面
git commit -m "feat: W20

- line 1
- line 2"

# ❌ 错误:bash 风格 && 
git add -A && git commit -m "msg"  # bash 语法
```

## 一次性脚本

- 复杂重命名 / 批量替换优先用 **Python** (`python -c` 或临时 `.py` 文件),不要在 PS 里做正则
- PS 适合:文件存在检查、批处理调用、Select-String 过滤
- 一次性脚本放 `scripts/`,命名 `_tmp_*.py` 或 `_tmp_*.ps1`,用完 `mavis-trash` 删

## cron 操作

- **Cron names**: kebab-case alphanumeric only (no dots, no spaces) — 用 `W21-i18n-fixes` 而不是 `W21.i18n.fixes`
- **Self-reminder**:`mavis` 工具 with `command: "cron self"` + `args: { every: "5m", prompt: "..." }`
- **Skip ticks**: cron 跑空时用 `<mavis-progress>...</mavis-progress>` 包一行,不要发 IM 或长回复
- **部署验证 cron 模板**:
  ```
  cron_name: W{N}-{topic}-deploy-check
  every: 5m
  prompt:
    1. gh api repos/LyuBailin/agent-kg-hub/actions/runs?per_page=3 — confirm latest run conclusion=success, head_sha=...
    2. web_fetch live URL — verify content
    3. if pass: delete this cron
  ```

# `.githooks/` — Pre-commit Enforcement for agent-kg-hub

> 这是项目的**第二层防御**:
> - 第一层: [AGENTS.md](../AGENTS.md) + [references/](../references/) — 知识层,告诉 agent 规则
> - 第二层: 本目录 — 强制层,在 agent 真违反规则时自动拦截

## 设计原则

1. **预防 > 检测** — 能在 commit 之前发现,绝不等到 deploy
2. **Block 等级 = 必然 build 挂** — 违规但 build 仍能跑的用 WARN,而不是 BLOCK
3. **可 bypass** — 任何 hook 都可用 `git commit --no-verify` 跳过
4. **错误信息带文档链接** — 每个失败都指向对应的 `references/*.md` 章节
5. **存仓库共享** — `.githooks/` commit 进 git,所有 clone 的 agent 都用同一套

## Hook 列表

### `pre-commit` (dispatcher)

调用所有 `check-*.sh`。运行顺序:**便宜 → 贵,WARN → BLOCK**。

### `check-frontmatter-image.sh` (BLOCK)

W20 教训:19 个 cover image 生成时用了 `cover-{slug}.png`,但 frontmatter 期望 `cover-{category}-{slug}.png`,命名不匹配导致 `findImage()` 返回 null,article hero 用了 `default.png`。

**检查**:每个 staged 的 `src/data/post/*.md` / `src/data/post-en/*.md` 的 frontmatter `image:` 字段,resolve 到 `src/assets/images/{basename}` 后**文件必须存在**。

**绕过**:`git commit --no-verify`(确认 image 路径确实正确)。

📖 详细:[references/images-pipeline.md §命名规范](../references/images-pipeline.md)

### `check-astro-inline-script.sh` (BLOCK)

W18 教训:skip-to-content 的 inline `<script>` 顶层 `if (!el) return;` 触发了 Rollup parse error,build 挂掉。

**检查**:staged 的 `.astro` 文件**同时包含** `<script>` 标签和 `return;` token → flag 让人工 review。

**误报**:函数内合法 `return;` 也会被 flag。这种情况 `git commit --no-verify`。

📖 详细:[references/astro-patterns.md §inline script](../references/astro-patterns.md)

### `check-agents-md-scope.sh` (WARN, 不 block)

W21 设计原则:AGENTS.md 只放**稳定规则**,volatile 内容(commit hash / 日期 / "current" / "today" / "done")走 CHANGELOG / ROADMAP。

**检查**:如果 AGENTS.md 在 diff 里,扫新增行检测 volatile 模式:
- 40 位 hex 字符(git commit SHA)
- `YYYY-MM-DD` 日期
- 状态标记词(已完成/done/now/当前/今天/本周/上周)

**Always exit 0**:只是提醒,dev 看到 WARN 后判断是否真的需要这些内容在该文件。

📖 详细:[AGENTS.md 顶部](../AGENTS.md)

## Setup(每个 clone 跑一次)

```bash
# 自动:
scripts/setup-hooks.sh

# 或手动:
git config core.hooksPath .githooks
```

(Windows 上 Git Bash 也会读 shebang,不需要 `chmod +x`。)

## 绕过单个 hook

```bash
git commit --no-verify -m "..."
```

这会跳过**所有** pre-commit checks。如果只想 bypass 一个,直接编辑 `.githooks/pre-commit` 临时注释掉那一行(commit 后 uncomment)。

## 添加新 hook

1. 写 `.githooks/check-{name}.sh`,可执行,shebang `#!/usr/bin/env bash`
2. 在 `.githooks/pre-commit` 里加一行 `bash "$DIR/check-{name}.sh" "$STAGED"`
3. 在本 README 里加一段说明,引用对应的 `references/*.md` 章节
4. 跑 `git commit` 触发验证(可以故意写一个违规文件测试)
5. 跑 `git commit --no-verify` 临时跳过 → 修 hook → 再试

## 设计取舍

### 为什么不用 Husky / pre-commit framework?

- Husky / pre-commit framework 加依赖(在 `package.json` 里),且多一层抽象
- 对小项目(单 .githooks/ 3 个脚本)over-engineering
- 裸 shell 脚本易读、易改、易跨平台
- 决定:简单胜过聪明,需要时再升级

### 为什么 git pre-commit 而非 mavis runtime hook?

- 截至 W22,`mavis` runtime **没有** `hook` 子命令(只有 `agent` / `cron` / `session`)
- 即使将来加了,git hook 在 commit 边界拦截是最稳的位置 — 跟 IDE / agent / 人手都解耦
- 决定:用 git hook,等 mavis 支持 hook 时再考虑双层

### 为什么 check C 不直接 lint `<script>` 内容?

精确检测「脚本顶层 `return;`」需要 parse JavaScript 块,引入 parser 太重。当前用「脚本+return 同时存在」启发式,有误报但容易理解,bypass 机制也清晰。**Better-than-nothing** 即可,完美不是 1 个 wave 的目标。

## 故障排查

| 现象 | 解决 |
|---|---|
| Hook 不跑 | `git config core.hooksPath` 确认是 `.githooks`,不是 `.git/hooks` |
| Hook 报 "Permission denied" | Git Bash 应当会自动用 shebang,不需要 `chmod +x`。如果确实挂了,在 Git Bash 里 `chmod +x .githooks/*.sh` |
| Hook 误报 | 用 `git commit --no-verify` 临时绕过,然后改进 hook 启发式 |
| 想完全禁用 hook | `git config core.hooksPath /dev/null`(返回默认) |

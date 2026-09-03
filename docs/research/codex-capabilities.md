# OpenAI Codex 能力清单（《Codex 使用指南》调研底稿）

> 调研方式：以官方文档为一手来源，逐页抓取原文核对。主站点为
> `https://learn.chatgpt.com`（Codex 文档入口 `https://learn.chatgpt.com/codex`，
> 页面规范 URL 形如 `https://learn.chatgpt.com/docs/<path>`；任意页面 URL 末尾加
> `.md` 可拿到 Markdown 原文）。补充站点：`developers.openai.com`（plugins/构建文档）
> 与 `openai.com/index/`（官方公告博客）。
>
> 抓取时（whats-new 页面最新条目为 2026 年 8 月 24–28 日）：
> `https://learn.chatgpt.com/docs/codex` 与 `/docs/codex/features` 返回 404，
> 实际入口为 `https://learn.chatgpt.com/codex`（文档导航共 140+ 页）。
>
> 每条信息标注三类依据等级：
> - 【文档明确】官方文档有明确表述；
> - 【文档暗示】文档可合理推出但未直说；
> - 【未找到依据】在官方文档中没有找到依据，写作时不要当事实用。

---

## 1. config 配置文件体系（重点）

### 1.1 文件位置与层级

- 用户级配置：`~/.codex/config.toml`；`$CODEX_HOME` 环境变量可改 Codex 状态根目录（默认 `~/.codex`，设置时目录必须已存在）。【文档明确】
  （来源：<https://learn.chatgpt.com/docs/config-file/config-basic>、<https://learn.chatgpt.com/docs/config-file/environment-variables>）
- 项目级覆盖：仓库内 `.codex/config.toml`；**仅在项目被信任（trusted）时加载**。从项目根到当前工作目录逐层加载，同名键以离 cwd 最近的为准。【文档明确】
  （来源：<https://learn.chatgpt.com/docs/config-file/config-advanced#project-config-files-codexconfigtoml>）
- 系统级：Unix 上 `/etc/codex/config.toml`。【文档明确】（来源：config-basic "Configuration precedence"）
- 合并优先级（从高到低）：① CLI flags 与 `--config` 覆盖 → ② 项目 `.codex/config.toml`（仅 trusted）→ ③ `--profile` 选中的 profile 文件 → ④ 用户 `~/.codex/config.toml` → ⑤ 系统 `/etc/codex/config.toml` → ⑥ 内置默认。【文档明确】（来源：config-basic）
- 项目标记为 untrusted 时，跳过项目级 `.codex/` 全部层（配置、hooks、rules），用户/系统层照常加载。【文档明确】（来源：config-basic、config-reference `projects.<path>.trust_level`）
- 项目级配置**不能**覆盖的键（出现即被忽略并打印启动警告）：`openai_base_url`、`chatgpt_base_url`、`apps_mcp_product_sku`、`model_provider`、`model_providers`、`notify`、`profile`、`profiles`、`experimental_realtime_ws_base_url`、`otel`。【文档明确】（来源：config-reference 开头、config-advanced）
- CLI 一次性覆盖：`-c` / `--config key=value`，值按 TOML 解析（不是 JSON），支持点号嵌套，如 `codex --config sandbox_workspace_write.network_access=true`；无法解析时按字符串处理。【文档明确】（来源：config-advanced "One-off overrides from the CLI"）
- 状态目录常见文件：`config.toml`、`auth.json`（或 OS keychain）、`history.jsonl`、logs、caches。【文档明确】（来源：config-advanced "Config and state locations"）
- 官方 JSON Schema：<https://learn.chatgpt.com/docs/config-schema.json>；在 config.toml 顶部写 `#:schema https://developers.openai.com/codex/config-schema.json` 配合 Even Better TOML 插件可获补全/诊断。【文档明确】（来源：config-reference 末尾）

### 1.2 Profiles

- 现行机制（Codex 0.134.0 起）：`codex --profile <name>` 加载 `~/.codex/<name>.config.toml`，叠加在用户基础配置之上；profile 文件写顶层键，**不再支持** `[profiles.xxx]` 表和顶层 `profile = "..."` 选择器（旧写法需迁移）。profile 名只允许字母、数字、连字符、下划线。【文档明确】（来源：config-advanced "Profiles"）
- profile 可覆盖 `model_catalog_json`；profile 层优先级低于项目配置、高于用户配置。【文档明确】（来源：config-advanced、config-reference `model_catalog_json`）
- 示例：`codex --profile deep-review`、`codex exec --profile deep-review "review this change"`。【文档明确】

### 1.3 主要字段域（config.toml）

**模型与推理**

| 字段 | 说明 |
| --- | --- |
| `model` | 默认模型（如 `"gpt-5.5"`/`"gpt-5.6"`） |
| `review_model` | `/review` 专用模型覆盖 |
| `model_provider` / `model_providers.<id>` | 自定义 provider；内置 ID `openai`/`ollama`/`lmstudio` 不可覆盖 |
| `openai_base_url` | 内置 openai provider 的 base URL 覆盖（代理/数据驻留场景） |
| `model_context_window` | 上下文窗口 |
| `model_auto_compact_token_limit`（+`_scope`） | 自动压缩阈值 |
| `model_catalog_json` | 启动时加载的 JSON 模型目录 |
| `model_reasoning_effort` | `minimal \| low \| medium \| high \| xhigh`（Responses API；`xhigh` 依模型而定） |
| `plan_mode_reasoning_effort` | plan 模式专用 |
| `model_reasoning_summary` | `auto \| concise \| detailed \| none` |
| `model_verbosity` | `low \| medium \| high`（仅 Responses API） |
| `personality` | `none \| friendly \| pragmatic` |
| `service_tier` | 如 `"fast"`（Fast mode） |
| `oss_provider` | `--oss` 本地模型默认 provider（`ollama \| lmstudio`） |
| `model_instructions_file` | 替代 AGENTS.md 的指令文件（旧名 `experimental_instructions_file` 已弃用） |
| `developer_instructions` | 注入会话的开发者指令 |
| `instructions` | 保留字段，官方建议改用上面两个 |
| `compact_prompt` / `experimental_compact_prompt_file` | 压缩提示词覆盖 |

【文档明确】（来源：config-reference、config-advanced、config-basic）

**审批与沙箱**：见第 9 节。关键字段：`approval_policy`、`approvals_reviewer`、`auto_review.policy`、`sandbox_mode`、`[sandbox_workspace_write]`、`default_permissions` + `[permissions.<name>]`、`allow_login_shell`、`windows.sandbox`。

**网络访问**：
- `sandbox_workspace_write.network_access`（workspace-write 下出站网络开关，默认关）。【文档明确】
- `[features].network_proxy`：**experimental、默认关**；开启后为沙箱命令启动网络代理，支持 `domains`（`allow`/`deny`，支持 `*.example.com`、`**.example.com`、全局 `*`；冲突时 `deny` 胜）、`unix_sockets`、`allow_local_binding`、`proxy_url`（默认 `http://127.0.0.1:3128`）、`socks_url`（默认 `http://127.0.0.1:8081`）等。不开代理时，permission profile 的域名规则不会被强制执行。【文档明确】（来源：config-reference、permissions 页）
- 明确排除项：web search、apps、MCP 等 hosted 工具流量不受沙箱网络代理与域名白名单控制。【文档明确】（来源：config-reference `features.apps`、web-search 页）

**`shell_environment_policy`**（控制传给子进程的环境变量）：
- `inherit = all | core | none`；`ignore_default_excludes`（默认 `true`，即默认**不**自动过滤含 `KEY`/`SECRET`/`TOKEN` 的变量；设 `false` 才启用自动过滤）；`[shell_environment_policy.filters]` 按模式 `include`/`exclude`（大小写不敏感，支持 `*`/`?`；出现任一 include 即变为白名单模式，且 include 不能救回已排除项）；`set` 显式注入（在排除之后生效，可能被 include 白名单再次移除）；旧式 `exclude`/`include_only` 数组仍兼容但不能与 `filters` 同层混用；`experimental_use_profile`（实验）。
- 应用顺序：自动排除 → 自定义排除 → `set` → include 白名单。
【文档明确】（来源：config-advanced "Shell environment policy"、config-reference、config-basic）

**`notify`**：外部通知命令（数组），目前仅 `agent-turn-complete` 事件；脚本收到单个 JSON 参数，字段含 `type`、`thread-id`、`turn-id`、`cwd`、`input-messages`、`last-assistant-message`。与 `tui.notifications`（内置）互补。【文档明确】（来源：config-advanced "Notifications"）

**`history`**：`history.persistence = "save-all" | "none"`（默认保存到 `~/.codex/history.jsonl`）；`history.max_bytes` 上限（超限丢最旧）。【文档明确】（来源：config-advanced "History persistence"、config-reference）

**`projects`**：`projects.<path>.trust_level = "trusted" | "untrusted"`，用于显式标记项目/ worktree 可信度；untrusted 会跳过项目级 `.codex/` 层。【文档明确】（来源：config-reference）

**`web_search`**：顶层 `web_search = "disabled" | "cached" | "indexed" | "live"`，默认 `"cached"`（OpenAI 维护的索引缓存，降低提示注入暴露）；`--yolo`/full access 下默认 `"live"`。另有 `tools.web_search` 对象：`context_size`、`allowed_domains`、`location`。旧 `[features].web_search*` 三个开关已 Deprecated。【文档明确】（来源：config-basic、config-reference、web-search 页）

**`memories`**：见第 3 节。

**`skills.config`**：数组项 `{ path = ".../SKILL.md", enabled = bool }`，用于不删文件地启停某个 skill。【文档明确】（来源：config-reference、build-skills）

**`hooks`**：内联 `[hooks]` 表，与 `hooks.json` 同 schema；开关 `[features].hooks`（默认 true，`codex_hooks` 为废弃别名）。见第 5 节。

**`plugins.<plugin>.mcp_servers.<server>`**：对插件自带 MCP server 的启停与工具审批覆盖（`enabled`、`default_tools_approval_mode`、`enabled_tools`、`disabled_tools`、`tools.<tool>.approval_mode`）。【文档明确】（来源：config-reference、extend/mcp）

**`agents`（subagents 并发与角色）**：
- `agents.enabled`（默认 true）、`agents.max_concurrent_threads_per_session`（旧别名 `agents.max_threads`）、`agents.default_subagent_model`、`agents.default_subagent_reasoning_effort`、`agents.interrupt_message`（默认 true）。
- `agents.<name>.description` / `agents.<name>.config_file`：自定义角色声明（标量设置名被保留，不能用作角色名）。
【文档明确】（来源：config-reference、subagents 页、config-advanced）

**`apps`（connectors）**：`apps.<id>.enabled`、`apps._default.enabled`、`apps._default.destructive_enabled`（对 `destructive_hint` 工具的默认允许）、`apps._default.open_world_enabled`、`approvals_reviewer`、`default_tools_approval_mode`（`auto | prompt | writes | approve`）及每工具 `tools.<tool>.enabled/approval_mode`；`tool_suggest.discoverables` / `disabled_tools`。【文档明确】（来源：config-reference）

**`mcp_servers.<id>`**：见第 7 节。

**UI 与其他**：
- `[tui]`：`notifications`、`notification_method`（`auto | osc9 | bel`）、`notification_condition`（`unfocused | always`）、`animations`、`alternate_screen`（`auto | always | never`）、`resume_cwd`（`current | session`）、`vim_mode_default`、`raw_output_mode`、`show_tooltips`、`status_line`、`terminal_title`、`theme`、`keymap.<context>.<action>`（context 含 `global`/`chat`/`composer`/`editor`/`vim_*`/`pager`/`list`/`approval`；空数组=解绑）。
- `file_opener`：`vscode | vscode-insiders | windsurf | cursor | none`，控制引用链接点击打开的编辑器。
- `log_dir`：显式设置后同时启用明文 `codex-tui.log`；`sqlite_home`；`background_terminal_max_timeout`（默认 300000 ms）；`tool_output_token_limit`。
- `hide_agent_reasoning` / `show_raw_agent_reasoning`、`disable_paste_burst`、`check_for_update_on_startup`。
- 认证：`cli_auth_credentials_store`（`file | keyring | auto`）、`forced_login_method`（`chatgpt | api`）、`forced_chatgpt_workspace_id`、`mcp_oauth_credentials_store`、`mcp_oauth_callback_port/url`。
- `project_root_markers`（默认 `.git`；设 `[]` 表示 cwd 即项目根）、`project_doc_max_bytes`、`project_doc_fallback_filenames`。
- `[otel]`：OTLP 日志/trace/metrics 导出（默认关闭，`log_user_prompt` 默认脱敏）；`[analytics].enabled`、`[feedback].enabled`。
- `[desktop.custom_file_handlers]`：桌面端 "Open in" 自定义文件处理器（仅用户级）。
【文档明确】（来源：config-reference、config-advanced）

### 1.4 `[features]` 特性开关（常见项与成熟度）

| Key | 默认 | 成熟度 |
| --- | --- | --- |
| `apps` | true | Stable |
| `goals` | true | Stable |
| `hooks` | true | Stable |
| `fast_mode` | true | Stable |
| `memories` | **false** | **Experimental** |
| `multi_agent` | true | Stable |
| `personality` | true | Stable |
| `remote_plugin` | true | Stable |
| `shell_snapshot` | true | Stable |
| `shell_tool` | true | Stable |
| `unified_exec` | true（Windows 除外） | Stable |
| `web_search*`（三个旧开关） | — | Deprecated |
| `network_proxy` | false | Experimental |
| `prevent_idle_sleep` | false | Experimental |
| `code_mode.*`、`rollout_budget.*` | false | Under development |

开关方式：`config.toml` 中 `[features]` 下改键值，或 `codex --enable <feature>`（可多个），或 `codex features enable/disable`（持久化）。`/experimental` 斜杠命令可在 TUI 切换实验特性（如 Network proxy、Prevent sleep while running）。【文档明确】（来源：config-basic "Feature flags"、config-reference、developer-commands、cli-customization）

### 1.5 环境变量（官方公开清单）

`CODEX_HOME`、`CODEX_SQLITE_HOME`、安装器变量 `CODEX_NON_INTERACTIVE`/`CODEX_INSTALL_DIR`、认证类 `CODEX_API_KEY`（exec/review/TS SDK/远程 exec-server）、`CODEX_ACCESS_TOKEN`、workload identity 三件套（`OPENAI_FEDERATION_RULE_ID`、`OPENAI_IDENTITY_TOKEN_FILE`、`OPENAI_WORKLOAD_IDENTITY_CONTEXT`）、TLS 类 `CODEX_CA_CERTIFICATE`/`SSL_CERT_FILE`、诊断 `RUST_LOG`。provider 自己的密钥变量名由 `env_key` 指定，不属于固定清单。【文档明确】（来源：<https://learn.chatgpt.com/docs/config-file/environment-variables>）

### 1.6 Managed configuration / requirements.toml（企业托管）

见第 19 节；与 config 直接相关的要点：
- `requirements.toml` 是管理员强制约束，用户不可覆盖；位置与优先级：系统文件（Unix `/etc/codex/requirements.toml`；Windows `%ProgramData%\OpenAI\Codex\requirements.toml`）→ 云端下发的 enterprise 层 → 旧 `managed_config.toml` 重解释 → macOS MDM（`com.openai.codex:requirements_toml_base64`）。【文档明确】（来源：<https://learn.chatgpt.com/docs/enterprise/managed-configuration>）
- ChatGPT Business/Enterprise 用户登录后可被云端 requirements 约束（`chatgpt.com/codex/settings/managed-configs` 管理；拉取失败且无有效缓存时客户端会报错而不是静默降级）。【文档明确】
- 典型键：`allowed_approval_policies`、`allowed_sandbox_modes`、`allowed_permission_profiles` + 托管 `default_permissions`、`allowed_web_search_modes`、`guardian_policy_config`、`allow_managed_hooks_only` + 托管 `[hooks]`、`mcp_servers` 白名单（名字+身份双重匹配）、`plugins`/`marketplaces` 限制、`experimental_network.*`、`rules.prefix_rules`（只允许 `prompt`/`forbidden`）、`permissions.filesystem.deny_read`、`enforce_residency`（目前仅 `us`）等。完整键表在 config-reference 的 `requirements.toml` 一节。【文档明确】（来源：config-reference、managed-configuration）

### 1.7 诊断手段

- `/debug-config`：打印配置层顺序（最低优先级在前）、各层启停状态与策略来源（`allowed_approval_policies`、`allowed_sandbox_modes`、`mcp_servers`、`rules`、`experimental_network` 等），用于排查"生效值为什么和 config.toml 不一致"。【文档明确】（来源：developer-commands "Inspect config layers with /debug-config"、developer-settings）
- `/status`：当前模型、审批策略、可写根、token 用量；远程连接时还显示远端地址与服务器版本。【文档明确】
- `codex doctor`：安装、配置、认证、运行时、Git、终端、app-server、thread 清单的体检报告。【文档明确】
- `codex debug models`（打印模型目录 JSON）、`codex debug prompt-input`（打印模型可见的 prompt 输入列表）。【文档明确】
- `RUST_LOG` + 显式 `log_dir` 启用 `codex-tui.log` 明文日志。【文档明确】

---

## 2. AGENTS.md

- 发现规则（每次运行构建一次；TUI 中每次启动会话一次）：
  1. **全局层**：`$CODEX_HOME/AGENTS.override.md` 存在则优先，否则 `AGENTS.md`；该层只取第一个非空文件。
  2. **项目层**：从项目根（通常是 Git 根；找不到根就只看当前目录）向下走到 cwd；每个目录按 `AGENTS.override.md` → `AGENTS.md` → `project_doc_fallback_filenames` 顺序，**每目录最多取一个文件**。
  3. **合并**：自根向下拼接（空行连接），越靠近 cwd 的内容排在越后面，因此后者优先（"覆盖"）。
- 跳过空文件；累计大小达到 `project_doc_max_bytes`（默认 **32 KiB**）即停止加入。【文档明确】（来源：<https://learn.chatgpt.com/docs/agent-configuration/agents-md>）
- `AGENTS.override.md`：官方推荐的"临时全局覆盖/子目录覆盖"手段，删掉即恢复。【文档明确】
- `/init`：在当前目录生成 `AGENTS.md` 脚手架。【文档明确】（来源：developer-commands、reference/slash-commands）
- `project_doc_fallback_filenames`：把 `TEAM_GUIDE.md`、`.agents.md` 之类的自定义文件名纳入发现。【文档明确】
- 替代机制：`model_instructions_file` 替代 AGENTS.md；`developer_instructions`；桌面端"自定义指令"实际写入全局 `AGENTS.md`。【文档明确】（来源：config-reference、personalize 页）
- GitHub code review 定制：在最贴近代码的 `AGENTS.md` 里写 `## Code Review Rules` 段落。【文档明确】（来源：agents-md 页、third-party/github 链接）
- 验证与排障：`codex --ask-for-approval never "Summarize the current instructions."`；`codex -c log_dir=./.codex-log` 看 `codex-tui.log`；指令每次运行重建、无缓存。【文档明确】
- `CODEX_HOME=$(pwd)/.codex codex exec ...`：为自动化用户/项目隔离指令集的技巧。【文档明确】
- 云任务也会读仓库内 `AGENTS.md`（用于找 lint/测试命令）。【文档明确】（来源：environments/cloud-environment）

---

## 3. Memories

- 定位：把历史会话中有用的上下文带入未来会话。**ChatGPT web 用 ChatGPT memory；本地 Codex 客户端用独立的本地 memory 存储**，两者不互通。【文档明确】（来源：<https://learn.chatgpt.com/docs/customization/memories>）
- 默认**关闭**（`[features].memories` 为 Experimental，默认 false）。开启：桌面端 Settings > Personalization > Enable memories；配置 `[features] memories = true`。【文档明确】（来源：memories 页、config-basic）
- 工作方式：后台异步生成（不在会话结束时立即总结）；跳过活跃/短命会话；生成的 memory 字段会**自动脱敏 secrets**；会话需空闲足够久；rate-limit 剩余百分比低于阈值（默认 25%）时跳过生成以省额度。【文档明确】
- 存储：`~/.codex/memories/`（摘要、持久条目、近期输入、证据文件）；官方定位为"生成状态"，不建议手改。【文档明确】
- 控制面：`/memories` 命令（桌面端与 CLI）按聊天控制"使用/生成"；聊天级选择不改全局设置。【文档明确】
- 相关配置：`memories.generate_memories`、`memories.use_memories`、`memories.disable_on_external_context`（用了 MCP/web search/tool search 的会话不参与生成；旧别名 `no_memories_if_mcp_or_web_search`）、`max_raw_memories_for_consolidation`（默认 256，上限 4096）、`max_unused_days`（默认 30）、`max_rollout_age_days`（默认 30）、`max_rollouts_per_startup`（默认 16，上限 128）、`min_rollout_idle_hours`（默认 6）、`min_rate_limit_remaining_percent`（默认 25）、`extract_model`、`consolidation_model`。【文档明确】（来源：config-reference `memories.*`）
- 边界：官方明确"memories 是辅助回忆层，必须始终生效的规则应放 AGENTS.md/入库文档"。【文档明确】
- 相关特性：Computer History（macOS、opt-in，把授权应用/网站活动转成 memories 与时间线；不含截图、不录音）。【文档明确】（来源：personalize、customization/computer-history 链接）

---

## 4. Skills

- 结构：一个目录 + `SKILL.md`（frontmatter 必含 `name`、`description`），可选 `scripts/`、`references/`、`assets/`、`agents/openai.yaml`。基于开放 agent skills 标准（agentskills.io）。【文档明确】（来源：<https://learn.chatgpt.com/docs/build-skills>）
- `agents/openai.yaml` 可选元数据：`interface`（display_name/icon/default_prompt 等）、`policy.allow_implicit_invocation`（设 `false` 后只能显式 `$skill` 调用）、`dependencies.tools`（声明 MCP 依赖，配合 `[features].skill_mcp_dependency_install` 自动提示安装）。【文档明确】
- 渐进披露（progressive disclosure）：Codex 先只看 name+description（含文件路径），决定使用后才读完整 `SKILL.md`。初始 skill 列表最多占模型上下文 **2%**（上下文未知时 8000 字符）；太多会先缩描述，极端时省略部分 skill 并警告。【文档明确】
- 发现位置（本地）：
  - `REPO`：从 cwd 逐级向上到仓库根的 `.agents/skills/`（含 cwd、父目录、仓库根）；
  - `USER`：`~/.agents/skills/`；
  - `ADMIN`：`/etc/codex/skills/`；
  - `SYSTEM`：OpenAI 内置（如 skill-creator、plan）。
  同名 skill 不合并、可同时出现在选择器；支持符号链接目录。【文档明确】
- 调用方式：显式 `$skill-name`（Codex CLI/IDE；ChatGPT 用 `@`）；隐式（模型按 description 匹配）；`/skills` 浏览选择；skill 也会出现在斜杠命令列表里。【文档明确】（来源：build-skills、skills-and-plugins、reference/slash-commands）
- 内置工具 skill：`$skill-creator`（交互式创建）、`$skill-installer <name>`（安装精选/外部仓库 skill）、`$plugin-creator`。【文档明确】
- 启停：`[[skills.config]]`（`path` + `enabled`），改后重启。【文档明确】
- 安全：skill 脚本执行受审批控制（`approval_policy.granular.skill_approval`）；插件捆绑的 skill 安装后需要新会话才生效。【文档明确】（来源：config-reference、plugins 页）

---

## 5. Hooks

- 定位：在 agentic loop 生命周期点上运行脚本或 MCP 工具的扩展框架。默认开启（`[features].hooks`）。【文档明确】（来源：<https://learn.chatgpt.com/docs/hooks>）
- 事件全集（11 个）：`PreToolUse`、`PermissionRequest`、`PostToolUse`、`PreCompact`、`PostCompact`、`SessionStart`、`SessionEnd`、`SubagentStart`、`SubagentStop`、`UserPromptSubmit`、`Stop`。`SessionEnd` 只在主线程结束时运行（归档/删除打开中的会话、正常退出、空闲 30 分钟且无客户端连接），不覆盖 subagent。【文档明确】
- 配置位置：活动配置层旁的 `hooks.json` 或 `config.toml` 内联 `[hooks]`；最实用的四处：`~/.codex/hooks.json`、`~/.codex/config.toml`、`<repo>/.codex/hooks.json`、`<repo>/.codex/config.toml`。多来源全部加载，高优先级层**不替换**低优先级层；同层两种形式并存时合并并警告。项目级 hooks 同样需要项目可信。【文档明确】
- 信任机制：非托管 hook 必须先在 `/hooks` 里 review + trust；信任按 hook 内容哈希记录，变更即需重审；托管（系统/MDM/云端/requirements）hook 无需信任且不可在用户浏览器里禁用；一次性自动化可用 `--dangerously-bypass-hook-trust`。【文档明确】
- 三层结构：事件 → matcher 组（正则；各事件语义不同：工具名 / 压缩触发源 `manual|auto` / 会话来源 `startup|resume|clear|compact` / subagent 类型等）→ 处理器。`matcher` 对 `UserPromptSubmit`、`Stop` 无效。【文档明确】
- 处理器类型：`command` 与 `mcp_tool` 可用；`prompt`、`agent` 类型"会被解析但跳过"。【文档明确】
- 能做什么：
  - `SessionStart`/`SubagentStart`/`UserPromptSubmit`：stdout 纯文本或 `additionalContext` 注入开发者上下文；
  - `PreToolUse`：`permissionDecision: deny`（或旧式 `decision: block`，或 exit 2 + stderr）拦截；`permissionDecision: allow` + `updatedInput` **改写**工具调用；
  - `PermissionRequest`：allow / deny / 不表态（多 hook 时 deny 优先）；
  - `PostToolUse`：block 不能撤销副作用，但会用反馈替换工具结果；`continue: false` 停止常规处理；
  - `PreCompact`：`continue: false` 可阻止压缩；
  - `Stop`/`SubagentStop`：`decision: block` = 让 Codex 继续（以 reason 作为续跑提示词）；
  - `UserPromptSubmit`：可拦截用户 prompt。
- 不能做什么：异步（`async = true`）后台 hook 不能阻塞/批准/改写触发它的操作；后台并发上限每会话 8 个；会话结束时未完成的后台 hook 被取消；`SessionEnd` 永远同步（默认超时 1 秒、最大 3 秒）；hook 输出默认约 2500 token 上限（`additionalContextLimit` 可调；超限"溢出"到磁盘存文件并给模型预览；设 0 则全量直传，有占满上下文的风险）。托管工具（如 `WebSearch`）不走本地 hook 路径。【文档明确】
- 其他行为：同一事件多个匹配的命令 hook **并发**启动（互不阻塞）；命令以会话 cwd 为工作目录；默认超时 600 秒；MCP tool hook 复用已有连接、同步执行、不触发审批也不套娃触发其他 hook；`SessionStart` 可能在 MCP server 就绪前运行且不阻塞会话。【文档明确】
- 企业：`requirements.toml` 可内联托管 hooks + `hooks.managed_dir`（脚本分发靠企业工具链，Codex 不分发脚本）；`allow_managed_hooks_only = true` 只保留托管 hooks。【文档明确】
- 插件捆绑 hooks：默认找插件根 `hooks/hooks.json`，manifest 可用 `hooks` 字段覆盖；插件 hook 有 `PLUGIN_ROOT`/`PLUGIN_DATA`（兼容 `CLAUDE_PLUGIN_ROOT/DATA`）；安装插件不等于信任其 hooks。【文档明确】
- Schema 参考：仓库 `codex-rs/hooks/schema/generated`（main 分支可能领先于发布行为，以文档为准）。【文档明确】

---

## 6. Plugins 与 Marketplace

- 定义：可安装的能力包，可包含 skills、connectors（背后是 MCP，可带 ChatGPT UI）、MCP servers、browser extensions、hooks、scheduled task templates。清单文件 `.codex-plugin/plugin.json`（`name`、`version`、`description`、`skills` 等；kebab-case 名称）。【文档明确】（来源：<https://learn.chatgpt.com/docs/plugins>、<https://learn.chatgpt.com/docs/build-plugins>）
- ChatGPT 与 Codex 共享同一个 universal plugin directory。可用面：ChatGPT web/desktop/mobile（Chat 与 Work）、ChatGPT 桌面端内的 Codex、Codex CLI（`/plugins` 浏览器）；**IDE 扩展不支持插件**。【文档明确】
- CLI 管理命令：`codex plugin add/list/remove`（均支持 `--json`）；marketplace 管理：`codex plugin marketplace add/list/upgrade/remove`，`add` 支持 `owner/repo[@ref]`、HTTP/SSH git URL、本地目录，`--ref` 钉 ref、`--sparse PATH` 稀疏检出；`list` 会显示隐式发现的默认 marketplace 与快照。【文档明确】（来源：developer-commands `codex plugin`）
- CLI 插件浏览器按 marketplace 分组；`Space` 键启停已安装插件；安装后需新开会话才生效。【文档明确】
- 插件与配置的关系：插件自带 MCP server 由插件启动，用户配置只能在 `plugins.<plugin>.mcp_servers.<server>` 下控制启停与工具审批。【文档明确】（来源：extend/mcp "Plugin-provided MCP servers"）
- 企业控制：workspace 插件可用性、GitHub marketplace 导入（enterprise/plugin-management）、`requirements.toml` 的 `marketplaces.restrict_to_allowed_sources` + `allowed_sources`（`git`/`host_pattern`/`local` 三种匹配）、`features.plugins`/`features.remote_plugin`/`features.plugin_sharing` 钉死。【文档明确】（来源：config-reference、plugins 页）
- `Sign in with ChatGPT`：面向部分合作伙伴（Airtable、GitLab、HubSpot、Notion、Supabase、Vercel 等）的 beta 登录；只共享姓名/邮箱/头像，不自动授予数据访问。【文档明确】
- 创建辅助：`$plugin-creator`（生成 manifest、组织目录、加入本地 marketplace 测试）。【文档明确】

---

## 7. MCP

- 在 `config.toml` 用 `[mcp_servers.<id>]` 声明；桌面端、CLI、IDE 扩展**共享同一份**配置（同一 Codex host）。【文档明确】（来源：<https://learn.chatgpt.com/docs/extend/mcp>）
- 支持的形态：
  - **STDIO**：`command`（必填）、`args`、`env`、`env_vars`（可带 `source = "local" | "remote"`）、`cwd`、`experimental_environment`（`remote`：经远程 executor 启动，实验性）。
  - **Streamable HTTP**：`url`（必填）、`auth`（`oauth` 默认 / `chatgpt`：受信一方 ChatGPT origin 用当前会话）、`bearer_token_env_var`、`http_headers`、`env_http_headers`；无凭据源时也可匿名连接。
  - 支持读取 server 初始化返回的 `instructions` 字段（官方建议前 512 字符自包含）。
- 常用可调项：`startup_timeout_sec`（默认 10）、`tool_timeout_sec`（默认 60）、`enabled`、`required`（true 时初始化失败即启动/`codex exec` 报错退出）、`enabled_tools`/`disabled_tools`（deny 在 allow 之后应用）、`default_tools_approval_mode`（`auto | prompt | writes | approve`；`writes` = 非只读工具逐个询问）、`tools.<tool>.approval_mode`、`scopes`、`oauth_resource`。【文档明确】
- OAuth：`codex mcp login <name>`；支持 CIMD 与 DCR（默认自动选）；`--oauth-client-id` 预注册客户端；`--oauth-client-registration cimd|dcr` 单次覆盖；回调选择规则复杂（稳定回调依赖 `authorization_response_iss_parameter_supported`），`mcp_oauth_callback_url/port` 全局覆盖、`oauth.callback_url/callback_port` 每服覆盖。【文档明确】
- CLI 命令：`codex mcp add`（stdio 或 `--url`）、`codex mcp list`、`codex mcp login/logout`（OAuth 仅 HTTP server）、`codex mcp --help`；TUI 里 `/mcp`（`verbose` 看详情）。【文档明确】
- 审批：MCP elicitation 提示受 `approval_policy.granular.mcp_elicitations` 控制（可自动拒绝）。【文档明确】（来源：config-reference）
- 官方列举的常用 server：OpenAI Docs MCP、Context7、Figma（本地/远程）、Playwright、Chrome DevTools、Sentry、GitHub MCP。【文档明确】
- 托管：`requirements.toml` 可设 `mcp_servers` 白名单，要求 **名字 + 身份**（command 精确/参数匹配器，或 url 的 exact/prefix/regex）双匹配，否则禁用。【文档明确】（来源：config-reference requirements 部分）
- 【未找到依据】Codex 是否支持 MCP 的 resources/prompts 能力：文档只写了 tools、instructions、elicitation，未提 resources/prompts，写作时不要声称支持。

---

## 8. Apps / Connectors

- Apps = ChatGPT 生态的托管 connectors（Gmail、Google Drive、Slack、GitHub 等）；在 CLI 中用 `/apps` 浏览并以 `$app-slug` 形式插入 prompt。【文档明确】（来源：developer-commands `/apps`："Attach an app as `$app-slug` before asking Codex to use it."）
- 与 MCP 的区别（文档表述综合）：Apps/connectors 是 ChatGPT 平台侧的集成（认证、动作控制、数据同步策略由 workspace apps 管理）；MCP 是本地直连的 server，配置在 Codex host。**App 与 connector 的流量不受沙箱命令网络代理与域名白名单约束**。【文档明确】（来源：config-reference `features.apps`、enterprise/apps-and-connectors、web-search 页）
- 配置：`[features].apps`（默认 true）；`apps.<id>.enabled`、`apps._default.*`（含 `destructive_enabled`、`open_world_enabled`、`approvals_reviewer`、`default_tools_approval_mode`）与每工具覆盖。【文档明确】（来源：config-reference）
- ChatGPT web 不读本地配置，只能通过 plugins 用远端 MCP 工具；本地客户端可直连。【文档明确】（来源：extend/mcp web 段）
- 企业：workspace apps 管理（角色分配、Action control、App permissions）；`requirements.toml` 可用 `apps.<id>.enabled` / `apps.<id>.tools.<tool>.approval_mode` 管控。【文档明确】（来源：enterprise/apps-and-connectors、config-reference）
- 例子：Apple Messages 插件（macOS arm64 桌面端，可读写 iMessage；发送默认逐条审批；不在 CLI/IDE/web 可用）。【文档明确】（来源：plugins 页）

---

## 9. Sandbox 与权限

- 概念：sandbox 定义技术边界（文件/网络），approval policy 决定何时停下来问。两者独立又配合。【文档明确】（来源：<https://learn.chatgpt.com/docs/sandboxing>）
- 平台实现：macOS Seatbelt 开箱即用；Linux/WSL2 需要 `bubblewrap`（`bwrap`，PATH 上第一个；AppArmor 注意事项见文档）；Windows 原生 sandbox（PowerShell）或 WSL2 的 Linux 实现。沙箱作用于**所有派生命令**（git、包管理器、测试跑器同样受限）。【文档明确】
- 沙箱模式：
  - `read-only`：只能看，不能改/跑（除非审批）；
  - `workspace-write`：默认低摩擦模式；工作区内可读写，`.git/` 与 `.codex/` 在部分环境保持只读（所以 `git commit` 可能要审批出沙箱）；`writable_roots` 加写目录；`network_access` 默认关；`exclude_tmpdir_env_var`/`exclude_slash_tmp` 控制 `$TMPDIR`、`/tmp`；
  - `danger-full-access`：无沙箱限制（仅在明确想要 full access 时用）。
  - Windows：`windows.sandbox = "elevated" | "unelevated"`、`windows.sandbox_private_desktop`。
- 审批策略：`untrusted`（可信集之外都问）、`on-request`（沙箱内自主、越界才问；交互式推荐）、`never`（不问；适合非交互）、**`on-failure` 已弃用**；另有细粒度对象 `approval_policy = { granular = { sandbox_approval, rules, mcp_elicitations, request_permissions, skill_approval } }` 可分类放行/自动拒绝。【文档明确】
- 组合预设：full access = `danger-full-access` + `never`（CLI 等价 `--yolo` / `--dangerously-bypass-approvals-and-sandbox`）；低风险本地自动化 = `workspace-write` + `on-request`。`--full-auto` 为弃用兼容旗标（有警告）。扩目录优先 `--add-dir` 而不是 full access。【文档明确】（来源：sandboxing、developer-commands "Flag combinations and safety tips"、non-interactive-mode）
- Rules（实验）：`.rules` 文件（Starlark 语法），如 `~/.codex/rules/default.rules`；`prefix_rule(pattern, decision = allow|prompt|forbidden, justification, match/not_match 内联单测)`；多规则取最严；`bash -c` 等复合命令在安全时用 tree-sitter 拆分逐条评估；TUI 允许列表写入用户层；Smart approvals 默认开启、升级时可建议规则；测试命令 `codex execpolicy check --rules ... -- <cmd>`（preview）。【文档明确】（来源：<https://learn.chatgpt.com/docs/agent-configuration/rules>）
- Permission profiles（**Beta**，活跃开发中）：
  - 内置三个：`:read-only`、`:workspace`、`:danger-full-access`；自定义 `[permissions.<name>]`，`default_permissions` 选择。
  - **与旧沙箱键互斥**：任何层出现 `sandbox_mode`（或 `--sandbox`）就回退旧机制；托管 `allowed_permission_profiles` 是唯一会强制走 profile 的例外。0.138.0 起支持托管允许列表。
  - 文件系统：`read`/`write`/`deny`；特殊 token `:root`、`:minimal`、`:workspace_roots`、`:tmpdir`、`:slash_tmp`；嵌套子路径；glob deny（Linux/WSL/Windows 需 `glob_scan_max_depth`）；`workspace_roots` 表追加 profile 级工作区根；`extends` 继承（不能 extends `:danger-full-access`、未知父级、环）。
  - 网络：`network.enabled` 只是允许联网，**不启动代理**；要强制域名规则必须开 `[features].network_proxy`（experimental）或托管 `[experimental_network]`；代理开启后无 allow 规则即阻断外部；`deny` 优先；本地/私有网络默认防护（DNS rebinding），需 `allow_local_binding` 或精确 `localhost`/IP allow；Unix socket 白名单（Docker 逃生舱）；`dangerously_*` 为专用逃生舱。
【文档明确】（来源：<https://learn.chatgpt.com/docs/permissions>、config-reference）
- Auto-review / Guardian：
  - `approvals_reviewer = "auto_review"`：把越界审批交给独立 reviewer agent；**不扩沙箱边界**；只在交互式审批（`on-request` 或 granular）下有效。
  - 触发对象：沙箱升级的 shell 调用、被拦网络请求、可写根之外的编辑、按注解/审批模式需审批的 MCP/app 工具、Computer Use 新域名。
  - 拒绝语义：拒绝不是普通错误；主代理被要求"不得绕路，换更安全的做法或停下问人"；熔断：同一 turn 内连续 3 次拒绝或滚动 50 次窗口内 10 次拒绝即中断 turn。超时单独处理。
  - 人工覆盖：`/approve` 打开 Auto-review Denials picker，选一条近期拒绝做**一次**重试（每任务最多记 10 条；重试仍走 review）。
  - 策略：开源 `policy_template.md`/`policy.md`（`codex-rs/core/src/guardian/`）；本地 `[auto_review].policy`；企业 `guardian_policy_config`（托管优先）。
【文档明确】（来源：<https://learn.chatgpt.com/docs/sandboxing/auto-review>）
- TUI 控制：`/permissions` 选择器（Auto / Read Only / 自定义 profile）、`/approve`、Windows 专属 `/setup-default-sandbox`、`/sandbox-add-read-dir`。【文档明确】（来源：developer-commands）
- `codex sandbox`：用 Codex 内部同款策略手动跑一条命令的辅助命令（分平台）。【文档明确】

---

## 10. Environments

- 桌面端新建 Codex 聊天时可选运行位置：**Local**、**Worktree**、**Cloud**；前两者都在本机。【文档明确】（来源：<https://learn.chatgpt.com/docs/environments/modes>）
- **Local environment（仅 ChatGPT 桌面端）**：配置存于项目根 `.codex` 目录（可入库共享）；
  - Setup scripts：创建新 worktree 时自动运行（装依赖/构建），可分 macOS/Windows/Linux 覆盖；
  - Actions：常用任务（起开发服务器、跑测试）显示在顶栏，运行于内置 integrated terminal；
  - 内置 Git 工具：diff 面板（可加行内评论让 Codex 处理）、按 hunk/文件 stage/revert、commit、push、建 PR。
【文档明确】（来源：<https://learn.chatgpt.com/docs/environments/local-environment>、integrated-terminal 页）
- **Cloud environment**：
  - 在 `chatgpt.com/codex/settings/environments` 配置；
  - 默认 `universal` 镜像（预装常见语言/工具；`openai/codex-universal` 仓库可查/本地拉取测试；可 "Set package versions" 钉 Python/Node 等版本）；
  - 自动安装（npm/yarn/pnpm/pip/pipenv/poetry）或自定义 setup script；setup 在独立 Bash 会话，`export` 不会延续到 agent 阶段（需写 `~/.bashrc` 或用环境变量设置）；缓存容器恢复时跑可选 maintenance script；
  - **环境变量**全程有效；**Secrets** 额外加密、仅 setup 阶段可用，agent 阶段开始前移除；
  - 容器缓存最多 12 小时；setup/maintenance/env/secrets 变更自动失效；Business/Enterprise 的缓存对同环境用户共享；
  - 所有出站流量经 HTTP/HTTPS 代理；
  - Agent 联网默认**关**，可按环境开：Off / On（域名白名单预设 None / Common dependencies / All + 可追加；HTTP 方法可限 `GET`/`HEAD`/`OPTIONS`）。文档附 prompt injection 风险说明与示例。
【文档明确】（来源：<https://learn.chatgpt.com/docs/environments/cloud-environment>、<https://learn.chatgpt.com/docs/cloud/internet-access>）
- **Remote hosts（文档存在）**：
  - Codex Remote：ChatGPT 手机端控制已连接的 Mac/Windows（启动任务、发指令、审批、看 diff）；需桌面端 Settings > Connections 配对；
  - `codex remote-control`（start/stop/pair，`--json`）；
  - TUI `--remote ws://|wss://|unix://` 连接远端 app-server（配 `--remote-auth-token-env`）；
  - SSH workspaces：桌面端自定义文件处理器可声明 `supports_ssh`；`mcp_servers.<id>.experimental_environment = "remote"` 把 stdio server 放到远程 executor（实验）。
【文档明确】（来源：remote、remote-connections、app-server、config-advanced 自定义 handler、extend/mcp）

---

## 11. Git worktrees

- 面向桌面端：Worktree 环境让多个聊天在同一项目并行互不干扰；基于原生 Git worktree（共享 `.git`）。【文档明确】（来源：<https://learn.chatgpt.com/docs/environments/git-worktrees>）
- 关键机制：
  - 起点分支可选（含带未提交改动的当前分支，改动会被带入）；worktree 默认 **detached HEAD**；
  - 存放位置 `$CODEX_HOME/worktrees`（Settings > Worktrees 可改根）；
  - `.worktreeinclude`：列出需要复制进托管 worktree 的被忽略文件（`.env` 等；只复制匹配项、跳过符号链接、不覆盖已有文件）；被忽略的 `AGENTS.override.md` 自动复制；
  - **Handoff**：聊天在 Local ↔ Worktree 之间迁移，Codex 处理 Git 操作；每个聊天绑定固定 worktree；
  - "Create branch here"：把 worktree 转成分支（之后该分支不能被其他 worktree/本地同时 checkout，文档有原理解释）；
  - Codex-managed（一次性）vs permanent worktree（侧栏三点菜单创建，不自动删、可多聊天共用）；
  - 清理：默认保留最近 **15** 个托管 worktree（可配/可关）；删除前存快照、可恢复；绑定 pinned 聊天、进行中、permanent 的不会自动删；归档聊天会删对应托管 worktree；
  - 定时任务（scheduled tasks）在 Git 仓库中跑在专用后台 worktree。
【文档明确】
- CLI 中的行为：【未找到依据】官方文档没有为 CLI 提供托管 worktree 创建/清理机制的描述；CLI 用户需自行用 `git worktree` 后在目录里启动（子代理/并行聊天建议用独立 checkout 属文档通用建议）。指南中不要写成 "CLI 有托管 worktree"。

---

## 12. Subagents

- 现状：当前版本默认启用（`[features].multi_agent` Stable）；桌面端、CLI、IDE 均可见 subagent 活动。工具集：`spawn_agent`、`send_input`、`resume_agent`、`wait_agent`、`close_agent`。【文档明确】（来源：<https://learn.chatgpt.com/docs/agent-configuration/subagents>、config-reference）
- 内置角色：`default`（通用）、`worker`（执行）、`explorer`（只读探索）。自定义同名优先。【文档明确】
- 自定义 agent：`~/.codex/agents/`（个人）或 `.codex/agents/`（项目）下的独立 TOML 文件；必填 `name`、`description`、`developer_instructions`；可含任意 config 键（`model`、`model_reasoning_effort`、`sandbox_mode`、`mcp_servers`、`skills.config` 等），作为该角色的配置层；省略项继承父会话。解析顺序：显式 spawn 值 → `[agents]` 默认 → 父会话值；文件内设置优先。官方提示该格式偏重、可能演进。【文档明确】
- 模型继承：未配置时继承父代理模型与 reasoning effort；只配 `model` 时保留已解析 effort。【文档明确】
- 并发：`agents.max_concurrent_threads_per_session` 限制同时打开的子线程（不含主线）。【文档明确】
- 交互：CLI 用 `/agent`（`/subagents`）切换查看线程；非活动线程的审批会弹到主线程（`o` 键打开源线程）；非交互场景无法弹出新审批时，需要审批的动作失败并回报父流程；父 turn 的运行时覆盖（`/permissions` 改动、`--yolo`）会在 spawn 子代理时重新应用。【文档明确】
- 继承沙箱策略；可为单个自定义 agent 覆盖（如只读）。【文档明确】
- 成本：每个 subagent 独立跑模型与工具，**比单代理耗 token**；官方建议读密集任务并行、写密集谨慎。【文档明确】
- 触发：直接要求（"spawn two agents…"）或 AGENTS.md/skill 指令请求委派；ChatGPT Work 的 Ultra 模式可**主动**委派。【文档明确】

---

## 13. Long-running work

- `/goal`（Goal mode）：桌面端、CLI、IDE 可用；目标文本同时是首条 prompt 与完成判据；上限 **4000 字符**；子命令 `/goal edit`、`pause`、`resume`、`clear`；桌面端有进度行（暂停/恢复/编辑/清除）。`[features].goals` Stable。【文档明确】（来源：<https://learn.chatgpt.com/docs/long-running-work>、developer-commands）
- 搭配 `/plan`：目标不清时先让 Codex 访谈式梳理出可验证目标再 `/goal`。【文档明确】
- 后台终端：`/ps` 查看后台终端及最近输出；`/stop` 停掉全部；`background_terminal_max_timeout`（默认 300000 ms）控制空轮询窗口。【文档明确】（来源：developer-commands、config-reference）
- 局限（文档明说）：开始 goal 不授予更大权限（沿用沙箱/审批，需要决策就停）；并行聊天避免改同一批文件（用 worktree 隔离）；本地跑长任务建议开 "Prevent sleep while running"（`[features].prevent_idle_sleep` 实验）或手机/宠物/通知关注状态。【文档明确】
- 相关：`/side`（`/btw`）侧聊（不打断主聊上下文）、`/compact` 压缩、ChatGPT Work web 端长任务的写法建议（结果/约束/验收三要素）。【文档明确】
- Scheduled tasks（定时任务）：桌面端可跑本地项目（项目目录或隔离 worktree，需电脑开机应用运行）；web 端可用上传上下文/连接工具；支持 Gmail/Slack/GitHub 事件触发（仅 web/mobile，beta 特性）；CLI/IDE 不提供管理界面。【文档明确】（来源：<https://learn.chatgpt.com/docs/automations>）

---

## 14. Codex Cloud

- 形态：隔离云环境中并行跑任务；入口 `chatgpt.com/codex`，以及 GitHub、GitLab（Beta）、Linear、Slack 集成、CLI。【文档明确】（来源：<https://learn.chatgpt.com/docs/cloud>）
- 任务流程：建容器并 checkout 选定分支/SHA → 跑 setup script（缓存恢复时加 maintenance）→ 应用联网设置 → agent 循环跑命令（会利用仓库 `AGENTS.md` 找 lint/test 命令）→ 输出总结 + diff，可追问或直接开 PR。【文档明确】（来源：environments/cloud-environment "How Codex cloud chats run"）
- 交付：查看 summary 与 diff、follow-up、开 PR；CLI 用 `codex apply` 把最近一次云聊天的 diff 打到本地仓库（`git apply` 失败非零退出）。【文档明确】（来源：developer-commands `codex apply`）
- CLI 入口：`codex cloud`（交互选择器）、`codex cloud exec`（直接提交）、`codex cloud list`（`--json`：id/url/title/status/updated_at/environment_*/summary/is_review/attempt_total）；`/cloud`、`/cloud-environment` 斜杠命令（桌面端）。【文档明确】
- 与本地的差异：环境（universal 镜像 + environment 配置 vs 本机工具链）、网络（setup 有网、agent 默认断网，本地由沙箱/代理决定）、模型（**云端目前不能改默认模型**）、凭据（secrets 只进 setup 阶段）。【文档明确】（来源：models 页 "Currently, you can't change the default model for Codex cloud chats."、cloud-environment）
- 前置：连 GitHub（选仓库）或 GitLab（建环境时选项目）。【文档明确】

---

## 15. codex exec（非交互）

- 用途：脚本/CI 中不开 TUI 跑任务；别名 `codex e`。运行时**进度流到 stderr，最终消息到 stdout**（便于管道）。【文档明确】（来源：<https://learn.chatgpt.com/docs/non-interactive-mode>、developer-commands）
- 关键参数与行为：
  - 默认 **read-only 沙箱**；`--sandbox workspace-write` / `--sandbox danger-full-access`；`--full-auto` 弃用（警告）；
  - `--ephemeral`：不写 session rollout 文件；
  - `--json`：stdout 变 JSONL 事件流，事件类型含 `thread.started`、`turn.started`、`turn.completed`、`turn.failed`、`item.*`、`error`；item 类型覆盖 agent 消息、reasoning、命令执行、文件变更、MCP 调用、web 搜索、plan 更新；
  - `-o`/`--output-last-message <path>`：最终消息落盘（仍会打印）；
  - `--output-schema <schema.json>`：约束最终响应符合 JSON Schema；
  - stdin：有 prompt 参数时管道内容作为附加上下文；`codex exec -` 让 stdin 成为完整 prompt；
  - `resume` 子命令：`--last`（当前目录最近会话）、`--all`、指定 session ID；
  - `--skip-git-repo-check`：跳过"必须在 Git 仓库内"保护；
  - `--ignore-user-config`、`--ignore-rules`：受控自动化环境用；
  - `required = true` 的 MCP server 初始化失败时 `codex exec` 报错退出；
  - 认证：默认复用已存凭据；`CODEX_API_KEY` 内联覆盖（勿在会跑仓库代码的 job 里设全局环境变量）；支持 workload identity 与 ChatGPT 托管认证（`auth.json` 视同密码）。
【文档明确】
- 退出码：【未找到依据】文档没有给出 `codex exec` 的显式数值退出码表（成功/失败/限流分别是什么码）。文档仅零散说明相关命令的非零行为（`codex login status` 有凭据时退出 0；`codex apply` 在 `git apply` 失败时非零；`codex cloud` 提交失败非零）。写指南时如需退出码应实测或查源码，不要引用虚构表格。
- 常用组合：`--profile`、`-m`/`--model`、`--search`、`-i`/`--image`、`--cd`、`-c` 覆盖、`--add-dir`。【文档明确】（来源：models、image-inputs、developer-commands 全局旗标）

---

## 16. SDK

- 定位：SDK 用于自动化/CI/自建工具；要做带认证、历史、审批、流式事件的自定义客户端则用 app server。TS 与 Python 两个库。【文档明确】（来源：<https://learn.chatgpt.com/docs/codex-sdk>）
- TypeScript：`@openai/codex-sdk`（npm），服务端使用，Node 18+；`new Codex()` → `startThread()` → `thread.run(prompt)`（`finalResponse`）；`resumeThread(threadId)` 续旧线程；控制的是**本地** Codex 线程。【文档明确】
- Python：`openai-codex`（pip），Python 3.10+；通过 JSON-RPC 控制本地 app-server；发布构建钉住 Codex CLI runtime（`CodexConfig(codex_bin=...)` 可覆盖）；稳定版 + `--pre` 预发布；`Codex`/`AsyncCodex`；`Sandbox` 预设 `read_only`/`workspace_write`/`full_access`，可在 `thread_start` 或单次 `run(...)`/`turn(...)` 指定（后者对该 turn 及后续 turn 生效）。【文档明确】
- 差异（文档表述综合）：TS 库面向"启动/继续/恢复本地线程"的高层自动化；Python 库显式建立在 app-server JSON-RPC 之上并暴露沙箱预设与异步变体。【文档暗示】
- 同页声明：`codex mcp-server` 弃用；另有 beta 的 Codex Security TypeScript SDK（安全扫描专用）。【文档明确】

---

## 17. App Server（一段，作者另有专文）

`codex app-server` 是驱动富客户端（如 Codex VS Code 扩展）的接口：JSON-RPC 2.0、双向；传输：stdio（默认）、WebSocket（**experimental 且不支持用于生产**）、Unix socket、off；可 `--listen ws://127.0.0.1:4500` + `codex --remote` 让远端 TUI 接入（非本机连接必须配 WebSocket auth + TLS，`--ws-auth capability-token`/`signed-bearer-token` 等）；`generate-ts` / `generate-json-schema` 可按当前版本导出协议 schema；还有 `--code-mode-host` 接远程 Code Mode 宿主。开源在 `codex-rs/app-server`。【文档明确】（来源：<https://learn.chatgpt.com/docs/app-server>）

---

## 18. codex mcp-server / GitHub Action

- `codex mcp-server`：**已弃用**，官方推荐改用 app server；从 Claude Code 调 Codex 用 `openai/codex-plugin-cc`（基于 app server）。存量集成说明：stdio 上暴露两个工具 `codex`（参数：`prompt` 必填、`approval-policy`、`base-instructions`、`compact-prompt`、`config`、`cwd`、`developer-instructions`、`model`、`sandbox`）与 `codex-reply`（`prompt` + `threadId`；`conversationId` 为弃用别名）；`threadId` 在 `structuredContent.threadId` 返回；配合 OpenAI Agents SDK 可做编排型多代理工作流（文档含完整教程与 Cookbook 链接）。【文档明确】（来源：<https://learn.chatgpt.com/docs/mcp-server>、developer-commands）
- GitHub Action：`openai/codex-action@v1`。安装 CLI、提供 API key 时启动 Responses API 代理（减少 key 暴露）、按指定权限跑 `codex exec`。输入：`prompt`/`prompt-file`（二选一）、`codex-args`、`model`、`effort`、`sandbox`、`output-file`、`codex-version`、`codex-home`。安全基线：`safety-strategy` 默认 `drop-sudo`（Linux/macOS；Windows 必须 `unsafe`）、`unprivileged-user` + `codex-user`、`read-only`（注意仍提权运行、不能单独保护 secrets）、`allow-users`/`allow-bots` 限制触发者（默认仅写权限用户）；输出 `final-message`。安全清单：限制触发者、清洗 PR/issue 输入防注入、不要把 `OPENAI_API_KEY` 设为会执行仓库代码的 job 级环境变量、Codex 放 job 最后一步、疑似泄露立即轮换密钥。【文档明确】（来源：<https://learn.chatgpt.com/docs/github-action>、non-interactive-mode）

---

## 19. 企业治理（简要）

- Managed configuration 双轨：**Requirements**（强制、不可覆盖）与 **Managed defaults**（启动时应用、运行中可改、下次启动重置）。来源与优先级见 §1.6；云端托管策略经签名缓存下发，拉取失败且无缓存时报错不静默。【文档明确】（来源：managed-configuration）
- Governance 三件套分工：Workspace analytics（交互式采用度）、Codex analytics（`admin.openai.com/analytics/codex`，交互式）、Analytics API（程序化聚合报表）、Compliance API（审计/取证记录，进 SIEM 等）。文档强调 dashboard 字段不是稳定契约。【文档明确】（来源：<https://learn.chatgpt.com/docs/enterprise/governance>、workspace-analytics、analytics-api）
- 相关企业管理面（有独立文档页）：workload identity、access tokens、service accounts、groups & provisioning、user lifecycle、roles & workspace permissions、plugin management、skills 控制、admin plugin、Prisma AIRS、HIPAA、workspace model availability、Windows deployment。【文档明确】（导航目录，来源：<https://learn.chatgpt.com/codex>）

---

## 20. 其他用户可见能力（易遗漏项）

- **`/model` 与模型选择**：CLI `/model`、`--model`/`-m`（交互与 `codex exec` 均可用）；桌面/IDE 用 composer 下模型控件。推荐模型：`gpt-5.6-sol`（旗舰）、`gpt-5.6-terra`（日常）、`gpt-5.6-luna`（快速低成本）、`gpt-5.3-codex-spark`（research preview、近实时、仅 ChatGPT Pro、仅本地客户端）；其他：`gpt-5.5`、`gpt-5.4`、`gpt-5.4-mini`（ChatGPT 登录下 2026-08-31 退役）；`gpt-5.2`、`gpt-5.3-codex` 已弃用。**Codex cloud 目前不能改默认模型**。reasoning effort：Light/Low→Medium→High→Extra High；Max 需在设置开启；Ultra 用 subagents 并行。Chat Completions wire API 支持已弃用。【文档明确】（来源：<https://learn.chatgpt.com/docs/models>）
- **Fast tier / Fast mode**：`/fast on|off|status`；持久化 `service_tier = "fast"` + `[features].fast_mode = true`；速度约 1.5x，GPT-5.6/5.5 按 2.5x credits、GPT-5.4 按 2x；是 ChatGPT credit 特性（API key 走 API 计价，Priority 为 2x）；目录不暴露 Fast tier 时不显示 `/fast`。Codex-Spark 是独立模型而非 fast mode。【文档明确】（来源：<https://learn.chatgpt.com/docs/agent-configuration/speed>、developer-commands）
- **Personality**：`friendly`/`pragmatic`/`none`；`/personality` 会话内切换；模型不支持时命令隐藏；桌面端 Settings > Personalization。【文档明确】（来源：config-reference、developer-commands、reference/settings、personalize）
- **Images 输入**：`codex -i screenshot.png "..."`、`--image before.png,after.png`（逗号分隔或重复旗标）；交互中可直接粘贴；桌面端按住 Shift 拖入；支持 PNG/JPEG 等。另有 `tools.view_image` 配置（本地图片查看工具）。【文档明确】（来源：<https://learn.chatgpt.com/docs/image-inputs>、config-reference）
- **Web search**：`--search`（一次性 live）；`web_search` 四模式；搜索结果在 transcript 与 `--json` 输出中显示为 `web_search` 项；`tools.web_search.allowed_domains` 只过滤搜索本身；自定义 provider 的 `supports_standalone_web_search`（under development、默认关）。【文档明确】（来源：<https://learn.chatgpt.com/docs/web-search>）
- **`/usage` 额度**：TUI `/usage`（菜单：查看 token 活动或兑换 earned rate-limit reset；`/usage daily|weekly|cumulative`）；需 ChatGPT 账户认证；另有 `chatgpt.com/codex/settings/usage` dashboard。Profile 页可看 lifetime/peak tokens、streaks。【文档明确】（来源：developer-commands、reference/settings）
- **Projects 概念**：CLI 把启动目录当项目（`--cd`/`-C`），不暴露 ChatGPT Projects 视图；桌面端 Projects 视图含 ChatGPT 项目与本地项目；`/project`、`/task`（无项目聊天）；聊天组织：pin、重命名、归档、搜索。【文档明确】（来源：<https://learn.chatgpt.com/docs/projects>、reference/slash-commands）
- **ChatGPT Web/mobile 入口**：Web：`chatgpt.com/codex`（Codex cloud）、ChatGPT Work；mobile：Codex Remote（控制已连接电脑）；桌面端：Codex 模式、Local/Worktree/Cloud 选择、Quick chat。【文档明确】（来源：cloud、remote、use-chatgpt）
- **Feature maturity 机制**：五级标签 Under development / Experimental / Beta / Stable / Deprecated（文档给出使用指导），命令参考表与 feature flag 表都带 Maturity 列。【文档明确】（来源：<https://learn.chatgpt.com/docs/feature-maturity>）
- **`/import`**：从 Claude Code 或 Cursor 迁移设置/项目/聊天（最多 50 条近 30 天聊天）。【文档明确】（来源：developer-commands）
- **会话管理**：`codex resume`/`/resume`、`codex fork`/`/fork`、`codex archive`/`unarchive`、`codex delete`、`/new`、`/clear [name]`、`/rename`、`tui.resume_cwd`。【文档明确】
- **TUI 交互**：`@` 搜文件加入 prompt；`!` 前缀跑本地 shell（受当前审批/沙箱）；`Tab` 排队后续输入；运行中 `Enter` 注入指令；`Esc Esc` 编辑上一条并 fork；`Ctrl+R` 历史搜索；`Ctrl+O`/`/copy` 复制最新完成输出；`/raw`、`/statusline`、`/title`、`/theme`、`/keymap`、`/vim`、`/pets`。【文档明确】（来源：developer-commands）
- **代码评审**：`codex review`（`--uncommitted`/`--base`/`--commit`/自定义 prompt 互斥；`--title` 仅配 `--commit`）与 `/review`；`review_model` 配置。【文档明确】
- **通知**：桌面端通知设置（从不/后台时/总是；权限与问题分开）、Activity 视图（铃铛，`Cmd+Option+U`）、宠物状态；CLI 用 `notify` + `tui.notifications`。【文档明确】（来源：notifications、reference/settings）
- **定价口径**：ChatGPT Work 与 Codex 共享额度/计价/限制。【文档明确】（来源：agent-configuration/speed 页首、pricing 页）

---

## 附录 A：官方文档有、但常被忽略的小功能

1. `AGENTS.override.md`：不动 `AGENTS.md` 的临时覆盖（全局与子目录均可）。
2. `.worktreeinclude`：把 `.env` 等被忽略文件复制进托管 worktree。
3. `project_doc_fallback_filenames`：让 `TEAM_GUIDE.md` 之类充当指令文件。
4. `notify`：turn 完成时跑外部程序（webhook/桌面通知/CI 提示）。
5. `file_opener`：把输出中的文件引用变成可点击的编辑器链接。
6. `/statusline`、`/title`、`/theme`、`/keymap`、`/raw`、`/copy`、`/pets`：TUI 个性化全家桶。
7. `history.max_bytes`：给历史文件封顶。
8. `tui.resume_cwd`：恢复会话时免询问目录选择。
9. `desktop.custom_file_handlers`：桌面端自定义 "Open in" 编辑器。
10. `codex execpolicy check`：规则文件的"单测运行器"（配合 `match`/`not_match` 内联用例）。
11. `codex sandbox`：手动以 Codex 同款沙箱策略跑命令。
12. `codex doctor`、`codex debug models`、`codex debug prompt-input`、`/debug-config`：四层诊断。
13. `$skill-installer`：一行安装精选/外部 skill。
14. hooks 的 `additionalContextLimit` 溢出（spilling）机制与 2500 token 默认上限。
15. `projects.<path>.trust_level`：在 config 里显式管理（worktree 的）信任。
16. `codex login status`：CI 中探测凭据（退出码 0）。
17. `--dangerously-bypass-hook-trust`：受控自动化的单次钩子豁免。
18. `mcp_servers.<id>.required = true`：把 MCP server 变成硬依赖（失败即退出）。
19. `CODEX_HOME=$(pwd)/.codex`：给自动化用户隔离指令/配置集。
20. `#:schema` TOML 指令 + 官方 JSON Schema。
21. `web_search = "indexed"` 模式（介于 cached 与 live 之间）。
22. `!` 前缀在 TUI 内直接跑受管 shell 命令。
23. `/approve`：人工推翻 auto-review 拒绝的一次性重试通道。
24. 被忽略的 `AGENTS.override.md` 自动进托管 worktree。
25. `codex completion`、`codex update`、`codex apply`、`codex app`、`codex remote-control`。

## 附录 B：文档标注 experimental / beta / deprecated 的能力盘点

**Experimental**：`[features].memories`、`[features].network_proxy`、`[features].prevent_idle_sleep`、`rules`（rules 页自述 experimental）、`shell_environment_policy.experimental_use_profile`、`mcp_servers.<id>.experimental_environment = "remote"`、requirements 的 `[experimental_network]`、`codex execpolicy`（preview）。
**Beta**：permission profiles（permissions 页自述）、GitLab 支持、Sign in with ChatGPT。
**Research preview**：`gpt-5.3-codex-spark`、Codex Security Review 等（见 whats-new）。
**Under development**：`features.code_mode.*`、`features.rollout_budget.*`、自定义 provider 的 standalone web search。
**Deprecated**：`approval_policy = "on-failure"`、`codex mcp-server`、`--full-auto`、Chat Completions wire API、`[features].web_search/web_search_cached/web_search_request`、`codex_hooks` 别名、`experimental_instructions_file`（改名 `model_instructions_file`）、`agents.max_threads`（legacy alias）、mcp-server 的 `conversationId`、`background_terminal_timeout`（被 `background_terminal_max_timeout` 取代）。
**Unsupported for production**：app-server WebSocket 传输。
（来源：上述各对应页面；maturity 标签定义见 <https://learn.chatgpt.com/docs/feature-maturity>）

## 附录 C：未找到文档依据的点（写作时避免断言）

1. `codex exec` 的显式数值退出码表（成功/一般失败/限流等）——文档未提供。
2. CLI 的"托管 worktree"创建/清理机制——worktree 管理文档全部围绕桌面端。
3. Codex 对 MCP resources/prompts（tools/instructions/elicitation 之外）的支持——未见表述。
4. 项目信任的交互式授予命令（如假想的 `/trust`）——文档只有 `projects.<path>.trust_level` 配置与"信任后加载"表述。
5. Fast mode 在 Codex cloud 任务中的行为——文档只说本地客户端（桌面/CLI/IDE）可用。

## 附录 D：补充一手来源（官方博客）

- GPT-5.6 发布：<https://openai.com/index/gpt-5-6/>
- Previewing GPT-5.6 Sol：<https://openai.com/index/previewing-gpt-5-6-sol/>
- Introducing GPT-5.3-Codex：<https://openai.com/index/introducing-gpt-5-3-codex/>
- Harness engineering: leveraging Codex in an agent-first world：<https://openai.com/index/harness-engineering/>

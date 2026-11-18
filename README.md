# iChrome

你的本地 AI 浏览器控制插件。基于 [huashu-chrome](https://github.com/alchaincyf/huashu-chrome) v1.3.1（MIT）定制，保留原作者版权与站点经验。

AI 客户端通过 MCP 控制你正在使用的 Chrome，沿用已有登录状态。支持页面快照、点击输入、批量填表、正文提取、网络请求、上传下载、截图、人工交接和站点经验。

## 快速安装

要求：Node.js 20+、Chrome 116+，以及支持本地 MCP 的 AI 客户端。

在本项目目录运行：

```powershell
npm ci
npm run setup:preview
npm run setup
```

`setup:preview` 只展示配置计划。`setup` 会检测本机 AI 客户端，备份现有配置，再添加名为 `ichrome` 的 MCP 服务，启动命令指向这份本地源码。原有服务保留。完成后会打开安装指南。

接着安装浏览器插件：

1. Chrome 地址栏输入 `chrome://extensions`。
2. 打开右上角「开发者模式」。
3. 点击「加载已解压的扩展程序」。
4. 选择本项目的 `extension` 目录。
5. 将 **iChrome** 固定到工具栏，点击图标打开侧边栏。
6. 重启 AI 客户端，然后在项目目录运行 `npm run doctor`，确认「Chrome 扩展在线」。

对 AI 说：

> 用 ichrome 打开 example.com，读取页面标题。

插件本身不包含模型或聊天引擎；指令从你的 AI 客户端发起。本地桥在首次调用或 doctor 检查时自动启动。

## 手动配置 MCP

如果自动安装没有找到你的客户端，可参考下面的 JSON。将路径换成实际的绝对路径，合并到客户端现有配置：

```json
{
  "mcpServers": {
    "ichrome": {
      "command": "node",
      "args": ["D:/path/to/ichrome/src/cli.js", "mcp", "--client", "custom"]
    }
  }
}
```

支持 TOML 的客户端可添加：

```toml
[mcp_servers.ichrome]
command = "node"
args = ["D:/path/to/ichrome/src/cli.js", "mcp", "--client", "custom"]
```

若客户端找不到 `node`，将 `command` 替换成 Node.js 可执行文件的绝对路径。移动项目目录后，需要更新 MCP 启动路径。

## 定制版改动

- 独立名称、浏览器/指针图标、侧边栏、通知与标签组。
- 独立扩展公钥及 ID，不覆盖原版；默认只信任本版本扩展和显式配置的额外扩展。
- 配置、审计与本机经验保存在 `~/.ichrome/`。
- 桥默认使用端口 18999；扩展会探测 18999–19003，不与原版的默认端口冲突。
- 安装器使用本地源码，欢迎页和升级提示不再指向上游 npm 包或商店。
- Windows/macOS/Linux 打包入口，保留固定扩展公钥及 MIT 声明。

现有内部消息格式与 `HUASHU_CHROME_*` 环境变量名保留，以兼容上游实现。原版的本机经验不会自动迁移。

## 开发与打包

```powershell
npm test                    # 无需 Chrome 的协议与安全边界测试
npm run test:live            # 需要已连接的 Chrome 插件，在本地靶场执行真实页面回归
npm run build:icons          # 从代码生成图标，无需外部素材
npm run build:extension      # dist/ichrome-1.3.1.zip
npm run bridge              # 前台启动桥，便于调试
node src/cli.js audit -n 30  # 查看最近操作
```

ZIP 是供本地解压加载的扩展包，保留公钥以稳定扩展 ID。它仅包含扩展及许可/隐私文档，AI 控制仍需要本项目的 Node.js 本地端。加载 ZIP 解压出的副本后，源码变更不会自动同步到副本；开发时建议直接加载 `extension`。

本版本尚未发布到 npm 或 Chrome 应用商店。商店发布需要另行处理新扩展 ID 和桥的可信 ID 配置。

修改 `extension/` 后，在扩展管理页点「重新加载」。桥是常驻进程，修改桥代码后需要重启该进程；`npm run doctor` 可查看桥 PID。

## 数据与操作边界

桥与扩展仅通过本机通信；读取到的页面文本、接口响应、截图会交给 AI 客户端，可能由该客户端发送给模型服务。插件能以你的登录身份操作网页。支付按钮有人工确认，删除、发布、提交没有统一的确认弹窗；脚本、坐标和直接请求接口也不受完整的支付拦截保护。详见 [PRIVACY.md](PRIVACY.md)。

原项目说明保存在 [README.upstream.md](README.upstream.md)。原作者：花叔（alchaincyf）。许可证：[MIT](LICENSE)。

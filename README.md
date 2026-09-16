# DDUserScript

个人油猴脚本合集。

## 脚本列表

### 1. 1000qm 屏蔽助手

- **文件**：[1000qm-blocker.user.js](./1000qm-blocker.user.js)
- **站点**：[阡陌居](https://www.1000qm.vip/)
- **最新版本**：1.4.1
- **Greasy Fork**：https://greasyfork.org/zh-CN/scripts/595692

#### 功能

**自动签到（v1.4 新增）**
- 打开首页自动完成每日签到
- 随机选 9 个表情之一（开心/难过/郁闷/无聊/怒/擦汗/奋斗/慵懒/衰）
- 按 24 小时时段发送不同签到文字
- 自动领每日威望红包（+1 威望）
- 当天只签一次，不重复
- 悬浮按钮右上角显示签到状态灯：🟢 已签到 / 🟠 进行中 / 🔴 失败

**板块屏蔽**
- 按分类屏蔽：勾选不想看的分类（如历史架空、女频），对应帖子立即隐藏
- 按作者拉黑：点作者名旁的 🚫 按钮，或在面板中点作者名
- 屏蔽设置本地持久化，跨版块共享
- 每个版块自动适配自己的分类体系
- 主页/帖子详情页自动静默

---

### 2. 同人小说网(trxs.cc) 全本TXT下载器

- **文件**：[trxs-downloader.user.js](./trxs-downloader.user.js)
- **站点**：[同人小说网](https://www.trxs.cc/)
- **最新版本**：2.3
- **Greasy Fork**：https://greasyfork.org/zh-CN/scripts/595690

在 trxs.cc 任一同人小说目录页，一键抓取全本并导出标准听书 TXT：

- **GBK 解码**：解决老站 GBK 编码乱码
- **3 并发抓取**：比串行快 3 倍，每章间隔 150ms 防封
- **IndexedDB 断点续传**：中途刷新/断网后重新打开可继续
- **听书 TXT 格式**：章节标题独占一行、无分隔线、自动去掉书名前缀和作品简介，多多朗读等 App 导入后自动分章
- **节→章统一**：网站用"第X节"，导出统一为"第X章"
- **广告过滤**：自动剔除宣传语、广告链接

---

## 安装

1. 浏览器安装 [Tampermonkey](https://www.tampermonkey.net/)（或 Violentmonkey）
2. 打开对应 .user.js 文件，点 Raw，Tampermonkey 会提示安装
3. 或直接点 Greasy Fork 安装链接

## License

MIT
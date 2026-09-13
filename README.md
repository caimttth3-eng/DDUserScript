# DDUserScript

个人油猴脚本合集。

## 脚本列表

### 1. 1000qm 屏蔽助手

- **文件**：[1000qm-blocker.user.js](./1000qm-blocker.user.js)
- **站点**：[阡陌居](https://www.1000qm.vip/)
- **版本**：1.3
- **Greasy Fork**：https://greasyfork.org/zh-CN/scripts/595692

在阡陌居所有版块列表页按分类/作者屏蔽帖子：

- 勾选不想看的分类（如历史架空），对应帖子立即隐藏
- 点作者名或作者旁 🚫 按钮拉黑用户
- 屏蔽设置本地持久化，跨版块共享
- 每个版块自动适配自己的分类体系
- 主页/帖子详情页自动静默

---

### 2. 同人小说网(trxs.cc) 全本TXT下载器

- **文件**：[trxs-downloader.user.js](./trxs-downloader.user.js)
- **站点**：[同人小说网](https://www.trxs.cc/)
- **版本**：2.3
- **Greasy Fork**：https://greasyfork.org/zh-CN/scripts/595690

在 trxs.cc 任一同人小说目录页，一键抓取全本并导出标准听书 TXT：

- GBK 解码，3 并发，IndexedDB 断点续传
- 听书 TXT 格式：章节清洗/去简介/节→章统一
- 多多朗读等听书 App 导入自动分章

---

## 安装

1. 浏览器安装 [Tampermonkey](https://www.tampermonkey.net/)（或 Violentmonkey）
2. 打开对应 .user.js 文件，点 Raw，Tampermonkey 会提示安装
3. 或直接点 Greasy Fork 安装链接

## License

MIT
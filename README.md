# DDUserScript

个人油猴脚本合集。

## 脚本列表

### 1. 1000qm 屏蔽助手

- **文件**：[1000qm-blocker.user.js](./1000qm-blocker.user.js)
- **站点**：[阡陌居](https://www.1000qm.vip/)
- **最新版本**：1.4.3
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
- **最新版本**：2.4
- **Greasy Fork**：https://greasyfork.org/zh-CN/scripts/595690

在 trxs.cc 任一同人小说目录页，一键抓取全本并导出标准听书 TXT：

- **GBK 解码**：解决老站 GBK 编码乱码
- **3 并发抓取**：比串行快 3 倍，每章间隔 150ms 防封
- **IndexedDB 断点续传**：中途刷新/断网后重新打开可继续
- **听书 TXT 格式**：章节标题独占一行、无分隔线、自动去掉书名前缀和作品简介，多多朗读等 App 导入后自动分章
- **节→章统一**：网站用"第X节"，导出统一为"第X章"
- **广告过滤**：自动剔除宣传语、广告链接
- **链接兼容**：同时支持 `/tongren/{id}/xxx.html` 与 `/view/2-{id}-1.html` 两种章节链接

---

### 3. B站空间IP属地显示

- **文件**：[bili-space-ip.user.js](./bili-space-ip.user.js)
- **站点**：[哔哩哔哩](https://space.bilibili.com/)
- **最新版本**：1.2
- **Greasy Fork**：（发布后补）

在 B 站用户空间页把该用户的 IP 属地贴在用户名后面显示，不用再点进动态翻找。

- **PC / 移动端通用**：`space.bilibili.com` 与 `m.bilibili.com/space`
- **徽章贴在昵称后**：不遮挡头像与页面布局；名字元素晚于脚本渲染时会自动迁移到位
- **一次扫码登录**：手机 B 站 App 扫码拿到 access_key，长期有效、到期自动续期
- **手动兜底**：支持直接粘贴 access_key
- **状态明确**：未登录 / 获取中 / 已获取 / 失败都有提示
- **原理**：TV 端登录接口取凭证 → App 端 `Dynamic/DynSpace` 取最近动态 ID → `Dynamic/DynDetail` 读取动态详情中的 IP 属地字段

#### 使用

1. 打开任意 B 站用户空间页
2. 点右下角圆形「IP」按钮
3. 点「扫码登录」，手机 B 站 App 扫一扫并确认
4. 徽章自动显示该用户 IP 属地

登录凭证只存本机 Tampermonkey 存储（GM_setValue），不上传第三方；面板里「退出登录」可随时清除。

---

## 安装

1. 浏览器安装 [Tampermonkey](https://www.tampermonkey.net/)（或 Violentmonkey）
2. 打开对应 .user.js 文件，点 Raw，Tampermonkey 会提示安装
3. 或直接点 Greasy Fork 安装链接

## License

MIT

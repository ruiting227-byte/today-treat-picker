# 今天请吃什么 · Today Treat Picker

> 共享房间抽签小工具：和朋友一起维护"想吃清单"，抽到什么今天就请什么 ૮ ・ﻌ・ა ✿

![og](public/og-image.png)

## 这是什么

- 一个房间码 = 一份共享清单（情侣 / 室友 / 办公室小队都能用）
- 4 个品类：**正餐 / 奶茶 / 甜点 / 零食**
- 实时同步：别人加菜、抽签，你这边马上看到
- 3 套主题：暖玫 / 抹茶 / 深夜食堂（每个用户独立保存）
- 真在线状态（Supabase Realtime Presence）
- 抽签两种动效：滚动文字 / 大转盘
- 可改昵称、可看最近抽签记录
- PWA：可加到手机主屏，离线打开

## 技术栈

- React 18 + Vite 5
- Tailwind CSS 3（JIT，按需）
- Supabase（数据库 + Realtime）
- vite-plugin-pwa（service worker + manifest）

---

## 🚀 快速开始（5 分钟跑起来）

### 第 0 步：本地装好

```bash
cd webapp
npm install
```

> 还没装 Node？去 [nodejs.org](https://nodejs.org/) 装 LTS 版本就行。

### 第 1 步：先跑个本地预览版

不配 Supabase 也能跑 —— 房间数据存浏览器本地，实时在线靠 BroadcastChannel（同一浏览器多开标签可见）。

```bash
npm run dev
```

打开 http://localhost:5173 就能玩。验证功能没问题之后再接后端。

---

## 🗄 接 Supabase（让数据跨设备同步）

### 第 1 步：注册 + 建项目

1. 打开 [supabase.com](https://supabase.com)，用 GitHub / Google 登录（免费）
2. 右上角 **New project**
   - Organization：默认那个就行
   - Name：随便填，比如 `today-treat`
   - Database Password：**随机生成一个、复制保存**（之后不会再显示）
   - Region：选离你近的（中国大陆用户选 Singapore / Tokyo / Hong Kong）
   - Pricing Plan：**Free** 够用
3. 点 **Create new project**，等 1–2 分钟它把数据库建好

### 第 2 步：执行 SQL 建表

1. 项目建好后，左侧栏点 **SQL Editor** → **+ New query**
2. 打开本项目里的 `supabase/schema.sql`，**全选复制粘贴进去**
3. 右下角点 **Run**（或 ⌘/Ctrl + Enter）
4. 看到下面绿条 "Success. No rows returned" 就成了

### 第 3 步：拿到 URL 和 Key

1. 左侧栏点 **Project Settings**（齿轮图标）→ **API**
2. 找到两个东西：
   - **Project URL**（形如 `https://xxxxx.supabase.co`）
   - **Project API keys → `anon` `public`**（一长串以 `eyJ...` 开头）

> ⚠️ 不要用 `service_role` 那个 key！只用 `anon public`。

### 第 4 步：本地填上

```bash
cp .env.example .env
```

然后用编辑器打开 `.env`，把两个值填进去：

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...你的-anon-public-key
```

重启 dev 服务：

```bash
npm run dev
```

打开浏览器，左上角的小徽章会从 "本地预览" 变成 "**已云端同步**"。换个房间码进出几次试试，数据就到 Supabase 里了 —— 在 Supabase 控制台 **Table Editor** 里能看到 `rooms` / `treat_options` / `draw_results` 三张表的数据在涨。

---

## ☁️ 部署到 Vercel

### 第 1 步：把代码推到 GitHub

```bash
cd webapp
git init
git add .
git commit -m "init"
```

去 GitHub 新建一个空仓库（比如 `today-treat-picker`），然后：

```bash
git remote add origin git@github.com:你的用户名/today-treat-picker.git
git branch -M main
git push -u origin main
```

> 没用过 Git？最省事是装 [GitHub Desktop](https://desktop.github.com/)，点几次按钮就传上去了。

### 第 2 步：在 Vercel 导入

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
2. 主页点 **Add New** → **Project**
3. 找到刚才那个仓库，点 **Import**
4. 配置页：
   - **Framework Preset**：Vercel 会自动识别成 Vite，保持不变
   - **Root Directory**：如果你的仓库根目录就是 webapp，留空；如果你的仓库里 webapp 是子目录，点 **Edit** 把它指到 `webapp/`
   - **Build Command** / **Output Directory** / **Install Command**：都默认就行（`vercel.json` 里已经配好了）
5. 展开 **Environment Variables**，加两个：
   - `VITE_SUPABASE_URL` = 你的 URL
   - `VITE_SUPABASE_ANON_KEY` = 你的 anon key
6. 点 **Deploy**

等 1 分钟左右，Vercel 给你一个 `xxx.vercel.app` 的地址，能打开就部署完成了。

### 之后改代码怎么更新

```bash
git add .
git commit -m "更新"
git push
```

Vercel 检测到 push 会自动重新部署，几十秒后线上就更新了。

---

## 📱 PWA：加到主屏

部署上线后：

- **iPhone**：Safari 打开网站 → 分享按钮 → "添加到主屏幕"
- **Android**：Chrome 打开 → 菜单 → "添加到主屏幕" 或 "安装应用"
- **桌面 Chrome / Edge**：地址栏右侧会有一个安装图标

加完之后会以独立窗口打开，没有浏览器地址栏，离线状态下静态资源也能直接出来（数据请求需要在线）。

---

## 🎨 自定义

### 改默认颜色 / 加新主题

`src/lib/theme.js`，照着已有的 `rose` / `matcha` / `midnight` 加一组就行，再在 `THEME_LIST` 里登记一下。

### 改默认菜单

`src/lib/room.js` 里的 `DEFAULT_OPTIONS`。注意 **schema.sql 里也有一份 category 枚举**，加新品类要两边一起改。

### 改房间码规则

`src/lib/room.js` 的 `normalizeRoomCode` 和 `randomRoomCode`。

### 改文案 / 副标题 / og 图

- 文案：`src/components/RoomGate.jsx`、`src/App.jsx`
- og 图：替换 `public/og-image.png`（1200 × 630）
- title / description：`index.html` 顶部

---

## ❓常见问题

**Q：部署后浏览器一直显示"本地预览模式"？**
A：环境变量没生效。去 Vercel → 项目 → Settings → Environment Variables 确认两个值都加了，然后到 Deployments → 最新那条的 ··· → Redeploy。

**Q："已云端同步" 但其他人看不到我加的菜？**
A：schema.sql 没跑完整，或者 RLS 策略没建好。再去 Supabase SQL Editor 把 `supabase/schema.sql` 重新跑一遍（脚本里所有 `create policy` 前都有 `drop if exists`，重复跑没事）。

**Q：在线状态不准？**
A：Supabase 免费档对 Realtime 有连接数限制（同时 200 个），日常用够。如果完全连不上，去 Supabase 项目 Settings → API → **Realtime** 看一下有没有被关掉。

**Q：怎么彻底清空一个房间的数据？**
A：Supabase → Table Editor → `rooms` 表，找到那行 code，删掉就行（外键级联会顺带删掉 options 和 draws）。

**Q：能给房间加密码吗？**
A：当前房间码本身就是口令。如果要做"房间内的二次密码"，需要在 `rooms` 表加 `password_hash` 字段 + 改前端进房流程 + 给 RLS 策略加校验。可以告诉我让我加。

---

## 路线图（候选）

- [ ] 房间密码 / 房主权限
- [ ] "谁请客" 随机抽人
- [ ] 抽签去重（今天抽过的不再出现）
- [ ] 多语言（英 / 日）
- [ ] 把 `anon` 权限收紧到登录用户（接 Supabase Auth）

---

部署遇到问题随时回来问。

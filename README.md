# ![Boundary Logo](./boundary.png)

[中文](#zh) | [English](#en)

---

## <a id="zh"></a>中文

**Boundary** 是一个可按平台控制的 Chrome 扩展，用于屏蔽搜索框相关干扰（placeholder、下拉推荐、浏览器自动补全）。

### 功能
- 按平台开关：每个网站可单独配置
- 三个控制项
  - 隐藏搜索框内容（仅隐藏 placeholder，输入文字仍可见）
  - 隐藏下拉推荐
  - 关闭浏览器补全（历史/自动补全）
- Popup 状态页：查看当前站点状态并快速切换

### 已支持平台
- 哔哩哔哩 `https://www.bilibili.com/*`
- Google Scholar `https://scholar.google.com/*`

### 计划中平台
- YouTube
- 微博
- 知乎

### 安装与使用（开发者模式）
1. 打开 `chrome://extensions/`
2. 右上角开启“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择本目录：`Boundary/Boundary`
5. 点击扩展图标打开 Popup 或进入“选项”页进行配置
6. 修改配置后刷新目标网站页面

### 图标
扩展图标位于 `icons/` 目录。

### 目录结构
- `manifest.json` 扩展清单
- `content.js` 内容脚本（各站点规则）
- `options.html/.css/.js` 选项页
- `popup.html/.css/.js` Popup 状态页

---

## <a id="en"></a>English

**Boundary** is a per‑site Chrome extension that blocks search‑box distractions (placeholder text, suggestion dropdowns, and browser autocomplete).

### Features
- Per‑site control
- Three toggles
  - Hide search box content (only hides placeholder; typed text remains visible)
  - Hide suggestion dropdown
  - Disable browser autocomplete (history/autofill)
- Popup status page to check current site and toggle quickly

### Supported Sites
- Bilibili `https://www.bilibili.com/*`
- Google Scholar `https://scholar.google.com/*`

### Planned Sites
- YouTube
- Weibo
- Zhihu

### Install & Use (Developer Mode)
1. Open `chrome://extensions/`
2. Enable “Developer mode”
3. Click “Load unpacked”
4. Select this folder: `Boundary/Boundary`
5. Open the popup or options page to configure
6. Refresh the target site after changes

### Icons
Extension icons are in the `icons/` directory.

### Structure
- `manifest.json` extension manifest
- `content.js` content script rules
- `options.html/.css/.js` options page
- `popup.html/.css/.js` popup page

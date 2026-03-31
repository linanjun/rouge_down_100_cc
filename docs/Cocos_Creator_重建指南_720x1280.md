# Cocos Creator 重建指南 720×1280

> 本文档描述 **rouge_down_100_cc** 项目（仙人洞府探秘 100 层）在 Cocos Creator 3.8.x 上的完整重建方案。
> 适用分辨率：720×1280 竖屏，策略：FIXED_WIDTH。

---

## 一、项目概述

| 项目 | 值 |
|------|-----|
| 引擎 | Cocos Creator 3.8.5 |
| 语言 | TypeScript |
| 设计分辨率 | 720 × 1280（9:16 竖屏） |
| 适配策略 | FIXED_WIDTH（锁宽自适应高） |
| 风格 | 深色像素风仙侠 |
| 场景文件 | `assets/scene.scene` |

---

## 二、目录结构

```
assets/
├── scripts/
│   ├── FrameworkPage.ts          # 720×1280 通用框架壳（顶栏/内容区/活动栏/底部导航）
│   ├── CommonPageShell.ts        # 每个总览页面自带的完整壳（顶栏+标题+内容+快捷+底部）
│   ├── CommonPageWidgets.ts      # 共享 UI 工具函数（createRoundedPanel / createPageLabel 等）
│   ├── GrottoExpeditionDemo.ts   # 主入口：AUTO_BOOT_ENTRY 控制启动模式
│   ├── OverviewPagesHub.ts       # 总览模式页面路由（创建所有页面节点，负责切换）
│   ├── OverviewPagesDataSource.ts# 所有游戏状态与业务逻辑（与 UI 解耦）
│   ├── RoleOverviewPage.ts       # 角色总览页
│   ├── FaqiOverviewPage.ts       # 法器总览页
│   ├── MijingOverviewPage.ts     # 秘境总览页
│   ├── DongtianOverviewPage.ts   # 洞天总览页
│   ├── FishingOverviewPage.ts    # 独钓总览页
│   ├── ShopOverviewPage.ts       # 商城总览页
│   ├── TaskOverviewPage.ts       # 任务总览页
│   ├── KungfuOverviewPage.ts     # 功法总览页
│   ├── AlchemyWorkshopPage.ts    # 炼丹/炼器总览页
│   └── SpiritPetOverviewPage.ts  # 灵宠总览页
├── resources/                    # 运行时可加载资源（resources.load）
│   └── art/generated/xianxia/   # 仙侠风格美术资源（PNG，已切 SpriteFrame）
└── scene.scene                   # 唯一场景文件
docs/
├── 美术风格与规范定义.md           # 美术规范主文档（唯一事实源）
├── 秘境总设计.md                   # 秘境系统设计
├── 精英秘境玩法设计.md              # 精英秘境设计
├── 仙侠图标生成提示词清单.md        # AI 图标生成提示词
└── Cocos_Creator_重建指南_720x1280.md  # 本文件
```

---

## 三、布局分区（720×1280）

```
┌────────────────────────────────────┐  y = +640 (顶)
│  TopBar  720×88  (深色顶栏)         │  y_center = +596
│  头像 | 名字+境界 | 金币 | 钻石      │
├────────────────────────────────────┤  gap = 8px
│                                    │
│  Content  696×940  (内容区)         │  y_center = +74
│  由各页面填充，圆角面板              │
│                                    │
├────────────────────────────────────┤  gap = 8px
│  ShortcutRow  704×120  (活动栏)     │  y_center = −478
│  任务|商城|炼丹|炼器|功法|灵宠       │
├────────────────────────────────────┤  gap = 8px
│  BottomBar  720×108  (主导航)       │  y_center = −586
│  法器 | 角色 | 秘境 | 洞天 | 独钓   │
└────────────────────────────────────┘  y = −640 (底)
```

> 实际内容区高度 = 1280 − 88 − 8 − 120 − 8 − 108 − 8 = **940px**，宽度 = 720 − 24 = **696px**。

---

## 四、TypeScript 模块职责

### 4.1 GrottoExpeditionDemo.ts（主入口）

- 通过 `AUTO_BOOT_ENTRY` 常量控制启动模式：
  - `'overview'`：挂载 `OverviewPagesHub`（局外总览模式，当前默认）
  - `'grotto'`：挂载 `GrottoExpeditionDemo`（洞府探秘战斗模式）
- 在 `Director.EVENT_AFTER_SCENE_LAUNCH` 和 `setTimeout(fn, 0)` 双重保险挂载到 `Canvas`。
- 节点名：`OverviewPagesRoot`（overview 模式）或 `DemoRoot`（grotto 模式）。

```ts
// 切换入口示例（在文件顶部修改此常量）
const AUTO_BOOT_ENTRY: 'grotto' | 'overview' = 'overview';
```

### 4.2 OverviewPagesHub.ts（页面路由）

- 持有所有页面节点的 Map（`pageNodes: Map<OverviewPageId, Node>`）。
- `buildPages()` 负责创建所有页面节点并添加各自的 Page 组件。
- `switchPage(id)` 控制哪个页面节点 `active = true`。
- 绑定页面事件（`bindCommonEvents` / `bindPageEvents`）转发到 `OverviewPagesDataSource`。
- `dataSource.attachViews(...)` 将所有页面实例传给数据源，数据源刷新 UI 时调用页面方法。

### 4.3 OverviewPagesDataSource.ts（数据与逻辑）

- 纯业务类（不 extends Component，不持有 Node）。
- 持有全部游戏状态：灵石、秘晶、修为等级、法器、秘境、洞天建筑、功法、灵宠……
- 对外暴露以下入口：
  - `setNavigator(fn)` / `attachViews(views)` / `refreshAllPages()`
  - `handle*Click(...)` 系列方法处理各页面按钮事件
- `refresh*Page()` 系列方法将状态转为纯数据对象后调用对应 Page 的 `setData` / `set*` 方法。

### 4.4 CommonPageShell.ts（每页通用壳）

每个总览页都通过 `this.shell = this.node.addComponent(CommonPageShell)` 初始化壳。

壳结构（从上到下）：

| 区域 | 高度 | y_center（根节点为 720×1280） |
|------|------|------|
| TopBar（顶部资源栏） | 86px | H/2 − 54 |
| Header（标题行） | 66px | H/2 − 148 |
| Content（内容区） | 动态 | 居中 |
| ShortcutRow（快捷活动栏） | 108px | −H/2 + 146 |
| BottomBar（底部导航） | 84px | −H/2 + 44 |

壳提供的公开方法：

```ts
shell.getContentRoot(): Node          // 获取内容区节点
shell.setTitle(title, subtitle?)      // 更新标题文字
shell.setCurrencyValues(left, right)  // 更新金/钻显示
shell.selectShortcut(id)              // 高亮快捷栏某项
shell.selectBottomTab(id)             // 高亮底部导航某项
```

壳通过 Node 事件冒泡与路由通信：
- `this.node.emit('common-page-tab-click', tabId)` → 路由切换页面
- `this.node.emit('common-page-shortcut-click', shortcutId)` → 路由切换快捷功能

### 4.5 CommonPageWidgets.ts（共享绘制工具）

```ts
createRoundedPanel(parent, w, h, pos, fill, stroke, radius)  // 圆角面板
repaintRoundedPanel(node, fill, stroke, radius)               // 重绘圆角面板
createPageLabel(parent, text, fontSize, pos, color, width)   // 标签
```

### 4.6 FrameworkPage.ts（新架构参考壳）

> FrameworkPage 是面向未来的统一框架组件，当前不自动挂载（`mountFrameworkPage()` 须手动调用）。
> 当前主流程由 GrottoExpeditionDemo.ts 驱动；FrameworkPage 作为架构参考和未来迁移基础保留。

特性：
- 提供 `getContentRoot(): Node | null` 供外部向内容区注入子节点。
- 颜色体系与 CommonPageShell 对齐（深色仙侠像素风）。
- 支持 `SAFE_TOP` / `SAFE_BOTTOM` 刘海/Home 条适配。

---

## 五、各页面规格

### 5.1 角色总览页（RoleOverviewPage）

| 区域 | 内容 |
|------|------|
| 法器展示区 | 飞剑槽 / 护符槽 / 灵灯槽，各槽显示名称、等级、碎片 |
| 角色立绘区 | 占位色块（预留 280×400）或实际角色图 |
| 属性区 | 气血 / 法力 / 行动力 |
| 修为进度区 | 当前境界、经验进度、突破按钮 |

关键事件：
- `'role-artifact-click'` (slot: FaqiSlot) → 打开法器页并定位到该槽
- `'role-breakthrough-click'` → 消耗资源触发境界突破

### 5.2 法器总览页（FaqiOverviewPage）

| 区域 | 内容 |
|------|------|
| 槽位切换 Tab | sword / talisman / lamp |
| 装备详情区 | 当前槽位已装备法器属性 |
| 法器卡列表 | 该槽所有法器卡，可选中切换 |
| 操作按钮区 | 装备 / 升级 / 突破星级 |

### 5.3 秘境总览页（MijingOverviewPage）

| 区域 | 内容 |
|------|------|
| 模式切换 | 普通秘境 / 精英秘境 |
| 秘境卡列表 | 当前境界可进入的秘境，含推荐战力 / 最深记录 |
| 宝箱里程碑 | 5 / 10 / 15 层奖励进度 |
| 进入按钮 | 检查次数、消耗并切换到探索视图 |

### 5.4 洞天总览页（DongtianOverviewPage）

| 区域 | 内容 |
|------|------|
| Tab | 洞府（建筑）/ 功勋（任务 + 商店）|
| 建筑卡 | 清心台 / 丹火室 / 百炼台 / 护山大阵，各含升级按钮 |
| 功勋任务 | 日常 / 周常任务及领取进度 |
| 功勋商店 | 消耗功勋购买资源 |

### 5.5 独钓总览页（FishingOverviewPage）

| 区域 | 内容 |
|------|------|
| 绑定槽位区 | 1~4 个钓鱼槽，已绑定 / 待绑定 / 未解锁 |
| 目标列表 | 可绑定的修士目标，点击绑定到选中槽位 |
| 操作区 | 买鱼饵 / 升杆 / 抛竿 |

### 5.6 商城页（ShopOverviewPage）

| 区域 | 内容 |
|------|------|
| Tab | 日常 / 周常 / 秘境 / 钻石 |
| 商品卡列表 | 标题 / 价格 / 余量 / 购买按钮 |

### 5.7 任务页（TaskOverviewPage）

| 区域 | 内容 |
|------|------|
| Tab | 日常 / 周常 / 成就 / 主线 |
| 任务行列表 | 进度 / 奖励 / 领取/跳转按钮 |

### 5.8 功法页（KungfuOverviewPage）

| 区域 | 内容 |
|------|------|
| 详情区 | 当前选中功法名、效果描述、运转状态 |
| 功法卡列表 | 所有已习得功法，可切换主修 |
| 操作按钮 | 切为主修 / 升阶 |

### 5.9 炼丹/炼器页（AlchemyWorkshopPage）

| Tab | 功能 |
|-----|------|
| 炼丹炉 | 选择配方开炉，消耗灵草/灵石 |
| 炼器台 | 选择配方开炉，消耗矿材 |
| 配方册 | 查看所有配方及解锁状态 |
| 储物阁 | 当前库存材料与成品 |

### 5.10 灵宠页（SpiritPetOverviewPage）

| 区域 | 内容 |
|------|------|
| 详情区 | 当前选中灵宠名、效果描述、出战状态 |
| 灵宠卡列表 | 所有灵宠，可切换出战目标 |
| 操作按钮 | 设为出战 / 养成 |

---

## 六、页面切换流程

```
用户点击 BottomBar 某按钮
    ↓
CommonPageShell.buildBottomTabs() 触发 emit('common-page-tab-click', tabId)
    ↓
OverviewPagesHub.bindCommonEvents() 接收，调用 dataSource.handleCommonTabClick(tabId)
    ↓
OverviewPagesDataSource.handleCommonTabClick() 调用 navigator(pageId)
    ↓
OverviewPagesHub.switchPage(pageId) 把对应节点设为 active
    ↓
页面节点 onEnable() → 如果有懒加载逻辑则此时加载
```

用户点击 ShortcutRow 某按钮（任务/商城/炼丹/炼器/功法/灵宠）：
```
emit('common-page-shortcut-click', shortcutId)
    ↓
dataSource.handleCommonShortcutClick(shortcutId)
    ↓
navigator 切换到对应 pageId
```

---

## 七、数据流

```
OverviewPagesDataSource（状态中心）
    ↑ 用户事件（handle*Click）
    ↓ 刷新视图（refresh*Page → page.set*）
    
每个 Page 组件只负责：
  1. 根据传入纯数据对象重绘 UI
  2. 捕获用户交互，emit 事件冒泡给 Hub
  3. 不持有任何游戏状态
```

---

## 八、重建步骤清单

以下为从零开始重建的最小步骤：

- [x] 创建 `assets/scene.scene`（含 Canvas 节点，无其他子节点）
- [x] 创建 `assets/scripts/FrameworkPage.ts`（通用壳，含 `mountFrameworkPage()` 工具函数）
- [x] 创建 `assets/scripts/CommonPageWidgets.ts`（共享绘制工具）
- [x] 创建 `assets/scripts/CommonPageShell.ts`（每页完整壳）
- [x] 创建 `assets/scripts/OverviewPagesDataSource.ts`（游戏状态与逻辑）
- [x] 创建 `assets/scripts/OverviewPagesHub.ts`（页面路由）
- [x] 创建各个 Page TS 文件（RoleOverviewPage / FaqiOverviewPage / MijingOverviewPage / DongtianOverviewPage / FishingOverviewPage / ShopOverviewPage / TaskOverviewPage / KungfuOverviewPage / AlchemyWorkshopPage / SpiritPetOverviewPage）
- [x] 创建 `assets/scripts/GrottoExpeditionDemo.ts`（主入口，设置 AUTO_BOOT_ENTRY）
- [x] 所有 `.ts` 文件对应 `.meta` 文件已创建（Cocos Creator 识别用）
- [ ] 美术资源放置到 `assets/resources/art/generated/xianxia/`，并按规范切 SpriteFrame

---

## 九、美术资源挂载规范

> 详见 `docs/美术风格与规范定义.md` 第五章至第八章。

关键规则：
1. 所有运行时图片放 `assets/resources/art/generated/xianxia/`，路径在代码里硬写。
2. 每张图需有配套 `.meta`，`importer: "image"` + `subMetas.xxx.importer: "sprite-frame"`。
3. 加载方式：`resources.load('art/generated/xianxia/xxx/spriteFrame', SpriteFrame, cb)`。
4. 图标命名规则：`icon-{类型}-{名称}`，面板命名：`ui-{类型}-{名称}`，按钮：`btn-{名称}`。

---

## 十、常见问题

### Q: 场景加载后看不到任何内容？
A: 确认 `GrottoExpeditionDemo.ts` 的 `.meta` 文件存在且 UUID 与场景 JSON 中引用一致。引擎通过 UUID 识别脚本组件，UUID 不对会报 Error 5302。

### Q: 两套 UI 同时显示（FrameworkRoot + OverviewPagesRoot 叠加）？
A: `FrameworkPage.ts` 已改为手动调用 `mountFrameworkPage()`，不再自动挂载。检查是否有代码误调用了它。

### Q: 切换页面后上一页内容仍显示？
A: `OverviewPagesHub.switchPage()` 通过 `node.active` 控制显隐。若子节点有 onEnable/onDisable 逻辑但节点未正确设置 active，需检查父节点层级。

### Q: `resources.load` 图片加载失败（TypeError）？
A: 检查 `.meta` 文件中 `subMetas` 路径是否正确，以及图片是否放在 `assets/resources/` 路径下（而非 `assets/icons/` 等非 resources 目录）。

---

## 十一、版本历史

| 日期 | 内容 |
|------|------|
| 2026-03 | 初稿：基于 0b24378 拆分后的代码架构整理为本指南 |

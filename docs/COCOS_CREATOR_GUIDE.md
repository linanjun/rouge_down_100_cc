# 像素风格RPG修仙游戏 - Cocos Creator 重制指南

## 📋 项目概述

这是一个专为移植到 Cocos Creator 设计的像素风格RPG武侠修仙游戏角色界面，采用纯扁平化设计，无渐变、圆角和阴影效果。

### 🎯 核心特性

- **屏幕尺寸**: 720x1280 竖屏手机游戏布局
- **设计风格**: 深色调石板灰 + 金黄色边框的复古像素艺术风格
- **布局方式**: Flexbox 自适应布局，底部导航栏自动沉底
- **颜色方案**: 纯色填充，禁用渐变、圆角、阴影

---

## 🎨 设计规范

### 配色系统

#### 主色调
- **背景色**: `#1e293b` (slate-800), `#0f172a` (slate-900)
- **边框色**: `#f59e0b` (amber-500), `#fbbf24` (amber-400), `#b45309` (amber-700)
- **容器色**: `#78350f` (amber-900), `#451a03` (amber-950)

#### 功能色
- **成功/进行中**: `#16a34a` (green-600), `#166534` (green-700)
- **信息/普通**: `#2563eb` (blue-600), `#1e40af` (blue-700)
- **警告/困难**: `#ea580c` (orange-600), `#c2410c` (orange-700)
- **危险/噩梦**: `#dc2626` (red-600), `#b91c1c` (red-700)

#### 文字颜色
- **标题**: `#fef3c7` (amber-100), `#fde68a` (amber-200)
- **正文**: `#fbbf24` (amber-400), `#d1d5db` (slate-300)
- **辅助**: `#94a3b8` (slate-400)

### 边框规范

- **主边框**: 4px 实线
- **次边框**: 3px 实线
- **细边框**: 2px 实线
- **分隔线**: 1px 实线

### 尺寸规范

- **容器内边距**: 16px (p-4), 12px (p-3), 8px (p-2)
- **间距**: 16px (gap-4), 12px (gap-3), 8px (gap-2)
- **图标尺寸**: 24x24px (常规), 32x32px (大号)
- **按钮高度**: 最小 40px
- **输入框高度**: 最小 36px

---

## 📱 页面架构

### 全局布局组件

#### 1. RootLayout (根布局)
**文件**: `/src/app/layouts/RootLayout.tsx`
**容器尺寸**: 720x1280px 固定
**结构**:
```
┌─────────────────────────┐
│   TopBar (顶部栏)       │ 固定高度
├─────────────────────────┤
│   NavigationBar         │ 固定高度
│   (功能导航栏)          │
├─────────────────────────┤
│                         │
│   Content Area          │ flex-1 自适应
│   (页面内容区)          │
│                         │
├─────────────────────────┤
│   BottomNavBar          │ 固定高度
│   (底部标签栏)          │
└─────────────────────────┘
```

#### 2. TopBar (顶部栏)
**文件**: `/src/app/components/TopBar.tsx`
**功能**:
- 角色头像 (左侧)
- 角色名称显示（足够宽度）
- 境界显示（足够宽度）
- 金币显示（足够宽度）
- 钻石显示（足够宽度）

**布局**: 横向 Flex，左侧头像，右侧资源栏竖向排列

#### 3. NavigationBar (功能导航栏)
**文件**: `/src/app/components/NavigationBar.tsx`
**功能**: 6个功能按钮，点击跳转对应页面
**布局**: Grid 6列

**导航项**:
1. 任务 (FileText图标) → `/task`
2. 商店 (Store图标) → `/shop`
3. 炼丹 (FlaskConical图标) → `/alchemy`
4. 炼器 (Trophy图标) → `/forge`
5. 功法 (BookOpen图标) → `/skill`
6. 灵宠 (Heart图标) → `/pet`

#### 4. BottomNavBar (底部标签栏)
**文件**: `/src/app/components/BottomNavBar.tsx`
**功能**: 5个主标签，带激活状态高亮
**布局**: Grid 5列

**标签项**:
1. 法器 (Sword图标) → `/weapon`
2. 独钓 (Fish图标) → `/fishing`
3. 角色 (User图标) → `/` (主页)
4. 秘境 (Sparkles图标) → `/secret`
5. 洞天 (Mountain图标) → `/cave`

---

## 📄 页面清单

### 主要页面 (12个)

| 序号 | 页面名称 | 路由路径 | 文件路径 | 图片资源 |
|------|---------|---------|---------|---------|
| 1 | 角色页面 | `/` | `/src/app/pages/CharacterPage.tsx` | - |
| 2 | 法器页面 | `/weapon` | `/src/app/pages/WeaponPage.tsx` | `法器.jpg` |
| 3 | 任务页面 | `/task` | `/src/app/pages/TaskPage.tsx` | `任务.jpg` |
| 4 | 商店页面 | `/shop` | `/src/app/pages/ShopPage.tsx` | `商店.jpg` |
| 5 | 炼丹页面 | `/alchemy` | `/src/app/pages/AlchemyPage.tsx` | `炼丹.jpg` |
| 6 | 炼器页面 | `/forge` | `/src/app/pages/ForgePage.tsx` | `炼器.jpg` |
| 7 | 功法页面 | `/skill` | `/src/app/pages/SkillPage.tsx` | `功法.jpg` |
| 8 | 灵宠页面 | `/pet` | `/src/app/pages/PetPage.tsx` | `灵宠.jpg` |
| 9 | 垂钓页面 | `/fishing` | `/src/app/pages/FishingPage.tsx` | `垂钓.jpg` |
| 10 | 洞天页面 | `/cave` | `/src/app/pages/CavePage.tsx` | `洞天.jpg` |
| 11 | 秘境页面 | `/secret` | `/src/app/pages/SecretPage.tsx` | `秘境.jpg` |
| 12 | 冒险页面 | `/adventure` | `/src/app/pages/AdventurePage.tsx` | `冒险-1.png` |

---

## 🎮 页面详细说明

### 1. 角色页面 (CharacterPage)
**主页，显示角色完整信息**

**区域划分**:
```
┌─────────────────────────┐
│  角色形象展示区          │
│  (带4个装备槽位)         │
├─────────────────────────┤
│  属性面板               │
│  - 战力、等级、经验      │
│  - 各项属性值           │
└─────────────────────────┘
```

**装备槽位**: 武器、防具、饰品、法宝（四角分布）
**属性显示**: 攻击、防御、速度、暴击等

---

### 2. 法器页面 (WeaponPage)
**展示当前装备的法器和法器列表**

**结构**:
1. 主图展示区 (200px高) - 显示 `法器.jpg`
2. 当前装备区 - 显示已装备法器
3. 法器列表 - Grid 2列，显示所有法器

**数据字段**:
- 法器名称
- 等级
- 攻击力
- 特殊属性

---

### 3. 任务页面 (TaskPage)
**任务大厅，显示所有任务**

**结构**:
1. 特色图片 (200px高) - 显示 `任务.jpg`
2. 任务列表

**任务状态**:
- 进行中 (蓝色)
- 可领取 (绿色)
- 未完成 (灰色)

**任务信息**:
- 任务名称
- 进度条 (当前/总数)
- 奖励内容
- 状态标签

---

### 4. 商店页面 (ShopPage)
**仙缘商店，购买道具**

**结构**:
1. 商店图片 (200px高) - 显示 `商店.jpg`
2. 商品列表 - Grid 2列

**商品信息**:
- 商品图标
- 商品名称
- 库存数量
- 价格（金币/钻石）
- 购买按钮

---

### 5. 炼丹页面 (AlchemyPage)
**炼丹房，炼制丹药**

**结构**:
1. 炼丹房图片 (200px高) - 显示 `炼丹.jpg`
2. 丹方列表

**丹药信息**:
- 丹药图标 (FlaskConical)
- 丹药名称
- 所需材料
- 炼制时间
- 炼制按钮

---

### 6. 炼器页面 (ForgePage)
**炼器坊，强化装备**

**结构**:
1. 炼器坊图片 (200px高) - 显示 `炼器.jpg`
2. 装备强化列表

**装备信息**:
- 装备图标 (Hammer)
- 装备名称
- 当前等级 → 下一级
- 所需材料
- 强化按钮

---

### 7. 功法页面 (SkillPage)
**功法阁，修炼功法**

**结构**:
1. 功法阁图片 (200px高) - 显示 `功法.jpg`
2. 已学功法列表

**功法信息**:
- 功法图标 (BookOpen)
- 功法名称
- 功法等级
- 功法类型（内功/剑法/身法/掌法）
- 威力加成
- 修炼按钮

---

### 8. 灵宠页面 (PetPage)
**灵宠园，管理灵宠**

**结构**:
1. 灵宠园图片 (200px高) - 显示 `灵宠.jpg`
2. 我的灵宠列表

**灵宠信息**:
- 灵宠图标 (Heart)
- 灵宠名称
- 灵宠等级
- 忠诚度进度条
- 战力加成
- 互动按钮

---

### 9. 垂钓页面 (FishingPage)
**垂钓台，钓鱼玩法**

**结构**:
1. 垂钓台图片 (220px高) - 显示 `垂钓.jpg`
2. 今日渔获列表
3. 开始垂钓按钮

**鱼类信息**:
- 鱼类图标 (Fish)
- 鱼类名称
- 重量
- 稀有度（星级显示）
- 价值

---

### 10. 洞天页面 (CavePage)
**洞天福地，建筑管理**

**结构**:
1. 洞天图片 (220px高) - 显示 `洞天.jpg`
2. 洞天建筑列表

**建筑信息**:
- 建筑图标 (Mountain)
- 建筑名称
- 建筑等级
- 产出内容
- 升级按钮

---

### 11. 秘境页面 (SecretPage)
**秘境探索，进入战斗**

**结构**:
1. 秘境图片 (200px高) - 显示 `秘境.jpg`
2. 秘境列表

**秘境信息**:
- 秘境图标 (Sparkles)
- 秘境名称
- 状态标签（已开启/未解锁）
- 等级要求
- 奖励内容
- 进入按钮

**交互**: 点击"进入"按钮 → 跳转到冒险页面 (`/adventure`)

---

### 12. 冒险页面 (AdventurePage)
**战斗界面，实时对战**

**结构**:
```
┌─────────────────────────┐
│  状态栏                  │
│  - 生命值 (红色)         │
│  - 法力值 (蓝色)         │
├─────────────────────────┤
│  战斗场景 (280px)        │
│  - 敌人信息 (左上)       │
│  - 玩家信息 (右下)       │
├─────────────────────────┤
│  战斗信息面板            │
│  - 第X波                │
│  - 已击杀/剩余/总波数    │
├─────────────────────────┤
│  技能操作区              │
│  - 技能1 (御剑术)        │
│  - 技能2 (金刚护体)      │
│  - 普通攻击 (大按钮)     │
├─────────────────────────┤
│  撤退按钮                │
└─────────────────────────┘
```

**战斗元素**:
- 背景图: `冒险-1.png`
- 生命值/法力值进度条
- 敌人/玩家信息卡（带血条）
- 波数统计
- 技能按钮（带冷却时间）
- 撤退按钮

---

## 🎨 通用 UI 组件

### 1. 四角装饰
**用途**: 页面内容区四个角落的装饰元素
**尺寸**: 12x12px
**边框**: 3px 金色

```css
位置: 距离边缘 6px
左上角: border-left + border-top
右上角: border-right + border-top
左下角: border-left + border-bottom
右下角: border-right + border-bottom
```

### 2. 标题横幅
**用途**: 页面/区块标题
**结构**: 中间文字 + 左右菱形装饰
**配色**: 根据页面主题色变化

```
◆════ 标题文字 ════◆
```

### 3. 背景纹理
**用途**: 容器内部装饰
**实现**: Grid 4列，小方块边框
**透明度**: 5% opacity

### 4. 进度条
**尺寸**: 高度 12px (大), 8px (中), 6px (小)
**结构**: 外层容器 + 内层填充
**边框**: 2px 实线

### 5. 按钮样式

#### 主按钮
- 背景色: 根据功能定义
- 边框: 3px 实线
- 内边距: 12px 16px
- 文字: 加粗

#### 次按钮
- 背景色: slate-700
- 边框: 2px 实线
- 内边距: 8px 12px

#### 禁用按钮
- 背景色: slate-700
- 边框: 2px slate-600
- 文字: slate-400
- 鼠标: 不可点击

### 6. 列表项
**结构**:
```
┌────┬──────────────────────┬──────┐
│图标│ 标题                  │按钮  │
│    │ 副标题/属性           │      │
└────┴──────────────────────┴──────┘
```

**尺寸**:
- 图标区: 64x64px
- 间距: 12px
- 内边距: 12px

---

## 🖼️ 资源文件清单

### 图片资源 (位于 `/src/imports/`)

| 文件名 | 用途 | 尺寸建议 |
|--------|------|---------|
| `法器.jpg` | 法器页面主图 | 适配容器宽度 |
| `任务.jpg` | 任务页面主图 | 适配容器宽度 |
| `商店.jpg` | 商店页面主图 | 适配容器宽度 |
| `炼丹.jpg` | 炼丹页面主图 | 适配容器宽度 |
| `炼器.jpg` | 炼器页面主图 | 适配容器宽度 |
| `功法.jpg` | 功法页面主图 | 适配容器宽度 |
| `灵宠.jpg` | 灵宠页面主图 | 适配容器宽度 |
| `垂钓.jpg` | 垂钓页面主图 | 适配容器宽度 |
| `洞天.jpg` | 洞天页面主图 | 适配容器宽度 |
| `秘境.jpg` | 秘境页面主图 | 适配容器宽度 |
| `冒险.png` | 冒险页面图标 | 64x64px |
| `冒险-1.png` | 冒险战斗背景 | 适配容器宽度 |

### 图标资源 (使用 Lucide Icons)

**系统图标**:
- `User` - 角色/人物
- `Coins` - 金币
- `Gem` - 钻石

**导航图标**:
- `FileText` - 任务
- `Store` - 商店
- `FlaskConical` - 炼丹
- `Trophy/Hammer` - 炼器
- `BookOpen` - 功法
- `Heart` - 灵宠

**标签图标**:
- `Sword` - 法器
- `Fish` - 垂钓
- `Mountain` - 洞天
- `Sparkles` - 秘境
- `Swords` - 冒险

**战斗图标**:
- `Heart` - 生命值
- `Zap` - 法力值/技能
- `Shield` - 防御/护盾
- `CheckSquare` - 任务完成
- `Clock` - 时间
- `Star` - 星级
- `ShoppingCart` - 购物

---

## 🔧 Cocos Creator 移植步骤

### 阶段一: 项目准备

#### 1.1 创建项目
1. 打开 Cocos Creator
2. 新建项目，选择空白模板
3. 设置画布尺寸: 720x1280
4. 设置适配模式: SHOW_ALL 或 FIXED_HEIGHT

#### 1.2 导入资源
1. 创建资源文件夹结构:
   ```
   assets/
   ├── images/          # 图片资源
   ├── prefabs/         # 预制体
   ├── scenes/          # 场景
   ├── scripts/         # 脚本
   └── styles/          # 样式配置
   ```

2. 导入所有图片资源到 `images/` 文件夹
3. 设置图片类型为 Sprite

#### 1.3 创建样式配置
创建 `ColorConfig.ts` 存储所有颜色常量:

```typescript
export const Colors = {
  // 背景色
  BG_DARK: '#0f172a',
  BG_MEDIUM: '#1e293b',
  
  // 边框色
  BORDER_GOLD: '#f59e0b',
  BORDER_GOLD_LIGHT: '#fbbf24',
  BORDER_GOLD_DARK: '#b45309',
  
  // 容器色
  CONTAINER_DARK: '#78350f',
  CONTAINER_DARKER: '#451a03',
  
  // 文字色
  TEXT_TITLE: '#fef3c7',
  TEXT_PRIMARY: '#fbbf24',
  TEXT_SECONDARY: '#94a3b8',
  
  // 功能色
  SUCCESS: '#16a34a',
  INFO: '#2563eb',
  WARNING: '#ea580c',
  DANGER: '#dc2626',
};
```

---

### 阶段二: UI 组件开发

#### 2.1 创建基础组件

##### 容器组件 (Container)
- **用途**: 带边框和背景的通用容器
- **属性**: 
  - 背景色
  - 边框色
  - 边框宽度
  - 内边距
  - 是否显示纹理

##### 按钮组件 (PixelButton)
- **用途**: 像素风格按钮
- **属性**:
  - 按钮类型 (主按钮/次按钮)
  - 按钮状态 (正常/悬停/禁用)
  - 按钮文字
  - 按钮颜色
  - 图标 (可选)

##### 进度条组件 (ProgressBar)
- **用途**: 显示各种进度
- **属性**:
  - 当前值
  - 最大值
  - 进度条颜色
  - 背景色
  - 是否显示数字

##### 列表项组件 (ListItem)
- **用途**: 通用列表项
- **属性**:
  - 图标
  - 标题
  - 副标题
  - 标签（可选）
  - 按钮（可选）

#### 2.2 创建布局组件

##### TopBar (顶部栏)
**节点结构**:
```
TopBar [Layout: Horizontal]
├── AvatarArea [Widget: left]
│   └── Avatar [Sprite]
├── InfoArea [Layout: Vertical]
│   ├── NameContainer
│   │   ├── NameLabel
│   │   └── RealmLabel
│   └── ResourceContainer [Layout: Horizontal]
│       ├── GoldArea
│       │   ├── GoldIcon
│       │   └── GoldLabel
│       └── DiamondArea
│           ├── DiamondIcon
│           └── DiamondLabel
```

**脚本属性**:
```typescript
@ccclass('TopBar')
export class TopBar extends Component {
  @property(Label)
  nameLabel: Label = null;
  
  @property(Label)
  realmLabel: Label = null;
  
  @property(Label)
  goldLabel: Label = null;
  
  @property(Label)
  diamondLabel: Label = null;
  
  updatePlayerInfo(name: string, realm: string, gold: number, diamond: number) {
    this.nameLabel.string = name;
    this.realmLabel.string = realm;
    this.goldLabel.string = gold.toString();
    this.diamondLabel.string = diamond.toString();
  }
}
```

##### NavigationBar (功能导航栏)
**节点结构**:
```
NavigationBar [Layout: Grid, columns: 6]
├── NavButton_Task
├── NavButton_Shop
├── NavButton_Alchemy
├── NavButton_Forge
├── NavButton_Skill
└── NavButton_Pet
```

**脚本**:
```typescript
@ccclass('NavigationBar')
export class NavigationBar extends Component {
  @property([Node])
  navButtons: Node[] = [];
  
  onNavButtonClicked(event: Event, customData: string) {
    // 触发场景切换事件
    this.node.emit('navigate', customData);
  }
}
```

##### BottomNavBar (底部标签栏)
**节点结构**:
```
BottomNavBar [Layout: Grid, columns: 5]
├── TabButton_Weapon
├── TabButton_Fishing
├── TabButton_Character (默认激活)
├── TabButton_Secret
└── TabButton_Cave
```

**脚本**:
```typescript
@ccclass('BottomNavBar')
export class BottomNavBar extends Component {
  @property([Node])
  tabButtons: Node[] = [];
  
  private currentTab: number = 2; // 默认角色页
  
  onTabClicked(event: Event, tabIndex: string) {
    const index = parseInt(tabIndex);
    this.setActiveTab(index);
    this.node.emit('tab-changed', index);
  }
  
  setActiveTab(index: number) {
    // 更新按钮激活状态
    this.tabButtons.forEach((btn, i) => {
      btn.getComponent(Sprite).color = i === index 
        ? new Color().fromHEX(Colors.BORDER_GOLD)
        : new Color().fromHEX(Colors.BG_MEDIUM);
    });
    this.currentTab = index;
  }
}
```

---

### 阶段三: 页面场景开发

#### 3.1 场景结构规范

每个页面场景统一使用以下结构:

```
PageScene
├── Canvas [Canvas Component]
│   ├── TopBar [Prefab Instance]
│   ├── NavigationBar [Prefab Instance]
│   ├── ContentArea [ScrollView]
│   │   └── PageContent [根据页面定制]
│   └── BottomNavBar [Prefab Instance]
```

#### 3.2 页面脚本基类

```typescript
@ccclass('BasePage')
export class BasePage extends Component {
  @property(TopBar)
  topBar: TopBar = null;
  
  @property(NavigationBar)
  navigationBar: NavigationBar = null;
  
  @property(BottomNavBar)
  bottomNavBar: BottomNavBar = null;
  
  @property(Node)
  contentArea: Node = null;
  
  onLoad() {
    this.registerEvents();
    this.initPage();
  }
  
  registerEvents() {
    this.navigationBar.node.on('navigate', this.onNavigate, this);
    this.bottomNavBar.node.on('tab-changed', this.onTabChanged, this);
  }
  
  onNavigate(pageName: string) {
    // 跳转到指定页面
    director.loadScene(pageName);
  }
  
  onTabChanged(tabIndex: number) {
    // 跳转到对应标签页
    const scenes = ['CharacterPage', 'WeaponPage', 'FishingPage', 'SecretPage', 'CavePage'];
    director.loadScene(scenes[tabIndex]);
  }
  
  initPage() {
    // 子类重写此方法进行页面初始化
  }
}
```

#### 3.3 示例: 角色页面实现

**场景节点结构**:
```
CharacterPage
├── Canvas
│   ├── TopBar [Prefab]
│   ├── NavigationBar [Prefab]
│   ├── ContentArea [ScrollView]
│   │   └── Content
│   │       ├── CharacterDisplay
│   │       │   ├── CharacterSprite
│   │       │   ├── EquipSlot_Weapon (左上)
│   │       │   ├── EquipSlot_Armor (右上)
│   │       │   ├── EquipSlot_Accessory (左下)
│   │       │   └── EquipSlot_Treasure (右下)
│   │       └── AttributePanel
│   │           ├── PowerDisplay
│   │           ├── LevelDisplay
│   │           ├── ExpProgressBar
│   │           └── AttributeList
│   └── BottomNavBar [Prefab]
```

**脚本实现**:
```typescript
@ccclass('CharacterPage')
export class CharacterPage extends BasePage {
  @property(Label)
  powerLabel: Label = null;
  
  @property(Label)
  levelLabel: Label = null;
  
  @property(ProgressBar)
  expProgressBar: ProgressBar = null;
  
  @property([Label])
  attributeLabels: Label[] = [];
  
  initPage() {
    this.loadCharacterData();
  }
  
  loadCharacterData() {
    // 从数据管理器加载角色数据
    const data = DataManager.getInstance().getCharacterData();
    
    this.powerLabel.string = data.power.toString();
    this.levelLabel.string = `Lv.${data.level}`;
    this.expProgressBar.progress = data.exp / data.maxExp;
    
    // 更新属性显示
    this.attributeLabels[0].string = `攻击: ${data.attack}`;
    this.attributeLabels[1].string = `防御: ${data.defense}`;
    // ... 其他属性
  }
}
```

#### 3.4 示例: 列表页面实现 (任务页面)

**场景节点结构**:
```
TaskPage
├── Canvas
│   ├── TopBar [Prefab]
│   ├── NavigationBar [Prefab]
│   ├── ContentArea [ScrollView]
│   │   └── Content
│   │       ├── TitleBanner
│   │       ├── FeaturedImage [Sprite: 任务.jpg]
│   │       └── TaskListContainer
│   │           └── TaskList [Layout: Vertical]
│   └── BottomNavBar [Prefab]
```

**脚本实现**:
```typescript
@ccclass('TaskPage')
export class TaskPage extends BasePage {
  @property(Prefab)
  taskItemPrefab: Prefab = null;
  
  @property(Node)
  taskListContainer: Node = null;
  
  initPage() {
    this.loadTaskList();
  }
  
  loadTaskList() {
    const tasks = DataManager.getInstance().getTaskList();
    
    tasks.forEach(task => {
      const item = instantiate(this.taskItemPrefab);
      const itemScript = item.getComponent(TaskItem);
      
      itemScript.setData({
        name: task.name,
        reward: task.reward,
        status: task.status,
        progress: task.progress,
        total: task.total
      });
      
      // 注册领取按钮事件
      if (task.status === '可领取') {
        itemScript.onClaimClicked = () => this.claimTask(task.id);
      }
      
      this.taskListContainer.addChild(item);
    });
  }
  
  claimTask(taskId: number) {
    // 处理任务领取逻辑
    DataManager.getInstance().claimTask(taskId);
    // 刷新列表
    this.refreshTaskList();
  }
}
```

#### 3.5 示例: 战斗页面实现 (冒险页面)

**场景节点结构**:
```
AdventurePage
├── Canvas
│   ├── StatusBar
│   │   ├── HPBar [ProgressBar]
│   │   └── MPBar [ProgressBar]
│   ├── BattleScene [Sprite: 冒险-1.png]
│   │   ├── EnemyInfo (左上角)
│   │   │   ├── EnemyName
│   │   │   └── EnemyHPBar
│   │   └── PlayerInfo (右下角)
│   │       ├── PlayerName
│   │       └── PlayerHPBar
│   ├── BattleInfo
│   │   ├── WaveDisplay
│   │   └── StatsGrid [Layout: Grid 3列]
│   │       ├── KilledCount
│   │       ├── RemainingCount
│   │       └── TotalWaves
│   ├── ActionButtons
│   │   ├── Skill1Button (御剑术)
│   │   ├── Skill2Button (金刚护体)
│   │   └── AttackButton (普通攻击)
│   └── RetreatButton
```

**脚本实现**:
```typescript
@ccclass('AdventurePage')
export class AdventurePage extends Component {
  @property(ProgressBar)
  playerHPBar: ProgressBar = null;
  
  @property(ProgressBar)
  playerMPBar: ProgressBar = null;
  
  @property(ProgressBar)
  enemyHPBar: ProgressBar = null;
  
  @property(Label)
  waveLabel: Label = null;
  
  @property([Node])
  skillButtons: Node[] = [];
  
  private currentWave: number = 1;
  private maxWave: number = 5;
  
  onLoad() {
    this.initBattle();
    this.registerEvents();
  }
  
  initBattle() {
    // 初始化战斗数据
    const battleData = DataManager.getInstance().getCurrentBattle();
    
    this.updatePlayerStatus(battleData.player);
    this.updateEnemyStatus(battleData.enemy);
    this.updateWaveInfo(battleData.wave);
  }
  
  registerEvents() {
    // 注册技能按钮事件
    this.skillButtons.forEach((btn, index) => {
      btn.on(Node.EventType.TOUCH_END, () => this.useSkill(index), this);
    });
  }
  
  useSkill(skillIndex: number) {
    // 执行技能逻辑
    const result = BattleManager.getInstance().useSkill(skillIndex);
    
    // 更新UI
    this.updateBattleStatus(result);
    
    // 开始技能冷却
    this.startSkillCooldown(skillIndex, result.cooldown);
  }
  
  startSkillCooldown(skillIndex: number, duration: number) {
    const button = this.skillButtons[skillIndex];
    button.getComponent(Button).interactable = false;
    
    // 倒计时显示
    this.schedule(() => {
      duration--;
      // 更新冷却时间显示
      if (duration <= 0) {
        button.getComponent(Button).interactable = true;
      }
    }, 1, duration, 0);
  }
  
  updatePlayerStatus(playerData: any) {
    this.playerHPBar.progress = playerData.hp / playerData.maxHP;
    this.playerMPBar.progress = playerData.mp / playerData.maxMP;
  }
  
  updateEnemyStatus(enemyData: any) {
    this.enemyHPBar.progress = enemyData.hp / enemyData.maxHP;
  }
  
  updateWaveInfo(waveData: any) {
    this.waveLabel.string = `第 ${waveData.current} 波`;
    this.currentWave = waveData.current;
  }
  
  onRetreatClicked() {
    // 返回秘境页面
    director.loadScene('SecretPage');
  }
}
```

---

### 阶段四: 数据管理

#### 4.1 数据管理器

创建单例数据管理器处理所有游戏数据:

```typescript
export class DataManager {
  private static instance: DataManager = null;
  
  // 玩家数据
  private playerData = {
    name: '剑仙·逍遥',
    realm: '金丹期',
    level: 10,
    exp: 8500,
    maxExp: 10000,
    gold: 99999,
    diamond: 888,
    power: 12580,
    attack: 850,
    defense: 620,
    speed: 75,
    crit: 45,
    // ... 其他属性
  };
  
  // 任务数据
  private taskList = [
    {
      id: 1,
      name: '击败妖兽',
      reward: '经验+100',
      status: '进行中',
      progress: 5,
      total: 10
    },
    // ... 其他任务
  ];
  
  // 法器数据
  private weaponList = [
    {
      id: 1,
      name: '紫霄剑',
      level: 10,
      attack: 350,
      special: '雷霆一击',
      equipped: true
    },
    // ... 其他法器
  ];
  
  static getInstance(): DataManager {
    if (!this.instance) {
      this.instance = new DataManager();
    }
    return this.instance;
  }
  
  getPlayerData() {
    return { ...this.playerData };
  }
  
  getTaskList() {
    return [...this.taskList];
  }
  
  getWeaponList() {
    return [...this.weaponList];
  }
  
  claimTask(taskId: number) {
    const task = this.taskList.find(t => t.id === taskId);
    if (task && task.status === '可领取') {
      // 发放奖励
      // 更新任务状态
      task.status = '已完成';
    }
  }
  
  // ... 其他数据操作方法
}
```

#### 4.2 战斗管理器

```typescript
export class BattleManager {
  private static instance: BattleManager = null;
  
  private currentBattle = {
    player: {
      hp: 800,
      maxHP: 1000,
      mp: 300,
      maxMP: 500,
      attack: 850
    },
    enemy: {
      name: '魔族先锋',
      hp: 450,
      maxHP: 1000,
      attack: 600
    },
    wave: {
      current: 3,
      killed: 12,
      remaining: 3,
      total: 5
    }
  };
  
  static getInstance(): BattleManager {
    if (!this.instance) {
      this.instance = new BattleManager();
    }
    return this.instance;
  }
  
  getCurrentBattle() {
    return { ...this.currentBattle };
  }
  
  useSkill(skillIndex: number) {
    // 技能逻辑
    let damage = 0;
    let mpCost = 0;
    let cooldown = 0;
    
    switch (skillIndex) {
      case 0: // 御剑术
        damage = this.currentBattle.player.attack * 1.5;
        mpCost = 50;
        cooldown = 2;
        break;
      case 1: // 金刚护体
        // 增加护盾逻辑
        mpCost = 100;
        cooldown = 10;
        break;
    }
    
    // 扣除法力
    this.currentBattle.player.mp -= mpCost;
    
    // 造成伤害
    this.currentBattle.enemy.hp -= damage;
    
    // 检查战斗结果
    if (this.currentBattle.enemy.hp <= 0) {
      this.onEnemyDefeated();
    }
    
    return {
      damage,
      cooldown,
      player: this.currentBattle.player,
      enemy: this.currentBattle.enemy
    };
  }
  
  onEnemyDefeated() {
    this.currentBattle.wave.killed++;
    this.currentBattle.wave.remaining--;
    
    if (this.currentBattle.wave.remaining === 0) {
      this.nextWave();
    } else {
      this.spawnEnemy();
    }
  }
  
  nextWave() {
    this.currentBattle.wave.current++;
    // 生成新一波敌人
  }
  
  spawnEnemy() {
    // 生成新敌人
    this.currentBattle.enemy = {
      name: '魔族先锋',
      hp: 1000,
      maxHP: 1000,
      attack: 600
    };
  }
}
```

---

### 阶段五: 优化与调试

#### 5.1 性能优化

1. **对象池使用**
   - 列表项使用对象池复用
   - 特效使用对象池

2. **图片资源优化**
   - 使用 Sprite Atlas 合并图片
   - 压缩大图资源

3. **渲染优化**
   - 使用 Batch 减少 DrawCall
   - 避免频繁的 Layout 计算

#### 5.2 适配处理

```typescript
@ccclass('AdaptiveLayout')
export class AdaptiveLayout extends Component {
  onLoad() {
    this.adaptToScreen();
  }
  
  adaptToScreen() {
    const canvas = this.node.getComponent(Canvas);
    const designSize = new Size(720, 1280);
    
    canvas.designResolution = designSize;
    canvas.fitHeight = true;
    canvas.fitWidth = true;
  }
}
```

#### 5.3 调试工具

创建调试面板方便测试:

```typescript
@ccclass('DebugPanel')
export class DebugPanel extends Component {
  @property(EditBox)
  goldInput: EditBox = null;
  
  @property(EditBox)
  levelInput: EditBox = null;
  
  onAddGold() {
    const amount = parseInt(this.goldInput.string);
    DataManager.getInstance().addGold(amount);
  }
  
  onSetLevel() {
    const level = parseInt(this.levelInput.string);
    DataManager.getInstance().setLevel(level);
  }
  
  onResetData() {
    DataManager.getInstance().reset();
  }
}
```

---

## 📝 移植检查清单

### UI 组件
- [ ] TopBar - 顶部栏
- [ ] NavigationBar - 功能导航栏
- [ ] BottomNavBar - 底部标签栏
- [ ] PixelButton - 像素按钮
- [ ] ProgressBar - 进度条
- [ ] ListItem - 列表项
- [ ] Container - 通用容器

### 页面场景
- [ ] CharacterPage - 角色页面
- [ ] WeaponPage - 法器页面
- [ ] TaskPage - 任务页面
- [ ] ShopPage - 商店页面
- [ ] AlchemyPage - 炼丹页面
- [ ] ForgePage - 炼器页面
- [ ] SkillPage - 功法页面
- [ ] PetPage - 灵宠页面
- [ ] FishingPage - 垂钓页面
- [ ] CavePage - 洞天页面
- [ ] SecretPage - 秘境页面
- [ ] AdventurePage - 冒险页面

### 数据管理
- [ ] DataManager - 数据管理器
- [ ] BattleManager - 战斗管理器
- [ ] StorageManager - 存储管理器

### 资源文件
- [ ] 所有图片资源已导入
- [ ] 图标字体已配置
- [ ] 颜色配置文件已创建

### 功能测试
- [ ] 页面跳转正常
- [ ] 按钮交互正常
- [ ] 数据显示正确
- [ ] 战斗逻辑正常
- [ ] 列表滚动流畅

### 优化项
- [ ] 对象池已实现
- [ ] 图集已合并
- [ ] 适配已处理
- [ ] 性能测试通过

---

## 💡 重要注意事项

### 设计原则

1. **纯扁平化**: 
   - ❌ 禁止使用渐变色
   - ❌ 禁止使用圆角
   - ❌ 禁止使用阴影
   - ✅ 使用纯色填充
   - ✅ 使用实线边框

2. **像素对齐**:
   - 所有坐标使用整数
   - 避免模糊边缘

3. **颜色使用**:
   - 使用配置文件中的预设颜色
   - 保持颜色一致性

4. **尺寸规范**:
   - 遵循 4px/8px 网格系统
   - 保持间距统一

### Cocos Creator 特殊处理

1. **Widget 组件**:
   - 顶部栏使用 Widget 固定到顶部
   - 底部栏使用 Widget 固定到底部

2. **Layout 组件**:
   - 导航栏使用 Grid Layout
   - 列表使用 Vertical Layout
   - 资源栏使用 Horizontal Layout

3. **ScrollView**:
   - 内容区使用 ScrollView
   - 设置 Bounce 效果
   - 配置滚动条样式

4. **Button 组件**:
   - 配置 Transition: COLOR
   - 设置 Pressed Color
   - 设置 Disabled Color

### 性能建议

1. **减少 DrawCall**:
   - 使用 Sprite Atlas
   - 合并同类型节点

2. **优化布局**:
   - 避免过深的节点层级
   - 合理使用 Layout 组件

3. **内存管理**:
   - 及时释放不用的资源
   - 使用对象池

---

## 🔗 相关文档

- [Cocos Creator 官方文档](https://docs.cocos.com/creator/manual/zh/)
- [Cocos Creator UI 系统](https://docs.cocos.com/creator/manual/zh/ui-system/)
- [TypeScript 参考手册](https://www.typescriptlang.org/docs/)

---

## 📞 技术支持

如有问题，请参考:
1. React 源代码: `/src/app/` 目录
2. 样式定义: `/src/styles/` 目录
3. 本文档的详细说明

---

**文档版本**: v1.0  
**最后更新**: 2025年  
**适用版本**: Cocos Creator 3.x

---

祝您移植顺利！🎮✨

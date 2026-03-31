# 像素风格RPG修仙游戏 - Cocos Creator 完整重制指南

## 📋 目录

1. [项目概述](#项目概述)
2. [设计规范](#设计规范)
3. [全局布局](#全局布局)
4. [12个页面详细实现](#12个页面详细实现)
5. [数据管理系统](#数据管理系统)
6. [资源清单](#资源清单)

---

## 项目概述

### 基础信息
- **容器尺寸**: 720px × 1280px（固定）
- **设计风格**: 纯扁平化像素艺术风格
- **颜色系统**: 深色调石板灰 + 金黄色边框
- **布局方式**: Flexbox概念转换为Cocos Layout组件
- **页面总数**: 12个

### 禁止使用的效果
❌ 渐变色  
❌ 圆角  
❌ 阴影  
✅ 纯色填充  
✅ 实线边框

---

## 设计规范

### 颜色配置表

```typescript
// ColorConfig.ts
export const GameColors = {
  // === 背景色系 ===
  SLATE_900: '#0f172a',   // 深色背景
  SLATE_800: '#1e293b',   // 中深背景
  SLATE_700: '#334155',   // 浅背景
  SLATE_600: '#475569',   // 按钮背景
  
  // === 边框色系 ===
  AMBER_400: '#fbbf24',   // 亮金色边框
  AMBER_500: '#f59e0b',   // 标准金色边框
  AMBER_600: '#d97706',   // 深金色边框
  AMBER_700: '#b45309',   // 更深金色
  AMBER_800: '#92400e',   // 容器标题背景
  AMBER_900: '#78350f',   // 容器背景
  AMBER_950: '#451a03',   // 列表项背景
  
  // === 文字色系 ===
  AMBER_100: '#fef3c7',   // 标题文字
  AMBER_200: '#fde68a',   // 副标题
  SLATE_300: '#cbd5e1',   // 辅助文字
  SLATE_400: '#94a3b8',   // 次要文字
  
  // === 功能色系 ===
  RED_400: '#f87171',     // 攻击/伤害
  RED_600: '#dc2626',     // 危险
  GREEN_300: '#86efac',   // 成功提示
  GREEN_600: '#16a34a',   // 成功按钮
  BLUE_300: '#93c5fd',    // 信息提示
  BLUE_600: '#2563eb',    // 信息按钮
  CYAN_400: '#22d3ee',    // 钻石色
  CYAN_600: '#0891b2',    // 钻石边框
  
  // === 页面主题色 ===
  THEME_BLUE: '#1d4ed8',      // 角色页
  THEME_PURPLE: '#7e22ce',    // 法器页
  THEME_GREEN: '#15803d',     // 任务页
  THEME_ORANGE: '#c2410c',    // 商店页
  THEME_EMERALD: '#047857',   // 炼丹页
  THEME_RED: '#b91c1c',       // 炼器页
  THEME_INDIGO: '#4338ca',    // 功法页
  THEME_PINK: '#be185d',      // 灵宠页
  THEME_CYAN: '#0e7490',      // 垂钓页
  THEME_TEAL: '#0f766e',      // 洞天页
  THEME_FUCHSIA: '#a21caf',   // 秘境页
  THEME_VIOLET: '#7c3aed',    // 冒险页
};
```

### 边框规范
- **主边框**: 4px (border-4)
- **次边框**: 3px (border-3)
- **细边框**: 2px (border-2)
- **分隔线**: 1px (border)

### 间距规范
- **容器内边距**: 16px (p-4), 12px (p-3), 8px (p-2)
- **元素间距**: 16px (gap-4), 12px (gap-3), 8px (gap-2), 6px (gap-1.5)
- **装饰角距离**: 6px (top-1.5, left-1.5)

### 字体规范
- **大标题**: 16px font-bold (text-base)
- **中标题**: 14px font-bold (text-sm)
- **正文**: 12px font-bold (text-xs)
- **小文字**: 10px font-bold (text-[10px])

---

## 全局布局

### 根容器结构

```
Canvas (720x1280)
├── Container (固定尺寸容器)
│   ├── TopBar (顶部栏) - 高度: ~100px
│   ├── ContentArea (内容区) - flex-1 自适应高度
│   ├── NavigationBar (功能导航栏) - 高度: ~72px
│   └── BottomNavBar (底部标签栏) - 高度: ~72px
```

### 1. TopBar (顶部栏)

**尺寸**: 720px × 98px  
**背景**: SLATE_800 (#1e293b)  
**内边距**: 8px (p-2)  
**外边距**: 上下各8px (mt-2, mb-2)

```
TopBar
├── HorizontalLayout (gap: 8px)
│   ├── Avatar (头像)
│   │   尺寸: 90×90px
│   │   边框: 4px AMBER_600
│   │   背景: SLATE_800
│   │
│   └── InfoArea (信息区 - flex-1)
│       └── HorizontalLayout (gap: 8px)
│           ├── NameBox (名字栏 - flex-1)
│           │   尺寸: 自适应×全高
│           │   背景: AMBER_900
│           │   边框: 3px AMBER_600
│           │   内边距: 16px 8px
│           │   文字: 18px bold AMBER_100 左对齐
│           │
│           ├── GoldBox (金币栏 - flex-1)
│           │   尺寸: 自适应×全高
│           │   背景: AMBER_900
│           │   边框: 3px AMBER_600
│           │   内边距: 12px 8px
│           │   布局: 水平居中
│           │   ├── CoinIcon: 32×32px AMBER_400
│           │   └── Label: 18px bold AMBER_100
│           │
│           └── DiamondBox (钻石栏 - flex-1)
│               尺寸: 自适应×全高
│               背景: CYAN_900
│               边框: 3px CYAN_600
│               内边距: 12px 8px
│               布局: 水平居中
│               ├── DiamondIcon: 32×32px CYAN_400
│               └── Label: 18px bold CYAN_100
```

**实现代码**:
```typescript
// TopBar.ts
import { _decorator, Component, Node, Label, Sprite } from 'cc';
import { DataManager } from '../managers/DataManager';
const { ccclass, property } = _decorator;

@ccclass('TopBar')
export class TopBar extends Component {
    @property(Label)
    nameLabel: Label = null;
    
    @property(Label)
    goldLabel: Label = null;
    
    @property(Label)
    diamondLabel: Label = null;

    onLoad() {
        this.updatePlayerInfo();
    }

    updatePlayerInfo() {
        const player = DataManager.getInstance().getPlayerData();
        this.nameLabel.string = player.name;
        this.goldLabel.string = player.gold.toString();
        this.diamondLabel.string = player.diamond.toString();
    }
}
```

### 2. NavigationBar (功能导航栏)

**尺寸**: 720px × 72px  
**背景**: SLATE_800 (#1e293b)  
**内边距**: 8px (p-2)  
**外边距**: 底部8px (mb-2)

```
NavigationBar
└── GridLayout (6列, 间距: 6px)
    ├── NavButton × 6
        尺寸: 自适应宽度 × 64px
        背景: SLATE_700
        边框: 3px SLATE_600
        Hover边框: AMBER_500
        内边距: 6px
        └── VerticalLayout (gap: 6px)
            ├── IconBox
            │   尺寸: 40×40px
            │   背景: SLATE_900
            │   边框: 3px AMBER_600
            │   图标: 24×24px AMBER_400
            │
            └── Label
                字体: 10px bold AMBER_100
```

**6个导航按钮**:
1. 任务 (FileText) → TaskPage
2. 商店 (Store) → ShopPage
3. 炼丹 (FlaskConical) → AlchemyPage
4. 炼器 (Trophy) → ForgePage
5. 功法 (BookOpen) → SkillPage
6. 灵宠 (Heart) → PetPage

### 3. BottomNavBar (底部标签栏)

**尺寸**: 720px × 72px  
**背景**: SLATE_800 (#1e293b)  
**内边距**: 8px (p-2)

```
BottomNavBar
└── GridLayout (5列, 间距: 6px)
    ├── TabButton × 5
        尺寸: 自适应宽度 × 64px
        普通状态:
          背景: SLATE_700
          边框: 3px SLATE_600
        激活状态:
          背景: AMBER_800
          边框: 3px AMBER_500
        内边距: 6px
        └── VerticalLayout (gap: 6px)
            ├── IconBox
            │   尺寸: 40×40px
            │   普通: SLATE_900 + SLATE_700边框
            │   激活: AMBER_900 + AMBER_600边框
            │   图标: 24×24px
            │     普通: SLATE_400
            │     激活: AMBER_200
            │
            └── Label
                字体: 10px bold
                普通: SLATE_300
                激活: AMBER_100
```

**5个标签按钮**:
1. 法器 (Sword) → WeaponPage
2. 独钓 (Fish) → FishingPage
3. 角色 (User) → CharacterPage (默认激活)
4. 秘境 (Sparkles) → SecretPage
5. 洞天 (Mountain) → CavePage

---

## 12个页面详细实现

### 页面通用元素

所有页面都包含以下通用装饰：

#### 四角装饰
```
四个角落装饰 (固定定位)
├── 左上角: top: 6px, left: 6px
├── 右上角: top: 6px, right: 6px
├── 左下角: bottom: 6px, left: 6px
└── 右下角: bottom: 6px, right: 6px
尺寸: 12×12px
边框: 3px AMBER_500
```

#### 标题横幅
```
TitleBanner (居中)
├── 中心文字框
│   背景: 主题色 (根据页面)
│   边框: 3px AMBER_400
│   内边距: 48px 6px (左右各预留菱形空间)
│   文字: 16px bold AMBER_200
│
├── 左菱形装饰
│   尺寸: 20×20px
│   位置: 左侧-10px, 垂直居中
│   背景: 主题色
│   边框: 3px AMBER_400
│   旋转: 45度
│
└── 右菱形装饰
    尺寸: 20×20px
    位置: 右侧-10px, 垂直居中
    背景: 主题色
    边框: 3px AMBER_400
    旋转: 45度
```

#### 内容容器
```
ContentContainer (主容器)
背景: AMBER_900
边框: 4px AMBER_700
内边距: 16px
相对定位 (用于叠加纹理)
└── BackgroundPattern (装饰纹理)
    不透明度: 5%
    GridLayout (4列, 间距: 6px)
    └── 小方块 × 16
        尺寸: 12×12px
        边框: 2px AMBER_900
```

---

### 页面 1: CharacterPage (角色页面)

**主题色**: THEME_BLUE (#1d4ed8)  
**路由**: `/`  
**容器尺寸**: 652×1100px (考虑内边距后)

```
CharacterPage
├── 四角装饰 (通用)
├── TitleBanner (标题: "角色总览")
└── VerticalLayout (gap: 20px)
    ├── CharacterDisplay (角色展示区)
    │   尺寸: 340×300px
    │   位置: 水平居中
    │   背景: SLATE_800
    │   边框: 3px SLATE_600
    │   内边距: 16px
    │   └── 内容居中
    │       ├── 装饰星星 × 4
    │       │   位置: 四个角落附近
    │       │   图标: Sparkles 12-16px YELLOW_400
    │       │   动画: animate-pulse (延迟0/0.5s/1s/1.5s)
    │       │
    │       ├── CharacterImage
    │       │   尺寸: 128×128px
    │       │   图片: 角色立绘
    │       │
    │       └── Platform (修炼台座)
    │           尺寸: 128×28px
    │           背景: AMBER_900
    │           边框: 3px AMBER_700
    │           └── 内边框
    │               距离: 4px
    │               边框: 2px AMBER_600
    │
    └── BottomRow (底部双栏)
        GridLayout (2列, 间距: 16px)
        ├── EquipmentPanel (左侧: 装备面板)
        │   尺寸: 318×400px
        │   └── ContentContainer
        │       ├── 小标题 "本命法器"
        │       └── EquipmentList (垂直列表, 间距: 10px)
        │           └── EquipmentItem × 3
        │               尺寸: 全宽×70px
        │               背景: AMBER_950
        │               边框: 2px AMBER_800
        │               Hover边框: AMBER_600
        │               内边距: 10px
        │               └── HorizontalLayout (gap: 10px)
        │                   ├── IconBox
        │                   │   尺寸: 64×64px
        │                   │   背景: SLATE_900
        │                   │   边框: 3px AMBER_600
        │                   │   内边距: 10px
        │                   │   图标: 全填充
        │                   │
        │                   └── InfoArea (flex-1)
        │                       ├── SlotLabel: 10px AMBER_400 "飞剑位"
        │                       ├── NameLabel: 14px bold AMBER_100 "青霜剑"
        │                       └── LevelRow
        │                           ├── Level: 12px SLATE_300 "Lv.1"
        │                           └── Star: 12×12px 填充黄色
        │
        └── StatsPanel (右侧: 属性面板)
            尺寸: 318×400px
            └── ContentContainer
                ├── 小标题 "基础属性"
                └── StatsList (垂直列表, 间距: 12px, 垂直居中)
                    └── StatItem × 4
                        尺寸: 全宽×自适应
                        背景: AMBER_950
                        边框: 2px AMBER_800
                        内边距: 10px
                        布局: 水平对齐
                        ├── LabelBox
                        │   背景: AMBER_900
                        │   边框: 1px AMBER_700
                        │   内边距: 12px 4px
                        │   文字: 12px bold AMBER_100
                        │
                        ├── ProgressArea (flex-1, 左右边距10px)
                        │   ├── ProgressBar (境界除外)
                        │   │   尺寸: 全宽×8px
                        │   │   背景: SLATE_900
                        │   │   边框: 1px SLATE_700
                        │   │   填充: 对应颜色
                        │   │   宽度: (current/max) * 100%
                        │   │
                        │   └── TextValue (境界特殊)
                        │       文字: 14px AMBER_200 "练气一层"
                        │
                        └── ValueLabel
                            文字: 14px bold AMBER_200
                            最小宽度: 75px 右对齐
                            内容: "current/max"
```

**数据结构**:
```typescript
// CharacterData
interface CharacterData {
  name: string;           // "剑仙·逍遥"
  level: number;          // 10
  gold: number;           // 99999
  diamond: number;        // 888
}

interface Equipment {
  id: string;
  slot: string;           // "飞剑位", "护符位", "灵灯位"
  name: string;           // "青霜剑"
  level: number;          // 1
  iconType: string;       // "Sword", "Shield", "Lamp"
}

interface Stat {
  label: string;          // "境界", "气血", "法力", "行动力"
  current: number;
  max: number;
  color: string;          // "bg-purple-800", "bg-red-800", etc.
  showAsText?: boolean;   // 境界特殊显示
  textValue?: string;     // "练气一层"
}
```

**实现代码**:
```typescript
// CharacterPage.ts
import { _decorator, Component, Node, Label, instantiate, Prefab } from 'cc';
import { DataManager } from '../managers/DataManager';
const { ccclass, property } = _decorator;

@ccclass('CharacterPage')
export class CharacterPage extends Component {
    @property(Node)
    equipmentList: Node = null;
    
    @property(Node)
    statsList: Node = null;
    
    @property(Prefab)
    equipmentItemPrefab: Prefab = null;
    
    @property(Prefab)
    statItemPrefab: Prefab = null;

    onLoad() {
        this.loadEquipment();
        this.loadStats();
    }

    loadEquipment() {
        const equipment = DataManager.getInstance().getEquipment();
        equipment.forEach(item => {
            const node = instantiate(this.equipmentItemPrefab);
            const script = node.getComponent('EquipmentItem');
            script.setData(item);
            this.equipmentList.addChild(node);
        });
    }

    loadStats() {
        const stats = DataManager.getInstance().getStats();
        stats.forEach(stat => {
            const node = instantiate(this.statItemPrefab);
            const script = node.getComponent('StatItem');
            script.setData(stat);
            this.statsList.addChild(node);
        });
    }
}
```

---

### 页面 2: WeaponPage (法器页面)

**主题色**: THEME_PURPLE (#7e22ce)  
**路由**: `/weapon`  
**容器尺寸**: 652×1100px

```
WeaponPage
├── 四角装饰 (通用)
├── TitleBanner (标题: "法器宝库")
└── VerticalLayout (gap: 16px) - 可滚动
    ├── CurrentWeaponSection (当前装备区)
    │   └── ContentContainer
    │       ├── 小标题 "当前装备"
    │       ├── WeaponImage
    │       │   尺寸: 280×180px
    │       │   边框: 3px AMBER_600
    │       │   背景: SLATE_900
    │       │   居中显示
    │       │   图片: 法器.jpg
    │       │
    │       └── StatsGrid (垂直列表, 间距: 8px)
    │           └── StatRow × 4
    │               尺寸: 全宽×自适应
    │               背景: AMBER_950
    │               边框: 2px AMBER_800
    │               内边距: 10px
    │               布局: 两端对齐
    │               ├── Label: 12px bold AMBER_100
    │               └── Value: 14px bold (颜色根据类型)
    │                   - 名称: AMBER_200
    │                   - 等级: AMBER_200 "Lv.10"
    │                   - 攻击: RED_400 "+285"
    │                   - 品质: 星星×5 (12×12px YELLOW_400)
    │
    └── WeaponListSection (法器列表区)
        └── ContentContainer
            ├── 小标题 "法器列表"
            └── WeaponList (垂直列表, 间距: 12px)
                └── WeaponItem × N
                    尺寸: 全宽×70px
                    背景: AMBER_950
                    边框: 2px AMBER_800
                    Hover边框: AMBER_600
                    内边距: 12px
                    可点击
                    └── HorizontalLayout (gap: 12px)
                        ├── IconBox
                        │   尺寸: 64×64px
                        │   背景: SLATE_900
                        │   边框: 3px AMBER_700
                        │   图标: 32×32px AMBER_400
                        │   类型: Sword/Zap/Shield/Flame
                        │
                        └── InfoArea (flex-1)
                            ├── TopRow (两端对齐)
                            │   ├── Name: 14px bold AMBER_100
                            │   └── Level: 12px SLATE_300 "Lv.X"
                            │
                            └── BottomRow (两端对齐)
                                ├── RarityStars (水平排列, 间距: 2px)
                                │   └── Star × N: 10×10px YELLOW_400
                                │
                                └── AttackValue: 12px bold RED_400 "攻击 +X"
```

**数据结构**:
```typescript
interface Weapon {
  id: number;
  name: string;         // "青锋剑"
  level: number;        // 10
  rarity: number;       // 1-5星
  attack: number;       // 285
  iconType: string;     // "Sword", "Zap", "Shield", "Flame"
  equipped?: boolean;   // 是否装备
}

const weaponList: Weapon[] = [
  { id: 1, name: "青锋剑", level: 10, rarity: 5, attack: 285, iconType: "Sword", equipped: true },
  { id: 2, name: "雷神锤", level: 8, rarity: 4, attack: 256, iconType: "Zap" },
  { id: 3, name: "玄武盾", level: 7, rarity: 4, attack: 198, iconType: "Shield" },
  { id: 4, name: "赤焰扇", level: 6, rarity: 3, attack: 167, iconType: "Flame" },
];
```

---

### 页面 3: TaskPage (任务页面)

**主题色**: THEME_GREEN (#15803d)  
**路由**: `/task`  
**容器尺寸**: 652×1100px

```
TaskPage
├── 四角装饰 (通用)
├── TitleBanner (标题: "任务大厅")
└── VerticalLayout (gap: 16px) - 可滚动
    ├── FeaturedImage (特色图片区)
    │   └── ContentContainer (无小标题)
    │       └── ImageBox
    │           尺寸: 全宽×200px
    │           边框: 3px AMBER_600
    │           背景: SLATE_900
    │           图片: 任务.jpg (覆盖填充)
    │
    └── TaskListSection (任务列表区)
        └── ContentContainer
            ├── 小标题 "当前任务"
            └── TaskList (垂直列表, 间距: 12px)
                └── TaskItem × N
                    尺寸: 全宽×自适应
                    背景: AMBER_950
                    边框: 2px AMBER_800
                    内边距: 12px
                    └── VerticalLayout (gap: 8px)
                        ├── HeaderRow (两端对齐)
                        │   ├── TaskName: 14px bold AMBER_100
                        │   └── StatusTag
                        │       内边距: 8px 4px
                        │       边框: 2px
                        │       字体: 12px bold
                        │       状态样式:
                        │         - 可领取: GREEN_300文字 + GREEN_600边框 + GREEN_900背景
                        │         - 进行中: BLUE_300文字 + BLUE_600边框 + BLUE_900背景
                        │         - 未完成: SLATE_300文字 + SLATE_600边框 + SLATE_900背景
                        │
                        ├── ProgressRow (两端对齐)
                        │   ├── ProgressBar (flex-1)
                        │   │   尺寸: 全宽×8px
                        │   │   背景: SLATE_900
                        │   │   边框: 1px SLATE_700
                        │   │   填充: GREEN_600
                        │   │   宽度: (progress/total) * 100%
                        │   │
                        │   └── ProgressText: 12px SLATE_300 "5/10"
                        │
                        └── FooterRow (两端对齐)
                            ├── RewardText: 12px AMBER_400 "奖励: 经验+100"
                            └── ClaimButton (仅"可领取"状态显示)
                                尺寸: 自适应×自适应
                                背景: GREEN_700
                                边框: 2px GREEN_500
                                内边距: 12px 4px
                                文字: 12px bold GREEN_100 "领取"
                                Hover: GREEN_600
```

**数据结构**:
```typescript
interface Task {
  id: number;
  name: string;           // "击败妖兽"
  reward: string;         // "经验+100"
  status: string;         // "进行中" | "可领取" | "未完成"
  progress: number;       // 5
  total: number;          // 10
}

const taskList: Task[] = [
  { id: 1, name: "击败妖兽", reward: "经验+100", status: "进行中", progress: 5, total: 10 },
  { id: 2, name: "收集灵草", reward: "金币+50", status: "进行中", progress: 3, total: 5 },
  { id: 3, name: "炼制丹药", reward: "钻石+10", status: "未完成", progress: 0, total: 3 },
  { id: 4, name: "修炼功法", reward: "功法点+20", status: "可领取", progress: 5, total: 5 },
];
```

---

### 页面 4: ShopPage (商店页面)

**主题色**: THEME_ORANGE (#c2410c)  
**路由**: `/shop`  
**容器尺寸**: 652×1100px

```
ShopPage
├── 四角装饰 (通用)
├── TitleBanner (标题: "仙缘商店")
└── VerticalLayout (gap: 16px) - 可滚动
    ├── FeaturedImage (商店图片)
    │   └── ContentContainer
    │       └── ImageBox
    │           尺寸: 全宽×200px
    │           边框: 3px AMBER_600
    │           背景: SLATE_900
    │           图片: 商店.jpg
    │
    └── ShopItemsSection (商品区)
        └── ContentContainer
            ├── 小标题 "热卖商品"
            └── ShopGrid (网格布局: 2列, 间距: 12px)
                └── ShopItem × N
                    尺寸: 自适应×自适应
                    背景: AMBER_950
                    边框: 2px AMBER_800
                    Hover边框: AMBER_600
                    内边距: 12px
                    └── VerticalLayout (gap: 8px)
                        ├── IconBox
                        │   尺寸: 全宽×80px
                        │   背景: SLATE_900
                        │   边框: 2px AMBER_700
                        │   居中显示
                        │   图标: ShoppingCart 40×40px AMBER_400
                        │
                        ├── ItemName: 14px bold AMBER_100
                        ├── StockText: 12px SLATE_300 "库存: 99"
                        └── FooterRow (两端对齐)
                            ├── PriceText: 12px bold AMBER_300 "100 钻石"
                            └── BuyButton
                                背景: GREEN_700
                                边框: 2px GREEN_500
                                内边距: 8px 4px
                                文字: 12px bold GREEN_100 "购买"
                                Hover: GREEN_600
```

**数据结构**:
```typescript
interface ShopItem {
  id: number;
  name: string;           // "灵石礼包"
  price: number;          // 100
  currency: string;       // "钻石" | "金币"
  stock: number;          // 99
}

const shopItems: ShopItem[] = [
  { id: 1, name: "灵石礼包", price: 100, currency: "钻石", stock: 99 },
  { id: 2, name: "经验丹", price: 50, currency: "金币", stock: 50 },
  { id: 3, name: "强化石", price: 80, currency: "金币", stock: 30 },
  { id: 4, name: "复活丹", price: 200, currency: "钻石", stock: 10 },
];
```

---

### 页面 5: AlchemyPage (炼丹页面)

**主题色**: THEME_EMERALD (#047857)  
**路由**: `/alchemy`  
**容器尺寸**: 652×1100px

```
AlchemyPage
├── 四角装饰 (通用)
├── TitleBanner (标题: "炼丹房")
└── VerticalLayout (gap: 16px) - 可滚动
    ├── FeaturedImage (炼丹房图片)
    │   └── ContentContainer
    │       └── ImageBox
    │           尺寸: 全宽×200px
    │           边框: 3px AMBER_600
    │           背景: SLATE_900
    │           图片: 炼丹.jpg
    │
    └── PillListSection (丹方列表)
        └── ContentContainer
            ├── 小标题 "丹方列表"
            └── PillList (垂直列表, 间距: 12px)
                └── PillItem × N
                    尺寸: 全宽×70px
                    背景: AMBER_950
                    边框: 2px AMBER_800
                    Hover边框: AMBER_600
                    内边距: 12px
                    └── HorizontalLayout (gap: 12px)
                        ├── IconBox
                        │   尺寸: 64×64px
                        │   背景: SLATE_900
                        │   边框: 3px AMBER_700
                        │   图标: FlaskConical 32×32px GREEN_400
                        │
                        ├── InfoArea (flex-1)
                        │   └── VerticalLayout (gap: 4px)
                        │       ├── PillName: 14px bold AMBER_100
                        │       ├── Materials: 12px SLATE_300 "材料: 灵草x5"
                        │       └── Time: 12px AMBER_400 "炼制时间: 2小时"
                        │
                        └── RefineButton
                            背景: EMERALD_700
                            边框: 2px EMERALD_500
                            内边距: 12px 8px
                            文字: 12px bold EMERALD_100 "炼制"
                            Hover: EMERALD_600
```

**数据结构**:
```typescript
interface Pill {
  id: number;
  name: string;           // "筑基丹"
  materials: string;      // "灵草x5"
  time: string;           // "2小时"
}

const pillList: Pill[] = [
  { id: 1, name: "筑基丹", materials: "灵草x5", time: "2小时" },
  { id: 2, name: "洗髓丹", materials: "灵芝x3", time: "4小时" },
  { id: 3, name: "金丹", materials: "仙草x10", time: "8小时" },
];
```

---

### 页面 6: ForgePage (炼器页面)

**主题色**: THEME_RED (#b91c1c)  
**路由**: `/forge`  
**容器尺寸**: 652×1100px

```
ForgePage
├── 四角装饰 (通用)
├── TitleBanner (标题: "炼器坊")
└── VerticalLayout (gap: 16px) - 可滚动
    ├── FeaturedImage (炼器坊图片)
    │   └── ContentContainer
    │       └── ImageBox
    │           尺寸: 全宽×200px
    │           边框: 3px AMBER_600
    │           背景: SLATE_900
    │           图片: 炼器.jpg
    │
    └── ForgeListSection (装备强化列表)
        └── ContentContainer
            ├── 小标题 "装备强化"
            └── ForgeList (垂直列表, 间距: 12px)
                └── ForgeItem × N
                    尺寸: 全宽×70px
                    背景: AMBER_950
                    边框: 2px AMBER_800
                    Hover边框: AMBER_600
                    内边距: 12px
                    └── HorizontalLayout (gap: 12px)
                        ├── IconBox
                        │   尺寸: 64×64px
                        │   背景: SLATE_900
                        │   边框: 3px AMBER_700
                        │   图标: Hammer 32×32px RED_400
                        │
                        ├── InfoArea (flex-1)
                        │   └── VerticalLayout (gap: 4px)
                        │       ├── ItemName: 14px bold AMBER_100
                        │       ├── LevelRange: 12px SLATE_300 "等级: Lv.5 → Lv.6"
                        │       └── Materials: 12px AMBER_400 "材料: 精铁x10"
                        │
                        └── EnhanceButton
                            背景: RED_700
                            边框: 2px RED_500
                            内边距: 12px 8px
                            文字: 12px bold RED_100 "强化"
                            Hover: RED_600
```

**数据结构**:
```typescript
interface ForgeEquipment {
  id: number;
  name: string;           // "玄铁重剑"
  level: number;          // 5
  nextLevel: number;      // 6
  materials: string;      // "精铁x10"
}

const forgeList: ForgeEquipment[] = [
  { id: 1, name: "玄铁重剑", level: 5, nextLevel: 6, materials: "精铁x10" },
  { id: 2, name: "金丝软甲", level: 3, nextLevel: 4, materials: "金线x8" },
  { id: 3, name: "护身玉佩", level: 2, nextLevel: 3, materials: "玉石x5" },
];
```

---

### 页面 7: SkillPage (功法页面)

**主题色**: THEME_INDIGO (#4338ca)  
**路由**: `/skill`  
**容器尺寸**: 652×1100px

```
SkillPage
├── 四角装饰 (通用)
├── TitleBanner (标题: "功法阁")
└── VerticalLayout (gap: 16px) - 可滚动
    ├── FeaturedImage (功法阁图片)
    │   └── ContentContainer
    │       └── ImageBox
    │           尺寸: 全宽×200px
    │           边框: 3px AMBER_600
    │           背景: SLATE_900
    │           图片: 功法.jpg
    │
    └── SkillListSection (已学功法列表)
        └── ContentContainer
            ├── 小标题 "已学功法"
            └── SkillList (垂直列表, 间距: 12px)
                └── SkillItem × N
                    尺寸: 全宽×70px
                    背景: AMBER_950
                    边框: 2px AMBER_800
                    Hover边框: AMBER_600
                    内边距: 12px
                    └── HorizontalLayout (gap: 12px)
                        ├── IconBox
                        │   尺寸: 64×64px
                        │   背景: SLATE_900
                        │   边框: 3px AMBER_700
                        │   图标: BookOpen 32×32px INDIGO_400
                        │
                        ├── InfoArea (flex-1)
                        │   └── VerticalLayout
                        │       ├── TopRow (两端对齐)
                        │       │   ├── SkillName: 14px bold AMBER_100
                        │       │   └── Level: 12px SLATE_300 "Lv.10"
                        │       │
                        │       └── BottomRow (两端对齐)
                        │           ├── Type: 12px AMBER_400 "内功"
                        │           └── Power: 12px bold RED_400 "威力 +150"
                        │
                        └── CultivateButton
                            背景: INDIGO_700
                            边框: 2px INDIGO_500
                            内边距: 12px 8px
                            文字: 12px bold INDIGO_100 "修炼"
                            Hover: INDIGO_600
```

**数据结构**:
```typescript
interface Skill {
  id: number;
  name: string;           // "九天玄功"
  level: number;          // 10
  type: string;           // "内功" | "剑法" | "身法" | "掌法"
  power: number;          // 150
}

const skillList: Skill[] = [
  { id: 1, name: "九天玄功", level: 10, type: "内功", power: 150 },
  { id: 2, name: "剑气纵横", level: 8, type: "剑法", power: 120 },
  { id: 3, name: "凌波微步", level: 6, type: "身法", power: 90 },
  { id: 4, name: "降龙十八掌", level: 5, type: "掌法", power: 100 },
];
```

---

### 页面 8: PetPage (灵宠页面)

**主题色**: THEME_PINK (#be185d)  
**路由**: `/pet`  
**容器尺寸**: 652×1100px

```
PetPage
├── 四角装饰 (通用)
├── TitleBanner (标题: "灵宠园")
└── VerticalLayout (gap: 16px) - 可滚动
    ├── FeaturedImage (灵宠园图片)
    │   └── ContentContainer
    │       └── ImageBox
    │           尺寸: 全宽×200px
    │           边框: 3px AMBER_600
    │           背景: SLATE_900
    │           图片: 灵宠.jpg
    │
    └── PetListSection (我的灵宠列表)
        └── ContentContainer
            ├── 小标题 "我的灵宠"
            └── PetList (垂直列表, 间距: 12px)
                └── PetItem × N
                    尺寸: 全宽×自适应
                    背景: AMBER_950
                    边框: 2px AMBER_800
                    Hover边框: AMBER_600
                    内边距: 12px
                    └── HorizontalLayout (gap: 12px)
                        ├── IconBox
                        │   尺寸: 64×64px
                        │   背景: SLATE_900
                        │   边框: 3px AMBER_700
                        │   图标: Heart 32×32px PINK_400
                        │
                        ├── InfoArea (flex-1)
                        │   └── VerticalLayout (gap: 4px)
                        │       ├── TopRow (两端对齐)
                        │       │   ├── PetName: 14px bold AMBER_100
                        │       │   └── Level: 12px SLATE_300 "Lv.10"
                        │       │
                        │       ├── LoyaltyRow
                        │       │   └── HorizontalLayout (gap: 8px)
                        │       │       ├── Label: 12px SLATE_300 "忠诚度:"
                        │       │       ├── ProgressBar (flex-1)
                        │       │       │   尺寸: 全宽×6px
                        │       │       │   背景: SLATE_900
                        │       │       │   边框: 1px SLATE_700
                        │       │       │   填充: PINK_500
                        │       │       │   宽度: loyalty%
                        │       │       │
                        │       │       └── Percent: 12px PINK_400 "100%"
                        │       │
                        │       └── Power: 12px bold RED_400 "战力 +200"
                        │
                        └── InteractButton
                            背景: PINK_700
                            边框: 2px PINK_500
                            内边距: 12px 8px
                            文字: 12px bold PINK_100 "互动"
                            Hover: PINK_600
```

**数据结构**:
```typescript
interface Pet {
  id: number;
  name: string;           // "白虎"
  level: number;          // 10
  loyalty: number;        // 0-100
  power: number;          // 200
}

const petList: Pet[] = [
  { id: 1, name: "白虎", level: 10, loyalty: 100, power: 200 },
  { id: 2, name: "青龙", level: 8, loyalty: 85, power: 180 },
  { id: 3, name: "朱雀", level: 6, loyalty: 70, power: 150 },
];
```

---

### 页面 9: FishingPage (垂钓页面)

**主题色**: THEME_CYAN (#0e7490)  
**路由**: `/fishing`  
**容器尺寸**: 652×1100px

```
FishingPage
├── 四角装饰 (通用)
├── TitleBanner (标题: "垂钓台")
└── VerticalLayout (gap: 16px) - 可滚动
    ├── FeaturedImage (垂钓台图片)
    │   └── ContentContainer
    │       └── ImageBox
    │           尺寸: 全宽×220px (稍高)
    │           边框: 3px AMBER_600
    │           背景: SLATE_900
    │           图片: 垂钓.jpg
    │
    └── FishingSection (渔获区)
        └── ContentContainer
            ├── 小标题 "今日渔获"
            ├── FishList (垂直列表, 间距: 12px)
            │   └── FishItem × N
            │       尺寸: 全宽×70px
            │       背景: AMBER_950
            │       边框: 2px AMBER_800
            │       内边距: 12px
            │       └── HorizontalLayout (gap: 12px)
            │           ├── IconBox
            │           │   尺寸: 64×64px
            │           │   背景: SLATE_900
            │           │   边框: 3px AMBER_700
            │           │   图标: Fish 32×32px CYAN_400
            │           │
            │           └── InfoArea (flex-1)
            │               └── VerticalLayout
            │                   ├── TopRow (两端对齐)
            │                   │   ├── FishName: 14px bold AMBER_100
            │                   │   └── Weight: 12px SLATE_300 "2.5kg"
            │                   │
            │                   └── BottomRow (两端对齐)
            │                       ├── RarityStars (间距: 2px)
            │                       │   └── Star × N: 10×10px YELLOW_400
            │                       │
            │                       └── Value: 12px bold AMBER_400 "价值 150金"
            │
            └── StartButton (居中)
                尺寸: 自适应×自适应
                背景: CYAN_700
                边框: 3px CYAN_500
                内边距: 12px 24px
                文字: 14px bold CYAN_100 "开始垂钓"
                Hover: CYAN_600
```

**数据结构**:
```typescript
interface Fish {
  id: number;
  name: string;           // "金鳞鲤"
  rarity: number;         // 1-5星
  weight: string;         // "2.5kg"
  value: number;          // 150
}

const fishList: Fish[] = [
  { id: 1, name: "金鳞鲤", rarity: 4, weight: "2.5kg", value: 150 },
  { id: 2, name: "银鳞鱼", rarity: 3, weight: "1.8kg", value: 100 },
  { id: 3, name: "青鳞草鱼", rarity: 2, weight: "1.2kg", value: 50 },
];
```

---

### 页面 10: CavePage (洞天页面)

**主题色**: THEME_TEAL (#0f766e)  
**路由**: `/cave`  
**容器尺寸**: 652×1100px

```
CavePage
├── 四角装饰 (通用)
├── TitleBanner (标题: "洞天福地")
└── VerticalLayout (gap: 16px) - 可滚动
    ├── FeaturedImage (洞天图片)
    │   └── ContentContainer
    │       └── ImageBox
    │           尺寸: 全宽×220px
    │           边框: 3px AMBER_600
    │           背景: SLATE_900
    │           图片: 洞天.jpg
    │
    └── BuildingListSection (洞天建筑列表)
        └── ContentContainer
            ├── 小标题 "洞天建筑"
            └── BuildingList (垂直列表, 间距: 12px)
                └── BuildingItem × N
                    尺寸: 全宽×70px
                    背景: AMBER_950
                    边框: 2px AMBER_800
                    Hover边框: AMBER_600
                    内边距: 12px
                    └── HorizontalLayout (gap: 12px)
                        ├── IconBox
                        │   尺寸: 64×64px
                        │   背景: SLATE_900
                        │   边框: 3px AMBER_700
                        │   图标: Mountain 32×32px TEAL_400
                        │
                        ├── InfoArea (flex-1)
                        │   └── VerticalLayout (gap: 4px)
                        │       ├── TopRow (两端对齐)
                        │       │   ├── BuildingName: 14px bold AMBER_100
                        │       │   └── Level: 12px SLATE_300 "Lv.5"
                        │       │
                        │       └── Production: 12px AMBER_400 "产出: 灵草x10/日"
                        │
                        └── UpgradeButton
                            背景: TEAL_700
                            边框: 2px TEAL_500
                            内边距: 12px 8px
                            文字: 12px bold TEAL_100 "升级"
                            Hover: TEAL_600
```

**数据结构**:
```typescript
interface Building {
  id: number;
  name: string;           // "灵田"
  level: number;          // 5
  production: string;     // "灵草x10/日"
}

const buildingList: Building[] = [
  { id: 1, name: "灵田", level: 5, production: "灵草x10/日" },
  { id: 2, name: "聚灵阵", level: 3, production: "灵力+50/时" },
  { id: 3, name: "藏宝阁", level: 2, production: "容量+100" },
];
```

---

### 页面 11: SecretPage (秘境页面)

**主题色**: THEME_FUCHSIA (#a21caf)  
**路由**: `/secret`  
**容器尺寸**: 652×1100px

```
SecretPage
├── 四角装饰 (通用)
├── TitleBanner (标题: "秘境探索")
└── VerticalLayout (gap: 16px) - 可滚动
    ├── FeaturedImage (秘境图片)
    │   └── ContentContainer
    │       └── ImageBox
    │           尺寸: 全宽×200px
    │           边框: 3px AMBER_600
    │           背景: SLATE_900
    │           图片: 秘境.jpg
    │
    └── SecretListSection (秘境列表)
        └── ContentContainer
            ├── 小标题 "秘境列表"
            └── SecretList (垂直列表, 间距: 12px)
                └── SecretItem × N
                    尺寸: 全宽×自适应
                    背景: AMBER_950
                    边框: 2px AMBER_800
                    Hover边框: AMBER_600
                    内边距: 12px
                    └── HorizontalLayout (gap: 12px)
                        ├── IconBox
                        │   尺寸: 64×64px
                        │   背景: SLATE_900
                        │   边框: 3px AMBER_700
                        │   图标: Sparkles 32×32px FUCHSIA_400
                        │
                        ├── InfoArea (flex-1)
                        │   └── VerticalLayout (gap: 4px)
                        │       ├── TopRow (两端对齐)
                        │       │   ├── SecretName: 14px bold AMBER_100
                        │       │   └── StatusTag
                        │       │       内边距: 8px 2px
                        │       │       边框: 2px
                        │       │       字体: 12px bold
                        │       │       状态样式:
                        │       │         - 已开启: GREEN_300 + GREEN_600边框 + GREEN_900背景
                        │       │         - 未解锁: SLATE_300 + SLATE_600边框 + SLATE_900背景
                        │       │
                        │       └── BottomRow (两端对齐)
                        │           ├── Requirement: 12px SLATE_300 "要求: Lv.10+"
                        │           └── Reward: 12px FUCHSIA_400 "传说装备"
                        │
                        └── EnterButton
                            背景: 
                              - 已开启: FUCHSIA_700
                              - 未解锁: SLATE_700
                            边框: 2px
                              - 已开启: FUCHSIA_500
                              - 未解锁: SLATE_600
                            内边距: 12px 8px
                            文字: 12px bold
                              - 已开启: FUCHSIA_100 "进入"
                              - 未解锁: SLATE_400 "锁定"
                            Hover: (仅已开启) FUCHSIA_600
                            点击: 跳转到 /adventure
```

**数据结构**:
```typescript
interface Secret {
  id: number;
  name: string;           // "远古遗迹"
  status: string;         // "已开启" | "未解锁"
  level: string;          // "Lv.10+"
  reward: string;         // "传说装备"
}

const secretList: Secret[] = [
  { id: 1, name: "远古遗迹", status: "已开启", level: "Lv.10+", reward: "传说装备" },
  { id: 2, name: "仙人洞府", status: "已开启", level: "Lv.20+", reward: "仙品功法" },
  { id: 3, name: "神魔战场", status: "未解锁", level: "Lv.30+", reward: "神器" },
];
```

**交互逻辑**:
```typescript
handleEnter(secret: Secret) {
  if (secret.status === "已开启") {
    // 跳转到冒险战斗页面
    director.loadScene("AdventurePage");
  }
}
```

---

### 页面 12: AdventurePage (冒险战斗页面)

**主题色**: THEME_VIOLET (#7c3aed)  
**路由**: `/adventure`  
**容器尺寸**: 720×1280px (全屏)

```
AdventurePage (背景: SLATE_900)
├── StatusBar (顶部状态栏)
│   尺寸: 全宽×自适应
│   背景: SLATE_800
│   内边距: 12px
│   边框底部: 4px AMBER_700
│   └── VerticalLayout (gap: 8px)
│       ├── HPRow (生命值)
│       │   └── HorizontalLayout (gap: 8px)
│       │       ├── Icon: Heart 16×16px RED_500
│       │       ├── ProgressBar
│       │       │   尺寸: 128×12px
│       │       │   背景: SLATE_900
│       │       │   边框: 2px SLATE_700
│       │       │   填充: RED_600 (宽度: 80%)
│       │       │
│       │       └── Label: 12px SLATE_300 "800/1000"
│       │
│       └── MPRow (法力值)
│           └── HorizontalLayout (gap: 8px)
│               ├── Icon: Zap 16×16px BLUE_500
│               ├── ProgressBar
│               │   尺寸: 128×12px
│               │   背景: SLATE_900
│               │   边框: 2px SLATE_700
│               │   填充: BLUE_600 (宽度: 60%)
│               │
│               └── Label: 12px SLATE_300 "300/500"
│
├── ContentArea (主内容区 - 可滚动)
│   内边距: 16px
│   └── VerticalLayout (gap: 16px)
│       ├── BattleSceneSection (战斗场景区)
│       │   └── Container
│       │       ├── BattleImage
│       │       │   尺寸: 全宽×280px
│       │       │   背景: SLATE_900
│       │       │   边框: 3px AMBER_600
│       │       │   图片: 冒险-1.png (覆盖填充)
│       │       │   相对定位 (用于叠加信息卡)
│       │       │   ├── EnemyInfoCard (左上角)
│       │       │   │   位置: top: 8px, left: 8px
│       │       │   │   背景: SLATE_900 90%透明度
│       │       │   │   边框: 2px RED_700
│       │       │   │   内边距: 8px
│       │       │   │   └── VerticalLayout (gap: 4px)
│       │       │   │       ├── Name: 12px bold RED_400 "魔族先锋"
│       │       │   │       └── HPRow
│       │       │   │           ├── Icon: Heart 12×12px RED_500
│       │       │   │           └── ProgressBar
│       │       │   │               尺寸: 96×8px
│       │       │   │               背景: SLATE_800
│       │       │   │               边框: 1px SLATE_700
│       │       │   │               填充: RED_600 (宽度: 45%)
│       │       │   │
│       │       │   └── PlayerInfoCard (右下角)
│       │       │       位置: bottom: 8px, right: 8px
│       │       │       背景: SLATE_900 90%透明度
│       │       │       边框: 2px GREEN_700
│       │       │       内边距: 8px
│       │       │       └── VerticalLayout (gap: 4px)
│       │       │           ├── Name: 12px bold GREEN_400 "剑仙·逍遥"
│       │       │           └── HPRow
│       │       │               ├── Icon: Heart 12×12px RED_500
│       │       │               └── ProgressBar
│       │       │                   尺寸: 96×8px
│       │       │                   背景: SLATE_800
│       │       │                   边框: 1px SLATE_700
│       │       │                   填充: RED_600 (宽度: 80%)
│       │       │
│       │       └── (其他装饰略)
│       │
│       ├── BattleInfoSection (战斗信息区)
│       │   └── Container
│       │       ├── WaveTitle (居中)
│       │       │   背景: AMBER_800
│       │       │   边框: 2px AMBER_400
│       │       │   内边距: 4px 16px
│       │       │   文字: 12px bold AMBER_100 "第 3 波"
│       │       │
│       │       └── StatsGrid (网格布局: 3列, 间距: 8px)
│       │           └── StatBox × 3
│       │               尺寸: 自适应×自适应
│       │               背景: SLATE_900
│       │               边框: 2px SLATE_700
│       │               内边距: 8px
│       │               文字居中
│       │               └── VerticalLayout (gap: 4px)
│       │                   ├── Label: 12px SLATE_400
│       │                   │   - "已击杀" | "剩余" | "总波数"
│       │                   │
│       │                   └── Value: 14px bold
│       │                       - 已击杀: RED_400 "12"
│       │                       - 剩余: AMBER_400 "3"
│       │                       - 总波数: GREEN_400 "5"
│       │
│       ├── ActionButtonsSection (技能操作区)
│       │   └── Container
│       │       └── GridLayout
│       │           ├── 第一行 (2列, 间距: 12px)
│       │           │   ├── SkillButton1 (御剑术)
│       │           │   │   尺寸: 自适应×自适应
│       │           │   │   背景: VIOLET_900
│       │           │   │   边框: 3px VIOLET_600
│       │           │   │   内边距: 12px
│       │           │   │   Hover: VIOLET_800
│       │           │   │   └── VerticalLayout (gap: 4px, 居中)
│       │           │   │       ├── IconBox
│       │           │   │       │   尺寸: 48×48px
│       │           │   │       │   背景: VIOLET_950
│       │           │   │       │   边框: 3px VIOLET_700
│       │           │   │       │   图标: Zap 24×24px VIOLET_400
│       │           │   │       │
│       │           │   │       ├── Name: 12px bold VIOLET_200 "御剑术"
│       │           │   │       └── Cooldown: 10px VIOLET_400 "冷却: 2秒"
│       │           │   │
│       │           │   └── SkillButton2 (金刚护体)
│       │           │       尺寸: 同上
│       │           │       背景: RED_900
│       │           │       边框: 3px RED_600
│       │           │       Hover: RED_800
│       │           │       └── VerticalLayout (结构同上)
│       │           │           ├── IconBox (RED系颜色)
│       │           │           │   图标: Shield 24×24px RED_400
│       │           │           ├── Name: "金刚护体"
│       │           │           └── Cooldown: "冷却: 10秒"
│       │           │
│       │           └── 第二行 (1列, 跨2列)
│       │               └── AttackButton
│       │                   尺寸: 全宽×自适应
│       │                   背景: AMBER_700
│       │                   边框: 3px AMBER_500
│       │                   内边距: 16px
│       │                   文字: 16px bold AMBER_100 "普通攻击"
│       │                   Hover: AMBER_600
│       │
│       └── RetreatButtonSection (撤退按钮)
│           内边距: 16px 0 0 0
│           └── RetreatButton
│               尺寸: 全宽×自适应
│               背景: SLATE_700
│               边框: 3px SLATE_500
│               内边距: 12px
│               文字: 14px bold SLATE_300 "撤退"
│               Hover: SLATE_600
│               点击: 返回 SecretPage
```

**数据结构**:
```typescript
interface BattleData {
  player: {
    name: string;         // "剑仙·逍遥"
    hp: number;           // 800
    maxHP: number;        // 1000
    mp: number;           // 300
    maxMP: number;        // 500
  };
  enemy: {
    name: string;         // "魔族先锋"
    hp: number;           // 450
    maxHP: number;        // 1000
  };
  wave: {
    current: number;      // 3
    killed: number;       // 12
    remaining: number;    // 3
    total: number;        // 5
  };
}

interface Skill {
  id: number;
  name: string;           // "御剑术" | "金刚护体"
  iconType: string;       // "Zap" | "Shield"
  cooldown: number;       // 2 | 10 (秒)
  mpCost: number;         // 50 | 100
  color: string;          // "violet" | "red"
}
```

**战斗逻辑实现**:
```typescript
// BattleManager.ts
export class BattleManager {
  private static instance: BattleManager = null;
  
  private battleData: BattleData = {
    player: { name: "剑仙·逍遥", hp: 800, maxHP: 1000, mp: 300, maxMP: 500 },
    enemy: { name: "魔族先锋", hp: 450, maxHP: 1000 },
    wave: { current: 3, killed: 12, remaining: 3, total: 5 }
  };

  static getInstance(): BattleManager {
    if (!this.instance) {
      this.instance = new BattleManager();
    }
    return this.instance;
  }

  useSkill(skillId: number): BattleResult {
    let damage = 0;
    let mpCost = 0;
    
    if (skillId === 1) { // 御剑术
      damage = 150;
      mpCost = 50;
    } else if (skillId === 2) { // 金刚护体
      // 增加护盾
      mpCost = 100;
    }
    
    // 扣除法力
    this.battleData.player.mp -= mpCost;
    
    // 造成伤害
    this.battleData.enemy.hp -= damage;
    
    // 检查敌人是否死亡
    if (this.battleData.enemy.hp <= 0) {
      this.onEnemyDefeated();
    }
    
    return { 
      damage, 
      playerHP: this.battleData.player.hp,
      enemyHP: this.battleData.enemy.hp
    };
  }

  normalAttack(): BattleResult {
    const damage = 50;
    this.battleData.enemy.hp -= damage;
    
    if (this.battleData.enemy.hp <= 0) {
      this.onEnemyDefeated();
    }
    
    return { damage, playerHP: this.battleData.player.hp, enemyHP: this.battleData.enemy.hp };
  }

  onEnemyDefeated() {
    this.battleData.wave.killed++;
    this.battleData.wave.remaining--;
    
    if (this.battleData.wave.remaining === 0) {
      // 进入下一波
      this.battleData.wave.current++;
      this.battleData.wave.remaining = 5; // 重置敌人数量
    }
    
    // 生成新敌人
    this.spawnEnemy();
  }

  spawnEnemy() {
    this.battleData.enemy = {
      name: "魔族先锋",
      hp: 1000,
      maxHP: 1000
    };
  }

  retreat() {
    // 返回秘境页面
    director.loadScene("SecretPage");
  }
}
```

---

## 数据管理系统

### DataManager (主数据管理器)

```typescript
// managers/DataManager.ts
import { _decorator } from 'cc';

export class DataManager {
    private static instance: DataManager = null;

    // === 玩家数据 ===
    private playerData = {
        name: "来取快递",
        realm: "金丹期",
        level: 10,
        exp: 8500,
        maxExp: 10000,
        gold: 99999,
        diamond: 888,
        power: 12580,
        hp: 800,
        maxHP: 1000,
        mp: 300,
        maxMP: 500
    };

    // === 装备数据 ===
    private equipment = [
        { id: "1", slot: "飞剑位", name: "青霜剑", level: 1, iconType: "Sword" },
        { id: "2", slot: "护符位", name: "玄甲符", level: 1, iconType: "Shield" },
        { id: "3", slot: "灵灯位", name: "寻宝灯", level: 1, iconType: "Lamp" }
    ];

    // === 属性数据 ===
    private stats = [
        { label: "境界", current: 0, max: 30, color: "purple", showAsText: true, textValue: "练气一层" },
        { label: "气血", current: 160, max: 160, color: "red" },
        { label: "法力", current: 88, max: 88, color: "blue" },
        { label: "行动力", current: 180, max: 180, color: "green" }
    ];

    // === 法器数据 ===
    private weapons = [
        { id: 1, name: "青锋剑", level: 10, rarity: 5, attack: 285, iconType: "Sword", equipped: true },
        { id: 2, name: "雷神锤", level: 8, rarity: 4, attack: 256, iconType: "Zap" },
        { id: 3, name: "玄武盾", level: 7, rarity: 4, attack: 198, iconType: "Shield" },
        { id: 4, name: "赤焰扇", level: 6, rarity: 3, attack: 167, iconType: "Flame" }
    ];

    // === 任务数据 ===
    private tasks = [
        { id: 1, name: "击败妖兽", reward: "经验+100", status: "进行中", progress: 5, total: 10 },
        { id: 2, name: "收集灵草", reward: "金币+50", status: "进行中", progress: 3, total: 5 },
        { id: 3, name: "炼制丹药", reward: "钻石+10", status: "未完成", progress: 0, total: 3 },
        { id: 4, name: "修炼功法", reward: "功法点+20", status: "可领取", progress: 5, total: 5 }
    ];

    // === 商品数据 ===
    private shopItems = [
        { id: 1, name: "灵石礼包", price: 100, currency: "钻石", stock: 99 },
        { id: 2, name: "经验丹", price: 50, currency: "金币", stock: 50 },
        { id: 3, name: "强化石", price: 80, currency: "金币", stock: 30 },
        { id: 4, name: "复活丹", price: 200, currency: "钻石", stock: 10 }
    ];

    // === 丹药数据 ===
    private pills = [
        { id: 1, name: "筑基丹", materials: "灵草x5", time: "2小时" },
        { id: 2, name: "洗髓丹", materials: "灵芝x3", time: "4小时" },
        { id: 3, name: "金丹", materials: "仙草x10", time: "8小时" }
    ];

    // === 炼器数据 ===
    private forgeList = [
        { id: 1, name: "玄铁重剑", level: 5, nextLevel: 6, materials: "精铁x10" },
        { id: 2, name: "金丝软甲", level: 3, nextLevel: 4, materials: "金线x8" },
        { id: 3, name: "护身玉佩", level: 2, nextLevel: 3, materials: "玉石x5" }
    ];

    // === 功法数据 ===
    private skills = [
        { id: 1, name: "九天玄功", level: 10, type: "内功", power: 150 },
        { id: 2, name: "剑气纵横", level: 8, type: "剑法", power: 120 },
        { id: 3, name: "凌波微步", level: 6, type: "身法", power: 90 },
        { id: 4, name: "降龙十八掌", level: 5, type: "掌法", power: 100 }
    ];

    // === 灵宠数据 ===
    private pets = [
        { id: 1, name: "白虎", level: 10, loyalty: 100, power: 200 },
        { id: 2, name: "青龙", level: 8, loyalty: 85, power: 180 },
        { id: 3, name: "朱雀", level: 6, loyalty: 70, power: 150 }
    ];

    // === 鱼类数据 ===
    private fishList = [
        { id: 1, name: "金鳞鲤", rarity: 4, weight: "2.5kg", value: 150 },
        { id: 2, name: "银鳞鱼", rarity: 3, weight: "1.8kg", value: 100 },
        { id: 3, name: "青鳞草鱼", rarity: 2, weight: "1.2kg", value: 50 }
    ];

    // === 建筑数据 ===
    private buildings = [
        { id: 1, name: "灵田", level: 5, production: "灵草x10/日" },
        { id: 2, name: "聚灵阵", level: 3, production: "灵力+50/时" },
        { id: 3, name: "藏宝阁", level: 2, production: "容量+100" }
    ];

    // === 秘境数据 ===
    private secrets = [
        { id: 1, name: "远古遗迹", status: "已开启", level: "Lv.10+", reward: "传说装备" },
        { id: 2, name: "仙人洞府", status: "已开启", level: "Lv.20+", reward: "仙品功法" },
        { id: 3, name: "神魔战场", status: "未解锁", level: "Lv.30+", reward: "神器" }
    ];

    static getInstance(): DataManager {
        if (!this.instance) {
            this.instance = new DataManager();
        }
        return this.instance;
    }

    // === Getter 方法 ===
    getPlayerData() { return { ...this.playerData }; }
    getEquipment() { return [...this.equipment]; }
    getStats() { return [...this.stats]; }
    getWeapons() { return [...this.weapons]; }
    getTasks() { return [...this.tasks]; }
    getShopItems() { return [...this.shopItems]; }
    getPills() { return [...this.pills]; }
    getForgeList() { return [...this.forgeList]; }
    getSkills() { return [...this.skills]; }
    getPets() { return [...this.pets]; }
    getFishList() { return [...this.fishList]; }
    getBuildings() { return [...this.buildings]; }
    getSecrets() { return [...this.secrets]; }

    // === 操作方法 ===
    addGold(amount: number) {
        this.playerData.gold += amount;
    }

    addDiamond(amount: number) {
        this.playerData.diamond += amount;
    }

    claimTask(taskId: number) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.status === "可领取") {
            task.status = "已完成";
            // 发放奖励逻辑
        }
    }

    buyItem(itemId: number) {
        const item = this.shopItems.find(i => i.id === itemId);
        if (item && item.stock > 0) {
            if (item.currency === "金币" && this.playerData.gold >= item.price) {
                this.playerData.gold -= item.price;
                item.stock--;
                return true;
            } else if (item.currency === "钻石" && this.playerData.diamond >= item.price) {
                this.playerData.diamond -= item.price;
                item.stock--;
                return true;
            }
        }
        return false;
    }
}
```

---

## 资源清单

### 图片资源 (位于 `/resources/images/`)

| 文件名 | 尺寸建议 | 用途 | 格式 |
|--------|---------|------|------|
| `avatar.jpg` | 200×200px | 角色头像 | JPG |
| `character.png` | 512×512px | 角色立绘 | PNG |
| `weapon.jpg` | 640×400px | 法器页主图 | JPG |
| `task.jpg` | 640×300px | 任务页主图 | JPG |
| `shop.jpg` | 640×300px | 商店页主图 | JPG |
| `alchemy.jpg` | 640×300px | 炼丹页主图 | JPG |
| `forge.jpg` | 640×300px | 炼器页主图 | JPG |
| `skill.jpg` | 640×300px | 功法页主图 | JPG |
| `pet.jpg` | 640×300px | 灵宠页主图 | JPG |
| `fishing.jpg` | 640×350px | 垂钓页主图 | JPG |
| `cave.jpg` | 640×350px | 洞天页主图 | JPG |
| `secret.jpg` | 640×300px | 秘境页主图 | JPG |
| `adventure-bg.png` | 640×400px | 战斗背景 | PNG |

### 图标资源 (使用字体图标或SVG)

推荐使用 [Iconfont](https://www.iconfont.cn/) 或直接在Cocos中绘制简单图标。

**需要的图标**:
- Coins (金币)
- Diamond (钻石)
- User (角色)
- Sword (剑)
- Shield (盾)
- Heart (心)
- Sparkles (星星)
- Mountain (山)
- Fish (鱼)
- Store (商店)
- Book (书)
- Flask (药瓶)
- Hammer (锤子)
- Zap (闪电)
- Trophy (奖杯)
- FileText (文档)

---

## 🚀 实施步骤总结

### 第1阶段：项目搭建 (1天)
1. 创建Cocos Creator项目
2. 设置Canvas为720×1280
3. 创建文件夹结构
4. 配置颜色常量

### 第2阶段：数据系统 (1天)
1. 实现DataManager
2. 定义所有数据接口
3. 编写测试用例

### 第3阶段：全局布局 (2天)
1. 创建TopBar组件
2. 创建NavigationBar组件
3. 创建BottomNavBar组件
4. 实现导航逻辑

### 第4阶段：页面开发 (6天)
1. 第1天: CharacterPage + WeaponPage
2. 第2天: TaskPage + ShopPage
3. 第3天: AlchemyPage + ForgePage
4. 第4天: SkillPage + PetPage
5. 第5天: FishingPage + CavePage
6. 第6天: SecretPage + AdventurePage

### 第5阶段：完善优化 (2天)
1. 实现战斗系统
2. 添加音效
3. 性能优化
4. Bug修复

### 第6阶段：测试发布 (1天)
1. 全功能测试
2. 打包发布

---

## 💡 开发建议

1. **先做UI后做逻辑**: 先完成所有页面的静态布局，再逐步添加交互
2. **使用预制体**: 列表项都做成Prefab，提高复用性
3. **统一组件命名**: 遵循命名规范，便于团队协作
4. **注释要详细**: 每个脚本都要有清晰的注释
5. **版本控制**: 使用Git管理代码，定期提交

---

**文档版本**: v2.0  
**最后更新**: 2025年3月31日  
**作者**: AI Assistant  
**适用引擎**: Cocos Creator 3.x

---

🎮 祝开发顺利！如有问题，请参考React源码进行对照实现。

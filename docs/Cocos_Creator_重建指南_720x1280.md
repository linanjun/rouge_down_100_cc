# Cocos Creator 重建指南 - 像素武侠修仙游戏角色界面
## 适配尺寸：720 x 1280

---

## 📋 目录

1. [项目概述](#项目概述)
2. [设计规范](#设计规范)
3. [场景结构](#场景结构)
4. [组件详细规格](#组件详细规格)
5. [脚本实现](#脚本实现)
6. [资源清单](#资源清单)
7. [实现步骤](#实现步骤)
8. [注意事项](#注意事项)

---

## 项目概述

### 界面类型
像素风格 RPG 武侠修仙游戏角色界面

### 屏幕规格
- **分辨率**: 720 x 1280 (竖屏)
- **适配模式**: 固定分辨率
- **UI 适配**: SHOW_ALL 或 EXACT_FIT

### 设计风格
- **风格**: 复古像素艺术风格
- **色调**: 深色石板灰配合金黄色边框
- **主题**: 中国武侠修仙

---

## 设计规范

### 🎨 颜色方案

#### 主色调
```
深色背景系列：
- slate-700: #334155
- slate-800: #1e293b
- slate-900: #0f172a
- slate-950: #020617

金色系列：
- amber-100: #fef3c7
- amber-200: #fde68a
- amber-300: #fcd34d
- amber-400: #fbbf24
- amber-500: #f59e0b
- amber-600: #d97706
- amber-700: #b45309
- amber-800: #92400e
- amber-900: #78350f
- amber-950: #451a03
```

#### 辅助色
```
蓝色系列（功法造诣）：
- blue-600: #2563eb
- blue-700: #1d4ed8
- blue-800: #1e40af
- blue-900: #1e3a8a
- blue-950: #172554

红色系列（气血）：
- red-800: #991b1b
- red-900: #7f1d1d

绿色系列（行动力）：
- green-800: #166534
- green-900: #14532d

青色系列（钻石）：
- cyan-400: #22d3ee
- cyan-600: #0891b2
- cyan-900: #164e63

黄色系列（装饰）：
- yellow-300: #fde047
- yellow-400: #facc15
```

### 📏 尺寸规范

#### 间距系统
```
极小间距: 4px (gap-1)
小间距: 6px (gap-1.5)
中间距: 8px (gap-2)
大间距: 12px (gap-3)
超大间距: 16px (gap-4)
```

#### 圆角规范
```
小圆角: 8px (rounded-lg)
大圆角: 12px (rounded-xl)
```

#### 边框规范
```
细边框: 2px (border-2)
中边框: 3px (border-3)
粗边框: 4px (border-4)
```

#### 文字大小
```
超小文字: 10px
小文字: 12px
中文字: 14px
大文字: 16px
标题文字: 18px
```

---

## 场景结构

### Canvas 设置
```
Canvas
├── 设计分辨率: 720 x 1280
├── 适配模式: SHOW_ALL
└── 渲染模式: SCREEN_SPACE_2D
```

### 完整节点树
```
Canvas (720 x 1280)
│
├── Background (720 x 1280)
│   └── Gradient (渐变背景 slate-700 → slate-900)
│
├── MainContainer (720 x 1280)
│   │
│   ├── HeaderSection (720 x 84) - 顶部信息栏
│   │   ├── Avatar (80 x 80) - 角色头像
│   │   ├── MiddleColumn (自适应宽度)
│   │   │   ├── NameBar (高度 40) - 名字栏
│   │   │   └── LevelBar (高度 36) - 境界栏
│   │   └── RightColumn (自适应宽度)
│   │       ├── GoldBar (高度 40) - 金币栏
│   │       └── DiamondBar (高度 36) - 钻石栏
│   │
│   ├── MainContent (696 x ~360) - 主内容区
│   │   ├── Border (装饰边框)
│   │   ├── CornerDecorations (四角装饰)
│   │   ├── TitleBanner (角色总览标题)
│   │   └── ContentGrid (2列布局)
│   │       ├── EquipmentPanel (左侧装备面板)
│   │       └── CharacterPanel (右侧角色形象)
│   │
│   ├── BottomPanels (696 x ~240) - 底部面板组
│   │   ├── StatsPanel (左侧基础属性)
│   │   └── SkillsPanel (右侧功法造诣)
│   │
│   ├── NavigationBar (696 x ~100) - 功能导航栏
│   │   └── NavButtons x 6 (任务/商店/炼丹/炼器/功法/灵宠)
│   │
│   └── BottomNavBar (696 x ~90) - 底部标签栏
│       └── TabButtons x 5 (本命法器/人物/境界/洞天/钓鱼)
```

---

## 组件详细规格

### 1️⃣ HeaderSection - 顶部信息栏

#### 整体布局
- **尺寸**: 720 x 84
- **内边距**: 左右各 8px, 上下各 8px
- **布局**: 三列网格 [80px | 1fr | 1fr]
- **列间距**: 8px

#### Avatar - 头像
```
尺寸: 80 x 80
边框: 3px, amber-600
圆角: 8px
背景: slate-800
阴影: 深色投影
内容: 角色头像图片
```

#### NameBar - 名字栏
```
高度: 40
内边距: 左右 16px, 上下 8px
背景: 渐变 amber-900/80 → amber-800/80
边框: 2px, amber-600
圆角: 8px
文字: 18px, 粗体, amber-100, 居中
内容: "来取快递"
```

#### LevelBar - 境界栏
```
高度: 36
内边距: 左右 16px, 上下 6px
背景: slate-700/90
边框: 2px, slate-500
圆角: 8px
文字: 12px, slate-200, 居中
内容: "练气一层 0/30"
```

#### GoldBar - 金币栏
```
高度: 40
内边距: 左右 12px, 上下 6px
背景: amber-900/80
边框: 2px, amber-600
圆角: 8px
布局: 水平排列, 图标+文字
图标: Coins, 20x20, amber-400
文字: 18px, 粗体, amber-100
内容: "999"
```

#### DiamondBar - 钻石栏
```
高度: 36
内边距: 左右 12px, 上下 6px
背景: cyan-900/80
边框: 2px, cyan-600
圆角: 8px
布局: 水平排列, 图标+文字
图标: Diamond, 20x20, cyan-400
文字: 18px, 粗体, cyan-100
内容: "999"
```

---

### 2️⃣ MainContent - 主内容区

#### 整体容器
```
尺寸: 696 x ~360
位置: 距离左右各 12px
内边距: 12px
背景: slate-800/50 半透明
边框: 3px, amber-700
圆角: 12px
阴影: 深色外投影
```

#### CornerDecorations - 四角装饰
```
尺寸: 每个 12 x 12
位置: 距离边缘 6px
样式: L形双边框
颜色: amber-500
粗细: 2px
```

#### TitleBanner - 标题横幅
```
主体:
- 内边距: 左右 24px, 上下 6px
- 背景: 渐变 blue-600 → blue-800
- 边框: 2px, amber-400
- 圆角: 8px
- 文字: 16px, 粗体, amber-200
- 内容: "角色总览"

左右装饰菱形:
- 尺寸: 20 x 20
- 位置: 左右各偏移 10px
- 旋转: 45度
- 背景: blue-700
- 边框: 2px, amber-400
```

---

### 3️⃣ EquipmentPanel - 装备面板

#### 容器
```
背景: slate-900/60
边框: 2px, slate-600
圆角: 8px
内边距: 8px
阴影: 内阴影
```

#### 小标题
```
内边距: 左右 16px, 上下 6px
背景: 渐变 amber-700 → amber-800
边框: 2px, amber-300
圆角: 8px
文字: 14px, 粗体, amber-100
内容: "本命法器"
```

#### EquipmentItem - 装备项 (3个)
```
整体:
- 高度: ~52
- 内边距: 8px
- 背景: 渐变 slate-800 → slate-700
- 边框: 2px, slate-600
- 圆角: 8px
- 悬停效果: 边框变为 amber-500
- 项目间距: 8px

图标区:
- 尺寸: 40 x 40
- 边框: 2px, amber-600
- 圆角: 8px
- 背景: slate-900
- 图标大小: 内部充满, 带内边距

文字区 (垂直排列):
1. 槽位名称: 10px, amber-400
2. 装备名称: 12px, 粗体, amber-100
3. 等级信息: 10px, slate-300 + 星星图标(10x10)

数据示例:
1. 飞剑位 - 青霜剑 Lv.1 (Sword图标, cyan-400)
2. 护符位 - 玄甲符 Lv.1 (Shield图标, amber-600)
3. 灵灯位 - 寻宝灯 Lv.1 (Lamp图标, amber-500)
```

---

### 4️⃣ CharacterPanel - 角色形象面板

#### 容器
```
尺寸: 宽度自适应, 最小高度 220
背景: 渐变 slate-700 → slate-800
边框: 2px, slate-600
圆角: 8px
内边距: 16px
阴影: 内阴影
```

#### 小标题
```
内边距: 左右 16px, 上下 6px
背景: 渐变 amber-700 → amber-800
边框: 2px, amber-300
圆角: 8px
文字: 14px, 粗体, amber-100
内容: "角色形象"
```

#### 装饰星光 (4个)
```
位置: 四个角落不同位置
尺寸: 10-12px 不等
颜色: yellow-300 / yellow-400
效果: 脉冲动画, 不同延迟
```

#### 修炼台座
```
尺寸: 112 x 28
位置: 底部居中
背景: 渐变 amber-800 → amber-900
边框: 3px, amber-700
形状: 椭圆形
阴影: 深色投影

内部装饰环:
- 距离边缘 6px
- 边框 2px, amber-600
- 椭圆形
```

#### 角色图像
```
尺寸: 112 x 112
位置: 中央
图片: 角色立绘
效果: 
- 径向渐变光晕背景 (amber-500/20)
- 脉冲动画
- 底部发光效果 (80x16, amber-500/30, 模糊)
```

---

### 5️⃣ StatsPanel - 基础属性面板

#### 容器
```
背景: 渐变 amber-900/40 → amber-800/40
边框: 3px, amber-700
圆角: 12px
内边距: 12px
阴影: 深色投影

装饰网格背景:
- 4x4 网格
- 每格 12x12
- 边框 1px, amber-900
- 不透明度 5%
```

#### 标题
```
内边距: 左右 16px, 上下 6px
背景: 渐变 amber-700 → amber-800
边框: 2px, amber-400
圆角: 8px
文字: 14px, 粗体, amber-100
内容: "基础属性"
```

#### StatItem - 属性项 (3个)
```
整体:
- 高度: ~44
- 内边距: 8px
- 背景: amber-950/60
- 边框: 2px, amber-800
- 圆角: 8px
- 项目间距: 8px

属性标签:
- 内边距: 左右 12px, 上下 2px
- 背景: 渐变 amber-900 → amber-800
- 边框: 1px, amber-700
- 圆角: 4px
- 文字: 12px, 粗体, amber-100

进度条容器:
- 高度: 6px
- 背景: slate-900
- 边框: 1px, slate-700
- 圆角: 全圆角

进度条填充:
- 高度: 100%
- 宽度: 根据当前值/最大值
- 渐变背景 (根据类型)
- 过渡动画

数值显示:
- 文字: 14px, 粗体, amber-200
- 最小宽度: 70px
- 对齐: 右对齐

数据示例:
1. 气血 160/160 (red-800 → red-900)
2. 法力 88/88 (blue-800 → blue-900)
3. 行动力 180/180 (green-800 → green-900)
```

---

### 6️⃣ SkillsPanel - 功法造诣面板

#### 容器
```
背景: 渐变 blue-900/40 → blue-800/40
边框: 3px, blue-700
圆角: 12px
内边距: 12px
阴影: 深色投影

装饰网格背景:
- 4x4 网格
- 每格 12x12
- 边框 1px, blue-900
- 不透明度 5%
```

#### 标题
```
内边距: 左右 16px, 上下 6px
背景: 渐变 blue-700 → blue-800
边框: 2px, amber-400
圆角: 8px
文字: 14px, 粗体, amber-100
内容: "功法造诣"
```

#### SkillItem - 技能项 (4个)
```
整体:
- 高度: ~40
- 内边距: 8px
- 背景: blue-950/60
- 边框: 2px, blue-800
- 圆角: 8px
- 项目间距: 8px

技能名称:
- 文字: 12px, 粗体, blue-100
- 内容: 包含名称和等级

进度条容器:
- 宽度: 96px
- 高度: 6px
- 背景: slate-900
- 边框: 1px, slate-700
- 圆角: 全圆角

进度条填充:
- 高度: 100%
- 渐变: blue-600 → blue-400
- 过渡动画

进度数值:
- 文字: 12px, 粗体, blue-200
- 最小宽度: 45px
- 对齐: 右对齐

数据示例:
1. 炼丹术 Lv.1 0/13
2. 炼器术 Lv.1 0/13
3. 灵宠诀 Lv.1 0/13
4. 清心诀 Lv.1 0/13
```

---

### 7️⃣ NavigationBar - 功能导航栏

#### 容器
```
尺寸: 696 x ~100
位置: 距离左右各 12px
背景: 渐变 slate-800 → slate-900
边框: 3px, amber-700
圆角: 12px
内边距: 8px
阴影: 深色投影
```

#### NavButton - 导航按钮 (6个)
```
布局: 6列网格, 间距 6px

每个按钮:
- 内边距: 6px
- 背景: 渐变 slate-700 → slate-800
- 边框: 2px, slate-600
- 圆角: 8px
- 悬停: 边框变 amber-500
- 过渡动画

图标容器:
- 尺寸: 36 x 36
- 背景: slate-900
- 边框: 2px, amber-600
- 圆角: 8px
- 阴影: 内阴影
- 悬停: 背景变 slate-800

图标:
- 尺寸: 20 x 20
- 颜色: amber-400
- 悬停: amber-300

标签:
- 文字: 10px, 粗体
- 颜色: amber-100
- 悬停: amber-200

按钮列表:
1. 任务 (FileText图标)
2. 商店 (Store图标)
3. 炼丹 (FlaskConical图标)
4. 炼器 (Trophy图标)
5. 功法 (BookOpen图标)
6. 灵宠 (Heart图标)
```

---

### 8️⃣ BottomNavBar - 底部标签栏

#### 容器
```
尺寸: 696 x ~90
位置: 距离左右各 12px, 底部 8px
背景: 渐变 slate-800 → slate-900
边框: 3px, amber-700
圆角: 12px
内边距: 8px
阴影: 深色投影
```

#### TabButton - 标签按钮 (5个)
```
布局: 5列网格, 间距 6px

普通状态:
- 内边距: 6px
- 背景: 渐变 slate-700 → slate-800
- 边框: 2px, slate-600
- 圆角: 8px
- 悬停: 边框变 amber-500

激活状态:
- 背景: 渐变 amber-700 → amber-800
- 边框: 2px, amber-500
- 阴影: amber-900/50

图标容器 (普通):
- 尺寸: 36 x 36
- 背景: slate-900
- 边框: 2px, slate-700
- 圆角: 8px
- 悬停: slate-800

图标容器 (激活):
- 背景: amber-900
- 边框: 2px, amber-600

图标 (普通):
- 尺寸: 20 x 20
- 颜色: slate-400
- 悬停: amber-400

图标 (激活):
- 颜色: amber-200

标签 (普通):
- 文字: 10px, 粗体
- 颜色: slate-300
- 悬停: amber-200

标签 (激活):
- 颜色: amber-100

按钮列表:
1. 本命法器 (Sword图标) - 激活
2. 人物 (User图标)
3. 境界 (Globe图标)
4. 洞天 (Mountain图标)
5. 钓鱼 (Fish图标)
```

---

## 脚本实现

### 1. 数据管理脚本

#### PlayerDataManager.ts
```typescript
import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

export interface PlayerData {
    name: string;
    level: number;
    currentExp: number;
    maxExp: number;
    gold: number;
    diamond: number;
}

export interface PlayerStats {
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    stamina: number;
    maxStamina: number;
}

export interface EquipmentData {
    slot: string;
    name: string;
    level: number;
    iconType: string;
}

export interface SkillData {
    name: string;
    level: number;
    current: number;
    max: number;
}

@ccclass('PlayerDataManager')
export class PlayerDataManager extends Component {
    private static _instance: PlayerDataManager = null;

    public playerData: PlayerData = {
        name: '来取快递',
        level: 1,
        currentExp: 0,
        maxExp: 30,
        gold: 999,
        diamond: 999
    };

    public playerStats: PlayerStats = {
        health: 160,
        maxHealth: 160,
        mana: 88,
        maxMana: 88,
        stamina: 180,
        maxStamina: 180
    };

    public equipment: EquipmentData[] = [
        { slot: '飞剑位', name: '青霜剑', level: 1, iconType: 'sword' },
        { slot: '护符位', name: '玄甲符', level: 1, iconType: 'shield' },
        { slot: '灵灯位', name: '寻宝灯', level: 1, iconType: 'lamp' }
    ];

    public skills: SkillData[] = [
        { name: '炼丹术', level: 1, current: 0, max: 13 },
        { name: '炼器术', level: 1, current: 0, max: 13 },
        { name: '灵宠诀', level: 1, current: 0, max: 13 },
        { name: '清心诀', level: 1, current: 0, max: 13 }
    ];

    public static getInstance(): PlayerDataManager {
        return this._instance;
    }

    onLoad() {
        if (PlayerDataManager._instance === null) {
            PlayerDataManager._instance = this;
        }
    }

    // 更新金币
    public updateGold(amount: number) {
        this.playerData.gold = Math.max(0, this.playerData.gold + amount);
    }

    // 更新钻石
    public updateDiamond(amount: number) {
        this.playerData.diamond = Math.max(0, this.playerData.diamond + amount);
    }

    // 更新经验
    public addExp(amount: number) {
        this.playerData.currentExp += amount;
        while (this.playerData.currentExp >= this.playerData.maxExp) {
            this.levelUp();
        }
    }

    // 升级
    private levelUp() {
        this.playerData.level++;
        this.playerData.currentExp -= this.playerData.maxExp;
        this.playerData.maxExp = Math.floor(this.playerData.maxExp * 1.5);
        console.log(`升级到 ${this.playerData.level} 级！`);
    }
}
```

---

### 2. UI 组件脚本

#### HeaderUI.ts
```typescript
import { _decorator, Component, Label, Sprite, Node } from 'cc';
import { PlayerDataManager } from './PlayerDataManager';
const { ccclass, property } = _decorator;

@ccclass('HeaderUI')
export class HeaderUI extends Component {
    @property(Label)
    nameLabel: Label = null;

    @property(Label)
    levelLabel: Label = null;

    @property(Label)
    goldLabel: Label = null;

    @property(Label)
    diamondLabel: Label = null;

    @property(Sprite)
    avatarSprite: Sprite = null;

    start() {
        this.updateUI();
    }

    updateUI() {
        const data = PlayerDataManager.getInstance();
        if (!data) return;

        // 更新名字
        if (this.nameLabel) {
            this.nameLabel.string = data.playerData.name;
        }

        // 更新等级
        if (this.levelLabel) {
            const exp = `${data.playerData.currentExp}/${data.playerData.maxExp}`;
            this.levelLabel.string = `练气${data.playerData.level}层 ${exp}`;
        }

        // 更新金币
        if (this.goldLabel) {
            this.goldLabel.string = data.playerData.gold.toString();
        }

        // 更新钻石
        if (this.diamondLabel) {
            this.diamondLabel.string = data.playerData.diamond.toString();
        }
    }
}
```

#### EquipmentItemUI.ts
```typescript
import { _decorator, Component, Label, Sprite, Color } from 'cc';
import { EquipmentData } from './PlayerDataManager';
const { ccclass, property } = _decorator;

@ccclass('EquipmentItemUI')
export class EquipmentItemUI extends Component {
    @property(Label)
    slotLabel: Label = null;

    @property(Label)
    nameLabel: Label = null;

    @property(Label)
    levelLabel: Label = null;

    @property(Sprite)
    iconSprite: Sprite = null;

    @property(Node)
    starNode: Node = null;

    public setData(data: EquipmentData) {
        // 设置槽位
        if (this.slotLabel) {
            this.slotLabel.string = data.slot;
        }

        // 设置名称
        if (this.nameLabel) {
            this.nameLabel.string = data.name;
        }

        // 设置等级
        if (this.levelLabel) {
            this.levelLabel.string = `Lv.${data.level}`;
        }

        // 设置图标颜色（根据类型）
        if (this.iconSprite) {
            switch (data.iconType) {
                case 'sword':
                    this.iconSprite.color = new Color(34, 211, 238); // cyan-400
                    break;
                case 'shield':
                    this.iconSprite.color = new Color(217, 119, 6); // amber-600
                    break;
                case 'lamp':
                    this.iconSprite.color = new Color(245, 158, 11); // amber-500
                    break;
            }
        }
    }
}
```

#### StatItemUI.ts
```typescript
import { _decorator, Component, Label, Sprite, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StatItemUI')
export class StatItemUI extends Component {
    @property(Label)
    statLabel: Label = null;

    @property(Label)
    valueLabel: Label = null;

    @property(Sprite)
    progressBar: Sprite = null;

    public setData(statName: string, current: number, max: number) {
        // 设置属性名
        if (this.statLabel) {
            this.statLabel.string = statName;
        }

        // 设置数值
        if (this.valueLabel) {
            this.valueLabel.string = `${current}/${max}`;
        }

        // 设置进度条
        if (this.progressBar) {
            const progress = current / max;
            this.progressBar.fillRange = progress;
        }
    }
}
```

#### SkillItemUI.ts
```typescript
import { _decorator, Component, Label, Sprite } from 'cc';
import { SkillData } from './PlayerDataManager';
const { ccclass, property } = _decorator;

@ccclass('SkillItemUI')
export class SkillItemUI extends Component {
    @property(Label)
    skillNameLabel: Label = null;

    @property(Label)
    progressLabel: Label = null;

    @property(Sprite)
    progressBar: Sprite = null;

    public setData(data: SkillData) {
        // 设置技能名称和等级
        if (this.skillNameLabel) {
            this.skillNameLabel.string = `${data.name} Lv.${data.level}`;
        }

        // 设置进度数值
        if (this.progressLabel) {
            this.progressLabel.string = `${data.current}/${data.max}`;
        }

        // 设置进度条
        if (this.progressBar) {
            const progress = data.current / data.max;
            this.progressBar.fillRange = progress;
        }
    }
}
```

#### NavigationButton.ts
```typescript
import { _decorator, Component, Node, Label, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NavigationButton')
export class NavigationButton extends Component {
    @property(Label)
    buttonLabel: Label = null;

    @property(Sprite)
    iconSprite: Sprite = null;

    @property(Node)
    iconContainer: Node = null;

    @property
    buttonName: string = '';

    public setData(name: string) {
        this.buttonName = name;
        if (this.buttonLabel) {
            this.buttonLabel.string = name;
        }
    }

    public onClick() {
        console.log(`点击了 ${this.buttonName} 按钮`);
        // 这里添加按钮点击逻辑
    }
}
```

#### TabButton.ts
```typescript
import { _decorator, Component, Node, Label, Sprite, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TabButton')
export class TabButton extends Component {
    @property(Label)
    tabLabel: Label = null;

    @property(Sprite)
    iconSprite: Sprite = null;

    @property(Node)
    buttonNode: Node = null;

    @property(Node)
    iconContainer: Node = null;

    @property
    tabName: string = '';

    @property
    isActive: boolean = false;

    start() {
        this.updateState();
    }

    public setActive(active: boolean) {
        this.isActive = active;
        this.updateState();
    }

    private updateState() {
        // 这里根据激活状态更新UI
        // 在Cocos中需要通过修改节点颜色或切换Sprite来实现
        if (this.isActive) {
            console.log(`${this.tabName} 标签已激活`);
        }
    }

    public onClick() {
        console.log(`点击了 ${this.tabName} 标签`);
        // 这里添加标签切换逻辑
    }
}
```

---

### 3. 主场景管理脚本

#### MainSceneManager.ts
```typescript
import { _decorator, Component, Node, instantiate, Prefab } from 'cc';
import { PlayerDataManager } from './PlayerDataManager';
import { HeaderUI } from './HeaderUI';
import { EquipmentItemUI } from './EquipmentItemUI';
import { StatItemUI } from './StatItemUI';
import { SkillItemUI } from './SkillItemUI';
const { ccclass, property } = _decorator;

@ccclass('MainSceneManager')
export class MainSceneManager extends Component {
    @property(HeaderUI)
    headerUI: HeaderUI = null;

    @property(Node)
    equipmentContainer: Node = null;

    @property(Prefab)
    equipmentItemPrefab: Prefab = null;

    @property(Node)
    statsContainer: Node = null;

    @property(Prefab)
    statItemPrefab: Prefab = null;

    @property(Node)
    skillsContainer: Node = null;

    @property(Prefab)
    skillItemPrefab: Prefab = null;

    start() {
        this.initUI();
    }

    private initUI() {
        const dataManager = PlayerDataManager.getInstance();
        if (!dataManager) return;

        // 初始化装备列表
        this.initEquipmentList(dataManager);

        // 初始化属性列表
        this.initStatsList(dataManager);

        // 初始化技能列表
        this.initSkillsList(dataManager);

        // 更新头部UI
        if (this.headerUI) {
            this.headerUI.updateUI();
        }
    }

    private initEquipmentList(dataManager: PlayerDataManager) {
        if (!this.equipmentContainer || !this.equipmentItemPrefab) return;

        dataManager.equipment.forEach(equipData => {
            const itemNode = instantiate(this.equipmentItemPrefab);
            const itemUI = itemNode.getComponent(EquipmentItemUI);
            if (itemUI) {
                itemUI.setData(equipData);
            }
            this.equipmentContainer.addChild(itemNode);
        });
    }

    private initStatsList(dataManager: PlayerDataManager) {
        if (!this.statsContainer || !this.statItemPrefab) return;

        const stats = [
            { name: '气血', current: dataManager.playerStats.health, max: dataManager.playerStats.maxHealth },
            { name: '法力', current: dataManager.playerStats.mana, max: dataManager.playerStats.maxMana },
            { name: '行动力', current: dataManager.playerStats.stamina, max: dataManager.playerStats.maxStamina }
        ];

        stats.forEach(stat => {
            const itemNode = instantiate(this.statItemPrefab);
            const itemUI = itemNode.getComponent(StatItemUI);
            if (itemUI) {
                itemUI.setData(stat.name, stat.current, stat.max);
            }
            this.statsContainer.addChild(itemNode);
        });
    }

    private initSkillsList(dataManager: PlayerDataManager) {
        if (!this.skillsContainer || !this.skillItemPrefab) return;

        dataManager.skills.forEach(skillData => {
            const itemNode = instantiate(this.skillItemPrefab);
            const itemUI = itemNode.getComponent(SkillItemUI);
            if (itemUI) {
                itemUI.setData(skillData);
            }
            this.skillsContainer.addChild(itemNode);
        });
    }
}
```

---

## 资源清单

### 图片资源

#### UI元素
```
1. 角色头像 (80x80)
   - avatar.png
   
2. 角色立绘 (112x112 或更大)
   - character_image.png
   
3. 图标资源 (建议20x20, 支持多倍图)
   - icon_sword.png (剑)
   - icon_shield.png (盾)
   - icon_lamp.png (灯)
   - icon_coin.png (金币)
   - icon_diamond.png (钻石)
   - icon_star.png (星星)
   - icon_sparkle.png (星光)
   - icon_task.png (任务)
   - icon_shop.png (商店)
   - icon_alchemy.png (炼丹)
   - icon_forge.png (炼器)
   - icon_skill.png (功法)
   - icon_pet.png (灵宠)
   - icon_user.png (人物)
   - icon_globe.png (境界)
   - icon_mountain.png (洞天)
   - icon_fish.png (钓鱼)
```

#### 背景和装饰
```
4. 渐变背景
   - background_gradient.png (720x1280)
   
5. 装饰元素
   - corner_decoration.png (边角装饰)
   - border_pattern.png (边框纹理)
   - glow_effect.png (光晕效果)
```

### 字体资源
```
推荐字体:
- 标题: 像素字体或宋体加粗
- 正文: 像素字体或黑体

字体文件:
- PixelFont.ttf (像素字体)
- ChineseFont.ttf (中文字体)
```

### 音效资源
```
1. button_click.mp3 (按钮点击)
2. tab_switch.mp3 (标签切换)
3. level_up.mp3 (升级音效)
4. equipment_equip.mp3 (装备穿戴)
```

---

## 实现步骤

### 第一阶段：项目初始化 (30分钟)

#### 1. 创建项目
```
1. 打开 Cocos Creator
2. 新建项目 "WuxiaCharacterUI"
3. 选择 2D 项目模板
4. 设置设计分辨率: 720 x 1280
```

#### 2. 配置项目设置
```
项目设置 -> 项目数据:
- 设计分辨率: 720 x 1280
- 适配屏幕宽度: 是
- 适配屏幕高度: 是

构建发布:
- 目标平台: 微信小游戏 / H5 / 原生
```

#### 3. 导入资源
```
1. 创建文件夹结构:
   assets/
   ├── Textures/       (图片资源)
   ├── Fonts/          (字体资源)
   ├── Audio/          (音效资源)
   ├── Scripts/        (脚本文件)
   ├── Prefabs/        (预制体)
   └── Scenes/         (场景文件)

2. 导入所有资源到对应文件夹
3. 设置图片资源为 Sprite 类型
4. 配置九宫格 (如果有边框需要拉伸)
```

---

### 第二阶段：创建基础场景结构 (1小时)

#### 1. 创建 Canvas
```
1. 在场景中创建 Canvas 节点
2. 设置 Canvas 组件:
   - 设计分辨率: 720 x 1280
   - 适配模式: SHOW_ALL
   - 对齐方式: 中央对齐
```

#### 2. 创建背景层
```
1. 在 Canvas 下创建 Background 节点
2. 添加 Sprite 组件
3. 设置渐变背景图片
4. 尺寸: 720 x 1280
5. 位置: (0, 0)
```

#### 3. 创建主容器
```
1. 创建 MainContainer 节点
2. 添加 Widget 组件:
   - 对齐方式: 四边对齐
   - 边距: 0
3. 添加 Layout 组件:
   - 类型: VERTICAL
   - 间距: 8
   - 对齐: 顶部对齐
```

---

### 第三阶段：构建顶部信息栏 (1小时)

#### 1. 创建 HeaderSection
```
1. 创建节点 "HeaderSection"
2. 尺寸: 720 x 84
3. 添加 Layout 组件:
   - 类型: HORIZONTAL
   - 间距: 8
   - 内边距: 8
```

#### 2. 创建头像
```
1. 创建 "Avatar" 节点
2. 尺寸: 80 x 80
3. 添加 Sprite 组件 (头像图片)
4. 添加边框节点:
   - 使用 Sprite 的九宫格
   - 或创建子节点作为边框
5. 设置圆角 (使用遮罩或圆角图片)
```

#### 3. 创建中间列 (名字+境界)
```
1. 创建 "MiddleColumn" 节点
2. 添加 Layout 组件:
   - 类型: VERTICAL
   - 间距: 6
3. 创建 "NameBar":
   - 高度: 40
   - 添加背景 Sprite
   - 添加 Label (名字)
4. 创建 "LevelBar":
   - 高度: 36
   - 添加背景 Sprite
   - 添加 Label (境界信息)
```

#### 4. 创建右侧列 (金币+钻石)
```
1. 创建 "RightColumn" 节点
2. 添加 Layout 组件:
   - 类型: VERTICAL
   - 间距: 6
3. 创建 "GoldBar":
   - 高度: 40
   - 添加背景 Sprite
   - 添加图标 Sprite
   - 添加数值 Label
4. 创建 "DiamondBar":
   - 高度: 36
   - 添加背景 Sprite
   - 添加图标 Sprite
   - 添加数值 Label
```

---

### 第四阶段：构建主内容区 (2小时)

#### 1. 创建 MainContent 容器
```
1. 创建 "MainContent" 节点
2. 尺寸: 696 x 360
3. 添加背景 Sprite
4. 创建四角装饰节点
5. 创建标题横幅节点
```

#### 2. 创建装备面板
```
1. 创建 "EquipmentPanel" 节点
2. 添加背景和标题
3. 创建装备项预制体:
   - 图标容器
   - 文字区域 (槽位、名称、等级)
4. 实例化3个装备项
5. 添加 Layout 组件排列
```

#### 3. 创建角色形象面板
```
1. 创建 "CharacterPanel" 节点
2. 添加背景
3. 添加标题
4. 创建台座节点
5. 创建角色图像节点
6. 添加装饰星光节点 (4个)
7. 添加光晕效果节点
8. 配置动画:
   - 星光闪烁动画
   - 光晕脉冲动画
```

---

### 第五阶段：构建底部面板 (1.5小时)

#### 1. 创建基础属性面板
```
1. 创建 "StatsPanel" 节点
2. 添加背景装饰
3. 添加标题
4. 创建属性项预制体:
   - 属性标签
   - 进度条
   - 数值显示
5. 实例化3个属性项
6. 配置进度条:
   - 使用 Sprite 的 fillRange
   - 或使用 ProgressBar 组件
```

#### 2. 创建功法造诣面板
```
1. 创建 "SkillsPanel" 节点
2. 添加背景装饰
3. 添加标题
4. 创建技能项预制体:
   - 技能名称和等级
   - 进度条
   - 进度数值
5. 实例化4个技能项
6. 配置进度条
```

---

### 第六阶段：构建导航栏 (1小时)

#### 1. 创建功能导航栏
```
1. 创建 "NavigationBar" 节点
2. 添加背景
3. 创建导航按钮预制体:
   - 图标容器
   - 图标 Sprite
   - 标签 Label
   - Button 组件
4. 实例化6个按钮
5. 添加 GridLayout 组件:
   - 列数: 6
   - 间距: 6
```

#### 2. 创建底部标签栏
```
1. 创建 "BottomNavBar" 节点
2. 添加背景
3. 创建标签按钮预制体:
   - 图标容器
   - 图标 Sprite
   - 标签 Label
   - Button 组件
   - 激活状态切换逻辑
4. 实例化5个按钮
5. 添加 GridLayout 组件:
   - 列数: 5
   - 间距: 6
6. 设置默认激活项
```

---

### 第七阶段：添加脚本逻辑 (2小时)

#### 1. 创建数据管理脚本
```
1. 创建 PlayerDataManager.ts
2. 定义数据结构
3. 实现单例模式
4. 添加数据更新方法
5. 挂载到场景持久节点
```

#### 2. 创建UI控制脚本
```
1. 创建各个UI组件脚本
2. 实现数据绑定
3. 添加更新方法
4. 挂载到对应节点
```

#### 3. 实现交互逻辑
```
1. 为按钮添加点击事件
2. 实现标签切换逻辑
3. 添加悬停效果
4. 实现数据更新响应
```

---

### 第八阶段：优化和调试 (1小时)

#### 1. 性能优化
```
1. 合并图集
2. 减少Draw Call
3. 优化节点层级
4. 使用对象池 (如果需要)
```

#### 2. 适配测试
```
1. 测试不同分辨率
2. 测试不同宽高比
3. 调整Widget和Layout
4. 确保界面正常显示
```

#### 3. 细节打磨
```
1. 添加过渡动画
2. 添加音效
3. 调整颜色和间距
4. 优化交互反馈
```

---

## 注意事项

### ⚠️ 重要提醒

#### 1. Cocos Creator 版本
```
推荐版本: 3.6.0 及以上
- API 相对稳定
- TypeScript 支持完善
- 组件系统完整
```

#### 2. 渐变色处理
```
Cocos 不直接支持 CSS 渐变，需要:
方案1: 使用渐变图片
方案2: 使用多个节点叠加
方案3: 使用 Shader 实现
推荐: 使用渐变图片，最简单高效
```

#### 3. 圆角处理
```
Cocos Sprite 不支持 CSS 圆角，需要:
方案1: 使用圆角图片
方案2: 使用 Mask 遮罩
方案3: 使用九宫格图片
推荐: 直接使用圆角图片
```

#### 4. 阴影效果
```
Cocos 不直接支持 CSS shadow，需要:
方案1: 图片带阴影
方案2: 使用半透明节点叠加
方案3: 使用 Shader
推荐: 图片自带阴影
```

#### 5. 图标处理
```
Web 版使用 lucide-react 图标库
Cocos 需要:
方案1: 导出为 SVG 再转 PNG
方案2: 使用字体图标
方案3: 使用 IconFont
推荐: 使用 PNG 图片，兼容性最好
```

#### 6. 字体处理
```
像素风格字体:
1. 使用 BMFont 生成位图字体
2. 或使用 TTF 字体文件
3. 注意中文字体文件大小
4. 考虑使用系统字体降低包体
```

#### 7. 布局系统差异
```
Tailwind (Web):
- 使用 Flexbox / Grid
- 自动计算尺寸
- 响应式布局

Cocos:
- 使用 Layout 组件
- 手动设置尺寸
- 使用 Widget 做适配
```

#### 8. 性能考虑
```
1. 合理使用图集
2. 减少节点数量
3. 避免频繁更新UI
4. 使用对象池
5. 注意内存泄漏
```

---

## 常见问题解决

### Q1: 如何实现渐变背景？
```
A: 在 Photoshop 或其他工具中创建渐变图片，
   导出为 PNG，在 Cocos 中作为 Sprite 使用。
```

### Q2: 如何实现圆角边框？
```
A: 使用带圆角的九宫格图片，设置适当的
   九宫格参数，可以自适应不同尺寸。
```

### Q3: 如何实现进度条？
```
A: 使用 ProgressBar 组件，或使用 Sprite
   的 fillRange 属性实现填充效果。
```

### Q4: 如何实现星光闪烁动画？
```
A: 使用 Animation 组件或 Tween 动画，
   修改节点的 opacity 或 scale 属性。
```

### Q5: 如何实现按钮悬停效果？
```
A: 在 Web 上使用 :hover，在 Cocos 中需要
   监听 Node.EventType.MOUSE_ENTER 和
   MOUSE_LEAVE 事件。
```

### Q6: 如何优化 Draw Call？
```
A: 
1. 将UI元素打包成图集
2. 使用相同材质
3. 减少节点数量
4. 合理使用批处理
```

### Q7: 如何适配不同分辨率？
```
A: 
1. 使用 Widget 组件做边缘对齐
2. 使用 Layout 组件自动排列
3. 使用相对尺寸而非绝对尺寸
4. 测试多种分辨率
```

### Q8: 数据如何持久化？
```
A: 使用 Cocos 的 sys.localStorage 或
   连接服务器保存数据。
```

---

## 扩展功能建议

### 1. 动画效果
```
- 界面打开/关闭动画
- 按钮点击缩放动画
- 数值变化数字跳动
- 升级特效
- 装备穿戴特效
```

### 2. 音效配置
```
- 按钮点击音效
- 标签切换音效
- 升级音效
- 金币变化音效
- 装备穿戴音效
```

### 3. 交互优化
```
- 长按查看详情
- 拖拽装备
- 滑动翻页
- 下拉刷新
- 加载动画
```

### 4. 视觉特效
```
- 粒子特效
- 光晕特效
- 轨迹特效
- 震屏效果
- 颜色闪烁
```

---

## 资源链接

### 推荐工具
```
1. Cocos Creator 官网: https://www.cocos.com/
2. TexturePacker: 图集打包工具
3. BMFont: 位图字体生成器
4. Photoshop: 图片处理
5. Figma: UI设计
```

### 学习资源
```
1. Cocos Creator 官方文档
2. Cocos Creator API 文档
3. Cocos 论坛
4. GitHub 示例项目
```

---

## 总结

本指南提供了完整的 Cocos Creator 重建方案，包括：

✅ **详细的设计规范** - 颜色、尺寸、布局
✅ **完整的场景结构** - 节点层级、组件配置
✅ **实用的脚本示例** - 数据管理、UI控制
✅ **清晰的实现步骤** - 从零开始的完整流程
✅ **实用的注意事项** - 避坑指南、最佳实践

### 预计开发时间
- 熟练开发者: 8-10 小时
- 新手开发者: 15-20 小时

### 最终效果
完全复刻 720x1280 版本的像素武侠修仙游戏角色界面，
保持原有设计风格和交互效果。

---

**祝开发顺利！如有问题欢迎反馈。** 🎮✨

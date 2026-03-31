# Cocos Creator 重建指南
## 像素风格RPG武侠修仙游戏角色界面

---

## 📋 目录

1. [总体概述](#总体概述)
2. [设计规范](#设计规范)
3. [画布配置](#画布配置)
4. [UI层级结构](#UI层级结构)
5. [组件详细规格](#组件详细规格)
6. [资源清单](#资源清单)
7. [实现步骤](#实现步骤)
8. [脚本逻辑](#脚本逻辑)

---

## 总体概述

### 界面类型
- **游戏类型**: 像素风格RPG武侠修仙游戏
- **界面功能**: 角色属性总览界面
- **屏幕方向**: 竖屏 (Portrait)
- **设计分辨率**: 720x1280

### 设计风格
- **艺术风格**: 扁平化像素艺术
- **主色调**: 深色调石板灰 (#1e293b, #334155)
- **强调色**: 金黄色 (#d97706, #f59e0b, #fbbf24)
- **辅助色**: 青色钻石色 (#0e7490, #06b6d4)
- **重要原则**: **禁用所有渐变色、圆角和阴影效果**

---

## 设计规范

### 颜色方案 (RGB Hex)

#### 主背景色
- **外背景**: `#1e293b` (slate-800)
- **内容区背景**: `#0f172a` (slate-900)
- **组件背景**: `#334155` (slate-700)
- **深色背景**: `#020617` (slate-950)

#### 琥珀金色系 (主题色)
- **琥珀深色**: `#78350f` (amber-900)
- **琥珀中色**: `#b45309` (amber-800)
- **琥珀边框**: `#d97706` (amber-600)
- **琥珀高亮**: `#f59e0b` (amber-500)
- **琥珀浅色**: `#fbbf24` (amber-400)
- **琥珀文字**: `#fef3c7` (amber-100)

#### 石板灰色系
- **石板深色**: `#334155` (slate-700)
- **石板边框**: `#475569` (slate-600)
- **石板中色**: `#64748b` (slate-500)
- **石板文字**: `#cbd5e1` (slate-300)
- **石板浅文字**: `#e2e8f0` (slate-200)

#### 钻石青色系
- **青色深色**: `#164e63` (cyan-900)
- **青色边框**: `#0891b2` (cyan-600)
- **青色高亮**: `#06b6d4` (cyan-500)
- **青色图标**: `#22d3ee` (cyan-400)
- **青色文字**: `#cffafe` (cyan-100)

#### 状态色
- **红色(气血)**: `#991b1b` (red-800)
- **蓝色(法力)**: `#1e3a8a` (blue-800)
- **绿色(行动力)**: `#166534` (green-800)
- **紫色(境界)**: `#6b21a8` (purple-800)
- **黄色(星级)**: `#facc15` (yellow-400)

### 字体规范

#### 字号
- **特大标题**: 18px (1.125rem) - 角色名字
- **中等标题**: 16px (1rem) - "角色总览"
- **小标题**: 14px (0.875rem) - 面板标题、装备名称
- **正文**: 12px (0.75rem) - 普通文字
- **小文字**: 10px (0.625rem) - 导航标签、装备槽位

#### 字重
- **粗体 Bold**: 用于所有标题、数值、按钮文字
- **常规 Regular**: 用于描述性文字

### 边框规范
- **粗边框**: 4px - 主容器边框
- **中边框**: 3px - 按钮、卡片边框
- **细边框**: 2px - 内部装饰边框

### 间距规范
- **组件间距**: 16px (gap-4)
- **小间距**: 8px (gap-2)
- **内边距-大**: 16px (p-4)
- **内边距-中**: 12px (p-3)
- **内边距-小**: 8px (p-2)
- **内边距-微**: 6px (p-1.5)

---

## 画布配置

### Cocos Creator 设置

```typescript
// Canvas 设置
Canvas:
  Design Resolution: 720 x 1280
  Fit Height: true
  Fit Width: true
```

### Widget 组件配置
所有主容器节点都应添加 Widget 组件:
```typescript
Widget:
  Top: 0
  Bottom: 0
  Left: 0
  Right: 0
  Align Mode: ON_WINDOW_RESIZE
```

---

## UI层级结构

```
Canvas (720x1280)
├── Root Container (720x1280)
│   ├── Header Section (高度: 106px)
│   │   ├── Avatar (90x90)
│   │   ├── Name Panel (flex: 1)
│   │   ├── Gold Panel (flex: 1)
│   │   └── Diamond Panel (flex: 1)
│   │
│   ├── Main Content (高度: 960px)
│   │   ├── Decorative Corners (x4)
│   │   ├── Title Banner "角色总览"
│   │   ├── Character Section (340x300)
│   │   │   ├── Character Image (128x128)
│   │   │   ├── Sparkles (x4 动画)
│   │   │   └── Platform (128x28)
│   │   │
│   │   └── Bottom Row (两列)
│   │       ├── Equipment Panel (左, 高度: 400px)
│   │       │   ├── Title "本命法器"
│   │       │   ├── Decorative Pattern
│   │       │   └── Equipment Items (x3)
│   │       │       ├── Icon (64x64)
│   │       │       ├── Slot Name
│   │       │       ├── Item Name
│   │       │       └── Level & Star
│   │       │
│   │       └── Stats Panel (右, 高度: 400px)
│   │           ├── Title "基础属性"
│   │           ├── Decorative Pattern
│   │           └── Stats (x4)
│   │               ├── 境界 (文本显示)
│   │               ├── 气血 (进度条)
│   │               ├── 法力 (进度条)
│   │               └── 行动力 (进度条)
│   │
│   ├── Navigation Bar (高度: ~70px)
│   │   └── Nav Items (6个)
│   │       ├── 任务
│   │       ├── 商店
│   │       ├── 炼丹
│   │       ├── 炼器
│   │       ├── 功法
│   │       └── 灵宠
│   │
│   └── Bottom Nav Bar (高度: ~70px)
│       └── Tab Items (5个)
│           ├── 本命法器 (激活)
│           ├── 人物
│           ├── 境界
│           ├── 洞天
│           └── 钓鱼
```

---

## 组件详细规格

### 1. 顶部栏 (Header Section)

#### 容器
- **位置**: 顶部, Y: 1280
- **尺寸**: 720x106
- **背景色**: `#1e293b`
- **内边距**: 8px
- **底部间距**: 8px

#### 布局结构
```
[头像 90x90] [间距 8px] [名字面板] [间距 8px] [金币面板] [间距 8px] [钻石面板]
```

#### 1.1 头像 (Avatar)
- **尺寸**: 90x90
- **边框**: 4px, 颜色 `#d97706`
- **背景**: `#1e293b`
- **图片**: 角色头像 (ScaleMode: FILL)

#### 1.2 名字面板 (Name Panel)
- **宽度**: flex: 1 (自动分配)
- **高度**: 90px
- **背景色**: `#78350f`
- **边框**: 3px, 颜色 `#d97706`
- **内边距**: 左右 16px, 上下 8px
- **文字**: 
  - 内容: "来取快递"
  - 字号: 18px
  - 字重: Bold
  - 颜色: `#fef3c7`
  - 对齐: 左对齐, 垂直居中

#### 1.3 金币面板 (Gold Panel)
- **宽度**: flex: 1 (与名字面板相同)
- **高度**: 90px
- **背景色**: `#78350f`
- **边框**: 3px, 颜色 `#d97706`
- **内边距**: 左右 12px, 上下 8px
- **布局**: 水平居中
- **图标**: 
  - 金币图标 (32x32)
  - 颜色: `#fbbf24`
- **文字**:
  - 内容: "999"
  - 字号: 18px
  - 字重: Bold
  - 颜色: `#fef3c7`
- **间距**: 图标与文字间隔 8px

#### 1.4 钻石面板 (Diamond Panel)
- **宽度**: flex: 1 (与名字面板相同)
- **高度**: 90px
- **背景色**: `#164e63`
- **边框**: 3px, 颜色 `#0891b2`
- **内边距**: 左右 12px, 上下 8px
- **布局**: 水平居中
- **图标**: 
  - 钻石图标 (32x32)
  - 颜色: `#22d3ee`
- **文字**:
  - 内容: "999"
  - 字号: 18px
  - 字重: Bold
  - 颜色: `#cffafe`
- **间距**: 图标与文字间隔 8px

---

### 2. 主内容区 (Main Content)

#### 容器
- **位置**: 顶部下方
- **尺寸**: 720x960
- **背景色**: `#1e293b`
- **内边距**: 16px
- **底部间距**: 16px

#### 2.1 装饰角 (Decorative Corners)
4个角落装饰，每个:
- **尺寸**: 12x12
- **边框**: 3px, 颜色 `#f59e0b`
- **位置**:
  - 左上: (6, 954)
  - 右上: (702, 954)
  - 左下: (6, 6)
  - 右下: (702, 6)
- **边框样式**:
  - 左上角: 仅左边框和上边框
  - 右上角: 仅右边框和上边框
  - 左下角: 仅左边框和下边框
  - 右下角: 仅右边框和下边框

#### 2.2 标题横幅 (Title Banner)

##### 主容器
- **尺寸**: 自适应内容
- **位置**: 水平居中, 顶部内边距 16px
- **背景色**: `#1d4ed8` (blue-700)
- **边框**: 3px, 颜色 `#fbbf24`
- **内边距**: 左右 48px, 上下 6px

##### 文字
- **内容**: "角色总览"
- **字号**: 16px
- **字重**: Bold
- **颜色**: `#fde68a` (amber-200)

##### 装饰菱形 (左右各一个)
- **尺寸**: 20x20
- **背景色**: `#1d4ed8`
- **边框**: 3px, 颜色 `#fbbf24`
- **旋转**: 45度
- **位置**: 
  - 左侧: X: -10, Y: 0 (居中)
  - 右侧: X: +10, Y: 0 (居中)

---

### 3. 角色展示区 (Character Section)

#### 容器
- **尺寸**: 340x300
- **位置**: 水平居中
- **背景色**: `#1e293b`
- **边框**: 3px, 颜色 `#475569`
- **内边距**: 16px

#### 3.1 装饰星光 (Sparkles) - 共4个

##### 星光1
- **位置**: 左上 (X: 20, Y: 12)
- **尺寸**: 16x16
- **颜色**: `#facc15`
- **动画**: 闪烁 (opacity: 0.3 ↔ 1.0, 周期: 2s)

##### 星光2
- **位置**: 右上 (X: 320, Y: 20)
- **尺寸**: 12x12
- **颜色**: `#fde047`
- **动画**: 闪烁 (延迟: 0.5s)

##### 星光3
- **位置**: 左下 (X: 28, Y: 268)
- **尺寸**: 12x12
- **颜色**: `#facc15`
- **动画**: 闪烁 (延迟: 1.0s)

##### 星光4
- **位置**: 右下 (X: 324, Y: 284)
- **尺寸**: 16x16
- **颜色**: `#fde047`
- **动画**: 闪烁 (延迟: 1.5s)

#### 3.2 角色图像
- **尺寸**: 128x128
- **位置**: 水平垂直居中, 偏上 20px
- **图片**: 角色形象图片
- **ScaleMode**: CONTAIN (保持比例)

#### 3.3 修炼台座 (Platform)
- **尺寸**: 128x28
- **位置**: 角色图像正下方, 间距 8px
- **外层**:
  - 背景色: `#78350f`
  - 边框: 3px, 颜色 `#92400e`
- **内层装饰**:
  - 尺寸: 内缩 4px
  - 边框: 2px, 颜色 `#d97706`
  - 无填充

---

### 4. 本命法器面板 (Equipment Panel)

#### 容器
- **尺寸**: 宽度自适应 (50% - 8px), 高度 400px
- **背景色**: `#78350f`
- **边框**: 4px, 颜色 `#92400e`
- **内边距**: 16px

#### 4.1 装饰图案 (Decorative Pattern)
- **位置**: 绝对定位, 覆盖整个容器
- **透明度**: 5% (0.05)
- **网格**: 4列 x 4行
- **每个方块**:
  - 尺寸: 12x12
  - 边框: 2px, 颜色 `#78350f`
  - 无填充
- **间距**: 6px

#### 4.2 标题
- **容器**:
  - 背景色: `#b45309`
  - 边框: 2px, 颜色 `#fbbf24`
  - 内边距: 左右 16px, 上下 6px
  - 位置: 水平居中, 顶部
- **文字**:
  - 内容: "本命法器"
  - 字号: 14px
  - 字重: Bold
  - 颜色: `#fef3c7`

#### 4.3 装备列表 (3个装备项)

##### 装备项容器
- **尺寸**: 宽度 100%, 高度自适应
- **背景色**: `#431407` (amber-950)
- **边框**: 2px, 颜色 `#92400e`
- **内边距**: 10px
- **间距**: 项目之间间隔 10px
- **悬停效果**: 边框颜色变为 `#d97706`

##### 装备图标
- **尺寸**: 64x64
- **背景色**: `#0f172a`
- **边框**: 3px, 颜色 `#d97706`
- **内边距**: 10px
- **位置**: 左侧

##### 装备信息
- **槽位名称**:
  - 字号: 10px
  - 颜色: `#fbbf24`
  - 底部间距: 2px
- **装备名称**:
  - 字号: 14px
  - 字重: Bold
  - 颜色: `#fef3c7`
  - 底部间距: 4px
- **等级与星级**:
  - 等级文字: "Lv.5"
  - 字号: 12px
  - 颜色: `#cbd5e1`
  - 星星图标: 12x12, 颜色 `#facc15`, 填充

##### 装备数据示例
```javascript
装备1: {
  槽位: "主手",
  名称: "玄铁重剑",
  等级: 5,
  图标: sword_icon
}
装备2: {
  槽位: "护甲",
  名称: "金丝软甲",
  等级: 3,
  图标: armor_icon
}
装备3: {
  槽位: "饰品",
  名称: "护身玉佩",
  等级: 2,
  图标: accessory_icon
}
```

---

### 5. 基础属性面板 (Stats Panel)

#### 容器
- **尺寸**: 宽度自适应 (50% - 8px), 高度 400px
- **背景色**: `#78350f`
- **边框**: 4px, 颜色 `#92400e`
- **内边距**: 16px

#### 5.1 装饰图案
(与本命法器面板相同)

#### 5.2 标题
- **容器**:
  - 背景色: `#b45309`
  - 边框: 2px, 颜色 `#fbbf24`
  - 内边距: 左右 16px, 上下 6px
  - 位置: 水平居中, 顶部
- **文字**:
  - 内容: "基础属性"
  - 字号: 14px
  - 字重: Bold
  - 颜色: `#fef3c7`

#### 5.3 属性列表 (4个属性)

##### 属性项容器
- **尺寸**: 宽度 100%, 高度自适应
- **背景色**: `#431407`
- **边框**: 2px, 颜色 `#92400e`
- **内边距**: 10px
- **间距**: 项目之间间隔 12px
- **布局**: 垂直居中分布

##### 属性标签
- **容器**:
  - 背景色: `#78350f`
  - 边框: 1px, 颜色 `#92400e`
  - 内边距: 左右 12px, 上下 4px
- **文字**:
  - 字号: 12px
  - 字重: Bold
  - 颜色: `#fef3c7`

##### 5.3.1 境界属性 (特殊显示)
- **标签**: "境界"
- **显示方式**: 文本 + 数值
- **境界名称**:
  - 内容: "练气一层"
  - 字号: 14px
  - 颜色: `#fde68a`
  - 位置: 标签右侧
- **经验值**:
  - 内容: "0/30"
  - 字号: 14px
  - 字重: Bold
  - 颜色: `#fde68a`
  - 位置: 最右侧

##### 5.3.2 气血属性 (进度条显示)
- **标签**: "气血"
- **进度条容器**:
  - 宽度: flex: 1
  - 高度: 8px
  - 背景色: `#0f172a`
  - 边框: 1px, 颜色 `#334155`
- **进度条填充**:
  - 背景色: `#991b1b` (红色)
  - 高度: 100%
  - 宽度: 100% (当前值/最大值)
- **数值文字**:
  - 内容: "160/160"
  - 字号: 14px
  - 字重: Bold
  - 颜色: `#fde68a`
  - 最小宽度: 75px
  - 对齐: 右对齐

##### 5.3.3 法力属性
- **标签**: "法力"
- **进度条颜色**: `#1e3a8a` (蓝色)
- **数值**: "88/88"
- (其他规格同气血)

##### 5.3.4 行动力属性
- **标签**: "行动力"
- **进度条颜色**: `#166534` (绿色)
- **数值**: "180/180"
- (其他规格同气血)

---

### 6. 功能导航栏 (Navigation Bar)

#### 容器
- **尺寸**: 720x高度自适应 (~70px)
- **背景色**: `#1e293b`
- **内边距**: 8px
- **底部间距**: 8px
- **布局**: 6列网格, 间距 6px

#### 6.1 导航按钮 (共6个)

##### 按钮容器
- **尺寸**: 宽度自适应, 高度自适应
- **背景色**: `#334155`
- **边框**: 3px, 颜色 `#475569`
- **内边距**: 6px
- **布局**: 垂直排列, 居中对齐
- **悬停效果**: 边框颜色变为 `#f59e0b`

##### 图标容器
- **尺寸**: 40x40
- **背景色**: `#0f172a`
- **边框**: 3px, 颜色 `#d97706`
- **布局**: 图标居中
- **悬停效果**: 背景色变为 `#1e293b`

##### 图标
- **尺寸**: 24x24
- **颜色**: `#fbbf24`
- **悬停颜色**: `#fde047`

##### 标签文字
- **字号**: 10px
- **字重**: Bold
- **颜色**: `#fef3c7`
- **悬停颜色**: `#fde68a`
- **顶部间距**: 6px

##### 导航项列表
```javascript
[
  { icon: "file-text", label: "任务" },
  { icon: "store", label: "商店" },
  { icon: "flask", label: "炼丹" },
  { icon: "trophy", label: "炼器" },
  { icon: "book", label: "功法" },
  { icon: "heart", label: "灵宠" }
]
```

---

### 7. 底部标签栏 (Bottom Nav Bar)

#### 容器
- **尺寸**: 720x高度自适应 (~70px)
- **背景色**: `#1e293b`
- **内边距**: 8px
- **布局**: 5列网格, 间距 6px

#### 7.1 标签按钮 (共5个)

##### 未激活状态
- **按钮容器**:
  - 背景色: `#334155`
  - 边框: 3px, 颜色 `#475569`
  - 内边距: 6px
  - 悬停效果: 边框颜色变为 `#f59e0b`
- **图标容器**:
  - 尺寸: 40x40
  - 背景色: `#0f172a`
  - 边框: 3px, 颜色 `#334155`
  - 悬停效果: 背景色变为 `#1e293b`
- **图标**:
  - 尺寸: 24x24
  - 颜色: `#64748b`
  - 悬停颜色: `#fbbf24`
- **标签文字**:
  - 字号: 10px
  - 字重: Bold
  - 颜色: `#cbd5e1`
  - 悬停颜色: `#fde68a`

##### 激活状态 (本命法器)
- **按钮容器**:
  - 背景色: `#92400e`
  - 边框: 3px, 颜色 `#f59e0b`
- **图标容器**:
  - 背景色: `#78350f`
  - 边框: 3px, 颜色 `#d97706`
- **图标**:
  - 颜色: `#fde68a`
- **标签文字**:
  - 颜色: `#fef3c7`

##### 标签项列表
```javascript
[
  { icon: "sword", label: "本命法器", active: true },
  { icon: "user", label: "人物", active: false },
  { icon: "globe", label: "境界", active: false },
  { icon: "mountain", label: "洞天", active: false },
  { icon: "fish", label: "钓鱼", active: false }
]
```

---

## 资源清单

### 图片资源

#### 必需图片
1. **角色头像** (avatar.png)
   - 尺寸: 256x256
   - 格式: PNG (带透明通道)
   
2. **角色形象** (character.png)
   - 尺寸: 256x256
   - 格式: PNG (带透明通道)
   - 建议: 像素风格角色立绘

#### 装备图标 (64x64, PNG)
3. **剑图标** (icon_sword.png) - 玄铁重剑
4. **护甲图标** (icon_armor.png) - 金丝软甲
5. **饰品图标** (icon_accessory.png) - 护身玉佩

#### UI图标 (32x32, PNG)
6. **金币图标** (icon_coin.png)
7. **钻石图标** (icon_diamond.png)
8. **星星图标** (icon_star.png)
9. **星光特效** (icon_sparkle.png)

#### 功能图标 (24x24, PNG)
10. **任务图标** (icon_quest.png)
11. **商店图标** (icon_shop.png)
12. **炼丹图标** (icon_alchemy.png)
13. **炼器图标** (icon_forge.png)
14. **功法图标** (icon_skill.png)
15. **灵宠图标** (icon_pet.png)

#### 标签图标 (24x24, PNG)
16. **法器图标** (icon_weapon.png)
17. **人物图标** (icon_character.png)
18. **境界图标** (icon_realm.png)
19. **洞天图标** (icon_cave.png)
20. **钓鱼图标** (icon_fishing.png)

### 字体资源
- **像素字体**: 建议使用 "思源黑体" 或 "站酷像素体"
- **备用字体**: "Arial", "Helvetica"

### 特效资源
- **星光闪烁动画**: 可使用帧动画或透明度动画

---

## 实现步骤

### 步骤 1: 项目初始化

1. **创建新项目**
   - Cocos Creator 版本: 3.x
   - 项目模板: 空项目
   - 语言: TypeScript

2. **配置画布**
   ```typescript
   // 在 Canvas 组件中设置
   Design Resolution: 720 x 1280
   Fit Height: true
   Fit Width: true
   ```

3. **创建文件夹结构**
   ```
   assets/
   ├── images/          // 图片资源
   ├── prefabs/         // 预制体
   ├── scripts/         // 脚本
   │   ├── UI/          // UI控制脚本
   │   └── Data/        // 数据模型
   └── scenes/          // 场景
   ```

### 步骤 2: 导入资源

1. 将所有图片资源导入 `assets/images/` 目录
2. 设置图片导入属性:
   - Type: Sprite Frame
   - Filter Mode: Point (像素风格)
3. 导入字体文件到 `assets/fonts/`

### 步骤 3: 创建根容器

1. **Canvas 节点**
   - 添加 Canvas 组件
   - 添加 Widget 组件 (全屏适配)

2. **Root Container 节点**
   - 类型: Node
   - 尺寸: 720x1280
   - 添加 Sprite 组件
   - 颜色: `#0f172a`
   - 添加 Layout 组件:
     - Type: VERTICAL
     - Resize Mode: CONTAINER

### 步骤 4: 创建顶部栏

1. **创建 Header 节点**
   - 父节点: Root Container
   - 尺寸: 720x106
   - 添加 Sprite 组件, 颜色: `#1e293b`
   - 添加 Layout 组件:
     - Type: HORIZONTAL
     - Spacing: 8
     - Padding: 8

2. **创建 Avatar 节点**
   - 尺寸: 90x90
   - 添加边框 Sprite (4px, `#d97706`)
   - 添加图片 Sprite (角色头像)

3. **创建 Name Panel 节点**
   - Layout: HORIZONTAL, flex: 1
   - 背景 Sprite: `#78350f`
   - 边框: 3px, `#d97706`
   - 添加 Label 子节点: "来取快递"

4. **创建 Gold Panel 节点**
   - Layout: HORIZONTAL, flex: 1
   - 背景 Sprite: `#78350f`
   - 边框: 3px, `#d97706`
   - 添加图标 Sprite (金币)
   - 添加 Label 子节点: "999"

5. **创建 Diamond Panel 节点**
   - Layout: HORIZONTAL, flex: 1
   - 背景 Sprite: `#164e63`
   - 边框: 3px, `#0891b2`
   - 添加图标 Sprite (钻石)
   - 添加 Label 子节点: "999"

### 步骤 5: 创建主内容区

1. **创建 Main Content 节点**
   - 尺寸: 720x960
   - 背景 Sprite: `#1e293b`
   - Padding: 16

2. **添加装饰角**
   - 创建4个小节点 (12x12)
   - 位置: 四个角落
   - 使用两条 Sprite 模拟 L 形边框

3. **创建标题横幅**
   - 背景 Sprite: `#1d4ed8`, 边框: `#fbbf24`
   - Label: "角色总览"
   - 两侧添加旋转45度的菱形装饰

### 步骤 6: 创建角色展示区

1. **创建 Character Section 节点**
   - 尺寸: 340x300
   - 背景 Sprite: `#1e293b`
   - 边框: 3px, `#475569`

2. **添加星光特效**
   - 创建4个星光 Sprite 节点
   - 添加动画组件:
     ```typescript
     // 透明度动画
     opacity: 0.3 → 1.0 → 0.3
     duration: 2s
     loop: true
     ```

3. **添加角色图片**
   - Sprite: 角色形象
   - 尺寸: 128x128
   - Scale Mode: CONTAIN

4. **添加修炼台座**
   - 外层 Sprite: `#78350f`, 边框 `#92400e`
   - 内层 Sprite: 仅边框 `#d97706`

### 步骤 7: 创建本命法器面板

1. **创建 Equipment Panel 节点**
   - 尺寸: (容器宽度/2 - 8)x400
   - 背景 Sprite: `#78350f`
   - 边框: 4px, `#92400e`

2. **添加装饰图案**
   - 使用4x4网格 Layout
   - 每个格子: 12x12, 边框 2px
   - 整体透明度: 5%

3. **创建标题**
   - 背景: `#b45309`, 边框: `#fbbf24`
   - Label: "本命法器"

4. **创建装备列表**
   - 使用 ScrollView 或 Layout (VERTICAL)
   - 为每个装备创建预制体:
     - 图标 (64x64)
     - 槽位 Label
     - 名称 Label
     - 等级与星级

5. **实例化3个装备项**

### 步骤 8: 创建基础属性面板

1. **创建 Stats Panel 节点**
   - 尺寸: (容器宽度/2 - 8)x400
   - 背景 Sprite: `#78350f`
   - 边框: 4px, `#92400e`

2. **添加装饰图案** (同装备面板)

3. **创建标题**
   - Label: "基础属性"

4. **创建属性列表**
   - 使用 Layout (VERTICAL)
   - 创建4个属性项:
     - 境界 (文本显示)
     - 气血 (进度条)
     - 法力 (进度条)
     - 行动力 (进度条)

5. **进度条实现**
   ```typescript
   // 进度条容器
   背景 Sprite: #0f172a
   边框: 1px, #334155
   
   // 进度条填充 (子节点)
   Sprite: 对应颜色
   Scale.x: currentValue / maxValue
   Anchor: (0, 0.5)
   ```

### 步骤 9: 创建功能导航栏

1. **创建 Navigation Bar 节点**
   - 尺寸: 720x自适应
   - 背景: `#1e293b`
   - 添加 Layout: HORIZONTAL, 6列

2. **创建导航按钮预制体**
   - 外层: 背景 + 边框
   - 图标容器: 40x40
   - 图标: 24x24
   - 标签 Label: 10px

3. **实例化6个导航按钮**
   - 任务、商店、炼丹、炼器、功法、灵宠

4. **添加按钮脚本**
   ```typescript
   onMouseEnter() {
     this.border.color = Color.AMBER_500;
   }
   onMouseLeave() {
     this.border.color = Color.SLATE_600;
   }
   onClick() {
     // 导航逻辑
   }
   ```

### 步骤 10: 创建底部标签栏

1. **创建 Bottom Nav Bar 节点**
   - 尺寸: 720x自适应
   - 背景: `#1e293b`
   - 添加 Layout: HORIZONTAL, 5列

2. **创建标签按钮预制体**
   - 支持激活/未激活两种状态
   - 外层: 背景 + 边框
   - 图标容器: 40x40
   - 图标: 24x24
   - 标签 Label: 10px

3. **实例化5个标签按钮**
   - 本命法器(激活)、人物、境界、洞天、钓鱼

4. **添加标签切换脚本**
   ```typescript
   onTabClick(index: number) {
     // 取消所有激活状态
     for (let tab of this.tabs) {
       tab.setActive(false);
     }
     // 激活当前标签
     this.tabs[index].setActive(true);
   }
   ```

### 步骤 11: 布局自动适配

1. **添加 Widget 组件**
   - Header: Top = 0
   - Main Content: Top = 106, Bottom = 140
   - Navigation Bar: Bottom = 70
   - Bottom Nav Bar: Bottom = 0

2. **测试不同分辨率**
   - 720x1280 (标准)
   - 1080x1920 (高分辨率)
   - 其他常见手机分辨率

### 步骤 12: 优化与测试

1. **性能优化**
   - 合并图集 (Sprite Atlas)
   - 减少 Draw Call
   - 使用对象池管理动态节点

2. **交互优化**
   - 添加按钮点击音效
   - 添加页面切换动画
   - 优化触摸反馈

3. **测试清单**
   - [ ] 布局在不同分辨率下正常显示
   - [ ] 所有按钮可点击
   - [ ] 数据动态更新正常
   - [ ] 动画流畅播放
   - [ ] 无内存泄漏

---

## 脚本逻辑

### 数据模型

#### PlayerData.ts
```typescript
export interface PlayerData {
  name: string;           // 角色名
  gold: number;           // 金币
  diamond: number;        // 钻石
  realm: {                // 境界
    name: string;         // 境界名称
    exp: number;          // 当前经验
    maxExp: number;       // 升级所需经验
  };
  stats: {                // 基础属性
    hp: { current: number; max: number; };
    mp: { current: number; max: number; };
    stamina: { current: number; max: number; };
  };
  equipment: EquipmentData[];  // 装备列表
}

export interface EquipmentData {
  slot: string;           // 槽位
  name: string;           // 名称
  level: number;          // 等级
  icon: string;           // 图标路径
}
```

### UI控制脚本

#### HeaderController.ts
```typescript
import { _decorator, Component, Label, Sprite } from 'cc';

@ccclass('HeaderController')
export class HeaderController extends Component {
  @property(Label)
  nameLabel: Label = null;
  
  @property(Label)
  goldLabel: Label = null;
  
  @property(Label)
  diamondLabel: Label = null;
  
  @property(Sprite)
  avatarSprite: Sprite = null;
  
  updatePlayerInfo(data: PlayerData) {
    this.nameLabel.string = data.name;
    this.goldLabel.string = data.gold.toString();
    this.diamondLabel.string = data.diamond.toString();
    // 加载头像
    // resources.load(avatarPath, SpriteFrame, (err, spriteFrame) => {
    //   this.avatarSprite.spriteFrame = spriteFrame;
    // });
  }
}
```

#### StatsPanelController.ts
```typescript
import { _decorator, Component, Label, Sprite } from 'cc';

@ccclass('StatsPanelController')
export class StatsPanelController extends Component {
  @property(Label)
  realmNameLabel: Label = null;
  
  @property(Label)
  realmExpLabel: Label = null;
  
  @property(Label)
  hpLabel: Label = null;
  
  @property(Sprite)
  hpBar: Sprite = null;
  
  @property(Label)
  mpLabel: Label = null;
  
  @property(Sprite)
  mpBar: Sprite = null;
  
  @property(Label)
  staminaLabel: Label = null;
  
  @property(Sprite)
  staminaBar: Sprite = null;
  
  updateStats(data: PlayerData) {
    // 更新境界
    this.realmNameLabel.string = data.realm.name;
    this.realmExpLabel.string = `${data.realm.exp}/${data.realm.maxExp}`;
    
    // 更新气血
    this.hpLabel.string = `${data.stats.hp.current}/${data.stats.hp.max}`;
    this.updateProgressBar(this.hpBar, data.stats.hp.current, data.stats.hp.max);
    
    // 更新法力
    this.mpLabel.string = `${data.stats.mp.current}/${data.stats.mp.max}`;
    this.updateProgressBar(this.mpBar, data.stats.mp.current, data.stats.mp.max);
    
    // 更新行动力
    this.staminaLabel.string = `${data.stats.stamina.current}/${data.stats.stamina.max}`;
    this.updateProgressBar(this.staminaBar, data.stats.stamina.current, data.stats.stamina.max);
  }
  
  updateProgressBar(bar: Sprite, current: number, max: number) {
    const progress = current / max;
    bar.node.setScale(progress, 1);
  }
}
```

#### EquipmentPanelController.ts
```typescript
import { _decorator, Component, Prefab, instantiate, Layout } from 'cc';

@ccclass('EquipmentPanelController')
export class EquipmentPanelController extends Component {
  @property(Prefab)
  equipmentItemPrefab: Prefab = null;
  
  @property(Layout)
  equipmentList: Layout = null;
  
  updateEquipment(equipmentData: EquipmentData[]) {
    // 清空现有列表
    this.equipmentList.node.removeAllChildren();
    
    // 生成装备项
    for (let data of equipmentData) {
      const item = instantiate(this.equipmentItemPrefab);
      const itemController = item.getComponent('EquipmentItemController');
      itemController.setData(data);
      this.equipmentList.node.addChild(item);
    }
  }
}
```

#### EquipmentItemController.ts
```typescript
import { _decorator, Component, Label, Sprite, SpriteFrame } from 'cc';

@ccclass('EquipmentItemController')
export class EquipmentItemController extends Component {
  @property(Sprite)
  iconSprite: Sprite = null;
  
  @property(Label)
  slotLabel: Label = null;
  
  @property(Label)
  nameLabel: Label = null;
  
  @property(Label)
  levelLabel: Label = null;
  
  setData(data: EquipmentData) {
    this.slotLabel.string = data.slot;
    this.nameLabel.string = data.name;
    this.levelLabel.string = `Lv.${data.level}`;
    
    // 加载图标
    // resources.load(data.icon, SpriteFrame, (err, spriteFrame) => {
    //   this.iconSprite.spriteFrame = spriteFrame;
    // });
  }
}
```

#### NavigationBarController.ts
```typescript
import { _decorator, Component } from 'cc';

@ccclass('NavigationBarController')
export class NavigationBarController extends Component {
  onQuestClick() {
    console.log('任务按钮点击');
    // 导航到任务界面
  }
  
  onShopClick() {
    console.log('商店按钮点击');
    // 导航到商店界面
  }
  
  onAlchemyClick() {
    console.log('炼丹按钮点击');
    // 导航到炼丹界面
  }
  
  onForgeClick() {
    console.log('炼器按钮点击');
    // 导航到炼器界面
  }
  
  onSkillClick() {
    console.log('功法按钮点击');
    // 导航到功法界面
  }
  
  onPetClick() {
    console.log('灵宠按钮点击');
    // 导航到灵宠界面
  }
}
```

#### BottomNavBarController.ts
```typescript
import { _decorator, Component, Node, Sprite, Color } from 'cc';

@ccclass('BottomNavBarController')
export class BottomNavBarController extends Component {
  @property([Node])
  tabButtons: Node[] = [];
  
  private currentTabIndex: number = 0;
  
  start() {
    this.setActiveTab(0);
  }
  
  onTabClick(event: Event, customEventData: string) {
    const index = parseInt(customEventData);
    this.setActiveTab(index);
  }
  
  setActiveTab(index: number) {
    // 取消所有标签激活状态
    for (let i = 0; i < this.tabButtons.length; i++) {
      this.setTabActive(this.tabButtons[i], false);
    }
    
    // 激活选中标签
    this.setTabActive(this.tabButtons[index], true);
    this.currentTabIndex = index;
    
    // 触发页面切换事件
    this.onPageChange(index);
  }
  
  setTabActive(tabNode: Node, active: boolean) {
    const bg = tabNode.getChildByName('Background').getComponent(Sprite);
    const iconBg = tabNode.getChildByName('IconBg').getComponent(Sprite);
    
    if (active) {
      bg.color = new Color().fromHEX('#92400e');
      iconBg.color = new Color().fromHEX('#78350f');
    } else {
      bg.color = new Color().fromHEX('#334155');
      iconBg.color = new Color().fromHEX('#0f172a');
    }
  }
  
  onPageChange(index: number) {
    console.log(`切换到页面: ${index}`);
    // 这里触发实际的页面切换逻辑
    // 例如: 显示/隐藏对应的内容面板
  }
}
```

### 主控制器

#### CharacterUIController.ts
```typescript
import { _decorator, Component } from 'cc';

@ccclass('CharacterUIController')
export class CharacterUIController extends Component {
  @property(HeaderController)
  headerController: HeaderController = null;
  
  @property(StatsPanelController)
  statsController: StatsPanelController = null;
  
  @property(EquipmentPanelController)
  equipmentController: EquipmentPanelController = null;
  
  private playerData: PlayerData = null;
  
  start() {
    // 加载玩家数据
    this.loadPlayerData();
    
    // 刷新界面
    this.refreshUI();
  }
  
  loadPlayerData() {
    // 从数据管理器或服务器加载数据
    this.playerData = {
      name: "来取快递",
      gold: 999,
      diamond: 999,
      realm: {
        name: "练气一层",
        exp: 0,
        maxExp: 30
      },
      stats: {
        hp: { current: 160, max: 160 },
        mp: { current: 88, max: 88 },
        stamina: { current: 180, max: 180 }
      },
      equipment: [
        { slot: "主手", name: "玄铁重剑", level: 5, icon: "icon_sword" },
        { slot: "护甲", name: "金丝软甲", level: 3, icon: "icon_armor" },
        { slot: "饰品", name: "护身玉佩", level: 2, icon: "icon_accessory" }
      ]
    };
  }
  
  refreshUI() {
    this.headerController.updatePlayerInfo(this.playerData);
    this.statsController.updateStats(this.playerData);
    this.equipmentController.updateEquipment(this.playerData.equipment);
  }
  
  // 更新金币
  updateGold(amount: number) {
    this.playerData.gold += amount;
    this.headerController.updatePlayerInfo(this.playerData);
  }
  
  // 更新钻石
  updateDiamond(amount: number) {
    this.playerData.diamond += amount;
    this.headerController.updatePlayerInfo(this.playerData);
  }
  
  // 更新属性
  updateStats(hp?: number, mp?: number, stamina?: number) {
    if (hp !== undefined) this.playerData.stats.hp.current = hp;
    if (mp !== undefined) this.playerData.stats.mp.current = mp;
    if (stamina !== undefined) this.playerData.stats.stamina.current = stamina;
    this.statsController.updateStats(this.playerData);
  }
}
```

### 动画控制

#### SparkleAnimation.ts
```typescript
import { _decorator, Component, tween, Node } from 'cc';

@ccclass('SparkleAnimation')
export class SparkleAnimation extends Component {
  @property
  delay: number = 0;
  
  start() {
    this.playAnimation();
  }
  
  playAnimation() {
    tween(this.node)
      .delay(this.delay)
      .to(1, { opacity: 255 }, { easing: 'sineInOut' })
      .to(1, { opacity: 76 }, { easing: 'sineInOut' })
      .union()
      .repeatForever()
      .start();
  }
}
```

---

## 附录

### 常见问题

#### Q1: 如何确保像素完美显示？
A: 
1. 所有图片使用 Point Filter Mode
2. 节点位置使用整数坐标
3. 避免使用非整数缩放

#### Q2: 如何优化性能？
A:
1. 使用 Sprite Atlas 合并图集
2. 减少动态创建节点
3. 使用对象池复用节点
4. 避免频繁的 Layout 重计算

#### Q3: 如何适配不同屏幕？
A:
1. 使用 Widget 组件自动适配
2. 设置 Canvas Fit Height/Width
3. 关键元素使用相对布局

#### Q4: 如何实现平滑的数据更新动画？
A:
```typescript
// 例如: 金币增加动画
tween(this)
  .to(0.5, { displayGold: targetGold }, {
    onUpdate: (target, ratio) => {
      this.goldLabel.string = Math.floor(this.displayGold).toString();
    }
  })
  .start();
```

### 扩展建议

1. **数据持久化**: 使用 LocalStorage 或服务器存储玩家数据
2. **动画增强**: 添加页面切换、装备更换的过渡动画
3. **音效系统**: 为按钮点击、属性变化添加音效
4. **特效系统**: 为装备升级、境界突破添加粒子特效
5. **多语言支持**: 使用 i18n 系统支持多语言

### 性能指标

- **目标帧率**: 60 FPS
- **内存占用**: < 100 MB
- **Draw Call**: < 20
- **启动时间**: < 2s

---

## 结语

本指南提供了完整的像素风格RPG武侠修仙游戏角色界面在 Cocos Creator 中的重建方案。遵循扁平化设计原则，所有元素均采用纯色填充和硬边框，完全符合像素艺术风格和易于移植的要求。

实现过程中需要注意：
- **严格遵守尺寸规格**，确保界面在720x1280下完美显示
- **保持扁平风格**，禁用渐变、圆角、阴影等效果
- **使用整数坐标**，确保像素完美对齐
- **模块化开发**，便于后续维护和扩展

祝开发顺利！🎮✨

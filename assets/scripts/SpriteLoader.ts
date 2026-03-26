/**
 * SpriteLoader — 运行时从 resources 目录加载角色页切片精灵
 *
 * 资源路径：assets/resources/角色/1K/角色-v11/角色-v11_{num}.png
 * 加载方式：resources.load → SpriteFrame → Sprite
 *
 * meta 文件已配置为 "type": "sprite-frame"，包含 spriteFrame 子资源，
 * 可通过 resources.load(path + '/spriteFrame', SpriteFrame) 直接加载。
 */
import {
    Layers,
    Node,
    resources,
    Size,
    Sprite,
    SpriteFrame,
    UITransform,
} from 'cc';

const SPRITE_PATH = '角色/1K/角色-v11/角色-v11_';

/**
 * 角色页切片编号 → UI 元素映射
 *
 * 编号来源：角色-v11 美术切图，按尺寸 / 色相分析确认。
 */
export const SP = {
    // ── 内容区面板 ──
    charAreaPanel:   1,   // 330×379  角色形象面板背景
    titleBanner:     2,   // 503×116  「角色总览」标题
    contentFrame:    3,   // 486×93   内容区外框
    equipPanel:      4,   // 165×252  本命法器左列面板
    statsPanel:      5,   // 247×134  属性 / 技能面板
    sectionBar:      6,   // 485×65   宽分割条
    equipSlotBg:     7,   // 175×131  装备槽内底
    sectionHeader:   8,   // 243×88   段标题框

    // ── 角色展示 ──
    pedestal:        9,   // 159×131  角色底座（橙棕）
    charFigure:     43,   // 279×332  打坐角色
    sparkle1:       40,   // 10×9     小光点
    sparkle2:       41,   //  6×7     微光点
    sparkle3:       42,   //  6×7     微光点

    // ── 属性 / 技能行背景 ──
    statsRow1:      10,   // 247×66
    statsRow2:      11,   // 247×62
    skillRow1:      13,   // 221×63
    skillRow2:      15,   // 213×59
    skillRow3:      16,   // 213×59

    // ── 装备图标 ──
    equipSword:     12,   // 134×106  飞剑
    equipShield:    14,   // 113×115  护符
    equipLantern:   28,   // 126×73   灵灯

    // ── 快捷栏图标（活动栏 6 个） ──
    iconQuest:      17,   // 107×109  任务
    iconShop:       18,   // 103×109  商店
    iconPotion:     24,   // 103×98   炼丹
    iconForge:      21,   // 109×98   炼器
    iconTech:       20,   // 107×104  功法
    iconPet:        23,   // 100×102  灵宠

    // ── 底栏导航图标（5 个） ──
    navWeapon:      29,   //  85×106  本命法器
    navChar:        30,   //  86×103  人物
    navRealm:       31,   //  81×102  境界
    navCave:        32,   //  87×85   洞天
    navFish:        33,   //  77×95   钓鱼

    // ── 顶栏小元素 ──
    avatar:         44,   //  82×76   头像
    coinIcon:       36,   //  63×66   金币
    diamondIcon:    37,   //  67×59   钻石
    star:           39,   //  18×18   星级
} as const;

/**
 * 在已有节点上异步加载切片精灵。
 * Graphics 底色仍保留，Sprite 加载后覆盖在上层。
 *
 * @param node       目标节点（需已有 UITransform）
 * @param spriteNum  切片编号（1-44）
 * @param fitSize    true = 加载后自动调整 UITransform 尺寸为纹理原始大小
 */
export function loadSpriteToNode(
    node: Node,
    spriteNum: number,
    fitSize = false,
): void {
    const path = `${SPRITE_PATH}${spriteNum}/spriteFrame`;
    resources.load(path, SpriteFrame, (err, sf) => {
        if (err || !sf || !node.isValid) return;

        let sprite = node.getComponent(Sprite);
        if (!sprite) sprite = node.addComponent(Sprite);
        sprite.spriteFrame = sf;
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        sprite.type = Sprite.Type.SIMPLE;

        if (fitSize) {
            const ut = node.getComponent(UITransform);
            if (ut && sf.rect) {
                ut.setContentSize(
                    new Size(sf.rect.width, sf.rect.height),
                );
            }
        }
    });
}

/**
 * 创建新节点并异步加载切片精灵。
 *
 * @returns 新节点（Sprite 在精灵加载完成后才出现）
 */
export function makeSpriteNode(
    name: string,
    parent: Node,
    spriteNum: number,
    w: number,
    h: number,
    x: number,
    y: number,
): Node {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    parent.addChild(node);
    node.setPosition(x, y, 0);
    node.addComponent(UITransform).setContentSize(w, h);
    loadSpriteToNode(node, spriteNum);
    return node;
}

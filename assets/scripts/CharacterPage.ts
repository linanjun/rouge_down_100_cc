/**
 * 角色页（人物页面）— 填充至 FrameworkPage.contentNode
 *
 * ┌───────────────────────────────────┐
 * │          【角色总览】              │
 * ├──────────────┬────────────────────┤
 * │ 【本命法器】  │   【角色形象】      │
 * │ ┌──────────┐ │                    │
 * │ │ 飞剑位   │ │     🧘             │
 * │ │ 青霜剑   │ │                    │
 * │ │ Lv.1 ⭐  │ │                    │
 * │ └──────────┘ │                    │
 * │ ┌──────────┐ │                    │
 * │ │ 护符位   │ │                    │
 * │ └──────────┘ │                    │
 * │ ┌──────────┐ │                    │
 * │ │ 灵灯位   │ │                    │
 * │ └──────────┘ │                    │
 * ├──────────────┴────────────────────┤
 * │ 【基础属性】    │  【功法造诣】     │
 * │ 气血 160/160   │ 炼丹术 Lv.1 0/13 │
 * │ 法力  88/88    │ 炼器术 Lv.1 0/13 │
 * │ 行动力 180/180 │ 灵宠诀 Lv.1 0/13 │
 * │                │ 清心诀 Lv.1 0/13 │
 * └───────────────────────────────────┘
 */
import {
    Color,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Layers,
    Node,
    UITransform,
} from 'cc';
import { loadSpriteToNode, makeSpriteNode, SP } from './SpriteLoader';

// ── 深色仙侠像素风配色（Graphics 底色 / 加载前占位） ──
const PANEL_BG      = new Color(34, 38, 52, 255);
const PANEL_BORDER  = new Color(82, 76, 62, 255);
const TITLE_BG      = new Color(38, 42, 56, 255);
const TITLE_BORDER  = new Color(96, 88, 68, 255);
const SLOT_BG       = new Color(42, 46, 62, 255);
const SLOT_BORDER   = new Color(66, 62, 52, 255);

const TEXT_WHITE    = new Color(238, 238, 234, 255);
const TEXT_GRAY     = new Color(168, 172, 184, 255);
const TEXT_GOLD     = new Color(255, 216, 120, 255);
const STAR_COLOR    = new Color(255, 200, 50, 255);

const SWORD_BG      = new Color(50, 75, 65, 255);
const SHIELD_BG     = new Color(50, 50, 78, 255);
const LAMP_BG       = new Color(68, 58, 48, 255);
const CHAR_AREA_BG  = new Color(40, 44, 58, 255);

/**
 * 在指定父节点中构建角色页内容
 * @param parent  FrameworkPage 的 contentNode
 */
export function buildCharacterPage(parent: Node): void {
    const t = parent.getComponent(UITransform)!;
    const W = t.contentSize.width;
    const H = t.contentSize.height;

    parent.removeAllChildren();

    const PAD = 10;
    const innerW = W - PAD * 2;
    let curY = H / 2;

    // ─── 角色总览 标题 ───
    curY -= 14;
    const titleH = 34;
    curY -= titleH / 2;
    const titleNode = makeSectionTitle(parent, '角色总览', innerW * 0.36, titleH, 0, curY);
    loadSpriteToNode(titleNode, SP.titleBanner);
    curY -= titleH / 2 + 8;

    // ─── 上半区：本命法器 (左) + 角色形象 (右) ───
    const mainH = 390;
    const colGap = 8;
    const leftW = innerW * 0.40;
    const rightW = innerW - leftW - colGap;
    const mainY = curY - mainH / 2;
    const leftX = -innerW / 2 + leftW / 2;
    const rightX = innerW / 2 - rightW / 2;

    // 本命法器
    const artifactPanel = makePanel('本命法器Panel', parent,
        leftW, mainH, leftX, mainY, PANEL_BG, PANEL_BORDER, 4);
    loadSpriteToNode(artifactPanel, SP.equipPanel);
    buildArtifacts(artifactPanel, leftW, mainH);

    // 角色形象
    const charPanel = makePanel('角色形象Panel', parent,
        rightW, mainH, rightX, mainY, PANEL_BG, PANEL_BORDER, 4);
    loadSpriteToNode(charPanel, SP.charAreaPanel);
    buildCharacterImage(charPanel, rightW, mainH);

    curY = mainY - mainH / 2 - 10;

    // ─── 下半区：基础属性 (左) + 功法造诣 (右) ───
    const statsH = 180;
    const halfW = (innerW - colGap) / 2;
    const statsY = curY - statsH / 2;
    const sLeftX = -innerW / 2 + halfW / 2;
    const sRightX = innerW / 2 - halfW / 2;

    const statsPanel = makePanel('基础属性Panel', parent,
        halfW, statsH, sLeftX, statsY, PANEL_BG, PANEL_BORDER, 4);
    loadSpriteToNode(statsPanel, SP.statsPanel);
    buildBaseStats(statsPanel, halfW, statsH);

    const skillPanel = makePanel('功法造诣Panel', parent,
        halfW, statsH, sRightX, statsY, PANEL_BG, PANEL_BORDER, 4);
    loadSpriteToNode(skillPanel, SP.statsPanel);
    buildSkills(skillPanel, halfW, statsH);
}

// ═══════════════════════════════════════════════════
//  Section Title — 带装饰边线的标题条
// ═══════════════════════════════════════════════════

function makeSectionTitle(
    parent: Node, text: string,
    w: number, h: number, x: number, y: number,
): Node {
    const node = makeNode('Title_' + text, parent, w, h, x, y);
    const g = node.addComponent(Graphics);
    g.fillColor = TITLE_BG;
    g.strokeColor = TITLE_BORDER;
    g.lineWidth = 2;
    g.roundRect(-w / 2, -h / 2, w, h, 3);
    g.fill();
    g.stroke();

    // 左右装饰横线
    const ext = 14;
    g.moveTo(-w / 2 - ext, 0);
    g.lineTo(-w / 2 + 1, 0);
    g.moveTo(w / 2 - 1, 0);
    g.lineTo(w / 2 + ext, 0);
    g.stroke();

    loadSpriteToNode(node, SP.sectionHeader);

    makeLabel(node, text, 15, 0, 0, TEXT_GOLD, w - 8);
    return node;
}

// ═══════════════════════════════════════════════════
//  本命法器
// ═══════════════════════════════════════════════════

interface SlotData {
    type: string;
    name: string;
    level: number;
    stars: number;
    iconBg: Color;
    iconText: string;
    iconSprite: number;  // SP 切片编号
}

function buildArtifacts(parent: Node, W: number, H: number): void {
    const titleH = 26;
    const titleY = H / 2 - 8 - titleH / 2;
    makeSectionTitle(parent, '本命法器', W * 0.62, titleH, 0, titleY);

    const slots: SlotData[] = [
        { type: '飞剑位', name: '青霜剑', level: 1, stars: 1, iconBg: SWORD_BG, iconText: '剑', iconSprite: SP.equipSword },
        { type: '护符位', name: '玄甲符', level: 1, stars: 1, iconBg: SHIELD_BG, iconText: '符', iconSprite: SP.equipShield },
        { type: '灵灯位', name: '寻宝灯', level: 1, stars: 1, iconBg: LAMP_BG, iconText: '灯', iconSprite: SP.equipLantern },
    ];

    const slotH = 88;
    const slotPad = 8;
    let slotY = titleY - titleH / 2 - 14 - slotH / 2;

    for (const slot of slots) {
        buildEquipSlot(parent, W - slotPad * 2, slotH, 0, slotY, slot);
        slotY -= slotH + 8;
    }
}

function buildEquipSlot(
    parent: Node, w: number, h: number, x: number, y: number,
    data: SlotData,
): void {
    const node = makePanel('Slot_' + data.type, parent, w, h, x, y, SLOT_BG, SLOT_BORDER, 4);
    loadSpriteToNode(node, SP.equipSlotBg);

    // 图标
    const iconSize = 62;
    const iconX = -w / 2 + 8 + iconSize / 2;
    const icon = makePanel('Icon', node, iconSize, iconSize, iconX, 0,
        data.iconBg, SLOT_BORDER, 4);
    loadSpriteToNode(icon, data.iconSprite);
    makeLabel(icon, data.iconText, 26, 0, 0, TEXT_WHITE, iconSize - 4);

    // 文字区
    const textX = iconX + iconSize / 2 + 8;
    const textW = w - iconSize - 26;
    const textCX = textX + textW / 2;

    makeLabel(node, data.type, 12, textCX, 24,
        TEXT_GRAY, textW, HorizontalTextAlignment.LEFT);
    makeLabel(node, data.name, 16, textCX, 4,
        TEXT_WHITE, textW, HorizontalTextAlignment.LEFT);

    const starStr = '⭐'.repeat(data.stars);
    makeLabel(node, `Lv.${data.level}  ${starStr}`, 12, textCX, -18,
        STAR_COLOR, textW, HorizontalTextAlignment.LEFT);

    // 星级切片
    for (let s = 0; s < data.stars; s++) {
        makeSpriteNode('Star', node, SP.star, 18, 18, textCX - textW / 2 + 42 + s * 20, -18);
    }
}

// ═══════════════════════════════════════════════════
//  角色形象
// ═══════════════════════════════════════════════════

function buildCharacterImage(parent: Node, W: number, H: number): void {
    const titleH = 26;
    const titleY = H / 2 - 8 - titleH / 2;
    makeSectionTitle(parent, '角色形象', W * 0.42, titleH, 0, titleY);

    // 角色展示区
    const areaW = W - 24;
    const areaH = H - titleH - 32;
    const areaY = titleY - titleH / 2 - 8 - areaH / 2;
    const charArea = makePanel('CharArea', parent, areaW, areaH, 0, areaY,
        CHAR_AREA_BG, SLOT_BORDER, 6);

    // 底座圆环（Graphics 保留作为占位/底层）
    const g = charArea.getComponent(Graphics)!;
    g.strokeColor = new Color(72, 66, 52, 255);
    g.lineWidth = 2;
    g.ellipse(0, -areaH * 0.22, areaW * 0.32, areaH * 0.08);
    g.stroke();
    g.fillColor = new Color(52, 48, 38, 200);
    g.ellipse(0, -areaH * 0.22, areaW * 0.30, areaH * 0.06);
    g.fill();

    // 底座切片
    makeSpriteNode('Pedestal', charArea, SP.pedestal, 159, 131, 0, -areaH * 0.18);

    // 角色切片（打坐形象）
    makeSpriteNode('CharFigure', charArea, SP.charFigure, 279, 332, 0, 8);

    // 灵光点缀（使用切片小光点）
    makeSpriteNode('Sparkle1', charArea, SP.sparkle1, 10, 9, -areaW * 0.28, areaH * 0.2);
    makeSpriteNode('Sparkle2', charArea, SP.sparkle2, 6, 7, areaW * 0.32, areaH * 0.12);
    makeSpriteNode('Sparkle3', charArea, SP.sparkle3, 6, 7, areaW * 0.18, areaH * 0.32);
    makeSpriteNode('Sparkle4', charArea, SP.sparkle1, 10, 9, -areaW * 0.16, -areaH * 0.06);
}

// ═══════════════════════════════════════════════════
//  基础属性
// ═══════════════════════════════════════════════════

function buildBaseStats(parent: Node, W: number, H: number): void {
    const titleH = 26;
    const titleY = H / 2 - 6 - titleH / 2;
    makeSectionTitle(parent, '基础属性', W * 0.58, titleH, 0, titleY);

    const stats = [
        { label: '气血', value: '160/160' },
        { label: '法力', value: '88/88' },
        { label: '行动力', value: '180/180' },
    ];

    const rowH = 30;
    let rowY = titleY - titleH / 2 - 18;
    const pad = 14;

    for (const s of stats) {
        makeLabel(parent, s.label, 15, -W / 2 + pad + 30, rowY,
            TEXT_GOLD, 70, HorizontalTextAlignment.LEFT);
        makeLabel(parent, s.value, 15, W / 2 - pad - 48, rowY,
            TEXT_WHITE, 100, HorizontalTextAlignment.RIGHT);
        rowY -= rowH;
    }
}

// ═══════════════════════════════════════════════════
//  功法造诣
// ═══════════════════════════════════════════════════

function buildSkills(parent: Node, W: number, H: number): void {
    const titleH = 26;
    const titleY = H / 2 - 6 - titleH / 2;
    makeSectionTitle(parent, '功法造诣', W * 0.58, titleH, 0, titleY);

    const skills = [
        { name: '炼丹术', level: 1, progress: '0/13' },
        { name: '炼器术', level: 1, progress: '0/13' },
        { name: '灵宠诀', level: 1, progress: '0/13' },
        { name: '清心诀', level: 1, progress: '0/13' },
    ];

    const rowH = 26;
    let rowY = titleY - titleH / 2 - 14;
    const pad = 10;

    for (const s of skills) {
        const text = `${s.name} Lv.${s.level}`;
        makeLabel(parent, text, 13, -W / 2 + pad + 56, rowY,
            TEXT_WHITE, 110, HorizontalTextAlignment.LEFT);
        makeLabel(parent, s.progress, 13, W / 2 - pad - 20, rowY,
            TEXT_GRAY, 50, HorizontalTextAlignment.RIGHT);
        rowY -= rowH;
    }
}

// ═══════════════════════════════════════════════════
//  通用构建函数
// ═══════════════════════════════════════════════════

function makeNode(
    name: string, parent: Node,
    w: number, h: number, x: number, y: number,
): Node {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    parent.addChild(node);
    node.setPosition(x, y, 0);
    node.addComponent(UITransform).setContentSize(w, h);
    return node;
}

function makePanel(
    name: string, parent: Node,
    w: number, h: number, x: number, y: number,
    fill: Color, stroke: Color, radius: number,
): Node {
    const node = makeNode(name, parent, w, h, x, y);
    const g = node.addComponent(Graphics);
    g.fillColor = fill;
    g.strokeColor = stroke;
    g.lineWidth = 1.6;
    if (radius > 0) {
        g.roundRect(-w / 2, -h / 2, w, h, radius);
        g.fill();
        g.roundRect(-w / 2, -h / 2, w, h, radius);
        g.stroke();
    } else {
        g.rect(-w / 2, -h / 2, w, h);
        g.fill();
        g.rect(-w / 2, -h / 2, w, h);
        g.stroke();
    }
    return node;
}

function makeLabel(
    parent: Node, text: string, fontSize: number,
    x: number, y: number, color: Color, width: number,
    align = HorizontalTextAlignment.CENTER,
): Label {
    const node = new Node('Label');
    node.layer = Layers.Enum.UI_2D;
    parent.addChild(node);
    node.setPosition(x, y, 0);
    node.addComponent(UITransform).setContentSize(width, fontSize + 12);
    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 4;
    label.color = color;
    label.horizontalAlign = align;
    label.overflow = Label.Overflow.SHRINK;
    return label;
}

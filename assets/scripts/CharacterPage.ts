/**
 * 角色页面 — 填充 FrameworkPage 内容区域
 * 按照 docs/COCOS_CREATOR_GUIDE.md 规范重建
 * 扁平化设计（无圆角/无渐变/无阴影）
 * 包含：角色形象展示区（带4个装备槽位） + 属性面板
 */
import {
    _decorator,
    Color,
    Component,
    Director,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Layers,
    Node,
    UITransform,
    director,
    find,
} from 'cc';

const { ccclass } = _decorator;

// ── Color palette (扁平化纯色，按指南配色系统) ──
const SLATE_300  = new Color(203, 213, 225, 255);  // #cbd5e1
const SLATE_400  = new Color(148, 163, 184, 255);  // #94a3b8
const SLATE_600  = new Color( 71,  85, 105, 255);  // #475569
const SLATE_700  = new Color( 51,  65,  85, 255);  // #334155
const SLATE_800  = new Color( 30,  41,  59, 255);  // #1e293b
const SLATE_900  = new Color( 15,  23,  42, 255);  // #0f172a

const AMBER_100  = new Color(254, 243, 199, 255);  // #fef3c7
const AMBER_200  = new Color(253, 230, 138, 255);  // #fde68a
const AMBER_300  = new Color(252, 211,  77, 255);  // #fcd34d
const AMBER_400  = new Color(251, 191,  36, 255);  // #fbbf24
const AMBER_500  = new Color(245, 158,  11, 255);  // #f59e0b
const AMBER_600  = new Color(217, 119,   6, 255);  // #d97706
const AMBER_700  = new Color(180,  83,   9, 255);  // #b45309
const AMBER_800  = new Color(146,  64,  14, 255);  // #92400e
const AMBER_900  = new Color(120,  53,  15, 255);  // #78350f
const AMBER_950  = new Color( 69,  26,   3, 255);  // #451a03

const BLUE_700   = new Color( 29,  78, 216, 255);  // #1d4ed8

const YELLOW_300 = new Color(253, 224,  71, 255);  // #fde047

const RED_600    = new Color(220,  38,  38, 255);  // #dc2626
const GREEN_600  = new Color( 22, 163,  74, 255);  // #16a34a

interface EquipSlotInfo {
    slot: string;
    name: string;
}

interface StatInfo {
    name: string;
    value: string;
}

@ccclass('CharacterPage')
export class CharacterPage extends Component {
    onLoad() {
        this.buildPage();
    }

    private buildPage() {
        const t = this.node.getComponent(UITransform);
        const w = t ? t.width : 688;
        const h = t ? t.height : 958;
        const PAD = 12;

        let curY = h / 2;

        // ── 1. 角色形象展示区（带4个装备槽位）──
        const displayH = Math.min(h * 0.55, 480);
        curY -= PAD + displayH / 2;
        this.buildCharacterDisplay(this.node, w - PAD * 2, displayH, 0, curY);
        curY -= displayH / 2;

        // ── 2. 属性面板 ──
        const attrsH = h - PAD * 3 - displayH;
        curY -= PAD + attrsH / 2;
        this.buildAttributePanel(this.node, w - PAD * 2, attrsH, 0, curY);
        curY -= attrsH / 2;

        // ── Corner decorations ──
        this.buildCornerDecorations(this.node, w - PAD * 2, displayH + PAD + attrsH + PAD * 2, 0,
            h / 2 - PAD - (displayH + PAD + attrsH + PAD * 2) / 2);
    }

    // ══════════════════════════════════════════════════
    //  角色形象展示区: 带4个装备槽位在四角
    // ══════════════════════════════════════════════════
    private buildCharacterDisplay(parent: Node, w: number, h: number, x: number, y: number) {
        // Outer border: amber-700
        const outer = this.makeRect('DisplayBorder', parent, w, h, x, y, AMBER_700);
        // Inner bg: slate-800
        const panel = this.makeRect('DisplayBg', outer, w - 6, h - 6, 0, 0, SLATE_800);

        const pad = 10;
        const innerW = w - 6 - pad * 2;
        const innerH = h - 6 - pad * 2;

        // 标题: "角色总览", bg blue-700, border 2px amber-400
        const bannerH = 36;
        const bannerY = innerH / 2 - bannerH / 2;
        this.buildTitleBanner(panel, innerW, bannerH, 0, bannerY);

        // 角色形象: 居中显示
        const charAreaH = innerH - bannerH - pad;
        const charAreaY = bannerY - bannerH / 2 - pad - charAreaH / 2;

        const displaySize = Math.min(innerW * 0.4, charAreaH * 0.6, 128);
        this.makeRect('CharDisplay', panel, displaySize, displaySize, 0, charAreaY + 10, SLATE_700);
        this.makeLabel(panel, '角色\n展示', 16, 0, charAreaY + 10, SLATE_400, displaySize - 12);

        // 修炼台座: 128×28
        const pedW = 128;
        const pedH = 28;
        const pedY = charAreaY + 10 - displaySize / 2 - pedH / 2 - 4;
        const pedBorder = this.makeRect('PedestalBd', panel, pedW, pedH, 0, pedY, AMBER_700);
        this.makeRect('PedestalBg', pedBorder, pedW - 6, pedH - 6, 0, 0, AMBER_900);
        const decBorder = this.makeRect('PedestalDec', pedBorder, pedW - 18, pedH - 12, 0, 0, AMBER_600);
        this.makeRect('PedestalDecBg', decBorder, pedW - 22, pedH - 16, 0, 0, AMBER_900);

        // 4个装备槽位: 在四角分布
        const slots: EquipSlotInfo[] = [
            { slot: '武器', name: '青霜剑' },
            { slot: '防具', name: '金丝甲' },
            { slot: '饰品', name: '玉佩' },
            { slot: '法宝', name: '玄灵符' },
        ];

        const slotW = 80;
        const slotH = 80;
        const margin = 4;

        const positions = [
            { sx: -innerW / 2 + slotW / 2 + margin, sy:  charAreaH / 2 - slotH / 2 + charAreaY - margin },  // 左上: 武器
            { sx:  innerW / 2 - slotW / 2 - margin, sy:  charAreaH / 2 - slotH / 2 + charAreaY - margin },  // 右上: 防具
            { sx: -innerW / 2 + slotW / 2 + margin, sy: -charAreaH / 2 + slotH / 2 + charAreaY + margin },  // 左下: 饰品
            { sx:  innerW / 2 - slotW / 2 - margin, sy: -charAreaH / 2 + slotH / 2 + charAreaY + margin },  // 右下: 法宝
        ];

        for (let i = 0; i < slots.length; i++) {
            this.buildEquipSlot(panel, slotW, slotH, positions[i].sx, positions[i].sy, slots[i]);
        }

        // Sparkle decorations (4 stars)
        const sparkles = [
            { sx: -innerW / 2 + slotW + 20, sy: charAreaY + charAreaH / 2 - 20, size: 10 },
            { sx:  innerW / 2 - slotW - 20, sy: charAreaY + charAreaH / 2 - 20, size: 12 },
            { sx: -innerW / 2 + slotW + 24, sy: charAreaY - charAreaH / 2 + 20, size: 10 },
            { sx:  innerW / 2 - slotW - 24, sy: charAreaY - charAreaH / 2 + 20, size: 12 },
        ];
        for (const sp of sparkles) {
            this.makeLabel(panel, '✦', sp.size, sp.sx, sp.sy, YELLOW_300, sp.size + 4);
        }
    }

    // ── 装备槽位: 64×64 图标 + 名称 ──
    private buildEquipSlot(parent: Node, w: number, h: number, x: number, y: number, info: EquipSlotInfo) {
        const border = this.makeRect('Slot_' + info.slot, parent, w, h, x, y, SLATE_600);
        const slot = this.makeRect('SlotBg', border, w - 4, h - 4, 0, 0, SLATE_900);

        // Icon area: 48×48, border 2px amber-600
        const iconSize = Math.min(w - 20, h - 32, 48);
        const iconBd = this.makeRect('IconBd', slot, iconSize, iconSize, 0, 6, AMBER_600);
        this.makeRect('IconBg', iconBd, iconSize - 4, iconSize - 4, 0, 0, SLATE_800);
        this.makeLabel(iconBd, '✦', 18, 0, 0, AMBER_400, iconSize - 6);

        // Slot name below icon
        this.makeLabel(slot, info.slot, 10, 0, -iconSize / 2 - 4, AMBER_400, w - 12);
    }

    // ── 标题横幅: bg blue-700, border 2px amber-400, text "角色总览" ──
    private buildTitleBanner(parent: Node, w: number, h: number, x: number, y: number) {
        const border = this.makeRect('TitleBorder', parent, w, h, x, y, AMBER_400);
        const bg = this.makeRect('TitleBg', border, w - 4, h - 4, 0, 0, BLUE_700);
        this.makeLabel(bg, '角色总览', 16, 0, 0, AMBER_200, w - 80);

        // Left diamond decoration
        const ds = 14;
        const dLeft = this.makeRect('DiamondL', border, ds, ds, -(w / 2 - 30), 0, BLUE_700);
        this.drawBorder(dLeft, ds, ds, AMBER_400, 2);
        dLeft.angle = 45;

        // Right diamond decoration
        const dRight = this.makeRect('DiamondR', border, ds, ds, w / 2 - 30, 0, BLUE_700);
        this.drawBorder(dRight, ds, ds, AMBER_400, 2);
        dRight.angle = 45;
    }

    // ══════════════════════════════════════════════════
    //  属性面板: 战力/等级/经验 + 攻击/防御/速度/暴击
    // ══════════════════════════════════════════════════
    private buildAttributePanel(parent: Node, w: number, h: number, x: number, y: number) {
        const outer = this.makeRect('AttrsBorder', parent, w, h, x, y, AMBER_700);
        const panel = this.makeRect('AttrsBg', outer, w - 6, h - 6, 0, 0, AMBER_900);

        const pad = 10;
        const innerW = w - 6 - pad * 2;

        // Title: "角色属性", bg amber-800, border 2px amber-400
        const titleH = 28;
        const titleY = (h - 6) / 2 - pad - titleH / 2;
        const titleBd = this.makeRect('AttrsTitleBd', panel, innerW, titleH, 0, titleY, AMBER_400);
        this.makeRect('AttrsTitleBg', titleBd, innerW - 4, titleH - 4, 0, 0, AMBER_800);
        this.makeLabel(titleBd, '角色属性', 14, 0, 0, AMBER_100, innerW - 20);

        // 战力 (large, prominent)
        const powerH = 40;
        const powerY = titleY - titleH / 2 - pad - powerH / 2;
        const powerBd = this.makeRect('PowerBd', panel, innerW, powerH, 0, powerY, AMBER_800);
        this.makeRect('PowerBg', powerBd, innerW - 4, powerH - 4, 0, 0, AMBER_950);
        this.makeLabel(powerBd, '战力', 14, -innerW / 2 + 50, 0, AMBER_400, 60, HorizontalTextAlignment.LEFT);
        this.makeLabel(powerBd, '12580', 20, 30, 0, AMBER_100, innerW - 90);

        // 等级 + 经验进度条
        const levelH = 36;
        const levelY = powerY - powerH / 2 - 8 - levelH / 2;
        const levelBd = this.makeRect('LevelBd', panel, innerW, levelH, 0, levelY, AMBER_800);
        const levelBg = this.makeRect('LevelBg', levelBd, innerW - 4, levelH - 4, 0, 0, AMBER_950);

        this.makeLabel(levelBg, 'Lv.10', 14, -innerW / 2 + 50, 0, AMBER_200, 60, HorizontalTextAlignment.LEFT);

        // Exp progress bar
        const barLeft = -innerW / 2 + 100;
        const barW = innerW - 180;
        const barH = 8;
        const barX = barLeft + barW / 2;
        const barBg = this.makeRect('ExpBarBg', levelBg, barW, barH, barX, 0, SLATE_900);
        this.drawBorder(barBg, barW, barH, SLATE_700, 1);
        const pct = 0.85;
        const fillW = Math.max(1, barW * pct);
        this.makeRect('ExpBarFill', barBg, fillW, barH, -barW / 2 + fillW / 2, 0, GREEN_600);

        this.makeLabel(levelBg, '8500/10000', 12, innerW / 2 - 60, 0, AMBER_200, 80, HorizontalTextAlignment.RIGHT);

        // 属性列表: 攻击/防御/速度/暴击
        const stats: StatInfo[] = [
            { name: '攻击', value: '850' },
            { name: '防御', value: '620' },
            { name: '速度', value: '75' },
            { name: '暴击', value: '45%' },
        ];

        const usableH = h - 6 - pad * 2 - titleH - pad - powerH - 8 - levelH - 8;
        const rowH = Math.min((usableH - (stats.length - 1) * 6) / stats.length, 36);

        for (let i = 0; i < stats.length; i++) {
            const rowY = levelY - levelH / 2 - 8 - i * (rowH + 6) - rowH / 2;
            this.buildStatRow(panel, innerW, rowH, 0, rowY, stats[i]);
        }
    }

    private buildStatRow(parent: Node, w: number, h: number, x: number, y: number, stat: StatInfo) {
        const border = this.makeRect('Stat_' + stat.name, parent, w, h, x, y, AMBER_800);
        const row = this.makeRect('StatBg', border, w - 4, h - 4, 0, 0, AMBER_950);

        const innerW = w - 4;
        const pad = 8;

        // Stat label
        const labelW = 56;
        const labelX = -innerW / 2 + pad + labelW / 2;
        const labelBd = this.makeRect('LabelBd', row, labelW, h - 12, labelX, 0, AMBER_700);
        this.makeRect('LabelBg', labelBd, labelW - 2, h - 14, 0, 0, AMBER_900);
        this.makeLabel(labelBd, stat.name, 12, 0, 0, AMBER_100, labelW - 8);

        // Stat value
        const valW = 80;
        const valX = innerW / 2 - pad - valW / 2;
        this.makeLabel(row, stat.value, 16, valX, 0, AMBER_200, valW, HorizontalTextAlignment.RIGHT);
    }

    // ── Corner decorations: L-shaped, amber-500, 2px ──
    private buildCornerDecorations(parent: Node, w: number, h: number, x: number, y: number) {
        const L     = 20;
        const thick = 2;

        const corners = [
            { cx: -w / 2 + 6, cy:  h / 2 - 6, dx:  1, dy: -1 },
            { cx:  w / 2 - 6, cy:  h / 2 - 6, dx: -1, dy: -1 },
            { cx: -w / 2 + 6, cy: -h / 2 + 6, dx:  1, dy:  1 },
            { cx:  w / 2 - 6, cy: -h / 2 + 6, dx: -1, dy:  1 },
        ];

        for (const c of corners) {
            const cn = this.makeNode('Corner', parent, L * 2 + 4, L * 2 + 4, x + c.cx, y + c.cy);
            const g = cn.addComponent(Graphics);
            g.strokeColor = AMBER_500;
            g.lineWidth   = thick;
            g.moveTo(0,        c.dy * L);
            g.lineTo(0,        0);
            g.lineTo(c.dx * L, 0);
            g.stroke();
        }
    }

    // ── Helpers ──
    private makeNode(name: string, parent: Node, w: number, h: number, x: number, y: number): Node {
        const node = new Node(name);
        node.layer = Layers.Enum.UI_2D;
        parent.addChild(node);
        node.setPosition(x, y, 0);
        node.addComponent(UITransform).setContentSize(w, h);
        return node;
    }

    /** 创建纯色矩形节点（无圆角）。 */
    private makeRect(name: string, parent: Node, w: number, h: number, x: number, y: number, fill: Color): Node {
        const node = this.makeNode(name, parent, w, h, x, y);
        const g = node.addComponent(Graphics);
        g.fillColor = fill;
        g.rect(-w / 2, -h / 2, w, h);
        g.fill();
        return node;
    }

    /** 在已有节点上绘制矩形边框。 */
    private drawBorder(node: Node, w: number, h: number, color: Color, lineWidth: number) {
        const g = node.getComponent(Graphics);
        if (!g) return;
        g.strokeColor = color;
        g.lineWidth = lineWidth;
        g.rect(-w / 2, -h / 2, w, h);
        g.stroke();
    }

    private makeLabel(parent: Node, text: string, fontSize: number, x: number, y: number,
                      color: Color, width: number, align = HorizontalTextAlignment.CENTER): Label {
        const node = new Node('Label');
        node.layer = Layers.Enum.UI_2D;
        parent.addChild(node);
        node.setPosition(x, y, 0);
        node.addComponent(UITransform).setContentSize(width, fontSize + 12);
        const label = node.addComponent(Label);
        label.string          = text;
        label.fontSize        = fontSize;
        label.lineHeight      = fontSize + 4;
        label.color           = color;
        label.horizontalAlign = align;
        label.overflow        = Label.Overflow.SHRINK;
        return label;
    }
}

// ── Auto-mount: waits for FrameworkPage's Content node, then fills it ──
function mountCharacterPage() {
    const scene = director.getScene();
    if (!scene) return;

    const canvas = find('Canvas', scene);
    if (!canvas) return;

    const frameworkRoot = canvas.getChildByName('FrameworkRoot');
    if (!frameworkRoot) {
        setTimeout(mountCharacterPage, 50);
        return;
    }

    const contentNode = frameworkRoot.getChildByName('Content');
    if (!contentNode) {
        setTimeout(mountCharacterPage, 50);
        return;
    }

    if (contentNode.getChildByName('CharacterContent')) return;

    const t = contentNode.getComponent(UITransform);
    const cw = t ? t.width : 688;
    const ch = t ? t.height : 958;

    const root = new Node('CharacterContent');
    root.layer = Layers.Enum.UI_2D;
    contentNode.addChild(root);
    root.addComponent(UITransform).setContentSize(cw, ch);
    // Dark background
    const bg = root.addComponent(Graphics);
    bg.fillColor = SLATE_800;
    bg.rect(-cw / 2, -ch / 2, cw, ch);
    bg.fill();
    root.addComponent(CharacterPage);
}

director.on(Director.EVENT_AFTER_SCENE_LAUNCH, mountCharacterPage);
setTimeout(() => mountCharacterPage(), 0);

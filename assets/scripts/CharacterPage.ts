/**
 * 角色总览页面 — 填充 FrameworkPage 内容区域
 * 扁平化设计（无圆角/无渐变/无阴影）
 * 包含：标题横幅 | 本命法器 | 角色形象 | 基础属性 | 功法造诣 | 四角装饰
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

// ── Color palette (扁平化纯色，对齐指南规范) ──
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

const BLUE_100   = new Color(219, 234, 254, 255);  // #dbeafe
const BLUE_200   = new Color(191, 219, 254, 255);  // #bfdbfe
const BLUE_600   = new Color( 37,  99, 235, 255);  // #2563eb
const BLUE_700   = new Color( 29,  78, 216, 255);  // #1d4ed8
const BLUE_800   = new Color( 30,  64, 175, 255);  // #1e40af
const BLUE_900   = new Color( 30,  58, 138, 255);  // #1e3a8a
const BLUE_950   = new Color( 23,  37,  84, 255);  // #172554

const RED_800    = new Color(153,  27,  27, 255);  // #991b1b
const GREEN_800  = new Color( 22, 101,  52, 255);  // #166534

const YELLOW_300 = new Color(253, 224,  71, 255);  // #fde047

const TEXT_WHITE = new Color(248, 248, 248, 255);

interface StatInfo {
    name: string;
    cur: number;
    max: number;
    barColor: Color;
}

interface EquipSlotInfo {
    slot: string;
    name: string;
    level: number;
}

interface SkillInfo {
    name: string;
    level: number;
    cur: number;
    max: number;
}

@ccclass('CharacterPage')
export class CharacterPage extends Component {
    onLoad() {
        this.buildPage();
    }

    private buildPage() {
        const t = this.node.getComponent(UITransform);
        const w = t ? t.width : 696;
        const h = t ? t.height : 990;
        const PAD = 12;

        let curY = h / 2; // cursor at top edge

        // ── 1. MainContent: border + TitleBanner + EquipPanel + CharPanel ──
        const mainH = 360;
        curY -= PAD + mainH / 2;
        this.buildMainContent(this.node, w - PAD * 2, mainH, 0, curY);
        curY -= mainH / 2;

        // ── 2. BottomPanels: StatsPanel + SkillsPanel side by side ──
        const bottomH = 240;
        curY -= PAD + bottomH / 2;
        this.buildBottomPanels(this.node, w - PAD * 2, bottomH, 0, curY);
        curY -= bottomH / 2;

        // ── Corner decorations ──
        this.buildCornerDecorations(this.node, w - PAD * 2, mainH + PAD + bottomH + PAD * 2, 0,
            h / 2 - PAD - (mainH + PAD + bottomH + PAD * 2) / 2);
    }

    // ══════════════════════════════════════════════════
    //  MainContent: 696×360, border 3px amber-700
    // ══════════════════════════════════════════════════
    private buildMainContent(parent: Node, w: number, h: number, x: number, y: number) {
        // Outer border: amber-700
        const outer = this.makeRect('MainBorder', parent, w, h, x, y, AMBER_700);
        // Inner bg: slate-800
        const inner = this.makeRect('MainBg', outer, w - 6, h - 6, 0, 0, SLATE_800);

        const pad = 10;
        const usableW = w - 6 - pad * 2;

        // TitleBanner at top
        const bannerH = 36;
        const bannerY = (h - 6) / 2 - pad - bannerH / 2;
        this.buildTitleBanner(inner, usableW, bannerH, 0, bannerY);

        // Two columns below banner
        const colGap = 8;
        const colH = h - 6 - pad * 2 - bannerH - pad;
        const colW = (usableW - colGap) / 2;
        const colY = bannerY - bannerH / 2 - pad - colH / 2;

        this.buildEquipmentPanel(inner, colW, colH, -usableW / 2 + colW / 2, colY);
        this.buildCharacterPanel(inner, colW, colH,  usableW / 2 - colW / 2, colY);
    }

    // ── TitleBanner: bg blue-700, border 2px amber-400, text "角色总览" ──
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
    //  EquipmentPanel: bg slate-900, border 2px slate-600
    // ══════════════════════════════════════════════════
    private buildEquipmentPanel(parent: Node, w: number, h: number, x: number, y: number) {
        const border = this.makeRect('EquipBorder', parent, w, h, x, y, SLATE_600);
        const panel = this.makeRect('EquipBg', border, w - 4, h - 4, 0, 0, SLATE_900);

        const pad = 8;
        const innerW = w - 4 - pad * 2;

        // Section title: "本命法器", bg amber-800, border 2px amber-300
        const titleH = 28;
        const titleY = (h - 4) / 2 - pad - titleH / 2;
        const titleBorder = this.makeRect('EquipTitleBd', panel, innerW, titleH, 0, titleY, AMBER_300);
        this.makeRect('EquipTitleBg', titleBorder, innerW - 4, titleH - 4, 0, 0, AMBER_800);
        this.makeLabel(titleBorder, '本命法器', 14, 0, 0, AMBER_100, innerW - 20);

        // Equipment slots
        const slots: EquipSlotInfo[] = [
            { slot: '飞剑位', name: '青霜剑', level: 1 },
            { slot: '护符位', name: '玄甲符', level: 1 },
            { slot: '灵灯位', name: '寻宝灯', level: 1 },
        ];

        const usableH = h - 4 - pad * 2 - titleH - pad;
        const slotH = Math.min((usableH - (slots.length - 1) * 8) / slots.length, 52);

        for (let i = 0; i < slots.length; i++) {
            const slotY = titleY - titleH / 2 - pad - i * (slotH + 8) - slotH / 2;
            this.buildEquipSlot(panel, innerW, slotH, 0, slotY, slots[i]);
        }
    }

    private buildEquipSlot(parent: Node, w: number, h: number, x: number, y: number, info: EquipSlotInfo) {
        // bg slate-800, border 2px slate-600
        const border = this.makeRect('Slot_' + info.name, parent, w, h, x, y, SLATE_600);
        const slot = this.makeRect('SlotBg', border, w - 4, h - 4, 0, 0, SLATE_800);

        // Icon: 40×40, border 2px amber-600, bg slate-900
        const iconSize = Math.min(h - 12, 40);
        const iconX = -(w - 4) / 2 + 6 + iconSize / 2;
        const iconBd = this.makeRect('IconBd', slot, iconSize, iconSize, iconX, 0, AMBER_600);
        this.makeRect('IconBg', iconBd, iconSize - 4, iconSize - 4, 0, 0, SLATE_900);
        this.makeLabel(iconBd, '✦', 16, 0, 0, AMBER_400, iconSize - 6);

        // Text: slot name (amber-400), equip name (amber-100), level (slate-300)
        const textLeft = iconX + iconSize / 2 + 6;
        const textW = (w - 4) / 2 - textLeft - 4;
        const textCX = textLeft + textW / 2;

        this.makeLabel(slot, info.slot, 10, textCX, 12, AMBER_400, textW, HorizontalTextAlignment.LEFT);
        this.makeLabel(slot, info.name, 12, textCX, -2, AMBER_100, textW, HorizontalTextAlignment.LEFT);
        this.makeLabel(slot, 'Lv.' + info.level + ' ★', 10, textCX, -14, SLATE_300, textW, HorizontalTextAlignment.LEFT);
    }

    // ══════════════════════════════════════════════════
    //  CharacterPanel: bg slate-800, border 2px slate-600
    // ══════════════════════════════════════════════════
    private buildCharacterPanel(parent: Node, w: number, h: number, x: number, y: number) {
        const border = this.makeRect('CharBorder', parent, w, h, x, y, SLATE_600);
        const panel = this.makeRect('CharBg', border, w - 4, h - 4, 0, 0, SLATE_800);

        const pad = 8;
        const innerW = w - 4 - pad * 2;

        // Section title: "角色形象", bg amber-800, border 2px amber-300
        const titleH = 28;
        const titleY = (h - 4) / 2 - pad - titleH / 2;
        const titleBorder = this.makeRect('CharTitleBd', panel, innerW, titleH, 0, titleY, AMBER_300);
        this.makeRect('CharTitleBg', titleBorder, innerW - 4, titleH - 4, 0, 0, AMBER_800);
        this.makeLabel(titleBorder, '角色形象', 14, 0, 0, AMBER_100, innerW - 20);

        // Character display area
        const displaySize = Math.min(innerW - 16, h - 4 - pad * 2 - titleH - pad - 40, 112);
        const displayY = titleY - titleH / 2 - pad - displaySize / 2 - 8;
        this.makeRect('CharDisplay', panel, displaySize, displaySize, 0, displayY, SLATE_700);
        this.makeLabel(panel, '角色\n展示', 16, 0, displayY, SLATE_400, displaySize - 12);

        // Pedestal: 112×28, bg amber-900, border 3px amber-700
        const pedW = 112;
        const pedH = 28;
        const pedY = displayY - displaySize / 2 - pedH / 2 - 4;
        const pedBorder = this.makeRect('PedestalBd', panel, pedW, pedH, 0, pedY, AMBER_700);
        this.makeRect('PedestalBg', pedBorder, pedW - 6, pedH - 6, 0, 0, AMBER_900);
        // Inner decoration
        const decBorder = this.makeRect('PedestalDec', pedBorder, pedW - 18, pedH - 12, 0, 0, AMBER_600);
        this.makeRect('PedestalDecBg', decBorder, pedW - 22, pedH - 16, 0, 0, AMBER_900);

        // Sparkle decorations (4 stars)
        const sparkles = [
            { sx: -innerW / 2 + 16, sy: titleY - 20, size: 10 },
            { sx:  innerW / 2 - 16, sy: titleY - 20, size: 12 },
            { sx: -innerW / 2 + 24, sy: pedY + 16,   size: 10 },
            { sx:  innerW / 2 - 24, sy: pedY + 16,   size: 12 },
        ];
        for (const sp of sparkles) {
            this.makeLabel(panel, '✦', sp.size, sp.sx, sp.sy, YELLOW_300, sp.size + 4);
        }
    }

    // ══════════════════════════════════════════════════
    //  BottomPanels: StatsPanel + SkillsPanel side by side
    // ══════════════════════════════════════════════════
    private buildBottomPanels(parent: Node, w: number, h: number, x: number, y: number) {
        const gap = 8;
        const colW = (w - gap) / 2;
        this.buildStatsPanel(parent, colW, h, x - w / 2 + colW / 2, y);
        this.buildSkillsPanel(parent, colW, h, x + w / 2 - colW / 2, y);
    }

    // ── StatsPanel: bg amber-900, border 3px amber-700 ──
    private buildStatsPanel(parent: Node, w: number, h: number, x: number, y: number) {
        const outer = this.makeRect('StatsBorder', parent, w, h, x, y, AMBER_700);
        const panel = this.makeRect('StatsBg', outer, w - 6, h - 6, 0, 0, AMBER_900);

        const pad = 10;
        const innerW = w - 6 - pad * 2;

        // Title: "基础属性", bg amber-800, border 2px amber-400
        const titleH = 28;
        const titleY = (h - 6) / 2 - pad - titleH / 2;
        const titleBd = this.makeRect('StatsTitleBd', panel, innerW, titleH, 0, titleY, AMBER_400);
        this.makeRect('StatsTitleBg', titleBd, innerW - 4, titleH - 4, 0, 0, AMBER_800);
        this.makeLabel(titleBd, '基础属性', 14, 0, 0, AMBER_100, innerW - 20);

        // Stat items
        const stats: StatInfo[] = [
            { name: '气血',   cur: 160, max: 160, barColor: RED_800   },
            { name: '法力',   cur: 88,  max: 88,  barColor: BLUE_800  },
            { name: '行动力', cur: 180, max: 180, barColor: GREEN_800 },
        ];

        const usableH = h - 6 - pad * 2 - titleH - pad;
        const rowH = Math.min((usableH - (stats.length - 1) * 8) / stats.length, 44);

        for (let i = 0; i < stats.length; i++) {
            const rowY = titleY - titleH / 2 - pad - i * (rowH + 8) - rowH / 2;
            this.buildStatBar(panel, innerW, rowH, 0, rowY, stats[i]);
        }
    }

    private buildStatBar(parent: Node, w: number, h: number, x: number, y: number, stat: StatInfo) {
        // bg amber-950, border 2px amber-800
        const border = this.makeRect('Stat_' + stat.name, parent, w, h, x, y, AMBER_800);
        const row = this.makeRect('StatBg', border, w - 4, h - 4, 0, 0, AMBER_950);

        const innerW = w - 4;
        const pad = 6;

        // Stat label: bg amber-900, border 1px amber-700
        const labelW = 48;
        const labelH = h - 12;
        const labelX = -innerW / 2 + pad + labelW / 2;
        const labelBd = this.makeRect('LabelBd', row, labelW, labelH, labelX, 0, AMBER_700);
        this.makeRect('LabelBg', labelBd, labelW - 2, labelH - 2, 0, 0, AMBER_900);
        this.makeLabel(labelBd, stat.name, 12, 0, 0, AMBER_100, labelW - 8);

        // Progress bar: bg slate-900, border 1px slate-700
        const valW = 60;
        const barLeft = labelX + labelW / 2 + 6;
        const barRight = innerW / 2 - pad - valW - 4;
        const barW = barRight - barLeft;
        const barH = 6;
        const barX = barLeft + barW / 2;

        const barBgNode = this.makeRect('BarBg', row, barW, barH, barX, 0, SLATE_900);
        this.drawBorder(barBgNode, barW, barH, SLATE_700, 1);

        // Progress fill
        const pct = stat.cur / stat.max;
        const fillW = Math.max(1, barW * pct);
        this.makeRect('BarFill', barBgNode, fillW, barH, -barW / 2 + fillW / 2, 0, stat.barColor);

        // Value text: amber-200
        const valX = innerW / 2 - pad - valW / 2;
        this.makeLabel(row, stat.cur + '/' + stat.max, 14, valX, 0, AMBER_200, valW, HorizontalTextAlignment.RIGHT);
    }

    // ── SkillsPanel: bg blue-900, border 3px blue-700 ──
    private buildSkillsPanel(parent: Node, w: number, h: number, x: number, y: number) {
        const outer = this.makeRect('SkillsBorder', parent, w, h, x, y, BLUE_700);
        const panel = this.makeRect('SkillsBg', outer, w - 6, h - 6, 0, 0, BLUE_900);

        const pad = 10;
        const innerW = w - 6 - pad * 2;

        // Title: "功法造诣", bg blue-800, border 2px amber-400
        const titleH = 28;
        const titleY = (h - 6) / 2 - pad - titleH / 2;
        const titleBd = this.makeRect('SkillsTitleBd', panel, innerW, titleH, 0, titleY, AMBER_400);
        this.makeRect('SkillsTitleBg', titleBd, innerW - 4, titleH - 4, 0, 0, BLUE_800);
        this.makeLabel(titleBd, '功法造诣', 14, 0, 0, AMBER_100, innerW - 20);

        // Skill items
        const skills: SkillInfo[] = [
            { name: '炼丹术', level: 1, cur: 0, max: 13 },
            { name: '炼器术', level: 1, cur: 0, max: 13 },
            { name: '灵宠诀', level: 1, cur: 0, max: 13 },
            { name: '清心诀', level: 1, cur: 0, max: 13 },
        ];

        const usableH = h - 6 - pad * 2 - titleH - pad;
        const rowH = Math.min((usableH - (skills.length - 1) * 8) / skills.length, 40);

        for (let i = 0; i < skills.length; i++) {
            const rowY = titleY - titleH / 2 - pad - i * (rowH + 8) - rowH / 2;
            this.buildSkillRow(panel, innerW, rowH, 0, rowY, skills[i]);
        }
    }

    private buildSkillRow(parent: Node, w: number, h: number, x: number, y: number, skill: SkillInfo) {
        // bg blue-950, border 2px blue-800
        const border = this.makeRect('Skill_' + skill.name, parent, w, h, x, y, BLUE_800);
        const row = this.makeRect('SkillBg', border, w - 4, h - 4, 0, 0, BLUE_950);

        const innerW = w - 4;
        const pad = 6;

        // Skill name + level: blue-100
        const nameW = innerW * 0.4;
        const nameX = -innerW / 2 + pad + nameW / 2;
        this.makeLabel(row, skill.name + ' Lv.' + skill.level, 12, nameX, 0, BLUE_100, nameW, HorizontalTextAlignment.LEFT);

        // Progress bar: 96px, bg slate-900, border 1px slate-700
        const barW = 96;
        const barH = 6;
        const barX = nameX + nameW / 2 + 6 + barW / 2;
        const barBg = this.makeRect('BarBg', row, barW, barH, barX, 0, SLATE_900);
        this.drawBorder(barBg, barW, barH, SLATE_700, 1);

        // Fill: blue-600
        const pct = skill.cur / skill.max;
        if (pct > 0) {
            const fillW = Math.max(1, barW * pct);
            this.makeRect('BarFill', barBg, fillW, barH, -barW / 2 + fillW / 2, 0, BLUE_600);
        }

        // Value: blue-200
        const valW = 45;
        const valX = innerW / 2 - pad - valW / 2;
        this.makeLabel(row, skill.cur + '/' + skill.max, 12, valX, 0, BLUE_200, valW, HorizontalTextAlignment.RIGHT);
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
    const cw = t ? t.width : 696;
    const ch = t ? t.height : 990;

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

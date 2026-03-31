/**
 * 角色总览页面 — 填充 FrameworkPage 内容区域 (696×940)
 * 包含：标题横幅 | 本命法器 | 角色形象 | 角色属性 | 功法造诣 | 四角装饰
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
    Mask,
    Node,
    ScrollView,
    UITransform,
    director,
    find,
} from 'cc';

const { ccclass } = _decorator;

// Content area dimensions (696×940 from FrameworkPage)
const CW = 696;
const CH = 940;
const PAD = 12;

// ── Color palette ──
const GOLD_BORDER   = new Color(251, 191,  36, 255);  // #fbbf24
const GOLD_DARK     = new Color(217, 119,   6, 255);  // #d97706
const AMBER_BG      = new Color(120,  53,  15, 255);  // #78350f
const AMBER_GOLD    = new Color(254, 243, 199, 255);  // #fef3c7
const DARK_BG       = new Color( 30,  41,  59, 255);  // #1e293b
const PANEL_BG      = new Color( 51,  65,  85, 255);  // #334155
const TITLE_BLUE    = new Color( 37,  99, 235, 255);  // #2563eb
const BORDER_DARK   = new Color( 30,  30,  30, 255);
const TEXT_WHITE    = new Color(248, 248, 248, 255);
const TEXT_AMBER100 = new Color(254, 243, 199, 255);  // #fef3c7
const TEXT_SLATE400 = new Color(148, 163, 184, 255);  // #94a3b8
// Stat bar colors
const HP_BG         = new Color(153,  27,  27, 255);  // #991b1b
const HP_FILL       = new Color(220,  38,  38, 255);  // #dc2626
const MANA_BG       = new Color( 30,  58, 138, 255);  // #1e3a8a
const MANA_FILL     = new Color( 59, 130, 246, 255);  // #3b82f6
const ENERGY_BG     = new Color( 20,  83,  45, 255);  // #14532d
const ENERGY_FILL   = new Color( 34, 197,  94, 255);  // #22c55e

interface StatInfo {
    name: string;
    cur: number;
    max: number;
    pct: number;
    bg: Color;
    fill: Color;
}

@ccclass('CharacterPage')
export class CharacterPage extends Component {
    onLoad() {
        this.buildPage();
    }

    private buildPage() {
        const w = CW;
        const h = CH;

        // ── ScrollView container ──
        const svNode = this.makeNode('ScrollView', this.node, w, h, 0, 0);
        const sv = svNode.addComponent(ScrollView);
        sv.horizontal = false;
        sv.vertical = true;
        sv.inertia = true;
        sv.brake = 0.75;
        sv.elasticRange = 0.1;

        // View (mask / clipping region)
        const viewNode = this.makeNode('View', svNode, w, h, 0, 0);
        const mask = viewNode.addComponent(Mask);
        mask.type = Mask.Type.RECT;

        // Scrollable content (height = sum of all sections)
        const contentH = 660;
        const contentNode = this.makeNode('ScrollContent', viewNode, w, contentH, 0, (contentH - h) / 2);
        sv.content = contentNode;

        // ── Build sections top-to-bottom ──
        let curY = contentH / 2; // cursor starts at top edge of ScrollContent

        // 1. Title Banner
        const titleBannerH = 52;
        curY -= titleBannerH / 2 + PAD;
        this.buildTitleBanner(contentNode, w - 8, titleBannerH, 0, curY);
        curY -= titleBannerH / 2;

        // 2. Main columns (equipment left / character image right)
        const mainColH = 220;
        curY -= PAD + mainColH / 2;
        this.buildMainColumns(contentNode, w - 8, mainColH, 0, curY);
        curY -= mainColH / 2;

        // 3. Stats panel
        const statsH = 185;
        curY -= PAD + statsH / 2;
        this.buildStatsPanel(contentNode, w - 8, statsH, 0, curY);
        curY -= statsH / 2;

        // 4. Skills panel
        const skillsH = 145;
        curY -= PAD + skillsH / 2;
        this.buildSkillsPanel(contentNode, w - 8, skillsH, 0, curY);

        // Corner decorations overlay on the scroll node
        this.buildCornerDecorations(svNode, w, h);
    }

    // ── Section: Title Banner ──
    private buildTitleBanner(parent: Node, w: number, h: number, x: number, y: number) {
        const banner = this.makePanel('TitleBanner', parent, w, h, x, y, TITLE_BLUE, GOLD_BORDER, 4);

        // Left diamond
        const ds = 14;
        const dLeft = this.makePanel('DiamondL', banner, ds, ds, -(w / 2 - 36), 0, GOLD_BORDER, GOLD_BORDER, 0);
        dLeft.angle = 45;

        // Right diamond
        const dRight = this.makePanel('DiamondR', banner, ds, ds, w / 2 - 36, 0, GOLD_BORDER, GOLD_BORDER, 0);
        dRight.angle = 45;

        // Title text
        this.makeLabel(banner, '角色总览', 22, 0, 0, TEXT_WHITE, w - 100);
    }

    // ── Section: Main Columns ──
    private buildMainColumns(parent: Node, w: number, h: number, x: number, y: number) {
        const gap = 8;
        const colW = (w - gap) / 2;

        const leftX  = -w / 2 + colW / 2;
        const rightX =  w / 2 - colW / 2;

        this.buildEquipmentPanel(parent, colW, h, leftX, y);
        this.buildCharacterImagePanel(parent, colW, h, rightX, y);
    }

    // ── Left column: 本命法器 ──
    private buildEquipmentPanel(parent: Node, w: number, h: number, x: number, y: number) {
        const panel = this.makePanel('EquipPanel', parent, w, h, x, y, DARK_BG, AMBER_BG, 6);

        const titleH = 30;
        const titleY = h / 2 - titleH / 2 - 8;
        this.makeSectionTitle(panel, '本命法器', w - 16, titleH, 0, titleY, GOLD_DARK);

        const slots: Array<{ name: string; quality: string }> = [
            { name: '飞剑', quality: '品质：玄铁' },
            { name: '护符', quality: '品质：青铜' },
            { name: '灵灯', quality: '品质：白玉' },
        ];

        const usableH = h - titleH - 24;
        const slotH   = (usableH - (slots.length - 1) * 6) / slots.length;

        for (let i = 0; i < slots.length; i++) {
            const slotY = titleY - titleH / 2 - 8 - i * (slotH + 6) - slotH / 2;
            this.buildEquipSlot(panel, w - 16, slotH, 0, slotY, slots[i].name, slots[i].quality);
        }
    }

    private buildEquipSlot(parent: Node, w: number, h: number, x: number, y: number, name: string, quality: string) {
        const slot = this.makePanel('Slot_' + name, parent, w, h, x, y, PANEL_BG, AMBER_BG, 4);

        const iconSize = Math.min(h - 8, 44);
        const iconX = -w / 2 + iconSize / 2 + 6;
        const icon = this.makePanel('Icon', slot, iconSize, iconSize, iconX, 0, AMBER_BG, GOLD_DARK, 4);
        this.makeLabel(icon, '✦', 18, 0, 0, AMBER_GOLD, iconSize - 6);

        const textAreaLeft = iconX + iconSize / 2 + 8;  // left edge of text area (local coords)
        const textW = w / 2 - textAreaLeft - 4;          // width to right edge minus padding
        const textCX = textAreaLeft + textW / 2;         // center x of text box (local coords)
        this.makeLabel(slot, name,    14, textCX,  5, TEXT_AMBER100, textW, HorizontalTextAlignment.LEFT);
        this.makeLabel(slot, quality, 11, textCX, -9, TEXT_SLATE400, textW, HorizontalTextAlignment.LEFT);
    }

    // ── Right column: 角色形象 ──
    private buildCharacterImagePanel(parent: Node, w: number, h: number, x: number, y: number) {
        const panel = this.makePanel('CharPanel', parent, w, h, x, y, DARK_BG, GOLD_BORDER, 6);

        const titleH = 30;
        const titleY = h / 2 - titleH / 2 - 8;
        this.makeSectionTitle(panel, '角色形象', w - 16, titleH, 0, titleY, GOLD_BORDER);

        const displaySize = Math.min(w - 20, h - titleH - 28, 180);
        const displayY = titleY - titleH / 2 - 8 - displaySize / 2;
        const display = this.makePanel('CharDisplay', panel, displaySize, displaySize, 0, displayY, PANEL_BG, GOLD_BORDER, 4);
        this.makeLabel(display, '角色\n展示', 16, 0, 0, TEXT_SLATE400, displaySize - 12);
    }

    // ── Stats Panel: 角色属性 ──
    private buildStatsPanel(parent: Node, w: number, h: number, x: number, y: number) {
        const panel = this.makePanel('StatsPanel', parent, w, h, x, y, DARK_BG, GOLD_BORDER, 6);

        const titleH = 30;
        const titleY = h / 2 - titleH / 2 - 8;
        this.makeSectionTitle(panel, '角色属性', w - 16, titleH, 0, titleY, GOLD_BORDER);

        const stats: StatInfo[] = [
            { name: '气血',   cur: 800, max: 1000, pct: 0.80, bg: HP_BG,     fill: HP_FILL     },
            { name: '法力',   cur: 300, max:  500, pct: 0.60, bg: MANA_BG,   fill: MANA_FILL   },
            { name: '行动力', cur: 100, max:  100, pct: 1.00, bg: ENERGY_BG, fill: ENERGY_FILL },
        ];

        const usableH = h - titleH - 28;
        const rowH    = (usableH - (stats.length - 1) * 8) / stats.length;

        for (let i = 0; i < stats.length; i++) {
            const rowY = titleY - titleH / 2 - 8 - i * (rowH + 8) - rowH / 2;
            this.buildStatBar(panel, w - 20, rowH, 0, rowY, stats[i]);
        }
    }

    private buildStatBar(parent: Node, w: number, h: number, x: number, y: number, stat: StatInfo) {
        const row = this.makePanel('Bar_' + stat.name, parent, w, h, x, y,
            new Color(15, 23, 42, 255), stat.fill, 4);

        // Icon placeholder
        const iconSize = h - 8;
        const iconX = -w / 2 + iconSize / 2 + 4;
        const icon = this.makePanel('Icon', row, iconSize, iconSize, iconX, 0, stat.bg, stat.fill, 3);
        // small dot indicator
        const g = icon.getComponent(Graphics)!;
        g.fillColor = stat.fill;
        g.circle(0, 0, iconSize / 4);
        g.fill();

        // Stat name
        const nameW = 52;
        const nameX = iconX + iconSize / 2 + 4 + nameW / 2;  // center of name label (local coords)
        this.makeLabel(row, stat.name, 12, nameX, 0, TEXT_WHITE, nameW, HorizontalTextAlignment.LEFT);

        // Progress bar background
        const barLeft = iconX + iconSize / 2 + 4 + nameW + 4;  // left edge of bar (local coords)
        const barW    = w / 2 - barLeft - 4;                    // bar width to right edge
        const barBgX  = barLeft + barW / 2;                     // bar center x (local coords)
        const barBgH  = h - 14;
        const barBg = this.makePanel('BarBg', row, barW, barBgH, barBgX, 0, stat.bg, stat.fill, 3);

        // Fill
        const fillW = Math.max(1, barW * stat.pct);
        const fill = this.makePanel('BarFill', barBg, fillW, barBgH - 4, -barW / 2 + fillW / 2, 0, stat.fill, stat.fill, 2);

        // Value label overlaid on bar
        const valText = stat.cur + '/' + stat.max;
        this.makeLabel(barBg, valText, 11, 0, 0, TEXT_WHITE, barW - 6);
    }

    // ── Skills Panel: 功法造诣 ──
    private buildSkillsPanel(parent: Node, w: number, h: number, x: number, y: number) {
        const panel = this.makePanel('SkillsPanel', parent, w, h, x, y, DARK_BG, GOLD_BORDER, 6);

        const titleH = 30;
        const titleY = h / 2 - titleH / 2 - 8;
        this.makeSectionTitle(panel, '功法造诣', w - 16, titleH, 0, titleY, GOLD_BORDER);

        const skills = [
            '炼丹术 LV.3', '炼器术 LV.2', '符箓术 LV.5',
            '阵法术 LV.1', '御兽术 LV.4', '医术   LV.2',
        ];

        const cols   = 3;
        const rows   = 2;
        const gridW  = w - 24;
        const gridH  = h - titleH - 28;
        const cellW  = (gridW - (cols - 1) * 8) / cols;
        const cellH  = (gridH - (rows - 1) * 8) / rows;
        const gridY  = titleY - titleH / 2 - 8 - gridH / 2;

        for (let i = 0; i < skills.length; i++) {
            const col   = i % cols;
            const row   = Math.floor(i / cols);
            const cellX = -gridW / 2 + col * (cellW + 8) + cellW / 2;
            const cellY = gridY + gridH / 2 - row * (cellH + 8) - cellH / 2;

            const cell = this.makePanel('Skill_' + i, panel, cellW, cellH, cellX, cellY, PANEL_BG, AMBER_BG, 4);
            this.makeLabel(cell, skills[i], 12, 0, 0, TEXT_AMBER100, cellW - 8);
        }
    }

    // ── Corner decorations (L-shaped gold lines) ──
    private buildCornerDecorations(parent: Node, w: number, h: number) {
        const L     = 20;   // arm length
        const thick = 2.5;
        const off   = 6;    // inset from edge

        const corners = [
            { cx: -w / 2 + off, cy:  h / 2 - off, dx:  1, dy: -1 },
            { cx:  w / 2 - off, cy:  h / 2 - off, dx: -1, dy: -1 },
            { cx: -w / 2 + off, cy: -h / 2 + off, dx:  1, dy:  1 },
            { cx:  w / 2 - off, cy: -h / 2 + off, dx: -1, dy:  1 },
        ];

        for (const c of corners) {
            const cn = this.makeNode('Corner', parent, L * 2 + 4, L * 2 + 4, c.cx, c.cy);
            const g  = cn.addComponent(Graphics);
            g.strokeColor = GOLD_BORDER;
            g.lineWidth   = thick;
            g.moveTo(0,         c.dy * L);
            g.lineTo(0,         0);
            g.lineTo(c.dx * L,  0);
            g.stroke();
        }
    }

    // ── Shared helper ──
    private makeSectionTitle(parent: Node, text: string, w: number, h: number, x: number, y: number, borderColor: Color): Node {
        const node = this.makePanel('SectionTitle', parent, w, h, x, y, AMBER_BG, borderColor, 4);
        this.makeLabel(node, text, 14, 0, 0, AMBER_GOLD, w - 16);
        return node;
    }

    // ── Primitives (identical style to FrameworkPage helpers) ──
    private makeNode(name: string, parent: Node, w: number, h: number, x: number, y: number): Node {
        const node = new Node(name);
        node.layer = Layers.Enum.UI_2D;
        parent.addChild(node);
        node.setPosition(x, y, 0);
        node.addComponent(UITransform).setContentSize(w, h);
        return node;
    }

    private makePanel(name: string, parent: Node, w: number, h: number, x: number, y: number,
                      fill: Color, stroke: Color, radius: number): Node {
        const node = this.makeNode(name, parent, w, h, x, y);
        const g = node.addComponent(Graphics);
        g.fillColor   = fill;
        g.strokeColor = stroke;
        g.lineWidth   = 1.6;
        if (radius > 0) {
            g.roundRect(-w / 2, -h / 2, w, h, radius);
        } else {
            g.rect(-w / 2, -h / 2, w, h);
        }
        g.fill();
        g.roundRect(-w / 2, -h / 2, w, h, Math.max(radius, 0));
        g.stroke();
        return node;
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
        // FrameworkPage not yet mounted — retry shortly
        setTimeout(mountCharacterPage, 50);
        return;
    }

    const contentNode = frameworkRoot.getChildByName('Content');
    if (!contentNode) {
        setTimeout(mountCharacterPage, 50);
        return;
    }

    if (contentNode.getChildByName('CharacterContent')) return;

    const root = new Node('CharacterContent');
    root.layer = Layers.Enum.UI_2D;
    contentNode.addChild(root);
    root.addComponent(UITransform).setContentSize(CW, CH);
    // Dark background to cover the light content area
    const bg = root.addComponent(Graphics);
    bg.fillColor = DARK_BG;
    bg.rect(-CW / 2, -CH / 2, CW, CH);
    bg.fill();
    root.addComponent(CharacterPage);
}

director.on(Director.EVENT_AFTER_SCENE_LAUNCH, mountCharacterPage);
setTimeout(() => mountCharacterPage(), 0);

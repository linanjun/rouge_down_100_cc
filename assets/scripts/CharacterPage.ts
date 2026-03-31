/**
 * 角色页面 — 填充 FrameworkPage 内容区域
 * 按照 docs/COCOS_CREATOR_COMPLETE_GUIDE.md 规范重建
 * 扁平化设计（无圆角/无渐变/无阴影）
 * 包含：标题横幅 + 角色展示区(340×300 居中) + 底部双栏(装备面板 + 属性面板)
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
const AMBER_400  = new Color(251, 191,  36, 255);  // #fbbf24
const AMBER_500  = new Color(245, 158,  11, 255);  // #f59e0b
const AMBER_600  = new Color(217, 119,   6, 255);  // #d97706
const AMBER_700  = new Color(180,  83,   9, 255);  // #b45309
const AMBER_800  = new Color(146,  64,  14, 255);  // #92400e
const AMBER_900  = new Color(120,  53,  15, 255);  // #78350f
const AMBER_950  = new Color( 69,  26,   3, 255);  // #451a03

const BLUE_700   = new Color( 29,  78, 216, 255);  // #1d4ed8 (THEME_BLUE)
const BLUE_800   = new Color( 30,  64, 175, 255);  // #1e40af

const YELLOW_400 = new Color(250, 204,  21, 255);  // #facc15

const RED_800    = new Color(153,  27,  27, 255);  // #991b1b
const GREEN_800  = new Color( 22, 101,  52, 255);  // #166534
const PURPLE_800 = new Color( 91,  33, 182, 255);  // #5b21b6

interface EquipItem {
    slot: string;
    name: string;
    level: number;
}

interface StatItem {
    label: string;
    current: number;
    max: number;
    color: Color;
    showAsText?: boolean;
    textValue?: string;
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
        const PAD = 16;

        let curY = h / 2;

        // ── 四角装饰 ──
        this.buildCornerDecorations(this.node, w, h, 0, 0);

        // ── 标题横幅: "角色总览" ──
        const bannerH = 36;
        curY -= PAD + bannerH / 2;
        this.buildTitleBanner(this.node, w - PAD * 2, bannerH, 0, curY);
        curY -= bannerH / 2;

        // ── 角色展示区: 340×300 居中 ──
        const displayW = Math.min(340, w - PAD * 2);
        const displayH = 300;
        curY -= 20 + displayH / 2;
        this.buildCharacterDisplay(this.node, displayW, displayH, 0, curY);
        curY -= displayH / 2;

        // ── 底部双栏: 装备面板(左) + 属性面板(右) ──
        const bottomH = h / 2 + curY - PAD - 16;
        const colGap = 16;
        const colW = Math.floor((w - PAD * 2 - colGap) / 2);
        curY -= 16 + bottomH / 2;
        const leftX = -(colW + colGap) / 2;
        const rightX = (colW + colGap) / 2;

        this.buildEquipmentPanel(this.node, colW, bottomH, leftX, curY);
        this.buildStatsPanel(this.node, colW, bottomH, rightX, curY);
    }

    // ══════════════════════════════════════════════════
    //  标题横幅: bg THEME_BLUE, border 3px AMBER_400, text "角色总览"
    //  左右菱形装饰
    // ══════════════════════════════════════════════════
    private buildTitleBanner(parent: Node, w: number, h: number, x: number, y: number) {
        const border = this.makeRect('TitleBorder', parent, w, h, x, y, AMBER_400);
        const bg = this.makeRect('TitleBg', border, w - 6, h - 6, 0, 0, BLUE_700);
        this.makeLabel(bg, '角色总览', 16, 0, 0, AMBER_200, w - 96);

        // 左菱形装饰: 20×20, 旋转45度
        const ds = 20;
        const dLeft = this.makeRect('DiamondL', border, ds, ds, -(w / 2 - 10), 0, BLUE_700);
        this.drawBorder(dLeft, ds, ds, AMBER_400, 3);
        dLeft.angle = 45;

        // 右菱形装饰
        const dRight = this.makeRect('DiamondR', border, ds, ds, w / 2 - 10, 0, BLUE_700);
        this.drawBorder(dRight, ds, ds, AMBER_400, 3);
        dRight.angle = 45;
    }

    // ══════════════════════════════════════════════════
    //  角色展示区: 340×300 居中
    //  背景 SLATE_800, 边框 3px SLATE_600
    //  内含: 4个装饰星星 + 角色形象(128×128) + 修炼台座
    // ══════════════════════════════════════════════════
    private buildCharacterDisplay(parent: Node, w: number, h: number, x: number, y: number) {
        const border = this.makeRect('DisplayBorder', parent, w, h, x, y, SLATE_600);
        const panel = this.makeRect('DisplayBg', border, w - 6, h - 6, 0, 0, SLATE_800);

        const innerW = w - 6;
        const innerH = h - 6;
        const pad = 16;

        // 装饰星星 × 4 (四个角落附近)
        const sparkles = [
            { sx: -innerW / 2 + 28, sy:  innerH / 2 - 28, size: 12 },
            { sx:  innerW / 2 - 28, sy:  innerH / 2 - 28, size: 16 },
            { sx: -innerW / 2 + 28, sy: -innerH / 2 + 28, size: 16 },
            { sx:  innerW / 2 - 28, sy: -innerH / 2 + 28, size: 12 },
        ];
        for (const sp of sparkles) {
            this.makeLabel(panel, '✦', sp.size, sp.sx, sp.sy, YELLOW_400, sp.size + 4);
        }

        // 角色形象: 128×128, 居中偏上
        const charSize = 128;
        const charY = 20;
        const charBg = this.makeRect('CharDisplay', panel, charSize, charSize, 0, charY, SLATE_700);
        this.makeLabel(charBg, '角色\n立绘', 16, 0, 0, SLATE_400, charSize - 12);

        // 修炼台座: 128×28
        const pedW = 128;
        const pedH = 28;
        const pedY = charY - charSize / 2 - pedH / 2 - 4;
        const pedBorder = this.makeRect('PedestalBd', panel, pedW, pedH, 0, pedY, AMBER_700);
        this.makeRect('PedestalBg', pedBorder, pedW - 6, pedH - 6, 0, 0, AMBER_900);
        // 内边框装饰
        const decBorder = this.makeRect('PedestalDec', pedBorder, pedW - 14, pedH - 10, 0, 0, AMBER_600);
        this.makeRect('PedestalDecBg', decBorder, pedW - 18, pedH - 14, 0, 0, AMBER_900);
    }

    // ══════════════════════════════════════════════════
    //  装备面板: "本命法器" + 3个装备项
    //  ContentContainer: bg AMBER_900, border 4px AMBER_700
    // ══════════════════════════════════════════════════
    private buildEquipmentPanel(parent: Node, w: number, h: number, x: number, y: number) {
        // 外容器: amber-700 border (4px)
        const outer = this.makeRect('EquipBorder', parent, w, h, x, y, AMBER_700);
        const panel = this.makeRect('EquipBg', outer, w - 8, h - 8, 0, 0, AMBER_900);

        const pad = 12;
        const innerW = w - 8 - pad * 2;
        let curY = (h - 8) / 2;

        // 小标题 "本命法器"
        const titleH = 24;
        curY -= pad + titleH / 2;
        this.makeLabel(panel, '本命法器', 14, 0, curY, AMBER_200, innerW);
        curY -= titleH / 2;

        // 装备列表
        const equipment: EquipItem[] = [
            { slot: '飞剑位', name: '青霜剑', level: 1 },
            { slot: '护符位', name: '玄甲符', level: 1 },
            { slot: '灵灯位', name: '寻宝灯', level: 1 },
        ];

        const itemH = 70;
        const itemGap = 10;

        for (let i = 0; i < equipment.length; i++) {
            curY -= itemGap + itemH / 2;
            this.buildEquipmentItem(panel, innerW, itemH, 0, curY, equipment[i]);
            curY -= itemH / 2;
        }
    }

    // ── 装备项: 64×64图标 + 信息区 ──
    private buildEquipmentItem(parent: Node, w: number, h: number, x: number, y: number, equip: EquipItem) {
        // 背景: amber-950, 边框: 2px amber-800
        const item = this.makeRect('Equip_' + equip.slot, parent, w, h, x, y, AMBER_950);
        this.drawBorder(item, w, h, AMBER_800, 2);

        const pad = 10;
        const iconSize = 50;
        const iconX = -w / 2 + pad + iconSize / 2;

        // 图标: slate-900 背景, 3px amber-600 边框
        const iconBd = this.makeRect('IconBd', item, iconSize, iconSize, iconX, 0, AMBER_600);
        this.makeRect('IconBg', iconBd, iconSize - 6, iconSize - 6, 0, 0, SLATE_900);
        this.makeLabel(iconBd, '⚔', 20, 0, 0, AMBER_400, iconSize - 10);

        // 信息区
        const infoX = iconX + iconSize / 2 + pad;
        const infoW = w - pad * 2 - iconSize - pad;
        const infoCX = infoX + infoW / 2;

        // 槽位标签
        this.makeLabel(item, equip.slot, 10, infoCX, 16, AMBER_400, infoW, HorizontalTextAlignment.LEFT);
        // 装备名称
        this.makeLabel(item, equip.name, 14, infoCX, 0, AMBER_100, infoW, HorizontalTextAlignment.LEFT);
        // 等级 + 星星
        this.makeLabel(item, 'Lv.' + equip.level, 12, infoCX - infoW / 4, -16, SLATE_300, infoW / 2, HorizontalTextAlignment.LEFT);
        this.makeLabel(item, '★', 12, infoCX + infoW / 4, -16, YELLOW_400, 16);
    }

    // ══════════════════════════════════════════════════
    //  属性面板: "基础属性" + 4个属性条
    //  ContentContainer: bg AMBER_900, border 4px AMBER_700
    // ══════════════════════════════════════════════════
    private buildStatsPanel(parent: Node, w: number, h: number, x: number, y: number) {
        // 外容器
        const outer = this.makeRect('StatsBorder', parent, w, h, x, y, AMBER_700);
        const panel = this.makeRect('StatsBg', outer, w - 8, h - 8, 0, 0, AMBER_900);

        const pad = 12;
        const innerW = w - 8 - pad * 2;
        let curY = (h - 8) / 2;

        // 小标题 "基础属性"
        const titleH = 24;
        curY -= pad + titleH / 2;
        this.makeLabel(panel, '基础属性', 14, 0, curY, AMBER_200, innerW);
        curY -= titleH / 2;

        // 属性列表
        const stats: StatItem[] = [
            { label: '境界', current: 0, max: 30, color: PURPLE_800, showAsText: true, textValue: '练气一层' },
            { label: '气血', current: 160, max: 160, color: RED_800 },
            { label: '法力', current: 88, max: 88, color: BLUE_800 },
            { label: '行动力', current: 180, max: 180, color: GREEN_800 },
        ];

        const itemGap = 12;
        const usableH = (h - 8) - pad * 2 - titleH - pad;
        const itemH = Math.min((usableH - (stats.length - 1) * itemGap) / stats.length, 60);

        for (let i = 0; i < stats.length; i++) {
            curY -= itemGap + itemH / 2;
            this.buildStatItem(panel, innerW, itemH, 0, curY, stats[i]);
            curY -= itemH / 2;
        }
    }

    // ── 属性项: 标签框 + 进度条/文字 + 数值 ──
    private buildStatItem(parent: Node, w: number, h: number, x: number, y: number, stat: StatItem) {
        // 背景: amber-950, 边框: 2px amber-800
        const item = this.makeRect('Stat_' + stat.label, parent, w, h, x, y, AMBER_950);
        this.drawBorder(item, w, h, AMBER_800, 2);

        const pad = 8;
        const innerW = w - pad * 2;

        // 标签框: amber-900 背景, 1px amber-700 边框
        const labelW = 48;
        const labelH = h - 14;
        const labelX = -w / 2 + pad + labelW / 2;
        const labelBd = this.makeRect('LabelBd', item, labelW, labelH, labelX, 0, AMBER_700);
        this.makeRect('LabelBg', labelBd, labelW - 2, labelH - 2, 0, 0, AMBER_900);
        this.makeLabel(labelBd, stat.label, 12, 0, 0, AMBER_100, labelW - 6);

        // 数值标签: 14px bold amber-200, 右对齐
        const valW = 70;
        const valX = w / 2 - pad - valW / 2;

        if (stat.showAsText) {
            // 境界特殊显示: 文字值
            this.makeLabel(item, stat.textValue || '', 14, 0, 0, AMBER_200, w - pad * 2 - labelW - valW - 8);
        } else {
            // 进度条
            const barLeft = labelX + labelW / 2 + 8;
            const barRight = valX - valW / 2 - 8;
            const barW = barRight - barLeft;
            const barH = 8;
            const barX = (barLeft + barRight) / 2;

            const barBg = this.makeRect('BarBg', item, barW, barH, barX, 0, SLATE_900);
            this.drawBorder(barBg, barW, barH, SLATE_700, 1);

            const pct = stat.max > 0 ? stat.current / stat.max : 0;
            const fillW = Math.max(1, barW * pct);
            this.makeRect('BarFill', barBg, fillW, barH, -barW / 2 + fillW / 2, 0, stat.color);

            this.makeLabel(item, stat.current + '/' + stat.max, 14, valX, 0, AMBER_200, valW, HorizontalTextAlignment.RIGHT);
        }
    }

    // ── 四角装饰: L-shaped, amber-500, 3px, 12×12 ──
    private buildCornerDecorations(parent: Node, w: number, h: number, x: number, y: number) {
        const size = 12;
        const hs = size / 2;
        const offset = 6;

        const corners = [
            { cx: -w / 2 + offset + hs, cy:  h / 2 - offset - hs, dir: 'TL' },
            { cx:  w / 2 - offset - hs, cy:  h / 2 - offset - hs, dir: 'TR' },
            { cx: -w / 2 + offset + hs, cy: -h / 2 + offset + hs, dir: 'BL' },
            { cx:  w / 2 - offset - hs, cy: -h / 2 + offset + hs, dir: 'BR' },
        ];

        for (const c of corners) {
            const cn = this.makeNode('Corner_' + c.dir, parent, size, size, x + c.cx, y + c.cy);
            const g = cn.addComponent(Graphics);
            g.strokeColor = AMBER_500;
            g.lineWidth = 3;

            if (c.dir === 'TL') {
                g.moveTo(-hs, -hs); g.lineTo(-hs, hs); g.lineTo(hs, hs);
            } else if (c.dir === 'TR') {
                g.moveTo(-hs, hs); g.lineTo(hs, hs); g.lineTo(hs, -hs);
            } else if (c.dir === 'BL') {
                g.moveTo(-hs, hs); g.lineTo(-hs, -hs); g.lineTo(hs, -hs);
            } else {
                g.moveTo(hs, hs); g.lineTo(hs, -hs); g.lineTo(-hs, -hs);
            }
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

    /** 纯色矩形节点（无圆角）*/
    private makeRect(name: string, parent: Node, w: number, h: number, x: number, y: number, fill: Color): Node {
        const node = this.makeNode(name, parent, w, h, x, y);
        const g = node.addComponent(Graphics);
        g.fillColor = fill;
        g.rect(-w / 2, -h / 2, w, h);
        g.fill();
        return node;
    }

    /** 矩形描边边框 */
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

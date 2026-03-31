/**
 * 框架页面 — 720×1280 竖屏 · 扁平化设计（无圆角/无渐变/无阴影）
 * 顶部栏：头像 | 名字 + 境界 | 金币 | 钻石
 * 内容区：可由外部填充
 * 功能导航栏（快捷入口）：任务 | 商店 | 炼丹 | 炼器 | 功法 | 灵宠
 * 底部标签栏（主导航）：本命法器 | 人物 | 境界 | 洞天 | 钓鱼
 */
import {
    _decorator,
    Button,
    Color,
    Component,
    Director,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Layers,
    Node,
    ResolutionPolicy,
    UITransform,
    director,
    find,
    view,
} from 'cc';

const { ccclass } = _decorator;

const W = 720;
const H = 1280;

// ── Layout constants ──
const HEADER_H     = 84;
const NAV_BAR_H    = 100;
const BOTTOM_NAV_H = 90;
const GAP          = 8;

// ── Color palette (扁平化纯色，对齐指南规范) ──
const SLATE_200  = new Color(226, 232, 240, 255);  // #e2e8f0
const SLATE_300  = new Color(203, 213, 225, 255);  // #cbd5e1
const SLATE_400  = new Color(148, 163, 184, 255);  // #94a3b8
const SLATE_500  = new Color(100, 116, 139, 255);  // #64748b
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

const CYAN_100   = new Color(207, 250, 254, 255);  // #cffafe
const CYAN_400   = new Color( 34, 211, 238, 255);  // #22d3ee
const CYAN_600   = new Color(  8, 145, 178, 255);  // #0891b2
const CYAN_900   = new Color( 22,  78,  99, 255);  // #164e63

@ccclass('FrameworkPage')
export class FrameworkPage extends Component {
    private contentNode: Node | null = null;

    onLoad() {
        this.node.layer = Layers.Enum.UI_2D;
        const t = this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        t.setContentSize(W, H);

        this.drawBackground();
        this.buildHeader();
        this.buildContent();
        this.buildNavBar();
        this.buildBottomNav();
    }

    public getContentRoot() { return this.contentNode; }

    // ── Background: slate-800 纯色 ──
    private drawBackground() {
        const safeW = W * 2;
        const safeH = H * 2;
        const bg = this.makeNode('BG', this.node, safeW, safeH, 0, 0);
        const g = bg.addComponent(Graphics);
        g.fillColor = SLATE_800;
        g.rect(-safeW / 2, -safeH / 2, safeW, safeH);
        g.fill();
    }

    // ── HeaderSection: 720×84 ──
    private buildHeader() {
        const y = H / 2 - HEADER_H / 2;
        const header = this.makeNode('HeaderSection', this.node, W, HEADER_H, 0, y);

        // Avatar: 80×80, border 3px amber-600, bg slate-800
        const avatarSize = 80;
        const avatarX = -W / 2 + 8 + avatarSize / 2;
        const avatarBorder = this.makeRect('AvatarBorder', header, avatarSize, avatarSize, avatarX, 0, AMBER_600);
        this.makeRect('AvatarBg', avatarBorder, avatarSize - 6, avatarSize - 6, 0, 0, SLATE_800);
        this.makeLabel(avatarBorder, '头像', 14, 0, 0, AMBER_100, avatarSize - 10);

        // Middle column: NameBar + LevelBar
        const midX = avatarX + avatarSize / 2 + 8;
        const midW = 220;
        const midCX = midX + midW / 2;

        // NameBar: h40, bg amber-900, border 2px amber-600, text "来取快递"
        const nameH = 40;
        const nameY = (HEADER_H - 8) / 2 - nameH / 2 - 2;
        const nameBorder = this.makeRect('NameBorder', header, midW, nameH, midCX, nameY, AMBER_600);
        this.makeRect('NameBg', nameBorder, midW - 4, nameH - 4, 0, 0, AMBER_900);
        this.makeLabel(nameBorder, '来取快递', 18, 0, 0, AMBER_100, midW - 20);

        // LevelBar: h36, bg slate-700, border 2px slate-500, text "练气一层 0/30"
        const lvlH = 36;
        const lvlY = nameY - nameH / 2 - 4 - lvlH / 2;
        const lvlBorder = this.makeRect('LevelBorder', header, midW, lvlH, midCX, lvlY, SLATE_500);
        this.makeRect('LevelBg', lvlBorder, midW - 4, lvlH - 4, 0, 0, SLATE_700);
        this.makeLabel(lvlBorder, '练气一层 0/30', 12, 0, 0, SLATE_200, midW - 20);

        // Right column: GoldBar + DiamondBar
        const rightW = 150;
        const rightX = W / 2 - 8 - rightW / 2;

        // GoldBar: h40, bg amber-900, border 2px amber-600
        const goldBorder = this.makeRect('GoldBorder', header, rightW, nameH, rightX, nameY, AMBER_600);
        this.makeRect('GoldBg', goldBorder, rightW - 4, nameH - 4, 0, 0, AMBER_900);
        this.makeLabel(goldBorder, '💰', 16, -rightW / 2 + 24, 0, AMBER_400, 30);
        this.makeLabel(goldBorder, '999', 18, 12, 0, AMBER_100, rightW - 60);

        // DiamondBar: h36, bg cyan-900, border 2px cyan-600
        const diaB = this.makeRect('DiaBorder', header, rightW, lvlH, rightX, lvlY, CYAN_600);
        this.makeRect('DiaBg', diaB, rightW - 4, lvlH - 4, 0, 0, CYAN_900);
        this.makeLabel(diaB, '💎', 16, -rightW / 2 + 24, 0, CYAN_400, 30);
        this.makeLabel(diaB, '999', 18, 12, 0, CYAN_100, rightW - 60);
    }

    // ── Content Area ──
    private buildContent() {
        const topEdge    = H / 2 - HEADER_H - GAP;
        const bottomEdge = -H / 2 + BOTTOM_NAV_H + GAP + NAV_BAR_H + GAP;
        const contentH   = topEdge - bottomEdge;
        const contentY   = (topEdge + bottomEdge) / 2;
        const contentW   = W - 24; // 696
        this.contentNode = this.makeNode('Content', this.node, contentW, contentH, 0, contentY);
    }

    // ── NavigationBar: 696×100, 6 buttons ──
    private buildNavBar() {
        const items = ['任务', '商店', '炼丹', '炼器', '功法', '灵宠'];
        const y = -H / 2 + BOTTOM_NAV_H + GAP + NAV_BAR_H / 2;
        const rowW = W - 24; // 696

        // Outer border: amber-700
        const outer = this.makeRect('NavBarBorder', this.node, rowW, NAV_BAR_H, 0, y, AMBER_700);
        // Inner bg: slate-800
        const row = this.makeRect('NavBarBg', outer, rowW - 6, NAV_BAR_H - 6, 0, 0, SLATE_800);

        const innerW = rowW - 6 - 16; // available width inside padding
        const btnW = (innerW - 5 * 6) / 6;
        const btnH = NAV_BAR_H - 22;
        const totalW = 6 * btnW + 5 * 6;
        const startX = -totalW / 2 + btnW / 2;

        for (let i = 0; i < items.length; i++) {
            const bx = startX + i * (btnW + 6);

            // Button bg: slate-700, border: slate-600
            const btnBg = this.makeRect('Nav_' + items[i], row, btnW, btnH, bx, 0, SLATE_700);
            this.drawBorder(btnBg, btnW, btnH, SLATE_600, 2);
            btnBg.addComponent(Button).transition = Button.Transition.NONE;

            // Icon container: 36×36, bg slate-900, border amber-600
            const iconS = 36;
            const iconBg = this.makeRect('IconBg', btnBg, iconS, iconS, 0, 10, SLATE_900);
            this.drawBorder(iconBg, iconS, iconS, AMBER_600, 2);
            this.makeLabel(iconBg, '◈', 18, 0, 0, AMBER_400, iconS - 4);

            // Label: 10px amber-100
            this.makeLabel(btnBg, items[i], 10, 0, -22, AMBER_100, btnW - 4);
        }
    }

    // ── BottomNavBar: 696×90, 5 tabs ──
    private buildBottomNav() {
        const tabs = ['本命法器', '人物', '境界', '洞天', '钓鱼'];
        const y = -H / 2 + BOTTOM_NAV_H / 2;
        const barW = W - 24; // 696

        // Outer border: amber-700
        const outer = this.makeRect('BottomBorder', this.node, barW, BOTTOM_NAV_H, 0, y, AMBER_700);
        // Inner bg: slate-800
        const bar = this.makeRect('BottomBg', outer, barW - 6, BOTTOM_NAV_H - 6, 0, 0, SLATE_800);

        const innerW = barW - 6 - 16;
        const btnW = (innerW - 4 * 6) / 5;
        const btnH = BOTTOM_NAV_H - 20;
        const totalW = 5 * btnW + 4 * 6;
        const startX = -totalW / 2 + btnW / 2;

        for (let i = 0; i < tabs.length; i++) {
            const bx = startX + i * (btnW + 6);
            const isActive = (i === 0); // 本命法器 is active by default

            // Colors per state
            const bgColor     = isActive ? AMBER_800 : SLATE_700;
            const borderColor = isActive ? AMBER_500 : SLATE_600;
            const iconBgColor = isActive ? AMBER_900 : SLATE_900;
            const iconBdColor = isActive ? AMBER_600 : SLATE_700;
            const iconColor   = isActive ? AMBER_200 : SLATE_400;
            const labelColor  = isActive ? AMBER_100 : SLATE_300;

            const btnBg = this.makeRect('Tab_' + tabs[i], bar, btnW, btnH, bx, 0, bgColor);
            this.drawBorder(btnBg, btnW, btnH, borderColor, 2);
            btnBg.addComponent(Button).transition = Button.Transition.NONE;

            // Icon container: 36×36
            const iconS = 36;
            const iconBg = this.makeRect('IconBg', btnBg, iconS, iconS, 0, 8, iconBgColor);
            this.drawBorder(iconBg, iconS, iconS, iconBdColor, 2);
            this.makeLabel(iconBg, '◈', 18, 0, 0, iconColor, iconS - 4);

            // Label: 10px
            this.makeLabel(btnBg, tabs[i], 10, 0, -22, labelColor, btnW - 4);
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

// ── Auto‑mount ──
function mount() {
    const scene = director.getScene();
    if (!scene) return;
    const canvas = find('Canvas', scene);
    if (!canvas || canvas.getChildByName('FrameworkRoot')) return;
    view.setDesignResolutionSize(W, H, ResolutionPolicy.FIXED_WIDTH);
    const root = new Node('FrameworkRoot');
    root.layer = Layers.Enum.UI_2D;
    canvas.addChild(root);
    root.addComponent(UITransform).setContentSize(W, H);
    root.addComponent(FrameworkPage);
}
director.on(Director.EVENT_AFTER_SCENE_LAUNCH, mount);
setTimeout(() => mount(), 0);

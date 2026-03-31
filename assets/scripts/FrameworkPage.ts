/**
 * 框架页面 — 720×1280 竖屏 · 扁平化设计（无圆角/无渐变/无阴影）
 * 按照 docs/COCOS_CREATOR_GUIDE.md 规范重建
 * 布局顺序：TopBar → NavigationBar → Content Area → BottomNavBar
 * 顶部栏：头像 | 信息区（名字+境界 / 金币+钻石）
 * 功能导航栏：任务 | 商店 | 炼丹 | 炼器 | 功法 | 灵宠
 * 内容区：可由外部填充（带装饰角标记）
 * 底部标签栏：法器 | 独钓 | 角色(激活) | 秘境 | 洞天
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

// ── Layout constants (按 COCOS_CREATOR_GUIDE.md) ──
const TOPBAR_H     = 106;
const NAV_BAR_H    = 80;
const BOTTOM_NAV_H = 80;
const GAP          = 8;
const CONTENT_PAD  = 16;

// ── Color palette (扁平化纯色，按指南配色系统) ──
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
        this.buildTopBar();
        this.buildNavBar();
        this.buildContent();
        this.buildBottomNav();
    }

    public getContentRoot() { return this.contentNode; }

    // ── 背景: slate-800 (外背景) + 4px amber-500 外边框 (主边框) ──
    private drawBackground() {
        const safeW = W * 2;
        const safeH = H * 2;
        const bg = this.makeNode('BG', this.node, safeW, safeH, 0, 0);
        const g = bg.addComponent(Graphics);
        g.fillColor = SLATE_800;
        g.rect(-safeW / 2, -safeH / 2, safeW, safeH);
        g.fill();

        // 4px 金色外边框 (amber-500, 主边框)
        const frame = this.makeNode('OuterFrame', this.node, W, H, 0, 0);
        const fg = frame.addComponent(Graphics);
        fg.strokeColor = AMBER_500;
        fg.lineWidth = 4;
        fg.rect(-W / 2, -H / 2, W, H);
        fg.stroke();
    }

    // ── TopBar (顶部栏): 720×106 ──
    // 布局: 头像(左) + 信息区(右: 名字+境界 / 金币+钻石)
    private buildTopBar() {
        const y = H / 2 - TOPBAR_H / 2;
        const topbar = this.makeNode('TopBar', this.node, W, TOPBAR_H, 0, y);

        const pad = 8;
        const innerH = TOPBAR_H - pad * 2; // 90
        const innerW = W - pad * 2;         // 704

        // 头像: 90×90, 4px amber-600 边框, slate-800 背景
        const avatarSize = innerH;
        const avatarX = -innerW / 2 + avatarSize / 2;
        const avatarOuter = this.makeRect('AvatarBorder', topbar, avatarSize, avatarSize, avatarX, 0, AMBER_600);
        this.makeRect('AvatarBg', avatarOuter, avatarSize - 8, avatarSize - 8, 0, 0, SLATE_800);
        this.makeLabel(avatarOuter, '头像', 14, 0, 0, AMBER_100, avatarSize - 16);

        // 右侧信息区: 分为上下两行
        const infoLeft = avatarX + avatarSize / 2 + pad;
        const infoW = innerW - avatarSize - pad;
        const infoCX = infoLeft + infoW / 2;
        const rowH = (innerH - 6) / 2;

        // 上行: 名字面板 + 境界面板
        const topRowY = rowH / 2 + 3;
        const nameW = Math.floor(infoW * 0.55);
        const realmW = infoW - nameW - 6;

        // 名字面板: amber-900 背景, 3px amber-600 边框
        const nameX = infoLeft + nameW / 2;
        const np = this.makeRect('NameBorder', topbar, nameW, rowH, nameX, topRowY, AMBER_600);
        this.makeRect('NameBg', np, nameW - 6, rowH - 6, 0, 0, AMBER_900);
        this.makeLabel(np, '剑仙·逍遥', 16, 0, 0, AMBER_100, nameW - 20);

        // 境界面板: amber-900 背景, 3px amber-700 边框
        const realmX = infoLeft + nameW + 6 + realmW / 2;
        const rp = this.makeRect('RealmBorder', topbar, realmW, rowH, realmX, topRowY, AMBER_700);
        this.makeRect('RealmBg', rp, realmW - 6, rowH - 6, 0, 0, AMBER_900);
        this.makeLabel(rp, '金丹期', 14, 0, 0, AMBER_200, realmW - 16);

        // 下行: 金币面板 + 钻石面板
        const botRowY = -rowH / 2 - 3;
        const halfW = Math.floor((infoW - 6) / 2);

        // 金币面板: amber-900 背景, 3px amber-600 边框
        const goldX = infoLeft + halfW / 2;
        const gp = this.makeRect('GoldBorder', topbar, halfW, rowH, goldX, botRowY, AMBER_600);
        this.makeRect('GoldBg', gp, halfW - 6, rowH - 6, 0, 0, AMBER_900);
        this.makeLabel(gp, '💰', 18, -halfW / 2 + 24, 0, AMBER_400, 28);
        this.makeLabel(gp, '99999', 16, 14, 0, AMBER_100, halfW - 56);

        // 钻石面板: cyan-900 背景, 3px cyan-600 边框
        const diaX = infoLeft + halfW + 6 + halfW / 2;
        const dp = this.makeRect('DiaBorder', topbar, halfW, rowH, diaX, botRowY, CYAN_600);
        this.makeRect('DiaBg', dp, halfW - 6, rowH - 6, 0, 0, CYAN_900);
        this.makeLabel(dp, '💎', 18, -halfW / 2 + 24, 0, CYAN_400, 28);
        this.makeLabel(dp, '888', 16, 14, 0, CYAN_100, halfW - 56);
    }

    // ── NavigationBar (功能导航栏): 720×80, 6 按钮 ──
    // 位置: TopBar 下方 (按指南布局顺序)
    private buildNavBar() {
        const items = ['任务', '商店', '炼丹', '炼器', '功法', '灵宠'];
        const y = H / 2 - TOPBAR_H - GAP - NAV_BAR_H / 2;
        const nav = this.makeNode('NavigationBar', this.node, W, NAV_BAR_H, 0, y);

        const pad = 8;
        const innerW = W - pad * 2;
        const btnGap = 6;
        const btnW = Math.floor((innerW - (items.length - 1) * btnGap) / items.length);
        const btnH = NAV_BAR_H - pad * 2;
        const totalW = items.length * btnW + (items.length - 1) * btnGap;
        const startX = -totalW / 2 + btnW / 2;

        for (let i = 0; i < items.length; i++) {
            const bx = startX + i * (btnW + btnGap);

            // 按钮: slate-700 背景, 3px slate-600 边框
            const btn = this.makeRect('Nav_' + items[i], nav, btnW, btnH, bx, 0, SLATE_700);
            this.drawBorder(btn, btnW, btnH, SLATE_600, 3);
            btn.addComponent(Button).transition = Button.Transition.NONE;

            // 图标容器: 40×40, slate-900 背景, 3px amber-600 边框
            const iconS = 40;
            const iconBg = this.makeRect('IconBg', btn, iconS, iconS, 0, 8, SLATE_900);
            this.drawBorder(iconBg, iconS, iconS, AMBER_600, 3);
            this.makeLabel(iconBg, '◈', 20, 0, 0, AMBER_400, iconS - 8);

            // 标签: 10px amber-100
            this.makeLabel(btn, items[i], 10, 0, -20, AMBER_100, btnW - 4);
        }
    }

    // ── Content Area (内容区): slate-900 背景 + 装饰角标记 ──
    // 位置: NavigationBar 下方, BottomNavBar 上方
    private buildContent() {
        const topEdge    = H / 2 - TOPBAR_H - GAP - NAV_BAR_H - GAP;
        const bottomEdge = -H / 2 + BOTTOM_NAV_H + GAP;
        const contentH   = topEdge - bottomEdge;
        const contentY   = (topEdge + bottomEdge) / 2;

        // 内容区背景: slate-900 (比外背景 slate-800 略深)
        const bg = this.makeRect('ContentBg', this.node, W, contentH, 0, contentY, SLATE_900);

        // 四角装饰 (L形, 3px amber-500)
        this.drawCorner(bg, W, contentH, 'TL');
        this.drawCorner(bg, W, contentH, 'TR');
        this.drawCorner(bg, W, contentH, 'BL');
        this.drawCorner(bg, W, contentH, 'BR');

        // 外部可填充内容节点 (FrameworkRoot 直接子节点, CharacterPage 自动挂载)
        this.contentNode = this.makeNode('Content', this.node,
            W - CONTENT_PAD * 2, contentH - CONTENT_PAD * 2, 0, contentY);
    }

    // ── BottomNavBar (底部标签栏): 720×80, 5 标签 ──
    // 标签: 法器 | 独钓 | 角色(激活) | 秘境 | 洞天
    private buildBottomNav() {
        const tabs = ['法器', '独钓', '角色', '秘境', '洞天'];
        const y = -H / 2 + BOTTOM_NAV_H / 2;
        const bar = this.makeNode('BottomNavBar', this.node, W, BOTTOM_NAV_H, 0, y);

        const pad = 8;
        const innerW = W - pad * 2;
        const btnGap = 6;
        const btnW = Math.floor((innerW - (tabs.length - 1) * btnGap) / tabs.length);
        const btnH = BOTTOM_NAV_H - pad * 2;
        const totalW = tabs.length * btnW + (tabs.length - 1) * btnGap;
        const startX = -totalW / 2 + btnW / 2;

        for (let i = 0; i < tabs.length; i++) {
            const bx = startX + i * (btnW + btnGap);
            const isActive = (i === 2); // 角色 tab is active by default

            const bgColor     = isActive ? AMBER_800 : SLATE_700;
            const borderColor = isActive ? AMBER_500 : SLATE_600;
            const iconBgColor = isActive ? AMBER_900 : SLATE_900;
            const iconBdColor = isActive ? AMBER_600 : SLATE_700;
            const iconColor   = isActive ? AMBER_200 : SLATE_500;
            const labelColor  = isActive ? AMBER_100 : SLATE_300;

            const btn = this.makeRect('Tab_' + tabs[i], bar, btnW, btnH, bx, 0, bgColor);
            this.drawBorder(btn, btnW, btnH, borderColor, 3);
            btn.addComponent(Button).transition = Button.Transition.NONE;

            // 图标容器: 40×40
            const iconS = 40;
            const iconBg = this.makeRect('IconBg', btn, iconS, iconS, 0, 8, iconBgColor);
            this.drawBorder(iconBg, iconS, iconS, iconBdColor, 3);
            this.makeLabel(iconBg, '◈', 20, 0, 0, iconColor, iconS - 8);

            // 标签: 10px
            this.makeLabel(btn, tabs[i], 10, 0, -20, labelColor, btnW - 4);
        }
    }

    // ── 装饰角: L形, 3px amber-500 ──
    private drawCorner(parent: Node, pw: number, ph: number, corner: string) {
        const size = 12;
        const hs = size / 2;

        let cx: number, cy: number;
        if (corner === 'TL')      { cx = -pw / 2 + hs; cy =  ph / 2 - hs; }
        else if (corner === 'TR') { cx =  pw / 2 - hs; cy =  ph / 2 - hs; }
        else if (corner === 'BL') { cx = -pw / 2 + hs; cy = -ph / 2 + hs; }
        else                      { cx =  pw / 2 - hs; cy = -ph / 2 + hs; }

        const node = this.makeNode('Corner_' + corner, parent, size, size, cx, cy);
        const g = node.addComponent(Graphics);
        g.strokeColor = AMBER_500;
        g.lineWidth = 3;

        if (corner === 'TL') {
            g.moveTo(-hs, -hs); g.lineTo(-hs, hs); g.lineTo(hs, hs);
        } else if (corner === 'TR') {
            g.moveTo(-hs, hs); g.lineTo(hs, hs); g.lineTo(hs, -hs);
        } else if (corner === 'BL') {
            g.moveTo(-hs, hs); g.lineTo(-hs, -hs); g.lineTo(hs, -hs);
        } else {
            g.moveTo(hs, hs); g.lineTo(hs, -hs); g.lineTo(-hs, -hs);
        }
        g.stroke();
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

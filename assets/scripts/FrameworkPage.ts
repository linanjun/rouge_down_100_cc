/**
 * 框架页面 — 720×1280 竖屏 · 扁平化设计（无圆角/无渐变/无阴影）
 * 按照 docs/COCOS_CREATOR_COMPLETE_GUIDE.md 规范重建
 * 布局顺序：TopBar → ContentArea → NavigationBar → BottomNavBar
 * 顶部栏(98px)：头像 | 名字栏 | 金币栏 | 钻石栏
 * 内容区：可由外部填充（带装饰角标记）
 * 功能导航栏(72px)：任务 | 商店 | 炼丹 | 炼器 | 功法 | 灵宠
 * 底部标签栏(72px)：法器 | 独钓 | 角色(激活) | 秘境 | 洞天
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

// ── Layout constants (按 COCOS_CREATOR_COMPLETE_GUIDE.md) ──
const TOPBAR_H     = 98;
const NAV_BAR_H    = 72;
const BOTTOM_NAV_H = 72;
const GAP          = 8;
const CONTENT_PAD  = 16;

// ── Color palette (扁平化纯色，按指南配色系统) ──
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
        this.buildContent();
        this.buildNavBar();
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

    // ── TopBar (顶部栏): 720×98 ──
    // 布局: 头像(90×90) | 名字栏 | 金币栏 | 钻石栏
    private buildTopBar() {
        const y = H / 2 - TOPBAR_H / 2;
        const topbar = this.makeNode('TopBar', this.node, W, TOPBAR_H, 0, y);
        // 背景: slate-800
        const topbarBg = topbar.addComponent(Graphics);
        topbarBg.fillColor = SLATE_800;
        topbarBg.rect(-W / 2, -TOPBAR_H / 2, W, TOPBAR_H);
        topbarBg.fill();

        const pad = 8;
        const innerH = TOPBAR_H - pad * 2; // 82
        const innerW = W - pad * 2;         // 704

        // 头像: 90×90, 4px amber-600 边框, slate-800 背景
        const avatarSize = 90;
        const avatarX = -innerW / 2 + avatarSize / 2;
        const avatarOuter = this.makeRect('AvatarBorder', topbar, avatarSize, avatarSize, avatarX, 0, AMBER_600);
        this.makeRect('AvatarBg', avatarOuter, avatarSize - 8, avatarSize - 8, 0, 0, SLATE_800);
        this.makeLabel(avatarOuter, '头像', 14, 0, 0, AMBER_100, avatarSize - 16);

        // 信息区: 名字栏 + 金币栏 + 钻石栏 (水平排列, gap: 8px)
        const infoLeft = avatarX + avatarSize / 2 + pad;
        const infoW = innerW - avatarSize - pad;
        const boxGap = 8;
        const boxCount = 3;
        const boxW = Math.floor((infoW - (boxCount - 1) * boxGap) / boxCount);
        const boxH = innerH;

        // 名字栏: amber-900 背景, 3px amber-600 边框, 18px bold amber-100
        const nameX = infoLeft + boxW / 2;
        const np = this.makeRect('NameBorder', topbar, boxW, boxH, nameX, 0, AMBER_600);
        this.makeRect('NameBg', np, boxW - 6, boxH - 6, 0, 0, AMBER_900);
        this.makeLabel(np, '来取快递', 18, 0, 0, AMBER_100, boxW - 20);

        // 金币栏: amber-900 背景, 3px amber-600 边框
        const goldX = infoLeft + boxW + boxGap + boxW / 2;
        const gp = this.makeRect('GoldBorder', topbar, boxW, boxH, goldX, 0, AMBER_600);
        this.makeRect('GoldBg', gp, boxW - 6, boxH - 6, 0, 0, AMBER_900);
        this.makeLabel(gp, '💰', 18, -boxW / 4, 0, AMBER_400, 32);
        this.makeLabel(gp, '99999', 18, boxW / 8, 0, AMBER_100, boxW - 48);

        // 钻石栏: cyan-900 背景, 3px cyan-600 边框
        const diaX = infoLeft + (boxW + boxGap) * 2 + boxW / 2;
        const dp = this.makeRect('DiaBorder', topbar, boxW, boxH, diaX, 0, CYAN_600);
        this.makeRect('DiaBg', dp, boxW - 6, boxH - 6, 0, 0, CYAN_900);
        this.makeLabel(dp, '💎', 18, -boxW / 4, 0, CYAN_400, 32);
        this.makeLabel(dp, '888', 18, boxW / 8, 0, new Color(207, 250, 254, 255), boxW - 48);
    }

    // ── Content Area (内容区): slate-900 背景 + 装饰角标记 ──
    // 位置: TopBar 下方, NavigationBar 上方
    private buildContent() {
        const topEdge    = H / 2 - TOPBAR_H - GAP;
        const bottomEdge = -H / 2 + BOTTOM_NAV_H + GAP + NAV_BAR_H + GAP;
        const contentH   = topEdge - bottomEdge;
        const contentY   = (topEdge + bottomEdge) / 2;

        // 内容区背景: slate-900 (比外背景 slate-800 略深)
        const bg = this.makeRect('ContentBg', this.node, W, contentH, 0, contentY, SLATE_900);

        // 四角装饰 (L形, 3px amber-500)
        this.drawCorner(bg, W, contentH, 'TL');
        this.drawCorner(bg, W, contentH, 'TR');
        this.drawCorner(bg, W, contentH, 'BL');
        this.drawCorner(bg, W, contentH, 'BR');

        // 外部可填充内容节点
        this.contentNode = this.makeNode('Content', this.node,
            W - CONTENT_PAD * 2, contentH - CONTENT_PAD * 2, 0, contentY);
    }

    // ── NavigationBar (功能导航栏): 720×72, 6 按钮 ──
    // 位置: Content 下方, BottomNavBar 上方
    private buildNavBar() {
        const items = ['任务', '商店', '炼丹', '炼器', '功法', '灵宠'];
        const y = -H / 2 + BOTTOM_NAV_H + GAP + NAV_BAR_H / 2;
        const nav = this.makeNode('NavigationBar', this.node, W, NAV_BAR_H, 0, y);
        // 背景: slate-800
        const navBg = nav.addComponent(Graphics);
        navBg.fillColor = SLATE_800;
        navBg.rect(-W / 2, -NAV_BAR_H / 2, W, NAV_BAR_H);
        navBg.fill();

        const pad = 8;
        const innerW = W - pad * 2;
        const btnGap = 6;
        const btnW = Math.floor((innerW - (items.length - 1) * btnGap) / items.length);
        const btnH = NAV_BAR_H - pad * 2; // 56
        const totalW = items.length * btnW + (items.length - 1) * btnGap;
        const startX = -totalW / 2 + btnW / 2;

        for (let i = 0; i < items.length; i++) {
            const bx = startX + i * (btnW + btnGap);

            // 按钮: slate-700 背景, 3px slate-600 边框
            const btn = this.makeRect('Nav_' + items[i], nav, btnW, btnH, bx, 0, SLATE_700);
            this.drawBorder(btn, btnW, btnH, SLATE_600, 3);
            btn.addComponent(Button).transition = Button.Transition.NONE;

            // 图标容器: 40×40, slate-900 背景, 3px amber-600 边框
            const iconS = Math.min(40, btnH - 20);
            const iconBg = this.makeRect('IconBg', btn, iconS, iconS, 0, 6, SLATE_900);
            this.drawBorder(iconBg, iconS, iconS, AMBER_600, 3);
            this.makeLabel(iconBg, '◈', 20, 0, 0, AMBER_400, iconS - 8);

            // 标签: 10px amber-100
            this.makeLabel(btn, items[i], 10, 0, -btnH / 2 + 8, AMBER_100, btnW - 4);
        }
    }

    // ── BottomNavBar (底部标签栏): 720×72, 5 标签 ──
    // 标签: 法器 | 独钓 | 角色(激活) | 秘境 | 洞天
    private buildBottomNav() {
        const tabs = ['法器', '独钓', '角色', '秘境', '洞天'];
        const y = -H / 2 + BOTTOM_NAV_H / 2;
        const bar = this.makeNode('BottomNavBar', this.node, W, BOTTOM_NAV_H, 0, y);
        // 背景: slate-800
        const barBg = bar.addComponent(Graphics);
        barBg.fillColor = SLATE_800;
        barBg.rect(-W / 2, -BOTTOM_NAV_H / 2, W, BOTTOM_NAV_H);
        barBg.fill();

        const pad = 8;
        const innerW = W - pad * 2;
        const btnGap = 6;
        const btnW = Math.floor((innerW - (tabs.length - 1) * btnGap) / tabs.length);
        const btnH = BOTTOM_NAV_H - pad * 2; // 56
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
            const iconS = Math.min(40, btnH - 20);
            const iconBg = this.makeRect('IconBg', btn, iconS, iconS, 0, 6, iconBgColor);
            this.drawBorder(iconBg, iconS, iconS, iconBdColor, 3);
            this.makeLabel(iconBg, '◈', 20, 0, 0, iconColor, iconS - 8);

            // 标签: 10px
            this.makeLabel(btn, tabs[i], 10, 0, -btnH / 2 + 8, labelColor, btnW - 4);
        }
    }

    // ── 装饰角: L形, 3px amber-500, 尺寸12×12 ──
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

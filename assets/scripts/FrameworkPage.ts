/**
 * 框架页面 — 720×1280 竖屏
 * 顶部栏：头像 | 名字 + 境界 | 金币 | 钻石
 * 内容区：可由外部填充
 * 活动栏（快捷入口）：任务 | 商城 | 炼丹 | 炼器 | 功法 | 灵宠
 * 底部栏（主导航）：法器 | 角色 | 秘境 | 洞天 | 独钓
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
    Vec3,
    director,
    find,
    view,
} from 'cc';

const { ccclass } = _decorator;

const W = 720;
const H = 1280;

// ── Layout constants ──
const SAFE_TOP = 0;    // 刘海屏预留，可按需调整
const SAFE_BOTTOM = 0; // Home指示条预留，可按需调整
const TOP_BAR_H = 88;
const BOTTOM_BAR_H = 108;
const SHORTCUT_ROW_H = 120;
const GAP = 8;

// ── Icon size standards (逻辑像素，设计分辨率 720×1280) ──
const ITEM_ICON_L = 100;  // 道具图标（大）：背包格子、奖励展示、合成界面
const ITEM_ICON_M = 72;   // 道具图标（中）：装备栏、快捷使用
const ITEM_ICON_S = 48;   // 道具图标（小）：列表内联、提示气泡
const FUNC_ICON_L = 80;   // 功能图标（大）：活动栏快捷入口、系统功能
const FUNC_ICON_M = 56;   // 功能图标（中）：侧边栏、二级入口
const FUNC_ICON_S = 40;   // 功能图标（小）：底部导航栏、内联操作

const BG_COLOR        = new Color(18, 20, 28, 255);
const TOP_BAR_COLOR   = new Color(32, 36, 46, 255);
const CONTENT_COLOR   = new Color(248, 248, 246, 255);
const SHORTCUT_COLOR  = new Color(255, 255, 255, 255);
const BOTTOM_BAR_COLOR= new Color(240, 240, 238, 255);
const BORDER_COLOR    = new Color(30, 30, 30, 255);
const TEXT_DARK       = new Color(20, 20, 20, 255);
const TEXT_LIGHT      = new Color(248, 248, 248, 255);

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
        this.buildShortcutRow();
        this.buildBottomBar();
    }

    public getContentRoot() { return this.contentNode; }

    // ── Background ──
    private drawBackground() {
        const safeW = W * 2;
        const safeH = H * 2;
        const bg = this.makeNode('BG', this.node, safeW, safeH, 0, 0);
        const g = bg.addComponent(Graphics);
        g.fillColor = BG_COLOR;
        g.rect(-safeW / 2, -safeH / 2, safeW, safeH);
        g.fill();
    }

    // ── Top Bar ──
    private buildTopBar() {
        const y = H / 2 - SAFE_TOP - TOP_BAR_H / 2;
        const bar = this.makePanel('TopBar', this.node, W, TOP_BAR_H, 0, y, TOP_BAR_COLOR, BORDER_COLOR, 0);

        // Avatar — 76×76, 贴合左上角 (6px padding)
        const avatarSize = 76;
        const avatarX = -W / 2 + 6 + avatarSize / 2;
        const avatar = this.makePanel('Avatar', bar, avatarSize, avatarSize, avatarX, 0, new Color(60, 64, 78, 255), BORDER_COLOR, 6);
        this.makeLabel(avatar, 'R', 28, 0, 10, TEXT_LIGHT, avatarSize);
        this.makeLabel(avatar, '头像', 12, 0, -18, TEXT_LIGHT, avatarSize);

        // Name + Realm — 左对齐
        const nameW = 110;
        const nameX = avatarX + avatarSize / 2 + 8 + nameW / 2;
        this.makeLabel(bar, '名字', 18, nameX, 12, TEXT_LIGHT, nameW, HorizontalTextAlignment.LEFT);
        this.makeLabel(bar, '练气一层', 12, nameX, -12, new Color(180, 186, 200, 255), nameW, HorizontalTextAlignment.LEFT);

        // Gold
        const goldX = W / 2 - 210;
        const goldBox = this.makePanel('Gold', bar, 110, 42, goldX, 0, new Color(50, 54, 66, 255), BORDER_COLOR, 4);
        this.makeLabel(goldBox, '💰 1280', 14, 0, 0, new Color(255, 220, 120, 255), 100);

        // Diamond
        const diamondX = W / 2 - 74;
        const diamondBox = this.makePanel('Diamond', bar, 110, 42, diamondX, 0, new Color(50, 54, 66, 255), BORDER_COLOR, 4);
        this.makeLabel(diamondBox, '💎 300', 14, 0, 0, new Color(160, 220, 255, 255), 100);
    }

    // ── Content Area ──
    private buildContent() {
        const topEdge = H / 2 - SAFE_TOP - TOP_BAR_H - GAP;
        const bottomEdge = -H / 2 + SAFE_BOTTOM + BOTTOM_BAR_H + GAP + SHORTCUT_ROW_H + GAP;
        const contentH = topEdge - bottomEdge;
        const contentY = (topEdge + bottomEdge) / 2;
        const contentW = W - 24;
        this.contentNode = this.makePanel('Content', this.node, contentW, contentH, 0, contentY, CONTENT_COLOR, BORDER_COLOR, 6);
    }

    // ── Shortcut Row (活动栏) ──
    private buildShortcutRow() {
        const items = ['任务', '商城', '炼丹', '炼器', '功法', '灵宠'];
        const y = -H / 2 + SAFE_BOTTOM + BOTTOM_BAR_H + GAP + SHORTCUT_ROW_H / 2;
        const rowW = W - 16;
        const row = this.makeNode('ShortcutRow', this.node, rowW, SHORTCUT_ROW_H, 0, y);

        const btnW = 106;
        const btnH = 108;
        const totalW = items.length * btnW + (items.length - 1) * 6;
        const startX = -totalW / 2 + btnW / 2;

        for (let i = 0; i < items.length; i++) {
            const x = startX + i * (btnW + 6);
            const btn = this.makePanel(items[i], row, btnW, btnH, x, 0, SHORTCUT_COLOR, BORDER_COLOR, 6);
            btn.addComponent(Button).transition = Button.Transition.NONE;

            // Icon placeholder
            const iconSize = FUNC_ICON_L > btnW - 16 ? btnW - 16 : FUNC_ICON_L;
            const icon = this.makePanel('Icon', btn, iconSize, iconSize, 0, 14, new Color(220, 220, 218, 255), BORDER_COLOR, 6);
            this.makeLabel(icon, 'R', 24, 0, 0, TEXT_DARK, iconSize - 8);

            this.makeLabel(btn, items[i], 13, 0, -36, TEXT_DARK, btnW - 8);
        }
    }

    // ── Bottom Bar (主导航) ──
    private buildBottomBar() {
        const tabs = ['法器', '角色', '秘境', '洞天', '独钓'];
        const y = -H / 2 + SAFE_BOTTOM + BOTTOM_BAR_H / 2;
        const bar = this.makePanel('BottomBar', this.node, W, BOTTOM_BAR_H, 0, y, BOTTOM_BAR_COLOR, BORDER_COLOR, 0);

        const btnW = 130;
        const btnH = 92;
        const totalW = tabs.length * btnW + (tabs.length - 1) * 6;
        const startX = -totalW / 2 + btnW / 2;

        for (let i = 0; i < tabs.length; i++) {
            const x = startX + i * (btnW + 6);
            const btn = this.makePanel(tabs[i], bar, btnW, btnH, x, 0, new Color(252, 252, 250, 255), BORDER_COLOR, 6);
            btn.addComponent(Button).transition = Button.Transition.NONE;

            // Icon on top, text below (vertical layout)
            const icon = this.makePanel('Icon', btn, FUNC_ICON_S, FUNC_ICON_S, 0, 14, new Color(218, 218, 216, 255), BORDER_COLOR, 4);
            this.makeLabel(icon, '🖼', 18, 0, 0, TEXT_DARK, FUNC_ICON_S - 6);

            this.makeLabel(btn, tabs[i], 14, 0, -24, TEXT_DARK, btnW - 8);
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

    private makePanel(name: string, parent: Node, w: number, h: number, x: number, y: number, fill: Color, stroke: Color, radius: number): Node {
        const node = this.makeNode(name, parent, w, h, x, y);
        const g = node.addComponent(Graphics);
        g.fillColor = fill;
        g.strokeColor = stroke;
        g.lineWidth = 1.6;
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

    private makeLabel(parent: Node, text: string, fontSize: number, x: number, y: number, color: Color, width: number, align = HorizontalTextAlignment.CENTER): Label {
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

import {
    _decorator,
    Button,
    Color,
    Component,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Layers,
    Node,
    UITransform,
    Vec3,
} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CommonPageShortcutItem')
export class CommonPageShortcutItem {
    @property
    id = '';

    @property
    label = '';

    @property(Color)
    accent = new Color(78, 96, 120, 255);
}

@ccclass('CommonPageTabItem')
export class CommonPageTabItem {
    @property
    id = '';

    @property
    label = '';

    @property(Color)
    accent = new Color(70, 86, 106, 255);
}

@ccclass('CommonPageShell')
export class CommonPageShell extends Component {
    @property
    title = '角色总览';

    @property
    subtitle = '通用页面骨架：顶部资源栏、标题头、内容区、快捷功能与底部导航。';

    @property
    leftCurrencyLabel = '金';

    @property
    leftCurrencyValue = '0';

    @property
    rightCurrencyLabel = '钻';

    @property
    rightCurrencyValue = '0';

    @property({ type: [CommonPageShortcutItem] })
    shortcutItems: CommonPageShortcutItem[] = [];

    @property({ type: [CommonPageTabItem] })
    bottomTabs: CommonPageTabItem[] = [];

    private topBarNode: Node | null = null;
    private headerNode: Node | null = null;
    private contentNode: Node | null = null;
    private shortcutRowNode: Node | null = null;
    private bottomBarNode: Node | null = null;
    private leftCurrencyValueLabel: Label | null = null;
    private rightCurrencyValueLabel: Label | null = null;
    private titleLabel: Label | null = null;
    private subtitleLabel: Label | null = null;
    private selectedShortcutId = '';
    private selectedBottomTabId = '';
    private shortcutButtons = new Map<string, Node>();
    private tabButtons = new Map<string, Node>();

    onLoad() {
        this.ensureRootSize();
        this.ensureDefaultItems();
        this.rebuild();
    }

    public rebuild() {
        this.node.removeAllChildren();
        this.shortcutButtons.clear();
        this.tabButtons.clear();

        const size = this.getRootSize();
        const width = size.width;
        const height = size.height;
        const panelWidth = width - 24;

        this.topBarNode = this.createRoundedPanel(this.node, panelWidth, 86, new Vec3(0, height / 2 - 54, 0), new Color(26, 40, 54, 238), new Color(112, 132, 146, 188), 14);
        this.buildTopBar(this.topBarNode, panelWidth);

        this.headerNode = this.createRoundedPanel(this.node, panelWidth, 66, new Vec3(0, height / 2 - 148, 0), new Color(34, 48, 62, 244), new Color(144, 132, 96, 180), 10);
        this.buildHeader(this.headerNode, panelWidth);

        this.bottomBarNode = this.createRoundedPanel(this.node, panelWidth, 84, new Vec3(0, -height / 2 + 44, 0), new Color(26, 36, 48, 244), new Color(116, 128, 144, 170), 10);
        this.buildBottomTabs(this.bottomBarNode, panelWidth);

        this.shortcutRowNode = this.createRoundedPanel(this.node, panelWidth, 108, new Vec3(0, -height / 2 + 146, 0), new Color(0, 0, 0, 0), new Color(0, 0, 0, 0), 0);
        this.buildShortcutRow(this.shortcutRowNode, panelWidth);

        const contentTop = height / 2 - 190;
        const contentBottom = -height / 2 + 214;
        const contentHeight = Math.max(240, contentTop - contentBottom);
        const contentY = (contentTop + contentBottom) / 2;
        this.contentNode = this.createRoundedPanel(this.node, panelWidth, contentHeight, new Vec3(0, contentY, 0), new Color(214, 214, 208, 42), new Color(126, 132, 146, 100), 10);
    }

    public getContentRoot() {
        return this.contentNode;
    }

    public setTitle(title: string, subtitle = this.subtitle) {
        this.title = title;
        this.subtitle = subtitle;
        if (this.titleLabel) this.titleLabel.string = title;
        if (this.subtitleLabel) this.subtitleLabel.string = subtitle;
    }

    public setCurrencyValues(leftValue: string, rightValue: string) {
        this.leftCurrencyValue = leftValue;
        this.rightCurrencyValue = rightValue;
        if (this.leftCurrencyValueLabel) this.leftCurrencyValueLabel.string = leftValue;
        if (this.rightCurrencyValueLabel) this.rightCurrencyValueLabel.string = rightValue;
    }

    public selectShortcut(id: string) {
        this.selectedShortcutId = id;
        this.refreshShortcutSelection();
    }

    public selectBottomTab(id: string) {
        this.selectedBottomTabId = id;
        this.refreshBottomTabSelection();
    }

    private ensureRootSize() {
        let transform = this.node.getComponent(UITransform);
        if (!transform) transform = this.node.addComponent(UITransform);
        const size = transform.contentSize;
        if (size.width < 200 || size.height < 200) {
            transform.setContentSize(700, 1180);
        }
    }

    private getRootSize() {
        const transform = this.node.getComponent(UITransform);
        return transform?.contentSize ?? { width: 700, height: 1180 };
    }

    private ensureDefaultItems() {
        if (this.shortcutItems.length === 0) {
            this.shortcutItems = [
                this.createShortcutItem('task', '任务', new Color(72, 96, 132, 255)),
                this.createShortcutItem('shop', '商城', new Color(118, 92, 64, 255)),
                this.createShortcutItem('alchemy', '炼丹', new Color(98, 82, 64, 255)),
                this.createShortcutItem('forge', '炼器', new Color(72, 82, 104, 255)),
                this.createShortcutItem('kungfu', '功法', new Color(108, 90, 62, 255)),
                this.createShortcutItem('pet', '灵宠', new Color(62, 96, 92, 255)),
            ];
        }
        if (this.bottomTabs.length === 0) {
            this.bottomTabs = [
                this.createTabItem('faqi', '法器', new Color(76, 92, 112, 255)),
                this.createTabItem('role', '角色', new Color(96, 110, 136, 255)),
                this.createTabItem('mijing', '秘境', new Color(82, 96, 116, 255)),
                this.createTabItem('dongtian', '洞天', new Color(86, 102, 118, 255)),
                this.createTabItem('fishing', '独钓', new Color(68, 90, 108, 255)),
            ];
        }
        if (!this.selectedShortcutId && this.shortcutItems.length > 0) {
            this.selectedShortcutId = this.shortcutItems[0].id;
        }
        if (!this.selectedBottomTabId && this.bottomTabs.length > 0) {
            this.selectedBottomTabId = this.bottomTabs[0].id;
        }
    }

    private buildTopBar(parent: Node, width: number) {
        const avatar = this.createRoundedPanel(parent, 58, 58, new Vec3(-width / 2 + 48, 0, 0), new Color(46, 58, 72, 255), new Color(184, 172, 134, 156), 10);
        this.createLabel(avatar, '道', 24, new Vec3(0, 0, 0), new Color(240, 234, 218, 255), 28);

        this.createCurrencyGroup(parent, -width / 2 + 132, this.leftCurrencyLabel, this.leftCurrencyValue, new Color(232, 210, 160, 255), true);
        this.createCurrencyGroup(parent, -width / 2 + 308, this.rightCurrencyLabel, this.rightCurrencyValue, new Color(180, 216, 248, 255), false);
    }

    private buildHeader(parent: Node, width: number) {
        const seal = this.createRoundedPanel(parent, 42, 42, new Vec3(-width / 2 + 40, 0, 0), new Color(62, 72, 82, 255), new Color(162, 150, 116, 166), 8);
        this.createLabel(seal, this.title.slice(0, 1) || '页', 20, new Vec3(0, 0, 0), new Color(242, 236, 220, 255), 24);
        this.titleLabel = this.createLabel(parent, this.title, 28, new Vec3(-width / 2 + 122, 10, 0), new Color(246, 238, 220, 255), 220);
        this.titleLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.subtitleLabel = this.createLabel(parent, this.subtitle, 14, new Vec3(-width / 2 + 124, -14, 0), new Color(170, 192, 210, 255), width - 188);
        this.subtitleLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
    }

    private buildShortcutRow(parent: Node, width: number) {
        const items = this.shortcutItems;
        if (items.length === 0) return;
        const gap = items.length > 1 ? Math.min(112, (width - 84) / (items.length - 1)) : 0;
        const startX = -gap * ((items.length - 1) / 2);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const btn = this.createRoundedPanel(parent, 92, 92, new Vec3(startX + i * gap, 0, 0), item.accent, new Color(192, 188, 172, 146), 12);
            btn.addComponent(Button).transition = Button.Transition.NONE;
            const iconBadge = this.createRoundedPanel(btn, 38, 38, new Vec3(0, 12, 0), new Color(32, 42, 56, 160), new Color(212, 204, 188, 86), 8);
            this.createLabel(iconBadge, item.label.slice(0, 1) || '功', 18, new Vec3(0, 0, 0), new Color(244, 236, 220, 255), 20);
            this.createLabel(btn, item.label, 16, new Vec3(0, -26, 0), new Color(244, 238, 224, 255), 72);
            btn.on(Node.EventType.TOUCH_END, () => {
                this.selectedShortcutId = item.id;
                this.refreshShortcutSelection();
                this.node.emit('common-page-shortcut-click', item.id);
            }, this);
            this.shortcutButtons.set(item.id, btn);
        }
        this.refreshShortcutSelection();
    }

    private buildBottomTabs(parent: Node, width: number) {
        const items = this.bottomTabs;
        if (items.length === 0) return;
        const gap = items.length > 1 ? Math.min(138, (width - 92) / (items.length - 1)) : 0;
        const startX = -gap * ((items.length - 1) / 2);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const btn = this.createRoundedPanel(parent, 112, 54, new Vec3(startX + i * gap, 0, 0), new Color(42, 52, 64, 255), new Color(150, 154, 160, 118), 10);
            btn.addComponent(Button).transition = Button.Transition.NONE;
            const badge = this.createRoundedPanel(btn, 22, 22, new Vec3(0, 8, 0), item.accent, new Color(232, 224, 210, 72), 6);
            this.createLabel(badge, item.label.slice(0, 1) || '页', 12, new Vec3(0, 0, 0), new Color(244, 238, 228, 255), 18);
            this.createLabel(btn, item.label, 15, new Vec3(0, -12, 0), new Color(206, 216, 228, 255), 84);
            btn.on(Node.EventType.TOUCH_END, () => {
                this.selectedBottomTabId = item.id;
                this.refreshBottomTabSelection();
                this.node.emit('common-page-tab-click', item.id);
            }, this);
            this.tabButtons.set(item.id, btn);
        }
        this.refreshBottomTabSelection();
    }

    private createCurrencyGroup(parent: Node, x: number, prefix: string, value: string, ink: Color, warm: boolean) {
        const label = this.createLabel(parent, prefix, 16, new Vec3(x - 32, 0, 0), ink, 28);
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        const iconWrap = this.createRoundedPanel(parent, 38, 38, new Vec3(x, 0, 0), warm ? new Color(104, 88, 56, 160) : new Color(58, 82, 116, 160), new Color(222, 210, 184, 72), 8);
        this.createLabel(iconWrap, prefix, 16, new Vec3(0, 0, 0), new Color(244, 236, 222, 255), 22);
        const valueLabel = this.createLabel(parent, value, 24, new Vec3(x + 72, 0, 0), ink, 90);
        valueLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        if (warm) this.leftCurrencyValueLabel = valueLabel;
        else this.rightCurrencyValueLabel = valueLabel;
    }

    private refreshShortcutSelection() {
        this.shortcutButtons.forEach((button, id) => {
            const active = id === this.selectedShortcutId;
            this.applyButtonState(button, active, active ? new Color(96, 116, 148, 255) : null);
        });
    }

    private refreshBottomTabSelection() {
        this.tabButtons.forEach((button, id) => {
            const active = id === this.selectedBottomTabId;
            this.applyButtonState(button, active, active ? new Color(72, 98, 136, 255) : null);
        });
    }

    private applyButtonState(button: Node, active: boolean, activeFill: Color | null) {
        const graphics = button.getComponent(Graphics);
        const transform = button.getComponent(UITransform);
        if (!graphics || !transform) return;
        const size = transform.contentSize;
        graphics.clear();
        graphics.fillColor = active && activeFill ? activeFill : new Color(42, 52, 64, 255);
        graphics.strokeColor = active ? new Color(240, 224, 186, 186) : new Color(150, 154, 160, 118);
        graphics.lineWidth = active ? 2 : 1.4;
        graphics.roundRect(-size.width / 2, -size.height / 2, size.width, size.height, 10);
        graphics.fill();
        graphics.roundRect(-size.width / 2, -size.height / 2, size.width, size.height, 10);
        graphics.stroke();
    }

    private createRoundedPanel(parent: Node, width: number, height: number, position: Vec3, fill: Color, stroke: Color, radius: number) {
        const panel = new Node('Panel');
        panel.layer = Layers.Enum.UI_2D;
        parent.addChild(panel);
        panel.setPosition(position);
        panel.addComponent(UITransform).setContentSize(width, height);
        const g = panel.addComponent(Graphics);
        if (radius > 0) {
            g.fillColor = fill;
            g.strokeColor = stroke;
            g.lineWidth = stroke.a > 0 ? 1.6 : 0;
            g.roundRect(-width / 2, -height / 2, width, height, radius);
            if (fill.a > 0) g.fill();
            if (stroke.a > 0) {
                g.roundRect(-width / 2, -height / 2, width, height, radius);
                g.stroke();
            }
        }
        return panel;
    }

    private createLabel(parent: Node, text: string, fontSize: number, position: Vec3, color: Color, width: number) {
        const node = new Node('Label');
        node.layer = Layers.Enum.UI_2D;
        parent.addChild(node);
        node.setPosition(position);
        node.addComponent(UITransform).setContentSize(width, fontSize + 12);
        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 4;
        label.color = color;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        return label;
    }

    private createShortcutItem(id: string, label: string, accent: Color) {
        const item = new CommonPageShortcutItem();
        item.id = id;
        item.label = label;
        item.accent = accent;
        return item;
    }

    private createTabItem(id: string, label: string, accent: Color) {
        const item = new CommonPageTabItem();
        item.id = id;
        item.label = label;
        item.accent = accent;
        return item;
    }
}
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
import { CommonPageShell } from './CommonPageShell';

const { ccclass, property } = _decorator;

type DongtianTab = 'cave' | 'merit';

type BuildingCard = {
    id: string;
    glyph: string;
    title: string;
    info: string;
    cost: string;
    buttonText: string;
};

type MeritTask = {
    id: string;
    title: string;
    info: string;
    reward: string;
    action: string;
};

type MeritShopItem = {
    id: string;
    title: string;
    cost: string;
    info: string;
    stock: string;
};

@ccclass('DongtianOverviewPage')
export class DongtianOverviewPage extends Component {
    @property
    title = '青岚洞天';

    @property
    subtitle = '借洞天灵机经营府内诸阵，并承接功勋差事与局外整备。';

    @property
    leftCurrencyValue = '0';

    @property
    rightCurrencyValue = '0';

    @property
    mountText = '洞府挂载：青岚洞天·内府灵域  |  洞天灵机与洞府阵枢已连通';

    @property
    meritText = '功勋 0  |  清心台 Lv.1  |  护山大阵 Lv.1';

    @property
    summaryText = '洞府灵脉 +10%  |  丹火室 +6%  |  百炼台 +6%';

    @property
    spiritText = '灵石 0  |  徽记 0  |  当前功法 清心诀 Lv.1';

    @property
    tribulationText = '突破成功率额外 +8%  |  清心台与护山大阵已并入角色页突破结算';

    private shell: CommonPageShell | null = null;
    private mountLabel: Label | null = null;
    private meritLabel: Label | null = null;
    private summaryLabel: Label | null = null;
    private spiritLabel: Label | null = null;
    private tribulationLabel: Label | null = null;
    private tabButtons = new Map<DongtianTab, { node: Node; label: Label }>();
    private pageCave: Node | null = null;
    private pageMerit: Node | null = null;
    private buildingWidgets = new Map<string, { button: Node; title: Label; info: Label; cost: Label; action: Label }>();
    private taskWidgets = new Map<string, { row: Node; title: Label; info: Label; reward: Label; action: Label }>();
    private shopWidgets = new Map<string, { card: Node; title: Label; cost: Label; info: Label; stock: Label }>();
    private selectedTab: DongtianTab = 'cave';
    private buildings: BuildingCard[] = [
        { id: 'alchemy', glyph: '丹', title: '丹火室 Lv.1', info: '提升丹成率与丹药产出。', cost: '下级: 灵石 80 | 徽记 10 | 灵草 x2', buttonText: '升级' },
        { id: 'forge', glyph: '器', title: '百炼台 Lv.1', info: '提升炼器成功率与品质。', cost: '下级: 灵石 80 | 徽记 10 | 灵矿 x2', buttonText: '升级' },
        { id: 'gather', glyph: '心', title: '清心台 Lv.1', info: '提高静修与破境稳定度。', cost: '下级: 灵石 120 | 徽记 16 | 木精 x2', buttonText: '待备' },
        { id: 'ward', glyph: '阵', title: '护山大阵 Lv.1', info: '提高破境护持与洞天稳固。', cost: '下级: 灵石 120 | 徽记 16 | 阵纹 x2', buttonText: '待备' },
    ];
    private tasks: MeritTask[] = [
        { id: 'task1', title: '洞天巡检', info: '进度 1/1', reward: '功勋 +20', action: '领取' },
        { id: 'task2', title: '炼丹三炉', info: '进度 1/3', reward: '功勋 +18', action: '未达成' },
        { id: 'task3', title: '秘境三十层', info: '进度 18/30', reward: '功勋 +30', action: '未达成' },
    ];
    private shopItems: MeritShopItem[] = [
        { id: 'shop1', title: '洞天补给', cost: '功勋 30', info: '灵石折值 +120', stock: '余量 1/2' },
        { id: 'shop2', title: '悟道补给', cost: '功勋 40', info: '功法感悟 +1 次', stock: '余量 1/1' },
        { id: 'shop3', title: '巡守令', cost: '功勋 50', info: '徽记 +12', stock: '余量 2/2' },
    ];

    onLoad() {
        this.shell = this.node.getComponent(CommonPageShell) ?? this.node.addComponent(CommonPageShell);
    }

    start() {
        this.rebuild();
    }

    public rebuild() {
        if (!this.shell) return;
        this.shell.rebuild();
        this.shell.setTitle(this.title, this.subtitle);
        this.shell.setCurrencyValues(this.leftCurrencyValue, this.rightCurrencyValue);
        this.shell.selectBottomTab('dongtian');
        const root = this.shell.getContentRoot();
        if (!root) return;

        root.removeAllChildren();
        this.tabButtons.clear();
        this.buildingWidgets.clear();
        this.taskWidgets.clear();
        this.shopWidgets.clear();

        this.buildLayout(root);
        this.refreshView();
    }

    public setHeaderValues(leftValue: string, rightValue: string, mountText: string, meritText: string) {
        this.leftCurrencyValue = leftValue;
        this.rightCurrencyValue = rightValue;
        this.mountText = mountText;
        this.meritText = meritText;
        this.shell?.setCurrencyValues(leftValue, rightValue);
        this.refreshView();
    }

    public setCaveSummary(summaryText: string, spiritText: string, tribulationText: string) {
        this.summaryText = summaryText;
        this.spiritText = spiritText;
        this.tribulationText = tribulationText;
        this.refreshView();
    }

    public setData(buildings: BuildingCard[], tasks: MeritTask[], shopItems: MeritShopItem[], selectedTab: DongtianTab) {
        this.buildings = buildings;
        this.tasks = tasks;
        this.shopItems = shopItems;
        this.selectedTab = selectedTab;
        this.rebuild();
    }

    private refreshView() {
        if (this.mountLabel) this.mountLabel.string = this.mountText;
        if (this.meritLabel) this.meritLabel.string = this.meritText;
        if (this.summaryLabel) this.summaryLabel.string = this.summaryText;
        if (this.spiritLabel) this.spiritLabel.string = this.spiritText;
        if (this.tribulationLabel) this.tribulationLabel.string = this.tribulationText;

        if (this.pageCave) this.pageCave.active = this.selectedTab === 'cave';
        if (this.pageMerit) this.pageMerit.active = this.selectedTab === 'merit';

        this.tabButtons.forEach((widget, tab) => {
            const active = tab === this.selectedTab;
            this.paintPanel(widget.node, active ? new Color(60, 74, 96, 255) : new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 6);
            widget.label.color = active ? new Color(246, 244, 236, 255) : new Color(34, 34, 34, 255);
        });

        this.buildingWidgets.forEach((widget, id) => {
            const data = this.buildings.find((entry) => entry.id === id);
            if (!data) return;
            widget.title.string = data.title;
            widget.info.string = data.info;
            widget.cost.string = data.cost;
            widget.action.string = data.buttonText;
        });

        this.taskWidgets.forEach((widget, id) => {
            const data = this.tasks.find((entry) => entry.id === id);
            if (!data) return;
            widget.title.string = data.title;
            widget.info.string = data.info;
            widget.reward.string = data.reward;
            widget.action.string = data.action;
        });

        this.shopWidgets.forEach((widget, id) => {
            const data = this.shopItems.find((entry) => entry.id === id);
            if (!data) return;
            widget.title.string = data.title;
            widget.cost.string = data.cost;
            widget.info.string = data.info;
            widget.stock.string = data.stock;
        });
    }

    private buildLayout(root: Node) {
        this.mountLabel = this.createLabel(root, '', 17, new Vec3(0, 324, 0), new Color(42, 42, 42, 255), 620, HorizontalTextAlignment.CENTER);
        this.meritLabel = this.createLabel(root, '', 16, new Vec3(0, 292, 0), new Color(96, 84, 52, 255), 620, HorizontalTextAlignment.CENTER);

        const tabDefs: Array<{ id: DongtianTab; label: string; x: number }> = [
            { id: 'cave', label: '洞府灵域', x: -86 },
            { id: 'merit', label: '功勋堂', x: 86 },
        ];
        tabDefs.forEach((entry) => {
            const button = this.createPanel(root, 152, 40, entry.x, 248, new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 6);
            button.addComponent(Button).transition = Button.Transition.NONE;
            button.on(Node.EventType.TOUCH_END, () => {
                this.selectedTab = entry.id;
                this.node.emit('dongtian-tab-click', entry.id);
                this.refreshView();
            }, this);
            const label = this.createLabel(button, entry.label, 17, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 110, HorizontalTextAlignment.CENTER);
            this.tabButtons.set(entry.id, { node: button, label });
        });

        this.pageCave = new Node('CavePage');
        this.pageCave.layer = Layers.Enum.UI_2D;
        root.addChild(this.pageCave);
        this.pageCave.addComponent(UITransform).setContentSize(648, 560);
        this.pageCave.setPosition(0, -44, 0);

        this.pageMerit = new Node('MeritPage');
        this.pageMerit.layer = Layers.Enum.UI_2D;
        root.addChild(this.pageMerit);
        this.pageMerit.addComponent(UITransform).setContentSize(648, 560);
        this.pageMerit.setPosition(0, -44, 0);

        this.buildCavePage(this.pageCave);
        this.buildMeritPage(this.pageMerit);
    }

    private buildCavePage(root: Node) {
        const positions = [new Vec3(-164, 152, 0), new Vec3(164, 152, 0), new Vec3(-164, -2, 0), new Vec3(164, -2, 0)];
        this.buildings.forEach((entry, index) => {
            const pos = positions[index];
            const card = this.createPanel(root, 286, 142, pos.x, pos.y, new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
            const seal = this.createPanel(card, 52, 52, -98, 34, new Color(248, 247, 244, 255), new Color(30, 30, 30, 255), 6);
            this.createLabel(seal, entry.glyph, 26, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 30, HorizontalTextAlignment.CENTER);
            const title = this.createLabel(card, '', 20, new Vec3(24, 34, 0), new Color(34, 34, 34, 255), 180, HorizontalTextAlignment.CENTER);
            const info = this.createLabel(card, '', 14, new Vec3(24, 4, 0), new Color(80, 80, 80, 255), 190, HorizontalTextAlignment.CENTER);
            const cost = this.createLabel(card, '', 13, new Vec3(20, -34, 0), new Color(96, 84, 52, 255), 190, HorizontalTextAlignment.CENTER);
            const button = this.createPanel(card, 86, 30, 94, -48, new Color(248, 247, 244, 255), new Color(30, 30, 30, 255), 6);
            button.addComponent(Button).transition = Button.Transition.NONE;
            button.on(Node.EventType.TOUCH_END, () => this.node.emit('dongtian-building-click', entry.id), this);
            const action = this.createLabel(button, '', 14, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 60, HorizontalTextAlignment.CENTER);
            this.buildingWidgets.set(entry.id, { button, title, info, cost, action });
        });

        const summaryPanel = this.createPanel(root, 648, 214, 0, -214, new Color(239, 237, 233, 255), new Color(30, 30, 30, 255), 8);
        this.createLabel(summaryPanel, '洞天调息', 22, new Vec3(-236, 72, 0), new Color(34, 34, 34, 255), 150, HorizontalTextAlignment.LEFT);
        this.summaryLabel = this.createLabel(summaryPanel, '', 16, new Vec3(0, 24, 0), new Color(58, 58, 58, 255), 600, HorizontalTextAlignment.CENTER);
        this.spiritLabel = this.createLabel(summaryPanel, '', 16, new Vec3(0, -8, 0), new Color(96, 84, 52, 255), 600, HorizontalTextAlignment.CENTER);
        this.tribulationLabel = this.createLabel(summaryPanel, '', 16, new Vec3(0, -40, 0), new Color(58, 92, 66, 255), 600, HorizontalTextAlignment.CENTER);
        this.createLabel(summaryPanel, '角色页可直接消耗灵石参悟当前功法', 17, new Vec3(0, -78, 0), new Color(88, 88, 88, 255), 360, HorizontalTextAlignment.CENTER);
    }

    private buildMeritPage(root: Node) {
        const taskPanel = this.createPanel(root, 648, 276, 0, 126, new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        this.createLabel(taskPanel, '功勋任务', 22, new Vec3(-236, 108, 0), new Color(34, 34, 34, 255), 150, HorizontalTextAlignment.LEFT);
        this.tasks.forEach((entry, index) => {
            const row = this.createPanel(taskPanel, 606, 58, 0, 42 - index * 72, new Color(247, 246, 243, 255), new Color(30, 30, 30, 255), 8);
            const title = this.createLabel(row, '', 17, new Vec3(-146, 10, 0), new Color(34, 34, 34, 255), 240, HorizontalTextAlignment.LEFT);
            const info = this.createLabel(row, '', 14, new Vec3(-146, -12, 0), new Color(80, 80, 80, 255), 240, HorizontalTextAlignment.LEFT);
            const reward = this.createLabel(row, '', 14, new Vec3(38, 0, 0), new Color(96, 84, 52, 255), 120, HorizontalTextAlignment.CENTER);
            const actionButton = this.createPanel(row, 88, 28, 236, 0, new Color(248, 247, 244, 255), new Color(30, 30, 30, 255), 6);
            actionButton.addComponent(Button).transition = Button.Transition.NONE;
            actionButton.on(Node.EventType.TOUCH_END, () => this.node.emit('dongtian-task-click', entry.id), this);
            const action = this.createLabel(actionButton, '', 14, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 60, HorizontalTextAlignment.CENTER);
            this.taskWidgets.set(entry.id, { row, title, info, reward, action });
        });

        const shopPanel = this.createPanel(root, 648, 250, 0, -162, new Color(239, 237, 233, 255), new Color(30, 30, 30, 255), 8);
        this.createLabel(shopPanel, '功勋商店', 22, new Vec3(-236, 92, 0), new Color(34, 34, 34, 255), 150, HorizontalTextAlignment.LEFT);
        const xs = [-204, 0, 204];
        this.shopItems.forEach((entry, index) => {
            const card = this.createPanel(shopPanel, 190, 152, xs[index], -10, new Color(247, 246, 243, 255), new Color(30, 30, 30, 255), 8);
            const title = this.createLabel(card, '', 18, new Vec3(0, 44, 0), new Color(34, 34, 34, 255), 140, HorizontalTextAlignment.CENTER);
            const cost = this.createLabel(card, '', 15, new Vec3(0, 16, 0), new Color(96, 84, 52, 255), 140, HorizontalTextAlignment.CENTER);
            const info = this.createLabel(card, '', 14, new Vec3(0, -14, 0), new Color(80, 80, 80, 255), 150, HorizontalTextAlignment.CENTER);
            const stock = this.createLabel(card, '', 13, new Vec3(-18, -48, 0), new Color(88, 88, 88, 255), 94, HorizontalTextAlignment.LEFT);
            const buyButton = this.createPanel(card, 58, 26, 56, -48, new Color(248, 247, 244, 255), new Color(30, 30, 30, 255), 6);
            buyButton.addComponent(Button).transition = Button.Transition.NONE;
            buyButton.on(Node.EventType.TOUCH_END, () => this.node.emit('dongtian-shop-click', entry.id), this);
            this.createLabel(buyButton, '兑换', 13, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 42, HorizontalTextAlignment.CENTER);
            this.shopWidgets.set(entry.id, { card, title, cost, info, stock });
        });
    }

    private createPanel(parent: Node, width: number, height: number, x: number, y: number, fill: Color, stroke: Color, radius: number) {
        const panel = new Node('Panel');
        panel.layer = Layers.Enum.UI_2D;
        parent.addChild(panel);
        panel.setPosition(x, y, 0);
        panel.addComponent(UITransform).setContentSize(width, height);
        this.paintPanel(panel, fill, stroke, radius);
        return panel;
    }

    private paintPanel(node: Node, fill: Color, stroke: Color, radius: number) {
        let graphics = node.getComponent(Graphics);
        if (!graphics) graphics = node.addComponent(Graphics);
        const transform = node.getComponent(UITransform);
        if (!transform) return;
        const { width, height } = transform.contentSize;
        graphics.clear();
        graphics.fillColor = fill;
        graphics.strokeColor = stroke;
        graphics.lineWidth = 2;
        graphics.roundRect(-width / 2, -height / 2, width, height, radius);
        graphics.fill();
        graphics.roundRect(-width / 2, -height / 2, width, height, radius);
        graphics.stroke();
    }

    private createLabel(parent: Node, text: string, fontSize: number, position: Vec3, color: Color, width: number, align: HorizontalTextAlignment) {
        const node = new Node('Label');
        node.layer = Layers.Enum.UI_2D;
        parent.addChild(node);
        node.setPosition(position);
        node.addComponent(UITransform).setContentSize(width, fontSize + 16);
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
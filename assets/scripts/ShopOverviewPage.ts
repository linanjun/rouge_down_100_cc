import {
    _decorator,
    Button,
    Color,
    Component,
    HorizontalTextAlignment,
    Label,
    Node,
    UITransform,
    Vec3,
} from 'cc';
import { CommonPageShell } from './CommonPageShell';
import { createPageLabel, createRoundedPanel, repaintRoundedPanel } from './CommonPageWidgets';

const { ccclass, property } = _decorator;

type GoldTab = 'daily' | 'weekly';
type ShopCard = { id: string; title: string; price: string; desc: string; stock: string; active?: boolean };

@ccclass('ShopOverviewPage')
export class ShopOverviewPage extends Component {
    @property title = '云游商坊';
    @property subtitle = '灵石商店按每日/每周切换，其余分页保持常驻供给。';
    @property leftCurrencyValue = '0';
    @property rightCurrencyValue = '0';
    @property currencyText = '灵石 0  |  折值 0  |  徽记 0  |  钻石 0';
    @property hintText = '前期可先买每日补给，再去秘境刷徽记与材料。';

    private shell: CommonPageShell | null = null;
    private currencyLabel: Label | null = null;
    private hintLabel: Label | null = null;
    private goldTab: GoldTab = 'daily';
    private tabButtons = new Map<GoldTab, { node: Node; label: Label }>();
    private dailyPage: Node | null = null;
    private weeklyPage: Node | null = null;
    private widgetMap = new Map<string, { card: Node; title: Label; price: Label; desc: Label; stock: Label; buttonLabel: Label }>();
    private dailyItems: ShopCard[] = [
        { id: 'gd1', title: '气血丹包', price: '灵石 120', desc: '气血上限 +20', stock: '余量 1/1' },
        { id: 'gd2', title: '回炁丸包', price: '灵石 120', desc: '法力上限 +16', stock: '余量 1/1' },
        { id: 'gd3', title: '修为包', price: '灵石 160', desc: '修为 +20', stock: '余量 2/2' },
        { id: 'gd4', title: '法器包', price: '灵石 180', desc: '法器经验 +30', stock: '余量 1/1' },
    ];
    private weeklyItems: ShopCard[] = [
        { id: 'gw1', title: '周常洞府包', price: '灵石 500', desc: '灵石折值 +400', stock: '余量 1/1' },
        { id: 'gw2', title: '周常成长包', price: '灵石 680', desc: '修为 +80', stock: '余量 1/1' },
    ];
    private mijingItems: ShopCard[] = [
        { id: 'mj1', title: '巡守令', price: '徽记 40', desc: '徽记资源补给', stock: '余量 1/1' },
        { id: 'mj2', title: '灵矿箱', price: '徽记 32', desc: '材料补给', stock: '余量 2/2' },
    ];
    private diamondItems: ShopCard[] = [
        { id: 'di1', title: '秘晶福袋', price: '钻石 20', desc: '秘晶 +20', stock: '常驻' },
        { id: 'di2', title: '成长礼包', price: '钻石 30', desc: '修为 +120', stock: '常驻' },
    ];

    onLoad() { this.shell = this.node.getComponent(CommonPageShell) ?? this.node.addComponent(CommonPageShell); }
    start() { this.rebuild(); }

    public rebuild() {
        if (!this.shell) return;
        this.shell.rebuild();
        this.shell.setTitle(this.title, this.subtitle);
        this.shell.setCurrencyValues(this.leftCurrencyValue, this.rightCurrencyValue);
        this.shell.selectShortcut('shop');
        const root = this.shell.getContentRoot();
        if (!root) return;
        root.removeAllChildren();
        this.tabButtons.clear();
        this.widgetMap.clear();
        this.buildLayout(root);
        this.refreshView();
    }

    public setHeaderValues(leftValue: string, rightValue: string, currencyText: string, hintText: string) {
        this.leftCurrencyValue = leftValue; this.rightCurrencyValue = rightValue; this.currencyText = currencyText; this.hintText = hintText; this.shell?.setCurrencyValues(leftValue, rightValue); this.refreshView();
    }
    public setGoldTab(tab: GoldTab) { this.goldTab = tab; this.refreshView(); }
    public setItems(daily: ShopCard[], weekly: ShopCard[], mijing: ShopCard[], diamond: ShopCard[]) { this.dailyItems = daily; this.weeklyItems = weekly; this.mijingItems = mijing; this.diamondItems = diamond; this.rebuild(); }

    private refreshView() {
        if (this.currencyLabel) this.currencyLabel.string = this.currencyText;
        if (this.hintLabel) this.hintLabel.string = this.hintText;
        if (this.dailyPage) this.dailyPage.active = this.goldTab === 'daily';
        if (this.weeklyPage) this.weeklyPage.active = this.goldTab === 'weekly';
        this.tabButtons.forEach((widget, tab) => {
            const active = tab === this.goldTab;
            repaintRoundedPanel(widget.node, active ? new Color(66, 82, 104, 255) : new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 6);
            widget.label.color = active ? new Color(246, 244, 236, 255) : new Color(44, 44, 44, 255);
        });
        [...this.dailyItems, ...this.weeklyItems, ...this.mijingItems, ...this.diamondItems].forEach((item) => {
            const widget = this.widgetMap.get(item.id);
            if (!widget) return;
            widget.title.string = item.title;
            widget.price.string = item.price;
            widget.desc.string = item.desc;
            widget.stock.string = item.stock;
            widget.buttonLabel.string = item.active === false ? '不足' : '购买';
        });
    }

    private buildLayout(root: Node) {
        const header = createRoundedPanel(root, 648, 92, new Vec3(0, 324, 0), new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        this.currencyLabel = createPageLabel(header, '', 16, new Vec3(0, 0, 0), new Color(58, 58, 58, 255), 620);
        const goldPanel = createRoundedPanel(root, 648, 210, new Vec3(0, 150, 0), new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        const mijingPanel = createRoundedPanel(root, 648, 170, new Vec3(0, -72, 0), new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        const diamondPanel = createRoundedPanel(root, 648, 170, new Vec3(0, -270, 0), new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        createPageLabel(goldPanel, '灵石商店', 22, new Vec3(-238, 78, 0), new Color(34, 34, 34, 255), 150, HorizontalTextAlignment.LEFT);
        const dailyBtn = createRoundedPanel(goldPanel, 96, 36, new Vec3(160, 78, 0), new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 6);
        const weeklyBtn = createRoundedPanel(goldPanel, 96, 36, new Vec3(268, 78, 0), new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 6);
        dailyBtn.addComponent(Button).transition = Button.Transition.NONE;
        weeklyBtn.addComponent(Button).transition = Button.Transition.NONE;
        dailyBtn.on(Node.EventType.TOUCH_END, () => { this.goldTab = 'daily'; this.node.emit('shop-gold-tab-click', 'daily'); this.refreshView(); }, this);
        weeklyBtn.on(Node.EventType.TOUCH_END, () => { this.goldTab = 'weekly'; this.node.emit('shop-gold-tab-click', 'weekly'); this.refreshView(); }, this);
        this.tabButtons.set('daily', { node: dailyBtn, label: createPageLabel(dailyBtn, '每日', 16, new Vec3(0, 0, 0), new Color(44, 44, 44, 255), 60) });
        this.tabButtons.set('weekly', { node: weeklyBtn, label: createPageLabel(weeklyBtn, '每周', 16, new Vec3(0, 0, 0), new Color(44, 44, 44, 255), 60) });

        this.dailyPage = new Node('GoldDailyPage');
        this.dailyPage.addComponent(UITransform).setContentSize(620, 124);
        this.dailyPage.setPosition(0, -18, 0);
        goldPanel.addChild(this.dailyPage);
        this.buildShopGrid(this.dailyPage, this.dailyItems, 'gold');

        this.weeklyPage = new Node('GoldWeeklyPage');
        this.weeklyPage.addComponent(UITransform).setContentSize(620, 124);
        this.weeklyPage.setPosition(0, -18, 0);
        goldPanel.addChild(this.weeklyPage);
        this.buildShopGrid(this.weeklyPage, this.weeklyItems, 'gold');

        createPageLabel(mijingPanel, '秘境商店', 22, new Vec3(-238, 54, 0), new Color(34, 34, 34, 255), 150, HorizontalTextAlignment.LEFT);
        this.buildShopGrid(mijingPanel, this.mijingItems, 'mijing', -16);
        createPageLabel(diamondPanel, '钻石商店', 22, new Vec3(-238, 54, 0), new Color(34, 34, 34, 255), 150, HorizontalTextAlignment.LEFT);
        this.buildShopGrid(diamondPanel, this.diamondItems, 'diamond', -16);
        this.hintLabel = createPageLabel(root, '', 16, new Vec3(0, -404, 0), new Color(88, 88, 88, 255), 640);
    }

    private buildShopGrid(parent: Node, items: ShopCard[], section: string, offsetY = 0) {
        const xs = items.length === 2 ? [-150, 150] : [-150, 150, -150, 150];
        const ys = items.length === 2 ? [offsetY, offsetY] : [52 + offsetY, 52 + offsetY, -62 + offsetY, -62 + offsetY];
        items.forEach((item, index) => {
            const card = createRoundedPanel(parent, 274, 106, new Vec3(xs[index], ys[index], 0), new Color(247, 246, 243, 255), new Color(30, 30, 30, 255), 8);
            const title = createPageLabel(card, '', 18, new Vec3(30, 26, 0), new Color(34, 34, 34, 255), 156, HorizontalTextAlignment.LEFT);
            const price = createPageLabel(card, '', 15, new Vec3(30, 2, 0), new Color(96, 84, 52, 255), 156, HorizontalTextAlignment.LEFT);
            const desc = createPageLabel(card, '', 14, new Vec3(30, -24, 0), new Color(88, 88, 88, 255), 156, HorizontalTextAlignment.LEFT);
            const stock = createPageLabel(card, '', 12, new Vec3(-56, -42, 0), new Color(88, 88, 88, 255), 132, HorizontalTextAlignment.LEFT);
            const buyBtn = createRoundedPanel(card, 82, 32, new Vec3(88, -42, 0), new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 6);
            buyBtn.addComponent(Button).transition = Button.Transition.NONE;
            buyBtn.on(Node.EventType.TOUCH_END, () => this.node.emit('shop-buy-click', item.id), this);
            const buttonLabel = createPageLabel(buyBtn, '购买', 14, new Vec3(0, 0, 0), new Color(44, 44, 44, 255), 50);
            this.widgetMap.set(item.id, { card, title, price, desc, stock, buttonLabel });
        });
    }
}
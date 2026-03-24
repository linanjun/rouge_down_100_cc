import {
    _decorator,
    Button,
    Color,
    Component,
    HorizontalTextAlignment,
    Label,
    Layers,
    Node,
    UITransform,
    Vec3,
} from 'cc';
import { CommonPageShell } from './CommonPageShell';
import { createPageLabel, createRoundedPanel, repaintRoundedPanel } from './CommonPageWidgets';

const { ccclass, property } = _decorator;

type AlchemyTab = 'furnace' | 'formula' | 'storehouse' | 'forge';
type RecipeCard = { id: string; title: string; info: string; state: string };
type MaterialCard = { id: string; title: string; kind: string; count: string };

@ccclass('AlchemyWorkshopPage')
export class AlchemyWorkshopPage extends Component {
    @property title = '丹器工坊';
    @property subtitle = '以命名灵植与灵矿炼丹、炼器，补足局外成长与法器养成。';
    @property leftCurrencyValue = '0';
    @property rightCurrencyValue = '0';
    @property detailTitle = '聚气丹 · 回元';
    @property detailInfo = '以温养经脉为主，适合前期开炉补给。';
    @property detailCost = '耗材: 灵草 x2  |  灵石 80';
    @property detailOutput = '丹成效果: 修为 +20  |  成功率 78%  |  出丹 1-2  |  库存 0';
    @property craftButtonText = '开炉炼制';
    @property useButtonText = '服用(0)';
    @property hintText = '丹师 Lv.1 0/13  |  库存 0 枚  |  炼成后可手动服用或留作局外整备';

    private shell: CommonPageShell | null = null;
    private currentTab: AlchemyTab = 'furnace';
    private tabButtons = new Map<AlchemyTab, { node: Node; label: Label }>();
    private pages = new Map<AlchemyTab, Node>();
    private detailTitleLabel: Label | null = null;
    private detailInfoLabel: Label | null = null;
    private detailCostLabel: Label | null = null;
    private detailOutputLabel: Label | null = null;
    private craftButtonLabel: Label | null = null;
    private useButtonLabel: Label | null = null;
    private hintLabel: Label | null = null;
    private recipeWidgets = new Map<string, { node: Node; title: Label; info: Label; state: Label }>();
    private forgeWidgets = new Map<string, { node: Node; title: Label; info: Label; state: Label }>();
    private materialWidgets = new Map<string, Label>();
    private recipeCards: RecipeCard[] = [
        { id: 'pill1', title: '聚气丹', info: '修为 +20  |  灵草 x2', state: '库存 0 枚 · 回元' },
        { id: 'pill2', title: '凝神丹', info: '法力 +18  |  灵草 x3', state: '库存 0 枚 · 清明' },
        { id: 'pill3', title: '护脉丹', info: '气血 +26  |  灵草 x4', state: '库存 0 枚 · 固元' },
        { id: 'pill4', title: '悟道丹', info: '感悟 +1  |  灵草 x5', state: '库存 0 枚 · 开悟' },
    ];
    private forgeCards: RecipeCard[] = [
        { id: 'forge1', title: '养器匣', info: '法器经验 +40  |  灵矿 x3', state: '已成 0 件 · 藏锋' },
        { id: 'forge2', title: '护身佩', info: '气血 +28  |  灵矿 x4', state: '已成 0 件 · 守御' },
        { id: 'forge3', title: '行炁环', info: '法力 +20  |  灵矿 x4', state: '已成 0 件 · 回炁' },
    ];
    private materials: MaterialCard[] = [
        { id: 'm1', title: '月华草', kind: '凡品灵植', count: 'x 0' },
        { id: 'm2', title: '赤炎花', kind: '良品灵植', count: 'x 0' },
        { id: 'm3', title: '玄铁砂', kind: '凡品灵矿', count: 'x 0' },
        { id: 'm4', title: '星纹石', kind: '良品灵矿', count: 'x 0' },
        { id: 'm5', title: '灵木心', kind: '珍品灵植', count: 'x 0' },
        { id: 'm6', title: '乌金晶', kind: '珍品灵矿', count: 'x 0' },
        { id: 'm7', title: '清露叶', kind: '凡品灵植', count: 'x 0' },
        { id: 'm8', title: '寒髓矿', kind: '良品灵矿', count: 'x 0' },
    ];

    onLoad() { this.shell = this.node.getComponent(CommonPageShell) ?? this.node.addComponent(CommonPageShell); }
    start() { this.rebuild(); }

    public rebuild() {
        if (!this.shell) return;
        this.shell.rebuild();
        this.shell.setTitle(this.title, this.subtitle);
        this.shell.setCurrencyValues(this.leftCurrencyValue, this.rightCurrencyValue);
        this.shell.selectShortcut('alchemy');
        const root = this.shell.getContentRoot();
        if (!root) return;
        root.removeAllChildren();
        this.tabButtons.clear();
        this.pages.clear();
        this.recipeWidgets.clear();
        this.forgeWidgets.clear();
        this.materialWidgets.clear();
        this.buildLayout(root);
        this.refreshView();
    }

    public setHeaderValues(leftValue: string, rightValue: string) { this.leftCurrencyValue = leftValue; this.rightCurrencyValue = rightValue; this.shell?.setCurrencyValues(leftValue, rightValue); }
    public setDetail(title: string, info: string, cost: string, output: string, craftText: string, useText: string, hint: string) {
        this.detailTitle = title; this.detailInfo = info; this.detailCost = cost; this.detailOutput = output; this.craftButtonText = craftText; this.useButtonText = useText; this.hintText = hint; this.refreshView();
    }
    public setTab(tab: AlchemyTab) { this.currentTab = tab; this.refreshView(); }
    public setRecipes(recipes: RecipeCard[], forges: RecipeCard[], materials: MaterialCard[]) { this.recipeCards = recipes; this.forgeCards = forges; this.materials = materials; this.rebuild(); }

    private refreshView() {
        if (this.detailTitleLabel) this.detailTitleLabel.string = this.detailTitle;
        if (this.detailInfoLabel) this.detailInfoLabel.string = this.detailInfo;
        if (this.detailCostLabel) this.detailCostLabel.string = this.detailCost;
        if (this.detailOutputLabel) this.detailOutputLabel.string = this.detailOutput;
        if (this.craftButtonLabel) this.craftButtonLabel.string = this.craftButtonText;
        if (this.useButtonLabel) this.useButtonLabel.string = this.useButtonText;
        if (this.hintLabel) this.hintLabel.string = this.hintText;
        this.pages.forEach((page, key) => { page.active = key === this.currentTab || (key === 'furnace' && this.currentTab === 'forge'); });
        this.tabButtons.forEach((widget, tab) => {
            const active = tab === this.currentTab;
            repaintRoundedPanel(widget.node, active ? new Color(66, 82, 104, 255) : new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 6);
            widget.label.color = active ? new Color(246, 244, 236, 255) : new Color(44, 44, 44, 255);
        });
        this.recipeWidgets.forEach((widget, id) => {
            const data = this.recipeCards.find((entry) => entry.id === id);
            if (!data) return;
            widget.title.string = data.title; widget.info.string = data.info; widget.state.string = data.state;
        });
        this.forgeWidgets.forEach((widget, id) => {
            const data = this.forgeCards.find((entry) => entry.id === id);
            if (!data) return;
            widget.title.string = data.title; widget.info.string = data.info; widget.state.string = data.state;
        });
        this.materialWidgets.forEach((label, id) => {
            const data = this.materials.find((entry) => entry.id === id);
            if (!data) return;
            label.string = data.count;
        });
    }

    private buildLayout(root: Node) {
        const tabDefs: Array<{ id: AlchemyTab; label: string; x: number }> = [
            { id: 'furnace', label: '炼丹', x: -204 },
            { id: 'formula', label: '丹方', x: -68 },
            { id: 'storehouse', label: '材料库', x: 68 },
            { id: 'forge', label: '炼器', x: 204 },
        ];
        tabDefs.forEach((entry) => {
            const button = createRoundedPanel(root, 110, 40, new Vec3(entry.x, 318, 0), new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 6);
            button.addComponent(Button).transition = Button.Transition.NONE;
            button.on(Node.EventType.TOUCH_END, () => { this.currentTab = entry.id; this.node.emit('alchemy-tab-click', entry.id); this.refreshView(); }, this);
            const label = createPageLabel(button, entry.label, 17, new Vec3(0, 0, 0), new Color(44, 44, 44, 255), 90);
            this.tabButtons.set(entry.id, { node: button, label });
        });

        const furnacePage = new Node('FurnacePage');
        furnacePage.layer = Layers.Enum.UI_2D;
        root.addChild(furnacePage);
        furnacePage.addComponent(UITransform).setContentSize(648, 624);
        this.pages.set('furnace', furnacePage);
        furnacePage.setPosition(0, -18, 0);

        const recipePage = new Node('RecipePage');
        recipePage.layer = Layers.Enum.UI_2D;
        root.addChild(recipePage);
        recipePage.addComponent(UITransform).setContentSize(648, 624);
        recipePage.setPosition(0, -18, 0);
        this.pages.set('formula', recipePage);

        const storehousePage = new Node('StorehousePage');
        storehousePage.layer = Layers.Enum.UI_2D;
        root.addChild(storehousePage);
        storehousePage.addComponent(UITransform).setContentSize(648, 624);
        storehousePage.setPosition(0, -18, 0);
        this.pages.set('storehouse', storehousePage);

        const forgePage = new Node('ForgePage');
        forgePage.layer = Layers.Enum.UI_2D;
        root.addChild(forgePage);
        forgePage.addComponent(UITransform).setContentSize(648, 624);
        forgePage.setPosition(0, -18, 0);
        this.pages.set('forge', forgePage);

        this.buildFurnacePage(furnacePage);
        this.buildRecipePage(recipePage);
        this.buildStorehousePage(storehousePage);
        this.buildForgePage(forgePage);
    }

    private buildFurnacePage(root: Node) {
        const detail = createRoundedPanel(root, 604, 318, new Vec3(0, 102, 0), new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        const reserve = createRoundedPanel(root, 604, 148, new Vec3(0, -154, 0), new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        const cauldron = createRoundedPanel(detail, 146, 146, new Vec3(-194, 16, 0), new Color(248, 247, 244, 255), new Color(30, 30, 30, 255), 8);
        createPageLabel(cauldron, '炉', 50, new Vec3(0, 18, 0), new Color(44, 44, 44, 255), 60);
        createPageLabel(cauldron, '当前丹方', 16, new Vec3(0, -42, 0), new Color(88, 88, 88, 255), 90);
        this.detailTitleLabel = createPageLabel(detail, '', 28, new Vec3(58, 78, 0), new Color(34, 34, 34, 255), 360, HorizontalTextAlignment.LEFT);
        this.detailInfoLabel = createPageLabel(detail, '', 17, new Vec3(82, 30, 0), new Color(58, 58, 58, 255), 420, HorizontalTextAlignment.LEFT);
        this.detailCostLabel = createPageLabel(detail, '', 16, new Vec3(82, -20, 0), new Color(96, 84, 52, 255), 420, HorizontalTextAlignment.LEFT);
        this.detailOutputLabel = createPageLabel(detail, '', 15, new Vec3(82, -66, 0), new Color(58, 92, 66, 255), 420, HorizontalTextAlignment.LEFT);
        const craftBtn = createRoundedPanel(detail, 144, 40, new Vec3(156, -118, 0), new Color(244, 238, 230, 255), new Color(30, 30, 30, 255), 6);
        const useBtn = createRoundedPanel(detail, 124, 38, new Vec3(18, -118, 0), new Color(232, 239, 233, 255), new Color(30, 30, 30, 255), 6);
        craftBtn.addComponent(Button).transition = Button.Transition.NONE;
        useBtn.addComponent(Button).transition = Button.Transition.NONE;
        craftBtn.on(Node.EventType.TOUCH_END, () => this.node.emit('alchemy-craft-click', this.currentTab), this);
        useBtn.on(Node.EventType.TOUCH_END, () => this.node.emit('alchemy-use-click'), this);
        this.craftButtonLabel = createPageLabel(craftBtn, '', 16, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 96);
        this.useButtonLabel = createPageLabel(useBtn, '', 16, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 96);
        createPageLabel(reserve, '当前炉台', 22, new Vec3(-214, 36, 0), new Color(34, 34, 34, 255), 150, HorizontalTextAlignment.LEFT);
        this.hintLabel = createPageLabel(reserve, '', 16, new Vec3(0, -8, 0), new Color(88, 88, 88, 255), 520);
    }

    private buildRecipePage(root: Node) {
        const xs = [-156, 156, -156, 156];
        const ys = [92, 92, -92, -92];
        this.recipeCards.forEach((entry, index) => {
            const card = createRoundedPanel(root, 252, 152, new Vec3(xs[index], ys[index], 0), new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 8);
            card.addComponent(Button).transition = Button.Transition.NONE;
            card.on(Node.EventType.TOUCH_END, () => this.node.emit('alchemy-recipe-click', entry.id), this);
            const title = createPageLabel(card, '', 22, new Vec3(26, 38, 0), new Color(34, 34, 34, 255), 160, HorizontalTextAlignment.LEFT);
            const info = createPageLabel(card, '', 15, new Vec3(26, 2, 0), new Color(88, 88, 88, 255), 176, HorizontalTextAlignment.LEFT);
            const state = createPageLabel(card, '', 14, new Vec3(26, -38, 0), new Color(110, 98, 70, 255), 176, HorizontalTextAlignment.LEFT);
            this.recipeWidgets.set(entry.id, { node: card, title, info, state });
        });
    }

    private buildStorehousePage(root: Node) {
        const xs = [-156, 156, -156, 156, -156, 156, -156, 156];
        const ys = [138, 138, 34, 34, -70, -70, -174, -174];
        this.materials.forEach((entry, index) => {
            const card = createRoundedPanel(root, 252, 86, new Vec3(xs[index], ys[index], 0), new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 8);
            const title = createPageLabel(card, entry.title, 18, new Vec3(20, 16, 0), new Color(34, 34, 34, 255), 150, HorizontalTextAlignment.LEFT);
            const kind = createPageLabel(card, entry.kind, 14, new Vec3(20, -12, 0), new Color(88, 88, 88, 255), 150, HorizontalTextAlignment.LEFT);
            title.horizontalAlign = HorizontalTextAlignment.LEFT;
            kind.horizontalAlign = HorizontalTextAlignment.LEFT;
            const count = createPageLabel(card, entry.count, 18, new Vec3(78, 0, 0), new Color(96, 84, 52, 255), 80);
            this.materialWidgets.set(entry.id, count);
        });
    }

    private buildForgePage(root: Node) {
        const xs = [-180, 180, 0];
        const ys = [88, 88, -112];
        this.forgeCards.forEach((entry, index) => {
            const card = createRoundedPanel(root, 264, 154, new Vec3(xs[index], ys[index], 0), new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 8);
            card.addComponent(Button).transition = Button.Transition.NONE;
            card.on(Node.EventType.TOUCH_END, () => this.node.emit('alchemy-forge-click', entry.id), this);
            const title = createPageLabel(card, '', 21, new Vec3(20, 38, 0), new Color(34, 34, 34, 255), 170, HorizontalTextAlignment.LEFT);
            const info = createPageLabel(card, '', 15, new Vec3(20, 2, 0), new Color(88, 88, 88, 255), 182, HorizontalTextAlignment.LEFT);
            const state = createPageLabel(card, '', 14, new Vec3(20, -38, 0), new Color(110, 98, 70, 255), 182, HorizontalTextAlignment.LEFT);
            this.forgeWidgets.set(entry.id, { node: card, title, info, state });
        });
    }
}
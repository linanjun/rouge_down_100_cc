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

type FaqiSlot = 'sword' | 'talisman' | 'lamp';

type FaqiCardData = {
    id: string;
    slot: FaqiSlot;
    glyph: string;
    name: string;
    info: string;
    state: string;
};

@ccclass('FaqiOverviewPage')
export class FaqiOverviewPage extends Component {
    @property
    title = '法器中枢';

    @property
    subtitle = '统一陈列法器详情、操作区与谱录列表，保持顶部信息与中段养成结构一致。';

    @property
    leftCurrencyValue = '0';

    @property
    rightCurrencyValue = '0';

    @property
    resourceSummary = '法器经验 0  |  灵石 0  |  徽记 0';

    @property
    detailTitle = '青霜剑 · 斩浪';

    @property
    detailInfo = '剑修本命飞剑，擅长抬高术攻与局内攻势。\n等级 1/5  |  星级 ★';

    @property
    detailEffect = '术攻 +3 | 局内攻势 +3%';

    @property
    detailShard = '碎片 4  |  升级需经验 26 / 养护灵石 280';

    @property
    detailGlyph = '剑';

    @property
    primaryButtonText = '装备';

    @property
    upgradeButtonText = '升级(26)';

    @property
    starButtonText = '升星(8)';

    private shell: CommonPageShell | null = null;
    private resourceLabel: Label | null = null;
    private detailTitleLabel: Label | null = null;
    private detailInfoLabel: Label | null = null;
    private detailEffectLabel: Label | null = null;
    private detailShardLabel: Label | null = null;
    private detailGlyphLabel: Label | null = null;
    private primaryButtonLabel: Label | null = null;
    private upgradeButtonLabel: Label | null = null;
    private starButtonLabel: Label | null = null;
    private slotButtons = new Map<FaqiSlot, Node>();
    private slotLabels = new Map<FaqiSlot, Label>();
    private listCards = new Map<string, { card: Node; title: Label; info: Label; state: Label }>();
    private selectedSlot: FaqiSlot = 'sword';
    private selectedCardId = 'qingshuang';
    private cards: FaqiCardData[] = [
        { id: 'qingshuang', slot: 'sword', glyph: '剑', name: '青霜剑', info: 'Lv.1  ★', state: '可装配 · 斩浪' },
        { id: 'lihuo', slot: 'sword', glyph: '剑', name: '离火剑', info: '碎片 2/12', state: '未合成' },
        { id: 'xuanjia', slot: 'talisman', glyph: '符', name: '玄甲符', info: 'Lv.1  ★', state: '已装配 · 护体' },
        { id: 'huiyuan', slot: 'talisman', glyph: '符', name: '回元符', info: '碎片 4/12', state: '未合成' },
        { id: 'xunbao', slot: 'lamp', glyph: '灯', name: '寻宝灯', info: 'Lv.1  ★', state: '可装配 · 寻珍' },
        { id: 'guixi', slot: 'lamp', glyph: '灯', name: '归息灯', info: '碎片 1/12', state: '未合成' },
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
        this.shell.selectBottomTab('faqi');
        const root = this.shell.getContentRoot();
        if (!root) return;

        root.removeAllChildren();
        this.slotButtons.clear();
        this.slotLabels.clear();
        this.listCards.clear();

        this.buildLayout(root);
        this.refreshView();
    }

    public setHeaderValues(leftValue: string, rightValue: string, summary: string) {
        this.leftCurrencyValue = leftValue;
        this.rightCurrencyValue = rightValue;
        this.resourceSummary = summary;
        this.shell?.setCurrencyValues(leftValue, rightValue);
        if (this.resourceLabel) this.resourceLabel.string = summary;
    }

    public setDetail(title: string, info: string, effect: string, shard: string, glyph: string) {
        this.detailTitle = title;
        this.detailInfo = info;
        this.detailEffect = effect;
        this.detailShard = shard;
        this.detailGlyph = glyph;
        this.refreshView();
    }

    public setActionTexts(primary: string, upgrade: string, star: string) {
        this.primaryButtonText = primary;
        this.upgradeButtonText = upgrade;
        this.starButtonText = star;
        this.refreshView();
    }

    public setCards(cards: FaqiCardData[], selectedSlot: FaqiSlot, selectedCardId: string) {
        this.cards = cards;
        this.selectedSlot = selectedSlot;
        this.selectedCardId = selectedCardId;
        this.rebuild();
    }

    private refreshView() {
        if (this.resourceLabel) this.resourceLabel.string = this.resourceSummary;
        if (this.detailTitleLabel) this.detailTitleLabel.string = this.detailTitle;
        if (this.detailInfoLabel) this.detailInfoLabel.string = this.detailInfo;
        if (this.detailEffectLabel) this.detailEffectLabel.string = this.detailEffect;
        if (this.detailShardLabel) this.detailShardLabel.string = this.detailShard;
        if (this.detailGlyphLabel) this.detailGlyphLabel.string = this.detailGlyph;
        if (this.primaryButtonLabel) this.primaryButtonLabel.string = this.primaryButtonText;
        if (this.upgradeButtonLabel) this.upgradeButtonLabel.string = this.upgradeButtonText;
        if (this.starButtonLabel) this.starButtonLabel.string = this.starButtonText;

        const slotNames: Record<FaqiSlot, string> = { sword: '飞剑', talisman: '护符', lamp: '灵灯' };
        (['sword', 'talisman', 'lamp'] as FaqiSlot[]).forEach((slot) => {
            const button = this.slotButtons.get(slot);
            const label = this.slotLabels.get(slot);
            if (!button || !label) return;
            const active = slot === this.selectedSlot;
            this.paintButton(button, active ? new Color(58, 72, 92, 255) : new Color(232, 232, 228, 255), new Color(32, 32, 32, 255), 6);
            label.string = slotNames[slot];
            label.color = active ? new Color(246, 244, 236, 255) : new Color(34, 34, 34, 255);
        });

        this.listCards.forEach((widget, id) => {
            const data = this.cards.find((entry) => entry.id === id);
            if (!data) return;
            const visible = data.slot === this.selectedSlot;
            widget.card.active = visible;
            if (!visible) return;
            const active = data.id === this.selectedCardId;
            this.paintButton(widget.card, active ? new Color(64, 78, 98, 255) : new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
            widget.title.string = `${data.glyph}  ${data.name}`;
            widget.title.color = active ? new Color(246, 244, 236, 255) : new Color(34, 34, 34, 255);
            widget.info.string = data.info;
            widget.info.color = active ? new Color(228, 232, 238, 255) : new Color(52, 52, 52, 255);
            widget.state.string = data.state;
            widget.state.color = active ? new Color(232, 220, 184, 255) : new Color(94, 94, 94, 255);
        });
    }

    private buildLayout(root: Node) {
        const detailPanel = this.createPanel(root, 648, 314, 0, 176, new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        const listPanel = this.createPanel(root, 648, 290, 0, -140, new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);

        this.resourceLabel = this.createLabel(detailPanel, '', 18, new Vec3(0, 116, 0), new Color(34, 34, 34, 255), 600, HorizontalTextAlignment.CENTER);

        const iconPanel = this.createPanel(detailPanel, 196, 196, -196, -6, new Color(246, 246, 243, 255), new Color(30, 30, 30, 255), 8);
        this.detailGlyphLabel = this.createLabel(iconPanel, '', 54, new Vec3(0, 12, 0), new Color(44, 44, 44, 255), 100, HorizontalTextAlignment.CENTER);
        this.createLabel(iconPanel, '当前本命', 18, new Vec3(0, -56, 0), new Color(84, 84, 84, 255), 140, HorizontalTextAlignment.CENTER);

        this.detailTitleLabel = this.createLabel(detailPanel, '', 30, new Vec3(96, 70, 0), new Color(34, 34, 34, 255), 370, HorizontalTextAlignment.LEFT);
        this.detailInfoLabel = this.createLabel(detailPanel, '', 18, new Vec3(112, 18, 0), new Color(58, 58, 58, 255), 400, HorizontalTextAlignment.LEFT);
        this.detailInfoLabel.lineHeight = 22;
        this.detailEffectLabel = this.createLabel(detailPanel, '', 18, new Vec3(112, -34, 0), new Color(48, 92, 66, 255), 400, HorizontalTextAlignment.LEFT);
        this.detailShardLabel = this.createLabel(detailPanel, '', 16, new Vec3(112, -82, 0), new Color(90, 90, 90, 255), 400, HorizontalTextAlignment.LEFT);

        const actionStrip = this.createPanel(detailPanel, 418, 54, 112, -112, new Color(248, 247, 244, 255), new Color(30, 30, 30, 255), 8);
        const primaryBtn = this.createPanel(actionStrip, 116, 36, -130, 0, new Color(224, 233, 245, 255), new Color(30, 30, 30, 255), 6);
        const upgradeBtn = this.createPanel(actionStrip, 116, 36, 0, 0, new Color(233, 239, 229, 255), new Color(30, 30, 30, 255), 6);
        const starBtn = this.createPanel(actionStrip, 116, 36, 130, 0, new Color(241, 234, 224, 255), new Color(30, 30, 30, 255), 6);
        primaryBtn.addComponent(Button).transition = Button.Transition.NONE;
        upgradeBtn.addComponent(Button).transition = Button.Transition.NONE;
        starBtn.addComponent(Button).transition = Button.Transition.NONE;
        primaryBtn.on(Node.EventType.TOUCH_END, () => this.node.emit('faqi-primary-click'), this);
        upgradeBtn.on(Node.EventType.TOUCH_END, () => this.node.emit('faqi-upgrade-click'), this);
        starBtn.on(Node.EventType.TOUCH_END, () => this.node.emit('faqi-star-click'), this);
        this.primaryButtonLabel = this.createLabel(primaryBtn, '', 16, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 96, HorizontalTextAlignment.CENTER);
        this.upgradeButtonLabel = this.createLabel(upgradeBtn, '', 16, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 96, HorizontalTextAlignment.CENTER);
        this.starButtonLabel = this.createLabel(starBtn, '', 16, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 96, HorizontalTextAlignment.CENTER);

        this.createLabel(listPanel, '法器谱录', 22, new Vec3(-236, 114, 0), new Color(34, 34, 34, 255), 160, HorizontalTextAlignment.LEFT);
        this.createLabel(listPanel, '切换飞剑、护符、灵灯，专注养成当前本命并统一养成节奏。', 15, new Vec3(32, 114, 0), new Color(88, 88, 88, 255), 420, HorizontalTextAlignment.CENTER);

        const slotDefs: Array<{ slot: FaqiSlot; label: string; x: number }> = [
            { slot: 'sword', label: '飞剑', x: -128 },
            { slot: 'talisman', label: '护符', x: 0 },
            { slot: 'lamp', label: '灵灯', x: 128 },
        ];
        slotDefs.forEach((entry) => {
            const button = this.createPanel(listPanel, 112, 38, entry.x, 64, new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 6);
            button.addComponent(Button).transition = Button.Transition.NONE;
            button.on(Node.EventType.TOUCH_END, () => {
                this.selectedSlot = entry.slot;
                this.node.emit('faqi-slot-click', entry.slot);
                const firstCard = this.cards.find((card) => card.slot === entry.slot);
                if (firstCard) this.selectedCardId = firstCard.id;
                this.refreshView();
            }, this);
            this.slotButtons.set(entry.slot, button);
            this.slotLabels.set(entry.slot, this.createLabel(button, entry.label, 17, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 88, HorizontalTextAlignment.CENTER));
        });

        const positions = [new Vec3(-160, -26, 0), new Vec3(160, -26, 0)];
        this.cards.forEach((card, index) => {
            const pos = positions[index % 2];
            const row = Math.floor(index / 2);
            const cardNode = this.createPanel(listPanel, 286, 106, pos.x, pos.y - row * 108, new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 8);
            cardNode.addComponent(Button).transition = Button.Transition.NONE;
            cardNode.on(Node.EventType.TOUCH_END, () => {
                this.selectedSlot = card.slot;
                this.selectedCardId = card.id;
                this.node.emit('faqi-card-click', card.id);
                this.refreshView();
            }, this);
            const title = this.createLabel(cardNode, '', 20, new Vec3(-98, 24, 0), new Color(34, 34, 34, 255), 198, HorizontalTextAlignment.LEFT);
            const info = this.createLabel(cardNode, '', 15, new Vec3(-98, -2, 0), new Color(68, 68, 68, 255), 210, HorizontalTextAlignment.LEFT);
            const state = this.createLabel(cardNode, '', 14, new Vec3(-98, -30, 0), new Color(94, 94, 94, 255), 210, HorizontalTextAlignment.LEFT);
            this.listCards.set(card.id, { card: cardNode, title, info, state });
        });
    }

    private createPanel(parent: Node, width: number, height: number, x: number, y: number, fill: Color, stroke: Color, radius: number) {
        const panel = new Node('Panel');
        panel.layer = Layers.Enum.UI_2D;
        parent.addChild(panel);
        panel.setPosition(x, y, 0);
        panel.addComponent(UITransform).setContentSize(width, height);
        this.paintButton(panel, fill, stroke, radius);
        return panel;
    }

    private paintButton(node: Node, fill: Color, stroke: Color, radius: number) {
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
        node.addComponent(UITransform).setContentSize(width, fontSize + 14);
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
import {
    _decorator,
    Button,
    Color,
    Component,
    HorizontalTextAlignment,
    Label,
    Node,
    Vec3,
} from 'cc';
import { CommonPageShell } from './CommonPageShell';
import { createPageLabel, createRoundedPanel, repaintRoundedPanel } from './CommonPageWidgets';

const { ccclass, property } = _decorator;

type SpiritPetCard = { id: string; title: string; info: string; state: string; active: boolean };

@ccclass('SpiritPetOverviewPage')
export class SpiritPetOverviewPage extends Component {
    @property title = '灵宠苑';
    @property subtitle = '上观灵宠立绘并设置出战，下览全部灵宠谱录，切换当前养成目标。';
    @property leftCurrencyValue = '0';
    @property rightCurrencyValue = '0';
    @property nameText = '青羽雀 · 出战中';
    @property infoText = '风羽灵雀  |  Lv.1\n提高行动恢复与探索收益。';
    @property effectText = '气血 +24  |  行动力 +2  |  秘境收益 +6%';
    @property hintText = '当前养成消耗：灵石折值 120。点击下方列表可切换养成目标。';
    @property deployButtonText = '已出战';
    @property upgradeButtonText = '养成(120)';

    private shell: CommonPageShell | null = null;
    private nameLabel: Label | null = null;
    private infoLabel: Label | null = null;
    private effectLabel: Label | null = null;
    private hintLabel: Label | null = null;
    private deployLabel: Label | null = null;
    private upgradeLabel: Label | null = null;
    private cardWidgets = new Map<string, { node: Node; title: Label; info: Label; state: Label }>();
    private cards: SpiritPetCard[] = [
        { id: 'p1', title: '1. 青羽雀', info: '风羽灵雀  |  Lv.1  |  可养成', state: '出战中', active: true },
        { id: 'p2', title: '2. 赤焰狐', info: '火系灵狐  |  Lv.1  |  可养成', state: '待命', active: false },
        { id: 'p3', title: '3. 石背龟', info: '土系灵龟  |  Lv.1  |  待收服', state: '待命', active: false },
    ];

    onLoad() { this.shell = this.node.getComponent(CommonPageShell) ?? this.node.addComponent(CommonPageShell); }
    start() { this.rebuild(); }

    public rebuild() {
        if (!this.shell) return;
        this.shell.rebuild();
        this.shell.setTitle(this.title, this.subtitle);
        this.shell.setCurrencyValues(this.leftCurrencyValue, this.rightCurrencyValue);
        this.shell.selectShortcut('pet');
        this.shell.selectBottomTab('role');
        const root = this.shell.getContentRoot();
        if (!root) return;
        root.removeAllChildren();
        this.cardWidgets.clear();
        this.buildLayout(root);
        this.refreshView();
    }

    public setHeaderValues(leftValue: string, rightValue: string) { this.leftCurrencyValue = leftValue; this.rightCurrencyValue = rightValue; this.shell?.setCurrencyValues(leftValue, rightValue); }
    public setDetail(name: string, info: string, effect: string, hint: string, deploy: string, upgrade: string) {
        this.nameText = name; this.infoText = info; this.effectText = effect; this.hintText = hint; this.deployButtonText = deploy; this.upgradeButtonText = upgrade; this.refreshView();
    }
    public setCards(cards: SpiritPetCard[]) { this.cards = cards; this.refreshView(); }

    private refreshView() {
        if (this.nameLabel) this.nameLabel.string = this.nameText;
        if (this.infoLabel) this.infoLabel.string = this.infoText;
        if (this.effectLabel) this.effectLabel.string = this.effectText;
        if (this.hintLabel) this.hintLabel.string = this.hintText;
        if (this.deployLabel) this.deployLabel.string = this.deployButtonText;
        if (this.upgradeLabel) this.upgradeLabel.string = this.upgradeButtonText;
        this.cardWidgets.forEach((widget, id) => {
            const data = this.cards.find((entry) => entry.id === id);
            if (!data) return;
            widget.title.string = data.title; widget.info.string = data.info; widget.state.string = data.state;
            repaintRoundedPanel(widget.node, data.active ? new Color(66, 82, 104, 255) : new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 8);
        });
    }

    private buildLayout(root: Node) {
        const topPanel = createRoundedPanel(root, 596, 304, new Vec3(0, 154, 0), new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        const listPanel = createRoundedPanel(root, 596, 286, new Vec3(0, -198, 0), new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        const portrait = createRoundedPanel(topPanel, 218, 224, new Vec3(-176, -2, 0), new Color(247, 246, 243, 255), new Color(30, 30, 30, 255), 8);
        createPageLabel(portrait, '宠', 54, new Vec3(0, 0, 0), new Color(44, 44, 44, 255), 60);
        this.nameLabel = createPageLabel(topPanel, '', 28, new Vec3(86, 92, 0), new Color(34, 34, 34, 255), 318, HorizontalTextAlignment.LEFT);
        this.infoLabel = createPageLabel(topPanel, '', 16, new Vec3(96, 38, 0), new Color(58, 58, 58, 255), 336, HorizontalTextAlignment.LEFT);
        this.effectLabel = createPageLabel(topPanel, '', 16, new Vec3(96, -26, 0), new Color(96, 84, 52, 255), 336, HorizontalTextAlignment.LEFT);
        const strip = createRoundedPanel(topPanel, 328, 52, new Vec3(106, -100, 0), new Color(248, 247, 244, 255), new Color(30, 30, 30, 255), 8);
        const deployBtn = createRoundedPanel(strip, 136, 36, new Vec3(-78, 0, 0), new Color(232, 239, 233, 255), new Color(30, 30, 30, 255), 6);
        const upgradeBtn = createRoundedPanel(strip, 136, 36, new Vec3(78, 0, 0), new Color(247, 246, 243, 255), new Color(30, 30, 30, 255), 6);
        deployBtn.addComponent(Button).transition = Button.Transition.NONE;
        upgradeBtn.addComponent(Button).transition = Button.Transition.NONE;
        deployBtn.on(Node.EventType.TOUCH_END, () => this.node.emit('spirit-pet-deploy-click'), this);
        upgradeBtn.on(Node.EventType.TOUCH_END, () => this.node.emit('spirit-pet-upgrade-click'), this);
        this.deployLabel = createPageLabel(deployBtn, '', 16, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 100);
        this.upgradeLabel = createPageLabel(upgradeBtn, '', 16, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 100);
        this.hintLabel = createPageLabel(topPanel, '', 14, new Vec3(0, -146, 0), new Color(88, 88, 88, 255), 520);
        createPageLabel(listPanel, '灵宠谱录', 22, new Vec3(-220, 112, 0), new Color(34, 34, 34, 255), 150, HorizontalTextAlignment.LEFT);
        this.cards.forEach((entry, index) => {
            const card = createRoundedPanel(listPanel, 548, 72, new Vec3(0, 26 - index * 78, 0), new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 8);
            card.addComponent(Button).transition = Button.Transition.NONE;
            card.on(Node.EventType.TOUCH_END, () => this.node.emit('spirit-pet-card-click', entry.id), this);
            const title = createPageLabel(card, '', 20, new Vec3(-108, 16, 0), new Color(34, 34, 34, 255), 190, HorizontalTextAlignment.LEFT);
            const info = createPageLabel(card, '', 14, new Vec3(-12, -12, 0), new Color(88, 88, 88, 255), 318, HorizontalTextAlignment.LEFT);
            const state = createPageLabel(card, '', 14, new Vec3(182, 0, 0), new Color(96, 84, 52, 255), 120, HorizontalTextAlignment.CENTER);
            this.cardWidgets.set(entry.id, { node: card, title, info, state });
        });
    }
}
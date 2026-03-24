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

type KungfuCard = { id: string; title: string; info: string; state: string; active: boolean };

@ccclass('KungfuOverviewPage')
export class KungfuOverviewPage extends Component {
    @property title = '功法阁';
    @property subtitle = '由低到高观览诸法，切换当前运转功法并决定主修方向。';
    @property leftCurrencyValue = '0';
    @property rightCurrencyValue = '0';
    @property nameText = '清心诀 · 运转中';
    @property infoText = '静守心神  |  Lv.1  |  吐纳 24灵气/秒\n适合前期平稳积累。';
    @property effectText = '丹成 +4% / 出丹 +0-1\n器成 +2% / 品质 +3%';
    @property hintText = '当前主修正在运转，吐纳、炼丹、炼器加成都已生效。';
    @property runButtonText = '运转中';
    @property upgradeButtonText = '升阶 60';

    private shell: CommonPageShell | null = null;
    private nameLabel: Label | null = null;
    private infoLabel: Label | null = null;
    private effectLabel: Label | null = null;
    private hintLabel: Label | null = null;
    private runLabel: Label | null = null;
    private upgradeLabel: Label | null = null;
    private cardWidgets = new Map<string, { node: Node; title: Label; info: Label; state: Label }>();
    private cards: KungfuCard[] = [
        { id: 'k1', title: '1. 清心诀', info: '静守心神  |  Lv.1  |  吐纳 24/秒', state: '运转中', active: true },
        { id: 'k2', title: '2. 长青功', info: '木行吐纳  |  Lv.1  |  吐纳 28/秒', state: '可切换', active: false },
        { id: 'k3', title: '3. 金焰篇', info: '火行运炁  |  Lv.1  |  吐纳 32/秒', state: '参悟中', active: false },
        { id: 'k4', title: '4. 玄脉录', info: '脉行调息  |  Lv.1  |  吐纳 36/秒', state: '可切换', active: false },
    ];

    onLoad() { this.shell = this.node.getComponent(CommonPageShell) ?? this.node.addComponent(CommonPageShell); }
    start() { this.rebuild(); }

    public rebuild() {
        if (!this.shell) return;
        this.shell.rebuild();
        this.shell.setTitle(this.title, this.subtitle);
        this.shell.setCurrencyValues(this.leftCurrencyValue, this.rightCurrencyValue);
        this.shell.selectShortcut('kungfu');
        this.shell.selectBottomTab('role');
        const root = this.shell.getContentRoot();
        if (!root) return;
        root.removeAllChildren();
        this.cardWidgets.clear();
        this.buildLayout(root);
        this.refreshView();
    }

    public setHeaderValues(leftValue: string, rightValue: string) { this.leftCurrencyValue = leftValue; this.rightCurrencyValue = rightValue; this.shell?.setCurrencyValues(leftValue, rightValue); }
    public setDetail(name: string, info: string, effect: string, hint: string, runText: string, upgradeText: string) {
        this.nameText = name; this.infoText = info; this.effectText = effect; this.hintText = hint; this.runButtonText = runText; this.upgradeButtonText = upgradeText; this.refreshView();
    }
    public setCards(cards: KungfuCard[]) { this.cards = cards; this.refreshView(); }

    private refreshView() {
        if (this.nameLabel) this.nameLabel.string = this.nameText;
        if (this.infoLabel) this.infoLabel.string = this.infoText;
        if (this.effectLabel) this.effectLabel.string = this.effectText;
        if (this.hintLabel) this.hintLabel.string = this.hintText;
        if (this.runLabel) this.runLabel.string = this.runButtonText;
        if (this.upgradeLabel) this.upgradeLabel.string = this.upgradeButtonText;
        this.cardWidgets.forEach((widget, id) => {
            const data = this.cards.find((entry) => entry.id === id);
            if (!data) return;
            widget.title.string = data.title; widget.info.string = data.info; widget.state.string = data.state;
            repaintRoundedPanel(widget.node, data.active ? new Color(66, 82, 104, 255) : new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 8);
            widget.title.color = data.active ? new Color(246, 244, 236, 255) : new Color(34, 34, 34, 255);
        });
    }

    private buildLayout(root: Node) {
        const detail = createRoundedPanel(root, 596, 252, new Vec3(0, 164, 0), new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        const listPanel = createRoundedPanel(root, 596, 350, new Vec3(0, -174, 0), new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        const seal = createRoundedPanel(detail, 124, 124, new Vec3(-208, 20, 0), new Color(247, 246, 243, 255), new Color(30, 30, 30, 255), 8);
        createPageLabel(seal, '诀', 40, new Vec3(0, 16, 0), new Color(44, 44, 44, 255), 52);
        createPageLabel(seal, '主修法门', 16, new Vec3(0, -42, 0), new Color(88, 88, 88, 255), 88);
        this.nameLabel = createPageLabel(detail, '', 28, new Vec3(76, 78, 0), new Color(34, 34, 34, 255), 372, HorizontalTextAlignment.LEFT);
        this.infoLabel = createPageLabel(detail, '', 17, new Vec3(88, 26, 0), new Color(58, 58, 58, 255), 388, HorizontalTextAlignment.LEFT);
        this.effectLabel = createPageLabel(detail, '', 16, new Vec3(88, -34, 0), new Color(96, 84, 52, 255), 388, HorizontalTextAlignment.LEFT);
        const actionStrip = createRoundedPanel(detail, 394, 52, new Vec3(102, -104, 0), new Color(248, 247, 244, 255), new Color(30, 30, 30, 255), 8);
        const runBtn = createRoundedPanel(actionStrip, 144, 38, new Vec3(-82, 0, 0), new Color(247, 246, 243, 255), new Color(30, 30, 30, 255), 6);
        const upgradeBtn = createRoundedPanel(actionStrip, 164, 38, new Vec3(86, 0, 0), new Color(232, 239, 233, 255), new Color(30, 30, 30, 255), 6);
        runBtn.addComponent(Button).transition = Button.Transition.NONE;
        upgradeBtn.addComponent(Button).transition = Button.Transition.NONE;
        runBtn.on(Node.EventType.TOUCH_END, () => this.node.emit('kungfu-run-click'), this);
        upgradeBtn.on(Node.EventType.TOUCH_END, () => this.node.emit('kungfu-upgrade-click'), this);
        this.runLabel = createPageLabel(runBtn, '', 16, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 124);
        this.upgradeLabel = createPageLabel(upgradeBtn, '', 16, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 140);
        this.hintLabel = createPageLabel(detail, '', 14, new Vec3(0, -146, 0), new Color(88, 88, 88, 255), 520);
        createPageLabel(listPanel, '功法谱录', 22, new Vec3(-220, 144, 0), new Color(34, 34, 34, 255), 150, HorizontalTextAlignment.LEFT);
        this.cards.forEach((entry, index) => {
            const card = createRoundedPanel(listPanel, 548, 74, new Vec3(0, 60 - index * 82, 0), new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 8);
            card.addComponent(Button).transition = Button.Transition.NONE;
            card.on(Node.EventType.TOUCH_END, () => this.node.emit('kungfu-card-click', entry.id), this);
            const title = createPageLabel(card, '', 20, new Vec3(-108, 16, 0), new Color(34, 34, 34, 255), 190, HorizontalTextAlignment.LEFT);
            const info = createPageLabel(card, '', 14, new Vec3(-22, -12, 0), new Color(88, 88, 88, 255), 296, HorizontalTextAlignment.LEFT);
            const state = createPageLabel(card, '', 14, new Vec3(170, 0, 0), new Color(96, 84, 52, 255), 92, HorizontalTextAlignment.RIGHT);
            this.cardWidgets.set(entry.id, { node: card, title, info, state });
        });
    }
}
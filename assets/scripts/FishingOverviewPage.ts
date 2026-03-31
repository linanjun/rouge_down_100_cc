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

type FishingSlotData = { title: string; info: string; action: string; selected: boolean; unlocked: boolean };
type FishingTargetData = { id: string; title: string; info: string; state: string; active: boolean };

@ccclass('FishingOverviewPage')
export class FishingOverviewPage extends Component {
    @property title = '独钓万古';
    @property subtitle = '以机缘鱼饵垂钓万古因果，绑定他人机缘位并截取一缕破境反哺。';
    @property leftCurrencyValue = '0';
    @property rightCurrencyValue = '0';
    @property summaryText = '开放绑定位 1/4  |  已绑定 0/1  |  方杆 1 阶  |  当前境界 练气一重';
    @property resourceText = '鱼饵 0  |  买鱼饵 180 灵石  |  升杆 900 灵石  |  当前灵石折值 0';
    @property castButtonText = '抛竿';
    @property hintText = '先选上方槽位，再点击下方修士；抛竿后若对方破境，你会获得一部分反哺修为。';

    private shell: CommonPageShell | null = null;
    private summaryLabel: Label | null = null;
    private resourceLabel: Label | null = null;
    private castButtonLabel: Label | null = null;
    private hintLabel: Label | null = null;
    private slotWidgets: Array<{ node: Node; title: Label; info: Label; action: Label }> = [];
    private targetWidgets = new Map<string, { node: Node; title: Label; info: Label; state: Label }>();
    private slots: FishingSlotData[] = [
        { title: '第 1 位', info: '点下方修士即可绑定', action: '当前待绑定', selected: true, unlocked: true },
        { title: '第 2 位未开', info: '提升自身境界后开放', action: '未解锁', selected: false, unlocked: false },
        { title: '第 3 位未开', info: '提升自身境界后开放', action: '未解锁', selected: false, unlocked: false },
        { title: '第 4 位未开', info: '提升自身境界后开放', action: '未解锁', selected: false, unlocked: false },
    ];
    private targets: FishingTargetData[] = [
        { id: 't1', title: '散修甲 · 游侠', info: '练气 5  |  反哺 18%', state: '点击绑定到当前选中槽位', active: false },
        { id: 't2', title: '散修乙 · 隐士', info: '练气 7  |  反哺 20%', state: '点击绑定到当前选中槽位', active: false },
        { id: 't3', title: '散修丙 · 剑客', info: '筑基 1  |  反哺 22%', state: '点击绑定到当前选中槽位', active: false },
        { id: 't4', title: '散修丁 · 医修', info: '练气 9  |  反哺 16%', state: '点击绑定到当前选中槽位', active: false },
        { id: 't5', title: '散修戊 · 丹师', info: '筑基 2  |  反哺 24%', state: '点击绑定到当前选中槽位', active: false },
        { id: 't6', title: '散修己 · 行者', info: '筑基 3  |  反哺 26%', state: '点击绑定到当前选中槽位', active: false },
    ];

    onLoad() { this.shell = this.node.getComponent(CommonPageShell) ?? this.node.addComponent(CommonPageShell); }
    start() { this.rebuild(); }

    public rebuild() {
        if (!this.shell) return;
        this.shell.rebuild();
        this.shell.setTitle(this.title, this.subtitle);
        this.shell.setCurrencyValues(this.leftCurrencyValue, this.rightCurrencyValue);
        this.shell.selectBottomTab('fishing');
        const root = this.shell.getContentRoot();
        if (!root) return;
        root.removeAllChildren();
        this.slotWidgets = [];
        this.targetWidgets.clear();
        this.buildLayout(root);
        this.refreshView();
    }

    public setHeaderValues(leftValue: string, rightValue: string) {
        this.leftCurrencyValue = leftValue;
        this.rightCurrencyValue = rightValue;
        this.shell?.setCurrencyValues(leftValue, rightValue);
    }

    public setSummary(summary: string, resource: string, hint: string, castText: string) {
        this.summaryText = summary;
        this.resourceText = resource;
        this.hintText = hint;
        this.castButtonText = castText;
        this.refreshView();
    }

    public setSlots(slots: FishingSlotData[]) { this.slots = slots; this.refreshView(); }
    public setTargets(targets: FishingTargetData[]) { this.targets = targets; this.refreshView(); }

    private refreshView() {
        if (this.summaryLabel) this.summaryLabel.string = this.summaryText;
        if (this.resourceLabel) this.resourceLabel.string = this.resourceText;
        if (this.castButtonLabel) this.castButtonLabel.string = this.castButtonText;
        if (this.hintLabel) this.hintLabel.string = this.hintText;
        for (let i = 0; i < this.slotWidgets.length; i++) {
            const data = this.slots[i];
            const widget = this.slotWidgets[i];
            if (!data) continue;
            widget.title.string = data.title;
            widget.info.string = data.info;
            widget.action.string = data.action;
            repaintRoundedPanel(widget.node, data.unlocked ? data.selected ? new Color(66, 82, 104, 255) : new Color(246, 245, 242, 255) : new Color(224, 224, 220, 255), new Color(30, 30, 30, 255), 8);
            const textColor = data.unlocked && data.selected ? new Color(246, 244, 236, 255) : new Color(44, 44, 44, 255);
            widget.title.color = textColor;
            widget.info.color = data.unlocked && data.selected ? new Color(226, 232, 238, 255) : new Color(88, 88, 88, 255);
            widget.action.color = data.unlocked && data.selected ? new Color(234, 220, 180, 255) : new Color(110, 98, 70, 255);
        }
        this.targetWidgets.forEach((widget, id) => {
            const data = this.targets.find((entry) => entry.id === id);
            if (!data) return;
            widget.title.string = data.title;
            widget.info.string = data.info;
            widget.state.string = data.state;
            repaintRoundedPanel(widget.node, data.active ? new Color(66, 82, 104, 255) : new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 8);
            const ink = data.active ? new Color(246, 244, 236, 255) : new Color(44, 44, 44, 255);
            widget.title.color = ink;
            widget.info.color = data.active ? new Color(226, 232, 238, 255) : new Color(88, 88, 88, 255);
            widget.state.color = data.active ? new Color(234, 220, 180, 255) : new Color(110, 98, 70, 255);
        });
    }

    private buildLayout(root: Node) {
        const summaryPanel = createRoundedPanel(root, 648, 124, new Vec3(0, 226, 0), new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        const actionPanel = createRoundedPanel(root, 648, 126, new Vec3(0, 84, 0), new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        const slotPanel = createRoundedPanel(root, 648, 216, new Vec3(0, -124, 0), new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        const targetPanel = createRoundedPanel(root, 648, 224, new Vec3(0, -374, 0), new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        createPageLabel(summaryPanel, '钓台总览', 22, new Vec3(-236, 34, 0), new Color(34, 34, 34, 255), 150, HorizontalTextAlignment.LEFT);
        this.summaryLabel = createPageLabel(summaryPanel, '', 16, new Vec3(0, 8, 0), new Color(58, 58, 58, 255), 600);
        this.resourceLabel = createPageLabel(summaryPanel, '', 16, new Vec3(0, -24, 0), new Color(96, 84, 52, 255), 600);
        createPageLabel(actionPanel, '钓具补给', 22, new Vec3(-236, 34, 0), new Color(34, 34, 34, 255), 150, HorizontalTextAlignment.LEFT);
        const baitBtn = createRoundedPanel(actionPanel, 158, 42, new Vec3(-176, -18, 0), new Color(247, 246, 243, 255), new Color(30, 30, 30, 255), 6);
        const rodBtn = createRoundedPanel(actionPanel, 158, 42, new Vec3(0, -18, 0), new Color(247, 246, 243, 255), new Color(30, 30, 30, 255), 6);
        const castBtn = createRoundedPanel(actionPanel, 158, 42, new Vec3(176, -18, 0), new Color(230, 239, 232, 255), new Color(30, 30, 30, 255), 6);
        baitBtn.addComponent(Button).transition = Button.Transition.NONE;
        rodBtn.addComponent(Button).transition = Button.Transition.NONE;
        castBtn.addComponent(Button).transition = Button.Transition.NONE;
        baitBtn.on(Node.EventType.TOUCH_END, () => this.node.emit('fishing-buy-bait'), this);
        rodBtn.on(Node.EventType.TOUCH_END, () => this.node.emit('fishing-upgrade-rod'), this);
        castBtn.on(Node.EventType.TOUCH_END, () => this.node.emit('fishing-cast'), this);
        createPageLabel(baitBtn, '买鱼饵', 18, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 90);
        createPageLabel(rodBtn, '升方杆', 18, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 90);
        this.castButtonLabel = createPageLabel(castBtn, '', 18, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 90);
        createPageLabel(slotPanel, '机缘绑定位', 22, new Vec3(-236, 78, 0), new Color(34, 34, 34, 255), 180, HorizontalTextAlignment.LEFT);
        const slotXs = [-246, -82, 82, 246];
        for (let i = 0; i < 4; i++) {
            const card = createRoundedPanel(slotPanel, 148, 116, new Vec3(slotXs[i], -14, 0), new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 8);
            card.addComponent(Button).transition = Button.Transition.NONE;
            card.on(Node.EventType.TOUCH_END, () => this.node.emit('fishing-slot-click', i), this);
            const title = createPageLabel(card, '', 17, new Vec3(0, 30, 0), new Color(44, 44, 44, 255), 120);
            const info = createPageLabel(card, '', 13, new Vec3(0, -2, 0), new Color(88, 88, 88, 255), 126);
            const action = createPageLabel(card, '', 13, new Vec3(0, -34, 0), new Color(110, 98, 70, 255), 118);
            this.slotWidgets.push({ node: card, title, info, action });
        }
        createPageLabel(targetPanel, '可钓机缘', 22, new Vec3(-236, 80, 0), new Color(34, 34, 34, 255), 160, HorizontalTextAlignment.LEFT);
        const targetXs = [-214, 0, 214, -214, 0, 214];
        const targetYs = [36, 36, 36, -68, -68, -68];
        this.targets.forEach((target, index) => {
            const card = createRoundedPanel(targetPanel, 198, 90, new Vec3(targetXs[index], targetYs[index], 0), new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 8);
            card.addComponent(Button).transition = Button.Transition.NONE;
            card.on(Node.EventType.TOUCH_END, () => this.node.emit('fishing-target-click', target.id), this);
            const title = createPageLabel(card, '', 15, new Vec3(-12, 22, 0), new Color(44, 44, 44, 255), 164, HorizontalTextAlignment.LEFT);
            const info = createPageLabel(card, '', 13, new Vec3(-12, 0, 0), new Color(88, 88, 88, 255), 164, HorizontalTextAlignment.LEFT);
            const state = createPageLabel(card, '', 13, new Vec3(-12, -24, 0), new Color(110, 98, 70, 255), 164, HorizontalTextAlignment.LEFT);
            this.targetWidgets.set(target.id, { node: card, title, info, state });
        });
        this.hintLabel = createPageLabel(root, '', 16, new Vec3(0, -508, 0), new Color(88, 88, 88, 255), 640);
    }
}
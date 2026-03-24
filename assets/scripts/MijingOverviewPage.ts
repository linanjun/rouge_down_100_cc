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

type DungeonMode = 'normal' | 'elite';

type DungeonCard = {
    id: string;
    label: string;
    state: string;
};

@ccclass('MijingOverviewPage')
export class MijingOverviewPage extends Component {
    @property
    title = '秘境历练';

    @property
    subtitle = '选择目标秘境，累计深度宝箱并在合适时机入场推进。';

    @property
    leftCurrencyValue = '0';

    @property
    rightCurrencyValue = '0';

    @property
    selectedInfo = '当前：练气秘境 | 功法 清心诀 | 灵宠 未出战 | 总层数 100\n优先推进到下一个进度宝箱节点。';

    @property
    chestTitle = '练气秘境 进度宝箱';

    @property
    chestInfo = '历史最深 22/100 层 | 25层奖励：灵石折值+80 修为+24 秘晶+1';

    @property
    enterButtonText = '进入秘境';

    @property
    hintText = '前期建议先刷练气秘境，缺灵石去商城补给，缺战力先回角色、工坊与法器页整备。';

    private shell: CommonPageShell | null = null;
    private selectedInfoLabel: Label | null = null;
    private chestTitleLabel: Label | null = null;
    private chestInfoLabel: Label | null = null;
    private hintLabel: Label | null = null;
    private enterButtonLabel: Label | null = null;
    private modeButtons = new Map<DungeonMode, { node: Node; label: Label }>();
    private dungeonButtons = new Map<string, { node: Node; label: Label }>();
    private chestButtons: Array<{ node: Node; label: Label }> = [];
    private selectedMode: DungeonMode = 'normal';
    private selectedDungeonId = 'qi';
    private dungeons: DungeonCard[] = [
        { id: 'qi', label: '练气秘境 100层', state: '当前境界' },
        { id: 'zhuji', label: '筑基秘境 · 非当前境界', state: '未开放' },
        { id: 'jindan', label: '金丹秘境 · 非当前境界', state: '未开放' },
        { id: 'yuanying', label: '元婴秘境 · 非当前境界', state: '未开放' },
    ];
    private chestStates = ['5层', '10层', '15层', '20层', '25层', '30层', '35层', '40层', '45层', '50层'];

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
        this.shell.selectBottomTab('mijing');
        const root = this.shell.getContentRoot();
        if (!root) return;

        root.removeAllChildren();
        this.modeButtons.clear();
        this.dungeonButtons.clear();
        this.chestButtons = [];

        this.buildLayout(root);
        this.refreshView();
    }

    public setHeaderValues(leftValue: string, rightValue: string) {
        this.leftCurrencyValue = leftValue;
        this.rightCurrencyValue = rightValue;
        this.shell?.setCurrencyValues(leftValue, rightValue);
    }

    public setSummary(selectedInfo: string, chestTitle: string, chestInfo: string, hintText: string) {
        this.selectedInfo = selectedInfo;
        this.chestTitle = chestTitle;
        this.chestInfo = chestInfo;
        this.hintText = hintText;
        this.refreshView();
    }

    public setDungeonState(mode: DungeonMode, selectedDungeonId: string, dungeons: DungeonCard[], chestStates: string[]) {
        this.selectedMode = mode;
        this.selectedDungeonId = selectedDungeonId;
        this.dungeons = dungeons;
        this.chestStates = chestStates;
        this.rebuild();
    }

    private refreshView() {
        if (this.selectedInfoLabel) this.selectedInfoLabel.string = this.selectedInfo;
        if (this.chestTitleLabel) this.chestTitleLabel.string = this.chestTitle;
        if (this.chestInfoLabel) this.chestInfoLabel.string = this.chestInfo;
        if (this.hintLabel) this.hintLabel.string = this.hintText;
        if (this.enterButtonLabel) this.enterButtonLabel.string = this.enterButtonText;

        this.modeButtons.forEach((widget, mode) => {
            const active = mode === this.selectedMode;
            this.paintPanel(widget.node, active ? new Color(60, 74, 96, 255) : new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 6);
            widget.label.color = active ? new Color(246, 244, 236, 255) : new Color(34, 34, 34, 255);
        });

        this.dungeonButtons.forEach((widget, id) => {
            const data = this.dungeons.find((entry) => entry.id === id);
            if (!data) return;
            const active = id === this.selectedDungeonId;
            this.paintPanel(widget.node, active ? new Color(60, 74, 96, 255) : new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 8);
            widget.label.string = data.label;
            widget.label.color = active ? new Color(246, 244, 236, 255) : new Color(34, 34, 34, 255);
        });

        for (let i = 0; i < this.chestButtons.length; i++) {
            const widget = this.chestButtons[i];
            const label = this.chestStates[i] ?? '';
            widget.node.active = !!label;
            widget.label.string = label;
        }
    }

    private buildLayout(root: Node) {
        const dungeonPanel = this.createPanel(root, 648, 264, 0, 192, new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 8);
        const chestPanel = this.createPanel(root, 648, 272, 0, -114, new Color(239, 235, 228, 255), new Color(30, 30, 30, 255), 8);
        const enterButton = this.createPanel(root, 246, 66, 0, -312, new Color(225, 237, 228, 255), new Color(30, 30, 30, 255), 8);
        enterButton.addComponent(Button).transition = Button.Transition.NONE;
        enterButton.on(Node.EventType.TOUCH_END, () => this.node.emit('mijing-enter-click'), this);
        this.enterButtonLabel = this.createLabel(enterButton, '', 30, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 180, HorizontalTextAlignment.CENTER);
        this.hintLabel = this.createLabel(root, '', 17, new Vec3(0, -382, 0), new Color(88, 88, 88, 255), 640, HorizontalTextAlignment.CENTER);

        this.createLabel(dungeonPanel, '选择秘境', 22, new Vec3(-236, 104, 0), new Color(34, 34, 34, 255), 150, HorizontalTextAlignment.LEFT);
        this.createLabel(dungeonPanel, '普通秘境走稳态资源，精英秘境走高压挑战。', 15, new Vec3(48, 104, 0), new Color(88, 88, 88, 255), 420, HorizontalTextAlignment.CENTER);
        this.selectedInfoLabel = this.createLabel(dungeonPanel, '', 16, new Vec3(0, 68, 0), new Color(58, 58, 58, 255), 600, HorizontalTextAlignment.CENTER);
        this.selectedInfoLabel.lineHeight = 20;

        const modeDefs: Array<{ id: DungeonMode; label: string; x: number }> = [
            { id: 'normal', label: '普通秘境', x: -94 },
            { id: 'elite', label: '精英秘境', x: 94 },
        ];
        modeDefs.forEach((entry) => {
            const button = this.createPanel(dungeonPanel, 150, 40, entry.x, 16, new Color(236, 235, 232, 255), new Color(30, 30, 30, 255), 6);
            button.addComponent(Button).transition = Button.Transition.NONE;
            button.on(Node.EventType.TOUCH_END, () => {
                this.selectedMode = entry.id;
                this.node.emit('mijing-mode-click', entry.id);
                this.refreshView();
            }, this);
            const label = this.createLabel(button, entry.label, 18, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 120, HorizontalTextAlignment.CENTER);
            this.modeButtons.set(entry.id, { node: button, label });
        });

        this.dungeons.forEach((entry, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = col === 0 ? -150 : 150;
            const y = row === 0 ? -48 : -118;
            const button = this.createPanel(dungeonPanel, 252, 56, x, y, new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 8);
            button.addComponent(Button).transition = Button.Transition.NONE;
            button.on(Node.EventType.TOUCH_END, () => {
                this.selectedDungeonId = entry.id;
                this.node.emit('mijing-dungeon-click', entry.id);
                this.refreshView();
            }, this);
            const label = this.createLabel(button, entry.label, 19, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 226, HorizontalTextAlignment.CENTER);
            this.dungeonButtons.set(entry.id, { node: button, label });
        });

        this.chestTitleLabel = this.createLabel(chestPanel, '', 22, new Vec3(0, 94, 0), new Color(34, 34, 34, 255), 560, HorizontalTextAlignment.CENTER);
        this.chestInfoLabel = this.createLabel(chestPanel, '', 16, new Vec3(0, 66, 0), new Color(88, 88, 88, 255), 560, HorizontalTextAlignment.CENTER);
        const chestXs = [-220, -110, 0, 110, 220, -220, -110, 0, 110, 220];
        const chestYs = [0, 0, 0, 0, 0, -76, -76, -76, -76, -76];
        for (let i = 0; i < 10; i++) {
            const button = this.createPanel(chestPanel, 92, 50, chestXs[i], chestYs[i], new Color(247, 241, 227, 255), new Color(30, 30, 30, 255), 8);
            button.addComponent(Button).transition = Button.Transition.NONE;
            button.on(Node.EventType.TOUCH_END, () => this.node.emit('mijing-chest-click', i), this);
            const label = this.createLabel(button, '', 15, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 76, HorizontalTextAlignment.CENTER);
            this.chestButtons.push({ node: button, label });
        }
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
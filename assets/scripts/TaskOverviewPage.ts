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

type TaskTab = 'daily' | 'weekly' | 'achievement' | 'mainline';
type TaskRow = { id: string; badge: string; title: string; info: string; reward: string; action: string; active: boolean };

@ccclass('TaskOverviewPage')
export class TaskOverviewPage extends Component {
    @property title = '修行任务簿';
    @property subtitle = '按日常、周常、成就与主线统筹修行节奏。';
    @property leftCurrencyValue = '0';
    @property rightCurrencyValue = '0';

    private shell: CommonPageShell | null = null;
    private currentTab: TaskTab = 'daily';
    private tabButtons = new Map<TaskTab, { node: Node; label: Label }>();
    private rowWidgets: Array<{ node: Node; badge: Label; title: Label; info: Label; reward: Label; action: Label }> = [];
    private rows: TaskRow[] = [
        { id: 'task1', badge: '1', title: '秘境三次', info: '进度 0/3', reward: '奖励: 灵石 +120', action: '未达成', active: false },
        { id: 'task2', badge: '2', title: '商城购买', info: '进度 0/1', reward: '奖励: 修为 +20', action: '未达成', active: false },
        { id: 'task3', badge: '3', title: '法器升级', info: '进度 0/1', reward: '奖励: 徽记 +6', action: '未达成', active: false },
    ];

    onLoad() { this.shell = this.node.getComponent(CommonPageShell) ?? this.node.addComponent(CommonPageShell); }
    start() { this.rebuild(); }

    public rebuild() {
        if (!this.shell) return;
        this.shell.rebuild();
        this.shell.setTitle(this.title, this.subtitle);
        this.shell.setCurrencyValues(this.leftCurrencyValue, this.rightCurrencyValue);
        this.shell.selectShortcut('task');
        const root = this.shell.getContentRoot();
        if (!root) return;
        root.removeAllChildren();
        this.tabButtons.clear();
        this.rowWidgets = [];
        this.buildLayout(root);
        this.refreshView();
    }

    public setHeaderValues(leftValue: string, rightValue: string) { this.leftCurrencyValue = leftValue; this.rightCurrencyValue = rightValue; this.shell?.setCurrencyValues(leftValue, rightValue); }
    public setTab(tab: TaskTab) { this.currentTab = tab; this.refreshView(); }
    public setRows(rows: TaskRow[]) { this.rows = rows; this.refreshView(); }

    private refreshView() {
        this.tabButtons.forEach((widget, tab) => {
            const active = tab === this.currentTab;
            repaintRoundedPanel(widget.node, active ? new Color(66, 82, 104, 255) : new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 6);
            widget.label.color = active ? new Color(246, 244, 236, 255) : new Color(44, 44, 44, 255);
        });
        for (let i = 0; i < this.rowWidgets.length; i++) {
            const data = this.rows[i];
            const widget = this.rowWidgets[i];
            if (!data) continue;
            widget.badge.string = data.badge;
            widget.title.string = data.title;
            widget.info.string = data.info;
            widget.reward.string = data.reward;
            widget.action.string = data.action;
            repaintRoundedPanel(widget.node, data.active ? new Color(66, 82, 104, 255) : new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 8);
        }
    }

    private buildLayout(root: Node) {
        const tabs: Array<{ id: TaskTab; label: string; x: number }> = [
            { id: 'daily', label: '每日任务', x: -210 },
            { id: 'weekly', label: '每周任务', x: -70 },
            { id: 'achievement', label: '成就任务', x: 70 },
            { id: 'mainline', label: '主线任务', x: 210 },
        ];
        tabs.forEach((entry) => {
            const button = createRoundedPanel(root, 126, 40, new Vec3(entry.x, 318, 0), new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 6);
            button.addComponent(Button).transition = Button.Transition.NONE;
            button.on(Node.EventType.TOUCH_END, () => { this.currentTab = entry.id; this.node.emit('task-tab-click', entry.id); this.refreshView(); }, this);
            const label = createPageLabel(button, entry.label, 16, new Vec3(0, 0, 0), new Color(44, 44, 44, 255), 108);
            this.tabButtons.set(entry.id, { node: button, label });
        });
        for (let i = 0; i < 3; i++) {
            const row = createRoundedPanel(root, 592, 156, new Vec3(0, 154 - i * 178, 0), new Color(246, 245, 242, 255), new Color(30, 30, 30, 255), 8);
            const badgePanel = createRoundedPanel(row, 88, 88, new Vec3(-220, 4, 0), new Color(247, 246, 243, 255), new Color(30, 30, 30, 255), 8);
            const badge = createPageLabel(badgePanel, `${i + 1}`, 26, new Vec3(0, 0, 0), new Color(44, 44, 44, 255), 44);
            const title = createPageLabel(row, '', 22, new Vec3(48, 46, 0), new Color(34, 34, 34, 255), 324, HorizontalTextAlignment.LEFT);
            const info = createPageLabel(row, '', 16, new Vec3(48, 10, 0), new Color(88, 88, 88, 255), 336, HorizontalTextAlignment.LEFT);
            const reward = createPageLabel(row, '', 15, new Vec3(48, -28, 0), new Color(96, 84, 52, 255), 336, HorizontalTextAlignment.LEFT);
            const actionBtn = createRoundedPanel(row, 118, 42, new Vec3(212, -24, 0), new Color(247, 246, 243, 255), new Color(30, 30, 30, 255), 6);
            actionBtn.addComponent(Button).transition = Button.Transition.NONE;
            actionBtn.on(Node.EventType.TOUCH_END, () => this.node.emit('task-claim-click', i), this);
            const action = createPageLabel(actionBtn, '', 16, new Vec3(0, 0, 0), new Color(44, 44, 44, 255), 90);
            this.rowWidgets.push({ node: row, badge, title, info, reward, action });
        }
    }
}
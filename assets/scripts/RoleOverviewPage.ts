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

type RoleArtifactSlot = 'sword' | 'talisman' | 'lamp';

@ccclass('RoleOverviewPage')
export class RoleOverviewPage extends Component {
    @property
    title = '角色总览';

    @property
    subtitle = '以本命法器、角色形象与修炼属性为核心的角色页。';

    @property
    leftCurrencyValue = '0';

    @property
    rightCurrencyValue = '0';

    @property
    swordText = '飞剑位 青霜剑 Lv.1';

    @property
    talismanText = '护符位 玄甲符 Lv.1';

    @property
    lampText = '灵灯位 寻宝灯 Lv.1';

    @property
    hpText = '气血: 160';

    @property
    manaText = '法力: 88';

    @property
    actionText = '行动力: 180';

    @property
    progressText = '炼气重: 4/30';

    @property
    alchemyText = '丹师 Lv.1 0/13';

    @property
    forgeText = '炼器 Lv.1 0/13';

    @property
    kungfuText = '清心诀 Lv.1 0/13';

    @property
    petText = '灵宠 Lv.1 0/13';

    @property
    portraitCaption = '灵台打坐';

    @property
    breakthroughLabel = '修炼';

    private shell: CommonPageShell | null = null;
    private contentRoot: Node | null = null;
    private artifactLabels = new Map<RoleArtifactSlot, Label>();
    private statLabels: Label[] = [];
    private progressLabels: Label[] = [];
    private portraitCaptionLabel: Label | null = null;
    private breakthroughButtonLabel: Label | null = null;

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
        this.shell.selectBottomTab('role');
        this.contentRoot = this.shell.getContentRoot();
        if (!this.contentRoot) return;

        this.contentRoot.removeAllChildren();
        this.artifactLabels.clear();
        this.statLabels = [];
        this.progressLabels = [];

        this.buildLayout(this.contentRoot);
        this.refreshView();
    }

    public setCurrencyValues(leftValue: string, rightValue: string) {
        this.leftCurrencyValue = leftValue;
        this.rightCurrencyValue = rightValue;
        this.shell?.setCurrencyValues(leftValue, rightValue);
    }

    public setArtifactTexts(sword: string, talisman: string, lamp: string) {
        this.swordText = sword;
        this.talismanText = talisman;
        this.lampText = lamp;
        this.refreshView();
    }

    public setBasicStats(hp: string, mana: string, action: string, progress: string) {
        this.hpText = hp;
        this.manaText = mana;
        this.actionText = action;
        this.progressText = progress;
        this.refreshView();
    }

    public setPracticeTexts(alchemy: string, forge: string, kungfu: string, pet: string) {
        this.alchemyText = alchemy;
        this.forgeText = forge;
        this.kungfuText = kungfu;
        this.petText = pet;
        this.refreshView();
    }

    public setPortraitCaption(text: string) {
        this.portraitCaption = text;
        if (this.portraitCaptionLabel) this.portraitCaptionLabel.string = text;
    }

    private refreshView() {
        this.artifactLabels.get('sword')!.string = this.swordText;
        this.artifactLabels.get('talisman')!.string = this.talismanText;
        this.artifactLabels.get('lamp')!.string = this.lampText;

        const stats = [this.hpText, this.manaText, this.actionText, this.progressText];
        for (let i = 0; i < this.statLabels.length; i++) {
            this.statLabels[i].string = stats[i] ?? '';
        }

        const practice = [this.alchemyText, this.forgeText, this.kungfuText, this.petText];
        for (let i = 0; i < this.progressLabels.length; i++) {
            this.progressLabels[i].string = practice[i] ?? '';
        }

        if (this.portraitCaptionLabel) this.portraitCaptionLabel.string = this.portraitCaption;
        if (this.breakthroughButtonLabel) this.breakthroughButtonLabel.string = this.breakthroughLabel;
    }

    private buildLayout(root: Node) {
        const upperCard = this.createPanel(root, 648, 420, 0, 126, new Color(236, 235, 232, 255), new Color(26, 26, 26, 255), 6);
        const lowerLeftCard = this.createPanel(root, 296, 186, -176, -194, new Color(238, 237, 234, 255), new Color(26, 26, 26, 255), 6);
        const lowerRightCard = this.createPanel(root, 296, 186, 176, -194, new Color(238, 237, 234, 255), new Color(26, 26, 26, 255), 6);

        this.createLabel(upperCard, '本命法器', 18, new Vec3(-180, 168, 0), new Color(38, 38, 38, 255), 160, HorizontalTextAlignment.CENTER);
        this.createLabel(upperCard, '角色形象', 18, new Vec3(158, 168, 0), new Color(38, 38, 38, 255), 160, HorizontalTextAlignment.CENTER);

        this.buildArtifactSlot(upperCard, 'sword', '剑', new Vec3(-184, 84, 0));
        this.buildArtifactSlot(upperCard, 'talisman', '符', new Vec3(-184, 18, 0));
        this.buildArtifactSlot(upperCard, 'lamp', '灯', new Vec3(-184, -48, 0));

        this.buildPortraitCard(upperCard, new Vec3(152, -6, 0));

        this.createLabel(lowerLeftCard, '基础属性', 16, new Vec3(0, 68, 0), new Color(38, 38, 38, 255), 132, HorizontalTextAlignment.CENTER);
        this.statLabels.push(this.createStatLine(lowerLeftCard, new Vec3(-84, 28, 0), 180));
        this.statLabels.push(this.createStatLine(lowerLeftCard, new Vec3(-84, -2, 0), 180));
        this.statLabels.push(this.createStatLine(lowerLeftCard, new Vec3(-84, -32, 0), 180));
        this.statLabels.push(this.createStatLine(lowerLeftCard, new Vec3(-84, -62, 0), 180));

        const miniButton = this.createPanel(lowerLeftCard, 78, 34, 0, -112, new Color(246, 245, 242, 255), new Color(26, 26, 26, 255), 4);
        miniButton.addComponent(Button).transition = Button.Transition.NONE;
        miniButton.on(Node.EventType.TOUCH_END, () => this.node.emit('role-breakthrough-click'), this);
        this.breakthroughButtonLabel = this.createLabel(miniButton, this.breakthroughLabel, 15, new Vec3(0, 0, 0), new Color(34, 34, 34, 255), 70, HorizontalTextAlignment.CENTER);

        this.createLabel(lowerRightCard, '功法进境', 16, new Vec3(-82, 68, 0), new Color(38, 38, 38, 255), 180, HorizontalTextAlignment.LEFT);
        this.progressLabels.push(this.createStatLine(lowerRightCard, new Vec3(-98, 28, 0), 210));
        this.progressLabels.push(this.createStatLine(lowerRightCard, new Vec3(-98, -2, 0), 210));
        this.progressLabels.push(this.createStatLine(lowerRightCard, new Vec3(-98, -32, 0), 210));
        this.progressLabels.push(this.createStatLine(lowerRightCard, new Vec3(-98, -62, 0), 210));
    }

    private buildArtifactSlot(parent: Node, slot: RoleArtifactSlot, glyph: string, position: Vec3) {
        const slotNode = this.createPanel(parent, 228, 48, position.x, position.y, new Color(246, 245, 242, 255), new Color(26, 26, 26, 255), 4);
        slotNode.addComponent(Button).transition = Button.Transition.NONE;
        slotNode.on(Node.EventType.TOUCH_END, () => this.node.emit('role-artifact-click', slot), this);

        const iconNode = this.createPanel(slotNode, 26, 26, -88, 0, new Color(228, 227, 222, 255), new Color(30, 30, 30, 255), 4);
        this.createLabel(iconNode, glyph, 14, new Vec3(0, 0, 0), new Color(44, 44, 44, 255), 20, HorizontalTextAlignment.CENTER);

        const label = this.createLabel(slotNode, '', 16, new Vec3(-64, 0, 0), new Color(34, 34, 34, 255), 154, HorizontalTextAlignment.LEFT);
        this.artifactLabels.set(slot, label);
    }

    private buildPortraitCard(parent: Node, position: Vec3) {
        const portraitFrame = this.createPanel(parent, 236, 304, position.x, position.y, new Color(245, 244, 241, 255), new Color(26, 26, 26, 255), 2);
        this.drawPortraitTexture(portraitFrame, 212, 280);

        const figureRoot = new Node('FigureRoot');
        figureRoot.layer = Layers.Enum.UI_2D;
        portraitFrame.addChild(figureRoot);
        figureRoot.setPosition(0, 8, 0);
        figureRoot.addComponent(UITransform).setContentSize(180, 240);

        const aura = figureRoot.addComponent(Graphics);
        aura.strokeColor = new Color(76, 76, 76, 210);
        aura.fillColor = new Color(180, 180, 180, 18);
        aura.lineWidth = 1.5;
        aura.circle(0, 40, 50);
        aura.fill();
        aura.stroke();
        aura.ellipse(0, -70, 56, 14);
        aura.stroke();

        const figure = new Node('Figure');
        figure.layer = Layers.Enum.UI_2D;
        figureRoot.addChild(figure);
        figure.addComponent(UITransform).setContentSize(120, 170);
        figure.setPosition(0, -2, 0);
        const fg = figure.addComponent(Graphics);
        fg.strokeColor = new Color(32, 32, 32, 255);
        fg.fillColor = new Color(220, 220, 220, 72);
        fg.lineWidth = 2;
        fg.circle(0, 46, 18);
        fg.fill();
        fg.stroke();
        fg.moveTo(0, 26);
        fg.lineTo(0, -32);
        fg.moveTo(-24, 4);
        fg.lineTo(0, 18);
        fg.lineTo(24, 4);
        fg.moveTo(-18, -44);
        fg.lineTo(0, -16);
        fg.lineTo(18, -44);
        fg.stroke();
        fg.moveTo(-28, -52);
        fg.quadraticCurveTo(0, -78, 28, -52);
        fg.stroke();

        this.portraitCaptionLabel = this.createLabel(parent, this.portraitCaption, 16, new Vec3(position.x, -172, 0), new Color(34, 34, 34, 255), 160, HorizontalTextAlignment.CENTER);
    }

    private drawPortraitTexture(parent: Node, width: number, height: number) {
        const textureNode = new Node('PortraitTexture');
        textureNode.layer = Layers.Enum.UI_2D;
        parent.addChild(textureNode);
        textureNode.setPosition(0, 0, 0);
        textureNode.addComponent(UITransform).setContentSize(width, height);
        const graphics = textureNode.addComponent(Graphics);
        graphics.fillColor = new Color(248, 247, 244, 255);
        graphics.rect(-width / 2, -height / 2, width, height);
        graphics.fill();
        graphics.strokeColor = new Color(80, 80, 80, 120);
        graphics.lineWidth = 1;
        for (let x = -width / 2 + 8; x <= width / 2 - 8; x += 10) {
            for (let y = -height / 2 + 8; y <= height / 2 - 8; y += 10) {
                graphics.circle(x, y, 0.8);
                graphics.fill();
            }
        }
    }

    private createStatLine(parent: Node, position: Vec3, width: number) {
        return this.createLabel(parent, '', 16, position, new Color(34, 34, 34, 255), width, HorizontalTextAlignment.LEFT);
    }

    private createPanel(parent: Node, width: number, height: number, x: number, y: number, fill: Color, stroke: Color, radius: number) {
        const panel = new Node('Panel');
        panel.layer = Layers.Enum.UI_2D;
        parent.addChild(panel);
        panel.setPosition(x, y, 0);
        panel.addComponent(UITransform).setContentSize(width, height);
        const graphics = panel.addComponent(Graphics);
        graphics.fillColor = fill;
        graphics.strokeColor = stroke;
        graphics.lineWidth = 2;
        if (radius > 0) {
            graphics.roundRect(-width / 2, -height / 2, width, height, radius);
            graphics.fill();
            graphics.roundRect(-width / 2, -height / 2, width, height, radius);
            graphics.stroke();
        } else {
            graphics.rect(-width / 2, -height / 2, width, height);
            graphics.fill();
            graphics.rect(-width / 2, -height / 2, width, height);
            graphics.stroke();
        }
        return panel;
    }

    private createLabel(
        parent: Node,
        text: string,
        fontSize: number,
        position: Vec3,
        color: Color,
        width: number,
        align: HorizontalTextAlignment,
    ) {
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
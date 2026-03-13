/**
 * 洞府养成 + 是仙人就下100层 Demo（修仙题材，带骨骼动画）
 * 局外：洞府养成；局内：每层3个？格子，点击揭示灵植/灵石/天材地宝/怪物/陷阱/buff，每5层可撤，每10层Boss
 */
import {
    _decorator,
    Color,
    Component,
    Director,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Layers,
    Node,
    ResolutionPolicy,
    UITransform,
    Vec3,
    director,
    find,
    view,
} from 'cc';

const { ccclass } = _decorator;

const DESIGN_WIDTH = 720;
const DESIGN_HEIGHT = 1280;
const HALF_WIDTH = DESIGN_WIDTH * 0.5;
const HALF_HEIGHT = DESIGN_HEIGHT * 0.5;

type GameState = 'home' | 'expedition_path' | 'combat' | 'result';

/** 格子类型：点击？后揭示 */
type SlotType = 'herb' | 'stone' | 'treasure' | 'monster' | 'trap' | 'buff' | 'boss';

interface LayerSlot {
    type: SlotType;
    revealed: boolean;
    /** 怪物/ Boss 已击败 */
    defeated?: boolean;
}

interface BoneLimb {
    node: Node;
    gfx: Graphics;
    length: number;
}

interface CharacterRig {
    root: Node;
    body: BoneLimb;
    head: BoneLimb;
    armL: BoneLimb;
    armR: BoneLimb;
    legL: BoneLimb;
    legR: BoneLimb;
}

interface EnemyData {
    node: Node;
    rig: CharacterRig | null;
    hp: number;
    maxHp: number;
    damage: number;
    radius: number;
    speed: number;
}

@ccclass('GrottoExpeditionDemo')
export class GrottoExpeditionDemo extends Component {
    private state: GameState = 'home';

    private homeLayer!: Node;
    private expeditionLayer!: Node;
    private combatLayer!: Node;
    private resultLayer!: Node;

    private spiritStone = 0;
    private realmLevel = 1;
    private realmExp = 0;
    private realmExpNeed = 30;

    private currentLayer = 1;
    private currentLayerSlots: LayerSlot[] = [];
    private expeditionSpirit = 0;
    private expeditionHerbs = 0;
    private expeditionTreasure = 0;
    private buffAtkPercent = 0;
    private combatSlotIndex = -1;
    private combatIsBoss = false;
    /** 本局是否已击败过 Boss，用于触发安全撤离（100% 带走） */
    private canSafeWithdraw = false;

    private playerNode!: Node;
    private playerRig: CharacterRig | null = null;
    private playerHp = 100;
    private playerMaxHp = 100;
    private playerDamage = 18;
    private playerRadius = 20;
    private attackCooldown = 0;
    private attackAnimTimer = 0;

    private enemies: EnemyData[] = [];
    private combatElapsed = 0;
    private lastCombatPlayerHp = 100;
    private combatDamageFloatCooldown = 0;

    private statusLabel!: Label;
    private hintLabel!: Label;
    private combatHpLabel!: Label;
    private resultLabel!: Label;

    onLoad() {
        view.setDesignResolutionSize(DESIGN_WIDTH, DESIGN_HEIGHT, ResolutionPolicy.SHOW_ALL);
        this.node.layer = Layers.Enum.UI_2D;
        const rootTransform = this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        rootTransform.setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
        this.buildLayers();
        this.enterHome();
    }

    private buildLayers() {
        this.drawBg();
        this.homeLayer = this.createFullLayer('Home');
        this.expeditionLayer = this.createFullLayer('Expedition');
        this.combatLayer = this.createFullLayer('Combat');
        this.resultLayer = this.createFullLayer('Result');

        this.expeditionLayer.active = false;
        this.combatLayer.active = false;
        this.resultLayer.active = false;

        this.buildHomeUI();
        this.buildExpeditionUI();
        this.buildCombatUI();
        this.buildResultUI();
    }

    private drawBg() {
        const bg = new Node('Bg');
        bg.layer = Layers.Enum.UI_2D;
        this.node.addChild(bg);
        bg.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
        const g = bg.addComponent(Graphics);
        g.fillColor = new Color(22, 22, 28, 255);
        g.rect(-HALF_WIDTH, -HALF_HEIGHT, DESIGN_WIDTH, DESIGN_HEIGHT);
        g.fill();
        g.fillColor = new Color(35, 38, 45, 255);
        g.rect(-HALF_WIDTH + 20, -HALF_HEIGHT + 20, DESIGN_WIDTH - 40, DESIGN_HEIGHT - 40);
        g.fill();
    }

    private buildHomeUI() {
        const title = this.createPanel(this.homeLayer, 600, 160, 0, 480);
        this.createLabel(title, '洞府', 52, new Vec3(0, 20, 0), new Color(220, 220, 230, 255));
        this.createLabel(title, '是仙人就下100层', 24, new Vec3(0, -35, 0), new Color(160, 180, 200, 255));

        const stat = this.createPanel(this.homeLayer, 560, 120, 0, 320);
        this.statusLabel = this.createLabel(stat, '', 26, new Vec3(0, 20, 0), new Color(255, 240, 220, 255), 520);
        this.createLabel(stat, '境界提升可增加生命与攻击', 20, new Vec3(0, -35, 0), new Color(140, 160, 180, 255), 520);

        const realmBtn = this.createPanel(this.homeLayer, 240, 70, 0, 180, new Color(50, 55, 65, 255));
        this.createLabel(realmBtn, '修炼突破', 28, new Vec3(0, 0, 0), new Color(200, 230, 255, 255));
        realmBtn.on(Node.EventType.TOUCH_END, () => this.tryRealmUp(), this);

        const goBtn = this.createPanel(this.homeLayer, 320, 90, 0, -200, new Color(45, 70, 60, 255));
        this.createLabel(goBtn, '进入秘境', 36, new Vec3(0, 0, 0), new Color(180, 255, 220, 255));
        goBtn.on(Node.EventType.TOUCH_END, () => this.startExpedition(), this);

        this.hintLabel = this.createLabel(this.homeLayer, '每层3个？格子，每5层可撤出，每10层Boss', 20, new Vec3(0, -420, 0), new Color(120, 140, 160, 255), 600);
    }

    private expeditionResLabel!: Label;
    private expeditionLayerLabel!: Label;
    private expeditionHpLabel!: Label;
    private slotContainer!: Node;
    private nextLayerBtn!: Node;
    private nextLayerBtnLabel!: Label;
    private withdrawBtn!: Node;
    private withdrawBtnLabel!: Label;

    private buildExpeditionUI() {
        const top = this.createPanel(this.expeditionLayer, 640, 100, 0, 560);
        top.name = 'Top';
        this.expeditionLayerLabel = this.createLabel(top, '第 1 层', 28, new Vec3(-200, 18, 0), new Color(255, 248, 230, 255));
        this.expeditionHpLabel = this.createLabel(top, '生命 100/100', 24, new Vec3(200, 18, 0), new Color(255, 200, 180, 255));
        this.expeditionResLabel = this.createLabel(top, '灵石 0 | 灵药 0 | 天材地宝 0', 20, new Vec3(0, -28, 0), new Color(180, 220, 200, 255), 580);

        this.slotContainer = new Node('SlotContainer');
        this.slotContainer.layer = Layers.Enum.UI_2D;
        this.expeditionLayer.addChild(this.slotContainer);
        this.slotContainer.setPosition(0, 80, 0);
        this.slotContainer.addComponent(UITransform).setContentSize(640, 340);

        this.nextLayerBtn = this.createPanel(this.expeditionLayer, 220, 56, 0, -220, new Color(55, 75, 65, 255));
        this.nextLayerBtnLabel = this.createLabel(this.nextLayerBtn, '至少开启1格', 24, new Vec3(0, 0, 0), new Color(150, 150, 150, 255));
        this.nextLayerBtn.on(Node.EventType.TOUCH_END, () => this.goNextLayer(), this);

        this.withdrawBtn = this.createPanel(this.expeditionLayer, 240, 56, 0, -300, new Color(65, 55, 70, 255));
        this.withdrawBtnLabel = this.createLabel(this.withdrawBtn, '紧急撤离', 24, new Vec3(0, 0, 0), new Color(255, 220, 200, 255));
        this.withdrawBtn.on(Node.EventType.TOUCH_END, () => this.withdrawExpedition(), this);
    }

    private buildCombatUI() {
        const top = this.createPanel(this.combatLayer, 640, 70, 0, 560);
        this.combatHpLabel = this.createLabel(top, '生命 100/100', 26, new Vec3(0, 0, 0), new Color(255, 220, 200, 255));

        const skillBtn = this.createPanel(this.combatLayer, 140, 50, 260, -520, new Color(60, 70, 85, 255));
        this.createLabel(skillBtn, '符咒', 22, new Vec3(0, 0, 0), new Color(200, 240, 255, 255));
        skillBtn.on(Node.EventType.TOUCH_END, () => this.castSkill(), this);
    }

    private buildResultUI() {
        const panel = this.createPanel(this.resultLayer, 520, 360, 0, 0);
        this.resultLabel = this.createLabel(panel, '', 32, new Vec3(0, 100, 0), new Color(255, 248, 220, 255), 460);
        this.createLabel(panel, '本局收获', 24, new Vec3(0, 40, 0), new Color(200, 220, 240, 255));
        const backBtn = this.createPanel(this.resultLayer, 220, 60, 0, -140, new Color(50, 65, 75, 255));
        this.createLabel(backBtn, '返回洞府', 28, new Vec3(0, 0, 0), new Color(255, 255, 255, 255));
        backBtn.on(Node.EventType.TOUCH_END, () => this.enterHome(), this);
    }

    private enterHome() {
        this.state = 'home';
        this.homeLayer.active = true;
        this.expeditionLayer.active = false;
        this.combatLayer.active = false;
        this.resultLayer.active = false;
        this.refreshHomeStatus();
    }

    private refreshHomeStatus() {
        this.statusLabel.string = `境界 ${this.realmLevel} 层 | 灵石 ${this.spiritStone} | 修为 ${this.realmExp}/${this.realmExpNeed}`;
    }

    private tryRealmUp() {
        if (this.realmExp < this.realmExpNeed) {
            this.hintLabel.string = `修为不足，需 ${this.realmExpNeed}。进入秘境战斗可获得修为。`;
            return;
        }
        this.realmExp -= this.realmExpNeed;
        this.realmLevel += 1;
        this.realmExpNeed = 30 + this.realmLevel * 15;
        this.playerMaxHp = 80 + this.realmLevel * 25;
        this.playerDamage = 12 + this.realmLevel * 6;
        this.hintLabel.string = '突破成功，生命与攻击提升';
        this.refreshHomeStatus();
    }

    private startExpedition() {
        this.state = 'expedition_path';
        this.homeLayer.active = false;
        this.expeditionLayer.active = true;
        this.combatLayer.active = false;
        this.resultLayer.active = false;

        this.currentLayer = 1;
        this.expeditionSpirit = 0;
        this.expeditionHerbs = 0;
        this.expeditionTreasure = 0;
        this.buffAtkPercent = 0;
        this.canSafeWithdraw = false;
        this.playerHp = this.playerMaxHp;
        this.currentLayerSlots = this.generateLayerSlots(this.currentLayer);
        this.refreshLayerUI();
    }

    /** 每层 3 个格子，完全随机（可全怪/全机缘）；每 10 层必有一个 boss，其余 2 格随机 */
    private generateLayerSlots(layer: number): LayerSlot[] {
        const isBossLayer = layer >= 10 && layer % 10 === 0;
        const pool: SlotType[] = ['herb', 'stone', 'treasure', 'monster', 'trap', 'buff'];
        const slots: LayerSlot[] = [];
        if (isBossLayer) {
            slots.push({ type: 'boss', revealed: false });
            for (let i = 0; i < 2; i++) {
                slots.push({ type: pool[Math.floor(Math.random() * pool.length)], revealed: false });
            }
        } else {
            for (let i = 0; i < 3; i++) {
                slots.push({ type: pool[Math.floor(Math.random() * pool.length)], revealed: false });
            }
        }
        return slots;
    }

    private getSlotTypeName(type: SlotType): string {
        const names: Record<SlotType, string> = {
            herb: '灵植',
            stone: '灵石',
            treasure: '天材地宝',
            monster: '妖兽',
            trap: '陷阱',
            buff: '机缘',
            boss: 'Boss',
        };
        return names[type];
    }

    private refreshLayerUI() {
        this.expeditionLayerLabel.string = `第 ${this.currentLayer} 层`;
        if (this.expeditionHpLabel)
            this.expeditionHpLabel.string = `生命 ${Math.ceil(this.playerHp)}/${this.playerMaxHp}`;
        this.expeditionResLabel.string = `灵石 ${this.expeditionSpirit} | 灵药 ${this.expeditionHerbs} | 天材地宝 ${this.expeditionTreasure}${this.buffAtkPercent > 0 ? ' | 攻+' + (this.buffAtkPercent * 100) + '%' : ''}`;

        this.slotContainer.removeAllChildren();
        const positions = [-200, 0, 200];
        this.currentLayerSlots.forEach((slot, i) => {
            const panel = this.createPanel(this.slotContainer, 160, 180, positions[i], 0, new Color(38, 48, 58, 250));
            const label = this.createLabel(panel, slot.revealed ? (slot.defeated ? '已击败' : this.getSlotTypeName(slot.type)) : '？', 24, new Vec3(0, 0, 0), slot.revealed ? new Color(200, 220, 240, 255) : new Color(255, 240, 180, 255));
            if (!slot.revealed) {
                panel.on(Node.EventType.TOUCH_END, () => this.onSlotTap(i), this);
            }
        });

        const atLeastOneRevealed = this.currentLayerSlots.some((s) => s.revealed);
        if (this.nextLayerBtnLabel) {
            this.nextLayerBtnLabel.string = atLeastOneRevealed ? '下一层' : '至少开启1格';
            this.nextLayerBtnLabel.color = atLeastOneRevealed ? new Color(200, 255, 220, 255) : new Color(150, 150, 150, 255);
        }

        this.withdrawBtn.active = true;
        if (this.withdrawBtnLabel) {
            if (this.canSafeWithdraw) {
                this.withdrawBtnLabel.string = '安全撤离(100%)';
                this.withdrawBtnLabel.color = new Color(180, 255, 180, 255);
            } else {
                const ratioPct = 50 + (this.currentLayer - 1) * 0.5;
                this.withdrawBtnLabel.string = `紧急撤离(${ratioPct.toFixed(0)}%)`;
                this.withdrawBtnLabel.color = new Color(255, 220, 200, 255);
            }
        }
    }

    private onSlotTap(index: number) {
        const slot = this.currentLayerSlots[index];
        if (!slot || slot.revealed) return;
        slot.revealed = true;

        if (slot.type === 'monster' || slot.type === 'boss') {
            this.combatSlotIndex = index;
            this.combatIsBoss = slot.type === 'boss';
            this.enterCombat();
            return;
        }

        this.resolveSlot(slot);
        this.refreshLayerUI();
    }

    private resolveSlot(slot: LayerSlot) {
        const layer = this.currentLayer;
        switch (slot.type) {
            case 'herb':
                this.expeditionHerbs += 2 + Math.floor(layer / 5);
                break;
            case 'stone':
                this.expeditionSpirit += 5 + Math.floor(layer / 3);
                break;
            case 'treasure':
                this.expeditionSpirit += 15 + layer * 2;
                this.expeditionHerbs += 3 + Math.floor(layer / 5);
                this.expeditionTreasure += 1;
                break;
            case 'trap': {
                const trapDmg = 12 + layer * 2;
                this.playerHp = Math.max(0, this.playerHp - trapDmg);
                this.showFloatingDamage(this.expeditionLayer, trapDmg, 0, 0);
                if (this.playerHp <= 0) {
                    this.endExpeditionDeath();
                    return;
                }
                break;
            }
            case 'buff':
                this.buffAtkPercent += 0.15;
                break;
            default:
                break;
        }
    }

    private goNextLayer() {
        if (!this.currentLayerSlots.some((s) => s.revealed)) return;
        this.currentLayer += 1;
        if (this.currentLayer > 100) {
            this.endExpedition(true);
            return;
        }
        this.currentLayerSlots = this.generateLayerSlots(this.currentLayer);
        this.refreshLayerUI();
    }

    private withdrawExpedition() {
        this.endExpeditionWithdraw(this.canSafeWithdraw);
    }

    /** 撤离：安全撤离 100%；否则按 50% + 每层 0.5% 带走资源 */
    private endExpeditionWithdraw(safe: boolean) {
        this.state = 'result';
        this.expeditionLayer.active = false;
        this.resultLayer.active = true;

        const ratio = safe ? 1 : Math.min(1, 0.5 + (this.currentLayer - 1) * 0.005);
        const takeSpirit = Math.floor(this.expeditionSpirit * ratio);
        const takeHerbs = Math.floor(this.expeditionHerbs * ratio);
        const takeTreasure = Math.floor(this.expeditionTreasure * ratio);
        const expBase = this.expeditionHerbs * 5 + this.expeditionTreasure * 20;
        const takeExp = Math.floor(expBase * ratio);

        this.spiritStone += takeSpirit;
        this.realmExp += takeExp;

        const ratioPct = (ratio * 100).toFixed(0);
        this.resultLabel.string = safe
            ? `安全撤离（击败Boss）\n抵达第 ${this.currentLayer} 层\n带走灵石 ${takeSpirit}，灵药 ${takeHerbs}，天材地宝 ${takeTreasure}\n修为 +${takeExp}`
            : `紧急撤离（带走 ${ratioPct}%）\n抵达第 ${this.currentLayer} 层\n带走灵石 ${takeSpirit}，灵药 ${takeHerbs}，天材地宝 ${takeTreasure}\n修为 +${takeExp}`;
        this.canSafeWithdraw = false;
    }

    private endExpedition(reachedExit: boolean) {
        this.state = 'result';
        this.expeditionLayer.active = false;
        this.resultLayer.active = true;
        this.spiritStone += this.expeditionSpirit;
        const expGain = this.expeditionHerbs * 5 + this.expeditionTreasure * 20 + (reachedExit ? 50 : 0);
        this.realmExp += expGain;
        this.resultLabel.string = `抵达第 ${this.currentLayer} 层\n获得灵石 ${this.expeditionSpirit}，灵药 ${this.expeditionHerbs}，天材地宝 ${this.expeditionTreasure}\n修为 +${expGain}\n${reachedExit ? '通关百层！' : '已撤出秘境'}`;
    }

    private endExpeditionDeath() {
        this.state = 'result';
        this.expeditionLayer.active = false;
        this.resultLayer.active = true;
        this.spiritStone += Math.floor(this.expeditionSpirit * 0.5);
        this.realmExp += Math.floor((this.expeditionHerbs * 5 + this.expeditionTreasure * 20) * 0.3);
        this.resultLabel.string = `神识受损，撤回避难洞府\n抵达第 ${this.currentLayer} 层\n损失部分收获：灵石 ${Math.floor(this.expeditionSpirit * 0.5)}，修为 +${Math.floor((this.expeditionHerbs * 5 + this.expeditionTreasure * 20) * 0.3)}`;
    }

    private enterCombat() {
        this.state = 'combat';
        this.expeditionLayer.active = false;
        this.combatLayer.active = true;
        this.combatElapsed = 0;
        this.attackCooldown = 0;
        this.attackAnimTimer = 0;
        this.lastCombatPlayerHp = this.playerHp;
        this.combatLayer.removeAllChildren();
        this.drawCombatField();
        this.spawnPlayer();
        this.spawnEnemies();
        this.buildCombatUI();
        this.updateCombatHud();
    }

    private drawCombatField() {
        const field = new Node('Field');
        field.layer = Layers.Enum.UI_2D;
        this.combatLayer.addChild(field);
        field.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
        const g = field.addComponent(Graphics);
        g.fillColor = new Color(28, 32, 38, 255);
        g.rect(-HALF_WIDTH, -HALF_HEIGHT, DESIGN_WIDTH, DESIGN_HEIGHT);
        g.fill();
        g.strokeColor = new Color(60, 70, 85, 200);
        g.lineWidth = 2;
        g.rect(-320, -400, 640, 700);
        g.stroke();
    }

    private spawnPlayer() {
        this.playerNode = new Node('Player');
        this.playerNode.layer = Layers.Enum.UI_2D;
        this.combatLayer.addChild(this.playerNode);
        this.playerNode.setPosition(-180, -180, 0);
        this.playerNode.addComponent(UITransform).setContentSize(50, 50);
        this.playerRig = this.createCharacterRig(this.playerNode, new Color(90, 100, 120, 255), new Color(200, 210, 230, 255));
    }

    private spawnEnemies() {
        this.enemies = [];
        const isBoss = this.combatIsBoss;
        const count = isBoss ? 1 : 1 + (this.realmLevel > 2 ? 1 : 0);
        const layer = this.currentLayer;
        for (let i = 0; i < count; i++) {
            const en = new Node(isBoss ? 'Boss' : `Enemy_${i}`);
            en.layer = Layers.Enum.UI_2D;
            this.combatLayer.addChild(en);
            en.setPosition(160 + i * 120, -120 + i * 40, 0);
            en.addComponent(UITransform).setContentSize(isBoss ? 56 : 44, isBoss ? 56 : 44);
            const rig = this.createCharacterRig(en, new Color(100, 60, 60, 255), new Color(220, 120, 100, 255));
            const baseHp = isBoss ? 180 + layer * 8 : 40 + this.realmLevel * 10 + Math.floor(layer / 3) * 6;
            const baseDmg = isBoss ? 14 + Math.floor(layer / 5) * 2 : 8 + this.realmLevel * 2;
            this.enemies.push({
                node: en,
                rig,
                hp: baseHp,
                maxHp: baseHp,
                damage: baseDmg,
                radius: isBoss ? 26 : 18,
                speed: isBoss ? 55 : 70,
            });
        }
    }

    private createCharacterRig(parent: Node, bodyColor: Color, accentColor: Color): CharacterRig {
        const root = new Node('Rig');
        root.layer = Layers.Enum.UI_2D;
        parent.addChild(root);
        root.setPosition(0, 4, 0);
        const body = this.createBoneLimb(root, 36, 14, bodyColor, new Vec3(0, 8, 0));
        const head = this.createBoneLimb(body.node, 20, 16, accentColor, new Vec3(0, body.length + 4, 0));
        const armL = this.createBoneLimb(body.node, 24, 8, bodyColor, new Vec3(-12, 22, 0), -0.3);
        const armR = this.createBoneLimb(body.node, 24, 8, bodyColor, new Vec3(12, 22, 0), 0.3);
        const legL = this.createBoneLimb(root, 28, 10, bodyColor, new Vec3(-8, -4, 0), -0.1);
        const legR = this.createBoneLimb(root, 28, 10, bodyColor, new Vec3(8, -4, 0), 0.1);
        return { root, body, head, armL, armR, legL, legR };
    }

    private createBoneLimb(
        parent: Node,
        length: number,
        width: number,
        fill: Color,
        pos = new Vec3(),
        rotation = 0
    ): BoneLimb {
        const node = new Node('Limb');
        node.layer = Layers.Enum.UI_2D;
        parent.addChild(node);
        node.setPosition(pos);
        node.angle = (rotation * 180) / Math.PI;
        node.addComponent(UITransform).setContentSize(width * 2 + 8, length + 16);
        const gfx = node.addComponent(Graphics);
        gfx.fillColor = fill;
        gfx.roundRect(-width * 0.5, -length, width, length, width * 0.4);
        gfx.fill();
        gfx.strokeColor = new Color(
            Math.min(fill.r + 50, 255),
            Math.min(fill.g + 50, 255),
            Math.min(fill.b + 50, 255),
            200
        );
        gfx.lineWidth = 2;
        gfx.roundRect(-width * 0.5, -length, width, length, width * 0.4);
        gfx.stroke();
        return { node, gfx, length };
    }

    update(dt: number) {
        if (this.state !== 'combat') return;
        this.combatElapsed += dt;
        this.attackCooldown = Math.max(0, this.attackCooldown - dt);
        this.attackAnimTimer = Math.max(0, this.attackAnimTimer - dt);
        this.combatDamageFloatCooldown = Math.max(0, this.combatDamageFloatCooldown - dt);

        this.updateCombat(dt);
        this.animatePlayerRig(dt);
        this.animateEnemyRigs(dt);
        this.updateCombatHud();
    }

    private updateCombat(dt: number) {
        const oldHp = this.playerHp;
        const playerPos = this.playerNode.position;
        for (const enemy of this.enemies) {
            const dir = playerPos.clone().subtract(enemy.node.position);
            const dist = dir.length();
            if (dist > 0.01) {
                dir.normalize();
                const pos = enemy.node.position.clone();
                pos.x += dir.x * enemy.speed * dt;
                pos.y += dir.y * enemy.speed * dt;
                enemy.node.setPosition(pos);
            }
            if (dist <= this.playerRadius + enemy.radius) {
                this.playerHp -= enemy.damage * dt;
                if (this.playerHp <= 0) {
                    this.playerHp = 0;
                    const dmg = Math.ceil(oldHp - this.playerHp);
                    if (dmg > 0) this.showFloatingDamage(this.combatLayer, dmg, this.playerNode.position.x, this.playerNode.position.y + 50);
                    this.endCombatPlayerDeath();
                    return;
                }
            }
        }
        if (this.playerHp < oldHp && this.combatDamageFloatCooldown <= 0) {
            const dmg = Math.ceil(oldHp - this.playerHp);
            if (dmg >= 1) {
                this.showFloatingDamage(this.combatLayer, dmg, this.playerNode.position.x, this.playerNode.position.y + 50);
                this.combatDamageFloatCooldown = 0.35;
            }
        }
        this.lastCombatPlayerHp = this.playerHp;

        const atk = this.playerDamage * (1 + this.buffAtkPercent);
        if (this.attackCooldown <= 0) {
            let hit = false;
            for (const enemy of this.enemies) {
                const d = enemy.node.position.clone().subtract(playerPos).length();
                if (d <= 90) {
                    enemy.hp -= atk;
                    hit = true;
                    if (enemy.hp <= 0) {
                        enemy.node.destroy();
                        this.enemies = this.enemies.filter((e) => e !== enemy);
                    }
                    break;
                }
            }
            if (hit) {
                this.attackCooldown = 0.6;
                this.attackAnimTimer = 0.15;
            }
        }

        if (this.enemies.length === 0) {
            this.endCombat(true);
        }
    }

    private animatePlayerRig(dt: number) {
        if (!this.playerRig) return;
        const r = this.playerRig;
        const t = this.combatElapsed * 6;
        const idle = Math.sin(t) * 0.06;
        const attack = this.attackAnimTimer > 0 ? 1 : 0;
        r.root.angle = idle * 8;
        r.body.node.angle = idle * 6;
        r.head.node.angle = -idle * 4;
        r.armL.node.angle = -0.35 + idle * 0.1 - attack * 0.8;
        r.armR.node.angle = 0.35 - idle * 0.1 + attack * 0.9;
        r.legL.node.angle = 0.12 + idle * 0.15;
        r.legR.node.angle = -0.12 - idle * 0.15;
    }

    private animateEnemyRigs(dt: number) {
        const t = this.combatElapsed * 8;
        const run = Math.sin(t) * 0.12;
        for (const e of this.enemies) {
            if (!e.rig) continue;
            const r = e.rig;
            r.root.angle = run * 6;
            r.body.node.angle = run * 8;
            r.head.node.angle = -run * 4;
            r.armL.node.angle = -0.4 - run;
            r.armR.node.angle = 0.4 + run;
            r.legL.node.angle = -0.2 - run * 1.2;
            r.legR.node.angle = 0.2 + run * 1.2;
        }
    }

    private castSkill() {
        const dmg = this.playerDamage * (1 + this.buffAtkPercent) * 1.5;
        for (const e of this.enemies) {
            e.hp -= dmg;
            if (e.hp <= 0) {
                e.node.destroy();
            }
        }
        this.enemies = this.enemies.filter((e) => e.hp > 0);
    }

    private endCombat(victory: boolean) {
        this.state = 'expedition_path';
        this.combatLayer.active = false;
        this.expeditionLayer.active = true;
        this.playerNode.destroy();
        this.playerRig = null;
        for (const e of this.enemies) e.node.destroy();
        this.enemies = [];

        if (victory && this.combatSlotIndex >= 0 && this.combatSlotIndex < this.currentLayerSlots.length) {
            this.currentLayerSlots[this.combatSlotIndex].defeated = true;
            const layer = this.currentLayer;
            if (this.combatIsBoss) {
                this.canSafeWithdraw = true;
                this.expeditionSpirit += 30 + layer * 3;
                this.expeditionHerbs += 5 + Math.floor(layer / 5);
                this.expeditionTreasure += 2;
            } else {
                this.expeditionSpirit += 12 + Math.floor(layer / 4);
                this.expeditionHerbs += 1;
            }
        }
        this.combatSlotIndex = -1;
        this.combatIsBoss = false;
        this.refreshLayerUI();
    }

    private endCombatPlayerDeath() {
        this.playerNode.destroy();
        this.playerRig = null;
        for (const e of this.enemies) e.node.destroy();
        this.enemies = [];
        this.combatSlotIndex = -1;
        this.combatIsBoss = false;
        this.endExpeditionDeath();
    }

    private updateCombatHud() {
        this.combatHpLabel.string = `生命 ${Math.ceil(this.playerHp)}/${this.playerMaxHp}`;
    }

    /** 在指定父节点上显示扣血飘字 "-XX"，0.6 秒后消失 */
    private showFloatingDamage(parent: Node, amount: number, x: number, y: number) {
        const n = new Node('FloatingDmg');
        n.layer = Layers.Enum.UI_2D;
        parent.addChild(n);
        n.setPosition(x, y, 0);
        n.addComponent(UITransform).setContentSize(80, 40);
        const label = n.addComponent(Label);
        label.string = `-${amount}`;
        label.fontSize = 28;
        label.color = new Color(255, 100, 80, 255);
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        this.scheduleOnce(() => {
            if (n.isValid) n.destroy();
        }, 0.6);
    }

    private createFullLayer(name: string) {
        const layer = new Node(name);
        layer.layer = Layers.Enum.UI_2D;
        this.node.addChild(layer);
        layer.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
        return layer;
    }

    private createPanel(parent: Node, w: number, h: number, x: number, y: number, fill?: Color) {
        const panel = new Node('Panel');
        panel.layer = Layers.Enum.UI_2D;
        parent.addChild(panel);
        panel.setPosition(x, y, 0);
        panel.addComponent(UITransform).setContentSize(w, h);
        const g = panel.addComponent(Graphics);
        g.fillColor = fill || new Color(32, 38, 48, 240);
        g.roundRect(-w / 2, -h / 2, w, h, 16);
        g.fill();
        g.strokeColor = new Color(70, 85, 100, 200);
        g.lineWidth = 2;
        g.roundRect(-w / 2, -h / 2, w, h, 16);
        g.stroke();
        return panel;
    }

    private createLabel(parent: Node, text: string, fontSize: number, pos: Vec3, color: Color, width = 0): Label {
        const n = new Node('Label');
        n.layer = Layers.Enum.UI_2D;
        parent.addChild(n);
        n.setPosition(pos);
        n.addComponent(UITransform).setContentSize(width || 400, fontSize + 24);
        const label = n.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.color = color;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        if (width > 0) label.overflow = Label.Overflow.SHRINK;
        return label;
    }
}

function mountDemo() {
    const scene = director.getScene();
    if (!scene) return;
    const canvas = find('Canvas', scene);
    if (!canvas || canvas.getChildByName('DemoRoot')) return;
    const root = new Node('DemoRoot');
    root.layer = Layers.Enum.UI_2D;
    canvas.addChild(root);
    root.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
    root.addComponent(GrottoExpeditionDemo);
}
director.on(Director.EVENT_AFTER_SCENE_LAUNCH, mountDemo);
setTimeout(() => mountDemo(), 0);

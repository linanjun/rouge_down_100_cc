/**
 * 洞府养成 + 是仙人就下100层 Demo（修仙题材，带骨骼动画）
 * 局外：洞府养成；局内：每层3个？格子，点击揭示灵植/灵石/天材地宝/怪物/陷阱/buff，每5层可撤，每10层Boss
 */
import {
    _decorator,
    Button,
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
    tween,
    view,
} from 'cc';

const { ccclass } = _decorator;

/** 抽奖效果类型 */
type LotteryEffectType = 'restoreHp' | 'restoreMana' | 'restoreAction' | 'reduceHp' | 'reduceMana' | 'reduceAction';

interface LotteryEffect {
    type: LotteryEffectType;
    value: number; // 5 | 10 | 15 或层数 5/10/15
}

interface LotteryWheelEntry {
    name: string;
    isBenefit: boolean;
    effect: LotteryEffect;
}

/** 增益池：恢复血量、恢复法力、恢复行动力，各 5/10/15 */
const BENEFIT_POOL: LotteryWheelEntry[] = [
    { name: '恢复血量5%', isBenefit: true, effect: { type: 'restoreHp', value: 5 } },
    { name: '恢复血量10%', isBenefit: true, effect: { type: 'restoreHp', value: 10 } },
    { name: '恢复血量15%', isBenefit: true, effect: { type: 'restoreHp', value: 15 } },
    { name: '恢复法力5%', isBenefit: true, effect: { type: 'restoreMana', value: 5 } },
    { name: '恢复法力10%', isBenefit: true, effect: { type: 'restoreMana', value: 10 } },
    { name: '恢复法力15%', isBenefit: true, effect: { type: 'restoreMana', value: 15 } },
    { name: '恢复行动力5%', isBenefit: true, effect: { type: 'restoreAction', value: 5 } },
    { name: '恢复行动力10%', isBenefit: true, effect: { type: 'restoreAction', value: 10 } },
    { name: '恢复行动力15%', isBenefit: true, effect: { type: 'restoreAction', value: 15 } },
];

/** 减益池：降低血量、降低法力、降低行动力（邪修截道已改为独立格子） */
const DEBUFF_POOL: LotteryWheelEntry[] = [
    { name: '降低血量5%', isBenefit: false, effect: { type: 'reduceHp', value: 5 } },
    { name: '降低血量10%', isBenefit: false, effect: { type: 'reduceHp', value: 10 } },
    { name: '降低血量15%', isBenefit: false, effect: { type: 'reduceHp', value: 15 } },
    { name: '降低法力5%', isBenefit: false, effect: { type: 'reduceMana', value: 5 } },
    { name: '降低法力10%', isBenefit: false, effect: { type: 'reduceMana', value: 10 } },
    { name: '降低法力15%', isBenefit: false, effect: { type: 'reduceMana', value: 15 } },
    { name: '降低行动力5%', isBenefit: false, effect: { type: 'reduceAction', value: 5 } },
    { name: '降低行动力10%', isBenefit: false, effect: { type: 'reduceAction', value: 10 } },
    { name: '降低行动力15%', isBenefit: false, effect: { type: 'reduceAction', value: 15 } },
];

function pickRandom<T>(arr: T[], count: number): T[] {
    const out: T[] = [];
    for (let i = 0; i < count; i++) out.push(arr[Math.floor(Math.random() * arr.length)]);
    return out;
}

function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/** 品质分级：绿蓝紫橙 */
type Rarity = 'green' | 'blue' | 'purple' | 'orange';

const RARITY_NAMES: Record<Rarity, string> = { green: '凡品', blue: '良品', purple: '上品', orange: '极品' };
const RARITY_COLORS: Record<Rarity, Color> = {
    green: new Color(94, 189, 94, 255),
    blue: new Color(94, 142, 189, 255),
    purple: new Color(160, 94, 189, 255),
    orange: new Color(212, 137, 63, 255),
};
const RARITY_MULTIPLIER: Record<Rarity, number> = { green: 1, blue: 2, purple: 4, orange: 8 };
const RARITY_LIST: Rarity[] = ['green', 'blue', 'purple', 'orange'];

/** 根据深度与秘境偏置随机一个品质；深度越深、秘境越高，高品质概率越高 */
function pickRarity(depth: number, rarityBias = 0): Rarity {
    const r = Math.random() * 100;
    const orangeChance = Math.max(1, Math.min(28, 2 + depth * 0.3 + rarityBias * 0.4));
    const purpleChance = Math.max(6, Math.min(34, 8 + depth * 0.5 + rarityBias * 0.55));
    const blueChance = Math.max(18, Math.min(46, 25 + depth * 0.3 + rarityBias * 0.65));
    if (r < orangeChance) return 'orange';
    if (r < orangeChance + purpleChance) return 'purple';
    if (r < orangeChance + purpleChance + blueChance) return 'blue';
    return 'green';
}

/** 资源类格子（herb/stone/treasure）是否需要品质 */
function slotNeedsRarity(type: SlotType): boolean {
    return type === 'herb' || type === 'stone' || type === 'treasure';
}

const DESIGN_WIDTH = 720;
const DESIGN_HEIGHT = 1280;
const HALF_WIDTH = DESIGN_WIDTH * 0.5;
const HALF_HEIGHT = DESIGN_HEIGHT * 0.5;

type GameState = 'home' | 'expedition_path' | 'combat' | 'lottery' | 'result';

type DungeonId = 'qi' | 'zhuji' | 'jindan' | 'yuanying';

interface DungeonConfig {
    id: DungeonId;
    label: string;
    unlockRealm: number;
    maxDepth: number;
    accent: Color;
    slotWeights: Record<Exclude<SlotType, 'boss'>, number>;
    rarityBias: number;
    herbDropMultiplier: number;
    stoneDropMultiplier: number;
    treasureDropMultiplier: number;
    combatRewardMultiplier: number;
    enemyHpMultiplier: number;
    enemyDamageMultiplier: number;
    enemySpeedMultiplier: number;
    bossHpMultiplier: number;
    bossDamageMultiplier: number;
    interceptHpMultiplier: number;
    interceptDamageMultiplier: number;
}

const DUNGEON_CONFIGS: DungeonConfig[] = [
    {
        id: 'qi', label: '练气秘境', unlockRealm: 1, maxDepth: 30, accent: new Color(110, 170, 130, 255),
        slotWeights: { empty: 0, herb: 28, stone: 24, treasure: 8, monster: 8, trap: 4, buff: 18, intercept: 0 },
        rarityBias: -2,
        herbDropMultiplier: 1.35, stoneDropMultiplier: 1.2, treasureDropMultiplier: 0.9, combatRewardMultiplier: 1,
        enemyHpMultiplier: 0.82, enemyDamageMultiplier: 0.8, enemySpeedMultiplier: 0.95,
        bossHpMultiplier: 0.88, bossDamageMultiplier: 0.85, interceptHpMultiplier: 0.9, interceptDamageMultiplier: 0.88,
    },
    {
        id: 'zhuji', label: '筑基秘境', unlockRealm: 10, maxDepth: 60, accent: new Color(120, 150, 200, 255),
        slotWeights: { empty: 0, herb: 20, stone: 20, treasure: 14, monster: 12, trap: 6, buff: 16, intercept: 0 },
        rarityBias: 1,
        herbDropMultiplier: 1.15, stoneDropMultiplier: 1.2, treasureDropMultiplier: 1.15, combatRewardMultiplier: 1.2,
        enemyHpMultiplier: 1, enemyDamageMultiplier: 1, enemySpeedMultiplier: 1,
        bossHpMultiplier: 1.05, bossDamageMultiplier: 1.05, interceptHpMultiplier: 1.05, interceptDamageMultiplier: 1.05,
    },
    {
        id: 'jindan', label: '金丹秘境', unlockRealm: 20, maxDepth: 90, accent: new Color(190, 150, 80, 255),
        slotWeights: { empty: 0, herb: 14, stone: 16, treasure: 20, monster: 18, trap: 8, buff: 12, intercept: 0 },
        rarityBias: 6,
        herbDropMultiplier: 1.05, stoneDropMultiplier: 1.3, treasureDropMultiplier: 1.45, combatRewardMultiplier: 1.45,
        enemyHpMultiplier: 1.25, enemyDamageMultiplier: 1.18, enemySpeedMultiplier: 1.05,
        bossHpMultiplier: 1.35, bossDamageMultiplier: 1.22, interceptHpMultiplier: 1.2, interceptDamageMultiplier: 1.18,
    },
    {
        id: 'yuanying', label: '元婴秘境', unlockRealm: 30, maxDepth: 100, accent: new Color(190, 110, 160, 255),
        slotWeights: { empty: 0, herb: 10, stone: 14, treasure: 22, monster: 24, trap: 10, buff: 10, intercept: 0 },
        rarityBias: 12,
        herbDropMultiplier: 1.1, stoneDropMultiplier: 1.4, treasureDropMultiplier: 1.7, combatRewardMultiplier: 1.75,
        enemyHpMultiplier: 1.5, enemyDamageMultiplier: 1.35, enemySpeedMultiplier: 1.08,
        bossHpMultiplier: 1.75, bossDamageMultiplier: 1.5, interceptHpMultiplier: 1.4, interceptDamageMultiplier: 1.3,
    },
];

const MAX_PROGRESS_CHESTS = 10;

/** 格子类型：点击？后揭示 */
type SlotType = 'empty' | 'herb' | 'stone' | 'treasure' | 'monster' | 'trap' | 'buff' | 'intercept' | 'boss';

/** 执行各类型格子消耗的行动力 */
const ACTION_COST: Record<SlotType, number> = {
    empty: 1,
    herb: 2,
    stone: 2,
    treasure: 3,
    monster: 4,
    trap: 3,
    buff: 2,
    intercept: 3,
    boss: 8,
};

const ACTION_POINT_BASE = 180;
const EXP_PER_HERB = 8;
const EXP_PER_TREASURE = 35;
const VICTORY_HP_RESTORE_RATIO = 0.12;
const VICTORY_MANA_RESTORE_RATIO = 0.18;
const VICTORY_ACTION_RESTORE = 8;
const BOSS_VICTORY_ACTION_RESTORE = 20;
const SLOT_WEIGHT_KEYS: Exclude<SlotType, 'boss'>[] = ['empty', 'herb', 'stone', 'treasure', 'monster', 'trap', 'buff', 'intercept'];

/** 按层数与秘境权重抽格子类型（不含 boss）；邪修不在本函数内抽，由 ensureNextNodes 每 10 层单独放 1 个 */
function pickSlotTypeByWeight(depth: number, slotWeights: Record<Exclude<SlotType, 'boss'>, number>): Exclude<SlotType, 'boss'> {
    const w: Record<Exclude<SlotType, 'boss'>, number> = { ...slotWeights };
    w.intercept = 0;
    if (depth % 10 !== 1) w.treasure = 0;
    let sum = 0;
    for (let i = 0; i < SLOT_WEIGHT_KEYS.length; i++) {
        sum += w[SLOT_WEIGHT_KEYS[i]];
    }
    if (sum <= 0) return 'herb';
    let r = Math.random() * sum;
    for (let i = 0; i < SLOT_WEIGHT_KEYS.length; i++) {
        const type = SLOT_WEIGHT_KEYS[i];
        const weight = w[type];
        if (weight <= 0) continue;
        r -= weight;
        if (r <= 0) return type;
    }
    return 'herb';
}

interface LayerSlot {
    type: SlotType;
    revealed: boolean;
    /** 怪物/ Boss 已击败 */
    defeated?: boolean;
}

/** 图节点：非固定层，可多分支、可汇合 */
interface MapNode {
    id: string;
    depth: number;
    type: SlotType;
    revealed: boolean;
    defeated?: boolean;
    /** 是否已触发过（返回上一层后重复触发不再给奖励） */
    triggered?: boolean;
    /** 从此节点可前往的子节点 id 列表（按需生成） */
    nextIds: string[];
    /** 资源格子的品质（仅 herb/stone/treasure 有值） */
    rarity?: Rarity;
}

let _nextNodeId = 0;
function nextNodeId(): string {
    return `n${++_nextNodeId}`;
}

/** 生成下一跳时，概率合并到同深度已有节点（形成「有关联」） */
const MERGE_PROB = 0.15;

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
    /** 受击后高亮恢复计时 */
    hitTimer: number;
    /** 血条节点（挂在 combatLayer，每帧同步到敌人头顶） */
    hpBarNode: Node;
    hpBarGfx: Graphics;
}

@ccclass('GrottoExpeditionDemo')
export class GrottoExpeditionDemo extends Component {
    private state: GameState = 'home';

    private homeLayer!: Node;
    private expeditionLayer!: Node;
    private combatLayer!: Node;
    private lotteryLayer!: Node;
    private resultLayer!: Node;

    private spiritStone = 0;
    private mysticCrystal = 0;
    private realmLevel = 1;
    private realmExp = 0;
    private realmExpNeed = 30;
    /** 行动力上限（局外养成）；局内带入为当前行动力 */
    private actionPointMax = ACTION_POINT_BASE;
    /** 秘境中当前行动力，只减不增 */
    private actionPoints = ACTION_POINT_BASE;
    /** 图：所有已创建的节点 */
    private nodePool = new Map<string, MapNode>();
    /** 当前所在节点 id */
    private currentNodeId = '';
    /** 返回用：来路节点 id 栈 */
    private pathStack: string[] = [];
    /** 探查后待选择：当前「下一跳」中的索引，-1 表示未在待选 */
    private pendingRevealedIndex = -1;
    private expeditionSpirit = 0;
    private expeditionHerbs = 0;
    private expeditionTreasure = 0;
    private buffAtkPercent = 0;
    private combatSlotIndex = -1;
    private combatNodeId = '';
    private combatIsBoss = false;
    private combatIsIntercept = false;
    private playerNode!: Node;
    private playerRig: CharacterRig | null = null;
    private playerHp = 100;
    private playerMaxHp = 100;
    private playerMana = 100;
    private playerMaxMana = 100;
    private playerDamage = 18;
    /** 撤离资源比例乘数（邪修截道永久降低），1 = 100% */
    private retreatRatioMultiplier = 1;
    private playerRadius = 20;
    private attackCooldown = 0;
    private attackAnimTimer = 0;

    private enemies: EnemyData[] = [];
    private combatElapsed = 0;
    private lastCombatPlayerHp = 100;
    private combatDamageFloatCooldown = 0;

    private statusLabel!: Label;
    private hintLabel!: Label;
    private roleHintLabel!: Label;
    private roleDetailLabel!: Label;
    private homeTab: 'dongtian' | 'mijing' | 'shop' | 'faqi' | 'role' = 'dongtian';
    private homeContentRoot!: Node;
    private homeDongtianView!: Node;
    private homeMijingView!: Node;
    private homeRoleView!: Node;
    private homeShopView!: Node;
    private homeFaqiView!: Node;
    private homeGoldLabel!: Label;
    private homeDiamondLabel!: Label;
    private homeNavIcons: Record<'shop' | 'faqi' | 'role' | 'mijing' | 'dongtian', Node | null> = {
        shop: null,
        faqi: null,
        role: null,
        mijing: null,
        dongtian: null,
    };
    private homeNavButtons: Record<'shop' | 'faqi' | 'role' | 'mijing' | 'dongtian', Node | null> = {
        shop: null,
        faqi: null,
        role: null,
        mijing: null,
        dongtian: null,
    };
    private combatHpLabel!: Label;
    private resultLabel!: Label;
    private selectedDungeonInfoLabel!: Label;
    private progressChestTitleLabel!: Label;
    private progressChestInfoLabel!: Label;
    private dungeonButtonNodes: Record<DungeonId, Node | null> = { qi: null, zhuji: null, jindan: null, yuanying: null };
    private dungeonButtonLabels: Record<DungeonId, Label | null> = { qi: null, zhuji: null, jindan: null, yuanying: null };
    private progressChestNodes: Node[] = [];
    private progressChestLabels: Label[] = [];
    private selectedDungeonId: DungeonId = 'qi';
    private dungeonBestDepth: Record<DungeonId, number> = { qi: 0, zhuji: 0, jindan: 0, yuanying: 0 };
    private claimedProgressChests: Record<string, boolean> = {};

    /** 抽奖转盘：当前 8 个选项与预选结果索引（用于动画落点） */
    private lotteryWheelEntries: LotteryWheelEntry[] = [];
    private lotteryResultIndex = 0;
    /** 当前转盘对应的格子是否已触发过（重复触发不生效奖励） */
    private lotterySlotAlreadyTriggered = false;


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
        this.lotteryLayer = this.createFullLayer('Lottery');
        this.resultLayer = this.createFullLayer('Result');

        this.expeditionLayer.active = false;
        this.combatLayer.active = false;
        this.lotteryLayer.active = false;
        this.resultLayer.active = false;

        this.buildHomeUI();
        this.buildExpeditionUI();
        this.buildCombatUI();
        this.buildLotteryUI();
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
        const topBar = this.createPanel(this.homeLayer, 700, 74, 0, 560, new Color(28, 34, 42, 248));
        const avatar = this.createPanel(topBar, 52, 52, -300, 0, new Color(62, 72, 90, 255));
        this.createLabel(avatar, '道', 24, new Vec3(0, 0, 0), new Color(216, 226, 238, 255));
        this.homeGoldLabel = this.createLabel(topBar, '金币 0', 22, new Vec3(-170, 0, 0), new Color(255, 220, 120, 255), 140);
        this.homeDiamondLabel = this.createLabel(topBar, '钻石 0', 22, new Vec3(-20, 0, 0), new Color(160, 210, 255, 255), 140);

        this.homeContentRoot = new Node('HomeContentRoot');
        this.homeContentRoot.layer = Layers.Enum.UI_2D;
        this.homeLayer.addChild(this.homeContentRoot);
        this.homeContentRoot.setPosition(0, -12, 0);
        this.homeContentRoot.addComponent(UITransform).setContentSize(DESIGN_WIDTH, 980);

        this.homeDongtianView = this.createHomeView('DongtianView');
        this.homeShopView = this.createHomeView('ShopView');
        this.homeFaqiView = this.createHomeView('FaqiView');
        this.homeRoleView = this.createHomeView('RoleView');
        this.homeMijingView = this.createHomeView('MijingView');

        this.buildHomeDongtianView();
        this.buildHomeShopView();
        this.buildHomeFaqiView();
        this.buildHomeRoleView();
        this.buildHomeMijingView();

        const navBar = this.createPanel(this.homeLayer, 700, 82, 0, -570, new Color(32, 38, 48, 250));
        const tabs: Array<{ key: 'shop' | 'faqi' | 'role' | 'mijing' | 'dongtian'; label: string }> = [
            { key: 'shop', label: '商城' },
            { key: 'faqi', label: '法器' },
            { key: 'role', label: '角色' },
            { key: 'mijing', label: '秘境' },
            { key: 'dongtian', label: '洞天' },
        ];
        tabs.forEach((tab, index) => {
            const x = -280 + index * 140;
            const btn = this.createPanel(navBar, 112, 56, x, 0, new Color(45, 52, 62, 255));
            const iconNode = new Node(`${tab.key}Icon`);
            iconNode.layer = Layers.Enum.UI_2D;
            btn.addChild(iconNode);
            iconNode.setPosition(0, 11, 0);
            iconNode.addComponent(UITransform).setContentSize(34, 30);
            this.drawHomeNavIcon(iconNode, tab.key, false);
            this.createLabel(btn, tab.label, 16, new Vec3(0, -14, 0), new Color(180, 195, 210, 255));
            btn.on(Node.EventType.TOUCH_END, () => this.switchHomeTab(tab.key), this);
            this.homeNavButtons[tab.key] = btn;
            this.homeNavIcons[tab.key] = iconNode;
        });

        this.switchHomeTab('role');
    }

    private createHomeView(name: string) {
        const viewNode = new Node(name);
        viewNode.layer = Layers.Enum.UI_2D;
        this.homeContentRoot.addChild(viewNode);
        viewNode.addComponent(UITransform).setContentSize(DESIGN_WIDTH, 980);
        viewNode.active = false;
        return viewNode;
    }

    private buildHomeDongtianView() {
        // 洞天功能独立实现，这里仅保留页签容器，不在首页拆分时占用其内容区域。
    }

    private buildHomeShopView() {
        const panel = this.createPanel(this.homeShopView, 620, 360, 0, 80, new Color(38, 44, 54, 245));
        this.createLabel(panel, '商城', 36, new Vec3(0, 120, 0), new Color(236, 226, 190, 255));
        this.createLabel(panel, '顶部货币栏已预留金币与钻石位置', 22, new Vec3(0, 36, 0), new Color(180, 198, 214, 255), 520);
        this.createLabel(panel, '当前先保留页签结构，后续可接商品与充值入口', 20, new Vec3(0, -18, 0), new Color(132, 150, 168, 255), 520);
    }

    private buildHomeFaqiView() {
        const panel = this.createPanel(this.homeFaqiView, 620, 360, 0, 80, new Color(38, 44, 54, 245));
        this.createLabel(panel, '法器', 36, new Vec3(0, 120, 0), new Color(220, 236, 255, 255));
        this.createLabel(panel, '当前先拆分页签，法器养成入口预留在这里', 22, new Vec3(0, 36, 0), new Color(180, 198, 214, 255), 520);
        this.createLabel(panel, '后续可接装备、强化、共鸣等功能', 20, new Vec3(0, -18, 0), new Color(132, 150, 168, 255), 520);
    }

    private buildHomeRoleView() {
        this.buildHomePortrait(this.homeRoleView, -220, 140);
        const stat = this.createPanel(this.homeRoleView, 420, 300, 150, 240, new Color(40, 48, 58, 245));
        this.createLabel(stat, '角色属性', 20, new Vec3(0, 116, 0), new Color(180, 205, 225, 255));
        this.statusLabel = this.createLabel(stat, '', 26, new Vec3(0, 74, 0), new Color(255, 240, 220, 255), 360);
        this.roleHintLabel = this.createLabel(stat, '', 20, new Vec3(0, 18, 0), new Color(180, 214, 255, 255), 360);
        this.roleDetailLabel = this.createLabel(stat, '', 18, new Vec3(0, -78, 0), new Color(140, 160, 180, 255), 360);

        const realmBtn = this.createPanel(this.homeRoleView, 220, 70, 150, 20, new Color(50, 55, 65, 255));
        this.createLabel(realmBtn, '修炼突破', 28, new Vec3(0, 0, 0), new Color(200, 230, 255, 255));
        realmBtn.on(Node.EventType.TOUCH_END, () => this.tryRealmUp(), this);
    }

    private buildHomeMijingView() {
        const dungeonPanel = this.createPanel(this.homeMijingView, 620, 220, 0, 220, new Color(40, 48, 58, 245));
        this.createLabel(dungeonPanel, '选择秘境', 26, new Vec3(0, 84, 0), new Color(228, 220, 200, 255));
        this.selectedDungeonInfoLabel = this.createLabel(dungeonPanel, '', 18, new Vec3(0, 50, 0), new Color(150, 175, 195, 255), 560);
        DUNGEON_CONFIGS.forEach((config, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = col === 0 ? -145 : 145;
            const y = row === 0 ? 0 : -72;
            const btn = this.createPanel(dungeonPanel, 250, 54, x, y, new Color(54, 60, 70, 255));
            const label = this.createLabel(btn, config.label, 22, new Vec3(0, 0, 0), new Color(220, 230, 240, 255), 220);
            btn.on(Node.EventType.TOUCH_END, () => this.selectDungeon(config.id), this);
            this.dungeonButtonNodes[config.id] = btn;
            this.dungeonButtonLabels[config.id] = label;
        });

        const chestPanel = this.createPanel(this.homeMijingView, 620, 220, 0, -40, new Color(44, 38, 32, 245));
        this.progressChestTitleLabel = this.createLabel(chestPanel, '', 24, new Vec3(0, 84, 0), new Color(230, 215, 175, 255), 560);
        this.progressChestInfoLabel = this.createLabel(chestPanel, '', 18, new Vec3(0, 54, 0), new Color(170, 160, 145, 255), 560);
        for (let i = 0; i < MAX_PROGRESS_CHESTS; i++) {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = -220 + col * 110;
            const y = row === 0 ? -6 : -74;
            const chestBtn = this.createPanel(chestPanel, 92, 48, x, y, new Color(88, 72, 45, 255));
            const chestLabel = this.createLabel(chestBtn, '', 18, new Vec3(0, 0, 0), new Color(240, 220, 180, 255), 84);
            chestBtn.on(Node.EventType.TOUCH_END, () => this.claimProgressChest(i), this);
            this.progressChestNodes.push(chestBtn);
            this.progressChestLabels.push(chestLabel);
        }

        const goBtn = this.createPanel(this.homeMijingView, 260, 76, 0, -300, new Color(45, 70, 60, 255));
        this.createLabel(goBtn, '进入秘境', 36, new Vec3(0, 0, 0), new Color(180, 255, 220, 255));
        goBtn.on(Node.EventType.TOUCH_END, () => this.tryStartExpedition(), this);

        this.hintLabel = this.createLabel(this.homeMijingView, '选择秘境后进入挑战；每 10 层一位 Boss，首个 10/20/30 层宝箱可在洞府领取', 20, new Vec3(0, -410, 0), new Color(120, 140, 160, 255), 660);
    }

    private switchHomeTab(tab: 'dongtian' | 'mijing' | 'shop' | 'faqi' | 'role') {
        this.homeTab = tab;
        this.homeDongtianView.active = tab === 'dongtian';
        this.homeMijingView.active = tab === 'mijing';
        this.homeRoleView.active = tab === 'role';
        this.homeShopView.active = tab === 'shop';
        this.homeFaqiView.active = tab === 'faqi';

        (Object.keys(this.homeNavButtons) as Array<keyof typeof this.homeNavButtons>).forEach((key) => {
            const btn = this.homeNavButtons[key];
            const iconNode = this.homeNavIcons[key];
            if (!btn) return;
            const active = key === tab;
            this.repaintPanel(btn, active ? new Color(62, 78, 96, 255) : new Color(45, 52, 62, 255), active ? new Color(152, 192, 224, 220) : new Color(70, 85, 100, 200));
            if (iconNode) this.drawHomeNavIcon(iconNode, key, active);
            const labels = btn.getComponentsInChildren(Label);
            labels.forEach((label) => {
                label.color = active ? new Color(220, 232, 244, 255) : new Color(180, 195, 210, 255);
            });
        });

        this.refreshHomeStatus();
    }

    private restoreExpeditionSlotContainer() {
        if (!this.slotContainer.parent) {
            this.expeditionLayer.addChild(this.slotContainer);
            this.slotContainer.setSiblingIndex(0);
        }
    }

    private drawHomeNavIcon(node: Node, key: 'shop' | 'faqi' | 'role' | 'mijing' | 'dongtian', active: boolean) {
        let g = node.getComponent(Graphics);
        if (!g) g = node.addComponent(Graphics);
        g.clear();

        const stroke = active ? new Color(236, 230, 196, 255) : new Color(194, 202, 216, 255);
        const fill = active ? new Color(210, 182, 108, 52) : new Color(128, 152, 176, 24);
        g.strokeColor = stroke;
        g.fillColor = fill;
        g.lineWidth = 2.5;

        switch (key) {
            case 'shop': {
                g.roundRect(-10, -7, 20, 14, 4);
                g.fill();
                g.stroke();
                g.moveTo(-6, 7);
                g.lineTo(-4, 11);
                g.lineTo(4, 11);
                g.lineTo(6, 7);
                g.stroke();
                g.moveTo(-3, -11);
                g.lineTo(-1, -14);
                g.lineTo(1, -14);
                g.lineTo(3, -11);
                g.stroke();
                break;
            }
            case 'faqi': {
                g.moveTo(0, 12);
                g.lineTo(0, -10);
                g.stroke();
                g.moveTo(-6, -3);
                g.lineTo(6, -3);
                g.stroke();
                g.circle(0, -12, 2.2);
                g.fill();
                g.moveTo(0, 14);
                g.lineTo(-4, 8);
                g.lineTo(4, 8);
                g.close();
                g.fill();
                g.stroke();
                g.arc(0, 2, 8, Math.PI * 0.15, Math.PI * 0.85, false);
                g.stroke();
                break;
            }
            case 'role': {
                g.circle(0, 8, 5);
                g.fill();
                g.stroke();
                g.moveTo(-8, -8);
                g.quadraticCurveTo(0, 0, 8, -8);
                g.lineTo(8, -14);
                g.quadraticCurveTo(0, -20, -8, -14);
                g.close();
                g.fill();
                g.stroke();
                break;
            }
            case 'mijing': {
                g.moveTo(0, 14);
                g.lineTo(-11, 4);
                g.lineTo(-6, -12);
                g.lineTo(0, -6);
                g.lineTo(6, -12);
                g.lineTo(11, 4);
                g.close();
                g.fill();
                g.stroke();
                g.moveTo(0, 8);
                g.lineTo(0, -4);
                g.stroke();
                g.moveTo(-4, 2);
                g.lineTo(0, -4);
                g.lineTo(4, 2);
                g.stroke();
                break;
            }
            case 'dongtian': {
                g.moveTo(-12, -8);
                g.lineTo(-3, 10);
                g.lineTo(1, 2);
                g.lineTo(8, 10);
                g.lineTo(12, 6);
                g.lineTo(12, -8);
                g.close();
                g.fill();
                g.stroke();
                g.circle(8, 12, 3);
                g.fill();
                g.moveTo(-9, -12);
                g.lineTo(-1, -12);
                g.stroke();
                break;
            }
        }
    }

    private buildHomePortrait(parent: Node, x: number, y: number) {
        const portraitPanel = this.createPanel(parent, 220, 330, x, y, new Color(36, 42, 52, 245));
        const portraitRoot = new Node('HomePortrait');
        portraitRoot.layer = Layers.Enum.UI_2D;
        portraitPanel.addChild(portraitRoot);
        portraitRoot.setPosition(0, -12, 0);
        portraitRoot.addComponent(UITransform).setContentSize(180, 260);

        const aura = portraitRoot.addComponent(Graphics);
        aura.fillColor = new Color(68, 84, 108, 90);
        aura.circle(0, 30, 74);
        aura.fill();
        aura.strokeColor = new Color(126, 152, 188, 120);
        aura.lineWidth = 3;
        aura.circle(0, 30, 86);
        aura.stroke();

        const rig = this.createCharacterRig(portraitRoot, new Color(90, 100, 120, 255), new Color(200, 210, 230, 255));
        rig.root.setScale(new Vec3(2.4, 2.4, 1));
        rig.root.setPosition(0, 36, 0);
        rig.body.node.angle = 0;
        rig.head.node.angle = 0;
        rig.armL.node.angle = -24;
        rig.armR.node.angle = 24;
        rig.legL.node.angle = -8;
        rig.legR.node.angle = 8;

        this.createLabel(portraitPanel, '主角', 22, new Vec3(0, -134, 0), new Color(208, 220, 235, 255));
    }

    private getRealmTitle(): string {
        const level = this.realmLevel;
        if (level <= 9) return `炼气${level}重`;
        if (level <= 18) return `筑基${level - 9}重`;
        if (level <= 27) return `金丹${level - 18}转`;
        return `元婴${level - 27}变`;
    }

    private expeditionResLabel!: Label;
    private expeditionApLabel!: Label;
    private expeditionLayerLabel!: Label;
    private expeditionHpLabel!: Label;
    private choicePanel!: Node;
    private choiceDiscoverLabel!: Label;
    private choiceExecuteLabel!: Label;
    private interceptPanel!: Node;
    private interceptOverlay!: Node;
    private interceptPanelVisible = false;
    private expeditionManaLabel!: Label;
    private expeditionRatioLabel!: Label;
    private slotContainer!: Node;
    private nextLayerBtn!: Node;
    private nextLayerBtnLabel!: Label;
    private withdrawBtn!: Node;
    private withdrawBtnLabel!: Label;
    private returnToPrevBtn!: Node;
    private returnToPrevBtnLabel!: Label;

    private buildExpeditionUI() {
        const top = this.createPanel(this.expeditionLayer, 640, 100, 0, 560);
        top.name = 'Top';
        this.expeditionLayerLabel = this.createLabel(top, '练气秘境 1/30层', 28, new Vec3(-220, 18, 0), new Color(255, 248, 230, 255));
        this.expeditionHpLabel = this.createLabel(top, '生命 100/100', 22, new Vec3(0, 18, 0), new Color(255, 200, 180, 255));
        this.expeditionManaLabel = this.createLabel(top, '法力 100/100', 22, new Vec3(180, 18, 0), new Color(180, 220, 255, 255));
        this.expeditionApLabel = this.createLabel(top, '行动力 100/100', 22, new Vec3(-180, -28, 0), new Color(200, 220, 180, 255));
        this.expeditionResLabel = this.createLabel(top, '灵石 0 | 灵药 0 | 天材地宝 0', 20, new Vec3(120, -28, 0), new Color(180, 220, 200, 255), 420);

        this.expeditionRatioLabel = this.createLabel(this.expeditionLayer, '', 18, new Vec3(0, 498, 0), new Color(140, 160, 180, 255), 680);

        this.slotContainer = new Node('SlotContainer');
        this.slotContainer.layer = Layers.Enum.UI_2D;
        this.expeditionLayer.addChild(this.slotContainer);
        this.slotContainer.setPosition(0, 80, 0);
        this.slotContainer.addComponent(UITransform).setContentSize(640, 340);

        this.nextLayerBtn = this.createPanel(this.expeditionLayer, 220, 56, 0, -220, new Color(55, 75, 65, 255));
        this.nextLayerBtnLabel = this.createLabel(this.nextLayerBtn, '至少开启1格', 24, new Vec3(0, 0, 0), new Color(150, 150, 150, 255));
        this.nextLayerBtn.on(Node.EventType.TOUCH_END, () => this.goNextLayer(), this);

        const bottomY = -300;
        this.returnToPrevBtn = this.createPanel(this.expeditionLayer, 200, 56, -140, bottomY, new Color(65, 55, 70, 255));
        this.returnToPrevBtnLabel = this.createLabel(this.returnToPrevBtn, '返回上一层', 22, new Vec3(0, 0, 0), new Color(255, 220, 200, 255));
        this.returnToPrevBtn.on(Node.EventType.TOUCH_END, () => this.onChoiceReturn(), this);

        this.withdrawBtn = this.createPanel(this.expeditionLayer, 200, 56, 140, bottomY, new Color(65, 55, 70, 255));
        this.withdrawBtnLabel = this.createLabel(this.withdrawBtn, '紧急撤离', 24, new Vec3(0, 0, 0), new Color(255, 220, 200, 255));
        this.withdrawBtn.on(Node.EventType.TOUCH_END, () => this.withdrawExpedition(), this);

        this.choicePanel = this.createPanel(this.expeditionLayer, 340, 160, 0, 0, new Color(40, 48, 56, 248));
        this.choiceDiscoverLabel = this.createLabel(this.choicePanel, '发现：？', 26, new Vec3(0, 45, 0), new Color(255, 248, 200, 255));
        this.choiceExecuteLabel = this.createLabel(this.choicePanel, '执行 消耗？行动力', 20, new Vec3(0, 8, 0), new Color(180, 220, 200, 255));
        const execBtn = this.createPanel(this.choicePanel, 160, 44, 0, -50, new Color(55, 75, 65, 255));
        this.createLabel(execBtn, '执行', 22, new Vec3(0, 0, 0), new Color(200, 255, 220, 255));
        execBtn.on(Node.EventType.TOUCH_END, () => this.onChoiceExecute(), this);
        const exploreBtn = this.createPanel(this.choicePanel, 140, 40, 0, -95, new Color(50, 58, 65, 255));
        this.createLabel(exploreBtn, '继续探查', 18, new Vec3(0, 0, 0), new Color(180, 200, 220, 255));
        exploreBtn.on(Node.EventType.TOUCH_END, () => this.onChoiceContinueExplore(), this);
        this.choicePanel.active = false;

        this.interceptOverlay = new Node('InterceptOverlay');
        this.interceptOverlay.layer = Layers.Enum.UI_2D;
        this.expeditionLayer.addChild(this.interceptOverlay);
        this.interceptOverlay.setPosition(0, 0, 0);
        this.interceptOverlay.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
        const overlayG = this.interceptOverlay.addComponent(Graphics);
        overlayG.fillColor = new Color(0, 0, 0, 100);
        overlayG.rect(-HALF_WIDTH, -HALF_HEIGHT, DESIGN_WIDTH, DESIGN_HEIGHT);
        overlayG.fill();
        this.interceptOverlay.on(Node.EventType.TOUCH_START, (e: any) => { e.propagationStopped = true; }, this);
        this.interceptOverlay.on(Node.EventType.TOUCH_END, (e: any) => { e.propagationStopped = true; }, this);
        this.interceptOverlay.active = false;

        this.interceptPanel = this.createPanel(this.expeditionLayer, 380, 200, 0, 0, new Color(48, 40, 44, 248));
        this.interceptPanel.on(Node.EventType.TOUCH_START, (e: any) => { e.propagationStopped = true; }, this);
        this.interceptPanel.on(Node.EventType.TOUCH_END, (e: any) => { e.propagationStopped = true; }, this);
        this.createLabel(this.interceptPanel, '邪修截道', 26, new Vec3(0, 55, 0), new Color(220, 160, 160, 255));
        this.createLabel(this.interceptPanel, '逃跑：丢失1%-20%物资  战斗：胜无损失+奖励，败丢50%', 18, new Vec3(0, 15, 0), new Color(200, 190, 180, 255), 360);
        const fleeBtn = this.createPanel(this.interceptPanel, 160, 44, -90, -45, new Color(65, 55, 60, 255));
        this.createLabel(fleeBtn, '逃跑', 22, new Vec3(0, 0, 0), new Color(255, 220, 200, 255));
        fleeBtn.addComponent(Button).transition = Button.Transition.NONE;
        fleeBtn.on(Node.EventType.TOUCH_END, () => this.onInterceptFlee(), this);
        const fightBtn = this.createPanel(this.interceptPanel, 160, 44, 90, -45, new Color(70, 50, 55, 255));
        this.createLabel(fightBtn, '战斗', 22, new Vec3(0, 0, 0), new Color(255, 180, 180, 255));
        fightBtn.addComponent(Button).transition = Button.Transition.NONE;
        fightBtn.on(Node.EventType.TOUCH_END, () => this.onInterceptFight(), this);
        this.interceptPanel.active = false;
    }

    private combatManaLabel!: Label;
    private combatPlayerHpBarNode!: Node;
    private combatSkillBtn!: Node;
    private combatSkillLabel!: Label;

    private buildCombatUI() {
        const top = this.createPanel(this.combatLayer, 640, 76, 0, 558);
        this.combatHpLabel = this.createLabel(top, '生命 100/100', 24, new Vec3(-140, 14, 0), new Color(255, 220, 200, 255));
        this.combatManaLabel = this.createLabel(top, '法力 100/100', 24, new Vec3(140, 14, 0), new Color(180, 220, 255, 255));
        this.combatPlayerHpBarNode = new Node('PlayerHpBar');
        this.combatPlayerHpBarNode.layer = Layers.Enum.UI_2D;
        this.combatLayer.addChild(this.combatPlayerHpBarNode);
        this.combatPlayerHpBarNode.setPosition(-140, 526, 0);
        this.combatPlayerHpBarNode.addComponent(UITransform).setContentSize(180, 16);
        const skillBtn = this.createPanel(this.combatLayer, 160, 52, 260, -518, new Color(60, 70, 85, 255));
        this.combatSkillBtn = skillBtn;
        this.combatSkillLabel = this.createLabel(skillBtn, '符咒(20)', 22, new Vec3(0, 0, 0), new Color(200, 240, 255, 255));
        skillBtn.on(Node.EventType.TOUCH_END, () => this.castSkill(), this);
    }

    private drawPlayerHpBar() {
        if (!this.combatPlayerHpBarNode || !this.combatPlayerHpBarNode.isValid) return;
        let g = this.combatPlayerHpBarNode.getComponent(Graphics);
        if (!g) g = this.combatPlayerHpBarNode.addComponent(Graphics);
        g.clear();
        const w = 180;
        const h = 14;
        const ratio = Math.max(0, Math.min(1, this.playerHp / this.playerMaxHp));
        g.fillColor = new Color(50, 35, 35, 255);
        g.roundRect(-w / 2, -h / 2, w, h, 4);
        g.fill();
        g.fillColor = ratio > 0.25 ? new Color(220, 80, 70, 255) : new Color(200, 50, 50, 255);
        g.roundRect(-w / 2, -h / 2, w * ratio, h, 4);
        g.fill();
        g.strokeColor = new Color(100, 80, 80, 220);
        g.lineWidth = 2;
        g.roundRect(-w / 2, -h / 2, w, h, 4);
        g.stroke();
    }

    private lotteryWheelNode!: Node;
    private lotteryTitleLabel!: Label;
    private lotterySubtitleLabel!: Label;
    private lotteryResultLabel!: Label;
    private lotterySpinBtn!: Node;
    private lotteryPointerNode!: Node;
    private lotteryPointerGfx!: Graphics;

    private buildLotteryUI() {
        const mask = new Node('Mask');
        mask.layer = Layers.Enum.UI_2D;
        this.lotteryLayer.addChild(mask);
        mask.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
        const g = mask.addComponent(Graphics);
        g.fillColor = new Color(6, 8, 12, 215);
        g.rect(-HALF_WIDTH, -HALF_HEIGHT, DESIGN_WIDTH, DESIGN_HEIGHT);
        g.fill();

        this.lotteryTitleLabel = this.createLabel(this.lotteryLayer, '福兮祸所伏', 30, new Vec3(0, 526, 0), new Color(228, 213, 168, 255));
        this.lotterySubtitleLabel = this.createLabel(this.lotteryLayer, '天机轮转  因果自成', 18, new Vec3(0, 490, 0), new Color(130, 162, 150, 255), 320);
        this.lotteryWheelNode = new Node('Wheel');
        this.lotteryWheelNode.layer = Layers.Enum.UI_2D;
        this.lotteryLayer.addChild(this.lotteryWheelNode);
        this.lotteryWheelNode.setPosition(0, 60, 0);
        this.lotteryWheelNode.addComponent(UITransform).setContentSize(580, 580);

        const pointer = new Node('Pointer');
        pointer.layer = Layers.Enum.UI_2D;
        this.lotteryLayer.addChild(pointer);
        pointer.setPosition(0, 352, 0);
        pointer.addComponent(UITransform).setContentSize(28, 72);
        const pg = pointer.addComponent(Graphics);
        this.lotteryPointerNode = pointer;
        this.lotteryPointerGfx = pg;
        pg.fillColor = new Color(112, 126, 118, 255);
        pg.roundRect(-3, -8, 6, 20, 2);
        pg.fill();
        pg.fillColor = new Color(182, 154, 98, 255);
        pg.roundRect(-5, 10, 10, 18, 3);
        pg.fill();
        pg.fillColor = new Color(215, 184, 120, 255);
        pg.moveTo(0, 44);
        pg.lineTo(-12, 18);
        pg.lineTo(12, 18);
        pg.close();
        pg.fill();

        this.lotteryResultLabel = this.createLabel(this.lotteryLayer, '', 22, new Vec3(0, -320, 0), new Color(208, 218, 228, 255), 520);
        this.lotterySpinBtn = this.createPanel(this.lotteryLayer, 200, 56, 0, -420, new Color(50, 62, 72, 255));
        this.createLabel(this.lotterySpinBtn, '窥天机', 26, new Vec3(0, 0, 0), new Color(210, 225, 235, 255));
        this.lotterySpinBtn.on(Node.EventType.TOUCH_END, () => this.runLotterySpin(), this);
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
        this.lotteryLayer.active = false;
        this.resultLayer.active = false;
        this.refreshHomeStatus();
    }

    private getDungeonConfig(id: DungeonId = this.selectedDungeonId): DungeonConfig {
        return DUNGEON_CONFIGS.find((config) => config.id === id) || DUNGEON_CONFIGS[0];
    }

    private getProgressMilestones(id: DungeonId): number[] {
        const milestones: number[] = [];
        const maxDepth = this.getDungeonConfig(id).maxDepth;
        for (let floor = 10; floor <= maxDepth; floor += 10) milestones.push(floor);
        return milestones;
    }

    private isDungeonUnlocked(id: DungeonId): boolean {
        return this.realmLevel >= this.getDungeonConfig(id).unlockRealm;
    }

    private selectDungeon(id: DungeonId) {
        const config = this.getDungeonConfig(id);
        if (!this.isDungeonUnlocked(id)) {
            this.hintLabel.string = `${config.label} 需修为 ${config.unlockRealm} 层解锁。`;
            return;
        }
        this.selectedDungeonId = id;
        this.hintLabel.string = `已选择 ${config.label}，共 ${config.maxDepth} 层。`;
        this.refreshHomeStatus();
    }

    private tryStartExpedition() {
        const config = this.getDungeonConfig();
        if (!this.isDungeonUnlocked(config.id)) {
            this.hintLabel.string = `${config.label} 需修为 ${config.unlockRealm} 层解锁。`;
            return;
        }
        this.startExpedition();
    }

    private getProgressChestKey(dungeonId: DungeonId, milestone: number): string {
        return `${dungeonId}:${milestone}`;
    }

    private getDungeonTierIndex(id: DungeonId = this.selectedDungeonId): number {
        return Math.max(1, DUNGEON_CONFIGS.findIndex((item) => item.id === id) + 1);
    }

    private getProgressChestRewards(config: DungeonConfig, milestone: number) {
        const tierIndex = this.getDungeonTierIndex(config.id);
        return {
            spiritStone: milestone * 12 * tierIndex,
            exp: milestone * 8 * tierIndex,
            mysticCrystal: Math.max(1, Math.floor(milestone / 10) * tierIndex),
        };
    }

    private getDungeonLootMultiplier(type: 'herb' | 'stone' | 'treasure' | 'combat'): number {
        const config = this.getDungeonConfig();
        switch (type) {
            case 'herb':
                return config.herbDropMultiplier;
            case 'stone':
                return config.stoneDropMultiplier;
            case 'treasure':
                return config.treasureDropMultiplier;
            case 'combat':
                return config.combatRewardMultiplier;
            default:
                return 1;
        }
    }

    private claimProgressChest(index: number) {
        const config = this.getDungeonConfig();
        const milestones = this.getProgressMilestones(config.id);
        if (index >= milestones.length) return;
        const milestone = milestones[index];
        const best = this.dungeonBestDepth[config.id] || 0;
        const key = this.getProgressChestKey(config.id, milestone);
        if (this.claimedProgressChests[key]) {
            this.hintLabel.string = `${config.label} ${milestone} 层宝箱已领取。`;
            return;
        }
        if (best < milestone) {
            this.hintLabel.string = `需先在 ${config.label} 达到 ${milestone} 层。当前最高 ${best} 层。`;
            return;
        }
        const rewards = this.getProgressChestRewards(config, milestone);
        this.claimedProgressChests[key] = true;
        this.spiritStone += rewards.spiritStone;
        this.realmExp += rewards.exp;
        this.mysticCrystal += rewards.mysticCrystal;
        this.hintLabel.string = `领取 ${config.label}${milestone} 层宝箱：灵石 +${rewards.spiritStone}，修为 +${rewards.exp}，秘晶 +${rewards.mysticCrystal}。`;
        this.refreshHomeStatus();
    }

    private recordDungeonProgress(depth: number = this.getCurrentDepth()) {
        const config = this.getDungeonConfig();
        this.dungeonBestDepth[config.id] = Math.max(this.dungeonBestDepth[config.id], Math.min(depth, config.maxDepth));
    }

    private canWithdrawSafelyAtCurrentNode(): boolean {
        const current = this.getCurrentNode();
        return !!current && current.type === 'boss' && !!current.defeated;
    }

    private getCombatNode(): MapNode | null {
        if (this.combatNodeId) return this.nodePool.get(this.combatNodeId) ?? null;
        const choices = this.getCurrentChoiceNodes();
        return this.combatSlotIndex >= 0 && this.combatSlotIndex < choices.length ? choices[this.combatSlotIndex] : null;
    }

    private refreshHomeStatus() {
        this.actionPointMax = ACTION_POINT_BASE + (this.realmLevel - 1) * 10;
        if (this.homeGoldLabel) this.homeGoldLabel.string = `金币 ${this.spiritStone}`;
        if (this.homeDiamondLabel) this.homeDiamondLabel.string = `钻石 ${this.mysticCrystal}`;
        this.statusLabel.string = `${this.getRealmTitle()}`;
        if (this.roleHintLabel) {
            this.roleHintLabel.string = `修为 ${this.realmExp}/${this.realmExpNeed} | 气血 ${this.playerMaxHp} | 真元 ${this.playerMaxMana}`;
        }
        if (this.roleDetailLabel) {
            this.roleDetailLabel.string = `术法攻击 ${this.playerDamage}\n行动力上限 ${this.actionPointMax}\n当前所选秘境 ${this.getDungeonConfig().label}\n最高历练 ${this.dungeonBestDepth[this.getDungeonConfig().id]}/${this.getDungeonConfig().maxDepth}层`;
        }
        const current = this.getDungeonConfig();
        this.selectedDungeonInfoLabel.string = `当前：${current.label} | 解锁修为 ${current.unlockRealm} | 总层数 ${current.maxDepth}`;
        DUNGEON_CONFIGS.forEach((config) => {
            const button = this.dungeonButtonNodes[config.id];
            const label = this.dungeonButtonLabels[config.id];
            if (!button || !label) return;
            const unlocked = this.isDungeonUnlocked(config.id);
            const selected = this.selectedDungeonId === config.id;
            this.repaintPanel(
                button,
                !unlocked ? new Color(55, 55, 60, 255) : selected ? config.accent : new Color(54, 60, 70, 255),
                selected ? new Color(240, 220, 180, 220) : new Color(70, 85, 100, 200)
            );
            label.string = unlocked ? `${config.label} ${config.maxDepth}层` : `${config.label} (${config.unlockRealm}层解锁)`;
            label.color = !unlocked
                ? new Color(130, 130, 140, 255)
                : selected ? new Color(255, 248, 220, 255) : new Color(220, 230, 240, 255);
        });

        const best = this.dungeonBestDepth[current.id] || 0;
        const milestones = this.getProgressMilestones(current.id);
        this.progressChestTitleLabel.string = `${current.label} 进度宝箱`;
        const nextUnclaimed = milestones.find((milestone) => !this.claimedProgressChests[this.getProgressChestKey(current.id, milestone)]);
        if (nextUnclaimed) {
            const rewards = this.getProgressChestRewards(current, nextUnclaimed);
            this.progressChestInfoLabel.string = `历史最深 ${best}/${current.maxDepth} 层 | ${nextUnclaimed}层奖励：灵石+${rewards.spiritStone} 修为+${rewards.exp} 秘晶+${rewards.mysticCrystal}`;
        } else {
            this.progressChestInfoLabel.string = `历史最深 ${best}/${current.maxDepth} 层 | 本秘境进度宝箱已全部领取`;
        }
        for (let i = 0; i < MAX_PROGRESS_CHESTS; i++) {
            const chestNode = this.progressChestNodes[i];
            const chestLabel = this.progressChestLabels[i];
            const milestone = milestones[i];
            if (!chestNode || !chestLabel) continue;
            if (!milestone) {
                chestNode.active = false;
                continue;
            }
            chestNode.active = true;
            const key = this.getProgressChestKey(current.id, milestone);
            const claimed = !!this.claimedProgressChests[key];
            const claimable = best >= milestone && !claimed;
            this.repaintPanel(
                chestNode,
                claimed ? new Color(70, 78, 82, 255) : claimable ? new Color(156, 110, 52, 255) : new Color(88, 72, 45, 255),
                claimable ? new Color(235, 205, 130, 220) : new Color(110, 90, 58, 200)
            );
            chestLabel.string = claimed ? `${milestone}层\n已领` : claimable ? `${milestone}层\n领取` : `${milestone}层`;
            chestLabel.color = claimed ? new Color(160, 170, 175, 255) : claimable ? new Color(255, 238, 190, 255) : new Color(225, 205, 160, 255);
        }
    }

    private tryRealmUp() {
        if (this.realmExp < this.realmExpNeed) {
            this.hintLabel.string = `修为不足，需 ${this.realmExpNeed}。进入秘境战斗可获得修为。`;
            return;
        }
        this.realmExp -= this.realmExpNeed;
        this.realmLevel += 1;
        this.realmExpNeed = 30 + this.realmLevel * 15;
        this.playerMaxHp = 100 + this.realmLevel * 30;
        this.playerMaxMana = 70 + this.realmLevel * 18;
        this.playerDamage = 16 + this.realmLevel * 7;
        this.actionPointMax = ACTION_POINT_BASE + (this.realmLevel - 1) * 10;
        this.hintLabel.string = '突破成功，生命、攻击与行动力上限提升';
        this.refreshHomeStatus();
    }

    private startExpedition() {
        this.state = 'expedition_path';
        this.homeLayer.active = false;
        this.expeditionLayer.active = true;
        this.combatLayer.active = false;
        this.resultLayer.active = false;

        _nextNodeId = 0;
        this.nodePool.clear();
        const rootId = nextNodeId();
        this.nodePool.set(rootId, {
            id: rootId,
            depth: 1,
            type: 'herb',
            revealed: true,
            nextIds: [],
        });
        this.currentNodeId = rootId;
        this.pathStack = [];
        this.expeditionSpirit = 0;
        this.expeditionHerbs = 0;
        this.expeditionTreasure = 0;
        this.buffAtkPercent = 0;
        this.retreatRatioMultiplier = 1;
        this.pendingRevealedIndex = -1;
        /** 测试版数值：每次进秘境补满行动力，避免连续测试被行动力卡死 */
        this.actionPoints = this.actionPointMax;
        this.playerHp = this.playerMaxHp;
        this.playerMana = this.playerMaxMana;
        this.ensureNextNodes(this.currentNodeId);
        this.refreshLayerUI();
    }

    private getCurrentNode(): MapNode | null {
        return this.nodePool.get(this.currentNodeId) ?? null;
    }

    private getCurrentDepth(): number {
        const n = this.getCurrentNode();
        return n ? n.depth : 1;
    }

    /** 当前节点的「下一跳」节点列表（用于选路 UI） */
    private getCurrentChoiceNodes(): MapNode[] {
        const cur = this.getCurrentNode();
        if (!cur) return [];
        return cur.nextIds.map((id) => this.nodePool.get(id)).filter((n): n is MapNode => !!n);
    }

    /** 确保某节点有下一跳；若无则按图规则生成（2～4 个，可概率合并到同深度已有节点；Boss 层只生成 1 个 Boss） */
    private ensureNextNodes(nodeId: string): void {
        const node = this.nodePool.get(nodeId);
        if (!node || node.nextIds.length > 0) return;
        const nextDepth = node.depth + 1;
        const dungeon = this.getDungeonConfig();
        const isBossDepth = nextDepth >= 10 && nextDepth % 10 === 0;
        if (isBossDepth) {
            const bossId = nextNodeId();
            this.nodePool.set(bossId, { id: bossId, depth: nextDepth, type: 'boss', revealed: false, nextIds: [] });
            node.nextIds = [bossId];
            return;
        }
        const count = 2 + Math.floor(Math.random() * 3);
        const existingAtDepth = this.getNodesAtDepth(nextDepth);
        const useMerge = existingAtDepth.length > 0 && Math.random() < MERGE_PROB;
        const newCount = useMerge ? Math.max(1, count - 1) : count;
        const isInterceptLayer = nextDepth >= 5 && nextDepth % 10 === 5;
        const hasInterceptAlready = existingAtDepth.some((n) => n.type === 'intercept');
        const interceptIndex = isInterceptLayer && !hasInterceptAlready ? Math.floor(Math.random() * newCount) : -1;
        const ids: string[] = [];
        for (let i = 0; i < newCount; i++) {
            const id = nextNodeId();
            let type: Exclude<SlotType, 'boss'> = i === interceptIndex ? 'intercept' : pickSlotTypeByWeight(nextDepth, dungeon.slotWeights);
            if (type === 'buff') type = Math.random() < 0.5 ? 'trap' : 'buff';
            const node: MapNode = {
                id,
                depth: nextDepth,
                type,
                revealed: false,
                nextIds: [],
            };
            if (slotNeedsRarity(type)) node.rarity = pickRarity(nextDepth, dungeon.rarityBias);
            this.nodePool.set(id, node);
            ids.push(id);
        }
        if (useMerge && existingAtDepth.length > 0) {
            const merge = existingAtDepth[Math.floor(Math.random() * existingAtDepth.length)];
            if (merge && ids.indexOf(merge.id) < 0) ids.push(merge.id);
        }
        node.nextIds = ids;
    }

    private getNodesAtDepth(depth: number): MapNode[] {
        return [...this.nodePool.values()].filter((n) => n.depth === depth);
    }

    private getSlotTypeName(type: SlotType, rarity?: Rarity): string {
        const names: Record<SlotType, string> = {
            empty: '空',
            herb: '灵植',
            stone: '灵石',
            treasure: '天材地宝',
            monster: '妖兽',
            trap: '机缘',
            buff: '机缘',
            intercept: '邪修截道',
            boss: 'Boss',
        };
        const base = names[type];
        if (rarity && slotNeedsRarity(type)) return `${RARITY_NAMES[rarity]}${base}`;
        return base;
    }

    /** 地图节点图标文案（妖兽=骷髅/战斗，机缘=？，资源=宝箱/灵植等） */
    private getSlotMapIcon(type: SlotType): string {
        const icons: Record<SlotType, string> = {
            empty: '空',
            herb: '灵植',
            stone: '灵石',
            treasure: '宝箱',
            monster: '妖兽',
            trap: '？',
            buff: '？',
            intercept: '截道',
            boss: 'Boss',
        };
        return icons[type];
    }

    /** 本层各类型比例文案（按当前秘境权重展示；邪修每10层1个；天材地宝仅Boss下一层；机缘55开好坏） */
    private getSlotRatioText(): string {
        const dungeon = this.getDungeonConfig();
        const w = dungeon.slotWeights;
        const total = w.herb + w.stone + w.treasure + w.monster + w.trap + w.buff;
        const pct = (value: number) => Math.round((value / total) * 100);
        return `灵植${pct(w.herb)}% 灵石${pct(w.stone)}% 妖兽${pct(w.monster)}% 机缘/陷阱${pct(w.buff + w.trap)}% 宝物${pct(w.treasure)}% · 邪修每10层1个`;
    }

    /** 分支节点在 map 上的 X 坐标（按个数均摊，控制在设计宽内不超框） */
    private getMapNodePositions(count: number): number[] {
        if (count <= 0) return [];
        if (count === 1) return [0];
        const span = 260;
        const step = count === 2 ? span : span * (2 / (count - 1));
        const start = count === 2 ? -span / 2 : -span;
        const out: number[] = [];
        for (let i = 0; i < count; i++) out.push(start + i * step);
        return out;
    }

    private refreshLayerUI() {
        const dungeon = this.getDungeonConfig();
        this.expeditionLayerLabel.string = `${dungeon.label} ${this.getCurrentDepth()}/${dungeon.maxDepth}层`;
        if (this.expeditionHpLabel)
            this.expeditionHpLabel.string = `生命 ${Math.ceil(this.playerHp)}/${this.playerMaxHp}`;
        if (this.expeditionManaLabel)
            this.expeditionManaLabel.string = `法力 ${Math.ceil(this.playerMana)}/${this.playerMaxMana}`;
        this.expeditionResLabel.string = `灵石 ${this.expeditionSpirit} | 灵药 ${this.expeditionHerbs} | 天材地宝 ${this.expeditionTreasure}${this.buffAtkPercent > 0 ? ' | 攻+' + (this.buffAtkPercent * 100) + '%' : ''}`;
        if (this.expeditionApLabel) this.expeditionApLabel.string = `行动力 ${this.actionPoints}/${this.actionPointMax}`;
        if (this.expeditionRatioLabel) this.expeditionRatioLabel.string = `${dungeon.label} · 下方显示下一层节点 · ${this.getSlotRatioText()} · 历史最高 ${this.dungeonBestDepth[dungeon.id]}/${dungeon.maxDepth}`;

        this.slotContainer.removeAllChildren();
        const pathFromY = 60;
        const nodeY = -100;
        const choices = this.getCurrentChoiceNodes();
        const xs = this.getMapNodePositions(choices.length);

        const pathNode = new Node('Paths');
        pathNode.layer = Layers.Enum.UI_2D;
        pathNode.setPosition(0, 0, 0);
        this.slotContainer.addChild(pathNode);
        const pathGfx = pathNode.addComponent(Graphics);
        pathGfx.strokeColor = new Color(120, 110, 95, 180);
        pathGfx.lineWidth = 2;
        for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            const dx = x - 0;
            const dy = nodeY - pathFromY;
            const len = Math.sqrt(dx * dx + dy * dy);
            const steps = Math.max(8, Math.floor(len / 12));
            for (let s = 0; s < steps; s++) {
                const t0 = s / steps;
                const t1 = (s + 0.5) / steps;
                if (t1 > 1) break;
                pathGfx.moveTo(0 + dx * t0, pathFromY + dy * t0);
                pathGfx.lineTo(0 + dx * t1, pathFromY + dy * t1);
                pathGfx.stroke();
            }
        }

        const currentPanel = this.createPanel(this.slotContainer, 100, 44, 0, pathFromY, new Color(72, 82, 92, 250));
        this.createLabel(currentPanel, '当前层', 20, new Vec3(0, 0, 0), new Color(255, 248, 220, 255));

        choices.forEach((slot, i) => {
            const x = xs[i];
            const hasRarity = slot.revealed && slot.rarity && slotNeedsRarity(slot.type);
            const isMonster = slot.revealed && slot.type === 'monster';
            const isBoss = slot.revealed && slot.type === 'boss';
            const panelBg = hasRarity
                ? new Color(RARITY_COLORS[slot.rarity!].r, RARITY_COLORS[slot.rarity!].g, RARITY_COLORS[slot.rarity!].b, 40)
                : isBoss ? new Color(120, 30, 30, 250)
                : isMonster ? new Color(90, 40, 40, 250)
                : new Color(48, 52, 58, 250);
            const panel = this.createPanel(this.slotContainer, 120, 100, x, nodeY, panelBg);
            const text = slot.revealed ? this.getSlotTypeName(slot.type, slot.rarity) : '？';
            const color = hasRarity ? RARITY_COLORS[slot.rarity!]
                : isBoss ? new Color(255, 80, 80, 255)
                : isMonster ? new Color(240, 150, 150, 255)
                : (slot.revealed ? new Color(200, 220, 240, 255) : new Color(255, 240, 180, 255));
            this.createLabel(panel, text, slot.revealed ? 16 : 28, new Vec3(0, 0, 0), color);
            const ring = panel.addComponent(Graphics);
            const ringColor = hasRarity ? RARITY_COLORS[slot.rarity!]
                : isBoss ? new Color(255, 60, 60, 220)
                : isMonster ? new Color(220, 120, 120, 200)
                : new Color(140, 130, 120, 200);
            ring.strokeColor = ringColor;
            ring.lineWidth = (hasRarity || isBoss) ? 3 : 2;
            ring.circle(0, 0, 48);
            ring.stroke();
            if (slot.revealed) {
                panel.on(Node.EventType.TOUCH_END, () => this.onRevealedSlotTap(i), this);
            } else {
                panel.on(Node.EventType.TOUCH_END, () => this.onSlotTap(i), this);
            }
        });

        if (this.nextLayerBtn) this.nextLayerBtn.active = false;

        this.withdrawBtn.active = true;
        if (this.withdrawBtnLabel) {
            if (this.canWithdrawSafelyAtCurrentNode()) {
                this.withdrawBtnLabel.string = '安全撤离(100%)';
                this.withdrawBtnLabel.color = new Color(180, 255, 180, 255);
            } else {
                const ratioPct = 50 + (this.getCurrentDepth() - 1) * 0.5;
                this.withdrawBtnLabel.string = `紧急撤离(${ratioPct.toFixed(0)}%)`;
                this.withdrawBtnLabel.color = new Color(255, 220, 200, 255);
            }
        }

        const revealedCount = choices.filter((s) => s.revealed).length;
        const returnCost = 1 + Math.max(0, revealedCount - 1);
        const canReturn = this.pathStack.length > 0 && this.actionPoints >= returnCost;
        if (this.returnToPrevBtnLabel) {
            this.returnToPrevBtnLabel.string = this.pathStack.length === 0 ? '已在起点' : `返回上一层(消耗${returnCost})`;
            this.returnToPrevBtnLabel.color = canReturn ? new Color(255, 220, 200, 255) : new Color(140, 140, 140, 255);
        }

        if (this.interceptPanelVisible) {
            this.slotContainer.active = false;
            this.returnToPrevBtn.active = false;
            this.withdrawBtn.active = false;
            if (this.interceptOverlay) {
                this.interceptOverlay.active = true;
                this.interceptOverlay.setSiblingIndex(this.expeditionLayer.children.length - 1);
            }
            this.interceptPanel.active = true;
            this.interceptPanel.setSiblingIndex(this.expeditionLayer.children.length - 1);
        }
    }

    /** 首次点击「？」：消耗 1 点行动力并揭示；邪修截道立即强制触发 */
    private onSlotTap(index: number) {
        if (this.interceptPanelVisible) return;
        const choices = this.getCurrentChoiceNodes();
        const slot = choices[index];
        if (!slot || slot.revealed) return;
        if (this.actionPoints < 1) return;
        this.actionPoints -= 1;
        slot.revealed = true;
        if (slot.type === 'intercept') {
            this.combatSlotIndex = index;
            this.interceptPanelVisible = true;
            this.refreshLayerUI();
            return;
        }
        this.refreshLayerUI();
    }

    /** 再次点击已揭示的格子：弹出执行/继续探查 */
    private onRevealedSlotTap(index: number) {
        if (this.interceptPanelVisible) return;
        const choices = this.getCurrentChoiceNodes();
        const slot = choices[index];
        if (!slot || !slot.revealed) return;
        this.pendingRevealedIndex = index;
        this.showRevealChoicePanel();
    }

    private showRevealChoicePanel() {
        if (this.interceptPanelVisible) return;
        const index = this.pendingRevealedIndex;
        const choices = this.getCurrentChoiceNodes();
        const slot = index >= 0 && index < choices.length ? choices[index] : null;
        if (!slot) return;
        const isIntercept = slot.type === 'intercept';
        const execCost = isIntercept ? 0 : ACTION_COST[slot.type];
        const canExec = isIntercept || this.actionPoints >= execCost;

        this.choiceDiscoverLabel.string = `发现：${this.getSlotTypeName(slot.type, slot.rarity)}`;
        this.choiceDiscoverLabel.color = (slot.rarity && slotNeedsRarity(slot.type)) ? RARITY_COLORS[slot.rarity] : new Color(255, 248, 200, 255);
        this.choiceExecuteLabel.string = isIntercept ? '执行(不消耗行动力)' : `执行 消耗${execCost}行动力`;
        this.choiceExecuteLabel.color = canExec ? new Color(180, 220, 200, 255) : new Color(120, 120, 120, 255);
        this.choicePanel.active = true;
        this.choiceCanExecute = canExec;
    }

    private choiceCanExecute = false;

    private onChoiceExecute() {
        if (this.interceptPanelVisible) return;
        const index = this.pendingRevealedIndex;
        const choices = this.getCurrentChoiceNodes();
        const slot = index >= 0 && index < choices.length ? choices[index] : null;
        if (!slot || !this.choiceCanExecute) return;
        if (slot.type !== 'intercept') {
            const cost = ACTION_COST[slot.type];
            if (this.actionPoints < cost) return;
            this.actionPoints = Math.max(0, this.actionPoints - cost);
        }
        this.choicePanel.active = false;
        this.pendingRevealedIndex = -1;

        this.combatSlotIndex = index;
        this.combatNodeId = slot.id;
        this.combatIsBoss = slot.type === 'boss';
        if (slot.type === 'monster') {
            this.enterCombat();
            return;
        }
        if (slot.type === 'boss') {
            this.pathStack.push(this.currentNodeId);
            this.currentNodeId = slot.id;
            this.ensureNextNodes(slot.id);
            this.refreshLayerUI();
            this.enterCombat();
            return;
        }
        if (slot.type === 'trap' || slot.type === 'buff') {
            this.lotterySlotAlreadyTriggered = !!slot.triggered;
            this.showLotteryWheel(slot.type === 'buff');
            return;
        }
        if (slot.type === 'intercept') {
            this.interceptPanelVisible = true;
            this.returnToPrevBtn.active = false;
            this.withdrawBtn.active = false;
            this.setOtherButtonsGreyed(true);
            if (this.slotContainer.parent) this.slotContainer.removeFromParent();
            if (this.interceptOverlay) {
                this.interceptOverlay.active = true;
                this.interceptOverlay.setSiblingIndex(this.expeditionLayer.children.length - 1);
            }
            this.interceptPanel.active = true;
            this.interceptPanel.setSiblingIndex(this.expeditionLayer.children.length - 1);
            return;
        }
        this.resolveSlotAsNode(slot);
        this.advanceToNode(slot.id);
    }

    private setOtherButtonsGreyed(greyed: boolean) {
        const grey = new Color(110, 110, 110, 255);
        if (this.returnToPrevBtnLabel) this.returnToPrevBtnLabel.color = greyed ? grey : new Color(255, 220, 200, 255);
        if (this.withdrawBtnLabel) this.withdrawBtnLabel.color = greyed ? grey : new Color(255, 220, 200, 255);
    }

    private onInterceptFlee() {
        const choices = this.getCurrentChoiceNodes();
        const slot = this.combatSlotIndex >= 0 && this.combatSlotIndex < choices.length ? choices[this.combatSlotIndex] : null;
        if (!slot) return;
        this.interceptPanelVisible = false;
        if (this.interceptOverlay) this.interceptOverlay.active = false;
        this.interceptPanel.active = false;
        this.restoreExpeditionSlotContainer();
        this.slotContainer.active = true;
        this.returnToPrevBtn.active = true;
        this.withdrawBtn.active = true;
        this.setOtherButtonsGreyed(false);
        const pct = 0.01 + Math.random() * 0.19;
        this.expeditionSpirit = Math.floor(this.expeditionSpirit * (1 - pct));
        this.expeditionHerbs = Math.floor(this.expeditionHerbs * (1 - pct));
        this.expeditionTreasure = Math.floor(this.expeditionTreasure * (1 - pct));
        slot.triggered = true;
        this.advanceToNode(slot.id);
        this.combatSlotIndex = -1;
        this.combatNodeId = '';
    }

    private onInterceptFight() {
        const choices = this.getCurrentChoiceNodes();
        const slot = this.combatSlotIndex >= 0 && this.combatSlotIndex < choices.length ? choices[this.combatSlotIndex] : null;
        if (!slot) return;
        this.interceptPanelVisible = false;
        if (this.interceptOverlay) this.interceptOverlay.active = false;
        this.interceptPanel.active = false;
        this.restoreExpeditionSlotContainer();
        this.slotContainer.active = true;
        this.returnToPrevBtn.active = true;
        this.withdrawBtn.active = true;
        this.setOtherButtonsGreyed(false);
        this.combatIsIntercept = true;
        this.combatNodeId = slot.id;
        this.enterCombat();
    }

    private onChoiceReturn() {
        if (this.interceptPanelVisible) return;
        const choices = this.getCurrentChoiceNodes();
        const revealedCount = choices.filter((s) => s.revealed).length;
        const returnCost = 1 + Math.max(0, revealedCount - 1);
        if (this.pathStack.length === 0 || this.actionPoints < returnCost) return;
        this.actionPoints = Math.max(0, this.actionPoints - returnCost);
        this.currentNodeId = this.pathStack.pop()!;
        this.choicePanel.active = false;
        this.pendingRevealedIndex = -1;
        this.refreshLayerUI();
    }

    private onChoiceContinueExplore() {
        if (this.interceptPanelVisible) return;
        this.choicePanel.active = false;
        this.pendingRevealedIndex = -1;
        this.refreshLayerUI();
    }

    /** 机缘：增益 7 个 + 减益 1 个；陷阱：减益 7 个 + 增益 1 个，打乱后组成 8 格转盘 */
    private buildLotteryWheel(isBuffSlot: boolean): LotteryWheelEntry[] {
        const seven = isBuffSlot ? pickRandom(BENEFIT_POOL, 7) : pickRandom(DEBUFF_POOL, 7);
        const one = isBuffSlot ? pickRandom(DEBUFF_POOL, 1) : pickRandom(BENEFIT_POOL, 1);
        return shuffle([...seven, ...one]);
    }

    private getLotteryLevelColor(value: number): Color {
        if (value >= 15) return new Color(184, 152, 86, 255);
        if (value >= 10) return new Color(116, 88, 148, 255);
        return new Color(74, 112, 122, 255);
    }

    private drawLotteryPointer() {
        if (!this.lotteryPointerGfx) return;
        const pg = this.lotteryPointerGfx;
        pg.clear();
        if (this.lotteryIsBuffContext) {
            pg.fillColor = new Color(102, 128, 126, 255);
            pg.roundRect(-3, -8, 6, 20, 2);
            pg.fill();
            pg.fillColor = new Color(187, 160, 103, 255);
            pg.roundRect(-5, 10, 10, 18, 3);
            pg.fill();
            pg.fillColor = new Color(220, 194, 130, 255);
            pg.moveTo(0, 44);
            pg.lineTo(-12, 18);
            pg.lineTo(12, 18);
            pg.close();
            pg.fill();
        } else {
            pg.fillColor = new Color(96, 72, 92, 255);
            pg.roundRect(-3, -8, 6, 20, 2);
            pg.fill();
            pg.fillColor = new Color(136, 74, 94, 255);
            pg.roundRect(-5, 10, 10, 18, 3);
            pg.fill();
            pg.fillColor = new Color(196, 92, 108, 255);
            pg.moveTo(0, 44);
            pg.lineTo(-12, 18);
            pg.lineTo(12, 18);
            pg.close();
            pg.fill();
        }
    }

    private getLotteryShortName(entry: LotteryWheelEntry): string {
        const v = entry.effect.value;
        switch (entry.effect.type) {
            case 'restoreHp':
                return `气血+${v}%`;
            case 'restoreMana':
                return `灵力+${v}%`;
            case 'restoreAction':
                return `行动力+${v}%`;
            case 'reduceHp':
                return `气血-${v}%`;
            case 'reduceMana':
                return `灵力-${v}%`;
            case 'reduceAction':
                return `行动力-${v}%`;
            default:
                return entry.name;
        }
    }

    private drawLotteryWheelSegments() {
        this.lotteryWheelNode.removeAllChildren();
        const oldG = this.lotteryWheelNode.getComponent(Graphics);
        if (oldG) oldG.destroy();

        const OUTER_R = 248;
        const INNER_R = 112;
        const SEG_COUNT = 8;
        const SEG_ANGLE = 360 / SEG_COUNT;
        const entries = this.lotteryWheelEntries;
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const TOP_OFFSET = 90;

        const runeRing = new Node('RuneRing');
        runeRing.layer = Layers.Enum.UI_2D;
        this.lotteryWheelNode.addChild(runeRing);
        runeRing.addComponent(UITransform).setContentSize(OUTER_R * 2 + 40, OUTER_R * 2 + 40);
        const rg = runeRing.addComponent(Graphics);
        rg.strokeColor = this.lotteryIsBuffContext ? new Color(86, 108, 102, 150) : new Color(120, 74, 98, 150);
        rg.lineWidth = 2;
        rg.circle(0, 0, OUTER_R + 14);
        rg.stroke();
        rg.strokeColor = this.lotteryIsBuffContext ? new Color(176, 150, 96, 120) : new Color(172, 84, 110, 120);
        rg.lineWidth = 1;
        rg.circle(0, 0, OUTER_R - 2);
        rg.stroke();
        for (let i = 0; i < SEG_COUNT; i++) {
            const a = toRad(TOP_OFFSET + i * SEG_ANGLE);
            const x = (OUTER_R + 14) * Math.cos(a);
            const y = (OUTER_R + 14) * Math.sin(a);
            rg.fillColor = this.lotteryIsBuffContext ? new Color(176, 150, 96, 150) : new Color(172, 84, 110, 150);
            rg.circle(x, y, 4);
            rg.fill();
        }
        if (this.lotteryIsBuffContext) {
            rg.strokeColor = new Color(96, 146, 136, 110);
            rg.lineWidth = 1;
            rg.circle(0, 0, OUTER_R + 28);
            rg.stroke();
            rg.strokeColor = new Color(188, 168, 118, 100);
            rg.lineWidth = 1;
            for (let i = 0; i < 24; i++) {
                const a = toRad(i * 15);
                const r1 = OUTER_R + 6;
                const r2 = OUTER_R + 10;
                const dx = 2;
                rg.moveTo(r1 * Math.cos(a), r1 * Math.sin(a));
                rg.lineTo(r2 * Math.cos(a) + dx * Math.cos(a + 0.3), r2 * Math.sin(a) + dx * Math.sin(a + 0.3));
                rg.lineTo((r2 + 4) * Math.cos(a), (r2 + 4) * Math.sin(a));
                rg.stroke();
            }
            for (let k = 0; k < 8; k++) {
                const baseA = toRad(TOP_OFFSET + k * 45 + 12);
                const r0 = OUTER_R - 18;
                rg.strokeColor = new Color(200, 182, 128, 85);
                rg.lineWidth = 1;
                rg.arc(0, 0, r0, baseA, baseA + toRad(18), false);
                rg.stroke();
            }
        } else {
            rg.strokeColor = new Color(128, 54, 78, 95);
            rg.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                const a = toRad(45 + i * 90);
                rg.moveTo(0, 0);
                rg.lineTo((OUTER_R + 28) * Math.cos(a), (OUTER_R + 28) * Math.sin(a));
                rg.stroke();
            }
            rg.fillColor = new Color(100, 48, 72, 55);
            rg.circle(0, 0, OUTER_R + 32);
            rg.fill();
            rg.strokeColor = new Color(160, 70, 100, 75);
            rg.lineWidth = 1;
            for (let r = OUTER_R + 8; r <= OUTER_R + 24; r += 6) {
                rg.circle(0, 0, r);
                rg.stroke();
            }
            for (let i = 0; i < 12; i++) {
                const a = toRad(i * 30);
                const rIn = INNER_R + 8;
                const rOut = OUTER_R - 10;
                const a2 = a + 0.12;
                rg.strokeColor = new Color(150, 68, 95, 70);
                rg.moveTo(rIn * Math.cos(a), rIn * Math.sin(a));
                rg.lineTo((rIn + rOut) * 0.5 * Math.cos(a + 0.06), (rIn + rOut) * 0.5 * Math.sin(a + 0.06));
                rg.lineTo(rOut * Math.cos(a2), rOut * Math.sin(a2));
                rg.stroke();
            }
        }

        const ARC_STEPS = 12;
        for (let i = 0; i < SEG_COUNT; i++) {
            const seg = new Node(`Seg_${i}`);
            seg.layer = Layers.Enum.UI_2D;
            this.lotteryWheelNode.addChild(seg);
            const startDeg = TOP_OFFSET - SEG_ANGLE / 2 + i * SEG_ANGLE;
            const endDeg = startDeg + SEG_ANGLE;
            const startRad = toRad(startDeg);
            const endRad = toRad(endDeg);
            const gfx = seg.addComponent(Graphics);

            gfx.fillColor = this.lotteryIsBuffContext ? new Color(28, 42, 40, 242) : new Color(42, 24, 32, 242);
            gfx.moveTo(INNER_R * Math.cos(startRad), INNER_R * Math.sin(startRad));
            for (let step = 0; step <= ARC_STEPS; step++) {
                const t = step / ARC_STEPS;
                const angle = startRad + (endRad - startRad) * t;
                gfx.lineTo(OUTER_R * Math.cos(angle), OUTER_R * Math.sin(angle));
            }
            for (let step = ARC_STEPS; step >= 0; step--) {
                const t = step / ARC_STEPS;
                const angle = startRad + (endRad - startRad) * t;
                gfx.lineTo(INNER_R * Math.cos(angle), INNER_R * Math.sin(angle));
            }
            gfx.close();
            gfx.fill();

            const levelColor = this.getLotteryLevelColor(entries[i].effect.value);
            gfx.strokeColor = new Color(levelColor.r, levelColor.g, levelColor.b, 235);
            gfx.lineWidth = 3;
            gfx.moveTo(INNER_R * Math.cos(startRad), INNER_R * Math.sin(startRad));
            for (let step = 0; step <= ARC_STEPS; step++) {
                const t = step / ARC_STEPS;
                const angle = startRad + (endRad - startRad) * t;
                gfx.lineTo(OUTER_R * Math.cos(angle), OUTER_R * Math.sin(angle));
            }
            for (let step = ARC_STEPS; step >= 0; step--) {
                const t = step / ARC_STEPS;
                const angle = startRad + (endRad - startRad) * t;
                gfx.lineTo(INNER_R * Math.cos(angle), INNER_R * Math.sin(angle));
            }
            gfx.close();
            gfx.stroke();

            gfx.fillColor = new Color(levelColor.r, levelColor.g, levelColor.b, this.lotteryIsBuffContext ? 62 : 84);
            gfx.moveTo((OUTER_R - 10) * Math.cos(startRad), (OUTER_R - 10) * Math.sin(startRad));
            for (let step = 0; step <= ARC_STEPS; step++) {
                const t = step / ARC_STEPS;
                const angle = startRad + (endRad - startRad) * t;
                gfx.lineTo(OUTER_R * Math.cos(angle), OUTER_R * Math.sin(angle));
            }
            for (let step = ARC_STEPS; step >= 0; step--) {
                const t = step / ARC_STEPS;
                const angle = startRad + (endRad - startRad) * t;
                gfx.lineTo((OUTER_R - 10) * Math.cos(angle), (OUTER_R - 10) * Math.sin(angle));
            }
            gfx.close();
            gfx.fill();

            const runeMid = (startRad + endRad) * 0.5;
            const runeInner = INNER_R + 20;
            const runeOuter = INNER_R + 36;
            gfx.strokeColor = this.lotteryIsBuffContext ? new Color(190, 174, 132, 110) : new Color(180, 96, 122, 110);
            gfx.lineWidth = 1;
            gfx.moveTo(runeInner * Math.cos(runeMid), runeInner * Math.sin(runeMid));
            gfx.lineTo(runeOuter * Math.cos(runeMid), runeOuter * Math.sin(runeMid));
            gfx.stroke();
            if (this.lotteryIsBuffContext) {
                const cloudR = (INNER_R + OUTER_R) * 0.42;
                gfx.strokeColor = new Color(140, 170, 158, 75);
                gfx.arc(0, 0, cloudR, runeMid - 0.08, runeMid + 0.08, false);
                gfx.stroke();
                gfx.arc(0, 0, cloudR - 18, runeMid - 0.05, runeMid + 0.06, false);
                gfx.stroke();
            } else {
                const spikeR = OUTER_R - 22;
                gfx.fillColor = new Color(166, 82, 108, 90);
                gfx.moveTo(spikeR * Math.cos(runeMid), spikeR * Math.sin(runeMid));
                gfx.lineTo((spikeR - 12) * Math.cos(runeMid - 0.06), (spikeR - 12) * Math.sin(runeMid - 0.06));
                gfx.lineTo((spikeR - 12) * Math.cos(runeMid + 0.06), (spikeR - 12) * Math.sin(runeMid + 0.06));
                gfx.close();
                gfx.fill();
            }
        }

        const center = new Node('CenterDisk');
        center.layer = Layers.Enum.UI_2D;
        this.lotteryWheelNode.addChild(center);
        center.addComponent(UITransform).setContentSize(INNER_R * 2, INNER_R * 2);
        const cg = center.addComponent(Graphics);
        cg.fillColor = this.lotteryIsBuffContext ? new Color(18, 28, 30, 255) : new Color(30, 18, 24, 255);
        cg.circle(0, 0, INNER_R - 8);
        cg.fill();
        cg.strokeColor = this.lotteryIsBuffContext ? new Color(154, 134, 92, 220) : new Color(178, 86, 116, 220);
        cg.lineWidth = 2;
        cg.circle(0, 0, INNER_R - 8);
        cg.stroke();
        cg.strokeColor = this.lotteryIsBuffContext ? new Color(82, 122, 112, 180) : new Color(112, 56, 76, 180);
        cg.lineWidth = 1;
        cg.circle(0, 0, INNER_R - 24);
        cg.stroke();
        if (this.lotteryIsBuffContext) {
            cg.moveTo(-24, 0);
            cg.lineTo(24, 0);
            cg.moveTo(0, -24);
            cg.lineTo(0, 24);
            cg.moveTo(-17, -17);
            cg.lineTo(17, 17);
            cg.moveTo(-17, 17);
            cg.lineTo(17, -17);
            cg.stroke();
            cg.strokeColor = new Color(178, 158, 108, 160);
            cg.lineWidth = 1.5;
            const baguaR = 38;
            for (let i = 0; i < 8; i++) {
                const a = toRad(i * 45);
                const solid = (i % 2) === 0;
                for (let line = 0; line < 3; line++) {
                    const off = (line - 1) * 6;
                    const x0 = (baguaR - 14 + line * 2) * Math.cos(a) + off * Math.cos(a + Math.PI / 2);
                    const y0 = (baguaR - 14 + line * 2) * Math.sin(a) + off * Math.sin(a + Math.PI / 2);
                    const x1 = (baguaR + 14 - line * 2) * Math.cos(a) + off * Math.cos(a + Math.PI / 2);
                    const y1 = (baguaR + 14 - line * 2) * Math.sin(a) + off * Math.sin(a + Math.PI / 2);
                    if (solid) {
                        cg.moveTo(x0, y0);
                        cg.lineTo(x1, y1);
                        cg.stroke();
                    } else {
                        const mx = (x0 + x1) / 2;
                        const my = (y0 + y1) / 2;
                        cg.moveTo(x0, y0);
                        cg.lineTo(mx, my);
                        cg.stroke();
                        cg.moveTo(mx, my);
                        cg.lineTo(x1, y1);
                        cg.stroke();
                    }
                }
            }
            cg.strokeColor = new Color(120, 160, 150, 90);
            cg.lineWidth = 1;
            for (let w = 0; w < 3; w++) {
                const r = 28 + w * 8;
                cg.arc(0, 0, r, 0, Math.PI * 2, false);
                cg.stroke();
            }
        } else {
            for (let i = 0; i < 6; i++) {
                const a = toRad(i * 60);
                const b = toRad(i * 60 + 180);
                cg.moveTo(22 * Math.cos(a), 22 * Math.sin(a));
                cg.lineTo(22 * Math.cos(b), 22 * Math.sin(b));
                cg.stroke();
            }
            cg.strokeColor = new Color(168, 74, 102, 120);
            cg.lineWidth = 1;
            cg.circle(0, 0, 12);
            cg.stroke();
        }
        const centerLabel = this.createLabel(
            center,
            this.lotteryIsBuffContext ? '福兮\n祸所伏' : '祸兮\n福所倚',
            24,
            new Vec3(0, 0, 0),
            this.lotteryIsBuffContext ? new Color(228, 222, 198, 255) : new Color(230, 198, 206, 255),
            150
        );
        centerLabel.lineHeight = 28;

        const labelParent = new Node('WheelLabels');
        labelParent.layer = Layers.Enum.UI_2D;
        this.lotteryWheelNode.addChild(labelParent);
        const labelR = (OUTER_R + INNER_R) * 0.5;
        for (let i = 0; i < SEG_COUNT; i++) {
            const midDeg = TOP_OFFSET - SEG_ANGLE / 2 + (i + 0.5) * SEG_ANGLE;
            const midRad = toRad(midDeg);
            const labelNode = new Node(`Lbl_${i}`);
            labelNode.layer = Layers.Enum.UI_2D;
            labelParent.addChild(labelNode);
            labelNode.setPosition(labelR * Math.cos(midRad), labelR * Math.sin(midRad), 0);
            labelNode.angle = midDeg;
            labelNode.addComponent(UITransform).setContentSize(108, 42);
            const lbl = labelNode.addComponent(Label);
            lbl.string = this.getLotteryShortName(entries[i]);
            lbl.fontSize = 16;
            lbl.lineHeight = 20;
            lbl.color = this.lotteryIsBuffContext ? new Color(224, 230, 214, 255) : new Color(230, 210, 220, 255);
            lbl.horizontalAlign = HorizontalTextAlignment.CENTER;
            lbl.overflow = Label.Overflow.SHRINK;
        }
    }

    private lotteryIsBuffContext = false;

    private showLotteryWheel(isBuffSlot: boolean) {
        this.state = 'lottery';
        this.lotteryLayer.active = true;
        this.lotteryIsBuffContext = isBuffSlot;
        this.lotteryWheelEntries = this.buildLotteryWheel(isBuffSlot);
        this.lotteryTitleLabel.string = isBuffSlot ? '福兮祸所伏' : '祸兮福所倚';
        this.lotteryTitleLabel.color = isBuffSlot ? new Color(228, 213, 168, 255) : new Color(214, 132, 152, 255);
        if (this.lotterySubtitleLabel) {
            this.lotterySubtitleLabel.string = isBuffSlot ? '仙门法器  灵机自显' : '诡阵迷离  劫数自生';
            this.lotterySubtitleLabel.color = isBuffSlot ? new Color(130, 162, 150, 255) : new Color(146, 92, 112, 255);
        }
        this.lotteryResultLabel.string = isBuffSlot ? '灵机流转，且看天意落于何方' : '劫数已起，且看因果落于何方';
        this.lotteryResultLabel.color = isBuffSlot ? new Color(176, 206, 186, 255) : new Color(214, 186, 186, 255);
        this.drawLotteryPointer();
        this.lotteryWheelNode.angle = 0;
        this.drawLotteryWheelSegments();
        this.lotterySpinBtn.active = true;
    }

    private runLotterySpin() {
        this.lotterySpinBtn.active = false;
        this.lotteryResultIndex = Math.floor(Math.random() * 8);
        const segAngle = 45;
        const totalRotation = 360 * 4 + (90 - this.lotteryResultIndex * segAngle - segAngle / 2);
        tween(this.lotteryWheelNode)
            .to(2.5, { angle: totalRotation }, { easing: 'sineOut' })
            .call(() => {
                const entry = this.lotteryWheelEntries[this.lotteryResultIndex];
                this.applyLotteryEffect(entry);
                this.lotteryResultLabel.string = `天机所示：${entry.name}`;
                this.lotteryResultLabel.color = entry.isBenefit ? new Color(184, 220, 196, 255) : new Color(226, 180, 180, 255);
                this.scheduleOnce(() => this.closeLotteryAndResume(), 1.2);
            })
            .start();
    }

    private applyLotteryEffect(entry: LotteryWheelEntry) {
        if (this.lotterySlotAlreadyTriggered) return;
        const e = entry.effect;
        switch (e.type) {
            case 'restoreHp': {
                const add = Math.ceil(this.playerMaxHp * (e.value / 100));
                this.playerHp = Math.min(this.playerMaxHp, this.playerHp + add);
                break;
            }
            case 'restoreMana': {
                const add = Math.ceil(this.playerMaxMana * (e.value / 100));
                this.playerMana = Math.min(this.playerMaxMana, this.playerMana + add);
                break;
            }
            case 'restoreAction': {
                const add = Math.ceil(this.actionPointMax * (e.value / 100));
                this.actionPoints = Math.min(this.actionPointMax, this.actionPoints + add);
                break;
            }
            case 'reduceHp': {
                const dmg = Math.ceil(this.playerMaxHp * (e.value / 100));
                this.playerHp = Math.max(0, this.playerHp - dmg);
                if (this.playerHp <= 0) this.endExpeditionDeath();
                break;
            }
            case 'reduceMana': {
                const cost = Math.ceil(this.playerMaxMana * (e.value / 100));
                this.playerMana = Math.max(0, this.playerMana - cost);
                break;
            }
            case 'reduceAction': {
                const cost = Math.ceil(this.actionPointMax * (e.value / 100));
                this.actionPoints = Math.max(0, this.actionPoints - cost);
                break;
            }
            default:
                break;
        }
    }

    private closeLotteryAndResume() {
        this.state = 'expedition_path';
        this.lotteryLayer.active = false;
        if (this.playerHp <= 0) return;
        if (this.combatSlotIndex >= 0) {
            const choices = this.getCurrentChoiceNodes();
            const slot = choices[this.combatSlotIndex];
            if (slot) {
                slot.triggered = true;
                this.advanceToNode(slot.id);
                this.combatSlotIndex = -1;
                this.combatNodeId = '';
                return;
            }
        }
        this.combatSlotIndex = -1;
        this.combatNodeId = '';
        this.refreshLayerUI();
    }

    private resolveSlotAsNode(slot: MapNode) {
        if (slot.triggered) return;
        slot.triggered = true;
        const depth = slot.depth;
        const rarityMul = slot.rarity ? RARITY_MULTIPLIER[slot.rarity] : 1;
        switch (slot.type) {
            case 'herb': {
                const mul = rarityMul * this.getDungeonLootMultiplier('herb');
                this.expeditionHerbs += Math.max(1, Math.floor((4 + Math.floor(depth / 4)) * mul));
                break;
            }
            case 'stone': {
                const mul = rarityMul * this.getDungeonLootMultiplier('stone');
                this.expeditionSpirit += Math.max(1, Math.floor((10 + Math.floor(depth / 2)) * mul));
                break;
            }
            case 'treasure': {
                const mul = rarityMul * this.getDungeonLootMultiplier('treasure');
                this.expeditionSpirit += Math.max(1, Math.floor((30 + depth * 3) * mul));
                this.expeditionHerbs += Math.max(1, Math.floor((6 + Math.floor(depth / 4)) * mul));
                this.expeditionTreasure += Math.max(2, Math.floor(2 * mul));
                break;
            }
            case 'empty':
                break;
            case 'trap':
            case 'buff':
                break;
            default:
                break;
        }
    }

    /** 移动到目标节点（压栈、设当前、生成其下一跳；深度>100 则结算） */
    private advanceToNode(nodeId: string) {
        this.pathStack.push(this.currentNodeId);
        this.currentNodeId = nodeId;
        this.pendingRevealedIndex = -1;
        const dungeon = this.getDungeonConfig();
        if (this.getCurrentDepth() >= dungeon.maxDepth) {
            this.endExpedition(true);
            return;
        }
        this.ensureNextNodes(nodeId);
        this.refreshLayerUI();
    }

    private goNextLayer() {
        if (this.interceptPanelVisible) return;
        this.refreshLayerUI();
    }

    /** 仙人指路：跳到指定深度（新建节点并设为当前） */
    private jumpToDepth(depth: number) {
        const jumpId = nextNodeId();
        this.nodePool.set(jumpId, {
            id: jumpId,
            depth,
            type: 'herb',
            revealed: true,
            nextIds: [],
        });
        this.pathStack.push(this.currentNodeId);
        this.currentNodeId = jumpId;
        this.ensureNextNodes(jumpId);
        this.refreshLayerUI();
    }

    private withdrawExpedition() {
        if (this.interceptPanelVisible) return;
        this.endExpeditionWithdraw(this.canWithdrawSafelyAtCurrentNode());
    }

    /** 撤离：安全撤离 100%；否则按 50% + 每层 0.5% 带走资源 */
    private endExpeditionWithdraw(safe: boolean) {
        this.recordDungeonProgress();
        this.state = 'result';
        this.expeditionLayer.active = false;
        this.resultLayer.active = true;

        let ratio = safe ? 1 : Math.min(1, 0.8 + (this.getCurrentDepth() - 1) * 0.003);
        ratio *= this.retreatRatioMultiplier;
        const takeSpirit = Math.floor(this.expeditionSpirit * ratio);
        const takeHerbs = Math.floor(this.expeditionHerbs * ratio);
        const takeTreasure = Math.floor(this.expeditionTreasure * ratio);
        const expBase = this.expeditionHerbs * EXP_PER_HERB + this.expeditionTreasure * EXP_PER_TREASURE;
        const takeExp = Math.floor(expBase * ratio);

        this.spiritStone += takeSpirit;
        this.realmExp += takeExp;

        const dungeon = this.getDungeonConfig();
        const ratioPct = (ratio * 100).toFixed(0);
        this.resultLabel.string = safe
            ? `${dungeon.label} 安全撤离（击败Boss）\n深度 ${this.getCurrentDepth()}/${dungeon.maxDepth}\n带走灵石 ${takeSpirit}，灵药 ${takeHerbs}，天材地宝 ${takeTreasure}\n修为 +${takeExp}`
            : `${dungeon.label} 紧急撤离（带走 ${ratioPct}%）\n深度 ${this.getCurrentDepth()}/${dungeon.maxDepth}\n带走灵石 ${takeSpirit}，灵药 ${takeHerbs}，天材地宝 ${takeTreasure}\n修为 +${takeExp}`;
    }

    private endExpedition(reachedExit: boolean) {
        this.recordDungeonProgress();
        this.state = 'result';
        this.expeditionLayer.active = false;
        this.resultLayer.active = true;
        this.spiritStone += this.expeditionSpirit;
        const expGain = this.expeditionHerbs * EXP_PER_HERB + this.expeditionTreasure * EXP_PER_TREASURE + (reachedExit ? 100 : 0);
        this.realmExp += expGain;
        const dungeon = this.getDungeonConfig();
        this.resultLabel.string = `${dungeon.label}\n深度 ${this.getCurrentDepth()}/${dungeon.maxDepth}\n获得灵石 ${this.expeditionSpirit}，灵药 ${this.expeditionHerbs}，天材地宝 ${this.expeditionTreasure}\n修为 +${expGain}\n${reachedExit ? `通关${dungeon.maxDepth}层！` : '已撤出秘境'}`;
    }

    private endExpeditionDeath() {
        this.recordDungeonProgress();
        this.state = 'result';
        this.expeditionLayer.active = false;
        this.lotteryLayer.active = false;
        this.resultLayer.active = true;
        this.spiritStone += Math.floor(this.expeditionSpirit * 0.7);
        this.realmExp += Math.floor((this.expeditionHerbs * EXP_PER_HERB + this.expeditionTreasure * EXP_PER_TREASURE) * 0.5);
        const dungeon = this.getDungeonConfig();
        this.resultLabel.string = `神识受损，撤回避难洞府\n${dungeon.label} 深度 ${this.getCurrentDepth()}/${dungeon.maxDepth}\n保留部分收获：灵石 ${Math.floor(this.expeditionSpirit * 0.7)}，修为 +${Math.floor((this.expeditionHerbs * EXP_PER_HERB + this.expeditionTreasure * EXP_PER_TREASURE) * 0.5)}`;
    }

    private enterCombat() {
        this.state = 'combat';
        this.expeditionLayer.active = false;
        this.lotteryLayer.active = false;
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
        const hintText = this.combatIsIntercept ? '邪修截道！' : this.combatIsBoss ? 'Boss 现身！' : '妖兽现身！';
        const hint = this.createLabel(this.combatLayer, hintText, 28, new Vec3(0, 0, 0), new Color(255, 220, 100, 255));
        this.scheduleOnce(() => { if (hint.node.isValid) hint.node.destroy(); }, 0.6);
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
        const put = this.playerNode.addComponent(UITransform);
        put.setContentSize(90, 100);
        put.setAnchorPoint(0.5, 0.5);
        this.playerRig = this.createCharacterRig(this.playerNode, new Color(90, 100, 120, 255), new Color(200, 210, 230, 255));
    }

    private spawnEnemies() {
        this.enemies = [];
        const isIntercept = this.combatIsIntercept;
        const isBoss = this.combatIsBoss;
        const dungeon = this.getDungeonConfig();
        const count = 1;
        const slot = this.getCombatNode();
        const layer = slot ? slot.depth : this.getCurrentDepth();
        for (let i = 0; i < count; i++) {
            const en = new Node(isIntercept ? '邪修' : isBoss ? 'Boss' : `Enemy_${i}`);
            en.layer = Layers.Enum.UI_2D;
            this.combatLayer.addChild(en);
            en.setPosition(160 + i * 120, -120 + i * 40, 0);
            const ut = en.addComponent(UITransform);
            ut.setContentSize(90, 100);
            ut.setAnchorPoint(0.5, 0.5);
            const rig = this.createCharacterRig(en, isIntercept ? new Color(80, 50, 60, 255) : new Color(100, 60, 60, 255), isIntercept ? new Color(180, 80, 100, 255) : new Color(220, 120, 100, 255));
            const hpBase = isIntercept ? 45 + layer * 3 : isBoss ? 130 + layer * 5 : 28 + this.realmLevel * 7 + Math.floor(layer / 4) * 4;
            const dmgBase = isIntercept ? 7 + Math.floor(layer / 5) : isBoss ? 9 + Math.floor(layer / 8) * 2 : 4 + this.realmLevel;
            const baseHp = Math.max(1, Math.floor(hpBase * (isIntercept ? dungeon.interceptHpMultiplier : isBoss ? dungeon.bossHpMultiplier : dungeon.enemyHpMultiplier)));
            const baseDmg = Math.max(1, Math.floor(dmgBase * (isIntercept ? dungeon.interceptDamageMultiplier : isBoss ? dungeon.bossDamageMultiplier : dungeon.enemyDamageMultiplier)));
            const enemySpeed = Math.max(36, Math.floor((isBoss ? 45 : 58) * dungeon.enemySpeedMultiplier));
            const hpBarNode = new Node('HpBar');
            hpBarNode.layer = Layers.Enum.UI_2D;
            this.combatLayer.addChild(hpBarNode);
            hpBarNode.setPosition(160 + i * 120, -120 + i * 40 + 48, 0);
            hpBarNode.addComponent(UITransform).setContentSize(50, 10);
            const hpBarGfx = hpBarNode.addComponent(Graphics);
            this.enemies.push({
                node: en,
                rig,
                hp: baseHp,
                maxHp: baseHp,
                damage: baseDmg,
                radius: isBoss ? 26 : 18,
                speed: enemySpeed,
                hitTimer: 0,
                hpBarNode,
                hpBarGfx,
            });
        }
    }

    private drawEnemyHpBar(e: EnemyData) {
        e.hpBarNode.setPosition(e.node.position.x, e.node.position.y + 48, 0);
        const g = e.hpBarGfx;
        g.clear();
        const w = 50;
        const h = 8;
        const ratio = Math.max(0, e.hp / e.maxHp);
        g.fillColor = new Color(40, 30, 30, 255);
        g.rect(-w / 2, -h / 2, w, h);
        g.fill();
        g.fillColor = ratio > 0.4 ? new Color(200, 70, 60, 255) : new Color(220, 50, 50, 255);
        g.rect(-w / 2, -h / 2, w * ratio, h);
        g.fill();
        g.strokeColor = new Color(100, 80, 80, 200);
        g.lineWidth = 1;
        g.rect(-w / 2, -h / 2, w, h);
        g.stroke();
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
                    enemy.hitTimer = 0.15;
                    hit = true;
                    if (enemy.hp <= 0) {
                        this.playEnemyDeathEffect(enemy);
                        if (enemy.hpBarNode.isValid) enemy.hpBarNode.destroy();
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

        for (const e of this.enemies) this.drawEnemyHpBar(e);
        if (this.enemies.length === 0) {
            this.endCombat(true);
        }
    }

    private playEnemyDeathEffect(e: EnemyData) {
        const n = new Node('DeathEffect');
        n.layer = Layers.Enum.UI_2D;
        this.combatLayer.addChild(n);
        n.setPosition(e.node.position.x, e.node.position.y, 0);
        const g = n.addComponent(Graphics);
        g.fillColor = new Color(255, 200, 100, 200);
        g.circle(0, 0, 25);
        g.fill();
        this.scheduleOnce(() => { if (n.isValid) n.destroy(); }, 0.2);
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
            e.hitTimer = Math.max(0, e.hitTimer - dt);
            const hitScale = e.hitTimer > 0 ? 1 + 0.2 * (e.hitTimer / 0.2) : 1;
            e.node.setScale(hitScale, hitScale, 1);
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

    private readonly SKILL_MANA_COST = 12;

    private castSkill() {
        if (this.playerMana < this.SKILL_MANA_COST) return;
        this.playerMana -= this.SKILL_MANA_COST;
        const dmg = this.playerDamage * (1 + this.buffAtkPercent) * 2;
        for (const e of this.enemies) {
            e.hp -= dmg;
            e.hitTimer = 0.2;
            if (e.hp <= 0) {
                this.playEnemyDeathEffect(e);
                if (e.hpBarNode.isValid) e.hpBarNode.destroy();
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
        for (const e of this.enemies) {
            if (e.hpBarNode.isValid) e.hpBarNode.destroy();
            e.node.destroy();
        }
        this.enemies = [];

        let advanced = false;
        const combatRewardMul = this.getDungeonLootMultiplier('combat');
        if (victory) {
            const slot = this.getCombatNode();
            if (slot) {
                slot.defeated = true;
                if (this.combatIsIntercept) {
                    if (!slot.triggered) {
                        const depth = slot.depth;
                        this.expeditionSpirit += Math.max(1, Math.floor((24 + Math.floor(depth / 2)) * combatRewardMul));
                        this.expeditionHerbs += Math.max(1, Math.floor(4 * combatRewardMul));
                    }
                    slot.triggered = true;
                    this.advanceToNode(slot.id);
                    advanced = true;
                } else if (this.combatIsBoss) {
                    if (!slot.triggered) {
                        const depth = slot.depth;
                        slot.triggered = true;
                        this.expeditionSpirit += Math.max(1, Math.floor((60 + depth * 4) * combatRewardMul));
                        this.expeditionHerbs += Math.max(1, Math.floor((10 + Math.floor(depth / 4)) * combatRewardMul));
                        this.expeditionTreasure += Math.max(2, Math.floor(4 * combatRewardMul));
                    }
                    advanced = true;
                } else if (!slot.triggered) {
                    slot.triggered = true;
                    const depth = slot.depth;
                    this.expeditionSpirit += Math.max(1, Math.floor((18 + Math.floor(depth / 3)) * combatRewardMul));
                    this.expeditionHerbs += Math.max(1, Math.floor(3 * combatRewardMul));
                    this.advanceToNode(slot.id);
                    advanced = true;
                } else {
                    this.advanceToNode(slot.id);
                    advanced = true;
                }
            }
        }
        if (victory) {
            const actionRestore = this.combatIsBoss ? BOSS_VICTORY_ACTION_RESTORE : VICTORY_ACTION_RESTORE;
            this.playerHp = Math.min(this.playerMaxHp, this.playerHp + Math.ceil(this.playerMaxHp * VICTORY_HP_RESTORE_RATIO));
            this.playerMana = Math.min(this.playerMaxMana, this.playerMana + Math.ceil(this.playerMaxMana * VICTORY_MANA_RESTORE_RATIO));
            this.actionPoints = Math.min(this.actionPointMax, this.actionPoints + actionRestore);
        }
        const bossClearedFinalFloor = victory && this.combatIsBoss && this.getCurrentDepth() >= this.getDungeonConfig().maxDepth;
        this.combatSlotIndex = -1;
        this.combatNodeId = '';
        this.combatIsBoss = false;
        this.combatIsIntercept = false;
        if (bossClearedFinalFloor) {
            this.endExpedition(true);
            return;
        }
        if (victory && this.state === 'expedition_path') this.refreshLayerUI();
    }

    private endCombatPlayerDeath() {
        const wasIntercept = this.combatIsIntercept;
        const slotIndex = this.combatSlotIndex;
        this.playerNode.destroy();
        this.playerRig = null;
        for (const e of this.enemies) {
            if (e.hpBarNode.isValid) e.hpBarNode.destroy();
            e.node.destroy();
        }
        this.enemies = [];
        this.combatSlotIndex = -1;
        this.combatNodeId = '';
        this.combatIsBoss = false;
        this.combatIsIntercept = false;
        if (wasIntercept && slotIndex >= 0) {
            const choices = this.getCurrentChoiceNodes();
            const slot = slotIndex < choices.length ? choices[slotIndex] : null;
            if (slot) {
                this.expeditionSpirit = Math.floor(this.expeditionSpirit * 0.5);
                this.expeditionHerbs = Math.floor(this.expeditionHerbs * 0.5);
                this.expeditionTreasure = Math.floor(this.expeditionTreasure * 0.5);
                this.state = 'expedition_path';
                this.combatLayer.active = false;
                this.expeditionLayer.active = true;
                this.advanceToNode(slot.id);
                return;
            }
        }
        this.endExpeditionDeath();
    }

    private updateCombatHud() {
        this.combatHpLabel.string = `生命 ${Math.ceil(this.playerHp)}/${this.playerMaxHp}`;
        if (this.combatManaLabel)
            this.combatManaLabel.string = `法力 ${Math.ceil(this.playerMana)}/${this.playerMaxMana}`;
        this.drawPlayerHpBar();
        if (this.combatSkillLabel) {
            this.combatSkillLabel.string = `符咒(${this.SKILL_MANA_COST})`;
            this.combatSkillLabel.color = this.playerMana >= this.SKILL_MANA_COST
                ? new Color(200, 240, 255, 255)
                : new Color(120, 120, 130, 255);
        }
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

    private repaintPanel(panel: Node, fill: Color, stroke = new Color(70, 85, 100, 200)) {
        const transform = panel.getComponent(UITransform);
        const g = panel.getComponent(Graphics);
        if (!transform || !g) return;
        const size = transform.contentSize;
        const w = size.width;
        const h = size.height;
        g.clear();
        g.fillColor = fill;
        g.roundRect(-w / 2, -h / 2, w, h, 16);
        g.fill();
        g.strokeColor = stroke;
        g.lineWidth = 2;
        g.roundRect(-w / 2, -h / 2, w, h, 16);
        g.stroke();
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

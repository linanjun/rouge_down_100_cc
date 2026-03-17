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
    Mask,
    Node,
    ResolutionPolicy,
    ScrollView,
    UITransform,
    Vec3,
    director,
    find,
    game,
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

type TaskTab = 'daily' | 'weekly' | 'achievement' | 'mainline';

type TaskId =
    | 'daily_expedition_complete'
    | 'daily_shop_purchase'
    | 'daily_artifact_upgrade'
    | 'weekly_boss_defeat'
    | 'weekly_alchemy_success'
    | 'weekly_forge_success'
    | 'achievement_qi_depth'
    | 'achievement_artifact_unlock'
    | 'achievement_artifact_star'
    | 'mainline_first_withdraw'
    | 'mainline_first_artifact'
    | 'mainline_unlock_zhuji';

type TaskMetric = 'counter' | 'bestDepthQi' | 'artifactUnlockCount' | 'artifactStarThree' | 'zhujiUnlocked';
type TaskResetGroup = 'daily' | 'weekly' | 'permanent';
type BuildingId = 'gather' | 'alchemy' | 'forge' | 'ward';
type MeritTaskId = 'merit_expedition' | 'merit_alchemy' | 'merit_prepare';
type DongtianTab = 'cave' | 'merit';
type SpiritPetId = 'leihu' | 'xuangui' | 'yunhe';

interface MeritTaskDef {
    id: MeritTaskId;
    title: string;
    target: number;
    rewardMerit: number;
    refresh: 'daily' | 'weekly';
}

interface MeritShopItemDef {
    id: string;
    name: string;
    cost: number;
    rewardText: string;
    effect: ShopRewardType | 'badge' | 'tribulationPrep';
    effectValue: number;
    limit: number;
    refresh: ShopRefreshType;
}

interface TaskReward {
    effect: ShopRewardType | 'badge';
    value: number;
}

interface TaskEntry {
    id: TaskId;
    metric: TaskMetric;
    reset: TaskResetGroup;
    title: string;
    target: number;
    progressLabel: string;
    rewardText: string;
    rewards: TaskReward[];
}

interface BuildingDef {
    id: BuildingId;
    name: string;
    glyph: string;
    title: string;
    summary: string;
    stoneBaseCost: number;
    badgeBaseCost: number;
    materialCost: Partial<Record<MaterialId, number>>;
}

interface DongtianBonuses {
    cultivationRate: number;
    alchemySuccess: number;
    alchemyYield: number;
    forgeSuccess: number;
    forgeQuality: number;
    tribulationGain: number;
    tribulationShield: number;
}

interface MeritShopItemWidget {
    button: Node;
    stockLabel: Label;
}

interface KungfuListItemWidget {
    node: Node;
    titleLabel: Label;
    infoLabel: Label;
    stateLabel: Label;
}

interface SpiritPetListItemWidget {
    node: Node;
    titleLabel: Label;
    infoLabel: Label;
    stateLabel: Label;
}

interface SpiritPetDef {
    id: SpiritPetId;
    name: string;
    glyph: string;
    title: string;
    summary: string;
    hpBonus: number;
    manaBonus: number;
    damageBonus: number;
    tribulationRateBonus: number;
    thunderReduction: number;
}

interface SpiritPetBonuses {
    hp: number;
    mana: number;
    damage: number;
    tribulationRate: number;
    thunderReduction: number;
}

type AlchemyTab = 'furnace' | 'formula' | 'storehouse' | 'forge';
type AlchemyRecipeId = 'ningqi' | 'yangyuan' | 'cuiti' | 'shenxing';
type ForgeRecipeId = 'xuanjian' | 'baojia' | 'linglu';
type KungfuId = 'changsheng' | 'danding' | 'tiangong' | 'taixu';
type MaterialKind = 'herb' | 'stone';
type MaterialId = 'ninglucao' | 'yusuizhi' | 'ziyanshen' | 'jinwuteng' | 'qingwenshi' | 'xuanshuangjing' | 'zipoyu' | 'yaojinsui';
type SpiritStoneInventory = Record<Rarity, number>;

interface KungfuDef {
    id: KungfuId;
    name: string;
    glyph: string;
    title: string;
    summary: string;
    cultivationQiPerSecond: number;
    alchemySuccessBonus: number;
    alchemyYieldMinBonus: number;
    alchemyYieldMaxBonus: number;
    alchemyMasteryBonus: number;
    forgeSuccessBonus: number;
    forgeQualityBonus: number;
    forgeMasteryBonus: number;
}

interface MaterialDef {
    id: MaterialId;
    kind: MaterialKind;
    rarity: Rarity;
    name: string;
    shortName: string;
}

interface AlchemyRecipeDef {
    id: AlchemyRecipeId;
    name: string;
    glyph: string;
    title: string;
    summary: string;
    materialCosts: Partial<Record<MaterialId, number>>;
    goldCost: number;
    badgeCost: number;
    rewardText: string;
    effect: ShopRewardType;
    effectValue: number;
}

interface AlchemyRecipeWidget {
    node: Node;
    titleLabel: Label;
    infoLabel: Label;
    stateLabel: Label;
}

interface ForgeRecipeDef {
    id: ForgeRecipeId;
    name: string;
    glyph: string;
    title: string;
    summary: string;
    materialCosts: Partial<Record<MaterialId, number>>;
    goldCost: number;
    badgeCost: number;
    rewardText: string;
    effect: ShopRewardType;
    effectValue: number;
}

interface ForgeRecipeWidget {
    node: Node;
    titleLabel: Label;
    infoLabel: Label;
    stateLabel: Label;
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
const SPIRIT_QI_BY_RARITY: Record<Rarity, number> = {
    green: 100,
    blue: 1000,
    purple: 10000,
    orange: 100000,
};
const SPIRIT_STONE_GRADE_NAME: Record<Rarity, string> = {
    green: '低级灵石',
    blue: '中级灵石',
    purple: '高级灵石',
    orange: '极品灵石',
};

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

const TASK_ENTRIES: Record<TaskTab, TaskEntry[]> = {
    daily: [
        {
            id: 'daily_expedition_complete',
            metric: 'counter',
            reset: 'daily',
            title: '完成 1 次秘境历练',
            target: 1,
            progressLabel: '进度',
            rewardText: '奖励: 低级灵石 x2 / 法器经验 +18',
            rewards: [{ effect: 'spiritStone', value: 200 }, { effect: 'artifactExp', value: 18 }],
        },
        {
            id: 'daily_shop_purchase',
            metric: 'counter',
            reset: 'daily',
            title: '购买 2 次云游商坊商品',
            target: 2,
            progressLabel: '进度',
            rewardText: '奖励: 秘晶 +20 / 徽记 +6',
            rewards: [{ effect: 'crystal', value: 20 }, { effect: 'badge', value: 6 }],
        },
        {
            id: 'daily_artifact_upgrade',
            metric: 'counter',
            reset: 'daily',
            title: '法器升级 1 次',
            target: 1,
            progressLabel: '进度',
            rewardText: '奖励: 法器经验 +30 / 低级灵石 x3',
            rewards: [{ effect: 'artifactExp', value: 30 }, { effect: 'spiritStone', value: 300 }],
        },
    ],
    weekly: [
        {
            id: 'weekly_boss_defeat',
            metric: 'counter',
            reset: 'weekly',
            title: '累计击败 3 次 Boss',
            target: 3,
            progressLabel: '进度',
            rewardText: '奖励: 徽记 +50 / 秘晶 +80',
            rewards: [{ effect: 'badge', value: 50 }, { effect: 'crystal', value: 80 }],
        },
        {
            id: 'weekly_alchemy_success',
            metric: 'counter',
            reset: 'weekly',
            title: '成功炼成 6 炉丹药',
            target: 6,
            progressLabel: '进度',
            rewardText: '奖励: 修为 +300 / 法器经验 +100',
            rewards: [{ effect: 'exp', value: 300 }, { effect: 'artifactExp', value: 100 }],
        },
        {
            id: 'weekly_forge_success',
            metric: 'counter',
            reset: 'weekly',
            title: '成功锻成 4 件器胚',
            target: 4,
            progressLabel: '进度',
            rewardText: '奖励: 高级灵石 x1 / 徽记 +24',
            rewards: [{ effect: 'spiritStone', value: 10000 }, { effect: 'badge', value: 24 }],
        },
    ],
    achievement: [
        {
            id: 'achievement_qi_depth',
            metric: 'bestDepthQi',
            reset: 'permanent',
            title: '练气秘境抵达第 20 层',
            target: 20,
            progressLabel: '当前',
            rewardText: '奖励: 高级灵石 x1 / 法器经验 +80',
            rewards: [{ effect: 'spiritStone', value: 10000 }, { effect: 'artifactExp', value: 80 }],
        },
        {
            id: 'achievement_artifact_unlock',
            metric: 'artifactUnlockCount',
            reset: 'permanent',
            title: '累计拥有 4 件法器',
            target: 4,
            progressLabel: '当前',
            rewardText: '奖励: 秘晶 +120 / 徽记 +30',
            rewards: [{ effect: 'crystal', value: 120 }, { effect: 'badge', value: 30 }],
        },
        {
            id: 'achievement_artifact_star',
            metric: 'artifactStarThree',
            reset: 'permanent',
            title: '任意法器升至 3 星',
            target: 1,
            progressLabel: '当前',
            rewardText: '奖励: 极品灵石 x1 / 法器经验 +150',
            rewards: [{ effect: 'spiritStone', value: 100000 }, { effect: 'artifactExp', value: 150 }],
        },
    ],
    mainline: [
        {
            id: 'mainline_first_withdraw',
            metric: 'counter',
            reset: 'permanent',
            title: '主线一: 初入百层洞渊',
            target: 1,
            progressLabel: '目标',
            rewardText: '奖励: 低级灵石 x5 / 修为 +80',
            rewards: [{ effect: 'spiritStone', value: 500 }, { effect: 'exp', value: 80 }],
        },
        {
            id: 'mainline_first_artifact',
            metric: 'artifactUnlockCount',
            reset: 'permanent',
            title: '主线二: 凝练本命法器',
            target: 1,
            progressLabel: '目标',
            rewardText: '奖励: 法器经验 +80 / 徽记 +12',
            rewards: [{ effect: 'artifactExp', value: 80 }, { effect: 'badge', value: 12 }],
        },
        {
            id: 'mainline_unlock_zhuji',
            metric: 'zhujiUnlocked',
            reset: 'permanent',
            title: '主线三: 问鼎筑基秘境',
            target: 1,
            progressLabel: '目标',
            rewardText: '奖励: 秘晶 +100 / 徽记 +20',
            rewards: [{ effect: 'crystal', value: 100 }, { effect: 'badge', value: 20 }],
        },
    ],
};

const TASK_IDS: TaskId[] = [
    'daily_expedition_complete',
    'daily_shop_purchase',
    'daily_artifact_upgrade',
    'weekly_boss_defeat',
    'weekly_alchemy_success',
    'weekly_forge_success',
    'achievement_qi_depth',
    'achievement_artifact_unlock',
    'achievement_artifact_star',
    'mainline_first_withdraw',
    'mainline_first_artifact',
    'mainline_unlock_zhuji',
];

function createTaskProgressRecord(): Record<TaskId, number> {
    return {
        daily_expedition_complete: 0,
        daily_shop_purchase: 0,
        daily_artifact_upgrade: 0,
        weekly_boss_defeat: 0,
        weekly_alchemy_success: 0,
        weekly_forge_success: 0,
        achievement_qi_depth: 0,
        achievement_artifact_unlock: 0,
        achievement_artifact_star: 0,
        mainline_first_withdraw: 0,
        mainline_first_artifact: 0,
        mainline_unlock_zhuji: 0,
    };
}

function createTaskClaimRecord(): Record<TaskId, boolean> {
    return {
        daily_expedition_complete: false,
        daily_shop_purchase: false,
        daily_artifact_upgrade: false,
        weekly_boss_defeat: false,
        weekly_alchemy_success: false,
        weekly_forge_success: false,
        achievement_qi_depth: false,
        achievement_artifact_unlock: false,
        achievement_artifact_star: false,
        mainline_first_withdraw: false,
        mainline_first_artifact: false,
        mainline_unlock_zhuji: false,
    };
}

const MATERIAL_DEFS: MaterialDef[] = [
    { id: 'ninglucao', kind: 'herb', rarity: 'green', name: '凝露草', shortName: '凝露草' },
    { id: 'yusuizhi', kind: 'herb', rarity: 'blue', name: '玉髓芝', shortName: '玉髓芝' },
    { id: 'ziyanshen', kind: 'herb', rarity: 'purple', name: '紫焰参', shortName: '紫焰参' },
    { id: 'jinwuteng', kind: 'herb', rarity: 'orange', name: '金乌藤', shortName: '金乌藤' },
    { id: 'qingwenshi', kind: 'stone', rarity: 'green', name: '青纹石', shortName: '青纹石' },
    { id: 'xuanshuangjing', kind: 'stone', rarity: 'blue', name: '玄霜晶', shortName: '玄霜晶' },
    { id: 'zipoyu', kind: 'stone', rarity: 'purple', name: '紫魄玉', shortName: '紫魄玉' },
    { id: 'yaojinsui', kind: 'stone', rarity: 'orange', name: '曜金髓', shortName: '曜金髓' },
];

const HERB_MATERIAL_BY_RARITY: Record<Rarity, MaterialId> = {
    green: 'ninglucao',
    blue: 'yusuizhi',
    purple: 'ziyanshen',
    orange: 'jinwuteng',
};

const STONE_MATERIAL_BY_RARITY: Record<Rarity, MaterialId> = {
    green: 'qingwenshi',
    blue: 'xuanshuangjing',
    purple: 'zipoyu',
    orange: 'yaojinsui',
};

const ALCHEMY_RECIPES: AlchemyRecipeDef[] = [
    { id: 'ningqi', glyph: '气', name: '凝气丹', title: '周天聚气', summary: '以温和草木药性固本培元，适合前期持续积累修为。', materialCosts: { ninglucao: 8, yusuizhi: 2 }, goldCost: 900, badgeCost: 0, rewardText: '修为 +28', effect: 'exp', effectValue: 28 },
    { id: 'yangyuan', glyph: '元', name: '养元丹', title: '温养法力', summary: '调和经脉与丹田，需以灵芝和寒性矿晶稳定药性。', materialCosts: { ninglucao: 4, yusuizhi: 4, xuanshuangjing: 2 }, goldCost: 1200, badgeCost: 0, rewardText: '法力上限 +6', effect: 'mana', effectValue: 6 },
    { id: 'cuiti', glyph: '体', name: '淬体丹', title: '淬骨炼血', summary: '以烈性药材和矿脉精华淬炼筋骨皮膜。', materialCosts: { ziyanshen: 3, qingwenshi: 5, xuanshuangjing: 2 }, goldCost: 1500, badgeCost: 4, rewardText: '气血上限 +10', effect: 'hp', effectValue: 10 },
    { id: 'shenxing', glyph: '行', name: '神行丹', title: '轻身换息', summary: '借紫参与玉石共鸣，加快周天行气与身法切换。', materialCosts: { yusuizhi: 3, ziyanshen: 2, zipoyu: 2 }, goldCost: 1000, badgeCost: 10, rewardText: '行动力上限 +3', effect: 'ap', effectValue: 3 },
];

const FORGE_RECIPES: ForgeRecipeDef[] = [
    { id: 'xuanjian', glyph: '锋', name: '玄金剑胚', title: '锋锐淬火', summary: '以高阶灵矿熔炼剑胚，强化主战攻伐。', materialCosts: { xuanshuangjing: 4, zipoyu: 2, yaojinsui: 1 }, goldCost: 2200, badgeCost: 10, rewardText: '术攻 +3', effect: 'atk', effectValue: 3 },
    { id: 'baojia', glyph: '甲', name: '宝甲器胚', title: '护元成甲', summary: '以矿精辅药淬壳，适合打造护体法器外胚。', materialCosts: { qingwenshi: 6, xuanshuangjing: 2, jinwuteng: 1 }, goldCost: 2400, badgeCost: 12, rewardText: '气血上限 +14', effect: 'hp', effectValue: 14 },
    { id: 'linglu', glyph: '炉', name: '灵炉芯', title: '归元炉心', summary: '引曜金与灵藤共炼炉芯，提升器火与法器成长。', materialCosts: { ziyanshen: 2, jinwuteng: 1, yaojinsui: 1 }, goldCost: 2600, badgeCost: 16, rewardText: '法器经验 +45', effect: 'artifactExp', effectValue: 45 },
];

const KUNGFU_DEFS: KungfuDef[] = [
    { id: 'changsheng', glyph: '生', name: '长生诀', title: '延脉养元', summary: '平稳周天，适合长期吐纳与丹器双修。', cultivationQiPerSecond: 100, alchemySuccessBonus: 0.06, alchemyYieldMinBonus: 0, alchemyYieldMaxBonus: 1, alchemyMasteryBonus: 0.2, forgeSuccessBonus: 0.05, forgeQualityBonus: 0.08, forgeMasteryBonus: 0.2 },
    { id: 'danding', glyph: '鼎', name: '丹鼎经', title: '炉火通明', summary: '偏重炼丹，稳炉控火，提升出丹与丹师感悟。', cultivationQiPerSecond: 120, alchemySuccessBonus: 0.14, alchemyYieldMinBonus: 1, alchemyYieldMaxBonus: 2, alchemyMasteryBonus: 0.4, forgeSuccessBonus: 0.03, forgeQualityBonus: 0.05, forgeMasteryBonus: 0.12 },
    { id: 'tiangong', glyph: '工', name: '天工谱', title: '百炼归一', summary: '偏重炼器，锻火纯熟，可稳定抬高器胚品质。', cultivationQiPerSecond: 110, alchemySuccessBonus: 0.03, alchemyYieldMinBonus: 0, alchemyYieldMaxBonus: 1, alchemyMasteryBonus: 0.12, forgeSuccessBonus: 0.12, forgeQualityBonus: 0.18, forgeMasteryBonus: 0.4 },
    { id: 'taixu', glyph: '虚', name: '太虚周天录', title: '周天自衍', summary: '兼顾修行与工坊效率，适合作为主修功法常驻。', cultivationQiPerSecond: 160, alchemySuccessBonus: 0.08, alchemyYieldMinBonus: 1, alchemyYieldMaxBonus: 1, alchemyMasteryBonus: 0.25, forgeSuccessBonus: 0.08, forgeQualityBonus: 0.1, forgeMasteryBonus: 0.25 },
];

function createAlchemyInventoryRecord(): Record<AlchemyRecipeId, number> {
    return {
        ningqi: 0,
        yangyuan: 0,
        cuiti: 0,
        shenxing: 0,
    };
}

function createMaterialInventoryRecord(): Record<MaterialId, number> {
    return {
        ninglucao: 0,
        yusuizhi: 0,
        ziyanshen: 0,
        jinwuteng: 0,
        qingwenshi: 0,
        xuanshuangjing: 0,
        zipoyu: 0,
        yaojinsui: 0,
    };
}

function createForgeInventoryRecord(): Record<ForgeRecipeId, number> {
    return {
        xuanjian: 0,
        baojia: 0,
        linglu: 0,
    };
}

function createSpiritStoneInventoryRecord(): SpiritStoneInventory {
    return {
        green: 0,
        blue: 0,
        purple: 0,
        orange: 0,
    };
}

function createKungfuLevelRecord(): Record<KungfuId, number> {
    return {
        changsheng: 1,
        danding: 1,
        tiangong: 1,
        taixu: 1,
    };
}

function createBuildingLevelRecord(): Record<BuildingId, number> {
    return {
        gather: 1,
        alchemy: 1,
        forge: 1,
        ward: 1,
    };
}

function createMeritTaskProgressRecord(): Record<MeritTaskId, number> {
    return {
        merit_expedition: 0,
        merit_alchemy: 0,
        merit_prepare: 0,
    };
}

function createMeritTaskClaimRecord(): Record<MeritTaskId, boolean> {
    return {
        merit_expedition: false,
        merit_alchemy: false,
        merit_prepare: false,
    };
}

function createSpiritPetUnlockRecord(): Record<SpiritPetId, boolean> {
    return {
        leihu: false,
        xuangui: false,
        yunhe: false,
    };
}

function createSpiritPetLevelRecord(): Record<SpiritPetId, number> {
    return {
        leihu: 1,
        xuangui: 1,
        yunhe: 1,
    };
}

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
    materialId?: MaterialId;
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

type ShopCurrency = 'gold' | 'diamond' | 'mijing';
type ShopRefreshType = 'none' | 'daily' | 'weekly';
type ShopRewardType = 'hp' | 'mana' | 'atk' | 'ap' | 'exp' | 'crystal' | 'artifactExp' | 'spiritStone';

interface ShopItemDef {
    id: string;
    name: string;
    currency: ShopCurrency;
    cost: number;
    rewardText: string;
    description: string;
    limit: number;
    refresh: ShopRefreshType;
    effect: ShopRewardType;
    effectValue: number;
}

interface ShopItemWidget {
    button: Node;
    stockLabel: Label;
}

type ArtifactId = 'qingshuang' | 'lihuo' | 'xuanjia' | 'huiyuan' | 'xunbao' | 'guixi';
type ArtifactSlot = 'sword' | 'talisman' | 'lamp';

interface ArtifactDef {
    id: ArtifactId;
    slot: ArtifactSlot;
    name: string;
    glyph: string;
    title: string;
    summary: string;
    synthCost: number;
    starter: boolean;
}

interface ArtifactState {
    unlocked: boolean;
    level: number;
    star: number;
    shards: number;
}

interface ArtifactBonuses {
    hp: number;
    mana: number;
    damage: number;
    action: number;
    combatAtkPercent: number;
    rewardMultiplier: number;
    badgeMultiplier: number;
    artifactExpMultiplier: number;
    fragmentMultiplier: number;
    retreatBonus: number;
}

interface ArtifactCardWidget {
    node: Node;
    titleLabel: Label;
    infoLabel: Label;
    stateLabel: Label;
}

const MAX_ARTIFACT_STAR = 5;
const NATURAL_CULTIVATION_INTERVAL = 1;

const MERIT_TASKS: MeritTaskDef[] = [
    { id: 'merit_expedition', title: '完成 1 次秘境历练', target: 1, rewardMerit: 12, refresh: 'daily' },
    { id: 'merit_alchemy', title: '成功炼成 3 炉丹药', target: 3, rewardMerit: 16, refresh: 'daily' },
    { id: 'merit_prepare', title: '完成 1 次渡劫准备', target: 1, rewardMerit: 24, refresh: 'weekly' },
];

const MERIT_SHOP_ITEMS: MeritShopItemDef[] = [
    { id: 'merit_spirit', name: '洞天灵石匣', cost: 10, rewardText: '灵石 +2000', effect: 'spiritStone', effectValue: 2000, limit: 3, refresh: 'weekly' },
    { id: 'merit_badge', name: '巡天令', cost: 12, rewardText: '秘境徽记 +10', effect: 'badge', effectValue: 10, limit: 2, refresh: 'weekly' },
    { id: 'merit_prep', name: '护劫符', cost: 18, rewardText: '渡劫准备 +28', effect: 'tribulationPrep', effectValue: 28, limit: 2, refresh: 'weekly' },
];

const SPIRIT_PET_DEFS: SpiritPetDef[] = [
    { id: 'leihu', glyph: '雷', name: '裂霆虎', title: '雷爪裂阵', summary: '偏战斗型灵宠，随主出战可撕开雷幕与敌阵。', hpBonus: 0, manaBonus: 0, damageBonus: 8, tribulationRateBonus: 0.03, thunderReduction: 4 },
    { id: 'xuangui', glyph: '龟', name: '玄甲龟', title: '龟息镇岳', summary: '偏护体型灵宠，以龟甲灵息为主人分担雷劫冲击。', hpBonus: 48, manaBonus: 0, damageBonus: 0, tribulationRateBonus: 0.02, thunderReduction: 14 },
    { id: 'yunhe', glyph: '鹤', name: '云翎鹤', title: '羽化乘云', summary: '偏灵韵型灵宠，提升法力流转并引天清气，稳固突破心神。', hpBonus: 0, manaBonus: 24, damageBonus: 3, tribulationRateBonus: 0.06, thunderReduction: 6 },
];

const DONGTIAN_BUILDINGS: BuildingDef[] = [
    {
        id: 'gather',
        name: '洞府灵脉',
        glyph: '聚',
        title: '汇灵归府',
        summary: '稳固洞府灵脉，提升自然吐纳和渡劫准备时的灵机汇聚。',
        stoneBaseCost: 1200,
        badgeBaseCost: 4,
        materialCost: { ninglucao: 6, qingwenshi: 4 },
    },
    {
        id: 'alchemy',
        name: '丹火室',
        glyph: '丹',
        title: '炉火恒明',
        summary: '温养丹火，提升成丹稳定性与出丹数，兼顾渡劫药力调和。',
        stoneBaseCost: 1600,
        badgeBaseCost: 6,
        materialCost: { yusuizhi: 4, xuanshuangjing: 3 },
    },
    {
        id: 'forge',
        name: '百炼台',
        glyph: '器',
        title: '百炼归真',
        summary: '稳固器火与锻台，提升炼器成功率和品质，也能强化护劫法器。',
        stoneBaseCost: 1800,
        badgeBaseCost: 8,
        materialCost: { ziyanshen: 3, zipoyu: 3 },
    },
    {
        id: 'ward',
        name: '护山大阵',
        glyph: '劫',
        title: '镇府护劫',
        summary: '构筑护山法阵，提升渡劫准备效率并在突破时提供护劫余裕。',
        stoneBaseCost: 2200,
        badgeBaseCost: 10,
        materialCost: { jinwuteng: 1, yaojinsui: 1 },
    },
];

const ARTIFACT_DEFS: ArtifactDef[] = [
    { id: 'qingshuang', slot: 'sword', glyph: '霜', name: '青霜剑', title: '剑气穿心', summary: '主战飞剑，强化单体斩杀与普攻杀伤', synthCost: 0, starter: true },
    { id: 'lihuo', slot: 'sword', glyph: '火', name: '离火剑', title: '离火灼脉', summary: '主战飞剑，强化术法爆发与秘境收益', synthCost: 14, starter: false },
    { id: 'xuanjia', slot: 'talisman', glyph: '甲', name: '玄甲符', title: '护体镇魄', summary: '护符法器，提升气血并稳固秘境续航', synthCost: 0, starter: true },
    { id: 'huiyuan', slot: 'talisman', glyph: '元', name: '回元符', title: '回元养气', summary: '护符法器，提升法力与行动回复能力', synthCost: 14, starter: false },
    { id: 'xunbao', slot: 'lamp', glyph: '宝', name: '寻宝灯', title: '照见机缘', summary: '灵灯法器，强化秘境带出与法器掉落', synthCost: 0, starter: true },
    { id: 'guixi', slot: 'lamp', glyph: '归', name: '归息灯', title: '归元守藏', summary: '灵灯法器，强化撤离收益与徽记产出', synthCost: 16, starter: false },
];

function createDefaultArtifactStates(): Record<ArtifactId, ArtifactState> {
    return {
        qingshuang: { unlocked: true, level: 1, star: 1, shards: 0 },
        lihuo: { unlocked: false, level: 0, star: 0, shards: 0 },
        xuanjia: { unlocked: true, level: 1, star: 1, shards: 0 },
        huiyuan: { unlocked: false, level: 0, star: 0, shards: 0 },
        xunbao: { unlocked: true, level: 1, star: 1, shards: 0 },
        guixi: { unlocked: false, level: 0, star: 0, shards: 0 },
    };
}

function createArtifactShardRecord(): Record<ArtifactId, number> {
    return {
        qingshuang: 0,
        lihuo: 0,
        xuanjia: 0,
        huiyuan: 0,
        xunbao: 0,
        guixi: 0,
    };
}

const GOLD_DAILY_SHOP_ITEMS: ShopItemDef[] = [
    { id: 'gold_daily_hp', name: '炼体膏', currency: 'gold', cost: 900, rewardText: '气血上限 +8', description: '每日补体', limit: 1, refresh: 'daily', effect: 'hp', effectValue: 8 },
    { id: 'gold_daily_mana', name: '养气丹', currency: 'gold', cost: 1100, rewardText: '法力上限 +6', description: '吐纳凝元', limit: 1, refresh: 'daily', effect: 'mana', effectValue: 6 },
    { id: 'gold_daily_exp', name: '聚灵香', currency: 'gold', cost: 1400, rewardText: '修为 +18', description: '静室修行', limit: 1, refresh: 'daily', effect: 'exp', effectValue: 18 },
    { id: 'gold_daily_atk', name: '攻伐符', currency: 'gold', cost: 1700, rewardText: '术攻 +1', description: '临战养锋', limit: 1, refresh: 'daily', effect: 'atk', effectValue: 1 },
    { id: 'gold_daily_ap', name: '行气帖', currency: 'gold', cost: 2200, rewardText: '行动力上限 +2', description: '周天顺行', limit: 1, refresh: 'daily', effect: 'ap', effectValue: 2 },
    { id: 'gold_daily_crystal', name: '小秘晶匣', currency: 'gold', cost: 2800, rewardText: '钻石 +1', description: '偶得秘匣', limit: 1, refresh: 'daily', effect: 'crystal', effectValue: 1 },
];

const GOLD_WEEKLY_SHOP_ITEMS: ShopItemDef[] = [
    { id: 'gold_weekly_hp', name: '玄龟膏', currency: 'gold', cost: 5600, rewardText: '气血上限 +20', description: '周常重养', limit: 1, refresh: 'weekly', effect: 'hp', effectValue: 20 },
    { id: 'gold_weekly_mana', name: '凝海露', currency: 'gold', cost: 6200, rewardText: '法力上限 +18', description: '周常聚元', limit: 1, refresh: 'weekly', effect: 'mana', effectValue: 18 },
    { id: 'gold_weekly_exp', name: '悟道香案', currency: 'gold', cost: 7600, rewardText: '修为 +72', description: '周常参悟', limit: 1, refresh: 'weekly', effect: 'exp', effectValue: 72 },
    { id: 'gold_weekly_atk', name: '破军符卷', currency: 'gold', cost: 8800, rewardText: '术攻 +3', description: '周常攻伐', limit: 1, refresh: 'weekly', effect: 'atk', effectValue: 3 },
    { id: 'gold_weekly_ap', name: '周天总纲', currency: 'gold', cost: 9800, rewardText: '行动力上限 +6', description: '周常行气', limit: 1, refresh: 'weekly', effect: 'ap', effectValue: 6 },
    { id: 'gold_weekly_crystal', name: '秘晶礼盒', currency: 'gold', cost: 12800, rewardText: '钻石 +4', description: '周常折换', limit: 1, refresh: 'weekly', effect: 'crystal', effectValue: 4 },
];

const MIJING_SHOP_ITEMS: ShopItemDef[] = [
    { id: 'mijing_hp', name: '镇岳丹', currency: 'mijing', cost: 18, rewardText: '气血上限 +16', description: '秘境专供', limit: 1, refresh: 'weekly', effect: 'hp', effectValue: 16 },
    { id: 'mijing_mana', name: '灵魄瓶', currency: 'mijing', cost: 24, rewardText: '法力上限 +14', description: '秘境专供', limit: 1, refresh: 'weekly', effect: 'mana', effectValue: 14 },
    { id: 'mijing_exp', name: '悟道残页', currency: 'mijing', cost: 30, rewardText: '修为 +60', description: '秘境专供', limit: 1, refresh: 'weekly', effect: 'exp', effectValue: 60 },
    { id: 'mijing_atk', name: '镇煞印', currency: 'mijing', cost: 38, rewardText: '术攻 +2', description: '秘境专供', limit: 1, refresh: 'weekly', effect: 'atk', effectValue: 2 },
    { id: 'mijing_ap', name: '遁空符', currency: 'mijing', cost: 46, rewardText: '行动力上限 +4', description: '秘境专供', limit: 1, refresh: 'weekly', effect: 'ap', effectValue: 4 },
    { id: 'mijing_crystal', name: '宝箱钥片', currency: 'mijing', cost: 58, rewardText: '钻石 +2', description: '秘境专供', limit: 1, refresh: 'weekly', effect: 'crystal', effectValue: 2 },
];

const DIAMOND_SHOP_ITEMS: ShopItemDef[] = [
    { id: 'diamond_hp', name: '龙血玉露', currency: 'diamond', cost: 60, rewardText: '气血上限 +30', description: '常驻精选', limit: 2, refresh: 'weekly', effect: 'hp', effectValue: 30 },
    { id: 'diamond_mana', name: '太虚灵液', currency: 'diamond', cost: 90, rewardText: '法力上限 +28', description: '常驻精选', limit: 2, refresh: 'weekly', effect: 'mana', effectValue: 28 },
    { id: 'diamond_exp', name: '顿悟金册', currency: 'diamond', cost: 120, rewardText: '修为 +120', description: '常驻精选', limit: 2, refresh: 'weekly', effect: 'exp', effectValue: 120 },
    { id: 'diamond_atk', name: '天锋令', currency: 'diamond', cost: 180, rewardText: '术攻 +5', description: '常驻精选', limit: 1, refresh: 'weekly', effect: 'atk', effectValue: 5 },
    { id: 'diamond_ap', name: '周天秘卷', currency: 'diamond', cost: 150, rewardText: '行动力上限 +8', description: '常驻精选', limit: 1, refresh: 'weekly', effect: 'ap', effectValue: 8 },
    { id: 'diamond_spirit', name: '洞天灵石匣', currency: 'diamond', cost: 40, rewardText: '灵石 +1500', description: '常驻灵石补给', limit: 3, refresh: 'weekly', effect: 'spiritStone', effectValue: 1500 },
    { id: 'diamond_crystal', name: '返利宝匣', currency: 'diamond', cost: 220, rewardText: '钻石 +40', description: '返利补给', limit: 1, refresh: 'weekly', effect: 'crystal', effectValue: 40 },
];

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
    private spiritStoneInventory: SpiritStoneInventory = createSpiritStoneInventoryRecord();
    private realmLevel = 1;
    private realmExp = 0;
    private realmExpNeed = 30;
    private cultivationTick = 0;
    private cultivationQiProgress = 0;
    private alchemyMasteryLevel = 1;
    private alchemyMasteryExp = 0;
    private forgeMasteryLevel = 1;
    private forgeMasteryExp = 0;
    private expeditionSpiritStoneInventory: SpiritStoneInventory = createSpiritStoneInventoryRecord();
    private selectedKungfuId: KungfuId = 'changsheng';
    private equippedKungfuId: KungfuId = 'changsheng';
    private kungfuLevels: Record<KungfuId, number> = createKungfuLevelRecord();
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
    private expeditionMaterials: Record<MaterialId, number> = createMaterialInventoryRecord();
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
    private shopBonusHp = 0;
    private shopBonusMana = 0;
    private shopBonusDamage = 0;
    private shopBonusAction = 0;
    /** 撤离资源比例乘数（邪修截道永久降低），1 = 100% */
    private retreatRatioMultiplier = 1;
    private playerRadius = 20;
    private attackCooldown = 0;
    private attackAnimTimer = 0;

    private enemies: EnemyData[] = [];
    private combatElapsed = 0;
    private lastCombatPlayerHp = 100;
    private combatDamageFloatCooldown = 0;
    private homeRoleRig: CharacterRig | null = null;
    private homeRoleAuraOuter: Node | null = null;
    private homeRoleAuraInner: Node | null = null;
    private homeRolePedestal: Node | null = null;
    private homeRoleRibbonLeft: Node | null = null;
    private homeRoleRibbonRight: Node | null = null;
    private homeRoleSparkles: Node[] = [];

    private statusLabel!: Label;
    private hintLabel!: Label;
    private roleHpLabel!: Label;
    private roleManaLabel!: Label;
    private roleAttackLabel!: Label;
    private roleExpLabel!: Label;
    private roleApLabel!: Label;
    private roleBreakLabel!: Label;
    private roleDungeonLabel!: Label;
    private roleDungeonProgressLabel!: Label;
    private kungfuNameLabel: Label | null = null;
    private kungfuInfoLabel: Label | null = null;
    private kungfuEffectLabel: Label | null = null;
    private spiritPetNameLabel: Label | null = null;
    private spiritPetInfoLabel: Label | null = null;
    private spiritPetEffectLabel: Label | null = null;
    private roleQuickFocus: 'general' | 'kungfu' | 'pet' = 'general';
    private homeTab: 'dongtian' | 'mijing' | 'shop' | 'faqi' | 'role' = 'dongtian';
    private homeContentRoot!: Node;
    private homeDongtianView!: Node;
    private homeMijingView!: Node;
    private homeRoleView!: Node;
    private homeShopView!: Node;
    private homeFaqiView!: Node;
    private homeAlchemyQuickButton: Node | null = null;
    private homeForgeQuickButton: Node | null = null;
    private homeKungfuQuickButton: Node | null = null;
    private homeSpiritPetQuickButton: Node | null = null;
    private homeAlchemyPanel: Node | null = null;
    private homeAlchemyMask: Node | null = null;
    private homeKungfuPanel: Node | null = null;
    private homeKungfuMask: Node | null = null;
    private homeSpiritPetPanel: Node | null = null;
    private homeSpiritPetMask: Node | null = null;
    private alchemyTab: AlchemyTab = 'furnace';
    private alchemySelectedRecipe: AlchemyRecipeId = 'ningqi';
    private forgeSelectedRecipe: ForgeRecipeId = 'xuanjian';
    private tribulationPrep = 0;
    private meritPoint = 0;
    private meritDailyKey = '';
    private meritWeeklyKey = '';
    private meritTaskProgress: Record<MeritTaskId, number> = createMeritTaskProgressRecord();
    private meritTaskClaimed: Record<MeritTaskId, boolean> = createMeritTaskClaimRecord();
    private meritShopPurchases: Record<string, number> = {};
    private dongtianBuildingLevels: Record<BuildingId, number> = createBuildingLevelRecord();
    private spiritPetUnlocked: Record<SpiritPetId, boolean> = createSpiritPetUnlockRecord();
    private spiritPetLevels: Record<SpiritPetId, number> = createSpiritPetLevelRecord();
    private selectedSpiritPetId: SpiritPetId = 'leihu';
    private equippedSpiritPetId: SpiritPetId | null = null;
    private materialInventory: Record<MaterialId, number> = createMaterialInventoryRecord();
    private alchemyInventory: Record<AlchemyRecipeId, number> = createAlchemyInventoryRecord();
    private forgeInventory: Record<ForgeRecipeId, number> = createForgeInventoryRecord();
    private alchemyTabButtons: Record<AlchemyTab, Node | null> = { furnace: null, formula: null, storehouse: null, forge: null };
    private alchemyFurnacePage: Node | null = null;
    private alchemyFormulaPage: Node | null = null;
    private alchemyStorehousePage: Node | null = null;
    private alchemyForgePage: Node | null = null;
    private alchemyRecipeWidgets = new Map<AlchemyRecipeId, AlchemyRecipeWidget>();
    private forgeRecipeWidgets = new Map<ForgeRecipeId, ForgeRecipeWidget>();
    private alchemyTitleLabel: Label | null = null;
    private alchemyInfoLabel: Label | null = null;
    private alchemyCostLabel: Label | null = null;
    private alchemyOutputLabel: Label | null = null;
    private alchemyHintLabel: Label | null = null;
    private alchemyCraftBtn: Node | null = null;
    private alchemyCraftBtnLabel: Label | null = null;
    private alchemyUseBtn: Node | null = null;
    private alchemyUseBtnLabel: Label | null = null;
    private alchemyStorehouseLabels: Record<MaterialId, Label | null> = { ninglucao: null, yusuizhi: null, ziyanshen: null, jinwuteng: null, qingwenshi: null, xuanshuangjing: null, zipoyu: null, yaojinsui: null };
    private dongtianTab: DongtianTab = 'cave';
    private dongtianMountLabel: Label | null = null;
    private dongtianSummaryLabel: Label | null = null;
    private dongtianSpiritLabel: Label | null = null;
    private dongtianTribulationLabel: Label | null = null;
    private dongtianMeritLabel: Label | null = null;
    private dongtianTabButtons: Record<DongtianTab, Node | null> = { cave: null, merit: null };
    private dongtianCavePage: Node | null = null;
    private dongtianMeritPage: Node | null = null;
    private dongtianBuildingTitleLabels: Record<BuildingId, Label | null> = { gather: null, alchemy: null, forge: null, ward: null };
    private dongtianBuildingInfoLabels: Record<BuildingId, Label | null> = { gather: null, alchemy: null, forge: null, ward: null };
    private dongtianBuildingCostLabels: Record<BuildingId, Label | null> = { gather: null, alchemy: null, forge: null, ward: null };
    private dongtianBuildingButtons: Record<BuildingId, Node | null> = { gather: null, alchemy: null, forge: null, ward: null };
    private dongtianBuildingButtonLabels: Record<BuildingId, Label | null> = { gather: null, alchemy: null, forge: null, ward: null };
    private meritTaskRowTitleLabels: Label[] = [];
    private meritTaskRowInfoLabels: Label[] = [];
    private meritTaskRowRewardLabels: Label[] = [];
    private meritTaskRowClaimButtons: Node[] = [];
    private meritTaskRowClaimLabels: Label[] = [];
    private meritShopItemWidgets = new Map<string, MeritShopItemWidget>();
    private homeTaskButton: Node | null = null;
    private homeTaskPanel: Node | null = null;
    private homeTaskMask: Node | null = null;
    private taskTab: TaskTab = 'daily';
    private taskDailyKey = '';
    private taskWeeklyKey = '';
    private taskProgress: Record<TaskId, number> = createTaskProgressRecord();
    private taskClaimed: Record<TaskId, boolean> = createTaskClaimRecord();
    private taskTabButtons: Record<TaskTab, Node | null> = { daily: null, weekly: null, achievement: null, mainline: null };
    private taskRowNodes: Node[] = [];
    private taskRowTitleLabels: Label[] = [];
    private taskRowInfoLabels: Label[] = [];
    private taskRowRewardLabels: Label[] = [];
    private taskRowClaimButtons: Node[] = [];
    private taskRowClaimLabels: Label[] = [];
    private kungfuPageNameLabel: Label | null = null;
    private kungfuPageInfoLabel: Label | null = null;
    private kungfuPageEffectLabel: Label | null = null;
    private kungfuPageHintLabel: Label | null = null;
    private kungfuPageRunButton: Node | null = null;
    private kungfuPageRunButtonLabel: Label | null = null;
    private kungfuPageUpgradeButton: Node | null = null;
    private kungfuPageUpgradeButtonLabel: Label | null = null;
    private kungfuListWidgets = new Map<KungfuId, KungfuListItemWidget>();
    private spiritPetPageNameLabel: Label | null = null;
    private spiritPetPageInfoLabel: Label | null = null;
    private spiritPetPageEffectLabel: Label | null = null;
    private spiritPetPageHintLabel: Label | null = null;
    private spiritPetPagePortrait: Node | null = null;
    private spiritPetPageDeployButton: Node | null = null;
    private spiritPetPageDeployButtonLabel: Label | null = null;
    private spiritPetPageUpgradeButton: Node | null = null;
    private spiritPetPageUpgradeButtonLabel: Label | null = null;
    private spiritPetListWidgets = new Map<SpiritPetId, SpiritPetListItemWidget>();
    private homeGoldLabel!: Label;
    private homeDiamondLabel!: Label;
    private artifactExpPool = 0;
    private expeditionArtifactExp = 0;
    private expeditionArtifactShards: Record<ArtifactId, number> = createArtifactShardRecord();
    private artifactSelectedId: ArtifactId = 'qingshuang';
    private artifactListTab: ArtifactSlot = 'sword';
    private artifactStates: Record<ArtifactId, ArtifactState> = createDefaultArtifactStates();
    private artifactEquipped: Record<ArtifactSlot, ArtifactId | null> = {
        sword: 'qingshuang',
        talisman: 'xuanjia',
        lamp: 'xunbao',
    };
    private artifactCardWidgets = new Map<ArtifactId, ArtifactCardWidget>();
    private faqiExpLabel!: Label;
    private faqiGlyphLabel!: Label;
    private faqiDetailTitleLabel!: Label;
    private faqiDetailInfoLabel!: Label;
    private faqiDetailEffectLabel!: Label;
    private faqiDetailShardLabel!: Label;
    private faqiSlotPanels: Record<ArtifactSlot, Node | null> = { sword: null, talisman: null, lamp: null };
    private faqiSlotLabels: Record<ArtifactSlot, Label | null> = { sword: null, talisman: null, lamp: null };
    private faqiListTabButtons: Record<ArtifactSlot, Node | null> = { sword: null, talisman: null, lamp: null };
    private faqiPrimaryBtn: Node | null = null;
    private faqiPrimaryBtnLabel: Label | null = null;
    private faqiUpgradeBtn: Node | null = null;
    private faqiUpgradeBtnLabel: Label | null = null;
    private faqiStarBtn: Node | null = null;
    private faqiStarBtnLabel: Label | null = null;
    private dungeonBadge = 0;
    private shopGoldTab: 'daily' | 'weekly' = 'daily';
    private shopGoldDailyPage: Node | null = null;
    private shopGoldWeeklyPage: Node | null = null;
    private shopHintLabel!: Label;
    private shopCurrencyLabel!: Label;
    private shopScrollContent: Node | null = null;
    private shopPurchaseCounts: Record<string, number> = {};
    private shopDailyKey = '';
    private shopWeeklyKey = '';
    private shopItemWidgets = new Map<string, ShopItemWidget>();
    private shopGoldTabButtons: Record<'daily' | 'weekly', Node | null> = {
        daily: null,
        weekly: null,
    };
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
        this.homeGoldLabel = this.createLabel(topBar, '灵石 0', 22, new Vec3(-170, 0, 0), new Color(255, 220, 120, 255), 140);
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
        this.buildHomeAlchemyPanel();
        this.buildHomeKungfuPanel();
        this.buildHomeSpiritPetPanel();

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
            btn.on(Node.EventType.TOUCH_END, () => {
                if (tab.key === 'role') this.roleQuickFocus = 'general';
                this.closeRoleFeaturePanels();
                this.toggleAlchemyPanel(false);
                this.switchHomeTab(tab.key);
            }, this);
            this.homeNavButtons[tab.key] = btn;
            this.homeNavIcons[tab.key] = iconNode;
        });

        const taskBtn = this.createPanel(this.homeLayer, 96, 96, -280, -454, new Color(46, 56, 72, 248));
        const taskIcon = new Node('TaskIcon');
        taskIcon.layer = Layers.Enum.UI_2D;
        taskBtn.addChild(taskIcon);
        taskIcon.setPosition(0, 12, 0);
        taskIcon.addComponent(UITransform).setContentSize(40, 40);
        this.drawTaskQuickIcon(taskIcon, false);
        this.createLabel(taskBtn, '任务', 18, new Vec3(0, -24, 0), new Color(214, 224, 236, 255), 80);
        taskBtn.on(Node.EventType.TOUCH_END, () => this.toggleTaskPanel(), this);
        this.homeTaskButton = taskBtn;

        const alchemyBtn = this.createPanel(this.homeLayer, 96, 96, -168, -454, new Color(66, 52, 42, 248));
        const alchemyIcon = new Node('AlchemyIcon');
        alchemyIcon.layer = Layers.Enum.UI_2D;
        alchemyBtn.addChild(alchemyIcon);
        alchemyIcon.setPosition(0, 12, 0);
        alchemyIcon.addComponent(UITransform).setContentSize(40, 40);
        this.drawAlchemyQuickIcon(alchemyIcon, false);
        this.createLabel(alchemyBtn, '炼丹', 18, new Vec3(0, -24, 0), new Color(240, 226, 196, 255), 80);
        alchemyBtn.on(Node.EventType.TOUCH_END, () => this.openWorkshopPanel('furnace'), this);
        this.homeAlchemyQuickButton = alchemyBtn;

        const forgeBtn = this.createPanel(this.homeLayer, 96, 96, -56, -454, new Color(52, 58, 72, 248));
        const forgeIcon = new Node('ForgeIcon');
        forgeIcon.layer = Layers.Enum.UI_2D;
        forgeBtn.addChild(forgeIcon);
        forgeIcon.setPosition(0, 12, 0);
        forgeIcon.addComponent(UITransform).setContentSize(40, 40);
        this.drawForgeQuickIcon(forgeIcon, false);
        this.createLabel(forgeBtn, '炼器', 18, new Vec3(0, -24, 0), new Color(214, 224, 236, 255), 80);
        forgeBtn.on(Node.EventType.TOUCH_END, () => this.openWorkshopPanel('forge'), this);
        this.homeForgeQuickButton = forgeBtn;

        const kungfuBtn = this.createPanel(this.homeLayer, 96, 96, 56, -454, new Color(72, 58, 42, 248));
        const kungfuIcon = new Node('KungfuIcon');
        kungfuIcon.layer = Layers.Enum.UI_2D;
        kungfuBtn.addChild(kungfuIcon);
        kungfuIcon.setPosition(0, 12, 0);
        kungfuIcon.addComponent(UITransform).setContentSize(40, 40);
        this.drawKungfuQuickIcon(kungfuIcon, false);
        this.createLabel(kungfuBtn, '功法', 18, new Vec3(0, -24, 0), new Color(242, 230, 198, 255), 80);
        kungfuBtn.on(Node.EventType.TOUCH_END, () => this.openRoleFeature('kungfu'), this);
        this.homeKungfuQuickButton = kungfuBtn;

        const spiritPetBtn = this.createPanel(this.homeLayer, 96, 96, 168, -454, new Color(48, 70, 66, 248));
        const spiritPetIcon = new Node('SpiritPetIcon');
        spiritPetIcon.layer = Layers.Enum.UI_2D;
        spiritPetBtn.addChild(spiritPetIcon);
        spiritPetIcon.setPosition(0, 12, 0);
        spiritPetIcon.addComponent(UITransform).setContentSize(40, 40);
        this.drawSpiritPetQuickIcon(spiritPetIcon, false);
        this.createLabel(spiritPetBtn, '灵宠', 18, new Vec3(0, -24, 0), new Color(214, 240, 228, 255), 80);
        spiritPetBtn.on(Node.EventType.TOUCH_END, () => this.openRoleFeature('pet'), this);
        this.homeSpiritPetQuickButton = spiritPetBtn;

        this.buildHomeTaskPanel();

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
        const header = this.createPanel(this.homeDongtianView, 676, 128, 0, 378, new Color(36, 44, 56, 245));
        this.createLabel(header, '青岚洞天', 34, new Vec3(-220, 28, 0), new Color(244, 238, 220, 255), 180);
        this.createLabel(header, '玩家洞府已可挂载入洞天，借洞天灵机经营府内诸阵，并承接功勋差事。', 17, new Vec3(28, 26, 0), new Color(176, 194, 212, 255), 470);
        this.dongtianMountLabel = this.createLabel(header, '', 18, new Vec3(0, -12, 0), new Color(214, 224, 236, 255), 612);
        this.dongtianMeritLabel = this.createLabel(header, '', 17, new Vec3(0, -46, 0), new Color(222, 208, 164, 255), 612);

        const tabDefs: Array<{ key: DongtianTab; label: string; x: number }> = [
            { key: 'cave', label: '洞府灵域', x: -92 },
            { key: 'merit', label: '功勋堂', x: 92 },
        ];
        for (let i = 0; i < tabDefs.length; i++) {
            const tab = tabDefs[i];
            const tabBtn = this.createPanel(this.homeDongtianView, 156, 42, tab.x, 300, new Color(54, 62, 74, 255));
            this.createLabel(tabBtn, tab.label, 18, new Vec3(0, 0, 0), new Color(216, 226, 238, 255), 120);
            tabBtn.on(Node.EventType.TOUCH_END, () => this.switchDongtianTab(tab.key), this);
            this.dongtianTabButtons[tab.key] = tabBtn;
        }

        this.dongtianCavePage = new Node('DongtianCavePage');
        this.dongtianCavePage.layer = Layers.Enum.UI_2D;
        this.homeDongtianView.addChild(this.dongtianCavePage);
        this.dongtianCavePage.addComponent(UITransform).setContentSize(676, 700);
        this.dongtianCavePage.setPosition(0, -28, 0);

        const buildingXs = [-166, 166, -166, 166];
        const buildingYs = [188, 188, 26, 26];
        for (let i = 0; i < DONGTIAN_BUILDINGS.length; i++) {
            const def = DONGTIAN_BUILDINGS[i];
            const card = this.createPanel(this.dongtianCavePage, 286, 142, buildingXs[i], buildingYs[i], new Color(40, 48, 60, 245));
            const seal = this.createPanel(card, 52, 52, -96, 34, new Color(72, 84, 98, 255));
            this.createLabel(seal, def.glyph, 28, new Vec3(0, 0, 0), new Color(242, 236, 220, 255), 34);
            this.dongtianBuildingTitleLabels[def.id] = this.createLabel(card, '', 21, new Vec3(26, 38, 0), new Color(244, 238, 220, 255), 182);
            const info = this.createLabel(card, '', 15, new Vec3(26, 6, 0), new Color(182, 198, 216, 255), 192);
            info.lineHeight = 18;
            this.dongtianBuildingInfoLabels[def.id] = info;
            this.dongtianBuildingCostLabels[def.id] = this.createLabel(card, '', 14, new Vec3(18, -34, 0), new Color(222, 208, 164, 255), 194);
            const upgradeBtn = this.createPanel(card, 92, 32, 90, -48, new Color(82, 96, 112, 255));
            const btnLabel = this.createLabel(upgradeBtn, '升级', 16, new Vec3(0, 0, 0), new Color(238, 244, 250, 255), 80);
            upgradeBtn.on(Node.EventType.TOUCH_END, () => this.tryUpgradeBuilding(def.id), this);
            this.dongtianBuildingButtons[def.id] = upgradeBtn;
            this.dongtianBuildingButtonLabels[def.id] = btnLabel;
        }

        const tribulationPanel = this.createPanel(this.dongtianCavePage, 676, 190, 0, -196, new Color(38, 46, 58, 245));
        this.createLabel(tribulationPanel, '护劫概览', 30, new Vec3(-232, 54, 0), new Color(244, 238, 220, 255), 140);
        this.createLabel(tribulationPanel, '洞府灵脉与护山大阵会提供渡劫加成。实际筹备入口已收口到角色界面的“渡劫准备”按钮。', 16, new Vec3(24, 56, 0), new Color(174, 192, 210, 255), 454);
        this.dongtianSummaryLabel = this.createLabel(tribulationPanel, '', 17, new Vec3(0, 20, 0), new Color(214, 224, 236, 255), 612);
        this.dongtianSpiritLabel = this.createLabel(tribulationPanel, '', 16, new Vec3(0, -12, 0), new Color(222, 208, 164, 255), 612);
        this.dongtianTribulationLabel = this.createLabel(tribulationPanel, '', 16, new Vec3(0, -44, 0), new Color(196, 220, 200, 255), 612);
        this.createLabel(tribulationPanel, '前往角色界面进行渡劫准备', 18, new Vec3(0, -78, 0), new Color(228, 236, 208, 255), 260);

        this.dongtianMeritPage = new Node('DongtianMeritPage');
        this.dongtianMeritPage.layer = Layers.Enum.UI_2D;
        this.homeDongtianView.addChild(this.dongtianMeritPage);
        this.dongtianMeritPage.addComponent(UITransform).setContentSize(676, 700);
        this.dongtianMeritPage.setPosition(0, -28, 0);

        const meritTaskPanel = this.createPanel(this.dongtianMeritPage, 676, 272, 0, 146, new Color(38, 46, 58, 245));
        this.createLabel(meritTaskPanel, '功勋任务', 28, new Vec3(-238, 94, 0), new Color(244, 238, 220, 255), 140);
        this.createLabel(meritTaskPanel, '承接洞天差事换取功勋，可用于换取护劫资源与洞天专供。', 16, new Vec3(30, 92, 0), new Color(174, 192, 210, 255), 450);
        for (let i = 0; i < MERIT_TASKS.length; i++) {
            const row = this.createPanel(meritTaskPanel, 628, 60, 0, 34 - i * 72, new Color(44, 52, 64, 245));
            const title = this.createLabel(row, '', 18, new Vec3(-148, 12, 0), new Color(242, 238, 226, 255), 270);
            title.horizontalAlign = HorizontalTextAlignment.LEFT;
            const info = this.createLabel(row, '', 15, new Vec3(-148, -12, 0), new Color(176, 192, 210, 255), 270);
            info.horizontalAlign = HorizontalTextAlignment.LEFT;
            const reward = this.createLabel(row, '', 15, new Vec3(40, 0, 0), new Color(222, 208, 164, 255), 150);
            const claimBtn = this.createPanel(row, 92, 30, 244, 0, new Color(82, 96, 112, 255));
            const claimLabel = this.createLabel(claimBtn, '未达成', 15, new Vec3(0, 0, 0), new Color(238, 244, 250, 255), 80);
            claimBtn.on(Node.EventType.TOUCH_END, () => this.claimMeritTaskByRow(i), this);
            this.meritTaskRowTitleLabels.push(title);
            this.meritTaskRowInfoLabels.push(info);
            this.meritTaskRowRewardLabels.push(reward);
            this.meritTaskRowClaimButtons.push(claimBtn);
            this.meritTaskRowClaimLabels.push(claimLabel);
        }

        const meritShopPanel = this.createPanel(this.dongtianMeritPage, 676, 272, 0, -166, new Color(38, 46, 58, 245));
        this.createLabel(meritShopPanel, '功勋商店', 28, new Vec3(-238, 96, 0), new Color(244, 238, 220, 255), 140);
        this.createLabel(meritShopPanel, '洞天巡守、护劫符令与灵石供给皆可由功勋换取。', 16, new Vec3(28, 94, 0), new Color(174, 192, 210, 255), 450);
        const xs = [-204, 0, 204];
        for (let i = 0; i < MERIT_SHOP_ITEMS.length; i++) {
            const item = MERIT_SHOP_ITEMS[i];
            const card = this.createPanel(meritShopPanel, 190, 156, xs[i], -20, new Color(44, 52, 64, 245));
            this.createLabel(card, item.name, 20, new Vec3(0, 42, 0), new Color(242, 238, 226, 255), 150);
            this.createLabel(card, `功勋 ${item.cost}`, 16, new Vec3(0, 12, 0), new Color(226, 206, 160, 255), 150);
            this.createLabel(card, item.rewardText, 15, new Vec3(0, -18, 0), new Color(176, 192, 210, 255), 156);
            const stock = this.createLabel(card, '', 13, new Vec3(-18, -48, 0), new Color(196, 204, 214, 255), 104);
            stock.horizontalAlign = HorizontalTextAlignment.LEFT;
            const buyBtn = this.createPanel(card, 60, 28, 56, -48, new Color(76, 88, 100, 255));
            this.createLabel(buyBtn, '兑换', 14, new Vec3(0, 0, 0), new Color(240, 246, 252, 255));
            buyBtn.on(Node.EventType.TOUCH_END, () => this.buyMeritShopItem(item.id), this);
            this.meritShopItemWidgets.set(item.id, { button: buyBtn, stockLabel: stock });
        }
        this.switchDongtianTab('cave');
        this.refreshDongtianPanel();
    }

    private buildHomeAlchemyPanel() {
        this.homeAlchemyMask = new Node('AlchemyMask');
        this.homeAlchemyMask.layer = Layers.Enum.UI_2D;
        this.homeLayer.addChild(this.homeAlchemyMask);
        this.homeAlchemyMask.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
        this.homeAlchemyMask.setPosition(0, 0, 0);
        const maskG = this.homeAlchemyMask.addComponent(Graphics);
        maskG.fillColor = new Color(8, 12, 18, 150);
        maskG.rect(-HALF_WIDTH, -HALF_HEIGHT, DESIGN_WIDTH, DESIGN_HEIGHT);
        maskG.fill();
        this.homeAlchemyMask.on(Node.EventType.TOUCH_END, () => this.toggleAlchemyPanel(false), this);

        this.homeAlchemyPanel = this.createPanel(this.homeLayer, 660, 786, 0, -8, new Color(34, 40, 52, 252));
        this.createLabel(this.homeAlchemyPanel, '丹器工坊', 34, new Vec3(0, 338, 0), new Color(246, 230, 200, 255), 280);
        this.createLabel(this.homeAlchemyPanel, '以命名灵植与灵矿炼丹、炼器，补足局外成长与法器养成', 18, new Vec3(0, 302, 0), new Color(174, 190, 206, 255), 560);
        const closeBtn = this.createPanel(this.homeAlchemyPanel, 62, 36, 276, 338, new Color(62, 70, 82, 255));
        this.createLabel(closeBtn, '收起', 16, new Vec3(0, 0, 0), new Color(228, 236, 244, 255), 50);
        closeBtn.on(Node.EventType.TOUCH_END, () => this.toggleAlchemyPanel(false), this);

        const tabDefs: Array<{ key: AlchemyTab; label: string; x: number }> = [
            { key: 'furnace', label: '炼丹', x: -210 },
            { key: 'formula', label: '丹方', x: -70 },
            { key: 'storehouse', label: '材料库', x: 70 },
            { key: 'forge', label: '炼器', x: 210 },
        ];
        for (let i = 0; i < tabDefs.length; i++) {
            const tab = tabDefs[i];
            const tabBtn = this.createPanel(this.homeAlchemyPanel, 110, 42, tab.x, 244, new Color(52, 60, 72, 255));
            this.createLabel(tabBtn, tab.label, 18, new Vec3(0, 0, 0), new Color(212, 222, 234, 255), 100);
            tabBtn.on(Node.EventType.TOUCH_END, () => this.switchAlchemyTab(tab.key), this);
            this.alchemyTabButtons[tab.key] = tabBtn;
        }

        this.alchemyFurnacePage = new Node('AlchemyFurnacePage');
        this.alchemyFurnacePage.layer = Layers.Enum.UI_2D;
        this.homeAlchemyPanel.addChild(this.alchemyFurnacePage);
        this.alchemyFurnacePage.addComponent(UITransform).setContentSize(620, 520);
        this.alchemyFurnacePage.setPosition(0, -54, 0);
        const furnaceCore = this.createPanel(this.alchemyFurnacePage, 604, 320, 0, 72, new Color(44, 48, 60, 245));
        const cauldron = this.createPanel(furnaceCore, 148, 148, -194, 14, new Color(70, 56, 44, 255));
        this.createLabel(cauldron, '炉', 52, new Vec3(0, 16, 0), new Color(246, 232, 206, 255), 80);
        this.createLabel(cauldron, '丹火常燃', 18, new Vec3(0, -46, 0), new Color(196, 186, 170, 255), 100);
        this.alchemyTitleLabel = this.createLabel(furnaceCore, '', 30, new Vec3(56, 76, 0), new Color(244, 238, 220, 255), 360);
        this.alchemyInfoLabel = this.createLabel(furnaceCore, '', 18, new Vec3(82, 28, 0), new Color(182, 198, 216, 255), 420);
        this.alchemyCostLabel = this.createLabel(furnaceCore, '', 18, new Vec3(82, -26, 0), new Color(226, 206, 160, 255), 420);
        this.alchemyOutputLabel = this.createLabel(furnaceCore, '', 17, new Vec3(82, -72, 0), new Color(196, 220, 186, 255), 420);
        this.alchemyCraftBtn = this.createPanel(furnaceCore, 144, 42, 154, -118, new Color(94, 76, 58, 255));
        this.alchemyCraftBtnLabel = this.createLabel(this.alchemyCraftBtn, '', 18, new Vec3(0, 0, 0), new Color(248, 238, 220, 255), 110);
        this.alchemyCraftBtn.on(Node.EventType.TOUCH_END, () => this.tryCraftAlchemy(), this);
        this.alchemyUseBtn = this.createPanel(furnaceCore, 124, 38, 14, -118, new Color(60, 84, 72, 255));
        this.alchemyUseBtnLabel = this.createLabel(this.alchemyUseBtn, '服用丹药', 17, new Vec3(0, 0, 0), new Color(226, 242, 230, 255), 96);
        this.alchemyUseBtn.on(Node.EventType.TOUCH_END, () => this.tryConsumeAlchemyPill(), this);
        const reservePanel = this.createPanel(this.alchemyFurnacePage, 604, 154, 0, -156, new Color(42, 48, 60, 245));
        this.createLabel(reservePanel, '当前炉台', 24, new Vec3(-214, 42, 0), new Color(244, 238, 220, 255), 160);
        this.alchemyHintLabel = this.createLabel(reservePanel, '', 18, new Vec3(0, -8, 0), new Color(186, 200, 216, 255), 520);

        this.alchemyFormulaPage = new Node('AlchemyFormulaPage');
        this.alchemyFormulaPage.layer = Layers.Enum.UI_2D;
        this.homeAlchemyPanel.addChild(this.alchemyFormulaPage);
        this.alchemyFormulaPage.addComponent(UITransform).setContentSize(620, 520);
        this.alchemyFormulaPage.setPosition(0, -54, 0);
        const formulaXs = [-156, 156, -156, 156];
        const formulaYs = [92, 92, -92, -92];
        for (let i = 0; i < ALCHEMY_RECIPES.length; i++) {
            const recipe = ALCHEMY_RECIPES[i];
            const card = this.createPanel(this.alchemyFormulaPage, 252, 152, formulaXs[i], formulaYs[i], new Color(42, 48, 60, 245));
            const seal = this.createPanel(card, 58, 58, -82, 26, new Color(74, 60, 46, 255));
            this.createLabel(seal, recipe.glyph, 30, new Vec3(0, 0, 0), new Color(246, 230, 198, 255), 36);
            const titleLabel = this.createLabel(card, recipe.name, 24, new Vec3(24, 38, 0), new Color(244, 238, 220, 255), 160);
            const infoLabel = this.createLabel(card, '', 16, new Vec3(26, 2, 0), new Color(182, 198, 216, 255), 174);
            const stateLabel = this.createLabel(card, '', 15, new Vec3(26, -38, 0), new Color(206, 194, 162, 255), 174);
            card.on(Node.EventType.TOUCH_END, () => this.selectAlchemyRecipe(recipe.id), this);
            this.alchemyRecipeWidgets.set(recipe.id, { node: card, titleLabel, infoLabel, stateLabel });
        }

        this.alchemyStorehousePage = new Node('AlchemyStorehousePage');
        this.alchemyStorehousePage.layer = Layers.Enum.UI_2D;
        this.homeAlchemyPanel.addChild(this.alchemyStorehousePage);
        this.alchemyStorehousePage.addComponent(UITransform).setContentSize(620, 520);
        this.alchemyStorehousePage.setPosition(0, -54, 0);
        const materialXs = [-156, 156, -156, 156, -156, 156, -156, 156];
        const materialYs = [138, 138, 34, 34, -70, -70, -174, -174];
        for (let i = 0; i < MATERIAL_DEFS.length; i++) {
            const material = MATERIAL_DEFS[i];
            const card = this.createPanel(this.alchemyStorehousePage, 252, 86, materialXs[i], materialYs[i], new Color(42, 48, 60, 245));
            const accent = RARITY_COLORS[material.rarity];
            const seal = this.createPanel(card, 48, 48, -84, 0, new Color(accent.r, accent.g, accent.b, 56));
            this.createLabel(seal, material.shortName.slice(0, 1), 24, new Vec3(0, 0, 0), new Color(246, 230, 198, 255), 26);
            const name = this.createLabel(card, material.name, 20, new Vec3(18, 16, 0), new Color(244, 238, 220, 255), 150);
            name.horizontalAlign = HorizontalTextAlignment.LEFT;
            const kind = this.createLabel(card, `${RARITY_NAMES[material.rarity]}${material.kind === 'herb' ? '灵植' : '灵矿'}`, 15, new Vec3(18, -12, 0), new Color(accent.r, accent.g, accent.b, 255), 150);
            kind.horizontalAlign = HorizontalTextAlignment.LEFT;
            this.alchemyStorehouseLabels[material.id] = this.createLabel(card, '', 18, new Vec3(78, 0, 0), new Color(226, 210, 168, 255), 80);
        }

        this.alchemyForgePage = new Node('AlchemyForgePage');
        this.alchemyForgePage.layer = Layers.Enum.UI_2D;
        this.homeAlchemyPanel.addChild(this.alchemyForgePage);
        this.alchemyForgePage.addComponent(UITransform).setContentSize(620, 520);
        this.alchemyForgePage.setPosition(0, -54, 0);
        const forgeXs = [-180, 180, 0];
        const forgeYs = [88, 88, -112];
        for (let i = 0; i < FORGE_RECIPES.length; i++) {
            const recipe = FORGE_RECIPES[i];
            const card = this.createPanel(this.alchemyForgePage, 264, 154, forgeXs[i], forgeYs[i], new Color(42, 48, 60, 245));
            const seal = this.createPanel(card, 58, 58, -86, 26, new Color(82, 66, 48, 255));
            this.createLabel(seal, recipe.glyph, 30, new Vec3(0, 0, 0), new Color(246, 230, 198, 255), 36);
            const titleLabel = this.createLabel(card, recipe.name, 23, new Vec3(20, 38, 0), new Color(244, 238, 220, 255), 170);
            const infoLabel = this.createLabel(card, '', 16, new Vec3(20, 2, 0), new Color(182, 198, 216, 255), 182);
            const stateLabel = this.createLabel(card, '', 15, new Vec3(20, -38, 0), new Color(206, 194, 162, 255), 182);
            card.on(Node.EventType.TOUCH_END, () => this.selectForgeRecipe(recipe.id), this);
            this.forgeRecipeWidgets.set(recipe.id, { node: card, titleLabel, infoLabel, stateLabel });
        }

        this.homeAlchemyMask.active = false;
        this.homeAlchemyPanel.active = false;
        this.refreshAlchemyPanel();
    }

    private buildHomeTaskPanel() {
        this.homeTaskMask = new Node('TaskMask');
        this.homeTaskMask.layer = Layers.Enum.UI_2D;
        this.homeLayer.addChild(this.homeTaskMask);
        this.homeTaskMask.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
        this.homeTaskMask.setPosition(0, 0, 0);
        const maskG = this.homeTaskMask.addComponent(Graphics);
        maskG.fillColor = new Color(8, 12, 18, 140);
        maskG.rect(-HALF_WIDTH, -HALF_HEIGHT, DESIGN_WIDTH, DESIGN_HEIGHT);
        maskG.fill();
        this.homeTaskMask.on(Node.EventType.TOUCH_END, () => this.toggleTaskPanel(false), this);

        this.homeTaskPanel = this.createPanel(this.homeLayer, 652, 768, 0, -2, new Color(34, 40, 52, 252));
        this.createLabel(this.homeTaskPanel, '修行任务簿', 34, new Vec3(0, 334, 0), new Color(244, 236, 214, 255), 260);
        this.createLabel(this.homeTaskPanel, '按日常、周常、成就与主线统筹修行节奏', 18, new Vec3(0, 298, 0), new Color(166, 184, 202, 255), 520);
        const closeBtn = this.createPanel(this.homeTaskPanel, 62, 36, 270, 334, new Color(62, 70, 82, 255));
        this.createLabel(closeBtn, '收起', 16, new Vec3(0, 0, 0), new Color(228, 236, 244, 255), 50);
        closeBtn.on(Node.EventType.TOUCH_END, () => this.toggleTaskPanel(false), this);

        const tabDefs: Array<{ key: TaskTab; label: string; x: number }> = [
            { key: 'daily', label: '每日任务', x: -210 },
            { key: 'weekly', label: '每周任务', x: -70 },
            { key: 'achievement', label: '成就任务', x: 70 },
            { key: 'mainline', label: '主线任务', x: 210 },
        ];
        for (let i = 0; i < tabDefs.length; i++) {
            const tab = tabDefs[i];
            const tabBtn = this.createPanel(this.homeTaskPanel, 126, 42, tab.x, 246, new Color(52, 60, 72, 255));
            this.createLabel(tabBtn, tab.label, 18, new Vec3(0, 0, 0), new Color(210, 220, 232, 255), 110);
            tabBtn.on(Node.EventType.TOUCH_END, () => this.switchTaskTab(tab.key), this);
            this.taskTabButtons[tab.key] = tabBtn;
        }

        for (let i = 0; i < 3; i++) {
            const row = this.createPanel(this.homeTaskPanel, 592, 146, 0, 96 - i * 184, new Color(42, 48, 60, 245));
            const badge = this.createPanel(row, 72, 72, -228, 0, new Color(60, 72, 88, 255));
            this.createLabel(badge, `${i + 1}`, 28, new Vec3(0, 0, 0), new Color(242, 236, 220, 255), 48);
            const titleLabel = this.createLabel(row, '', 24, new Vec3(42, 38, 0), new Color(242, 238, 226, 255), 380);
            const infoLabel = this.createLabel(row, '', 18, new Vec3(42, 0, 0), new Color(176, 192, 210, 255), 400);
            const rewardLabel = this.createLabel(row, '', 17, new Vec3(42, -42, 0), new Color(222, 208, 164, 255), 400);
            const claimBtn = this.createPanel(row, 110, 42, 212, 0, new Color(74, 92, 112, 255));
            const claimLabel = this.createLabel(claimBtn, '未达成', 18, new Vec3(0, 0, 0), new Color(226, 234, 242, 255), 92);
            claimBtn.on(Node.EventType.TOUCH_END, () => this.claimTaskByRow(i), this);
            this.taskRowNodes.push(row);
            this.taskRowTitleLabels.push(titleLabel);
            this.taskRowInfoLabels.push(infoLabel);
            this.taskRowRewardLabels.push(rewardLabel);
            this.taskRowClaimButtons.push(claimBtn);
            this.taskRowClaimLabels.push(claimLabel);
        }

        this.homeTaskMask.active = false;
        this.homeTaskPanel.active = false;
        this.refreshTaskPanel();
    }

    private buildHomeKungfuPanel() {
        this.homeKungfuMask = new Node('KungfuMask');
        this.homeKungfuMask.layer = Layers.Enum.UI_2D;
        this.homeLayer.addChild(this.homeKungfuMask);
        this.homeKungfuMask.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
        this.homeKungfuMask.setPosition(0, 0, 0);
        const maskG = this.homeKungfuMask.addComponent(Graphics);
        maskG.fillColor = new Color(8, 12, 18, 140);
        maskG.rect(-HALF_WIDTH, -HALF_HEIGHT, DESIGN_WIDTH, DESIGN_HEIGHT);
        maskG.fill();
        this.homeKungfuMask.on(Node.EventType.TOUCH_END, () => this.toggleKungfuPanel(false), this);

        this.homeKungfuPanel = this.createPanel(this.homeLayer, 652, 768, 0, -2, new Color(34, 40, 52, 252));
        this.createLabel(this.homeKungfuPanel, '功法阁', 34, new Vec3(0, 328, 0), new Color(244, 236, 214, 255), 260);
        this.createLabel(this.homeKungfuPanel, '由低到高观览诸法，切换当前运转功法并决定主修方向', 18, new Vec3(0, 292, 0), new Color(166, 184, 202, 255), 540);
        const closeBtn = this.createPanel(this.homeKungfuPanel, 62, 36, 270, 328, new Color(62, 70, 82, 255));
        this.createLabel(closeBtn, '收起', 16, new Vec3(0, 0, 0), new Color(228, 236, 244, 255), 50);
        closeBtn.on(Node.EventType.TOUCH_END, () => this.toggleKungfuPanel(false), this);

        const detail = this.createPanel(this.homeKungfuPanel, 596, 246, 0, 156, new Color(42, 48, 60, 245));
        const seal = this.createPanel(detail, 112, 112, -214, 18, new Color(86, 70, 50, 255));
        this.createLabel(seal, '诀', 46, new Vec3(0, 8, 0), new Color(246, 232, 206, 255), 52);
        this.createLabel(seal, '主修法门', 16, new Vec3(0, -34, 0), new Color(198, 188, 170, 255), 88);
        this.kungfuPageNameLabel = this.createLabel(detail, '', 30, new Vec3(66, 74, 0), new Color(244, 238, 220, 255), 390);
        this.kungfuPageInfoLabel = this.createLabel(detail, '', 18, new Vec3(78, 24, 0), new Color(186, 202, 220, 255), 406);
        this.kungfuPageEffectLabel = this.createLabel(detail, '', 17, new Vec3(78, -38, 0), new Color(220, 212, 174, 255), 406);
        const actionStrip = this.createPanel(detail, 364, 52, 98, -104, new Color(46, 54, 68, 255));
        this.kungfuPageRunButton = this.createPanel(actionStrip, 136, 36, -78, 0, new Color(96, 78, 54, 255));
        this.kungfuPageRunButtonLabel = this.createLabel(this.kungfuPageRunButton, '', 17, new Vec3(0, 0, 0), new Color(248, 238, 220, 255), 116);
        this.kungfuPageRunButton.on(Node.EventType.TOUCH_END, () => this.equipSelectedKungfu(), this);
        this.kungfuPageUpgradeButton = this.createPanel(actionStrip, 136, 36, 78, 0, new Color(62, 88, 74, 255));
        this.kungfuPageUpgradeButtonLabel = this.createLabel(this.kungfuPageUpgradeButton, '', 17, new Vec3(0, 0, 0), new Color(228, 244, 230, 255), 116);
        this.kungfuPageUpgradeButton.on(Node.EventType.TOUCH_END, () => this.tryUpgradeSelectedKungfu(), this);
        this.kungfuPageHintLabel = this.createLabel(detail, '', 15, new Vec3(0, -146, 0), new Color(170, 188, 206, 255), 520);

        const listPanel = this.createPanel(this.homeKungfuPanel, 596, 354, 0, -172, new Color(40, 46, 58, 245));
        this.createLabel(listPanel, '功法谱录', 28, new Vec3(-214, 142, 0), new Color(244, 238, 220, 255), 160);
        this.createLabel(listPanel, '由低到高陈列全部功法，点选即可切换当前参悟目标', 16, new Vec3(34, 142, 0), new Color(150, 166, 186, 255), 380);
        for (let i = 0; i < KUNGFU_DEFS.length; i++) {
            const def = KUNGFU_DEFS[i];
            const card = this.createPanel(listPanel, 548, 72, 0, 62 - i * 82, new Color(42, 48, 58, 245));
            this.createLabel(card, def.glyph, 28, new Vec3(-232, 0, 0), new Color(226, 206, 160, 255), 32);
            const titleLabel = this.createLabel(card, def.name, 22, new Vec3(-108, 16, 0), new Color(242, 238, 224, 255), 190);
            titleLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
            const infoLabel = this.createLabel(card, '', 15, new Vec3(-12, -12, 0), new Color(186, 202, 220, 255), 318);
            infoLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
            const stateLabel = this.createLabel(card, '', 15, new Vec3(182, 0, 0), new Color(220, 212, 174, 255), 120);
            card.on(Node.EventType.TOUCH_END, () => {
                this.selectedKungfuId = def.id;
                this.refreshHomeStatus();
            }, this);
            this.kungfuListWidgets.set(def.id, { node: card, titleLabel, infoLabel, stateLabel });
        }

        this.homeKungfuMask.active = false;
        this.homeKungfuPanel.active = false;
    }

    private buildHomeSpiritPetPanel() {
        this.homeSpiritPetMask = new Node('SpiritPetMask');
        this.homeSpiritPetMask.layer = Layers.Enum.UI_2D;
        this.homeLayer.addChild(this.homeSpiritPetMask);
        this.homeSpiritPetMask.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
        this.homeSpiritPetMask.setPosition(0, 0, 0);
        const maskG = this.homeSpiritPetMask.addComponent(Graphics);
        maskG.fillColor = new Color(8, 12, 18, 140);
        maskG.rect(-HALF_WIDTH, -HALF_HEIGHT, DESIGN_WIDTH, DESIGN_HEIGHT);
        maskG.fill();
        this.homeSpiritPetMask.on(Node.EventType.TOUCH_END, () => this.toggleSpiritPetPanel(false), this);

        this.homeSpiritPetPanel = this.createPanel(this.homeLayer, 652, 768, 0, -2, new Color(34, 40, 52, 252));
        this.createLabel(this.homeSpiritPetPanel, '灵宠苑', 34, new Vec3(0, 328, 0), new Color(232, 244, 236, 255), 260);
        this.createLabel(this.homeSpiritPetPanel, '上观灵宠立绘并设置出战，下览全部灵宠谱录，切换当前养成目标', 18, new Vec3(0, 292, 0), new Color(166, 184, 202, 255), 560);
        const closeBtn = this.createPanel(this.homeSpiritPetPanel, 62, 36, 270, 328, new Color(62, 70, 82, 255));
        this.createLabel(closeBtn, '收起', 16, new Vec3(0, 0, 0), new Color(228, 236, 244, 255), 50);
        closeBtn.on(Node.EventType.TOUCH_END, () => this.toggleSpiritPetPanel(false), this);

        const topPanel = this.createPanel(this.homeSpiritPetPanel, 596, 304, 0, 140, new Color(42, 48, 60, 245));
        const portraitFrame = this.createPanel(topPanel, 218, 224, -176, -2, new Color(46, 58, 66, 255));
        this.spiritPetPagePortrait = new Node('SpiritPetPortrait');
        this.spiritPetPagePortrait.layer = Layers.Enum.UI_2D;
        portraitFrame.addChild(this.spiritPetPagePortrait);
        this.spiritPetPagePortrait.setPosition(0, 0, 0);
        this.spiritPetPagePortrait.addComponent(UITransform).setContentSize(196, 188);
        this.spiritPetPageNameLabel = this.createLabel(topPanel, '', 30, new Vec3(86, 92, 0), new Color(240, 244, 230, 255), 318);
        this.spiritPetPageInfoLabel = this.createLabel(topPanel, '', 17, new Vec3(96, 38, 0), new Color(186, 202, 220, 255), 336);
        this.spiritPetPageEffectLabel = this.createLabel(topPanel, '', 17, new Vec3(96, -26, 0), new Color(210, 224, 196, 255), 336);
        const actionStrip = this.createPanel(topPanel, 328, 52, 106, -100, new Color(46, 54, 68, 255));
        this.spiritPetPageDeployButton = this.createPanel(actionStrip, 136, 36, -78, 0, new Color(64, 90, 74, 255));
        this.spiritPetPageDeployButtonLabel = this.createLabel(this.spiritPetPageDeployButton, '', 17, new Vec3(0, 0, 0), new Color(228, 244, 230, 255), 116);
        this.spiritPetPageDeployButton.on(Node.EventType.TOUCH_END, () => this.equipSelectedSpiritPet(), this);
        this.spiritPetPageUpgradeButton = this.createPanel(actionStrip, 136, 36, 78, 0, new Color(76, 82, 96, 255));
        this.spiritPetPageUpgradeButtonLabel = this.createLabel(this.spiritPetPageUpgradeButton, '', 17, new Vec3(0, 0, 0), new Color(236, 242, 248, 255), 116);
        this.spiritPetPageUpgradeButton.on(Node.EventType.TOUCH_END, () => this.tryUpgradeSelectedSpiritPet(), this);
        this.spiritPetPageHintLabel = this.createLabel(topPanel, '', 15, new Vec3(0, -146, 0), new Color(170, 188, 206, 255), 520);

        const listPanel = this.createPanel(this.homeSpiritPetPanel, 596, 286, 0, -198, new Color(40, 46, 58, 245));
        this.createLabel(listPanel, '灵宠谱录', 28, new Vec3(-214, 108, 0), new Color(244, 238, 220, 255), 160);
        this.createLabel(listPanel, '由低到高展示全部灵宠，点选后切换当前养成与出战候选', 16, new Vec3(30, 108, 0), new Color(150, 166, 186, 255), 390);
        for (let i = 0; i < SPIRIT_PET_DEFS.length; i++) {
            const def = SPIRIT_PET_DEFS[i];
            const card = this.createPanel(listPanel, 548, 72, 0, 26 - i * 78, new Color(42, 48, 58, 245));
            this.createLabel(card, def.glyph, 28, new Vec3(-232, 0, 0), new Color(188, 232, 206, 255), 32);
            const titleLabel = this.createLabel(card, def.name, 22, new Vec3(-108, 16, 0), new Color(242, 238, 224, 255), 190);
            titleLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
            const infoLabel = this.createLabel(card, '', 15, new Vec3(-12, -12, 0), new Color(186, 202, 220, 255), 318);
            infoLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
            const stateLabel = this.createLabel(card, '', 15, new Vec3(182, 0, 0), new Color(210, 224, 196, 255), 120);
            card.on(Node.EventType.TOUCH_END, () => {
                this.selectedSpiritPetId = def.id;
                this.refreshHomeStatus();
            }, this);
            this.spiritPetListWidgets.set(def.id, { node: card, titleLabel, infoLabel, stateLabel });
        }

        this.homeSpiritPetMask.active = false;
        this.homeSpiritPetPanel.active = false;
    }

    private buildHomeShopView() {
        this.ensureShopRefreshState();
        const scrollNode = new Node('ShopScrollView');
        scrollNode.layer = Layers.Enum.UI_2D;
        this.homeShopView.addChild(scrollNode);
        scrollNode.setPosition(0, 0, 0);
        scrollNode.addComponent(UITransform).setContentSize(676, 900);

        const viewport = new Node('view');
        viewport.layer = Layers.Enum.UI_2D;
        scrollNode.addChild(viewport);
        viewport.setPosition(0, 0, 0);
        viewport.addComponent(UITransform).setContentSize(676, 900);
        viewport.addComponent(Mask);

        const content = new Node('content');
        content.layer = Layers.Enum.UI_2D;
        viewport.addChild(content);
        content.addComponent(UITransform).setContentSize(660, 1440);
        content.setPosition(0, 270, 0);
        this.shopScrollContent = content;
        this.attachVerticalDragScroll(viewport, content);

        const header = this.createPanel(content, 640, 126, 0, 334, new Color(40, 44, 52, 245));
        this.createLabel(header, '云游商坊', 34, new Vec3(0, 30, 0), new Color(238, 224, 180, 255));
        this.createLabel(header, '竖向浏览各类商店；灵石商店按每日 / 每周切换，其余分页保持常驻供给。', 17, new Vec3(0, -4, 0), new Color(184, 198, 210, 255), 586);
        this.shopCurrencyLabel = this.createLabel(header, '', 17, new Vec3(0, -42, 0), new Color(210, 220, 232, 255), 586);

        const goldPanel = this.buildShopSection(content, '灵石商店', '消耗灵石购买日常补给与周常成长材料', 114, 352, new Color(58, 52, 42, 245), new Color(230, 202, 130, 255), '灵');
        const dailyBtn = this.createPanel(goldPanel, 88, 34, 176, 86, new Color(70, 62, 48, 255));
        const weeklyBtn = this.createPanel(goldPanel, 88, 34, 272, 86, new Color(58, 56, 50, 255));
        this.createLabel(dailyBtn, '每日', 18, new Vec3(0, 0, 0), new Color(244, 234, 214, 255));
        this.createLabel(weeklyBtn, '每周', 18, new Vec3(0, 0, 0), new Color(196, 190, 180, 255));
        dailyBtn.on(Node.EventType.TOUCH_END, () => this.switchGoldShopTab('daily'), this);
        weeklyBtn.on(Node.EventType.TOUCH_END, () => this.switchGoldShopTab('weekly'), this);
        this.shopGoldTabButtons.daily = dailyBtn;
        this.shopGoldTabButtons.weekly = weeklyBtn;

        this.shopGoldDailyPage = new Node('GoldDailyPage');
        this.shopGoldDailyPage.layer = Layers.Enum.UI_2D;
        goldPanel.addChild(this.shopGoldDailyPage);
        this.shopGoldDailyPage.addComponent(UITransform).setContentSize(596, 236);
        this.shopGoldDailyPage.setPosition(0, -34, 0);
        this.buildShopGrid(this.shopGoldDailyPage, GOLD_DAILY_SHOP_ITEMS, new Color(224, 200, 146, 255), new Color(72, 62, 50, 255));

        this.shopGoldWeeklyPage = new Node('GoldWeeklyPage');
        this.shopGoldWeeklyPage.layer = Layers.Enum.UI_2D;
        goldPanel.addChild(this.shopGoldWeeklyPage);
        this.shopGoldWeeklyPage.addComponent(UITransform).setContentSize(596, 236);
        this.shopGoldWeeklyPage.setPosition(0, -34, 0);
        this.buildShopGrid(this.shopGoldWeeklyPage, GOLD_WEEKLY_SHOP_ITEMS, new Color(214, 190, 162, 255), new Color(68, 60, 56, 255));

        const mijingPanel = this.buildShopSection(content, '秘境商店', '每周刷新，使用秘境徽记兑换稀有材料与探索道具', -214, 320, new Color(42, 52, 56, 245), new Color(166, 214, 200, 255), '秘');
        this.createLabel(mijingPanel, '每周一辰时刷新', 16, new Vec3(228, 72, 0), new Color(172, 214, 196, 255), 140);
        this.buildShopGrid(mijingPanel, MIJING_SHOP_ITEMS, new Color(170, 216, 202, 255), new Color(50, 62, 66, 255));

        const crystalPanel = this.buildShopSection(content, '钻石商店', '常驻出售高价值成长包、外观与便利道具', -554, 320, new Color(44, 48, 62, 245), new Color(176, 206, 242, 255), '晶');
        this.buildShopGrid(crystalPanel, DIAMOND_SHOP_ITEMS, new Color(180, 210, 242, 255), new Color(52, 58, 74, 255));

        this.shopHintLabel = this.createLabel(content, '', 18, new Vec3(0, -790, 0), new Color(160, 184, 204, 255), 620);

        this.switchGoldShopTab('daily');
        this.refreshShopStatus();
    }

    private buildShopSection(parent: Node, title: string, subtitle: string, y: number, height: number, fill: Color, accent: Color, glyph: string) {
        const panel = this.createPanel(parent, 640, height, 0, y, fill);
        this.decorateRoleInfoCard(panel, accent, glyph, subtitle);
        this.createLabel(panel, title, 28, new Vec3(-220, height / 2 - 28, 0), new Color(242, 240, 230, 255), 180);
        return panel;
    }

    private buildShopGrid(parent: Node, items: ShopItemDef[], accent: Color, fill: Color) {
        const gridRows = Math.ceil(items.length / 3);
        const visibleRows = Math.min(2, gridRows);
        const viewHeight = visibleRows * 104 + 8;
        const scrollRoot = new Node('ShopGridScroll');
        scrollRoot.layer = Layers.Enum.UI_2D;
        parent.addChild(scrollRoot);
        scrollRoot.setPosition(0, -30, 0);
        scrollRoot.addComponent(UITransform).setContentSize(606, viewHeight);

        const viewNode = new Node('view');
        viewNode.layer = Layers.Enum.UI_2D;
        scrollRoot.addChild(viewNode);
        viewNode.setPosition(0, 0, 0);
        viewNode.addComponent(UITransform).setContentSize(606, viewHeight);
        viewNode.addComponent(Mask);

        const contentNode = new Node('content');
        contentNode.layer = Layers.Enum.UI_2D;
        viewNode.addChild(contentNode);
        const contentHeight = Math.max(viewHeight, gridRows * 104 + 8);
        contentNode.addComponent(UITransform).setContentSize(596, contentHeight);
        contentNode.setPosition(0, (contentHeight - viewHeight) * 0.5, 0);
        if (gridRows > 2) this.attachVerticalDragScroll(viewNode, contentNode);

        const startX = -192;
        const startY = contentHeight / 2 - 52;
        const cardW = 180;
        const cardH = 94;
        const gapX = 192;
        const gapY = 104;
        for (let i = 0; i < items.length; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = startX + col * gapX;
            const y = startY - row * gapY;
            const card = this.createPanel(contentNode, cardW, cardH, x, y, fill);
            this.repaintPanel(card, fill, new Color(accent.r, accent.g, accent.b, 128));
            const icon = new Node('ShopCellIcon');
            icon.layer = Layers.Enum.UI_2D;
            card.addChild(icon);
            icon.setPosition(-66, 14, 0);
            icon.addComponent(UITransform).setContentSize(34, 34);
            const g = icon.addComponent(Graphics);
            g.fillColor = new Color(accent.r, accent.g, accent.b, 40);
            g.strokeColor = new Color(accent.r, accent.g, accent.b, 210);
            g.lineWidth = 1.8;
            g.roundRect(-14, -14, 28, 28, 8);
            g.fill();
            g.roundRect(-14, -14, 28, 28, 8);
            g.stroke();
            g.moveTo(-6, 0);
            g.lineTo(0, 6);
            g.lineTo(7, -6);
            g.stroke();
            const name = this.createLabel(card, items[i].name, 19, new Vec3(18, 24, 0), new Color(236, 240, 244, 255), 118);
            name.horizontalAlign = HorizontalTextAlignment.LEFT;
            const price = this.createLabel(card, `${this.getShopCurrencyLabel(items[i].currency)} ${items[i].cost}`, 15, new Vec3(18, 2, 0), accent, 118);
            price.horizontalAlign = HorizontalTextAlignment.LEFT;
            const desc = this.createLabel(card, items[i].rewardText, 14, new Vec3(18, -16, 0), new Color(176, 188, 200, 255), 118);
            desc.horizontalAlign = HorizontalTextAlignment.LEFT;
            const stock = this.createLabel(card, '', 12, new Vec3(-26, -36, 0), new Color(196, 204, 214, 255), 104);
            stock.horizontalAlign = HorizontalTextAlignment.LEFT;
            const buyBtn = this.createPanel(card, 60, 28, 56, -34, new Color(76, 88, 100, 255));
            this.createLabel(buyBtn, '购买', 14, new Vec3(0, 0, 0), new Color(240, 246, 252, 255));
            buyBtn.on(Node.EventType.TOUCH_END, () => this.buyShopItem(items[i].id), this);
            this.shopItemWidgets.set(items[i].id, { button: buyBtn, stockLabel: stock });
        }

        if (gridRows > 2) {
            this.createLabel(parent, '下拉查看更多', 14, new Vec3(222, -126, 0), new Color(accent.r, accent.g, accent.b, 220), 140);
        }
    }

    private getShopCurrencyLabel(currency: ShopCurrency) {
        switch (currency) {
            case 'gold':
                return '灵石';
            case 'diamond':
                return '钻石';
            case 'mijing':
                return '徽记';
            default:
                return '';
        }
    }

    private attachVerticalDragScroll(viewNode: Node, contentNode: Node) {
        const viewTransform = viewNode.getComponent(UITransform);
        const contentTransform = contentNode.getComponent(UITransform);
        if (!viewTransform || !contentTransform) return;
        const maxOffset = Math.max(0, (contentTransform.contentSize.height - viewTransform.contentSize.height) * 0.5);
        if (maxOffset <= 0) return;
        const onMove = (event: any) => {
            const delta = typeof event.getUIDelta === 'function' ? event.getUIDelta() : { x: 0, y: 0 };
            const nextY = Math.max(-maxOffset, Math.min(maxOffset, contentNode.position.y + delta.y));
            contentNode.setPosition(0, nextY, 0);
            if (typeof event.propagationStopped !== 'undefined') event.propagationStopped = true;
        };
        const onWheel = (event: any) => {
            const deltaY = event.getScrollY ? event.getScrollY() : 0;
            const nextY = Math.max(-maxOffset, Math.min(maxOffset, contentNode.position.y - deltaY * 0.18));
            contentNode.setPosition(0, nextY, 0);
        };
        viewNode.on(Node.EventType.TOUCH_MOVE, onMove, this);
        contentNode.on(Node.EventType.TOUCH_MOVE, onMove, this);
        viewNode.on(Node.EventType.MOUSE_WHEEL, onWheel, this);
    }

    private switchGoldShopTab(tab: 'daily' | 'weekly') {
        this.shopGoldTab = tab;
        if (this.shopGoldDailyPage) this.shopGoldDailyPage.active = tab === 'daily';
        if (this.shopGoldWeeklyPage) this.shopGoldWeeklyPage.active = tab === 'weekly';
        const dailyBtn = this.shopGoldTabButtons.daily;
        const weeklyBtn = this.shopGoldTabButtons.weekly;
        if (dailyBtn) {
            this.repaintPanel(dailyBtn, tab === 'daily' ? new Color(102, 84, 58, 255) : new Color(70, 62, 48, 255), tab === 'daily' ? new Color(234, 208, 152, 220) : new Color(128, 112, 92, 180));
            const labels = dailyBtn.getComponentsInChildren(Label);
            labels.forEach((label) => {
                label.color = tab === 'daily' ? new Color(255, 244, 220, 255) : new Color(208, 198, 182, 255);
            });
        }
        if (weeklyBtn) {
            this.repaintPanel(weeklyBtn, tab === 'weekly' ? new Color(92, 82, 68, 255) : new Color(58, 56, 50, 255), tab === 'weekly' ? new Color(230, 214, 184, 220) : new Color(124, 118, 108, 180));
            const labels = weeklyBtn.getComponentsInChildren(Label);
            labels.forEach((label) => {
                label.color = tab === 'weekly' ? new Color(255, 244, 220, 255) : new Color(196, 190, 180, 255);
            });
        }
    }

    private getAllShopItems() {
        return GOLD_DAILY_SHOP_ITEMS.concat(GOLD_WEEKLY_SHOP_ITEMS, MIJING_SHOP_ITEMS, DIAMOND_SHOP_ITEMS);
    }

    private getShopItemById(id: string) {
        const items = this.getAllShopItems();
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === id) return items[i];
        }
        return null;
    }

    private getShopDailyKey() {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    }

    private getShopWeeklyKey() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const elapsedDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
        const week = Math.floor((elapsedDays + start.getDay()) / 7) + 1;
        return `${now.getFullYear()}-W${week}`;
    }

    private clearShopPurchases(type: ShopRefreshType) {
        const items = this.getAllShopItems();
        for (let i = 0; i < items.length; i++) {
            if (items[i].refresh === type && this.shopPurchaseCounts[items[i].id] !== undefined) {
                delete this.shopPurchaseCounts[items[i].id];
            }
        }
    }

    private ensureShopRefreshState() {
        const dailyKey = this.getShopDailyKey();
        const weeklyKey = this.getShopWeeklyKey();
        if (this.shopDailyKey !== dailyKey) {
            this.shopDailyKey = dailyKey;
            this.clearShopPurchases('daily');
        }
        if (this.shopWeeklyKey !== weeklyKey) {
            this.shopWeeklyKey = weeklyKey;
            this.clearShopPurchases('weekly');
        }
    }

    private getShopCurrencyAmount(currency: ShopCurrency) {
        switch (currency) {
            case 'gold':
                return this.getSpiritStoneTotalValue(this.spiritStoneInventory);
            case 'diamond':
                return this.mysticCrystal;
            case 'mijing':
                return this.dungeonBadge;
            default:
                return 0;
        }
    }

    private consumeShopCurrency(currency: ShopCurrency, amount: number) {
        switch (currency) {
            case 'gold':
                this.consumeSpiritStoneValue(amount);
                break;
            case 'diamond':
                this.mysticCrystal = Math.max(0, this.mysticCrystal - amount);
                break;
            case 'mijing':
                this.dungeonBadge = Math.max(0, this.dungeonBadge - amount);
                break;
        }
    }

    private applyShopItemReward(item: { effect: ShopRewardType; effectValue: number }) {
        switch (item.effect) {
            case 'hp':
                this.shopBonusHp += item.effectValue;
                this.playerMaxHp += item.effectValue;
                this.playerHp = this.playerMaxHp;
                break;
            case 'mana':
                this.shopBonusMana += item.effectValue;
                this.playerMaxMana += item.effectValue;
                this.playerMana = this.playerMaxMana;
                break;
            case 'atk':
                this.shopBonusDamage += item.effectValue;
                this.playerDamage += item.effectValue;
                break;
            case 'ap':
                this.shopBonusAction += item.effectValue;
                this.actionPointMax += item.effectValue;
                this.actionPoints = Math.min(this.actionPointMax, this.actionPoints + item.effectValue);
                break;
            case 'exp':
                this.realmExp += item.effectValue;
                break;
            case 'crystal':
                this.mysticCrystal += item.effectValue;
                break;
            case 'artifactExp':
                this.artifactExpPool += item.effectValue;
                break;
            case 'spiritStone':
                this.addSpiritStoneValue(item.effectValue, 'home');
                break;
        }
    }

    private buyShopItem(id: string) {
        this.ensureTaskRefreshState();
        this.ensureShopRefreshState();
        const item = this.getShopItemById(id);
        if (!item) return;
        const bought = this.shopPurchaseCounts[id] || 0;
        if (bought >= item.limit) {
            if (this.shopHintLabel) this.shopHintLabel.string = `${item.name} 已售罄，等待${item.refresh === 'daily' ? '每日' : '每周'}刷新。`;
            this.refreshShopStatus();
            return;
        }
        if (this.getShopCurrencyAmount(item.currency) < item.cost) {
            if (this.shopHintLabel) this.shopHintLabel.string = `${item.name} 需要 ${this.getShopCurrencyLabel(item.currency)} ${item.cost}。`;
            this.refreshShopStatus();
            return;
        }
        this.consumeShopCurrency(item.currency, item.cost);
        this.applyShopItemReward(item);
        this.shopPurchaseCounts[id] = bought + 1;
        this.addTaskProgress('daily_shop_purchase', 1);
        if (this.shopHintLabel) this.shopHintLabel.string = `购入 ${item.name}，获得 ${item.rewardText}。`;
        this.refreshHomeStatus();
    }

    private refreshShopStatus() {
        this.ensureShopRefreshState();
        if (this.shopCurrencyLabel) {
            this.shopCurrencyLabel.string = `灵石 ${this.getSpiritStoneSummary(this.spiritStoneInventory, 2)}  |  折值 ${this.getSpiritStoneTotalValue(this.spiritStoneInventory)}  |  秘境徽记 ${this.dungeonBadge}`;
        }
        const items = this.getAllShopItems();
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const widget = this.shopItemWidgets.get(item.id);
            if (!widget) continue;
            const bought = this.shopPurchaseCounts[item.id] || 0;
            const soldOut = bought >= item.limit;
            widget.stockLabel.string = soldOut ? '已售罄' : `余量 ${item.limit - bought}/${item.limit} · ${item.description}`;
            widget.stockLabel.color = soldOut ? new Color(188, 144, 144, 255) : new Color(196, 204, 214, 255);
            this.repaintPanel(widget.button, soldOut ? new Color(82, 68, 68, 255) : new Color(76, 88, 100, 255), soldOut ? new Color(156, 120, 120, 180) : new Color(166, 192, 216, 180));
            const labels = widget.button.getComponentsInChildren(Label);
            labels.forEach((label) => {
                label.string = soldOut ? '售罄' : '购买';
                label.color = soldOut ? new Color(214, 188, 188, 255) : new Color(240, 246, 252, 255);
            });
        }
    }

    private buildHomeFaqiView() {
        const detail = this.createPanel(this.homeFaqiView, 676, 300, 0, 208, new Color(38, 44, 56, 245));
        this.decorateRoleInfoCard(detail, new Color(180, 214, 240, 255), '器', '中枢养成');
        this.faqiExpLabel = this.createLabel(detail, '', 19, new Vec3(0, 122, 0), new Color(220, 232, 244, 255), 620);

        const iconPanel = this.createPanel(detail, 168, 168, -228, 2, new Color(48, 58, 72, 245));
        this.faqiGlyphLabel = this.createLabel(iconPanel, '', 54, new Vec3(0, 22, 0), new Color(240, 244, 232, 255), 110);
        this.createLabel(iconPanel, '当前本命', 18, new Vec3(0, -52, 0), new Color(182, 202, 220, 255), 120);

        this.faqiDetailTitleLabel = this.createLabel(detail, '', 30, new Vec3(42, 76, 0), new Color(244, 238, 220, 255), 360);
        this.faqiDetailInfoLabel = this.createLabel(detail, '', 18, new Vec3(88, 30, 0), new Color(186, 202, 220, 255), 448);
        this.faqiDetailEffectLabel = this.createLabel(detail, '', 18, new Vec3(88, -22, 0), new Color(214, 228, 190, 255), 448);
        this.faqiDetailShardLabel = this.createLabel(detail, '', 16, new Vec3(88, -76, 0), new Color(162, 180, 198, 255), 448);

        const actionStrip = this.createPanel(detail, 412, 56, 118, -118, new Color(46, 54, 68, 255));

        this.faqiPrimaryBtn = this.createPanel(actionStrip, 118, 38, -132, 0, new Color(66, 76, 92, 255));
        this.faqiPrimaryBtnLabel = this.createLabel(this.faqiPrimaryBtn, '', 18, new Vec3(0, 0, 0), new Color(238, 244, 250, 255));
        this.faqiPrimaryBtn.on(Node.EventType.TOUCH_END, () => this.onArtifactPrimaryAction(), this);
        this.faqiUpgradeBtn = this.createPanel(actionStrip, 118, 38, 0, 0, new Color(72, 74, 84, 255));
        this.faqiUpgradeBtnLabel = this.createLabel(this.faqiUpgradeBtn, '', 18, new Vec3(0, 0, 0), new Color(238, 244, 250, 255));
        this.faqiUpgradeBtn.on(Node.EventType.TOUCH_END, () => this.tryUpgradeArtifact(), this);
        this.faqiStarBtn = this.createPanel(actionStrip, 118, 38, 132, 0, new Color(82, 72, 66, 255));
        this.faqiStarBtnLabel = this.createLabel(this.faqiStarBtn, '', 18, new Vec3(0, 0, 0), new Color(244, 238, 228, 255));
        this.faqiStarBtn.on(Node.EventType.TOUCH_END, () => this.tryStarUpArtifact(), this);

        const listPanel = this.createPanel(this.homeFaqiView, 676, 248, 0, -108, new Color(40, 46, 58, 245));
        this.createLabel(listPanel, '法器录', 28, new Vec3(-248, 92, 0), new Color(244, 238, 220, 255), 140);
        this.createLabel(listPanel, '切换飞剑、护符、灵灯，专注养成当前本命', 16, new Vec3(-68, 92, 0), new Color(150, 166, 186, 255), 316);
        const tabDefs: Array<{ slot: ArtifactSlot; label: string; x: number; color: Color }> = [
            { slot: 'sword', label: '飞剑', x: -132, color: new Color(214, 198, 160, 255) },
            { slot: 'talisman', label: '护符', x: 0, color: new Color(176, 214, 238, 255) },
            { slot: 'lamp', label: '灵灯', x: 132, color: new Color(176, 226, 196, 255) },
        ];
        for (let i = 0; i < tabDefs.length; i++) {
            const tab = tabDefs[i];
            const tabBtn = this.createPanel(listPanel, 116, 38, tab.x, 78, new Color(54, 62, 74, 255));
            this.createLabel(tabBtn, tab.label, 18, new Vec3(0, 0, 0), new Color(tab.color.r, tab.color.g, tab.color.b, 255), 100);
            tabBtn.on(Node.EventType.TOUCH_END, () => this.setArtifactListTab(tab.slot), this);
            this.faqiListTabButtons[tab.slot] = tabBtn;
        }

        const slotCardIndex: Record<ArtifactSlot, number> = { sword: 0, talisman: 0, lamp: 0 };
        const cardXs: Record<ArtifactSlot, number[]> = {
            sword: [-166, 166],
            talisman: [-166, 166],
            lamp: [-166, 166],
        };
        for (let i = 0; i < ARTIFACT_DEFS.length; i++) {
            const def = ARTIFACT_DEFS[i];
            const cardIndex = slotCardIndex[def.slot];
            slotCardIndex[def.slot] += 1;
            const card = this.createPanel(listPanel, 286, 110, cardXs[def.slot][cardIndex], -20, new Color(42, 48, 58, 245));
            const accent = def.slot === 'sword' ? new Color(214, 198, 160, 255) : def.slot === 'talisman' ? new Color(176, 214, 238, 255) : new Color(176, 226, 196, 255);
            const topLine = new Node('ArtifactCardLine');
            topLine.layer = Layers.Enum.UI_2D;
            card.addChild(topLine);
            topLine.setPosition(0, 46, 0);
            topLine.addComponent(UITransform).setContentSize(220, 8);
            const topLineG = topLine.addComponent(Graphics);
            topLineG.fillColor = new Color(accent.r, accent.g, accent.b, 70);
            topLineG.strokeColor = new Color(accent.r, accent.g, accent.b, 170);
            topLineG.lineWidth = 1.5;
            topLineG.roundRect(-110, -4, 220, 8, 4);
            topLineG.fill();
            topLineG.roundRect(-110, -4, 220, 8, 4);
            topLineG.stroke();
            this.createLabel(card, def.glyph, 28, new Vec3(-108, 12, 0), new Color(accent.r, accent.g, accent.b, 255), 30);
            const titleLabel = this.createLabel(card, def.name, 24, new Vec3(18, 24, 0), new Color(242, 238, 224, 255), 200);
            const infoLabel = this.createLabel(card, '', 16, new Vec3(26, -4, 0), new Color(186, 202, 220, 255), 210);
            const stateLabel = this.createLabel(card, '', 15, new Vec3(26, -32, 0), new Color(160, 178, 196, 255), 210);
            card.on(Node.EventType.TOUCH_END, () => this.selectArtifact(def.id), this);
            this.artifactCardWidgets.set(def.id, { node: card, titleLabel, infoLabel, stateLabel });
        }

        this.refreshFaqiStatus();
    }

    private getArtifactDef(id: ArtifactId) {
        for (let i = 0; i < ARTIFACT_DEFS.length; i++) {
            if (ARTIFACT_DEFS[i].id === id) return ARTIFACT_DEFS[i];
        }
        return ARTIFACT_DEFS[0];
    }

    private getArtifactLevelCap(state: ArtifactState) {
        return 5 + (state.star - 1) * 5;
    }

    private getArtifactUpgradeCost(state: ArtifactState) {
        return 16 + state.level * 10;
    }

    private getArtifactMaintenanceCost(state: ArtifactState) {
        return 200 + state.level * 80 + state.star * 120;
    }

    private getArtifactStarCost(state: ArtifactState) {
        return 8 + state.star * 6;
    }

    private getArtifactPower(state: ArtifactState) {
        return state.level + (state.star - 1) * 3;
    }

    private getArtifactBonusById(id: ArtifactId, state: ArtifactState): ArtifactBonuses {
        const power = this.getArtifactPower(state);
        const bonus: ArtifactBonuses = {
            hp: 0,
            mana: 0,
            damage: 0,
            action: 0,
            combatAtkPercent: 0,
            rewardMultiplier: 0,
            badgeMultiplier: 0,
            artifactExpMultiplier: 0,
            fragmentMultiplier: 0,
            retreatBonus: 0,
        };
        switch (id) {
            case 'qingshuang':
                bonus.damage = 2 + power;
                bonus.combatAtkPercent = 0.03 * state.star;
                break;
            case 'lihuo':
                bonus.damage = 1 + Math.floor(power * 0.8);
                bonus.rewardMultiplier = 0.04 * state.star;
                bonus.combatAtkPercent = 0.015 * state.level;
                break;
            case 'xuanjia':
                bonus.hp = 24 + power * 6;
                bonus.retreatBonus = 0.01 * state.star;
                break;
            case 'huiyuan':
                bonus.mana = 18 + power * 5;
                bonus.action = 1 + Math.floor(power / 4);
                break;
            case 'xunbao':
                bonus.rewardMultiplier = 0.08 + state.level * 0.01 + state.star * 0.03;
                bonus.fragmentMultiplier = 0.06 * state.star;
                break;
            case 'guixi':
                bonus.badgeMultiplier = 0.1 + state.star * 0.04;
                bonus.artifactExpMultiplier = 0.08 + state.star * 0.03;
                bonus.retreatBonus = 0.02 + state.star * 0.02;
                break;
        }
        return bonus;
    }

    private getEquippedArtifactBonuses() {
        const total: ArtifactBonuses = {
            hp: 0,
            mana: 0,
            damage: 0,
            action: 0,
            combatAtkPercent: 0,
            rewardMultiplier: 0,
            badgeMultiplier: 0,
            artifactExpMultiplier: 0,
            fragmentMultiplier: 0,
            retreatBonus: 0,
        };
        const slots: ArtifactSlot[] = ['sword', 'talisman', 'lamp'];
        for (let i = 0; i < slots.length; i++) {
            const id = this.artifactEquipped[slots[i]];
            if (!id) continue;
            const state = this.artifactStates[id];
            if (!state.unlocked) continue;
            const bonus = this.getArtifactBonusById(id, state);
            total.hp += bonus.hp;
            total.mana += bonus.mana;
            total.damage += bonus.damage;
            total.action += bonus.action;
            total.combatAtkPercent += bonus.combatAtkPercent;
            total.rewardMultiplier += bonus.rewardMultiplier;
            total.badgeMultiplier += bonus.badgeMultiplier;
            total.artifactExpMultiplier += bonus.artifactExpMultiplier;
            total.fragmentMultiplier += bonus.fragmentMultiplier;
            total.retreatBonus += bonus.retreatBonus;
        }
        return total;
    }

    private getArtifactEffectSummary(id: ArtifactId) {
        const state = this.artifactStates[id];
        const bonus = this.getArtifactBonusById(id, state);
        switch (id) {
            case 'qingshuang':
                return `术攻 +${bonus.damage} | 局内攻势 +${Math.round(bonus.combatAtkPercent * 100)}%`;
            case 'lihuo':
                return `术攻 +${bonus.damage} | 秘境带出 +${Math.round(bonus.rewardMultiplier * 100)}%`;
            case 'xuanjia':
                return `气血 +${bonus.hp} | 撤离保留 +${Math.round(bonus.retreatBonus * 100)}%`;
            case 'huiyuan':
                return `法力 +${bonus.mana} | 行动力 +${bonus.action}`;
            case 'xunbao':
                return `秘境收益 +${Math.round(bonus.rewardMultiplier * 100)}% | 碎片 +${Math.round(bonus.fragmentMultiplier * 100)}%`;
            case 'guixi':
                return `徽记 +${Math.round(bonus.badgeMultiplier * 100)}% | 法器经验 +${Math.round(bonus.artifactExpMultiplier * 100)}%`;
            default:
                return '';
        }
    }

    private selectArtifact(id: ArtifactId) {
        this.artifactSelectedId = id;
        this.artifactListTab = this.getArtifactDef(id).slot;
        this.refreshFaqiStatus();
    }

    private setArtifactListTab(slot: ArtifactSlot) {
        this.artifactListTab = slot;
        if (this.getArtifactDef(this.artifactSelectedId).slot !== slot) {
            for (let i = 0; i < ARTIFACT_DEFS.length; i++) {
                if (ARTIFACT_DEFS[i].slot === slot) {
                    this.artifactSelectedId = ARTIFACT_DEFS[i].id;
                    break;
                }
            }
        }
        this.refreshFaqiStatus();
    }

    private onArtifactPrimaryAction() {
        const state = this.artifactStates[this.artifactSelectedId];
        if (!state.unlocked) {
            this.trySynthesizeArtifact();
            return;
        }
        this.equipArtifact(this.artifactSelectedId);
    }

    private trySynthesizeArtifact() {
        const def = this.getArtifactDef(this.artifactSelectedId);
        const state = this.artifactStates[this.artifactSelectedId];
        if (state.unlocked) return;
        if (state.shards < def.synthCost) {
            this.hintLabel.string = `${def.name} 碎片不足，需 ${def.synthCost}。`;
            return;
        }
        state.shards -= def.synthCost;
        state.unlocked = true;
        state.level = 1;
        state.star = 1;
        this.artifactEquipped[def.slot] = def.id;
        this.hintLabel.string = `${def.name} 合成成功，已装配到${def.slot === 'sword' ? '飞剑' : def.slot === 'talisman' ? '护符' : '灵灯'}位。`;
        this.refreshHomeStatus();
    }

    private equipArtifact(id: ArtifactId) {
        const state = this.artifactStates[id];
        if (!state.unlocked) return;
        const def = this.getArtifactDef(id);
        this.artifactEquipped[def.slot] = id;
        this.hintLabel.string = `${def.name} 已装配。`;
        this.refreshHomeStatus();
    }

    private tryUpgradeArtifact() {
        const state = this.artifactStates[this.artifactSelectedId];
        if (!state.unlocked) {
            this.hintLabel.string = '法器尚未合成。';
            return;
        }
        const cap = this.getArtifactLevelCap(state);
        if (state.level >= cap) {
            this.hintLabel.string = '法器已到当前星级等级上限，需先升星。';
            return;
        }
        const cost = this.getArtifactUpgradeCost(state);
        if (this.artifactExpPool < cost) {
            this.hintLabel.string = `法器经验不足，需 ${cost}。`;
            return;
        }
        const maintainCost = this.getArtifactMaintenanceCost(state);
        if (!this.consumeSpiritStoneValue(maintainCost)) {
            this.hintLabel.string = `法器养护需灵石折值 ${maintainCost}。`;
            return;
        }
        this.artifactExpPool -= cost;
        state.level += 1;
        this.addTaskProgress('daily_artifact_upgrade', 1);
        this.hintLabel.string = `${this.getArtifactDef(this.artifactSelectedId).name} 升至 ${state.level} 级，消耗养护灵石折值 ${maintainCost}。`;
        this.refreshHomeStatus();
    }

    private tryStarUpArtifact() {
        const state = this.artifactStates[this.artifactSelectedId];
        if (!state.unlocked) {
            this.hintLabel.string = '法器尚未合成。';
            return;
        }
        if (state.star >= MAX_ARTIFACT_STAR) {
            this.hintLabel.string = '法器已升至满星。';
            return;
        }
        if (state.level < this.getArtifactLevelCap(state)) {
            this.hintLabel.string = '法器需升到当前等级上限后方可升星。';
            return;
        }
        const cost = this.getArtifactStarCost(state);
        if (state.shards < cost) {
            this.hintLabel.string = `升星碎片不足，需 ${cost}。`;
            return;
        }
        state.shards -= cost;
        state.star += 1;
        this.hintLabel.string = `${this.getArtifactDef(this.artifactSelectedId).name} 升至 ${state.star} 星。`;
        this.refreshHomeStatus();
    }

    private refreshFaqiStatus() {
        if (!this.faqiExpLabel) return;
        this.faqiExpLabel.string = `法器经验 ${this.artifactExpPool}  |  灵石 ${this.getSpiritStoneSummary(this.spiritStoneInventory, 2)}  |  徽记 ${this.dungeonBadge}`;
        const equippedSlots: ArtifactSlot[] = ['sword', 'talisman', 'lamp'];
        const tabAccent: Record<ArtifactSlot, Color> = {
            sword: new Color(214, 198, 160, 255),
            talisman: new Color(176, 214, 238, 255),
            lamp: new Color(176, 226, 196, 255),
        };
        for (let i = 0; i < equippedSlots.length; i++) {
            const slot = equippedSlots[i];
            const panel = this.faqiSlotPanels[slot];
            const label = this.faqiSlotLabels[slot];
            if (!label) continue;
            const id = this.artifactEquipped[slot];
            if (!id) {
                label.string = '未装配\n点击前往';
                label.color = new Color(172, 188, 204, 255);
                if (panel) this.repaintPanel(panel, new Color(44, 52, 62, 245), new Color(tabAccent[slot].r, tabAccent[slot].g, tabAccent[slot].b, 150));
                continue;
            }
            const state = this.artifactStates[id];
            const selected = this.artifactListTab === slot && this.homeTab === 'faqi';
            label.string = `${this.getArtifactDef(id).name}\nLv.${state.level}  ${'★'.repeat(state.star)}`;
            label.color = selected ? new Color(248, 242, 228, 255) : new Color(204, 218, 232, 255);
            if (panel) {
                this.repaintPanel(
                    panel,
                    selected ? new Color(82, 94, 110, 255) : new Color(52, 60, 72, 248),
                    selected ? new Color(tabAccent[slot].r, tabAccent[slot].g, tabAccent[slot].b, 228) : new Color(tabAccent[slot].r, tabAccent[slot].g, tabAccent[slot].b, 168)
                );
            }
        }
        const selectedDef = this.getArtifactDef(this.artifactSelectedId);
        const selectedState = this.artifactStates[this.artifactSelectedId];
        this.faqiDetailTitleLabel.string = `${selectedDef.name} · ${selectedDef.title}`;
        this.faqiDetailInfoLabel.string = `${selectedDef.summary}\n${selectedState.unlocked ? `等级 ${selectedState.level}/${this.getArtifactLevelCap(selectedState)}  |  星级 ${'★'.repeat(selectedState.star)}` : '尚未合成，可通过秘境碎片合成'}`;
        this.faqiDetailEffectLabel.string = this.getArtifactEffectSummary(this.artifactSelectedId);
        this.faqiDetailShardLabel.string = `碎片 ${selectedState.shards}${selectedState.unlocked ? `  |  升级需经验 ${this.getArtifactUpgradeCost(selectedState)} / 养护灵石 ${this.getArtifactMaintenanceCost(selectedState)}` : `  |  合成需碎片 ${selectedDef.synthCost}`}`;
        if (this.faqiGlyphLabel) this.faqiGlyphLabel.string = selectedDef.glyph;
        if (this.faqiPrimaryBtn && this.faqiPrimaryBtnLabel) {
            const equipped = this.artifactEquipped[selectedDef.slot] === selectedDef.id;
            const primaryText = !selectedState.unlocked ? '合成' : equipped ? '已装备' : '装备';
            this.faqiPrimaryBtnLabel.string = primaryText;
            this.repaintPanel(this.faqiPrimaryBtn, equipped ? new Color(78, 90, 72, 255) : new Color(66, 76, 92, 255), equipped ? new Color(186, 220, 162, 200) : new Color(152, 184, 216, 180));
        }
        if (this.faqiUpgradeBtn && this.faqiUpgradeBtnLabel) {
            this.faqiUpgradeBtnLabel.string = `升级(${selectedState.unlocked ? this.getArtifactUpgradeCost(selectedState) : '-'})`;
        }
        if (this.faqiStarBtn && this.faqiStarBtnLabel) {
            this.faqiStarBtnLabel.string = `升星(${selectedState.unlocked ? this.getArtifactStarCost(selectedState) : '-'})`;
        }
        const listTabs: ArtifactSlot[] = ['sword', 'talisman', 'lamp'];
        for (let i = 0; i < listTabs.length; i++) {
            const slot = listTabs[i];
            const btn = this.faqiListTabButtons[slot];
            if (!btn) continue;
            const active = slot === this.artifactListTab;
            this.repaintPanel(btn, active ? new Color(70, 82, 98, 255) : new Color(54, 62, 74, 255), active ? new Color(tabAccent[slot].r, tabAccent[slot].g, tabAccent[slot].b, 220) : new Color(102, 114, 130, 180));
            const labels = btn.getComponentsInChildren(Label);
            labels.forEach((label) => {
                label.color = active ? tabAccent[slot] : new Color(188, 198, 212, 255);
            });
        }
        for (let i = 0; i < ARTIFACT_DEFS.length; i++) {
            const def = ARTIFACT_DEFS[i];
            const widget = this.artifactCardWidgets.get(def.id);
            if (!widget) continue;
            const state = this.artifactStates[def.id];
            const equipped = this.artifactEquipped[def.slot] === def.id;
            const selected = this.artifactSelectedId === def.id;
            widget.node.active = def.slot === this.artifactListTab;
            widget.titleLabel.string = def.name;
            widget.infoLabel.string = state.unlocked ? `Lv.${state.level}  ${'★'.repeat(state.star)}` : `碎片 ${state.shards}/${def.synthCost}`;
            widget.stateLabel.string = state.unlocked ? `${equipped ? '已装配' : '可装配'} · ${def.title}` : '未合成';
            this.repaintPanel(widget.node, selected ? new Color(70, 82, 98, 255) : new Color(42, 48, 58, 245), selected ? new Color(188, 214, 240, 220) : equipped ? new Color(186, 220, 162, 180) : new Color(88, 102, 118, 180));
        }
    }

    private getDungeonArtifactDropIds(id: DungeonId = this.selectedDungeonId): ArtifactId[] {
        switch (id) {
            case 'qi':
                return ['qingshuang', 'xuanjia'];
            case 'zhuji':
                return ['lihuo', 'huiyuan'];
            case 'jindan':
                return ['xunbao', 'guixi'];
            case 'yuanying':
                return ['qingshuang', 'lihuo', 'xuanjia', 'huiyuan', 'xunbao', 'guixi'];
            default:
                return ['qingshuang', 'xuanjia'];
        }
    }

    private addExpeditionArtifactProgress(depth: number, baseExp: number, baseShards: number) {
        const bonuses = this.getEquippedArtifactBonuses();
        this.expeditionArtifactExp += Math.max(1, Math.floor(baseExp * (1 + bonuses.artifactExpMultiplier)));
        const ids = this.getDungeonArtifactDropIds();
        const shardGain = Math.max(0, Math.floor(baseShards * (1 + bonuses.fragmentMultiplier)));
        if (shardGain <= 0 || ids.length === 0) return;
        const pick = ids[(depth + this.realmLevel + this.expeditionTreasure) % ids.length];
        this.expeditionArtifactShards[pick] += shardGain;
    }

    private applyExpeditionArtifactRewards(ratio: number) {
        const expGain = Math.max(0, Math.floor(this.expeditionArtifactExp * ratio));
        this.artifactExpPool += expGain;
        const summaries: string[] = [];
        const ids: ArtifactId[] = ['qingshuang', 'lihuo', 'xuanjia', 'huiyuan', 'xunbao', 'guixi'];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const gain = Math.max(0, Math.floor(this.expeditionArtifactShards[id] * ratio));
            if (gain <= 0) continue;
            this.artifactStates[id].shards += gain;
            summaries.push(`${this.getArtifactDef(id).name}碎片+${gain}`);
        }
        return {
            expGain,
            shardText: summaries.length > 0 ? summaries.join('，') : '无碎片掉落',
        };
    }

    private buildHomeRoleView() {
        const upperPanel = this.createPanel(this.homeRoleView, 640, 312, 0, 262, new Color(38, 46, 56, 245));
        this.createLabel(upperPanel, '角色形象', 20, new Vec3(84, 118, 0), new Color(180, 205, 225, 255));
        this.buildHomeAnimatedPortrait(upperPanel, 84, -10);
        this.createLabel(upperPanel, '本命法器', 18, new Vec3(-188, 112, 0), new Color(196, 210, 224, 255), 130);

        const artifactSlots: Array<{ slot: ArtifactSlot; title: string; glyph: string; accent: Color; x: number; y: number }> = [
            { slot: 'sword', title: '飞剑位', glyph: '剑', accent: new Color(214, 198, 160, 255), x: -188, y: 54 },
            { slot: 'talisman', title: '护符位', glyph: '符', accent: new Color(176, 214, 238, 255), x: -188, y: -18 },
            { slot: 'lamp', title: '灵灯位', glyph: '灯', accent: new Color(176, 226, 196, 255), x: -188, y: -90 },
        ];
        for (let i = 0; i < artifactSlots.length; i++) {
            const slot = artifactSlots[i];
            const slotPanel = this.createPanel(upperPanel, 150, 62, slot.x, slot.y, new Color(52, 60, 72, 248));
            this.decorateRoleInfoCard(slotPanel, slot.accent, slot.glyph, '点击养成');
            this.createLabel(slotPanel, slot.title, 17, new Vec3(12, 15, 0), new Color(240, 240, 230, 255), 100);
            const label = this.createLabel(slotPanel, '', 13, new Vec3(10, -10, 0), new Color(186, 202, 220, 255), 108);
            label.lineHeight = 16;
            this.faqiSlotPanels[slot.slot] = slotPanel;
            this.faqiSlotLabels[slot.slot] = label;
            slotPanel.on(Node.EventType.TOUCH_END, () => {
                this.setArtifactListTab(slot.slot);
                this.switchHomeTab('faqi');
            }, this);
        }

        const basicPanel = this.createPanel(this.homeRoleView, 196, 236, -220, -86, new Color(40, 50, 62, 245));
        this.decorateRoleInfoCard(basicPanel, new Color(188, 214, 238, 255), '体', '筋骨凝实');
        this.createLabel(basicPanel, '基础属性', 20, new Vec3(0, 86, 0), new Color(180, 205, 225, 255));
        this.statusLabel = this.createLabel(basicPanel, '', 25, new Vec3(0, 42, 0), new Color(255, 240, 220, 255), 168);
        this.roleHpLabel = this.createRoleStatRow(basicPanel, 8, new Color(220, 146, 146, 255), 'hp');
        this.roleManaLabel = this.createRoleStatRow(basicPanel, -24, new Color(142, 188, 234, 255), 'mana');
        this.roleAttackLabel = this.createRoleStatRow(basicPanel, -56, new Color(174, 220, 174, 255), 'ap');

        const practicePanel = this.createPanel(this.homeRoleView, 196, 236, 0, -86, new Color(44, 50, 66, 245));
        this.decorateRoleInfoCard(practicePanel, new Color(220, 210, 170, 255), '道', '丹田运转');
        this.createLabel(practicePanel, '丹器造诣', 20, new Vec3(0, 86, 0), new Color(180, 205, 225, 255));
        this.roleExpLabel = this.createRoleStatRow(practicePanel, 18, new Color(208, 200, 154, 255), 'exp');
        this.roleApLabel = this.createRoleStatRow(practicePanel, -14, new Color(214, 186, 128, 255), 'atk');
        this.roleBreakLabel = this.createRoleStatRow(practicePanel, -46, new Color(216, 176, 232, 255), 'break');

        const dungeonPanel = this.createPanel(this.homeRoleView, 196, 236, 220, -86, new Color(40, 50, 64, 245));
        this.decorateRoleInfoCard(dungeonPanel, new Color(168, 214, 200, 255), '境', '周天运转');
        this.createLabel(dungeonPanel, '境界养成', 20, new Vec3(0, 86, 0), new Color(180, 205, 225, 255));
        this.roleDungeonLabel = this.createRoleStatRow(dungeonPanel, 12, new Color(160, 216, 194, 255), 'dungeon');
        this.roleDungeonProgressLabel = this.createRoleStatRow(dungeonPanel, -36, new Color(184, 212, 228, 255), 'progress');

        const realmBtn = this.createPanel(this.homeRoleView, 148, 70, -154, -268, new Color(50, 55, 65, 255));
        this.createLabel(realmBtn, '修炼突破', 24, new Vec3(0, 0, 0), new Color(200, 230, 255, 255));
        realmBtn.on(Node.EventType.TOUCH_END, () => this.tryRealmUp(), this);

        const prepareBtn = this.createPanel(this.homeRoleView, 148, 70, 154, -268, new Color(64, 74, 58, 255));
        this.createLabel(prepareBtn, '渡劫准备', 24, new Vec3(0, 0, 0), new Color(220, 242, 214, 255));
        prepareBtn.on(Node.EventType.TOUCH_END, () => this.tryPrepareTribulation(), this);
    }

    private createRoleStatRow(parent: Node, y: number, accent: Color, icon: 'hp' | 'mana' | 'atk' | 'exp' | 'ap' | 'break' | 'dungeon' | 'progress') {
        const row = new Node('RoleStatRow');
        row.layer = Layers.Enum.UI_2D;
        parent.addChild(row);
        row.setPosition(0, y, 0);
        row.addComponent(UITransform).setContentSize(164, 28);

        const iconNode = new Node('RoleStatIcon');
        iconNode.layer = Layers.Enum.UI_2D;
        row.addChild(iconNode);
        iconNode.setPosition(-62, 0, 0);
        iconNode.addComponent(UITransform).setContentSize(20, 20);
        this.drawRoleStatIcon(iconNode, icon, accent);

        const label = this.createLabel(row, '', 17, new Vec3(16, 0, 0), new Color(214, 224, 236, 255), 124);
        label.horizontalAlign = HorizontalTextAlignment.LEFT;
        return label;
    }

    private drawRoleStatIcon(node: Node, icon: 'hp' | 'mana' | 'atk' | 'exp' | 'ap' | 'break' | 'dungeon' | 'progress', accent: Color) {
        const g = node.addComponent(Graphics);
        g.strokeColor = new Color(accent.r, accent.g, accent.b, 210);
        g.fillColor = new Color(accent.r, accent.g, accent.b, 44);
        g.lineWidth = 1.6;
        switch (icon) {
            case 'hp':
                g.moveTo(0, -7);
                g.bezierCurveTo(-8, -15, -12, -3, 0, 8);
                g.bezierCurveTo(12, -3, 8, -15, 0, -7);
                g.fill();
                g.stroke();
                break;
            case 'mana':
                g.moveTo(0, 8);
                g.lineTo(-6, -1);
                g.lineTo(0, -8);
                g.lineTo(6, -1);
                g.close();
                g.fill();
                g.stroke();
                break;
            case 'atk':
                g.moveTo(0, 8);
                g.lineTo(-5, -1);
                g.lineTo(-1, -1);
                g.lineTo(-4, -8);
                g.lineTo(5, 1);
                g.lineTo(1, 1);
                g.lineTo(4, 8);
                g.close();
                g.fill();
                g.stroke();
                break;
            case 'exp':
                g.circle(0, 0, 7);
                g.stroke();
                g.moveTo(-4, 1);
                g.lineTo(0, 5);
                g.lineTo(5, -4);
                g.stroke();
                break;
            case 'ap':
                g.arc(0, 0, 7, Math.PI * 0.2, Math.PI * 1.8, false);
                g.stroke();
                g.moveTo(0, 0);
                g.lineTo(4, 3);
                g.stroke();
                break;
            case 'break':
                g.rect(-6, -6, 12, 12);
                g.stroke();
                g.moveTo(-6, 0);
                g.lineTo(6, 0);
                g.moveTo(0, -6);
                g.lineTo(0, 6);
                g.stroke();
                break;
            case 'dungeon':
                g.moveTo(0, 8);
                g.lineTo(-7, 2);
                g.lineTo(-4, -8);
                g.lineTo(0, -4);
                g.lineTo(4, -8);
                g.lineTo(7, 2);
                g.close();
                g.fill();
                g.stroke();
                break;
            case 'progress':
                g.roundRect(-7, -4, 14, 8, 3);
                g.stroke();
                g.moveTo(-4, 0);
                g.lineTo(0, 3);
                g.lineTo(4, -3);
                g.stroke();
                break;
        }
    }

    private decorateRoleInfoCard(panel: Node, accent: Color, glyph: string, footer: string) {
        const topLine = new Node('CardAccent');
        topLine.layer = Layers.Enum.UI_2D;
        panel.addChild(topLine);
        topLine.setPosition(0, 64, 0);
        topLine.addComponent(UITransform).setContentSize(112, 10);
        const line = topLine.addComponent(Graphics);
        line.fillColor = new Color(accent.r, accent.g, accent.b, 70);
        line.strokeColor = new Color(accent.r, accent.g, accent.b, 180);
        line.lineWidth = 1.5;
        line.roundRect(-56, -5, 112, 10, 5);
        line.fill();
        line.roundRect(-56, -5, 112, 10, 5);
        line.stroke();

        const mark = new Node('CardGlyph');
        mark.layer = Layers.Enum.UI_2D;
        panel.addChild(mark);
        mark.setPosition(-66, 86, 0);
        mark.addComponent(UITransform).setContentSize(28, 28);
        const markG = mark.addComponent(Graphics);
        markG.fillColor = new Color(accent.r, accent.g, accent.b, 34);
        markG.strokeColor = new Color(accent.r, accent.g, accent.b, 165);
        markG.lineWidth = 1.5;
        markG.circle(0, 0, 14);
        markG.fill();
        markG.circle(0, 0, 14);
        markG.stroke();
        this.createLabel(mark, glyph, 16, new Vec3(0, 0, 0), new Color(246, 244, 236, 255), 24);

        this.createLabel(panel, footer, 15, new Vec3(0, -94, 0), new Color(accent.r, accent.g, accent.b, 220), 156);
    }

    private buildHomeMijingView() {
        const header = this.createPanel(this.homeMijingView, 620, 98, 0, 372, new Color(40, 48, 58, 245));
        this.createLabel(header, '秘境历练', 32, new Vec3(0, 20, 0), new Color(236, 228, 208, 255), 200);
        this.createLabel(header, '选择目标秘境，累计深度宝箱并在合适时机入场推进', 17, new Vec3(0, -18, 0), new Color(164, 184, 202, 255), 560);

        const dungeonPanel = this.createPanel(this.homeMijingView, 620, 220, 0, 190, new Color(40, 48, 58, 245));
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

        const chestPanel = this.createPanel(this.homeMijingView, 620, 220, 0, -54, new Color(44, 38, 32, 245));
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

        const goBtn = this.createPanel(this.homeMijingView, 260, 76, 0, -316, new Color(45, 70, 60, 255));
        this.createLabel(goBtn, '进入秘境', 36, new Vec3(0, 0, 0), new Color(180, 255, 220, 255));
        goBtn.on(Node.EventType.TOUCH_END, () => this.tryStartExpedition(), this);

        this.hintLabel = this.createLabel(this.homeMijingView, '选择秘境后进入挑战；每 10 层一位 Boss，首个 10/20/30 层宝箱可在洞府领取', 20, new Vec3(0, -424, 0), new Color(120, 140, 160, 255), 660);
    }

    private switchHomeTab(tab: 'dongtian' | 'mijing' | 'shop' | 'faqi' | 'role') {
        this.homeTab = tab;
        this.homeDongtianView.active = tab === 'dongtian';
        this.homeMijingView.active = tab === 'mijing';
        this.homeRoleView.active = tab === 'role';
        this.homeShopView.active = tab === 'shop';
        this.homeFaqiView.active = tab === 'faqi';
        if (tab === 'shop' && this.shopScrollContent) this.shopScrollContent.setPosition(0, 270, 0);

        (Object.keys(this.homeNavButtons) as Array<keyof typeof this.homeNavButtons>).forEach((key) => {
            const btn = this.homeNavButtons[key];
            const iconNode = this.homeNavIcons[key];
            if (!btn) return;
            const active = key === tab;
            this.repaintPanel(btn, active ? new Color(62, 78, 96, 255) : new Color(45, 52, 62, 255), active ? new Color(152, 192, 224, 220) : new Color(70, 85, 100, 200));
            if (iconNode) {
                this.drawHomeNavIcon(iconNode, key, active);
            }
            const labels = btn.getComponentsInChildren(Label);
            labels.forEach((label) => {
                label.color = active ? new Color(220, 232, 244, 255) : new Color(180, 195, 210, 255);
            });
        });

        this.refreshWorkshopQuickButtons();
        this.refreshRoleQuickButtons();

        this.refreshHomeStatus();
    }

    private getMaterialDef(id: MaterialId) {
        for (let i = 0; i < MATERIAL_DEFS.length; i++) {
            if (MATERIAL_DEFS[i].id === id) return MATERIAL_DEFS[i];
        }
        return MATERIAL_DEFS[0];
    }

    private formatMaterialCosts(costs: Partial<Record<MaterialId, number>>) {
        const parts: string[] = [];
        const keys = Object.keys(costs) as MaterialId[];
        for (let i = 0; i < keys.length; i++) {
            const materialId = keys[i];
            const amount = costs[materialId] ?? 0;
            if (amount <= 0) continue;
            const def = this.getMaterialDef(materialId);
            parts.push(`${def.name} ${amount}`);
        }
        return parts.join('  |  ');
    }

    private hasEnoughMaterials(costs: Partial<Record<MaterialId, number>>) {
        const keys = Object.keys(costs) as MaterialId[];
        for (let i = 0; i < keys.length; i++) {
            const materialId = keys[i];
            const need = costs[materialId] ?? 0;
            if (need > 0 && this.materialInventory[materialId] < need) return false;
        }
        return true;
    }

    private consumeMaterials(costs: Partial<Record<MaterialId, number>>) {
        const keys = Object.keys(costs) as MaterialId[];
        for (let i = 0; i < keys.length; i++) {
            const materialId = keys[i];
            const need = costs[materialId] ?? 0;
            if (need > 0) this.materialInventory[materialId] = Math.max(0, this.materialInventory[materialId] - need);
        }
    }

    private getFirstMissingMaterial(costs: Partial<Record<MaterialId, number>>) {
        const keys = Object.keys(costs) as MaterialId[];
        for (let i = 0; i < keys.length; i++) {
            const materialId = keys[i];
            const need = costs[materialId] ?? 0;
            if (need > 0 && this.materialInventory[materialId] < need) {
                return { def: this.getMaterialDef(materialId), need, have: this.materialInventory[materialId] };
            }
        }
        return null;
    }

    private getAlchemyRecipe(id: AlchemyRecipeId) {
        for (let i = 0; i < ALCHEMY_RECIPES.length; i++) {
            if (ALCHEMY_RECIPES[i].id === id) return ALCHEMY_RECIPES[i];
        }
        return ALCHEMY_RECIPES[0];
    }

    private getForgeRecipe(id: ForgeRecipeId) {
        for (let i = 0; i < FORGE_RECIPES.length; i++) {
            if (FORGE_RECIPES[i].id === id) return FORGE_RECIPES[i];
        }
        return FORGE_RECIPES[0];
    }

    private refreshWorkshopQuickButtons() {
        const panelOpen = !!this.homeAlchemyPanel?.active;
        if (this.homeAlchemyQuickButton) {
            const active = panelOpen && this.alchemyTab !== 'forge';
            const icon = this.homeAlchemyQuickButton.getChildByName('AlchemyIcon');
            this.repaintPanel(this.homeAlchemyQuickButton, active ? new Color(98, 72, 50, 255) : new Color(66, 52, 42, 248), active ? new Color(232, 188, 122, 220) : new Color(126, 106, 90, 200));
            const labels = this.homeAlchemyQuickButton.getComponentsInChildren(Label);
            labels.forEach((label) => {
                label.color = active ? new Color(248, 238, 218, 255) : new Color(240, 226, 196, 255);
            });
            if (icon) this.drawAlchemyQuickIcon(icon, active);
        }
        if (this.homeForgeQuickButton) {
            const active = panelOpen && this.alchemyTab === 'forge';
            const icon = this.homeForgeQuickButton.getChildByName('ForgeIcon');
            this.repaintPanel(this.homeForgeQuickButton, active ? new Color(70, 86, 112, 255) : new Color(52, 58, 72, 248), active ? new Color(172, 204, 236, 220) : new Color(98, 112, 130, 200));
            const labels = this.homeForgeQuickButton.getComponentsInChildren(Label);
            labels.forEach((label) => {
                label.color = active ? new Color(236, 244, 252, 255) : new Color(214, 224, 236, 255);
            });
            if (icon) this.drawForgeQuickIcon(icon, active);
        }
    }

    private refreshRoleQuickButtons() {
        const kungfuOpen = !!this.homeKungfuPanel?.active;
        const spiritPetOpen = !!this.homeSpiritPetPanel?.active;
        if (this.homeKungfuQuickButton) {
            const active = kungfuOpen;
            const icon = this.homeKungfuQuickButton.getChildByName('KungfuIcon');
            this.repaintPanel(this.homeKungfuQuickButton, active ? new Color(102, 80, 50, 255) : new Color(72, 58, 42, 248), active ? new Color(236, 198, 128, 220) : new Color(136, 112, 84, 200));
            const labels = this.homeKungfuQuickButton.getComponentsInChildren(Label);
            labels.forEach((label) => {
                label.color = active ? new Color(250, 242, 220, 255) : new Color(242, 230, 198, 255);
            });
            if (icon) this.drawKungfuQuickIcon(icon, active);
        }
        if (this.homeSpiritPetQuickButton) {
            const active = spiritPetOpen;
            const icon = this.homeSpiritPetQuickButton.getChildByName('SpiritPetIcon');
            this.repaintPanel(this.homeSpiritPetQuickButton, active ? new Color(60, 98, 88, 255) : new Color(48, 70, 66, 248), active ? new Color(164, 228, 204, 220) : new Color(92, 128, 118, 200));
            const labels = this.homeSpiritPetQuickButton.getComponentsInChildren(Label);
            labels.forEach((label) => {
                label.color = active ? new Color(238, 250, 244, 255) : new Color(214, 240, 228, 255);
            });
            if (icon) this.drawSpiritPetQuickIcon(icon, active);
        }
    }

    private openRoleFeature(focus: 'kungfu' | 'pet') {
        this.roleQuickFocus = focus;
        this.toggleTaskPanel(false);
        this.toggleAlchemyPanel(false);
        if (focus === 'kungfu') {
            this.toggleSpiritPetPanel(false);
            this.toggleKungfuPanel(!(this.homeKungfuPanel?.active));
            return;
        }
        this.toggleKungfuPanel(false);
        this.toggleSpiritPetPanel(!(this.homeSpiritPetPanel?.active));
    }

    private closeRoleFeaturePanels() {
        this.toggleKungfuPanel(false);
        this.toggleSpiritPetPanel(false);
    }

    private openWorkshopPanel(tab: AlchemyTab) {
        this.alchemyTab = tab;
        this.toggleAlchemyPanel(true);
    }

    private toggleAlchemyPanel(force?: boolean) {
        if (!this.homeAlchemyPanel || !this.homeAlchemyMask) return;
        const nextActive = typeof force === 'boolean' ? force : !this.homeAlchemyPanel.active;
        this.homeAlchemyPanel.active = nextActive;
        this.homeAlchemyMask.active = nextActive;
        if (nextActive) {
            this.toggleTaskPanel(false);
            this.closeRoleFeaturePanels();
        }
        this.refreshWorkshopQuickButtons();
        if (nextActive) this.refreshAlchemyPanel();
    }

    private switchAlchemyTab(tab: AlchemyTab) {
        this.alchemyTab = tab;
        this.refreshAlchemyPanel();
    }

    private selectAlchemyRecipe(id: AlchemyRecipeId) {
        this.alchemySelectedRecipe = id;
        this.alchemyTab = 'furnace';
        this.refreshAlchemyPanel();
    }

    private selectForgeRecipe(id: ForgeRecipeId) {
        if (this.alchemyTab === 'forge' && this.forgeSelectedRecipe === id) {
            this.tryForge();
            return;
        }
        this.forgeSelectedRecipe = id;
        this.alchemyTab = 'forge';
        this.refreshAlchemyPanel();
    }

    private tryCraftAlchemy() {
        const recipe = this.getAlchemyRecipe(this.alchemySelectedRecipe);
        const kungfu = this.getEquippedKungfuDef();
        const missingMaterial = this.getFirstMissingMaterial(recipe.materialCosts);
        if (missingMaterial) {
            if (this.alchemyHintLabel) this.alchemyHintLabel.string = `${recipe.name} 需要 ${missingMaterial.def.name} ${missingMaterial.need}，当前仅有 ${missingMaterial.have}。`;
            return;
        }
        if (this.getSpiritStoneTotalValue(this.spiritStoneInventory) < recipe.goldCost) {
            if (this.alchemyHintLabel) this.alchemyHintLabel.string = `${recipe.name} 需要灵石 ${recipe.goldCost}。`;
            return;
        }
        if (this.dungeonBadge < recipe.badgeCost) {
            if (this.alchemyHintLabel) this.alchemyHintLabel.string = `${recipe.name} 需要徽记 ${recipe.badgeCost}。`;
            return;
        }
        this.consumeMaterials(recipe.materialCosts);
        this.consumeSpiritStoneValue(recipe.goldCost);
        this.dungeonBadge -= recipe.badgeCost;
        const success = Math.random() < this.getAlchemySuccessRate();
        const leveledUp = this.grantAlchemyMasteryExp(success ? 4 : 2);
        if (!success) {
            this.refreshHomeStatus();
            if (this.alchemyHintLabel) this.alchemyHintLabel.string = `${recipe.name} 炉火失衡，本次未成丹。当前功法 ${kungfu.name} 提供 ${(kungfu.alchemySuccessBonus * 100).toFixed(0)}% 成丹加成。${leveledUp ? ` 丹师升至 Lv.${this.alchemyMasteryLevel}。` : ''}`;
            return;
        }
        const outputRange = this.getAlchemyOutputRange();
        const outputCount = outputRange.min + Math.floor(Math.random() * (outputRange.max - outputRange.min + 1));
        this.alchemyInventory[recipe.id] += outputCount;
        this.addTaskProgress('weekly_alchemy_success', 1);
        this.addMeritTaskProgress('merit_alchemy', 1);
        this.refreshHomeStatus();
        if (this.alchemyHintLabel) this.alchemyHintLabel.string = `开炉成功，炼成 ${recipe.name} ${outputCount} 枚，已收入丹库。当前库存 ${this.alchemyInventory[recipe.id]}。功法 ${kungfu.name} 扩展出丹区间 ${kungfu.alchemyYieldMinBonus}-${kungfu.alchemyYieldMaxBonus}。${leveledUp ? ` 丹师升至 Lv.${this.alchemyMasteryLevel}。` : ''}`;
    }

    private tryForge() {
        const recipe = this.getForgeRecipe(this.forgeSelectedRecipe);
        const kungfu = this.getEquippedKungfuDef();
        const missingMaterial = this.getFirstMissingMaterial(recipe.materialCosts);
        if (missingMaterial) {
            this.hintLabel.string = `${recipe.name} 缺少 ${missingMaterial.def.name}，需要 ${missingMaterial.need}，当前 ${missingMaterial.have}。`;
            return;
        }
        if (this.getSpiritStoneTotalValue(this.spiritStoneInventory) < recipe.goldCost) {
            this.hintLabel.string = `${recipe.name} 需要灵石 ${recipe.goldCost}。`;
            return;
        }
        if (this.dungeonBadge < recipe.badgeCost) {
            this.hintLabel.string = `${recipe.name} 需要徽记 ${recipe.badgeCost}。`;
            return;
        }
        this.consumeMaterials(recipe.materialCosts);
        this.consumeSpiritStoneValue(recipe.goldCost);
        this.dungeonBadge -= recipe.badgeCost;
        const success = Math.random() < this.getForgeSuccessRate();
        const leveledUp = this.grantForgeMasteryExp(success ? 4 : 2);
        if (!success) {
            this.refreshHomeStatus();
            this.hintLabel.string = `${recipe.name} 炉芯不稳，炼器失败。当前功法 ${kungfu.name} 提供 ${(kungfu.forgeSuccessBonus * 100).toFixed(0)}% 炼器成功加成。${leveledUp ? ` 炼器师升至 Lv.${this.forgeMasteryLevel}。` : ''}`;
            return;
        }
        const quality = this.rollForgeQuality();
        const actualValue = Math.max(1, Math.round(recipe.effectValue * quality.multiplier));
        this.applyShopItemReward({ effect: recipe.effect, effectValue: actualValue });
        this.forgeInventory[recipe.id] += 1;
        this.addTaskProgress('weekly_forge_success', 1);
        this.refreshHomeStatus();
        this.hintLabel.string = `炉火淬成 ${RARITY_NAMES[quality.rarity]}${recipe.name}，词条品质为${RARITY_NAMES[quality.rarity]}，获得 ${recipe.effect === 'artifactExp' ? `法器经验 +${actualValue}` : recipe.effect === 'hp' ? `气血上限 +${actualValue}` : recipe.effect === 'atk' ? `术攻 +${actualValue}` : recipe.effect === 'mana' ? `法力上限 +${actualValue}` : recipe.rewardText}。功法 ${kungfu.name} 额外提升 ${Math.round(kungfu.forgeQualityBonus * 100)}% 品质倾向。${leveledUp ? ` 炼器师升至 Lv.${this.forgeMasteryLevel}。` : ''}`;
    }

    private refreshAlchemyPanel() {
        if (!this.homeAlchemyPanel) return;
        if (this.alchemyFurnacePage) this.alchemyFurnacePage.active = this.alchemyTab === 'furnace' || this.alchemyTab === 'forge';
        if (this.alchemyFormulaPage) this.alchemyFormulaPage.active = this.alchemyTab === 'formula';
        if (this.alchemyStorehousePage) this.alchemyStorehousePage.active = this.alchemyTab === 'storehouse';
        if (this.alchemyForgePage) this.alchemyForgePage.active = this.alchemyTab === 'forge';
        const tabs: AlchemyTab[] = ['furnace', 'formula', 'storehouse', 'forge'];
        for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            const btn = this.alchemyTabButtons[tab];
            if (!btn) continue;
            const active = tab === this.alchemyTab;
            this.repaintPanel(btn, active ? new Color(92, 76, 58, 255) : new Color(52, 60, 72, 255), active ? new Color(232, 188, 122, 220) : new Color(92, 108, 124, 180));
            const labels = btn.getComponentsInChildren(Label);
            labels.forEach((label) => {
                label.color = active ? new Color(248, 238, 214, 255) : new Color(210, 220, 232, 255);
            });
        }
        const recipe = this.getAlchemyRecipe(this.alchemySelectedRecipe);
        const forgeRecipe = this.getForgeRecipe(this.forgeSelectedRecipe);
        if (this.alchemyTitleLabel) this.alchemyTitleLabel.string = this.alchemyTab === 'forge' ? `${forgeRecipe.name} · ${forgeRecipe.title}` : `${recipe.name} · ${recipe.title}`;
        if (this.alchemyInfoLabel) this.alchemyInfoLabel.string = this.alchemyTab === 'forge' ? forgeRecipe.summary : recipe.summary;
        if (this.alchemyCostLabel) {
            const costs = this.alchemyTab === 'forge' ? forgeRecipe.materialCosts : recipe.materialCosts;
            const goldCost = this.alchemyTab === 'forge' ? forgeRecipe.goldCost : recipe.goldCost;
            const badgeCost = this.alchemyTab === 'forge' ? forgeRecipe.badgeCost : recipe.badgeCost;
            this.alchemyCostLabel.string = `耗材: ${this.formatMaterialCosts(costs)}  |  灵石 ${goldCost}${badgeCost > 0 ? `  |  徽记 ${badgeCost}` : ''}`;
        }
        if (this.alchemyOutputLabel) {
            if (this.alchemyTab === 'forge') {
                this.alchemyOutputLabel.string = `锻成效果: ${forgeRecipe.rewardText}  |  成功率 ${(this.getForgeSuccessRate() * 100).toFixed(0)}%  |  品质受炼器Lv影响`;
            } else {
                const outputRange = this.getAlchemyOutputRange();
                this.alchemyOutputLabel.string = `丹成效果: ${recipe.rewardText}  |  成功率 ${(this.getAlchemySuccessRate() * 100).toFixed(0)}%  |  出丹 ${outputRange.min}-${outputRange.max}  |  库存 ${this.alchemyInventory[recipe.id]}`;
            }
        }
        if (this.alchemyCraftBtn) {
            const activeAction = this.alchemyTab === 'forge' ? () => this.tryForge() : () => this.tryCraftAlchemy();
            this.alchemyCraftBtn.off(Node.EventType.TOUCH_END);
            this.alchemyCraftBtn.on(Node.EventType.TOUCH_END, activeAction, this);
        }
        if (this.alchemyCraftBtnLabel) this.alchemyCraftBtnLabel.string = this.alchemyTab === 'forge' ? '开炉炼器' : '开炉炼制';
        if (this.alchemyUseBtn && this.alchemyUseBtnLabel) {
            this.alchemyUseBtn.active = this.alchemyTab !== 'forge';
            if (this.alchemyTab !== 'forge') {
                const hasStock = this.alchemyInventory[recipe.id] > 0;
                this.alchemyUseBtnLabel.string = hasStock ? `服用(${this.alchemyInventory[recipe.id]})` : '服用(0)';
                this.repaintPanel(this.alchemyUseBtn, hasStock ? new Color(60, 84, 72, 255) : new Color(66, 74, 82, 255), hasStock ? new Color(170, 220, 194, 180) : new Color(124, 136, 148, 160));
            }
        }
        if (this.alchemyHintLabel && this.homeAlchemyPanel.active) {
            this.alchemyHintLabel.string = this.alchemyTab === 'forge'
                ? `炼器师 Lv.${this.forgeMasteryLevel} ${this.forgeMasteryExp}/${this.getForgeMasteryNeed()}  |  已成 ${this.forgeInventory[forgeRecipe.id]} 件  |  再点选中器胚可直接锻造`
                : `丹师 Lv.${this.alchemyMasteryLevel} ${this.alchemyMasteryExp}/${this.getAlchemyMasteryNeed()}  |  库存 ${this.alchemyInventory[recipe.id]} 枚  |  炼成后可手动服用或留作渡劫准备`;
        }
        for (let i = 0; i < ALCHEMY_RECIPES.length; i++) {
            const def = ALCHEMY_RECIPES[i];
            const widget = this.alchemyRecipeWidgets.get(def.id);
            if (!widget) continue;
            const selected = def.id === this.alchemySelectedRecipe;
            widget.titleLabel.string = def.name;
            widget.infoLabel.string = `${def.rewardText}  |  ${this.formatMaterialCosts(def.materialCosts)}`;
            widget.stateLabel.string = `库存 ${this.alchemyInventory[def.id]} 枚 · ${def.title}`;
            this.repaintPanel(widget.node, selected ? new Color(88, 72, 58, 255) : new Color(42, 48, 60, 245), selected ? new Color(232, 188, 122, 220) : new Color(92, 108, 124, 180));
        }
        for (let i = 0; i < FORGE_RECIPES.length; i++) {
            const def = FORGE_RECIPES[i];
            const widget = this.forgeRecipeWidgets.get(def.id);
            if (!widget) continue;
            const selected = def.id === this.forgeSelectedRecipe;
            widget.titleLabel.string = def.name;
            widget.infoLabel.string = `${def.rewardText}  |  ${this.formatMaterialCosts(def.materialCosts)}`;
            widget.stateLabel.string = `已成 ${this.forgeInventory[def.id]} 件 · ${def.title}`;
            this.repaintPanel(widget.node, selected ? new Color(88, 72, 58, 255) : new Color(42, 48, 60, 245), selected ? new Color(232, 188, 122, 220) : new Color(92, 108, 124, 180));
        }
        for (let i = 0; i < MATERIAL_DEFS.length; i++) {
            const def = MATERIAL_DEFS[i];
            const label = this.alchemyStorehouseLabels[def.id];
            if (!label) continue;
            label.string = `x ${this.materialInventory[def.id]}`;
        }
    }

    private toggleTaskPanel(force?: boolean) {
        if (!this.homeTaskPanel || !this.homeTaskMask) return;
        const nextActive = typeof force === 'boolean' ? force : !this.homeTaskPanel.active;
        this.homeTaskPanel.active = nextActive;
        this.homeTaskMask.active = nextActive;
        if (nextActive) {
            this.toggleAlchemyPanel(false);
            this.closeRoleFeaturePanels();
        }
        if (this.homeTaskButton) {
            const taskIcon = this.homeTaskButton.getChildByName('TaskIcon');
            this.repaintPanel(this.homeTaskButton, nextActive ? new Color(62, 78, 96, 255) : new Color(46, 56, 72, 248), nextActive ? new Color(164, 198, 228, 220) : new Color(88, 104, 124, 200));
            const labels = this.homeTaskButton.getComponentsInChildren(Label);
            labels.forEach((label) => {
                label.color = nextActive ? new Color(236, 242, 248, 255) : new Color(214, 224, 236, 255);
            });
            if (taskIcon) this.drawTaskQuickIcon(taskIcon, nextActive);
        }
        if (nextActive) this.refreshTaskPanel();
    }

    private toggleKungfuPanel(force?: boolean) {
        if (!this.homeKungfuPanel || !this.homeKungfuMask) return;
        const nextActive = typeof force === 'boolean' ? force : !this.homeKungfuPanel.active;
        this.homeKungfuPanel.active = nextActive;
        this.homeKungfuMask.active = nextActive;
        if (nextActive) {
            this.switchHomeTab('role');
            this.toggleTaskPanel(false);
            this.toggleAlchemyPanel(false);
            this.toggleSpiritPetPanel(false);
            this.roleQuickFocus = 'kungfu';
            this.refreshKungfuPanel();
        }
        this.refreshRoleQuickButtons();
    }

    private toggleSpiritPetPanel(force?: boolean) {
        if (!this.homeSpiritPetPanel || !this.homeSpiritPetMask) return;
        const nextActive = typeof force === 'boolean' ? force : !this.homeSpiritPetPanel.active;
        this.homeSpiritPetPanel.active = nextActive;
        this.homeSpiritPetMask.active = nextActive;
        if (nextActive) {
            this.switchHomeTab('role');
            this.toggleTaskPanel(false);
            this.toggleAlchemyPanel(false);
            this.toggleKungfuPanel(false);
            this.roleQuickFocus = 'pet';
            this.refreshSpiritPetPanel();
        }
        this.refreshRoleQuickButtons();
    }

    private refreshKungfuPanel() {
        if (!this.homeKungfuPanel) return;
        const selected = this.getKungfuDef(this.selectedKungfuId);
        const selectedLevel = this.getKungfuLevel(selected.id);
        const equipped = this.equippedKungfuId === selected.id;
        if (this.kungfuPageNameLabel) this.kungfuPageNameLabel.string = `${selected.name}${equipped ? ' · 运转中' : ''}`;
        if (this.kungfuPageInfoLabel) this.kungfuPageInfoLabel.string = `${selected.title}  |  Lv.${selectedLevel}  |  吐纳 ${Math.round((20 + selected.cultivationQiPerSecond) * this.getKungfuBonusScale(selected.id))}灵气/秒\n${selected.summary}`;
        if (this.kungfuPageEffectLabel) this.kungfuPageEffectLabel.string = `丹成 +${Math.round(selected.alchemySuccessBonus * this.getKungfuBonusScale(selected.id) * 100)}% / 出丹 +${Math.floor(selected.alchemyYieldMinBonus * this.getKungfuBonusScale(selected.id))}-${Math.floor(selected.alchemyYieldMaxBonus * this.getKungfuBonusScale(selected.id))}\n器成 +${Math.round(selected.forgeSuccessBonus * this.getKungfuBonusScale(selected.id) * 100)}% / 品质 +${Math.round(selected.forgeQualityBonus * this.getKungfuBonusScale(selected.id) * 100)}%`;
        if (this.kungfuPageHintLabel) this.kungfuPageHintLabel.string = equipped ? '当前主修正在运转，吐纳、炼丹、炼器加成都已生效。' : '点选下方功法后，可直接切换为当前运转功法。';
        if (this.kungfuPageRunButton && this.kungfuPageRunButtonLabel) {
            this.kungfuPageRunButtonLabel.string = equipped ? '运转中' : '切换运转';
            this.repaintPanel(this.kungfuPageRunButton, equipped ? new Color(82, 94, 72, 255) : new Color(96, 78, 54, 255), equipped ? new Color(186, 220, 162, 200) : new Color(226, 196, 138, 200));
        }
        if (this.kungfuPageUpgradeButton && this.kungfuPageUpgradeButtonLabel) {
            this.kungfuPageUpgradeButtonLabel.string = `升阶(${this.getKungfuUpgradeCost(selected.id)})`;
        }
        for (let i = 0; i < KUNGFU_DEFS.length; i++) {
            const def = KUNGFU_DEFS[i];
            const widget = this.kungfuListWidgets.get(def.id);
            if (!widget) continue;
            const level = this.getKungfuLevel(def.id);
            const isSelected = def.id === this.selectedKungfuId;
            const isEquipped = def.id === this.equippedKungfuId;
            widget.titleLabel.string = `${i + 1}. ${def.name}`;
            widget.infoLabel.string = `${def.title}  |  Lv.${level}  |  吐纳 ${Math.round((20 + def.cultivationQiPerSecond) * this.getKungfuBonusScale(def.id))}/秒`;
            widget.stateLabel.string = isEquipped ? '运转中' : isSelected ? '参悟中' : '可切换';
            widget.stateLabel.color = isEquipped ? new Color(236, 220, 176, 255) : isSelected ? new Color(206, 224, 240, 255) : new Color(174, 188, 202, 255);
            this.repaintPanel(widget.node, isSelected ? new Color(70, 82, 98, 255) : new Color(42, 48, 58, 245), isEquipped ? new Color(232, 200, 134, 220) : isSelected ? new Color(176, 204, 232, 220) : new Color(88, 102, 118, 180));
        }
    }

    private refreshSpiritPetPanel() {
        if (!this.homeSpiritPetPanel) return;
        const selected = this.getSpiritPetDef(this.selectedSpiritPetId);
        const selectedLevel = this.getSpiritPetLevel(selected.id);
        const unlocked = this.spiritPetUnlocked[selected.id];
        const deployed = this.equippedSpiritPetId === selected.id;
        if (this.spiritPetPagePortrait) this.drawSpiritPetPortrait(this.spiritPetPagePortrait, selected.id);
        if (this.spiritPetPageNameLabel) this.spiritPetPageNameLabel.string = `${selected.name}${deployed ? ' · 出战中' : unlocked ? '' : ' · 未收服'}`;
        if (this.spiritPetPageInfoLabel) this.spiritPetPageInfoLabel.string = `${selected.title}  |  Lv.${selectedLevel}\n${selected.summary}`;
        if (this.spiritPetPageEffectLabel) this.spiritPetPageEffectLabel.string = this.getSpiritPetEffectSummary(selected.id);
        if (this.spiritPetPageHintLabel) this.spiritPetPageHintLabel.string = unlocked ? `当前养成消耗：灵石折值 ${this.getSpiritPetUpgradeCost(selected.id)}。点击下方列表可切换养成目标。` : '尚未收服，需在击杀 Boss 时极低概率获得。';
        if (this.spiritPetPageDeployButton && this.spiritPetPageDeployButtonLabel) {
            this.spiritPetPageDeployButtonLabel.string = deployed ? '已出战' : '设置出战';
            this.repaintPanel(this.spiritPetPageDeployButton, deployed ? new Color(78, 102, 84, 255) : new Color(64, 90, 74, 255), deployed ? new Color(182, 226, 198, 200) : new Color(144, 200, 170, 180));
        }
        if (this.spiritPetPageUpgradeButton && this.spiritPetPageUpgradeButtonLabel) {
            this.spiritPetPageUpgradeButtonLabel.string = unlocked ? `养成(${this.getSpiritPetUpgradeCost(selected.id)})` : '待收服';
            this.repaintPanel(this.spiritPetPageUpgradeButton, unlocked ? new Color(76, 82, 96, 255) : new Color(68, 68, 74, 255), unlocked ? new Color(182, 198, 222, 180) : new Color(122, 126, 134, 140));
        }
        for (let i = 0; i < SPIRIT_PET_DEFS.length; i++) {
            const def = SPIRIT_PET_DEFS[i];
            const widget = this.spiritPetListWidgets.get(def.id);
            if (!widget) continue;
            const isSelected = def.id === this.selectedSpiritPetId;
            const isUnlocked = this.spiritPetUnlocked[def.id];
            const isEquipped = this.equippedSpiritPetId === def.id;
            widget.titleLabel.string = `${i + 1}. ${def.name}`;
            widget.infoLabel.string = `${def.title}  |  Lv.${this.getSpiritPetLevel(def.id)}  |  ${isUnlocked ? '可养成' : '待收服'}`;
            widget.stateLabel.string = isEquipped ? '出战中' : isSelected ? '养成中' : '待命';
            widget.stateLabel.color = !isUnlocked ? new Color(168, 154, 154, 255) : isEquipped ? new Color(210, 236, 196, 255) : isSelected ? new Color(206, 224, 240, 255) : new Color(174, 188, 202, 255);
            this.repaintPanel(widget.node, isSelected ? new Color(70, 82, 98, 255) : new Color(42, 48, 58, 245), !isUnlocked ? new Color(122, 108, 108, 160) : isEquipped ? new Color(166, 220, 190, 220) : isSelected ? new Color(176, 204, 232, 220) : new Color(88, 102, 118, 180));
        }
    }

    private switchTaskTab(tab: TaskTab) {
        this.taskTab = tab;
        this.refreshTaskPanel();
    }

    private clearTaskProgress(reset: TaskResetGroup) {
        for (let i = 0; i < TASK_IDS.length; i++) {
            const id = TASK_IDS[i];
            const task = this.getTaskById(id);
            if (!task || task.reset !== reset) continue;
            this.taskProgress[id] = 0;
            this.taskClaimed[id] = false;
        }
    }

    private ensureTaskRefreshState() {
        const dailyKey = this.getShopDailyKey();
        const weeklyKey = this.getShopWeeklyKey();
        if (this.taskDailyKey !== dailyKey) {
            this.taskDailyKey = dailyKey;
            this.clearTaskProgress('daily');
        }
        if (this.taskWeeklyKey !== weeklyKey) {
            this.taskWeeklyKey = weeklyKey;
            this.clearTaskProgress('weekly');
        }
    }

    private getTaskById(id: TaskId): TaskEntry | null {
        const tabs: TaskTab[] = ['daily', 'weekly', 'achievement', 'mainline'];
        for (let i = 0; i < tabs.length; i++) {
            const entries = TASK_ENTRIES[tabs[i]];
            for (let j = 0; j < entries.length; j++) {
                if (entries[j].id === id) return entries[j];
            }
        }
        return null;
    }

    private getTaskCurrentValue(task: TaskEntry): number {
        switch (task.metric) {
            case 'counter':
                return this.taskProgress[task.id] || 0;
            case 'bestDepthQi':
                return this.dungeonBestDepth.qi || 0;
            case 'artifactUnlockCount':
                return ARTIFACT_DEFS.filter((def) => this.artifactStates[def.id].unlocked).length;
            case 'artifactStarThree':
                return ARTIFACT_DEFS.some((def) => this.artifactStates[def.id].star >= 3) ? 1 : 0;
            case 'zhujiUnlocked':
                return this.isDungeonUnlocked('zhuji') ? 1 : 0;
            default:
                return 0;
        }
    }

    private getTaskProgressText(task: TaskEntry): string {
        const value = Math.min(task.target, this.getTaskCurrentValue(task));
        return `${task.progressLabel} ${value}/${task.target}`;
    }

    private isTaskCompleted(task: TaskEntry): boolean {
        return this.getTaskCurrentValue(task) >= task.target;
    }

    private addTaskProgress(id: TaskId, amount = 1) {
        const task = this.getTaskById(id);
        if (!task || task.metric !== 'counter') return;
        this.ensureTaskRefreshState();
        this.taskProgress[id] = Math.max(0, this.taskProgress[id] + amount);
        if (this.homeTaskPanel?.active) this.refreshTaskPanel();
    }

    private applyTaskRewards(rewards: TaskReward[]) {
        for (let i = 0; i < rewards.length; i++) {
            const reward = rewards[i];
            if (reward.effect === 'badge') {
                this.dungeonBadge += reward.value;
                continue;
            }
            this.applyShopItemReward({ effect: reward.effect, effectValue: reward.value });
        }
    }

    private claimTaskByRow(index: number) {
        this.ensureTaskRefreshState();
        const task = TASK_ENTRIES[this.taskTab][index];
        if (!task) return;
        if (this.taskClaimed[task.id]) {
            this.hintLabel.string = `${task.title} 奖励已领取。`;
            this.refreshTaskPanel();
            return;
        }
        if (!this.isTaskCompleted(task)) {
            this.hintLabel.string = `${task.title} 尚未达成。`;
            this.refreshTaskPanel();
            return;
        }
        this.taskClaimed[task.id] = true;
        this.applyTaskRewards(task.rewards);
        this.hintLabel.string = `领取任务奖励：${task.rewardText.replace('奖励: ', '')}。`;
        this.refreshHomeStatus();
    }

    private refreshTaskPanel() {
        this.ensureTaskRefreshState();
        const entries = TASK_ENTRIES[this.taskTab];
        const tabs: TaskTab[] = ['daily', 'weekly', 'achievement', 'mainline'];
        for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            const btn = this.taskTabButtons[tab];
            if (!btn) continue;
            const active = tab === this.taskTab;
            this.repaintPanel(btn, active ? new Color(74, 92, 112, 255) : new Color(52, 60, 72, 255), active ? new Color(176, 204, 228, 220) : new Color(88, 104, 124, 180));
            const labels = btn.getComponentsInChildren(Label);
            labels.forEach((label) => {
                label.color = active ? new Color(240, 244, 248, 255) : new Color(204, 214, 228, 255);
            });
        }
        for (let i = 0; i < this.taskRowNodes.length; i++) {
            const row = this.taskRowNodes[i];
            const entry = entries[i];
            row.active = !!entry;
            if (!entry) continue;
            this.taskRowTitleLabels[i].string = entry.title;
            this.taskRowInfoLabels[i].string = this.getTaskProgressText(entry);
            this.taskRowRewardLabels[i].string = entry.rewardText;
            const claimed = this.taskClaimed[entry.id];
            const completed = this.isTaskCompleted(entry);
            const claimBtn = this.taskRowClaimButtons[i];
            const claimLabel = this.taskRowClaimLabels[i];
            if (claimBtn && claimLabel) {
                const bg = claimed ? new Color(70, 78, 82, 255) : completed ? new Color(120, 96, 58, 255) : new Color(74, 92, 112, 255);
                const border = claimed ? new Color(142, 150, 156, 180) : completed ? new Color(232, 194, 118, 220) : new Color(140, 164, 186, 180);
                this.repaintPanel(claimBtn, bg, border);
                claimLabel.string = claimed ? '已领取' : completed ? '领取' : '未达成';
                claimLabel.color = claimed ? new Color(180, 188, 194, 255) : completed ? new Color(252, 238, 206, 255) : new Color(214, 224, 236, 255);
            }
        }
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

    private drawTaskQuickIcon(node: Node, active: boolean) {
        let g = node.getComponent(Graphics);
        if (!g) g = node.addComponent(Graphics);
        g.clear();
        g.lineWidth = 2.4;
        g.strokeColor = active ? new Color(238, 226, 194, 255) : new Color(204, 216, 228, 255);
        g.fillColor = active ? new Color(214, 188, 118, 48) : new Color(148, 170, 196, 24);
        g.roundRect(-12, -14, 24, 28, 5);
        g.fill();
        g.roundRect(-12, -14, 24, 28, 5);
        g.stroke();
        g.moveTo(-6, 18);
        g.lineTo(6, 18);
        g.stroke();
        g.moveTo(-4, 6);
        g.lineTo(4, 6);
        g.moveTo(-4, 0);
        g.lineTo(4, 0);
        g.moveTo(-4, -6);
        g.lineTo(1, -6);
        g.stroke();
        g.circle(-6, 18, 1.8);
        g.circle(6, 18, 1.8);
        g.fill();
    }

    private drawAlchemyQuickIcon(node: Node, active: boolean) {
        let g = node.getComponent(Graphics);
        if (!g) g = node.addComponent(Graphics);
        g.clear();
        g.lineWidth = 2.4;
        g.strokeColor = active ? new Color(248, 226, 182, 255) : new Color(224, 214, 196, 255);
        g.fillColor = active ? new Color(214, 162, 86, 52) : new Color(150, 136, 112, 28);
        g.roundRect(-12, -6, 24, 18, 6);
        g.fill();
        g.roundRect(-12, -6, 24, 18, 6);
        g.stroke();
        g.moveTo(-8, 12);
        g.lineTo(-5, 18);
        g.lineTo(5, 18);
        g.lineTo(8, 12);
        g.stroke();
        g.moveTo(-6, -8);
        g.lineTo(-2, -12);
        g.lineTo(2, -12);
        g.lineTo(6, -8);
        g.stroke();
        g.arc(0, 16, 6, Math.PI, Math.PI * 2, false);
        g.stroke();
    }

    private drawForgeQuickIcon(node: Node, active: boolean) {
        let g = node.getComponent(Graphics);
        if (!g) g = node.addComponent(Graphics);
        g.clear();
        g.lineWidth = 2.4;
        g.strokeColor = active ? new Color(198, 226, 252, 255) : new Color(210, 220, 232, 255);
        g.fillColor = active ? new Color(90, 142, 196, 48) : new Color(118, 136, 156, 24);
        g.roundRect(-11, 2, 22, 10, 2);
        g.fill();
        g.roundRect(-11, 2, 22, 10, 2);
        g.stroke();
        g.moveTo(-14, -2);
        g.lineTo(-2, -2);
        g.lineTo(4, -8);
        g.lineTo(12, -8);
        g.stroke();
        g.moveTo(2, 12);
        g.lineTo(2, 18);
        g.stroke();
        g.moveTo(8, 12);
        g.lineTo(8, 18);
        g.stroke();
        g.moveTo(-12, 0);
        g.lineTo(-16, -12);
        g.stroke();
    }

    private drawKungfuQuickIcon(node: Node, active: boolean) {
        let g = node.getComponent(Graphics);
        if (!g) g = node.addComponent(Graphics);
        g.clear();
        g.lineWidth = 2.4;
        g.strokeColor = active ? new Color(248, 226, 178, 255) : new Color(230, 214, 186, 255);
        g.fillColor = active ? new Color(182, 132, 62, 52) : new Color(144, 118, 86, 24);
        g.roundRect(-12, -14, 24, 28, 6);
        g.fill();
        g.roundRect(-12, -14, 24, 28, 6);
        g.stroke();
        g.moveTo(-6, 10);
        g.lineTo(0, 16);
        g.lineTo(6, 10);
        g.stroke();
        g.moveTo(0, 14);
        g.lineTo(0, -10);
        g.stroke();
        g.moveTo(-8, -2);
        g.lineTo(8, -2);
        g.stroke();
        g.moveTo(-6, -10);
        g.lineTo(6, -10);
        g.stroke();
    }

    private drawSpiritPetQuickIcon(node: Node, active: boolean) {
        let g = node.getComponent(Graphics);
        if (!g) g = node.addComponent(Graphics);
        g.clear();
        g.lineWidth = 2.4;
        g.strokeColor = active ? new Color(196, 244, 222, 255) : new Color(210, 232, 222, 255);
        g.fillColor = active ? new Color(82, 154, 132, 46) : new Color(94, 128, 120, 22);
        g.circle(0, 4, 10);
        g.fill();
        g.circle(0, 4, 10);
        g.stroke();
        g.circle(-10, 14, 4);
        g.fill();
        g.circle(-10, 14, 4);
        g.stroke();
        g.circle(10, 14, 4);
        g.fill();
        g.circle(10, 14, 4);
        g.stroke();
        g.moveTo(-8, -8);
        g.lineTo(-14, -14);
        g.stroke();
        g.moveTo(8, -8);
        g.lineTo(14, -14);
        g.stroke();
    }

    private drawSpiritPetPortrait(node: Node, id: SpiritPetId) {
        let g = node.getComponent(Graphics);
        if (!g) g = node.addComponent(Graphics);
        g.clear();
        g.fillColor = new Color(30, 38, 52, 255);
        g.roundRect(-90, -84, 180, 168, 20);
        g.fill();
        if (id === 'leihu') {
            g.fillColor = new Color(88, 120, 196, 44);
            g.circle(0, 4, 62);
            g.fill();
            g.fillColor = new Color(94, 106, 124, 255);
            g.moveTo(-48, -18);
            g.lineTo(-20, 34);
            g.lineTo(20, 34);
            g.lineTo(48, -18);
            g.lineTo(34, -40);
            g.lineTo(-34, -40);
            g.close();
            g.fill();
            g.strokeColor = new Color(224, 236, 255, 220);
            g.lineWidth = 4;
            g.moveTo(-28, 28);
            g.lineTo(-14, 54);
            g.lineTo(-2, 24);
            g.moveTo(28, 28);
            g.lineTo(14, 54);
            g.lineTo(2, 24);
            g.moveTo(-18, 8);
            g.lineTo(-2, 18);
            g.lineTo(18, 8);
            g.moveTo(-14, -6);
            g.lineTo(0, -22);
            g.lineTo(14, -6);
            g.moveTo(-42, -22);
            g.lineTo(-60, -10);
            g.moveTo(42, -22);
            g.lineTo(60, -10);
            g.moveTo(-54, 8);
            g.lineTo(-28, 2);
            g.moveTo(54, 8);
            g.lineTo(28, 2);
            g.moveTo(-48, 46);
            g.lineTo(-18, 10);
            g.lineTo(-28, 10);
            g.lineTo(12, -36);
            g.lineTo(4, -4);
            g.lineTo(34, -4);
            g.stroke();
        } else if (id === 'xuangui') {
            g.fillColor = new Color(98, 138, 114, 52);
            g.circle(0, 4, 56);
            g.fill();
            g.fillColor = new Color(84, 110, 94, 255);
            g.roundRect(-54, -20, 108, 74, 30);
            g.fill();
            g.strokeColor = new Color(214, 240, 220, 220);
            g.lineWidth = 4;
            g.roundRect(-54, -20, 108, 74, 30);
            g.stroke();
            g.circle(0, 18, 18);
            g.stroke();
            g.moveTo(-20, 22);
            g.lineTo(20, 22);
            g.moveTo(0, 40);
            g.lineTo(0, 0);
            g.moveTo(-36, 18);
            g.lineTo(-14, 4);
            g.moveTo(36, 18);
            g.lineTo(14, 4);
            g.moveTo(-34, -10);
            g.lineTo(-60, -26);
            g.moveTo(34, -10);
            g.lineTo(60, -26);
            g.moveTo(-28, -20);
            g.lineTo(-44, -42);
            g.moveTo(28, -20);
            g.lineTo(44, -42);
            g.moveTo(-12, -42);
            g.lineTo(0, -56);
            g.lineTo(12, -42);
            g.moveTo(-36, 0);
            g.lineTo(36, 0);
            g.moveTo(-20, -20);
            g.lineTo(20, 18);
            g.moveTo(20, -20);
            g.lineTo(-20, 18);
            g.stroke();
        } else {
            g.fillColor = new Color(154, 196, 216, 42);
            g.ellipse(0, 4, 60, 70);
            g.fill();
            g.strokeColor = new Color(224, 244, 255, 220);
            g.lineWidth = 4;
            g.arc(0, 16, 22, Math.PI * 0.15, Math.PI * 0.85, false);
            g.stroke();
            g.moveTo(-12, 14);
            g.lineTo(-30, 56);
            g.lineTo(-8, 38);
            g.moveTo(12, 14);
            g.lineTo(30, 56);
            g.lineTo(8, 38);
            g.moveTo(0, 8);
            g.lineTo(0, -34);
            g.moveTo(-46, 4);
            g.lineTo(-12, 20);
            g.lineTo(-4, -10);
            g.stroke();
            g.moveTo(46, 4);
            g.lineTo(12, 20);
            g.lineTo(4, -10);
            g.stroke();
            g.moveTo(-20, -18);
            g.lineTo(0, -52);
            g.lineTo(20, -18);
            g.stroke();
        }
        let glyphNode = node.getChildByName('SpiritPetGlyph');
        let glyphLabel: Label | null = glyphNode ? glyphNode.getComponent(Label) : null;
        if (!glyphNode || !glyphLabel) {
            glyphLabel = this.createLabel(node, '', 46, new Vec3(0, -58, 0), new Color(244, 248, 236, 255), 80);
            glyphNode = glyphLabel.node;
            glyphNode.name = 'SpiritPetGlyph';
        }
        glyphLabel.string = this.getSpiritPetDef(id).glyph;
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

    private buildHomeAnimatedPortrait(parent: Node, x: number, y: number) {
        const portraitPanel = this.createPanel(parent, 260, 210, x, y, new Color(36, 42, 52, 245));
        this.homeRoleSparkles = [];
        this.homeRoleAuraOuter = new Node('RoleAuraOuter');
        this.homeRoleAuraOuter.layer = Layers.Enum.UI_2D;
        portraitPanel.addChild(this.homeRoleAuraOuter);
        this.homeRoleAuraOuter.setPosition(0, 12, 0);
        this.homeRoleAuraOuter.addComponent(UITransform).setContentSize(220, 180);
        const outerAura = this.homeRoleAuraOuter.addComponent(Graphics);
        outerAura.strokeColor = new Color(180, 196, 224, 110);
        outerAura.fillColor = new Color(80, 100, 136, 28);
        outerAura.lineWidth = 2.5;
        outerAura.circle(0, 12, 78);
        outerAura.fill();
        outerAura.stroke();
        outerAura.circle(0, 12, 62);
        outerAura.stroke();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const x1 = Math.cos(angle) * 70;
            const y1 = 12 + Math.sin(angle) * 70;
            const x2 = Math.cos(angle) * 86;
            const y2 = 12 + Math.sin(angle) * 86;
            outerAura.moveTo(x1, y1);
            outerAura.lineTo(x2, y2);
            outerAura.stroke();
        }

        this.homeRoleAuraInner = new Node('RoleAuraInner');
        this.homeRoleAuraInner.layer = Layers.Enum.UI_2D;
        portraitPanel.addChild(this.homeRoleAuraInner);
        this.homeRoleAuraInner.setPosition(0, 18, 0);
        this.homeRoleAuraInner.addComponent(UITransform).setContentSize(180, 150);
        const innerAura = this.homeRoleAuraInner.addComponent(Graphics);
        innerAura.fillColor = new Color(110, 132, 176, 42);
        innerAura.strokeColor = new Color(210, 220, 238, 88);
        innerAura.lineWidth = 2;
        innerAura.circle(0, 0, 48);
        innerAura.fill();
        innerAura.stroke();
        innerAura.moveTo(-42, -18);
        innerAura.lineTo(0, 34);
        innerAura.lineTo(42, -18);
        innerAura.stroke();
        innerAura.moveTo(-32, 18);
        innerAura.lineTo(32, 18);
        innerAura.stroke();

        this.homeRolePedestal = new Node('RolePedestal');
        this.homeRolePedestal.layer = Layers.Enum.UI_2D;
        portraitPanel.addChild(this.homeRolePedestal);
        this.homeRolePedestal.setPosition(0, -40, 0);
        this.homeRolePedestal.addComponent(UITransform).setContentSize(180, 54);
        const pedestal = this.homeRolePedestal.addComponent(Graphics);
        pedestal.fillColor = new Color(82, 98, 124, 70);
        pedestal.strokeColor = new Color(210, 222, 236, 100);
        pedestal.lineWidth = 2;
        pedestal.ellipse(0, 0, 70, 14);
        pedestal.fill();
        pedestal.ellipse(0, 0, 70, 14);
        pedestal.stroke();
        pedestal.strokeColor = new Color(168, 188, 220, 80);
        pedestal.ellipse(0, 0, 48, 8);
        pedestal.stroke();
        pedestal.moveTo(-50, -4);
        pedestal.lineTo(-20, -4);
        pedestal.moveTo(20, -4);
        pedestal.lineTo(50, -4);
        pedestal.stroke();

        this.homeRoleSparkles.push(this.createRoleSparkle(portraitPanel, -54, 52, 1));
        this.homeRoleSparkles.push(this.createRoleSparkle(portraitPanel, 0, 76, 0.85));
        this.homeRoleSparkles.push(this.createRoleSparkle(portraitPanel, 56, 44, 1.1));

        this.homeRoleRibbonLeft = new Node('RoleRibbonLeft');
        this.homeRoleRibbonLeft.layer = Layers.Enum.UI_2D;
        portraitPanel.addChild(this.homeRoleRibbonLeft);
        this.homeRoleRibbonLeft.setPosition(-82, -6, 0);
        this.homeRoleRibbonLeft.addComponent(UITransform).setContentSize(56, 124);
        const leftRibbon = this.homeRoleRibbonLeft.addComponent(Graphics);
        leftRibbon.fillColor = new Color(96, 126, 160, 88);
        leftRibbon.strokeColor = new Color(190, 210, 228, 120);
        leftRibbon.lineWidth = 2;
        leftRibbon.moveTo(18, 46);
        leftRibbon.quadraticCurveTo(-10, 10, 0, -54);
        leftRibbon.lineTo(16, -38);
        leftRibbon.quadraticCurveTo(6, 2, 26, 44);
        leftRibbon.close();
        leftRibbon.fill();
        leftRibbon.stroke();

        this.homeRoleRibbonRight = new Node('RoleRibbonRight');
        this.homeRoleRibbonRight.layer = Layers.Enum.UI_2D;
        portraitPanel.addChild(this.homeRoleRibbonRight);
        this.homeRoleRibbonRight.setPosition(82, -6, 0);
        this.homeRoleRibbonRight.addComponent(UITransform).setContentSize(56, 124);
        const rightRibbon = this.homeRoleRibbonRight.addComponent(Graphics);
        rightRibbon.fillColor = new Color(96, 126, 160, 88);
        rightRibbon.strokeColor = new Color(190, 210, 228, 120);
        rightRibbon.lineWidth = 2;
        rightRibbon.moveTo(-18, 46);
        rightRibbon.quadraticCurveTo(10, 10, 0, -54);
        rightRibbon.lineTo(-16, -38);
        rightRibbon.quadraticCurveTo(-6, 2, -26, 44);
        rightRibbon.close();
        rightRibbon.fill();
        rightRibbon.stroke();

        const rigRoot = new Node('RoleRigRoot');
        rigRoot.layer = Layers.Enum.UI_2D;
        portraitPanel.addChild(rigRoot);
        rigRoot.setPosition(0, -16, 0);
        rigRoot.addComponent(UITransform).setContentSize(200, 180);
        this.homeRoleRig = this.createCharacterRig(rigRoot, new Color(90, 100, 120, 255), new Color(200, 210, 230, 255));
        this.homeRoleRig.root.setScale(new Vec3(3.05, 3.05, 1));
        this.homeRoleRig.root.setPosition(0, 8, 0);
        this.homeRoleRig.body.node.setPosition(0, 12, 0);
        this.homeRoleRig.body.node.angle = 4;
        this.homeRoleRig.head.node.angle = -2;
        this.homeRoleRig.armL.node.setPosition(-10, 18, 0);
        this.homeRoleRig.armR.node.setPosition(10, 18, 0);
        this.homeRoleRig.armL.node.angle = -62;
        this.homeRoleRig.armR.node.angle = 62;
        this.homeRoleRig.legL.node.setPosition(-4, 6, 0);
        this.homeRoleRig.legR.node.setPosition(4, 6, 0);
        this.homeRoleRig.legL.node.angle = -112;
        this.homeRoleRig.legR.node.angle = 112;

        this.createLabel(portraitPanel, '灵台打坐', 18, new Vec3(0, -82, 0), new Color(208, 220, 235, 255));
    }

    private createRoleSparkle(parent: Node, x: number, y: number, scale: number) {
        const sparkle = new Node('RoleSparkle');
        sparkle.layer = Layers.Enum.UI_2D;
        parent.addChild(sparkle);
        sparkle.setPosition(x, y, 0);
        sparkle.setScale(new Vec3(scale, scale, 1));
        sparkle.addComponent(UITransform).setContentSize(18, 18);
        const g = sparkle.addComponent(Graphics);
        g.strokeColor = new Color(228, 236, 248, 155);
        g.lineWidth = 1.5;
        g.moveTo(0, 8);
        g.lineTo(0, -8);
        g.moveTo(-8, 0);
        g.lineTo(8, 0);
        g.moveTo(-5, -5);
        g.lineTo(5, 5);
        g.moveTo(-5, 5);
        g.lineTo(5, -5);
        g.stroke();
        return sparkle;
    }

    private getRealmTitle(): string {
        const level = this.realmLevel;
        if (level <= 9) return `炼气${level}重`;
        if (level <= 18) return `筑基${level - 9}重`;
        if (level <= 27) return `金丹${level - 18}转`;
        return `元婴${level - 27}变`;
    }

    private getKungfuDef(id: KungfuId): KungfuDef {
        for (let i = 0; i < KUNGFU_DEFS.length; i++) {
            if (KUNGFU_DEFS[i].id === id) return KUNGFU_DEFS[i];
        }
        return KUNGFU_DEFS[0];
    }

    private getEquippedKungfuDef(): KungfuDef {
        return this.getKungfuDef(this.equippedKungfuId);
    }

    private getSpiritPetLevel(id: SpiritPetId): number {
        return this.spiritPetLevels[id] || 1;
    }

    private getSpiritPetUpgradeCost(id: SpiritPetId): number {
        return 180 + this.getSpiritPetLevel(id) * 90;
    }

    private getSpiritPetBonusScale(id: SpiritPetId): number {
        return 1 + (this.getSpiritPetLevel(id) - 1) * 0.18;
    }

    private getSpiritPetDef(id: SpiritPetId): SpiritPetDef {
        return SPIRIT_PET_DEFS.find((def) => def.id === id) || SPIRIT_PET_DEFS[0];
    }

    private getSpiritPetBonusesById(id: SpiritPetId): SpiritPetBonuses {
        const def = this.getSpiritPetDef(id);
        const scale = this.getSpiritPetBonusScale(id);
        return {
            hp: Math.round(def.hpBonus * scale),
            mana: Math.round(def.manaBonus * scale),
            damage: Math.round(def.damageBonus * scale),
            tribulationRate: def.tribulationRateBonus * scale,
            thunderReduction: Math.round(def.thunderReduction * scale),
        };
    }

    private getEquippedSpiritPetBonuses(): SpiritPetBonuses {
        if (!this.equippedSpiritPetId || !this.spiritPetUnlocked[this.equippedSpiritPetId]) {
            return { hp: 0, mana: 0, damage: 0, tribulationRate: 0, thunderReduction: 0 };
        }
        return this.getSpiritPetBonusesById(this.equippedSpiritPetId);
    }

    private cycleSpiritPetSelection(step: number) {
        const index = SPIRIT_PET_DEFS.findIndex((def) => def.id === this.selectedSpiritPetId);
        const nextIndex = (index + step + SPIRIT_PET_DEFS.length) % SPIRIT_PET_DEFS.length;
        this.selectedSpiritPetId = SPIRIT_PET_DEFS[nextIndex].id;
        this.refreshHomeStatus();
    }

    private equipSelectedSpiritPet() {
        if (!this.spiritPetUnlocked[this.selectedSpiritPetId]) {
            this.hintLabel.string = `${this.getSpiritPetDef(this.selectedSpiritPetId).name} 尚未收服。需在击杀 Boss 时极低概率获得。`;
            return;
        }
        this.equippedSpiritPetId = this.selectedSpiritPetId;
        this.hintLabel.string = `灵宠 ${this.getSpiritPetDef(this.selectedSpiritPetId).name} 已出战。`;
        this.refreshHomeStatus();
    }

    private tryUpgradeSelectedSpiritPet() {
        const def = this.getSpiritPetDef(this.selectedSpiritPetId);
        if (!this.spiritPetUnlocked[def.id]) {
            this.hintLabel.string = `${def.name} 尚未收服，暂不可养成。`;
            return;
        }
        const cost = this.getSpiritPetUpgradeCost(def.id);
        if (!this.consumeSpiritStoneValue(cost)) {
            this.hintLabel.string = `${def.name} 养成需灵石折值 ${cost}，当前仅有 ${this.getSpiritStoneTotalValue(this.spiritStoneInventory)}。`;
            return;
        }
        this.spiritPetLevels[def.id] += 1;
        this.hintLabel.string = `${def.name} 升至 Lv.${this.getSpiritPetLevel(def.id)}，灵宠增益提升。`;
        this.refreshHomeStatus();
    }

    private getSpiritPetEffectSummary(id: SpiritPetId): string {
        const bonus = this.getSpiritPetBonusesById(id);
        const parts: string[] = [];
        if (bonus.hp > 0) parts.push(`气血 +${bonus.hp}`);
        if (bonus.mana > 0) parts.push(`法力 +${bonus.mana}`);
        if (bonus.damage > 0) parts.push(`术攻 +${bonus.damage}`);
        parts.push(`渡劫 +${Math.round(bonus.tribulationRate * 100)}%`);
        parts.push(`雷伤 -${bonus.thunderReduction}`);
        return parts.join(' | ');
    }

    private tryRollSpiritPetDrop(): SpiritPetDef | null {
        const locked = SPIRIT_PET_DEFS.filter((def) => !this.spiritPetUnlocked[def.id]);
        if (locked.length === 0) return null;
        if (Math.random() >= 0.02) return null;
        const pet = locked[Math.floor(Math.random() * locked.length)];
        this.spiritPetUnlocked[pet.id] = true;
        if (!this.equippedSpiritPetId) this.equippedSpiritPetId = pet.id;
        this.selectedSpiritPetId = pet.id;
        return pet;
    }

    private getBuildingDef(id: BuildingId): BuildingDef {
        return DONGTIAN_BUILDINGS.find((def) => def.id === id) || DONGTIAN_BUILDINGS[0];
    }

    private getBuildingLevel(id: BuildingId): number {
        return this.dongtianBuildingLevels[id] || 1;
    }

    private getBuildingUpgradeStoneCost(id: BuildingId): number {
        const def = this.getBuildingDef(id);
        const level = this.getBuildingLevel(id);
        return def.stoneBaseCost + (level - 1) * Math.floor(def.stoneBaseCost * 0.6);
    }

    private getBuildingUpgradeBadgeCost(id: BuildingId): number {
        const def = this.getBuildingDef(id);
        const level = this.getBuildingLevel(id);
        return def.badgeBaseCost + (level - 1) * 3;
    }

    private getBuildingUpgradeMaterialCosts(id: BuildingId): Partial<Record<MaterialId, number>> {
        const def = this.getBuildingDef(id);
        const level = this.getBuildingLevel(id);
        const costs: Partial<Record<MaterialId, number>> = {};
        const keys = Object.keys(def.materialCost) as MaterialId[];
        for (let i = 0; i < keys.length; i++) {
            const materialId = keys[i];
            const base = def.materialCost[materialId] || 0;
            costs[materialId] = base + Math.max(0, level - 1) * Math.max(1, Math.floor(base * 0.5));
        }
        return costs;
    }

    private getDongtianBonuses(): DongtianBonuses {
        const gatherLevel = this.getBuildingLevel('gather');
        const alchemyLevel = this.getBuildingLevel('alchemy');
        const forgeLevel = this.getBuildingLevel('forge');
        const wardLevel = this.getBuildingLevel('ward');
        return {
            cultivationRate: Math.max(0, (gatherLevel - 1) * 0.08),
            alchemySuccess: Math.max(0, (alchemyLevel - 1) * 0.03),
            alchemyYield: Math.max(0, (alchemyLevel - 1) * 0.45),
            forgeSuccess: Math.max(0, (forgeLevel - 1) * 0.03),
            forgeQuality: Math.max(0, (forgeLevel - 1) * 0.05),
            tribulationGain: Math.max(0, (gatherLevel - 1) * 0.08 + (wardLevel - 1) * 0.12),
            tribulationShield: Math.max(0, (wardLevel - 1) * 6 + (forgeLevel - 1) * 2),
        };
    }

    private tryUpgradeBuilding(id: BuildingId) {
        const materialCosts = this.getBuildingUpgradeMaterialCosts(id);
        const missingMaterial = this.getFirstMissingMaterial(materialCosts);
        if (missingMaterial) {
            this.hintLabel.string = `${this.getBuildingDef(id).name} 升级需 ${missingMaterial.def.name} ${missingMaterial.need}，当前仅有 ${missingMaterial.have}。`;
            return;
        }
        const stoneCost = this.getBuildingUpgradeStoneCost(id);
        if (!this.consumeSpiritStoneValue(stoneCost)) {
            this.hintLabel.string = `${this.getBuildingDef(id).name} 升级需灵石折值 ${stoneCost}。`;
            return;
        }
        const badgeCost = this.getBuildingUpgradeBadgeCost(id);
        if (this.dungeonBadge < badgeCost) {
            this.addSpiritStoneValue(stoneCost, 'home');
            this.hintLabel.string = `${this.getBuildingDef(id).name} 升级需徽记 ${badgeCost}。`;
            return;
        }
        this.consumeMaterials(materialCosts);
        this.dungeonBadge -= badgeCost;
        this.dongtianBuildingLevels[id] += 1;
        this.hintLabel.string = `${this.getBuildingDef(id).name} 升至 Lv.${this.getBuildingLevel(id)}。`;
        this.refreshHomeStatus();
    }

    private getAlchemyStoredCount(id: AlchemyRecipeId = this.alchemySelectedRecipe): number {
        return this.alchemyInventory[id] || 0;
    }

    private tryConsumeAlchemyPill() {
        if (this.alchemyTab === 'forge') {
            this.hintLabel.string = '当前选中为炼器页，需切回炼丹后服用丹药。';
            return;
        }
        const recipe = this.getAlchemyRecipe(this.alchemySelectedRecipe);
        if (this.alchemyInventory[recipe.id] <= 0) {
            if (this.alchemyHintLabel) this.alchemyHintLabel.string = `${recipe.name} 库存不足，需先开炉炼制。`;
            return;
        }
        this.alchemyInventory[recipe.id] -= 1;
        this.applyShopItemReward({ effect: recipe.effect, effectValue: recipe.effectValue });
        if (this.alchemyHintLabel) this.alchemyHintLabel.string = `服用 ${recipe.name} 1 枚，获得 ${recipe.rewardText}。当前库存 ${this.alchemyInventory[recipe.id]}。`;
        this.refreshHomeStatus();
    }

    private getTribulationPrepNeed(): number {
        return 36 + this.realmLevel * 14;
    }

    private getTribulationPrepareStoneCost(): number {
        return 700 + this.realmLevel * 180;
    }

    private getTribulationSuccessRate(): number {
        const needPrep = this.getTribulationPrepNeed();
        const prepRatio = Math.max(0, Math.min(1.2, this.tribulationPrep / Math.max(1, needPrep)));
        const petBonus = this.getEquippedSpiritPetBonuses();
        const wardBonus = Math.max(0, (this.getBuildingLevel('ward') - 1) * 0.04);
        return Math.min(0.97, 0.52 + prepRatio * 0.22 + wardBonus + petBonus.tribulationRate);
    }

    private getThunderDamageAfterFormation(): number {
        const baseDamage = 42 + this.realmLevel * 16;
        const guardReduction = 0.12 + (this.getBuildingLevel('ward') - 1) * 0.08;
        const petBonus = this.getEquippedSpiritPetBonuses();
        return Math.max(1, Math.floor(baseDamage * Math.max(0.2, 1 - guardReduction)) - petBonus.thunderReduction);
    }

    private switchDongtianTab(tab: DongtianTab) {
        this.dongtianTab = tab;
        this.refreshDongtianPanel();
    }

    private clearMeritState(refresh: 'daily' | 'weekly') {
        for (let i = 0; i < MERIT_TASKS.length; i++) {
            const task = MERIT_TASKS[i];
            if (task.refresh !== refresh) continue;
            this.meritTaskProgress[task.id] = 0;
            this.meritTaskClaimed[task.id] = false;
        }
        const purchases = MERIT_SHOP_ITEMS.filter((item) => item.refresh === refresh);
        for (let i = 0; i < purchases.length; i++) {
            delete this.meritShopPurchases[purchases[i].id];
        }
    }

    private ensureMeritRefreshState() {
        const dailyKey = this.getShopDailyKey();
        const weeklyKey = this.getShopWeeklyKey();
        if (this.meritDailyKey !== dailyKey) {
            this.meritDailyKey = dailyKey;
            this.clearMeritState('daily');
        }
        if (this.meritWeeklyKey !== weeklyKey) {
            this.meritWeeklyKey = weeklyKey;
            this.clearMeritState('weekly');
        }
    }

    private addMeritTaskProgress(id: MeritTaskId, amount = 1) {
        this.ensureMeritRefreshState();
        this.meritTaskProgress[id] = Math.max(0, this.meritTaskProgress[id] + amount);
    }

    private getMeritTaskCurrentValue(task: MeritTaskDef): number {
        return Math.min(task.target, this.meritTaskProgress[task.id] || 0);
    }

    private claimMeritTaskByRow(index: number) {
        this.ensureMeritRefreshState();
        const task = MERIT_TASKS[index];
        if (!task) return;
        if (this.meritTaskClaimed[task.id]) {
            this.hintLabel.string = `${task.title} 已领取。`;
            this.refreshDongtianPanel();
            return;
        }
        if (this.getMeritTaskCurrentValue(task) < task.target) {
            this.hintLabel.string = `${task.title} 尚未完成。`;
            this.refreshDongtianPanel();
            return;
        }
        this.meritTaskClaimed[task.id] = true;
        this.meritPoint += task.rewardMerit;
        this.hintLabel.string = `完成洞天差事，功勋 +${task.rewardMerit}。`;
        this.refreshHomeStatus();
    }

    private applyMeritShopReward(item: MeritShopItemDef) {
        if (item.effect === 'badge') {
            this.dungeonBadge += item.effectValue;
            return;
        }
        if (item.effect === 'tribulationPrep') {
            this.tribulationPrep += item.effectValue;
            return;
        }
        this.applyShopItemReward({ effect: item.effect, effectValue: item.effectValue });
    }

    private buyMeritShopItem(id: string) {
        this.ensureMeritRefreshState();
        const item = MERIT_SHOP_ITEMS.find((entry) => entry.id === id);
        if (!item) return;
        const bought = this.meritShopPurchases[id] || 0;
        if (bought >= item.limit) {
            this.hintLabel.string = `${item.name} 已兑尽，等待刷新。`;
            this.refreshDongtianPanel();
            return;
        }
        if (this.meritPoint < item.cost) {
            this.hintLabel.string = `${item.name} 需要功勋 ${item.cost}。`;
            this.refreshDongtianPanel();
            return;
        }
        this.meritPoint -= item.cost;
        this.meritShopPurchases[id] = bought + 1;
        this.applyMeritShopReward(item);
        this.hintLabel.string = `兑换 ${item.name}，获得 ${item.rewardText}。`;
        this.refreshHomeStatus();
    }

    private getTribulationSupportRecipe(): AlchemyRecipeDef | null {
        const order: AlchemyRecipeId[] = ['cuiti', 'shenxing', 'yangyuan', 'ningqi'];
        for (let i = 0; i < order.length; i++) {
            const id = order[i];
            if (this.alchemyInventory[id] > 0) return this.getAlchemyRecipe(id);
        }
        return null;
    }

    private getTribulationRecipePrepValue(id: AlchemyRecipeId): number {
        switch (id) {
            case 'ningqi': return 16;
            case 'yangyuan': return 22;
            case 'cuiti': return 30;
            case 'shenxing': return 26;
            default: return 16;
        }
    }

    private tryPrepareTribulation() {
        const recipe = this.getTribulationSupportRecipe();
        const stoneCost = this.getTribulationPrepareStoneCost();
        if (!this.consumeSpiritStoneValue(stoneCost)) {
            this.hintLabel.string = `渡劫准备需灵石折值 ${stoneCost}，当前仅有 ${this.getSpiritStoneTotalValue(this.spiritStoneInventory)}。`;
            return;
        }
        const bonuses = this.getDongtianBonuses();
        const baseGain = recipe ? this.getTribulationRecipePrepValue(recipe.id) : 10 + this.getBuildingLevel('gather') * 2;
        const gain = Math.max(8, Math.round(baseGain * (1 + bonuses.tribulationGain)));
        if (recipe) this.alchemyInventory[recipe.id] -= 1;
        this.tribulationPrep += gain;
        this.addMeritTaskProgress('merit_prepare', 1);
        this.hintLabel.string = recipe
            ? `消耗灵石并调用 ${recipe.name} 调和气机，准备度 +${gain}。`
            : `消耗灵石稳固气机，借洞府灵脉蓄势，准备度 +${gain}。`;
        this.refreshHomeStatus();
    }

    private refreshDongtianPanel() {
        this.ensureMeritRefreshState();
        if (this.dongtianCavePage) this.dongtianCavePage.active = this.dongtianTab === 'cave';
        if (this.dongtianMeritPage) this.dongtianMeritPage.active = this.dongtianTab === 'merit';
        const tabs: DongtianTab[] = ['cave', 'merit'];
        for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            const btn = this.dongtianTabButtons[tab];
            if (!btn) continue;
            const active = tab === this.dongtianTab;
            this.repaintPanel(btn, active ? new Color(74, 92, 112, 255) : new Color(54, 62, 74, 255), active ? new Color(176, 204, 228, 220) : new Color(88, 104, 124, 180));
            const labels = btn.getComponentsInChildren(Label);
            labels.forEach((label) => {
                label.color = active ? new Color(244, 248, 252, 255) : new Color(210, 220, 232, 255);
            });
        }
        if (this.dongtianMountLabel) this.dongtianMountLabel.string = `洞府挂载：青岚洞天·内府灵域  |  洞天灵机与洞府阵枢已连通`;
        if (this.dongtianMeritLabel) this.dongtianMeritLabel.string = `功勋 ${this.meritPoint}  |  洞府灵脉 Lv.${this.getBuildingLevel('gather')}  |  护山大阵 Lv.${this.getBuildingLevel('ward')}`;
        if (this.dongtianSummaryLabel) {
            const bonus = this.getDongtianBonuses();
            this.dongtianSummaryLabel.string = `洞府灵脉 +${Math.round(bonus.cultivationRate * 100)}%  |  丹火室 +${Math.round(bonus.alchemySuccess * 100)}%  |  百炼台 +${Math.round(bonus.forgeSuccess * 100)}%`;
        }
        if (this.dongtianSpiritLabel) {
            this.dongtianSpiritLabel.string = `灵石 ${this.getSpiritStoneSummary(this.spiritStoneInventory, 3)}  |  徽记 ${this.dungeonBadge}  |  雷劫伤害 ${this.getThunderDamageAfterFormation()}`;
        }
        for (let i = 0; i < DONGTIAN_BUILDINGS.length; i++) {
            const def = DONGTIAN_BUILDINGS[i];
            const level = this.getBuildingLevel(def.id);
            const title = this.dongtianBuildingTitleLabels[def.id];
            const info = this.dongtianBuildingInfoLabels[def.id];
            const cost = this.dongtianBuildingCostLabels[def.id];
            const btn = this.dongtianBuildingButtons[def.id];
            const btnLabel = this.dongtianBuildingButtonLabels[def.id];
            if (title) title.string = `${def.name}  Lv.${level}`;
            if (info) info.string = `${def.title}\n${def.summary}`;
            if (cost) cost.string = `下级: 灵石 ${this.getBuildingUpgradeStoneCost(def.id)} | 徽记 ${this.getBuildingUpgradeBadgeCost(def.id)} | ${this.formatMaterialCosts(this.getBuildingUpgradeMaterialCosts(def.id))}`;
            if (btn && btnLabel) {
                this.repaintPanel(btn, new Color(82, 96, 112, 255), new Color(164, 192, 216, 180));
                btnLabel.string = '升级';
            }
        }
        if (this.dongtianTribulationLabel) {
            this.dongtianTribulationLabel.string = `准备效率 +${Math.round(this.getDongtianBonuses().tribulationGain * 100)}%  |  护劫余裕 ${this.getDongtianBonuses().tribulationShield}  |  角色界面可执行渡劫准备`;
        }
        for (let i = 0; i < MERIT_TASKS.length; i++) {
            const task = MERIT_TASKS[i];
            const title = this.meritTaskRowTitleLabels[i];
            const info = this.meritTaskRowInfoLabels[i];
            const reward = this.meritTaskRowRewardLabels[i];
            const claimBtn = this.meritTaskRowClaimButtons[i];
            const claimLabel = this.meritTaskRowClaimLabels[i];
            if (title) title.string = task.title;
            if (info) info.string = `进度 ${this.getMeritTaskCurrentValue(task)}/${task.target}`;
            if (reward) reward.string = `功勋 +${task.rewardMerit}`;
            if (claimBtn && claimLabel) {
                const claimed = this.meritTaskClaimed[task.id];
                const completed = this.getMeritTaskCurrentValue(task) >= task.target;
                const bg = claimed ? new Color(70, 78, 82, 255) : completed ? new Color(120, 96, 58, 255) : new Color(82, 96, 112, 255);
                const border = claimed ? new Color(142, 150, 156, 180) : completed ? new Color(232, 194, 118, 220) : new Color(164, 192, 216, 180);
                this.repaintPanel(claimBtn, bg, border);
                claimLabel.string = claimed ? '已领' : completed ? '领取' : '未达成';
            }
        }
        for (let i = 0; i < MERIT_SHOP_ITEMS.length; i++) {
            const item = MERIT_SHOP_ITEMS[i];
            const widget = this.meritShopItemWidgets.get(item.id);
            if (!widget) continue;
            const bought = this.meritShopPurchases[item.id] || 0;
            const soldOut = bought >= item.limit;
            widget.stockLabel.string = soldOut ? '已兑尽' : `余量 ${item.limit - bought}/${item.limit}`;
            widget.stockLabel.color = soldOut ? new Color(188, 144, 144, 255) : new Color(196, 204, 214, 255);
            this.repaintPanel(widget.button, soldOut ? new Color(82, 68, 68, 255) : new Color(76, 88, 100, 255), soldOut ? new Color(156, 120, 120, 180) : new Color(166, 192, 216, 180));
            const labels = widget.button.getComponentsInChildren(Label);
            labels.forEach((label) => {
                label.string = soldOut ? '售罄' : '兑换';
                label.color = soldOut ? new Color(214, 188, 188, 255) : new Color(240, 246, 252, 255);
            });
        }
    }

    private getKungfuBonusScale(id: KungfuId): number {
        return 1 + (this.getKungfuLevel(id) - 1) * 0.12;
    }

    private cycleKungfuSelection(step: number) {
        const index = KUNGFU_DEFS.findIndex((def) => def.id === this.selectedKungfuId);
        const nextIndex = (index + step + KUNGFU_DEFS.length) % KUNGFU_DEFS.length;
        this.selectedKungfuId = KUNGFU_DEFS[nextIndex].id;
        this.refreshHomeStatus();
    }

    private equipSelectedKungfu() {
        this.equippedKungfuId = this.selectedKungfuId;
        const def = this.getEquippedKungfuDef();
        this.hintLabel.string = `已运转功法 ${def.name}，功法为唯一替换，当前每秒吐纳 ${this.getCultivationQiPerSecond()} 灵气。`;
        this.refreshHomeStatus();
    }

    private tryUpgradeSelectedKungfu() {
        const def = this.getKungfuDef(this.selectedKungfuId);
        const cost = this.getKungfuUpgradeCost(def.id);
        if (!this.consumeSpiritStoneValue(cost)) {
            this.hintLabel.string = `${def.name} 升级需灵石折值 ${cost}，当前仅有 ${this.getSpiritStoneTotalValue(this.spiritStoneInventory)}。`;
            return;
        }
        this.kungfuLevels[def.id] += 1;
        this.hintLabel.string = `${def.name} 升至 Lv.${this.getKungfuLevel(def.id)}，功法增益提升。`;
        this.refreshHomeStatus();
    }

    private getCultivationQiPerSecond(): number {
        const kungfu = this.getEquippedKungfuDef();
        const bonus = this.getDongtianBonuses();
        return Math.round((20 + kungfu.cultivationQiPerSecond) * this.getKungfuBonusScale(kungfu.id) * (1 + bonus.cultivationRate));
    }

    private getNaturalCultivationGain(): number {
        return Math.max(1, Math.floor(this.getCultivationQiPerSecond() / 100));
    }

    private getAlchemyMasteryNeed(): number {
        return 8 + this.alchemyMasteryLevel * 5;
    }

    private getForgeMasteryNeed(): number {
        return 8 + this.forgeMasteryLevel * 5;
    }

    private getAlchemySuccessRate(): number {
        const kungfu = this.getEquippedKungfuDef();
        const bonus = this.getDongtianBonuses();
        return Math.min(0.98, 0.68 + this.alchemyMasteryLevel * 0.035 + kungfu.alchemySuccessBonus * this.getKungfuBonusScale(kungfu.id) + bonus.alchemySuccess);
    }

    private getForgeSuccessRate(): number {
        const kungfu = this.getEquippedKungfuDef();
        const bonus = this.getDongtianBonuses();
        return Math.min(0.97, 0.62 + this.forgeMasteryLevel * 0.04 + kungfu.forgeSuccessBonus * this.getKungfuBonusScale(kungfu.id) + bonus.forgeSuccess);
    }

    private getAlchemyOutputRange() {
        const kungfu = this.getEquippedKungfuDef();
        const scale = this.getKungfuBonusScale(kungfu.id);
        const bonus = this.getDongtianBonuses();
        const min = 1 + Math.floor((this.alchemyMasteryLevel - 1) / 4) + Math.floor(kungfu.alchemyYieldMinBonus * scale) + Math.floor(bonus.alchemyYield);
        const max = min + 1 + Math.floor(this.alchemyMasteryLevel / 5) + Math.max(0, Math.floor(kungfu.alchemyYieldMaxBonus * scale) - Math.floor(kungfu.alchemyYieldMinBonus * scale));
        return { min, max };
    }

    private grantAlchemyMasteryExp(amount: number): boolean {
        const kungfu = this.getEquippedKungfuDef();
        this.alchemyMasteryExp += Math.max(1, Math.round(amount * (1 + kungfu.alchemyMasteryBonus * this.getKungfuBonusScale(kungfu.id))));
        let leveledUp = false;
        while (this.alchemyMasteryExp >= this.getAlchemyMasteryNeed()) {
            this.alchemyMasteryExp -= this.getAlchemyMasteryNeed();
            this.alchemyMasteryLevel += 1;
            leveledUp = true;
        }
        return leveledUp;
    }

    private grantForgeMasteryExp(amount: number): boolean {
        const kungfu = this.getEquippedKungfuDef();
        this.forgeMasteryExp += Math.max(1, Math.round(amount * (1 + kungfu.forgeMasteryBonus * this.getKungfuBonusScale(kungfu.id))));
        let leveledUp = false;
        while (this.forgeMasteryExp >= this.getForgeMasteryNeed()) {
            this.forgeMasteryExp -= this.getForgeMasteryNeed();
            this.forgeMasteryLevel += 1;
            leveledUp = true;
        }
        return leveledUp;
    }

    private rollForgeQuality() {
        const kungfu = this.getEquippedKungfuDef();
        const scale = this.getKungfuBonusScale(kungfu.id);
        const bonus = this.getDongtianBonuses();
        const r = Math.random();
        const qualityBonus = bonus.forgeQuality;
        const orangeChance = Math.min(0.18 + kungfu.forgeQualityBonus * scale * 0.4 + qualityBonus * 0.2, 0.02 + this.forgeMasteryLevel * 0.008 + kungfu.forgeQualityBonus * scale * 0.35 + qualityBonus * 0.18);
        const purpleChance = Math.min(0.32 + kungfu.forgeQualityBonus * scale * 0.5 + qualityBonus * 0.28, 0.08 + this.forgeMasteryLevel * 0.012 + kungfu.forgeQualityBonus * scale * 0.45 + qualityBonus * 0.22);
        const blueChance = Math.min(0.4 + kungfu.forgeQualityBonus * scale * 0.6 + qualityBonus * 0.34, 0.24 + this.forgeMasteryLevel * 0.01 + kungfu.forgeQualityBonus * scale * 0.55 + qualityBonus * 0.28);
        if (r < orangeChance) return { rarity: 'orange' as Rarity, multiplier: 2.4 };
        if (r < orangeChance + purpleChance) return { rarity: 'purple' as Rarity, multiplier: 1.8 };
        if (r < orangeChance + purpleChance + blueChance) return { rarity: 'blue' as Rarity, multiplier: 1.35 };
        return { rarity: 'green' as Rarity, multiplier: 1 };
    }

    private applyCultivationGain(expGain: number) {
        this.realmExp += expGain;
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
        const gainedSpiritStone = this.addSpiritStoneValue(rewards.spiritStone, 'home');
        this.realmExp += rewards.exp;
        this.mysticCrystal += rewards.mysticCrystal;
        this.dungeonBadge += Math.max(1, Math.floor(milestone / 10));
        this.hintLabel.string = `领取 ${config.label}${milestone} 层宝箱：${this.getSpiritStoneSummary(gainedSpiritStone, 3)}，修为 +${rewards.exp}，秘晶 +${rewards.mysticCrystal}，徽记 +${Math.max(1, Math.floor(milestone / 10))}。`;
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
        this.ensureShopRefreshState();
        this.ensureTaskRefreshState();
        const artifactBonuses = this.getEquippedArtifactBonuses();
        const spiritPetBonuses = this.getEquippedSpiritPetBonuses();
        const kungfu = this.getEquippedKungfuDef();
        const selectedKungfu = this.getKungfuDef(this.selectedKungfuId);
        this.playerMaxHp = 100 + this.realmLevel * 30 + this.shopBonusHp + artifactBonuses.hp + spiritPetBonuses.hp;
        this.playerMaxMana = 70 + this.realmLevel * 18 + this.shopBonusMana + artifactBonuses.mana + spiritPetBonuses.mana;
        this.playerDamage = 16 + this.realmLevel * 7 + this.shopBonusDamage + artifactBonuses.damage + spiritPetBonuses.damage;
        this.actionPointMax = ACTION_POINT_BASE + (this.realmLevel - 1) * 10 + this.shopBonusAction + artifactBonuses.action;
        this.playerHp = Math.min(this.playerHp || this.playerMaxHp, this.playerMaxHp);
        this.playerMana = Math.min(this.playerMana || this.playerMaxMana, this.playerMaxMana);
        const current = this.getDungeonConfig();
        const best = this.dungeonBestDepth[current.id] || 0;
        const milestones = this.getProgressMilestones(current.id);
        const nextUnclaimed = milestones.find((milestone) => !this.claimedProgressChests[this.getProgressChestKey(current.id, milestone)]);
        if (this.homeGoldLabel) this.homeGoldLabel.string = `灵石 ${this.getSpiritStoneItemCount(this.spiritStoneInventory)}枚`;
        if (this.homeDiamondLabel) this.homeDiamondLabel.string = `钻石 ${this.mysticCrystal}`;
        this.statusLabel.string = `${this.getRealmTitle()}`;
        if (this.roleHpLabel) this.roleHpLabel.string = `气血 ${this.playerMaxHp}`;
        if (this.roleManaLabel) this.roleManaLabel.string = `法力 ${this.playerMaxMana}`;
        if (this.roleAttackLabel) this.roleAttackLabel.string = `行动力 ${this.actionPointMax}`;
        if (this.roleExpLabel) this.roleExpLabel.string = `境界进度 ${this.realmExp}/${this.realmExpNeed}`;
        if (this.roleApLabel) this.roleApLabel.string = `丹师 Lv.${this.alchemyMasteryLevel} ${this.alchemyMasteryExp}/${this.getAlchemyMasteryNeed()}`;
        if (this.roleBreakLabel) this.roleBreakLabel.string = `炼器 Lv.${this.forgeMasteryLevel} ${this.forgeMasteryExp}/${this.getForgeMasteryNeed()}`;
        if (this.roleDungeonLabel) {
            this.roleDungeonLabel.string = `渡劫成功率 ${(this.getTribulationSuccessRate() * 100).toFixed(0)}%  |  雷劫伤害 ${this.getThunderDamageAfterFormation()}`;
        }
        if (this.roleDungeonProgressLabel) this.roleDungeonProgressLabel.string = `渡劫准备 ${this.tribulationPrep}/${this.getTribulationPrepNeed()}  |  每次消耗灵石 ${this.getTribulationPrepareStoneCost()}  |  自动调用库存丹药`;
        if (this.kungfuNameLabel) this.kungfuNameLabel.string = `${selectedKungfu.name} Lv.${this.getKungfuLevel(selectedKungfu.id)}${selectedKungfu.id === kungfu.id ? ' · 运转中' : ''}`;
        if (this.kungfuInfoLabel) this.kungfuInfoLabel.string = `${selectedKungfu.title} | 吐纳 ${selectedKungfu.cultivationQiPerSecond}灵气/秒\n${selectedKungfu.summary}`;
        if (this.kungfuEffectLabel) {
            this.kungfuEffectLabel.string = `丹成 +${Math.round(selectedKungfu.alchemySuccessBonus * 100)}% / 出丹 +${selectedKungfu.alchemyYieldMinBonus}-${selectedKungfu.alchemyYieldMaxBonus}\n器成 +${Math.round(selectedKungfu.forgeSuccessBonus * 100)}% / 品质 +${Math.round(selectedKungfu.forgeQualityBonus * 100)}%`;
            this.kungfuEffectLabel.color = selectedKungfu.id === kungfu.id ? new Color(236, 220, 176, 255) : new Color(188, 204, 220, 255);
        }
        const selectedPet = this.getSpiritPetDef(this.selectedSpiritPetId);
        if (this.spiritPetNameLabel) this.spiritPetNameLabel.string = `${selectedPet.name} Lv.${this.getSpiritPetLevel(selectedPet.id)}${this.equippedSpiritPetId === selectedPet.id ? ' · 出战中' : this.spiritPetUnlocked[selectedPet.id] ? '' : ' · 未收服'}`;
        if (this.spiritPetInfoLabel) this.spiritPetInfoLabel.string = `${selectedPet.title}\n${selectedPet.summary}`;
        if (this.spiritPetEffectLabel) this.spiritPetEffectLabel.string = this.getSpiritPetEffectSummary(selectedPet.id);
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

        this.progressChestTitleLabel.string = `${current.label} 进度宝箱`;
        if (nextUnclaimed) {
            const rewards = this.getProgressChestRewards(current, nextUnclaimed);
                this.progressChestInfoLabel.string = `历史最深 ${best}/${current.maxDepth} 层 | ${nextUnclaimed}层奖励：灵石折值+${rewards.spiritStone} 修为+${rewards.exp} 秘晶+${rewards.mysticCrystal}`;
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
        this.refreshFaqiStatus();
        this.refreshShopStatus();
        this.refreshAlchemyPanel();
        this.refreshDongtianPanel();
        this.refreshTaskPanel();
        this.refreshKungfuPanel();
        this.refreshSpiritPetPanel();
    }

    private tryRealmUp() {
        if (this.realmExp < this.realmExpNeed) {
            this.hintLabel.string = `修为不足，需 ${this.realmExpNeed}。可通过功法自然增长、洞天灵机加持或秘境历练获取修为。`;
            return;
        }
        const needPrep = this.getTribulationPrepNeed();
        if (this.tribulationPrep < needPrep) {
            this.hintLabel.string = `渡劫准备不足，需 ${needPrep}，当前仅有 ${this.tribulationPrep}。请前往角色界面点击“渡劫准备”，消耗灵石并自动调用库存丹药。`;
            return;
        }
        const successRate = this.getTribulationSuccessRate();
        const thunderDamage = this.getThunderDamageAfterFormation();
        this.playerHp = Math.max(1, this.playerHp - thunderDamage);
        const shield = this.getDongtianBonuses().tribulationShield;
        this.realmExp -= this.realmExpNeed;
        this.tribulationPrep = Math.max(0, this.tribulationPrep - Math.max(0, needPrep - shield));
        if (Math.random() < successRate) {
            this.realmLevel += 1;
            this.realmExpNeed = 30 + this.realmLevel * 15;
            this.hintLabel.string = `雷劫已渡，成功率 ${(successRate * 100).toFixed(0)}%，承受雷劫伤害 ${thunderDamage}。护山大阵抵消余裕 ${shield}，境界突破成功。`;
            this.refreshHomeStatus();
            this.playerHp = this.playerMaxHp;
            this.playerMana = this.playerMaxMana;
            return;
        }
        this.realmExp += Math.floor(this.realmExpNeed * 0.45);
        this.hintLabel.string = `雷劫未稳，成功率 ${(successRate * 100).toFixed(0)}%，承受雷劫伤害 ${thunderDamage}。护山大阵已削减部分天雷，本次未能突破。`;
        this.refreshHomeStatus();
    }

    private startExpedition() {
        const artifactBonuses = this.getEquippedArtifactBonuses();
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
            materialId: 'ninglucao',
            revealed: true,
            nextIds: [],
        });
        this.currentNodeId = rootId;
        this.pathStack = [];
        this.expeditionSpirit = 0;
        this.expeditionSpiritStoneInventory = createSpiritStoneInventoryRecord();
        this.expeditionHerbs = 0;
        this.expeditionTreasure = 0;
        this.expeditionMaterials = createMaterialInventoryRecord();
        this.expeditionArtifactExp = 0;
        this.expeditionArtifactShards = createArtifactShardRecord();
        this.buffAtkPercent = artifactBonuses.combatAtkPercent;
        this.retreatRatioMultiplier = 1 + artifactBonuses.retreatBonus;
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
            if (type === 'herb' || type === 'stone' || type === 'treasure') {
                const rarity = node.rarity ?? 'green';
                if (type === 'herb') {
                    node.materialId = HERB_MATERIAL_BY_RARITY[rarity];
                } else if (type === 'stone') {
                    node.materialId = STONE_MATERIAL_BY_RARITY[rarity];
                } else {
                    node.rarity = rarity === 'green' ? 'blue' : rarity;
                    node.materialId = Math.random() < 0.5 ? HERB_MATERIAL_BY_RARITY[node.rarity] : STONE_MATERIAL_BY_RARITY[node.rarity];
                }
            }
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

    private getSlotTypeName(type: SlotType, rarity?: Rarity, materialId?: MaterialId): string {
        if (materialId) {
            const def = this.getMaterialDef(materialId);
            return type === 'treasure' ? `珍材·${def.name}` : def.name;
        }
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
    private getSlotMapIcon(type: SlotType, materialId?: MaterialId): string {
        if (materialId) return this.getMaterialDef(materialId).shortName;
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

    private getMaterialSummary(record: Record<MaterialId, number>, maxItems = 3): string {
        const parts: string[] = [];
        for (let i = 0; i < MATERIAL_DEFS.length; i++) {
            const def = MATERIAL_DEFS[i];
            const amount = record[def.id];
            if (amount <= 0) continue;
            parts.push(`${def.shortName} ${amount}`);
        }
        if (parts.length === 0) return '无';
        if (parts.length <= maxItems) return parts.join(' | ');
        return `${parts.slice(0, maxItems).join(' | ')} 等${parts.length}种`;
    }

    private getSpiritStoneQiValue(rarity: Rarity): number {
        return SPIRIT_QI_BY_RARITY[rarity];
    }

    private getSpiritStoneGradeName(rarity: Rarity): string {
        return SPIRIT_STONE_GRADE_NAME[rarity];
    }

    private getSpiritStoneTotalValue(inventory: SpiritStoneInventory = this.spiritStoneInventory): number {
        let total = 0;
        for (let i = 0; i < RARITY_LIST.length; i++) {
            const rarity = RARITY_LIST[i];
            total += inventory[rarity] * this.getSpiritStoneQiValue(rarity);
        }
        return total;
    }

    private rebuildSpiritStoneInventoryFromValue(totalValue: number): SpiritStoneInventory {
        const record = createSpiritStoneInventoryRecord();
        let remain = Math.max(0, Math.floor(totalValue));
        const order: Rarity[] = ['orange', 'purple', 'blue', 'green'];
        for (let i = 0; i < order.length; i++) {
            const rarity = order[i];
            const value = this.getSpiritStoneQiValue(rarity);
            record[rarity] = Math.floor(remain / value);
            remain -= record[rarity] * value;
        }
        return record;
    }

    private syncSpiritStoneCaches() {
        this.spiritStone = this.getSpiritStoneTotalValue(this.spiritStoneInventory);
        this.expeditionSpirit = this.getSpiritStoneTotalValue(this.expeditionSpiritStoneInventory);
    }

    private getSpiritStoneSummary(inventory: SpiritStoneInventory, maxItems = 2): string {
        const parts: string[] = [];
        const order: Rarity[] = ['orange', 'purple', 'blue', 'green'];
        for (let i = 0; i < order.length; i++) {
            const rarity = order[i];
            const count = inventory[rarity];
            if (count <= 0) continue;
            parts.push(`${this.getSpiritStoneGradeName(rarity)}x${count}`);
        }
        if (parts.length === 0) return '无';
        if (parts.length <= maxItems) return parts.join(' | ');
        return `${parts.slice(0, maxItems).join(' | ')} 等${parts.length}档`;
    }

    private getSpiritStoneItemCount(inventory: SpiritStoneInventory = this.spiritStoneInventory): number {
        return inventory.green + inventory.blue + inventory.purple + inventory.orange;
    }

    private addSpiritStoneItems(rarity: Rarity, count: number, target: 'home' | 'expedition' = 'home') {
        if (count <= 0) return;
        const inventory = target === 'home' ? this.spiritStoneInventory : this.expeditionSpiritStoneInventory;
        inventory[rarity] += count;
        this.syncSpiritStoneCaches();
    }

    private addSpiritStoneValue(value: number, target: 'home' | 'expedition' = 'home') {
        if (value <= 0) return createSpiritStoneInventoryRecord();
        const inventory = target === 'home' ? this.spiritStoneInventory : this.expeditionSpiritStoneInventory;
        const merged = this.getSpiritStoneTotalValue(inventory) + value;
        const rebuilt = this.rebuildSpiritStoneInventoryFromValue(merged);
        inventory.green = rebuilt.green;
        inventory.blue = rebuilt.blue;
        inventory.purple = rebuilt.purple;
        inventory.orange = rebuilt.orange;
        this.syncSpiritStoneCaches();
        return rebuilt;
    }

    private consumeSpiritStoneValue(value: number): boolean {
        if (this.getSpiritStoneTotalValue(this.spiritStoneInventory) < value) return false;
        const remain = this.getSpiritStoneTotalValue(this.spiritStoneInventory) - value;
        const rebuilt = this.rebuildSpiritStoneInventoryFromValue(remain);
        this.spiritStoneInventory = rebuilt;
        this.syncSpiritStoneCaches();
        return true;
    }

    private applySpiritStoneRatioToHome(ratio: number): SpiritStoneInventory {
        const gained = createSpiritStoneInventoryRecord();
        for (let i = 0; i < RARITY_LIST.length; i++) {
            const rarity = RARITY_LIST[i];
            const amount = Math.floor(this.expeditionSpiritStoneInventory[rarity] * ratio);
            if (amount <= 0) continue;
            gained[rarity] = amount;
            this.spiritStoneInventory[rarity] += amount;
        }
        this.syncSpiritStoneCaches();
        return gained;
    }

    private getKungfuLevel(id: KungfuId): number {
        return this.kungfuLevels[id] || 1;
    }

    private getKungfuUpgradeCost(id: KungfuId): number {
        const level = this.getKungfuLevel(id);
        return 500 + level * 300;
    }

    private applyMaterialRatioToInventory(ratio: number): Record<MaterialId, number> {
        const gained = createMaterialInventoryRecord();
        for (let i = 0; i < MATERIAL_DEFS.length; i++) {
            const def = MATERIAL_DEFS[i];
            const amount = Math.floor(this.expeditionMaterials[def.id] * ratio);
            if (amount <= 0) continue;
            gained[def.id] = amount;
            this.materialInventory[def.id] += amount;
        }
        return gained;
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
        this.expeditionResLabel.string = `灵石 ${this.getSpiritStoneSummary(this.expeditionSpiritStoneInventory, 2)} | 材料 ${this.getMaterialSummary(this.expeditionMaterials, 2)} | 器经验 ${this.expeditionArtifactExp}${this.buffAtkPercent > 0 ? ' | 攻+' + Math.round(this.buffAtkPercent * 100) + '%' : ''}`;
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
            const text = slot.revealed ? this.getSlotTypeName(slot.type, slot.rarity, slot.materialId) : '？';
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

        this.choiceDiscoverLabel.string = `发现：${this.getSlotTypeName(slot.type, slot.rarity, slot.materialId)}`;
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
        for (let i = 0; i < RARITY_LIST.length; i++) {
            const rarity = RARITY_LIST[i];
            this.expeditionSpiritStoneInventory[rarity] = Math.floor(this.expeditionSpiritStoneInventory[rarity] * (1 - pct));
        }
        this.syncSpiritStoneCaches();
        this.expeditionHerbs = Math.floor(this.expeditionHerbs * (1 - pct));
        this.expeditionTreasure = Math.floor(this.expeditionTreasure * (1 - pct));
        for (let i = 0; i < MATERIAL_DEFS.length; i++) {
            const def = MATERIAL_DEFS[i];
            this.expeditionMaterials[def.id] = Math.floor(this.expeditionMaterials[def.id] * (1 - pct));
        }
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
                const materialId = slot.materialId ?? HERB_MATERIAL_BY_RARITY[slot.rarity ?? 'green'];
                const gain = Math.max(1, Math.floor((4 + Math.floor(depth / 4)) * mul));
                this.expeditionHerbs += gain;
                this.expeditionMaterials[materialId] += gain;
                this.addExpeditionArtifactProgress(depth, Math.max(1, Math.floor(2 * mul)), 0);
                break;
            }
            case 'stone': {
                const rarity = slot.rarity ?? 'green';
                const mul = rarityMul * this.getDungeonLootMultiplier('stone');
                const materialId = slot.materialId ?? STONE_MATERIAL_BY_RARITY[slot.rarity ?? 'green'];
                const gain = Math.max(1, Math.floor((3 + Math.floor(depth / 8)) * mul));
                this.addSpiritStoneItems(rarity, gain, 'expedition');
                this.expeditionMaterials[materialId] += gain;
                this.addExpeditionArtifactProgress(depth, Math.max(1, Math.floor(2 * mul)), 0);
                this.hintLabel.string = `采得${this.getSpiritStoneGradeName(rarity)} x${gain}。`;
                break;
            }
            case 'treasure': {
                const mul = rarityMul * this.getDungeonLootMultiplier('treasure');
                const materialId = slot.materialId ?? (Math.random() < 0.5 ? HERB_MATERIAL_BY_RARITY[slot.rarity ?? 'orange'] : STONE_MATERIAL_BY_RARITY[slot.rarity ?? 'orange']);
                const gain = Math.max(2, Math.floor((2 + depth / 10) * mul));
                this.addSpiritStoneItems(slot.rarity ?? 'blue', Math.max(1, Math.floor((1 + depth / 20) * mul)), 'expedition');
                this.expeditionHerbs += Math.max(1, Math.floor((6 + Math.floor(depth / 4)) * mul));
                this.expeditionTreasure += Math.max(2, Math.floor(2 * mul));
                this.expeditionMaterials[materialId] += gain;
                this.addExpeditionArtifactProgress(depth, Math.max(4, Math.floor(8 * mul)), 1);
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
        this.addTaskProgress('daily_expedition_complete', 1);
        this.addTaskProgress('mainline_first_withdraw', 1);
        this.addMeritTaskProgress('merit_expedition', 1);
        this.recordDungeonProgress();
        this.state = 'result';
        this.expeditionLayer.active = false;
        this.resultLayer.active = true;

        let ratio = safe ? 1 : Math.min(1, 0.8 + (this.getCurrentDepth() - 1) * 0.003);
        ratio *= this.retreatRatioMultiplier;
        const takenSpiritStone = this.applySpiritStoneRatioToHome(ratio);
        const takenMaterials = this.applyMaterialRatioToInventory(ratio);
        const takeHerbs = Math.floor(this.expeditionHerbs * ratio);
        const takeTreasure = Math.floor(this.expeditionTreasure * ratio);
        const expBase = this.expeditionHerbs * EXP_PER_HERB + this.expeditionTreasure * EXP_PER_TREASURE;
        const takeExp = Math.floor(expBase * ratio);
        const artifactBonuses = this.getEquippedArtifactBonuses();
        const takeBadge = Math.max(1, Math.floor(takeTreasure * 0.6 * (1 + artifactBonuses.badgeMultiplier)));
        const faqiRewards = this.applyExpeditionArtifactRewards(ratio * (1 + artifactBonuses.rewardMultiplier));

        this.realmExp += takeExp;
        this.dungeonBadge += takeBadge;

        const dungeon = this.getDungeonConfig();
        const ratioPct = (ratio * 100).toFixed(0);
        this.resultLabel.string = safe
            ? `${dungeon.label} 安全撤离（击败Boss）\n深度 ${this.getCurrentDepth()}/${dungeon.maxDepth}\n带走灵石 ${this.getSpiritStoneSummary(takenSpiritStone, 3)}，材料 ${this.getMaterialSummary(takenMaterials, 3)}\n修为 +${takeExp}，徽记 +${takeBadge}，法器经验 +${faqiRewards.expGain}\n${faqiRewards.shardText}`
            : `${dungeon.label} 紧急撤离（带走 ${ratioPct}%）\n深度 ${this.getCurrentDepth()}/${dungeon.maxDepth}\n带走灵石 ${this.getSpiritStoneSummary(takenSpiritStone, 3)}，材料 ${this.getMaterialSummary(takenMaterials, 3)}\n修为 +${takeExp}，徽记 +${takeBadge}，法器经验 +${faqiRewards.expGain}\n${faqiRewards.shardText}`;
    }

    private endExpedition(reachedExit: boolean) {
        this.addTaskProgress('daily_expedition_complete', 1);
        this.addTaskProgress('mainline_first_withdraw', 1);
        this.addMeritTaskProgress('merit_expedition', 1);
        this.recordDungeonProgress();
        this.state = 'result';
        this.expeditionLayer.active = false;
        this.resultLayer.active = true;
        const gainedSpiritStone = this.applySpiritStoneRatioToHome(1);
        const gainedMaterials = this.applyMaterialRatioToInventory(1);
        const expGain = this.expeditionHerbs * EXP_PER_HERB + this.expeditionTreasure * EXP_PER_TREASURE + (reachedExit ? 100 : 0);
        const artifactBonuses = this.getEquippedArtifactBonuses();
        const badgeGain = Math.max(1, Math.floor((this.expeditionTreasure * 0.8 + (reachedExit ? 4 : 0)) * (1 + artifactBonuses.badgeMultiplier)));
        const faqiRewards = this.applyExpeditionArtifactRewards(1 + artifactBonuses.rewardMultiplier);
        this.realmExp += expGain;
        this.dungeonBadge += badgeGain;
        const dungeon = this.getDungeonConfig();
        this.resultLabel.string = `${dungeon.label}\n深度 ${this.getCurrentDepth()}/${dungeon.maxDepth}\n获得灵石 ${this.getSpiritStoneSummary(gainedSpiritStone, 3)}，材料 ${this.getMaterialSummary(gainedMaterials, 3)}\n修为 +${expGain}，徽记 +${badgeGain}，法器经验 +${faqiRewards.expGain}\n${faqiRewards.shardText}\n${reachedExit ? `通关${dungeon.maxDepth}层！` : '已撤出秘境'}`;
    }

    private endExpeditionDeath() {
        this.addTaskProgress('daily_expedition_complete', 1);
        this.recordDungeonProgress();
        this.state = 'result';
        this.expeditionLayer.active = false;
        this.lotteryLayer.active = false;
        this.resultLayer.active = true;
        const gainedSpiritStone = this.applySpiritStoneRatioToHome(0.7);
        const gainedMaterials = this.applyMaterialRatioToInventory(0.5);
        this.realmExp += Math.floor((this.expeditionHerbs * EXP_PER_HERB + this.expeditionTreasure * EXP_PER_TREASURE) * 0.5);
        const artifactBonuses = this.getEquippedArtifactBonuses();
        const badgeGain = Math.max(1, Math.floor(this.expeditionTreasure * 0.35 * (1 + artifactBonuses.badgeMultiplier)));
        const faqiRewards = this.applyExpeditionArtifactRewards(0.5 + artifactBonuses.rewardMultiplier * 0.5);
        this.dungeonBadge += badgeGain;
        const dungeon = this.getDungeonConfig();
        this.resultLabel.string = `神识受损，撤回避难洞府\n${dungeon.label} 深度 ${this.getCurrentDepth()}/${dungeon.maxDepth}\n保留部分收获：灵石 ${this.getSpiritStoneSummary(gainedSpiritStone, 3)}，材料 ${this.getMaterialSummary(gainedMaterials, 3)}，修为 +${Math.floor((this.expeditionHerbs * EXP_PER_HERB + this.expeditionTreasure * EXP_PER_TREASURE) * 0.5)}，徽记 +${badgeGain}，法器经验 +${faqiRewards.expGain}\n${faqiRewards.shardText}`;
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
        if (this.state === 'home') {
            this.cultivationTick += dt;
            this.cultivationQiProgress += this.getCultivationQiPerSecond() * dt;
            let gainedExp = 0;
            while (this.cultivationQiProgress >= 100) {
                this.cultivationQiProgress -= 100;
                gainedExp += 1;
            }
            if (gainedExp > 0) {
                this.applyCultivationGain(gainedExp);
            }
            if (gainedExp > 0 && this.cultivationTick >= NATURAL_CULTIVATION_INTERVAL) {
                this.cultivationTick = 0;
                this.refreshHomeStatus();
            }
            if (this.homeTab === 'role') {
                this.animateHomeRoleRig();
            }
        }
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

    private animateHomeRoleRig() {
        if (!this.homeRoleRig) return;
        const r = this.homeRoleRig;
        const t = game.totalTime / 1000;
        const idle = Math.sin(t * 2.1) * 0.08;
        const auraPulse = 1 + Math.sin(t * 1.8) * 0.05;
        const auraPulseInner = 1 + Math.cos(t * 2.2) * 0.08;
        const sway = Math.sin(t * 1.4) * 2.2;
        r.root.angle = sway * 0.35;
        r.root.setPosition(0, 8 + Math.sin(t * 1.6) * 2.4, 0);
        r.body.node.angle = 4 + idle * 8;
        r.head.node.angle = -2 - idle * 6;
        r.armL.node.angle = -62 + sway * 0.8;
        r.armR.node.angle = 62 - sway * 0.8;
        r.legL.node.angle = -112 - sway * 0.4;
        r.legR.node.angle = 112 + sway * 0.4;
        if (this.homeRoleAuraOuter) {
            this.homeRoleAuraOuter.angle = t * 8;
            this.homeRoleAuraOuter.setScale(new Vec3(auraPulse, auraPulse, 1));
        }
        if (this.homeRoleAuraInner) {
            this.homeRoleAuraInner.angle = -t * 14;
            this.homeRoleAuraInner.setScale(new Vec3(auraPulseInner, auraPulseInner, 1));
        }
        if (this.homeRolePedestal) {
            this.homeRolePedestal.setScale(new Vec3(1 + Math.sin(t * 1.5) * 0.025, 1, 1));
            this.homeRolePedestal.setPosition(0, -40 + Math.sin(t * 1.3) * 1.5, 0);
        }
        if (this.homeRoleRibbonLeft) {
            this.homeRoleRibbonLeft.angle = -10 + Math.sin(t * 1.7) * 5;
            this.homeRoleRibbonLeft.setPosition(-82, -6 + Math.sin(t * 1.7) * 4, 0);
        }
        if (this.homeRoleRibbonRight) {
            this.homeRoleRibbonRight.angle = 10 - Math.cos(t * 1.6) * 5;
            this.homeRoleRibbonRight.setPosition(82, -6 + Math.cos(t * 1.6) * 4, 0);
        }
        for (let i = 0; i < this.homeRoleSparkles.length; i++) {
            const sparkle = this.homeRoleSparkles[i];
            const phase = t * (1.1 + i * 0.2) + i * 0.9;
            const baseX = i === 0 ? -54 : i === 1 ? 0 : 56;
            const baseY = i === 0 ? 52 : i === 1 ? 76 : 44;
            sparkle.angle = phase * 32;
            sparkle.setPosition(baseX + Math.sin(phase) * 6, baseY + Math.cos(phase * 1.3) * 8, 0);
            const scale = (i === 0 ? 1 : i === 1 ? 0.85 : 1.1) + Math.sin(phase * 1.8) * 0.08;
            sparkle.setScale(new Vec3(scale, scale, 1));
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
                        this.addSpiritStoneValue(Math.max(1, Math.floor((24 + Math.floor(depth / 2)) * combatRewardMul)), 'expedition');
                        this.expeditionHerbs += Math.max(1, Math.floor(4 * combatRewardMul));
                        this.addExpeditionArtifactProgress(depth, Math.max(4, Math.floor(7 * combatRewardMul)), 1);
                    }
                    slot.triggered = true;
                    this.advanceToNode(slot.id);
                    advanced = true;
                } else if (this.combatIsBoss) {
                    if (!slot.triggered) {
                        const depth = slot.depth;
                        slot.triggered = true;
                        this.addTaskProgress('weekly_boss_defeat', 1);
                        this.addSpiritStoneValue(Math.max(1, Math.floor((60 + depth * 4) * combatRewardMul)), 'expedition');
                        this.expeditionHerbs += Math.max(1, Math.floor((10 + Math.floor(depth / 4)) * combatRewardMul));
                        this.expeditionTreasure += Math.max(2, Math.floor(4 * combatRewardMul));
                        this.addExpeditionArtifactProgress(depth, Math.max(10, Math.floor(16 * combatRewardMul)), 2);
                        const petDrop = this.tryRollSpiritPetDrop();
                        if (petDrop) {
                            this.hintLabel.string = `击败 Boss 后异象浮现，你收服了灵宠 ${petDrop.name}。`;
                        }
                    }
                    advanced = true;
                } else if (!slot.triggered) {
                    slot.triggered = true;
                    const depth = slot.depth;
                    this.addSpiritStoneValue(Math.max(1, Math.floor((18 + Math.floor(depth / 3)) * combatRewardMul)), 'expedition');
                    this.expeditionHerbs += Math.max(1, Math.floor(3 * combatRewardMul));
                    this.addExpeditionArtifactProgress(depth, Math.max(3, Math.floor(5 * combatRewardMul)), 0);
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
                for (let i = 0; i < RARITY_LIST.length; i++) {
                    const rarity = RARITY_LIST[i];
                    this.expeditionSpiritStoneInventory[rarity] = Math.floor(this.expeditionSpiritStoneInventory[rarity] * 0.5);
                }
                this.syncSpiritStoneCaches();
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

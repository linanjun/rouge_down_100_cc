import { AlchemyWorkshopPage } from './AlchemyWorkshopPage';
import { DongtianOverviewPage } from './DongtianOverviewPage';
import { FaqiOverviewPage } from './FaqiOverviewPage';
import { FishingOverviewPage } from './FishingOverviewPage';
import { KungfuOverviewPage } from './KungfuOverviewPage';
import { MijingOverviewPage } from './MijingOverviewPage';
import { RoleOverviewPage } from './RoleOverviewPage';
import { ShopOverviewPage } from './ShopOverviewPage';
import { SpiritPetOverviewPage } from './SpiritPetOverviewPage';
import { TaskOverviewPage } from './TaskOverviewPage';

export type OverviewPageId = 'role' | 'faqi' | 'mijing' | 'dongtian' | 'fishing' | 'shop' | 'task' | 'alchemy' | 'kungfu' | 'pet';
export type FaqiSlot = 'sword' | 'talisman' | 'lamp';
export type DungeonMode = 'normal' | 'elite';
export type DongtianTab = 'cave' | 'merit';
export type GoldTab = 'daily' | 'weekly';
export type AlchemyTab = 'furnace' | 'formula' | 'storehouse' | 'forge';
export type TaskTab = 'daily' | 'weekly' | 'achievement' | 'mainline';

type ArtifactCard = {
    id: string;
    slot: FaqiSlot;
    glyph: string;
    name: string;
    level: number;
    star: number;
    shards: number;
    equipped: boolean;
    unlocked: boolean;
    effect: string;
};

type DungeonData = {
    id: string;
    label: string;
    bestDepth: number;
    maxDepth: number;
    available: boolean;
    chestClaimed: boolean[];
};

type BuildingData = {
    id: string;
    glyph: string;
    title: string;
    level: number;
    info: string;
    nextCost: string;
};

type MeritTaskData = {
    id: string;
    title: string;
    progress: string;
    reward: string;
    claimed: boolean;
};

type MeritShopData = {
    id: string;
    title: string;
    cost: string;
    info: string;
    stock: number;
    maxStock: number;
};

type FishingSlotData = {
    unlocked: boolean;
    targetId: string | null;
};

type FishingTargetData = {
    id: string;
    title: string;
    info: string;
};

type ShopItemData = {
    id: string;
    title: string;
    price: string;
    desc: string;
    stock: number;
    maxStock: number;
};

type TaskRowData = {
    id: string;
    badge: string;
    title: string;
    info: string;
    reward: string;
    action: string;
    active: boolean;
};

type AlchemyRecipeData = {
    id: string;
    title: string;
    info: string;
    state: string;
    detailInfo: string;
    cost: string;
    output: string;
    crafted: number;
};

type MaterialData = {
    id: string;
    title: string;
    kind: string;
    count: number;
};

type KungfuData = {
    id: string;
    title: string;
    subtitle: string;
    level: number;
    effect: string;
    running: boolean;
};

type SpiritPetData = {
    id: string;
    title: string;
    info: string;
    effect: string;
    level: number;
    deployed: boolean;
};

export type OverviewPageViews = {
    rolePage: RoleOverviewPage | null;
    faqiPage: FaqiOverviewPage | null;
    mijingPage: MijingOverviewPage | null;
    dongtianPage: DongtianOverviewPage | null;
    fishingPage: FishingOverviewPage | null;
    shopPage: ShopOverviewPage | null;
    taskPage: TaskOverviewPage | null;
    alchemyPage: AlchemyWorkshopPage | null;
    kungfuPage: KungfuOverviewPage | null;
    spiritPetPage: SpiritPetOverviewPage | null;
};

export class OverviewPagesDataSource {
    private views: OverviewPageViews | null = null;
    private navigate: ((page: OverviewPageId) => void) | null = null;

    private spiritStone = 1280;
    private mysticCrystal = 64;
    private merit = 86;
    private artifactExp = 240;
    private realmIndex = 0;
    private realmExp = 24;
    private realmExpNeed = 30;
    private selectedArtifactSlot: FaqiSlot = 'sword';
    private selectedArtifactId = 'qingshuang';
    private dungeonMode: DungeonMode = 'normal';
    private selectedDungeonId = 'qi';
    private dongtianTab: DongtianTab = 'cave';
    private goldTab: GoldTab = 'daily';
    private selectedFishingSlot = 0;
    private baitCount = 3;
    private rodTier = 1;
    private selectedAlchemyTab: AlchemyTab = 'furnace';
    private selectedAlchemyDetailId = 'pill1';
    private selectedTaskTab: TaskTab = 'daily';
    private selectedKungfuId = 'k1';
    private selectedPetId = 'p1';
    private taskRows: TaskRowData[] = [
        { id: 'task1', badge: '1', title: '秘境三次', info: '进度 2/3', reward: '奖励: 灵石 +120', action: '推进中', active: false },
        { id: 'task2', badge: '2', title: '商城购买', info: '进度 1/1', reward: '奖励: 修为 +20', action: '可领取', active: true },
        { id: 'task3', badge: '3', title: '法器升级', info: '进度 0/1', reward: '奖励: 徽记 +6', action: '未达成', active: false },
    ];
    private artifacts: ArtifactCard[] = [
        { id: 'qingshuang', slot: 'sword', glyph: '剑', name: '青霜剑', level: 2, star: 1, shards: 6, equipped: true, unlocked: true, effect: '术攻 +8 | 局内攻势 +5%' },
        { id: 'lihuo', slot: 'sword', glyph: '剑', name: '离火剑', level: 1, star: 1, shards: 3, equipped: false, unlocked: true, effect: '暴击 +4% | 焚伤 +1' },
        { id: 'xuanjia', slot: 'talisman', glyph: '符', name: '玄甲符', level: 2, star: 1, shards: 4, equipped: true, unlocked: true, effect: '气血 +20 | 护盾 +6%' },
        { id: 'huiyuan', slot: 'talisman', glyph: '符', name: '回元符', level: 1, star: 1, shards: 5, equipped: false, unlocked: true, effect: '法力回复 +8% | 回炁 +1' },
        { id: 'xunbao', slot: 'lamp', glyph: '灯', name: '寻宝灯', level: 1, star: 1, shards: 7, equipped: true, unlocked: true, effect: '掉落加成 +5% | 宝箱视野 +1' },
        { id: 'guixi', slot: 'lamp', glyph: '灯', name: '归息灯', level: 1, star: 1, shards: 2, equipped: false, unlocked: false, effect: '撤离返还 +8% | 恢复 +1' },
    ];
    private dungeons: DungeonData[] = [
        { id: 'qi', label: '练气秘境', bestDepth: 22, maxDepth: 100, available: true, chestClaimed: [true, true, true, true, false, false, false, false, false, false] },
        { id: 'zhuji', label: '筑基秘境', bestDepth: 8, maxDepth: 100, available: true, chestClaimed: [true, false, false, false, false, false, false, false, false, false] },
        { id: 'jindan', label: '金丹秘境', bestDepth: 0, maxDepth: 100, available: false, chestClaimed: [false, false, false, false, false, false, false, false, false, false] },
        { id: 'yuanying', label: '元婴秘境', bestDepth: 0, maxDepth: 100, available: false, chestClaimed: [false, false, false, false, false, false, false, false, false, false] },
    ];
    private buildings: BuildingData[] = [
        { id: 'alchemy', glyph: '丹', title: '丹火室', level: 1, info: '提升丹成率与丹药产出。', nextCost: '灵石 80 | 徽记 10 | 灵草 x2' },
        { id: 'forge', glyph: '器', title: '百炼台', level: 1, info: '提升炼器成功率与品质。', nextCost: '灵石 80 | 徽记 10 | 灵矿 x2' },
        { id: 'gather', glyph: '心', title: '清心台', level: 2, info: '提高静修与破境稳定度。', nextCost: '灵石 120 | 徽记 16 | 木精 x2' },
        { id: 'ward', glyph: '阵', title: '护山大阵', level: 2, info: '提高破境护持与洞天稳固。', nextCost: '灵石 120 | 徽记 16 | 阵纹 x2' },
    ];
    private meritTasks: MeritTaskData[] = [
        { id: 'task1', title: '洞天巡检', progress: '进度 1/1', reward: '功勋 +20', claimed: false },
        { id: 'task2', title: '炼丹三炉', progress: '进度 2/3', reward: '功勋 +18', claimed: false },
        { id: 'task3', title: '秘境三十层', progress: '进度 22/30', reward: '功勋 +30', claimed: false },
    ];
    private meritShopItems: MeritShopData[] = [
        { id: 'shop1', title: '洞天补给', cost: '功勋 30', info: '灵石折值 +120', stock: 1, maxStock: 2 },
        { id: 'shop2', title: '悟道补给', cost: '功勋 40', info: '功法感悟 +1 次', stock: 1, maxStock: 1 },
        { id: 'shop3', title: '巡守令', cost: '功勋 50', info: '徽记 +12', stock: 2, maxStock: 2 },
    ];
    private fishingSlots: FishingSlotData[] = [
        { unlocked: true, targetId: 't2' },
        { unlocked: true, targetId: null },
        { unlocked: false, targetId: null },
        { unlocked: false, targetId: null },
    ];
    private fishingTargets: FishingTargetData[] = [
        { id: 't1', title: '散修甲 · 游侠', info: '练气 5  |  反哺 18%' },
        { id: 't2', title: '散修乙 · 隐士', info: '练气 7  |  反哺 20%' },
        { id: 't3', title: '散修丙 · 剑客', info: '筑基 1  |  反哺 22%' },
        { id: 't4', title: '散修丁 · 医修', info: '练气 9  |  反哺 16%' },
        { id: 't5', title: '散修戊 · 丹师', info: '筑基 2  |  反哺 24%' },
        { id: 't6', title: '散修己 · 行者', info: '筑基 3  |  反哺 26%' },
    ];
    private dailyShopItems: ShopItemData[] = [
        { id: 'gd1', title: '气血丹包', price: '灵石 120', desc: '气血上限 +20', stock: 1, maxStock: 1 },
        { id: 'gd2', title: '回炁丸包', price: '灵石 120', desc: '法力上限 +16', stock: 1, maxStock: 1 },
        { id: 'gd3', title: '修为包', price: '灵石 160', desc: '修为 +20', stock: 2, maxStock: 2 },
        { id: 'gd4', title: '法器包', price: '灵石 180', desc: '法器经验 +30', stock: 1, maxStock: 1 },
    ];
    private weeklyShopItems: ShopItemData[] = [
        { id: 'gw1', title: '周常洞府包', price: '灵石 500', desc: '灵石折值 +400', stock: 1, maxStock: 1 },
        { id: 'gw2', title: '周常成长包', price: '灵石 680', desc: '修为 +80', stock: 1, maxStock: 1 },
    ];
    private mijingShopItems: ShopItemData[] = [
        { id: 'mj1', title: '巡守令', price: '徽记 40', desc: '徽记资源补给', stock: 1, maxStock: 1 },
        { id: 'mj2', title: '灵矿箱', price: '徽记 32', desc: '材料补给', stock: 2, maxStock: 2 },
    ];
    private diamondShopItems: ShopItemData[] = [
        { id: 'di1', title: '秘晶福袋', price: '钻石 20', desc: '秘晶 +20', stock: 99, maxStock: 99 },
        { id: 'di2', title: '成长礼包', price: '钻石 30', desc: '修为 +120', stock: 99, maxStock: 99 },
    ];
    private alchemyRecipes: AlchemyRecipeData[] = [
        { id: 'pill1', title: '聚气丹', info: '修为 +20  |  灵草 x2', state: '库存 1 枚 · 回元', detailInfo: '以温养经脉为主，适合前期开炉补给。', cost: '耗材: 灵草 x2  |  灵石 80', output: '丹成效果: 修为 +20  |  成功率 78%  |  出丹 1-2  |  库存 1', crafted: 1 },
        { id: 'pill2', title: '凝神丹', info: '法力 +18  |  灵草 x3', state: '库存 0 枚 · 清明', detailInfo: '适合补足法力缺口，兼顾长线历练。', cost: '耗材: 灵草 x3  |  灵石 100', output: '丹成效果: 法力 +18  |  成功率 72%  |  出丹 1  |  库存 0', crafted: 0 },
        { id: 'pill3', title: '护脉丹', info: '气血 +26  |  灵草 x4', state: '库存 0 枚 · 固元', detailInfo: '适合准备高压秘境前保命使用。', cost: '耗材: 灵草 x4  |  灵石 120', output: '丹成效果: 气血 +26  |  成功率 70%  |  出丹 1  |  库存 0', crafted: 0 },
        { id: 'pill4', title: '悟道丹', info: '感悟 +1  |  灵草 x5', state: '库存 0 枚 · 开悟', detailInfo: '用于主修功法升阶前的集中参悟。', cost: '耗材: 灵草 x5  |  灵石 150', output: '丹成效果: 感悟 +1  |  成功率 64%  |  出丹 1  |  库存 0', crafted: 0 },
    ];
    private forgeRecipes: AlchemyRecipeData[] = [
        { id: 'forge1', title: '养器匣', info: '法器经验 +40  |  灵矿 x3', state: '已成 0 件 · 藏锋', detailInfo: '适合法器过渡期快速提级。', cost: '耗材: 灵矿 x3  |  灵石 100', output: '锻成效果: 法器经验 +40  |  成功率 76%  |  成品 1  |  库存 0', crafted: 0 },
        { id: 'forge2', title: '护身佩', info: '气血 +28  |  灵矿 x4', state: '已成 0 件 · 守御', detailInfo: '用于洞天与秘境前期的防御补位。', cost: '耗材: 灵矿 x4  |  灵石 130', output: '锻成效果: 气血 +28  |  成功率 68%  |  成品 1  |  库存 0', crafted: 0 },
        { id: 'forge3', title: '行炁环', info: '法力 +20  |  灵矿 x4', state: '已成 0 件 · 回炁', detailInfo: '偏向续航，适合法修路线。', cost: '耗材: 灵矿 x4  |  灵石 130', output: '锻成效果: 法力 +20  |  成功率 68%  |  成品 1  |  库存 0', crafted: 0 },
    ];
    private materials: MaterialData[] = [
        { id: 'm1', title: '月华草', kind: '凡品灵植', count: 5 },
        { id: 'm2', title: '赤炎花', kind: '良品灵植', count: 2 },
        { id: 'm3', title: '玄铁砂', kind: '凡品灵矿', count: 6 },
        { id: 'm4', title: '星纹石', kind: '良品灵矿', count: 3 },
        { id: 'm5', title: '灵木心', kind: '珍品灵植', count: 1 },
        { id: 'm6', title: '乌金晶', kind: '珍品灵矿', count: 1 },
        { id: 'm7', title: '清露叶', kind: '凡品灵植', count: 4 },
        { id: 'm8', title: '寒髓矿', kind: '良品灵矿', count: 2 },
    ];
    private kungfus: KungfuData[] = [
        { id: 'k1', title: '清心诀', subtitle: '静守心神', level: 1, effect: '丹成 +4% / 出丹 +0-1\n器成 +2% / 品质 +3%', running: true },
        { id: 'k2', title: '长青功', subtitle: '木行吐纳', level: 1, effect: '气血恢复 +5% / 灵植掉落 +6%', running: false },
        { id: 'k3', title: '金焰篇', subtitle: '火行运炁', level: 1, effect: '炼丹成功率 +6% / 术攻 +4%', running: false },
        { id: 'k4', title: '玄脉录', subtitle: '脉行调息', level: 1, effect: '法力回复 +8% / 秘境续航 +5%', running: false },
    ];
    private spiritPets: SpiritPetData[] = [
        { id: 'p1', title: '青羽雀', info: '风羽灵雀', effect: '气血 +24  |  行动力 +2  |  秘境收益 +6%', level: 1, deployed: true },
        { id: 'p2', title: '赤焰狐', info: '火系灵狐', effect: '术攻 +8  |  焚伤 +1  |  炼丹收益 +4%', level: 1, deployed: false },
        { id: 'p3', title: '石背龟', info: '土系灵龟', effect: '减伤 +4%  |  护盾 +10  |  撤离返还 +6%', level: 1, deployed: false },
    ];

    public attachViews(views: OverviewPageViews) {
        this.views = views;
    }

    public setNavigator(navigate: (page: OverviewPageId) => void) {
        this.navigate = navigate;
    }

    public refreshAllPages() {
        this.refreshRolePage();
        this.refreshFaqiPage();
        this.refreshMijingPage();
        this.refreshDongtianPage();
        this.refreshFishingPage();
        this.refreshShopPage();
        this.refreshTaskPage();
        this.refreshAlchemyPage();
        this.refreshKungfuPage();
        this.refreshSpiritPetPage();
    }

    public handleCommonTabClick(tabId: string) {
        if (tabId === 'role' || tabId === 'faqi' || tabId === 'mijing' || tabId === 'dongtian' || tabId === 'fishing') {
            this.navigate?.(tabId);
        }
    }

    public handleCommonShortcutClick(shortcutId: string) {
        if (shortcutId === 'task' || shortcutId === 'shop' || shortcutId === 'kungfu' || shortcutId === 'pet') {
            this.navigate?.(shortcutId === 'pet' ? 'pet' : shortcutId as OverviewPageId);
            return;
        }
        if (shortcutId === 'alchemy') {
            this.selectedAlchemyTab = 'furnace';
            this.refreshAlchemyPage();
            this.navigate?.('alchemy');
            return;
        }
        if (shortcutId === 'forge') {
            this.selectedAlchemyTab = 'forge';
            this.refreshAlchemyPage();
            this.navigate?.('alchemy');
        }
    }

    public handleRoleArtifactClick(slot: FaqiSlot) {
        this.selectedArtifactSlot = slot;
        this.selectFirstArtifactInSlot(slot);
        this.refreshFaqiPage();
        this.navigate?.('faqi');
    }

    public handleRoleBreakthroughClick() {
        if (this.realmExp >= this.realmExpNeed) {
            this.realmIndex = Math.min(this.realmIndex + 1, this.getRealmTitles().length - 1);
            this.realmExp = 0;
            this.realmExpNeed += 18;
        } else {
            this.realmExp = this.realmExpNeed;
        }
        this.refreshRolePage();
        this.refreshMijingPage();
        this.refreshFishingPage();
    }

    public handleFaqiSlotClick(slot: FaqiSlot) {
        this.selectedArtifactSlot = slot;
        this.selectFirstArtifactInSlot(slot);
        this.refreshFaqiPage();
    }

    public handleFaqiCardClick(artifactId: string) {
        this.selectedArtifactId = artifactId;
        const artifact = this.getSelectedArtifact();
        if (artifact) this.selectedArtifactSlot = artifact.slot;
        this.refreshFaqiPage();
    }

    public handleFaqiPrimaryClick() {
        const selected = this.getSelectedArtifact();
        if (!selected || !selected.unlocked) return;
        const sameSlot = this.artifacts.filter((artifact) => artifact.slot === selected.slot);
        const shouldEquip = !selected.equipped;
        sameSlot.forEach((artifact) => { artifact.equipped = false; });
        selected.equipped = shouldEquip;
        this.refreshRolePage();
        this.refreshFaqiPage();
    }

    public handleFaqiUpgradeClick() {
        const selected = this.getSelectedArtifact();
        if (!selected || !selected.unlocked || this.artifactExp < 30) return;
        this.artifactExp -= 30;
        selected.level += 1;
        this.refreshRolePage();
        this.refreshFaqiPage();
    }

    public handleFaqiStarClick() {
        const selected = this.getSelectedArtifact();
        if (!selected || !selected.unlocked || selected.shards < 4) return;
        selected.shards -= 4;
        selected.star += 1;
        this.refreshRolePage();
        this.refreshFaqiPage();
    }

    public handleMijingModeClick(mode: DungeonMode) {
        this.dungeonMode = mode;
        this.refreshMijingPage();
    }

    public handleMijingDungeonClick(dungeonId: string) {
        this.selectedDungeonId = dungeonId;
        this.refreshMijingPage();
        this.refreshRolePage();
    }

    public handleMijingChestClick(index: number) {
        const dungeon = this.getSelectedDungeon();
        if (!dungeon || dungeon.bestDepth < (index + 1) * 5 || dungeon.chestClaimed[index]) return;
        dungeon.chestClaimed[index] = true;
        this.spiritStone += 60;
        this.realmExp += 8;
        this.refreshRolePage();
        this.refreshMijingPage();
        this.refreshShopPage();
    }

    public handleMijingEnterClick() {
        const dungeon = this.getSelectedDungeon();
        if (!dungeon || !dungeon.available) return;
        dungeon.bestDepth = Math.min(dungeon.bestDepth + (this.dungeonMode === 'elite' ? 6 : 4), dungeon.maxDepth);
        this.realmExp = Math.min(this.realmExp + (this.dungeonMode === 'elite' ? 12 : 8), this.realmExpNeed);
        this.spiritStone += this.dungeonMode === 'elite' ? 90 : 60;
        this.refreshRolePage();
        this.refreshMijingPage();
        this.refreshTaskPage();
    }

    public handleDongtianTabClick(tab: DongtianTab) {
        this.dongtianTab = tab;
        this.refreshDongtianPage();
    }

    public handleDongtianBuildingClick(buildingId: string) {
        const building = this.buildings.find((entry) => entry.id === buildingId);
        if (!building || this.spiritStone < 80 || this.merit < 10) return;
        this.spiritStone -= 80;
        this.merit -= 10;
        building.level += 1;
        this.refreshDongtianPage();
        this.refreshRolePage();
    }

    public handleDongtianTaskClick(taskId: string) {
        const task = this.meritTasks.find((entry) => entry.id === taskId);
        if (!task || task.claimed || !task.progress.includes('1/1')) return;
        task.claimed = true;
        this.merit += Number(task.reward.replace(/\D/g, '')) || 0;
        this.refreshDongtianPage();
        this.refreshShopPage();
    }

    public handleDongtianShopClick(shopId: string) {
        const item = this.meritShopItems.find((entry) => entry.id === shopId);
        const cost = Number(item?.cost.replace(/\D/g, '')) || 0;
        if (!item || item.stock <= 0 || this.merit < cost) return;
        item.stock -= 1;
        this.merit -= cost;
        this.spiritStone += item.id === 'shop1' ? 120 : 0;
        this.refreshDongtianPage();
        this.refreshShopPage();
    }

    public handleFishingBuyBaitClick() {
        if (this.spiritStone < 180) return;
        this.spiritStone -= 180;
        this.baitCount += 3;
        this.refreshFishingPage();
        this.refreshShopPage();
    }

    public handleFishingUpgradeRodClick() {
        const cost = this.rodTier * 900;
        if (this.spiritStone < cost) return;
        this.spiritStone -= cost;
        this.rodTier += 1;
        if (this.rodTier >= 2) this.fishingSlots[1].unlocked = true;
        if (this.rodTier >= 3) this.fishingSlots[2].unlocked = true;
        if (this.rodTier >= 4) this.fishingSlots[3].unlocked = true;
        this.refreshFishingPage();
        this.refreshShopPage();
    }

    public handleFishingCastClick() {
        if (this.baitCount <= 0) return;
        this.baitCount -= 1;
        this.realmExp = Math.min(this.realmExp + 4, this.realmExpNeed);
        this.refreshFishingPage();
        this.refreshRolePage();
    }

    public handleFishingSlotClick(index: number) {
        this.selectedFishingSlot = index;
        this.refreshFishingPage();
    }

    public handleFishingTargetClick(targetId: string) {
        const slot = this.fishingSlots[this.selectedFishingSlot];
        if (!slot?.unlocked) return;
        slot.targetId = targetId;
        this.refreshFishingPage();
    }

    public handleShopGoldTabClick(tab: GoldTab) {
        this.goldTab = tab;
        this.refreshShopPage();
    }

    public handleShopBuyClick(itemId: string) {
        const item = [...this.dailyShopItems, ...this.weeklyShopItems, ...this.mijingShopItems, ...this.diamondShopItems].find((entry) => entry.id === itemId);
        if (!item || item.stock <= 0) return;
        if (item.price.includes('灵石')) {
            const cost = Number(item.price.replace(/\D/g, '')) || 0;
            if (this.spiritStone < cost) return;
            this.spiritStone -= cost;
        }
        if (item.price.includes('徽记')) {
            const cost = Number(item.price.replace(/\D/g, '')) || 0;
            if (this.merit < cost) return;
            this.merit -= cost;
        }
        if (item.price.includes('钻石')) {
            const cost = Number(item.price.replace(/\D/g, '')) || 0;
            if (this.mysticCrystal < cost) return;
            this.mysticCrystal -= cost;
        }
        item.stock = Math.max(0, item.stock - 1);
        if (item.id === 'gd3' || item.id === 'gw2' || item.id === 'di2') this.realmExp = Math.min(this.realmExp + 20, this.realmExpNeed);
        if (item.id === 'gd4') this.artifactExp += 30;
        this.refreshShopPage();
        this.refreshRolePage();
        this.refreshFaqiPage();
    }

    public handleTaskTabClick(tab: TaskTab) {
        this.selectedTaskTab = tab;
        this.refreshTaskPage();
    }

    public handleTaskClaimClick(index: number) {
        const row = this.taskRows[index];
        if (!row || !row.active) return;
        row.active = false;
        row.action = '已领取';
        this.spiritStone += 120;
        this.realmExp = Math.min(this.realmExp + 20, this.realmExpNeed);
        this.refreshTaskPage();
        this.refreshRolePage();
        this.refreshShopPage();
    }

    public handleAlchemyTabClick(tab: AlchemyTab) {
        this.selectedAlchemyTab = tab;
        this.refreshAlchemyPage();
    }

    public handleAlchemyCraftClick() {
        const recipe = this.getSelectedAlchemyDetail();
        if (!recipe) return;
        recipe.crafted += 1;
        recipe.state = recipe.state.replace(/库存 \d+ 枚/, `库存 ${recipe.crafted} 枚`);
        recipe.output = recipe.output.replace(/库存 \d+/, `库存 ${recipe.crafted}`);
        this.refreshAlchemyPage();
    }

    public handleAlchemyUseClick() {
        const recipe = this.getSelectedAlchemyDetail();
        if (!recipe || recipe.crafted <= 0) return;
        recipe.crafted -= 1;
        recipe.state = recipe.state.replace(/库存 \d+ 枚/, `库存 ${recipe.crafted} 枚`);
        recipe.output = recipe.output.replace(/库存 \d+/, `库存 ${recipe.crafted}`);
        this.realmExp = Math.min(this.realmExp + 10, this.realmExpNeed);
        this.refreshAlchemyPage();
        this.refreshRolePage();
    }

    public handleAlchemyRecipeClick(recipeId: string) {
        this.selectedAlchemyDetailId = recipeId;
        this.selectedAlchemyTab = 'formula';
        this.refreshAlchemyPage();
    }

    public handleAlchemyForgeClick(recipeId: string) {
        this.selectedAlchemyDetailId = recipeId;
        this.selectedAlchemyTab = 'forge';
        this.refreshAlchemyPage();
    }

    public handleKungfuRunClick() {
        this.kungfus.forEach((entry) => { entry.running = entry.id === this.selectedKungfuId; });
        this.refreshKungfuPage();
        this.refreshRolePage();
        this.refreshDongtianPage();
        this.refreshMijingPage();
    }

    public handleKungfuUpgradeClick() {
        const kungfu = this.getSelectedKungfu();
        if (!kungfu || this.spiritStone < 60) return;
        this.spiritStone -= 60;
        kungfu.level += 1;
        this.refreshKungfuPage();
        this.refreshRolePage();
        this.refreshShopPage();
    }

    public handleKungfuCardClick(kungfuId: string) {
        this.selectedKungfuId = kungfuId;
        this.refreshKungfuPage();
    }

    public handleSpiritPetDeployClick() {
        this.spiritPets.forEach((entry) => { entry.deployed = entry.id === this.selectedPetId; });
        this.refreshSpiritPetPage();
        this.refreshRolePage();
        this.refreshMijingPage();
    }

    public handleSpiritPetUpgradeClick() {
        const pet = this.getSelectedPet();
        if (!pet || this.spiritStone < 120) return;
        this.spiritStone -= 120;
        pet.level += 1;
        this.refreshSpiritPetPage();
        this.refreshRolePage();
        this.refreshShopPage();
    }

    public handleSpiritPetCardClick(petId: string) {
        this.selectedPetId = petId;
        this.refreshSpiritPetPage();
    }

    private refreshRolePage() {
        const rolePage = this.views?.rolePage;
        if (!rolePage) return;
        const equippedSword = this.getEquippedArtifact('sword');
        const equippedTalisman = this.getEquippedArtifact('talisman');
        const equippedLamp = this.getEquippedArtifact('lamp');
        const runningKungfu = this.getRunningKungfu();
        const deployedPet = this.getDeployedPet();
        const dungeon = this.getSelectedDungeon();
        rolePage.setCurrencyValues(`${this.spiritStone}`, `${this.mysticCrystal}`);
        rolePage.setArtifactTexts(
            equippedSword ? `${equippedSword.name} Lv.${equippedSword.level} ${'★'.repeat(equippedSword.star)}` : '未装配 · 点击前往',
            equippedTalisman ? `${equippedTalisman.name} Lv.${equippedTalisman.level} ${'★'.repeat(equippedTalisman.star)}` : '未装配 · 点击前往',
            equippedLamp ? `${equippedLamp.name} Lv.${equippedLamp.level} ${'★'.repeat(equippedLamp.star)}` : '未装配 · 点击前往',
        );
        rolePage.setBasicStats(
            `气血: ${160 + this.getBuildingLevel('ward') * 10}`,
            `法力: ${88 + runningKungfu.level * 6}`,
            `行动力: ${180 + (deployedPet?.level ?? 1) * 2}`,
            `${this.getRealmTitles()[this.realmIndex]}: ${this.realmExp}/${this.realmExpNeed}`,
        );
        rolePage.setPracticeTexts(
            `丹师 Lv.${this.getBuildingLevel('alchemy')}  炼成提升`,
            `炼器 Lv.${this.getBuildingLevel('forge')}  护器养成`,
            `${runningKungfu.title} Lv.${runningKungfu.level}`,
            `${deployedPet?.title ?? '未出战'} Lv.${deployedPet?.level ?? 1}`,
        );
        rolePage.setPortraitCaption(`最深 ${dungeon?.label ?? '练气秘境'} ${dungeon?.bestDepth ?? 0} 层`);
    }

    private refreshFaqiPage() {
        const faqiPage = this.views?.faqiPage;
        if (!faqiPage) return;
        const selected = this.getSelectedArtifact();
        if (!selected) return;
        faqiPage.setHeaderValues(`${this.spiritStone}`, `${this.mysticCrystal}`, `法器经验 ${this.artifactExp}  |  灵石 ${this.spiritStone}  |  徽记 ${this.merit}`);
        faqiPage.setDetail(
            `${selected.name} · ${selected.effect.split('|')[0].trim()}`,
            `等级 Lv.${selected.level}/9  |  星级 ${'★'.repeat(selected.star)}\n${selected.unlocked ? '已解锁' : '未解锁'}`,
            selected.effect,
            `碎片 ${selected.shards}  |  升级需经验 30 / 养护灵石 280`,
            selected.glyph,
        );
        faqiPage.setActionTexts(selected.equipped ? '卸下' : selected.unlocked ? '装备' : '未解锁', '升级(30)', '升星(4)');
        faqiPage.setCards(this.artifacts.map((artifact) => ({
            id: artifact.id,
            slot: artifact.slot,
            glyph: artifact.glyph,
            name: artifact.name,
            info: artifact.unlocked ? `Lv.${artifact.level}  ${'★'.repeat(artifact.star)}` : `碎片 ${artifact.shards}/8`,
            state: artifact.equipped ? '已装配' : artifact.unlocked ? '可装配' : '未合成',
        })), this.selectedArtifactSlot, this.selectedArtifactId);
    }

    private refreshMijingPage() {
        const mijingPage = this.views?.mijingPage;
        if (!mijingPage) return;
        const dungeon = this.getSelectedDungeon();
        const pet = this.getDeployedPet();
        const kungfu = this.getRunningKungfu();
        if (!dungeon) return;
        const nextChest = dungeon.chestClaimed.findIndex((claimed) => !claimed);
        const nextDepth = nextChest >= 0 ? (nextChest + 1) * 5 : dungeon.maxDepth;
        mijingPage.setHeaderValues(`${this.spiritStone}`, `${this.mysticCrystal}`);
        mijingPage.setSummary(
            `当前：${dungeon.label} | 功法 ${kungfu.title} | 灵宠 ${pet?.title ?? '未出战'} | 总层数 ${dungeon.maxDepth}\n${this.dungeonMode === 'elite' ? '精英压强更高，收益更高。' : '优先推进到下一个进度宝箱节点。'}`,
            `${dungeon.label} 进度宝箱`,
            `历史最深 ${dungeon.bestDepth}/${dungeon.maxDepth} 层 | 下个节点：${nextDepth}层`,
            this.dungeonMode === 'elite' ? '精英秘境适合中后期试压，建议先补足法器与功法。' : '前期建议先刷普通秘境，缺战力回角色与工坊整备。',
        );
        mijingPage.setDungeonState(this.dungeonMode, this.selectedDungeonId, this.dungeons.map((entry) => ({
            id: entry.id,
            label: `${entry.label} ${entry.maxDepth}层`,
            state: entry.available ? `最深 ${entry.bestDepth}` : '未开放',
        })), dungeon.chestClaimed.map((claimed, index) => {
            const depth = (index + 1) * 5;
            if (claimed) return `${depth}层 已领`;
            if (dungeon.bestDepth >= depth) return `${depth}层 可领`;
            return `${depth}层`;
        }));
    }

    private refreshDongtianPage() {
        const dongtianPage = this.views?.dongtianPage;
        if (!dongtianPage) return;
        const runningKungfu = this.getRunningKungfu();
        dongtianPage.setHeaderValues(
            `${this.spiritStone}`,
            `${this.mysticCrystal}`,
            '洞府挂载：青岚洞天·内府灵域  |  洞天灵机与洞府阵枢已连通',
            `功勋 ${this.merit}  |  清心台 Lv.${this.getBuildingLevel('gather')}  |  护山大阵 Lv.${this.getBuildingLevel('ward')}`,
        );
        dongtianPage.setCaveSummary(
            `洞府灵脉 +${10 + this.getBuildingLevel('gather') * 2}%  |  丹火室 +${this.getBuildingLevel('alchemy') * 6}%  |  百炼台 +${this.getBuildingLevel('forge') * 6}%`,
            `灵石 ${this.spiritStone}  |  徽记 ${this.merit}  |  当前功法 ${runningKungfu.title} Lv.${runningKungfu.level}`,
            `突破成功率额外 +${this.getBuildingLevel('gather') * 4}%  |  清心台与护山大阵已并入角色页突破结算`,
        );
        dongtianPage.setData(this.buildings.map((entry) => ({
            id: entry.id,
            glyph: entry.glyph,
            title: `${entry.title} Lv.${entry.level}`,
            info: entry.info,
            cost: `下级: ${entry.nextCost}`,
            buttonText: '升级',
        })), this.meritTasks.map((entry) => ({
            id: entry.id,
            title: entry.title,
            info: entry.progress,
            reward: entry.reward,
            action: entry.claimed ? '已领' : entry.progress.includes('1/1') ? '领取' : '未达成',
        })), this.meritShopItems.map((entry) => ({
            id: entry.id,
            title: entry.title,
            cost: entry.cost,
            info: entry.info,
            stock: `余量 ${entry.stock}/${entry.maxStock}`,
        })), this.dongtianTab);
    }

    private refreshFishingPage() {
        const fishingPage = this.views?.fishingPage;
        if (!fishingPage) return;
        const unlockedSlots = this.fishingSlots.filter((entry) => entry.unlocked).length;
        const boundSlots = this.fishingSlots.filter((entry) => !!entry.targetId).length;
        fishingPage.setHeaderValues(`${this.spiritStone}`, `${this.mysticCrystal}`);
        fishingPage.setSummary(
            `开放绑定位 ${unlockedSlots}/4  |  已绑定 ${boundSlots}/${unlockedSlots}  |  方杆 ${this.rodTier} 阶  |  当前境界 ${this.getRealmTitles()[this.realmIndex]}`,
            `鱼饵 ${this.baitCount}  |  买鱼饵 180 灵石  |  升杆 ${this.rodTier * 900} 灵石  |  当前灵石 ${this.spiritStone}`,
            '先选上方槽位，再点击下方修士；抛竿后会获得一缕修为反哺。',
            this.baitCount > 0 ? '抛竿' : '缺鱼饵',
        );
        fishingPage.setSlots(this.fishingSlots.map((entry, index) => ({
            title: entry.unlocked ? `第 ${index + 1} 位` : `第 ${index + 1} 位未开`,
            info: entry.targetId ? `${this.getFishingTarget(entry.targetId)?.title ?? '散修'} 已绑定` : entry.unlocked ? '点下方修士即可绑定' : '提升方杆后开放',
            action: entry.targetId ? `当前目标 ${this.getFishingTarget(entry.targetId)?.id ?? ''}` : entry.unlocked ? '当前待绑定' : '未解锁',
            selected: index === this.selectedFishingSlot,
            unlocked: entry.unlocked,
        })));
        fishingPage.setTargets(this.fishingTargets.map((entry) => ({
            id: entry.id,
            title: entry.title,
            info: entry.info,
            state: this.fishingSlots.some((slot) => slot.targetId === entry.id) ? '已被某槽位绑定' : '点击绑定到当前选中槽位',
            active: this.fishingSlots[this.selectedFishingSlot]?.targetId === entry.id,
        })));
    }

    private refreshShopPage() {
        const shopPage = this.views?.shopPage;
        if (!shopPage) return;
        shopPage.setHeaderValues(
            `${this.spiritStone}`,
            `${this.mysticCrystal}`,
            `灵石 ${this.spiritStone}  |  法器经验 ${this.artifactExp}  |  徽记 ${this.merit}  |  钻石 ${this.mysticCrystal}`,
            '前期可先买每日补给，再去秘境刷徽记与材料。',
        );
        shopPage.setGoldTab(this.goldTab);
        shopPage.setItems(
            this.dailyShopItems.map((entry) => ({ ...entry, stock: `余量 ${entry.stock}/${entry.maxStock}`, active: entry.stock > 0 })),
            this.weeklyShopItems.map((entry) => ({ ...entry, stock: `余量 ${entry.stock}/${entry.maxStock}`, active: entry.stock > 0 })),
            this.mijingShopItems.map((entry) => ({ ...entry, stock: `余量 ${entry.stock}/${entry.maxStock}`, active: entry.stock > 0 })),
            this.diamondShopItems.map((entry) => ({ ...entry, stock: entry.maxStock >= 99 ? '常驻' : `余量 ${entry.stock}/${entry.maxStock}`, active: entry.stock > 0 })),
        );
    }

    private refreshTaskPage() {
        const taskPage = this.views?.taskPage;
        if (!taskPage) return;
        taskPage.setHeaderValues(`${this.spiritStone}`, `${this.mysticCrystal}`);
        taskPage.setTab(this.selectedTaskTab);
        taskPage.setRows(this.taskRows.map((entry) => ({ ...entry })));
    }

    private refreshAlchemyPage() {
        const alchemyPage = this.views?.alchemyPage;
        if (!alchemyPage) return;
        const detail = this.getSelectedAlchemyDetail();
        alchemyPage.setHeaderValues(`${this.spiritStone}`, `${this.mysticCrystal}`);
        alchemyPage.setTab(this.selectedAlchemyTab);
        alchemyPage.setDetail(
            detail?.title ?? '聚气丹',
            detail?.detailInfo ?? '以温养经脉为主，适合前期开炉补给。',
            detail?.cost ?? '耗材: 灵草 x2  |  灵石 80',
            detail?.output ?? '丹成效果: 修为 +20  |  成功率 78%  |  出丹 1-2  |  库存 0',
            this.selectedAlchemyTab === 'forge' ? '开炉炼器' : '开炉炼制',
            `服用(${detail?.crafted ?? 0})`,
            `丹师 Lv.${this.getBuildingLevel('alchemy')}  |  库存 ${detail?.crafted ?? 0}  |  炼成后可手动服用或留作局外整备`,
        );
        alchemyPage.setRecipes(
            this.alchemyRecipes.map((entry) => ({ id: entry.id, title: entry.title, info: entry.info, state: entry.state })),
            this.forgeRecipes.map((entry) => ({ id: entry.id, title: entry.title, info: entry.info, state: entry.state })),
            this.materials.map((entry) => ({ id: entry.id, title: entry.title, kind: entry.kind, count: `x ${entry.count}` })),
        );
    }

    private refreshKungfuPage() {
        const kungfuPage = this.views?.kungfuPage;
        if (!kungfuPage) return;
        const selected = this.getSelectedKungfu();
        kungfuPage.setHeaderValues(`${this.spiritStone}`, `${this.mysticCrystal}`);
        kungfuPage.setDetail(
            `${selected.title} · ${selected.running ? '运转中' : '待切换'}`,
            `${selected.subtitle}  |  Lv.${selected.level}  |  吐纳 ${24 + selected.level * 4}灵气/秒\n适合当前阶段修行。`,
            selected.effect,
            '当前主修正在运转，吐纳、炼丹、炼器加成都已生效。',
            selected.running ? '运转中' : '切为主修',
            '升阶 60',
        );
        kungfuPage.setCards(this.kungfus.map((entry, index) => ({
            id: entry.id,
            title: `${index + 1}. ${entry.title}`,
            info: `${entry.subtitle}  |  Lv.${entry.level}  |  吐纳 ${24 + entry.level * 4}/秒`,
            state: entry.running ? '运转中' : entry.id === this.selectedKungfuId ? '已选中' : '可切换',
            active: entry.id === this.selectedKungfuId,
        })));
    }

    private refreshSpiritPetPage() {
        const spiritPetPage = this.views?.spiritPetPage;
        if (!spiritPetPage) return;
        const pet = this.getSelectedPet();
        spiritPetPage.setHeaderValues(`${this.spiritStone}`, `${this.mysticCrystal}`);
        spiritPetPage.setDetail(
            `${pet.title} · ${pet.deployed ? '出战中' : '待命'}`,
            `${pet.info}  |  Lv.${pet.level}\n提高行动恢复与探索收益。`,
            pet.effect,
            '当前养成消耗：灵石 120。点击下方列表可切换养成目标。',
            pet.deployed ? '已出战' : '设为出战',
            '养成(120)',
        );
        spiritPetPage.setCards(this.spiritPets.map((entry, index) => ({
            id: entry.id,
            title: `${index + 1}. ${entry.title}`,
            info: `${entry.info}  |  Lv.${entry.level}  |  可养成`,
            state: entry.deployed ? '出战中' : entry.id === this.selectedPetId ? '已选中' : '待命',
            active: entry.id === this.selectedPetId,
        })));
    }

    private getRealmTitles() {
        return ['练气一重', '练气二重', '练气三重', '练气四重', '筑基初期'];
    }

    private getEquippedArtifact(slot: FaqiSlot) {
        return this.artifacts.find((artifact) => artifact.slot === slot && artifact.equipped) ?? null;
    }

    private getSelectedArtifact() {
        return this.artifacts.find((artifact) => artifact.id === this.selectedArtifactId) ?? null;
    }

    private selectFirstArtifactInSlot(slot: FaqiSlot) {
        const first = this.artifacts.find((artifact) => artifact.slot === slot);
        if (first) this.selectedArtifactId = first.id;
    }

    private getSelectedDungeon() {
        return this.dungeons.find((dungeon) => dungeon.id === this.selectedDungeonId) ?? null;
    }

    private getBuildingLevel(buildingId: string) {
        return this.buildings.find((entry) => entry.id === buildingId)?.level ?? 1;
    }

    private getFishingTarget(targetId: string) {
        return this.fishingTargets.find((entry) => entry.id === targetId) ?? null;
    }

    private getSelectedAlchemyDetail() {
        return [...this.alchemyRecipes, ...this.forgeRecipes].find((entry) => entry.id === this.selectedAlchemyDetailId) ?? this.alchemyRecipes[0] ?? null;
    }

    private getSelectedKungfu() {
        return this.kungfus.find((entry) => entry.id === this.selectedKungfuId) ?? this.kungfus[0];
    }

    private getRunningKungfu() {
        return this.kungfus.find((entry) => entry.running) ?? this.kungfus[0];
    }

    private getSelectedPet() {
        return this.spiritPets.find((entry) => entry.id === this.selectedPetId) ?? this.spiritPets[0];
    }

    private getDeployedPet() {
        return this.spiritPets.find((entry) => entry.deployed) ?? this.spiritPets[0] ?? null;
    }
}
/**
 * DataManager — 全局数据管理器（单例）
 * 按照 docs/COCOS_CREATOR_COMPLETE_GUIDE.md 规范
 * 集中管理所有游戏数据
 */

export class DataManager {
    private static instance: DataManager = null;

    // === 玩家数据 ===
    private playerData = {
        name: '来取快递',
        realm: '金丹期',
        level: 10,
        exp: 8500,
        maxExp: 10000,
        gold: 99999,
        diamond: 888,
        power: 12580,
        hp: 800,
        maxHP: 1000,
        mp: 300,
        maxMP: 500,
    };

    // === 装备数据 ===
    private equipment = [
        { id: '1', slot: '飞剑位', name: '青霜剑', level: 1, iconType: 'Sword' },
        { id: '2', slot: '护符位', name: '玄甲符', level: 1, iconType: 'Shield' },
        { id: '3', slot: '灵灯位', name: '寻宝灯', level: 1, iconType: 'Lamp' },
    ];

    // === 属性数据 ===
    private stats = [
        { label: '境界', current: 0, max: 30, color: 'purple', showAsText: true, textValue: '练气一层' },
        { label: '气血', current: 160, max: 160, color: 'red' },
        { label: '法力', current: 88, max: 88, color: 'blue' },
        { label: '行动力', current: 180, max: 180, color: 'green' },
    ];

    // === 法器数据 ===
    private weapons = [
        { id: 1, name: '青锋剑', level: 10, rarity: 5, attack: 285, iconType: 'Sword', equipped: true },
        { id: 2, name: '雷神锤', level: 8, rarity: 4, attack: 256, iconType: 'Zap' },
        { id: 3, name: '玄武盾', level: 7, rarity: 4, attack: 198, iconType: 'Shield' },
        { id: 4, name: '赤焰扇', level: 6, rarity: 3, attack: 167, iconType: 'Flame' },
    ];

    // === 任务数据 ===
    private tasks = [
        { id: 1, name: '击败妖兽', reward: '经验+100', status: '进行中', progress: 5, total: 10 },
        { id: 2, name: '收集灵草', reward: '金币+50', status: '进行中', progress: 3, total: 5 },
        { id: 3, name: '炼制丹药', reward: '钻石+10', status: '未完成', progress: 0, total: 3 },
        { id: 4, name: '修炼功法', reward: '功法点+20', status: '可领取', progress: 5, total: 5 },
    ];

    // === 商品数据 ===
    private shopItems = [
        { id: 1, name: '灵石礼包', price: 100, currency: '钻石', stock: 99 },
        { id: 2, name: '经验丹', price: 50, currency: '金币', stock: 50 },
        { id: 3, name: '强化石', price: 80, currency: '金币', stock: 30 },
        { id: 4, name: '复活丹', price: 200, currency: '钻石', stock: 10 },
    ];

    // === 丹药数据 ===
    private pills = [
        { id: 1, name: '筑基丹', materials: '灵草x5', time: '2小时' },
        { id: 2, name: '洗髓丹', materials: '灵芝x3', time: '4小时' },
        { id: 3, name: '金丹', materials: '仙草x10', time: '8小时' },
    ];

    // === 炼器数据 ===
    private forgeList = [
        { id: 1, name: '玄铁重剑', level: 5, nextLevel: 6, materials: '精铁x10' },
        { id: 2, name: '金丝软甲', level: 3, nextLevel: 4, materials: '金线x8' },
        { id: 3, name: '护身玉佩', level: 2, nextLevel: 3, materials: '玉石x5' },
    ];

    // === 功法数据 ===
    private skills = [
        { id: 1, name: '九天玄功', level: 10, type: '内功', power: 150 },
        { id: 2, name: '剑气纵横', level: 8, type: '剑法', power: 120 },
        { id: 3, name: '凌波微步', level: 6, type: '身法', power: 90 },
        { id: 4, name: '降龙十八掌', level: 5, type: '掌法', power: 100 },
    ];

    // === 灵宠数据 ===
    private pets = [
        { id: 1, name: '白虎', level: 10, loyalty: 100, power: 200 },
        { id: 2, name: '青龙', level: 8, loyalty: 85, power: 180 },
        { id: 3, name: '朱雀', level: 6, loyalty: 70, power: 150 },
    ];

    // === 鱼类数据 ===
    private fishList = [
        { id: 1, name: '金鳞鲤', rarity: 4, weight: '2.5kg', value: 150 },
        { id: 2, name: '银鳞鱼', rarity: 3, weight: '1.8kg', value: 100 },
        { id: 3, name: '青鳞草鱼', rarity: 2, weight: '1.2kg', value: 50 },
    ];

    // === 建筑数据 ===
    private buildings = [
        { id: 1, name: '灵田', level: 5, production: '灵草x10/日' },
        { id: 2, name: '聚灵阵', level: 3, production: '灵力+50/时' },
        { id: 3, name: '藏宝阁', level: 2, production: '容量+100' },
    ];

    // === 秘境数据 ===
    private secrets = [
        { id: 1, name: '远古遗迹', status: '已开启', level: 'Lv.10+', reward: '传说装备' },
        { id: 2, name: '仙人洞府', status: '已开启', level: 'Lv.20+', reward: '仙品功法' },
        { id: 3, name: '神魔战场', status: '未解锁', level: 'Lv.30+', reward: '神器' },
    ];

    static getInstance(): DataManager {
        if (!this.instance) {
            this.instance = new DataManager();
        }
        return this.instance;
    }

    // === Getter 方法 ===
    getPlayerData() { return { ...this.playerData }; }
    getEquipment() { return [...this.equipment]; }
    getStats() { return [...this.stats]; }
    getWeapons() { return [...this.weapons]; }
    getTasks() { return [...this.tasks]; }
    getShopItems() { return [...this.shopItems]; }
    getPills() { return [...this.pills]; }
    getForgeList() { return [...this.forgeList]; }
    getSkills() { return [...this.skills]; }
    getPets() { return [...this.pets]; }
    getFishList() { return [...this.fishList]; }
    getBuildings() { return [...this.buildings]; }
    getSecrets() { return [...this.secrets]; }

    // === 操作方法 ===
    addGold(amount: number) {
        this.playerData.gold += amount;
    }

    addDiamond(amount: number) {
        this.playerData.diamond += amount;
    }

    claimTask(taskId: number) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.status === '可领取') {
            task.status = '已完成';
        }
    }

    buyItem(itemId: number): boolean {
        const item = this.shopItems.find(i => i.id === itemId);
        if (item && item.stock > 0) {
            if (item.currency === '金币' && this.playerData.gold >= item.price) {
                this.playerData.gold -= item.price;
                item.stock--;
                return true;
            } else if (item.currency === '钻石' && this.playerData.diamond >= item.price) {
                this.playerData.diamond -= item.price;
                item.stock--;
                return true;
            }
        }
        return false;
    }
}

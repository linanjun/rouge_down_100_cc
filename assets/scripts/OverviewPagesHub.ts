import {
    _decorator,
    Component,
    Layers,
    Node,
    UITransform,
} from 'cc';
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
import {
    OverviewPagesDataSource,
    OverviewPageId,
    FaqiSlot,
    DungeonMode,
    DongtianTab,
    GoldTab,
    AlchemyTab,
    TaskTab,
} from './OverviewPagesDataSource';

const { ccclass, property } = _decorator;

@ccclass('OverviewPagesHub')
export class OverviewPagesHub extends Component {
    @property
    initialPage: OverviewPageId = 'role';

    private pageNodes = new Map<OverviewPageId, Node>();
    private rolePage: RoleOverviewPage | null = null;
    private faqiPage: FaqiOverviewPage | null = null;
    private mijingPage: MijingOverviewPage | null = null;
    private dongtianPage: DongtianOverviewPage | null = null;
    private fishingPage: FishingOverviewPage | null = null;
    private shopPage: ShopOverviewPage | null = null;
    private taskPage: TaskOverviewPage | null = null;
    private alchemyPage: AlchemyWorkshopPage | null = null;
    private kungfuPage: KungfuOverviewPage | null = null;
    private spiritPetPage: SpiritPetOverviewPage | null = null;
    private dataSource = new OverviewPagesDataSource();

    onLoad() {
        this.ensureRootSize();
        this.buildPages();
        this.dataSource.setNavigator((page) => this.switchPage(page));
        this.dataSource.attachViews({
            rolePage: this.rolePage,
            faqiPage: this.faqiPage,
            mijingPage: this.mijingPage,
            dongtianPage: this.dongtianPage,
            fishingPage: this.fishingPage,
            shopPage: this.shopPage,
            taskPage: this.taskPage,
            alchemyPage: this.alchemyPage,
            kungfuPage: this.kungfuPage,
            spiritPetPage: this.spiritPetPage,
        });
        this.dataSource.refreshAllPages();
        this.switchPage(this.initialPage);
    }

    public switchPage(page: OverviewPageId) {
        this.pageNodes.forEach((node, id) => {
            node.active = id === page;
        });
    }

    private ensureRootSize() {
        let transform = this.node.getComponent(UITransform);
        if (!transform) transform = this.node.addComponent(UITransform);
        const size = transform.contentSize;
        if (size.width < 200 || size.height < 200) {
            transform.setContentSize(720, 1280);
        }
    }

    private buildPages() {
        this.node.removeAllChildren();
        this.pageNodes.clear();

        this.rolePage = this.createPageNode('role', 'RoleOverviewRoot', RoleOverviewPage);
        this.faqiPage = this.createPageNode('faqi', 'FaqiOverviewRoot', FaqiOverviewPage);
        this.mijingPage = this.createPageNode('mijing', 'MijingOverviewRoot', MijingOverviewPage);
        this.dongtianPage = this.createPageNode('dongtian', 'DongtianOverviewRoot', DongtianOverviewPage);
        this.fishingPage = this.createPageNode('fishing', 'FishingOverviewRoot', FishingOverviewPage);
        this.shopPage = this.createPageNode('shop', 'ShopOverviewRoot', ShopOverviewPage);
        this.taskPage = this.createPageNode('task', 'TaskOverviewRoot', TaskOverviewPage);
        this.alchemyPage = this.createPageNode('alchemy', 'AlchemyWorkshopRoot', AlchemyWorkshopPage);
        this.kungfuPage = this.createPageNode('kungfu', 'KungfuOverviewRoot', KungfuOverviewPage);
        this.spiritPetPage = this.createPageNode('pet', 'SpiritPetOverviewRoot', SpiritPetOverviewPage);
    }

    private createPageNode<T extends Component>(id: OverviewPageId, name: string, ctor: new () => T): T {
        const node = new Node(name);
        node.layer = Layers.Enum.UI_2D;
        this.node.addChild(node);

        const rootTransform = this.node.getComponent(UITransform);
        const width = rootTransform?.contentSize.width ?? 720;
        const height = rootTransform?.contentSize.height ?? 1280;
        node.addComponent(UITransform).setContentSize(width, height);

        this.pageNodes.set(id, node);
        this.bindCommonEvents(node);
        this.bindPageEvents(id, node);

        const component = node.addComponent(ctor);

        return component;
    }

    private bindCommonEvents(node: Node) {
        node.on('common-page-tab-click', (tabId: string) => this.dataSource.handleCommonTabClick(tabId), this);
        node.on('common-page-shortcut-click', (shortcutId: string) => this.dataSource.handleCommonShortcutClick(shortcutId), this);
    }

    private bindPageEvents(id: OverviewPageId, node: Node) {
        if (id === 'role') {
            node.on('role-artifact-click', (slot: FaqiSlot) => this.dataSource.handleRoleArtifactClick(slot), this);
            node.on('role-breakthrough-click', () => this.dataSource.handleRoleBreakthroughClick(), this);
            return;
        }

        if (id === 'faqi') {
            node.on('faqi-slot-click', (slot: FaqiSlot) => this.dataSource.handleFaqiSlotClick(slot), this);
            node.on('faqi-card-click', (artifactId: string) => this.dataSource.handleFaqiCardClick(artifactId), this);
            node.on('faqi-primary-click', () => this.dataSource.handleFaqiPrimaryClick(), this);
            node.on('faqi-upgrade-click', () => this.dataSource.handleFaqiUpgradeClick(), this);
            node.on('faqi-star-click', () => this.dataSource.handleFaqiStarClick(), this);
            return;
        }

        if (id === 'mijing') {
            node.on('mijing-mode-click', (mode: DungeonMode) => this.dataSource.handleMijingModeClick(mode), this);
            node.on('mijing-dungeon-click', (dungeonId: string) => this.dataSource.handleMijingDungeonClick(dungeonId), this);
            node.on('mijing-chest-click', (index: number) => this.dataSource.handleMijingChestClick(index), this);
            node.on('mijing-enter-click', () => this.dataSource.handleMijingEnterClick(), this);
            return;
        }

        if (id === 'dongtian') {
            node.on('dongtian-tab-click', (tab: DongtianTab) => this.dataSource.handleDongtianTabClick(tab), this);
            node.on('dongtian-building-click', (buildingId: string) => this.dataSource.handleDongtianBuildingClick(buildingId), this);
            node.on('dongtian-task-click', (taskId: string) => this.dataSource.handleDongtianTaskClick(taskId), this);
            node.on('dongtian-shop-click', (shopId: string) => this.dataSource.handleDongtianShopClick(shopId), this);
            return;
        }

        if (id === 'fishing') {
            node.on('fishing-buy-bait', () => this.dataSource.handleFishingBuyBaitClick(), this);
            node.on('fishing-upgrade-rod', () => this.dataSource.handleFishingUpgradeRodClick(), this);
            node.on('fishing-cast', () => this.dataSource.handleFishingCastClick(), this);
            node.on('fishing-slot-click', (index: number) => this.dataSource.handleFishingSlotClick(index), this);
            node.on('fishing-target-click', (targetId: string) => this.dataSource.handleFishingTargetClick(targetId), this);
            return;
        }

        if (id === 'shop') {
            node.on('shop-gold-tab-click', (tab: GoldTab) => this.dataSource.handleShopGoldTabClick(tab), this);
            node.on('shop-buy-click', (itemId: string) => this.dataSource.handleShopBuyClick(itemId), this);
            return;
        }

        if (id === 'task') {
            node.on('task-tab-click', (tab: TaskTab) => this.dataSource.handleTaskTabClick(tab), this);
            node.on('task-claim-click', (index: number) => this.dataSource.handleTaskClaimClick(index), this);
            return;
        }

        if (id === 'alchemy') {
            node.on('alchemy-tab-click', (tab: AlchemyTab) => this.dataSource.handleAlchemyTabClick(tab), this);
            node.on('alchemy-craft-click', () => this.dataSource.handleAlchemyCraftClick(), this);
            node.on('alchemy-use-click', () => this.dataSource.handleAlchemyUseClick(), this);
            node.on('alchemy-recipe-click', (recipeId: string) => this.dataSource.handleAlchemyRecipeClick(recipeId), this);
            node.on('alchemy-forge-click', (recipeId: string) => this.dataSource.handleAlchemyForgeClick(recipeId), this);
            return;
        }

        if (id === 'kungfu') {
            node.on('kungfu-run-click', () => this.dataSource.handleKungfuRunClick(), this);
            node.on('kungfu-upgrade-click', () => this.dataSource.handleKungfuUpgradeClick(), this);
            node.on('kungfu-card-click', (kungfuId: string) => this.dataSource.handleKungfuCardClick(kungfuId), this);
            return;
        }

        if (id === 'pet') {
            node.on('spirit-pet-deploy-click', () => this.dataSource.handleSpiritPetDeployClick(), this);
            node.on('spirit-pet-upgrade-click', () => this.dataSource.handleSpiritPetUpgradeClick(), this);
            node.on('spirit-pet-card-click', (petId: string) => this.dataSource.handleSpiritPetCardClick(petId), this);
        }
    }
}
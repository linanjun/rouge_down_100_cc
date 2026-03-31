/**
 * SecretPage — 秘境探索
 * 按照 docs/COCOS_CREATOR_COMPLETE_GUIDE.md 规范
 * 扁平化设计（无圆角/无渐变/无阴影）
 */
import {
    _decorator, Color, Component, Graphics, HorizontalTextAlignment,
    Label, Layers, Node, UITransform,
} from 'cc';

const { ccclass } = _decorator;

// ── Color palette ──
const SLATE_300  = new Color(203, 213, 225, 255);
const SLATE_400  = new Color(148, 163, 184, 255);
const SLATE_600  = new Color( 71,  85, 105, 255);
const SLATE_700  = new Color( 51,  65,  85, 255);
const SLATE_800  = new Color( 30,  41,  59, 255);
const SLATE_900  = new Color( 15,  23,  42, 255);
const AMBER_100  = new Color(254, 243, 199, 255);
const AMBER_200  = new Color(253, 230, 138, 255);
const AMBER_400  = new Color(251, 191,  36, 255);
const AMBER_500  = new Color(245, 158,  11, 255);
const AMBER_600  = new Color(217, 119,   6, 255);
const AMBER_700  = new Color(180,  83,   9, 255);
const AMBER_800  = new Color(146,  64,  14, 255);
const AMBER_900  = new Color(120,  53,  15, 255);
const AMBER_950  = new Color( 69,  26,   3, 255);
const YELLOW_400 = new Color(250, 204,  21, 255);

const THEME_COLOR = new Color(162,  28, 175, 255);  // FUCHSIA #a21caf

interface SecretItem {
    name: string;
    status: string;
    level: string;
    reward: string;
}

@ccclass('SecretPage')
export class SecretPage extends Component {
    onLoad() { this.buildPage(); }

    private buildPage() {
        const t = this.node.getComponent(UITransform);
        const w = t ? t.width : 688;
        const h = t ? t.height : 958;
        const PAD = 16;
        let curY = h / 2;

        // ── 四角装饰 ──
        this.buildCornerDecorations(this.node, w, h, 0, 0);

        // ── 标题横幅 ──
        const bannerH = 36;
        curY -= PAD + bannerH / 2;
        this.buildTitleBanner(this.node, w - PAD * 2, bannerH, 0, curY);
        curY -= bannerH / 2;

        // ── 秘境展示图 ──
        const imgH = 200;
        curY -= 16 + imgH / 2;
        const containerW = w - PAD * 2;
        const imgContainer = this.makeRect('ImgContainer', this.node, containerW, imgH + 16, 0, curY, AMBER_700);
        const imgInner = this.makeRect('ImgContainerBg', imgContainer, containerW - 8, imgH + 8, 0, 0, AMBER_900);
        const imgBox = this.makeRect('ImgBorder', imgInner, containerW - 24, imgH - 8, 0, 0, AMBER_600);
        this.makeRect('ImgBg', imgBox, containerW - 30, imgH - 14, 0, 0, SLATE_900);
        this.makeLabel(imgBox, '[ 秘境入口 ]', 14, 0, 0, SLATE_400, containerW - 40);
        curY -= imgH / 2;

        // ── 秘境列表 ──
        const secrets: SecretItem[] = [
            { name: '远古遗迹', status: '已开启', level: 'Lv.10+', reward: '传说装备' },
            { name: '仙人洞府', status: '已开启', level: 'Lv.20+', reward: '仙品功法' },
            { name: '神魔战场', status: '未解锁', level: 'Lv.30+', reward: '神器' },
        ];

        const listH = h / 2 + curY - PAD - 16;
        curY -= 16 + listH / 2;
        const listOuter = this.makeRect('ListBorder', this.node, containerW, listH, 0, curY, AMBER_700);
        const listBg = this.makeRect('ListBg', listOuter, containerW - 8, listH - 8, 0, 0, AMBER_900);

        const innerW = containerW - 8 - 24;
        let itemY = (listH - 8) / 2;
        const itemH = 72;
        const itemGap = 12;

        itemY -= 12;
        for (let i = 0; i < secrets.length; i++) {
            itemY -= itemH / 2;
            this.buildSecretItem(listBg, innerW, itemH, 0, itemY, secrets[i]);
            itemY -= itemH / 2 + itemGap;
        }
    }

    private buildSecretItem(parent: Node, w: number, h: number, x: number, y: number, secret: SecretItem) {
        const item = this.makeRect('Secret_' + secret.name, parent, w, h, x, y, AMBER_950);
        this.drawBorder(item, w, h, AMBER_800, 2);

        const pad = 10;
        const iconSize = 50;
        const iconX = -w / 2 + pad + iconSize / 2;

        const iconBd = this.makeRect('IconBd', item, iconSize, iconSize, iconX, 0, AMBER_600);
        this.makeRect('IconBg', iconBd, iconSize - 6, iconSize - 6, 0, 0, SLATE_900);
        this.makeLabel(iconBd, '🌀', 20, 0, 0, AMBER_400, iconSize - 10);

        const btnW = 64;
        const infoX = iconX + iconSize / 2 + pad;
        const infoW = w - pad * 2 - iconSize - pad - btnW - pad;
        const infoCX = infoX + infoW / 2;

        this.makeLabel(item, secret.name, 14, infoCX, 16, AMBER_100, infoW, HorizontalTextAlignment.LEFT);
        this.makeLabel(item, '要求: ' + secret.level, 11, infoCX, 0, AMBER_400, infoW, HorizontalTextAlignment.LEFT);
        this.makeLabel(item, '奖励: ' + secret.reward, 11, infoCX, -16, YELLOW_400, infoW, HorizontalTextAlignment.LEFT);

        // 状态标签
        const tagW = 48;
        const tagH = 16;
        const tagX = infoCX + infoW / 2 - tagW / 2;
        const tagColor = secret.status === '已开启' ? THEME_COLOR : SLATE_700;
        const tag = this.makeRect('Tag', item, tagW, tagH, infoCX - infoW / 2 + tagW / 2, 28, tagColor);
        this.makeLabel(tag, secret.status, 9, 0, 0, AMBER_100, tagW - 4);

        // 进入/锁定按钮
        const btnX = w / 2 - pad - btnW / 2;
        const btnH = 28;
        const isLocked = secret.status === '未解锁';
        const btnColor = isLocked ? SLATE_700 : THEME_COLOR;
        const btn = this.makeRect('Btn', item, btnW, btnH, btnX, 0, btnColor);
        this.makeLabel(btn, isLocked ? '锁定' : '进入', 12, 0, 0, AMBER_100, btnW - 8);
    }

    // ── 标题横幅 ──
    private buildTitleBanner(parent: Node, w: number, h: number, x: number, y: number) {
        const border = this.makeRect('TitleBorder', parent, w, h, x, y, AMBER_400);
        const bg = this.makeRect('TitleBg', border, w - 6, h - 6, 0, 0, THEME_COLOR);
        this.makeLabel(bg, '秘境探索', 16, 0, 0, AMBER_200, w - 96);

        const ds = 20;
        const dLeft = this.makeRect('DiamondL', border, ds, ds, -(w / 2 - 10), 0, THEME_COLOR);
        this.drawBorder(dLeft, ds, ds, AMBER_400, 3);
        dLeft.angle = 45;
        const dRight = this.makeRect('DiamondR', border, ds, ds, w / 2 - 10, 0, THEME_COLOR);
        this.drawBorder(dRight, ds, ds, AMBER_400, 3);
        dRight.angle = 45;
    }

    // ── 四角装饰 ──
    private buildCornerDecorations(parent: Node, w: number, h: number, x: number, y: number) {
        const size = 12;
        const hs = size / 2;
        const offset = 6;
        const corners = [
            { cx: -w / 2 + offset + hs, cy:  h / 2 - offset - hs, dir: 'TL' },
            { cx:  w / 2 - offset - hs, cy:  h / 2 - offset - hs, dir: 'TR' },
            { cx: -w / 2 + offset + hs, cy: -h / 2 + offset + hs, dir: 'BL' },
            { cx:  w / 2 - offset - hs, cy: -h / 2 + offset + hs, dir: 'BR' },
        ];
        for (const c of corners) {
            const cn = this.makeNode('Corner_' + c.dir, parent, size, size, x + c.cx, y + c.cy);
            const g = cn.addComponent(Graphics);
            g.strokeColor = AMBER_500;
            g.lineWidth = 3;
            if (c.dir === 'TL') { g.moveTo(-hs, -hs); g.lineTo(-hs, hs); g.lineTo(hs, hs); }
            else if (c.dir === 'TR') { g.moveTo(-hs, hs); g.lineTo(hs, hs); g.lineTo(hs, -hs); }
            else if (c.dir === 'BL') { g.moveTo(-hs, hs); g.lineTo(-hs, -hs); g.lineTo(hs, -hs); }
            else { g.moveTo(hs, hs); g.lineTo(hs, -hs); g.lineTo(-hs, -hs); }
            g.stroke();
        }
    }

    // ── Helpers ──
    private makeNode(name: string, parent: Node, w: number, h: number, x: number, y: number): Node {
        const node = new Node(name);
        node.layer = Layers.Enum.UI_2D;
        parent.addChild(node);
        node.setPosition(x, y, 0);
        node.addComponent(UITransform).setContentSize(w, h);
        return node;
    }

    private makeRect(name: string, parent: Node, w: number, h: number, x: number, y: number, fill: Color): Node {
        const node = this.makeNode(name, parent, w, h, x, y);
        const g = node.addComponent(Graphics);
        g.fillColor = fill;
        g.rect(-w / 2, -h / 2, w, h);
        g.fill();
        return node;
    }

    private drawBorder(node: Node, w: number, h: number, color: Color, lineWidth: number) {
        const g = node.getComponent(Graphics);
        if (!g) return;
        g.strokeColor = color;
        g.lineWidth = lineWidth;
        g.rect(-w / 2, -h / 2, w, h);
        g.stroke();
    }

    private makeLabel(parent: Node, text: string, fontSize: number, x: number, y: number,
                      color: Color, width: number, align = HorizontalTextAlignment.CENTER): Label {
        const node = new Node('Label');
        node.layer = Layers.Enum.UI_2D;
        parent.addChild(node);
        node.setPosition(x, y, 0);
        node.addComponent(UITransform).setContentSize(width, fontSize + 12);
        const label = node.addComponent(Label);
        label.string          = text;
        label.fontSize        = fontSize;
        label.lineHeight      = fontSize + 4;
        label.color           = color;
        label.horizontalAlign = align;
        label.overflow        = Label.Overflow.SHRINK;
        return label;
    }
}

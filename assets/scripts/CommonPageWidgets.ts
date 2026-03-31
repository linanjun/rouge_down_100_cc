import {
    Color,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Layers,
    Node,
    UITransform,
    Vec3,
} from 'cc';

export function createRoundedPanel(
    parent: Node,
    width: number,
    height: number,
    position: Vec3,
    fill: Color,
    stroke: Color,
    radius = 8,
) {
    const panel = new Node('Panel');
    panel.layer = Layers.Enum.UI_2D;
    parent.addChild(panel);
    panel.setPosition(position);
    panel.addComponent(UITransform).setContentSize(width, height);
    repaintRoundedPanel(panel, fill, stroke, radius);
    return panel;
}

export function repaintRoundedPanel(node: Node, fill: Color, stroke: Color, radius = 8) {
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

export function createPageLabel(
    parent: Node,
    text: string,
    fontSize: number,
    position: Vec3,
    color: Color,
    width: number,
    align = HorizontalTextAlignment.CENTER,
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
const { ccclass, property, menu, requireComponent, disallowMultiple, executeInEditMode } = cc._decorator;

cc.macro.ENABLE_WEBGL_ANTIALIAS = true;

/** UI 矩形圆角遮罩 */
@ccclass()
@disallowMultiple()   
@executeInEditMode() 
@requireComponent(cc.Mask)
@menu("自定义组件/矩形圆角遮罩")
export default class TheRectMask extends cc.Component {

    /** 圆角半径 */
    @property({ visible: false })
    private radius: number = 20;
    
    /** 矩形大小 */
    @property({ visible: false })
    private size: cc.Vec2 = new cc.Vec2();

    /** 圆角半径 */
    @property({ displayName: "圆角半径" })
    protected get boxRadius(): number {
        return this.radius;
    }
    protected set boxRadius(value: number) {
        this.radius = value;
        this.drawRadius();
    }

    @property({ displayName: "矩形大小" })
    protected get boxSize(): cc.Vec2 {
        return this.size;
    }
    protected set boxSize(value: cc.Vec2) {
        this.size = value;
        // 设置容器和图片的大小
        this.node.setContentSize(value.x, value.y);
        this.image.setContentSize(value.x, value.y);
    }

    /** 子节点 image */
    @property({ visible: false })
    private image: cc.Node = null;

    /** 缓存 Graphics 引用，避免每次 drawRadius 调用 getComponent */
    private _graphics: cc.Graphics = null;

    /** 缓存的 rect 对象，避免每次创建新的 */
    private _cachedRect: cc.Rect = cc.rect();

    /** 绘制圆角 */
    public drawRadius() {
        const size = this.node.getContentSize();
        // Reuse cached rect instead of creating new one
        this._cachedRect.x = -size.width / 2;
        this._cachedRect.y = -size.height / 2;
        this._cachedRect.width = size.width;
        this._cachedRect.height = size.height;
        // Use cached graphics reference
        if (!this._graphics) {
            this._graphics = this.getComponent(cc.Mask)["_graphics"];
        }
        this.drawRoundRect(this._graphics, this._cachedRect);
    }

    /**
     * 绘制圆角矩形
     * @param graphics
     * @param rect
     */
    private drawRoundRect(graphics: cc.Graphics, rect: cc.Rect) {
        let { x, y, width, height } = rect;
        graphics.clear();
        graphics.lineWidth = 1;
        graphics.roundRect(x, y, width, height, this.radius);
        graphics.fill();
        graphics.stroke();
    }

    /** 创建 image */
    private createImage() {
        if (cc.find("image", this.node)) return;
        this.image = new cc.Node("image");
        this.image.parent = this.node;
        this.image.addComponent(cc.Sprite);
        /** 图片组件 */
        let image_sprite = this.image.getComponent(cc.Sprite);
        image_sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    }

    // LIFE-CYCLE CALLBACKS:

    onEnable() {
        // 这里每次都要重新绘画
        this.drawRadius();
    }

    start() {
        // 这里写在onload里面不生效
        this.createImage();
        // console.log(this.size, this.radius);
    }
}

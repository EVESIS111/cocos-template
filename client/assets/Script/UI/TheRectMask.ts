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
        // Invalidate cache to force redraw
        this._lastWidth = 0;
        this._lastHeight = 0;
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

    /** 缓存 graphics 引用，避免每帧 getComponent 查找 */
    private _cachedGraphics: cc.Graphics = null;

    /** 缓存上一次的尺寸，只在尺寸变化时重绘 */
    private _lastWidth: number = 0;
    private _lastHeight: number = 0;

    /** 绘制圆角 */
    public drawRadius() {
        let size = this.node.getContentSize();
        // Skip redraw if size hasn't changed since last draw
        if (size.width === this._lastWidth && size.height === this._lastHeight) {
            return;
        }
        this._lastWidth = size.width;
        this._lastHeight = size.height;
        // Cache graphics reference
        if (!this._cachedGraphics) {
            this._cachedGraphics = this.getComponent(cc.Mask)["_graphics"];
        }
        // Draw directly without allocating a cc.Rect
        let hw = size.width / 2;
        let hh = size.height / 2;
        this._cachedGraphics.clear();
        this._cachedGraphics.lineWidth = 1;
        this._cachedGraphics.roundRect(-hw, -hh, size.width, size.height, this.radius);
        this._cachedGraphics.fill();
        this._cachedGraphics.stroke();
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
        // Invalidate cache and redraw on enable
        this._lastWidth = 0;
        this._lastHeight = 0;
        this.drawRadius();
    }

    start() {
        // 这里写在onload里面不生效
        this.createImage();
        // console.log(this.size, this.radius);
    }
}

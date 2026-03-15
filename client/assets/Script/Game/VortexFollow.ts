const {ccclass, property, menu} = cc._decorator;

@ccclass()
@menu("Game/旋涡式移动到指定目标")
export default class VortexFollw extends cc.Component {

    /** 指定目标 */
    @property({ type: cc.Node, displayName: "指定目标"})
    protected target: cc.Node = null;

    @property({ displayName: "速度值" })
    private speed: number = 0.02;

    /** 角度 */
    private angle = 0;

    /** 向量距离 */
    private distance = 0;

    private stop = false;

    /** 度到弧度的转换常量 */
    private static readonly DEG_TO_RAD: number = Math.PI / 180;

    /** 缓存的 Vec2，避免每帧创建新对象 */
    private _cachedPos: cc.Vec2 = cc.v2();

    private init() {
        this.stop = false;
        this.angle = 0;
        // Compute distance without creating temporary Vec2 objects
        const dx = this.target.x - this.node.x;
        const dy = this.target.y - this.node.y;
        this.distance = Math.sqrt(dx * dx + dy * dy);
    }

    private move() {
        this.angle += 5;
        this.distance = cc.misc.lerp(this.distance, 0, this.speed);
        const rad = this.angle * VortexFollw.DEG_TO_RAD;
        // Read target position once per frame instead of twice
        const tx = this.target.x;
        const ty = this.target.y;
        this._cachedPos.x = (tx + this.distance * Math.sin(rad)) >> 0;
        this._cachedPos.y = (ty + this.distance * Math.cos(rad)) >> 0;
        this.node.setPosition(this._cachedPos);
        if (this.distance < 1) {
            this.stop = true;
        }
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.init();
    }

    update(dt: number) {
        if (this.stop) return;
        this.move();
    }
}

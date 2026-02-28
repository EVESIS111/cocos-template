import Global from "../Global";

const { ccclass, property, menu } = cc._decorator;

@ccclass()
@menu("Game/轨道式追踪目标")
export default class TrackFollow extends cc.Component {

    /** 移动速度 */
    @property({ displayName: "移动速度" })
    protected speed: number = 2.5;

    /** 跟踪对象 */
    protected target: cc.Node = null;

    /** 终点距离 */
    private endDistance: number = 0;

    /** 缓存的 Vec2 对象，避免每帧创建新对象产生 GC 压力 */
    private _cachedPos: cc.Vec2 = cc.v2();

    /** 初始化 */
    private init() {
        this.target = Global.Game.targetNode;
        const targetDistance = Math.min(this.target.width * this.target.anchorX, this.target.height * this.target.anchorY);
        const selfDistance = this.node.height * this.node.anchorY;
        this.endDistance = targetDistance + selfDistance;
    }

    /** 跟踪导弹计算移动以及转向角度 */
    private followTarget() {
        const tx = this.target.x;
        const ty = this.target.y;
        const nx = this.node.x;
        const ny = this.node.y;
        // Compute delta and distance without creating temporary Vec2 objects
        const dx = tx - nx;
        const dy = ty - ny;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this.endDistance) {
            return;
        }

        const invDist = this.speed / distance;
        const moveX = dx * invDist;
        const moveY = dy * invDist;
        this.node.angle = Math.atan2(moveY, moveX) * 180 / Math.PI - 90;

        // Reuse cached Vec2 to avoid per-frame allocation
        this._cachedPos.x = nx + moveX;
        this._cachedPos.y = ny + moveY;
        this.node.setPosition(this._cachedPos);
    }

    // LIFE-CYCLE CALLBACKS:

    start() {
        this.init();
    }

    update(dt: number) {
        this.followTarget();
    }
}

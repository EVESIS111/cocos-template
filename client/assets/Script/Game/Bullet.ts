import Global from "../Global";

const { ccclass, property, menu } = cc._decorator;

@ccclass()
@menu("Game/子弹脚本")
export default class Bullet extends cc.Component {
    /** 子弹速度 */
    @property({
        displayName: "子弹速度",
    })
    private speed: number = 800;

    /** 子弹旋转角度 */
    @property({
        displayName: "子弹旋转角度",
    })
    private angle: number = 0;

    /** 发射 */
    private launch: boolean = false;

    /** 节点回收范围  */
    private range = {w: 0, h: 0}

    /** 缓存的 sin/cos 值，避免每帧重复计算 */
    private sinAngle: number = 0;
    private cosAngle: number = 0;

    /** 度到弧度的转换常量 */
    private static readonly DEG_TO_RAD: number = Math.PI / 180;

    /** 初始化 */
    private init() {
        /** 发射点 */
        let size = 80;
        /** 发射的炮台 */
        let node = Global.Game.batteryNode;
        this.node.angle = this.angle = node.angle;
        /** 缓存三角函数结果 - 角度在发射后不变 */
        const rad = this.angle * Bullet.DEG_TO_RAD;
        this.sinAngle = Math.sin(rad);
        this.cosAngle = Math.cos(rad);
        /** 转换成自己的坐标 */
        let pos = cc.v2(node.x - size * this.sinAngle, node.y + size * this.cosAngle);
        this.node.position = pos;
        this.launch = true;
    }

    // LIFE-CYCLE CALLBACKS:

    onEnable() {
        this.init();
    }

    onLoad() {
        let w = this.node.width / 2;
        
        this.range = {
            w: cc.winSize.width / 2 + w,
            h: cc.winSize.height / 2 + w
        }
    }

    // start () {}

    update (dt: number) {
        if (!this.launch) return;

        // Use cached sin/cos values instead of recalculating every frame
        const delta = dt * this.speed;
        this.node.x -= delta * this.sinAngle;
        this.node.y += delta * this.cosAngle;

        // Check bounds first (cheaper) before collision detection (more expensive)
        const x = this.node.x;
        const y = this.node.y;
        if (x > this.range.w || x < -this.range.w || y > this.range.h || y < -this.range.h) {
            this.launch = false;
            Global.Game.putBullet(this.node);
            return;
        }

        /** 检测是否相交 */
        let intersects = this.node.getBoundingBoxToWorld().intersects(Global.Game.ball.getBoundingBoxToWorld());

        if (intersects) {
            this.launch = false;
            Global.Game.putBullet(this.node);
            return Global.Game.setBoxColor();
        }
    }
}

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

    /** 缓存的角度三角函数值，避免每帧重复计算 */
    private sinAngle: number = 0;
    private cosAngle: number = 0;

    /** 初始化 */
    private init() {
        /** 发射点 */
        let size = 80;
        /** 发射的炮台 */
        let node = Global.Game.batteryNode;
        this.node.angle = this.angle = node.angle;
        /** 预计算角度的三角函数值（角度在发射后不变，无需每帧重算） */
        let radian = this.angle / 180 * Math.PI;
        this.sinAngle = Math.sin(radian);
        this.cosAngle = Math.cos(radian);
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

        // Use cached trig values instead of recalculating every frame
        let move = dt * this.speed;
        this.node.x -= move * this.sinAngle;
        this.node.y += move * this.cosAngle;

        // Check boundary first (cheaper) before expensive collision detection
        if (this.node.x > this.range.w || this.node.x < -this.range.w || this.node.y > this.range.h || this.node.y < -this.range.h) {
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

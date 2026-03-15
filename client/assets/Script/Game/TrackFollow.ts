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

    /** 初始化 */
    private init() {
        this.target = Global.Game.targetNode;
        const targetDistance = Math.min(this.target.width * this.target.anchorX, this.target.height * this.target.anchorY);
        const selfDistance = this.node.height * this.node.anchorY;
        // console.log(targetDistance, selfDistance);
        this.endDistance = targetDistance + selfDistance;
    }

    /** 跟踪导弹计算移动以及转向角度 */
    private followTarget() {
        const targetPosition = this.target.position; // 这里的目标坐标必须要和当前节点同一层父节点，否则要转换到相对坐标
        // Compute delta once and reuse (avoid computing sub twice with reversed operands)
        const dx = targetPosition.x - this.node.x;
        const dy = targetPosition.y - this.node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this.endDistance) {
            return;
        }

        const moveX = this.speed * dx / distance;
        const moveY = this.speed * dy / distance;
        const deltaRotation = Math.atan2(moveY, moveX) * 180 / Math.PI - 90;
        this.node.angle = deltaRotation;
        this.node.setPosition(this.node.x + moveX, this.node.y + moveY);
    }

    // LIFE-CYCLE CALLBACKS:

    start() {
        this.init();
    }

    update(dt: number) {
        this.followTarget();
    }
}

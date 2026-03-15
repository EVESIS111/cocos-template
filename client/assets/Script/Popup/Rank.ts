import Popup from "./Base";
import utils from "../utils";

const { ccclass, property, menu } = cc._decorator;

@ccclass()
@menu("弹出层/排行榜")
export default class Rank extends Popup {

    @property({ type: cc.WXSubContextView, displayName: "子域容器" })
    private subBox: cc.WXSubContextView = null;

    @property({ type: cc.Node, displayName: "世界榜容器" })
    private worldBox: cc.Node = null;

    @property({ displayName: "item数量" })
    private itemNumber: number = 5;

    @property({ type: cc.SpriteFrame, displayName: "奖杯图片" })
    private cupImg: cc.SpriteFrame[] = [];

    /** 页数 */
    private page: number = 0;

    /** 最大页数 */
    private page_max: number = 0;

    /** 排行榜列表 */
    private rank_list: any[] = [];

    /** item容器 */
    private item_box: cc.Node = null;

    /** 页数label */
    private page_label: cc.Label = null;
    
    /** 暂无数据提示 */
    private none_data: cc.Node = null;

    /** 默认头像 */
    private default_head: cc.SpriteFrame = null;

    /** 缓存的 item 组件引用，避免每次 updateItem 重复 cc.find + getComponent */
    private itemComponents: Array<{
        rank: cc.Label;
        cup: cc.Sprite;
        head: cc.Sprite;
        name: cc.Label;
        score: cc.Label;
    }> = [];

    /** 关闭按钮 */
    private closeBtn() {
        this.rankSwitch(null, "world");
        // 这里要下一帧执行
        this.scheduleOnce(() => {
            this.close();
        }, 0);
    }

    /**
     * 世界 - 好友榜切换
     * @param {event} e 
     * @param {string} type 
     */
    private rankSwitch(e: any, type: string) {
        switch (type) {
            case "world":
                this.worldBox.active = true;
                if (window["wx"]) {
                    wx.postMessage({
                        action: "hide",
                    });
                    // 这里要下一帧执行
                    this.scheduleOnce(() => {
                        this.subBox.update();
                    }, 0);
                }
                break;

            case "friend":
                this.worldBox.active = false;
                if (window["wx"]) {
                    wx.postMessage({
                        action: "show",
                    });
                    // 这里要下一帧执行
                    this.scheduleOnce(() => {
                        this.subBox.update();
                    }, 0);
                }
                break;
        }
    }

    /** 下一页 */
    private nextPage() {
        if (this.worldBox.active) {
            if (this.page >= this.page_max - 1) return;
            this.page += 1;
            this.updateItem();
        } else {
            // 子域切换
            if (window["wx"]) {
                wx.postMessage({
                    action: "next",
                });
                // 这里要下一帧执行
                this.scheduleOnce(() => {
                    this.subBox.update();
                }, 0);
            }
        }
    }

    /** 上一页 */
    private previousPage() {
        if (this.worldBox.active) {
            if (this.page == 0) return;
            this.page -= 1;
            this.updateItem();
        } else {
            // 子域切换
            if (window["wx"]) {
                wx.postMessage({
                    action: "previous",
                });
                // 这里要下一帧执行
                this.scheduleOnce(() => {
                    this.subBox.update();
                }, 0);
            }
        }
    }

    /** 更新item - uses cached component references instead of per-call cc.find */
    private updateItem() {
        /** 排行榜列表 */
        let list = this.rank_list;
        const children = this.item_box.children;
        // 遍历更新
        for (let i = 0; i < children.length; i++) {
            const item = children[i];
            const index = this.page * this.itemNumber + i;
            if (list[index]) {
                item.active = true;
                const cached = this.itemComponents[i];
                // 排名
                if (index < 3) {
                    cached.cup.node.active = true;
                    cached.cup.spriteFrame = this.cupImg[index];
                    cached.rank.node.active = false;
                } else {
                    cached.cup.node.active = false;
                    cached.rank.node.active = true;
                    cached.rank.string = (index + 1).toString();
                }
                // 头像
                if (list[index].headimgurl) {
                    utils.loadNetworkImg(cached.head.node, list[index].headimgurl);
                } else {
                    cached.head.spriteFrame = this.default_head;
                }
                cached.name.string = list[index].nickname;
                cached.score.string = list[index].score;
            } else {
                item.active = false;
            }
        }
        // 判断有无数据
        if (this.rank_list.length == 0) {
            this.none_data.active = true;
            this.page_label.string = "--/--";
        } else {
            this.none_data.active = false;
            this.page_label.string = this.page + 1 + "/" + this.page_max;
        }
    }

    /** 初始化 */
    private init() {
        /** item容器 */
        this.item_box = cc.find("content", this.worldBox);
        /** 页数label */
        this.page_label = cc.find("page-label", this.worldBox).getComponent(cc.Label);
        /** 暂无数据提示 */
        this.none_data = cc.find("tip", this.worldBox);
        /** 首个item */
        let item = cc.find("item", this.item_box);
        /** item预制体 */
        let prefab = cc.instantiate(item);
        /** 默认头像 */
        this.default_head = cc.find("head", item).getComponent(cc.Sprite).spriteFrame;
        for (let i = 1; i < this.itemNumber; i++) {
            const item = cc.instantiate(prefab);
            item.parent = this.item_box;
        }
        // Cache component references for all items to avoid repeated cc.find calls in updateItem
        this.itemComponents = [];
        this.item_box.children.forEach((child) => {
            this.itemComponents.push({
                rank: cc.find("rank", child).getComponent(cc.Label),
                cup: cc.find("cup", child).getComponent(cc.Sprite),
                head: cc.find("head", child).getComponent(cc.Sprite),
                name: cc.find("name", child).getComponent(cc.Label),
                score: cc.find("score", child).getComponent(cc.Label),
            });
        });
    }

    /** 测试列表 */
    private testList() {
        let list = [];
        for (let i = 0; i < 51; i++) {
            list.push({
                openid: "id" + i,
                nickname: "用户" + (i + 1),
                headimgurl: "",
                score: i + Math.floor(100 * Math.random())
            });
        }
        // 排序
        list.sort((a, b) => b.score - a.score);
        return list;
    }

    // LIFE-CYCLE CALLBACKS:

    onEnable() {
        this.showMove();
        // 接口请求完成后更新item
        this.rank_list = this.testList();
        // this.rank_list = [];
        // 页数重置为 0
        this.page = 0;
        // 最大页数
        this.page_max = Math.ceil(this.rank_list.length / this.itemNumber);
        // console.log("最大页数", this.page_max);
        this.updateItem();
        // 更新子域数据
        if (window["wx"]) {
            wx.postMessage({
                action: "update",
            })
        }
    }

    onLoad() {
        this.init();
        this.subBox.enabled = false;
    }

    // update (dt) {}
}

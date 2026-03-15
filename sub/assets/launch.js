/** 子域主程序脚本 这里我不用 ES6 因为如果在开发者工具中不勾选 ES6 转 ES5 的话会导致子域报错 */
cc.Class({
    extends: cc.Component,

    properties: {
        rankBox: {
            default: null,
            type: cc.Node,
            displayName: '整体界面'
        },
        itemNumber: {
            default: 5,
            displayName: 'item数量'
        },
        cupImg: {
            default: [],
            type: cc.SpriteFrame,
            displayName: '奖杯图片'
        },
    },

    /**
     * 加载图片
     * @param {cc.Node} node 节点
     * @param {string} src 路径
     */
    loadImg: function (node, src) {
        if (!src) return;
        var image = wx.createImage();
        image.onload = function () {
            var texture = new cc.Texture2D();
            texture.initWithElement(image);
            texture.handleLoadedTexture();
            var frame = new cc.SpriteFrame(texture);
            node.getComponent(cc.Sprite).spriteFrame = frame;
        }
        image.src = src;
    },

    /**
     * 获取图片缓存
     * @param {number} index 索引
     * @param {string } src 路径
     */
    createImage: function(index, src) {
        if (!src) return null;
        var THAT = this;
        var image = wx.createImage();
        image.onload = function () {
            var texture = new cc.Texture2D();
            texture.initWithElement(image);
            texture.handleLoadedTexture();
            var frame = new cc.SpriteFrame(texture);
            THAT.rank_list[index].spriteFrame = frame;
        }
        image.src = src;
    },

    // 下一页
    nextPage: function () {
        if (this.page >= this.page_max - 1) return;
        this.page += 1;
        this.updateItem();
    },

    // 上一页
    previousPage: function () {
        if (this.page == 0) return;
        this.page -= 1;
        this.updateItem();
    },

    // 更新item - uses cached component references instead of per-call cc.find
    updateItem: function () {
        var THAT = this;
        /** 排行榜列表 */
        var list = this.rank_list;
        var children = this.item_box.children;
        // 遍历更新 - use for loop instead of forEach for better performance
        for (var i = 0; i < children.length; i++) {
            var item = children[i];
            /** 排名 */
            var index = THAT.page * THAT.itemNumber + i;
            if (list[index]) {
                item.active = true;
                // Use cached component references instead of cc.find per update
                var cached = THAT._itemComponents[i];
                // 排名
                if (index < 3) {
                    cached.cup.node.active = true;
                    cached.cup.spriteFrame = THAT.cupImg[index];
                    cached.rank.node.active = false;
                } else {
                    cached.cup.node.active = false;
                    cached.rank.node.active = true;
                    cached.rank.string = index + 1;
                }
                // 头像
                cached.head.spriteFrame = list[index].spriteFrame;
                cached.name.string = list[index].nickName;
                cached.score.string = list[index].score;
            } else {
                item.active = false;
            }
        }
        // 判断有无数据
        if (this.rank_list.length == 0) {
            this.none_data.active = true;
            this._noneDataLabel.string = '暂无数据...';
            this.page_label.string = '--/--';
        } else {
            this.none_data.active = false;
            this.page_label.string = this.page + 1 + '/' + this.page_max;
        }
    },

    // 初始化
    init: function () {
        /** item容器 */
        this.item_box = cc.find('content', this.rankBox);
        /** 页数label */
        this.page_label = cc.find('page-label', this.rankBox).getComponent(cc.Label);
        /** 暂无数据提示 */
        this.none_data = cc.find('tip', this.rankBox);
        /** 缓存 none_data 的 Label 组件 */
        this._noneDataLabel = this.none_data.getComponent(cc.Label);
        /** 首个item */
        var item = cc.find('item', this.item_box);
        /** item预制体 */
        var prefab = cc.instantiate(item);
        /** 默认头像 */
        this.default_head = cc.find('head', item).getComponent(cc.Sprite).spriteFrame;
        for (var i = 1; i < this.itemNumber; i++) {
            var newItem = cc.instantiate(prefab);
            newItem.parent = this.item_box;
        }
        // Cache component references for all items to avoid repeated cc.find calls in updateItem
        this._itemComponents = [];
        var children = this.item_box.children;
        for (var j = 0; j < children.length; j++) {
            this._itemComponents.push({
                rank: cc.find('rank', children[j]).getComponent(cc.Label),
                cup: cc.find('cup', children[j]).getComponent(cc.Sprite),
                head: cc.find('head', children[j]).getComponent(cc.Sprite),
                name: cc.find('name', children[j]).getComponent(cc.Label),
                score: cc.find('score', children[j]).getComponent(cc.Label),
            });
        }
    },

    /**
     * 格式化数据
     * @param {Array} data 数组
     * @param {object} slef 个人数据
     */
    formatList: function (data, slef) {
        var list = [], slefData = null;
        var THAT = this;
        // 整理数据（所有排行数据）
        list = data.map(function (item) {
            var KVD = null;

            if (item.KVDataList.length) {
                KVD = JSON.parse(item.KVDataList.filter(function (list) { return list.key === 'all' })[0].value);
            } else {
                KVD = {
                    wxgame: {
                        score: 0,
                        update_time: 0
                    }
                }
            }

            return {
                openid: item.openid,
                nickName: item.nickname, // 注意这里微信返回的是小写 n
                avatarUrl: item.avatarUrl,
                score: KVD.wxgame.score,
                update_time: KVD.wxgame.update_time,
                spriteFrame: THAT.default_head
            }
        });

        list.sort(function (a, b) {
            return b.score - a.score;
        });

        for (var i = 0; i < list.length; i++) {
            if (list[i].nickName == slef.nickName && list[i].avatarUrl == slef.avatarUrl) {
                slefData = list[i];
                slefData.index = i;
                break;
            }

        }

        // 更新排行榜数据
        this.rank_list = list;
        // 这里把所有图片加载出来并缓存
        for (var i = 0; i < list.length; i++) {
            this.createImage(i, list[i].avatarUrl);
        }
        // 页数重置为 0
        this.page = 0;
        // 最大页数
        this.page_max = Math.ceil(this.rank_list.length / this.itemNumber);
    },

    /** 获取数据并生成内容 */
    getData: function () {
        if (this.compareVersion('1.9.92') < 0) return;
        var THAT = this;
        wx.getUserInfo({
            openIdList: ['selfOpenId'],
            success: function (res) {
                if (res.errMsg != 'getUserInfo:ok') return;
                var self = res.data[0];
                // 获取微信数据
                wx.getFriendCloudStorage({
                    keyList: ['all'],
                    success: function (res) {
                        /** 格式化后的数据 */
                        THAT.formatList(res.data, self);
                    },
                    fail: function (err) {
                        console.warn('子域 获取微信数据失败', err);
                    }
                });
            },
            fail: function (err) {
                console.warn('子域 获取用户信息失败', err);
            }
        });
    },

    /**
     * 上传分数 发送过来的数据
     * @param {string} score
     */
    postScore: function (score) {
        if (this.compareVersion('1.9.92') < 0) return;

        /** 上传到微信服务器 */
        function postWeChat() {
            var kvDataValue = {
                wxgame: {
                    score: score,
                    update_time: parseInt(new Date().getTime() / 1000),
                }
            };
            var kvData = {
                key: 'all',
                value: JSON.stringify(kvDataValue)
            };
            wx.setUserCloudStorage({
                KVDataList: [kvData],
                success: function (res) {
                    console.log('设置子域数据成功 >>', res);
                }
            });
        };

        // 获取存储数据
        wx.getUserCloudStorage({
            keyList: ['all'],
            success: function (res) {
                if (res.errMsg != 'getUserCloudStorage:ok') return;
                if (res.KVDataList.length == 0) return postWeChat();
                var rankData = JSON.parse(res.KVDataList[0].value);

                // 微信服务器数据
                var wx_score = rankData.wxgame.score ? rankData.wxgame.score : null;

                if (wx_score == null) {
                    postWeChat();
                } else if (score > wx_score) {
                    postWeChat();
                }
            }
        });
    },

    /**
     * 对比版本 - caches system info to avoid repeated wx.getSystemInfoSync() calls
     * @param {string} v2 对比的版本
     */
    compareVersion: function (v2) {
        // Cache system info on first call instead of calling getSystemInfoSync every time
        if (!this._sdkVersion) {
            this._sdkVersion = wx.getSystemInfoSync().SDKVersion;
        }
        var v1 = this._sdkVersion.split('.');
        v2 = v2.split('.');
        var len = Math.max(v1.length, v2.length);

        while (v1.length < len) {
            v1.push('0');
        }
        while (v2.length < len) {
            v2.push('0');
        }
        for (var i = 0; i < len; i++) {
            var num1 = parseInt(v1[i]);
            var num2 = parseInt(v2[i]);

            if (num1 > num2) {
                return 1;
            } else if (num1 < num2) {
                return -1;
            }
        }
        return 0;
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        this.page = 0;
        this.page_max = 0;
        this.rank_list = [];
        this._itemComponents = [];
        this._sdkVersion = null;
        this._noneDataLabel = null;
        this.init();
    },

    start: function () {
        var THAT = this;
        // 监听显示
        if (window.wx) {
            wx.onMessage(function (data) {
                var text = data.action;
                switch (text) {
                    case 'uploadScore':
                        // 上传分数
                        THAT.postScore(data.score);
                        break;

                    case 'update':
                        THAT.getData();
                        break;

                    case 'show':
                        THAT.rankBox.active = true;
                        THAT.updateItem();
                        break;

                    case 'hide':
                        THAT.rankBox.active = false;
                        break;

                    case 'next':
                        THAT.nextPage();
                        break;

                    case 'previous':
                        THAT.previousPage();
                        break;
                }
            });
            this.getData();
        }
    },

    // update (dt) {},
});

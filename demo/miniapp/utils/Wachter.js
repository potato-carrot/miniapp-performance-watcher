class Watcher {
    static instance

    constructor() {
        if (Watcher.instance === this.getUtils().noop()) {
            this.CONSTANTS = {
                ON_LOAD: "onLoad",
                LIFE_TIMES: "lifetimes",
                ATTACHED: "attached",
                LOG: {
                    SOURCE: "来源",
                    DATA: "数据",
                    DATA_LENGTH: "数据长度",
                    COST_TIME: "耗时"
                }
            }

            this.queueLog = []
            this.consoleFlag = false
            this.timer = null

            Watcher.instance = this
        }
        return Watcher.instance
    }

    /**
     * 启动性能监控
     */
    run() {
        this.consoleFlag = true

        const self = this
        const { ON_LOAD, ATTACHED, LIFE_TIMES } = self.CONSTANTS
        const Utils = self.getUtils()

        /**
         * 代理小程序全局函数Page
         * 在每个页面的onLoad钩子中注入setData监控
         */
        Page = new Proxy(Page, {
            apply(target, ctx, [config]) {
                config[ON_LOAD] = new Proxy(config[ON_LOAD] || Utils.createFn(), {
                    apply: function (target, ctx, args) {
                        self.setDataProxy(ctx)
                        return Reflect.apply(...arguments)
                    }
                })
                return Reflect.apply(...arguments)
            }
        })

        /**
         * 代理小程序全局函数Component
         * 在每个组件的attached钩子中注入setData监控
         * 如果组件中声明了component.lifetimes.attached或未声明attached，则在component.liftimes.attached中注入
         * 如果组件未声明component.lifetimes.attached，而声明了component.attached，则在component.attached中注入
         */
        Component = new Proxy(Component, {
            apply(target, ctx, [config]) {
                if (config.hasOwnProperty(LIFE_TIMES) && config[LIFE_TIMES].hasOwnProperty(ATTACHED)) {
                    config[LIFE_TIMES][ATTACHED] = new Proxy(config[LIFE_TIMES][ATTACHED] || Utils.createFn(), {
                        apply(target, ctx, args) {
                            self.setDataProxy(ctx)
                            return Reflect.apply(...arguments)
                        }
                    })
                } else if (config.hasOwnProperty(ATTACHED)) {
                    config[ATTACHED] = new Proxy(config[ATTACHED] || Utils.createFn(), {
                        apply(target, ctx, args) {
                            self.setDataProxy(ctx)
                            return Reflect.apply(...arguments)
                        }
                    })
                } else {
                    config[LIFE_TIMES] = Object.assign(config[LIFE_TIMES] || {}, { [ATTACHED]: Utils.createFn() })
                    config[LIFE_TIMES][ATTACHED] = new Proxy(config[LIFE_TIMES][ATTACHED] || Utils.createFn(), {
                        apply(target, ctx, args) {
                            self.setDataProxy(ctx)
                            return Reflect.apply(...arguments)
                        }
                    })
                }
                return Reflect.apply(...arguments)
            }
        })
    }

    /**
     * 停止性能监控在控制台输出
     * 由于Page和Component原始函数已被代理，故这里只是停止在控制台输出
     * 此时Page/Component/setData的代理仍然存在
     */
    stop() {
        this.consoleFlag = false
    }

    /**
     * 在Page和Component中代理小程序的setData方法
     * @param {Object} ctx setData时的上下文环境
     */
    setDataProxy(ctx) {
        const self = this
        const { SOURCE, DATA, DATA_LENGTH, COST_TIME } = self.CONSTANTS.LOG
        ctx.setData = new Proxy(ctx.setData, {
            apply(target, ctx, [dataSource, callback = self.getUtils().createFn()]) {
                const setDataBeginTime = new Date().getTime()
                callback = new Proxy(callback, {
                    apply(target, ctx, args) {
                        const setDataEndTime = new Date().getTime()
                        self.queueLog.push({
                            [SOURCE]: ctx.is,
                            [DATA]: JSON.stringify(dataSource),
                            [DATA_LENGTH]: JSON.stringify(dataSource).length,
                            [COST_TIME]: setDataEndTime - setDataBeginTime
                        })
                        self.log()
                        return Reflect.apply(...arguments)
                    }
                })
                arguments[2][1] = callback
                return Reflect.apply(...arguments)
            }
        })
    }

    /**
     * 打印
     */
    log() {
        const { COST_TIME } = this.CONSTANTS.LOG
        if (!this.timer && this.consoleFlag) {
            this.timer = setTimeout(() => {
                console.log('setData频率：%c%s', 'padding: 2px 4px;background: orange;color: white;border-radius: 2px;', `${this.queueLog.length}/s`);
                console.table(this.queueLog.sort((a, b) => { a[COST_TIME] - b[COST_TIME] }))
                this.queueLog = []
                clearTimeout(this.timer)
                this.timer = null
            }, 1000)
        }
    }

    /**
     * 一些工具方法
     * @returns {Object}
     */
    getUtils() {
        return {

            // 返回undefined
            noop() {
                return void 0
            },

            // 创建一个空函数
            createFn() {
                return function () { }
            }
        }
    }
}

module.exports = new Watcher()
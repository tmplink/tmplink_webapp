/**
 * 通用列表自动加载模块
 * 用于处理滚动到底部时自动加载更多内容的功能
 */
class AutoLoader {
    /**
     * 创建自动加载实例
     * @param {Object} options - 配置选项
     * @param {Function} options.loadFunction - 加载数据的函数，接收page参数(0表示初始加载,1表示加载更多)
     * @param {Number} options.threshold - 滚动触发阈值，默认100px
     * @param {Number} options.minScrollTop - 最小滚动位置，默认100px
     * @param {Number} options.minItemsForDisable - 当结果少于此数量时禁用自动加载，默认50
     */
    constructor(options) {
        this.options = Object.assign({
            threshold: 100,
            minScrollTop: 100,
            minItemsForDisable: 50
        }, options);

        this.autoload = true;
        this.isScrollListenerActive = false;
    }

    /**
     * 启用自动加载
     */
    enable() {
        this.autoload = true;
        if (!this.isScrollListenerActive) {
            this.bindScrollEvent();
        }
    }

    /**
     * 禁用自动加载
     */
    disable() {
        this.autoload = false;
        this.unbindScrollEvent();
    }

    /**
     * 绑定滚动事件
     */
    bindScrollEvent() {
        this.isScrollListenerActive = true;
        $(window).on("scroll", this.handleScroll.bind(this));
    }

    /**
     * 解绑滚动事件
     */
    unbindScrollEvent() {
        this.isScrollListenerActive = false;
        $(window).off("scroll");
    }

    /**
     * 处理滚动事件
     * @param {Event} event - 滚动事件对象
     */
    handleScroll(event) {
        const scrollTop = $(event.currentTarget).scrollTop();
        const windowHeight = $(window).height();
        const docHeight = $(document).height();
        const scrollThreshold = scrollTop + windowHeight + this.options.threshold;

        if (scrollThreshold >= docHeight && scrollTop > this.options.minScrollTop) {
            if (this.autoload) {
                this.autoload = false; // 防止多次触发
                this.options.loadFunction(1); // 加载更多数据
            }
        }
    }

    /**
     * 处理服务器响应
     * @param {Object} response - 服务器响应数据
     * @returns {Boolean} - 是否有更多数据可加载
     */
    handleResponse(response) {
        if (response.status === 0 || (response.data && response.data.length < this.options.minItemsForDisable)) {
            this.unbindScrollEvent();
            return false;
        } else {
            this.autoload = true;
            return true;
        }
    }

    /**
     * 加载数据
     * @param {Number} page - 页码，0表示初始加载，1表示加载更多
     * @returns {Boolean} - 是否继续加载
     */
    load(page) {
        // 如果是手动刷新(page=0)，重置自动加载状态
        if (page === 0) {
            this.autoload = true;
            this.bindScrollEvent();
        } else if (!this.autoload && page !== 0) {
            // 如果自动加载被禁用且不是手动刷新，则不执行加载
            return false;
        }

        // 执行传入的加载函数
        return this.options.loadFunction(page);
    }
}
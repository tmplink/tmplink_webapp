class notification {
    parent_op = null
    confirmedNotifications = {}  // 存储通知确认状态
    storageKey = 'app_notification_confirmed'

    init(parent_op) {
        this.parent_op = parent_op
        // 初始化时显示未确认的通知
        this.showUnconfirmed()
        // 绑定确认事件
        this.bindConfirmEvents()
    }

    // 加载已确认的通知记录
    loadConfirmations() {
        const stored = localStorage.getItem(this.storageKey)
        if (stored) {
            try {
                this.confirmedNotifications = JSON.parse(stored)
            } catch (e) {
                this.confirmedNotifications = {}
                this.saveConfirmations()
            }
        }
    }

    saveConfirmations() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.confirmedNotifications))
    }

    /**
     * 确认用户已查看通知
     * @param {string} key - 通知的唯一标识符
     * @returns {boolean} - 是否成功确认
     */
    confirm(key) {
        if (!key) {
            return false
        }
        
        this.confirmedNotifications[key] = {
            timestamp: Date.now()
        }
        
        this.saveConfirmations()
        
        // 隐藏对应的通知
        const element = document.querySelector(`[data-notify="${key}"]`)
        if (element) {
            element.style.display = 'none'
            // 触发自定义事件
            const event = new CustomEvent('notificationConfirmed', {
                detail: { key: key }
            })
            document.dispatchEvent(event)
        }
        
        return true
    }

    /**
     * 检查通知是否已被确认
     * @param {string} key - 通知的唯一标识符
     * @returns {boolean} - 是否已确认
     */
    isConfirmed(key) {
        return !!this.confirmedNotifications[key]
    }

    /**
     * 显示所有未确认的通知
     */
    showUnconfirmed() {
        // 获取所有通知元素
        const notifications = document.querySelectorAll('[data-notify]')
        
        // 首先隐藏所有通知元素
        notifications.forEach(element => {
            element.style.display = 'none'
        })
        
        // 显示未确认的通知
        notifications.forEach(element => {
            const key = element.dataset.notify
            if (!this.isConfirmed(key)) {
                this.fadeIn(element)
            }
        })
    }

    /**
     * 绑定确认按钮事件
     */
    bindConfirmEvents() {
        document.addEventListener('click', (event) => {
            const target = event.target
            if (target.hasAttribute('data-notify-confirm')) {
                const key = target.getAttribute('data-notify-confirm')
                this.confirm(key)
            }
        })
    }

    /**
     * 淡入效果
     * @param {HTMLElement} element - 要显示的元素
     */
    fadeIn(element) {
        element.style.opacity = 0
        element.style.display = 'block'

        let opacity = 0
        const timer = setInterval(() => {
            opacity += 0.1
            if (opacity >= 1) {
                clearInterval(timer)
                element.style.opacity = 1
            }
            element.style.opacity = opacity
        }, 50)
    }

    /**
     * 重置所有通知的确认状态
     */
    reset() {
        this.confirmedNotifications = {}
        this.saveConfirmations()
        this.showUnconfirmed()
    }

    /**
     * 清理30天前的已确认通知
     */
    cleanup() {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
        
        Object.entries(this.confirmedNotifications).forEach(([key, data]) => {
            if (data.timestamp < thirtyDaysAgo) {
                delete this.confirmedNotifications[key]
            }
        })
        
        this.saveConfirmations()
    }
}
/**
 * AI 聊天服务核心类
 * 遵循项目API调用规范
 */
class ai {
    
    parent_op = null
    conversations = []
    currentConversationId = null
    isLoading = false
    currentMessages = []
    
    /**
     * 初始化AI服务
     * @param {tmplink} parent_op 父对象实例
     */
    init(parent_op) {
        this.parent_op = parent_op
    }
    
    /**
     * 初始化AI界面和事件
     */
    initUI() {
        // 设置页面标题和描述
        app.languageBuild()
        $('title').html('智能小薇 - TMP.LINK')
        $('meta[name=description]').attr('content', '智能小薇，智能对话体验')

        // 初始化界面
        this.initListView()
        
        // 显示AI聊天界面
        setTimeout(() => {
            $('#ai_chat').show()
        }, 100)
        
        // 加载对话历史
        this.loadConversationHistory()

        // 绑定事件
        this.bindEvents()
    }
    
    /**
     * 初始化AI listview界面
     */
    initListView() {
        // 设置navbar
        TL.workspace_navbar()
        
        // 移动端UI调整
        $('.mobile-head-padding-large').css('padding-top', '14vh')
    }
    
    /**
     * 绑定AI事件
     */
    bindEvents() {
        // 输入框自动调整大小和字符计数
        $('#ai_input').on('input', () => {
            this.autoResizeTextarea($('#ai_input')[0])
        })
        
        // 回车发送消息
        $('#ai_input').on('keypress', (e) => {
            if (e.keyCode === 13 && !e.shiftKey) {
                e.preventDefault()
                this.sendMessage()
            }
        })
    }
    
    /**
     * 加载对话历史
     */
    loadConversationHistory() {
        this.getHistoryList(20, 
            (conversations) => {
                this.updateConversationListUI(conversations)
            },
            (error) => {
                console.error('加载对话历史失败:', error)
                this.updateConversationListUI([])
            }
        )
    }
    
    /**
     * 更新对话列表UI
     */
    updateConversationListUI(conversations) {
        // 检测是否为移动端
        const isMobile = isMobileScreen()
        
        // 根据设备类型选择容器和模板
        let listContainer, template, noConvElement
        
        if (isMobile) {
            listContainer = $('#ai_conversation_list_mobile_new')
            template = 'ai_conversation_list_mobile_new_tpl'
            noConvElement = $('.no_conversations_mobile')
            
            // 显示移动端主容器
            $('#ai_chat_mobile').show()
        } else {
            listContainer = $('#ai_conversation_list')
            template = 'ai_conversation_list_tpl'
            noConvElement = $('.no_conversations')
        }
        
        listContainer.empty()
        
        if (!conversations || conversations.length === 0) {
            noConvElement.show()
            return
        } else {
            noConvElement.hide()
        }
        
        // 使用模板渲染对话列表
        try {
            const html = app.template(template, conversations)
            listContainer.html(html)
        } catch (error) {
            console.error('Error rendering conversation list template:', error)
            
            // 如果模板渲染失败，手动生成HTML作为备选方案
            let fallbackHtml = ''
            conversations.forEach(conv => {
                fallbackHtml += `
                    <div class="conversation-item mb-1 p-2 rounded conversation_unit_${conv.conversation_id}" 
                         data-conversation-id="${conv.conversation_id}" 
                         onclick="TL.ai.switchConversation('${conv.conversation_id}');"
                         style="cursor: pointer; transition: all 0.2s;">
                        
                        <div class="d-flex align-items-start">
                            <iconpark-icon name="message-circle" class="fa-fw text-muted mr-2 mt-1" style="font-size: 12px;"></iconpark-icon>
                            <div class="flex-fill" style="min-width: 0;">
                                <div class="conversation-title text-truncate" style="font-size: 13px; line-height: 1.3;">
                                    ${conv.title || '新对话'}
                                </div>
                                <div class="small text-muted" style="font-size: 11px;">
                                    ${conv.time}
                                </div>
                            </div>
                            <div class="conversation-actions" style="opacity: 0; transition: opacity 0.2s;">
                                <button onclick="TL.ai.deleteConversationUI('${conv.conversation_id}'); event.stopPropagation();" 
                                        class="btn btn-sm btn-link text-danger p-1" 
                                        title="删除对话"
                                        style="font-size: 12px; color: #dc3545 !important;">
                                    <iconpark-icon name="trash" class="fa-fw"></iconpark-icon>
                                </button>
                            </div>
                        </div>
                    </div>
                `
            })
            
            listContainer.html(fallbackHtml)
        }
    }
    
    /**
     * 发起新对话
     * @param {string} message 用户消息
     * @param {function} callback 成功回调
     * @param {function} errorCallback 错误回调
     */
    chat(message, callback, errorCallback) {
        $.post(this.parent_op.api_url + '/ai', {
            'action': 'chat',
            'token': this.parent_op.api_token,
            'message': message
        }, (rsp) => {
            if (rsp.status === 1) {
                if (callback) callback(rsp.data)
            } else if (rsp.status === 5) {
                // API暂时不可用，建议重试
                if (errorCallback) errorCallback('AI服务暂时不可用，请稍后再试')
            } else {
                if (errorCallback) errorCallback(rsp.data)
            }
        }, 'json').fail((xhr, textStatus, errorThrown) => {
            let errorMessage = '发送消息失败'
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message
            } else if (textStatus) {
                errorMessage = `请求失败: ${textStatus}`
            }
            if (errorCallback) errorCallback(errorMessage)
        })
    }
    
    /**
     * 继续对话
     * @param {string} conversationId 对话ID
     * @param {string} message 用户消息
     * @param {function} callback 成功回调
     * @param {function} errorCallback 错误回调
     */
    continue(conversationId, message, callback, errorCallback) {
        $.post(this.parent_op.api_url + '/ai', {
            'action': 'continue',
            'token': this.parent_op.api_token,
            'conversation_id': conversationId,
            'message': message
        }, (rsp) => {
            if (rsp.status === 1) {
                if (callback) callback(rsp.data)
            } else if (rsp.status === 5) {
                // API暂时不可用，建议重试
                if (errorCallback) errorCallback('AI服务暂时不可用，请稍后再试')
            } else {
                if (errorCallback) errorCallback(rsp.data)
            }
        }, 'json').fail((xhr, textStatus, errorThrown) => {
            let errorMessage = '发送消息失败'
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message
            } else if (textStatus) {
                errorMessage = `请求失败: ${textStatus}`
            }
            if (errorCallback) errorCallback(errorMessage)
        })
    }
    
    /**
     * 获取用户状态
     * @param {function} callback 成功回调
     * @param {function} errorCallback 错误回调
     */
    getStatus(callback, errorCallback) {
        $.post(this.parent_op.api_url + '/ai', {
            'action': 'status',
            'token': this.parent_op.api_token
        }, (rsp) => {
            if (rsp.status === 1) {
                if (callback) callback(rsp.data)
            } else if (rsp.status === 5) {
                // API暂时不可用，建议重试
                if (errorCallback) errorCallback('AI服务暂时不可用，请稍后再试')
            } else {
                if (errorCallback) errorCallback(rsp.data)
            }
        }, 'json').fail((xhr, textStatus, errorThrown) => {
            let errorMessage = '获取状态失败'
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message
            } else if (textStatus) {
                errorMessage = `请求失败: ${textStatus}`
            }
            if (errorCallback) errorCallback(errorMessage)
        })
    }
    
    /**
     * 获取对话历史列表
     * @param {number} limit 限制数量
     * @param {function} callback 成功回调
     * @param {function} errorCallback 错误回调
     */
    getHistoryList(limit, callback, errorCallback) {
        $.post(this.parent_op.api_url + '/ai', {
            'action': 'history',
            'token': this.parent_op.api_token,
            'limit': limit.toString()
        }, (rsp) => {
            if (rsp.status === 1) {
                this.conversations = rsp.data
                if (callback) callback(rsp.data)
            } else if (rsp.status === 5) {
                // API暂时不可用，建议重试
                if (errorCallback) errorCallback('AI服务暂时不可用，请稍后再试')
            } else {
                if (errorCallback) errorCallback(rsp.data)
            }
        }, 'json').fail((xhr, textStatus, errorThrown) => {
            let errorMessage = '获取对话历史失败'
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message
            } else if (textStatus) {
                errorMessage = `请求失败: ${textStatus}`
            }
            if (errorCallback) errorCallback(errorMessage)
        })
    }
    
    /**
     * 获取对话详情
     * @param {string} conversationId 对话ID
     * @param {function} callback 成功回调
     * @param {function} errorCallback 错误回调
     */
    getConversationDetail(conversationId, callback, errorCallback) {
        $.post(this.parent_op.api_url + '/ai', {
            'action': 'get_conversation',
            'token': this.parent_op.api_token,
            'conversation_id': conversationId
        }, (rsp) => {
            if (rsp.status === 1) {
                if (callback) callback(rsp.data)
            } else if (rsp.status === 5) {
                // API暂时不可用，建议重试
                if (errorCallback) errorCallback('AI服务暂时不可用，请稍后再试')
            } else {
                if (errorCallback) errorCallback(rsp.data)
            }
        }, 'json').fail((xhr, textStatus, errorThrown) => {
            let errorMessage = '获取对话详情失败'
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message
            } else if (textStatus) {
                errorMessage = `请求失败: ${textStatus}`
            }
            if (errorCallback) errorCallback(errorMessage)
        })
    }
    
    /**
     * 删除对话
     * @param {string} conversationId 对话ID
     * @param {function} callback 成功回调
     * @param {function} errorCallback 错误回调
     */
    deleteConversation(conversationId, callback, errorCallback) {
        $.post(this.parent_op.api_url + '/ai', {
            'action': 'delete',
            'token': this.parent_op.api_token,
            'conversation_id': conversationId
        }, (rsp) => {
            if (rsp.status === 1) {
                // 从本地列表中移除
                this.conversations = this.conversations.filter(
                    conv => conv.conversation_id !== conversationId
                )
                if (callback) callback(true)
            } else if (rsp.status === 5) {
                // API暂时不可用，建议重试
                if (errorCallback) errorCallback('AI服务暂时不可用，请稍后再试')
            } else {
                if (errorCallback) errorCallback(rsp.data)
            }
        }, 'json').fail((xhr, textStatus, errorThrown) => {
            let errorMessage = '删除对话失败'
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message
            } else if (textStatus) {
                errorMessage = `请求失败: ${textStatus}`
            }
            if (errorCallback) errorCallback(errorMessage)
        })
    }
    
    /**
     * 开始新对话（移动端使用）
     */
    startNewConversation() {
        // 清空当前对话状态
        this.currentConversationId = null
        this.currentMessages = []
        
        // 清空消息区域，显示欢迎界面
        $('#ai_messages_mobile').empty()
        $('#ai_welcome_mobile').show()
        
        // 清空输入框
        $('#ai_input_mobile').val('')
        this.updateCharCount(true)
        
        // 设置模态框标题
        $('#aiChatModalMobileTitle').text('智能小薇 - 新对话')
        
        // 聚焦到输入框
        setTimeout(() => {
            $('#ai_input_mobile').focus()
        }, 100)
    }

    /**
     * 新建对话
     */
    newConversation() {
        // 清空当前对话状态，准备新对话
        this.currentConversationId = null
        this.currentMessages = []
        
        // 清除所有对话的激活状态
        $('.conversation-item').removeClass('active')
        
        // 清空消息区域，显示欢迎界面
        $('#ai_messages').html(`
            <div class="text-center text-muted py-5">
                <iconpark-icon name="star-one" class="fa-fw fa-3x mb-3 text-primary"></iconpark-icon>
                <h5 class="text-muted">开始新对话</h5>
                <p class="text-muted small">输入您的问题，智能小薇将为您解答</p>
            </div>
        `)
        
        // 聚焦到输入框
        setTimeout(() => {
            $('#ai_input').focus()
        }, 100)
    }

    /**
     * 切换对话
     */
    switchConversation(conversationId) {
        // 更新UI状态
        $('.conversation-item').removeClass('active')
        $(`.conversation_unit_${conversationId}`).addClass('active')
        
        // 加载对话详情
        this.openConversation(conversationId)
    }

    /**
     * 打开对话
     */
    openConversation(conversationId) {
        // 检测是否为移动端
        const isMobile = isMobileScreen()
        const messagesContainer = isMobile ? '#ai_messages_mobile' : '#ai_messages'
        
        // 显示加载状态
        $(messagesContainer).html(`
            <div class="text-center text-muted py-5">
                <div class="spinner-border text-primary mb-3"></div>
                <div>加载对话中...</div>
            </div>
        `)
        
        // 隐藏移动端欢迎界面
        if (isMobile) {
            $('#ai_welcome_mobile').hide()
        }
        
        this.getConversationDetail(conversationId,
            (conversation) => {
                this.currentConversationId = conversationId
                this.currentMessages = conversation.messages || []
                
                // 更新模态框标题
                if (isMobile) {
                    $('#aiChatModalMobileTitle').text(conversation.title || '智能小薇')
                }
                
                // 渲染消息历史
                $(messagesContainer).empty()
                if (this.currentMessages.length > 0) {
                    this.currentMessages.forEach(msg => {
                        if (isMobile) {
                            this.addMobileMessageToChat(msg.role, msg.content, false)
                        } else {
                            this.addMessageToChat(msg.role, msg.content, false)
                        }
                    })
                    // 滚动到底部
                    if (isMobile) {
                        const container = $(messagesContainer)
                        if (container.length > 0 && container[0]) {
                            container.scrollTop(container[0].scrollHeight)
                        }
                    } else {
                        this.scrollToBottom(false)
                    }
                } else {
                    $(messagesContainer).html(`
                        <div class="text-center text-muted py-5">
                            <iconpark-icon name="star-one" class="fa-fw fa-3x mb-3 text-primary"></iconpark-icon>
                            <h5 class="text-muted">继续与智能小薇对话吧！</h5>
                            <p class="text-muted small">这是您之前的对话，可以继续提问</p>
                        </div>
                    `)
                }
            },
            (error) => {
                console.error('加载对话失败:', error)
                $(messagesContainer).html(`
                    <div class="text-center text-muted py-5">
                        <iconpark-icon name="error-view" class="fa-fw fa-3x mb-3 text-danger"></iconpark-icon>
                        <h5 class="text-muted">加载失败</h5>
                        <p class="text-muted small">无法加载对话内容: ${error}</p>
                    </div>
                `)
            }
        )
    }

    /**
     * 发送消息
     */
    sendMessage(isMobile = false) {
        const inputElement = isMobile ? $('#ai_input_mobile') : $('#ai_input')
        const message = inputElement.val().trim()
        
        if (!message || this.isLoading) return
        
        // 添加用户消息
        if (isMobile) {
            this.addMobileMessageToChat('user', message)
        } else {
            this.addMessageToChat('user', message, false)
        }
        
        inputElement.val('')
        if (isMobile) {
            this.updateCharCount(true)
        } else {
            this.autoResizeTextarea(inputElement[0])
        }
        
        // 设置加载状态
        this.setLoadingState(true, isMobile)
        
        // 选择使用chat或continue方法
        const apiMethod = this.currentConversationId ? 'continue' : 'chat'
        const apiParams = this.currentConversationId ? [this.currentConversationId, message] : [message]
        
        this[apiMethod](...apiParams,
            (response) => {
                // 检查是否是新对话的第一条消息
                const isNewConversation = !this.currentConversationId
                
                // 更新对话ID
                if (!this.currentConversationId) {
                    this.currentConversationId = response.conversation_id
                }
                
                // 从返回的messages中获取最新的assistant消息
                if (response.messages && response.messages.length > 0) {
                    const lastMessage = response.messages[response.messages.length - 1]
                    if (lastMessage.role === 'assistant') {
                        if (isMobile) {
                            this.addMobileMessageToChat('assistant', lastMessage.content)
                        } else {
                            this.addMessageToChat('assistant', lastMessage.content, false)
                        }
                    }
                }
                
                // 如果是新对话的第一条消息，刷新对话列表并选中新对话
                if (isNewConversation) {
                    this.loadConversationHistory()
                    
                    // 延迟选中新创建的对话
                    setTimeout(() => {
                        $(`.conversation_unit_${this.currentConversationId}`).addClass('active')
                    }, 500)
                }
                
                this.setLoadingState(false, isMobile)
            },
            (error) => {
                console.error('发送消息失败:', error)
                
                let errorMessage = ''
                if (error.includes('Failed to fetch') || error.includes('网络')) {
                    errorMessage = '抱歉，AI服务暂时不可用，请稍后再试。'
                    TL.alert('AI服务连接失败，请检查网络或稍后再试')
                } else if (error.includes('令牌不足') || error.includes('配额耗尽')) {
                    errorMessage = '抱歉，您的对话配额已耗尽，请等待重置后继续使用。'
                    TL.alert('您的AI对话配额已耗尽，请等待重置或升级账户')
                } else {
                    errorMessage = '抱歉，发送消息时发生错误: ' + error
                    TL.alert(error)
                }
                
                if (isMobile) {
                    this.addMobileMessageToChat('system', errorMessage)
                } else {
                    this.addMessageToChat('system', errorMessage, false)
                }
                
                this.setLoadingState(false, isMobile)
            }
        )
    }

    /**
     * 删除对话（UI方法）
     */
    deleteConversationUI(conversationId) {
        // 检测是否为移动端
        const isMobile = isMobileScreen()
        
        if (isMobile) {
            // 移动端使用更友好的确认方式
            this.confirmDeleteConversationMobile(conversationId)
        } else {
            // 桌面端使用原有方式
            if (!confirm('确定要删除这个对话吗？此操作无法撤销。')) {
                return
            }
            
            this.deleteConversation(conversationId,
                () => {
                    // 直接刷新历史列表，用户看到对话消失就知道删除成功了
                    this.loadConversationHistory()
                },
                (error) => {
                    console.error('删除对话失败:', error)
                    TL.alert('删除对话失败: ' + error)
                }
            )
        }
    }

    /**
     * 移动端删除对话确认
     */
    confirmDeleteConversationMobile(conversationId) {
        // 使用浏览器原生的确认对话框，在移动端体验更好
        if (confirm('确定要删除这个对话吗？此操作无法撤销。')) {
            this.deleteConversation(conversationId,
                () => {
                    // 直接刷新历史列表，用户看到对话消失就知道删除成功了
                    this.loadConversationHistory()
                },
                (error) => {
                    console.error('删除对话失败:', error)
                    TL.alert('删除对话失败: ' + error)
                }
            )
        }
    }

    /**
     * 导出对话
     */
    exportConversation(conversationId) {
        this.getConversationDetail(conversationId,
            (conversation) => {
                const messages = conversation.messages || []
                
                if (messages.length === 0) {
                    TL.alert('没有对话内容可以导出')
                    return
                }
                
                const exportContent = messages.map(msg => 
                    `${msg.role === 'user' ? '用户' : '小薇'}: ${msg.content}`
                ).join('\n\n')
                
                const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                
                const a = document.createElement('a')
                a.href = url
                a.download = `${conversation.title || '对话'}_${new Date().toLocaleDateString()}.txt`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                
                URL.revokeObjectURL(url)
            },
            (error) => {
                console.error('导出对话失败:', error)
                TL.alert('导出对话失败: ' + error)
            }
        )
    }

    /**
     * 刷新对话列表
     */
    refreshList() {
        this.loadConversationHistory()
    }
    
    refreshConversation() {
        if (this.currentConversationId) {
            this.openConversation(this.currentConversationId)
        }
    }

    /**
     * 添加消息到聊天界面
     */
    addMessageToChat(role, content, isMobile = false) {
        const messagesElement = $('#ai_messages')
        
        // 清空欢迎消息
        if (messagesElement.find('.text-center.text-muted').length > 0) {
            messagesElement.empty()
        }
        
        const isUser = role === 'user'
        const isAssistant = role === 'assistant'
        const isSystem = role === 'system'
        
        // 获取用户信息
        const userAvatar = $('.user_saved_logo img').first().attr('src') || '/img/ico/logo-256x256.png'
        const userNickname = $('.user_saved_nickname').first().text() || '用户'
        
        let messageHtml
        
        if (isUser) {
            // 用户消息：微信风格，头像在右侧
            messageHtml = `
                <div class="d-flex justify-content-end align-items-start mb-3 ai-message">
                    <div class="d-flex flex-column align-items-end mr-2 wechat-message-container">
                        <small class="text-muted wechat-nickname">${userNickname}</small>
                        <div class="bg-msg-user p-3 wechat-bubble-user">
                            <div class="text-white" style="line-height: 1.4; word-wrap: break-word;">
                                ${this.formatMessageContent(content)}
                            </div>
                        </div>
                    </div>
                    <div class="wechat-avatar">
                        <img src="${userAvatar}" class="rounded-circle w-100 h-100" style="object-fit: cover;" alt="用户头像">
                    </div>
                </div>
            `
        } else if (isAssistant) {
            // AI消息：微信风格，头像在左侧
            messageHtml = `
                <div class="d-flex justify-content-start align-items-start mb-3 ai-message">
                    <div class="wechat-avatar mr-2">
                        <div class="rounded-circle d-flex align-items-center justify-content-center w-100 h-100 wechat-ai-avatar">
                            <iconpark-icon name="star-one" class="text-white" style="font-size: 20px;"></iconpark-icon>
                        </div>
                    </div>
                    <div class="d-flex flex-column align-items-start wechat-message-container">
                        <small class="text-muted wechat-nickname">小薇</small>
                        <div class="bg-msg-ai p-3 wechat-bubble-ai">
                            <div class="text-white" style="line-height: 1.4; word-wrap: break-word;">
                                ${this.formatMessageContent(content)}
                            </div>
                        </div>
                    </div>
                </div>
            `
        } else {
            // 系统消息：居中显示
            messageHtml = `
                <div class="d-flex justify-content-center mb-3 ai-message">
                    <div class="bg-msg-system px-3 py-2 wechat-bubble-system wechat-message-container system">
                        <div class="text-center text-dark" style="font-size: 13px; line-height: 1.4;">
                            ${this.formatMessageContent(content)}
                        </div>
                    </div>
                </div>
            `
        }
        
        messagesElement.append(messageHtml)
        this.scrollToBottom(false)
    }

    /**
     * 格式化消息内容
     */
    formatMessageContent(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>')
    }

    /**
     * 滚动到底部
     */
    scrollToBottom(isMobile = false) {
        const messagesElement = $('#ai_messages')
        
        // 使用原生JavaScript确保滚动正常工作
        if (messagesElement.length > 0) {
            const element = messagesElement[0]
            
            // 强制重新计算高度
            setTimeout(() => {
                try {
                    // 使用smooth滚动到底部
                    element.scrollTo({
                        top: element.scrollHeight,
                        behavior: 'smooth'
                    })
                } catch (e) {
                    // 如果smooth不支持，使用jQuery animate作为备选
                    messagesElement.animate({
                        scrollTop: element.scrollHeight
                    }, 300)
                }
            }, 50)
        }
    }

    /**
     * 设置加载状态
     */
    setLoadingState(loading, isMobile = false) {
        this.isLoading = loading
        
        const sendBtn = isMobile ? $('#ai_send_btn_mobile') : $('#ai_send_btn')
        const statusElement = isMobile ? $('#ai_chat_status_mobile') : $('#ai_chat_status')
        const messagesContainer = isMobile ? $('#ai_messages_mobile') : $('#ai_messages')
        
        if (loading) {
            sendBtn.prop('disabled', true).html('<div class="spinner-border spinner-border-sm"></div>')
            
            // 添加思考中的提示
            if (messagesContainer.find('.thinking-indicator').length === 0) {
                const thinkingHtml = isMobile ? this.createMobileThinkingIndicator() : this.createDesktopThinkingIndicator()
                messagesContainer.append(thinkingHtml)
                
                if (isMobile) {
                    if (messagesContainer.length > 0 && messagesContainer[0]) {
                        messagesContainer.scrollTop(messagesContainer[0].scrollHeight)
                    }
                } else {
                    this.scrollToBottom(false)
                }
            }
        } else {
            const inputElement = isMobile ? $('#ai_input_mobile') : $('#ai_input')
            sendBtn.prop('disabled', inputElement.val().trim() === '').html('<iconpark-icon name="arrow-turn-down-left" class="fa-fw"></iconpark-icon>')
            statusElement.text('就绪')
            
            // 移除思考中的提示
            messagesContainer.find('.thinking-indicator').remove()
        }
    }

    /**
     * 自动调整文本框大小
     */
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto'
        const newHeight = Math.min(textarea.scrollHeight, 120)
        textarea.style.height = newHeight + 'px'
        
        // 更新字符计数
        const length = textarea.value.length
        $('#ai_char_count').text(`${length}/2000`)
        
        // 更新发送按钮状态
        $('#ai_send_btn').prop('disabled', length === 0 || this.isLoading)
    }

    /**
     * 创建桌面端思考指示器
     */
    createDesktopThinkingIndicator() {
        return `
            <div class="d-flex justify-content-start align-items-start mb-3 thinking-indicator">
                <div class="wechat-avatar mr-2">
                    <div class="rounded-circle d-flex align-items-center justify-content-center w-100 h-100 wechat-ai-avatar">
                        <iconpark-icon name="star-one" class="text-white" style="font-size: 20px;"></iconpark-icon>
                    </div>
                </div>
                <div class="d-flex flex-column align-items-start wechat-message-container">
                    <small class="text-muted wechat-nickname">小薇</small>
                    <div class="bg-msg-ai p-3 wechat-bubble-ai">
                        <div class="text-white" style="opacity: 0.8;">
                            <div class="typing-dots">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    /**
     * 创建移动端思考指示器
     */
    createMobileThinkingIndicator() {
        return `
            <div class="d-flex justify-content-start align-items-start mb-3 thinking-indicator">
                <div class="wechat-avatar mr-2">
                    <div class="rounded-circle d-flex align-items-center justify-content-center w-100 h-100 wechat-ai-avatar">
                        <iconpark-icon name="star-one" class="text-white" style="font-size: 20px;"></iconpark-icon>
                    </div>
                </div>
                <div class="d-flex flex-column align-items-start wechat-message-container">
                    <small class="text-muted wechat-nickname">小薇</small>
                    <div class="bg-msg-ai p-3 wechat-bubble-ai">
                        <div class="text-white" style="opacity: 0.8;">
                            <div class="typing-dots">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    // 移动端相关方法
    sendQuickMessage(message) {
        if (!message || message.trim() === '') return
        
        // 设置输入框内容
        $('#ai_input_mobile').val(message)
        
        // 发送消息
        this.sendMessage(true)
    }

    updateCharCount(isMobile = false) {
        const inputElement = isMobile ? $('#ai_input_mobile') : $('#ai_input')
        const countElement = isMobile ? $('#ai_char_count_mobile') : $('#ai_char_count')
        const currentLength = inputElement.val().length
        const maxLength = inputElement.attr('maxlength') || 2000
        
        countElement.text(`${currentLength}/${maxLength}`)
        
        // 字符数接近限制时改变颜色
        if (currentLength > maxLength * 0.9) {
            countElement.addClass('text-warning')
        } else if (currentLength >= maxLength) {
            countElement.addClass('text-danger').removeClass('text-warning')
        } else {
            countElement.removeClass('text-warning text-danger')
        }
    }

    addMobileMessageToChat(role, content, showTimestamp = true) {
        const messagesContainer = $('#ai_messages_mobile')
        
        // 隐藏欢迎界面
        $('#ai_welcome_mobile').hide()
        
        // 创建消息HTML
        const messageHtml = this.createMobileMessageHTML({
            role: role,
            content: content,
            timestamp: showTimestamp ? new Date().toLocaleTimeString() : null
        })
        
        messagesContainer.append(messageHtml)
        
        // 滚动到底部
        if (messagesContainer.length > 0 && messagesContainer[0]) {
            messagesContainer.scrollTop(messagesContainer[0].scrollHeight)
        }
    }

    createMobileMessageHTML(message) {
        const isUser = message.role === 'user'
        const isSystem = message.role === 'system'
        const isAssistant = message.role === 'assistant'
        
        // 获取用户信息
        const userAvatar = $('.user_saved_logo img').first().attr('src') || '/img/ico/logo-256x256.png'
        const userNickname = $('.user_saved_nickname').first().text() || '用户'
        
        if (isUser) {
            // 用户消息：微信风格，头像在右侧
            return `
                <div class="d-flex justify-content-end align-items-start mb-3">
                    <div class="d-flex flex-column align-items-end mr-2 wechat-message-container">
                        <small class="text-muted wechat-nickname">${userNickname}</small>
                        <div class="bg-msg-user p-3 wechat-bubble-user">
                            <div class="text-white" style="line-height: 1.4; word-wrap: break-word;">
                                ${this.formatMessageContent(message.content)}
                            </div>
                        </div>
                    </div>
                    <div class="wechat-avatar">
                        <img src="${userAvatar}" class="rounded-circle w-100 h-100" style="object-fit: cover;" alt="用户头像">
                    </div>
                </div>
            `
        } else if (isAssistant) {
            // AI消息：微信风格，头像在左侧
            return `
                <div class="d-flex justify-content-start align-items-start mb-3">
                    <div class="wechat-avatar mr-2">
                        <div class="rounded-circle d-flex align-items-center justify-content-center w-100 h-100 wechat-ai-avatar">
                            <iconpark-icon name="star-one" class="text-white" style="font-size: 20px;"></iconpark-icon>
                        </div>
                    </div>
                    <div class="d-flex flex-column align-items-start wechat-message-container">
                        <small class="text-muted wechat-nickname">小薇</small>
                        <div class="bg-msg-ai p-3 wechat-bubble-ai">
                            <div class="text-white" style="line-height: 1.4; word-wrap: break-word;">
                                ${this.formatMessageContent(message.content)}
                            </div>
                        </div>
                    </div>
                </div>
            `
        } else {
            // 系统消息：居中显示
            return `
                <div class="d-flex justify-content-center mb-3">
                    <div class="bg-msg-system px-3 py-2 wechat-bubble-system wechat-message-container system">
                        <div class="text-center text-dark" style="font-size: 13px; line-height: 1.4;">
                            ${this.formatMessageContent(message.content)}
                        </div>
                    </div>
                </div>
            `
        }
    }
}

# AI 服务 API 文档

## 概述

AI 服务提供了由 LM Studio 服务器驱动的聊天接口，使用 qwen3-32b-uncensored 模型。该服务包括基于令牌的使用限制、队列管理和用户身份验证。

## 最新更新 (2025-06-14)

- **修复了关键 API 方法问题**：所有不正确的 `set_status()` 和 `set_data()` 方法调用已修复为正确的 `api_set_status()` 和 `api_set_data()`
- **改进了错误处理**：所有 API 响应现在使用正确的 Basekit 框架方法
- **增强了调试功能**：修复了 `set_debug()` 方法调用为 `api_set_debug()`

## 功能特性

- 所有 AI 服务都需要用户身份验证
- 基于令牌的使用追踪，定期重置（每4小时）
- 普通用户：每个周期 4,000 个令牌
- 赞助用户：每个周期 16,000 个令牌
- 队列管理确保有序处理
- 对话历史追踪和管理
- 智能对话标题生成
- 系统提示确保安全响应

## 基础 URL

```
/api_v2/ai
```

## 身份验证

所有端点都需要从认证 API 获得的有效用户令牌。

## API 端点

### 1. 与 AI 聊天

向 AI 发送消息并接收响应。支持单个消息或消息数组格式。

**请求方式一（单个消息）：**
```
POST /api_v2/ai
Content-Type: application/x-www-form-urlencoded

action=chat
&token=YOUR_USER_TOKEN
&message=Your message to the AI
```

**请求方式二（消息数组）：**
```
POST /api_v2/ai
Content-Type: application/x-www-form-urlencoded

action=chat
&token=YOUR_USER_TOKEN
&messages=[{"role":"user","content":"Your message to the AI"}]
```

**响应（成功）：**
```json
{
  "status": 1,
  "data": {
    "conversation_id": "abc123def456",
    "title": "关于AI的讨论",
    "messages": [
      {
        "role": "user",
        "content": "Your message to the AI"
      },
      {
        "role": "assistant",
        "content": "AI's response message"
      }
    ],
    "tokens_used": 150,
    "usage": {
      "prompt_tokens": 100,
      "completion_tokens": 50,
      "total_tokens": 150
    }
  },
  "debug": "chat success"
}
```

**响应（令牌限制超出）：**
```json
{
  "status": 0,
  "data": "Token limit exceeded for this period",
  "debug": "token limit exceeded"
}
```

**响应（API暂时不可用，可重试）：**
```json
{
  "status": 5,
  "data": "AI service temporarily unavailable - please retry",
  "debug": "api call failed"
}
```

**响应（错误）：**
```json
{
  "status": 0,
  "data": "AI service unavailable",
  "debug": "ai service error"
}
```

### 2. 继续对话

在现有对话中发送新消息。支持单个消息或消息数组格式。

**请求方式一（单个消息）：**
```
POST /api_v2/ai
Content-Type: application/x-www-form-urlencoded

action=continue
&token=YOUR_USER_TOKEN
&conversation_id=abc123def456
&message=Your follow-up message
```

**请求方式二（消息数组）：**
```
POST /api_v2/ai
Content-Type: application/x-www-form-urlencoded

action=continue
&token=YOUR_USER_TOKEN
&conversation_id=abc123def456
&messages=[{"role":"user","content":"Your follow-up message"}]
```

**响应（成功）：**
```json
{
  "status": 1,
  "data": {
    "conversation_id": "abc123def456",
    "title": "关于AI的讨论",
    "messages": [
      {
        "role": "user",
        "content": "Your follow-up message"
      },
      {
        "role": "assistant",
        "content": "AI's response to follow-up"
      }
    ],
    "tokens_used": 225,
    "usage": {
      "prompt_tokens": 150,
      "completion_tokens": 75,
      "total_tokens": 225
    }
  },
  "debug": "continue success"
}
```

### 3. 获取用户状态

检索已认证用户的当前令牌使用情况和限制。

**请求：**
```
POST /api_v2/ai
Content-Type: application/x-www-form-urlencoded

action=status
&token=YOUR_USER_TOKEN
```

**响应：**
```json
{
  "status": 1,
  "data": {
    "token_total": 5000,
    "token_period": 1500,
    "token_limit": 4000,
    "token_remaining": 2500,
    "is_sponsor": false,
    "last_reset": "2024-01-01 12:00:00"
  },
  "debug": "status retrieved"
}
```

### 4. 获取对话列表

获取用户的对话历史列表。

**请求：**
```
POST /api_v2/ai
Content-Type: application/x-www-form-urlencoded

action=history
&token=YOUR_USER_TOKEN
&limit=10
```

**响应：**
```json
{
  "status": 1,
  "data": [
    {
      "conversation_id": "abc123def456",
      "title": "关于 AI 的讨论"
    },
    {
      "conversation_id": "def456ghi789",
      "title": "编程问题咨询"
    }
  ],
  "debug": "history list retrieved"
}
```

### 5. 获取对话详情

检索特定对话的详细信息和消息。

**请求：**
```
POST /api_v2/ai
Content-Type: application/x-www-form-urlencoded

action=get_conversation
&token=YOUR_USER_TOKEN
&conversation_id=abc123def456
```

**响应：**
```json
{
  "status": 1,
  "data": {
    "conversation_id": "abc123def456",
    "title": "关于 AI 的讨论",
    "time": "2024-06-14 10:30:00",
    "messages": [
      {
        "role": "user",
        "content": "User's message"
      },
      {
        "role": "assistant",
        "content": "AI's response"
      }
    ],
    "tokens_used": 150
  },
  "debug": "conversation detail retrieved"
}
```

### 6. 删除对话

删除指定的对话（软删除）。

**请求：**
```
POST /api_v2/ai
Content-Type: application/x-www-form-urlencoded

action=delete
&token=YOUR_USER_TOKEN
&conversation_id=abc123def456
```

**响应：**
```json
{
  "status": 1,
  "data": "Conversation deleted successfully",
  "debug": "conversation deleted"
}
```

### 7. 初始化数据库表（仅限管理员）

为 AI 服务创建所需的数据库表。

**请求：**
```
POST /api_v2/ai
Content-Type: application/x-www-form-urlencoded

action=init_tables
&token=ADMIN_USER_TOKEN
```

**响应：**
```json
{
  "status": 1,
  "data": "Tables created successfully",
  "debug": "tables created"
}
```

## 状态代码

| 代码 | 描述 |
|------|-------------|
| 0 | 请求失败 |
| 1 | 请求成功 |
| 5 | API 暂时不可用，建议重试 |

## 错误代码

| 代码 | 描述 |
|------|-------------|
| 1001 | 该周期的令牌限制已超出 |
| 1002 | AI 服务队列已满 |
| 1003 | AI 服务不可用 |
| 1004 | 用户未认证 |

## 实现细节

### 令牌限制

- 普通用户：每4小时周期 4,000 个令牌
- 赞助用户：每4小时周期 16,000 个令牌
- 令牌使用情况按周期和总计进行追踪
- 周期每4小时自动重置

### 队列管理

- 对话按顺序处理（先进先出）
- 一次只处理一个对话
- 卡住的对话（处理时间超过1分钟）会自动清除
- 最大等待时间：120秒

### 数据库架构

**ai_main 表：**
```sql
CREATE TABLE ai_main (
    uid INT PRIMARY KEY,
    token_total INT DEFAULT 0,
    token_period INT DEFAULT 0,
    atime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mtime (mtime)
);
```

**ai_conversation 表：**
```sql
CREATE TABLE ai_conversation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid INT NOT NULL,
    title VARCHAR(100) DEFAULT NULL,
    data TEXT,
    queue ENUM('wait', 'processing', 'ok') DEFAULT 'wait',
    active ENUM('yes', 'no') DEFAULT 'yes',
    ctime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_uid (uid),
    INDEX idx_queue_mtime (queue, mtime),
    INDEX idx_active (active)
);
```

### 后台任务

`ai_token_reset.public.php` 任务定期运行以：
1. 4小时后为用户重置周期令牌
2. 清理超过7天的对话
3. 解除任何超过超时时间的处理中对话

### 智能功能

#### 对话标题生成
- 系统会在第1次、第3次、第10次对话时自动生成对话标题
- 使用轻量级模型 `llama-3.2-3b-instruct` 进行标题生成
- 标题长度限制为20个字符

#### Think 标签过滤
- AI 回复中的 `<think></think>` 标签及其内容会被自动过滤
- 确保用户只看到最终的回复内容

#### 系统消息过滤
- API 响应中自动过滤系统消息（role: "system"）
- 只返回用户和助手之间的对话内容
- 保持对话的简洁性，隐藏内部系统指令

#### 队列管理改进
- 改进的队列处理逻辑，防止死锁
- 超时处理机制，防止长时间等待
- 重试机制，提高服务可靠性

## 使用示例

```javascript
// 使用 fetch API 的示例
async function chatWithAI(token, message) {
    const response = await fetch('/api_v2/ai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            action: 'chat',
            token: token,
            message: message
        })
    });
    
    const result = await response.json();
    
    if (result.status === 1) {
        console.log('AI 响应:', result.data.message);
        console.log('使用的令牌数:', result.data.usage.total_tokens);
    } else {
        console.error('错误:', result.data);
    }
}
```

## 技术细节

### API 方法修复
- **重要更新**：所有 API 响应方法已从错误的 `set_status()`、`set_data()`、`set_debug()` 修复为正确的 `api_set_status()`、`api_set_data()`、`api_set_debug()`
- 确保与 Basekit 框架的兼容性
- 修复了所有 12 个错误的方法调用

### 模型配置
- 主要模型：`qwen3-32b-uncensored@q8_0`
- 标题生成模型：`llama-3.2-3b-instruct`
- LM Studio 服务器：`http://100.95.197.89:1234`

## 注意事项

- AI 服务使用位于 `http://100.95.197.89:1234` 的 LM Studio 服务器
- 模型：qwen3-32b-uncensored@q8_0（主要对话），llama-3.2-3b-instruct（标题生成）
- 系统提示确保安全和适当的响应
- 所有对话最多存储7天
- 用户必须经过身份验证才能使用该服务
- 支持对话历史管理和智能标题生成

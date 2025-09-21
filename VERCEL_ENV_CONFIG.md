# Vercel 环境变量配置指南

## 🔑 API密钥轮询系统配置

### 在Vercel Dashboard中配置以下环境变量：

#### 1. Google Gemini API 密钥池（3个密钥）
```bash
GEMINI_API_KEY_1=AIzaSyAgiBd_CtyPJ4p_4A_PtDhC6RQq8m5Qvuk
GEMINI_API_KEY_2=AIzaSyBtw7WLw0Lf749k0j5yeKJpjz1AfWgDsuA
GEMINI_API_KEY_3=AIzaSyACaQWzNKYvYUvAFNkL4lxWtrcevqNZZ8A
```

#### 2. 兼容性密钥（可选）
```bash
GEMINI_API_KEY=AIzaSyAgiBd_CtyPJ4p_4A_PtDhC6RQq8m5Qvuk
```

#### 3. Vercel Blob存储
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_AUL5HsnQWN21BR8h_YbxChFzoaGO9Lb16sDGUYq3rCEVWKy
```

#### 4. 应用配置
```bash
NEXT_PUBLIC_APP_NAME=AI国庆儿童写真
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
```

## 🚀 配置步骤

### 1. 访问 Vercel Dashboard
1. 登录 [vercel.com](https://vercel.com)
2. 选择您的项目
3. 进入 **Settings** → **Environment Variables**

### 2. 批量添加环境变量
对于每个环境变量：
1. 点击 **Add New**
2. **Name**: 输入变量名（如 `GEMINI_API_KEY_1`）
3. **Value**: 输入对应的API密钥
4. **Environments**: 选择 **Production**, **Preview**, **Development**
5. 点击 **Save**

### 3. 重新部署
配置完成后，触发重新部署以应用新的环境变量。

## 📊 监控系统

### API密钥状态监控
访问 `/api/key-status` 查看密钥池状态：

```json
{
  "success": true,
  "data": {
    "totalKeys": 10,
    "currentIndex": 0,
    "availableKeys": 10,
    "blockedKeys": 0,
    "healthStatus": {
      "healthy": true,
      "critical": false,
      "warning": false
    },
    "keys": [...]
  }
}
```

## 🔄 轮询机制

### 自动故障转移
- 密钥达到限额时自动切换
- 失败3次自动阻塞5分钟
- 支持多种错误类型检测

### 错误处理类型
- `quota exceeded` - 配额耗尽
- `rate limit` - 频率限制  
- `api key not valid` - 无效密钥
- `permission denied` - 权限拒绝
- `resource_exhausted` - 资源耗尽

## 🎯 优势特点

- ✅ **3个 API密钥池** - 提升可用性
- ✅ **智能故障转移** - 自动切换失效密钥
- ✅ **状态监控** - 实时查看密钥状态
- ✅ **错误重试** - 3次重试机制
- ✅ **冷却恢复** - 5分钟自动恢复
- ✅ **兼容性保证** - 支持单密钥回退

## 🚨 重要提醒

1. **密钥安全**: 确保所有API密钥都是有效的
2. **配额管理**: 监控每个密钥的使用情况
3. **状态检查**: 定期检查 `/api/key-status` 端点
4. **备份密钥**: 准备额外的密钥以备不时之需

配置完成后，您的应用将具备强大的API密钥轮询和故障转移能力！
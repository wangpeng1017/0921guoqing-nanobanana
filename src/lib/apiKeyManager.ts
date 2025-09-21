import { GoogleGenerativeAI } from '@google/generative-ai';

// API密钥池 - 从环境变量读取
const getApiKeys = (): string[] => {
  const keys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
    process.env.GEMINI_API_KEY_7,
    process.env.GEMINI_API_KEY_8,
    process.env.GEMINI_API_KEY_9,
    process.env.GEMINI_API_KEY_10
  ].filter(Boolean) as string[];
  
  // 如果没有配置多个密钥，回退到单个密钥
  if (keys.length === 0 && process.env.GEMINI_API_KEY) {
    keys.push(process.env.GEMINI_API_KEY);
  }
  
  return keys;
};

// 密钥状态跟踪
interface KeyStatus {
  key: string;
  failCount: number;
  lastFailTime?: number;
  isBlocked: boolean;
}

class ApiKeyManager {
  private keyPool: KeyStatus[] = [];
  private currentIndex: number = 0;
  private readonly maxFailCount = 3; // 最大失败次数
  private readonly blockDuration = 5 * 60 * 1000; // 5分钟冷却时间

  constructor() {
    this.initializeKeyPool();
  }

  private initializeKeyPool() {
    const keys = getApiKeys();
    this.keyPool = keys.map(key => ({
      key,
      failCount: 0,
      isBlocked: false
    }));
    
    console.log(`✅ API密钥管理器初始化完成，共${this.keyPool.length}个密钥`);
  }

  // 获取当前可用的密钥
  getCurrentApiKey(): string | null {
    if (this.keyPool.length === 0) {
      console.error('❌ 没有可用的API密钥');
      return null;
    }

    // 清理过期的阻塞状态
    this.cleanupBlockedKeys();

    // 寻找可用的密钥
    for (let i = 0; i < this.keyPool.length; i++) {
      const keyStatus = this.keyPool[this.currentIndex];
      
      if (!keyStatus.isBlocked) {
        console.log(`🔑 使用API密钥 #${this.currentIndex + 1}: ${keyStatus.key.substr(0, 10)}...${keyStatus.key.substr(-4)}`);
        return keyStatus.key;
      }
      
      // 轮换到下一个密钥
      this.currentIndex = (this.currentIndex + 1) % this.keyPool.length;
    }

    console.warn('⚠️  所有API密钥都被阻塞，使用第一个密钥重试');
    return this.keyPool[0]?.key || null;
  }

  // 获取Gemini客户端
  getGeminiClient(): GoogleGenerativeAI | null {
    const apiKey = this.getCurrentApiKey();
    if (!apiKey) {
      return null;
    }
    
    return new GoogleGenerativeAI(apiKey);
  }

  // 获取Gemini模型实例
  getGeminiModel() {
    const client = this.getGeminiClient();
    if (!client) {
      throw new Error('无法获取Gemini客户端');
    }
    
    return client.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image-preview' 
    });
  }

  // 标记密钥失败
  markKeyFailed(failedKey: string, error: Error) {
    const keyStatus = this.keyPool.find(k => k.key === failedKey);
    if (!keyStatus) return;

    keyStatus.failCount++;
    keyStatus.lastFailTime = Date.now();

    // 检查错误类型
    const errorType = this.getErrorType(error);
    console.log(`❌ 密钥失败: ${failedKey.substr(0, 10)}...${failedKey.substr(-4)}, 失败次数: ${keyStatus.failCount}, 错误类型: ${errorType}`);
    
    // 检查是否需要阻塞该密钥
    if (this.shouldBlockKey(error) || keyStatus.failCount >= this.maxFailCount) {
      keyStatus.isBlocked = true;
      const blockReason = this.shouldBlockKey(error) ? '严重错误' : '达到最大失败次数';
      console.log(`🚫 密钥被阻塞: ${failedKey.substr(0, 10)}...${failedKey.substr(-4)} (原因: ${blockReason})`);
      
      // 切换到下一个密钥
      this.rotateToNextKey();
    }
  }

  // 标记密钥成功
  markKeySuccess(successKey: string) {
    const keyStatus = this.keyPool.find(k => k.key === successKey);
    if (keyStatus) {
      keyStatus.failCount = 0;
      keyStatus.isBlocked = false;
      delete keyStatus.lastFailTime;
    }
  }

  // 获取错误类型
  private getErrorType(error: Error): string {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('quota exceeded')) return '配额耗尽';
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) return '频率限制';
    if (errorMessage.includes('api key not valid')) return '密钥无效';
    if (errorMessage.includes('permission denied')) return '权限拒绝';
    if (errorMessage.includes('resource_exhausted')) return '资源耗尽';
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) return '网络错误';
    
    return '未知错误';
  }

  // 判断是否应该阻塞密钥
  private shouldBlockKey(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    
    // 需要阻塞的错误类型
    const blockingErrors = [
      'quota exceeded',
      'rate limit',
      'api key not valid',
      'permission denied',
      'resource_exhausted'
    ];
    
    return blockingErrors.some(blockError => errorMessage.includes(blockError));
  }

  // 轮换到下一个密钥
  private rotateToNextKey() {
    this.currentIndex = (this.currentIndex + 1) % this.keyPool.length;
    console.log(`🔄 轮换到下一个密钥: #${this.currentIndex + 1}`);
  }

  // 清理过期的阻塞状态
  private cleanupBlockedKeys() {
    const now = Date.now();
    
    this.keyPool.forEach(keyStatus => {
      if (keyStatus.isBlocked && keyStatus.lastFailTime) {
        if (now - keyStatus.lastFailTime > this.blockDuration) {
          keyStatus.isBlocked = false;
          keyStatus.failCount = 0;
          delete keyStatus.lastFailTime;
          console.log(`✅ 密钥恢复可用: ${keyStatus.key.substr(0, 10)}...${keyStatus.key.substr(-4)}`);
        }
      }
    });
  }

  // 获取密钥池状态
  getKeyPoolStatus() {
    return {
      totalKeys: this.keyPool.length,
      currentIndex: this.currentIndex,
      availableKeys: this.keyPool.filter(k => !k.isBlocked).length,
      blockedKeys: this.keyPool.filter(k => k.isBlocked).length,
      keys: this.keyPool.map(k => ({
        keyPreview: `${k.key.substr(0, 10)}...${k.key.substr(-4)}`,
        failCount: k.failCount,
        isBlocked: k.isBlocked,
        lastFailTime: k.lastFailTime
      }))
    };
  }
}

// 全局单例实例
export const apiKeyManager = new ApiKeyManager();
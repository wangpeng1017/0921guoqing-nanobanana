// 用户友好的错误消息处理

export interface UserFriendlyError {
  message: string;
  suggestion: string;
  waitTime?: string;
  type: 'quota' | 'rate_limit' | 'invalid_key' | 'network' | 'unknown';
}

export function createUserFriendlyError(error: Error): UserFriendlyError {
  const errorMessage = error.message.toLowerCase();
  
  // 配额超出错误
  if (errorMessage.includes('quota exceeded') || errorMessage.includes('429')) {
    // 尝试从错误消息中提取重试时间
    const retryMatch = error.message.match(/retry in (\d+(?:\.\d+)?)[ms]?s/i);
    const retrySeconds = retryMatch ? parseFloat(retryMatch[1]) : null;
    
    let waitTime = '1小时';
    if (retrySeconds) {
      if (retrySeconds < 60) {
        waitTime = `${Math.ceil(retrySeconds)}秒`;
      } else if (retrySeconds < 3600) {
        waitTime = `${Math.ceil(retrySeconds / 60)}分钟`;
      } else {
        waitTime = `${Math.ceil(retrySeconds / 3600)}小时`;
      }
    }
    
    return {
      type: 'quota',
      message: '😊 试用量已用完',
      suggestion: `请${waitTime}后重试，或升级到付费版本享受更高配额`,
      waitTime
    };
  }
  
  // 频率限制错误
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return {
      type: 'rate_limit',
      message: '⏰ 请求过于频繁',
      suggestion: '请稍等片刻后重试，我们正在为您处理中...'
    };
  }
  
  // 无效API密钥
  if (errorMessage.includes('api key not valid') || errorMessage.includes('invalid api key')) {
    return {
      type: 'invalid_key',
      message: '🔑 服务暂时不可用',
      suggestion: '请稍后重试，我们正在解决技术问题'
    };
  }
  
  // 网络错误
  if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('fetch')) {
    return {
      type: 'network',
      message: '🌐 网络连接问题',
      suggestion: '请检查您的网络连接后重试'
    };
  }
  
  // 默认未知错误
  return {
    type: 'unknown',
    message: '😔 服务暂时不可用',
    suggestion: '请稍后重试，如问题持续请联系客服'
  };
}

// 为特定错误类型生成用户消息
export function getUserMessage(error: Error): string {
  const friendlyError = createUserFriendlyError(error);
  
  switch (friendlyError.type) {
    case 'quota':
      return `${friendlyError.message}\n\n💡 ${friendlyError.suggestion}`;
    
    case 'rate_limit':
      return `${friendlyError.message}\n\n💡 ${friendlyError.suggestion}`;
    
    case 'invalid_key':
      return `${friendlyError.message}\n\n💡 ${friendlyError.suggestion}`;
    
    case 'network':
      return `${friendlyError.message}\n\n💡 ${friendlyError.suggestion}`;
    
    default:
      return `${friendlyError.message}\n\n💡 ${friendlyError.suggestion}`;
  }
}

// 检查是否应该显示重试按钮
export function shouldShowRetryButton(error: Error): boolean {
  const friendlyError = createUserFriendlyError(error);
  return ['network', 'unknown'].includes(friendlyError.type);
}

// 获取建议的重试延迟（秒）
export function getRetryDelay(error: Error): number {
  const friendlyError = createUserFriendlyError(error);
  
  switch (friendlyError.type) {
    case 'quota':
      return 3600; // 1小时
    case 'rate_limit':
      return 60;   // 1分钟
    case 'invalid_key':
      return 300;  // 5分钟
    case 'network':
      return 5;    // 5秒
    default:
      return 30;   // 30秒
  }
}
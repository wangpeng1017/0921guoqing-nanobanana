// 简单的额度管理系统
// 注意：这是一个简单的客户端实现，生产环境建议使用数据库存储

interface QuotaInfo {
  used: number;
  limit: number;
  resetTime: string; // ISO日期字符串
  lastRequest?: number; // 上次请求时间戳
}

const DAILY_FREE_LIMIT = 5; // 每日免费额度减少到5次
const MIN_REQUEST_INTERVAL = 2 * 60 * 1000; // 最小请求间隔2分钟

// 获取今天的日期字符串 (YYYY-MM-DD)
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// 获取明天0点的时间字符串
function getTomorrowResetTime(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

// 从localStorage获取今日额度信息
export function getTodayQuota(): QuotaInfo {
  if (typeof window === 'undefined') {
    // 服务端环境，返回默认值
    return {
      used: 0,
      limit: DAILY_FREE_LIMIT,
      resetTime: getTomorrowResetTime()
    };
  }

  const today = getTodayString();
  const storageKey = `quota_${today}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const quota: QuotaInfo = JSON.parse(stored);
      return quota;
    }
  } catch (error) {
    console.warn('Failed to parse quota data:', error);
  }
  
  // 如果没有今日数据，创建新的
  const newQuota: QuotaInfo = {
    used: 0,
    limit: DAILY_FREE_LIMIT,
    resetTime: getTomorrowResetTime()
  };
  
  localStorage.setItem(storageKey, JSON.stringify(newQuota));
  return newQuota;
}

// 使用一次额度（含频率限制）
export function consumeQuota(): boolean {
  if (typeof window === 'undefined') {
    return true; // 服务端环境默认通过
  }

  const quota = getTodayQuota();
  const now = Date.now();
  
  // 检查额度
  if (quota.used >= quota.limit) {
    return false; // 额度已用完
  }
  
  // 检查请求频率限制
  if (quota.lastRequest && (now - quota.lastRequest) < MIN_REQUEST_INTERVAL) {
    return false; // 请求过于频繁
  }
  
  const today = getTodayString();
  const storageKey = `quota_${today}`;
  
  const updatedQuota: QuotaInfo = {
    ...quota,
    used: quota.used + 1,
    lastRequest: now
  };
  
  localStorage.setItem(storageKey, JSON.stringify(updatedQuota));
  return true;
}

// 检查是否还有可用额度
export function hasQuotaAvailable(): boolean {
  const quota = getTodayQuota();
  const now = Date.now();
  
  // 检查额度
  if (quota.used >= quota.limit) {
    return false;
  }
  
  // 检查请求频率
  if (quota.lastRequest && (now - quota.lastRequest) < MIN_REQUEST_INTERVAL) {
    return false; // 请求过于频繁
  }
  
  return true;
}

// 获取下次可请求的时间
export function getNextRequestTime(): number | null {
  if (typeof window === 'undefined') return null;
  
  const quota = getTodayQuota();
  if (!quota.lastRequest) return null;
  
  const nextTime = quota.lastRequest + MIN_REQUEST_INTERVAL;
  const now = Date.now();
  
  return nextTime > now ? nextTime : null;
}

// 获取剩余额度
export function getRemainingQuota(): number {
  const quota = getTodayQuota();
  return Math.max(0, quota.limit - quota.used);
}

// 清理过期的额度数据（可选，用于清理localStorage）
export function cleanupExpiredQuota(): void {
  if (typeof window === 'undefined') return;
  
  const today = getTodayString();
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.startsWith('quota_') && key !== `quota_${today}`) {
      localStorage.removeItem(key);
    }
  });
}
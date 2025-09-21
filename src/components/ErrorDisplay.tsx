'use client';

import { useState, useEffect } from 'react';
import { createUserFriendlyError, shouldShowRetryButton, getRetryDelay } from '@/lib/errorHandler';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export default function ErrorDisplay({ error, onRetry, onClose }: ErrorDisplayProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showRetryButton, setShowRetryButton] = useState(true);

  // 分析错误类型
  const errorObj = new Error(error);
  const friendlyError = createUserFriendlyError(errorObj);
  const shouldShowRetry = shouldShowRetryButton(errorObj);
  const retryDelay = getRetryDelay(errorObj);

  useEffect(() => {
    // 对于配额错误，显示倒计时
    if (friendlyError.type === 'quota') {
      setCountdown(retryDelay);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            setShowRetryButton(true);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [friendlyError.type, retryDelay]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}秒`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
    } else {
      return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分`;
    }
  };

  const getIcon = () => {
    switch (friendlyError.type) {
      case 'quota': return '😊';
      case 'rate_limit': return '⏰';
      case 'invalid_key': return '🔑';
      case 'network': return '🌐';
      default: return '😔';
    }
  };

  const getBackgroundColor = () => {
    switch (friendlyError.type) {
      case 'quota': return 'bg-blue-50 border-blue-200';
      case 'rate_limit': return 'bg-yellow-50 border-yellow-200';
      case 'invalid_key': return 'bg-orange-50 border-orange-200';
      case 'network': return 'bg-purple-50 border-purple-200';
      default: return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${getBackgroundColor()}`}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{getIcon()}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {friendlyError.message}
          </h3>
          <p className="text-gray-700 text-sm mb-3">
            {friendlyError.suggestion}
          </p>
          
          {/* 倒计时显示 */}
          {countdown !== null && (
            <div className="bg-white bg-opacity-50 rounded px-3 py-2 mb-3">
              <p className="text-sm text-gray-600">
                ⏱️ 建议等待时间：{formatTime(countdown)}
              </p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex space-x-2">
            {shouldShowRetry && onRetry && showRetryButton && countdown === null && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                🔄 重新尝试
              </button>
            )}
            
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
              >
                ✖️ 关闭
              </button>
            )}
          </div>

          {/* 额外提示 */}
          {friendlyError.type === 'quota' && (
            <div className="mt-3 text-xs text-gray-500">
              💡 提示：付费用户享受更高配额，无需等待
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
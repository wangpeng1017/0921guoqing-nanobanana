'use client';

interface QuotaExceededProps {
  onClose?: () => void;
}

export default function QuotaExceeded({ onClose }: QuotaExceededProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 text-center shadow-lg">
        {/* 图标 */}
        <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        {/* 主要消息 */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          今日免费额度已用完
        </h3>
        
        <p className="text-gray-600 mb-4">
          🌙 明天早点来哦，额度会重新刷新！
        </p>
        
        {/* 付费提示 */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-orange-100">
          <p className="text-sm text-gray-700 mb-2">
            💰 也支持付费购买，立即使用
          </p>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-orange-600">
              💬 微信：W18550398710
            </p>
            <p className="text-sm text-gray-600">
              💸 2毛一张，1元起售
            </p>
          </div>
        </div>
        
        {/* 倒计时提示 */}
        <div className="text-xs text-gray-500 mb-4">
          ⏰ 免费额度将在明天 00:00 重置
        </div>
        
        {/* 关闭按钮 */}
        {onClose && (
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            我知道了
          </button>
        )}
        
        {/* 装饰元素 */}
        <div className="absolute top-2 right-2 text-2xl opacity-20">
          ⏰
        </div>
      </div>
    </div>
  );
}
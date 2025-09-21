'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';
import StyleSelector from '@/components/StyleSelector';
import ResultDisplay from '@/components/ResultDisplay';
import QuotaExceeded from '@/components/QuotaExceeded';
import { createCompositeImage } from '@/lib/imageComposer';
import { hasQuotaAvailable, getRemainingQuota, cleanupExpiredQuota, consumeQuota } from '@/lib/quota';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [resultImage, setResultImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState(0);

  // 初始化和清理过期额度数据
  useEffect(() => {
    cleanupExpiredQuota();
    setRemainingQuota(getRemainingQuota());
  }, []);

  // 处理图片选择
  const handleImageSelect = (imageData: string) => {
    setSelectedImage(imageData);
    setResultImage(''); // 清除之前的结果
    setError('');
  };

  // 处理风格选择并自动开始生成
  const handleStyleSelect = async (styleId: string) => {
    setSelectedStyle(styleId);
    
    // 检查额度
    if (!hasQuotaAvailable()) {
      setQuotaExceeded(true);
      return;
    }
    
    if (selectedImage && styleId) {
      await startGeneration(selectedImage, styleId);
    }
  };

  // 开始生成图片
  const startGeneration = async (imageData: string, styleType: string) => {
    // 再次检查并使用额度
    if (!consumeQuota()) {
      setQuotaExceeded(true);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // 模拟处理延迟，提供真实的体验
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 使用本地图像合成功能创建演示效果
      const compositeImage = await createCompositeImage(imageData, styleType);
      
      // 调用Gemini API获取描述文本（可选）
      try {
        const response = await fetch('/api/process-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: imageData,
            styleType: styleType,
          }),
        });
        
        const data = await response.json();
        console.log('Gemini API返回:', data.description);
      } catch (apiError) {
        console.warn('Gemini API调用失败，但不影响图像生成:', apiError);
      }
      
      setResultImage(compositeImage);
      
      // 更新剩余额度显示
      setRemainingQuota(getRemainingQuota());
      
    } catch (error) {
      console.error('处理错误:', error);
      setError(error instanceof Error ? error.message : '处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 重新开始
  const handleReset = () => {
    setSelectedImage('');
    setSelectedStyle('');
    setResultImage('');
    setIsProcessing(false);
    setError('');
    setQuotaExceeded(false);
    setRemainingQuota(getRemainingQuota());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* 顶部标题 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🎨 AI国庆儿童写真
        </h1>
        <p className="text-gray-600 text-sm mb-2">
          上传照片，选择风格，一键生成
        </p>
        
        {/* 剩余额度显示 */}
        <div className={`text-xs px-3 py-1 rounded-full inline-block ${
          remainingQuota > 3 
            ? 'bg-green-100 text-green-700' 
            : remainingQuota > 0 
            ? 'bg-yellow-100 text-yellow-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          💎 今日免费额度：{remainingQuota}/10
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto space-y-6">
        {/* 额度用完提示 */}
        {quotaExceeded && (
          <QuotaExceeded onClose={() => setQuotaExceeded(false)} />
        )}
        
        {/* 上传区域 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">上传图片</h2>
          <ImageUpload 
            onImageSelect={handleImageSelect}
            disabled={isProcessing || quotaExceeded}
          />
        </div>

        {/* 风格选择区域 - 只在上传图片后显示 */}
        {selectedImage && !quotaExceeded && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">选择风格</h2>
            <StyleSelector
              onStyleSelect={handleStyleSelect}
              selectedStyle={selectedStyle}
              disabled={isProcessing}
            />
          </div>
        )}

        {/* 结果展示区域 */}
        {(isProcessing || resultImage) && !quotaExceeded && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              {isProcessing ? '正在生成...' : '生成结果'}
            </h2>
            <ResultDisplay
              imageUrl={resultImage}
              onReset={handleReset}
              isLoading={isProcessing}
            />
          </div>
        )}

        {/* 重新开始按钮 - 在有结果时显示 */}
        {resultImage && !isProcessing && !quotaExceeded && (
          <div className="text-center pt-4">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              重新开始
            </button>
          </div>
        )}
      </div>

      {/* 底部信息 */}
      <div className="text-center mt-12 space-y-2">
        <p className="text-xs text-gray-500">
          本应用使用Google Gemini AI技术
        </p>
        {!quotaExceeded && remainingQuota === 0 && (
          <div className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg inline-block">
            💰 也支持付费购买，加微信：W18550398710，2毛一张，1元起售
          </div>
        )}
      </div>
    </div>
  );
}

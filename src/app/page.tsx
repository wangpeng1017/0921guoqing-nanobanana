'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';
import StyleSelector from '@/components/StyleSelector';
import ResultDisplay from '@/components/ResultDisplay';
import QuotaExceeded from '@/components/QuotaExceeded';
import ErrorDisplay from '@/components/ErrorDisplay';
import { hasQuotaAvailable, getRemainingQuota, cleanupExpiredQuota, consumeQuota, getNextRequestTime } from '@/lib/quota';
import { createCompositeImage } from '@/lib/imageComposer';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [resultImage, setResultImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState(0);
  const [nextRequestTime, setNextRequestTime] = useState<number | null>(null);

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

  // 处理风格选择
  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    setError('');
  };
  
  // 手动开始生成
  const handleStartGeneration = async () => {
    if (!selectedImage || !selectedStyle) {
      setError('请先上传照片并选择风格');
      return;
    }
    
    // 检查额度和频率限制
    if (!hasQuotaAvailable()) {
      const nextTime = getNextRequestTime();
      if (nextTime) {
        const waitMinutes = Math.ceil((nextTime - Date.now()) / 60000);
        setError(`请求过于频繁，请等待${waitMinutes}分钟后重试`);
      } else {
        setQuotaExceeded(true);
      }
      return;
    }
    
    await startGeneration(selectedImage, selectedStyle);
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
      console.log('开始使用nanobanana API处理图片:', { styleType });
      
      // 转换为File对象用于API调用
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], 'uploaded-image.jpg', { type: 'image/jpeg' });
      
      // 准备FormData
      const formData = new FormData();
      formData.append('image', file);
      formData.append('style', styleType);
      
      // 调用nanobanana API进行实际图像生成
      const apiResponse = await fetch('/api/nanobanana-process', {
        method: 'POST',
        body: formData,
      });
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || '图像生成失败');
      }
      
      const result = await apiResponse.json();
      console.log('nanobanana API处理结果:', result);
      
      if (result.success && result.data && result.data.processedImage) {
        setResultImage(result.data.processedImage);
      } else {
        console.error('nanobanana处理失败:', result.error);
        setError(result.error || 'AI处理失败，请重试');
      }
      
      // 更新剩余额度显示
      setRemainingQuota(getRemainingQuota());
      setNextRequestTime(getNextRequestTime());
      
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
    setNextRequestTime(getNextRequestTime());
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
          📎 今日免费额度：{remainingQuota}/5
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="max-w-md mx-auto">
          <ErrorDisplay 
            error={error}
            onRetry={handleStartGeneration}
            onClose={() => setError('')}
          />
        </div>
      )}

      <div className="max-w-md mx-auto space-y-6">
        {/* 额度用完提示 */}
        {quotaExceeded && (
          <QuotaExceeded onClose={() => setQuotaExceeded(false)} />
        )}
        
        {/* 上传区域 */}
        <div>
          <ImageUpload 
            onImageSelect={handleImageSelect}
            disabled={isProcessing || quotaExceeded}
          />
        </div>

        {/* 风格选择 - 始终显示 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            选择你喜欢的风格
          </h2>
          <StyleSelector
            onStyleSelect={handleStyleSelect}
            selectedStyle={selectedStyle}
            disabled={isProcessing || quotaExceeded}
          />
        </div>
        
        {/* 生成按钮区域 - 始终显示 */}
        {!quotaExceeded && !isProcessing && !resultImage && (
          <div className="text-center space-y-3">
            <button
              onClick={handleStartGeneration}
              disabled={!selectedImage || !selectedStyle}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedImage && selectedStyle
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              开始生成 ✨
            </button>
            
            {/* 提示信息 */}
            {(!selectedImage || !selectedStyle) && (
              <div className="text-sm text-gray-600">
                {!selectedImage && !selectedStyle && (
                  <p>📸 请先上传照片并选择风格</p>
                )}
                {!selectedImage && selectedStyle && (
                  <p>📸 请先上传孩子的照片</p>
                )}
                {selectedImage && !selectedStyle && (
                  <p>🎨 请选择一个风格</p>
                )}
              </div>
            )}
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

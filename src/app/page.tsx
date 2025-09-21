'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import StyleSelector from '@/components/StyleSelector';
import ResultDisplay from '@/components/ResultDisplay';
import { createCompositeImage } from '@/lib/imageComposer';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [resultImage, setResultImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  // 处理图片选择
  const handleImageSelect = (imageData: string) => {
    setSelectedImage(imageData);
    setResultImage(''); // 清除之前的结果
    setError('');
  };

  // 处理风格选择并自动开始生成
  const handleStyleSelect = async (styleId: string) => {
    setSelectedStyle(styleId);
    
    if (selectedImage && styleId) {
      await startGeneration(selectedImage, styleId);
    }
  };

  // 开始生成图片
  const startGeneration = async (imageData: string, styleType: string) => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* 顶部标题 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🎨 AI国庆儿童写真
        </h1>
        <p className="text-gray-600 text-sm">
          上传照片，选择风格，一键生成
        </p>
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
        {/* 上传区域 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">上传图片</h2>
          <ImageUpload 
            onImageSelect={handleImageSelect}
            disabled={isProcessing}
          />
        </div>

        {/* 风格选择区域 - 只在上传图片后显示 */}
        {selectedImage && (
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
        {(isProcessing || resultImage) && (
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
        {resultImage && !isProcessing && (
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
      <div className="text-center mt-12 text-xs text-gray-500">
        <p>本应用使用Google Gemini AI技术</p>
      </div>
    </div>
  );
}

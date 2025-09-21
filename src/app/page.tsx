'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import StyleSelector from '@/components/StyleSelector';
import ResultDisplay from '@/components/ResultDisplay';
import { createCompositeImage } from '@/lib/imageComposer';

type Step = 'upload' | 'style' | 'processing' | 'result';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [resultImage, setResultImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  // 处理图片选择
  const handleImageSelect = (imageData: string) => {
    setSelectedImage(imageData);
    if (imageData) {
      setCurrentStep('style');
    } else {
      setCurrentStep('upload');
    }
    setError('');
  };

  // 处理风格选择
  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  // 开始生成图片
  const handleStartGeneration = async () => {
    if (!selectedImage || !selectedStyle) {
      setError('请确保已上传图片并选择风格');
      return;
    }

    setCurrentStep('processing');
    setIsProcessing(true);
    setError('');

    try {
      // 模拟处理延迟，提供真实的体验
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 使用本地图像合成功能创建演示效果
      const compositeImage = await createCompositeImage(selectedImage, selectedStyle);
      
      // 调用Gemini API获取描述文本（可选）
      try {
        const response = await fetch('/api/process-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: selectedImage,
            styleType: selectedStyle,
          }),
        });
        
        const data = await response.json();
        console.log('Gemini API返回:', data.description); // 记录描述文本
      } catch (apiError) {
        console.warn('Gemini API调用失败，但不影响图像生成:', apiError);
      }
      
      setResultImage(compositeImage);
      setCurrentStep('result');
      
    } catch (error) {
      console.error('处理错误:', error);
      setError(error instanceof Error ? error.message : '处理失败，请重试');
      setCurrentStep('style');
    } finally {
      setIsProcessing(false);
    }
  };

  // 重置所有状态
  const handleReset = () => {
    setCurrentStep('upload');
    setSelectedImage('');
    setSelectedStyle('');
    setResultImage('');
    setIsProcessing(false);
    setError('');
  };

  // 返回上一步
  const handleGoBack = () => {
    if (currentStep === 'style') {
      setCurrentStep('upload');
    } else if (currentStep === 'result') {
      setCurrentStep('style');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 顶部标题栏 */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎨 AI国庆儿童写真
            </h1>
            <p className="text-gray-600">
              用AI技术为您的孩子创作专属写真作品
            </p>
          </div>
          
          {/* 步骤指示器 */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${
                currentStep === 'upload' ? 'text-blue-600' : 
                ['style', 'processing', 'result'].includes(currentStep) ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'upload' ? 'bg-blue-600 text-white' : 
                  ['style', 'processing', 'result'].includes(currentStep) ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <span className="font-medium">上传照片</span>
              </div>
              
              <div className={`w-8 h-1 rounded ${
                ['style', 'processing', 'result'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-300'
              }`}></div>
              
              <div className={`flex items-center space-x-2 ${
                currentStep === 'style' ? 'text-blue-600' : 
                ['processing', 'result'].includes(currentStep) ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'style' ? 'bg-blue-600 text-white' : 
                  ['processing', 'result'].includes(currentStep) ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <span className="font-medium">选择风格</span>
              </div>
              
              <div className={`w-8 h-1 rounded ${
                ['processing', 'result'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-300'
              }`}></div>
              
              <div className={`flex items-center space-x-2 ${
                ['processing', 'result'].includes(currentStep) ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  ['processing', 'result'].includes(currentStep) ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  3
                </div>
                <span className="font-medium">生成作品</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* 步骤1: 上传图片 */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                上传孩子的照片
              </h2>
              <p className="text-gray-600 mb-8">
                请选择一张清晰的孩子正面照片，建议光线充足、背景简洁
              </p>
            </div>
            <ImageUpload 
              onImageSelect={handleImageSelect}
            />
          </div>
        )}

        {/* 步骤2: 选择风格 */}
        {currentStep === 'style' && (
          <div className="space-y-6">
            <StyleSelector
              onStyleSelect={handleStyleSelect}
              selectedStyle={selectedStyle}
            />
            
            <div className="flex justify-center space-x-4 pt-6">
              <button
                onClick={handleGoBack}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                返回上传
              </button>
              <button
                onClick={handleStartGeneration}
                disabled={!selectedStyle}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedStyle 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                开始生成 ✨
              </button>
            </div>
          </div>
        )}

        {/* 步骤3: 处理中/结果展示 */}
        {(currentStep === 'processing' || currentStep === 'result') && (
          <div className="flex justify-center">
            <ResultDisplay
              imageUrl={resultImage}
              onReset={handleReset}
              isLoading={currentStep === 'processing'}
            />
          </div>
        )}
      </main>

      {/* 底部信息 */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p className="mb-2">
              💡 小贴士：为获得最佳效果，建议使用清晰的正面照片
            </p>
            <p className="text-xs text-gray-500">
              本应用使用Google Gemini AI技术 | 您的隐私受到保护，图片处理后即刻删除
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

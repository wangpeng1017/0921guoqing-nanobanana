'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ResultDisplayProps {
  imageUrl: string;
  onReset: () => void;
  isLoading?: boolean;
}

export default function ResultDisplay({ 
  imageUrl, 
  onReset, 
  isLoading = false 
}: ResultDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  // 下载图片到本地
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // 如果是base64格式，直接创建下载链接
      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.download = `ai-kids-portrait-${Date.now()}.jpg`;
        link.href = imageUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // 如果是URL，需要先获取图片数据
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = `ai-kids-portrait-${Date.now()}.jpg`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理临时URL
        window.URL.revokeObjectURL(url);
      }
      
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试！');
    } finally {
      setIsDownloading(false);
    }
  };

  // 分享功能（使用Web Share API，如果支持的话）
  const handleShare = async () => {
    if (navigator.share) {
      try {
        // 将base64转换为文件对象
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'ai-kids-portrait.jpg', { type: 'image/jpeg' });
        
        await navigator.share({
          title: 'AI国庆儿童写真',
          text: '看看我用AI制作的儿童写真！',
          files: [file]
        });
      } catch (error) {
        console.error('分享失败:', error);
        // 如果分享失败，回退到复制链接
        handleCopyLink();
      }
    } else {
      // 不支持Web Share API，显示其他分享选项
      handleCopyLink();
    }
  };

  // 复制图片链接
  const handleCopyLink = async () => {
    try {
      // 由于是base64，我们创建一个临时的文本提示
      await navigator.clipboard.writeText('已生成AI儿童写真，可以保存到相册！');
      alert('已复制分享文本到剪贴板！');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col items-center">
            {/* 加载动画 */}
            <div className="w-16 h-16 mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              正在为您的小艺术家创作中...
            </h3>
            
            <p className="text-gray-600 text-center mb-4">
              AI正在精心制作您的专属儿童写真，请稍等片刻
            </p>
            
            {/* 进度提示 */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            
            <p className="text-sm text-gray-500">
              预计需要10-30秒
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* 图片展示区域 */}
        <div className="relative">
          <div className="relative w-full h-80">
            <Image
              src={imageUrl}
              alt="AI生成的儿童写真"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {/* 成功标识 */}
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            ✨ 创作完成
          </div>
        </div>
        
        {/* 操作区域 */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
            您的专属AI写真已生成！
          </h3>
          
          <p className="text-gray-600 text-center mb-6">
            快来欣赏这张独一无二的作品吧
          </p>
          
          {/* 操作按钮 */}
          <div className="space-y-3">
            {/* 下载按钮 */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`
                w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                ${isDownloading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                }
              `}
            >
              {isDownloading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  下载中...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  保存到相册
                </span>
              )}
            </button>
            
            {/* 分享按钮 */}
            <button
              onClick={handleShare}
              className="w-full py-3 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all duration-200 active:scale-95"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                分享作品
              </span>
            </button>
            
            {/* 重新创作按钮 */}
            <button
              onClick={onReset}
              className="w-full py-3 px-4 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all duration-200 active:scale-95"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重新创作
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
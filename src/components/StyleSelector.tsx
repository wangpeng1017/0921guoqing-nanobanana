'use client';

import Image from 'next/image';
import { STYLE_TEMPLATES } from '@/types/styles';

interface StyleSelectorProps {
  onStyleSelect: (styleId: string) => void;
  selectedStyle?: string;
  disabled?: boolean;
}

export default function StyleSelector({ 
  onStyleSelect, 
  selectedStyle, 
  disabled = false 
}: StyleSelectorProps) {
  const handleStyleClick = (styleId: string) => {
    if (!disabled) {
      onStyleSelect(styleId);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3">
        {STYLE_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className={`
              relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
              ${selectedStyle === template.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              shadow-md hover:shadow-lg
            `}
            onClick={() => handleStyleClick(template.id)}
          >
            {/* 缩略图 */}
            <div className="relative w-full h-32 overflow-hidden bg-gray-50">
              <Image
                src={template.thumbnailUrl}
                alt={template.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              
              {/* 选中状态指示器 */}
              {selectedStyle === template.id && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              {/* 处理中蒙版 */}
              {disabled && selectedStyle === template.id && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            {/* 标题 */}
            <div className="p-2 bg-white">
              <h4 className="font-medium text-gray-800 text-xs text-center">
                {template.name}
              </h4>
            </div>
          </div>
        ))}
      </div>
      
      {selectedStyle && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 text-sm text-center">
            ✨ 已选择: {STYLE_TEMPLATES.find(t => t.id === selectedStyle)?.name}
          </p>
        </div>
      )}
    </div>
  );
}
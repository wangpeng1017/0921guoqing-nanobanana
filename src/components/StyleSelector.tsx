'use client';

import { useState } from 'react';
import Image from 'next/image';
import { StyleTemplate, STYLE_TEMPLATES } from '@/types/styles';

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
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

  const handleStyleClick = (styleId: string) => {
    if (!disabled) {
      onStyleSelect(styleId);
    }
  };

  // 按分类分组模板
  const groupedTemplates = STYLE_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, StyleTemplate[]>);

  const categoryNames = {
    patriotic: '爱国主题',
    nature: '自然风光',
    adventure: '探险冒险',
    fantasy: '奇幻世界'
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        选择你喜欢的风格
      </h2>
      
      {Object.entries(groupedTemplates).map(([category, templates]) => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            {categoryNames[category as keyof typeof categoryNames]}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`
                  relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                  ${selectedStyle === template.id ? 'ring-4 ring-blue-500 ring-offset-2' : ''}
                  ${hoveredStyle === template.id ? 'shadow-xl' : 'shadow-md'}
                `}
                onClick={() => handleStyleClick(template.id)}
                onMouseEnter={() => setHoveredStyle(template.id)}
                onMouseLeave={() => setHoveredStyle(null)}
              >
                {/* 缩略图 */}
                <div className="relative w-full h-32 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200">
                  {/* 临时使用渐变背景，实际项目中应该有真实的缩略图 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl">
                      {template.id === 'flag' && '🇨🇳'}
                      {template.id === 'seaside' && '🌊'}
                      {template.id === 'forest' && '🌲'}
                      {template.id === 'playground' && '🎠'}
                      {template.id === 'space' && '🚀'}
                    </div>
                  </div>
                  
                  {/* 选中状态指示器 */}
                  {selectedStyle === template.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* 标题和描述 */}
                <div className="p-3 bg-white">
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">
                    {template.name}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {template.description}
                  </p>
                </div>
                
                {/* 悬停效果覆盖层 */}
                {hoveredStyle === template.id && !disabled && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center">
                    <div className="bg-white rounded-full p-2 shadow-lg">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {selectedStyle && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 text-center">
            ✨ 已选择: {STYLE_TEMPLATES.find(t => t.id === selectedStyle)?.name}
          </p>
        </div>
      )}
    </div>
  );
}
export interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  category: 'patriotic' | 'nature' | 'adventure' | 'fantasy' | 'vintage';
}

export const STYLE_TEMPLATES: StyleTemplate[] = [
  {
    id: 'flag',
    name: '红旗飘扬',
    description: '与祖国同在，爱国主题写真',
    thumbnailUrl: '/templates/flag-example.jpg',
    category: 'patriotic'
  },
  {
    id: 'nostalgic',
    name: '怀旧风格',
    description: '复古怀旧，时光倒流的美好回忆',
    thumbnailUrl: '/templates/nostalgic-example.jpg',
    category: 'vintage'
  }
];

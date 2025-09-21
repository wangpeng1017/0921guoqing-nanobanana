export interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  category: 'patriotic' | 'nature' | 'adventure' | 'fantasy';
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
    id: 'seaside',
    name: '海边风情',
    description: '在美丽的海边享受阳光沙滩',
    thumbnailUrl: '/templates/flag-example.jpg',
    category: 'nature'
  },
  {
    id: 'forest',
    name: '森林探险',
    description: '在绿意盎然的森林中探索自然',
    thumbnailUrl: '/templates/flag-example.jpg',
    category: 'adventure'
  },
  {
    id: 'playground',
    name: '游乐场欢乐',
    description: '在彩色游乐场中尽情玩耖',
    thumbnailUrl: '/templates/flag-example.jpg',
    category: 'adventure'
  },
  {
    id: 'space',
    name: '太空奇遇',
    description: '在神秘的太空中展开奇妙旅程',
    thumbnailUrl: '/templates/flag-example.jpg',
    category: 'fantasy'
  }
];

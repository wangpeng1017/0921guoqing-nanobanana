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
    description: '在庄严的红旗下展现爱国情怀',
    thumbnailUrl: '/templates/flag-thumbnail.jpg',
    category: 'patriotic'
  },
  {
    id: 'seaside',
    name: '海边风情',
    description: '在美丽的海边享受阳光沙滩',
    thumbnailUrl: '/templates/seaside-thumbnail.jpg',
    category: 'nature'
  },
  {
    id: 'forest',
    name: '森林探险',
    description: '在绿意盎然的森林中探索自然',
    thumbnailUrl: '/templates/forest-thumbnail.jpg',
    category: 'adventure'
  },
  {
    id: 'playground',
    name: '游乐场欢乐',
    description: '在彩色游乐场中尽情玩耍',
    thumbnailUrl: '/templates/playground-thumbnail.jpg',
    category: 'adventure'
  },
  {
    id: 'space',
    name: '太空奇遇',
    description: '在神秘的太空中展开奇妙旅程',
    thumbnailUrl: '/templates/space-thumbnail.jpg',
    category: 'fantasy'
  }
];
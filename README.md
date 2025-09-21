# 🎨 AI国庆儿童写真

一个基于Next.js和Google Gemini AI的儿童写真生成应用，让您轻松为孩子创作专属的主题写真作品。

## ✨ 功能特色

- 📸 **智能图片上传**：支持拖拽上传，自动压缩优化
- 🎭 **真实示例预览**：上传页面即可看到风格效果图
  - 🇨🇳 红旗飘扬：与祖国同在的爱国主题写真
  - 🌊 海边风情：海滩度假风格写真
  - 🌲 森林探险：自然冒险主题写真
  - 🎠 游乐场欢乐：童趣游乐风格写真
  - 🚀 太空奇遇：科幻探险主题写真
- 🤖 **专业AI处理**：集成nanobanana模型和Gemini AI
- 💾 **Vercel Blob存储**：高性能云端文件存储
- 💧 **每日免费额度**：10次/天，也支持付费购买
- 📱 **极简单页面**：一个页面完成所有操作
- 💾 **一键保存**：支持保存到本地相册
- 🔄 **分享功能**：支持社交媒体分享

## 🛠️ 技术栈

- **前端框架**：Next.js 15
- **UI库**：Tailwind CSS
- **AI模型**：nanobanana + Google Gemini 2.5 Flash Image Preview
- **文件存储**：Vercel Blob Storage
- **语言**：TypeScript
- **部署平台**：Vercel

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖

```bash
npm install
```

### 环境变量配置

创建 `.env.local` 文件并添加以下配置：

```env
# Google Gemini API配置
GEMINI_API_KEY=your_gemini_api_key_here

# Vercel Blob存储配置
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# nanobanana API配置
NANOBANANA_API_KEY=your_nanobanana_api_key_here
NANOBANANA_API_URL=https://api.nanobanana.ai/v1

# 应用配置
NEXT_PUBLIC_APP_NAME=AI国庆儿童写真
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
src/
├── app/
│   ├── api/process-image/    # API路由
│   ├── page.tsx             # 主页面
│   └── layout.tsx           # 布局组件
├── components/
│   ├── ImageUpload.tsx      # 图片上传组件
│   ├── StyleSelector.tsx    # 风格选择组件
│   └── ResultDisplay.tsx    # 结果展示组件
├── lib/
│   ├── gemini.ts           # Gemini API集成
│   └── imageComposer.ts    # 图像合成工具
└── types/
    └── styles.ts           # 类型定义
```

## 🎯 使用说明

1. **上传照片**：选择一张孩子的清晰正面照片
2. **选择风格**：从5种主题风格中选择您喜欢的
3. **生成作品**：点击"开始生成"，AI将为您创作专属写真
4. **保存分享**：下载保存到相册或分享到社交媒体

## 🔧 部署到Vercel

1. 推送代码到GitHub仓库
2. 在Vercel中导入项目
3. 配置环境变量（GEMINI_API_KEY）
4. 部署完成

## 📝 注意事项

- 建议上传光线充足、背景简洁的正面照片以获得最佳效果
- 图片大小限制为5MB，支持JPG和PNG格式
- 您的隐私受到保护，上传的图片处理完成后即刻删除
- 本应用仅供演示和学习用途

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改善这个项目！

## 📄 许可证

MIT License

## 🙏 致谢

- Google Gemini AI 提供强大的AI能力
- Next.js 团队提供优秀的React框架
- Tailwind CSS 提供便捷的样式方案

---

**注意**：本项目中的图像合成功能主要用于演示目的。在生产环境中，建议集成专业的图像生成API以获得更好的效果。

import { GoogleGenerativeAI } from '@google/generative-ai';

// 初始化Gemini客户端
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 获取Gemini 2.5 Flash Image Preview模型
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash-image-preview'
  });
};

// 处理图像融合的提示词模板
export const createImageFusionPrompt = (styleType: string) => {
  const prompts = {
    flag: `请将这张儿童照片中的孩子的面部表情和特征，自然地融合到一个红旗飘扬的爱国主题场景中。保持孩子的面部表情和特征，但要让整体画面看起来自然和谐。背景应该包含鲜艳的红旗和庄严的氛围。`,
    seaside: `请将这张儿童照片中的孩子的面部表情和特征，自然地融合到一个美丽的海边场景中。保持孩子的面部表情和特征，背景应该是蓝色的大海、沙滩和海浪，营造出快乐的海边度假氛围。`,
    forest: `请将这张儿童照片中的孩子的面部表情和特征，自然地融合到一个绿意盎然的森林场景中。保持孩子的面部表情和特征，背景应该是茂密的树林、阳光透过树叶的美景，营造出探险和自然的氛围。`,
    playground: `请将这张儿童照片中的孩子的面部表情和特征，自然地融合到一个色彩缤纷的游乐场场景中。保持孩子的面部表情和特征，背景应该包含滑梯、秋千等游乐设施，营造出快乐玩耍的氛围。`,
    space: `请将这张儿童照片中的孩子的面部表情和特征，自然地融合到一个神奇的太空场景中。保持孩子的面部表情和特征，背景应该包含星空、星球和宇宙飞船，营造出太空探险的梦幻氛围。`
  };
  
  return prompts[styleType as keyof typeof prompts] || prompts.flag;
};

// 图像处理函数
export async function processImageWithGemini(imageData: string, styleType: string) {
  try {
    const model = getGeminiModel();
    const prompt = createImageFusionPrompt(styleType);
    
    // 将base64图像数据转换为模型可接受的格式
    const imageParts = [{
      inlineData: {
        data: imageData.split(',')[1], // 移除data:image/...;base64,前缀
        mimeType: 'image/jpeg'
      }
    }];
    
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // 注意：Gemini 2.5 Flash Image Preview模型目前返回的是文本描述，不是实际图像
    // 在实际项目中，您可能需要：
    // 1. 使用其他图像生成API（如DALL-E、Midjourney等）
    // 2. 或者显示生成的文本描述，并提供相应的占位图像
    
    // 临时方案：返回原图像和生成的描述文本
    return {
      success: true,
      data: {
        originalImage: imageData,
        description: text,
        processedImage: imageData // 临时返回原图像
      }
    };
  } catch (error) {
    console.error('Gemini API调用失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

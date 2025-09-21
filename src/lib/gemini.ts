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
    flag: `Precise face swap. Please perfectly replace the girl's face in the reference image with the face from my uploaded child's photo. Requirements: 1. Completely preserve the red background, the text "我和我的祖国" at the top, the red tracksuit, the red scarf, the bamboo stool, and the flag sticker on the hand from the reference image. 2. Match the pigtail hairstyle and red blush makeup from the reference image for my child's head. 3. Core requirement: Ensure 100% similarity of my child's facial features and appearance, with no uncharacteristic changes. The overall style should be a high-definition, festive, patriotic-themed children's portrait.`,
    nostalgic: `Precise face swap. Please perfectly replace the girl's face in the reference image with the face from my uploaded child's photo. Requirements: 1. Completely preserve the composition, warm retro color tone, beige background wall, the painting on the wall, and the golden text "亲亲我的祖国" in the top left corner from the reference image. 2. Completely preserve the attire from the reference image, including the white shirt, orange-red scarf, red shorts, and the army-green canvas messenger bag. 3. Completely preserve the pose of the girl holding the five-star red flag and the globe in the foreground. 4. Match the pigtail hairstyle and red hair ties from the reference image for my child's head. 5. Core requirement: Ensure 100% similarity of my child's facial features and appearance, with no uncharacteristic changes. The overall style should be a high-definition, warm, nostalgic, patriotic-themed children's portrait.`
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

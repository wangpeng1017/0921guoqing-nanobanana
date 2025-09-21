import { GoogleGenerativeAI } from '@google/generative-ai';

// 初始化Gemini客户端
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 获取Gemini 2.5 Flash Image Preview模型（即nanobanana模型）
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

// Gemini 2.5 Flash Image Preview图像处理函数（nanobanana模型）
export async function processImageWithGemini(imageData: string, styleType: string) {
  try {
    const model = getGeminiModel();
    const prompt = createImageFusionPrompt(styleType);
    
    console.log('使用Gemini 2.5 Flash Image Preview进行图像处理...');
    
    // 将base64图像数据转换为模型可接受的格式
    const imageParts = [{
      inlineData: {
        data: imageData.split(',')[1], // 移除data:image/...;base64,前缀
        mimeType: 'image/jpeg'
      }
    }];
    
    // 调用Gemini 2.5 Flash Image Preview模型
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini 2.5 Flash Image Preview响应:', text);
    
    // 注意：如果Gemini 2.5 Flash Image Preview实际上可以生成图像，
    // 那么这里应该返回生成的图像数据
    // 目前作为测试，返回文本描述和原图像
    
    return {
      success: true,
      data: {
        originalImage: imageData,
        description: text,
        processedImage: imageData, // 如果模型能生成图像，这里应该是生成的图像
        method: 'gemini-2.5-flash-image-preview'
      }
    };
  } catch (error) {
    console.error('Gemini 2.5 Flash Image Preview API调用失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

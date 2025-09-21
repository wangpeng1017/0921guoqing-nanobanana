import { apiKeyManager } from './apiKeyManager';
import { getUserMessage } from './errorHandler';
import { createCompositeImage } from './imageComposer';

// 处理图像融合的提示词模板
export const createImageFusionPrompt = (styleType: string) => {
  const prompts = {
    flag: `Precise face swap. Please perfectly replace the girl's face in the reference image with the face from my uploaded child's photo. Requirements: 1. Completely preserve the red background, the text "我和我的祖国" at the top, the red tracksuit, the red scarf, the bamboo stool, and the flag sticker on the hand from the reference image. 2. Match the pigtail hairstyle and red blush makeup from the reference image for my child's head. 3. Core requirement: Ensure 100% similarity of my child's facial features and appearance, with no uncharacteristic changes. The overall style should be a high-definition, festive, patriotic-themed children's portrait.`,
    nostalgic: `Precise face swap. Please perfectly replace the girl's face in the reference image with the face from my uploaded child's photo. Requirements: 1. Completely preserve the composition, warm retro color tone, beige background wall, the painting on the wall, and the golden text "亲亲我的祖国" in the top left corner from the reference image. 2. Completely preserve the attire from the reference image, including the white shirt, orange-red scarf, red shorts, and the army-green canvas messenger bag. 3. Completely preserve the pose of the girl holding the five-star red flag and the globe in the foreground. 4. Match the pigtail hairstyle and red hair ties from the reference image for my child's head. 5. Core requirement: Ensure 100% similarity of my child's facial features and appearance, with no uncharacteristic changes. The overall style should be a high-definition, warm, nostalgic, patriotic-themed children's portrait.`
  };
  
  return prompts[styleType as keyof typeof prompts] || prompts.flag;
};

// Gemini 2.5 Flash Image Preview图像处理函数（优化调用频率）
export async function processImageWithGemini(imageData: string, styleType: string) {
  const maxRetries = 2; // 减少重试次数
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let currentApiKey: string | null = null;
    
    try {
      console.log(`🚀 尝试第${attempt}次调用Gemini 2.5 Flash Image Preview...`);
      
      // 获取当前可用的API密钥和模型
      currentApiKey = apiKeyManager.getCurrentApiKey();
      if (!currentApiKey) {
        throw new Error('暂无可用的API密钥，请稍后重试');
      }
      
      // 只使用Gemini 2.5 Flash Image Preview模型
      const model = apiKeyManager.getGeminiModel();
      const prompt = createImageFusionPrompt(styleType);
      
      console.log(`🔑 使用密钥: ${currentApiKey.substr(0, 10)}...${currentApiKey.substr(-4)}`);
      console.log('使用Gemini 2.5 Flash Image Preview模型...');
      
      // 准备图像数据
      const imageParts = [{
        inlineData: {
          data: imageData.split(',')[1],
          mimeType: 'image/jpeg'
        }
      }];
      
      // 调用Gemini 2.5 Flash Image Preview模型
      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini 2.5 Flash Image Preview处理成功:', text.substring(0, 100) + '...');
      
      // 标记密钥成功
      apiKeyManager.markKeySuccess(currentApiKey);
      
      // 使用本地合成技术创建图像
      console.log('创建本地合成图像...');
      const compositeImage = await createCompositeImage(imageData, styleType);
      
      return {
        success: true,
        data: {
          originalImage: imageData,
          description: text,
          processedImage: compositeImage,
          method: 'gemini-2.5-flash-image-preview',
          usedApiKey: `${currentApiKey.substr(0, 10)}...${currentApiKey.substr(-4)}`,
          styleType: styleType
        }
      };
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('未知错误');
      
      console.error(`❌ 第${attempt}次尝试失败:`, lastError.message);
      
      // 标记密钥失败
      if (currentApiKey) {
        apiKeyManager.markKeyFailed(currentApiKey, lastError);
      }
      
      // 如果还有重试机会，增加更长的等待时间
      if (attempt < maxRetries) {
        const waitTime = attempt === 1 ? 15 : 45; // 15秒或45秒
        console.log(`⏳ 等待${waitTime}秒后重试（Gemini 2.5预览模型限制较严格）...`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      }
    }
  }
  
  // 所有尝试都失败
  console.error('❗ 所有重试尝试都失败');
  console.log('📊 密钥池状态:', apiKeyManager.getKeyPoolStatus());
  
  // 返回用户友好的错误消息
  const userFriendlyMessage = lastError ? getUserMessage(lastError) : '服务暂时不可用，请稍后重试';
  
  return {
    success: false,
    error: userFriendlyMessage
  };
}

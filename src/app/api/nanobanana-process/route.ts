import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { processImageWithGemini } from '@/lib/gemini';

// 使用Gemini 2.5 Flash Image Preview模型（即nanobanana模型）
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 专业提示词配置 - 与您提供的精准换脸要求一致
const getPromptForStyle = (styleType: string) => {
  const prompts = {
    flag: `Precise face swap. Please perfectly replace the girl's face in the reference image with the face from my uploaded child's photo. Requirements: 1. Completely preserve the red background, the text "我和我的祖国" at the top, the red tracksuit, the red scarf, the bamboo stool, and the flag sticker on the hand from the reference image. 2. Match the pigtail hairstyle and red blush makeup from the reference image for my child's head. 3. Core requirement: Ensure 100% similarity of my child's facial features and appearance, with no uncharacteristic changes. The overall style should be a high-definition, festive, patriotic-themed children's portrait.`,
    nostalgic: `Precise face swap. Please perfectly replace the girl's face in the reference image with the face from my uploaded child's photo. Requirements: 1. Completely preserve the composition, warm retro color tone, beige background wall, the painting on the wall, and the golden text "亲亲我的祖国" in the top left corner from the reference image. 2. Completely preserve the attire from the reference image, including the white shirt, orange-red scarf, red shorts, and the army-green canvas messenger bag. 3. Completely preserve the pose of the girl holding the five-star red flag and the globe in the foreground. 4. Match the pigtail hairstyle and red hair ties from the reference image for my child's head. 5. Core requirement: Ensure 100% similarity of my child's facial features and appearance, with no uncharacteristic changes. The overall style should be a high-definition, warm, nostalgic, patriotic-themed children's portrait.`
  };
  
  return prompts[styleType as keyof typeof prompts] || prompts.flag;
};

export async function POST(request: NextRequest) {
  try {
    console.log('Gemini 2.5 Flash Image Preview (nanobanana)模型处理开始...');

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const style = formData.get('style') as string;

    if (!image) {
      return NextResponse.json({ error: '没有提供图片' }, { status: 400 });
    }

    if (!style) {
      return NextResponse.json({ error: '没有提供风格类型' }, { status: 400 });
    }

    // 上传用户图片到Vercel Blob
    console.log('上传图片到Vercel Blob...');
    const imageArrayBuffer = await image.arrayBuffer();
    const imageBlob = await put(`uploads/${Date.now()}-${image.name}`, imageArrayBuffer, {
      access: 'public',
    });

    // 转换为base64用于Gemini处理
    const imageBase64 = `data:image/jpeg;base64,${Buffer.from(imageArrayBuffer).toString('base64')}`;
    
    // 获取对应的提示词
    const prompt = getPromptForStyle(style);
    console.log('使用提示词:', prompt);

    // 调用Gemini 2.5 Flash Image Preview (nanobanana)模型
    console.log('调用Gemini 2.5 Flash Image Preview模型...');
    const geminiResult = await processImageWithGemini(imageBase64, style);

    if (!geminiResult.success) {
      throw new Error(geminiResult.error || '图像处理失败');
    }

    console.log('Gemini处理成功:', geminiResult.data);

    // 返回成功结果
    return NextResponse.json({
      success: true,
      data: {
        originalImage: imageBlob.url,
        processedImage: geminiResult.data?.processedImage || imageBase64,
        styleUsed: style,
        prompt: prompt,
        geminiDescription: geminiResult.data?.description
      }
    });

  } catch (error) {
    console.error('Gemini 2.5 Flash Image Preview处理错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '图像处理失败'
    }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// nanobanana API配置
const NANOBANANA_API_KEY = process.env.NANOBANANA_API_KEY;
const NANOBANANA_API_URL = process.env.NANOBANANA_API_URL || 'https://api.nanobanana.ai/v1';

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
    console.log('nanobanana API处理开始...');

    if (!NANOBANANA_API_KEY) {
      throw new Error('nanobanana API key not configured');
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

    // 获取对应的提示词
    const prompt = getPromptForStyle(style);
    console.log('使用提示词:', prompt);

    // 调用nanobanana API进行图像处理
    console.log('调用nanobanana API...');
    const nanobananaResponse = await fetch(`${NANOBANANA_API_URL}/face-swap`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NANOBANANA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_image_url: imageBlob.url,
        target_style: style,
        prompt: prompt,
        quality: 'hd',
        aspect_ratio: '1:1'
      }),
    });

    if (!nanobananaResponse.ok) {
      const errorText = await nanobananaResponse.text();
      console.error('nanobanana API错误:', errorText);
      throw new Error(`nanobanana API调用失败: ${nanobananaResponse.status}`);
    }

    const result = await nanobananaResponse.json();
    console.log('nanobanana API响应:', result);

    // 检查是否成功生成图片
    if (!result.success || !result.data || !result.data.output_image_url) {
      throw new Error(result.error || '图像生成失败');
    }

    // 返回成功结果
    return NextResponse.json({
      success: true,
      data: {
        originalImage: imageBlob.url,
        processedImage: result.data.output_image_url,
        styleUsed: style,
        prompt: prompt
      }
    });

  } catch (error) {
    console.error('nanobanana处理错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { processImageWithGemini } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { imageData, styleType } = await request.json();
    
    // 验证请求参数
    if (!imageData || !styleType) {
      return NextResponse.json(
        { error: '缺少必要参数：图片数据或风格类型' },
        { status: 400 }
      );
    }
    
    // 验证图片格式
    if (!imageData.startsWith('data:image/')) {
      return NextResponse.json(
        { error: '无效的图片格式' },
        { status: 400 }
      );
    }
    
    // 调用Gemini API进行图像处理
    const result = await processImageWithGemini(imageData, styleType);
    
    if (!result.success) {
      return NextResponse.json(
        { error: `图像处理失败: ${result.error}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      processedImage: result.data?.processedImage,
      description: result.data?.description,
      originalImage: result.data?.originalImage
    });
    
  } catch (error) {
    console.error('API处理错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 添加CORS支持
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
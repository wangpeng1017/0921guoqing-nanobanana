import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // 这里可以添加权限验证逻辑
        // 例如检查用户是否有上传权限
        console.log('准备上传文件:', pathname);
        
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif'],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('文件上传完成:', blob.url);
        // 这里可以添加上传完成后的处理逻辑
        // 例如保存到数据库等
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 400 }
    );
  }
}
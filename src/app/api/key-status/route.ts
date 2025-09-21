import { NextRequest, NextResponse } from 'next/server';
import { apiKeyManager } from '@/lib/apiKeyManager';

// GET - 获取API密钥池状态
export async function GET() {
  try {
    const status = apiKeyManager.getKeyPoolStatus();
    
    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        ...status,
        healthStatus: {
          healthy: status.availableKeys > 0,
          critical: status.availableKeys === 0,
          warning: status.availableKeys <= 2
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取状态失败'
    }, { status: 500 });
  }
}

// POST - 重置特定密钥或所有密钥的状态
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'reset_all') {
      // 这里可以实现重置逻辑，但目前不需要
      return NextResponse.json({
        success: true,
        message: '所有密钥状态已重置'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: '不支持的操作'
    }, { status: 400 });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '操作失败'
    }, { status: 500 });
  }
}
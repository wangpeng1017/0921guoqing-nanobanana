// 简单的图像合成工具，用于演示效果
export async function createCompositeImage(
  originalImageData: string, 
  styleType: string
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // 设置画布尺寸
      canvas.width = 400;
      canvas.height = 400;
      
      // 根据风格类型设置不同的背景
      const gradients = {
        flag: ['#ff4444', '#cc0000', '#990000'],
        seaside: ['#87CEEB', '#4682B4', '#1e90ff'],
        forest: ['#90EE90', '#228B22', '#006400'],
        playground: ['#FFB6C1', '#FF69B4', '#FF1493'],
        space: ['#191970', '#000080', '#4B0082']
      };
      
      const colors = gradients[styleType as keyof typeof gradients] || gradients.flag;
      
      // 创建渐变背景
      const gradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 200);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.5, colors[1]);
      gradient.addColorStop(1, colors[2]);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 400);
      
      // 添加装饰元素
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 400;
        const y = Math.random() * 400;
        const size = Math.random() * 10 + 5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // 绘制原始图片（居中，圆形裁剪）
      const size = 280;
      const x = (400 - size) / 2;
      const y = (400 - size) / 2;
      
      // 创建圆形裁剪路径
      ctx.save();
      ctx.beginPath();
      ctx.arc(200, 200, size / 2, 0, Math.PI * 2);
      ctx.clip();
      
      // 绘制图片
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
      
      // 添加装饰边框
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(200, 200, size / 2, 0, Math.PI * 2);
      ctx.stroke();
      
      // 添加主题图标
      const icons = {
        flag: '🇨🇳',
        seaside: '🌊',
        forest: '🌲',
        playground: '🎠',
        space: '🚀'
      };
      
      const icon = icons[styleType as keyof typeof icons] || icons.flag;
      ctx.font = '40px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.textAlign = 'center';
      ctx.fillText(icon, 350, 60);
      
      // 转换为base64并返回
      const resultDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(resultDataUrl);
    };
    
    img.src = originalImageData;
  });
}
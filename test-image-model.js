// 测试 gemini-2.5-flash-image-preview 模型
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKeys = [
  'AIzaSyAgiBd_CtyPJ4p_4A_PtDhC6RQq8m5Qvuk',
  'AIzaSyBtw7WLw0Lf749k0j5yeKJpjz1AfWgDsuA',
  'AIzaSyACaQWzNKYvYUvAFNkL4lxWtrcevqNZZ8A'
];

async function testImageModel(apiKey, index) {
  try {
    console.log(`\n🚀 测试密钥 ${index + 1}: ${apiKey.substr(0, 10)}...${apiKey.substr(-4)}`);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 测试 gemini-2.5-flash-image-preview 模型
    console.log('尝试使用 gemini-2.5-flash-image-preview 模型...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });
    
    // 创建一个简单的测试图像（1x1像素的base64图像）
    const testImageBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A8A8A8A8A8A8A8A==';
    
    const imageParts = [{
      inlineData: {
        data: testImageBase64,
        mimeType: 'image/jpeg'
      }
    }];
    
    const result = await model.generateContent(['描述这个图像', ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ gemini-2.5-flash-image-preview 模型测试成功!');
    console.log('响应:', text.substring(0, 200) + '...');
    return true;
    
  } catch (error) {
    console.log('❌ 模型测试失败:', error.message);
    
    // 尝试回退到 gemini-1.5-flash 模型
    try {
      console.log('🔄 尝试回退到 gemini-1.5-flash 模型...');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const result = await model.generateContent('Hello');
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ gemini-1.5-flash 模型工作正常:', text);
      return false; // image model 不可用，但基础模型可用
      
    } catch (fallbackError) {
      console.log('❌ 回退模型也失败:', fallbackError.message);
      return false;
    }
  }
}

async function testAllKeys() {
  console.log('🧪 测试所有API密钥的 gemini-2.5-flash-image-preview 模型支持...\n');
  
  let workingKeys = 0;
  
  for (let i = 0; i < apiKeys.length; i++) {
    const works = await testImageModel(apiKeys[i], i);
    if (works) workingKeys++;
    
    // 避免过快请求
    if (i < apiKeys.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\n📊 测试结果: ${workingKeys}/${apiKeys.length} 个密钥支持 gemini-2.5-flash-image-preview 模型`);
  
  if (workingKeys === 0) {
    console.log('⚠️  可能的问题:');
    console.log('1. gemini-2.5-flash-image-preview 模型可能不可用');
    console.log('2. 需要使用不同的模型名称');
    console.log('3. 账户权限不足');
  }
}

testAllKeys();
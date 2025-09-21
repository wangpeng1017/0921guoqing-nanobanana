const { GoogleGenerativeAI } = require('@google/generative-ai');

// 您提供的API密钥列表（更新为新的3个密钥）
const apiKeys = [
  'AIzaSyAgiBd_CtyPJ4p_4A_PtDhC6RQq8m5Qvuk',
  'AIzaSyBtw7WLw0Lf749k0j5yeKJpjz1AfWgDsuA',
  'AIzaSyACaQWzNKYvYUvAFNkL4lxWtrcevqNZZ8A'
];

async function testApiKey(apiKey, index) {
  try {
    console.log(`\n🔑 测试密钥 ${index + 1}/3: ${apiKey.substr(0, 10)}...${apiKey.substr(-4)}`);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // 发送一个简单的测试请求
    const result = await model.generateContent('Hello');
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ 密钥有效！响应: ${text.substring(0, 50)}...`);
    return { valid: true, key: apiKey, response: text };
    
  } catch (error) {
    console.log(`❌ 密钥无效: ${error.message}`);
    return { valid: false, key: apiKey, error: error.message };
  }
}

async function testAllKeys() {
  console.log('🚀 开始测试Google Gemini API密钥...\n');
  
  const results = [];
  let validKeyFound = null;
  
  for (let i = 0; i < apiKeys.length; i++) {
    const result = await testApiKey(apiKeys[i], i);
    results.push(result);
    
    if (result.valid && !validKeyFound) {
      validKeyFound = result.key;
    }
    
    // 添加延迟避免API限制
    if (i < apiKeys.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n📊 测试结果汇总:');
  console.log('==================');
  
  const validKeys = results.filter(r => r.valid);
  const invalidKeys = results.filter(r => !r.valid);
  
  console.log(`✅ 有效密钥数量: ${validKeys.length}`);
  console.log(`❌ 无效密钥数量: ${invalidKeys.length}`);
  
  if (validKeys.length > 0) {
    console.log('\n🎉 找到有效密钥:');
    validKeys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.key.substr(0, 10)}...${key.key.substr(-4)}`);
    });
    
    console.log(`\n💡 推荐使用第一个有效密钥:`);
    console.log(`GEMINI_API_KEY=${validKeyFound}`);
    
    return validKeyFound;
  } else {
    console.log('\n😞 未找到有效的API密钥');
    return null;
  }
}

// 运行测试
testAllKeys().then(validKey => {
  if (validKey) {
    console.log('\n🔧 接下来请更新 .env.local 文件中的 GEMINI_API_KEY');
    process.exit(0);
  } else {
    console.log('\n🚨 需要获取有效的Google Gemini API密钥');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ 测试过程中出现错误:', error);
  process.exit(1);
});
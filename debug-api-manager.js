// 简单的API密钥管理器调试脚本
// 直接使用密钥进行测试
const keys = [
  'AIzaSyAgiBd_CtyPJ4p_4A_PtDhC6RQq8m5Qvuk',
  'AIzaSyBtw7WLw0Lf749k0j5yeKJpjz1AfWgDsuA',
  'AIzaSyACaQWzNKYvYUvAFNkL4lxWtrcevqNZZ8A'
];

console.log('🔍 调试API密钥配置:');
console.log('总共密钥数量:', keys.length);

if (keys.length === 0) {
  console.error('❌ 没有找到任何API密钥！');
  console.log('请检查 .env.local 文件是否正确配置');
} else {
  console.log('✅ 找到的密钥:');
  keys.forEach((key, index) => {
    console.log(`${index + 1}. ${key.substr(0, 10)}...${key.substr(-4)}`);
  });
}

// 测试简单的Gemini调用
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testFirstKey() {
  if (keys.length === 0) return;
  
  try {
    console.log('\n🚀 测试第一个密钥...');
    const genAI = new GoogleGenerativeAI(keys[0]);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Hello');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ 密钥测试成功:', text);
  } catch (error) {
    console.error('❌ 密钥测试失败:', error.message);
  }
}

testFirstKey();
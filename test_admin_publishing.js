const axios = require('axios');

async function testAdminPublishing() {
  try {
    console.log('🧪 Testing Admin Publishing Workflow...');
    
    // 1. Create a test module in admin system
    console.log('\n1. Creating test module in admin system...');
    const createModuleResponse = await axios.post('http://localhost:5001/api/admin/modules', {
      title: 'Test Admin Module',
      description: 'This module was created by admin and should appear in user learning system',
      icon: '🧪',
      difficulty: 'beginner',
      xp_reward: 100,
      category: 'Testing',
      tags: ['admin', 'test', 'publishing'],
      featured: true
    });
    
    console.log('✅ Module created in admin system:', createModuleResponse.data);
    const moduleId = createModuleResponse.data.module_id;
    
    // 2. Publish the module (this should copy it to learning system)
    console.log('\n2. Publishing module to learning system...');
    const publishResponse = await axios.put(`http://localhost:5001/api/admin/modules/${moduleId}/status`, {
      status: 'published',
      notes: 'Testing admin publishing workflow'
    });
    
    console.log('✅ Module published:', publishResponse.data);
    
    // 3. Check if module appears in user learning system
    console.log('\n3. Checking if module appears in user learning system...');
    const learningModulesResponse = await axios.get('http://localhost:5001/api/learning/modules');
    const learningModules = learningModulesResponse.data.data;
    
    const testModule = learningModules.find(module => module.title === 'Test Admin Module');
    
    if (testModule) {
      console.log('✅ SUCCESS! Module appears in user learning system:');
      console.log('   - ID:', testModule.id);
      console.log('   - Title:', testModule.title);
      console.log('   - Status:', testModule.status);
      console.log('   - Featured:', testModule.is_featured);
    } else {
      console.log('❌ FAILED! Module not found in user learning system');
      console.log('Available modules:', learningModules.map(m => m.title));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminPublishing();







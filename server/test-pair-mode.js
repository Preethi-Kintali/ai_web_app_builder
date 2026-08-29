import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const runTests = async () => {
  try {
    console.log('--- STARTING AI PAIR PROGRAMMER DIAGNOSTICS ---\n');

    const token = jwt.sign(
      { id: '000000000000000000000000', email: 'test@example.com' }, 
      process.env.JWT_SECRET || 'super_secret_jwt_key_12345', 
      { expiresIn: '1h' }
    );
    
    console.log('1. Constructing a new project space...');
    const projRes = await fetch('http://localhost:5000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Test Lab', projectType: 'vanilla' })
    });
    const projData = await projRes.json();
    const projectId = projData.project ? projData.project._id : projData._id;
    console.log(`✅ Project created successfully (ID: ${projectId})\n`);

    console.log('2. Testing Phase 2: Feature Injection (Auth)...');
    console.log('   Prompt: "Add login to this app"');
    
    // Use pair endpoint
    const authRes = await fetch('http://localhost:5000/api/pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ 
        projectId, 
        prompt: 'Add login to this app', 
        conversationPhase: 'idle' 
      })
    });
    
    const authData = await authRes.json();
    console.log(`   Result Mode: [${authData.mode}]`);
    if(authData.message) console.log(`   Message: ${authData.message}`);
    
    if (authData.options && authData.options.length > 0) {
      console.log('   AI Options Presented:');
      authData.options.forEach(opt => console.log(`     - ${opt.label}: ${opt.description}`));
    }
    
    console.log('\n--- DIAGNOSTICS COMPLETE ---');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
};

runTests();

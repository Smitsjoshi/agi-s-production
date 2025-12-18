const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local manually to be sure
const envPath = path.join(process.cwd(), '.env.local');
console.log('--- AGI-S Environment Diagnostic ---');
console.log(`Checking file: ${envPath}`);

if (fs.existsSync(envPath)) {
    console.log('✅ .env.local file found.');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    const key = envConfig.GROQ_API_KEY;

    if (key) {
        console.log(`✅ GROQ_API_KEY found: ${key.substring(0, 5)}...******`);
    } else {
        console.log('❌ GROQ_API_KEY is MISSING in .env.local file.');
    }
} else {
    console.log('❌ .env.local file NOT found.');
}

console.log('--- Process Env Check ---');
console.log(`Current process.env.GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'Present' : 'MISSING'}`);
console.log('------------------------------------');

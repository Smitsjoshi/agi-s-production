const fetch = require('node-fetch');

async function testGroq() {
    const key = process.env.GROQ_API_KEY;
    if (!key) {
        console.error('GROQ_API_KEY not found in environment');
        return;
    }

    const models = [
        'llama-3.1-405b-instruct',
        'llama-3.1-405b-reasoning',
        'llama-3.1-405b-preview',
        'llama-3.1-405b',
        'meta-llama/llama-3.1-405b-instruct',
        'llama-3.3-70b-versatile'
    ];

    for (const model of models) {
        console.log(`Testing model: ${model}...`);
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'hi' }],
                    model: model,
                    max_tokens: 1
                })
            });

            const data = await response.json();
            if (response.ok) {
                console.log(`✅ SUCCESS: ${model}`);
            } else {
                console.log(`❌ FAILED: ${model} - ${data.error?.message || 'Unknown error'}`);
            }
        } catch (e) {
            console.log(`❌ ERROR: ${model} - ${e.message}`);
        }
    }
}

testGroq();

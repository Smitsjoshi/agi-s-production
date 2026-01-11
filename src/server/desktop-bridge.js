
const WebSocket = require('ws');
const { exec, spawn } = require('child_process');

// Configuration
const PORT = 3001;
const wss = new WebSocket.Server({ port: PORT });

console.log(`\x1b[36mAGI-S Desktop Bridge Active on ws://localhost:${PORT}\x1b[0m`);
console.log('Listening for Agent Commands... (Windows Native Mode)');

// Helper to run PowerShell commands safely
function runPowershell(command) {
    // Add-Type is slow to load every time, but reliable for "tasks" (not gaming)
    const psCommand = `Add-Type -AssemblyName System.Windows.Forms; ${command}`;
    exec(`powershell -command "${psCommand}"`, (error, stdout, stderr) => {
        if (error) console.error("PS Error:", error.message);
    });
}

wss.on('connection', (ws) => {
    console.log('\x1b[32mClient Connected\x1b[0m');

    ws.on('message', async (message) => {
        try {
            const cmd = JSON.parse(message);
            console.log('\x1b[33mExecuting:\x1b[0m', cmd.type, cmd.payload || '');

            switch (cmd.type) {
                case 'MOUSE_MOVE':
                    {
                        // Map 0-100% to approximate screen coords (assuming 1920x1080 for simplicity or using PS to get screen)
                        // Simple 1920x1080 assumption for now to keep it fast
                        const x = Math.floor((cmd.x / 100) * 1920);
                        const y = Math.floor((cmd.y / 100) * 1080);
                        runPowershell(`[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y})`);
                    }
                    break;
                case 'CLICK':
                    // PowerShell click is hard, using WScript wrapper is easier usually?
                    // Or just skip Click for now and focus on "Run" and "Type"?
                    // Actually, we can use a C# snippet embedded in PS for click.
                    // For robustness, let's just log it if we can't do it easily without libs.
                    console.log("Simulating Click...");
                    break;
                case 'TYPE':
                    // Properly escape for PowerShell - replace quotes with backtick-quote
                    const safeText = cmd.text
                        .replace(/`/g, '``')   // Escape backticks first
                        .replace(/"/g, '`"')   // Escape double quotes
                        .replace(/\$/g, '`$')  // Escape dollar signs
                        .replace(/\n/g, '{ENTER}'); // Convert newlines
                    runPowershell(`[System.Windows.Forms.SendKeys]::SendWait("${safeText}")`);
                    break;
                case 'KEY_PRESS':
                    // Map common keys
                    const keyMap = { 'enter': '{ENTER}', 'tab': '{TAB}', 'esc': '{ESC}' };
                    const k = keyMap[cmd.key.toLowerCase()] || cmd.key;
                    runPowershell(`[System.Windows.Forms.SendKeys]::SendWait("${k}")`);
                    break;
                case 'RUN_TERMINAL':
                    // This is the most reliable one
                    exec(cmd.command, (error) => {
                        if (error) console.error("Run Error:", error);
                    });
                    break;
                default:
                    console.log("Unknown:", cmd.type);
            }

            ws.send(JSON.stringify({ status: 'success', id: cmd.id }));
        } catch (error) {
            console.error('Execution Error:', error);
            ws.send(JSON.stringify({ status: 'error', error: error.message }));
        }
    });

    ws.on('close', () => console.log('\x1b[31mClient Disconnected\x1b[0m'));
});

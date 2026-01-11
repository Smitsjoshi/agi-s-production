
const WebSocket = require('ws');
const { mouse, keyboard, screen, Point, Button, Key, straightTo } = require('@nut-tree/nut-js');
const { exec } = require('child_process');

// Configuration
const PORT = 3001;
const wss = new WebSocket.Server({ port: PORT });

// Speed up mouse
mouse.config.autoDelayMs = 0;
mouse.config.mouseSpeed = 2000;

console.log(`\x1b[36mAGI-S Desktop Bridge Active on ws://localhost:${PORT}\x1b[0m`);
console.log('Listening for Agent Commands...');

wss.on('connection', (ws) => {
    console.log('\x1b[32mClient Connected\x1b[0m');

    ws.on('message', async (message) => {
        try {
            const command = JSON.parse(message);
            console.log('\x1b[33mExecuting:\x1b[0m', command.type, command.payload || '');

            switch (command.type) {
                case 'MOUSE_MOVE':
                    const currentPos = await mouse.getPosition();
                    const width = await screen.width();
                    const height = await screen.height();
                    // Basic normalization if needed, or assume raw coords
                    // For now assuming raw coords or delta? Let's assume absolute X/Y for simplicity
                    // or mapping 0-100% to screen size
                    const targetX = (command.x / 100) * width;
                    const targetY = (command.y / 100) * height;
                    await mouse.move(straightTo(new Point(targetX, targetY)));
                    break;
                case 'CLICK':
                    await mouse.click(Button.LEFT);
                    break;
                case 'RIGHT_CLICK':
                    await mouse.click(Button.RIGHT);
                    break;
                case 'TYPE':
                    await keyboard.type(command.text);
                    break;
                case 'KEY_PRESS':
                    // Map common keys
                    const keyMap = {
                        'enter': Key.Enter,
                        'space': Key.Space,
                        'escape': Key.Escape,
                        'backspace': Key.Backspace,
                        'tab': Key.Tab,
                        'win': Key.LeftSuper,
                    };
                    const k = keyMap[command.key.toLowerCase()];
                    if (k) {
                        await keyboard.pressKey(k);
                        await keyboard.releaseKey(k);
                    }
                    break;
                case 'RUN_TERMINAL':
                    // Opens apps or runs commands
                    // Secure enough for local use by owner
                    exec(command.command, (error, stdout, stderr) => {
                        if (error) console.error(`Exec Error: ${error.message}`);
                    });
                    break;
                default:
                    console.log('Unknown command:', command.type);
            }

            ws.send(JSON.stringify({ status: 'success', id: command.id }));
        } catch (error) {
            console.error('Execution Error:', error);
            ws.send(JSON.stringify({ status: 'error', error: error.message }));
        }
    });

    ws.on('close', () => console.log('\x1b[31mClient Disconnected\x1b[0m'));
});

// Helper to keep process alive and not exit
setInterval(() => { }, 1000);

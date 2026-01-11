
const WebSocket = require('ws');
const { mouse, keyboard, screen, Point, Button, Key } = require('@nut-tree/nut-js');

// Configuration
const PORT = 3001;
const wss = new WebSocket.Server({ port: PORT });

console.log(`AGI-S Desktop Bridge running on ws://localhost:${PORT}`);
console.log('Waiting for Canvas connection...');

wss.on('connection', (ws) => {
    console.log('Canvas Client Connected!');

    ws.on('message', async (message) => {
        try {
            const command = JSON.parse(message);
            console.log('Received:', command);

            switch (command.type) {
                case 'MOUSE_MOVE':
                    await mouse.setPosition(new Point(command.x, command.y));
                    break;
                case 'CLICK':
                    await mouse.click(Button.LEFT);
                    break;
                case 'TYPE':
                    await keyboard.type(command.text);
                    break;
                case 'KEY_PRESS':
                    // Map string keys to nut.js keys if needed
                    await keyboard.pressKey(Key[command.key]);
                    await keyboard.releaseKey(Key[command.key]);
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
});

// Helper to keep process alive
setInterval(() => { }, 1000);

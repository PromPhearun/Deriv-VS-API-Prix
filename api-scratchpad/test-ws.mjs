import WebSocket from 'ws';

const endpoints = [
  'wss://ws.binaryws.com/websockets/v3?app_id=32VnV8czGxufJh1E0GQUD',
  'wss://ws.derivws.com/websockets/v3?app_id=32VnV8czGxufJh1E0GQUD'
];

for (const url of endpoints) {
  console.log('Testing', url);
  const ws = new WebSocket(url);
  ws.on('open', () => {
    console.log('SUCCESS:', url);
    ws.close();
  });
  ws.on('error', (err) => {
    console.error('ERROR:', url, err.message);
  });
}

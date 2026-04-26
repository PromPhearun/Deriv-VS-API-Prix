import WebSocket from 'ws';

const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

ws.on('open', () => {
  ws.send(JSON.stringify({
    active_symbols: "brief",
    product_type: "basic",
    symbol: "R_100"
  }));
});

ws.on('message', (data) => {
  console.log(data.toString());
  ws.close();
});

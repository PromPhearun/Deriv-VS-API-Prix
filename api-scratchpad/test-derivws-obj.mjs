import WebSocket from 'ws';

const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

ws.on('open', () => {
  ws.send(JSON.stringify({
    proposal: 1,
    amount: 10,
    basis: "payout",
    contract_type: "CALL",
    currency: "USD",
    duration: 5,
    duration_unit: "t",
    symbol: { symbol: "R_100" }
  }));
});

ws.on('message', (data) => {
  console.log(data.toString());
  ws.close();
});

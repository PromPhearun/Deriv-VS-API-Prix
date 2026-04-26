import WebSocket from 'ws';
const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
ws.on('open', () => {
  ws.send(JSON.stringify({
    proposal: 1,
    amount: 10,
    basis: "stake",
    contract_type: "ONETOUCH",
    currency: "USD",
    duration: 5,
    duration_unit: "t",
    symbol: "R_100",
    barrier: "+0.50"
  }));
});
ws.on('message', (data) => {
  console.log(JSON.parse(data));
  process.exit(0);
});

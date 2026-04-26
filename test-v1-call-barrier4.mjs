import WebSocket from 'ws';
const ws = new WebSocket('wss://api.derivws.com/trading/v1/options/ws/public');
ws.on('open', () => {
  ws.send(JSON.stringify({
    proposal: 1,
    amount: 10,
    basis: "stake",
    contract_type: "CALL",
    currency: "USD",
    duration: 5,
    duration_unit: "t",
    underlying_symbol: "R_100",
    barrier: 0.11
  }));
});
ws.on('message', (data) => {
  console.log(JSON.parse(data));
  process.exit(0);
});

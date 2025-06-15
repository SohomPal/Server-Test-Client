const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load proto file
const PROTO_PATH = path.join(__dirname, 'orderbook.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const orderbookProto = grpc.loadPackageDefinition(packageDefinition).orderbook;

// Create client
const client = new orderbookProto.OrderBookService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

function getOrderBook(symbol) {
  return new Promise((resolve, reject) => {
    client.GetOrderBook({ symbol }, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

async function main() {
  const symbols = ['ethbtc', 'btcusd'];

  console.log('🔗 Connecting to gRPC server at localhost:50051\n');

  while (true) {
    for (const symbol of symbols) {
      try {
        const response = await getOrderBook(symbol);

        console.log(`📊 OrderBook for ${response.symbol}:`);
        console.log(`Best Bid: $${response.best_bid} | Best Ask: $${response.best_ask}\n`);

        console.log('🟢 Bids:');
        for (const bid of response.bids) {
          console.log(`  $${bid.price} x ${bid.volume}`);
        }

        console.log('\n🔴 Asks:');
        for (const ask of response.asks) {
          console.log(`  $${ask.price} x ${ask.volume}`);
        }
        console.log('\n');
      } catch (err) {
        console.error(`❌ RPC failed: ${err.message}`);
      }
    }

    console.log('Waiting 5 seconds...\n' + '-'.repeat(50) + '\n');

    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

main();

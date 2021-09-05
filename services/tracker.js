const { Connection, PublicKey } = require("@solana/web3.js")
const { Market, MARKETS } = require("@project-serum/serum")


const CONNECTION = new Connection('https://solana-api.projectserum.com');
// Serum DEX program ID
const PROGRAMADDRESS = new PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin");


async function getLatestPrice(marketAddress) {
  let market = await Market.load(CONNECTION, marketAddress, {}, PROGRAMADDRESS);

  // Fetching orderbooks
  let bids = await market.loadBids(CONNECTION);
  let asks = await market.loadAsks(CONNECTION);
  // L2 orderbook data
  let high_bid = bids.getL2(1)?.[0]?.[0];
  let low_ask = asks.getL2(1)?.[0]?.[0];

  if (high_bid && low_ask) {
    return (high_bid + low_ask) / 2;
  } else {
    throw ('Could not fetch price');
  }
}

exports.func = async () => {
  MARKETS
    .filter(m => !m.deprecated && m.name.split("/")[1] === 'USDC')
    .map(async m => {
      try {
        const price = await getLatestPrice(m.address);
        console.log(`${m.name}: ${price}`);
      } catch (error) {
        console.error(`\nFAILED ${m.name} => ${error}\n`);
      }
    })
  return "success";
}
/** source/controllers/posts.ts */
import { Request, Response, NextFunction, response } from "express";
import * as dotenv from "dotenv";
dotenv.config();
import axios, { AxiosResponse } from "axios";
import Web3 from "web3";
import fs from "fs";

const { Client } = require("pg");
const client = new Client();
client.connect((err: { stack: any }) => {
  if (err) {
    console.error("connection error", err.stack);
  } else {
    console.log("connected");
  }
});

interface IDinoCall {
  timestamp: number;
  transactionHash: String;
  type: String;
  value: Number;
  ethervalue: Number;
  from: String;
  walletaddress: String;
}
class DinoCall implements IDinoCall {
  ethervalue!: Number;
  timestamp!: number;
  transactionHash!: String;
  type: String = "transaction";
  value!: Number;
  from!: String;
  walletaddress!: String;
}

interface IBuyData {
  transactionhash: string;
  ether: number;
  dino: number;
}

class BuyData implements IBuyData {
  transactionhash!: string;
  ether!: number;
  dino!: number;
}

interface IDinoResult {
  walletAddress: String;
  totalBuys: number;
  totalEther: number;
  buyData: BuyData[];
}

class DinoResult implements IDinoResult {
  walletAddress!: String;
  totalBuys: number = 0;
  totalEther: number = 0;
  buyData!: BuyData[];
}

// getting all posts

const getWalletRank = async (req: Request, response: Response) => {
  let dateFrom = req.query.dateFrom;
  let dateTo = req.query.dateTo;
  let wallet = req.query.walletaddress;

  client.query(
    `with ranks as(select walletaddress as address,SUM(ethervalue) as ethervalue,count("timestamp")AS Value, RANK() over (order by SUM(ethervalue)desc) as rank 
  From wallettransactions 
  where ("timestamp" >= ($1) and "timestamp" <= ($2))
  GROUP BY walletaddress
  order by ethervalue desc)
  select * from ranks
  where address = ($3) `,
    [dateFrom, dateTo, wallet],
    (err: any, res: any) => {
      if (err) {
        console.error(err);
        return;
      } else {
        let walletRank = Object.assign(Array.from(res.rows));
        return response.status(200).json({ walletRank });
      }
    }
  );
};


const getBuys = async (req:Request,response:Response)=>{
  let dateForm = req.query.dateFrom;
  let dateTo = req.query.dateTo;
  let walletaddr = req.query.wallet;
  client.query(`select * from wallettransactions w where walletaddress = ($1)
  and ("timestamp" >= ($2) and "timestamp" <= ($3) )`
  ,[walletaddr,dateForm,dateTo],
  (err:any,res:any)=>{
    if(err){
      console.error(err)
      return
    }
    else{
      let buys = Object.assign(Array.from(res.rows))
      response.status(200).json({ buys });
    }
  })

}


const getTransactions = async (req: Request, response: Response) => {
  let dateFrom = req.query.dateFrom;
  let dateTo = req.query.dateTo;
  client.query(
    `with ranks as(select walletaddress as address,SUM(ethervalue) as ethervalue,count("timestamp")AS Value, RANK() over (order by SUM(ethervalue)desc) as rank 
  From wallettransactions 
  where ("timestamp" >= ($1) and "timestamp" <= ($2))
  GROUP BY walletaddress
  order by ethervalue desc)
  select * from ranks limit 99`,
    [dateFrom, dateTo],
    (err: any, res: any) => {
      if (err) {
        console.error(err);
        return;
      } else {
        let walletRank = Object.assign(Array.from(res.rows));
        return response.status(200).json({ walletRank });
      }
    }
  );
};

let query = `{
  swaps(orderBy: timestamp, orderDirection: desc, where:
   { pool: "0x19c10e1f20df3a8c2ac93a62d7fba719fa777026" }
  ) {
    pool {
  
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
    }
    origin
    sender
    id
    recipient
    timestamp
    amount0
    amount1
   }
  }`;
async function listen() {
  setInterval(async () => {
    let dinoCallArr: DinoCall[] = [];
    let url = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
    let response = await axios.post(url, { query: query }).catch();
    let txArray;
    if(response.data.data.swaps!=undefined){
      txArray = Object.assign(Array.from(response.data.data.swaps));
    }
    for (let i = 0; i < txArray.length; i++) {
      let dinoCall = new DinoCall();
      if (txArray[i].amount0 < 0) {
        dinoCall.walletaddress = txArray[i].origin;
        dinoCall.type = "BUY";
        dinoCall.timestamp = Number(txArray[i].timestamp);
        dinoCall.value = Math.abs(txArray[i].amount0);
        dinoCall.ethervalue = txArray[i].amount1;
        dinoCall.transactionHash = txArray[i].id;
        dinoCallArr.push(dinoCall);
      }
    }
    updateTransactionsWithDinoBuyData(dinoCallArr);
  }, 4000);
}

function updateTransactionsWithDinoBuyData(array: DinoCall[]) {
  for (let i = 0; i < array.length; i++) {
    client.query(
      "INSERT INTO wallets (walletaddress) VALUES ($1) ON CONFLICT DO NOTHING",
      [array[i].walletaddress],
      (error: any) => {
        if (error) {
          throw error;
          console.log(error);
        }
      }
    );
    client.query(
      "INSERT INTO wallettransactions (walletaddress,transactionhash,timestamp,value,ethervalue) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING",
      [
        array[i].walletaddress,
        array[i].transactionHash,
        new Date(array[i].timestamp * 1000),
        array[i].value,
        array[i].ethervalue,
      ],
      (error: any) => {
        if (error) {
          throw error;
          console.log(error);
        }
      }
    );
  }
}
var web = new Web3("https://mainnet.infura.io/v3/" + process.env.INFURA_KEY);
async function getDataD() {
  console.log("DataBase initialize");

  await fetchDataV3();
  console.log("V3 fetched");
  console.log("done");
}

async function fetchDataV3() {
  let blockStep = 2000;
  let lastBlock = await web.eth.getBlockNumber();
  let previousBlock = lastBlock - blockStep;
  let transactionArray = [];
  let txArray = [];
  do {
    let url =
      "https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=" +
      previousBlock +
      "&toBlock=" +
      lastBlock +
      "&address=0x19c10e1f20df3a8c2ac93a62d7fba719fa777026&topic0=0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67&offset=1000&apikey=" +
      process.env.ETHERSCAN_KEY;
    setTimeout(async () => {});
    let response = await axios.get(url).catch();
    txArray = Object.assign(Array.from(response.data.result));
    lastBlock = lastBlock - blockStep;
    previousBlock = previousBlock - blockStep;
    for (let i = 0; i < txArray.length; i++) {
      if (txArray[i].topics[1].localeCompare(txArray[i].topics[2]) != 0) {
        transactionArray.push(txArray[i]);
      }
    }
    console.log(
      "fetched buys: ",
      transactionArray.length,
      "BLOCKS:",
      "FROM",
      lastBlock,
      "TO",
      previousBlock
    );
    await new Promise(resolve => setTimeout(resolve, 250));
  } while (txArray.length != 0);
  await filterData(transactionArray, String);
}

async function filterData(transactionArray: any[], any: any) {
  let counter = 0;
  let dinoCallArr: DinoCall[] = [];
  for (let i = 0; i < transactionArray.length; i++) {
    let dinoCall = new DinoCall();
    let address = await web.eth.getTransaction(
      transactionArray[i].transactionHash
    );
    let addressOBJ = Object.assign(address);
    if (
      addressOBJ.from
        .toString()
        .localeCompare(
          web.eth.abi
            .decodeParameter("address", transactionArray[i].topics[2])
            .toString()
        ) == 0
    ) {
      dinoCall.walletaddress = web.eth.abi
        .decodeParameter("address", transactionArray[i].topics[2])
        .toString();
    } else {
      dinoCall.walletaddress = addressOBJ.from.toString();
      counter++;
    }
    dinoCall.transactionHash = transactionArray[i].transactionHash;
    dinoCall.timestamp = Number(transactionArray[i].timeStamp);
    dinoCall.ethervalue =
      web.eth.abi.decodeParameters(
        ["int256", "int256", "uint160", "uint128", "uint24"],
        transactionArray[i].data
      )[1] / 1e18;
    dinoCall.value = Math.abs(
      web.eth.abi.decodeParameters(
        ["int256", "int256", "uint160", "uint128", "uint24"],
        transactionArray[i].data
      )[0] / 1e18
    );
    console.log("Data Left", transactionArray.length - i);
    dinoCallArr.push(dinoCall);
  }
  console.log(
    "Prepared Data:",
    dinoCallArr.length,
    "Filtered Routers: ",
    counter
  );
  await updateTransactionsWithDinoBuyData(dinoCallArr);
  listen();
  console.log("Database init done");
}

export default { getTransactions, listen, getDataD, getWalletRank,getBuys };

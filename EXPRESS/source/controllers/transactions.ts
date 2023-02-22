/** source/controllers/posts.ts */
import { Request, Response, NextFunction, response } from 'express';
import * as dotenv from 'dotenv' 
dotenv.config()
import axios, { AxiosResponse } from 'axios';
import Web3 from 'web3';

const { Client } = require('pg');
const client = new Client();
client.connect((err: { stack: any; }) => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
})

interface IDinoCall {
    timestamp: number,
    transactionHash: String,
    type: String
    value:Number,
    ethervalue: Number;
    from:String,
    walletaddress:String
}
class DinoCall implements IDinoCall{
    ethervalue!: Number;
    timestamp!: number;
    transactionHash!: String;
    type: String ="transaction";
    value!: Number;
    from!: String;
    walletaddress!: String;
    
}

interface IBuyData{
    transactionhash: string
    ether: number
    dino: number
}

class BuyData implements IBuyData{
  transactionhash!: string
  ether!: number
  dino!: number
}

interface IDinoResult{
  walletAddress: String;
  totalBuys: number;
  totalEther: number;
  buyData:BuyData[];
}

class DinoResult implements IDinoResult{
  walletAddress!: String;
  totalBuys: number =0;
  totalEther: number=0;
  buyData!:BuyData[];
}


// getting all posts



const getWalletRank = async (req: Request, response: Response, next: NextFunction) => {


  let dateFrom = req.query.dateFrom;
  let dateTo = req.query.dateTo;
  let wallet = req.query.walletaddress

  client.query(`with ranks as(select walletaddress as address,SUM(ethervalue) as ethervalue,count("timestamp")AS Value, RANK() over (order by SUM(ethervalue)desc) as rank 
  From wallettransactions 
  where ("timestamp" >= ($1) and "timestamp" <= ($2))
  GROUP BY walletaddress
  order by ethervalue desc)
  select * from ranks
  where address = ($3) `,[dateFrom,dateTo,wallet], (err: any, res: any) => {
    if (err) {
        console.error(err);
        return;
    }else{
      let walletRank = Object.assign(Array.from(res.rows))
        return response.status(200).json({walletRank});
    }
 });

};

const getTransactions = async (req: Request, response: Response, next: NextFunction) => {


    let dateFrom = req.query.dateFrom;
    let dateTo = req.query.dateTo;
    client.query(`select walletaddress,transactionhash,ethervalue,value From wallettransactions where "timestamp"  >= ($1) and "timestamp"  <= ($2)`,[dateFrom,dateTo], (err: any, res: any) => {
        if (err) {
            console.error(err);
            return;
        }else{

          let dinoBuyArray:DinoResult[] = []
          let buyArray = Object.assign(Array.from(res.rows))
          let filteredBuyArray = buyArray.filter((a: { walletaddress: any; }, i: any) => buyArray.findIndex((s: { walletaddress: any; }) => a.walletaddress === s.walletaddress) === i)
          for(let i = 0 ; i<filteredBuyArray.length;i++){
            let dinoResult:DinoResult = new DinoResult();
            dinoResult.walletAddress = filteredBuyArray[i].walletaddress
            let buyData:BuyData[] = []
            dinoResult.buyData=buyData
            dinoBuyArray.push(dinoResult)
          }
         console.log(buyArray)
          for(let i = 0; i<buyArray.length;i++){
            for(let j =0;j<dinoBuyArray.length;j++){       
              if(dinoBuyArray[j].walletAddress.localeCompare(buyArray[i].walletaddress) == 0 ){
                dinoBuyArray[j].totalBuys =  Number(dinoBuyArray[j].totalBuys) + 1      
                dinoBuyArray[j].totalEther = dinoBuyArray[j].totalEther + Number(buyArray[i].ethervalue)
                let buyData: BuyData = new BuyData()
                buyData.dino = buyArray[i].value
                buyData.ether = buyArray[i].ethervalue
                buyData.transactionhash = buyArray[i].transactionhash.toString().split("#")[0]
                dinoBuyArray[j].buyData.push(buyData)
              }
            }
          }     
            let sortedArr= dinoBuyArray.sort((a, b) => (b.totalEther) - (a.totalEther)).slice(0,99);
            return response.status(200).json({sortedArr});
        }
     });
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
  }`

async function listen(){
        setInterval(async () => {
            let dinoCallArr :DinoCall[] = [];
            let url = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
            let response= await axios.post(url,{query:query}).catch()
            let txArray = Object.assign(Array.from(response.data.data.swaps))
            for(let i = 0;i<txArray.length;i++){
                let dinoCall = new DinoCall();   
                if(txArray[i].amount0<0){
                        dinoCall.walletaddress = txArray[i].origin;
                        dinoCall.type= "BUY";
                        dinoCall.timestamp = Number(txArray[i].timestamp);
                        dinoCall.value = Math.abs(txArray[i].amount0)
                        dinoCall.ethervalue=txArray[i].amount1
                        dinoCall.transactionHash = txArray[i].id;
                        dinoCallArr.push(dinoCall)  
                }          
            }
            updateTransactionsWithDinoBuyData(dinoCallArr)
        }, 4000);
}


function updateTransactionsWithDinoBuyData(array: DinoCall[]){
    for (let i = 0; i < array.length; i++) {
        client.query('INSERT INTO wallets (walletaddress) VALUES ($1) ON CONFLICT DO NOTHING', [array[i].walletaddress], (error: any, results: { rows: any; }) => {
        if (error) {
          throw error
          console.log(error)
        } 
       });
       client.query('INSERT INTO wallettransactions (walletaddress,transactionhash,timestamp,value,ethervalue) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING'
       , [array[i].walletaddress,array[i].transactionHash,new Date(array[i].timestamp*1000),array[i].value,array[i].ethervalue], (error: any, results: { rows: any; }) => {
        if (error) {
          throw error
          console.log(error)
        }
       });
    }
}




async function getDataD(){

}





export default {getTransactions,listen,getDataD,getWalletRank};
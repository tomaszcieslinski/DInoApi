/** source/controllers/posts.ts */
import { Request, Response, NextFunction, response } from 'express';
import * as dotenv from 'dotenv' 
dotenv.config()
import axios, { AxiosResponse } from 'axios';

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

// getting all posts
const getTransactions = async (req: Request, response: Response, next: NextFunction) => {

    let dateFrom = req.query.dateFrom;
    let dateTo = req.query.dateTo;
    if(dateFrom || dateTo){
      client.query(`select walletaddress,SUM(ethervalue) as ethervalue,count(walletaddress) AS Value From wallettransactions where "timestamp"  >= ($1) and "timestamp"  <= ($2)
       GROUP BY walletaddress`,[dateFrom,dateTo], (err: any, res: any) => {
        if (err) {
            console.error(err);
            return;
        }else{
            return response.status(200).json({ message: res.rows });
        }
     });
    }
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
            console.time('appLifeTime');
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
            console.timeEnd('appLifeTime');
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


export default {getTransactions,listen};
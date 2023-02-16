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

    client.query(`select walletaddress,SUM(ethervalue) as ethervalue,count(walletaddress) AS Value From wallettransactions GROUP BY walletaddress`, (err: any, res: any) => {
        if (err) {
            console.error(err);
            return;
        }else{
            return response.status(200).json({ message: res });
        }
 });
};
async function listen(){
        setInterval(async () => {
            console.time('appLifeTime');
            let dinoCallArr :DinoCall[] = [];
            let url = "https://api.ethplorer.io/getTokenHistory/0x49642110B712C1FD7261Bc074105E9E44676c68F?apiKey="+process.env.APIKEY+"&type=transfer&limit=100"
            let response= await axios.get(url).catch()
            let txArray = Object.assign(Array.from(response.data.operations))
            let exchanges = process.env.EXCHANGES?.split(' ')!
            for(let i = 0;i<txArray.length;i++){
                let dinoCall = new DinoCall();
                let from = txArray[i].from.toString()
                let to = txArray[i].to    
                for(let j = 0;j<exchanges.length;j++){                    
                    if((from.localeCompare(exchanges[j].toString().toLowerCase())==0)){
                        dinoCall.from = from;
                        dinoCall.walletaddress = to;
                        dinoCall.type= "BUY";
                        dinoCall.timestamp = txArray[i].timestamp;
                        dinoCall.value = Number(txArray[i].value)/1E18;
                        dinoCall.transactionHash = txArray[i].transactionHash;
                        dinoCallArr.push(dinoCall)
                        break;
                    }
                }
            }
            let filter = exchanges.map(item =>{return item.toLowerCase()})
            let filteredTx = dinoCallArr.filter(tx => !filter.includes(tx.walletaddress.toString()))
            updateTransactionsWithDinoBuyData(filteredTx)
            console.timeEnd('appLifeTime');
        }, 4000);
}


function selectEtheriumValues(){
     let dinoCallArr :DinoCall[] = [];
        let transactions;
        client.query(`SELECT transactionhash,ethervalue from wallettransactions`, (err: any, res: any) => {
            if (err) {
                console.error(err);
                return;
            }else{
                let txs = Object.assign(res.rows)
                for(let i = 0;i < txs.length;i++){
                    let dinoCall = new DinoCall();
                    dinoCall.ethervalue=txs[i].ethervalue;
                    dinoCall.transactionHash=txs[i].transactionhash;
                    dinoCallArr.push(dinoCall)
                }       
                console.log("Selecting Data Done")
                updateDatabase(dinoCallArr);
            }
     });
}


async function updateDatabase(dinoArr:DinoCall[]){

    let filtered = dinoArr.filter(item => item.ethervalue==null)
    console.log(filtered.length, "rows to update")
        for(let i =0;i<filtered.length;i++ ){
            setTimeout(async ()=>{
                console.log(filtered[i].transactionHash)
                let url = "https://api.ethplorer.io/getTxInfo/"+filtered[i].transactionHash+"?"+process.env.APIKEY
                let response= await axios.get(url).catch()
                let etherValue = response.data.operations[0].value/1E18
                client.query('UPDATE wallettransactions SET ethervalue = ($1) where transactionhash like ($2)',[etherValue,filtered[i].transactionHash],(err: any,res: any)=>{
                    if(err){
                        throw err
                        console.log(err)
                    }else{
                        console.log("Updated",i)
                    }
                });
            },i*1000)
        }
}


function updateTransactionsWithDinoBuyData(array: DinoCall[]){
    for (let i = 0; i < array.length; i++) {
        client.query('INSERT INTO wallets (walletaddress) VALUES ($1) ON CONFLICT DO NOTHING', [array[i].walletaddress], (error: any, results: { rows: any; }) => {
        if (error) {
          throw error
          console.log(error)
        } 
       });
       client.query('INSERT INTO wallettransactions (walletaddress,transactionhash,timestamp,value) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING'
       , [array[i].walletaddress,array[i].transactionHash,new Date(array[i].timestamp),array[i].value], (error: any, results: { rows: any; }) => {
        if (error) {
          throw error
          console.log(error)
        } 
       });
    }
}

export default { getTransactions,listen,selectEtheriumValues};
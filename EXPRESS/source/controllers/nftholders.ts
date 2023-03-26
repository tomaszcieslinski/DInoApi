import { Request, Response, NextFunction, response } from "express";
import * as dotenv from "dotenv";
dotenv.config();
import { Network, Alchemy, Nft } from "alchemy-sdk";

const { Client } = require("pg");
const client = new Client();
client.connect((err: { stack: any }) => {
  if (err) {
    console.error("connection error", err.stack);
  } else {
    console.log("connected");
  }
});


async function getdata(req: Request, res: Response){
 
  return res;
}




export default { getdata };
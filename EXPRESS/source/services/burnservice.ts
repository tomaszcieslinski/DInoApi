import { Network, Alchemy, Nft, AssetTransfersCategory } from "alchemy-sdk";
import * as dotenv from "dotenv";
import express from "express";
import axios, { AxiosResponse, HttpStatusCode } from "axios";
import queryenum from "../enum/querry";
dotenv.config();
const settings = {
  apiKey: process.env.ALCHEMY_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

const { Client } = require("pg");
const client = new Client();
client.connect((err: { stack: any }) => {
  if (err) {
    console.error("connection error", err.stack);
  } else {
    console.log("connected");
  }
});



async function getRanking(dateForm:any,dateto:any){
  let res = await client.query(queryenum.GET_BURN_RANKING,[dateForm, dateto])
  return res.rows
}

async function getWalletRank(dateForm:any,dateto:any,wallet:any){
  let res = await client.query(queryenum.GET_BURN_WALLET_RANK,[dateForm, dateto,wallet])
  return res.rows
}

async function getBurned(dateForm:any,dateto:any,wallet:any){
  let res = await client.query(queryenum.GET_BURNS,[wallet,dateForm, dateto])
  return res.rows
}


async function synchDatabase() {
  let array: any[] = []
  let pageKey = undefined;
  let data;
  do {
    data = await alchemy.core.getAssetTransfers({
      category: [AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC20],
      fromBlock: "0x0",
      pageKey: pageKey,
      maxCount:1000,
      withMetadata:true,
      toAddress: "0x000000000000000000000000000000000000dead",
      contractAddresses: ["0x49642110B712C1FD7261Bc074105E9E44676c68F"],
    });
    pageKey = data.pageKey;
    array.push.apply(array,data.transfers)
    for (let i = 0; i < data.transfers.length; i++) {
      await client.query(
        queryenum.INSERT_WALLETS,
        [data.transfers[i].from],
        (error: any) => {
          if (error) {
            throw error;
            console.log(error);
          }
        }
      );
      await client.query(
        queryenum.INSERT_BURN_DATA,
        [data.transfers[i].hash,data.transfers[i].from,data.transfers[i].value,new Date(data.transfers[i].metadata.blockTimestamp)],
        (error: any) => {
          if (error) {
            throw error;
            console.log(error);
          }
        }
      );
    }
  } while (pageKey != undefined);
}

export default { synchDatabase,getRanking,getWalletRank,getBurned };

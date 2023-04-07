import { Network, Alchemy, Nft, AssetTransfersCategory } from "alchemy-sdk";
import * as dotenv from "dotenv";
import express from "express";
import axios, { AxiosResponse, HttpStatusCode } from "axios";
import queryenum from "../enum/querry";
import { id } from "ethers";
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

let nftContract: String | undefined
async function getNftOwnerList(){
  
 nftContract = process.env.NFT_CONTRACT
  let res = await (await alchemy.nft.getOwnersForContract(String(process.env.NFT_CONTRACT))).owners
  return res
}

async function getRanking(dateForm:any,dateto:any){
  let res = await client.query(queryenum.GET_HATCH_RANKING,[dateForm, dateto])
  return res.rows
}


async function getWalletRank(dateForm:any,dateto:any,wallet:any){
  let res = await client.query(queryenum.GET_HATCH_WALLET_RANKING,[dateForm, dateto,wallet])
  return res.rows
}

async function getHatched(dateForm:any,dateto:any,wallet:any){
  let res = await client.query(queryenum.GET_HATCHED,[wallet,dateForm, dateto])
  return res.rows
}


async function getHatchedEggsId(){
  let res = await client.query("select id from nftdata")
  return res.rows
}
async function synchDatabase() {
  let arr: any[]= []
  let pageKey = undefined;
  let data;
  const address = [String(process.env.NFT_CONTRACT)];
  do {
    data = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      contractAddresses: address,
      fromAddress:"0x0000000000000000000000000000000000000000",
      category: [AssetTransfersCategory.ERC721],
      excludeZeroValue: true,
      pageKey:pageKey,
      withMetadata:true
    });
    pageKey = data.pageKey;
    arr.push.apply(arr,data.transfers)
  } while (pageKey != undefined);
  let idArray = await getHatchedEggsId()
  let newidArray = idArray
  .map((obj: { id: any; }) => obj.id)
  .filter((value: undefined) => {
    return value !== undefined;
  });
  arr = arr.filter(ob=>!newidArray.includes(Number(ob.tokenId)))
  for (let i = 0; i < arr.length; i++) {
    await client.query(
      queryenum.INSERT_EGG_HATCHERS,
      [Number(arr[i].tokenId),arr[i].to,new Date(arr[i].metadata.blockTimestamp)],
      (error: any, response:any) => {
        if (error) {
          throw error;
          console.log(error);
        }
      }
    );
  }
}

export default { synchDatabase,getRanking,getWalletRank,getHatched,getNftOwnerList};

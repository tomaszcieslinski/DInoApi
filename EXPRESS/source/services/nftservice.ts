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
  console.log(arr.length)
  for (let i = 0; i < arr.length; i++) {
    await client.query(
      queryenum.INSERT_EGG_HATCHERS,
      [Number(arr[i].tokenId),arr[i].to,new Date(arr[i].metadata.blockTimestamp),arr[i].hash],
      (error: any, response:any) => {
        if (error) {
          throw error;
          console.log(error);
        }
      }
    );
  }
}





async function synchTraitDatabase(){
const axios = require('axios');
const response = await axios.get('https://api.traitsniper.com/v1/collections/0xa6d94743723e8ac0d28e2f89e465ce7399db640c/traits', {
  params: {
    'include_prices': 'true'
  },
  headers: {
    'accept': 'application/json',
    'x-ts-api-key': '656325fd-6b80-40dc-8bbb-761d2397d172'
  }
});
let data = response.data.traits
for(let i = 0 ; i<data.length;i++){
  await client.query(
    queryenum.INSERT_TRAIT_DATA,
    [data[i].trait_id,data[i].name,data[i].value,data[i].floor_price,data[i].score],
    (error: any, response:any) => {
      if (error) {
        throw error;
        console.log(error);
      }
    }
  );
}
}


let page = 1;
let totalpage;
async function synchNFTDataBase(){
  console.log("syncstart")
  let data: any[]= []
do{
  const response = await axios.get('https://api.traitsniper.com/v1/collections/0xa6d94743723e8ac0d28e2f89e465ce7399db640c/nfts', {
    params: {
      'page': page,
      'limit': '200'
    },
    headers: {
      'accept': 'application/json',
      'x-ts-api-key': '656325fd-6b80-40dc-8bbb-761d2397d172'
    }
  });
  data.push.apply(data,response.data.nfts)
  totalpage = response.data.total_page
  console.log(totalpage)
  console.log(page)
  page++
  console.log(page)
  console.log(data.length)
  await new Promise(resolve => setTimeout(resolve, 13000));
}
while(page <= totalpage)
  for(let i = 0;i<data.length;i++){
    await client.query(
      queryenum.INSERT_WALLETS,
      [data[i].owner],
      (error: any, response:any) => {
        if (error) {
          throw error;
          console.log(error);
        }
      }
    );
    await client.query(
      queryenum.INSERT_NFT_OWNERS,
      [data[i].id,data[i].owner],
      (error: any, response:any) => {
        if (error) {
          throw error;
          console.log(error);
        }
      }
    );
    await client.query(
      queryenum.UPDATE_NFT_DATA,
      [data[i].id,data[i].name,data[i].image,data[i].rarity_score,data[i].token_id],
      (error: any, response:any) => {
        if (error) {
          throw error;
          console.log(error);
        }
      }
    );
    for(let j =0;j<data[i].traits.length;j++){
      await client.query(
        queryenum.INSERT_TRAIT_DATA,
        [data[i].traits[j].trait_id,data[i].traits[j].name,data[i].traits[j].value,0,data[i].traits[j].score],
        (error: any, response:any) => {
          if (error) {
            throw error;
            console.log(error);
          }
        }
      );
      await client.query(
        queryenum.INESRT_NFT_TRAITS,
        [data[i].traits[j].trait_id,data[i].id],
        (error: any, response:any) => {
          if (error) {
            throw error;
            console.log(error);
          }
        }
      );
    }
    
  }

}
export default { synchDatabase,getRanking,getWalletRank,getHatched,getNftOwnerList,synchTraitDatabase,synchNFTDataBase};

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
const secret="dino"
const { Client } = require("pg");
const client = new Client();
client.connect((err: { stack: any }) => {
  if (err) {
    console.error("connection error", err.stack);
  } else {
    console.log("connected");
  }
});
var md5 = require('md5');
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
      queryenum.INSERT_WALLETS,
      [arr[i].to],
      (error: any, response:any) => {
        if (error) {
          throw error;
          console.log(error);
        }
      }
    );

    await client.query(
      queryenum.INSERT_NFT_OWNERS,
      [md5(Number(arr[i].tokenId)+secret),arr[i].to],
      (error: any, response:any) => {
        if (error) {
          throw error;
          console.log(error);
        }
      }
    );

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

let page = 1;
let totalpage;
async function synchNFTDataBase(){
  console.log("syncstart")
  let data: any[]= []

  const contractAddress = String(process.env.NFT_CONTRACT);
  const nftsIterable = alchemy.nft.getNftsForContractIterator(contractAddress);  
    for await (const nft of nftsIterable) {
        data.push(nft);
    }
let idArray = await getHatchedEggsId()
let newidArray = idArray
.map((obj: { id: any; }) => obj.id)
.filter((value: undefined) => {
  return value !== undefined;
});
data = data.filter(ob=>newidArray.includes(Number(ob.tokenId)))
  for(let i = 0;i<data.length;i++){
    if(data[i].media[0]!=undefined){
      if(data[i].contract.openSea!=undefined){
        await client.query(
          queryenum.UPDATE_NFT_DATA,
          [md5(Number(data[i].tokenId)+secret),data[i].contract.name+data[i].title,data[i].media[0].raw,0,data[i].tokenId],
          (error: any, response:any) => {
            if (error) {
              throw error;
              console.log(error);
            }
          }
        );
      }else{
        await client.query(
          queryenum.UPDATE_NFT_DATA,
          [md5(Number(data[i].tokenId)+secret),data[i].contract.name+data[i].title,data[i].media[0].raw,0,data[i].tokenId],
          (error: any, response:any) => {
            if (error) {
              throw error;
              console.log(error);
            }
          }
        );
      }
    }
    
    if(data[i].rawMetadata.attributes!=undefined){
          let attributes = data[i].rawMetadata.attributes
          for(let j =0;j<attributes.length;j++){
            await client.query(
              queryenum.INSERT_TRAIT_DATA,
              [md5(attributes[j].value+attributes[j].trait_type+secret),attributes[j].trait_type,attributes[j].value,0,0],
              (error: any, response:any) => {
                if (error) {
                  throw error;
                  console.log(error);
                }
              }
           );
            await client.query(
              queryenum.INESRT_NFT_TRAITS,
              [md5(attributes[j].value+attributes[j].trait_type+secret),md5(Number(data[i].tokenId)+secret)],
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
}

async function getTraits(){
  let res = await client.query(queryenum.SELECT_TRAITS)
  return res.rows
} 

async function getTraitsByAttribute(name:any){
  let res = await client.query(queryenum.SELECT_TRAITS_BY_ATTRIBUTE,[name])
  return res.rows
}

async function updateTraitsData(){
  const response = await (await alchemy.nft.summarizeNftAttributes(String(process.env.NFT_CONTRACT))).summary
  let arr = []
  let data: any[]= []
  for(const [key,value1] of Object.entries(response)){
    for(const [key2,value2] of Object.entries(value1)){
      console.log(md5(key2.toString()+key.toString()+secret), 1/value2*10000)
      let id = md5(key2.toString()+key.toString()+secret)
      let val =  1/value2*10000
      await client.query(
        queryenum.UPDATE_TRAITS_DATA,
        [id,val.toFixed(2)],
        (error: any, response:any) => {
          if (error) {
            throw error;
            console.log(error);
          }
        }
     );
    }
  }

  const res = await axios.get(`https://api.reservoir.tools/collections/${String(process.env.NFT_CONTRACT)}/attributes/all/v4`, {
  headers: {
    'accept': '*/*',
    'x-api-key': '300e8508-f946-538e-8d4f-29dc8ddcd697'
  }
});

let attr = res.data.attributes
  for(let i =0 ;i<attr.length;i++){
    for(let j =0;j<attr[i].values.length;j++){
      if(attr[i].values[j].floorAskPrice!=undefined){
        await client.query(
          queryenum.UPDATE_TRAITS_PRICE_DATA,
          [md5(attr[i].values[j].value+attr[i].key+secret),attr[i].values[j].floorAskPrice.amount.decimal,attr[i].values[j].count],
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
}




async function returnFiltered(body:any) {
  console.log(body)
  let letQuerryBody = `SELECT distinct n.id ,n.nftid,convert_from( cast(n.imgurl as bytea),'UTF8'),n.rarity 
  FROM nfttraits t1
  join nftdata n ON n.nftid = t1.nftid 
  join traits tr on t1.traitid = tr.traitid`
  let marker = 2;
  if(body.data!=undefined){
    if(Object.keys(body.data).length >=1){
      let arr = Object.values(body.data) as any
    for(let i =0; i< arr.length;i++){
      letQuerryBody += ` JOIN nfttraits t${marker} ON t${marker-1}.nftid = t${marker}.nftid`
      marker++
    }
    letQuerryBody += " where "
    marker=2;
    for (let i = 0; i < arr.length; i++) {
      letQuerryBody += "(";
      arr[i].forEach((element: any, index: number) => {
        letQuerryBody += `t${marker - 1}.traitid = '${element}'`;
        if (index < arr[i].length - 1) {
          letQuerryBody += " or ";
        }
      });
      letQuerryBody += ")";
      if (i < arr.length - 1) {
        letQuerryBody += " and ";
      }
      marker++;
    }
    }
  }
  let res = await client.query(letQuerryBody)
  return res.rows
}



async function returnFilteredo(body:any) {
  console.log(body)
  let letQuerryBody = `SELECT distinct n.id ,n.nftid,n.imgurl
  FROM nfttraits t1
  join nftdata n ON n.nftid = t1.nftid 
  join traits tr on t1.traitid = tr.traitid`
  let marker = 2;
  if(body.data!=undefined){
    if(Object.keys(body.data).length >=1){
      let arr = Object.values(body.data) as any
    for(let i =0; i< arr.length;i++){
      letQuerryBody += ` JOIN nfttraits t${marker} ON t${marker-1}.nftid = t${marker}.nftid`
      marker++
    }
    letQuerryBody += " where "
    marker=2;
    for (let i = 0; i < arr.length; i++) {
      letQuerryBody += "(";
      arr[i].forEach((element: any, index: number) => {
        letQuerryBody += `t${marker - 1}.traitid = '${element}'`;
        if (index < arr[i].length - 1) {
          letQuerryBody += " or ";
        }
      });
      letQuerryBody += ")";
      if (i < arr.length - 1) {
        letQuerryBody += " and ";
      }
      marker++;
    }
    }
  }
  let res = await client.query(letQuerryBody)
  return res.rows
}
// WHERE t1.traitid = '9798087'
//       AND (t2.traitid = '9797943' OR t2.traitid = '9797924') and (t3.traitid ='9797961')

// {
//   name: 'Dino LFG Collection #401',
//   description: 'Pirate Class',
//   image: 'ipfs://DinoLFG/401.png',
//   dna: '79c2331a9638e4610f7772a74d2bf55bf6ce0167',
//   edition: 401,
//   date: 1682181760589,
//   attributes: [
//     { trait_type: 'Background', value: 'Rare' },
//     { trait_type: 'Weapon', value: 'Silex' },
//     { trait_type: 'Class', value: 'Pirate' },
//     { trait_type: 'Mouth', value: 'Branch' },
//     { trait_type: 'Body', value: 'Pirate' },
//     { trait_type: 'Pet', value: 'None' },
//     { trait_type: 'Hat', value: 'Beanie' },
//     { trait_type: 'Eyes', value: 'Blindfold' },
//     { trait_type: 'First Edition', value: 'First' }
//   ],
//   compiler: 'HashLips Art Engine'
// }

const fs = require('fs');
const path = require('path')
async function saveUnmintedDatabase(){

const jsonsInDir = fs.readdirSync('./source/jsons/dino').filter((file: any) => path.extname(file) === '.json');
let counter = 0
jsonsInDir.forEach(async (file: any) => {
  let id = file.split('.')[0]
  const fileData = fs.readFileSync(path.join('./source/jsons/dino', file));
  const json = JSON.parse(fileData.toString());
  await client.query(
    queryenum.INSERT_OEGG_HATCHERS,
    [id,md5(id+secret),json.name,json.image,false],
    (error: any, response:any) => {
      if (error) {
        throw error;
        console.log(error);
      }
    }
  );
  counter++
  // for(let j =0;j<json.attributes.length;j++){
  //   await client.query(
  //     queryenum.INSERT_oTRAIT_DATA,
  //     [md5(json.attributes[j].value+json.attributes[j].trait_type+secret),json.attributes[j].trait_type,json.attributes[j].value,0,0],
  //     (error: any, response:any) => {
  //       if (error) {
  //         throw error;
  //         console.log(error);
  //       }
  //     }
  //  );
  // //  await client.query(
  // //   queryenum.INESRT_ONFT_TRAITS,
  // //   [md5(json.attributes[j].value+json.attributes[j].trait_type+secret),json.dna],
  // //   (error: any, response:any) => {
  // //     if (error) {
  // //       throw error;
  // //       console.log(error);
  // //     }
  // //   }
  // // );
  // }
});
console.log(counter)
}



export default {returnFiltered,getTraitsByAttribute,saveUnmintedDatabase,
   synchDatabase,getRanking,getWalletRank,getHatched,getNftOwnerList,synchNFTDataBase,getTraits,updateTraitsData};

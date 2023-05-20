import { Request, Response, NextFunction, response } from "express";
import * as dotenv from "dotenv";
dotenv.config();
import { Network, Alchemy, Nft } from "alchemy-sdk";
import nftservice from "../services/nftservice";


const getHatchRanking = async(req: Request, response: Response)=>{
  let dateFrom = req.query.dateFrom;
  let dateTo = req.query.dateTo;
  let res = await nftservice.getRanking(dateFrom,dateTo)
  return response.status(200).json({ res });
}

const getHatchWalletRank = async(req: Request, response: Response)=>{
  let dateFrom = req.query.dateFrom;
  let dateTo = req.query.dateTo;
  let wallet = req.query.walletaddress?.toString().toLowerCase()
  let res = await nftservice.getWalletRank(dateFrom,dateTo,wallet)
  return response.status(200).json({ res });
}

const getHatchByWallet = async(req: Request, response: Response)=>{
  let dateFrom = req.query.dateFrom;
  let dateTo = req.query.dateTo;
  let wallet = req.query.walletaddress?.toString().toLowerCase()
  let res = await nftservice.getHatched(dateFrom,dateTo,wallet)
  return response.status(200).json({ res });
}

const getNftOwners = async(req: Request, response: Response)=>{
  let res = await nftservice.getNftOwnerList()
  return response.status(200).json(res)
}



const getoNftTraits = async (req: Request, response: Response)=>{
  let res = await nftservice.getoTraits()
  return response.status(200).json(res)
}
const getoNftTraitsByAttr = async (req: Request, response: Response)=>{
  let attr = req.query.attrName
  let res = await nftservice.getoTraitsByAttribute(attr)
  return response.status(200).json(res)
}

let mysteryegg1 = [372 , 6187 , 7609 , 8992 , 272 , 6692 , 7496 , 4834 , 2041 , 2397 , 4180 , 4131 , 9316 
  , 4597 , 1286 , 3555 , 4708 , 5743 , 9201 , 2620 , 5084 , 1196 , 1909 
  , 7733 , 1537 , 2102 , 5727 , 4523 , 8719 , 8532 , 8233 , 1550 , 3522 
  , 2238 , 6063 , 1847 , 8540 , 8326 , 6204 , 7507 , 7448 , 2555 , 6033 
  , 4660 , 2819 , 9345 , 3674 , 7755 , 2888 , 8814 , 6069 , 6589 , 5017 
  , 7311 , 770 , 3005 , 6206 , 3193 , 9948 , 244 , 104 , 3787 , 2527 , 4568 
  , 571 , 4105 , 5159 , 8466 , 2412 , 7549 , 9940 , 2117 , 3644 , 7328 , 6219
   , 264 , 6841 , 8246 , 522 , 4315 , 7591 , 4833 , 3991 , 5943 , 9895 , 7320 , 4681 
   , 7058 , 781 , 6149 , 7978 , 1036 , 4357 , 7552 , 8307 , 2811 , 9135 , 1938 , 9740 , 8519]

let hoodie = [6164 , 3319 , 6433 , 5669 , 2268 , 7862 , 14 , 2466 , 5294 , 3436 , 6246 , 3147 , 2573 
  , 6578 , 7540 , 4371 , 1580 , 113 , 2899 , 3779 , 2647 , 8357 , 6508 , 2472 , 802 , 1929 , 7217 , 591 , 9920 , 7425]

let nft = [1280 , 295 , 6423 , 5586 , 9581 , 7162 , 1175 , 5692 , 3151 , 6792 , 2597 
  , 1588 , 4319 , 9661 , 6759 , 7977 , 5417 , 2782 , 3896 , 171]

let k50 = [3712 , 7410 , 335 , 138 , 1018 , 8697 , 6013 , 5361 , 4534 , 1061]

let ps5 = [6132 , 8226 , 3011]

let iphone =[6467 , 2935]

let doge =[528]

let k500 = [3152]

const postoNftFilter = async(req: Request,response:Response)=>{
  let data = req.body;
  let res =  await nftservice.returnFilteredo(data)
  for(let i =0;i<res.length;i++){
    if(mysteryegg1.includes(Number(res[i].id))){
      res[i].bonus = "1x Dino Mystery Egg"
    }
    else if(hoodie.includes(Number(res[i].id))){
      res[i].bonus = "1x DinoLFG Hoodie"
    }
    else if(nft.includes(Number(res[i].id))){
      res[i].bonus = "1x DINOsaur NFT "
    }
    else if(k50.includes(Number(res[i].id))){
      res[i].bonus = "50,000 $DINO + 10 Dino Mystery Eggs + 1x DinoLFG Hoodie"
    }
    else if(ps5.includes(Number(res[i].id))){
      res[i].bonus = "1x PS5 or 1x Nintendo Switch"
    }
    else if(iphone.includes(Number(res[i].id))){
      res[i].bonus = "1x iPhone 14 "
    }
    else if(doge.includes(Number(res[i].id))){
      res[i].bonus = "1x Signed Dogecoin by Dogecoin creator Billy Markus "
    }
    else if(k500.includes(Number(res[i].id))){
      res[i].bonus = "500,000 $DINO + 100 Dino Mystery Eggs + 1x DinoLFG Hoodie"
    }
    else{
      res[i].bonus = "none"
    }
  }
  const filteredArray = res.filter((obj: { isminted: boolean; }) => !obj.isminted === true);
  return response.status(200).json(filteredArray.sort(() => Math.random() - 0.5))
}

const getNftTraits = async (req: Request, response: Response)=>{
  let res = await nftservice.getTraits()
  return response.status(200).json(res)
}
const getNftTraitsByAttr = async (req: Request, response: Response)=>{
  let attr = req.query.attrName
  let res = await nftservice.getTraitsByAttribute(attr)
  return response.status(200).json(res)
}

const postNftFilter = async(req: Request,response:Response)=>{
  let data = req.body;
  let res =  await nftservice.returnFiltered(data)
  for(let i =0;i<res.length;i++){
    if(mysteryegg1.includes(Number(res[i].id))){
      res[i].bonus = "1x Dino Mystery Egg"
    }
    else if(hoodie.includes(Number(res[i].id))){
      res[i].bonus = "1x DinoLFG Hoodie"
    }
    else if(nft.includes(Number(res[i].id))){
      res[i].bonus = "1x DINOsaur NFT "
    }
    else if(k50.includes(Number(res[i].id))){
      res[i].bonus = "50,000 $DINO + 10 Dino Mystery Eggs + 1x DinoLFG Hoodie"
    }
    else if(ps5.includes(Number(res[i].id))){
      res[i].bonus = "1x PS5 or 1x Nintendo Switch"
    }
    else if(iphone.includes(Number(res[i].id))){
      res[i].bonus = "1x iPhone 14 "
    }
    else if(doge.includes(Number(res[i].id))){
      res[i].bonus = "1x Signed Dogecoin by Dogecoin creator Billy Markus "
    }
    else if(k500.includes(Number(res[i].id))){
      res[i].bonus = "500,000 $DINO + 100 Dino Mystery Eggs + 1x DinoLFG Hoodie"
    }
    else{
      res[i].bonus = "none"
    }
  }
  
  return response.status(200).json(res.sort(() => Math.random() - 0.5))
}

const postwNftFilter = async(req: Request,response:Response)=>{
  let data = req.body;
  let res =  await nftservice.returnFiltered(data)
  for(let i =0;i<res.length;i++){
    if(mysteryegg1.includes(Number(res[i].id))){
      res[i].bonus = "1x Dino Mystery Egg"
    }
    else if(hoodie.includes(Number(res[i].id))){
      res[i].bonus = "1x DinoLFG Hoodie"
    }
    else if(nft.includes(Number(res[i].id))){
      res[i].bonus = "1x DINOsaur NFT "
    }
    else if(k50.includes(Number(res[i].id))){
      res[i].bonus = "50,000 $DINO + 10 Dino Mystery Eggs + 1x DinoLFG Hoodie"
    }
    else if(ps5.includes(Number(res[i].id))){
      res[i].bonus = "1x PS5 or 1x Nintendo Switch"
    }
    else if(iphone.includes(Number(res[i].id))){
      res[i].bonus = "1x iPhone 14 "
    }
    else if(doge.includes(Number(res[i].id))){
      res[i].bonus = "1x Signed Dogecoin by Dogecoin creator Billy Markus "
    }
    else if(k500.includes(Number(res[i].id))){
      res[i].bonus = "500,000 $DINO + 100 Dino Mystery Eggs + 1x DinoLFG Hoodie"
    }
    else{
      res[i].bonus = "none"
    }
  }
  const filteredArray = res.filter((obj: {
    bonus: any;  }) => obj.bonus !="none");
  return response.status(200).json(filteredArray.sort(() => Math.random() - 0.5))
}

const getwNftTraits = async (req: Request, response: Response)=>{
  let res = await nftservice.getwTraits()
  return response.status(200).json(res)
}


export default {getNftTraitsByAttr,getoNftTraits,getoNftTraitsByAttr,postoNftFilter,postwNftFilter,getwNftTraits,
   getHatchRanking, getHatchWalletRank,getHatchByWallet,getNftOwners,getNftTraits,postNftFilter};
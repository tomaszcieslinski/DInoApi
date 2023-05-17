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

const postoNftFilter = async(req: Request,response:Response)=>{
  let data = req.body;
  let res =  await nftservice.returnFilteredo(data)
  return response.status(200).json(res)
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
  return response.status(200).json(res)
}


export default {getNftTraitsByAttr,getoNftTraits,getoNftTraitsByAttr,postoNftFilter,
   getHatchRanking, getHatchWalletRank,getHatchByWallet,getNftOwners,getNftTraits,postNftFilter};
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

const getNftTraits = async (req: Request, response: Response)=>{
  let res = await nftservice.getTraits()
  return response.status(200).json(res)
}

const postNftFilter = async(req: Request,response:Response)=>{
  let data = req.body;
  let res =  await nftservice.returnFiltered(data)
  return response.status(200).json(res)
}


export default { getHatchRanking, getHatchWalletRank,getHatchByWallet,getNftOwners,getNftTraits,postNftFilter};
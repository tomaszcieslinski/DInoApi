/** source/controllers/posts.ts */
import { Request, Response, NextFunction, response } from "express";
import burnservice from "../services/burnservice";

const getBurnRanking = async(req: Request, response: Response)=>{
    let dateFrom = req.query.dateFrom;
    let dateTo = req.query.dateTo;
    let res = await burnservice.getRanking(dateFrom,dateTo)
    return response.status(200).json({ res });
}

const getBurnWalletRank = async(req: Request, response: Response)=>{
    let dateFrom = req.query.dateFrom;
    let dateTo = req.query.dateTo;
    let wallet = req.query.walletaddress?.toString().toLowerCase()
    let res = await burnservice.getWalletRank(dateFrom,dateTo,wallet)
    return response.status(200).json({ res });
}

const getBurnedByWallet = async(req: Request, response: Response)=>{
    let dateFrom = req.query.dateFrom;
    let dateTo = req.query.dateTo;
    let wallet = req.query.walletaddress?.toString().toLowerCase()
    let res = await burnservice.getBurned(dateFrom,dateTo,wallet)
    return response.status(200).json({ res });
}

export default {getBurnRanking,getBurnWalletRank,getBurnedByWallet}
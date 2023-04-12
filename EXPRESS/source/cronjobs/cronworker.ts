import burnservice from "../services/burnservice"
import stakingservice from "../services/stakingservice"
import nftservice from "../services/nftservice"
var cron = require('node-cron');
let currentDate = new Date(Date.now()).toString()
function worker(){ 
    cron.schedule('30 * * * *', () => {
        console.log("Executing hatch table synchronization", currentDate)
        nftservice.synchDatabase()
        console.log("Executing burn table synchronization", currentDate)
        burnservice.synchDatabase()
        console.log("Executing staking table synchronization", currentDate)
        stakingservice.synchDatabase()
    });
}

function nftworker(){ 
    cron.schedule('0 * * * *', () => {
        console.log("Executing NFT tables synchronization", currentDate)
        nftservice.synchNFTDataBase()
    });
}

function traitsworker(){
cron.schedule('15 * * * *', () => {
    console.log("Executing traits table synchronization", currentDate)
    nftservice.updateTraitsData()
});

}
export default {worker,nftworker,traitsworker}
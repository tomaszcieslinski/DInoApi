import burnservice from "../services/burnservice"
import stakingservice from "../services/stakingservice"

var cron = require('node-cron');
let currentDate = new Date(Date.now()).toString()
function worker(){ 
    cron.schedule('*/5 * * * *', () => {
        console.log("Executing burn table synchronization", currentDate)
        burnservice.synchDatabase()
        console.log("Executing staking table synchronization", currentDate)
        stakingservice.synchDatabase()
    });
}
export default {worker}
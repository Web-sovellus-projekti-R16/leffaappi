import cron from 'node-cron'
import { permanentlyDeleteExpiredAccounts } from '../models/account_model.js'

// cron.schedule("30 2 * * *", async () => {
//     console.log("CRON: Cleaning up expired accounts...")
//     try {
//         const result = await permanentlyDeleteExpiredAccounts()
//         console.log(`CRON: ${result.rowCount} expired accvounts permanently deleted`)

//     } catch (err) {
//         console.error('CRON ERROR deleting expired accounts:', err)
//     }
// }) 

cron.schedule("* * * * *", async () => {
    console.log("CRON: Cleaning up expired accounts...")
    try {
        const result = await permanentlyDeleteExpiredAccounts()
        console.log(`CRON: ${result.rowCount} expired accvounts permanently deleted`)

    } catch (err) {
        console.error('CRON ERROR deleting expired accounts:', err)
    }
}) 
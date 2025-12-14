import cron from 'node-cron'
import { getExpiredAccountsImages, permanentlyDeleteExpiredAccounts } from '../models/account_model.js'
import { deleteFromR2 } from '../helpers/r2Service.js'

cron.schedule("30 2 * * *", async () => {
    console.log("CRON: Cleaning up expired accounts...")
    try {
        const { rows: accounts } = await getExpiredAccountsImages()

        for (const account of accounts) {
            if (account.profile_image_key) {
                try {
                    await deleteFromR2(account.profile_image_key)
                } catch (err) {
                    console.error(`CRON: Failed to delete image ${account.profile_image_key}`, err)
                }
            }
        }
        const result = await permanentlyDeleteExpiredAccounts()
        console.log(`CRON: ${result.rowCount} expired accvounts permanently deleted`)

    } catch (err) {
        console.error('CRON ERROR deleting expired accounts:', err)
    }
}) 
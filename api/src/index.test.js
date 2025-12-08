import { expect } from "chai"
import { getToken, initializeTestDb } from "./helpers/test.js"

describe("Testing API functionality", () => {
    let token = null
    const testUser = { email: "user@test.com", password: "Secret123" }

    before(()=> {
        initializeTestDb()
        token = getToken(testUser)
    })

    it("should succeed login", async () => {
        const response = await fetch("http://localhost:3001/account/login")
        const data = await response.json()
        expect(response.status).to.equal(200)
    })
})
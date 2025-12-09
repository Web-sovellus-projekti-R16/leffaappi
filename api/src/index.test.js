import { expect } from "chai"
import { initializeTestDb, insertTestUser } from "./helpers/test.js"

describe("API Functional Tests", () => {
    const testUser = { email: "user@test.com", password: "Secret123" };
    let createdUserId = null;

    before(async () => {
        await initializeTestDb();
        createdUserId = await insertTestUser(testUser);
    });

    it("should login successfully and return token", async () => {
        const response = await fetch("http://localhost:3001/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUser),
        });

        expect(response.status).to.equal(200);

        const body = await response.json();

        expect(body).to.have.property("token");
        expect(body.token).to.be.a("string");
    });

    it("should access protected route using Bearer token", async () => {
        const loginRes = await fetch("http://localhost:3001/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUser),
        });

        const { token } = await loginRes.json();

        const protectedRes = await fetch("http://localhost:3001/account/profile", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        expect(protectedRes.status).to.equal(200);

        const data = await protectedRes.json();
        expect(data.user).to.have.property("email", testUser.email);
    });
});
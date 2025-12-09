import { expect } from "chai"
import { initializeTestDb, insertTestUser } from "./helpers/test.js"

describe("API Functional Tests", () => {
    const testUser = { email: "user@test.com", password: "Secret123" };

    before(async () => {
        await initializeTestDb();
        await insertTestUser(testUser)
    });

    it("should register a user successfully", async () => {
        const registerUser = { email: "user4@test.com", password: "Secret123" };
        const response = await fetch("http://localhost:3001/account/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registerUser)
        });

        expect(response.status).to.equal(201);

        const body = await response.json()
        expect(body.message).to.equal("Account created successfully")
    })

    it ("should not register user if email is missing", async () => {
        const invalidUser = { password: "Secret123" }
        const response = await fetch("http://localhost:3001/account/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invalidUser)
        })

        expect(response.status).to.equal(400)

        const body = await response.json()
        expect(body.error).to.equal("Email and password is required")
    })

    it ("should not register user if password is missing", async () => {
        const invalidUser = { email: "nopass@test.com" }
        const response = await fetch("http://localhost:3001/account/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invalidUser)
        })

        expect(response.status).to.equal(400)

        const body = await response.json()
        expect(body.error).to.equal("Email and password is required")
    })

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

    it("should not login with invalid credentials", async () => {
        const invalidUser = { email: "user@test.com", password: "pass123" }
        const response = await fetch("http://localhost:3001/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invalidUser)
        });

        expect(response.status).to.equal(401);
    })

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
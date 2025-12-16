import { expect } from "chai"
import { initializeTestDb, insertTestUser } from "./helpers/test.js"
import { app } from "./index.js"

let server

describe("API Functional Tests", () => {
    const testUser = { email: "user@test.com", password: "Secret123" };

    before(async () => {
        server = app.listen(3001)
        await initializeTestDb();
        await insertTestUser(testUser)
    })
    
    after(async () => {
        await server.close()
    })

    it("should register a user successfully", async () => {
        const registerUser = { email: "use14@test.com", password: "Secret123" };
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
    it("should logout", async () => {
        const loginRes = await fetch("http://localhost:3001/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUser),
        });

        const cookies = loginRes.headers.get("set-cookie");

        const logoutRes = await fetch("http://localhost:3001/account/logout", {
            method: "GET",
            headers: {
                Cookie: cookies
            }
        });

        expect(logoutRes.status).to.equal(200);

        const body = await logoutRes.json();
        expect(body.message).to.equal("Logout succesful");
    });

    it("should delete account when confirmation is done", async () => {
        const loginRes = await fetch("http://localhost:3001/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUser),
        });

        const { token } = await loginRes.json();

        const deleteRes = await fetch("http://localhost:3001/account/delete", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ confirmation: "delete-my-account" }) //////////////////////////////////////////
        });

        expect(deleteRes.status).to.equal(200);

        const body = await deleteRes.json();
        expect(body.message).to.include("flagged as deleted");
    });

    it("should not delete account if confirmation is wrong", async () => { ////////////////////////////////////////////
        const loginRes = await fetch("http://localhost:3001/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUser),
        });

        const { token } = await loginRes.json();

        const deleteRes = await fetch("http://localhost:3001/account/delete", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ confirmation: "hahahahahahahahahahahahahahahah" }) /////////////
        });

        expect(deleteRes.status).to.equal(400);
    });



    it("should get reviews for a movie", async () => {
        const response = await fetch("http://localhost:3001/reviews/movie/tmdb/550");
        expect(response.status).to.equal(200);

        const body = await response.json();
        expect(body).to.be.an("array");
    });

    it("should return empty array if movie has no reviews", async () => {
        const response = await fetch("http://localhost:3001/reviews/movie/tmdb/999999");
        expect(response.status).to.equal(200);

        const body = await response.json();
        expect(body).to.be.an("array");
    });
});





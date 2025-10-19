import request from "supertest"
import app from "../app"

import { connectDatabase, disconnectDatabase } from "./setup"
import { userData } from "./auth.test"

// export const userData = {
//     firstname: "Test",
//     lastname: "User",
//     email: "test@example.com",
//     password: "1234"
// }
describe("", () => {
    let userId;
    let token;


    beforeAll(async () => {
        await connectDatabase()
        await request(app).post("/api/auth/register").send(userData)
    
        const loginRes = await request(app).post("/api/auth/login").send({
            email: userData.email,
            password: userData.password
        })
        userId = loginRes.body.id;
        token = loginRes.body.token
    })
    afterAll(async () => {
        await disconnectDatabase()
    })


    test("", async () => {})
    
})
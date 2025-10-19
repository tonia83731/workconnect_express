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
describe("POST /api/user/:userId/workspace", () => {
    let userId: string;
    let token: string;
    beforeAll(async () => {
        await connectDatabase()
        await request(app).post("/api/auth/register").send(userData)
    
        const loginRes = await request(app).post("/api/auth/login").send({
            email: userData.email,
            password: userData.password
        })

        userId = loginRes.body.data.id;
        token = loginRes.body.data.token
    })
    afterAll(async () => {
        await disconnectDatabase()
    })


    test("Should create a new workspace successfully", async () => {
        const res = await request(app).post(`/api/user/${userId}/workspace`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Test workspace",
            account: "test-account"
        })

        expect(res.status).toBe(201)
        expect(res.body.OK).toBe(true)
    })
    test("Should not allow duplicate account", async () => {
        await request(app).post(`/api/user/${userId}/workspace`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Test workspace",
            account: "test-account"
        })

        const res = await request(app).post(`/api/user/${userId}/workspace`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Test workspace 2",
            account: "test-account"
        })

        expect(res.status).toBe(400)
        expect(res.body.OK).toBe(false)
    })
    
})
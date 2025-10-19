import request from "supertest"
import app from "../app"

import { connectDatabase, disconnectDatabase } from "./setup"
import userModel from "../models/userModel"

const userData = {
    firstname: "Test",
    lastname: "User",
    email: "test@example.com",
    password: "1234"
}

describe("POST /api/auth/register", () => {
    beforeAll(async () => {
        await connectDatabase()
    })
    afterAll(async () => {
        await disconnectDatabase()
    })

    test("Should create a new user and return 201 when all fields are valid", async () => {
        const res = await request(app).post("/api/auth/register").send(userData)
        
        expect(res.status).toBe(201)
    })
    test("Should return 400 if email already exists", async () => {})
    test("Should return 400 if required fields are missing", async () => {})
})



describe("POST /api/auth/login", () => {
    beforeAll(async () => {
        await connectDatabase()
        await userModel.create(userData)
    })
    afterAll(async () => {
        await disconnectDatabase()
    })
    test("Should return 200 and a JWT token when email and password are correct", async () => {});
    test("Should return 400 if email or password is empty", async () => {});
    test("Should return 400 if email or password incorrect", async () => {});
})
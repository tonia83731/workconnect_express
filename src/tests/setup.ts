import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';


let mongoServer: MongoMemoryServer;

export const connectDatabase = async () => {
    mongoServer = await MongoMemoryServer.create();

    const uri = mongoServer.getUri();
    await mongoose.connect(uri)
}

export const disconnectDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop()
}
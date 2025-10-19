import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import express, { type Request, type Response } from "express";
// import mongoose from "mongoose";
import router from "./routes/index.js";
import passport from "./config/passport.js";

const app = express();
// const port = 8080;

// const MONGODB_URL = process.env.MONGODB_URL as string;
// mongoose
//   .connect(MONGODB_URL)
//   .then(() => {
//     console.log("mongodb connected!");
//     // scheduleWeeklyTodoReport();
//     // scheduleVoteDueNotifications();
//     // scheduleVoteResultNotifications();
//   })
//   .catch((err) => console.error("mongodb error!", err.message));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use("/api", router);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello! Express with Typescript.");
});

export default app

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

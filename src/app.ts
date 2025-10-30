import express, { type Request, type Response } from "express";
import router from "./routes/index";
import passport from "./config/passport";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use("/api", router);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello! Express with Typescript.");
});

export default app;

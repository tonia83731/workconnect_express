import mongoose from "mongoose";

import app from "./app";

const port = 8080
const MONGODB_URL = process.env.MONGODB_URL as string;

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("mongodb connected!");
    // scheduleWeeklyTodoReport();
    // scheduleVoteDueNotifications();
    // scheduleVoteResultNotifications();

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });

  })
  .catch((err) => console.error("mongodb error!", err.message));
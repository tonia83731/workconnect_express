import express from "express";
const router = express.Router({ mergeParams: true });

import voteController from "../../controllers/voteController.js";

router.delete("/:voteId", voteController.deleteVoteById);

export default router;

import express from "express";
const router = express.Router({ mergeParams: true });

import voteController from "../../controllers/voteController.js";

router.get("/:voteId", voteController.getVoteById);
router.put("/:voteId", voteController.updateVoteById);
router.get("", voteController.getWorkspaceVoteByWorkspaceAccount);
router.post("", voteController.createVote);
export default router;

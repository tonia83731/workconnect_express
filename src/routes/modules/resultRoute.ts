import express from "express";
const router = express.Router({ mergeParams: true });

import voteController from "../../controllers/voteController.js";

router.post("", voteController.submitVoteResult);
router.put("/:resultId", voteController.updateVoteResultById);
router.get("/:voteId", voteController.getResultsForVotebyVoteId);
export default router;

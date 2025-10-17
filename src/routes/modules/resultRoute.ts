import express from "express";
const router = express.Router({ mergeParams: true });

import voteController from "../../controllers/voteController.js";

router.put("/:resultId", voteController.updateVoteResultById);
router.get("/:voteId", voteController.getResultsForVotebyVoteId);
router.post("", voteController.submitVoteResult);
export default router;

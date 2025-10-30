import nodeCron from "node-cron";
import axios from "axios";

import voteModel from "../models/voteModel";
import resultModel from "../models/resultModel";
import type { IWorkspace } from "../type";

export const scheduleVoteDueNotifications = () => {
  nodeCron.schedule("0 * * * *", async () => {
    console.log("Checking votes due...");

    const now = new Date();
    const votes = await voteModel
      .find({ dueDate: { $lte: now } })
      .populate<{ workspaceId: IWorkspace }>("workspaceId");
    for (const vote of votes) {
      const workspace = vote.workspaceId as IWorkspace;
      if (!workspace.slackUrl) continue;

      const totalMembers = workspace.members.length;

      const voteResults = await resultModel.find({
        voteId: vote._id.toString(),
      });
      const votedMembers = voteResults.map((r) => r.userId.toString());
      const participationRate =
        totalMembers > 0 ? (votedMembers.length / totalMembers) * 100 : 0;
      // Notify Slack if participation < 50% and vote is still before due date
      const threshold = 50;
      const dueDate = vote.dueDate as Date;
      if (participationRate < threshold && now < dueDate) {
        const message = {
          text:
            `⚠️ Early Vote Reminder: "${vote.title}" in workspace: ${workspace.title}\n` +
            `Current participation: ${participationRate.toFixed(1)}% (${
              votedMembers.length
            }/${totalMembers})\n` +
            `Please encourage members to vote before ${dueDate.toLocaleString()}.`,
        };

        await axios.post(workspace.slackUrl, message);
      }
    }
  });
};

export const scheduleVoteResultNotifications = () => {
  // Run every hour at minute 30
  nodeCron.schedule("30 * * * *", async () => {
    console.log("Checking votes to report results...");

    const now = new Date();

    // Find votes whose due date has passed
    const votes = await voteModel
      .find({ dueDate: { $lte: now } })
      .populate<{ workspaceId: IWorkspace }>("workspaceId");

    for (const vote of votes) {
      const workspace = vote.workspaceId;
      if (!workspace.slackUrl) continue;

      // Get all results for this vote
      const voteResults = await resultModel.find({ voteId: vote._id });

      // Count votes per option
      const optionCounts: Record<string, number> = {};
      for (const r of voteResults) {
        optionCounts[r.option] = (optionCounts[r.option] || 0) + 1;
      }

      // Sort options by votes descending and take top 2
      const topOptions = Object.entries(optionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2);

      // Build message
      const messageText = topOptions.length
        ? `Vote Results for "${vote.title}" in workspace: ${workspace.title}\n` +
          topOptions
            .map(
              ([option, count], idx) => `${idx + 1}. ${option} (${count} votes)`
            )
            .join("\n")
        : `Vote Results for "${vote.title}" in workspace: ${workspace.title}\nNo votes were cast.`;

      // Send to Slack
      await axios.post(workspace.slackUrl, { text: messageText });
    }
  });
};

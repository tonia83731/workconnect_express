import nodeCron from "node-cron";
import axios from "axios";

import workspaceModel from "../models/workspaceModel.js";
import todoModel from "../models/todoModel.js";
import type { ITodo } from "../type.js";

const scheduleWeeklyTodoReport = () => {
  nodeCron.schedule("* 16 * * 5", async () => {
    try {
      console.log("Running weekly todo report...");

      const workspaces = await workspaceModel.find({
        slackUrl: {
          $exists: true,
          $ne: "",
        },
      });
      if (!workspaces) {
        console.log(
          "No workspaces with Slack webhook found. Skipping cron job."
        );
        return;
      }

      for (const workspace of workspaces) {
        const pendingMembers = workspace.members.filter((m) => m.isPending);
        const pendingCount = pendingMembers.length;

        const todos = await todoModel.find({
          workspaceId: workspace._id,
          status: { $ne: "completed" },
        });

        const statusCount: Record<ITodo["status"], number> = todos.reduce(
          (acc, todo) => {
            acc[todo.status] = (acc[todo.status] || 0) + 1;
            return acc;
          },
          { pending: 0, processing: 0, completed: 0 }
        );

        const message = {
          text:
            `Weekly Todo Report for Workspace: ${workspace.title}\n\n` +
            `Todos:\n` +
            `- Pending: ${statusCount.pending}\n` +
            `- Processing: ${statusCount.processing}\n\n` +
            `Pending Members: ${pendingCount}`,
        };

        await axios.post(workspace.slackUrl as string, message);
      }
    } catch (error) {
      console.log(error);
    }
  });
};

export default scheduleWeeklyTodoReport;

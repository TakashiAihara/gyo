import { Command } from "commander";
import { getClient, unwrap } from "../http";
import { printTask } from "../utils/format";
import { handleError } from "../utils/errors";
import type { TaskRow } from "@gyo/server/db/schema";

export function createAddCommand(): Command {
  return new Command("add")
    .description("Add a new task")
    .argument("<text...>", "Task description")
    .option("-p, --priority <priority>", "Priority: low|medium|high|urgent")
    .option("-d, --due <date>", "Due date (ISO or YYYY-MM-DD)")
    .action(async (text: string[], opts) => {
      try {
        const client = getClient();
        const res = await client.api.v1.tasks.$post({
          json: {
            title: text.join(" "),
            priority: opts.priority,
            due_date: opts.due ? new Date(opts.due).toISOString() : undefined,
          },
        });
        const task = await unwrap<TaskRow>(res);
        console.log("Task created:");
        printTask(task);
      } catch (err) {
        handleError(err);
      }
    });
}

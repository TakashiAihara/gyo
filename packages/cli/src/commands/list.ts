import { Command } from "commander";
import { getClient, unwrap } from "../http";
import { printTaskTable } from "../utils/format";
import { handleError } from "../utils/errors";
import type { TaskRow } from "@gyo/server/db/schema";

export function createListCommand(): Command {
  return new Command("list")
    .description("List tasks")
    .option("-s, --status <status>", "Filter by status: todo|in_progress|done|cancelled")
    .option("-p, --priority <priority>", "Filter by priority: low|medium|high|urgent")
    .option("--due <filter>", "Filter by due: today|week|YYYY-MM-DD")
    .option("-q, --search <query>", "Search by title/content")
    .action(async (opts) => {
      try {
        const client = getClient();
        const res = await client.api.v1.tasks.$get({
          query: {
            status: opts.status,
            priority: opts.priority,
            due: opts.due,
            q: opts.search,
          },
        });
        const taskList = await unwrap<TaskRow[]>(res);
        printTaskTable(taskList);
      } catch (err) {
        handleError(err);
      }
    });
}

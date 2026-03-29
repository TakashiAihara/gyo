import { Command } from "commander";
import { getClient, unwrap } from "../http";
import { printTask } from "../utils/format";
import { handleError } from "../utils/errors";
import type { TaskRow } from "@gyo/server/db/schema";

export function createShowCommand(): Command {
  return new Command("show")
    .description("Show task details")
    .argument("<id>", "Task ID")
    .action(async (id: string) => {
      try {
        const client = getClient();
        const res = await client.api.v1.tasks[":id"].$get({ param: { id } });
        const task = await unwrap<TaskRow>(res);
        printTask(task);
      } catch (err) {
        handleError(err);
      }
    });
}

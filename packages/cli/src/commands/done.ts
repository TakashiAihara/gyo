import { Command } from "commander";
import { getClient, unwrap } from "../http";
import { handleError } from "../utils/errors";
import type { TaskRow } from "@gyo/server/db/schema";
import chalk from "chalk";

export function createDoneCommand(): Command {
  return new Command("done")
    .description("Mark a task as done")
    .argument("<id>", "Task ID")
    .action(async (id: string) => {
      try {
        const client = getClient();
        const res = await client.api.v1.tasks[":id"].done.$post({ param: { id } });
        const task = await unwrap<TaskRow>(res);
        console.log(chalk.green(`✓ Done: ${task.title}`));
      } catch (err) {
        handleError(err);
      }
    });
}

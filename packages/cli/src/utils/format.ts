import chalk from "chalk";
import type { TaskRow } from "@gyo/server/db/schema";

const PRIORITY_COLOR: Record<string, (s: string) => string> = {
  urgent: chalk.red,
  high: chalk.yellow,
  medium: chalk.white,
  low: chalk.gray,
};

const STATUS_COLOR: Record<string, (s: string) => string> = {
  todo: chalk.blue,
  in_progress: chalk.cyan,
  done: chalk.green,
  cancelled: chalk.gray,
};

function colorPriority(p: string): string {
  return (PRIORITY_COLOR[p] ?? chalk.white)(p);
}

function colorStatus(s: string): string {
  return (STATUS_COLOR[s] ?? chalk.white)(s);
}

export function printTaskTable(taskList: TaskRow[]): void {
  if (taskList.length === 0) {
    console.log(chalk.gray("No tasks found."));
    return;
  }
  const header = chalk.bold(
    `${"ID".padEnd(8)}  ${"STATUS".padEnd(11)}  ${"PRI".padEnd(7)}  ${"DUE".padEnd(12)}  TITLE`,
  );
  console.log(header);
  console.log("─".repeat(80));
  for (const t of taskList) {
    const id = t.id.slice(0, 6);
    const status = colorStatus(t.status).padEnd(11 + 10);
    const priority = colorPriority(t.priority).padEnd(7 + 10);
    const due = t.due_date ? t.due_date.toLocaleDateString("ja-JP") : "─".padEnd(10);
    console.log(`${id}  ${status}  ${priority}  ${due.padEnd(12)}  ${t.title}`);
  }
}

export function printTask(t: TaskRow): void {
  console.log(`${chalk.bold("ID:")}       ${t.id}`);
  console.log(`${chalk.bold("Title:")}    ${t.title}`);
  console.log(`${chalk.bold("Status:")}   ${colorStatus(t.status)}`);
  console.log(`${chalk.bold("Priority:")} ${colorPriority(t.priority)}`);
  if (t.due_date) console.log(`${chalk.bold("Due:")}      ${t.due_date.toLocaleString("ja-JP")}`);
  if (t.estimated_minutes) console.log(`${chalk.bold("Est:")}      ${t.estimated_minutes} min`);
  if (t.content) console.log(`\n${t.content}`);
}

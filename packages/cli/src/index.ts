#!/usr/bin/env bun

const [, , command, ...args] = process.argv;

const commands: Record<string, (args: string[]) => Promise<void>> = {
  add: async (args) => {
    console.log("add:", args.join(" "));
  },
  list: async (_args) => {
    console.log("list");
  },
  done: async (args) => {
    console.log("done:", args[0]);
  },
  next: async (_args) => {
    console.log("next");
  },
  estimate: async (args) => {
    console.log("estimate:", args[0]);
  },
};

if (!command || !(command in commands)) {
  console.log("Usage: gyo <command> [args]");
  console.log("Commands: add, list, done, next, estimate");
  process.exit(1);
}

await commands[command](args);

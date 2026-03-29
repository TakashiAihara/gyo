#!/usr/bin/env bun

import { Command } from "commander";
import { createAddCommand } from "./commands/add";
import { createListCommand } from "./commands/list";
import { createDoneCommand } from "./commands/done";
import { createShowCommand } from "./commands/show";

const program = new Command("gyo")
  .description("AI-powered task manager")
  .version("0.1.0");

program.addCommand(createAddCommand());
program.addCommand(createListCommand());
program.addCommand(createDoneCommand());
program.addCommand(createShowCommand());

program.parse();

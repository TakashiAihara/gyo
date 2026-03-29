import { join } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

interface Config {
  api_url: string;
  token?: string;
}

const configDir = join(process.env.HOME ?? "~", ".config", "gyo");
const configPath = join(configDir, "config.json");

export function readConfig(): Config {
  if (!existsSync(configPath)) {
    return { api_url: process.env.GYO_API_URL ?? "http://localhost:8080" };
  }
  return JSON.parse(readFileSync(configPath, "utf-8")) as Config;
}

export function writeConfig(config: Config): void {
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true });
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function getToken(): string | undefined {
  return process.env.GYO_API_TOKEN ?? readConfig().token;
}

export function getApiUrl(): string {
  return process.env.GYO_API_URL ?? readConfig().api_url;
}

import { ApiError } from "../http";

export const ExitCodes = {
  SUCCESS: 0,
  GENERAL: 1,
  NOT_FOUND: 4,
  API_ERROR: 6,
  NETWORK_ERROR: 8,
} as const;

export function handleError(error: unknown): never {
  if (error instanceof ApiError) {
    console.error(`Error ${error.status}: ${error.message}`);
    process.exit(error.status === 404 ? ExitCodes.NOT_FOUND : ExitCodes.API_ERROR);
  }
  if (error instanceof Error) {
    if (error.message.includes("ECONNREFUSED") || error.message.includes("fetch failed")) {
      console.error(`Cannot connect to gyo server. Is it running?`);
      process.exit(ExitCodes.NETWORK_ERROR);
    }
    console.error(error.message);
  } else {
    console.error("Unknown error");
  }
  process.exit(ExitCodes.GENERAL);
}

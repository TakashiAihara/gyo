import { hc } from "hono/client";
import { getApiUrl, getToken } from "./config";
import type { AppType } from "@gyo/server";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function createClient() {
  const token = getToken();
  return hc<AppType>(getApiUrl(), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function getClient() {
  return createClient();
}

// Check response and return the success JSON, throwing ApiError on failure.
// The type parameter T should be the success branch of the response union.
export async function unwrap<T>(res: Response & { json(): Promise<unknown> }): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (data as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

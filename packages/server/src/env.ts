function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

export const env = {
  DATABASE_URL: requireEnv("DATABASE_URL"),
  GYO_API_TOKEN: requireEnv("GYO_API_TOKEN"),
  PORT: Number(process.env.PORT ?? 8080),
};

export const databaseConfig = {
  development: {
    url: process.env.DATABASE_URL,
  },
  test: {
    url: process.env.TEST_DATABASE_URL,
  },
  production: {
    url: process.env.DATABASE_URL,
  },
};

export const getDatabaseUrl = (): string => {
  const env = process.env.NODE_ENV || "development";
  const config = databaseConfig[env as keyof typeof databaseConfig];

  if (!config?.url) {
    throw new Error(`Database URL not configured for environment: ${env}`);
  }

  return config.url;
};

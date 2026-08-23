import dotenv from "dotenv";

dotenv.config();

const requiredEnvVariables = [
  "PORT",
  "DATABASE_URL",
  "CLIENT_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN"
];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

export const env = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  clientUrl: process.env.CLIENT_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN
};
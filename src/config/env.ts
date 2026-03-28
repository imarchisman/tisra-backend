import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

const envSchema: Joi.ObjectSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRY: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRY: Joi.string().default('7d'),
  SPOTIFY_CLIENT_ID: Joi.string().required(),
  SPOTIFY_CLIENT_SECRET: Joi.string().required(),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().required(),
  CORS_ORIGIN: Joi.string().required(),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const env = {
  nodeEnv: envVars.NODE_ENV as string,
  port: envVars.PORT as number,
  databaseUrl: envVars.DATABASE_URL as string,
  jwt: {
    accessSecret: envVars.JWT_ACCESS_SECRET as string,
    refreshSecret: envVars.JWT_REFRESH_SECRET as string,
    accessExpiry: envVars.JWT_ACCESS_EXPIRY as string,
    refreshExpiry: envVars.JWT_REFRESH_EXPIRY as string,
  },
  spotify: {
    clientId: envVars.SPOTIFY_CLIENT_ID as string,
    clientSecret: envVars.SPOTIFY_CLIENT_SECRET as string,
  },
  smtp: {
    host: envVars.SMTP_HOST as string,
    port: envVars.SMTP_PORT as number,
    user: envVars.SMTP_USER as string,
    pass: envVars.SMTP_PASS as string,
  },
  emailFrom: envVars.EMAIL_FROM as string,
  corsOrigin: envVars.CORS_ORIGIN as string,
};

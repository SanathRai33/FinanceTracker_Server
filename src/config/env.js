const Joi = require('joi');

// Define schema for environment variables
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  FRONTEND_ORIGIN: Joi.string().uri().required(),
  MONGO_URI: Joi.string().uri().required(),
  FIREBASE_PROJECT_ID: Joi.string().required(),
  FIREBASE_CLIENT_EMAIL: Joi.string().email().required(),
  FIREBASE_PRIVATE_KEY: Joi.string().required(),
  SESSION_COOKIE_SECRET: Joi.string().required(),
  SESSION_COOKIE_NAME: Joi.string().default('ft_session'),
}).unknown(); // Allow unknown keys

// Validate environment variables
const { error, value } = envSchema.validate(process.env);

if (error) {
  console.error('Environment validation error:', error.details);
  process.exit(1);
}

module.exports = value;
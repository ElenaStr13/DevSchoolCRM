import * as process from 'node:process';
import { Config } from './config.type';

export default (): Config => ({
  app: {
    port: parseInt(process.env.APP_PORT || '3000', 10),
    host: process.env.APP_HOST || 'localhost',
  },
  database: {
    type: process.env.DB_TYPE as 'mysql',
    host:
      process.env.DB_HOST ||
      'crmapplications.c70w66mu8y0h.us-east-1.rds.amazonaws.com',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'crmapplications',
    password: process.env.DB_PASSWORD || 'ElenaStr13.',
    name: process.env.DB_NAME || 'crmapplications',
  },
});

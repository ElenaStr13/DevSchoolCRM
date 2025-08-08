export type Config = {
  app: AppConfig;
  database: DatabaseConfig;
};

export type AppConfig = {
  port: number;
  host: string;
};

export type DatabaseConfig = {
  type?: 'mysql';
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
};

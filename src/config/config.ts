import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
}

interface QueryConfig {
  defaultPage: number;
  defaultLimit: number;
}

const config: Config = {
  port: Number(process.env.PORT) || 2313,
  nodeEnv: process.env.NODE_ENV || 'development',
};

const queryConfig: QueryConfig = {
  defaultPage: Number(process.env.DEFAULT_PAGE) || 1,
  defaultLimit: Number(process.env.DEFAULT_LIMIT) || 10,
};

export default config;
export { queryConfig };
import { env } from '@env';

const { db } = env;

interface DatabaseConfigInterface {
  type: string;
  database: string;
  host: string;
  port: number;
  username: string;
  password: string;
  synchronize: boolean;
  logging: boolean;
  timezone: string;
}

const databaseConfig = {} as DatabaseConfigInterface;

switch (db.dialect) {
  case 'sqlite':
    databaseConfig.type = 'sqlite';
    databaseConfig.database = db.storage;
    databaseConfig.synchronize = db.synchronize;
    databaseConfig.logging = db.logging;
    break;
  case 'mysql':
    databaseConfig.type = 'mysql';
    databaseConfig.database = db.database;
    databaseConfig.host = db.host;
    databaseConfig.port = db.port;
    databaseConfig.username = db.username;
    databaseConfig.password = db.password;
    databaseConfig.synchronize = db.synchronize;
    databaseConfig.logging = db.logging;
    databaseConfig.timezone = db.timezone;
    break;
  default:
    databaseConfig.type = 'sqlite';
    databaseConfig.database = db.storage;
    databaseConfig.synchronize = db.synchronize;
    databaseConfig.logging = db.logging;
    break;
}

export default databaseConfig;

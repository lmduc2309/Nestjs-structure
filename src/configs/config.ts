import { Config } from './config.interface';

const config: Config = {
  nest: {
    port: 3002,
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: true,
    title: 'Dusk Blogger',
    description: 'The nestjs API description',
    version: '1.0',
    path: 'api',
  },
  security: {
    expiresIn: 7200,
    refreshIn: 604800,
    bcryptSaltOrRound: 10,
  },
};

export default (): Config => config;

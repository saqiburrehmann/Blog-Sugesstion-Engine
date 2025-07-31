import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST')!,
  port: parseInt(configService.get<string>('DB_PORT')!),
  username: configService.get<string>('DB_USERNAME')!,
  password: configService.get<string>('DB_PASSWORD')!,
  database: configService.get<string>('DB_NAME')!,
  autoLoadEntities: true,
  synchronize: true, // we have to disbale in production
});

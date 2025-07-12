import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'football_app',
  entities: [__dirname + '/**/*.entity.{ts,js}'],
  synchronize: true,
  autoLoadEntities: true,
  // dropSchema:true,
  
};
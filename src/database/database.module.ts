import { Module } from '@nestjs/common';
import { pool } from './postgres.pool';

@Module({
  providers: [
    {
      provide: 'PG_POOL',
      useValue: pool,
    },
  ],
  exports: ['PG_POOL'],
})
export class DatabaseModule {}

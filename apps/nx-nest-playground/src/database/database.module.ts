import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getMetadataArgsStorage } from 'typeorm';

import config from './database-config';
import { SeedService } from './seed.service';

@Module({
    providers: [SeedService],
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
                config.type = configService.get('DATABASE_TYPE');
                config.database = configService.get('DATABASE_NAME');
                config.entities = getMetadataArgsStorage().tables.map((tbl) => tbl.target) as string[];
                config.logging = configService.get('DATABASE_LOGGING') === 'true';
                config.synchronize = configService.get('DATABASE_SYNCHRONIZE') === 'true';
                return <TypeOrmModuleOptions>config;
            },
        }),
    ],
    exports: [SeedService],
})
export class DatabaseModule { }


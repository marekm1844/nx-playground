import { Injectable, Logger } from '@nestjs/common';
import { Command, Console } from 'nestjs-console';
import { userSeed } from './user.seed';
import { DataSource } from 'typeorm';

@Console()
@Injectable()
export class SeedService {
    constructor(private dataSource: DataSource) {}

    
    @Command({
        command: 'seed',
        description: 'Seed the database',
    })
    async seed() {

        try {   

            
        Logger.log('Seeding the database...');
        await userSeed( this.dataSource );  
        Logger.log('Done!');

        }
        catch (error) {
            Logger.error(error);
            process.exit(1);
        }


    }
    }




import * as redisStore from 'cache-manager-redis-yet';

const config = {
    store: redisStore,
    host: 'localhost',
    port: 6379,
    ttl: 3600,    
}

export default config;
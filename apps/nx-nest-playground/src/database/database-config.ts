const config = {
    type: 'sqlite',
    database: 'database.sqlite',
    synchronize: true,
    logging: true,
    entities: ['src/**/*.entity.ts'],
}

export default config;
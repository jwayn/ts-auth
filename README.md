# Typescript Auth Server

A simple auth server written with typescript, node and express.

## Recommended VS Code plugins:

- Prisma

## Example .env file
```
NODE_ENV=development 
PORT=3001 
JWT_SECRET=FlabbergastedBaldPenguinChallenger 
DATABASE_URL="postgresql://admin:admin@localhost:5432/auth" 
```

### NODE_ENV

This variable is mainly used for setting logging to development mode or combined mode. Development mode logs more information.

### PORT

This variable is used to set the port the server will run on.

### JWT_SECRET

This variable is used as a secret to sign JWT payloads. In production, this secret must also be shared with the client so that the client can verify the integrity of the JWT.

### DATABASE_URL

This variable is used by prisma in `schema.prisma` to connect to the database.

## Database Configuration

It is possible to use a database other than Postgres in development or production. To do so, you must change the `DATABASE_URL` environment variable to reflect your database's configuration and credentials, and update the `provider` in `schema.prisma` to reflect your choice of database.

## Up and Running

There is a docker-compose file configured to run a local instance of postgresql for development.
`docker-compose up -d && npm install && npm start`

Once the database is running, you can run `npx prisma migrate dev --name init` from the root directory to run a database migration that will populate your database with the tables defined in `schema.prisma`. Any time you make updates to the schema, you must run this command to update the database respectively.

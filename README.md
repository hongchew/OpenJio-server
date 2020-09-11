# OpenJio Server
## Description
This is the common backend for IS4103.

Built on express.js 

## Quick Start
`npm install` or `yarn` to install node packages.

`npm run start` or `yarn start` to run the server.

The server will be listening on `http://localhost:3000` by default.

Test the server on postman with [GET] `http://localhost:3000/test`

## Database Setup
The Database uses MySQL Community Server as the DBMS and Sequelize.js as ORM.

1. Download MySql Community Server
2. Create a new database/schema
3. Take note of the username, password and database/schema name (default is ```'openjio'```, ```'password'``` & ```'openjio'``` respectively)
4. Replace the respective fields in [PRIVATE_VARIABLES.js](./PRIVATE_VARIABLES.js)
If you follow the above steps, `***[Database] Connection to database has been established successfully.` should appear in the terminal when you run `npm run start` or `yarn start`


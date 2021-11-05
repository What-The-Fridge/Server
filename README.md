# Server For What The Fridge 🍎

## Set-up

**Requirement**

NodeJS latest v
Install and run PostgreSQL

**Local DB config**

- Install and run PostgreSQL
- Create a db called 'what-the-fridge' without quotation marks
- username: postgres &
  password: postgres

**Environment Variables**

Create a .env file in ./backend/Node folder, ask Hachi for keys:

```sh
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
```

**Install**

Run `npm install` to install all dependencies

## Running local server

```sh
`npm start` or `yarn start`       # start development on 4000 w nodemon
```

## GraphQL Server

After running `npm start`, GraphQL server can be accessed here:
http://localhost:4000/graphql

## Database view

- Open up pgAdmin4
- Log in using credentials you set
- Find Schemas/public/Tables
- Right click & view all rows

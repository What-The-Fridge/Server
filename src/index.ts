import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import session from 'express-session';
import { UserResolver } from './resolvers/UserResolver';
import { FridgeResolver } from './resolvers/FridgeResolver';
import { FridgeItemResolver } from './resolvers/FridgeItemResolver';
import { FridgeUserTableResolver } from './resolvers/FridgeUserTableResolver';
import { MeasurementTypeResolver } from './resolvers/MeasurementTypeResolver';
import { GroceryListResolver } from './resolvers/GroceryListResolver';
import { GroceryListUserTableResolver } from './resolvers/GroceryListUserTableResolver';
import { GroceryItemResolver } from './resolvers/GroceryItemResolver';
import { Client } from 'pg';
import { FridgeUserTable } from './entities/FridgeUserTable';
import { GroceryItem } from './entities/GroceryItem';
import { GroceryList } from './entities/GroceryList';
import { GroceryListUserTable } from './entities/GroceryListUserTable';
import { MeasurementType } from './entities/MeasurementType';
import { User } from './entities/User';
import { FridgeItemInfo } from './entities/FridgeItemInfo';
import { FridgeItem } from './entities/FridgeItem';
import { Fridge } from './entities/Fridge';
import path from 'path';

// declare a userId field in the session
declare module 'express-session' {
	interface Session {
		userId: any;
		username: any;
		password: any;
	}
}

export var admin = require('firebase-admin');

// used to run sql queries to the db
export const client = new Client({
	host: 'localhost',
	user: 'postgres',
	password: 'postgres',
	database: 'what-the-fridge',
});

(async () => {
	const conn = await createConnection({
		name: 'typeOrmConnection',
		type: 'postgres',
		database: 'what-the-fridge',
		username: 'postgres',
		password: 'postgres',
		logging: true,
		synchronize: true,
		migrations: [path.join(__dirname + '/migration/*.ts')],
		entities: [
			Fridge,
			FridgeItem,
			FridgeItemInfo,
			FridgeUserTable,
			GroceryItem,
			GroceryList,
			GroceryListUserTable,
			MeasurementType,
			User,
		],
	});

	// measurement migration
	conn.undoLastMigration().then(() => {
		conn.runMigrations();
	});

	const app = express();

	// firebase authentication
	var serviceAccount = require('../serviceAccountKey.json');

	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});

	// postgres db
	client.connect((err: any) => {
		if (err) {
			console.error('postgres connection error', err.stack);
		} else {
			console.log('connected to what-the-fridge postgres server');
		}
	});

	app.use(cookieParser());

	// cors
	var whitelist = ['http://localhost:3000', 'https://studio.apollographql.com'];
	app.use(
		cors({
			origin: whitelist,
			credentials: true,
		})
	);

	// enable this if you run behind a proxy (e.g. nginx)
	app.set('trust proxy', 1);

	// // redis store session
	// const RedisStore = connectRedis(session);
	// //Configure redis client
	// const redisClient = redis.createClient({
	// 	host: 'localhost',
	// 	port: 6379,
	// });

	// redisClient.on('error', function (err) {
	// 	console.log('Could not establish a connection with redis. ' + err);
	// });
	// redisClient.on('connect', function () {
	// 	console.log('Connected to redis successfully');
	// });

	app.use(
		session({
			name: 'qid',
			// store: new RedisStore({
			// 	client: redisClient,
			// 	disableTTL: true,
			// 	disableTouch: true,
			// }),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24,
				httpOnly: true,
				sameSite: 'lax',
				secure: false, // works for both http and https, need to change on __PROD__
			},
			secret: process.env.SESSION_SECRET!,
			resave: false,
			saveUninitialized: false,
		})
	);

	const constraints = await client.query(
		`
		SELECT conname
		FROM pg_constraint
		WHERE conrelid =
				(SELECT oid 
				FROM pg_class
				WHERE relname LIKE 'fridgeItemInfo')
		AND contype = 'u';
		`
	);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [
				UserResolver,
				FridgeResolver,
				FridgeItemResolver,
				FridgeUserTableResolver,
				MeasurementTypeResolver,
				GroceryListResolver,
				GroceryListUserTableResolver,
				GroceryItemResolver,
			],
		}),
		context: ({ req, res }) => ({
			req,
			res,
			upc_user_constraint: constraints.rows[0]?.conname
				? constraints.rows[0]?.conname
				: 'constraint not found',
		}),
	});

	await apolloServer.start();
	apolloServer.applyMiddleware({ app, cors: false });

	app.listen(4000, () => {
		console.log('express listening on port 4000');
	});
})();

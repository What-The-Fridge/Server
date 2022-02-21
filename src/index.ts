import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import cors from 'cors';
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
	connectionString: process.env.PG_CONNECTION_URL,
});

(async () => {
	const app = express();

	// enable this if you run behind a proxy (e.g. nginx)
	app.set('trust proxy', 1);

	cors;
	var whitelist = [
		process.env.CORS_ORIGIN!,
		'https://studio.apollographql.com',
		'local://localhost:3000',
	];

	app.use(
		cors({
			origin: whitelist,
			credentials: true,
			methods: ['GET', 'POST'],
		})
	);

	const conn = await createConnection({
		type: 'postgres',
		url: process.env.PG_CONNECTION_URL,
		logging: true,
		synchronize: true,
		migrations: [path.join(__dirname + '/migration/*')],
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

	app.listen(process.env.PORT_NUM, () => {
		console.log(`express listening on port ${process.env.PORT_NUM}`);
	});

	app.use('/', (_, res) => {
		return res.send('Welcome to What The Fridge api');
	});
})();

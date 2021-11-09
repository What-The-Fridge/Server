import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { UserResolver } from './UserResolver';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import cookieParser from 'cookie-parser';
import { verify } from 'jsonwebtoken';
import { User } from './entity/User';
import { createAccessToken, createRefreshToken } from './auth';
import { sendRefreshToken } from './sendRefreshToken';
import cors from 'cors';
import session from 'express-session';
import redis from 'redis';
import connectRedis from 'connect-redis';

// this delares a userId field in the session
declare module 'express-session' {
	interface Session {
		userId: any;
	}
}

(async () => {
	const app = express();
	app.use(cookieParser());

	// redis store session
	const RedisStore = connectRedis(session);
	const redisClient = redis.createClient();

	app.set('trust proxy', 1);
	app.use(
		session({
			name: 'qid',
			store: new RedisStore({
				client: redisClient,
				disableTTL: true,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24,
				httpOnly: true,
				sameSite: 'none',
				secure: false, // works for both http and https, need to change on prod
			},
			secret: process.env.SESSION_SECRET!,
			resave: false,
			saveUninitialized: false,
		})
	);

	// cors
	var whitelist = ['http://localhost:3000', 'https://studio.apollographql.com'];
	app.use(
		cors({
			origin: whitelist,
			credentials: true,
		})
	);

	app.get('/', (_req, res) => res.send('hello'));

	app.post('/refresh_token', async (req, res) => {
		const token = req.cookies.jid;

		if (!token) {
			return res.send({ ok: false, accessToken: '' });
		}
		let payload: any = null;
		try {
			payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
		} catch (err) {
			console.log(err);
			return res.send({ ok: false, accessToken: '' });
		}

		// token is valid && send back an access tokens
		const user = await User.findOne({ id: payload.userId });

		if (!user) {
			return res.send({ ok: false, accessToken: '' });
		}

		if (user.tokenVersion !== payload.tokenVersion) {
			return res.send({ ok: false, accessToken: '' });
		}

		sendRefreshToken(res, createRefreshToken(user));
		return res.send({ ok: true, accessToken: createAccessToken(user) });
	});

	await createConnection();
	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [UserResolver],
		}),
		context: ({ req, res }) => ({ req, res }),
	});

	await apolloServer.start();
	apolloServer.applyMiddleware({ app, cors: false });

	app.listen(4000, () => {
		console.log('express listening on port 4000');
	});
})();

// createConnection()
// 	.then(async connection => {
// 		console.log('Inserting a new user into the database...');
// 		const user = new User();
// 		user.firstName = 'Timber';
// 		user.lastName = 'Saw';
// 		user.age = 25;
// 		await connection.manager.save(user);
// 		console.log('Saved a new user with id: ' + user.id);

// 		console.log('Loading users from the database...');
// 		const users = await connection.manager.find(User);
// 		console.log('Loaded users: ', users);

// 		console.log('Here you can setup and run express/koa/any other framework.');
// 	})
// 	.catch(error => console.log(error));

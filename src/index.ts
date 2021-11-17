import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { UserResolver } from './resolvers/UserResolver';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import cookieParser from 'cookie-parser';
import { verify } from 'jsonwebtoken';
import { User } from './entities/User';
import {
	createAccessToken,
	createRefreshToken,
} from './utils/authentication/auth';
import { sendRefreshToken } from './utils/authentication/sendRefreshToken';
import cors from 'cors';
import session from 'express-session';
import redis from 'redis';
import connectRedis from 'connect-redis';
import { FridgeResolver } from './resolvers/FridgeResolver';
import { FridgeItemResolver } from './resolvers/FridgeItemResolver';

// declare a userId field in the session
declare module 'express-session' {
	interface Session {
		userId: any;
		username: any;
		password: any;
	}
}

(async () => {
	const app = express();
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

	// redis store session
	const RedisStore = connectRedis(session);
	//Configure redis client
	const redisClient = redis.createClient({
		host: 'localhost',
		port: 6379,
	});

	redisClient.on('error', function (err) {
		console.log('Could not establish a connection with redis. ' + err);
	});
	redisClient.on('connect', function () {
		console.log('Connected to redis successfully');
	});

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
				sameSite: 'lax',
				secure: false, // works for both http and https, need to change on __PROD__
			},
			secret: process.env.SESSION_SECRET!,
			resave: false,
			saveUninitialized: false,
		})
	);

	app.get('/', (req, res) => {
		const sess = req.session;
		if (sess.username && sess.password) {
			if (sess.username) {
				res.write(`<h1>Welcome ${sess.username} </h1><br>`);
				res.write(`<h3>This is the Home page</h3>`);
				res.end('<a href=' + '/logout' + '>Click here to log out</a >');
			}
		} else {
			res.sendFile(__dirname + '/login.html');
		}
	});
	app.post('/login', (req, res) => {
		const sess = req.session;
		const { username, password } = req.body;
		sess.username = username;
		sess.password = password;
		// add username and password validation logic here if you want.If user is authenticated send the response as success
		res.end('success');
	});
	app.get('/logout', (req, res) => {
		req.session.destroy(err => {
			if (err) {
				return console.log(err);
			}
			res.redirect('/');
		});
	});

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
			resolvers: [UserResolver, FridgeResolver, FridgeItemResolver],
		}),
		context: ({ req, res }) => ({ req, res }),
	});

	await apolloServer.start();
	apolloServer.applyMiddleware({ app, cors: false });

	app.listen(4000, () => {
		console.log('express listening on port 4000');
	});
})();

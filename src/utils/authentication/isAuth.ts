import { admin } from '../../index';
import { MiddlewareFn } from 'type-graphql';
import { MyContext } from '../context/MyContext';

// Firebase Auth
export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
	const authorization = context.req.headers['authorization'];

	if (!authorization) {
		throw new Error('not authenticated');
	}

	if (authorization && authorization.split(' ')[0] !== 'Bearer') {
		throw new Error('invalid token');
	}

	try {
		const token = authorization.split(' ')[1];
		admin
			.auth()
			.verifyIdToken(token)
			.then(() => next())
			.catch(() => {
				throw new Error('could not authenticate with firebase');
			});
	} catch (e) {
		throw new Error('cannot connect to firebase');
	}

	return next();
};

export const isAuthRest = (req: any, _: any, next: any) => {
	const authorization = req.headers['authorization'];
	console.log(req.headers);

	if (!authorization) {
		console.log('not auth');
		throw new Error('not authenticated');
	}

	if (authorization && authorization.split(' ')[0] !== 'Bearer') {
		console.log('invalid token');
		throw new Error('invalid token');
	}

	try {
		const token = authorization.split(' ')[1];
		admin
			.auth()
			.verifyIdToken(token)
			.then(() => next())
			.catch(() => {
				console.log('cannot authenticate w firebase');
				throw new Error('could not authenticate with firebase');
			});
	} catch (e) {
		console.log('cannot connect');
		throw new Error('cannot connect to firebase');
	}

	return next();
};

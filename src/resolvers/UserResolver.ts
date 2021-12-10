import { Arg, Int, Mutation, Query, Resolver } from 'type-graphql';
import { User } from '../entities/User';
// import { MyContext } from '../utils/context/MyContext';
import { getConnection } from 'typeorm';
// import { validateRegister } from '../utils/authentication/validateRegister';
// import argon2 from 'argon2';
// import { client } from '../index';
// import { UserResponse } from '../utils/objectTypes/objectTypes';

@Resolver(User)
export class UserResolver {
	// @Query(() => String)
	// getUserId(@Ctx() { req, payload }: MyContext) {
	// 	if (!req.session.userId) {
	// 		return 'hi there';
	// 	}
	// 	return `your user id is: ${payload!.userId}`;
	// }

	// @Query(() => String)
	// async me(@Ctx() { req }: MyContext) {
	// 	if (!req.session.userId) {
	// 		return null;
	// 	}
	// 	const user = await User.findOne({ id: req.session.userId });
	// 	return user;
	// }

	@Query(() => [User])
	getAllUsers() {
		return User.find();
	}

	@Mutation(() => Boolean)
	async revokeRefreshTokensForUser(@Arg('userId', () => Int) userId: number) {
		await getConnection()
			.getRepository(User)
			.increment({ id: userId }, 'tokenVersion', 1);

		return true;
	}

	// TODO: redo the /findOne with actual sql query aka avoid using typeorm for querying data
	// @Mutation(() => UserResponse)
	// async login(
	// 	@Arg('usernameOrEmail') usernameOrEmail: string,
	// 	@Arg('password') password: string,
	// 	@Ctx() { req }: MyContext
	// ): Promise<UserResponse> {
	// 	const user = await User.findOne(
	// 		usernameOrEmail.includes('@')
	// 			? { where: { email: usernameOrEmail } }
	// 			: { where: { username: usernameOrEmail } }
	// 	);

	// 	if (!user) {
	// 		return {
	// 			errors: [
	// 				{
	// 					field: 'usernameOrEmail',
	// 					message: "username/email doesn't exist",
	// 				},
	// 			],
	// 		};
	// 	}

	// 	const valid = await argon2.verify(user.password, password);

	// 	if (!valid) {
	// 		return {
	// 			errors: [
	// 				{
	// 					field: 'password',
	// 					message: 'invalid password',
	// 				},
	// 			],
	// 		};
	// 	}

	// 	// upon success
	// 	req.session.userId = user.id;

	// 	// sendRefreshToken(res, createRefreshToken(user));

	// 	return {
	// 		user,
	// 	};
	// }

	// @Mutation(() => UserResponse)
	// async register(
	// 	@Arg('username') username: string,
	// 	@Arg('email') email: string,
	// 	@Arg('password') password: string,
	// 	@Ctx() { req }: MyContext
	// ): Promise<UserResponse> {
	// 	const errors = validateRegister(username, email, password);
	// 	if (errors) return { errors };

	// 	const hashedPassword = await argon2.hash(password);

	// 	let user;
	// 	try {
	// 		const result = await client.query(
	// 			'INSERT INTO users ("username", "email", "password") VALUES ($1, $2, $3) RETURNING *',
	// 			[username, email, hashedPassword]
	// 		);

	// 		user = result.rows[0];
	// 	} catch (err) {
	// 		console.log(err);
	// 		if (err.code === '23505') {
	// 			return {
	// 				errors: [
	// 					{
	// 						field: err.detail.substring(
	// 							err.detail.indexOf('(') + 1,
	// 							err.detail.indexOf(')')
	// 						),
	// 						message: 'already exists',
	// 					},
	// 				],
	// 			};
	// 		} else {
	// 			return {
	// 				errors: [
	// 					{
	// 						field: 'password',
	// 						message: err.detail,
	// 					},
	// 				],
	// 			};
	// 		}
	// 	}

	// 	// register successfully, create session for the current user
	// 	req.session.userId = user.id;
	// 	return { user };
	// }
}

import {
	Arg,
	Ctx,
	Field,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	UseMiddleware,
} from 'type-graphql';
import { hash, compare } from 'bcryptjs';
import { User } from '../entities/User';
import { MyContext } from '../utils/context/MyContext';
import {
	createAccessToken,
	createRefreshToken,
} from '../utils/authentication/auth';
import { isAuth } from '../utils/authentication/isAuth';
import { sendRefreshToken } from '../utils/authentication/sendRefreshToken';
import { getConnection } from 'typeorm';
import { validateRegister } from '../utils/authentication/validateRegister';

@ObjectType()
class FieldError {
	@Field()
	field: string;
	@Field()
	message: string;
}

@ObjectType()
class LoginResponse {
	@Field()
	accessToken: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver(User)
export class UserResolver {
	@Query(() => String)
	@UseMiddleware(isAuth)
	hello() {
		return 'hello!';
	}

	@Query(() => String)
	bye(@Ctx() { req, payload }: MyContext) {
		console.log(req.session);
		if (!req.session.userId) {
			return 'hi there';
		}
		return `your user id is: ${payload!.userId}`;
	}

	@Query(() => String)
	async me(@Ctx() { req }: MyContext) {
		console.log(req.session);
		if (!req.session.userId) {
			return null;
		}
		const user = await User.findOne({ id: req.session.userId });
		return user;
	}

	@Query(() => [User])
	users() {
		return User.find();
	}

	@Mutation(() => Boolean)
	async revokeRefreshTokensForUser(@Arg('userId', () => Int) userId: number) {
		await getConnection()
			.getRepository(User)
			.increment({ id: userId }, 'tokenVersion', 1);

		return true;
	}

	@Mutation(() => LoginResponse)
	async login(
		@Arg('email') email: string,
		@Arg('password') password: string,
		@Ctx() { req, res }: MyContext
	): Promise<LoginResponse> {
		const user = await User.findOne({ where: { email } });

		if (!user) {
			throw new Error('could not find user');
		}

		const valid = await compare(password, user.password);

		if (!valid) {
			throw new Error('bad password');
		}

		req.session.userId = user.email;
		console.log(req.session);

		// log in successfully
		sendRefreshToken(res, createRefreshToken(user));

		return {
			accessToken: createAccessToken(user),
		};
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg('username') username: string,
		@Arg('email') email: string,
		@Arg('password') password: string,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const errors = validateRegister(username, email, password);
		if (errors) return { errors };

		const hashedPassword = await hash(password, 12);

		let user;
		try {
			const result = await getConnection()
				.createQueryBuilder()
				.insert()
				.into(User)
				.values({
					username: username,
					email: email,
					password: hashedPassword,
				})
				.returning('*')
				.execute();
			user = result.raw[0];
		} catch (err) {
			if (err.code === '23505') {
				return {
					errors: [
						{
							field: 'username',
							message: 'username already taken',
						},
					],
				};
			} else {
				return {
					errors: [
						{
							field: 'unknown',
							message: err.detail,
						},
					],
				};
			}
		}

		// register successfully, create session for the current user
		req.session.userId = user.id;
		return { user };
	}
}

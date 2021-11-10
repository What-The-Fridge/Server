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
import { User } from './entity/User';
import { MyContext } from './MyContext';
import { createAccessToken, createRefreshToken } from './auth';
import { isAuth } from './isAuth';
import { sendRefreshToken } from './sendRefreshToken';
import { getConnection } from 'typeorm';
@ObjectType()
class LoginResponse {
	@Field()
	accessToken: string;
}

@Resolver()
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

	@Mutation(() => Boolean)
	async register(
		@Arg('email') email: string,
		@Arg('password') password: string
	) {
		const hashedPassword = await hash(password, 12);

		try {
			await User.insert({ email, password: hashedPassword });
		} catch (err) {
			console.log(err);
			return false;
		}
		return true;
	}
}

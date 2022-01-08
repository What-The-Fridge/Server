import {
	Arg,
	Int,
	Mutation,
	Query,
	Resolver,
	// UseMiddleware,
} from 'type-graphql';
import { User } from '../entities/User';
import { getConnection } from 'typeorm';
import { client } from '../index';
import { UserInput, UserResponse } from '../utils/objectTypes/objectTypes';
// import { isAuth } from '../utils/authentication/isAuth';
import { postGresError } from './helpers/sharedFunctions';

@Resolver(User)
export class UserResolver {
	@Query(() => UserResponse)
	// @UseMiddleware(isAuth)
	async getUserInfo(
		@Arg('firebaseUserUID') firebaseUserUID: string
	): Promise<UserResponse> {
		const user = await User.findOne({
			where: { firebaseUserUID: firebaseUserUID },
		});

		if (user) return { user: user };

		return {
			errors: [
				{
					field: 'firebaseUserUID',
					message: 'no such user found',
				},
			],
		};
	}

	@Mutation(() => Boolean)
	async revokeRefreshTokensForUser(@Arg('userId', () => Int) userId: number) {
		await getConnection()
			.getRepository(User)
			.increment({ id: userId }, 'tokenVersion', 1);

		return true;
	}

	/**
	 * Save a user's info to the database
	 *
	 * @param input contains all the fields of user object
	 * E.g. input: {firstName: "Hachi", lastName: "Coding", firebaseUserUID: "JifJ1i4Gvjdp46pWsL98sgfsdg2", etc.}
	 * Must have fields: firstName, lastName, firebaseUserUID
	 * @return newly created user. Upon errors, return the array of all the errors
	 */
	@Mutation(() => UserResponse)
	// @UseMiddleware(isAuth)
	async createUser(@Arg('input') input: UserInput): Promise<UserResponse> {
		if (!(input.firstName && input.lastName && input.firebaseUserUID))
			return {
				errors: [
					{
						field: 'input',
						message: 'user data missing',
					},
				],
			};

		let user;
		try {
			const result = await client.query(
				`INSERT INTO users ("email", "firstName", "lastName", "firebaseUserUID", "imgUrl", "tier") 
				VALUES ($1, $2, $3, $4, $5, $6) 
				RETURNING *`,
				[
					input.email,
					input.firstName,
					input.lastName,
					input.firebaseUserUID,
					input.imgUrl,
					1,
				]
			);

			user = result.rows[0];
		} catch (err) {
			return {
				errors: postGresError(err),
			};
		}

		return { user };
	}
}

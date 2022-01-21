import {
	Arg,
	Mutation,
	Query,
	Resolver,
	// UseMiddleware,
} from 'type-graphql';
import { User } from '../entities/User';
import { client } from '../index';
import {
	BooleanResponse,
	UserInput,
	UserResponse,
} from '../utils/objectTypes/objectTypes';
// import { isAuth } from '../utils/authentication/isAuth';
import { deleteItemById, postGresError } from './helpers/sharedFunctions';

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

	/**
	 * Deletes a user
	 * TODO: clear all the fridges && items linked to this user
	 *
	 * @param userId id of the user
	 * @return true/false based on whether deleted. Upon errors, return the array of all the errors
	 */
	@Mutation(() => BooleanResponse)
	async deleteUser(@Arg('userId') userId: number): Promise<BooleanResponse> {
		return await deleteItemById(userId, 'users');
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

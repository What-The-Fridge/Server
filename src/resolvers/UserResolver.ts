import {
	Arg,
	Int,
	Mutation,
	Query,
	Resolver,
	UseMiddleware,
} from 'type-graphql';
import { User } from '../entities/User';
import { getConnection } from 'typeorm';
import { client } from '../index';
import { UserInput, UserResponse } from '../utils/objectTypes/objectTypes';
import { isAuth } from '../utils/authentication/isAuth';

@Resolver(User)
export class UserResolver {
	@Query(() => [User])
	@UseMiddleware(isAuth)
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

	@Mutation(() => UserResponse)
	@UseMiddleware(isAuth)
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

		console.log('hhhhh');
		let user;
		try {
			const result = await client.query(
				`INSERT INTO users ("email", "firstName", "lastName", "firebaseUserUID", "imgUrl") 
				VALUES ($1, $2, $3, $4, $5) 
				RETURNING *`,
				[
					input.email,
					input.firstName,
					input.lastName,
					input.firebaseUserUID,
					input.imgUrl,
				]
			);
			console.log(result);

			user = result.rows[0];
		} catch (err) {
			console.log(err);
			return {
				errors: [
					{
						field: err.detail.substring(
							err.detail.indexOf('(') + 1,
							err.detail.indexOf(')')
						),
						message: err.detail,
					},
				],
			};
		}

		return { user };
	}
}

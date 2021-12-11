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
import { BooleanResponse, DeleteUserInput, UserInput, UserResponse } from '../utils/objectTypes/objectTypes';
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

	@Mutation(() => BooleanResponse)
	// @UseMiddleware(isAuth)
	async deleteUser(@Arg('input') input: DeleteUserInput): Promise<BooleanResponse> {
		if (!(input.firebaseUserUID || input.id))
			return {
				errors: [
					{
						field: 'input',
						message: 'cannot identify delete target: need one of id or firebaseUserUID',
					},
				],
			};

		try {
			const result = await client.query(
				`DELETE FROM public.users WHERE users.id=$1 OR users."firebaseUserUID"=$2`,
				[
					input.id,
					input.firebaseUserUID,
				]
			);
			console.log(result);
			if(result.rowCount)
			{
				return { success: true };
			}
			return { success: false };
		} catch (err) {
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

		return { success: false };
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

			user = result.rows[0];
		} catch (err) {
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

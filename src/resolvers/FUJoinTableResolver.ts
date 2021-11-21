import { FUJoinTable } from '../entities/FUJoinTable';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { client } from '../index';
import {
	FridgesResponse,
	FUResponse,
	UsersResponse,
} from '../utils/objectTypes/objectTypes';
import { User } from '../entities/User';
import { Fridge } from '../entities/Fridge';

@Resolver(FUJoinTable)
export class FUJoinTableResolver {
	@Mutation(() => FUResponse)
	async createFUJoinTable(
		@Arg('userId') userId: number,
		@Arg('fridgeId') fridgeId: number
	): Promise<FUResponse> {
		let fuTable;

		try {
			const result = await client.query(
				'INSERT INTO fu_join_table ("userId", "fridgeId") VALUES ($1, $2) RETURNING *',
				[userId, fridgeId]
			);

			fuTable = result.rows[0];
		} catch (err) {
			// this will handle when userId and fridgeId don't exist
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

		return { fuTable };
	}

	@Query(() => UsersResponse)
	async getFridgeUsers(
		@Arg('fridgeId') fridgeId: number
	): Promise<UsersResponse> {
		let users;

		const fridge = await Fridge.findOne(fridgeId);

		if (!fridge) {
			return {
				errors: [
					{
						field: 'fridge',
						message: "can't find the fridge",
					},
				],
			};
		}

		try {
			const result = await client.query(
				`SELECT *
					FROM public.users
					INNER JOIN public.fu_join_table ON fu_join_table."userId" = users.id
					WHERE fu_join_table."fridgeId" = $1;
					`,
				[fridgeId]
			);

			users = result.rows;
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

		return { users };
	}

	@Query(() => FridgesResponse)
	async getUserFridges(
		@Arg('userId') userId: number
	): Promise<FridgesResponse> {
		let fridges;

		const user = await User.findOne(userId);
		if (!user) {
			return {
				errors: [
					{
						field: 'user',
						message: "can't find the user",
					},
				],
			};
		}

		try {
			const result = await client.query(
				`SELECT *
				FROM public.fridges
				INNER JOIN public.fu_join_table ON fu_join_table."fridgeId" = fridges.id
				WHERE fu_join_table."userId" = $1;
				`,
				[userId]
			);

			fridges = result.rows;
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

		return { fridges };
	}
}

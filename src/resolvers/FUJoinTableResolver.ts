import { FUJoinTable } from '../entities/FUJoinTable';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { client } from '../index';
import {
	DeleteResponse,
	FridgesResponse,
	FUResponse,
	UsersResponse,
} from '../utils/objectTypes/objectTypes';
import { User } from '../entities/User';
import { Fridge } from '../entities/Fridge';

@Resolver(FUJoinTable)
export class FUJoinTableResolver {
	/**
	 * Creates a link between a user and a fridge
	 *
	 * @param userId id of the user
	 * @param fridgeId id of the fridge
	 * @return the link created or errors if any
	 */
	@Mutation(() => FUResponse)
	async createFU(
		@Arg('userId') userId: number,
		@Arg('fridgeId') fridgeId: number
	): Promise<FUResponse> {
		let fu;

		try {
			const result = await client.query(
				'INSERT INTO fu_join_table ("userId", "fridgeId") VALUES ($1, $2) RETURNING *',
				[userId, fridgeId]
			);

			fu = result.rows[0];
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

		return { fu };
	}

	/**
	 * Deletes the link between a user and a fridge
	 * ! user must not be the fridge's owner
	 * fridge owner must transfer ownership or delete the fridge
	 *
	 * @param userId id of the user
	 * @param fridgeId id of the fridge
	 * @return true or false based on whether the link is deleted. Upon errors, return the array of all the errors
	 */
	@Mutation(() => DeleteResponse)
	async deleteFU(
		@Arg('userId') userId: number,
		@Arg('fridgeId') fridgeId: number
	): Promise<DeleteResponse> {
		try {
			const ownerCheck = await client.query(
				`
				SELECT "ownerId"
				FROM public.fridges
				WHERE fridges.id = $1
				`,
				[fridgeId]
			);

			if (ownerCheck.rows[0]?.ownerId === userId) {
				return {
					deleted: false,
					errors: [
						{
							field: 'fu',
							message:
								'the owner cannot leave the fridge. Please delete the fridge instead',
						},
					],
				};
			}

			// delete FU
			const deleteFU = await client.query(
				`
				DELETE FROM public.fu_join_table
				WHERE fu_join_table."userId" = $1 AND fu_join_table."fridgeId" = $2
				`,
				[userId, fridgeId]
			);

			if (deleteFU.rowCount > 0) {
				return { deleted: true };
			} else {
				return {
					deleted: false,
					errors: [
						{
							field: 'fu',
							message: "nothing was deleted. This fu link doesn't exist",
						},
					],
				};
			}
		} catch (err) {
			return {
				deleted: false,
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
	}

	/**
	 * Returns all users of a fridge
	 *
	 * @param fridgeId id of the fridge
	 * @return an array of users. Upon errors, return the array of all the errors
	 */
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

	/**
	 * Returns all fridges of a user
	 *
	 * @param userId id of the user
	 * @return an array of fridges. Upon errors, return the array of all the errors
	 */
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

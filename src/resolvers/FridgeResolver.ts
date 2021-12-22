import { Fridge } from '../entities/Fridge';
import { User } from '../entities/User';
import { Arg, Mutation, Resolver } from 'type-graphql';
import { client } from '../index';
import {
	BooleanResponse,
	FridgeResponse,
} from '../utils/objectTypes/objectTypes';
import { deleteItemById, postGresError } from './helpers/sharedFunctions';

@Resolver(Fridge)
export class FridgeResolver {
	/**
	 * Creates a fridge with an owner. Also creates a FU for the owner and the fridge.
	 * ! In case the fridge was created but FU wasn't created, delete the fridge and return error
	 *
	 * @param name name of the new fridge
	 * @param ownerId id of the user(owner) of this fridge
	 * @return newly created fridge. Upon errors, return the array of all the errors
	 */
	@Mutation(() => FridgeResponse)
	async createFridge(
		@Arg('name') name: string,
		@Arg('ownerId') ownerId: number
	): Promise<FridgeResponse> {
		let fridge;
		let fu;
		const user = await User.findOne(ownerId);

		if (!user) {
			return {
				errors: [
					{
						field: 'user',
						message: "can't find the creator",
					},
				],
			};
		}

		try {
			const createFridge = await client.query(
				'INSERT INTO fridges ("name", "ownerId") VALUES ($1, $2) RETURNING *',
				[name, ownerId]
			);

			fridge = createFridge.rows[0];

			fu = await client.query(
				'INSERT INTO fridge_user_table ("userId", "fridgeId") VALUES ($1, $2) RETURNING *',
				[ownerId, fridge.id]
			);
		} catch (err) {
			if (!fu && fridge) {
				try {
					await client.query(
						`
							DELETE FROM public.fridges
							WHERE fridges."id" = $1
							`,
						[fridge.id]
					);
				} catch (err) {
					return {
						errors: [
							{
								field: 'fridge',
								message:
									'a fridge was created without an owner, so we deleted the invalid fridge. Please check the owner ID',
							},
						],
					};
				}
			}
			return {
				errors: postGresError(err),
			};
		}

		return { fridge };
	}

	/**
	 * Deletes a fridge
	 *
	 * @param fridgeId id of the fridge
	 * @return true/false based on whether deleted. Upon errors, return the array of all the errors
	 */
	@Mutation(() => BooleanResponse)
	async deleteFridge(
		@Arg('fridgeId') fridgeId: number
	): Promise<BooleanResponse> {
		return await deleteItemById(fridgeId, 'fridges');
	}

	/**
	 * Transfers fridge's owner
	 * ! The new owner must already be a member of the fridge
	 *
	 * @param fridgeId id of the fridge
	 * @param newOwnerId id of the new owner, this user must already be a member of the fridge
	 * @return true or false based on whether the owner is updated. Upon errors, return the array of all the errors
	 */
	@Mutation(() => BooleanResponse)
	async transferFridgeOwner(
		@Arg('fridgeId') fridgeId: number,
		@Arg('newOwnerId') newOwnerId: number
	): Promise<BooleanResponse> {
		try {
			const findFu = await client.query(
				`
				SELECT * FROM public.fridge_user_table WHERE fridge_user_table."fridgeId" = $1 AND fridge_user_table."userId" = $2
				`,
				[fridgeId, newOwnerId]
			);

			if (findFu.rowCount != 1) {
				return {
					success: false,
					errors: [
						{
							field: 'fu',
							message:
								'this fu combination does not exist. Make sure the user and the fridge exist. If they do, add the user to the fridge',
						},
					],
				};
			}

			const changeOwner = await client.query(
				`
				UPDATE public.fridges
				SET "ownerId" = $2
				WHERE id = $1;
				`,
				[fridgeId, newOwnerId]
			);

			if (changeOwner.rowCount > 0) {
				return { success: true };
			} else {
				return {
					success: false,
					errors: [
						{
							field: 'fridge',
							message: "nothing was updated. This fridge or user don't exist",
						},
					],
				};
			}
		} catch (err) {
			console.log(err);
			return {
				success: false,
				errors: postGresError(err),
			};
		}
	}
}

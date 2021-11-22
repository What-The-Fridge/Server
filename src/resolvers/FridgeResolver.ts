import { Fridge } from '../entities/Fridge';
import { User } from '../entities/User';
import { Arg, Mutation, Resolver } from 'type-graphql';
import { client } from '../index';
import { FridgeResponse } from '../utils/objectTypes/objectTypes';

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
				'INSERT INTO fu_join_table ("userId", "fridgeId") VALUES ($1, $2) RETURNING *',
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
								message: 'a fridge was created without an owner',
							},
						],
					};
				}
			}
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

		return { fridge };
	}
}

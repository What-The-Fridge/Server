import { Fridge } from '../entities/Fridge';
import { User } from '../entities/User';
import { Arg, Mutation, Resolver } from 'type-graphql';
import { client } from '../index';
import { FridgeResponse } from '../utils/objectTypes/objectTypes';

@Resolver(Fridge)
export class FridgeResolver {
	@Mutation(() => FridgeResponse)
	async createFridge(
		@Arg('name') name: string,
		@Arg('ownerId') ownerId: number
	): Promise<FridgeResponse> {
		let fridge;
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
			const result = await client.query(
				'INSERT INTO fridges ("name", "ownerId") VALUES ($1, $2) RETURNING *',
				[name, ownerId]
			);

			fridge = result.rows[0];
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

		return { fridge };
	}
}

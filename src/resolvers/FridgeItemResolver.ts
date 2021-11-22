import { FridgeItem } from '../entities/FridgeItem';
import { Arg, Mutation, Resolver } from 'type-graphql';
import {
	FridgeItemInput,
	FridgeItemResponse,
} from '../utils/objectTypes/objectTypes';
import { client } from '../index';

@Resolver(FridgeItem)
export class FridgeItemResolver {
	@Mutation(() => FridgeItemResponse)
	async createFridgeItem(
		@Arg('input') input: FridgeItemInput
	): Promise<FridgeItemResponse> {
		console.log('here');
		let fridgeItem;
		try {
			const createFridgeItem = await client.query(
				'INSERT INTO "fridgeItems" ("name", "fridgeId") VALUES ($1, $2) RETURNING *',
				[input.name, input.fridgeId]
			);

			fridgeItem = createFridgeItem.rows[0];
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

		return { fridgeItem };
	}
}

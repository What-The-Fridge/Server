import { FridgeItem } from '../entities/FridgeItem';
import { Arg, Mutation, Resolver } from 'type-graphql';
import {
	BooleanResponse,
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

	@Mutation(() => BooleanResponse)
	async deleteFridgeItem(
		@Arg('itemId') itemId: number
	): Promise<BooleanResponse> {
		try {
			const deleteFridge = await client.query(
				`
				DELETE FROM public."fridgeItems"
				WHERE "fridgeItems".id = $1
				`,
				[itemId]
			);

			if (deleteFridge.rowCount > 0) {
				return { success: true };
			} else {
				return {
					success: false,
					errors: [
						{
							field: 'fridgeItem',
							message: "nothing was deleted. This fridgeItem doesn't exist",
						},
					],
				};
			}
		} catch (err) {
			console.log(err);
			return {
				success: false,
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
}

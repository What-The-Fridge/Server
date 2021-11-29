import { FridgeItem } from '../entities/FridgeItem';
import { Arg, Mutation, Resolver } from 'type-graphql';
import {
	BooleanResponse,
	FridgeItemInput,
	FridgeItemResponse,
} from '../utils/objectTypes/objectTypes';
import { client } from '../index';
import { deleteItemById } from './helpers/sharedFunctions';
import { fetchItemInfoByUPC } from './helpers/fridgeItemHelper';
@Resolver(FridgeItem)
export class FridgeItemResolver {
	@Mutation(() => FridgeItemResponse)
	async createFridgeItem(
		@Arg('input') input: FridgeItemInput
	): Promise<FridgeItemResponse> {
		const itemInfo = await fetchItemInfoByUPC(input.upc);

		let fridgeItem;
		try {
			const createFridgeItem = await client.query(
				`
				INSERT INTO "fridgeItems" ("name", "fridgeId", "upc", "quantity", "purchasedDate", "expiryDate", "imgUrl", "measurementTypeId") 
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
				`,
				[
					itemInfo
						? `${itemInfo.food_name} - ${itemInfo.brand_name}`
						: input.name,
					input.fridgeId,
					itemInfo ? input.upc : null,
					input.quantity,
					input.purchasedDate,
					input.expiryDate,
					itemInfo ? itemInfo.photo.thumb : input.imgUrl,
					input.measurementTypeId,
				]
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
		return await deleteItemById(itemId, 'fridgeItems');
	}
}

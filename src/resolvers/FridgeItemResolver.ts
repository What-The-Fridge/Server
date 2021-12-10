import { FridgeItem } from '../entities/FridgeItem';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import {
	BooleanResponse,
	FridgeItemInfoNutritionix,
	FridgeItemInput,
	FridgeItemResponse,
} from '../utils/objectTypes/objectTypes';
import { client } from '../index';
import { deleteItemById } from './helpers/sharedFunctions';
import { fetchItemInfoByUPC } from './helpers/fridgeItemHelper';

@Resolver(FridgeItem)
export class FridgeItemResolver {
	/**
	 * Creates a fridge item
	 *
	 * @param input contains all the fields of fridge item object
	 * E.g. input: {name: "Bananas", fridgeId: 13, upc: "06038318152", etc.}
	 * Must have fields: name, fridgeId
	 * @return newly created fridge. Upon errors, return the array of all the errors
	 */
	@Mutation(() => FridgeItemResponse)
	async createFridgeItem(
		@Arg('input') input: FridgeItemInput
	): Promise<FridgeItemResponse> {
		let fridgeItem;
		try {
			const createFridgeItem = await client.query(
				`
				INSERT INTO "fridgeItems" ("name", "fridgeId", "upc", "quantity", "purchasedDate", "expiryDate", "imgUrl", "measurementTypeId") 
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
				`,
				[
					input.name,
					input.fridgeId,
					input.upc,
					input.quantity,
					input.purchasedDate,
					input.expiryDate,
					input.imgUrl,
					input.measurementTypeId,
				]
			);

			fridgeItem = createFridgeItem.rows[0];
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

		return { fridgeItem };
	}

	/**
	 * Deletes a fridge item
	 *
	 * @param itemId Id of the fridge item to be deleted
	 * @return true/false based on whether deleted. Upon errors, return the array of all the errors
	 */
	@Mutation(() => BooleanResponse)
	async deleteFridgeItem(
		@Arg('itemId') itemId: number
	): Promise<BooleanResponse> {
		return await deleteItemById(itemId, 'fridgeItems');
	}

	/**
	 * Fetches data from Nutritrionix API
	 *
	 * @param upc 12 digits from the barcode
	 * @return fridge item's info
	 * E.g
	 * {name: "Bananas", brandName: "No Name", imgUrl: "http://www.image.com", ingredients: "flour, eggs, etc."}
	 */
	@Query(() => FridgeItemInfoNutritionix)
	async getItemInfoNutritionix(
		@Arg('upc') upc: string
	): Promise<FridgeItemInfoNutritionix> {
		const itemInfo = await fetchItemInfoByUPC(upc);

		if (itemInfo) {
			return {
				fridgeItemInfo: {
					name: itemInfo.food_name,
					brandName: itemInfo.brand_name,
					imgUrl: itemInfo.photo.thumb,
					ingredients: itemInfo.nf_ingredient_statement,
				},
			};
		} else {
			return {
				errors: [
					{
						field: 'upc',
						message: 'upc does not exist in our database',
					},
				],
			};
		}
	}
}

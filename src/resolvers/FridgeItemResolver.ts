import { FridgeItem } from '../entities/FridgeItem';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import {
	BooleanResponse,
	FridgeItemInfoNutritionix,
	FridgeItemInput,
	FridgeItemResponse,
	FridgeItemsResponse,
} from '../utils/objectTypes/objectTypes';
import { client } from '../index';
import { deleteItemById } from './helpers/sharedFunctions';
import {
	createFridgeItem,
	createFridgeItemInfo,
	fetchItemInfoByUPC,
} from './helpers/fridgeItemHelper';
import { MyContext } from 'src/utils/context/MyContext';
import { fridgeUserLinkExists } from './helpers/FridgeUserTableHelper';

@Resolver(FridgeItem)
export class FridgeItemResolver {
	/**
	 * Creates a fridge item
	 *
	 * @param input contains all the fields of fridgeItem object
	 * E.g. input: {name: "Bananas", fridgeId: 13, upc: "06038318152", etc.}
	 * Must have fields: name, fridgeId, userId
	 * @return newly created fridgeItem. Upon errors, return the array of all the errors
	 */
	@Mutation(() => FridgeItemResponse)
	async createFridgeItem(
		@Arg('input') input: FridgeItemInput,
		@Ctx() { upc_user_constraint }: MyContext
	): Promise<FridgeItemResponse> {
		try {
			// check if the user is in the Fridge organization before fridge item creation
			const fuExists = await fridgeUserLinkExists(input.fridgeId, input.userId);
			if (fuExists.success !== true) {
				return { errors: fuExists.errors };
			}

			const fridgeItemInfo = await createFridgeItemInfo(
				input,
				upc_user_constraint
			);

			if (
				fridgeItemInfo.errors === undefined &&
				fridgeItemInfo.fridgeItemInfo !== undefined
			) {
				const fridgeItem = await createFridgeItem(
					fridgeItemInfo.fridgeItemInfo.id,
					input
				);

				if (
					fridgeItem.errors === undefined &&
					fridgeItem.detailedFridgeItem !== undefined
				) {
					fridgeItem.detailedFridgeItem.name =
						fridgeItemInfo.fridgeItemInfo.name;
					fridgeItem.detailedFridgeItem.upc = fridgeItemInfo.fridgeItemInfo.upc;
					fridgeItem.detailedFridgeItem.imgUrl =
						fridgeItemInfo.fridgeItemInfo.imgUrl;
					fridgeItem.detailedFridgeItem.userId =
						fridgeItemInfo.fridgeItemInfo.userId;
					fridgeItem.detailedFridgeItem.measurementTypeId =
						fridgeItemInfo.fridgeItemInfo.measurementTypeId;
					return fridgeItem;
				} else {
					return { errors: fridgeItem.errors };
				}
			} else {
				return { errors: fridgeItemInfo.errors };
			}
		} catch (err) {
			// should never reach here
			// unless there is an error with calling the 2 helpers functions
			return {
				errors: [
					{
						field: 'unknown',
						message: err,
					},
				],
			};
		}
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

	/**
	 * Fetches all fridge items from a certain fridge
	 *
	 * @param fridgeId the id of the fridge
	 * @return all fridge items of the fridge with the specified fridgeId
	 */
	@Query(() => FridgeItemsResponse)
	async getFridgeFridgeItems(
		@Arg('fridgeId') fridgeId: number
	): Promise<FridgeItemsResponse> {
		let fridgeItems;
		try {
			const getFridgeItems = await client.query(
				`
				SELECT *
				FROM public."fridgeItems"
				FULL OUTER JOIN public."fridgeItemInfo"
				ON "fridgeItems"."fridgeItemInfoId" = "fridgeItemInfo"."id"
				WHERE "fridgeItems"."fridgeId" = $1
				ORDER BY "fridgeItems"."id";
				`,
				[fridgeId]
			);
			if (getFridgeItems == undefined) {
				return {
					errors: [
						{
							field: 'table: fridgeItems',
							message: 'database returned undefined',
						},
					],
				};
			}

			fridgeItems = getFridgeItems.rows;
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
		return { fridgeItems: fridgeItems };
	}
}

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
import { deleteItemById, postGresError } from './helpers/sharedFunctions';
import {
	createFridgeItem,
	createFridgeItemInfo,
	fetchItemInfoByUPC,
} from './helpers/fridgeItemHelper';
import { MyContext } from 'src/utils/context/MyContext';
import { fridgeUserLinkExists } from './helpers/FridgeUserTableHelper';
import { getMeasurementTypeById } from './helpers/measurementTypeHelper';
import { clearFridgeItems } from './helpers/fridgeHelper';

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

				let measurementType = await getMeasurementTypeById(
					fridgeItemInfo.fridgeItemInfo.measurementTypeId
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
					fridgeItem.detailedFridgeItem.measurement =
						measurementType.measurementType!.measurement;
					fridgeItem.detailedFridgeItem.measurementUnit =
						measurementType.measurementType!.measurementUnit;
					return { detailedFridgeItem: fridgeItem.detailedFridgeItem };
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
		try {
			const getFridgeItemInfoId = await client.query(
				`
					SELECT * FROM public."fridgeItems" WHERE "fridgeItems"."id"=$1;
				`,
				[itemId]
			);

			if (getFridgeItemInfoId.rowCount == 1) {
				const deleteItem = await deleteItemById(itemId, 'fridgeItems');

				if (!deleteItem.success) return deleteItem;

				// TODO: more testing
				try {
					await client.query(
						`
						DELETE FROM public."fridgeItemInfo" WHERE "fridgeItemInfo".id = $1 AND "fridgeItemInfo".upc IS NULL;
					`,
						[getFridgeItemInfoId.rows[0].fridgeItemInfoId]
					);

					return { success: true };
				} catch (err) {
					return {
						errors: postGresError(err),
					};
				}
			} else {
				return {
					errors: [
						{
							field: 'fridgeItems',
							message: 'fridgeItem does not exist',
						},
					],
				};
			}
		} catch (err) {
			return {
				errors: postGresError(err),
			};
		}
	}

	/**
	 * Updates a fridge item
	 *
	 * @param input contains all the fields of fridgeItem object
	 * E.g. input: {name: "Bananas", fridgeId: 13, upc: "06038318152", etc.}
	 *
	 * @return true/false based on whether updated. Upon errors, return the array of all the errors
	 */
	@Mutation(() => BooleanResponse)
	async updateFridgeItem(
		@Arg('input') input: FridgeItemInput,
		@Arg('fridgeItemId') fridgeItemId: Number
	): Promise<BooleanResponse> {
		try {
			const updateFridgeItem = await client.query(
				`
				UPDATE public."fridgeItems"
				SET 
					quantity = $1,
					"purchasedDate" = $2,
					"expiryDate" = $3
				WHERE "fridgeItems"."id" = $4
				RETURNING *;
				`,
				[input.quantity, input.purchasedDate, input.expiryDate, fridgeItemId]
			);

			if (updateFridgeItem.rowCount !== 1) {
				return {
					errors: [
						{
							field: 'table: fridgeItems',
							message: 'cannot find such item to update',
						},
					],
				};
			}

			const updateFridgeItemInfo = await client.query(
				`
				UPDATE public."fridgeItemInfo"
				SET 
					name = $1,
					upc = $2,
					"imgUrl" = $3,
					"measurementTypeId" = $4
				WHERE "fridgeItemInfo"."id" = $5
				RETURNING *;
				`,
				[
					input.name,
					input.upc,
					input.imgUrl,
					input.measurementTypeId,
					updateFridgeItem.rows[0].fridgeItemInfoId,
				]
			);

			if (updateFridgeItemInfo.rowCount !== 1) {
				return {
					errors: [
						{
							field: 'table: fridgeItemInfo',
							message: 'error while updating the fridge item info',
						},
					],
				};
			}

			return { success: true };
		} catch (err) {
			return {
				errors: postGresError(err),
			};
		}
	}

	/**
	 * Deletes all fridge items of a fridge
	 * TODO: more testing needed
	 *
	 * @param fridgeId Id of the fridge
	 * @return true/false based on whether deleted. Upon errors, return the array of all the errors
	 */
	@Mutation(() => BooleanResponse)
	async clearFridgeItems(
		@Arg('fridgeId') fridgeId: number
	): Promise<BooleanResponse> {
		return clearFridgeItems(fridgeId);
	}

	/**
	 * Fetches a fridge item with a certain id
	 *
	 * @param id the id of the fridgeItem
	 * @return info of the fridge item with the specified id
	 */
	@Query(() => FridgeItemResponse)
	async getFridgeItemById(@Arg('id') id: number): Promise<FridgeItemResponse> {
		let detailedFridgeItem;
		try {
			const getFridgeItem = await client.query(
				`
				SELECT fi.*,
				fii.id as "fridgeItemInfoId", fii.name, fii.upc, fii."imgUrl", fii."userId",
				mt."id" as "measurementTypeId", mt.measurement, mt."measurementUnit"
				FROM public."fridgeItems" as fi
				FULL OUTER JOIN public."fridgeItemInfo" as fii ON fi."fridgeItemInfoId" = fii."id"
				FULL OUTER JOIN public."measurement_type" as mt ON fii."measurementTypeId" = mt."id"
				WHERE fi."id" = $1
				`,
				[id]
			);

			if (getFridgeItem == undefined) {
				return {
					errors: [
						{
							field: 'table: fridgeItems',
							message: 'database returned undefined',
						},
					],
				};
			}

			if (getFridgeItem.rows[0] == null) {
				return {
					errors: [
						{
							field: 'table: fridgeItems',
							message: 'cannot find such item',
						},
					],
				};
			}

			detailedFridgeItem = getFridgeItem.rows[0];
		} catch (err) {
			return {
				errors: postGresError(err),
			};
		}
		return { detailedFridgeItem };
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
				SELECT fi.*,
				fii.id as "fridgeItemInfoId", fii.name, fii.upc, fii."imgUrl", fii."userId",
				mt."id" as "measurementTypeId", mt.measurement, mt."measurementUnit"
				FROM public."fridgeItems" as fi
				FULL OUTER JOIN public."fridgeItemInfo" as fii ON fi."fridgeItemInfoId" = fii."id"
				FULL OUTER JOIN public."measurement_type" as mt ON fii."measurementTypeId" = mt."id"
				WHERE fi."fridgeId" = $1
				ORDER BY fi."id";
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
				errors: postGresError(err),
			};
		}
		return { fridgeItems: fridgeItems };
	}
}

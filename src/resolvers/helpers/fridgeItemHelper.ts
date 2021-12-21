import axios from 'axios';
import { client } from '../../index';
import {
	FridgeItemInfoResponse,
	FridgeItemInput,
	FridgeItemResponse,
} from 'src/utils/objectTypes/objectTypes';

/**
 * Fetch fridge/food item info through UPC
 * TODO: handle the err
 * @param upc barcode number of the item
 * @return itemInfo in JSON formatted string if success, otherwise return false
 */
export async function fetchItemInfoByUPC(upc: string): Promise<false | any> {
	if (!upc) {
		return false;
	}

	const url = `https://trackapi.nutritionix.com/v2/search/item?upc=${upc}`;

	const config = {
		headers: {
			'x-app-id': process.env.XAPPID!,
			'x-app-key': process.env.XAPPKEY!,
		},
	};

	try {
		const itemInfo: any = await axios.get(url, config);

		if (itemInfo.data?.foods[0]) {
			return itemInfo.data?.foods[0];
		} else {
			console.log('empty food item returned from API');
			return false;
		}
	} catch (err) {
		return false;
	}
}

/**
 * Create an entry in fridgeItemInfo table
 * TODO: in case the fridgeItemInfo with specified upc already exists, we should update & use the existing one
 * TODO: make the combination of userId & upc unique
 * @param input contains all the fields of fridgeItem object
 * (fridgeItem object contains all fields from both fridgeItem and fridgeItemInfo tables)
 * E.g. input: {name: "Bananas", fridgeId: 13, upc: "06038318152", etc.}
 * Must have fields: name, fridgeId, and measurementTypeId
 * @return newly created fridgeItemInfo. Upon errors, return the array of all the errors
 */
export async function createFridgeItemInfo(
	input: FridgeItemInput
): Promise<FridgeItemInfoResponse> {
	try {
		const createFridgeItemInfo = await client.query(
			`
			INSERT INTO "fridgeItemInfo" ("name", "upc", "imgUrl", "userId", "measurementTypeId")
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (upc) DO UPDATE 
				SET "name" = EXCLUDED."name", 
						"upc" = EXCLUDED."upc",
						"imgUrl" = EXCLUDED."imgUrl",
						"userId" = EXCLUDED."userId",
						"measurementTypeId" = EXCLUDED."measurementTypeId"
			RETURNING *
			`,
			[
				input.name,
				input.upc,
				input.imgUrl,
				input.userId,
				input.measurementTypeId,
			]
		);

		if (
			createFridgeItemInfo.rowCount == 1 &&
			createFridgeItemInfo.rows[0] != undefined
		) {
			return { fridgeItemInfo: createFridgeItemInfo.rows[0] };
		} else {
			return {
				errors: [
					{
						field: 'fridgeItemInfo',
						message:
							"although query went through, fridgeItemInfo wasn't created'",
					},
				],
			};
		}
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
}

/**
 * Create an entry in fridgeItem table
 *
 * @param input contains all the fields of fridgeItem object
 * E.g. input: {name: "Bananas", fridgeId: 13, upc: "06038318152", etc.}
 * (fridgeItem object contains all fields from both fridgeItem and fridgeItemInfo tables)
 * Must have fields: name, fridgeId, and measurementTypeId
 * @return newly created fridgeItem. Upon errors, return the array of all the errors
 */
export async function createFridgeItem(
	fridgeItemInfoId: number,
	input: FridgeItemInput
): Promise<FridgeItemResponse> {
	try {
		const createFridgeItem = await client.query(
			`
			INSERT INTO "fridgeItems" ("fridgeItemInfoId", "fridgeId", "quantity", "purchasedDate", "expiryDate") 
			VALUES ($1, $2, $3, $4, $5)
			RETURNING *
			`,
			[
				fridgeItemInfoId,
				input.fridgeId,
				input.quantity,
				input.purchasedDate,
				input.expiryDate,
			]
		);

		if (
			createFridgeItem.rowCount == 1 &&
			createFridgeItem.rows[0] != undefined
		) {
			return { detailedFridgeItem: createFridgeItem.rows[0] };
		} else {
			return {
				errors: [
					{
						field: 'fridgeItemInfo',
						message:
							"although query went through, fridgeItemInfo wasn't created'",
					},
				],
			};
		}
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
}

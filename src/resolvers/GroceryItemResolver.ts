import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import {
	BooleanResponse,
	DetailedGroceryItemResponse,
	DetailedGroceryItemsResponse,
	GroceryItemInput,
	GroceryItemResponse,
} from '../utils/objectTypes/objectTypes';
import { client } from '../index';
import { deleteItemById, postGresError } from './helpers/sharedFunctions';
import { GroceryItem } from '../entities/GroceryItem';

@Resolver(GroceryItem)
export class GroceryItemResolver {
	@Mutation(() => GroceryItemResponse)
	async createGroceryItem(
		@Arg('input') input: GroceryItemInput
	): Promise<GroceryItemResponse> {
		try {
			const createGroceryItem = await client.query(
				`
        INSERT INTO "groceryItems" 
        ("groceryListId", "quantity", "name", "upc", "imgUrl", "userId", "measurementTypeId") 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
				[
					input.groceryListId,
					input.quantity,
					input.name,
					input.upc,
					input.imgUrl,
					input.userId,
					input.measurementTypeId,
				]
			);

			if (
				createGroceryItem.rowCount == 1 &&
				createGroceryItem.rows[0] != undefined
			) {
				return { groceryItem: createGroceryItem.rows[0] };
			} else {
				return {
					errors: [
						{
							field: 'groceryItems',
							message:
								"although query went through, groceryItem wasn't created'",
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

	@Mutation(() => BooleanResponse)
	async deleteGroceryItem(
		@Arg('groceryItemId') groceryItemId: number
	): Promise<BooleanResponse> {
		return await deleteItemById(groceryItemId, 'groceryItems');
	}

	@Mutation(() => BooleanResponse)
	async updateGroceryItem(
		@Arg('input') input: GroceryItemInput,
		@Arg('groceryItemId') groceryItemId: Number
	): Promise<BooleanResponse> {
		try {
			const updateGroceryItemInfo = await client.query(
				`
				UPDATE public."groceryItems"
				SET 
					name = $1,
					upc = $2,
					"imgUrl" = $3,
          quantity = $4,
					"measurementTypeId" = $5
				WHERE "groceryItems"."id" = $6
				RETURNING *;
				`,
				[
					input.name,
					input.upc,
					input.imgUrl,
					input.quantity,
					input.measurementTypeId,
					groceryItemId,
				]
			);

			if (updateGroceryItemInfo.rowCount !== 1) {
				return {
					success: false,
					errors: [
						{
							field: 'table: groceryItems',
							message: 'error while updating the grocery item',
						},
					],
				};
			}

			return { success: true };
		} catch (err) {
			return {
				success: false,
				errors: postGresError(err),
			};
		}
	}

	@Query(() => DetailedGroceryItemsResponse)
	async getGroceryListGroceryItems(
		@Arg('groceryListId') groceryListId: number
	): Promise<DetailedGroceryItemsResponse> {
		try {
			let groceryItems;
			const result = await client.query(
				`
        SELECT "groceryItems".*, measurement_type."measurementUnit"
        FROM public."groceryItems"
        FULL OUTER JOIN public.measurement_type ON "groceryItems"."measurementTypeId" = measurement_type."id"
        WHERE "groceryItems"."groceryListId" = $1;
				`,
				[groceryListId]
			);

			groceryItems = result.rows;

			if (groceryItems) {
				return { groceryItems: groceryItems };
			}

			return {
				errors: [
					{
						field: 'groceryItems',
						message: "can't fetch grocery items of this list",
					},
				],
			};
		} catch (err) {
			return {
				errors: postGresError(err),
			};
		}
	}

	@Query(() => DetailedGroceryItemResponse)
	async getGroceryItemById(
		@Arg('id') id: number
	): Promise<DetailedGroceryItemResponse> {
		let detailedGroceryItem;
		try {
			const getGroceryItem = await client.query(
				`
				SELECT "groceryItems".*, measurement_type."measurementUnit"
        FROM public."groceryItems"
        FULL OUTER JOIN public.measurement_type ON "groceryItems"."measurementTypeId" = measurement_type."id"
        WHERE "groceryItems"."id" = $1;
				`,
				[id]
			);

			if (getGroceryItem == undefined) {
				return {
					errors: [
						{
							field: 'table: groceryItems',
							message: 'database returned undefined',
						},
					],
				};
			}

			if (getGroceryItem.rows[0] == null) {
				return {
					errors: [
						{
							field: 'table: groceryItems',
							message: 'cannot find such item',
						},
					],
				};
			}

			detailedGroceryItem = getGroceryItem.rows[0];
		} catch (err) {
			return {
				errors: postGresError(err),
			};
		}
		return { detailedGroceryItem };
	}
}

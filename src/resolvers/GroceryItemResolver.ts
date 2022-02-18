import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import {
	BooleanResponse,
	GroceryItemInput,
	GroceryItemResponse,
	GroceryItemsResponse,
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

	@Query(() => GroceryItemsResponse)
	async getGroceryListGroceryItems(
		@Arg('groceryListId') groceryListId: number
	): Promise<GroceryItemsResponse> {
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

			console.log(groceryItems);
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
}

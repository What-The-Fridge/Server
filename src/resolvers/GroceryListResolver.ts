import { GroceryList } from '../entities/GroceryList';
import { User } from '../entities/User';
import {
	Arg,
	Mutation,
	Resolver,
	// UseMiddleware,
} from 'type-graphql';
import { client } from '../index';
import {
	BooleanResponse,
	GroceryListResponse,
} from '../utils/objectTypes/objectTypes';
import { deleteItemById, postGresError } from './helpers/sharedFunctions';

@Resolver(GroceryList)
export class GroceryListResolver {
	/**
	 * Creates a groceryList with an owner. Also creates a GLU for the owner and the groceryList.
	 * ! In case the groceryList was created but GLU wasn't created, delete the groceryList and return error
	 *
	 * @param name name of the new groceryList
	 * @param ownerId id of the user(owner) of this groceryList
	 * @return newly created groceryList. Upon errors, return the array of all the errors
	 */
	@Mutation(() => GroceryListResponse)
	async createGroceryList(
		@Arg('name') name: string,
		@Arg('ownerId') ownerId: number
	): Promise<GroceryListResponse> {
		let groceryList;
		let glu;
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
			const createGroceryList = await client.query(
				'INSERT INTO "groceryLists" ("name", "ownerId") VALUES ($1, $2) RETURNING *',
				[name, ownerId]
			);

			groceryList = createGroceryList.rows[0];

			glu = await client.query(
				'INSERT INTO "groceryList_user_table" ("userId", "groceryListId") VALUES ($1, $2) RETURNING *',
				[ownerId, groceryList.id]
			);
		} catch (err) {
			if (!glu && groceryList) {
				try {
					await client.query(
						`
							DELETE FROM public."groceryLists"
							WHERE "groceryLists"."id" = $1
							`,
						[groceryList.id]
					);
				} catch (err) {
					return {
						errors: [
							{
								field: 'groceryLists',
								message:
									'a grocery list was created without an owner, so we deleted the invalid list. Please check the owner ID',
							},
						],
					};
				}
			}
			return {
				errors: postGresError(err),
			};
		}

		return { groceryList };
	}

	/**
	 * Deletes a grocery list
	 *
	 * @param groceryListId id of the grocery list
	 * @return true/false based on whether deleted. Upon errors, return the array of all the errors
	 */
	@Mutation(() => BooleanResponse)
	async deleteGroceryList(
		@Arg('groceryListId') groceryListId: number
	): Promise<BooleanResponse> {
		try {
			const clearGroceryList = await client.query(
				`
				DELETE FROM public."groceryItems" 
				WHERE "groceryItems"."groceryListId"= $1;
				`,
				[groceryListId]
			);

			if (!clearGroceryList) {
				return {
					errors: [
						{
							field: 'groceryLists',
							message: 'could not clear all the items of the grocery list',
						},
					],
				};
			}
		} catch (err) {
			return {
				errors: postGresError(err),
			};
		}

		return await deleteItemById(groceryListId, 'groceryLists');
	}
}

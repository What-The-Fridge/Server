import { GroceryListUserTable } from '../entities/GroceryListUserTable';
import { Arg, Query, Resolver } from 'type-graphql';
import { client } from '../index';
import { GroceryListsResponse } from '../utils/objectTypes/objectTypes';
import { User } from '../entities/User';
import { postGresError } from './helpers/sharedFunctions';

@Resolver(GroceryListUserTable)
export class GroceryListUserTableResolver {
	/**
	 * Returns all grocery lists of a user
	 *
	 * @param userId id of the user
	 * @return an array of grocery lists. Upon errors, return the array of all the errors
	 */
	@Query(() => GroceryListsResponse)
	async getUserGroceryLists(
		@Arg('userId') userId: number
	): Promise<GroceryListsResponse> {
		let groceryLists;

		const user = await User.findOne(userId);
		if (!user) {
			return {
				errors: [
					{
						field: 'user',
						message: "can't find the user",
					},
				],
			};
		}

		try {
			const result = await client.query(
				`SELECT *
				FROM public."groceryLists"
				INNER JOIN public."groceryList_user_table" ON "groceryList_user_table"."groceryListId" = "groceryLists"."id"
				WHERE "groceryList_user_table"."userId" = $1;
				`,
				[userId]
			);

			groceryLists = result.rows;
		} catch (err) {
			return {
				errors: postGresError(err),
			};
		}

		return { groceryLists };
	}
}

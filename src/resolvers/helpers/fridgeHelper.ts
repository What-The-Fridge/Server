import { client } from '../../index';
import { BooleanResponse } from 'src/utils/objectTypes/objectTypes';
import { postGresError } from './sharedFunctions';

export async function clearFridgeItems(
	fridgeId: number
): Promise<BooleanResponse> {
	try {
		// get all the ids of the fridgeItemInfo entries that we will delete
		const getFridgeItemInfoIds = await client.query(
			`
      SELECT * FROM public."fridgeItems" WHERE "fridgeItems"."fridgeId"=$1;
    `,
			[fridgeId]
		);

		const fridgeItemInfoIds = getFridgeItemInfoIds.rows.map(element => {
			return element.fridgeItemInfoId;
		});

		// delete all the entries from the fridgeItems table
		// TODO: check the result of this
		await client.query(
			`
      DELETE FROM public."fridgeItems" WHERE "fridgeItems"."fridgeId"=$1;
    `,
			[fridgeId]
		);

		// delete all the entries from the fridgeItemInfos table
		fridgeItemInfoIds.forEach(async element => {
			await client.query(
				`
        DELETE FROM public."fridgeItemInfo" WHERE "fridgeItemInfo".id = $1 AND "fridgeItemInfo".upc IS NULL;
      `,
				[element]
			);
		});

		return { success: true };
	} catch (err) {
		return {
			errors: postGresError(err),
		};
	}
}

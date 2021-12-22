import { BooleanResponse } from '../../utils/objectTypes/objectTypes';
import { client } from '../../index';

/**
 * Check if the user is part of the fridge organization
 *
 * @param fridgeId id of the fridge organization
 * @param userId id of the user
 * @return true or false upon whether FU link exists. Upon errors, return the array of all the errors
 */
export async function fridgeUserLinkExists(
	fridgeId: number,
	userId: number
): Promise<BooleanResponse> {
	try {
		const fridgeUserLinkExists = await client.query(
			`
      SELECT *
      FROM public."fridge_user_table"
      WHERE fridge_user_table."fridgeId" = $1 AND fridge_user_table."userId" = $2;
      `,
			[fridgeId, userId]
		);

		if (fridgeUserLinkExists.rowCount === 1) {
			return { success: true };
		} else {
			return {
				success: false,
				errors: [
					{
						field: 'fridgeId, userId',
						message:
							'this user is not part of the fridge organization. User or fridge might not even exist',
					},
				],
			};
		}
	} catch (err) {
		return {
			success: false,
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

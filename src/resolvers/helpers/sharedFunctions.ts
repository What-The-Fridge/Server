import { BooleanResponse } from '../../utils/objectTypes/objectTypes';
import { client } from '../../index';

export async function deleteItemById(
	id: number,
	tableName: string
): Promise<BooleanResponse> {
	try {
		const deleteFridge = await client.query(
			`
			DELETE FROM public."${tableName}"
			WHERE "${tableName}".id = $1
			`,
			[id]
		);

		if (deleteFridge.rowCount > 0) {
			return { success: true };
		} else {
			return {
				success: false,
				errors: [
					{
						field: tableName,
						message: `nothing was deleted. This item doesn't exist in ${tableName}`,
					},
				],
			};
		}
	} catch (err) {
		console.log(err);
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

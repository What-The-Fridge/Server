import {
	BooleanResponse,
	FieldError,
} from '../../utils/objectTypes/objectTypes';
import { client } from '../../index';

export function makeErrors(fields: string[], messages: string[]): FieldError[] {
	let errors: FieldError[] = [];
	for (var i = 0; i < messages.length; i += 1) {
		errors.push({ field: fields[i], message: messages[i] });
	}
	return errors;
}

export function postGresError(err: any): FieldError[] {
	return [
		{
			field: err.detail.substring(
				err.detail.indexOf('(') + 1,
				err.detail.indexOf(')')
			),
			message: err.detail,
		},
	];
}

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
		return {
			success: false,
			errors: postGresError(err),
		};
	}
}

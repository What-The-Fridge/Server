import { client } from '../../index';
import { MeasurementTypeResponse } from 'src/utils/objectTypes/objectTypes';

export async function getMeasurementTypeById(
	id: number
): Promise<MeasurementTypeResponse> {
	let measurementTypeRes;
	try {
		measurementTypeRes = await client.query(
			`
			SELECT * FROM public."measurement_type" WHERE id = $1
			`,
			[id]
		);
	} catch (err) {
		return {
			errors: [
				{
					field: 'measurement_type',
					message: err,
				},
			],
		};
	}

	if (!measurementTypeRes) {
		return {
			errors: [
				{
					field: 'measurement_type',
					message: 'this measurement unit does not exist',
				},
			],
		};
	}

	return { measurementType: measurementTypeRes.rows[0] };
}

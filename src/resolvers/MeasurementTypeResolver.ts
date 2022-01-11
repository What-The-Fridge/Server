import { MeasurementTypesResponse } from '../utils/objectTypes/objectTypes';
import {
	Query,
	Resolver,
	// UseMiddleware,
} from 'type-graphql';
import { MeasurementType } from '../entities/MeasurementType';
import { client } from '../index';
import { postGresError } from './helpers/sharedFunctions';

@Resolver(MeasurementType)
export class MeasurementTypeResolver {
	@Query(() => MeasurementTypesResponse)
	async getAllMeasurementTypes(): Promise<MeasurementTypesResponse> {
		let measurementTypes;
		try {
			const result = await client.query(
				`
        SELECT *
				FROM public."measurement_type"
				`
			);

			measurementTypes = result.rows;
		} catch (err) {
			return {
				errors: postGresError(err),
			};
		}

		return { measurementTypes };
	}
}

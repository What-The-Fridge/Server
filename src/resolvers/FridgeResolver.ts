import { Fridge } from '../entities/Fridge';
import { User } from '../entities/User';
import { Arg, Field, Mutation, ObjectType, Resolver } from 'type-graphql';
// import { getConnection } from 'typeorm';
import { FieldError } from './UserResolver';
import { client } from '../index';

@ObjectType()
class FridgeResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => Fridge, { nullable: true })
	fridge?: Fridge;
}

@Resolver(Fridge)
export class FridgeResolver {
	@Mutation(() => FridgeResponse)
	async createFridge(
		@Arg('name') name: string,
		@Arg('ownerId') ownerId: number
	): Promise<FridgeResponse> {
		let fridge;
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
			const result = await client.query(
				'INSERT INTO fridges ("name", "ownerId") VALUES ($1, $2) RETURNING *',
				[name, ownerId]
			);

			fridge = result.rows[0];
		} catch (err) {
			console.log(err);
			return {
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

		return { fridge };
	}
}

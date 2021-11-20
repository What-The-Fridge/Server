import { FUJoinTable } from '../entities/FUJoinTable';
import { User } from '../entities/User';
import {
	Arg,
	Field,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from 'type-graphql';
import { FieldError } from './UserResolver';
import { client } from '../index';
import { Fridge } from '../entities/Fridge';
import { getConnection } from 'typeorm';

@ObjectType()
class FUResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => FUJoinTable, { nullable: true })
	fuTable?: FUJoinTable;
}

@ObjectType()
class UsersResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => FUJoinTable, { nullable: true })
	users?: User[];
}

@Resolver(FUJoinTable)
export class FUJoinTableResolver {
	@Mutation(() => FUResponse)
	async createFUJoinTable(
		@Arg('userId') userId: number,
		@Arg('fridgeId') fridgeId: number
	): Promise<FUResponse> {
		let fuTable;
		const user = await User.findOne(userId);
		const fridge = await Fridge.findOne(fridgeId);

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

		if (!fridge) {
			return {
				errors: [
					{
						field: 'user',
						message: "can't find the fridge",
					},
				],
			};
		}

		try {
			const result = await client.query(
				'INSERT INTO fu_join_table ("userId", "fridgeId") VALUES ($1, $2) RETURNING *',
				[userId, fridgeId]
			);

			fuTable = result.rows[0];
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

		return { fuTable };
	}

	@Query(() => UsersResponse)
	async getFridgeUsers(
		@Arg('fridgeId') fridgeId: number
	): Promise<UsersResponse> {
		let users;
		try {
			users = await getConnection()
				.getRepository(User)
				.createQueryBuilder('user')
				.leftJoinAndSelect('user.fridges', 'fridge')
				.getMany();
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

		return { users };
	}
}

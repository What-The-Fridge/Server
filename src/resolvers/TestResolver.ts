import { Test } from '../entities/Test';
import { Arg, Field, Mutation, ObjectType, Resolver } from 'type-graphql';
import { client } from '../index';
import { FieldError } from './UserResolver';

@ObjectType()
class TestResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => Test, { nullable: true })
	test?: Test;
}

@Resolver(Test)
export class TestResolver {
	@Mutation(() => TestResponse)
	async createTest(@Arg('hachi') hachi: string): Promise<TestResponse> {
		let test;

		try {
			const result = await client.query(
				'INSERT INTO tests ("hachi") VALUES ($1) RETURNING *',
				[hachi]
			);

			test = result.rows[0];
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

		return { test };
	}
}

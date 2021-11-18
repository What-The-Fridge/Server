// import { Test } from '../entities/Test';
// import { User } from '../entities/User';
// import { Arg, Field, Mutation, ObjectType, Resolver } from 'type-graphql';
// import client from '../index';
// import { FieldError } from './UserResolver';

// @ObjectType()
// class TestResponse {
// 	@Field(() => [FieldError], { nullable: true })
// 	errors?: FieldError[];

// 	@Field(() => Test, { nullable: true })
// 	test?: Test;
// }

// @Resolver(Test)
// export class TestResolver {
// 	@Mutation(() => TestResponse)
// 	async createTest(
// 		@Arg('name') name: string,
// 		@Arg('creatorId') creatorId: number
// 	): Promise<TestResponse> {
// 		let test;
// 		let users: User[] = [];
// 		const user = await User.findOne(creatorId);

// 		if (!user) {
// 			return {
// 				errors: [
// 					{
// 						field: 'user',
// 						message: "can't find the creator",
// 					},
// 				],
// 			};
// 		}

// 		users.push(user);

// 		try {
// 			const result = await client
// 				.createQueryBuilder()
// 				.insert()
// 				.into(Test)
// 				.values({
// 					name: name,
// 					creatorId: creatorId,
// 					users: users,
// 				})
// 				.returning('*')
// 				.execute();
// 			test = result.raw[0];
// 		} catch (err) {
// 			return {
// 				errors: [
// 					{
// 						field: err.detail.substring(
// 							err.detail.indexOf('(') + 1,
// 							err.detail.indexOf(')')
// 						),
// 						message: err.detail,
// 					},
// 				],
// 			};
// 		}

// 		return { test };
// 	}
// }

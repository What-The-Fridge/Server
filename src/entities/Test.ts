import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class Test {
	@Field()
	id!: number;

	@Field()
	hachi!: string;
}

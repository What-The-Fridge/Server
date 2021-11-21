import { Field, InputType, ObjectType } from 'type-graphql';
import { Fridge } from '../../entities/Fridge';
import { User } from '../../entities/User';
import { FUJoinTable } from '../../entities/FUJoinTable';

@InputType()
export class FridgeItemInput {
	@Field()
	name: string;
}

@ObjectType()
export class FieldError {
	@Field()
	field: string;
	@Field()
	message: string;
}

// -----------------------Resolver Response---------------------------
@ObjectType()
export class FridgeResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => Fridge, { nullable: true })
	fridge?: Fridge;
}

@ObjectType()
export class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@ObjectType()
export class FUResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => FUJoinTable, { nullable: true })
	fuTable?: FUJoinTable;
}

@ObjectType()
export class UsersResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => [User], { nullable: true })
	users?: User[];
}

@ObjectType()
export class FridgesResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => [Fridge], { nullable: true })
	fridges?: Fridge[];
}

@ObjectType()
export class ErrorResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];
}

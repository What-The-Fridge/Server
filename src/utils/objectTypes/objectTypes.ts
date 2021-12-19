import { Field, InputType, ObjectType } from 'type-graphql';
import { Fridge } from '../../entities/Fridge';
import { User } from '../../entities/User';
import { FridgeUserTable } from '../../entities/FridgeUserTable';
import { FridgeItem } from '../../entities/FridgeItem';

@InputType()
export class UserInput {
	@Field()
	firebaseUserUID!: string;

	@Field()
	firstName!: string;

	@Field()
	lastName!: string;

	@Field()
	email: string;

	@Field({ nullable: true })
	imgUrl: string;
}

@InputType()
export class FridgeItemInput {
	@Field()
	name!: string;

	@Field()
	fridgeId!: number;

	@Field({ nullable: true })
	upc: string;

	@Field({ nullable: true })
	quantity: number;

	@Field({ nullable: true })
	purchasedDate: Date;

	@Field({ nullable: true })
	expiryDate: Date;

	@Field({ nullable: true })
	imgUrl: string;

	@Field({ nullable: true })
	measurementTypeId: string;
}

@ObjectType()
export class FieldError {
	@Field()
	field: string;
	@Field()
	message: string;
}

@ObjectType()
export class FridgeItemInfo {
	@Field({ nullable: true })
	name: string;

	@Field({ nullable: true })
	brandName: string;

	@Field({ nullable: true })
	imgUrl: string;

	@Field({ nullable: true })
	ingredients: string;
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
export class FridgeItemResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => FridgeItem, { nullable: true })
	fridgeItem?: FridgeItem;
}

@ObjectType()
export class FridgeItemInfoNutritionix {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => FridgeItemInfo, { nullable: true })
	fridgeItemInfo?: FridgeItemInfo;
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

	@Field(() => FridgeUserTable, { nullable: true })
	fu?: FridgeUserTable;
}

@ObjectType()
export class UsersResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => [User], { nullable: true })
	users?: User[];
}

@ObjectType()
export class FridgeItemsResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => [FridgeItem], { nullable: true })
	fridgeItems?: FridgeItem[];
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

@ObjectType()
export class BooleanResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => Boolean)
	success?: Boolean;
}

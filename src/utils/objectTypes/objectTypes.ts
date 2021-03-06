import { Field, InputType, ObjectType } from 'type-graphql';
import { Fridge } from '../../entities/Fridge';
import { User } from '../../entities/User';
import { FridgeUserTable } from '../../entities/FridgeUserTable';
import { DetailedFridgeItem } from '../../entities/FridgeItem';
import { FridgeItemInfo } from '../../entities/FridgeItemInfo';
import { MeasurementType } from '../../entities/MeasurementType';
import { GroceryList } from '../../entities/GroceryList';
import { DetailedGroceryItem, GroceryItem } from '../../entities/GroceryItem';

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

	@Field()
	userId!: number;

	@Field()
	quantity!: number;

	@Field()
	measurementTypeId!: number;

	@Field({ nullable: true })
	upc: string;

	@Field({ nullable: true })
	imgUrl: string;

	@Field({ nullable: true })
	purchasedDate: Date;

	@Field({ nullable: true })
	expiryDate: Date;
}

@InputType()
export class GroceryItemInput {
	@Field()
	name!: string;

	@Field()
	groceryListId!: number;

	@Field()
	userId!: number;

	@Field()
	quantity!: number;

	@Field()
	measurementTypeId!: number;

	@Field({ nullable: true })
	upc: string;

	@Field({ nullable: true })
	imgUrl: string;
}

@ObjectType()
export class FieldError {
	@Field()
	field: string;
	@Field()
	message: string;
}

@ObjectType()
export class FridgeItemDetailedInfo {
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
export class FridgeItemInfoResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => FridgeItemInfo, { nullable: true })
	fridgeItemInfo?: FridgeItemInfo;
}

@ObjectType()
export class FridgeItemResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => DetailedFridgeItem, { nullable: true })
	detailedFridgeItem?: DetailedFridgeItem;
}

@ObjectType()
export class FridgeItemInfoNutritionix {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => FridgeItemDetailedInfo, { nullable: true })
	fridgeItemInfo?: FridgeItemDetailedInfo;
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
export class MeasurementTypeResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => MeasurementType, { nullable: true })
	measurementType?: MeasurementType;
}

@ObjectType()
export class GroceryListResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => GroceryList, { nullable: true })
	groceryList?: GroceryList;
}

@ObjectType()
export class GroceryItemResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => GroceryItem, { nullable: true })
	groceryItem?: GroceryItem;
}
@ObjectType()
export class DetailedGroceryItemResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => DetailedGroceryItem, { nullable: true })
	detailedGroceryItem?: DetailedGroceryItem;
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

	@Field(() => [DetailedFridgeItem], { nullable: true })
	fridgeItems?: DetailedFridgeItem[];
}

@ObjectType()
export class FridgesResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => [Fridge], { nullable: true })
	fridges?: Fridge[];
}

@ObjectType()
export class GroceryListsResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => [GroceryList], { nullable: true })
	groceryLists?: GroceryList[];
}

@ObjectType()
export class MeasurementTypesResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => [MeasurementType], { nullable: true })
	measurementTypes?: MeasurementType[];
}

@ObjectType()
export class DetailedGroceryItemsResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => [DetailedGroceryItem], { nullable: true })
	groceryItems?: DetailedGroceryItem[];
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

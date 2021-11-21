import { FridgeItem } from '../entities/FridgeItem';
import { Arg, Mutation, Resolver } from 'type-graphql';
import { FridgeItemInput } from '../utils/objectTypes/objectTypes';

@Resolver(FridgeItem)
export class FridgeItemResolver {
	@Mutation(() => FridgeItem)
	async createFridgeItem(
		@Arg('input') input: FridgeItemInput
		// @Ctx() { req }: MyContext
	): Promise<FridgeItem> {
		return FridgeItem.create({
			...input,
		}).save();
	}
}

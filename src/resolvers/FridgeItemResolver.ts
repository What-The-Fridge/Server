import { FridgeItem } from '../entities/FridgeItem';
// import { MyContext } from 'src/utils/context/MyContext';
import { Arg, Field, InputType, Mutation, Resolver } from 'type-graphql';

@InputType()
class FridgeInput {
	@Field()
	name: string;
	// @Field()
	// fridgeItems: FridgeItem[];
}

@Resolver(FridgeItem)
export class FridgeItemResolver {
	@Mutation(() => FridgeItem)
	async createFridge(
		@Arg('input') input: FridgeInput
		// @Ctx() { req }: MyContext
	): Promise<FridgeItem> {
		return FridgeItem.create({
			...input,
		}).save();
	}
}

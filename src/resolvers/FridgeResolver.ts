import { Fridge } from '../entities/Fridge';
// import { FridgeItem } from 'src/entities/FridgeItem';
// import { MyContext } from 'src/utils/context/MyContext';
import { Arg, Field, InputType, Mutation, Resolver } from 'type-graphql';

@InputType()
class FridgeInput {
	@Field()
	name: string;

	// @Field()
	// creatorId: number;

	// @Field()
	// fridgeItems: FridgeItem[];
}

@Resolver(Fridge)
export class FridgeResolver {
	@Mutation(() => Fridge)
	async createFridge(
		@Arg('input') input: FridgeInput
		// @Ctx() { req }: MyContext
	): Promise<Fridge> {
		return Fridge.create({
			...input,
		}).save();
	}
}

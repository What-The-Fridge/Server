import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	ManyToOne,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { GroceryList } from './GroceryList';
import { GroceryItemInfo } from './GroceryItemInfo';
@ObjectType()
@Entity('groceryItems')
export class GroceryItem extends BaseEntity {
	// ---------------- fields ----------------
	@Field()
	@PrimaryGeneratedColumn({ type: 'int' })
	id!: number;

	@Field(() => Number)
	@Column({ type: 'int' })
	groceryItemInfoId!: number; // foreign key to Fridge table

	@Field(() => Number)
	@Column({ type: 'int' })
	groceryListId!: number; // foreign key to Fridge table

	@Field(() => Number)
	@Column({ type: 'int' })
	quantity!: number;

	// ---------------- relationship ----------------
	@ManyToOne(() => GroceryList, groceryList => groceryList.groceryItems)
	groceryList: GroceryList;

	@ManyToOne(
		() => GroceryItemInfo,
		groceryItemInfo => groceryItemInfo.groceryItems
	)
	groceryItemInfo: GroceryItemInfo;

	// ---------------- time ----------------
	@Field(() => String)
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;
}

@ObjectType()
export class DetailedGroceryItem extends GroceryItem {
	@Field(() => String)
	name!: string;

	@Field(() => String, { nullable: true })
	upc: string;

	@Field(() => String, { nullable: true })
	imgUrl: string;

	@Field(() => Number)
	userId!: number; // foreign key to User table

	@Field(() => Number)
	measurementTypeId!: number; // foreign key to MeasurementType table

	@Field(() => String)
	measurement!: string;

	@Field(() => String)
	measurementUnit!: string;
}

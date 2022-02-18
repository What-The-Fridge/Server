import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	ManyToOne,
	Unique,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { GroceryList } from './GroceryList';
import { User } from './User';
import { MeasurementType } from './MeasurementType';
@ObjectType()
@Entity('groceryItems')
@Unique(['upc', 'userId'])
export class GroceryItem extends BaseEntity {
	// ---------------- fields ----------------
	@Field()
	@PrimaryGeneratedColumn({ type: 'int' })
	id!: number;

	@Field(() => Number)
	@Column({ type: 'int' })
	groceryListId!: number; // foreign key to GroceryList table

	@Field(() => Number)
	@Column({ type: 'int' })
	quantity!: number;

	@Field(() => String)
	@Column({ type: 'varchar' })
	name!: string;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true })
	upc: string;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true })
	imgUrl: string;

	@Field(() => Number)
	@Column({ type: 'int' })
	userId!: number; // foreign key to User table

	@Field(() => Number)
	@Column({ type: 'int' })
	measurementTypeId!: number; // foreign key to MeasurementType table

	// ---------------- relationship ----------------
	@ManyToOne(() => GroceryList, groceryList => groceryList.groceryItems)
	groceryList: GroceryList;

	@ManyToOne(() => User, user => user.groceryItems)
	user: User;

	@ManyToOne(
		() => MeasurementType,
		measurementType => measurementType.groceryItems
	)
	measurementType: MeasurementType;

	// ---------------- time ----------------
	@Field(() => String)
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;
}

@ObjectType()
export class detailedGroceryItem extends GroceryItem {
	@Field(() => String)
	@Column({ type: 'varchar' })
	measurementUnit!: string;
}

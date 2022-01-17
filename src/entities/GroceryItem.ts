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
@ObjectType()
@Entity('groceryItems')
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

	// ---------------- time ----------------
	@Field(() => String)
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;
}

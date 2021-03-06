import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	ManyToOne,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Fridge } from './Fridge';
import { FridgeItemInfo } from './FridgeItemInfo';
@ObjectType()
@Entity('fridgeItems')
export class FridgeItem extends BaseEntity {
	// ---------------- fields ----------------
	@Field()
	@PrimaryGeneratedColumn({ type: 'int' })
	id!: number;

	@Field(() => Number)
	@Column({ type: 'int' })
	fridgeItemInfoId!: number; // foreign key to Fridge table

	@Field(() => Number)
	@Column({ type: 'int' })
	fridgeId!: number; // foreign key to Fridge table

	@Field(() => Number)
	@Column({ type: 'int' })
	quantity!: number;

	@Field(() => String, { nullable: true })
	@Column({ type: 'timestamptz', nullable: true })
	purchasedDate: Date;

	@Field(() => String, { nullable: true })
	@Column({ type: 'timestamptz', nullable: true })
	expiryDate: Date;

	// ---------------- relationship ----------------
	@ManyToOne(() => Fridge, fridge => fridge.fridgeItems)
	fridge: Fridge;

	@ManyToOne(() => FridgeItemInfo, fridgeItemInfo => fridgeItemInfo.fridgeItems)
	fridgeItemInfo: FridgeItemInfo;

	// ---------------- time ----------------
	@Field(() => String)
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;
}

@ObjectType()
export class DetailedFridgeItem extends FridgeItem {
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

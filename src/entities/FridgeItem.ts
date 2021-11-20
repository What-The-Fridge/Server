import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Fridge } from './Fridge';
@ObjectType()
@Entity('fridgeItems')
export class FridgeItem extends BaseEntity {
	// ---------------- fields ----------------
	@Field()
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column()
	name!: string;

	@Field()
	@Column()
	quantity: number;

	@Field()
	@Column()
	purchasedDate: Date;

	@Field()
	@Column()
	expiryDate: Date;

	@Field()
	@Column()
	imgUrl: string; //optional

	// ---------------- relationship ----------------
	@ManyToOne(() => Fridge, fridge => fridge.fridgeItems)
	fridge: Fridge;

	// ---------------- time ----------------
	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}

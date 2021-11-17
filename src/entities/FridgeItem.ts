import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	// ManyToOne,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Fridge } from './Fridge';
// import { Fridge } from './Fridge';

@ObjectType()
@Entity('fridgeItems')
export class FridgeItem extends BaseEntity {
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

	// Many fridge items can be in 1 fridge
	// TODO: one to one?
	@ManyToOne(() => Fridge, fridge => fridge.fridgeItems)
	fridge: Fridge;

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}

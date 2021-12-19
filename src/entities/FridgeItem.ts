import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	Unique,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Fridge } from './Fridge';
import { MeasurementType } from './MeasurementType';
import { User } from './User';
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
	fridgeId!: string; // foreign key to Fridge table

	@Field()
	@Column({ default: 34 })
	userId!: string; // foreign key to User table

	@Field({ nullable: true })
	@Column({ nullable: true })
	upc: string;

	@Field(() => String, { nullable: true })
	@Column({ nullable: true, type: 'timestamptz' })
	purchasedDate: Date;

	@Field(() => String, { nullable: true })
	@Column({ nullable: true, type: 'timestamptz' })
	expiryDate: Date;

	@Field({ nullable: true })
	@Column({ nullable: true })
	imgUrl: string;

	@Field({ nullable: true })
	@Column('int', { nullable: true, default: 1 })
	quantity: number;

	@Field({ nullable: true })
	@Column('int', { nullable: true, default: 0 })
	measurementTypeId!: number; // foreign key to MeasurementType table

	// ---------------- relationship ----------------
	@ManyToOne(
		() => MeasurementType,
		measurementType => measurementType.fridgeItem
	)
	measurementType: MeasurementType;

	@ManyToOne(() => Fridge, fridge => fridge.fridgeItems)
	fridge: Fridge;

	@ManyToOne(() => User, user => user.fridgeItems)
	user: User;

	@Unique(['sector', 'row', 'number'])

	// ---------------- time ----------------
	@Field(() => String)
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}

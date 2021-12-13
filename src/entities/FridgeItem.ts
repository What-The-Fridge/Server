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
import { MeasurementType } from './MeasurementType';
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

	@Field({ nullable: true })
	@Column({ nullable: true })
	upc: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	quantity: number;

	@Field(() => String, { nullable: true })
	@Column({ nullable: true, type: 'timestamptz' })
	purchasedDate: Date;

	@Field(() => String, { nullable: true })
	@Column({ nullable: true, type: 'timestamptz' })
	expiryDate: Date;

	@Field({ nullable: true })
	@Column({ nullable: true })
	imgUrl: string;

	@Field({ nullable: true})
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

	// ---------------- time ----------------
	@Field(() => String)
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}

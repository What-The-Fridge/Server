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
	@Column({ nullable: true })
	quantity: number;

	@Field(() => String)
	@Column({ nullable: true, type: 'timestamptz' })
	purchasedDate: Date;

	@Field(() => String)
	@Column({ nullable: true, type: 'timestamptz' })
	expiryDate: Date;

	@Field()
	@Column({ nullable: true })
	imgUrl: string;

	@Field()
	@Column({ nullable: true })
	measurementTypeId: string; // foreign key to MeasurementType table

	@Field()
	@Column()
	fridgeId!: string; // foreign key to Fridge table

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

import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	ManyToOne,
	OneToMany,
	Unique,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { MeasurementType } from './MeasurementType';
import { User } from './User';
import { FridgeItem } from './FridgeItem';

@ObjectType()
@Entity('fridgeItemInfo')
@Unique(['upc', 'userId'])
export class FridgeItemInfo extends BaseEntity {
	// ---------------- fields ----------------
	@Field()
	@PrimaryGeneratedColumn({ type: 'int' })
	id!: number;

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
	@ManyToOne(
		() => MeasurementType,
		measurementType => measurementType.fridgeItemInfos
	)
	measurementType: MeasurementType;

	@ManyToOne(() => User, user => user.fridgeItemInfos)
	user: User;

	@OneToMany(() => FridgeItem, fridgeItem => fridgeItem.fridgeItemInfo)
	fridgeItems: FridgeItem[];

	// ---------------- time ----------------
	@Field(() => String)
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;
}

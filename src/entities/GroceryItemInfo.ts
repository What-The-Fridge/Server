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
import { GroceryItem } from './GroceryItem';

@ObjectType()
@Entity('groceryItemInfo')
@Unique(['upc', 'userId'])
export class GroceryItemInfo extends BaseEntity {
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
		measurementType => measurementType.groceryItemInfo
	)
	measurementType: MeasurementType;

	@ManyToOne(() => User, user => user.groceryItemInfos)
	user: User;

	@OneToMany(() => GroceryItem, groceryItem => groceryItem.groceryItemInfo)
	groceryItems: GroceryItem[];

	// ---------------- time ----------------
	@Field(() => String)
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;
}

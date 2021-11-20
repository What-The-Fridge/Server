import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	ManyToOne,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { FridgeItem } from './FridgeItem';
import { FUJoinTable } from './FUJoinTable';
import { User } from './User';

@ObjectType()
@Entity('fridges')
export class Fridge extends BaseEntity {
	// ---------------- fields ----------------
	@Field()
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column()
	name!: string;

	@Field()
	@Column()
	ownerId!: number;

	// ---------------- relationship ----------------
	@ManyToOne(() => User, user => user.fridges)
	owner: User;

	@OneToMany(() => FUJoinTable, fuTable => fuTable.fridge)
	fuTables: FUJoinTable[];

	@OneToMany(() => FridgeItem, fridgeItem => fridgeItem.fridge)
	fridgeItems: FridgeItem[];

	// ---------------- time ----------------
	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}

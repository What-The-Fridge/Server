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
import { FridgeUserTable } from './FridgeUserTable';
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

	@OneToMany(() => FridgeUserTable, fuTable => fuTable.fridge)
	fuTables: FridgeUserTable[];

	@OneToMany(() => FridgeItem, fridgeItem => fridgeItem.fridge)
	fridgeItems: FridgeItem[];

	// ---------------- time ----------------
	@Field(() => String)
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}

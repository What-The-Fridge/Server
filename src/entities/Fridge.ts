import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
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
	@PrimaryGeneratedColumn({ type: 'int' })
	id!: number;

	@Field(() => String)
	@Column({ type: 'varchar' })
	name!: string;

	@Field(() => Number)
	@Column({ type: 'int' })
	ownerId!: number; // foreign key to users table

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
}

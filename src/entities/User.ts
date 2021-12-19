import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	OneToMany,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { FridgeUserTable } from './FridgeUserTable';
import { Fridge } from './Fridge';
import { FridgeItemInfo } from './FridgeItemInfo';

@ObjectType()
@Entity('users')
export class User extends BaseEntity {
	// ---------------- fields ----------------
	@Field()
	@PrimaryGeneratedColumn({ type: 'int' })
	id!: number;

	@Field(() => String)
	@Column({ type: 'varchar', unique: true })
	firebaseUserUID!: string;

	@Field(() => String)
	@Column({ type: 'varchar' })
	firstName!: string;

	@Field(() => String)
	@Column({ type: 'varchar' })
	lastName!: string;

	@Field(() => Number)
	@Column({ type: 'int' })
	tier!: number;

	@Field(() => String)
	@Column({ type: 'varchar' })
	email!: string;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true })
	imgUrl: string;

	// ---------------- relationship ----------------
	@OneToMany(() => Fridge, fridge => fridge.owner)
	fridges: Fridge[];

	@OneToMany(() => FridgeUserTable, fuTable => fuTable.user)
	fuTables!: FridgeUserTable[];

	@OneToMany(() => FridgeItemInfo, fridgeItemInfo => fridgeItemInfo.user)
	fridgeItemInfos: FridgeItemInfo[];

	// ---------------- time ----------------
	@Field(() => String)
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;
}

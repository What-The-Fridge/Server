import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { FridgeUserTable } from './FridgeUserTable';
import { Fridge } from './Fridge';
import { FridgeItem } from './FridgeItem';

@ObjectType()
@Entity('users')
export class User extends BaseEntity {
	// ---------------- fields ----------------
	@Field()
	@PrimaryGeneratedColumn()
	id!: number;

	@Field(() => String)
	@Column({ unique: true })
	firebaseUserUID!: string;

	@Field(() => String)
	@Column({ default: 'unspecified' })
	firstName!: string;

	@Field(() => String)
	@Column({ default: 'unspecified' })
	lastName!: string;

	@Field(() => String)
	@Column({ default: 'unspecified' })
	email: string;

	@Field(() => String, { nullable: true })
	@Column({
		nullable: true,
		default:
			'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png',
	})
	imgUrl: string;

	@Field(() => Number)
	@Column('int', { default: 0 })
	tier!: number;

	// ---------------- relationship ----------------
	@OneToMany(() => Fridge, fridge => fridge.owner)
	fridges: Fridge[];

	@OneToMany(() => FridgeUserTable, fuTable => fuTable.user)
	fuTables!: FridgeUserTable[];

	@OneToMany(() => FridgeItem, fridgeItem => fridgeItem.user)
	fridgeItems: FridgeItem[];

	// ---------------- time ----------------
	@Field(() => String)
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}

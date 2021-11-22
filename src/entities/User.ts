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
import { FUJoinTable } from './FUJoinTable';
import { Fridge } from './Fridge';

@ObjectType()
@Entity('users')
export class User extends BaseEntity {
	// ---------------- fields ----------------
	@Field()
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column({ unique: true })
	username!: string;

	@Field()
	@Column({ unique: true })
	email!: string;

	@Column('text')
	password!: string;

	@Column('int', { default: 0 })
	tokenVersion: number;

	// ---------------- relationship ----------------
	@OneToMany(() => Fridge, fridge => fridge.owner)
	fridges: Fridge[];

	@OneToMany(() => FUJoinTable, fuTable => fuTable.user)
	fuTables!: FUJoinTable[];

	// ---------------- time ----------------
	@Field(() => String)
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}

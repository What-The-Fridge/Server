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
import { Fridge } from './Fridge';

@ObjectType()
@Entity('users')
export class User extends BaseEntity {
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

	// 1 user can have access to many fridges
	@OneToMany(() => Fridge, fridge => fridge.users)
	fridges: Fridge[];

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}

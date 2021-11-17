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
import { User } from './User';
import { FridgeItem } from './FridgeItem';

@ObjectType()
@Entity('fridges')
export class Fridge extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column()
	name!: string;

	@Field()
	@Column()
	creatorId: number;

	// 1 fridge can be shared by many users
	@OneToMany(() => User, user => user.fridges)
	users!: User[]; // must have at least 1 user || to be deleted

	// 1 fridge can store many fridge items in it
	@OneToMany(() => FridgeItem, fridgeItem => fridgeItem.fridge)
	fridgeItems: FridgeItem[];

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}

import {
	Entity,
	BaseEntity,
	ManyToOne,
	Column,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { Fridge } from './Fridge';
import { Field, ObjectType } from 'type-graphql';

// many to many
// users <-> fridges
// users -> join table <- posts
// users -> FUJoinTable <- posts
@ObjectType()
@Entity('fridge_user_table')
export class FridgeUserTable extends BaseEntity {
	// ---------------- fields ----------------
	@Field()
	@PrimaryGeneratedColumn({ type: 'int' })
	id!: number;

	@Field(() => Number)
	@Column({ type: 'int' })
	userId: number;

	@Field(() => Number)
	@Column({ type: 'int' })
	fridgeId: number;

	// ---------------- relationship ----------------
	@ManyToOne(() => User, user => user.fuTables)
	user: User;

	@ManyToOne(() => Fridge, fridge => fridge.fuTables, {
		onDelete: 'CASCADE',
	})
	fridge: Fridge;
}

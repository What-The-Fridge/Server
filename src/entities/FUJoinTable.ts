import { Entity, BaseEntity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';
import { Fridge } from './Fridge';
import { Field, ObjectType } from 'type-graphql';

// many to many
// users <-> fridges
// users -> join table <- posts
// users -> FUJoinTable <- posts
@ObjectType()
@Entity()
export class FUJoinTable extends BaseEntity {
	// ---------------- fields ----------------
	@Field()
	@PrimaryColumn()
	userId: number;

	@Field()
	@PrimaryColumn()
	fridgeId: number;

	// ---------------- relationship ----------------
	@ManyToOne(() => User, user => user.fuTables)
	user: User;

	@ManyToOne(() => Fridge, fridge => fridge.fuTables, {
		onDelete: 'CASCADE',
	})
	fridge: Fridge;
}

import {
	Entity,
	BaseEntity,
	ManyToOne,
	PrimaryColumn,
	// PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { GroceryList } from './GroceryList';
import { Field, ObjectType } from 'type-graphql';

// many to many
// users <-> groceryLists
// users -> join table <- posts
// users -> GLUJoinTable <- posts
@ObjectType()
@Entity('groceryList_user_table')
export class GroceryListUserTable extends BaseEntity {
	// ---------------- fields ----------------
	@Field(() => Number)
	@PrimaryColumn({ type: 'int' })
	userId: number;

	@Field(() => Number)
	@PrimaryColumn({ type: 'int' })
	groceryListId: number;

	// ---------------- relationship ----------------
	@ManyToOne(() => User, user => user.gLUTables)
	user: User;

	@ManyToOne(() => GroceryList, groceryList => groceryList.gLUTables, {
		onDelete: 'CASCADE',
	})
	groceryList: GroceryList;
}

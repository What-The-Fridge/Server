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
import { GroceryItem } from './GroceryItem';
import { GroceryListUserTable } from './GroceryListUserTable';
import { User } from './User';

@ObjectType()
@Entity('groceryLists')
export class GroceryList extends BaseEntity {
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
	@ManyToOne(() => User, user => user.groceryLists)
	owner: User;

	@OneToMany(() => GroceryListUserTable, gLUTable => gLUTable.groceryList)
	gLUTables: GroceryListUserTable[];

	@OneToMany(() => GroceryItem, groceryItem => groceryItem.groceryList)
	groceryItems: GroceryItem[];

	// ---------------- time ----------------
	@Field(() => String)
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;
}

import {
	Entity,
	BaseEntity,
	OneToMany,
	PrimaryGeneratedColumn,
	Column,
} from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { FridgeItemInfo } from './FridgeItemInfo';
import { GroceryItem } from './GroceryItem';

@ObjectType()
@Entity('measurement_type')
export class MeasurementType extends BaseEntity {
	// ---------------- fields ----------------
	@Field()
	@PrimaryGeneratedColumn({ type: 'int' })
	id!: number;

	@Field(() => String)
	@Column({ type: 'varchar', default: 'sdfsd' })
	measurement!: string;

	@Field(() => String)
	@Column({ type: 'varchar', default: 'sdfsd' })
	measurementUnit!: string;

	// ---------------- relationship ----------------
	@OneToMany(
		() => FridgeItemInfo,
		fridgeItemInfo => fridgeItemInfo.measurementTypeId
	)
	fridgeItemInfo: FridgeItemInfo;

	@OneToMany(() => GroceryItem, groceryItem => groceryItem.measurementTypeId)
	groceryItem: GroceryItem;
}

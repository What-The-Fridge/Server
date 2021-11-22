import {
	Entity,
	BaseEntity,
	PrimaryColumn,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { FridgeItem } from './FridgeItem';

@ObjectType()
@Entity()
export class MeasurementType extends BaseEntity {
	// ---------------- fields ----------------
	@Field()
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@PrimaryColumn()
	name: string;

	@Field()
	@PrimaryColumn()
	measurementSymbol: string;

	// ---------------- relationship ----------------
	@OneToMany(() => FridgeItem, fridgeItem => fridgeItem.measurementTypeId)
	fridgeItem: FridgeItem;
}

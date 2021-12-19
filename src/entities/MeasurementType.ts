import {
	Entity,
	BaseEntity,
	OneToMany,
	PrimaryGeneratedColumn,
	Column,
} from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { FridgeItemInfo } from './FridgeItemInfo';

@ObjectType()
@Entity('measurement_type')
export class MeasurementType extends BaseEntity {
	// ---------------- fields ----------------
	@Field()
	@PrimaryGeneratedColumn({ type: 'int' })
	id!: number;

	@Field(() => String)
	@Column({ type: 'varchar' })
	name!: string;

	@Field(() => String)
	@Column({ type: 'varchar' })
	measurementSymbol!: string;

	// ---------------- relationship ----------------
	@OneToMany(
		() => FridgeItemInfo,
		fridgeItemInfo => fridgeItemInfo.measurementTypeId
	)
	fridgeItemInfo: FridgeItemInfo;
}

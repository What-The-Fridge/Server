import { MigrationInterface, QueryRunner } from 'typeorm';

export class measurement1645321538573 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            insert into measurement_type (id, measurement, "measurementUnit") values (1, 'Kilograms', 'kg') on conflict do nothing;
            insert into measurement_type (id, measurement, "measurementUnit") values (2, 'Grams', 'g') on conflict do nothing;
            insert into measurement_type (id, measurement, "measurementUnit") values (3, 'Onces', 'oz') on conflict do nothing;
            insert into measurement_type (id, measurement, "measurementUnit") values (4, 'Pound', 'lb') on conflict do nothing;
            insert into measurement_type (id, measurement, "measurementUnit") values (5, 'Liters', 'L') on conflict do nothing;
            insert into measurement_type (id, measurement, "measurementUnit") values (6, 'Cups', 'cups') on conflict do nothing;
            insert into measurement_type (id, measurement, "measurementUnit") values (7, 'Gallon', 'gal') on conflict do nothing;
            insert into measurement_type (id, measurement, "measurementUnit") values (8, 'Units', 'units') on conflict do nothing;
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(``);
	}
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class measurement1645321538573 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            insert into measurement_type (id, measurement, "measurementUnit") values (1, 'Kilograms', 'kg');
            insert into measurement_type (id, measurement, "measurementUnit") values (2, 'Grams', 'g');
            insert into measurement_type (id, measurement, "measurementUnit") values (3, 'Onces', 'oz');
            insert into measurement_type (id, measurement, "measurementUnit") values (4, 'Pound', 'lb');
            insert into measurement_type (id, measurement, "measurementUnit") values (5, 'Liters', 'L');
            insert into measurement_type (id, measurement, "measurementUnit") values (6, 'Cups', 'c');
            insert into measurement_type (id, measurement, "measurementUnit") values (7, 'Gallon', 'gal');
            insert into measurement_type (id, measurement, "measurementUnit") values (8, 'Units', 'Unit');
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            delete from measurement_type where id = 1;
            delete from measurement_type where id = 2;
            delete from measurement_type where id = 3;
            delete from measurement_type where id = 4;
            delete from measurement_type where id = 5;
            delete from measurement_type where id = 6;
            delete from measurement_type where id = 7;
            delete from measurement_type where id = 8;
        `);
	}
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1755540074945 implements MigrationInterface {
    name = ' $npmConfigName1755540074945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`token\``);
        await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`token\` varchar(1000) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`token\``);
        await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`token\` varchar(255) NOT NULL`);
    }

}

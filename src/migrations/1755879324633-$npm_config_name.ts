import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1755879324633 implements MigrationInterface {
    name = ' $npmConfigName1755879324633'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`expiresAt\``);
        await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`token\``);
        await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`accessToken\` varchar(512) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`refreshToken\` varchar(512) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`accessTokenExpiresAt\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`refreshTokenExpiresAt\` datetime NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`refreshTokenExpiresAt\``);
        await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`accessTokenExpiresAt\``);
        await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`refreshToken\``);
        await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`accessToken\``);
        await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`type\` enum ('access', 'refresh') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`token\` varchar(1000) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`expiresAt\` datetime NOT NULL`);
    }

}

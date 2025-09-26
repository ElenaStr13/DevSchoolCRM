import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1755715809000 implements MigrationInterface {
  name = ' $npmConfigName1755715809000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_entity\` DROP COLUMN \`accessToken\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_entity\` ADD \`accessToken\` varchar(512) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_entity\` DROP COLUMN \`refreshToken\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_entity\` ADD \`refreshToken\` varchar(512) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`role\` enum ('admin', 'manager') NOT NULL DEFAULT 'manager'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`role\` varchar(255) NOT NULL DEFAULT 'manager'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_entity\` DROP COLUMN \`refreshToken\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_entity\` ADD \`refreshToken\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_entity\` DROP COLUMN \`accessToken\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_entity\` ADD \`accessToken\` varchar(255) NOT NULL`,
    );
  }
}

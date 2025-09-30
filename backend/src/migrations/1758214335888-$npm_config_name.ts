import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1758214335888 implements MigrationInterface {
  name = ' $npmConfigName1758214335888';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`name\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`name\``);
  }
}

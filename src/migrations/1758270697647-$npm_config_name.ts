import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1758270697647 implements MigrationInterface {
  name = ' $npmConfigName1758270697647';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tokens\` ADD \`accessTokenExpiresAt\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tokens\` ADD \`refreshTokenExpiresAt\` datetime NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tokens\` DROP COLUMN \`refreshTokenExpiresAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tokens\` DROP COLUMN \`accessTokenExpiresAt\``,
    );
  }
}

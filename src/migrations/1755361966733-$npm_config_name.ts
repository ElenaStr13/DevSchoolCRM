import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1755361966733 implements MigrationInterface {
  name = ' $npmConfigName1755361966733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token\` varchar(255) NOT NULL, \`type\` enum ('access', 'refresh') NOT NULL, \`expiresAt\` datetime NOT NULL, \`isBlocked\` tinyint NOT NULL DEFAULT 0, \`jti\` varchar(255) NOT NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tokens\` ADD CONSTRAINT \`FK_d417e5d35f2434afc4bd48cb4d2\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tokens\` DROP FOREIGN KEY \`FK_d417e5d35f2434afc4bd48cb4d2\``,
    );
    await queryRunner.query(`DROP TABLE \`tokens\``);
  }
}

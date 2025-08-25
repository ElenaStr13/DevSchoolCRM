import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1755589788332 implements MigrationInterface {
    name = ' $npmConfigName1755589788332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`token_entity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`accessToken\` varchar(255) NOT NULL, \`refreshToken\` varchar(255) NOT NULL, \`accessTokenExpiresAt\` datetime NOT NULL, \`refreshTokenExpiresAt\` datetime NOT NULL, \`isBlocked\` tinyint NOT NULL DEFAULT 0, \`jti\` varchar(255) NOT NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`token_entity\` ADD CONSTRAINT \`FK_de044c3492e70d6d9511ee35792\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`token_entity\` DROP FOREIGN KEY \`FK_de044c3492e70d6d9511ee35792\``);
        await queryRunner.query(`DROP TABLE \`token_entity\``);
    }

}

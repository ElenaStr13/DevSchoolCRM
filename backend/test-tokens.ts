// файл test-tokens.ts
const { JwtService } = require('@nestjs/jwt');

const jwtService = new JwtService({
  secret: 'твій_JWT_SECRET_з_.env',
});

const payload = {
  userId: 1, // id адміна з БД
  email: 'admin@gmail.com',
  role: 'admin',
  name: 'Olena',
  jti: 'debug-jti-123',
};

const access = jwtService.sign(payload, { expiresIn: '15m' });
const refresh = jwtService.sign(payload, { expiresIn: '7d' });

console.log('Access Token:', access);
console.log('Refresh Token:', refresh);

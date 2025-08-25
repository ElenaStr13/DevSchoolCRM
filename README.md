# DevSchoolCRM 🎓

CRM-система для управління заявками від студентів.
Проєкт написаний на NestJS + TypeORM + MySQL.

Запуск проєкту.
1. Встанови Node.js та npm
Проєкт працює на Node.js ≥ 18.
Завантажити Node.js.
Після встановлення можна перевірити:
node -v
npm -v

2. Клонуй репозиторій:
git clone https://github.com/ElenaStr13/DevSchoolCRM.git
cd DevSchoolCRM

3. Встанови залежності:
npm install

4. Налаштуй базу даних MySQL.
Встанови MySQL (якщо ще не встановлений)
Створи базу даних у MySQL:
всі дані знаходяться в configuration

5. Запусти міграції
Міграції створять потрібні таблиці:
npm run migration:run

6. Запусти проєкт
Для розробки (автоматичне перезапускання при змінах коду):
npm run start:dev
Для звичайного запуску:
npm run start

7. Відкрий Swagger-документацію
Після запуску зайди в браузері:
http://localhost:3000/api
Там буде готова документація API (Swagger UI).

📦 Використані технології

NestJS
 — серверний фреймворк

TypeORM
 — ORM для роботи з БД

MySQL
 — база даних

Swagger
 — документація API

 👩‍💻 Автор
Фінальний проєкт.
Автор: ElenaStr13

# Laravel Passkey Authentication

SPA-приложение с аутентификацией по email/password и FIDO2/WebAuthn passkey.

## Стек

- **Backend:** Laravel 11, PHP 8.5, Laravel Passport (OAuth2), laragear/webauthn v4.1
- **Frontend:** Vue 3, Vue Router 4, Vite, Tailwind CSS, Axios
- **Инфраструктура:** Laravel Sail (Docker), MySQL 8.4, Redis

## Требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

Если на машине установлены PHP и Composer — можно использовать их напрямую (см. вариант A).
Если нет — достаточно только Docker (см. вариант B).

## Установка

### Вариант A: PHP и Composer установлены

```bash
git clone <repo-url>
cd passkey_laravel
composer install
cp .env.example .env
```

### Вариант B: Только Docker (без PHP/Composer/Node)

```bash
git clone <repo-url>
cd passkey_laravel
cp .env.example .env
```

Установите зависимости через одноразовый Docker-контейнер:

```bash
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php85-composer:latest \
    composer install --ignore-platform-reqs
```

### Общие шаги (после варианта A или B)

Отредактируйте `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=passkey_laravel
DB_USERNAME=sail
DB_PASSWORD=password

SESSION_DRIVER=redis
CACHE_STORE=redis
REDIS_HOST=redis
```

Запустите контейнеры и выполните настройку:

```bash
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan passport:install
./vendor/bin/sail npm install
./vendor/bin/sail npm run build
```

## Запуск для разработки

```bash
./vendor/bin/sail up -d
./vendor/bin/sail npm run dev
```

- Приложение: http://localhost
- Vite HMR: порт 5173

## Тестовый пользователь (опционально)

```bash
./vendor/bin/sail artisan db:seed
```

- Email: `test@example.com`
- Пароль: `password`

## Функциональность

- Регистрация и логин по email/password
- Добавление passkey (FIDO2/WebAuthn) в профиле
- Логин через passkey
- Смена имени с подтверждением через passkey
- Управление passkeys (просмотр, удаление)
- Logout

## API Endpoints

### Публичные

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/register` | Регистрация |
| POST | `/api/login` | Логин по email/password |
| POST | `/api/passkeys/login/options` | Получение challenge для passkey-логина |
| POST | `/api/passkeys/login` | Логин через passkey |

### Требуют авторизации (Bearer token)

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/user` | Текущий пользователь |
| POST | `/api/logout` | Logout |
| GET | `/api/passkeys` | Список passkeys |
| POST | `/api/passkeys/register/options` | Challenge для регистрации passkey |
| POST | `/api/passkeys/register` | Регистрация passkey |
| DELETE | `/api/passkeys/{id}` | Удаление passkey |
| POST | `/api/profile/verify-options` | Challenge для подтверждения действия |
| PUT | `/api/profile/name` | Смена имени (с passkey-подтверждением) |

## Структура проекта

```
app/
  Http/Controllers/
    Auth/
      RegisterController.php    — регистрация
      LoginController.php       — логин/logout
      PasskeyController.php     — CRUD passkeys + passkey-логин
    ProfileController.php       — смена имени с верификацией
  Models/
    User.php                    — Passport + WebAuthn

resources/js/
  app.js                        — точка входа
  App.vue                       — корневой компонент с навигацией
  router/index.js               — маршрутизация SPA
  api/axios.js                  — HTTP-клиент с Bearer-токеном
  composables/
    useAuth.js                  — register, login, loginWithPasskey, logout
    usePasskeys.js              — fetchPasskeys, registerPasskey, deletePasskey
    webauthn.js                 — base64url утилиты для WebAuthn
  pages/
    Landing.vue                 — главная страница
    Login.vue                   — форма логина + passkey
    Register.vue                — форма регистрации
    Dashboard.vue               — профиль + управление passkeys
  components/
    PasskeyList.vue             — список passkeys
    PasskeyRegister.vue         — добавление passkey
    ProfileEdit.vue             — смена имени с passkey-подтверждением

config/
  auth.php                      — dual-provider: eloquent + eloquent-webauthn
  webauthn.php                  — настройки WebAuthn/FIDO2
```

## Архитектура аутентификации

- **Email/password** — стандартный `Auth::attempt()`, выдаёт Passport personal access token
- **Passkey (FIDO2/WebAuthn)** — через `laragear/webauthn`, challenge хранится в сессии, результат — Passport token
- **Dual auth providers** — `eloquent` для Passport API guard, `eloquent-webauthn` для WebAuthn web guard
- **SPA** — все API-запросы с Bearer-токеном, фронтенд использует нативный Web Authentication API браузера

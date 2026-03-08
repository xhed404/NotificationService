# Notification Service

Мой микросервис для отправки уведомлений через Email, SMS (Twilio) с real-time статусом через WebSocket.

## Стек технологий

- Node.js 18 + Express
- Redis (Bull queues)
- Socket.io (WebSocket)
- Nodemailer (Email)
- Twilio (SMS)
- Joi (Validation)
- Winston (Logging)

## Как запустить?

### Для локальной разработки

```bash
npm install
cp .env.example .env

docker run -d -p 6379:6379 redis:7-alpine

npm run dev
```

### Docker

```bash
docker-compose up -d
```

## Прочитать про эндопинты Вы можете тут - Endpoints.md

## WebSocket

Подключение: `ws://localhost:3000`

### Client - Server
- `subscribe:job` - подписка на job
- `unsubscribe:job` - отписка от job
- `subscribe:stats` - подписка на статистику

### Server - Client
- `job:created` - job создан
- `job:completed` - job завершен
- `job:failed` - job упал
- `job:progress` - прогресс job
- `stats:update` - обновление статистики

### Пример
```javascript
const socket = io('http://localhost:3000');

socket.emit('subscribe:job', '123');

socket.on('job:completed', (data) => {
  console.log('Job done:', data);
});
```

## Переменные окружения

 `PORT`
`NODE_ENV`
`REDIS_URL`
`SMTP_HOST`
`SMTP_PORT`
`SMTP_USER`
`SMTP_PASS`
`TWILIO_ACCOUNT_SID`
`TWILIO_AUTH_TOKEN`
`TWILIO_FROM_NUMBER`
`RATE_LIMIT_WINDOW_MS`
`RATE_LIMIT_MAX_REQUESTS`
`MAX_RETRIES`
`RETRY_DELAY_MS`

## Шаблоны

- `welcome` - Приветственное письмо
- `passwordReset` - Сброс пароля
- `notification` - Универсальное уведомление


Эхх, традиция... :)




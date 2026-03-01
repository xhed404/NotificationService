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

## API Endpoints

### Health Check
```
GET /health
```

### Отправка Email
```
POST /api/notifications/email
Content-Type: application/json

{
  "to": "user@example.com",
  "template": "welcome",
  "data": { "name": "John" }
}
```

Или с кастомным контентом:
```json
{
  "to": "user@example.com",
  "subject": "Hello",
  "html": "<h1>Hello!</h1>",
  "text": "Hello!"
}
```

### Массовая рассылка
```
POST /api/notifications/bulk
Content-Type: application/json

{
  "recipients": [
    { "to": "user1@example.com", "data": { "name": "User 1" } },
    { "to": "user2@example.com", "data": { "name": "User 2" } }
  ],
  "template": "welcome"
}
```

### Отправка SMS
```
POST /api/notifications/sms
Content-Type: application/json

{
  "to": "+111111",
  "body": "It's work!"
}
```

### Статус задачи
```
GET /api/notifications/status/:jobId
```

### Статистика очереди
```
GET /api/notifications/stats
```

### Список шаблонов
```
GET /api/notifications/templates
```

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

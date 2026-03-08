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

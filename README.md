# Business-Mensajeria

Microservicio de mensajería para envío de emails y SMS en BusinessApp. Gestiona el envío de notificaciones por correo electrónico (con adjuntos) y mensajes de texto, con integración al servicio de reportes.

## 🏗️ Arquitectura

Implementa **Arquitectura Hexagonal + Event-Driven + Queue-Based** para procesamiento asíncrono robusto.

```
Business-Mensajeria/
├── src/
│   ├── domain/                           # Capa de dominio
│   │   ├── entities/
│   │   │   ├── Message.ts               # Entidad base abstracta
│   │   │   ├── EmailMessage.ts          # Entidad email con attachments
│   │   │   └── SMSMessage.ts            # Entidad SMS
│   │   ├── repositories/
│   │   │   └── IMessageRepository.ts    # Contrato de persistencia
│   │   └── services/
│   │       ├── MessageDomainService.ts  # Lógica de negocio
│   │       └── TemplateService.ts       # Renderizado de plantillas
│   │
│   ├── application/                      # Casos de uso
│   │   ├── dto/
│   │   │   └── MessageDTO.ts
│   │   └── usecases/
│   │       ├── SendEmail.ts             # Enviar email individual/batch
│   │       ├── SendSMS.ts               # Enviar SMS individual/batch
│   │       ├── QueryMessages.ts         # Consultar mensajes
│   │       ├── RetryFailedMessage.ts    # Reintentos
│   │       └── SendEmailWithReport.ts   # Email + reporte adjunto
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── mongodb/
│   │   │       └── MongoMessageRepository.ts
│   │   ├── providers/                    # Proveedores externos
│   │   │   ├── email/
│   │   │   │   ├── IEmailProvider.ts
│   │   │   │   └── NodemailerProvider.ts  # SMTP
│   │   │   └── sms/
│   │   │       ├── ISMSProvider.ts
│   │   │       └── TwilioProvider.ts      # Twilio SMS
│   │   ├── queue/                         # Sistema de colas
│   │   │   └── bullmq/
│   │   │       ├── EmailQueue.ts
│   │   │       ├── SMSQueue.ts
│   │   │       └── workers/
│   │   │           ├── EmailWorker.ts     # Procesa emails
│   │   │           └── SMSWorker.ts       # Procesa SMS
│   │   ├── clients/
│   │   │   └── ReportServiceClient.ts     # Cliente Business-Report
│   │   └── http/
│   │       └── express/
│   │           ├── routes.ts
│   │           └── middleware/
│   │
│   ├── shared/
│   │   ├── config/
│   │   ├── errors/
│   │   └── utils/
│   │
│   └── index.ts
```

## 🚀 Stack Tecnológico

- **Lenguaje**: TypeScript/Node.js
- **Framework HTTP**: Express.js
- **Base de Datos**: MongoDB (historial de mensajes)
- **Cola de Trabajos**: BullMQ + Redis
- **Email Providers**: 
  - Nodemailer (SMTP: Gmail, Outlook, etc.)
  - SendGrid (opcional)
- **SMS Providers**:
  - Twilio
  - AWS SNS (opcional)
- **Plantillas**: Handlebars
- **Mensajería**: Kafka (opcional)

## 📋 Características

- ✅ Envío de emails con HTML y plantillas Handlebars
- ✅ Adjuntos en emails (archivos, reportes desde Business-Report)
- ✅ Envío de SMS con Twilio
- ✅ Colas asíncronas con BullMQ
- ✅ Reintentos automáticos con exponential backoff
- ✅ Priorización de mensajes (URGENT, HIGH, NORMAL, LOW)
- ✅ Envío masivo (batch)
- ✅ Seguimiento de estado (PENDING, QUEUED, SENDING, SENT, FAILED)
- ✅ Historial completo en MongoDB
- ✅ Integración con Business-Report para adjuntar documentos
- ✅ Multi-proveedor (cambiar entre SMTP, SendGrid, Twilio, SNS)

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Configurar .env con tus credenciales
```

## ⚙️ Configuración

Edita el archivo `.env`:

```env
# Server
PORT=3006
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/business_mensajeria

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email - SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@businessapp.com

# SMS - Twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Business-Report Service
REPORT_SERVICE_URL=http://localhost:3007
REPORT_SERVICE_API_KEY=your-api-key

# Security
API_KEY=your-api-key-here
```

## 🏃 Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start

# Workers (en terminal separado)
npm run worker

# Tests
npm test
```

## 📡 API Endpoints

### Enviar Email
```http
POST /api/messages/email
Headers: x-api-key: your-api-key
Body:
{
  "from": { "email": "sender@example.com", "name": "Sender" },
  "to": [{ "email": "recipient@example.com", "name": "Recipient" }],
  "subject": "Asunto del correo",
  "body": "<h1>Contenido HTML</h1>",
  "isHtml": true,
  "priority": "NORMAL",
  "traceId": "abc-123"
}
```

### Enviar Email con Plantilla
```http
POST /api/messages/email
Body:
{
  "from": { "email": "sender@example.com" },
  "to": [{ "email": "user@example.com" }],
  "subject": "Bienvenido",
  "body": "",
  "templateName": "welcome",
  "templateData": { "userName": "Juan", "companyName": "BusinessApp" }
}
```

### Enviar Email con Reporte
```http
POST /api/messages/email/with-report
Body:
{
  "from": { "email": "reports@businessapp.com" },
  "to": [{ "email": "user@example.com" }],
  "subject": "Tu reporte mensual",
  "body": "<p>Adjunto tu reporte</p>",
  "reportId": "report-123",
  "reportFormat": "pdf"
}
```

### Enviar SMS
```http
POST /api/messages/sms
Headers: x-api-key: your-api-key
Body:
{
  "from": "+1234567890",
  "to": "+0987654321",
  "body": "Tu código de verificación es: 123456",
  "priority": "URGENT"
}
```

### Enviar Batch de Emails
```http
POST /api/messages/email/batch
Body: [{ email1 }, { email2 }, ...]
```

### Consultar Mensajes
```http
GET /api/messages?type=EMAIL&status=SENT&limit=50
Headers: x-api-key: your-api-key
```

### Obtener Mensaje por ID
```http
GET /api/messages/:id
Headers: x-api-key: your-api-key
```

### Estado de Mensaje
```http
GET /api/messages/:id/status
Headers: x-api-key: your-api-key
```

### Reintentar Mensaje Fallido
```http
POST /api/messages/:id/retry
Headers: x-api-key: your-api-key
```

### Reintentar Todos los Fallidos
```http
POST /api/messages/retry/all?limit=100
Headers: x-api-key: your-api-key
```

### Health Check
```http
GET /health
```

## 🔄 Flujo de Trabajo

### Email con Reporte:
1. API recibe solicitud con `reportId`
2. Descarga reporte desde Business-Report
3. Crea email con archivo adjunto
4. Encola en BullMQ (email-queue)
5. EmailWorker procesa
6. Nodemailer envía vía SMTP
7. Actualiza estado en MongoDB
8. Responde con ID y estado

### SMS:
1. API recibe solicitud
2. Valida formato E.164 (+1234567890)
3. Encola en BullMQ (sms-queue)
4. SMSWorker procesa
5. Twilio envía SMS
6. Actualiza estado
7. Reintentos automáticos si falla

## 📧 Plantillas de Email

Crear archivos `.hbs` en `templates/`:

**templates/welcome.hbs:**
```handlebars
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
  </style>
</head>
<body>
  <h1>Bienvenido {{userName}}!</h1>
  <p>Gracias por unirte a {{companyName}}</p>
</body>
</html>
```

Uso:
```json
{
  "templateName": "welcome",
  "templateData": {
    "userName": "Juan",
    "companyName": "BusinessApp"
  }
}
```

## 🔌 Integración con Business-Report

El servicio se comunica con Business-Report para obtener archivos:

```typescript
// Business-Report debe exponer:
GET /api/reports/:id/download?format=pdf
Headers: x-api-key: report-api-key
Response: Binary file (PDF, Excel, CSV)
```

## 📊 Estados de Mensaje

- `PENDING`: Creado, pendiente de encolar
- `QUEUED`: En cola de procesamiento
- `SENDING`: Enviándose actualmente
- `SENT`: Enviado exitosamente
- `FAILED`: Falló el envío
- `RETRY`: En reintento

## 🔁 Reintentos

- Reintentos automáticos: 3 intentos
- Delay exponencial: 1min, 2min, 4min
- Configurable en `.env`: `QUEUE_MAX_RETRIES`

## 🔐 Seguridad

- Autenticación con API Key
- Validación de emails y teléfonos
- Sanitización de HTML
- Rate limiting recomendado
- CORS configurado

## 📦 Docker

**Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY templates ./templates
CMD ["node", "dist/index.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  business-mensajeria:
    build: .
    ports:
      - "3006:3006"
    depends_on:
      - mongodb
      - redis
    environment:
      MONGODB_URI: mongodb://mongodb:27017/business_mensajeria
      REDIS_HOST: redis
```

## 🧪 Testing

```bash
npm test
npm run test:watch
```

## 📝 Ejemplo Completo

```typescript
// Enviar email con reporte adjunto
const response = await fetch('http://localhost:3006/api/messages/email/with-report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key'
  },
  body: JSON.stringify({
    from: { email: 'reports@businessapp.com', name: 'BusinessApp Reports' },
    to: [{ email: 'cliente@example.com', name: 'Cliente' }],
    subject: 'Reporte Mensual - Enero 2025',
    body: '<h2>Hola!</h2><p>Adjunto encuentras tu reporte mensual.</p>',
    reportId: 'report-2025-01',
    reportFormat: 'pdf',
    priority: 'HIGH',
    traceId: 'trace-xyz-789'
  })
});

const result = await response.json();
console.log(result);
// { id: "...", type: "EMAIL", status: "QUEUED", traceId: "trace-xyz-789" }
```

## 🤝 Integración desde otros servicios

**Node.js:**
```javascript
import axios from 'axios';

await axios.post('http://localhost:3006/api/messages/sms', {
  from: '+1234567890',
  to: '+0987654321',
  body: 'Tu código: 123456',
  priority: 'URGENT'
}, {
  headers: { 'x-api-key': 'your-api-key' }
});
```

**Python:**
```python
import requests

requests.post('http://localhost:3006/api/messages/email', 
  json={
    'from': {'email': 'noreply@app.com'},
    'to': [{'email': 'user@example.com'}],
    'subject': 'Notificación',
    'body': '<p>Contenido</p>'
  },
  headers={'x-api-key': 'your-api-key'}
)
```

## 📈 Monitoreo

- Health check: `/health`
- Logs centralizados (Winston)
- Métricas de BullMQ
- Estado de colas en Redis

## 📄 Licencia

Privado - BusinessApp

## 👥 Autor

BusinessApp Development Team

# 🚀 Guía de Instalación y Configuración - Business-Mensajeria

## 📋 Tabla de Contenidos
1. [Herramientas y Tecnologías](#herramientas-y-tecnologías)
2. [Requisitos Previos](#requisitos-previos)
3. [Instalación de Dependencias](#instalación-de-dependencias)
4. [Configuración SMTP (Email)](#configuración-smtp-email)
5. [Configuración SMS (Twilio)](#configuración-sms-twilio)
6. [Configuración de Servicios](#configuración-de-servicios)
7. [Levantar el Microservicio](#levantar-el-microservicio)
8. [Verificación y Pruebas](#verificación-y-pruebas)
9. [Troubleshooting](#troubleshooting)

---

## 🛠️ Herramientas y Tecnologías

### **Backend**
| Herramienta | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20+ | Runtime JavaScript |
| **TypeScript** | 5.3+ | Tipado estático |
| **Express.js** | 4.18+ | Framework HTTP |

### **Bases de Datos**
| Herramienta | Versión | Propósito |
|------------|---------|-----------|
| **MongoDB** | 7.0+ | Almacenamiento de mensajes |
| **Redis** | 7.2+ | Sistema de colas (BullMQ) |

### **Mensajería y Colas**
| Herramienta | Versión | Propósito |
|------------|---------|-----------|
| **BullMQ** | 5.0+ | Gestión de trabajos asíncronos |
| **Kafka** | 3.0+ | Event streaming (opcional) |

### **Proveedores Externos**
| Servicio | Propósito |
|----------|-----------|
| **Nodemailer** | Envío de emails SMTP |
| **Gmail/Outlook/SendGrid** | Servidores SMTP |
| **Twilio** | Envío de SMS |
| **AWS SNS** | Envío de SMS (alternativo) |

### **Utilidades**
| Herramienta | Propósito |
|------------|-----------|
| **Winston** | Logging |
| **Zod** | Validación de schemas |
| **Handlebars** | Plantillas HTML |
| **Axios** | Cliente HTTP |
| **Docker** | Containerización |

---

## 📦 Requisitos Previos

### 1. **Node.js y npm**
```powershell
# Verificar instalación
node --version  # v20.x.x o superior
npm --version   # 10.x.x o superior

# Descargar desde: https://nodejs.org/
```

### 2. **Docker Desktop** (Recomendado)
```powershell
# Verificar instalación
docker --version
docker-compose --version

# Descargar desde: https://www.docker.com/products/docker-desktop/
```

### 3. **Git**
```powershell
git --version

# Descargar desde: https://git-scm.com/
```

---

## 📥 Instalación de Dependencias

### Paso 1: Navegar al Proyecto
```powershell
cd C:\Proyectos\BusinessApp\Business-Mensajeria
```

### Paso 2: Instalar Paquetes npm
```powershell
npm install
```

**Dependencias Principales Instaladas:**
```json
{
  "express": "^4.18.2",           // Framework web
  "mongodb": "^6.3.0",            // Driver MongoDB
  "bullmq": "^5.0.0",             // Sistema de colas
  "ioredis": "^5.3.2",            // Cliente Redis
  "nodemailer": "^6.9.7",         // Envío de emails
  "twilio": "^4.19.0",            // SDK Twilio SMS
  "handlebars": "^4.7.8",         // Plantillas HTML
  "kafkajs": "^2.2.4",            // Cliente Kafka
  "axios": "^1.6.2",              // Cliente HTTP
  "winston": "^3.11.0",           // Logger
  "zod": "^3.22.4"                // Validación
}
```

---

## 📧 Configuración SMTP (Email)

### **Opción 1: Gmail (Recomendado para desarrollo)**

#### Paso 1: Habilitar Verificación en 2 Pasos
1. Ir a [Google Account Security](https://myaccount.google.com/security)
2. Hacer clic en **"Verificación en 2 pasos"**
3. Seguir los pasos para habilitar (requiere teléfono)

![Gmail 2FA](https://i.imgur.com/example.png)

#### Paso 2: Generar Contraseña de Aplicación
1. Ir a [App Passwords](https://myaccount.google.com/apppasswords)
2. En "Seleccionar app" → **Correo**
3. En "Seleccionar dispositivo" → **Otro (nombre personalizado)**
4. Escribir: `BusinessApp`
5. Hacer clic en **Generar**
6. **Copiar la contraseña de 16 caracteres** (ejemplo: `abcd efgh ijkl mnop`)

#### Paso 3: Configurar .env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=tu-email@gmail.com
EMAIL_FROM_NAME=BusinessApp
```

**⚠️ Limitaciones de Gmail:**
- Máximo 500 emails/día
- Máximo 100 destinatarios por email
- Para producción usar SendGrid o AWS SES

---

### **Opción 2: Outlook/Hotmail**

#### Configuración .env
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@outlook.com
SMTP_PASSWORD=tu-contraseña
EMAIL_FROM=tu-email@outlook.com
EMAIL_FROM_NAME=BusinessApp
```

**⚠️ Limitaciones:**
- Máximo 300 emails/día
- Puede requerir verificación de seguridad

---

### **Opción 3: SendGrid (Recomendado para producción)**

#### Paso 1: Crear Cuenta
1. Registrarse en [SendGrid](https://sendgrid.com/)
2. Plan gratuito: 100 emails/día

#### Paso 2: Generar API Key
1. Dashboard → Settings → **API Keys**
2. Clic en **Create API Key**
3. Nombre: `BusinessApp Production`
4. Permisos: **Full Access**
5. **Copiar API Key** (solo se muestra una vez)

#### Paso 3: Verificar Dominio/Email
1. Settings → **Sender Authentication**
2. Verify a Single Sender
3. Verificar email (recibir email de confirmación)

#### Paso 4: Configurar .env
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@tudominio.com
```

**✅ Ventajas SendGrid:**
- Plan gratuito: 100 emails/día
- Plan pagado: hasta 100,000 emails/mes
- IP dedicada disponible
- Analytics y tracking

---

### **Opción 4: AWS SES (Producción)**

#### Paso 1: Crear Cuenta AWS
1. Ir a [AWS Console](https://aws.amazon.com/)
2. Crear cuenta o iniciar sesión

#### Paso 2: Configurar SES
1. Buscar servicio **SES** (Simple Email Service)
2. Seleccionar región (ej: us-east-1)
3. Verify Email Address → agregar tu email
4. Verificar email recibido

#### Paso 3: Salir del Sandbox
1. Por defecto AWS SES está en "Sandbox mode"
2. Solo puedes enviar a emails verificados
3. Solicitar producción: SES → Account Dashboard → Request production access
4. Completar formulario con caso de uso

#### Paso 4: Crear IAM User
1. IAM → Users → Add User
2. Nombre: `ses-businessapp`
3. Permisos: `AmazonSESFullAccess`
4. Crear Access Key
5. Copiar Access Key ID y Secret

#### Paso 5: Configurar .env
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
EMAIL_FROM=noreply@tudominio.com
```

---

## 📱 Configuración SMS (Twilio)

### **Paso 1: Crear Cuenta Twilio**

1. Ir a [Twilio](https://www.twilio.com/try-twilio)
2. Registrarse con email
3. Verificar número de teléfono personal
4. Completar perfil:
   - Rol: Developer
   - Producto: Programmable Messaging
   - Lenguaje: Node.js

### **Paso 2: Obtener Credenciales**

1. Ir al [Dashboard de Twilio](https://console.twilio.com/)
2. Encontrar **Account SID** y **Auth Token**
3. Copiar ambos valores

```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **Paso 3: Comprar Número de Teléfono**

#### Opción A: Cuenta Trial (Gratis)
```
- Twilio asigna un número gratuito
- Solo puedes enviar SMS a números verificados
- Cada SMS incluye: "Sent from your Twilio trial account"
- Crédito: $15 USD
```

#### Opción B: Cuenta de Pago
1. Dashboard → **Phone Numbers** → Buy a Number
2. Filtrar por país (ej: United States)
3. Seleccionar número con capacidad SMS
4. Precio: ~$1 USD/mes + $0.0075 por SMS

### **Paso 4: Verificar Números (Solo Trial)**

Si estás en modo Trial:
1. Dashboard → Phone Numbers → **Verified Caller IDs**
2. Agregar número de destino
3. Twilio enviará código de verificación
4. Ingresar código para verificar

### **Paso 5: Configurar .env**

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+12345678900
```

**📝 Formato del número:**
- Debe estar en formato E.164: `+[código país][número]`
- Ejemplo USA: `+14155551234`
- Ejemplo México: `+525512345678`
- Ejemplo España: `+34612345678`

### **Paso 6: Probar Envío**

```javascript
// Test con curl
curl -X POST https://api.twilio.com/2010-04-01/Accounts/ACxxxxxx/Messages.json \
  --data-urlencode "Body=Hola desde BusinessApp" \
  --data-urlencode "From=+12345678900" \
  --data-urlencode "To=+10987654321" \
  -u ACxxxxxx:your_auth_token
```

---

### **Alternativa: AWS SNS**

#### Paso 1: Configurar SNS
1. AWS Console → SNS (Simple Notification Service)
2. Enable SMS messaging
3. Configurar Sender ID

#### Paso 2: Configurar .env
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_SNS_SENDER_ID=BusinessApp
```

**Costos AWS SNS:**
- USA: $0.00645 por SMS
- México: $0.02 por SMS
- España: $0.04 por SMS

---

## 🗄️ Configuración de Servicios

### **MongoDB**

#### Opción A: Docker (Recomendado)
```powershell
# Levantar MongoDB
docker run -d -p 27017:27017 --name mongodb `
  -e MONGO_INITDB_DATABASE=business_mensajeria `
  -v mongodb_data:/data/db `
  mongo:7
```

#### Opción B: MongoDB Atlas (Cloud)
1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear cluster gratuito
3. Whitelist IP: 0.0.0.0/0 (permitir todas)
4. Crear usuario de base de datos
5. Obtener connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/business_mensajeria
```

#### Configurar .env
```env
MONGODB_URI=mongodb://localhost:27017/business_mensajeria
MONGODB_DB_NAME=business_mensajeria
```

---

### **Redis**

#### Opción A: Docker (Recomendado)
```powershell
# Levantar Redis
docker run -d -p 6379:6379 --name redis `
  -v redis_data:/data `
  redis:7-alpine
```

#### Opción B: Redis Cloud
1. Crear cuenta en [Redis Cloud](https://redis.com/try-free/)
2. Crear base de datos gratuita (30MB)
3. Obtener endpoint y password

#### Configurar .env
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

### **Kafka (Opcional)**

#### Con Docker Compose
```powershell
# Ya incluido en docker-compose.yml
docker-compose up -d kafka zookeeper
```

#### Configurar .env
```env
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=business-mensajeria
KAFKA_TOPIC_MESSAGES=business.messages
```

---

## 🚀 Levantar el Microservicio

### **Método 1: Docker Compose (Recomendado)**

```powershell
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f business-mensajeria

# Detener servicios
docker-compose down
```

---

### **Método 2: Desarrollo Local**

#### Paso 1: Levantar servicios externos
```powershell
# MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:7

# Redis
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

#### Paso 2: Instalar dependencias
```powershell
npm install
```

#### Paso 3: Configurar .env
```powershell
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
notepad .env
```

#### Paso 4: Compilar TypeScript
```powershell
npm run build
```

#### Paso 5: Iniciar servidor
```powershell
# Terminal 1: Servidor API
npm run dev

# Terminal 2: Workers (procesar colas)
npm run worker:dev
```

---

## ✅ Verificación y Pruebas

### **1. Health Check**

```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3006/health"

# Respuesta esperada:
{
  "status": "ok",
  "timestamp": "2025-11-27T10:30:00.000Z",
  "uptime": 123.45
}
```

---

### **2. Enviar Email de Prueba**

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = "your-api-key-here"
}

$body = @{
    from = @{
        email = "sender@example.com"
        name = "BusinessApp"
    }
    to = @(
        @{
            email = "recipient@example.com"
            name = "Test User"
        }
    )
    subject = "Prueba de Email"
    body = "<h1>Hola!</h1><p>Este es un email de prueba.</p>"
    isHtml = $true
    priority = "NORMAL"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3006/api/messages/email" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

**Respuesta esperada:**
```json
{
  "id": "1732705800000-abc123xyz",
  "type": "EMAIL",
  "status": "QUEUED",
  "createdAt": "2025-11-27T10:30:00.000Z",
  "traceId": null
}
```

---

### **3. Enviar SMS de Prueba**

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = "your-api-key-here"
}

$body = @{
    from = "+12345678900"
    to = "+10987654321"
    body = "Hola! Este es un SMS de prueba desde BusinessApp"
    priority = "NORMAL"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3006/api/messages/sms" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

---

### **4. Consultar Estado de Mensaje**

```powershell
$messageId = "1732705800000-abc123xyz"
$headers = @{
    "x-api-key" = "your-api-key-here"
}

Invoke-RestMethod -Uri "http://localhost:3006/api/messages/$messageId/status" `
    -Headers $headers
```

**Respuesta esperada:**
```json
{
  "id": "1732705800000-abc123xyz",
  "status": "SENT",
  "sentAt": "2025-11-27T10:30:15.000Z"
}
```

---

### **5. Verificar Logs**

```powershell
# Ver logs en tiempo real
Get-Content -Path "logs\combined.log" -Wait

# Ver solo errores
Get-Content -Path "logs\error.log" -Wait
```

---

### **6. Monitorear Colas en Redis**

```powershell
# Conectar a Redis
docker exec -it redis redis-cli

# Ver colas
KEYS *queue*

# Ver trabajos pendientes
LLEN bull:email-queue:wait
LLEN bull:sms-queue:wait

# Ver trabajos completados
LLEN bull:email-queue:completed
```

---

## 🔧 Troubleshooting

### **Problema 1: Error al enviar email - "Invalid login"**

**Causa:** Contraseña de aplicación incorrecta o 2FA no habilitado

**Solución:**
```powershell
# 1. Verificar que 2FA esté habilitado en Google
# 2. Regenerar contraseña de aplicación
# 3. Copiar contraseña SIN espacios en .env
SMTP_PASSWORD=abcdefghijklmnop
```

---

### **Problema 2: Redis connection refused**

**Causa:** Redis no está corriendo

**Solución:**
```powershell
# Verificar si Redis está corriendo
docker ps | Select-String "redis"

# Si no está corriendo, levantarlo
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Verificar conexión
docker exec -it redis redis-cli PING
# Respuesta esperada: PONG
```

---

### **Problema 3: MongoDB connection timeout**

**Causa:** MongoDB no está corriendo o puerto incorrecto

**Solución:**
```powershell
# Verificar MongoDB
docker ps | Select-String "mongodb"

# Levantar MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:7

# Verificar conexión
docker exec -it mongodb mongosh --eval "db.version()"
```

---

### **Problema 4: Twilio error 21211 - Invalid 'To' Number**

**Causa:** Número de destino no verificado (cuenta Trial)

**Solución:**
1. Ir a Twilio Console → Phone Numbers → Verified Caller IDs
2. Agregar número de destino
3. Verificar código recibido por SMS
4. Reintentar envío

---

### **Problema 5: Workers no procesan mensajes**

**Causa:** Workers no están corriendo

**Solución:**
```powershell
# Terminal separado para workers
npm run worker:dev

# O en producción
npm run worker
```

---

### **Problema 6: Rate limit excedido**

**Causa:** Demasiados mensajes en poco tiempo

**Solución:**
```env
# Ajustar en .env
EMAIL_RATE_LIMIT=10  # Reducir de 50 a 10
SMS_RATE_LIMIT=5     # Reducir de 10 a 5
```

---

## 📊 Arquitectura del Sistema

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ HTTP POST
       ▼
┌─────────────────┐
│   Express API   │◄──── Auth Middleware
└────────┬────────┘
         │
         ├──► MongoDB (guardar mensaje)
         │
         ▼
    ┌────────┐
    │ BullMQ │◄──── Redis
    └───┬────┘
        │
        ├──► EmailWorker ──► Nodemailer ──► SMTP Server
        │
        └──► SMSWorker ──► Twilio API ──► SMS Gateway
```

---

## 📝 Checklist de Configuración

- [ ] Node.js 20+ instalado
- [ ] Docker instalado y corriendo
- [ ] MongoDB levantado (puerto 27017)
- [ ] Redis levantado (puerto 6379)
- [ ] Gmail 2FA habilitado
- [ ] Contraseña de aplicación generada
- [ ] Twilio Account SID obtenido
- [ ] Twilio Auth Token obtenido
- [ ] Número de Twilio comprado/asignado
- [ ] Archivo .env configurado
- [ ] npm install ejecutado
- [ ] Servidor iniciado (puerto 3006)
- [ ] Workers corriendo
- [ ] Health check funcionando
- [ ] Email de prueba enviado exitosamente
- [ ] SMS de prueba enviado exitosamente

---

## 🎯 Próximos Pasos

1. **Configurar plantillas personalizadas** en `/templates`
2. **Integrar con Business-Report** para adjuntar PDFs
3. **Configurar Kafka** para eventos entre microservicios
4. **Implementar rate limiting** en producción
5. **Configurar monitoreo** con Prometheus/Grafana
6. **Agregar tests** unitarios e integración

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Nodemailer Docs](https://nodemailer.com/)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [BullMQ Guide](https://docs.bullmq.io/)
- [MongoDB Node Driver](https://www.mongodb.com/docs/drivers/node/)
- [Redis Commands](https://redis.io/commands/)

### Tutoriales
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Twilio Quickstart](https://www.twilio.com/docs/sms/quickstart/node)
- [SendGrid Setup](https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs)

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisar logs**: `logs/error.log`
2. **Verificar .env**: Credenciales correctas
3. **Verificar servicios**: Docker containers corriendo
4. **Consultar README.md**: Documentación adicional
5. **Contactar equipo**: BusinessApp Development Team

---

**Última actualización:** Noviembre 27, 2025  
**Versión:** 1.0.0  
**Autor:** BusinessApp Development Team

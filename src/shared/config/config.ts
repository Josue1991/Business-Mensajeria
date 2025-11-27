import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: Number.parseInt(process.env.PORT || '3006'),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/business_mensajeria',
    dbName: process.env.MONGODB_DB_NAME || 'business_mensajeria'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number.parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || ''
    },
    from: process.env.EMAIL_FROM || 'noreply@businessapp.com',
    fromName: process.env.EMAIL_FROM_NAME || 'BusinessApp',
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM_EMAIL
    }
  },
  sms: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
    },
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      senderId: process.env.AWS_SNS_SENDER_ID || 'BusinessApp'
    }
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'business-mensajeria',
    groupId: process.env.KAFKA_GROUP_ID || 'business-mensajeria-group',
    topicMessages: process.env.KAFKA_TOPIC_MESSAGES || 'business.messages',
    topicLogs: process.env.KAFKA_TOPIC_LOGS || 'business.logs'
  },
  reportService: {
    url: process.env.REPORT_SERVICE_URL || 'http://localhost:3007',
    apiKey: process.env.REPORT_SERVICE_API_KEY || ''
  },
  queue: {
    emailName: process.env.QUEUE_EMAIL_NAME || 'email-queue',
    smsName: process.env.QUEUE_SMS_NAME || 'sms-queue',
    maxRetries: Number.parseInt(process.env.QUEUE_MAX_RETRIES || '3'),
    retryDelay: Number.parseInt(process.env.QUEUE_RETRY_DELAY || '60000')
  },
  rateLimit: {
    email: Number.parseInt(process.env.EMAIL_RATE_LIMIT || '50'),
    sms: Number.parseInt(process.env.SMS_RATE_LIMIT || '10')
  },
  security: {
    apiKey: process.env.API_KEY || 'your-api-key-here'
  }
};

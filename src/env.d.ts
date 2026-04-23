import 'dotenv/config'
import { z } from 'zod'
const envSchema = z.object({
  MODE: z.enum(['production', 'development', 'test']).default('development'),
  NEXT_PUBLIC_INSTANCE_ADDRESS_CLOUD: z
    .string(),
    NEXT_PUBLIC_BASE_URL_CLOUD: z
    .string()
    .default('https://pluricall.altitudecloud.com/uagentweb8'),
  NEXT_PUBLIC_BASE_URL_API: z.string().default('http://localhost:3001/api'),
  NEXT_PUBLIC_INSTANCE_ADDRESS_ON_PREM: z
    .string(),
  API_VERSION: z.string().default('8.6.2000'),
  
  DATABASE_URL_MONGO: z.string(),
  DATABASE_URL_POSTGRES: z
  .string()
  .default('postgresql://insight:insight@localhost:5433/insightdb'),

  API_VERSION: z.string(),
  SMTP_HOST: z.string().default('mail.pluricall.pt'),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().default('no_reply@pluricall.pt'),
  SMTP_PASS: z.string().default('GxTo7rbi6gUe'),
  SMTP_FROM_NAME: z.string().default('Contact Center Pluricall'),
  SMTP_FROM_EMAIL: z.string().default('no_reply@pluricall.pt'),
  GO_CONTACT_DOMAIN: z.string().default('707f0f21-7fce-4107-b438-70c61488f176'),
  GO_CONTACT_PASSWORD: z.string().default(
    '7b152bf070a568d941b8e3d93031983769502c0ccecc2bab91a93bf72d7445b029eeb412387cb0661634b0ef490dcccc775bbb8c0f385c21b93a2aacf262ab4e'
  ),
  GO_CONTACT_USERNAME: z.string().default('rubenlanca'),
});

envSchema.parse(process.env)

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

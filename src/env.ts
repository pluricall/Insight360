import 'dotenv/config'
import { z } from 'zod'
const envSchema = z.object({
  MODE: z.enum(['production', 'development', 'test']).default('development'),
  NEXT_PUBLIC_BASE_URL_CLOUD: z.string().default('https://pluricall.altitudecloud.com/uagentweb8'),
  NEXT_PUBLIC_INSTANCE_ADDRESS_CLOUD: z.string().default('192.168.0.160:1500'),
  NEXT_PUBLIC_BASE_URL_ONPREMISE: z.string().default('http://localhost/uAgentWeb8'),
  NEXT_PUBLIC_INSTANCE_ADDRESS_ONPREMISE: z.string().default('lion:1500'),
  NEXT_PUBLIC_BASE_URL_API: z.string().default('http://localhost:3000/api'),
  API_VERSION: z.string().default('8.6.2000'),
  DATABASE_URL: z.string().default('mongodb+srv://ryanpluricall:CUnYWr2eFlQEjuoe@ryanmartins.fed1y.mongodb.net/?retryWrites=true&w=majority&appName=RyanMartins')
});
export const env = envSchema.parse(process.env)
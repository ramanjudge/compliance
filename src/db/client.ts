import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { getRequestContext } from '@cloudflare/next-on-pages';

export function getDb() {
  const dbBinding = getRequestContext().env.DB;
  return drizzle(dbBinding, { schema });
}

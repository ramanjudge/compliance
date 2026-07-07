import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export function getDb() {
  const dbBinding = getCloudflareContext().env.DB;
  return drizzle(dbBinding, { schema });
}

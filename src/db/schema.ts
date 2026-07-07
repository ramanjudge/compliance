import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// States
export const states = sqliteTable('states', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  updateFrequency: text('update_frequency'),
  wageCodeStatus: text('wage_code_status').default('Legacy'),
});

// City to Zone Mapping
export const cityZones = sqliteTable('city_zones', {
  id: text('id').primaryKey(),
  stateId: text('state_id')
    .references(() => states.id)
    .notNull(),
  cityName: text('city_name').notNull(),
  zoneName: text('zone_name').notNull(),
});

// Wages Master Table
export const wages = sqliteTable('wages', {
  id: text('id').primaryKey(),
  stateId: text('state_id')
    .references(() => states.id)
    .notNull(),
  zone: text('zone'),
  industry: text('industry').notNull(),
  skillLevel: text('skill_level').notNull(),
  category: text('category'),
  basicWage: real('basic_wage').notNull(),
  vda: real('vda').notNull().default(0),
  hra: real('hra').notNull().default(0),
  totalMonthly: real('total_monthly').generatedAlwaysAs(sql`(basic_wage + vda + hra)`),
  totalDaily: real('total_daily'),
  effectiveFrom: integer('effective_from', { mode: 'timestamp_ms' }).notNull(),
  notificationDate: integer('notification_date', { mode: 'timestamp_ms' }),
  sourceUrl: text('source_url'),
  pdfUrl: text('pdf_url'),
  status: text('status').default('pending_review'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(strftime('%s', 'now') * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(strftime('%s', 'now') * 1000)`),
});

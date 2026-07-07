'use server';

import { getDb } from '@/db/client';
import { wages, states, cityZones } from '@/db/schema';
import { eq, or, and, like, desc } from 'drizzle-orm';

export async function searchWages(query: string) {
  if (!query || query.length < 2) return [];
  const db = getDb();
  
  const searchPattern = `%${query}%`;

  const results = await db
    .select({
      id: wages.id,
      industry: wages.industry,
      skillLevel: wages.skillLevel,
      category: wages.category,
      zone: wages.zone,
      totalMonthly: wages.totalMonthly,
      stateName: states.name,
      effectiveFrom: wages.effectiveFrom,
    })
    .from(wages)
    .innerJoin(states, eq(wages.stateId, states.id))
    .where(
      and(
        eq(wages.status, 'published'),
        or(
          like(wages.industry, searchPattern),
          like(wages.skillLevel, searchPattern),
          like(wages.category, searchPattern),
          like(states.name, searchPattern)
        )
      )
    )
    .limit(20);

  return results;
}

export async function getStates() {
  const db = getDb();
  return db
    .select({
      id: states.id,
      name: states.name,
      slug: states.slug,
      updateFrequency: states.updateFrequency,
      wageCodeStatus: states.wageCodeStatus,
    })
    .from(states)
    .orderBy(states.name);
}

export async function getWagesByStateSlug(slug: string) {
  const db = getDb();
  const stateWages = await db
    .select({
      id: wages.id,
      industry: wages.industry,
      skillLevel: wages.skillLevel,
      category: wages.category,
      zone: wages.zone,
      basicWage: wages.basicWage,
      vda: wages.vda,
      hra: wages.hra,
      totalMonthly: wages.totalMonthly,
      effectiveFrom: wages.effectiveFrom,
      notificationDate: wages.notificationDate,
      updatedAt: wages.updatedAt,
      sourceUrl: wages.sourceUrl,
      stateName: states.name,
      status: wages.status,
      wageCodeStatus: states.wageCodeStatus,
    })
    .from(wages)
    .innerJoin(states, eq(wages.stateId, states.id))
    .where(eq(states.slug, slug))
    .orderBy(desc(wages.effectiveFrom), wages.industry, wages.skillLevel);
    
  return stateWages;
}

// INDUSTRY ACTIONS
export async function getIndustries() {
  const db = getDb();
  // Get unique industries from published wages
  const industryList = await db
    .select({ industry: wages.industry })
    .from(wages)
    .where(eq(wages.status, 'published'))
    .groupBy(wages.industry)
    .orderBy(wages.industry);
  
  return industryList.map(i => i.industry);
}

export async function getWagesByIndustry(industryName: string) {
  const db = getDb();
  const decodedIndustryName = decodeURIComponent(industryName);
  const industryWages = await db
    .select({
      id: wages.id,
      industry: wages.industry,
      skillLevel: wages.skillLevel,
      category: wages.category,
      zone: wages.zone,
      basicWage: wages.basicWage,
      vda: wages.vda,
      hra: wages.hra,
      totalMonthly: wages.totalMonthly,
      effectiveFrom: wages.effectiveFrom,
      notificationDate: wages.notificationDate,
      updatedAt: wages.updatedAt,
      sourceUrl: wages.sourceUrl,
      stateName: states.name,
      stateSlug: states.slug,

      updateFrequency: states.updateFrequency,
      wageCodeStatus: states.wageCodeStatus,
    })
    .from(wages)
    .innerJoin(states, eq(wages.stateId, states.id))
    .where(
      and(
        eq(wages.status, 'published'),
        eq(wages.industry, decodedIndustryName)
      )
    )
    .orderBy(states.name, desc(wages.effectiveFrom), wages.skillLevel);
    
  return industryWages;
}

// ADMIN ACTIONS
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { revalidatePath } from 'next/cache';

export async function getPendingWages() {
  const db = getDb();
  const pendingWages = await db
    .select({
      id: wages.id,
      industry: wages.industry,
      skillLevel: wages.skillLevel,
      category: wages.category,
      zone: wages.zone,
      totalMonthly: wages.totalMonthly,
      effectiveFrom: wages.effectiveFrom,
      sourceUrl: wages.sourceUrl,
      pdfUrl: wages.pdfUrl,
      stateName: states.name,
    })
    .from(wages)
    .innerJoin(states, eq(wages.stateId, states.id))
    .where(eq(wages.status, 'pending_review'))
    .orderBy(desc(wages.createdAt));
    
  return pendingWages;
}

export async function publishWage(id: string) {
  const db = getDb();
  await db.update(wages).set({ status: 'published' }).where(eq(wages.id, id));
  revalidatePath('/admin');
  revalidatePath('/states');
}

export async function deleteWage(id: string) {
  const db = getDb();
  await db.delete(wages).where(eq(wages.id, id));
  revalidatePath('/admin');
}

export async function uploadPdfToR2(formData: FormData) {
  const file = formData.get('file') as File;
  const wageId = formData.get('wageId') as string;
  
  if (!file || !wageId) {
    throw new Error('File and Wage ID are required');
  }

  const r2 = getCloudflareContext().env.R2_STORAGE;
  const fileExtension = file.name.split('.').pop() || 'pdf';
  const objectKey = `pdfs/${wageId}-${Date.now()}.${fileExtension}`;
  
  const arrayBuffer = await file.arrayBuffer();
  
  await r2.put(objectKey, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
    },
  });

  const pdfUrl = `https://r2.yourdomain.com/${objectKey}`; // Replace with your actual R2 public URL

  const db = getDb();
  await db.update(wages).set({ pdfUrl }).where(eq(wages.id, wageId));
  revalidatePath('/admin');
  
  return { success: true, url: pdfUrl };
}


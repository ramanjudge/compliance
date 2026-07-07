import { NextResponse } from 'next/server';
import { getDb } from '@/db/client';
import { wages, states } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { crypto } from 'crypto';

// In production, use environment variables for this API key.
// Here we hardcode for MVP simplicity and testability.
const API_SECRET = 'super-secret-crawler-key-2026';

export async function POST(request: Request) {
  try {
    // 1. Basic API Key Authentication
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse payload
    const body = await request.json();
    const { 
      stateSlug, 
      industry, 
      skillLevel, 
      category, 
      zone, 
      basicWage, 
      vda, 
      hra, 
      effectiveFrom, // Unix timestamp in ms
      notificationDate, // Unix timestamp in ms
      sourceUrl,
      pdfUrl
    } = body;

    if (!stateSlug || !industry || !skillLevel || basicWage === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();

    // 3. Look up state ID
    const stateRecord = await db.select({ id: states.id }).from(states).where(eq(states.slug, stateSlug)).limit(1);
    
    if (stateRecord.length === 0) {
      return NextResponse.json({ error: `State slug '${stateSlug}' not found.` }, { status: 404 });
    }

    const stateId = stateRecord[0].id;

    // 3.5 Deduplication Check
    // Check if an identical wage record already exists (regardless of whether it's published or pending)
    const existingWage = await db.select({ id: wages.id }).from(wages).where(
      and(
        eq(wages.stateId, stateId),
        eq(wages.industry, industry),
        eq(wages.skillLevel, skillLevel),
        eq(wages.basicWage, basicWage),
        eq(wages.vda, vda || 0)
      )
    ).limit(1);

    if (existingWage.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Identical wage data already exists. Skipping insertion to prevent duplicates.',
        id: existingWage[0].id,
        skipped: true
      }, { status: 200 });
    }

    const wageId = `${stateId}_scraped_${Date.now()}`;

    // 4. Insert as pending_review
    await db.insert(wages).values({
      id: wageId,
      stateId,
      industry,
      skillLevel,
      category: category || null,
      zone: zone || null,
      basicWage,
      vda: vda || 0,
      hra: hra || 0,
      effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
      notificationDate: notificationDate ? new Date(notificationDate) : null,
      sourceUrl: sourceUrl || null,
      pdfUrl: pdfUrl || null,
      status: 'pending_review',
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Wage data ingested successfully into the pending queue.',
      id: wageId
    }, { status: 201 });

  } catch (error: any) {
    console.error('Ingestion Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

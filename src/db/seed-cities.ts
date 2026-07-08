import { getDb } from './client';
import { cityZones, states } from './schema';
import { eq } from 'drizzle-orm';

// A representative list of top metros, industrial hubs, and state capitals.
// In reality, each state has specific zoning rules. Here we map them logically.
const CITY_ZONES = [
  // Haryana (Gurgaon, Faridabad are Zone A)
  { city: 'Gurgaon', zone: 'Zone A', stateSlug: 'hr' },
  { city: 'Faridabad', zone: 'Zone A', stateSlug: 'hr' },
  { city: 'Panipat', zone: 'Zone A', stateSlug: 'hr' },
  { city: 'Karnal', zone: 'Zone B', stateSlug: 'hr' },
  { city: 'Ambala', zone: 'Zone B', stateSlug: 'hr' },
  
  // Maharashtra (Mumbai, Pune are Zone 1/A)
  { city: 'Mumbai', zone: 'Zone I', stateSlug: 'mh' },
  { city: 'Pune', zone: 'Zone I', stateSlug: 'mh' },
  { city: 'Nagpur', zone: 'Zone II', stateSlug: 'mh' },
  { city: 'Nashik', zone: 'Zone II', stateSlug: 'mh' },
  { city: 'Aurangabad', zone: 'Zone II', stateSlug: 'mh' },
  
  // Karnataka (Bangalore is Zone 1)
  { city: 'Bangalore', zone: 'Zone 1', stateSlug: 'ka' },
  { city: 'Bengaluru', zone: 'Zone 1', stateSlug: 'ka' }, // alias
  { city: 'Mysore', zone: 'Zone 2', stateSlug: 'ka' },
  { city: 'Hubli', zone: 'Zone 2', stateSlug: 'ka' },
  { city: 'Mangalore', zone: 'Zone 2', stateSlug: 'ka' },
  
  // Tamil Nadu (Chennai is Zone A)
  { city: 'Chennai', zone: 'Zone A', stateSlug: 'tn' },
  { city: 'Coimbatore', zone: 'Zone B', stateSlug: 'tn' },
  { city: 'Madurai', zone: 'Zone B', stateSlug: 'tn' },
  { city: 'Tiruchirappalli', zone: 'Zone C', stateSlug: 'tn' },
  
  // Telangana
  { city: 'Hyderabad', zone: 'Zone I', stateSlug: 'tg' },
  { city: 'Warangal', zone: 'Zone II', stateSlug: 'tg' },
  
  // Gujarat
  { city: 'Ahmedabad', zone: 'Zone 1', stateSlug: 'gj' },
  { city: 'Surat', zone: 'Zone 1', stateSlug: 'gj' },
  { city: 'Vadodara', zone: 'Zone 1', stateSlug: 'gj' },
  { city: 'Rajkot', zone: 'Zone 2', stateSlug: 'gj' },
  
  // Uttar Pradesh
  { city: 'Noida', zone: 'Zone A', stateSlug: 'up' },
  { city: 'Greater Noida', zone: 'Zone A', stateSlug: 'up' },
  { city: 'Ghaziabad', zone: 'Zone A', stateSlug: 'up' },
  { city: 'Lucknow', zone: 'Zone A', stateSlug: 'up' },
  { city: 'Kanpur', zone: 'Zone A', stateSlug: 'up' },
  { city: 'Agra', zone: 'Zone B', stateSlug: 'up' },
  
  // West Bengal
  { city: 'Kolkata', zone: 'Zone A', stateSlug: 'wb' },
  { city: 'Howrah', zone: 'Zone A', stateSlug: 'wb' },
  { city: 'Darjeeling', zone: 'Zone B', stateSlug: 'wb' },
  
  // Delhi (Has no zones, but good to have)
  { city: 'New Delhi', zone: 'General', stateSlug: 'dl' },
  { city: 'Delhi', zone: 'General', stateSlug: 'dl' },
  
  // Rajasthan
  { city: 'Jaipur', zone: 'Zone 1', stateSlug: 'rj' },
  { city: 'Jodhpur', zone: 'Zone 2', stateSlug: 'rj' },
  
  // Punjab
  { city: 'Ludhiana', zone: 'Zone 1', stateSlug: 'pb' },
  { city: 'Amritsar', zone: 'Zone 1', stateSlug: 'pb' },
  { city: 'Chandigarh', zone: 'General', stateSlug: 'ch' }, // UT
  
  // Bihar
  { city: 'Patna', zone: 'Zone 1', stateSlug: 'br' },
  
  // MP
  { city: 'Indore', zone: 'Zone 1', stateSlug: 'mp' },
  { city: 'Bhopal', zone: 'Zone 1', stateSlug: 'mp' },
  
  // Kerala
  { city: 'Kochi', zone: 'Zone A', stateSlug: 'kl' },
  { city: 'Thiruvananthapuram', zone: 'Zone A', stateSlug: 'kl' },
];

export async function seedCityZones() {
  const db = getDb();
  console.log('🌱 Seeding City-to-Zone Mappings...');

  for (const mapping of CITY_ZONES) {
    const stateRecord = await db.select({ id: states.id }).from(states).where(eq(states.slug, mapping.stateSlug)).limit(1);
    
    if (stateRecord.length > 0) {
      const stateId = stateRecord[0].id;
      const cityId = `${mapping.stateSlug}_${mapping.city.toLowerCase().replace(/\\s+/g, '_')}`;
      
      try {
        await db.insert(cityZones).values({
          id: cityId,
          stateId: stateId,
          cityName: mapping.city,
          zoneName: mapping.zone,
        });
        console.log(`✅ Mapped ${mapping.city} -> ${mapping.zone} (${mapping.stateSlug})`);
      } catch (e: any) {
        if (e.message.includes('UNIQUE constraint failed') || e.code === 'SQLITE_CONSTRAINT') {
          // Already exists
        } else {
          console.error(`Failed to map ${mapping.city}:`, e);
        }
      }
    }
  }
}

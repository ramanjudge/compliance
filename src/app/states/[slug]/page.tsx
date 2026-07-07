import { getWagesByStateSlug, getStates } from "@/app/actions";
import { notFound } from "next/navigation";
import { FileText, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateStaticParams() {
  const states = await getStates();
  return states.map((state) => ({
    slug: state.slug,
  }));
}

export default async function StatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const stateWages = await getWagesByStateSlug(slug);

  if (!stateWages || stateWages.length === 0) {
    notFound();
  }

  const stateName = stateWages[0].stateName;
  const wageCodeStatus = stateWages[0].wageCodeStatus;

  // Group by industry
  const groupedWages = stateWages.reduce((acc, curr) => {
    if (!acc[curr.industry]) {
      acc[curr.industry] = [];
    }
    acc[curr.industry].push(curr);
    return acc;
  }, {} as Record<string, typeof stateWages>);

  // Find the most recent dates across all wages for this state
  const lastUpdated = new Date(Math.max(...stateWages.map(w => w.updatedAt ? new Date(w.updatedAt).getTime() : 0)));
  const lastEffective = new Date(Math.max(...stateWages.map(w => w.effectiveFrom ? new Date(w.effectiveFrom).getTime() : 0)));
  
  // Find the most recent notification date (if available)
  const validNotificationDates = stateWages.map(w => w.notificationDate ? new Date(w.notificationDate).getTime() : 0).filter(d => d > 0);
  const lastNotified = validNotificationDates.length > 0 ? new Date(Math.max(...validNotificationDates)) : null;

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="mb-12 border-b pb-8">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-4xl font-extrabold tracking-tight">{stateName} - Minimum Wages</h1>
          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary/80 text-secondary-foreground border">
            Wage Code 2025: {wageCodeStatus}
          </div>
        </div>
        <p className="text-muted-foreground text-lg mb-6">
          Explore the statutory minimum wages, categorizations, and compliance requirements for {stateName}.
        </p>
        
        <div className="flex flex-wrap gap-4 items-center text-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4 bg-secondary/50 px-4 py-3 rounded-lg border border-secondary">
            <div className="flex items-center cursor-help" title="The date from when these rates are legally applicable.">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              <span className="text-muted-foreground mr-1 border-b border-dotted border-muted-foreground/50">With Effect From:</span>
              <span className="font-semibold">{lastEffective.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', day: 'numeric' })}</span>
            </div>
            {lastNotified && (
              <>
                <div className="hidden sm:block border-l border-border h-4 mx-2"></div>
                <div className="flex items-center cursor-help" title="The date the official notification or gazette was published.">
                  <FileText className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-muted-foreground mr-1 border-b border-dotted border-muted-foreground/50">Last Notified:</span>
                  <span className="font-semibold">{lastNotified.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', day: 'numeric' })}</span>
                </div>
              </>
            )}
            <div className="hidden sm:block border-l border-border h-4 mx-2"></div>
            <div className="flex items-center cursor-help" title="The date our system last verified these rates against the official source.">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              <span className="text-muted-foreground mr-1 border-b border-dotted border-muted-foreground/50">System Checked:</span>
              <span className="font-semibold">{lastUpdated.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', day: 'numeric' })}</span>
            </div>
          </div>

          {stateWages[0].sourceUrl && (
            <a 
              href={stateWages[0].sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-primary hover:underline bg-primary/10 px-4 py-3 rounded-lg font-medium ml-auto border border-primary/20 transition-colors hover:bg-primary/20"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Official Source
            </a>
          )}
        </div>
      </div>

      <div className="space-y-12">
        {Object.entries(groupedWages).map(([industry, industryWages]) => (
          <section key={industry} className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-muted/50 px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">{industry}</h2>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <FileText className="mr-2 h-4 w-4" />
                View Gazette
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Skill Level / Category</th>
                    <th className="px-6 py-4 font-semibold">Zone</th>
                    <th className="px-6 py-4 font-semibold text-right">Basic Wage</th>
                    <th className="px-6 py-4 font-semibold text-right">VDA</th>
                    <th className="px-6 py-4 font-semibold text-right text-primary">Total (Monthly)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {industryWages.map((wage) => (
                    <tr key={wage.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          {wage.skillLevel}
                          {wage.status === 'pending_review' && (
                            <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-500/20 text-amber-600 rounded-full border border-amber-500/30 cursor-help" title="This rate was fetched automatically and is awaiting human verification">
                              Pending Verification
                            </span>
                          )}
                        </div>
                        {wage.category && <div className="text-muted-foreground text-xs mt-1">{wage.category}</div>}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {wage.zone || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        ₹{wage.basicWage.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        ₹{wage.vda.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-base text-primary">₹{wage.totalMonthly?.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

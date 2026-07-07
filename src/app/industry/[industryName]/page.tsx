import { getWagesByIndustry, getIndustries } from "@/app/actions";
import { notFound } from "next/navigation";
import { ExternalLink } from "@/components/icons";
import Link from "next/link";

export async function generateStaticParams() {
  const industries = await getIndustries();
  return industries.map((industry) => ({
    industryName: encodeURIComponent(industry),
  }));
}

export default async function IndustryPage({ params }: { params: Promise<{ industryName: string }> }) {
  const { industryName } = await params;
  const wages = await getWagesByIndustry(industryName);

  if (!wages || wages.length === 0) {
    notFound();
  }

  const decodedIndustry = decodeURIComponent(industryName);

  // Group by State
  const groupedWages = wages.reduce((acc, curr) => {
    if (!acc[curr.stateName]) {
      acc[curr.stateName] = [];
    }
    acc[curr.stateName].push(curr);
    return acc;
  }, {} as Record<string, typeof wages>);

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="mb-12 border-b pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">{decodedIndustry} - Minimum Wages</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Compare statutory minimum wage rates for {decodedIndustry} across different states.
        </p>
      </div>

      <div className="space-y-12">
        {Object.entries(groupedWages).map(([state, stateWages]) => (
          <section key={state} className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-muted/50 px-6 py-4 border-b flex justify-between items-center">
              <Link href={`/states/${stateWages[0].stateSlug}`} className="hover:underline">
                <h2 className="text-2xl font-bold">{state}</h2>
              </Link>
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
                  {stateWages.map((wage) => (
                    <tr key={wage.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{wage.skillLevel}</div>
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

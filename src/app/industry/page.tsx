import { getIndustries } from "@/app/actions";
import Link from "next/link";
import { ArrowRight, Building2 } from "@/components/icons";

export default async function IndustryIndex() {
  const industries = await getIndustries();

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-3">Industry Rates</h1>
        <p className="text-muted-foreground text-lg">
          Select an industry below to compare its statutory minimum wages across different states and union territories.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {industries.map((industry) => (
          <Link href={`/industry/${encodeURIComponent(industry)}`} key={industry} className="block group">
            <div className="bg-card p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col h-full">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{industry}</h3>
              <div className="mt-auto pt-4 flex items-center justify-end text-sm">
                <span className="text-primary font-medium flex items-center">
                  Compare Rates <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

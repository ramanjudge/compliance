import { getStates } from "@/app/actions";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

export default async function StatesIndex() {
  const states = await getStates();

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-3">States & Union Territories</h1>
        <p className="text-muted-foreground text-lg">
          Select a state below to view its latest minimum wage notifications, VDA updates, and scheduled employment rates.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {states.map((state) => (
          <Link href={`/states/${state.slug}`} key={state.id} className="block group">
            <div className="bg-card p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col h-full">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{state.name}</h3>
              <div className="mt-auto pt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Updated {state.updateFrequency}</span>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

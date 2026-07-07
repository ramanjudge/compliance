import Link from "next/link";
import { ArrowRight, MapPin, Building2, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-primary/10 to-background pt-24 pb-16 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          India Minimum Wage <span className="text-primary">Tracker</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          The most comprehensive and up-to-date repository of state-wise minimum wages, VDA revisions, and compliance data across India.
        </p>

        {/* Search Bar Component */}
        <div className="mt-8">
          <SearchBar />
        </div>
      </section>

      {/* Features / Quick Links */}
      <section className="w-full max-w-5xl mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-start">
          <div className="bg-primary/10 p-3 rounded-lg mb-4">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Browse by State</h3>
          <p className="text-muted-foreground mb-4 flex-1">
            View detailed minimum wage notifications, VDA updates, and historical trends for every state and union territory.
          </p>
          <Link href="/states" className="text-primary font-semibold flex items-center hover:underline">
            View States <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-start">
          <div className="bg-primary/10 p-3 rounded-lg mb-4">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Industry Rates</h3>
          <p className="text-muted-foreground mb-4 flex-1">
            Check scheduled employment rates for construction, security, housekeeping, IT, and more.
          </p>
          <Link href="/industry" className="text-primary font-semibold flex items-center hover:underline">
            View Industries <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-start">
          <div className="bg-primary/10 p-3 rounded-lg mb-4">
            <UserCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Salary Calculator</h3>
          <p className="text-muted-foreground mb-4 flex-1">
            Instantly calculate basic, VDA, HRA and total monthly/daily wages based on current legal requirements.
          </p>
          <Link href="/calculator" className="text-primary font-semibold flex items-center hover:underline">
            Open Calculator <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

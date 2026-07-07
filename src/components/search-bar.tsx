'use client';

import { useState, useTransition, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { searchWages } from '@/app/actions';
import Link from 'next/link';
import { useDebounce } from '@/lib/hooks/use-debounce';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      startTransition(async () => {
        const data = await searchWages(debouncedQuery);
        setResults(data);
        setShowResults(true);
      });
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [debouncedQuery]);

  return (
    <div className="relative max-w-3xl mx-auto w-full">
      <div className="bg-card rounded-full border shadow-sm flex items-center p-2 pl-6 focus-within:ring-2 focus-within:ring-primary/20">
        <Search className="h-5 w-5 text-muted-foreground mr-4" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by state, city, industry, or skill (e.g., Security Guard in Gurgaon)" 
          className="flex-1 bg-transparent border-none outline-none text-base h-10"
        />
        <Button className="rounded-full px-8" onClick={() => {}}>Search</Button>
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-lg z-50 overflow-hidden max-h-[400px] overflow-y-auto">
          {isPending && <div className="p-4 text-center text-muted-foreground">Searching...</div>}
          {!isPending && results.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">No results found for "{query}"</div>
          )}
          {!isPending && results.length > 0 && (
            <ul className="divide-y">
              {results.map((item) => (
                <li key={item.id} className="hover:bg-muted/50 transition-colors">
                  <Link href={`/states/${item.stateName.toLowerCase()}`} className="block p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-foreground">{item.industry}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.skillLevel} {item.category ? `(${item.category})` : ''} • {item.stateName} {item.zone ? `- ${item.zone}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary text-lg">₹{item.totalMonthly?.toFixed(2)}</span>
                        <p className="text-xs text-muted-foreground">/ month</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

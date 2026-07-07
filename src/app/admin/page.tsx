import { getPendingWages } from "@/app/actions";
import { AdminTable } from "./admin-table";

export default async function AdminPage() {
  const pendingWages = await getPendingWages();

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Review, approve, and upload PDFs for pending minimum wage records scraped by the automated crawler.
        </p>
      </div>
      
      <AdminTable initialWages={pendingWages} />
    </div>
  );
}

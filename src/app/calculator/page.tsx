import { getStates } from "@/app/actions";
import { SalaryCalculatorForm } from "./calculator-form";

export default async function CalculatorPage() {
  const states = await getStates();

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-3">Salary Compliance Calculator</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Calculate the statutory minimum wage requirements for your employees based on state, industry, and skill level.
        </p>
      </div>

      <SalaryCalculatorForm states={states} />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { getWagesByStateSlug } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

export function SalaryCalculatorForm({ states }: { states: any[] }) {
  const [selectedState, setSelectedState] = useState('');
  const [wagesData, setWagesData] = useState<any[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [skills, setSkills] = useState<any[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [includePF, setIncludePF] = useState(false);
  const [includeESI, setIncludeESI] = useState(false);
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedState) {
      setLoading(true);
      getWagesByStateSlug(selectedState).then((data) => {
        setWagesData(data);
        const uniqueIndustries = Array.from(new Set(data.map((w) => w.industry)));
        setIndustries(uniqueIndustries);
        setSelectedIndustry('');
        setSkills([]);
        setSelectedSkillId('');
        setResult(null);
        setLoading(false);
      });
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedIndustry) {
      const availableSkills = wagesData.filter(w => w.industry === selectedIndustry);
      setSkills(availableSkills);
      setSelectedSkillId('');
      setResult(null);
    }
  }, [selectedIndustry, wagesData]);

  const handleCalculate = () => {
    if (!selectedSkillId) return;
    const selectedWage = skills.find(s => s.id === selectedSkillId);
    if (selectedWage) {
      const pfApplicableSalary = Math.min(selectedWage.basicWage + selectedWage.vda, 15000);
      const employeePF = includePF ? pfApplicableSalary * 0.12 : 0;
      const employerPF = includePF ? pfApplicableSalary * 0.12 : 0;

      const employeeESI = includeESI ? selectedWage.totalMonthly * 0.0075 : 0;
      const employerESI = includeESI ? selectedWage.totalMonthly * 0.0325 : 0;

      setResult({
        ...selectedWage,
        daily: selectedWage.totalMonthly / 26,
        hourly: selectedWage.totalMonthly / (26 * 8),
        employeePF,
        employerPF,
        employeeESI,
        employerESI,
        takeHome: selectedWage.totalMonthly - employeePF - employeeESI,
        ctc: selectedWage.totalMonthly + employerPF + employerESI,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Select State</label>
          <select 
            className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="">-- Choose a State --</option>
            {states.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select Industry</label>
          <select 
            className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            disabled={!selectedState || loading}
          >
            <option value="">-- Choose Industry --</option>
            {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select Skill Level</label>
          <select 
            className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={selectedSkillId}
            onChange={(e) => setSelectedSkillId(e.target.value)}
            disabled={!selectedIndustry}
          >
            <option value="">-- Choose Skill Level --</option>
            {skills.map(s => (
              <option key={s.id} value={s.id}>
                {s.skillLevel} {s.category ? `(${s.category})` : ''} {s.zone ? `- ${s.zone}` : ''} {s.status === 'pending_review' ? '[PENDING VERIFICATION]' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-6 mt-2 pb-4">
          <label className="flex items-center space-x-2 text-sm cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              checked={includePF}
              onChange={(e) => setIncludePF(e.target.checked)}
            />
            <span className="font-medium">Include PF (12%)</span>
          </label>
          <label className="flex items-center space-x-2 text-sm cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              checked={includeESI}
              onChange={(e) => setIncludeESI(e.target.checked)}
            />
            <span className="font-medium">Include ESI (0.75%)</span>
          </label>
        </div>

        <Button 
          className="w-full" 
          onClick={handleCalculate} 
          disabled={!selectedSkillId}
        >
          <Calculator className="mr-2 h-4 w-4" /> Calculate Minimum Wage
        </Button>
      </div>

      {/* Results Section */}
      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 flex flex-col justify-center">
        {!result ? (
          <div className="text-center text-muted-foreground">
            Select parameters and click calculate to view the breakdown.
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-center border-b border-primary/20 pb-4">
              Wage Breakdown
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Basic Wage</span>
                <span className="font-semibold">₹{result.basicWage.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">VDA (Variable Dearness Allowance)</span>
                <span className="font-semibold">₹{result.vda.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">HRA</span>
                <span className="font-semibold">₹{result.hra.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-primary/20 space-y-4">
              <div className="bg-primary/10 p-4 rounded-xl flex justify-between items-center">
                <span className="font-bold text-lg">Gross Monthly</span>
                <span className="font-extrabold text-2xl text-primary">₹{result.totalMonthly.toFixed(2)}</span>
              </div>

              {(includePF || includeESI) && (
                <div className="bg-destructive/5 p-4 rounded-xl space-y-2 text-sm border border-destructive/10">
                  <div className="font-semibold mb-2 text-destructive">Employee Deductions</div>
                  {includePF && (
                    <div className="flex justify-between items-center">
                      <span>PF Deduction (12%)</span>
                      <span className="text-destructive">- ₹{result.employeePF.toFixed(2)}</span>
                    </div>
                  )}
                  {includeESI && (
                    <div className="flex justify-between items-center">
                      <span>ESI Deduction (0.75%)</span>
                      <span className="text-destructive">- ₹{result.employeeESI.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-bold pt-2 border-t border-destructive/10">
                    <span>Net Take-Home</span>
                    <span className="text-lg text-foreground">₹{result.takeHome.toFixed(2)}</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background p-3 rounded-lg border text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Daily (÷26)</div>
                  <div className="font-semibold text-lg">₹{result.daily.toFixed(2)}</div>
                </div>
                <div className="bg-background p-3 rounded-lg border text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Hourly (÷8)</div>
                  <div className="font-semibold text-lg">₹{result.hourly.toFixed(2)}</div>
                </div>
              </div>

              {(includePF || includeESI) && (
                <div className="bg-secondary p-4 rounded-xl space-y-2 text-sm mt-4">
                  <div className="font-semibold mb-2">Employer Contributions (CTC)</div>
                  {includePF && (
                    <div className="flex justify-between items-center">
                      <span>PF Contribution (12%)</span>
                      <span>+ ₹{result.employerPF.toFixed(2)}</span>
                    </div>
                  )}
                  {includeESI && (
                    <div className="flex justify-between items-center">
                      <span>ESI Contribution (3.25%)</span>
                      <span>+ ₹{result.employerESI.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-bold pt-2 border-t border-border">
                    <span>Total Cost to Company (CTC)</span>
                    <span className="text-lg">₹{result.ctc.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              * Calculations assume 26 working days per month and 8 working hours per day. <br/>
              * Note: State-specific components like Professional Tax (PT) and Labour Welfare Fund (LWF) are not currently featured in this calculation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

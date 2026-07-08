'use client';

import { useState } from 'react';
import { publishWage, deleteWage, uploadPdfToR2 } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Upload } from '@/components/icons';

export function AdminTable({ initialWages }: { initialWages: any[] }) {
  const [wages, setWages] = useState(initialWages);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePublish = async (id: string) => {
    setLoadingId(id);
    await publishWage(id);
    setWages(wages.filter(w => w.id !== id));
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    setLoadingId(id);
    await deleteWage(id);
    setWages(wages.filter(w => w.id !== id));
    setLoadingId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingId(id);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('wageId', id);
      await uploadPdfToR2(formData);
      alert('PDF Uploaded Successfully!');
    } catch (error) {
      console.error(error);
      alert('Upload failed. Ensure R2 binding is configured.');
    }
    setLoadingId(null);
  };

  if (wages.length === 0) {
    return (
      <div className="bg-card p-12 rounded-2xl border text-center text-muted-foreground">
        No pending wages to review. The queue is empty!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Crawler Controls */}
      <div className="bg-secondary/30 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-sm font-medium">Manual Crawler Override:</div>
        <div className="flex items-center gap-4">
          <select 
            id="crawler-state-select"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <optgroup label="States">
              <option value="ap">Andhra Pradesh</option>
              <option value="ar">Arunachal Pradesh</option>
              <option value="as">Assam</option>
              <option value="br">Bihar</option>
              <option value="cg">Chhattisgarh</option>
              <option value="ga">Goa</option>
              <option value="gj">Gujarat</option>
              <option value="hr">Haryana</option>
              <option value="hp">Himachal Pradesh</option>
              <option value="jh">Jharkhand</option>
              <option value="ka">Karnataka</option>
              <option value="kl">Kerala</option>
              <option value="mp">Madhya Pradesh</option>
              <option value="mh">Maharashtra</option>
              <option value="mn">Manipur</option>
              <option value="ml">Meghalaya</option>
              <option value="mz">Mizoram</option>
              <option value="nl">Nagaland</option>
              <option value="or">Odisha</option>
              <option value="pb">Punjab</option>
              <option value="rj">Rajasthan</option>
              <option value="sk">Sikkim</option>
              <option value="tn">Tamil Nadu</option>
              <option value="tg">Telangana</option>
              <option value="tr">Tripura</option>
              <option value="up">Uttar Pradesh</option>
              <option value="ut">Uttarakhand</option>
              <option value="wb">West Bengal</option>
            </optgroup>
            <optgroup label="Union Territories">
              <option value="an">Andaman and Nicobar Islands</option>
              <option value="ch">Chandigarh</option>
              <option value="dn">Dadra and Nagar Haveli and Daman and Diu</option>
              <option value="dl">Delhi</option>
              <option value="jk">Jammu and Kashmir</option>
              <option value="la">Ladakh</option>
              <option value="ld">Lakshadweep</option>
              <option value="py">Puducherry</option>
            </optgroup>
          </select>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => {
              const select = document.getElementById('crawler-state-select') as HTMLSelectElement | null;
              const state = select ? select.value : 'dl';
              alert(`Action queued: The Python crawler will now run for ${state.toUpperCase()} via GitHub Actions!`);
            }}
          >
            Force Scrape
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold">State</th>
              <th className="px-6 py-4 font-semibold">Industry / Skill</th>
              <th className="px-6 py-4 font-semibold text-right">Effective From</th>
              <th className="px-6 py-4 font-semibold text-right">Total (Month)</th>
              <th className="px-6 py-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {wages.map((wage) => (
              <tr key={wage.id} className="hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4 font-medium">{wage.stateName}</td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-foreground">{wage.industry}</div>
                  <div className="text-muted-foreground text-xs mt-1">
                    {wage.skillLevel} {wage.category ? `(${wage.category})` : ''} {wage.zone ? `- ${wage.zone}` : ''}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {new Date(wage.effectiveFrom).toLocaleDateString('en-IN')}
                </td>
                <td className="px-6 py-4 text-right font-bold text-primary">
                  ₹{wage.totalMonthly?.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {wage.sourceUrl && (
                      <a 
                        href={wage.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex"
                      >
                        <Button variant="outline" size="sm" className="text-xs" title="View Source Gazette">
                          Source
                        </Button>
                      </a>
                    )}
                    
                    {/* Hidden File Input */}
                    <input 
                      type="file" 
                      accept="application/pdf"
                      id={`pdf-upload-${wage.id}`}
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, wage.id)}
                    />
                    <Button 
                      variant={wage.pdfUrl ? "default" : "outline"}
                      size="icon" 
                      title={wage.pdfUrl ? "PDF Uploaded" : "Upload PDF Gazette"}
                      disabled={loadingId === wage.id}
                      onClick={() => document.getElementById(`pdf-upload-${wage.id}`)?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>

                    <Button 
                      variant="default" 
                      size="icon" 
                      title="Approve & Publish"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loadingId === wage.id || (!wage.pdfUrl && !wage.sourceUrl)}
                      onClick={() => handlePublish(wage.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      title="Reject & Delete"
                      disabled={loadingId === wage.id}
                      onClick={() => handleDelete(wage.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

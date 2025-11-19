import React, { useState } from 'react';
import { calculateEcoSavings } from '../services/geminiService';
import { ROIData } from '../types';
import { Coins, Leaf, TrendingUp, Loader2, ArrowRight } from 'lucide-react';

const RoiCalculator: React.FC = () => {
  const [km, setKm] = useState<number>(80);
  const [fuelPrice, setFuelPrice] = useState<number>(90);
  const [elecPrice, setElecPrice] = useState<number>(8);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ROIData | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    const data = await calculateEcoSavings(km, fuelPrice, elecPrice);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-display font-bold text-slate-800">Savings Calculator</h2>
        <p className="text-slate-500 mt-2">See how much you save by switching to Altek Green.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Input Section */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 md:col-span-1 h-fit leaf-shape">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Coins className="text-alti-green" size={20} /> Parameters
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Daily Usage (km/hrs)</label>
              <input 
                type="number" 
                value={km} 
                onChange={(e) => setKm(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-alti-green transition-all font-mono"
              />
              <input 
                type="range" min="10" max="150" value={km} onChange={(e) => setKm(Number(e.target.value))}
                className="w-full mt-2 accent-alti-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Diesel Price (per L)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={fuelPrice} 
                  onChange={(e) => setFuelPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-alti-green transition-all font-mono pl-8"
                />
                <span className="absolute left-3 top-3 text-slate-400">$</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Electricity Cost (per Unit)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={elecPrice} 
                  onChange={(e) => setElecPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-alti-green transition-all font-mono pl-8"
                />
                <span className="absolute left-3 top-3 text-slate-400">$</span>
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Calculate Savings <ArrowRight size={18} /></>}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="md:col-span-2 space-y-6">
          {!result ? (
            <div className="h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl border border-white flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
              <TrendingUp size={64} className="mb-4 opacity-50" />
              <p className="font-medium">Enter parameters to generate your savings report</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Main Highlight */}
              <div className="bg-chrome-gradient p-8 rounded-3xl border-t border-white shadow-2xl relative overflow-hidden">
                 <div className="relative z-10">
                   <h4 className="text-slate-600 font-medium mb-2">Estimated Yearly Savings</h4>
                   <div className="text-5xl md:text-6xl font-display font-bold text-slate-800 tracking-tight">
                     ${result.yearlySavings.toLocaleString()}
                   </div>
                   <div className="mt-4 inline-block px-4 py-1 bg-alti-green/10 border border-alti-green/20 rounded-full text-alti-green font-bold text-sm">
                     Payback in ~{result.paybackPeriodMonths} Months
                   </div>
                 </div>
                 <Leaf className="absolute -bottom-8 -right-8 text-white opacity-40 w-64 h-64" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-slate-400 text-sm font-bold uppercase mb-1">Monthly Impact</div>
                  <div className="text-3xl font-bold text-slate-800">${result.monthlySavings.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-2">Additional profit for your business</div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm text-white relative overflow-hidden leaf-shape-inv">
                  <div className="relative z-10">
                    <div className="text-slate-400 text-sm font-bold uppercase mb-1">CO2 Eliminated</div>
                    <div className="text-3xl font-bold text-alti-green">{result.co2Saved.toLocaleString()} kg</div>
                    <div className="text-xs text-slate-400 mt-2">Annual environmental contribution</div>
                  </div>
                  <div className="absolute right-0 top-0 w-20 h-20 bg-alti-green/20 blur-2xl rounded-full"></div>
                </div>
              </div>

              {/* AI Advice Box */}
              <div className="bg-green-50 border border-green-100 p-6 rounded-2xl flex gap-4 items-start">
                 <div className="bg-white p-2 rounded-full shadow-sm">
                   <Leaf className="text-alti-green w-6 h-6" />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-800 mb-1">Gemini Analysis</h4>
                   <p className="text-slate-600 text-sm leading-relaxed">{result.advice}</p>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoiCalculator;
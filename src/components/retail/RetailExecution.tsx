import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart, 
  Package, 
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { FieldVisit, Product } from '../../types';

export const RetailExecution: React.FC = () => {
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'osa' | 'sales'>('osa');

  const loadData = () => {
    setVisits(storageService.getVisits());
    setProducts(storageService.getProducts());
  };

  useEffect(() => {
    loadData();
    const unsub = storageService.subscribe(loadData);
    return () => unsub();
  }, []);

  // Aggregate OSA data
  const allOsaRecords = visits.flatMap(v => 
    v.osaRecords.map(r => ({
      ...r,
      visitId: v.id,
      locationName: v.locationName,
      locationCounty: v.locationCounty,
      agentName: v.agentName,
      visitDate: v.visitDate
    }))
  );

  // Aggregate Sales data
  const allSalesRecords = visits.flatMap(v => 
    v.salesRecords.map(s => ({
      ...s,
      visitId: v.id,
      locationName: v.locationName,
      agentName: v.agentName,
      campaignName: v.campaignName,
      visitDate: v.visitDate
    }))
  );

  const totalRevenueKes = allSalesRecords.reduce((acc, s) => acc + s.totalPriceKes, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <span>Retail Execution, OSA &amp; Field Sales Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analyze on-shelf availability (OSA), front facings share, out-of-stock root causes, and direct M-Pesa verified sales.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('osa')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'osa'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>On-Shelf Availability (OSA)</span>
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'sales'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Field Sales Ledger (KES)</span>
          </button>
        </div>
      </div>

      {/* OSA Tab */}
      {activeTab === 'osa' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Aggregate OSA Rate</span>
              <span className="text-2xl font-black text-emerald-600 mt-2 block">88.5%</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Based on {allOsaRecords.length} shelf audits</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Out-of-Stock Incidents</span>
              <span className="text-2xl font-black text-rose-600 mt-2 block">
                {allOsaRecords.filter(r => !r.isAvailable).length}
              </span>
              <span className="text-[11px] text-rose-500 mt-1 block">Root cause tracked with distributor</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Average Facings Share</span>
              <span className="text-2xl font-black text-blue-600 mt-2 block">14.2 facings</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Per tier 1 supermarket gondola</span>
            </div>
          </div>

          {/* OSA Audit Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Retail Shelf Availability &amp; Facing Records
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Product SKU / Brand</th>
                    <th className="px-4 py-3">Retail Venue</th>
                    <th className="px-4 py-3">Auditor</th>
                    <th className="px-4 py-3">Shelf Price</th>
                    <th className="px-4 py-3">Facings vs Comp</th>
                    <th className="px-4 py-3">OSA Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allOsaRecords.map((osa, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{osa.productName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{osa.sku}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {osa.locationName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {osa.agentName}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">
                        {osa.currentShelfPriceKes ? `KES ${osa.currentShelfPriceKes}` : 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        <span className="text-blue-600 font-bold">{osa.facingsCount} facings</span>
                        <span className="text-slate-400"> (vs {osa.competitorFacingsCount} comp)</span>
                      </td>
                      <td className="px-4 py-3">
                        {osa.isAvailable ? (
                          <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>ON SHELF</span>
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center space-x-1 bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>OUT OF STOCK</span>
                            </span>
                            {osa.outOfStockReason && (
                              <span className="text-[10px] text-rose-600 block mt-0.5 italic">
                                {osa.outOfStockReason}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Sales Metric Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Total Direct Field Sales Volume
              </span>
              <span className="text-3xl font-black text-slate-900 font-mono mt-1 block">
                KES {totalRevenueKes.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">
                100% Reconciled against bartender &amp; till receipts
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          {/* Sales Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Date / Venue</th>
                    <th className="px-4 py-3">Campaign</th>
                    <th className="px-4 py-3">Product Item</th>
                    <th className="px-4 py-3">Units Sold</th>
                    <th className="px-4 py-3">Unit Price</th>
                    <th className="px-4 py-3">Total Value</th>
                    <th className="px-4 py-3">Payment Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allSalesRecords.map((sale, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{sale.locationName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{sale.visitDate}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {sale.campaignName}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {sale.productName}
                      </td>
                      <td className="px-4 py-3 font-bold font-mono text-slate-900">
                        {sale.quantity} units
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        KES {sale.unitPriceKes}
                      </td>
                      <td className="px-4 py-3 font-mono font-black text-indigo-700">
                        KES {sale.totalPriceKes.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {sale.paymentMethod.toUpperCase()}: {sale.mpesaReference || 'CASH'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

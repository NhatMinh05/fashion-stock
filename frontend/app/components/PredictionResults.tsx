"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PredictionResultsProps {
    result: any;
    storeScale: number;
    month: number;
    chartData: any[];
}

export default function PredictionResults({ result, storeScale, month, chartData }: PredictionResultsProps) {
    if (!result) return null; // Nếu chưa có kết quả AI thì không hiển thị gì cả

    return (
        <div className="bg-white/5 p-7 rounded-3xl border border-[#00F2FF]/30 shadow-[0_0_30px_rgba(0,242,255,0.05)] animate-in fade-in slide-in-from-top-4 backdrop-blur-md">
            <h4 className="text-lg font-black mb-6 uppercase tracking-widest text-[#00F2FF] flex items-center gap-2">
                <span className="material-symbols-outlined">analytics</span>
                AI OUTPUT FOR <span className="text-[#FF00E5] mx-1">{storeScale}</span> STORES
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8 items-stretch">
                {/* Thẻ 1: Nhu Cầu Dự Báo */}
                <div className="bg-[#0A0817]/80 p-4 rounded-2xl border border-white/10 shadow-inner flex flex-col justify-center items-center relative overflow-hidden group hover:border-[#00F2FF]/40 transition-colors">
                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest z-10">Nhu Cầu Dự Báo</p>
                    <p className="text-3xl font-black text-[#00F2FF] drop-shadow-[0_0_8px_rgba(0,242,255,0.5)] z-10">{Number(result.demand_pred || 0).toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-slate-400 text-xs font-medium z-10">
                        <span className="material-symbols-outlined text-[14px] text-[#00F2FF]">calendar_month</span>
                        <span>Cho Tháng {month}</span>
                    </div>
                </div>

                {/* Thẻ 2: Kho An Toàn */}
                <div className="bg-[#0A0817]/80 p-4 rounded-2xl border border-white/10 shadow-inner flex flex-col justify-center items-center relative overflow-hidden group hover:border-emerald-400/40 transition-colors">
                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest z-10">Kho An Toàn</p>
                    <p className="text-3xl font-black text-white z-10">{Number(result.target_inventory || 0).toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-slate-400 text-xs font-medium z-10">
                        <span className="material-symbols-outlined text-[14px] text-emerald-400">verified_user</span>
                        <span>Mức chuẩn an toàn</span>
                    </div>
                </div>

                {/* Thẻ 3: Lệnh Nhập Mới */}
                <div className="bg-gradient-to-b from-[#FF00E5]/20 to-[#0A0817] p-4 rounded-2xl border border-[#FF00E5]/50 shadow-[0_0_15px_rgba(255,0,229,0.1)] relative overflow-hidden flex flex-col justify-center items-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#FF00E5] shadow-[0_0_10px_#FF00E5]"></div>
                    <p className="text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-widest z-10">Lệnh Nhập Mới</p>
                    <p className="text-4xl font-black text-[#FF00E5] drop-shadow-[0_0_8px_rgba(255,0,229,0.5)] z-10">{Number(result.order_qty || 0).toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-slate-300 text-xs font-medium bg-black/40 px-3 py-1 rounded-full border border-white/10 z-10">
                        <span className="material-symbols-outlined text-[14px] text-[#FF00E5]">history</span>
                        <span>Tồn kho cũ: {Number(result.start_inventory || 0).toLocaleString()})</span>
                    </div>
                </div>

                {/* Thẻ 4: Tồn Cuối Kỳ */}
                <div className="bg-[#0A0817]/80 p-4 rounded-2xl border border-white/10 shadow-inner flex flex-col justify-center items-center relative overflow-hidden group hover:border-[#00F2FF]/40 transition-colors">
                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest z-10">Tồn Cuối Kỳ</p>
                    <p className="text-3xl font-black text-[#00F2FF] z-10">{Number(result.end_inventory || 0).toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-slate-400 text-xs font-medium z-10">
                        <span className="material-symbols-outlined text-[14px] text-[#00F2FF]">arrow_forward</span>
                        <span>Sang Tháng {month === 12 ? 1 : month + 1}</span>
                    </div>
                </div>
            </div>

            {/* {result.ai_overridden && (
                <div className="mb-6 bg-amber-500/10 border border-amber-500/50 p-4 rounded-xl text-amber-400 text-sm font-medium flex gap-3 items-center backdrop-blur-sm">
                    <span className="material-symbols-outlined text-xl text-amber-500">warning</span> 
                    Business Guardrail Active: AI detected potential stockout. Safe-stock rules applied automatically.
                </div>
            )}
            */}
            
            {/* BIỂU ĐỒ THÁC NƯỚC */}
            <div className="h-80 w-full bg-[#0A0817]/80 rounded-2xl border border-white/10 p-5">
                <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Inventory Flow Analysis</p>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 10, left: 30, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} tickMargin={12} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(val) => val.toLocaleString()} axisLine={false} tickLine={false} width={45} />
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#0A0817', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }} itemStyle={{fontWeight: 'bold'}} formatter={(value: number | string | any) => Number(value || 0).toLocaleString()} />
                        <Bar dataKey="base" stackId="a" fill="transparent" />
                        <Bar dataKey="value" stackId="a" radius={[4, 4, 4, 4]}>{chartData.map((e, i) => <Cell key={i} fill={e?.color} />)}</Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
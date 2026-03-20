"use client";
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function GaugeCharts() {
    return (
        <div className="bg-[#0A0817] p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-10 relative overflow-hidden mt-6">
            {/* === TIÊU ĐỀ HỆ THỐNG === */}
            <div className="w-full flex items-center justify-start gap-3 mb-3 z-10">
                <span className="material-symbols-outlined text-[#38BDF8] text-2xl">insert_chart</span>
                <h3 className="text-xl font-bold text-white tracking-wide">PERFORMANCE METRICS</h3>
            </div>

            {/* Gauge 1: Độ Tin Cậy AI */}
            <div className="flex flex-col items-center w-full z-10">
                <div className="w-36 relative"> {/* Đã bỏ h-36 ở đây */}
                    {/* SỬA LỖI: Bỏ height="100%", thêm aspect={1} */}
                    <ResponsiveContainer width="100%" aspect={1}>
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id="neonCyanBlue" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#38BDF8" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#330df2" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <Pie data={[{value: 74}, {value: 26}]} innerRadius={52} outerRadius={65} dataKey="value" stroke="none">
                                <Cell fill="url(#neonCyanBlue)" style={{filter: 'drop-shadow(0 0 1px rgba(56, 189, 248, 0.7))'}} />
                                <Cell fill="#1a222c" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-4xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">74%</span>
                </div>
                <p className="text-[13px] font-bold text-[#38BDF8] mt-5 text-center tracking-[0.25em] uppercase">
                    FORECAST QUALITY<br/>
                    <span className="text-slate-400 font-medium text-[10px] tracking-widest">(DEMAND)</span>
                </p>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>

            {/* Gauge 2: Chính Xác */}
            <div className="flex flex-col items-center w-full z-10">
                <div className="w-36 relative"> {/* Đã bỏ h-36 ở đây */}
                    {/* SỬA LỖI: Bỏ height="100%", thêm aspect={1} */}
                    <ResponsiveContainer width="100%" aspect={1}>
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id="neonPinkBlue" x1="0" y1="1" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#FF00E5" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#330DF2" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <Pie data={[{value: 88}, {value: 12}]} innerRadius={52} outerRadius={65} dataKey="value" stroke="none">
                                <Cell fill="url(#neonPinkBlue)" style={{filter: 'drop-shadow(0 0 2px rgba(255, 0, 229, 0.5))'}} />
                                <Cell fill="#1a222c" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-4xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">88%</span>
                </div>
                <p className="text-[13px] font-bold text-[#FF00E5] mt-5 text-center tracking-[0.25em] uppercase">
                    Accuracy<br/>
                    <span className="text-slate-400 font-medium text-[10px] tracking-widest">(INVENTORY)</span>
                </p>
            </div>
        </div>
    );
}
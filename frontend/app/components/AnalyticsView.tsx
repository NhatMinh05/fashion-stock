"use client";
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, ReferenceLine 
} from 'recharts';

interface AnalyticsViewProps {
  globalSummary: any;
}

const COLORS = ['#00FFA3', '#00F2FF', '#9333ea', '#FF3366']; // Bảng màu Neon

export default function AnalyticsView({ globalSummary }: AnalyticsViewProps) {
  
  // NẾU DỮ LIỆU CHƯA VỀ -> HIỆN MÀN HÌNH LOADING SIÊU NGẦU
  if (!globalSummary) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] animate-in fade-in duration-500">
        <div className="w-16 h-16 border-4 border-[#00F2FF]/20 border-t-[#00F2FF] rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(0,242,255,0.5)]"></div>
        <h2 className="text-xl font-bold text-[#00F2FF] tracking-widest animate-pulse">ĐANG TRÍCH XUẤT DỮ LIỆU TỔNG...</h2>
        <p className="text-slate-400 text-sm mt-2">Đang quét toàn bộ hệ thống lưu trữ</p>
      </div>
    );
  }

  // NẾU DỮ LIỆU ĐÃ VỀ -> BÓC TÁCH RA ĐỂ VẼ BIỂU ĐỒ
  const { pie_chart, bar_chart, area_chart, total_products } = globalSummary;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto space-y-6 relative z-10 pb-20">
      
      {/* HEADER */}
      <header className="mb-6 border-b border-white/10 pb-6">
        <h1 className="text-4xl font-black tracking-tight text-white mb-2 drop-shadow-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-5xl text-[#00FFA3]">insert_chart</span>
          Trung Tâm Phân Tích Hệ Thống
        </h1>
        <p className="text-slate-400 flex items-center gap-2">
          Số liệu được tổng hợp trực tiếp từ <span className="text-[#00FFA3] font-bold bg-[#00FFA3]/10 px-2 py-0.5 rounded">
            {total_products ? total_products.toLocaleString() : 0}
          </span> dòng dữ liệu trong kho.
        </p>
      </header>

      {/* TẦNG 1: BIỂU ĐỒ LỚN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BIỂU ĐỒ 1: QUÁ KHỨ & DỰ BÁO DÒNG TIỀN */}
        <div className="bg-[#0A0817]/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all hover:border-[#00F2FF]/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00F2FF]">timeline</span> Hành Trình Dòng Tiền (Actual vs Forecast)
          </h3>
          <div className="h-[300px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={area_chart} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F2FF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00F2FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF00E5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF00E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Legend />
                
                {/* ĐƯỜNG RANH GIỚI HIỆN TẠI VÀ TƯƠNG LAI */}
                <ReferenceLine x="HIỆN TẠI" stroke="#FFD700" strokeDasharray="5 5" strokeWidth={2} label={{ position: 'top', value: 'BÂY GIỜ', fill: '#FFD700', fontSize: 10, fontWeight: 'bold' }} />

                <Area type="monotone" dataKey="revenue" name="Doanh Thu" stroke="#00F2FF" fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="cost" name="Chi Phí Gốc" stroke="#FF00E5" fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BIỂU ĐỒ 2: CƠ CẤU TỒN KHO */}
        <div className="bg-[#0A0817]/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all hover:border-[#00FFA3]/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00FFA3]">pie_chart</span> Phân Loại Sức Khỏe Kho Hàng
          </h3>
          <div className="h-[300px] w-full flex items-center justify-center text-xs font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie_chart} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                  {pie_chart && pie_chart.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} Sản phẩm`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* TẦNG 2: BIỂU ĐỒ BAR CHART */}
      <div className="bg-[#0A0817]/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] w-full transition-all hover:border-[#FF3366]/30">
         <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#FF3366]">bar_chart</span> Bảng Xếp Hạng Top 5 Bán Chạy Nhất Toàn Hệ Thống
         </h3>
         <div className="h-[300px] w-full text-xs font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bar_chart} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={180} />
                <Tooltip cursor={{fill: '#1e293b'}} formatter={(value) => `${Number(value).toLocaleString()} SP`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="sold" name="Số lượng bán (SP/Tuần)" fill="#9333ea" radius={[0, 4, 4, 0]} barSize={28}>
                  {bar_chart && bar_chart.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#00FFA3' : (index === 1 ? '#00F2FF' : '#9333ea')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

    </div>
  );
}
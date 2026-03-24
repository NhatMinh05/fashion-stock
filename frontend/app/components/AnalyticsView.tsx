"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area,
  ComposedChart, Bar, BarChart, // <--- Đã thêm BarChart vào đây nè
  ScatterChart, Scatter, ZAxis, ReferenceLine,
  Treemap, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

import { ResponsiveSunburst } from '@nivo/sunburst';

// --- CẤU HÌNH MÀU SẮC NEON VÀ ÁNH XẠ NHÓM NGÀNH HÀNG ---
const NEON_COLORS = {
  primaryGreen: '#00FFA3', primaryCyan: '#00F2FF', primaryPurple: '#9333ea',
  primaryPink: '#FF3366', primaryYellow: '#facc15', primaryMagenta: '#FF00E5',
  primaryBlue: '#3b82f6', primarySlate: '#64748b', background: '#0A0817'
};

const GROUP_COLORS_MAP: { [key: string]: string } = {
  "Women": NEON_COLORS.primaryPink, "Men": NEON_COLORS.primaryCyan,
  "Kids": NEON_COLORS.primaryYellow, "Divided": NEON_COLORS.primaryPurple,
  "Sport": NEON_COLORS.primaryGreen, "Beauty": NEON_COLORS.primaryMagenta,
  "Home": NEON_COLORS.primaryBlue, "Shoes": NEON_COLORS.primarySlate,
  "Others": '#a3a3a3' 
};

// --- COMPONENT SUNBURST CHART (CHỈ NẨY 1 LẦN LÚC LOAD & FIX MÀU ĐA SẮC) ---
const SunburstChartComponent = ({ data }: { data: any }) => {
  
  // 1. TUYỆT CHIÊU TẮT LAG: Quản lý trạng thái Animation
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Cho phép biểu đồ "nẩy" trong 1.5 giây đầu tiên khi mới vào web
    // Sau 1.5 giây, tự động RÚT PHÍCH CẮM animation để đưa chuột vào không bị lag nữa!
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // 2. Phép thuật bọc Data
  const safeData = useMemo(() => {
    if (!data) return null;
    const addUniqueId = (node: any, parentId = "root") => {
      return {
        ...node,
        unique_id: `${parentId}_${node.name}`,
        children: node.children ? node.children.map((c: any) => addUniqueId(c, `${parentId}_${node.name}`)) : undefined
      };
    };
    return addUniqueId({ name: "H&M Global", children: data });
  }, [data]);

  // 3. FIX LỖI "XANH LÈ": Lên màu đa sắc chuẩn chỉ
  const colorsList = ['#00FFA3'];
  const customColors = (arc: any) => {
    if (arc.depth === 1) {
        // Tìm vị trí của Ngành hàng này trong danh sách gốc để gán màu cứng
        const index = safeData.children.findIndex((c: any) => c.name === arc.data.name);
        return colorsList[Math.max(0, index) % colorsList.length];
    }
    if (arc.depth === 2 && arc.parent) {
         // Con cái thì lấy đúng màu của cha nó
         const parentGroupName = arc.parent.data.name;
         const parentIndex = safeData.children.findIndex((c: any) => c.name === parentGroupName);
         return colorsList[Math.max(0, parentIndex) % colorsList.length];
    }
    return '#64748b';
  };

  if (!safeData) return null;

  return (
    <ResponsiveSunburst
      data={safeData}
      identity="unique_id"
      value="size"
      cornerRadius={2}
      borderWidth={1}
      borderColor="#0A0817"
      colors={customColors}
      childColor={{ from: 'color', modifiers: [['brighter', 0.1]] }}
      enableArcLabels={true}
      arcLabel={arc => arc.data.name}
      arcLabelsTextColor="#ffffff"
      arcLabelsFontSize={10}
      arcLabelsRadiusOffset={0.5}
      arcLabelsSkipAngle={10}
      tooltip={arc => (
        <div style={{ background: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', padding: '10px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}>
          <strong>{arc.data.name}</strong>: {arc.value.toLocaleString()} Sản phẩm
        </div>
      )}
      enableArcLinkLabels={false}
      
      // --- NƠI PHÉP THUẬT HOẠT ĐỘNG ---
      animate={isAnimating} // Ban đầu là true (để nở ra), sau 1.5s thành false (đứng im mãi mãi)
      motionConfig="gentle"
      
      theme={{
        labels: {
          text: {
            fontWeight: '900',
            fill: '#ffffff',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))'
          }
        }
      }}
    />
  );
};

interface AnalyticsViewProps {
  globalSummary: any;
}

// --- BƯỚC A: HÀM VẼ TREEMAP ĐA SẮC (ĐÃ SỬA CHUẨN TÊN) ---
const CustomizedTreemapContent = (props: any) => {
  const { x, y, width, height, index, name } = props;
  const COLORS_LIST = ['#00FFA3', '#00F2FF', '#9333ea', '#FF3366', '#facc15', '#FF00E5', '#3b82f6'];

  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height}
        style={{
          fill: COLORS_LIST[index % COLORS_LIST.length],
          stroke: '#0A0817', strokeWidth: 2,
        }}
      />
      {width > 60 && height > 30 && (
        <text
          x={x + width / 2} y={y + height / 2}
          textAnchor="middle" dominantBaseline="middle"
          fill="#fff" fontSize={width > 120 ? 14 : 10} fontWeight="900"
          style={{ pointerEvents: 'none', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
        >
          {name}
        </text>
      )}
    </g>
  );
};

export default function AnalyticsView({ globalSummary: initialSummary }: AnalyticsViewProps) {
  const [summaryData, setSummaryData] = useState(initialSummary);

  // Tính năng AUTO-RESCUE
  useEffect(() => {
    if (!summaryData || !summaryData.treemap_chart || !summaryData.total_rows || summaryData.total_rows < 1000) {
      fetch('http://127.0.0.1:8000/api/analytics/summary')
        .then(res => res.json())
        .then(data => {
          if (data && data.line_chart) setSummaryData(data);
        })
        .catch(err => console.error("Lỗi Auto-Rescue:", err));
    }
  }, [summaryData]);

  if (!summaryData || !summaryData.treemap_chart || !summaryData.total_rows || summaryData.total_rows < 1000) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] animate-in fade-in duration-500 bg-[#0A0817] rounded-3xl p-10 border border-white/5">
        <div className="w-20 h-20 border-8 border-[#00F2FF]/20 border-t-[#00F2FF] rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(0,242,255,0.7)]"></div>
        <h2 className="text-3xl font-black text-[#00F2FF] tracking-tighter animate-pulse mb-3">KHỞI ĐỘNG CỖ MÁY BIG DATA H&M...</h2>
        <p className="text-slate-400 text-lg max-w-lg text-center font-medium">Bạn hãy kiên nhẫn nhé, 'máy ép' đang đọc và tính toán <span className='text-white font-black'>hàng triệu dòng</span> data.</p>
        <p className="text-yellow-400 text-sm mt-5 font-bold bg-yellow-400/10 px-4 py-1 rounded-full">Processing Analytics Options</p>
      </div>
    );
  }

  const { treemap_chart, line_chart, area_chart_cum, grouped_bar_chart, scatter_chart_real, bubble_chart_group, radar_chart_multi, heatmap_chart, heatmap_meta, pareto_chart } = summaryData;

  // HÀM VẼ "VIÊN GẠCH" HEATMAP
  const renderHeatmapCells = () => {
    const maxSales = Math.max(...heatmap_chart.map((s: any) => s.sales));
    return heatmap_chart.map((cell: any, index: number) => {
      const ratio = cell.sales / maxSales;
      const color = ratio > 0.8 ? '#00F2FF' : (ratio > 0.5 ? '#FF00E5' : (ratio > 0.2 ? '#9333ea' : '#312e81'));
      return <Scatter key={index} data={[cell]} fill={color} shape="rect" stroke="none" />;
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto space-y-6 relative z-10 pb-20">
      
      {/* HEADER TỐI ƯU GỌN GÀNG */}
      <header className="mb-8 border-b border-white/10 pb-6 flex items-center justify-between">
        <div>
            <h1 className="text-5xl font-extrabold tracking-tighter text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] flex items-center gap-4">
              <span className="material-symbols-outlined text-6xl text-[#00FFA3]">storage</span>
              H&M Global Dashboard
            </h1>
            <p className="text-xl text-slate-400 flex items-center gap-3">
              Phân tích <span className="text-[#00FFA3] font-black bg-[#00FFA3]/10 px-3 py-1 rounded-full">
                {summaryData.total_rows ? summaryData.total_rows.toLocaleString() : "31,788,324"}
              </span> giao dịch trong lịch sử 2 năm.
            </p>
        </div>
      </header>

      {/* ========================================================= */}
      {/* TẦNG 1: CƠ CẤU & TÀI CHÍNH */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. SUNBURST CHART (THAY THẾ HOÀN TOÀN TREEMAP - SIÊU ĐẸP) */}
        <div className="bg-[#0A0817]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 h-[500px] shadow-[0_0_20px_rgba(0,255,163,0.05)]">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00FFA3]">scatter_plot</span> 
            Cơ cấu Thị phần Hierarchy (Ngành hàng → Nhóm sản phẩm)
          </h3>
          <div className="h-[400px] w-full text-[10px] font-medium">
            
            {/* CHỈ CẦN GỌI NHƯ THẾ NÀY */}
            <SunburstChartComponent data={treemap_chart} />

          </div>
        </div>

        {/* 2. LINE CHART */}
        <div className="bg-[#0A0817]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 h-[450px]">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00F2FF]">account_balance_wallet</span> Hành Trình Doanh Thu ($) theo Lịch sử
          </h3>
          <div className="h-[350px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={line_chart} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                    <filter id="shadow">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00F2FF" />
                    </filter>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" tickFormatter={(value) => value.slice(-5)}/>
                <YAxis stroke="#64748b" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="revenue" name="Doanh Thu" stroke="#00F2FF" strokeWidth={3} dot={false} style={{ filter: "url(#shadow)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TẦNG 2: TĂNG TRƯỞNG & ĐA KÊNH */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 3. AREA CHART */}
        <div className="bg-[#0A0817]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 h-[380px]">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#FF3366]">show_chart</span> Sức Tăng Trưởng Cộng Dồn (Tổng SP Xuất Kho)
          </h3>
          <div className="h-[280px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={area_chart_cum} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3366" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#FF3366" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" tickFormatter={(value) => value.slice(-5)}/>
                <YAxis stroke="#64748b" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} SP`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="cumulative" name="Tổng cộng xuất kho" stroke="#FF3366" fillOpacity={1} fill="url(#colorCum)" strokeWidth={3}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. GROUPED BAR */}
        <div className="bg-[#0A0817]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 h-[380px]">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#facc15]">bar_chart</span> Sức mua Online vs Offline (Top 5 Mã SP)
          </h3>
          <div className="h-[280px] w-full text-xs font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grouped_bar_chart} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false}/>
                <XAxis type="number" stroke="#64748b" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}/>
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} formatter={(value) => `${Number(value).toLocaleString()} SP`}/>
                <Legend />
                <Bar dataKey="online" name="Kênh Online" fill="#00F2FF" radius={[0, 4, 4, 0]} stackId="a"/>
                <Bar dataKey="offline" name="Kênh Offline (Store)" fill="#FF00E5" radius={[0, 4, 4, 0]} stackId="a"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TẦNG 3: PHÂN TÁN & TƯƠNG QUAN */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 5. SCATTER CHART */}
        <div className="bg-[#0A0817]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 h-[460px]">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00F2FF]">scatter_plot</span> Mối quan hệ Giá vs Sức bán vs Tồn tối đa
          </h3>
          <div className="h-[350px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="x" name="Giá" stroke="#64748b" unit="$" tickFormatter={(value) => `$${value}`}/>
                <YAxis type="number" dataKey="y" name="Sức bán" stroke="#64748b" tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}/>
                <ZAxis type="number" dataKey="z" range={[50, 600]} name="Tồn thô Z" unit=" SP" />
                <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Scatter name="Sản phẩm" data={scatter_chart_real} fill="#FF00E5" fillOpacity={0.6} stroke="#00F2FF" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. BUBBLE/COMPOSED (CẢI TIẾN TRỤC X) */}
        <div className="bg-[#0A0817]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 h-[460px]">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#facc15]">bubble_chart</span> Hiệu suất Ngành hàng: Giá TB vs Tổng Sức bán
          </h3>
          <div className="h-[350px] w-full text-xs font-bold">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={bubble_chart_group} margin={{ top: 10, right: 10, left: 20, bottom: 60 }}>
                    {/* Nghiêng 45 độ giống Pareto để không đè chữ */}
                    <XAxis dataKey="name" stroke="#64748b" interval={0} angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }}/>
                    <YAxis yAxisId="left" stroke="#64748b" name="Giá TB" unit="$"/>
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" name="Sức bán"/>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} 
                      formatter={(value, name, props) => {
                        if (props.dataKey === 'price') return [`$${Number(value).toFixed(1)}`, 'Giá trung bình'];
                        if (props.dataKey === 'sold') return [`${Number(value).toLocaleString()} SP`, 'Tổng sức bán'];
                        return [value, name];
                      }}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Scatter yAxisId="left" dataKey="price" name="Giá trung bình ($)" fill="#00FFA3" fillOpacity={0.6}/>
                    <Bar yAxisId="right" dataKey="sold" name="Tổng sức bán (SP)" fill="#facc15" fillOpacity={0.1} stroke="#facc15" radius={[4, 4, 0, 0]}/>
                </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* TẦNG 4: HỆ SỐ & CƠ CẤU */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* 7. RADAR CHART */}
        <div className="bg-[#0A0817]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 h-[400px] lg:col-span-2">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#9333ea]">hive</span> Radar So sánh: {radar_chart_multi.g1_name} vs {radar_chart_multi.g2_name}
          </h3>
          <div className="h-[300px] w-full text-xs flex items-center justify-center font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radar_chart_multi.data}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" stroke="#64748b" fontSize={10}/>
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#1e293b" tick={false}/>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Radar name={radar_chart_multi.g1_name} dataKey="group1" stroke="#00F2FF" fill="#00F2FF" fillOpacity={0.5} strokeWidth={3}/>
                <Radar name={radar_chart_multi.g2_name} dataKey="group2" stroke="#FF00E5" fill="#FF00E5" fillOpacity={0.2} strokeWidth={3}/>
                <Legend verticalAlign="bottom"/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 8. HEATMAP */}
        <div className="bg-[#0A0817]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 h-[400px] lg:col-span-3">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00FFA3]">heat_pump</span> Điểm nóng Bán hàng (Ngành hàng vs Thứ trong Tuần)
          </h3>
          <div className="h-[300px] w-full text-[10px] font-medium">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: 60, bottom: 20 }}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis type="number" dataKey="xIdx" ticks={[0, 1, 2, 3, 4, 5, 6]} domain={[0, 6]} tickFormatter={(value) => heatmap_meta.days[value]} stroke="#64748b" />
                <YAxis type="number" dataKey="yIdx" ticks={[0, 1, 2, 3, 4, 5, 6]} domain={[0, 6]} tickFormatter={(value) => heatmap_meta.groups[value]} stroke="#94a3b8" width={80} />
                <ZAxis type="number" dataKey="sales" name="Sức bán" unit=" SP"/>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} formatter={(value, name) => [name === 'Sức bán' ? `${value.toLocaleString()} SP` : (name === 'Thứ' ? heatmap_meta.days[value] : heatmap_meta.groups[value]), name]}/>
                {renderHeatmapCells()}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* TẦNG 5: QUẢN LÝ & CHIẾN LƯỢC */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 gap-6">

        {/* 9. PARETO CỰC ĐẠI */}
        <div className="bg-[#0A0817]/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 h-[650px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[#FF3366]">query_stats</span> 
            Phân tích Pareto 80/20: Top 30 Sản Phẩm Gánh Team Doanh Thu
          </h3>
          
          <div className="h-[500px] w-full text-xs font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={pareto_chart} 
                margin={{ top: 20, right: 30, left: 20, bottom: 110 }} 
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  interval={0} 
                  angle={-45} 
                  textAnchor="end" 
                  height={120} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }}
                />
                <YAxis yAxisId="left" stroke="#64748b" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} tick={{fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" stroke="#FF3366" unit="%" tick={{fontSize: 12}} />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '14px' }} 
                  formatter={(value, name) => [
                    name === 'cumulativePercent' ? `${Number(value).toFixed(2)}%` : `$${Number(value).toLocaleString()}`, 
                    name === 'revenue' ? 'Doanh Thu' : '% Cộng dồn'
                  ]}
                />
                
                <Legend verticalAlign="top" height={36}/>
                <Bar yAxisId="left" dataKey="revenue" name="Doanh Thu" fill="#00F2FF" barSize={25} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="cumulativePercent" name="% Cộng dồn" stroke="#FF3366" strokeWidth={4} dot={false} />
                <ReferenceLine yAxisId="right" y={80} stroke="#facc15" strokeDasharray="10 5" strokeWidth={2} label={{ position: 'top', value: 'NGƯỠNG 80% DOANH THU', fill: '#facc15', fontSize: 14, fontWeight: 'black' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
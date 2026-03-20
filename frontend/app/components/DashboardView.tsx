"use client";

import StatCard from "./StatCard";
import SimulatorEngine from "./SimulatorEngine";
import PredictionResults from "./PredictionResults";
import GaugeCharts from "./GaugeCharts";
import LowStockAlert from "./LowStockAlert";
import ChatWidget from "./ChatWidget";

interface DashboardViewProps {
    productList: any[];
    selectedProd: any;
    handleSelectProduct: (prod: any) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    price: number;
    setPrice: (val: number) => void;
    month: number;
    setMonth: (val: number) => void;
    currentStock: number;
    setCurrentStock: (val: number) => void;
    weeklyVel: number;
    setWeeklyVel: (val: number) => void;
    leadTime: number;
    setLeadTime: (val: number) => void;
    complexity: number;
    setComplexity: (val: number) => void;
    eventCount: number;
    setEventCount: (val: number) => void;
    isDiscount: number;
    setIsDiscount: (val: number) => void;
    storeScale: number;
    setStoreScale: (val: number) => void;
    result: any;
    isSimulating: boolean;
    handlePredict: () => void;
    showChat: boolean;
    setShowChat: (val: boolean) => void;
    robotRotateX: number;
    robotRotateY: number;
    chartData: any[];
}

export default function DashboardView(props: DashboardViewProps) {
    const {
        productList, selectedProd, handleSelectProduct, activeTab, setActiveTab,
        price, setPrice, month, setMonth, currentStock, setCurrentStock,
        weeklyVel, setWeeklyVel, leadTime, setLeadTime, complexity, setComplexity,
        eventCount, setEventCount, isDiscount, setIsDiscount, storeScale, setStoreScale,
        result, isSimulating, handlePredict, showChat, setShowChat,
        robotRotateX, robotRotateY, chartData
    } = props;

    // Logic động cho 4 thẻ thông số
    const priceTrendValue = selectedProd ? ((selectedProd.article_id % 10) - 4.5) : 0; 
    const priceTrendStr = priceTrendValue > 0 ? `+${priceTrendValue.toFixed(1)}%` : `${priceTrendValue.toFixed(1)}%`;
    const priceTrendColor = priceTrendValue > 0 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    const priceTrendIcon = priceTrendValue > 0 ? 'trending_up' : 'trending_down';

    const leadTimeStatus = leadTime < 10 ? 'Rất Nhanh' : (leadTime <= 20 ? 'Ổn Định' : 'Cảnh Báo Chậm');
    const leadTimeColor = leadTime < 10 ? 'text-[#00F2FF] bg-[#00F2FF]/10 border-[#00F2FF]/20' : (leadTime <= 20 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-[#FF00E5] bg-[#FF00E5]/10 border-[#FF00E5]/20');
    const leadTimeIcon = leadTime < 10 ? 'bolt' : (leadTime <= 20 ? 'check_circle' : 'warning');

    const velRank = weeklyVel > 200 ? 'Top 1%' : (weeklyVel > 100 ? 'Top 5%' : (weeklyVel > 50 ? 'Top 10%' : 'Avg'));
    const velColor = weeklyVel > 100 ? 'text-[#FF00E5] bg-[#FF00E5]/10 border-[#FF00E5]/20' : 'text-slate-300 bg-white/10 border-white/20';
    const velIcon = weeklyVel > 100 ? 'local_fire_department' : 'trending_flat';

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto">
            
            {/* THÊM HIỆU ỨNG CSS: LÀM RỘNG ĐƯỜNG LED & THÊM HÀO QUANG */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes led-flow-ltr {
                    /* Từ 200% -> 0% để tạo cảm giác dòng chảy mượt đi ngang qua phải */
                    0% { background-position: 200% center; }
                    100% { background-position: 0% center; }
                }
                
                /* Thẻ 1: Tone Xanh Lơ & Xanh Biển */
                .led-1 {
                    background: linear-gradient(to right, #00F2FF, #1d4ed8, #00F2FF, #1d4ed8, #00F2FF);
                    background-size: 200% 100%;
                    animation: led-flow-ltr 3s linear infinite;
                    height: 5px !important; /* Độ dày của thanh LED */
                    box-shadow: 0 0 12px rgba(0, 242, 255, 0.6); /* Hào quang tỏa ra */
                    border-radius: 9999px;
                }
                
                /* Thẻ 2: Tone Xanh Ngọc & Xanh Lơ */
                .led-2 {
                    background: linear-gradient(to right, #00FFA3, #0284c7, #00FFA3, #0284c7, #00FFA3);
                    background-size: 200% 100%;
                    animation: led-flow-ltr 3.5s linear infinite; 
                    height: 5px !important;
                    box-shadow: 0 0 12px rgba(0, 255, 163, 0.6);
                    border-radius: 9999px;
                }
                
                /* Thẻ 3: Tone Tím & Hồng Neon */
                .led-3 {
                    background: linear-gradient(to right, #9333ea, #FF00E5, #9333ea, #FF00E5, #9333ea);
                    background-size: 200% 100%;
                    animation: led-flow-ltr 2.5s linear infinite;
                    height: 5px !important;
                    box-shadow: 0 0 12px rgba(255, 0, 229, 0.6);
                    border-radius: 9999px;
                }
                
                /* Thẻ 4: Tone Đỏ Neon & Cam */
                .led-4 {
                    background: linear-gradient(to right, #FF3366, #ea580c, #FF3366, #ea580c, #FF3366);
                    background-size: 200% 100%;
                    animation: led-flow-ltr 4s linear infinite;
                    height: 5px !important;
                    box-shadow: 0 0 12px rgba(255, 51, 102, 0.6);
                    border-radius: 9999px;
                }
            `}} />

            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white mb-2 drop-shadow-lg">AI Control Tower</h1>
                <p className="text-slate-400">Dự báo bán ra và dự báo tồn kho theo thời gian thực</p>
              </div>
              <div className="w-full md:w-[350px]">
                <label className="text-xs font-bold text-[#00F2FF] uppercase mb-1.5 block tracking-wider">Mã hàng đang theo dõi</label>
                <div className="relative group">
                  <select 
                    value={selectedProd?.article_id || ""}
                    onChange={(e) => handleSelectProduct(productList[e.target.selectedIndex])} 
                    className="w-full bg-[#0A0817]/60 backdrop-blur-md border border-white/20 rounded-xl p-3 text-white outline-none focus:border-[#00F2FF] focus:ring-1 focus:ring-[#00F2FF]/50 appearance-none shadow-lg cursor-pointer transition-all hover:border-[#00F2FF]/50"
                  >
                    {productList.map((p, i) => (<option key={i} value={p.article_id} className="bg-[#0A0817]">{p.prod_name} ({p.article_id})</option>))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-[#00F2FF] transition-colors">expand_more</span>
                </div>
              </div>
            </header>

            {/* AI NHẬN ĐỊNH */}
            {selectedProd && (
              <div className="bg-[#FF00E5]/10 border border-[#FF00E5]/30 p-4 rounded-xl mb-6 shadow-[0_0_15px_rgba(255,0,229,0.1)] text-sm flex gap-3 items-start sm:items-center backdrop-blur-md">
                <span className="material-symbols-outlined text-[#FF00E5] drop-shadow-[0_0_5px_rgba(255,0,229,0.8)]">lightbulb</span>
                <p className="text-slate-200">
                  <span className="text-[#FF00E5] font-bold">AI Insight: </span>
                  {weeklyVel > 100 ? `Mặt hàng 'Top Seller' (Sức bán: ${Math.round(weeklyVel)} SP/tuần). ` : "Mặt hàng có sức bán ổn định. "}
                  {complexity === 1 ? <span className="text-[#00F2FF] font-medium">Cảnh báo: Gia công KHÓ, rủi ro trễ Lead Time cao!</span> : "Chuỗi cung ứng an toàn, gia công dễ."}
                </p>
              </div>
            )}

            {/* 4 THẺ THÔNG SỐ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard title="Giá Bán Gốc" mainIcon="payments" mainIconClass="text-[#38BDF8]" hoverBorderClass="hover:border-[#38BDF8]/50" topHighlightClass="via-[#38BDF8]" value={`$${price.toFixed(2)}`} badgeText={priceTrendStr} badgeIcon={priceTrendIcon} badgeClass={priceTrendColor} bottomGradientClass="led-1 text-[#38BDF8]" />
              <StatCard title="Lead Time Chuẩn" mainIcon="hourglass_empty" mainIconClass="text-[#38BDF8]" hoverBorderClass="hover:border-[#38BDF8]/50" topHighlightClass="via-[#38BDF8]" value={<>{leadTime} <span className="text-sm text-slate-500 font-bold">Ngày</span></>} badgeText={leadTimeStatus} badgeIcon={leadTimeIcon} badgeClass={leadTimeColor} bottomGradientClass="led-2 text-[#38BDF8]" />
              <StatCard title="Tốc Độ Bán" mainIcon="monitoring" mainIconClass="text-[#9333ea]" hoverBorderClass="hover:border-[#9333ea]/50" topHighlightClass="via-[#9333ea]" value={<>{Math.round(weeklyVel)} <span className="text-sm text-slate-500 font-bold">/Tuần</span></>} badgeText={velRank} badgeIcon={velIcon} badgeClass={velColor} bottomGradientClass="led-3 text-[#9333ea]" />
              <StatCard title="Gia Công" mainIcon="precision_manufacturing" mainIconClass="text-[#db2777]" hoverBorderClass="hover:border-[#db2777]/50" topHighlightClass="via-[#db2777]" value={complexity === 1 ? "Khó" : "Dễ"} valueClass={complexity === 1 ? 'text-[#db2777]' : 'text-[#38BDF8]'} badgeText={complexity === 1 ? 'Rủi ro cao' : 'An toàn'} badgeIcon={complexity === 1 ? 'warning' : 'verified_user'} badgeClass={complexity === 1 ? 'text-[#db2777] bg-[#db2777]/10 border-[#db2777]/20' : 'text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/20'} bottomGradientClass="led-4 text-[#db2777]" />
            </div>

            {/* BỐ CỤC CHIA CỘT */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start">
              {/* CỘT TRÁI */}
              <div className="flex-[2.5] w-full min-w-0 space-y-6">
                <SimulatorEngine activeTab={activeTab} setActiveTab={setActiveTab} price={price} setPrice={setPrice} weeklyVel={weeklyVel} setWeeklyVel={setWeeklyVel} currentStock={currentStock} setCurrentStock={setCurrentStock} leadTime={leadTime} setLeadTime={setLeadTime} month={month} setMonth={setMonth} complexity={complexity} setComplexity={setComplexity} isDiscount={isDiscount} setIsDiscount={setIsDiscount} eventCount={eventCount} setEventCount={setEventCount} storeScale={storeScale} setStoreScale={setStoreScale} handlePredict={handlePredict} isSimulating={isSimulating} />
                <PredictionResults result={result} storeScale={storeScale} month={month} chartData={chartData} />
              </div>

              {/* CỘT PHẢI */}
              <div className="flex-[1] w-full min-w-0 lg:max-w-[400px] space-y-6 flex flex-col">
                 {!showChat && (
                    <div className="bg-gradient-to-r from-[#00F2FF]/20 to-transparent p-1 rounded-2xl">
                        <button onClick={() => setShowChat(true)} className="w-full bg-[#0A0817] text-[#00F2FF] font-bold py-4 rounded-xl hover:bg-[#00F2FF]/10 transition-colors flex items-center justify-center gap-2 border border-[#00F2FF]/30">
                           <span className="material-symbols-outlined">forum</span> Kích Hoạt Chatbot
                        </button>
                    </div>
                 )}
                 <GaugeCharts />
                 <LowStockAlert productList={productList} selectedProd={selectedProd} onSelectProduct={handleSelectProduct} />
                 {showChat && <ChatWidget onClose={() => setShowChat(false)} robotRotateX={robotRotateX} robotRotateY={robotRotateY} />}
              </div>
            </div>
        </div>
    );
}
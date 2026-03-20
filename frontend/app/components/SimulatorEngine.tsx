"use client";

interface SimulatorEngineProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    price: number;
    setPrice: (val: number) => void;
    weeklyVel: number;
    setWeeklyVel: (val: number) => void;
    currentStock: number;
    setCurrentStock: (val: number) => void;
    leadTime: number;
    setLeadTime: (val: number) => void;
    month: number;
    setMonth: (val: number) => void;
    complexity: number;
    setComplexity: (val: number) => void;
    isDiscount: number;
    setIsDiscount: (val: number) => void;
    eventCount: number;
    setEventCount: (val: number) => void;
    storeScale: number;
    setStoreScale: (val: number) => void;
    handlePredict: () => void;
    isSimulating: boolean;
}

export default function SimulatorEngine(props: SimulatorEngineProps) {
    const {
        activeTab, setActiveTab, price, setPrice, weeklyVel, setWeeklyVel, 
        currentStock, setCurrentStock, leadTime, setLeadTime, month, setMonth, 
        complexity, setComplexity, isDiscount, setIsDiscount, eventCount, setEventCount, 
        storeScale, setStoreScale, handlePredict, isSimulating
    } = props;

    return (
        <div className="bg-white/5 backdrop-blur-lg p-7 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-[#00F2FF]/10 blur-[60px] rounded-full pointer-events-none"></div>

            <h3 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00F2FF]">tune</span> Hệ Thống Mô Phỏng
            </h3>
            
            <div className="flex gap-6 mb-6">
                <button onClick={() => setActiveTab("basic")} className={`pb-2 px-1 font-bold transition-all border-b-2 ${activeTab === 'basic' ? 'border-[#00F2FF] text-[#00F2FF] drop-shadow-[0_0_8px_rgba(0,242,255,0.6)]' : 'border-transparent text-slate-400 hover:text-white'}`}>🛒 Cài Đặt Cơ Bản</button>
                <button onClick={() => setActiveTab("advance")} className={`pb-2 px-1 font-bold transition-all border-b-2 ${activeTab === 'advance' ? 'border-[#00F2FF] text-[#00F2FF] drop-shadow-[0_0_8px_rgba(0,242,255,0.6)]' : 'border-transparent text-slate-400 hover:text-white'}`}>⚙️ Cài Đặt Nâng Cao</button>
            </div>

            {activeTab === "basic" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                    <div><label className="block text-slate-300 font-semibold mb-2">Giá bán giả lập ($)</label><input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full bg-[#0A0817]/80 border border-white/20 rounded-xl p-3 text-white focus:border-[#00F2FF] outline-none transition-colors" /></div>
                    <div><label className="block text-slate-300 font-semibold mb-2">Sức bán nền tảng</label><input type="number" value={weeklyVel} onChange={e => setWeeklyVel(Number(e.target.value))} className="w-full bg-[#0A0817]/80 border border-white/20 rounded-xl p-3 text-white focus:border-[#00F2FF] outline-none transition-colors" /></div>
                    <div><label className="block text-slate-300 font-semibold mb-2">Tồn kho hiện có (Cái)</label><input type="number" value={currentStock} onChange={e => setCurrentStock(Number(e.target.value))} className="w-full bg-[#0A0817]/80 border border-white/20 rounded-xl p-3 text-white focus:border-[#00F2FF] outline-none transition-colors" /></div>
                    <div><label className="block text-slate-300 font-semibold mb-2">Lead Time dự kiến</label><input type="number" value={leadTime} onChange={e => setLeadTime(Number(e.target.value))} className="w-full bg-[#0A0817]/80 border border-white/20 rounded-xl p-3 text-white focus:border-[#00F2FF] outline-none transition-colors" /></div>
                    
                    {/* === THANH TRƯỢT DÀI: MÙA VỤ === */}
                    <div className="col-span-1 md:col-span-2 mt-3 bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-end mb-3">
                            <label className="block text-slate-300 font-bold uppercase tracking-wider text-xs">Mùa vụ (Tháng nhập hàng)</label>
                            <span className="text-[#00F2FF] font-black text-2xl drop-shadow-[0_0_5px_rgba(0,242,255,0.5)]">M{month}</span>
                        </div>
                        <input type="range" min="1" max="12" value={month} onChange={e => setMonth(Number(e.target.value))} className="w-full accent-[#00F2FF] h-2 bg-[#0A0817] border border-white/10 rounded-lg appearance-none cursor-pointer" />
                        <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-bold px-1">
                            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                    <div><label className="block text-slate-300 font-semibold mb-2">Độ khó gia công</label><select value={complexity} onChange={e => setComplexity(Number(e.target.value))} className="w-full bg-[#0A0817]/80 border border-white/20 rounded-xl p-3 text-white focus:border-[#00F2FF] outline-none"><option value={0}>Basic (Dễ may)</option><option value={1}>Complex (Khó may)</option></select></div>
                    <div><label className="block text-slate-300 font-semibold mb-2">Áp dụng giảm giá?</label><select value={isDiscount} onChange={e => setIsDiscount(Number(e.target.value))} className="w-full bg-[#0A0817]/80 border border-white/20 rounded-xl p-3 text-white focus:border-[#00F2FF] outline-none"><option value={0}>Không</option><option value={1}>Có</option></select></div>
                    <div><label className="block text-slate-300 font-semibold mb-2">Số ngày Lễ/Flash Sale</label><input type="number" value={eventCount} onChange={e => setEventCount(Number(e.target.value))} className="w-full bg-[#0A0817]/80 border border-white/20 rounded-xl p-3 text-white focus:border-[#00F2FF] outline-none" /></div>
                    <div><label className="block text-slate-300 font-semibold mb-2">Chi phí lưu kho/tháng</label><input type="number" value={(price * 0.0125).toFixed(4)} disabled className="w-full bg-[#0A0817]/50 border border-white/10 rounded-xl p-3 text-slate-500 opacity-70" /></div>
                </div>
            )}

            {/* === THANH TRƯỢT DÀI: QUY MÔ === */}
            <div className="mt-6 pt-6 border-t border-white/10">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-end mb-3">
                        <label className="block text-slate-300 font-bold uppercase tracking-wider text-xs">Quy mô mạng lưới (Điểm bán)</label>
                        <span className="text-[#FF00E5] font-black text-2xl drop-shadow-[0_0_5px_rgba(255,0,229,0.5)]">{storeScale} CH</span>
                    </div>
                    <input type="range" min="1" max="5000" step="1" value={storeScale} onChange={e => setStoreScale(Number(e.target.value))} className="w-full accent-[#FF00E5] h-2 bg-[#0A0817] border border-white/10 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-bold">
                        <span>1 Store</span><span>5000 Stores</span>
                    </div>
                </div>
            </div>

            <style>{`
                input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; border-radius: 50%; background: currentColor; cursor: pointer; border: 3px solid #0A0817; box-shadow: 0 0 12px currentColor; }
                @keyframes cyberPulse { 0% { box-shadow: 0 0 0 0 rgba(0, 242, 255, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(0, 242, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 242, 255, 0); } }
            `}</style>
            
            <button 
                onClick={handlePredict} 
                disabled={isSimulating} 
                className="w-full mt-8 bg-gradient-to-r from-[#00F2FF] to-[#330DF2] text-white font-bold py-4 text-lg rounded-xl shadow-[0_0_20px_rgba(0,242,255,0.3)] transition-transform hover:scale-[1.01] flex justify-center items-center gap-2 border border-white/20" 
                style={{animation: 'cyberPulse 2s infinite'}}
            >
              {isSimulating ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">rocket_launch</span>}
              {isSimulating ? "COMPUTING NEURAL NETWORK..." : "INITIALIZE AI PREDICTION"}
            </button>
        </div>
    );
}
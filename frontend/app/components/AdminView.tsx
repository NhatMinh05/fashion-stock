"use client";

import { useState, useEffect, useRef } from "react";

export default function AdminView() {
  // --- STATES CẤU HÌNH API ---
  const [apiKey, setApiKey] = useState("sk-0f614c0e491842339038c456ec65565d");
  const [showKey, setShowKey] = useState(false);
  const [aiModel, setAiModel] = useState("deepseek-chat");
  const [temperature, setTemperature] = useState(0); // Set mặc định về 0 cho chính xác

  // --- STATES BẢO MẬT API KEY ---
  const [isSecurityPromptOpen, setIsSecurityPromptOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const MASTER_PASSWORD = "admin"; // <-- BẠN CÓ THỂ ĐỔI MẬT KHẨU Ở ĐÂY

  // --- STATES BUSINESS GUARDRAILS ---
  const [aiOverride, setAiOverride] = useState(true);
  const [autoDiscount, setAutoDiscount] = useState(false);
  
  // Biến cờ để kiểm tra xem đã đọc dữ liệu xong chưa
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Chỉ ĐỌC dữ liệu từ Local Storage KHI VỪA MỞ TRANG
  useEffect(() => {
    const savedAiOverride = localStorage.getItem("hm_aiOverride");
    if (savedAiOverride !== null) setAiOverride(savedAiOverride === "true");

    const savedAutoDiscount = localStorage.getItem("hm_autoDiscount");
    if (savedAutoDiscount !== null) setAutoDiscount(savedAutoDiscount === "true");

    const savedApiKey = localStorage.getItem("hm_apiKey");
    if (savedApiKey) setApiKey(savedApiKey);

    const savedAiModel = localStorage.getItem("hm_aiModel");
    if (savedAiModel) setAiModel(savedAiModel);

    const savedTemp = localStorage.getItem("hm_temperature");
    if (savedTemp) setTemperature(Number(savedTemp));

    setIsLoaded(true);
  }, []);

  // 2. Chỉ LƯU dữ liệu Công tắc khi người dùng GẠT NÚT
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("hm_aiOverride", aiOverride.toString());
    }
  }, [aiOverride, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("hm_autoDiscount", autoDiscount.toString());
    }
  }, [autoDiscount, isLoaded]);

  // --- TERMINAL LOGS ---
  const [logs, setLogs] = useState<string[]>([
    "[08:45:22] System: Core engine initialized...",
    "[08:45:25] AI: Model Demand online with 74% confidence.",
    "[08:45:26] AI: Model Inventory online with 88% accuracy.",
    "[09:00:10] System: API Control Panel entering maintenance mode."
  ]);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  // 3. Hàm lưu cấu hình API thực sự vào Local Storage
  // Xử lý khi bấm nút con mắt
  const handleToggleKeyVisibility = () => {
    if (showKey) {
      // Nếu đang hiện thì cho ẩn luôn không cần hỏi
      setShowKey(false);
    } else {
      // Nếu đang ẩn thì bật bảng xác thực lên
      setIsSecurityPromptOpen(true);
      setPasswordError(""); // Reset lỗi cũ
      setAdminPassword(""); // Xóa trắng ô nhập
    }
  };

  // Kiểm tra mật khẩu
  const handleVerifyPassword = () => {
    if (adminPassword === MASTER_PASSWORD) {
      setShowKey(true); // Nhập đúng -> Mở khóa con mắt
      setIsSecurityPromptOpen(false); // Tắt popup
      addLog("System: API Key visibility unlocked.");
    } else {
      setPasswordError("Mật khẩu không chính xác!");
    }
  };
  
  const handleSaveConfig = () => {
    localStorage.setItem("hm_apiKey", apiKey);
    localStorage.setItem("hm_aiModel", aiModel);
    localStorage.setItem("hm_temperature", temperature.toString());
    
    addLog(`System: API Config updated successfully. Model set to ${aiModel}.`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto space-y-6 pb-10">
      
      {/* HEADER & THÔNG BÁO BẢO TRÌ */}
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white mb-6 drop-shadow-lg">System Architecture</h1>
        
        <div className="bg-[#131127]/80 border border-[#330DF2]/50 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm shadow-[0_0_15px_rgba(51,13,242,0.2)]">
          <span className="material-symbols-outlined text-[#00F2FF]">terminal</span>
          <p className="text-[#00F2FF] text-sm font-medium tracking-wide">API Control Panel is currently under maintenance.</p>
        </div>
      </header>

      {/* HÀNG 1: STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#0A0817]/80 border border-white/10 p-6 rounded-2xl flex items-center gap-4 hover:border-[#00F2FF]/50 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-[#00F2FF]/10 flex items-center justify-center border border-[#00F2FF]/20 group-hover:shadow-[0_0_15px_#00F2FF] transition-shadow">
            <span className="material-symbols-outlined text-[#00F2FF]">check_circle</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Model Demand</p>
            <p className="text-2xl font-black text-white">Online <span className="text-[#00F2FF] text-lg">(74%)</span></p>
          </div>
        </div>

        <div className="bg-[#0A0817]/80 border border-white/10 p-6 rounded-2xl flex items-center gap-4 hover:border-[#FF00E5]/50 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-[#FF00E5]/10 flex items-center justify-center border border-[#FF00E5]/20 group-hover:shadow-[0_0_15px_#FF00E5] transition-shadow">
            <span className="material-symbols-outlined text-[#FF00E5]">check_circle</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Model Inventory</p>
            <p className="text-2xl font-black text-white">Online <span className="text-[#FF00E5] text-lg">(88%)</span></p>
          </div>
        </div>
      </div>

      {/* HÀNG 2: CONFIG & GUARDRAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- CỘT TRÁI: API CONFIGURATION --- */}
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#00F2FF]/5 blur-[60px] rounded-full pointer-events-none"></div>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
            <span className="material-symbols-outlined text-[#00F2FF]">vpn_key</span>
            API Configuration
          </h3>
          
          <div className="space-y-5 text-sm">
            {/* Nhập Key */}
            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">DeepSeek API Key</label>
              <div className="relative">
                <input 
                  type={showKey ? "text" : "password"} 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-[#0A0817] border border-white/20 rounded-xl py-2.5 pl-4 pr-10 text-slate-300 focus:border-[#00F2FF] outline-none font-mono text-xs" 
                />
                <button onClick={handleToggleKeyVisibility} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#00F2FF]">
                  <span className="material-symbols-outlined text-[18px]">{showKey ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Chọn Model */}
            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">Generative Model</label>
              <select value={aiModel} onChange={(e) => { setAiModel(e.target.value); addLog(`Model switched to ${e.target.value}`); }} className="w-full bg-[#0A0817] border border-white/20 rounded-xl p-2.5 text-slate-300 focus:border-[#00F2FF] outline-none font-mono text-xs cursor-pointer appearance-none">
                <option value="deepseek-chat">deepseek-chat (Default)</option>
                <option value="deepseek-coder">deepseek-coder (For Code)</option>
              </select>
            </div>

            {/* Thanh trượt Temperature */}
            <div className="pt-2">
              <div className="flex justify-between items-end mb-2">
                  <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">AI Temperature (Precision)</label>
                  <span className="text-[#00F2FF] font-black text-sm">{temperature.toFixed(1)}</span>
              </div>
              <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={e => { setTemperature(Number(e.target.value)); addLog(`Temperature adjusted to ${e.target.value}`); }} className="w-full accent-[#00F2FF] h-1.5 bg-[#0A0817] border border-white/10 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-bold">
                  <span>Precise</span><span>Creative</span>
              </div>
            </div>
            
            <button onClick={handleSaveConfig} className="w-full mt-4 bg-white/5 hover:bg-[#00F2FF]/10 text-[#00F2FF] border border-[#00F2FF]/30 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">save</span> Save Config
            </button>
          </div>
        </div>

        {/* --- CỘT PHẢI: BUSINESS GUARDRAILS --- */}
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#FF00E5]/5 blur-[60px] rounded-full pointer-events-none"></div>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
            <span className="material-symbols-outlined text-[#FF00E5]">admin_panel_settings</span>
            Business Guardrails
          </h3>

          <div className="space-y-6">
            
            {/* Tính năng 1: AI Override */}
            <div className="flex items-center justify-between p-4 bg-[#0A0817] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
              <div className="pr-4">
                <h4 className="text-sm font-bold text-white mb-1">AI Stock Auto-Correction</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Allow AI to automatically adjust reorder quantities if a sudden viral trend is detected in the market.</p>
              </div>
              <button 
                onClick={() => { setAiOverride(!aiOverride); addLog(`AI Auto-Correction turned ${!aiOverride ? 'ON' : 'OFF'}`); }} 
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 focus:outline-none border ${aiOverride ? 'bg-[#00F2FF]/20 border-[#00F2FF]' : 'bg-slate-800 border-transparent'}`}
              >
                <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${aiOverride ? 'translate-x-7 bg-[#00F2FF] shadow-[0_0_8px_#00F2FF]' : 'translate-x-1 bg-slate-400'}`} />
              </button>
            </div>

            {/* Tính năng 2: Discount Auto-Approve */}
            <div className="flex items-center justify-between p-4 bg-[#0A0817] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
              <div className="pr-4">
                <h4 className="text-sm font-bold text-white mb-1">Discount Auto-Approve</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Enable the system to automatically apply a 10% markdown for items sitting in inventory for over 90 days.</p>
              </div>
              <button 
                onClick={() => { setAutoDiscount(!autoDiscount); addLog(`Discount Auto-Approve turned ${!autoDiscount ? 'ON' : 'OFF'}`); }} 
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 focus:outline-none border ${autoDiscount ? 'bg-[#FF00E5]/20 border-[#FF00E5]' : 'bg-slate-800 border-transparent'}`}
              >
                <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${autoDiscount ? 'translate-x-7 bg-[#FF00E5] shadow-[0_0_8px_#FF00E5]' : 'translate-x-1 bg-slate-400'}`} />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* HÀNG 3: TERMINAL LOGS (Bảng điều khiển chạy ngầm) */}
      <div className="bg-[#05040a] p-5 rounded-2xl border border-white/10 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">code</span> System Terminal
            </h3>
            <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            </div>
        </div>
        
        <div ref={terminalRef} className="h-[200px] overflow-y-auto font-mono text-[12px] text-emerald-400 space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {logs.map((log, index) => (
                <div key={index} className="opacity-90 hover:opacity-100 hover:bg-white/5 px-2 py-0.5 rounded transition-colors">
                    <span className="text-slate-500 mr-2">{">"}</span>{log}
                </div>
            ))}
        </div>
      </div>

      {/* POPUP BẢO MẬT HIỆN LÊN KHI BẤM CON MẮT */}
      {isSecurityPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0817] border border-[#00F2FF]/30 p-6 rounded-2xl w-80 shadow-[0_0_30px_rgba(0,242,255,0.15)]">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00F2FF]">lock</span> Xác thực Admin
            </h3>
            <p className="text-xs text-slate-400 mb-4">Vui lòng nhập mật khẩu quản trị để xem API Key.</p>
            <input
              type="password"
              placeholder="Nhập mật khẩu..."
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
              className="w-full bg-[#05040a] border border-white/20 rounded-xl py-2.5 px-4 text-white focus:border-[#00F2FF] outline-none mb-2 text-sm font-mono"
            />
            {passwordError && <p className="text-rose-500 text-xs mb-2 font-medium">{passwordError}</p>}
            
            <div className="flex gap-3 mt-4">
              <button onClick={() => setIsSecurityPromptOpen(false)} className="flex-1 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors">Hủy</button>
              <button onClick={handleVerifyPassword} className="flex-1 py-2 rounded-xl bg-[#00F2FF]/10 text-[#00F2FF] border border-[#00F2FF]/30 hover:bg-[#00F2FF]/20 text-sm font-bold transition-all">Mở Khóa</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
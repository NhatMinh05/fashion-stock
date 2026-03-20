"use client";

import { useState, useRef, useEffect } from "react";

interface ChatWidgetProps {
    onClose: () => void;
    robotRotateX: number;
    robotRotateY: number;
}

export default function ChatWidget({ onClose, robotRotateX, robotRotateY }: ChatWidgetProps) {
    // 1. CHUYỂN TOÀN BỘ STATE CỦA CHAT SANG ĐÂY
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState([
        { role: "assistant", content: "Dạ em chào anh Minh ạ! Cần em kiểm tra mã hàng nào hôm nay?" }
    ]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // 2. CHUYỂN LOGIC SCROLL SANG ĐÂY
    useEffect(() => { 
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
    }, [chatMessages]);

    // 3. CHUYỂN LOGIC GỬI TIN NHẮN SANG ĐÂY
    const handleSendChat = async () => {
        if (!chatInput.trim()) return;
        
        // Lưu tin nhắn mới của user vào mảng
        const newMsgs = [...chatMessages, { role: "user", content: chatInput }];
        setChatMessages(newMsgs);
        setChatInput("");
        setIsChatLoading(true);

        try {
            const res = await fetch("https://fashion-stock.onrender.com/api/chat", {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    message: chatInput, 
                    history: chatMessages // CẬP NHẬT: Gửi toàn bộ lịch sử tin nhắn hiện có lên Backend
                }),
            });
            const data = await res.json();
            
            // Cập nhật câu trả lời từ Bot vào danh sách hiển thị
            setChatMessages([...newMsgs, { role: "assistant", content: data.reply }]);
        } catch (e) { 
            setChatMessages([...newMsgs, { role: "assistant", content: "Google API đang quá tải. Anh đợi 30 giây nhé!" }]); 
        }
        setIsChatLoading(false);
    };

    // 4. CHUYỂN TOÀN BỘ UI CỦA KHUNG CHAT SANG ĐÂY
    return (
        <div className="fixed bottom-0 right-[100px] w-[338px] h-[455px] z-[100] bg-[#0A0817]/95 rounded-t-2xl border border-b-0 border-[#00F2FF]/50 shadow-[0_-5px_40px_rgba(0,242,255,0.15)] flex flex-col animate-in slide-in-from-bottom-10 fade-in backdrop-blur-2xl overflow-hidden">
            <button onClick={onClose} className="absolute right-3 top-3 text-slate-400 hover:text-[#FF00E5] z-10 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="p-3 flex flex-col items-center border-b border-white/10 bg-gradient-to-b from-[#00F2FF]/10 to-transparent">
                <div style={{ perspective: '800px' }} className="w-12 h-12 mb-1 flex justify-center items-center">
                    <img src="https://i.postimg.cc/13fWPT90/Screenshotkk-2026-03-13-224827-removebg-preview.png" alt="Robot" 
                        style={{ transform: `rotateX(${robotRotateX}deg) rotateY(${robotRotateY}deg)`, transition: 'transform 0.1s ease-out' }} 
                        className="w-full drop-shadow-[0_5px_10px_rgba(0,242,255,0.4)]" />
                </div>
                <h4 className="font-bold text-[11px] uppercase tracking-widest text-[#00F2FF]">CORE LINK</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-[#31A24C] rounded-full animate-pulse shadow-[0_0_8px_#31A24C]"></div>
                    <span className="text-[9px] uppercase text-slate-300 tracking-wider">Online</span>
                </div>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-transparent text-[13px]">
                {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                        <div className={`size-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-[#FF00E5]' : 'bg-[#00F2FF]'}`}>
                            <span className="material-symbols-outlined text-white text-[11px]">{msg.role === 'user' ? 'person' : 'smart_toy'}</span>
                        </div>
                        <div className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-md backdrop-blur-sm ${msg.role === 'user' ? 'bg-[#FF00E5]/20 text-white rounded-br-sm border border-[#FF00E5]/30' : 'bg-white/10 text-slate-100 rounded-bl-sm border border-white/10 leading-relaxed'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isChatLoading && <div className="text-[#00F2FF] italic text-[11px] ml-8 flex items-center gap-1.5"><span className="material-symbols-outlined animate-spin text-[12px]">refresh</span> Đang xử lý...</div>}
                <div ref={chatEndRef} />
            </div>

            <div className="p-2.5 bg-[#0A0817] border-t border-white/10 flex gap-2 relative z-10">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()} placeholder="Aa" className="flex-1 bg-[#131127] border border-white/10 rounded-full pl-4 pr-9 py-2 text-[13px] outline-none focus:border-[#00F2FF] text-white transition-colors" />
                <button onClick={handleSendChat} disabled={isChatLoading} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00F2FF] w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#00F2FF]/20 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
            </div>
        </div>
    );
}
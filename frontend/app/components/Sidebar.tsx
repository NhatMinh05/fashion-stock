"use client";

import { useRouter } from "next/navigation"; // Thêm thư viện chuyển trang

interface SidebarProps {
    currentMenu: string;
    setCurrentMenu: (menu: string) => void;
}

export default function Sidebar({ currentMenu, setCurrentMenu }: SidebarProps) {
    const router = useRouter(); // Khởi tạo router

    const menus = [
        { id: "dashboard", icon: "space_dashboard", label: "Bảng điều khiển" },
        { id: "database", icon: "database", label: "Tra cứu hệ thống" },
        { id: "analytics", icon: "analytics", label: "Phân tích hệ thống" }, 
        { id: "admin", icon: "settings", label: "Cài đặt Admin" }
    ];

    // Hàm xử lý Đăng xuất
    const handleLogout = () => {
        router.push("/login"); 
    };

    return (
        <aside className="w-64 bg-[#0A0817]/80 backdrop-blur-xl border-r border-white/10 flex flex-col z-10 shrink-0">
            
            {/* --- LOGO SECTION (GIỮ NGUYÊN SIZE - ĐỘ THÊM LED NEON) --- */}
            <div className="flex items-center justify-center py-12 border-b border-white/5">
                <div className="relative w-48 h-24 group cursor-pointer flex items-center justify-center mx-auto">
                    
                    {/* HIỆU ỨNG 1: Hào quang gradient nhịp thở (Pulse) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00F2FF]/20 to-[#FF00E5]/20 blur-2xl rounded-full opacity-40 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"></div>
                    
                    {/* HIỆU ỨNG 2: Bóng đổ đổi màu */}
                    <img 
                        src="/logo.png" 
                        alt="Logo" 
                        className="w-full h-full object-contain relative z-10 
                                   brightness-125 
                                   contrast-125 
                                   drop-shadow-[0_0_15px_rgba(0,242,255,0.6)] 
                                   group-hover:drop-shadow-[0_0_25px_rgba(255,0,229,0.9)]
                                   transition-all duration-500 
                                   scale-150 group-hover:scale-[1.55]" 
                    />
                </div>
            </div>

            {/* --- NAVIGATION MENU --- */}
            <nav className="flex-1 p-0 space-y-3 mt-4">
                {menus.map(menu => (
                    <button 
                        key={menu.id}
                        onClick={() => setCurrentMenu(menu.id)} 
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${
                            currentMenu === menu.id 
                            ? 'bg-white/10 text-[#00F2FF] border-l-4 border-[#00F2FF] shadow-[0_0_15px_rgba(0,242,255,0.15)]' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">{menu.icon}</span> 
                        <span className="tracking-wide">{menu.label}</span>
                    </button>
                ))}
            </nav>

            {/* --- FOOTER & NÚT ĐĂNG XUẤT --- */}
            <div className="p-4 border-t border-white/5 space-y-3">
                {/* Nút Log out siêu ngầu */}
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/30 group"
                >
                    <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">logout</span>
                    <span className="tracking-wide uppercase text-xs">Đăng xuất hệ thống</span>
                </button>

                {/* Dòng trạng thái hệ thống */}
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest pt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]"></div>
                    System Active v2.5
                </div>
            </div>
        </aside>
    );
}
"use client";

import { useState } from "react";

interface DatabaseViewProps {
    productList: any[];
}

export default function DatabaseView({ productList }: DatabaseViewProps) {
    // 1. Khởi tạo State để lưu từ khóa tìm kiếm
    const [searchTerm, setSearchTerm] = useState("");

    // 2. Lọc danh sách sản phẩm dựa trên từ khóa (Mã SP hoặc Tên SP)
    const filteredProducts = productList.filter((product) => {
        const searchLower = searchTerm.toLowerCase();
        // Cần ép kiểu Mã SP về string trước khi toLowerCase() để tránh lỗi nếu nó là số
        const articleIdStr = String(product.article_id).toLowerCase();
        const prodNameStr = String(product.prod_name || "").toLowerCase();

        return articleIdStr.includes(searchLower) || prodNameStr.includes(searchLower);
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 max-w-[1400px] mx-auto relative z-10">
            
            {/* --- HEADER BẢNG & THANH TÌM KIẾM --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-black mb-2 text-white drop-shadow-lg">Central Database</h1>
                    <p className="text-slate-400">Bảng dữ liệu Top 100 sản phẩm H&M trích xuất từ Data Lake.</p>
                </div>

                {/* BẢN CẬP NHẬT: Thêm md:mr-8 để dịch thanh Search sang trái */}
                <div className="relative group w-full md:w-[320px] md:mr-8">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-500 group-focus-within:text-[#00F2FF] transition-colors text-[20px]">
                            search
                        </span>
                    </div>
                    {/* BẢN CẬP NHẬT: Bỏ font-mono, dùng font-medium, tăng padding-left (pl-11) cho thoáng */}
                    <input 
                        type="text" 
                        placeholder="Tìm theo Mã hoặc Tên SP..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0A0817] border border-white/20 rounded-xl py-2.5 pl-11 pr-10 text-[13px] font-medium text-slate-200 outline-none focus:border-[#00F2FF] focus:bg-[#0A0817]/90 transition-all focus:shadow-[0_0_15px_rgba(0,242,255,0.15)] placeholder:text-slate-500 tracking-wide"
                    />
                    {/* Nút xóa nhanh từ khóa (dấu X) */}
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm("")}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-[#FF00E5] transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    )}
                </div>
            </div>

            {/* --- BẢNG DỮ LIỆU --- */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_30px_rgba(0,242,255,0.05)] p-1">
                <div className="overflow-x-auto max-h-[700px] rounded-2xl">
                    <table className="w-full text-sm text-left text-slate-200">
                        <thead className="text-xs text-[#00F2FF] uppercase bg-[#0A0817] sticky top-0 border-b border-white/10 z-10 tracking-widest">
                            <tr>
                                <th className="px-6 py-5 rounded-tl-xl">Mã Sản Phẩm</th>
                                <th className="px-6 py-5">Tên Sản Phẩm</th>
                                <th className="px-6 py-5">Giá ($)</th>
                                <th className="px-6 py-5">Sức Bán</th>
                                <th className="px-6 py-5 rounded-tr-xl">Độ Phức Tạp</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent">
                            {/* Hiển thị thông báo nếu không tìm thấy kết quả */}
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        <span className="material-symbols-outlined text-[40px] mb-2 opacity-50 block">search_off</span>
                                        Không tìm thấy sản phẩm nào khớp với "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                /* Duyệt mảng dữ liệu đã ĐƯỢC LỌC (filteredProducts) thay vì productList gốc */
                                filteredProducts.map((p, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-[#FF00E5]">{p.article_id}</td>
                                        <td className="px-6 py-4 font-medium">{p.prod_name}</td>
                                        <td className="px-6 py-4">${p.price?.toFixed(2) || "0.00"}</td>
                                        <td className="px-6 py-4 text-[#00F2FF] font-bold text-lg">{Math.round(p.weekly_velocity)}</td>
                                        <td className="px-6 py-4">
                                            {/* Badge hiển thị Basic/Complex */}
                                            {p.complexity_status === "B" ? (
                                                <span className="text-[#00F2FF] bg-[#00F2FF]/10 px-3 py-1.5 rounded-md border border-[#00F2FF]/20 text-[10px] font-bold uppercase tracking-wider">
                                                    Basic
                                                </span>
                                            ) : (
                                                <span className="text-[#FF00E5] bg-[#FF00E5]/10 px-3 py-1.5 rounded-md border border-[#FF00E5]/20 text-[10px] font-bold uppercase tracking-wider">
                                                    Complex
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
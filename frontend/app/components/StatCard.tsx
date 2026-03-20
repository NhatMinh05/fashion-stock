"use client";
import React from "react";

interface StatCardProps {
    title: string;
    mainIcon: string;
    mainIconClass: string;
    hoverBorderClass: string;
    topHighlightClass: string;
    value: React.ReactNode;
    valueClass?: string;
    badgeText: string;
    badgeIcon: string;
    badgeClass: string;
    bottomGradientClass: string;
}

export default function StatCard({
    title, mainIcon, mainIconClass, hoverBorderClass, topHighlightClass,
    value, valueClass = "text-white", badgeText, badgeIcon, badgeClass, bottomGradientClass
}: StatCardProps) {
    return (
        <div className={`bg-[#0A0817]/70 p-5 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden group hover:border-transparent transition-all flex flex-col justify-between z-10 ${hoverBorderClass}`}>
            {/* Vệt sáng viền trên */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity ${topHighlightClass}`}></div>
            
            <div className="flex justify-between items-start mb-3">
                <h4 className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{title}</h4>
                <span className={`material-symbols-outlined text-[18px] opacity-70 ${mainIconClass}`}>{mainIcon}</span>
            </div>
            
            <div>
                <div className="flex items-end justify-between mb-2">
                    <h2 className={`text-3xl font-black ${valueClass}`}>{value}</h2>
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border whitespace-nowrap ${badgeClass}`}>
                        <span className="material-symbols-outlined text-[12px]">{badgeIcon}</span> {badgeText}
                    </div>
                </div>
                {/* Thanh tiến trình chạy ở đáy */}
                <div className={`h-[3px] w-full bg-gradient-to-r rounded-full opacity-80 relative overflow-hidden shadow-[0_0_10px_currentColor] ${bottomGradientClass}`}>
                    <div className="absolute inset-0 bg-white/20 animate-slideRight"></div>
                </div>
            </div>
        </div>
    );
}
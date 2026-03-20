"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    
    // --- TRẠNG THÁI GIAO DIỆN ---
    const [isSignUp, setIsSignUp] = useState(false); 
    const [view, setView] = useState<"auth" | "forgot">("auth"); // 'auth' là mặc định, 'forgot' khi lấy lại pass
    
    // --- TRẠNG THÁI FORM ---
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // --- XỬ LÝ SUBMIT (Login / Register / Reset) ---
    const handleSubmit = (e: React.FormEvent, type: "login" | "register" | "reset") => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMsg("");

        if (type === "register") {
            setTimeout(() => {
                setSuccessMsg("Tạo tài khoản thành công! Bạn có thể đăng nhập.");
                setIsLoading(false);
                setTimeout(() => { handleSlideChange(false); setSuccessMsg(""); }, 2000);
            }, 1500);
        } else if (type === "login") {
            setTimeout(() => {
                if (username === "admin" && password === "Fashion@2024") {
                    router.push('/dashboard');
                } else {
                    setError("Mã quản lý hoặc mật khẩu không chính xác.");
                    setIsLoading(false);
                }
            }, 1500);
        } else if (type === "reset") {
            setTimeout(() => {
                setSuccessMsg("Link đặt lại mật khẩu đã được gửi vào Email!");
                setIsLoading(false);
                setTimeout(() => setView("auth"), 3000);
            }, 1500);
        }
    };

    // --- CHUYỂN ĐỔI GIỮA LOGIN VÀ SIGNUP (Reset view về auth) ---
    const handleSlideChange = (toSignUp: boolean) => {
        setIsSignUp(toSignUp);
        setView("auth");
        setError("");
        setSuccessMsg("");
    };

    // --- XỬ LÝ ĐĂNG NHẬP MXH ---
    const handleSocialAction = (platform: string) => {
        alert(`Đang kết nối API tới ${platform}...`);
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center relative font-sans text-white selection:bg-[#00F2FF] selection:text-black">
            
            {/* Lớp nền tối & mesh */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0 pointer-events-none"></div>

            {/* --- WRAPPER CHÍNH (Cao 580px để thoáng các nút) --- */}
            <div className="relative z-10 w-[750px] h-[580px] rounded-3xl overflow-hidden border-2 border-[#00F2FF] shadow-[0_0_25px_rgba(0,242,255,0.6)] bg-[#111]">
                
                {/* =========================================
                    1. VÙNG CHỨA FORM (TRÁI/PHẢI THEO BIẾN isSignUp)
                ========================================== */}
                <div className={`absolute top-0 left-0 w-1/2 h-full transition-transform duration-700 ease-in-out z-20 ${isSignUp ? 'translate-x-full' : 'translate-x-0'}`}>
                    
                    {/* --- VIEW: LOGIN FORM --- */}
                    <div className={`absolute inset-0 p-10 flex flex-col justify-center transition-all duration-500 ${!isSignUp && view === 'auth' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <h2 className="text-3xl font-bold mb-6 tracking-wide text-white">Login</h2>
                        <form onSubmit={(e) => handleSubmit(e, "login")} className="space-y-4">
                            <div className="relative border-b border-white/20 pb-2 group focus-within:border-[#00F2FF] transition-colors">
                                <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#00F2FF] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-transparent pl-8 text-sm text-white placeholder-slate-500 outline-none" placeholder="Username" required />
                            </div>
                            <div className="relative border-b border-white/20 pb-2 group focus-within:border-[#00F2FF] transition-colors">
                                <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#00F2FF] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent pl-8 text-sm text-white placeholder-slate-500 outline-none" placeholder="Password" required />
                            </div>
                            
                            {/* QUÊN MẬT KHẨU - NÚT BẤM ĐƯỢC */}
                            <div className="flex justify-end mt-1">
                                <button type="button" onClick={() => setView("forgot")} className="text-[11px] text-slate-500 hover:text-[#00F2FF] transition-colors cursor-pointer">Forgot Password?</button>
                            </div>

                            {error && <div className="text-rose-500 text-xs font-medium animate-pulse">{error}</div>}
                            
                            <button type="submit" disabled={isLoading} className="w-full py-2.5 mt-2 rounded-full border border-[#00F2FF] text-[#00F2FF] font-bold text-sm uppercase hover:bg-[#00F2FF] hover:text-black transition-all active:scale-95">
                                {isLoading ? "Processing..." : "Login"}
                            </button>
                        </form>
                        <SocialAuthSection onAction={handleSocialAction} title="Or login with" />
                    </div>

                    {/* --- VIEW: FORGOT PASSWORD FORM --- */}
                    <div className={`absolute inset-0 p-10 flex flex-col justify-center transition-all duration-500 ${!isSignUp && view === 'forgot' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        <h2 className="text-2xl font-bold mb-2 tracking-wide text-[#00F2FF]">Forgot Password</h2>
                        <p className="text-xs text-slate-400 mb-8">Enter your registered email to get a reset link.</p>
                        <form onSubmit={(e) => handleSubmit(e, "reset")} className="space-y-6">
                            <div className="relative border-b border-white/20 pb-2 group focus-within:border-[#00F2FF] transition-colors">
                                <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#00F2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent pl-8 text-sm outline-none" placeholder="Email Address" required />
                            </div>
                            {successMsg && <div className="text-[#00F2FF] text-xs font-medium">{successMsg}</div>}
                            <div className="space-y-3 pt-2">
                                <button type="submit" disabled={isLoading} className="w-full py-2.5 rounded-full bg-[#00F2FF] text-black font-bold text-sm uppercase active:scale-95">Send Reset Link</button>
                                <button type="button" onClick={() => setView("auth")} className="w-full text-xs text-slate-500 hover:text-white transition-colors cursor-pointer">Back to Login</button>
                            </div>
                        </form>
                    </div>

                    {/* --- VIEW: SIGN UP FORM --- */}
                    <div className={`absolute inset-0 p-10 flex flex-col justify-center transition-all duration-700 ease-in-out ${isSignUp ? 'opacity-100 scale-100 pointer-events-auto delay-200' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        <h2 className="text-3xl font-bold mb-6 tracking-wide">Sign up</h2>
                        <form onSubmit={(e) => handleSubmit(e, "register")} className="space-y-4">
                            <div className="relative border-b border-white/20 pb-2 group focus-within:border-[#00F2FF] transition-colors">
                                <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#00F2FF] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-transparent pl-8 text-sm outline-none" placeholder="Username" required />
                            </div>
                            <div className="relative border-b border-white/20 pb-2 group focus-within:border-[#00F2FF] transition-colors">
                                <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#00F2FF] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent pl-8 text-sm outline-none" placeholder="Email" required />
                            </div>
                            <div className="relative border-b border-white/20 pb-2 group focus-within:border-[#00F2FF] transition-colors">
                                <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#00F2FF] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent pl-8 text-sm outline-none" placeholder="Password" required />
                            </div>
                            {successMsg && <div className="text-[#00F2FF] text-xs font-medium">{successMsg}</div>}
                            <button type="submit" disabled={isLoading} className="w-full py-2.5 mt-2 rounded-full border border-[#00F2FF] text-[#00F2FF] font-bold text-sm uppercase hover:bg-[#00F2FF] hover:text-black transition-all active:scale-95">
                                {isLoading ? "..." : "Sign Up"}
                            </button>
                        </form>
                        <SocialAuthSection onAction={handleSocialAction} title="Or register with" />
                    </div>
                </div>

                {/* =========================================
                    2. LỚP OVERLAY TRƯỢT MÀU SẮC (Z-INDEX 100)
                ========================================== */}
                <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-[100] ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}>
                    <div className={`absolute top-0 left-[-100%] w-[200%] h-full bg-[#0d0d0d] transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-1/2' : 'translate-x-0'}`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00F2FF]/60 via-transparent to-transparent opacity-80 pointer-events-none"></div>
                        <div className="flex h-full">
                            {/* Panel cho Sign In */}
                            <div className="w-1/2 flex flex-col items-center justify-center px-10 text-center">
                                <h2 className="text-3xl font-bold mb-4 tracking-wider leading-tight text-white">WELCOME <br/> BACK!</h2>
                                <p className="text-sm text-slate-300 leading-relaxed mb-8">To keep connected with us please login with your personal info.</p>
                                <button onClick={() => handleSlideChange(false)} className="py-2.5 px-12 rounded-full border-2 border-white text-white font-bold text-sm uppercase hover:bg-white hover:text-black transition-all active:scale-95">Sign In</button>
                            </div>
                            {/* Panel cho Sign Up */}
                            <div className="w-1/2 flex flex-col items-center justify-center px-10 text-center">
                                <h2 className="text-3xl font-bold mb-4 tracking-wider leading-tight text-white">HELLO <br/> FRIEND!</h2>
                                <p className="text-sm text-slate-300 leading-relaxed mb-8">Enter your personal details and start your journey with us.</p>
                                <button onClick={() => handleSlideChange(true)} className="py-2.5 px-12 rounded-full border-2 border-white text-white font-bold text-sm uppercase hover:bg-white hover:text-black transition-all active:scale-95">Sign Up</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// --- COMPONENT CON CHO CÁC NÚT MXH ---
function SocialAuthSection({ title, onAction }: { title: string, onAction: (p: string) => void }) {
    return (
        <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
                <div className="w-full h-px bg-white/10 absolute"></div>
                <span className="relative bg-[#111] px-3 text-[10px] text-slate-500 uppercase tracking-widest z-10">{title}</span>
            </div>
            <div className="flex justify-center gap-4">
                {[
                    { id: 'Google', icon: <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.896 4.144-1.248 1.248-3.216 2.592-6.528 2.592-5.28 0-9.456-4.272-9.456-9.552s4.176-9.552 9.456-9.552c2.856 0 5.112 1.128 6.84 2.76l2.304-2.304C18.432 1.248 15.552 0 12 0 5.376 0 0 5.376 0 12s5.376 12 12 12c3.576 0 6.264-1.176 8.376-3.384 2.16-2.16 2.856-5.208 2.856-7.68 0-.72-.048-1.392-.168-2.016h-10.584z"/> },
                    { id: 'Facebook', icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/> },
                    { id: 'Github', icon: <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.332-5.467-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/> }
                ].map((platform) => (
                    <button 
                        key={platform.id}
                        type="button" 
                        onClick={() => onAction(platform.id)}
                        className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-slate-400 hover:text-[#00F2FF] hover:border-[#00F2FF] transition-all hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] active:scale-90"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">{platform.icon}</svg>
                    </button>
                ))}
            </div>
        </div>
    );
}
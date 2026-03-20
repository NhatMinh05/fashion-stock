"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DashboardView from "../components/DashboardView";
import DatabaseView from "../components/DatabaseView";
import AdminView from "../components/AdminView";

export default function Home() {
  // === LOGIC HỆ THỐNG & TRẠNG THÁI ===
  const [currentMenu, setCurrentMenu] = useState("dashboard");
  const [productList, setProductList] = useState<any[]>([]);
  const [selectedProd, setSelectedProd] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState("basic");
  const [price, setPrice] = useState(0);
  const [month, setMonth] = useState(11);
  const [currentStock, setCurrentStock] = useState(0);
  const [weeklyVel, setWeeklyVel] = useState(0);
  const [leadTime, setLeadTime] = useState(0);
  const [complexity, setComplexity] = useState(0);
  const [eventCount, setEventCount] = useState(2);
  const [isDiscount, setIsDiscount] = useState(0);
  const [storeScale, setStoreScale] = useState(1);
  const [result, setResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const [showChat, setShowChat] = useState(false);
  
  // Logic trỏ chuột xoay robot
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
  const robotRotateX = Math.max(-20, Math.min(20, -(mousePos.y - 400) / 20));
  const robotRotateY = Math.max(-20, Math.min(20, (mousePos.x - 1200) / 20));

  // Tải dữ liệu ban đầu
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products").then(res => res.json())
      .then(data => { setProductList(data); if (data.length > 0) handleSelectProduct(data[0]); });
  }, []);

  // Tính số ngày sự kiện theo tháng
  useEffect(() => {
    const eventsDict: Record<number, number> = {1:2, 2:1, 3:2, 4:2, 5:2, 6:1, 7:1, 8:1, 9:1, 10:1, 11:3, 12:3};
    setEventCount(eventsDict[month] || 1);
  }, [month]);

  const handleSelectProduct = (prod: any) => {
    setSelectedProd(prod);
    setPrice(prod.price);
    setWeeklyVel(prod.weekly_velocity);
    setLeadTime(prod.Lead_Time_Days);
    setComplexity(prod.complexity_status === "B" ? 0 : 1);
    setCurrentStock(0); 
    setResult(null);
  };

  const handlePredict = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/predict", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price, month, current_stock: currentStock, weekly_vel_base: weeklyVel, lead_time: leadTime, complexity_val: complexity, event_count: eventCount, is_discount_val: isDiscount, store_scale: storeScale }),
      });
      const data = await res.json();
      setResult(data);
      setCurrentStock(data.end_inventory); 
    } catch (e) { alert("⚠️ Lỗi kết nối AI"); }
    setIsSimulating(false);
  };

  // Dữ liệu biểu đồ
  const chartData = result ? [
    { name: 'Tồn đầu kỳ', base: 0, value: result.start_inventory, color: '#64748b' },
    { name: '+ Lệnh nhập', base: result.start_inventory, value: result.order_qty, color: '#00F2FF' }, 
    { name: '= TỔNG CÓ SẴN', base: 0, value: result.start_inventory + result.order_qty, color: '#475569' },
    { name: '- Khách mua', base: result.end_inventory, value: result.demand_pred, color: '#FF00E5' }, 
    { name: '= Tồn cuối kỳ', base: 0, value: result.end_inventory, color: '#94a3b8' }
  ] : [];

  // === RENDER GIAO DIỆN ===
  return (
    <div className="flex h-screen bg-[#0A0817] text-white font-sans overflow-hidden selection:bg-[#FF00E5] selection:text-white" onMouseMove={handleMouseMove}>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* Hiệu ứng Background */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#330DF2] blur-[120px] rounded-full opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#FF00E5] blur-[120px] rounded-full opacity-10 pointer-events-none"></div>

      {/* Thanh Menu Trái */}
      <Sidebar currentMenu={currentMenu} setCurrentMenu={setCurrentMenu} />

      {/* Vùng Nội Dung Chính */}
      <main className="flex-1 p-8 overflow-y-auto scroll-smooth relative z-10">
        
        {currentMenu === "dashboard" && (
          <DashboardView 
            productList={productList} selectedProd={selectedProd} handleSelectProduct={handleSelectProduct}
            activeTab={activeTab} setActiveTab={setActiveTab} price={price} setPrice={setPrice}
            month={month} setMonth={setMonth} currentStock={currentStock} setCurrentStock={setCurrentStock}
            weeklyVel={weeklyVel} setWeeklyVel={setWeeklyVel} leadTime={leadTime} setLeadTime={setLeadTime}
            complexity={complexity} setComplexity={setComplexity} eventCount={eventCount} setEventCount={setEventCount}
            isDiscount={isDiscount} setIsDiscount={setIsDiscount} storeScale={storeScale} setStoreScale={setStoreScale}
            result={result} isSimulating={isSimulating} handlePredict={handlePredict}
            showChat={showChat} setShowChat={setShowChat} robotRotateX={robotRotateX} robotRotateY={robotRotateY}
            chartData={chartData}
          />
        )}

        {currentMenu === "database" && <DatabaseView productList={productList} />}

        {currentMenu === "admin" && <AdminView />}

      </main>
    </div>
  );
}
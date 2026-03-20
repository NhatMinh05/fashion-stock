"use client";

interface LowStockAlertProps {
    productList: any[];
    selectedProd: any;
    onSelectProduct: (prod: any) => void;
}

export default function LowStockAlert({ productList, selectedProd, onSelectProduct }: LowStockAlertProps) {
    if (productList.length <= 1) return null; // Ẩn nếu không có sp nào khác

    // Lọc và chọn một sản phẩm ngẫu nhiên khác
    const otherProds = productList.filter(p => p.article_id !== selectedProd?.article_id);
    const relatedProd = otherProds.length > 0 
        ? otherProds[(selectedProd?.article_id || 0) % otherProds.length] 
        : productList[0];
    
    const stockImages = {
        shirt: "https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=150",
        pants: "https://images.pexels.com/photos/65676/nanjing-studio-jeans-65676.jpeg?auto=compress&cs=tinysrgb&w=150",
        default: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=150"
    };
    
    const prodName = relatedProd?.prod_name?.toLowerCase() || "";
    let imageSrc = stockImages.default;

    if (prodName.includes('pants') || prodName.includes('jeans') || prodName.includes('quần') || prodName.includes('trousers') || prodName.includes('shorts')) {
        imageSrc = stockImages.pants;
    } else if (prodName.includes('shirt') || prodName.includes('áo') || prodName.includes('polo') || prodName.includes('blouse') || prodName.includes('top')) {
        imageSrc = stockImages.shirt;
    }

    return (
        <div className="bg-[#0A0817] p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-center mt-6">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">LOW STOCK ALERT</h4>
            
            <div 
                onClick={() => onSelectProduct(relatedProd)}
                className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between hover:border-[#FF00E5]/50 hover:bg-white/10 transition-all cursor-pointer group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0A0817] rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-inner border border-white/5">
                        <img 
                            src={imageSrc} 
                            alt={relatedProd?.prod_name}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://placehold.co/150x150/0A0817/00F2FF?text=Item";
                            }}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                    </div>
                    
                    <div className="flex flex-col justify-center">
                        <span className="text-sm font-bold text-white group-hover:text-[#00F2FF] transition-colors truncate max-w-[150px]">
                            {relatedProd?.prod_name}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">Stock Status: <span className="text-[#FF00E5] font-bold animate-pulse">Low</span></span>
                    </div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF00E5] shadow-[0_0_8px_#FF00E5] mr-2 animate-pulse shrink-0"></div>
            </div>
        </div>
    );
}
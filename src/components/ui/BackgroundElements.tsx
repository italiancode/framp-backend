import { Hexagon } from "lucide-react";

export function BackgroundElements() {
  return (
    <>
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-[#7b77b9]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-[#7b77b9]/20 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] left-[10%] w-[25%] h-[25%] bg-[#7b77b9]/10 rounded-full blur-[80px]" />
      </div>

      {/* Geometric shapes */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Small screen hexagons - always visible */}
        <div className="absolute top-[20%] right-[15%] opacity-20 animate-float">
          <Hexagon size={80} className="text-[#7b77b9]" />
        </div>
        <div className="absolute bottom-[25%] left-[10%] opacity-10 animate-float-delayed">
          <Hexagon size={120} className="text-[#7b77b9]" />
        </div>
        <div className="absolute top-[60%] right-[25%] opacity-15 animate-pulse">
          <div className="w-16 h-16 border border-[#7b77b9]/30 rounded-full" />
        </div>
        
        {/* Medium screen additional elements */}
        <div className="hidden md:block absolute top-[35%] left-[40%] opacity-15 animate-float" style={{ animationDelay: '1s' }}>
          <Hexagon size={50} className="text-[#7b77b9]" />
        </div>
        <div className="hidden md:block absolute bottom-[40%] right-[35%] opacity-10 animate-float-delayed" style={{ animationDelay: '2s' }}>
          <Hexagon size={70} className="text-[#7b77b9]" />
        </div>
        
        {/* Large screen additional elements */}
        <div className="hidden lg:block absolute top-[70%] left-[25%] opacity-20 animate-float-delayed" style={{ animationDelay: '3s' }}>
          <Hexagon size={40} className="text-[#7b77b9]" />
        </div>
        <div className="hidden lg:block absolute top-[15%] left-[30%] opacity-10 animate-float" style={{ animationDelay: '2.5s' }}>
          <div className="w-20 h-20 border border-[#7b77b9]/20 rounded-full" />
        </div>
      </div>
    </>
  );
} 
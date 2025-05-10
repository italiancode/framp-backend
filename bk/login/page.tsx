import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | FRAMP",
  description: "Sign in to your FRAMP account to access your dashboard and manage your finances.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] left-[10%] w-[25%] h-[25%] bg-violet-700/10 rounded-full blur-[80px]" />
      </div>

      {/* Header with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-5">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2">
            <div className="h-10 flex items-center">
              <img
                src="/frampapplogo.webp"
                alt="FRAMP Logo"
                className="h-8 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 pt-32 pb-20 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Sign In to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-500">FRAMP</span>
          </h1>
          <LoginForm />
        </div>
      </div>
    </main>
  );
} 
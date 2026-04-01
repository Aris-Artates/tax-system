"use client";
import { useState } from "react";
import { toast } from "sonner";
import { User, Lock, Eye, EyeOff, LogIn, Mail, Facebook } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginComponent() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Login failed. Please try again.";
        toast.error(errorMessage);
        return;
      }

      router.push("/dashboard");
    } catch {
      const errorMessage = "An unexpected error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel */}
      <div className="w-full lg:w-1/3 xl:w-1/4 flex-none lg:max-w-md flex flex-col justify-between p-6 sm:p-8 xl:p-10 border-r border-gray-100">
        {/* Top Spacer */}
        <div />

        {/* Form Container */}
        <div className="w-full max-w-sm mx-auto space-y-8">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="flex flex-col items-center justify-center mb-4 text-[#0c3175]">
              <img
                src="/img/sta.rita_logo.png"
                alt="Sta-Rita Logo"
                className="w-16 h-16 object-contain"
              />
              <span className="font-bold tracking-wider mt-2 text-sm uppercase">
                LGU Sta. Rita
              </span>
            </div>
            <h1 className="font-lexend text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="font-inter text-sm text-gray-500 px-4">
              Sign in to your tax system account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="font-inter flex items-center gap-2 text-sm font-medium text-gray-600"
              >
                <User className="w-4 h-4 text-gray-400" />
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="font-inter w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="font-inter flex items-center gap-2 text-sm font-medium text-gray-600"
              >
                <Lock className="w-4 h-4 text-gray-400" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="font-inter w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 border border-gray-300 rounded text-blue-600 focus:ring-blue-600 focus:ring-offset-0 cursor-pointer"
                />
                <span className="font-inter text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="font-inter text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="font-inter w-full cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2 shadow-sm shadow-blue-600/20 mt-4"
            >
              <LogIn className="w-5 h-5" />
              <span>{isLoading ? "Signing in..." : "Sign In"}</span>
            </button>
          </form>
        </div>

        {/* Footer Contact */}
        <div className="text-center space-y-4">
          <p className="font-inter text-xs text-gray-400">
            Get in touch with us
          </p>
          <div className="flex justify-center space-x-3">
            <button className="p-2 rounded-full border border-gray-100 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
              <Mail className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full border border-gray-100 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
              <Facebook className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex flex-1 min-w-0 w-full relative bg-slate-900 items-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 w-full h-full"
          style={{
            backgroundImage: "url('/img/bg-starita.png')",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 z-0 bg-black/40 bg-linear-to-t from-gray-900/90 via-gray-900/40 to-transparent" />

        <div className="relative z-10 w-full max-w-4xl xl:p-24 pt-24 xl:pt-32 text-white h-full flex flex-col justify-start p-10 mt-20">
          <div className="mb-4">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/95 text-blue-700 text-xs font-bold tracking-wider uppercase shadow-lg">
              <span className="text-blue-400 mr-2 text-lg leading-none mt-0.5">
                &rarr;
              </span>{" "}
              WELCOME TO LGU STA. RITA
            </span>
          </div>

          <h1 className="font-lexend text-5xl xl:text-6xl text-white font-semibold tracking-tight drop-shadow-md mb-2">
            Municipality of <span className="font-extrabold">Sta. Rita</span>
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-4 mb-8">
            <span className="text-xl xl:text-2xl font-medium tracking-wide drop-shadow-md">
              Province of Samar
            </span>
            <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-sm border border-white/30 font-medium tracking-wider shadow-sm">
              Region VIII
            </span>
            <span className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-sm border border-white/10 font-bold tracking-wider shadow-sm text-gray-100">
              MUNICIPAL TAX SYSTEM
            </span>
          </div>

          <div className="space-y-6 max-w-3xl drop-shadow">
            <p className="font-inter text-[15px] xl:text-base leading-relaxed text-gray-100 font-medium">
              The Municipality of Sta. Rita's Revenue and Tax System is a
              modern, comprehensive online platform that streamlines tax
              assessment, collection, billing, and taxpayer records management.
              It exemplifies the municipality's unwavering commitment to
              transparency, accountability, efficiency, and the ease of doing
              business in local public finance.
            </p>

            <p className="font-inter text-xs leading-relaxed text-gray-300 max-w-2xl">
              <span className="font-bold text-white">
                Digital Transformation:
              </span>{" "}
              This platform is part of LGU Sta. Rita's collective initiative
              promoting a secure, paperless, and highly organized public service
              system to better serve all constituents and stakeholders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

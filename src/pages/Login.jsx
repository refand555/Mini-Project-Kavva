// src/pages/Login.jsx
import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1. login supabase
      const result = await login(email, password);

      if (result?.error) {
        alert("Email atau password salah");
        return;
      }

      // 2. Ambil session yang sudah valid
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        alert("Login gagal, user tidak terbaca");
        return;
      }

      // 3. Cek role user
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      // 4. Arahkan sesuai role
      if (profile?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (err) {
      alert("Login gagal: " + err.message);
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4 relative">
      <button
        className="absolute left-4 top-20 z-[999] p-2 bg-white/90 rounded-full shadow-sm hover:scale-110 transition"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={20} className="text-black" />
      </button>

      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md z-0">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Masuk ke Akun
        </h1>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Masukkan email..."
              className="w-full mt-1 px-4 py-3 rounded-xl outline-none bg-white border border-[#E5E1D8]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password..."
              className="w-full mt-1 px-4 py-3 rounded-xl outline-none bg-white border border-[#E5E1D8]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-4 top-11 text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <p className="text-right text-sm mt-1">
          <a href="/forgot-password" className="text-black underline">
            Lupa password?
          </a>
        </p>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-black/90 transition"
          >
            Login
          </button>

          <div className="flex items-center gap-4">
            <hr className="flex-grow border-gray-300" />
            <span className="text-gray-400 text-sm">atau</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <p className="text-center text-sm text-gray-600">
            Belum punya akun?
            <a href="/register" className="text-black font-medium underline ml-1">
              Daftar Sekarang
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
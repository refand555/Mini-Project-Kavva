import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) return setErr(error.message);
    setMsg("Link reset password sudah dikirim ke email kamu.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Lupa Password
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium">Email kamu</label>
            <input
              type="email"
              placeholder="Masukkan email"
              className="w-full mt-1 px-4 py-3 rounded-xl outline-none bg-white border border-[#E5E1D8]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button className="w-full py-3 bg-black text-white rounded-xl hover:bg-black/80 transition">
            Kirim Link Reset
          </button>

          {msg && <p className="text-green-600 text-center">{msg}</p>}
          {err && <p className="text-red-600 text-center">{err}</p>}
        </form>
      </div>
    </div>
  );
}

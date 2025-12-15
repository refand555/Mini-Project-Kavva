import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  LogOut,
  User,
  ShoppingBag,
  Heart,
  HomeIcon,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import supabase from "../../lib/supabaseClient";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, loading, logout, updateProfile } = useAuth();

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [alamat, setAlamat] = useState("");
  const [noHp, setNoHp] = useState("");

  function getInitial(name) {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  }

  useEffect(() => {
    if (profile) {
      setUsername(profile.usernames || "");
      setPass(profile.pass || "");
      setAlamat(profile.alamat || "");
      setNoHp(profile.no_hp || "");
    }
  }, [profile]);

  const [stats, setStats] = useState({
    dipesan: 0,
    pending: 0,
    dibayar: 0,
  });

  const fetchStats = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select("status")
      .eq("user_id", user.id);

    if (error) {
      console.error("Gagal fetch:", error);
      return;
    }

    const pending = data.filter((o) => o.status === "Waiting For Payment").length;
    const dipesan = data.filter((o) => o.status === "Packing").length;
    const dibayar = data.filter((o) => o.status === "Done").length;

    setStats({ pending, dipesan, dibayar });
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  if (loading) return <p className="p-6">Loading...</p>;

  const handleSave = async () => {
    try {
      await updateProfile({
        usernames: username,
        pass,
        alamat,
        no_hp: noHp,
      });
      alert("Data berhasil diperbarui!");
      setEditMode(false);
    } catch (err) {
      alert("Gagal update: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f7f7f7]">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-black text-white p-6 flex flex-col justify-between">

        {/* AVATAR + USER INFO WITH HOVER ARROW */}
        <div className="flex items-center gap-4 mb-10 relative group">

          {/* AVATAR */}
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <span className="text-black font-semibold text-xl">
              {getInitial(profile?.usernames)}
            </span>
          </div>

          {/* USER INFO */}
          <div className="flex flex-col leading-tight">
            <span className="text-white font-semibold text-base">
              {profile?.usernames}
            </span>
            <span className="text-white/60 text-xs">{profile?.email}</span>
          </div>

        </div>

        {/* MENU */}
        <nav className="flex flex-col gap-6 text-sm">

          <button
            onClick={() => setActiveMenu("dashboard")}
            className="flex items-center gap-3"
          >
            <HomeIcon size={20} color="white" />
            <span className="font-semibold text-white">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveMenu("profile")}
            className="flex items-center gap-3"
          >
            <User size={20} color="white" />
            <span className="font-medium text-white">Profil</span>
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-3"
          >
            <ShoppingBag size={20} color="white" />
            <span className="font-medium text-white">Pesanan Saya</span>
          </button>

          <button
            onClick={() => navigate("/wishlist")}
            className="flex items-center gap-3"
          >
            <Heart size={20} color="white" />
            <span className="font-medium text-white">Wishlist</span>
          </button>

        </nav>

        <button onClick={logout} className="flex items-center gap-3 mt-auto">
          <LogOut size={20} color="white" />
          <span className="font-medium text-white">Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">

        {/* HEADER */}
        <header className="bg-white border border-black rounded-xl px-6 py-3 mb-6 shadow-sm flex justify-between items-center">

          <h1 className="text-xl font-semibold tracking-tight">
            {activeMenu === "dashboard" ? "Dashboard" : "Profil"}
          </h1>

          <div className="flex items-center gap-3">

            {/* ARROW LEFT PINDAH KE SINI */}
            <button
              onClick={() => navigate(-1)}
              className="p-2 border border-black rounded-lg hover:bg-black hover:text-white transition">
              <ArrowLeft size={18} />
            </button>

            {activeMenu === "profile" && (
              <button
                onClick={() => setEditMode(!editMode)}
                className="p-2 border border-black rounded-lg hover:bg-black hover:text-white transition"
              >
                <Pencil size={18} />
              </button>
            )}
          </div>
        </header>


        {/* DASHBOARD */}
        {activeMenu === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-black rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Produk Dipesan</h2>
              <p className="text-4xl font-bold">{stats.dipesan}</p>
            </div>

            <div className="bg-white border border-black rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Menunggu Pembayaran</h2>
              <p className="text-4xl font-bold">{stats.pending}</p>
            </div>

            <div className="bg-white border border-black rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Produk Dibayar</h2>
              <p className="text-4xl font-bold">{stats.dibayar}</p>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {activeMenu === "profile" && (
          <div className="bg-white border border-black rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Informasi Akun</h2>

            <div className="flex flex-col gap-4">

              <div>
                <p className="text-sm font-semibold mb-1">Email</p>
                <p className="border border-gray-300 rounded-lg p-3 bg-gray-100">
                  {profile?.email}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold mb-1">Password</p>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    readOnly={!editMode}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    className={`border border-gray-300 rounded-lg p-3 w-full pr-12 ${
                      editMode ? "bg-white text-black" : "bg-gray-100 text-black"
                    }`}
                  />

                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>



              <div>
                <p className="text-sm font-semibold mb-1">Username</p>
                {editMode ? (
                  <input
                    className="border border-gray-300 rounded-lg p-3 w-full bg-white text-black"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                ) : (
                  <p className="border border-gray-300 rounded-lg p-3 bg-gray-100">
                    {username}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold mb-1">Alamat</p>
                {editMode ? (
                  <input
                    className="border border-gray-300 rounded-lg p-3 w-full bg-white text-black"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                  />
                ) : (
                  <p className="border border-gray-300 rounded-lg p-3 bg-gray-100">
                    {alamat}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold mb-1">No HP</p>
                {editMode ? (
                  <input
                    className="border border-gray-300 rounded-lg p-3 w-full bg-white text-black"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                  />
                ) : (
                  <p className="border border-gray-300 rounded-lg p-3 bg-gray-100">
                    {noHp}
                  </p>
                )}
              </div>
            </div>

            {editMode && (
              <button
                onClick={handleSave}
                className="w-full mt-6 bg-black text-white py-3 rounded-lg"
              >
                Simpan Perubahan
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
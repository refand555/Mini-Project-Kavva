import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";
import { ArrowLeft } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // ========================================================
  // FETCH ORDER
  // ========================================================
  const fetchOrder = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (data) setOrder(data);
  };

  // ==========================================
  // LOAD MIDTRANS SNAP (HANYA DI HALAMAN INI)
  // ==========================================
useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
  script.setAttribute("data-client-key", "SB-Mid-client-KEY-KAMU");
  script.async = true;

  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
  };
}, []);


  // ========================================================
  // FETCH ORDER ITEMS + JOIN GAMBAR PRODUK
  // ========================================================
  const fetchItems = async () => {
    const { data } = await supabase
      .from("order_items")
      .select(`
        qty,
        harga,
        product:product_id (
          name,
          product_image (
            image_url,
            order
          )
        ),
        variant:variant_id ( size )
      `)
      .eq("order_id", id);

    if (data) setItems(data);
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      await fetchOrder();
      await fetchItems();
      setLoading(false);
    })();
  }, [user, id]);

  if (loading) {
    return <div className="p-6 text-center">Memuat detail order...</div>;
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        Order tidak ditemukan atau tidak punya akses.
      </div>
    );
  }

  // ========================================================
  // UPLOAD BUKTI GAMBAR
  // ========================================================
  const handleUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploading(true);

  const ext = file.name.split(".").pop();
  const filename = `bukti_${order.id}_${Date.now()}.${ext}`;
  const filepath = `uploads/${filename}`;

  // UPLOAD KE FOLDER DI DALAM BUCKET
  const { error: uploadErr } = await supabase.storage
    .from("order_bukti")
    .upload(filepath, file, { upsert: true });

  if (uploadErr) {
    alert("Gagal upload gambar");
    setUploading(false);
    return;
  }

  // DAPATKAN PUBLIC URL
  const { data } = supabase.storage
    .from("order_bukti")
    .getPublicUrl(filepath);

  const publicUrl = data.publicUrl;

  // SIMPAN KE DATABASE
  await supabase
    .from("orders")
    .update({ bukti_gambar: publicUrl })
    .eq("id", order.id);

  setOrder({ ...order, bukti_gambar: publicUrl });
  setUploading(false);
};

  return (
    <main className="p-6 max-w-2xl mx-auto">

      {/* TOMBOL KEMBALI */}
      <button
              className="absolute left-6 top-24 z-[999] p-2 bg-white rounded-full shadow-sm hover:scale-110 transition"
              onClick={() => navigate(-1)}>
              <ArrowLeft size={20} className="text-black" />
            </button>

      {/* JUDUL */}
      <h1 className="text-2xl font-bold mb-6">
        Detail Order #{order.id}
      </h1>

      {/* STATUS */}
      <div className="mb-6">
        <span
          className={`px-4 py-1 rounded-lg text-sm font-semibold ${
            order.status === "Waiting For Payment"
              ? "bg-red-100 text-red-700"
              : order.status === "Packing"
              ? "bg-yellow-100 text-yellow-700"
              : order.status === "Sending"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          Status:{" "}
          {order.status === "Waiting For Payment"
            ? "Selesaikan pembayaran terlebih dahulu"
            : order.status}
        </span>

      </div>

      {/* TOMBOL LANJUTKAN PEMBAYARAN (HANYA KELUAR JIKA BELUM DIBAYAR) */}
      {order.status === "Waiting For Payment" && order.snap_token && (
        <button
          onClick={() => {
            window.snap.pay(order.snap_token, {
              onSuccess: () => navigate("/order-success"),
              onPending: () => navigate("/order-success"),
              onError: () => alert("Pembayaran gagal."),
              onClose: () =>
                alert("Kamu menutup pembayaran. Klik tombol ini lagi untuk melanjutkan."),
            });
          }}
          className="mb-6 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          Lanjutkan Pembayaran
        </button>
      )}

      {/* INFORMASI PEMESAN */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="font-semibold text-lg mb-3">Informasi Pemesan</h2>

        <p>Nama: {order.nama_pemesan}</p>
        <p>Alamat: {order.alamat}</p>
        <p>No HP: {order.no_hp}</p>
        <p className="mt-2 text-gray-600 text-sm">
          Tanggal Order: {new Date(order.created_at).toLocaleDateString("id-ID")}
        </p>
      </div>

      {/* BARANG DIPESAN */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="font-semibold text-lg mb-3">Barang Dipesan</h2>

        {items.map((item, i) => {
          const img = item.product.product_image?.[0]?.image_url || null;

          return (
            <div
              key={i}
              className="border-b py-3 flex items-center gap-4"
            >
              {/* GAMBAR */}
              <div className="w-20 h-20 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                {img ? (
                  <img src={img} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500">No Image</span>
                )}
              </div>

              {/* INFO PRODUK */}
              <div className="flex-1">
                <p className="font-semibold">{item.product.name}</p>
                <p>Size: {item.variant?.size || "-"}</p>
                <p>Qty: {item.qty}</p>
              </div>

              {/* HARGA */}
              <div className="font-semibold">
                Rp {Number(item.harga).toLocaleString("id-ID")}
              </div>
            </div>
          );
        })}

        <h3 className="text-xl font-bold mt-4">
          Total: Rp {order.total_harga.toLocaleString("id-ID")}
        </h3>
      </div>

      {/* UPLOAD BUKTI */}
      {order.status === "dikirim" && (
        <div className="bg-white p-5 rounded-xl shadow mb-6">
          <h2 className="font-semibold text-lg mb-3">
            Upload Bukti Barang Sampai
          </h2>

          {order.bukti_gambar ? (
            <div className="text-center">
              <img
                src={order.bukti_gambar}
                className="w-48 mx-auto rounded-xl shadow mb-4"
              />
              <p className="text-gray-600 text-sm">
                Kamu sudah upload bukti, menunggu verifikasi admin.
              </p>
            </div>
          ) : (
            <>
              <input type="file" accept="image/*" onChange={handleUpload} />
              {uploading && (
                <p className="text-sm text-gray-600 mt-2">Mengupload...</p>
              )}
            </>
          )}
        </div>
      )}

      {/* SUDAH SELESAI */}
      {order.status === "commplete" && order.bukti_gambar && (
        <div className="bg-white p-5 rounded-xl shadow mb-6">
          <h2 className="font-semibold text-lg mb-3">Bukti Diterima</h2>
          <img
            src={order.bukti_gambar}
            className="w-48 mx-auto rounded-xl shadow"
          />
        </div>
      )}
    </main>
  );
}
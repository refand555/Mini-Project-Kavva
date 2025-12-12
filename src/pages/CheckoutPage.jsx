import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  const [profileLoading, setProfileLoading] = useState(true);

  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [nohp, setNohp] = useState("");

  // ==========================================
  // FETCH PROFILE USER
  // ==========================================
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("usernames, alamat, no_hp")
        .eq("id", user.id)
        .single();

      if (data) {
        setNama(data.usernames || "");
        setAlamat(data.alamat || "");
        setNohp(data.no_hp || "");
      }

      setProfileLoading(false);
    };

    fetchProfile();
  }, [user]);
  
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


  // ==========================================
  // FETCH CART USER + GAMBAR PRODUK
  // ==========================================
  useEffect(() => {
    if (!user) return;

    const fetchCart = async () => {
      const { data, error } = await supabase
        .from("cart")
        .select(`
          id,
          quantity,
          product:product_id (
            id,
            name,
            images:product_image ( image_url )
          ),
          variant:variant_id (
            id,
            size,
            price,
            stock
          )
        `)
        .eq("user_id", user.id);

      if (!error) {
        setCartItems(data || []);
      }

      setCartLoading(false);
    };

    fetchCart();
  }, [user]);

  // TOTAL
  const totalHarga = cartItems.reduce(
    (s, item) => s + Number(item.variant.price) * item.quantity,
    0
  );

  // ==========================================
  // KONFIRMASI ORDER
  // ==========================================
  const handlePlaceOrder = async () => {
  if (!nama || !alamat || !nohp) {
    alert("Semua data pemesan harus diisi.");
    return;
  }

  if (cartItems.length === 0) {
    alert("Keranjang kosong.");
    return;
  }

  // Validasi stok (opsional, tetap boleh cek)
  for (const item of cartItems) {
    if (item.quantity > item.variant.stock) {
      alert(
        `Stok tidak cukup untuk ${item.product.name} (Size ${item.variant.size}).`
      );
      return;
    }
  }

  // Update profile
  await supabase
    .from("profiles")
    .update({
      usernames: nama,
      alamat: alamat,
      no_hp: nohp,
    })
    .eq("id", user.id);

  // 1) Insert order dengan status Waiting For Payment
  const { data: newOrder, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        user_id: user.id,
        nama_pemesan: nama,
        alamat: alamat,
        no_hp: nohp,
        total_harga: totalHarga,
        status: "Waiting For Payment", // status awal
      },
    ])
    .select()
    .single();

  if (orderError || !newOrder) {
    console.error(orderError);
    alert("Gagal membuat order.");
    return;
  }

  // 2) Insert order_items
  for (const item of cartItems) {
    await supabase.from("order_items").insert([
      {
        order_id: newOrder.id,
        product_id: item.product.id,
        variant_id: item.variant.id,
        qty: item.quantity,
        harga: item.variant.price,
      },
    ]);
  }

  // 3) Hapus cart (biar ga dobel-dobel)
  await supabase.from("cart").delete().eq("user_id", user.id);

  // 4) Panggil Edge Function create-payment
  try {
    const res = await fetch(
          'https://tjvsczecnivadfojqscw.supabase.co/functions/v1/create-payment',     
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: String(newOrder.id), // penting: nanti dipakai di webhook
          gross_amount: totalHarga,
          items: cartItems.map((item) => ({
            id: String(item.product.id),
            price: Number(item.variant.price),
            quantity: item.quantity,
            name: item.product.name,
          })),
          customer: {
            name: nama,
            phone: nohp,
            address: alamat,
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Midtrans error:", data);
      alert("Gagal membuat transaksi pembayaran.");
      return;
    }

    // SIMPAN SNAP TOKEN
    const token = data.token;

    await supabase
      .from("orders")
      .update({ snap_token: token })
      .eq("id", newOrder.id);

    // 5) Buka Snap
    window.snap.pay(data.token, {
      onSuccess: function () {
        navigate("/order-success");
      },
      onPending: function () {
        navigate("/order-success");
      },
      onError: function () {
        alert("Terjadi kesalahan saat pembayaran.");
      },
      onClose: function () {
        // user nutup pop up tanpa bayar
        // biarin, status tetap 'Waiting for payment'
        navigate("/orders");
      },
    });
  } catch (e) {
    console.error(e);
    alert("Error memproses pembayaran.");
  }
};

  if (cartLoading || profileLoading) {
    return <div className="p-6 text-center">Memuat checkout...</div>;
  }

  return (
    <main className="w-full mx-auto px-2 py-4">

      {/* == HEADER: PANAH + CHECKOUT == */}
      <div className="flex items-center gap-3 mb-6 mt-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition"
        >
          <ArrowLeft size={20} className="text-black" />
        </button>

        <h1 className="text-3xl font-bold tracking-wide">Checkout</h1>
      </div>

      {/* WRAPPER BESAR FULL WIDTH (DATA PEMESAN + RINGKASAN PESANAN) */}
      <div className="w-full bg-white px-4 py-4 rounded-xl shadow mb-6">

        {/* DATA PEMESAN */}
        <h2 className="text-lg font-semibold mb-4">Data Pemesan</h2>

        <div className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Nama Pemesan"
            className="border border-gray-300 rounded-lg p-3 w-full bg-white text-black"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />

          <textarea
            placeholder="Alamat Lengkap"
            className="border border-gray-300 rounded-lg p-3 w-full bg-white text-black"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
          />

          <input
            type="text"
            placeholder="No HP"
            className="border border-gray-300 rounded-lg p-3 w-full bg-white text-black"
            value={nohp}
            onChange={(e) => setNohp(e.target.value)}
          />
        </div>

        {/* RINGKASAN PESANAN */}
        <h2 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h2>

        {cartItems.map((item) => {
          const imageUrl = item.product.images?.[0]?.image_url || "";

          return (
            <div
              key={item.id}
              className="mb-3 border-b pb-3 flex gap-4 items-center"
            >
              {/* GAMBAR PRODUK */}
              <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-500">No Image</span>
                )}
              </div>

              {/* INFO PRODUK */}
              <div>
                <p className="font-semibold">{item.product.name}</p>
                <p>Size: {item.variant.size}</p>
                <p>
                  Harga per item: Rp{" "}
                  {Number(item.variant.price).toLocaleString("id-ID")}
                </p>
                <p>Jumlah: {item.quantity}</p>
              </div>
            </div>
          );
        })}

        <h3 className="text-xl font-bold mt-4">
          Total: Rp {totalHarga.toLocaleString("id-ID")}
        </h3>
      </div>

      {/* KONFIRMASI */}
      <button
        onClick={handlePlaceOrder}
        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
      >
        Konfirmasi Order
      </button>

    </main>
  );
}
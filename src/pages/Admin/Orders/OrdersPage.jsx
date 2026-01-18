import { useEffect, useState } from "react";
import supabase from "../../../lib/supabaseClient";
import { Trash2, Check } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);

    const { data } = await supabase
    .from("orders")
    .select(`
      *,
      shipping:shipping_method_id (
        id,
        name,
        price
      )
    `)
    .order("created_at", { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const updateStatus = async (id, newStatus) => {
    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    fetchOrders();
  };

  const handleDelete = async (id) => {
    await supabase.from("orders").delete().eq("id", id);
    fetchOrders();
  };

  if (loading) {
    return <div className="p-6">Memuat data order...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Data Order</h1>

      {orders.map((o) => (
        <div
          key={o.id}
          className="bg-white border rounded-lg p-5 mb-5 shadow"
        >
          {/* HEADER */}
          <div
            className="flex justify-between cursor-pointer"
            onClick={() => toggleExpand(o.id)}
          >
            <div>
              <h3 className="text-lg font-bold">Order #{o.id}</h3>
              <span
                className={`text-sm px-3 py-1 rounded-lg font-semibold ${
                  o.status === "Packing"
                    ? "bg-yellow-100 text-yellow-700"
                    : o.status === "Sending"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {o.status}
              </span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => handleDelete(o.id)}>
                <Trash2 className="text-red-600" />
              </button>
            </div>
          </div>

          {/* DETAIL */}
          {expanded === o.id && (
            <div className="mt-4">
              <div className="mb-4 text-sm">
                <p><strong>Nama:</strong> {o.nama_pemesan}</p>
                <p><strong>Alamat:</strong> {o.alamat}</p>
                <p><strong>No HP:</strong> {o.no_hp}</p>
                <p>
                  <strong>Tanggal Order:</strong>{" "}
                  {new Date(o.created_at).toLocaleDateString("id-ID")}
                </p>
                {o.shipped_at && (
                <p>
                  <strong>Tanggal Bukti Diterima:</strong>{" "}
                  {new Date(o.shipped_at).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                  })}
                </p>
              )}
              {o.shipping && (
                <p>
                  <strong>Pengiriman:</strong>{" "}
                  {o.shipping.name} — Rp{" "}
                  {o.shipping.price.toLocaleString("id-ID")}
                </p>
              )}
              </div>

              {/* ITEM LIST */}
              <OrderItemsList
                orderId={o.id}
                totalHarga={o.total_harga}
              />

              {/* BUKTI */}
              {o.bukti_gambar && (
                <div className="mt-4">
                  <p className="font-semibold mb-2">Bukti Barang Sampai:</p>
                  <img
                    src={o.bukti_gambar}
                    alt="Bukti"
                    className="w-40 rounded shadow"
                  />
                </div>
              )}

              {/* TOMBOL STATUS */}
              <div className="mt-5 flex gap-3">
                {o.status === "Packing" && (
                  <button
                    onClick={() => updateStatus(o.id, "Sending")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Check size={18} />
                    Change to Sending
                  </button>
                )}

                {o.status === "Sending" && (
                  <button
                    onClick={() => updateStatus(o.id, "Done")}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Check size={18} />
                   Complete the Order
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   COMPONENT: ITEM LIST
================================================================ */
function OrderItemsList({ orderId, totalHarga }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from("order_items")
        .select(`
          qty,
          harga,
          product:product_id (
            name,
            product_image ( image_url )
          ),
          variant:variant_id ( size )
        `)
        .eq("order_id", orderId);

      if (data) setItems(data);
    };

    fetchItems();
  }, [orderId]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border mt-4">
      <p className="font-semibold mb-2">Produk:</p>

      <div className="space-y-4">
        {items.map((item, i) => {
          const img = item.product.product_image?.[0]?.image_url || null;

          return (
            <div
              key={i}
              className="flex gap-3 border-b pb-3"
            >
              {/* GAMBAR */}
              <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                {img ? (
                  <img
                    src={img}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-[10px] text-gray-500">No Image</span>
                )}
              </div>

              {/* DETAIL PRODUK */}
              <div className="flex-1 text-sm">
                <p className="font-medium">{item.product.name}</p>
                <p>Size: {item.variant?.size || "-"}</p>

                <p>
                  Harga per item: Rp{" "}
                  {item.harga.toLocaleString("id-ID")}
                </p>

                <p>Jumlah: {item.qty}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* TOTAL ORDER */}
      <p className="font-bold text-lg mt-4">
        Total Order: Rp {Number(totalHarga).toLocaleString("id-ID")}
      </p>
    </div>
  );
}
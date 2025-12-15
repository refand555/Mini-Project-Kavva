import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function UserOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (loading) {
    return <div className="p-6 text-center">Memuat pesanan...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center">
        <p className="text-gray-600">
          Kamu belum memiliki riwayat order.
        </p>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">

   <button
          className="absolute left-6 top-24 z-[999] p-2 bg-white rounded-full shadow-sm hover:scale-110 transition"
          onClick={() => navigate(-1)}>
          <ArrowLeft size={20} className="text-black" />
        </button>

  <h1 className="text-2xl font-bold mb-6">Riwayat Order</h1>


      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-5 border rounded-xl shadow cursor-pointer hover:shadow-md transition"
            onClick={() => navigate(`/order/${order.id}`)}
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg">
                Order #{order.id}
              </h2>
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

            <p className="text-gray-600 text-sm">
              Tanggal: {new Date(order.created_at).toLocaleDateString("id-ID")}
            </p>

            <p className="text-gray-800 font-semibold mt-3">
              Total: Rp {order.total_harga.toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
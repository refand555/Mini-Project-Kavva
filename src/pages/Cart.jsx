// src/pages/Cart.jsx
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";
import { Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
  

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
            product_image (
              image_url,
              order
            )
          ),
          variant:variant_id (
            id,
            size,
            price,
            stock,
            grades:grades_id ( name )
          )
        `)
        .eq("user_id", user.id);

      if (!error) setItems(data);
      setLoading(false);
    };

    fetchCart();
  }, [user]);

  const deleteItem = async (id) => {
    await supabase.from("cart").delete().eq("id", id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = async (cartId, newQty) => {
    await supabase.from("cart").update({ quantity: newQty }).eq("id", cartId);

    setItems((prev) =>
      prev.map((item) =>
        item.id === cartId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const totalHarga = items.reduce(
    (sum, item) => sum + Number(item.variant.price) * item.quantity,
    0
  );

  if (loading) return <div className="p-6 text-center">Memuat keranjang...</div>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
      <button
        onClick={() => {
          window.dispatchEvent(new Event("close-sidebar"));
          navigate(-1);
        }}
        className="p-2 rounded-full bg-white shadow-sm hover:scale-110 transition">
        <ArrowLeft size={20} className="text-black" />
      </button>
      <h1 className="text-3xl font-bold mb-6 tracking-wide">Keranjang Belanja</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center text-gray-600 p-10 border rounded-lg bg-white shadow-sm">
          Keranjangmu masih kosong.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => {
              const img =
                item.product.product_image?.length > 0
                  ? item.product.product_image[0].image_url
                  : null;

              const maxStock = item.variant.stock;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition"
                >
                  {/* Gambar */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center"
                  onClick={() => {
                  window.dispatchEvent(new Event("close-sidebar"));
                  navigate(`/product/${item.product.id}`);
                }}>
                    {img ? (
                      <img
                        src={img}
                        alt={item.product.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">No Image</span>
                    )}
                  </div>

                  {/* Detail */}
                  <div className="flex-1">
                    <h2 className="font-semibold text-[15px] leading-snug"
                    onClick={() => {
                    window.dispatchEvent(new Event("close-sidebar"));
                    navigate(`/product/${item.product.id}`);
                    }}>
                      {item.product.name}
                    </h2>

                    <p className="text-sm text-gray-700 mt-1">
                      Rp {Number(item.variant.price).toLocaleString("id-ID")}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      Size: {item.variant.size}
                    </p>

                    <p className="text-sm text-gray-600">
                      Grade: {item.variant.grades?.name}
                    </p>

                    {/* Quantity */}
                    <div className="flex items-center gap-3 mt-3">

                      {/* MINUS */}
                      <button
                        onClick={() =>
                          item.quantity > 1 &&
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-3 py-1 border rounded bg-white"
                      >
                        -
                      </button>

                      <span className="text-md font-semibold w-6 text-center">
                        {item.quantity}
                      </span>

                      {/* PLUS */}
                      <button
                        onClick={() =>
                          item.quantity < maxStock &&
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-3 py-1 border rounded bg-white"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-10 border-t pt-6 flex items-center justify-between">
            <div className="text-lg font-semibold tracking-wide">
              Total: Rp {totalHarga.toLocaleString("id-ID")}
            </div>

           <button
            className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
            onClick={() => navigate("/checkout")}>
              Checkout
            </button>
          </div>
        </>
      )}
    </main>
  );
}

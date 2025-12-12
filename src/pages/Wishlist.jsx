// src/pages/Wishlist.jsx
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";
import { Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { useNavigate} from "react-router-dom";

export default function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();


  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadWishlist() {
      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          id,
          product (
            id,
            name,
            product_image (
              image_url,
              order
            ),
            stock_variants (
              price
            )
          )
        `)
        .eq("user_id", user.id);

      if (!error) setItems(data);
      setLoading(false);
    }

    loadWishlist();
  }, [user]);

  const removeItem = async (id) => {
    await supabase.from("wishlist").delete().eq("id", id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (loading) {
    return (
      <div className="p-6 relative">
        <div>Memuat...</div>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      <div className="flex items-center gap-3 mb-6">

  {/* PANAH DI KIRI SEBELAH TULISAN */}
        <button
          onClick={() => {
            window.dispatchEvent(new Event("close-sidebar"));
            navigate(-1);
          }}
          className="p-2 rounded-full bg-white shadow-sm hover:scale-110 transition">
          <ArrowLeft size={20} className="text-black" />
        </button>
        <h1 className="text-2xl font-bold tracking-wide">Wishlist</h1>
      </div>


      {items.length === 0 ? (
        <div className="text-center text-gray-600 p-10 border rounded-lg bg-white shadow-sm">
          Wishlist masih kosong.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const images = item.product.product_image || [];

            const displayImage =
              images.find((img) => img.order === 1)?.image_url ||
              images[0]?.image_url ||
              "";

            const variantPrices =
              item.product.stock_variants?.map((v) => Number(v.price)) || [];
            const cheapestPrice =
              variantPrices.length > 0 ? Math.min(...variantPrices) : 0;

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition"
              >
                {/* GAMBAR */}
                <div className="w-[100px] h-[100px] flex items-center justify-center"
                onClick={() => {
                window.dispatchEvent(new Event("close-sidebar"));
                navigate(`/product/${item.product.id}`);
              }}>
                  <img
                    src={displayImage}
                    alt={item.product.name}
                    className="object-contain max-h-[100px]"
                  />
                </div>

                {/* DETAIL */}
                <div className="flex-1">
                  <h2 className="font-semibold text-[15px] leading-snug">
                    {item.product.name}
                  </h2>

                  <p className="text-sm text-gray-700 mt-1">
                    Rp {cheapestPrice.toLocaleString("id-ID")}
                  </p>
                </div>

                {/* BUTTONS */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => {
                    window.dispatchEvent(new Event("close-sidebar"));
                    navigate(`/product/${item.product.id}`);
                  }}
                    className="p-2 rounded-full bg-black text-white hover:bg-gray-800 transition">
                    <ShoppingCart size={18} />
                  </button>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
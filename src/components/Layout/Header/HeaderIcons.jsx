// src/components/Layout/Header/HeaderIcons.jsx
import { Heart, ShoppingCart, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../../../lib/supabaseClient";
import { useAuth } from "../../../context/authContext";

export default function HeaderIcons({ setSidebar }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchCart = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }

    const { data } = await supabase
      .from("cart")
      .select("quantity")
      .eq("user_id", user.id);

    if (data) {
      const total = data.reduce(
        (sum, item) => sum + Number(item.quantity),
        0
      );
      setCartCount(total);
    }
  };

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistCount(0);
      return;
    }

    const { data } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", user.id);

    if (data) {
      setWishlistCount(data.length);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [user]);

  useEffect(() => {
    const update = () => {
      fetchCart();
      fetchWishlist();
    };

    window.addEventListener("cart-updated", update);
    window.addEventListener("wishlist-updated", update);

    return () => {
      window.removeEventListener("cart-updated", update);
      window.removeEventListener("wishlist-updated", update);
    };
  }, [user]);

  return (
    <div className="flex items-center gap-4">

      {/* CART ICON */}
      <button
        className="relative"
        onClick={() => setSidebar("cart")}
      >
        <ShoppingCart strokeWidth={1.5} size={24} className="text-white" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 py-[1px] rounded-full font-semibold">
            {cartCount}
          </span>
        )}
      </button>

      {/* WISHLIST ICON */}
      <button
        className="relative"
        onClick={() => setSidebar("wishlist")}
      >
        <Heart strokeWidth={1.5} size={24} className="text-white" />
        {wishlistCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] px-1.5 py-[1px] rounded-full font-semibold">
            {wishlistCount}
          </span>
        )}
      </button>

      {/* USER ICON */}
      {user ? (
        <button onClick={() => navigate("/dashboard")}>
          <User size={24} className="text-white" />
        </button>
      ) : (
        <button onClick={() => navigate("/login")}>
          <span className="text-black text-sm font-medium">Login</span>
        </button>
      )}
    </div>
  );
}
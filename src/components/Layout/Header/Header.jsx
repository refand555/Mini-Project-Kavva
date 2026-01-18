// src/components/Layout/Header/Header.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/authContext";
import supabase from "../../../lib/supabaseClient";

import HeaderNav from "./HeaderNav";
import HeaderSearch from "./HeaderSearch";
import HeaderIcons from "./HeaderIcons";
import SearchPopup from "../../Search/SearchPopup";

import { useSearch } from "../../../context/SearchContext";
import { RightSidebar } from "../../SideBar/RightSidebar";

import Cart from "../../../pages/Cart";
import Wishlist from "../../../pages/Wishlist";

export default function Header({ isOnHero }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();

  const [sidebar, setSidebar] = useState(null);
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);

  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  const [searchResults, setSearchResults] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  // =====================
  // HANDLE TYPING
  // =====================
  const handleTyping = (value) => {
    setQuery(value);

    if (!value.trim()) {
      setSearchQuery("");
      setShowPopup(false);
      setSearchResults([]);
      return;
    }

    setSearchQuery(value);
  };

  // =====================
  // ENTER → SEARCH PAGE
  // =====================
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setSearchMode(false);
      setShowPopup(false);
      navigate(`/search?q=${query}`);
    }
  };

  // =====================
  // LIVE SEARCH 
  // =====================
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowPopup(false);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const { data: products } = await supabase
          .from("product")
          .select(`
            id,
            name,
            product_image (image_url, order),
            stock_variants (price, stock)
          `)
          .ilike("name", `%${searchQuery}%`);

        if (!products || products.length === 0) {
          setSearchResults([]);
          setShowPopup(false);
          return;
        }

        const merged = products
        .filter((p) => {
          // pastikan ada variant dengan stock > 0
          return p.stock_variants?.some(
            (v) => Number(v.stock) > 0
          );
        })
        .map((p) => {
          const img = p.product_image?.find((i) => i.order === 1);

          // ambil harga dari variant yang stock-nya masih ada
          const availableVariant = p.stock_variants.find(
            (v) => Number(v.stock) > 0
          );

          return {
            id: p.id,
            name: p.name,
            image_url: img?.image_url || null,
            price: availableVariant?.price || null,
          };
        });

      setSearchResults(merged.slice(0, 8));
      setShowPopup(merged.length > 0);
      } catch (err) {
        console.log("Live search error:", err);
      }
    }, 250);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  // =====================
  // SCROLL HIDE HEADER (TETAP)
  // =====================
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      const prev = lastScrollY.current;

      if (Math.abs(current - prev) < 8) return;

      setHidden(current > prev);
      lastScrollY.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* OVERLAY SEARCH */}
      {searchMode && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setSearchMode(false)}
        />
      )}

      <header
        className={`
          fixed top-0 left-0 w-full z-50
          transition-all duration-300
          ${hidden ? "-translate-y-full" : "translate-y-0"}
          bg-transparent
          ${isOnHero ? "text-white" : "text-black"}
        `}
      >
        <div className="flex items-center justify-between px-8 py-4 relative z-50">
          {/* LOGO */}
          <div
            className="font-bold text-xl cursor-pointer"
            onClick={() => {
              navigate("/");
              setQuery("");
              setSearchQuery("");
              setShowPopup(false);
              setSearchMode(false);
            }}
          >
            Kavva
          </div>

          {/* NAV */}
          {!searchMode && <HeaderNav isOnHero={isOnHero} />}

          <div className="flex items-center gap-4">
            <HeaderSearch
              query={query}
              setQuery={handleTyping}
              handleSearch={handleSearch}
              isOnHero={isOnHero}
              searchMode={searchMode}
              setSearchMode={setSearchMode}
            />

            {/* LIVE SEARCH POPUP */}
            {searchMode && showPopup && searchResults.length > 0 && (
              <SearchPopup
                results={searchResults}
                onSelect={(item) => {
                  setSearchMode(false);
                  setShowPopup(false);
                  navigate(`/product/${item.id}`);
                }}
                onClose={() => setShowPopup(false)}
              />
            )}

            {!searchMode && (
              <HeaderIcons
                user={user}
                setSidebar={setSidebar}
                isOnHero={isOnHero}
              />
            )}
          </div>
        </div>
      </header>

      <RightSidebar open={sidebar !== null} onClose={() => setSidebar(null)}>
        {sidebar === "cart" && <Cart onClose={() => setSidebar(null)} />}
        {sidebar === "wishlist" && (
        <Wishlist
          onClose={() => setSidebar(null)}
          isSidebar
        />
      )}
      </RightSidebar>
    </>
  );
}

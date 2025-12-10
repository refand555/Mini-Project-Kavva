// src/components/Header/Header.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../context/authContext";

import HeaderNav from "./HeaderNav";
import HeaderSearch from "./HeaderSearch";
import HeaderIcons from "./HeaderIcons";
import { useSearch } from "../../../context/SearchContext";
import { RightSidebar } from "../../SideBar/RightSidebar";

// IMPORT CART & WISHLIST
import Cart from "../../../pages/Cart";
import Wishlist from "../../../pages/Wishlist";

export default function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // STATE UNTUK SIDEBAR
  const [sidebar, setSidebar] = useState(null);

  const { setSearchQuery } = useSearch();
  const [query, setQuery] = useState("");

  const handleTyping = (value) => {
    setQuery(value);

    if (value.trim() === "") {
      setSearchQuery("");
      return;
    }

    setSearchQuery(value);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setSearchQuery(query);
    }
  };

  return (
    <>
<header className="w-full fixed top-0 z-50 bg-transparent backdrop-blur-[2px]">
        <div className="flex items-center justify-between px-8 py-4">

          <div
            className="font-bold text-xl cursor-pointer relative -top-1"
            onClick={() => {
              navigate("/");
              setQuery("");
              setSearchQuery(""); 
            }}
          >
            Kavva
          </div>

          <HeaderNav />

          <div className="flex items-center gap-4">
            <HeaderSearch
              query={query}
              setQuery={handleTyping}
              handleSearch={handleSearch}
            />

            {/* KIRIM setSidebar KE ICONS */}
            <HeaderIcons user={user} setSidebar={setSidebar} />
          </div>

        </div>
      </header>

      {/* === SIDEBAR RENDER === */}
      <RightSidebar open={sidebar !== null} onClose={() => setSidebar(null)}>
  {sidebar === "cart" && <Cart />}
  {sidebar === "wishlist" && <Wishlist />}
</RightSidebar>
    </>
  );
}
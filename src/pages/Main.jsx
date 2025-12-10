import "../App.css";
import ProductCarousel from "../components/Product/ProductCarousel";
import SectionTitle from "../components/Product/SectionTitle";
import Container from "../components/Layout/Container/Container";
import HeroCarousel from "../components/HeroCarousel";
// import HeroNike from "../components/HeroNike";

import { useEffect, useState } from "react";
import { useSearch } from "../context/SearchContext";
import { searchProducts } from "../services/ProductService";
import ProductCard from "../components/Product/ProductCard";

function Main() {
  const { searchQuery } = useSearch();
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function run() {
      if (!searchQuery || searchQuery.trim() === "") {
        setResults([]);
        return;
      }

      try {
        const res = await searchProducts(searchQuery);
        setResults(res);
      } catch (err) {
        console.log("Search error:", err);
      }
    }

    run();
  }, [searchQuery]);

  const isSearching = searchQuery.trim() !== "";

  return (
    <div className="bg-white min-h-screen w-full overflow-x-hidden flex flex-col">
      <main className="flex-1 w-full text-gray-800">
        <HeroCarousel />
        {/* <HeroNike/> */}
        <Container>

          {/* ============================= */}
          {/*       MODE HASIL SEARCH       */}
          {/* ============================= */}
          {isSearching ? (
            <>
              <h2 className="text-xl font-bold mb-6 text-center">
                Hasil pencarian: "{searchQuery}"
              </h2>

              {results.length === 0 && (
                <p className="text-center text-gray-500 mb-6">
                  Tidak ada produk ditemukan.
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {results.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* ============================= */}
              {/*       MODE LANDING NORMAL     */}
              {/* ============================= */}

              <h2 className="text-xl font-bold mb-4 text-center">Produk</h2>

              {/* Row Brand Nike */}
              <SectionTitle title="Nike" link="/category/nike" />
              <ProductCarousel brandSlug="nike" />

              {/* Row Brand New Balance */}
              <SectionTitle title="Puma" link="/category/puma" />
              <ProductCarousel brandSlug="puma" />

              {/* Row Brand New Balance */}
              <SectionTitle title="New Balance" link="/category/newbalance" />
              <ProductCarousel brandSlug="newbalance" />
            </>
          )}

        </Container>
      </main>
    </div>
  );
}

export default Main;
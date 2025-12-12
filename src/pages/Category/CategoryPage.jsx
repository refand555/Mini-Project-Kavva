import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import {
  getProductsByBrandSlug,
  getProductsByCategorySlug
} from "../../services/ProductService";

import ProductCard from "../../components/Product/ProductCard";

export default function CategoryPage() {
  const { main, sub } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    load();
  }, [main, sub]);

  async function load() {
    const brandSlugs = ["nike", "adidas", "puma", "reebok", "asics", "newbalance", "converse"];

    if (brandSlugs.includes(main)) {
      const data = await getProductsByBrandSlug(main);
      return setProducts(data);
    }

    const slug = sub ? sub : main;
    const data = await getProductsByCategorySlug(slug);
    setProducts(data);
  }

  return (
  <div className="p-6 pt-28">

    {/* HEADER KATEGORI */}
    <div className="flex items-center gap-3 mb-4">
      <button
        className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={20} className="text-black" />
      </button>

      <h1 className="text-xl font-bold capitalize">
        {main} {sub && "> " + sub}
      </h1>
    </div>

    {products.length === 0 && <p className="text-center">Belum ada produk yang di tambahkan.</p>}

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>

  </div>
);
}
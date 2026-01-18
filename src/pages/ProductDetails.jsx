import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import { useAuth } from "../context/authContext";
import { ShoppingCart, HeartPlus, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";


export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRefs = useRef([]);


  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [gradesGlobal, setGradesGlobal] = useState([]);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [sizeChart, setSizeChart] = useState(null);
  const [showChart, setShowChart] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(null);

  const [loading, setLoading] = useState(true);

  const fixedSizesBaju = ["S", "M", "L", "XL", "XXL"];
  const fixedSizesSepatu = Array.from({ length: 12 }, (_, i) =>
    (36 + i).toString()
  );

  const categoryName = categories[0]?.categories?.name?.toLowerCase() || "";
  const isApparel =
    categoryName.includes("apparel") ||
    categoryName.includes("baju") ||
    categoryName.includes("shirt");

  const sizeList = isApparel ? fixedSizesBaju : fixedSizesSepatu;

  // FETCH DATA
  useEffect(() => {
    async function fetchData() {
      const { data: prod } = await supabase
        .from("product")
        .select("*, brands(name)")
        .eq("id", id)
        .single();

      const { data: imgs } = await supabase
        .from("product_image")
        .select("*")
        .eq("product_id", id)
        .order("order", { ascending: true });

      const { data: vars } = await supabase
        .from("stock_variants")
        .select("*, grades(name)")
        .eq("product_id", id);

      const { data: cat } = await supabase
        .from("product_categories")
        .select("categories(name)")
        .eq("product_id", id);

      const { data: allGrades } = await supabase.from("grades").select("*");

      // SIZE CHART
      let fetchedChart = null;
      if (prod?.brand_id && cat?.[0]?.categories?.name) {
        const { data: chartRow } = await supabase
          .from("size_charts")
          .select("image_chart")
          .eq("brand_id", prod.brand_id)
          .eq("category_name", cat[0].categories.name)
          .maybeSingle();
        fetchedChart = chartRow || null;
      }

      setProduct(prod);
      setImages(imgs || []);
      setVariants(vars || []);
      setCategories(cat || []);
      setGradesGlobal(allGrades || []);
      setSizeChart(fetchedChart);
      setLoading(false);
    }
    fetchData();
  }, [id]);


  useEffect(() => {
  videoRefs.current.forEach((video, index) => {
    if (!video) return;

    if (index === activeIndex) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  });
}, [activeIndex]);


  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Produk tidak ditemukan</div>;

  const grades = gradesGlobal.map((g) => g.name);

  const isSizeAvailable = (size) =>
    variants.some(
      (v) =>
        v.size?.toString().toLowerCase() === size.toLowerCase() &&
        (!selectedGrade || v.grades?.name === selectedGrade) &&
        v.stock > 0
    );

  const isGradeAvailable = (grade) =>
    variants.some(
      (v) =>
        v.grades?.name === grade &&
        (!selectedSize || v.size === selectedSize) &&
        v.stock > 0
    );

  const finalVariant = variants.find(
    (v) => v.size === selectedSize && v.grades?.name === selectedGrade
  );

  // CART
  const addToCart = async () => {
    if (!user) return navigate("/login");
    if (!finalVariant) { toast.error("Pilih size dan grades");
  return;
}

 const toastId = toast.loading("Menambahkan ke keranjang...");

    const { data: exist } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .eq("variant_id", finalVariant.id)
      .maybeSingle();

    if (exist) {
      const newQty = Math.min(exist.quantity + quantity, finalVariant.stock);
      await supabase.from("cart").update({ quantity: newQty }).eq("id", exist.id);
      window.dispatchEvent(new Event("cart-updated"));
      toast.success("Keranjang diperbarui", { id: toastId });
      return;
    }

    await supabase.from("cart").insert([
      { user_id: user.id, product_id: product.id, variant_id: finalVariant.id, quantity }
    ]);

    window.dispatchEvent(new Event("cart-updated"));
    toast.success("Ditambahkan ke keranjang", { id: toastId });
  };

  // WISHLIST
  const toggleWishlist = async () => {
    if (!user) return navigate("/login");
    const toastId = toast.loading("Memperbarui wishlist...");


    const { data: exist } = await supabase
      .from("wishlist")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (exist) {
      await supabase.from("wishlist").delete().eq("id", exist.id);
      window.dispatchEvent(new Event("wishlist-updated"));
      toast.success("Dihapus dari wishlist", { id: toastId });
      return;
    }

    await supabase.from("wishlist").insert([
      { user_id: user.id, product_id: product.id }
    ]);

    window.dispatchEvent(new Event("wishlist-updated"));
    toast.success("Ditambahkan ke wishlist", { id: toastId });
  };

  return (
    <div className="w-full bg-white">

      {/* BACK BUTTON */}
      <div className="w-full max-w-5xl mx-auto">
            <button
          className="absolute left-6 top-24 z-[999] p-2 bg-white rounded-full shadow-sm hover:scale-110 transition"
          onClick={() => navigate(-1)}>
          <ArrowLeft size={20} className="text-black" />
        </button>
      </div>

      {/* GALLERY */}
      <section className="w-full border-b border-gray-200 pb-10 pt-24">
        <div
          ref={sliderRef}
          onScroll={() => {
            const c = sliderRef.current;
            const index = Math.round(c.scrollLeft / c.clientWidth);
            setActiveIndex(index);
          }}
          className="w-full max-w-4xl mx-auto overflow-x-auto snap-x snap-mandatory flex scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {images.map((item, index) => {
  const isVideo = item.image_url?.endsWith(".mp4");

  return (
    <div
      key={item.id}
      className="min-w-full flex justify-center snap-start px-6"
    >
      {isVideo ? (
        <video
          ref={(el) => (videoRefs.current[index] = el)}
          src={item.image_url}
          muted
          controls
          className="w-full max-h-[430px] rounded"
        />
      ) : (
        <img
          src={item.image_url}
          alt={product.name}
          className="object-contain w-full max-h-[430px]"
        />
      )}
    </div>
  );
})}

        </div>

        {/* DOTS */}
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() =>
                sliderRef.current.scrollTo({
                  left: sliderRef.current.clientWidth * i,
                  behavior: "smooth",
                })
              }
              className={`w-2.5 h-2.5 rounded-full ${
                activeIndex === i ? "bg-black" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </section>

      {/* CONTENT */}
      <section className="w-full max-w-5xl mx-auto px-10 py-12">

        {/* TITLE */}
        <div className="mb-10">
          <h1 className="text-[32px] font-semibold leading-tight">
            {product.name}
          </h1>

          <p className="text-gray-600 mt-2 text-[15px]">
            {product.brands?.name}
            {categories.length > 0 && (
              <span className="text-gray-500">
                {" • "}
                {categories.map((c) => c.categories.name).join(", ")}
              </span>
            )}
          </p>
        </div>

        {/* TWO COLUMN */}
        <div className="flex gap-20">

          {/* LEFT COLUMN */}
          <div className="w-1/2 space-y-8">

            {/* PRICE */}
            <div className="text-[24px] font-bold">
              {finalVariant
                ? `Rp ${finalVariant.price.toLocaleString("id-ID")}`
                : `Rp ${Math.min(...variants.map(v => v.price)).toLocaleString("id-ID")}`}
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-3">
              <h3 className="font-semibold text-[18px]">Deskripsi</h3>
              <p className="leading-[1.9] whitespace-pre-line max-w-[90%] text-[15px]">
                {product.description}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-1/2 space-y-10">

            {/* GRADES */}
            <div>
              <h3 className="text-[14px] font-semibold mb-2">GRADES</h3>
              <div className="flex gap-2 flex-wrap">
                {grades.map((grade) => {
                  const available = isGradeAvailable(grade);
                  return (
                    <button
                      key={grade}
                      disabled={!available}
                      onClick={() =>
                        available &&
                        setSelectedGrade(selectedGrade === grade ? null : grade)
                      }
                      className={`px-4 py-2 rounded-full border text-[13px]
                        ${
                          available
                            ? "hover:border-black"
                            : "bg-gray-300 cursor-not-allowed text-gray-500"
                        }
                        ${
                          selectedGrade === grade
                            ? "border-black font-semibold"
                            : "border-gray-300"
                        }
                      `}
                    >
                      {grade}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SIZE */}
            <div>
              <h3 className="text-[14px] font-semibold mb-2">SIZE</h3>
              <div className="flex gap-2 flex-wrap">
                {sizeList.map((size) => {
                  const available = isSizeAvailable(size);
                  return (
                    <button
                      key={size}
                      disabled={!available}
                      onClick={() =>
                        available &&
                        setSelectedSize(selectedSize === size ? null : size)
                      }
                      className={`px-4 py-2 rounded border text-[13px]
                        ${
                          available
                            ? "hover:border-black"
                            : "bg-gray-300 cursor-not-allowed text-gray-500"
                        }
                        ${
                          selectedSize === size
                            ? "border-black font-semibold"
                            : "border-gray-300"
                        }
                      `}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QUANTITY */}
            <div className="flex items-center gap-5">
              <div className="flex items-center border rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-1 border-r text-sm"
                >
                  -
                </button>

                <span className="px-4 py-1 text-sm font-semibold">{quantity}</span>

                <button
                  onClick={() =>
                    finalVariant &&
                    setQuantity((q) => Math.min(finalVariant.stock, q + 1))
                  }
                  className="px-4 py-1 border-l text-sm"
                >
                  +
                </button>
              </div>

              <p className="text-gray-600 text-sm">
                {finalVariant ? `${finalVariant.stock} stok` : "Pilih variant"}
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4">
              <button
                onClick={addToCart}
                disabled={!finalVariant}
                className={`px-6 py-3 rounded-full flex items-center gap-2 text-white ${
                  finalVariant
                    ? "bg-black"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              <button
                onClick={toggleWishlist}
                className="px-6 py-3 rounded-full border border-black"
              >
                <HeartPlus size={18} />
              </button>

              {sizeChart?.image_chart && (
                <button
                  onClick={() => setShowChart(true)}
                  className="px-6 py-3 rounded-full border border-gray-400 hover:border-black"
                >
                  Size Chart
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* SIZE CHART MODAL */}
      {showChart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]">
          <div className="bg-white p-4 rounded-lg max-w-md w-full relative">
            <button
              onClick={() => setShowChart(false)}
              className="absolute top-2 right-2 border px-2 rounded"
            >
              X
            </button>

            <h2 className="font-semibold mb-3 text-lg">Size Chart</h2>

            {sizeChart?.image_chart ? (
              <img
                src={sizeChart.image_chart}
                alt="Size Chart"
                className="w-full rounded"
              />
            ) : (
              <p className="text-gray-600">Size chart belum tersedia.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
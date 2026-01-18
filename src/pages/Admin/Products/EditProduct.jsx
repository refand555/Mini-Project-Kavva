import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../lib/supabaseClient";
import { getProductById, updateProduct } from "./Product.api";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nama: "",
    brand_id: "",
    category_ids: [],
    deskripsi: "",
    gambar1: null,
    gambar2: null,
    gambar3: null,
    gambar4: null,
    vidio: null, // tetap, tidak diganti
  });

  const [oldImg1, setOldImg1] = useState(null);
  const [oldImg2, setOldImg2] = useState(null);
  const [oldImg3, setOldImg3] = useState(null);
  const [oldImg4, setOldImg4] = useState(null);
  const [oldVideo, setOldVideo] = useState(null);


  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadBrands();
    loadCategories();
    fetchProductData();
  }, []);

  const loadBrands = async () => {
    const { data } = await supabase.from("brands").select("id, name");
    if (data) setBrands(data);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name");
    if (data) setCategories(data);
  };

  const fetchProductData = async () => {
    const data = await getProductById(id);

    setForm((prev) => ({
      ...prev,
      nama: data.name,
      brand_id: data.brand_id,
      category_ids: data.product_categories.map((c) => c.category_id),
      deskripsi: data.description,
    }));

    setOldImg1(data.product_image?.[0]?.image_url ?? null);
    setOldImg2(data.product_image?.[1]?.image_url ?? null);
    setOldImg3(data.product_image?.[2]?.image_url ?? null);
    setOldImg4(data.product_image?.[3]?.image_url ?? null);
    setOldVideo(data.product_image?.find((img) => img.image_url.endsWith(".mp4"))?.image_url ?? null);


    setLoading(false);
  };

  const handleChange = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  const toggleCategory = (catId) => {
    setForm((prev) => {
      const exists = prev.category_ids.includes(catId);
      return {
        ...prev,
        category_ids: exists
          ? prev.category_ids.filter((c) => c !== catId)
          : [...prev.category_ids, catId],
      };
    });
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    const cleanName = file.name.replace(/\s+/g, "-").toLowerCase();
    const filePath = `products/${Date.now()}-${cleanName}`;

    const { error } = await supabase.storage
      .from("product_image")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("product_image")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   const MAX_VIDEO_SIZE = 5 * 1024 * 1024; // 5MB
   const loadingToast = toast.loading("Menyimpan perubahan...");

    try {
      let newImg1 = null;
      let newImg2 = null;

      if (form.gambar1) newImg1 = await uploadImage(form.gambar1);
      if (form.gambar2) newImg2 = await uploadImage(form.gambar2);

      // UPDATE DATA UTAMA (TETAP)
      await updateProduct(
        id,
        form,
        newImg1,
        newImg2,
        form.brand_id,
        form.category_ids
      );

      // TAMBAHAN MEDIA BARU (gambar 3, 4, video)
      // =========================
// AMBIL ORDER TERAKHIR
// =========================
const { data: lastMedia } = await supabase
  .from("product_image")
  .select("order")
  .eq("product_id", id)
  .order("order", { ascending: false })
  .limit(1);

let startOrder = lastMedia?.[0]?.order ?? 0;

// =========================
// TAMBAH MEDIA BARU
// =========================
const extraFiles = [form.gambar3, form.gambar4, form.vidio];
const mediaRows = [];

for (const file of extraFiles) {
  if (!file) continue;

  // =========================
  // LIMIT SIZE VIDEO 5MB
  // =========================
  if (file.type.startsWith("video/")) {
    if (file.size > MAX_VIDEO_SIZE) {
      toast.error("Ukuran video maksimal 5MB");
      return; // hentikan submit
    }
  }

  const url = await uploadImage(file);
  startOrder += 1;

  mediaRows.push({
    product_id: id,
    image_url: url,
    order: startOrder,
  });
}


if (mediaRows.length > 0) {
  await supabase.from("product_image").insert(mediaRows);
}


      toast.success("Produk berhasil diperbarui", { id: loadingToast });
      navigate("/admin/products");
    } catch (err) {
      toast.error("Gagal update produk", { id: loadingToast });
      console.log("Gagal update produk:", err.message);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-10 w-full">
      <div className="mb-8 flex items-center gap-3">
        <button
          className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} className="text-black" />
        </button>
        <h1 className="text-3xl font-bold">Edit Produk</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 shadow p-10 rounded-xl w-full"
      >
        <div className="flex flex-col gap-8">
          <FormInput label="Nama Produk" name="nama" form={form} handle={handleChange} />

          <SelectBlock
            label="Brand"
            value={form.brand_id}
            onChange={(e) => handleChange("brand_id", e.target.value)}
            options={brands}
          />

          <div className="flex flex-col">
            <label className="text-gray-600 text-sm mb-1">Deskripsi</label>
            <textarea
              rows={6}
              value={form.deskripsi}
              onChange={(e) => handleChange("deskripsi", e.target.value)}
              className="w-full bg-gray-200 border border-gray-300 rounded-lg p-4"
            />
          </div>

          <div>
            <label className="text-gray-600 text-sm mb-2 block">Kategori</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.category_ids.includes(c.id)}
                    onChange={() => toggleCategory(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          {/* GAMBAR 1 */}
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm mb-1">
              Gambar 1 (kosongkan jika tidak diganti)
            </label>
            {oldImg1 && <img src={oldImg1} className="w-24 h-24 object-cover rounded mb-3" />}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleChange("gambar1", e.target.files[0])}
              className="w-full bg-gray-200 border border-gray-300 rounded-lg p-3"
            />
          </div>

          {/* GAMBAR 2 */}
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm mb-1">
              Gambar 2 (kosongkan jika tidak diganti)
            </label>
            {oldImg2 && <img src={oldImg2} className="w-24 h-24 object-cover rounded mb-3" />}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleChange("gambar2", e.target.files[0])}
              className="w-full bg-gray-200 border border-gray-300 rounded-lg p-3"
            />
          </div>

          {/* GAMBAR 3 */}
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm mb-1">
              Gambar 3 (opsional)
            </label>

            {oldImg3 && (
              <img
                src={oldImg3}
                className="w-24 h-24 object-cover rounded mb-3"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleChange("gambar3", e.target.files[0])}
              className="w-full bg-gray-200 border border-gray-300 rounded-lg p-3"
            />
          </div>

          {/* GAMBAR 4 */}
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm mb-1">
              Gambar 4 (opsional)
            </label>

            {oldImg4 && (
              <img
                src={oldImg4}
                className="w-24 h-24 object-cover rounded mb-3"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleChange("gambar4", e.target.files[0])}
              className="w-full bg-gray-200 border border-gray-300 rounded-lg p-3"
            />
          </div>


          {/* VIDEO */}
          <div className="flex flex-col">
            {/* VIDEO THUMBNAIL (TIDAK AUTOPLAY) */}
            {oldVideo && (
              <div className="flex flex-col">
                <label className="text-gray-600 text-sm mb-1">
                  Video Review (thumbnail)
                </label>

                <div className="relative w-32 h-32 rounded overflow-hidden bg-black mb-2">
                  <video
                    src={oldVideo}
                    preload="metadata"
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* overlay penanda video */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="text-white text-xs font-semibold">
                      VIDEO
                    </span>
                  </div>
                </div>
              </div>
            )}

            <label className="text-gray-600 text-sm mb-1">Video Review (opsional)</label>
            <input
              type="file"
              accept="video/mp4"
              onChange={(e) => handleChange("vidio", e.target.files[0])}
              className="w-full bg-gray-200 border border-gray-300 rounded-lg p-3"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-10 bg-black text-white w-full py-3 rounded-xl font-semibold hover:bg-black/80 transition"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}

function FormInput({ label, name, type = "text", form, handle }) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-600 text-sm mb-1">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => handle(name, e.target.value)}
        className="w-full bg-gray-200 border border-gray-300 rounded-lg p-3"
      />
    </div>
  );
}

function SelectBlock({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-600 text-sm mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-gray-200 border border-gray-300 rounded-lg p-3"
      >
        <option value="">Pilih {label}</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}
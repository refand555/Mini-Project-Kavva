// src/pages/admin/products/AddProduct.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../lib/supabaseClient";
import { insertProduct } from "./Product.api";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama: "",
    brand_id: "",
    category_ids: [],
    grades_id: "",
    deskripsi: "",
    size: "",
    stock: "",
    harga: "",
    gambar1: null,
    gambar2: null,
  });

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [grades, setGrades] = useState([]);
  const hiddenCategories = ["apparel", "performance", "accessories"];
  const exclusiveCategories = ["shirts", "pants", "shoes"];
  const visibleCategories = categories.filter(
    (c) => !hiddenCategories.includes(c.name.toLowerCase())
  );


  useEffect(() => {
    loadBrands();
    loadCategories();
    loadGrades();
  }, []);

  const loadBrands = async () => {
    const { data } = await supabase.from("brands").select("id, name");
    if (data) setBrands(data);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name");
    if (data) setCategories(data);
  };

  const loadGrades = async () => {
    const { data } = await supabase.from("grades").select("id, name");
    if (data) setGrades(data);
  };

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCategory = (category) => {
    setForm((prev) => {
      const isExclusive = exclusiveCategories.includes(
        category.name.toLowerCase()
      );

      // kalau category termasuk exclusive (shirts / pants / shoes)
      if (isExclusive) {
        // hapus semua category exclusive lain
        const filtered = prev.category_ids.filter((id) => {
          const cat = categories.find((c) => c.id === id);
          return (
            cat &&
            !exclusiveCategories.includes(cat.name.toLowerCase())
          );
        });

        return {
          ...prev,
          category_ids: [...filtered, category.id],
        };
      }

      // category biasa (boleh multi)
      return {
        ...prev,
        category_ids: prev.category_ids.includes(category.id)
          ? prev.category_ids.filter((c) => c !== category.id)
          : [...prev.category_ids, category.id],
      };
    });
  };

  const uploadImage = async (file) => {
    if (!file) throw new Error("File tidak ditemukan.");

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

  // =========================
  // VALIDASI FIELD WAJIB
  // =========================
  if (
    !form.nama ||
    !form.brand_id ||
    !form.grades_id ||
    !form.size ||
    !form.stock ||
    !form.harga
  ) {
    toast.error(
      "Lengkapi semua field wajib (Nama, Brand, Grade, Size, Stock, Harga)"
    );
    return;
  }

  // =========================
  // VALIDASI ANGKA
  // =========================
  const stock = Number(form.stock);
  const harga = Number(form.harga);

  if (isNaN(stock) || stock <= 0) {
    toast.error("Stock harus lebih dari 0");
    return;
  }

  if (isNaN(harga) || harga < 0) {
    toast.error("Harga tidak boleh bernilai minus");
    return;
  }

  if (!form.size.trim()) {
    toast.error("Size wajib diisi");
    return;
  }

  // =========================
  // VALIDASI GAMBAR (WAJIB)
  // =========================
  if (!form.gambar1) {
    toast.error("Gambar produk wajib diupload");
    return;
  }

  const toastId = toast.loading("Menyimpan produk...");

  try {
    const img1 = await uploadImage(form.gambar1);
    const img2 = form.gambar2 ? await uploadImage(form.gambar2) : null;

    await insertProduct(form, img1, img2, form.brand_id, form.category_ids);

    toast.success("Produk berhasil ditambahkan", { id: toastId });
    navigate("/admin/products");
  } catch (err) {
    toast.error(err.message || "Gagal menambah produk", { id: toastId });
    console.error("Gagal menambah produk:", err);
  }
};

  return (
    <div className="p-10 w-full">
      {/* HEADER */}
      <div className="mb-8 flex items-center gap-3">
        <button
          className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} className="text-black" />
        </button>

        <h1 className="text-3xl font-bold">Tambah Produk</h1>
      </div>

      {/* CARD FULL WIDTH */}
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

          <SelectBlock
            label="Grade Produk"
            value={form.grades_id}
            onChange={(e) => handleChange("grades_id", e.target.value)}
            options={grades}
          />

          <FormInput label="Size" name="size" form={form} handle={handleChange} />

          <FormInput
            label="Stock"
            name="stock"
            type="number"
            form={form}
            handle={handleChange}
          />

          <FormInput label="Harga" name="harga" form={form} handle={handleChange} />

          <FormInput label="Gambar 1" name="gambar1" file form={form} handle={handleChange} />

          <FormInput label="Gambar 2" name="gambar2" file form={form} handle={handleChange} />

          {/* DESKRIPSI */}
          <div>
            <label className="text-gray-600 text-sm mb-1 block">Deskripsi</label>
            <textarea
              className="w-full bg-gray-200 border border-gray-300 rounded-lg p-4 text-gray-900"
              rows={6}
              value={form.deskripsi}
              onChange={(e) => handleChange("deskripsi", e.target.value)}
            ></textarea>
          </div>

          {/* CATEGORY MULTI SELECT */}
          <div>
            <label className="text-gray-600 text-sm mb-2 block">
              Kategori (boleh lebih dari 1)
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {visibleCategories.map((c) => (
              <label key={c.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.category_ids.includes(c.id)}
                  onChange={() => toggleCategory(c)}
                />
                {c.name}
              </label>
            ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-10 bg-black text-white w-full py-3 rounded-xl font-semibold hover:bg-black/80 transition"
        >
          Simpan Produk
        </button>
      </form>
    </div>
  );
}

function FormInput({ label, name, type = "text", form, handle, file = false }) {
  return (
    <div className="flex flex-col w-full">
      <label className="text-gray-600 text-sm mb-1">{label}</label>

      {file ? (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handle(name, e.target.files[0])}
          className="w-full bg-gray-200 border border-gray-300 rounded-lg p-3"
        />
      ) : (
        <input
          type={type}
          value={form[name]}
          onChange={(e) => handle(name, e.target.value)}
          className="w-full bg-gray-200 border border-gray-300 rounded-lg p-3 text-gray-900"
        />
      )}
    </div>
  );
}

function SelectBlock({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col w-full">
      <label className="text-gray-600 text-sm mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-gray-200 border border-gray-300 rounded-lg p-3 text-gray-900"
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
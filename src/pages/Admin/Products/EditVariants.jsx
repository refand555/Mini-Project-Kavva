import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getVariants,
  getAllGrades,
  addVariant,
  updateVariantField,
  deleteVariant,
} from "./Product.api";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function EditVariant() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState([]);
  const [grades, setGrades] = useState([]);

  const [form, setForm] = useState({
    size: "",
    grades_id: "",
    price: "",
    stock: ""
  });

  useEffect(() => {
    async function load() {
      const gradesData = await getAllGrades();
      const variantsData = await getVariants(id);

      setGrades(gradesData);
      setVariants(variantsData);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleChange = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleAddVariant = async () => {
  if (!form.size || !form.grades_id || !form.price || !form.stock) {
    toast.error("Lengkapi semua field varian");
    return;
  }

  const price = Number(form.price);
  const stock = Number(form.stock);

  if (isNaN(price) || price < 0) {
    toast.error("Harga varian tidak boleh bernilai minus");
    return;
  }

  if (isNaN(stock) || stock <= 0) {
    toast.error("Stok varian harus lebih dari 0");
    return;
  }

  const loadingToast = toast.loading("Menambah varian...");

  try {
    await addVariant(id, {
      ...form,
      price,
      stock,
    });

    const updated = await getVariants(id);
    setVariants(updated);

    setForm({ size: "", grades_id: "", price: "", stock: "" });
    toast.success("Varian berhasil ditambahkan", { id: loadingToast });
  } catch (err) {
    toast.error("Gagal menambah varian", { id: loadingToast });
  }
};


 const handleUpdate = async (variantId, field, value) => {
  // VALIDASI ANGKA
  if (field === "price") {
    const price = Number(value);
    if (isNaN(price) || price < 0) {
      toast.error("Harga tidak boleh bernilai minus");
      return;
    }
  }

  if (field === "stock") {
    const stock = Number(value);
    if (isNaN(stock) || stock <= 0) {
      toast.error("Stok harus lebih dari 0");
      return;
    }
  }

  if (field === "size" && !value.trim()) {
    toast.error("Size tidak boleh kosong");
    return;
  }

  const loadingToast = toast.loading("Menyimpan perubahan...");

  await updateVariantField(variantId, field, value);
  const updated = await getVariants(id);
  setVariants(updated);

  toast.success("Varian diperbarui", { id: loadingToast });
};

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-10 w-full">
      <div className="flex items-center gap-3 mb-8">
        <button
          className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} className="text-black" />
        </button>
        <h1 className="text-3xl font-bold">Edit Varian Produk</h1>
      </div>

      <div className="bg-white border border-gray-200 shadow rounded-xl p-6 mb-12">
        <table className="w-full border rounded-xl overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 border">Size</th>
              <th className="p-3 border">Grade</th>
              <th className="p-3 border">Harga</th>
              <th className="p-3 border">Stok</th>
              <th className="p-3 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id} className="even:bg-gray-50">
                <td className="border p-2">
                  <input
                    type="text"
                    defaultValue={v.size}
                    onBlur={(e) =>
                      handleUpdate(v.id, "size", e.target.value)
                    }
                    className="w-full bg-gray-200 border border-gray-300 rounded-lg p-2"
                  />
                </td>
                <td className="border p-2">{v.grades?.name}</td>
                <td className="border p-2">
                  <input
                    type="number"
                    defaultValue={v.price}
                    onBlur={(e) =>
                      handleUpdate(v.id, "price", Number(e.target.value))
                    }
                    className="w-full bg-gray-200 border border-gray-300 rounded-lg p-2"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    defaultValue={v.stock}
                    onBlur={(e) =>
                      handleUpdate(v.id, "stock", Number(e.target.value))
                    }
                    className="w-full bg-gray-200 border border-gray-300 rounded-lg p-2"
                  />
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="text-red-600 font-semibold hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-gray-200 shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">Tambah Varian Baru</h2>

        <div className="flex flex-col gap-6 mb-8">
          <input
            placeholder="Size"
            value={form.size}
            onChange={(e) => handleChange("size", e.target.value)}
            className="bg-gray-200 border border-gray-300 rounded-lg p-3"
          />

          <select
            value={form.grades_id}
            onChange={(e) => handleChange("grades_id", e.target.value)}
            className="bg-gray-200 border border-gray-300 rounded-lg p-3"
          >
            <option value="">Pilih Grade</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Harga"
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className="bg-gray-200 border border-gray-300 rounded-lg p-3"
          />

          <input
            type="number"
            placeholder="Stok"
            value={form.stock}
            onChange={(e) => handleChange("stock", e.target.value)}
            className="bg-gray-200 border border-gray-300 rounded-lg p-3"
          />
        </div>

        <button
          onClick={handleAddVariant}
          className="bg-black text-white w-full py-3 rounded-xl font-semibold hover:bg-black/80 transition"
        >
          Tambah Varian
        </button>
      </div>
    </div>
  );
}
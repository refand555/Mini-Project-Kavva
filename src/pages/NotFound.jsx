import { Home, Search } from "lucide-react";
import NFImg from "../assets/notfound.png"

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      {/* wrapper biar konten tetap di tengah tapi sejajar */}
      <div className="flex flex-col md:flex-row items-center justify-center md:gap-24 gap-10 max-w-6xl mx-auto">
        
        {/* Kiri: teks, deskripsi, tombol */}
        <section className="flex-1 text-center md:text-left space-y-6">
          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-gray-500 max-w-md mx-auto md:mx-0">
           "Tautan ini telah usang dan penuh debu, sama seperti setelan di samping. Ini adalah tanda! Saatnya memperbarui keranjang belanja Anda dengan sesuatu yang 100% on-trend."
          </p>

          {/* Tombol kembali */}
          <a
            href="/"
            className="inline-flex items-center gap-2 mt-4 rounded-2xl bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:opacity-90 active:scale-[.98] transition"
          >
            <Home size={18} strokeWidth={1.5} />
            Kembali ke Beranda
          </a>
        </section>

        {/* Kanan: gambar */}
        <section className="flex-1 flex justify-center">
          <img
            src={NFImg}
            alt="Ilustrasi Halaman Tidak Ditemukan"
            className="w-[500px] md:w-[600px] max-w-full"
          />
        </section>
      </div>
    </main>
  );
}
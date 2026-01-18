import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-black py-10 mt-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo & Description */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-3 cursor-pointer">
            Kavva
          </h2>
          <p className="text-sm text-white">
            Temukan produk terbaik dengan harga terjangkau hanya di Kavva.
            Belanja aman, cepat, dan terpercaya!
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Sitemap</h3>
          <ul className="space-y-1.5 text-sm">
            <li>
              <a href="/category/apparel/shirts" className="text-white hover:text-white">Shirt</a>
            </li>
            <li>
              <a href="/category/apparel/pants" className="text-white hover:text-white">Pants</a>
            </li>
            <li>
              <a href="//category/apparel/shoes" className="text-white hover:text-white">Shoes</a>
            </li>
            <li>
              <a 
                href="https://wa.me/6285855974524"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white"
              >
                Contact
              </a>
            </li>

          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Navigasi</h3>
          <ul className="space-y-1.5 text-sm">
            <li>
              <a href="/" className="text-white hover:text-white">Home</a>
            </li>
            <li>
              <a href="/shop" className="text-white hover:text-white">Shop</a>
            </li>
            <li>
              <a href="/about" className="text-white hover:text-white">About</a>
            </li>
            <li>
              <a 
                href="https://wa.me/6285855974524"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white"
              >
                Contact
              </a>
            </li>

          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Bantuan</h3>
          <ul className="space-y-1.5 text-sm">
            <li>
              <a href="/faq" className="text-white hover:text-white">FAQ</a>
            </li>
            <li>
              <a href="/returns" className="text-white hover:text-white">Pengembalian</a>
            </li>
            <li>
              <a href="/shipping" className="text-white hover:text-white">Pengiriman</a>
            </li>
            <li>
              <a href="/privacy" className="text-white hover:text-white">Kebijakan Privasi</a>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="flex flex-col items-start">
          <h3 className="text-lg font-semibold text-white mb-3">Ikuti Kami</h3>
          <div className="flex space-x-4 mt-1">
            <a href="https://facebook.com" target="_blank" className="hover:text-white">
              <Facebook />
            </a>
            <a href="https://instagram.com" target="_blank" className="hover:text-white">
              <Instagram />
            </a>
            <a href="https://twitter.com" target="_blank" className="hover:text-white">
            <Twitter />            
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Kavva. All right reserved
      </div>
    </footer>
  );
};

export default Footer;
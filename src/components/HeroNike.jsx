import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Nike from "../assets/nike.png";
import { useNavigate } from "react-router-dom";

export default function HeroNike() {
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tl = gsap.timeline({ ease: "power3.out" });

    // Title animasi
    tl.fromTo(
      titleRef.current,
      { opacity: 0, x: 120 },
      { opacity: 1, x: 0, duration: 1.4 }
    );

    // Subheadline animasi mengikuti title
    tl.fromTo(
      subRef.current,
      { opacity: 0, x: 120 },
      { opacity: 1, x: 0, duration: 1.2 },
      "-=1.0"
    );

    // Button animasi paling akhir
    tl.fromTo(
      buttonRef.current,
      { opacity: 0, x: 120 },
      { opacity: 1, x: 0, duration: 1.2 },
      "-=0.7"
    );
  }, []);

  return (
    <section className="relative w-full aspect-video flex items-center justify-center overflow-hidden bg-black">

      {/* Background Image */}
      <img
        src={Nike}
        alt="Hero"
        className="absolute inset-0 w-full h-full object-contain"
        style={{ objectPosition: "center" }}
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent"></div>

      {/* CONTENT (TOP-CENTER) */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 text-center px-6">

        {/* TITLE (2 BARIS SAJA) */}
        <h1
          ref={titleRef}
          className="text-white text-5xl md:text-8xl font-extrabold tracking-tight 
          drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] leading-tight"
        >
          Buckets Feel Better<br/>in These.
        </h1>

        {/* SUBHEADLINE (1 BARIS FIXED) */}
        <p
          ref={subRef}
          className="mt-4 text-white/80 text-lg md:text-2xl max-w-2xl mx-auto drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)] whitespace-nowrap"
        >
          Built for fast breaks, fearless drives, and moments worth replaying.
        </p>

        {/* BUTTON */}
        <button
          ref={buttonRef}
          onClick={() => navigate("/category/shoes/basket")} // nav ke kategori shoes,sub kategori basket
          className="mt-6 px-6 py-2 border border-white text-white 
          rounded-md transition-colors duration-300 hover:bg-white hover:text-black"
        >
         Own the Moment
        </button>

      </div>

    </section>
  );
}

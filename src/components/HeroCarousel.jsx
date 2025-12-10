import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

// Import slide hero kamu
import HeroPuma from "./HeroPuma";
// nanti bisa tambah slide lain:
import HeroNike from "./HeroNike";

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const slides = [
    <HeroPuma />,
    <HeroNike />,
  ];

  const containerRef = useRef(null);

  // Animasi fade antar slide
  useEffect(() => {
    if (!containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.2, ease: "power2.out" }
    );
  }, [index]);

  // Auto-slide (opsional, bisa kamu matikan)
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 7000); // ganti slide tiap 7 detik

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full aspect-video overflow-hidden">

      {/* Tempat munculnya slide */}
      <div ref={containerRef} className="w-full h-full">
        {slides[index]}
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full cursor-pointer transition 
              ${index === i ? "bg-white" : "bg-white/40"}`}
          />
        ))}
      </div>
    </section>
  );
}

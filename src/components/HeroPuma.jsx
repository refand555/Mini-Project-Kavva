import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Puma from "../assets/puma.png";
import { useNavigate } from "react-router-dom";

export default function HeroPuma() {
  const titleRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
  const tl = gsap.timeline({ ease: "power3.out" });

  tl.fromTo(
    titleRef.current,
    { opacity: 0, x: 120 },
    { opacity: 1, x: 0, duration: 1.4 }
  );

  tl.fromTo(
    buttonRef.current,
    { opacity: 0, x: 80 },
    { opacity: 1, x: 0, duration: 1.2 },
    "-=0.8" // tampil belakangan, tapi tetap satu timeline
  );
}, []);

  return (
    <section className="relative w-full aspect-video flex items-center justify-center overflow-hidden bg-black">

      {/* Background Image */}
      <img
        src={Puma}
        alt="Hero"
        className="absolute inset-0 w-full h-full object-contain"
        style={{ objectPosition: "center" }}
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent"></div>

      {/* Title */}
      <div className="absolute top-12 left-12">
        <h1
          ref={titleRef}
          className="text-white text-4xl md:text-8xl font-extrabold tracking-tight 
          drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] leading-tight text-left"
        >
          The Drop<br/>You've Been<br/>Waiting For
        </h1>

        {/* Button */}
        <button
          ref={buttonRef}
          onClick={() => navigate("/product/54")}     // ← arahkan ke produk Puma Speed Cat Red
          className="mt-6 px-6 py-1.5 border border-white text-white 
          rounded-lg transition-colors duration-300 hover:bg-white hover:text-black"
        >
          Shop Now
        </button>
      </div>

    </section>
  );
}

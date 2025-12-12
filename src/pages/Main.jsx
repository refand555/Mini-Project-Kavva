// src/pages/Main.jsx
import "../App.css";
import ProductCarousel from "../components/Product/ProductCarousel";
import SectionTitle from "../components/Product/SectionTitle";
import Container from "../components/Layout/Container/Container";
import HeroCarousel from "../components/HeroCarousel";
// import Header from "../components/Layout/Header/Header";
import { useHero } from "../context/HeroContext";

import { useEffect, useRef } from "react";

function Main() {
  const heroRef = useRef(null);
  const { setIsOnHero } = useHero();

  useEffect(() => {
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOnHero(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white min-h-screen w-full overflow-x-hidden flex flex-col">

      <main className="flex-1 w-full text-gray-800">

        <HeroCarousel ref={heroRef} />

        <Container>

        <SectionTitle
          title="Nike"
          link="/category/nike"
          isFirst
        />
        <ProductCarousel brandSlug="nike" />

        <SectionTitle
          title="Puma"
          link="/category/puma"
        />
        <ProductCarousel brandSlug="puma" />

        <SectionTitle
          title="New Balance"
          link="/category/newbalance"
        />
        <ProductCarousel brandSlug="newbalance" />

      </Container>

      </main>
    </div>
  );
}

export default Main;

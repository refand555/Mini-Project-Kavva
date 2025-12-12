import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function SectionTitle({
  title,
  link,
  isFirst = false
}) {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`
        w-full flex items-center justify-between px-10 mb-6
        ${isFirst ? "mt-20" : "mt-14"}
        transition-all duration-700 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      <h2 className="text-[22px] font-bold">
        {title}
      </h2>

      <button
        onClick={() => navigate(link)}
        className="text-sm font-semibold"
      >
        VIEW ALL
      </button>
    </div>
  );
}
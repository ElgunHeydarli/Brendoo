// pages/Products/components/PriceRange.tsx

import { memo, useCallback, useState, useEffect } from "react";
import type { TranslationsKeys } from "../../../setting/Types";

interface PriceRangeProps {
  t: TranslationsKeys | undefined;
  minPrice: number;
  maxPrice: number;
  setMinPrice: (v: number) => void;
  setMaxPrice: (v: number) => void;
}

const PriceRange = memo(function PriceRange({
  t,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
}: PriceRangeProps) {
  // ✅ Lokal state - input dəyərləri üçün
  const [localMin, setLocalMin] = useState<string>(minPrice > 0 ? String(minPrice) : "");
  const [localMax, setLocalMax] = useState<string>(maxPrice > 0 ? String(maxPrice) : "");

  // ✅ Parent state dəyişəndə lokal state-i yenilə
  useEffect(() => {
    setLocalMin(minPrice > 0 ? String(minPrice) : "");
  }, [minPrice]);

  useEffect(() => {
    setLocalMax(maxPrice > 0 ? String(maxPrice) : "");
  }, [maxPrice]);

  // ✅ Debounce ilə parent state-i yenilə (800ms gözlə)
  useEffect(() => {
    const timer = setTimeout(() => {
      const n = Number(localMin);
      if (!Number.isNaN(n) && n >= 0) {
        if (maxPrice > 0 && n > maxPrice) {
          setMinPrice(maxPrice);
        } else {
          setMinPrice(n);
        }
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [localMin, maxPrice, setMinPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const n = Number(localMax);
      if (!Number.isNaN(n) && n >= 0) {
        if (n > 0 && minPrice > 0 && n < minPrice) {
          setMaxPrice(minPrice);
        } else {
          setMaxPrice(n);
        }
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [localMax, minPrice, setMaxPrice]);

  // ✅ Input dəyişiklikləri - yalnız lokal state
  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMin(e.target.value);
  }, []);

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMax(e.target.value);
  }, []);

  // ✅ Təmizlə
  const clear = useCallback(() => {
    setLocalMin("");
    setLocalMax("");
    setMinPrice(0);
    setMaxPrice(0);
  }, [setMinPrice, setMaxPrice]);

  return (
    <div className="flex flex-col w-full text-sm">
      <label className="text-black">{t?.Qiymət || "Qiymət"}</label>
      <div className="flex overflow-hidden gap-2 p-1.5 mt-2 w-full bg-neutral-100 rounded-[100px] text-black text-opacity-60">
        <input
          inputMode="numeric"
          onChange={handleMinChange}
          value={localMin}
          type="number"
          placeholder={t?.min_placeholder || "min"}
          className="overflow-hidden p-3 bg-white rounded-[100px] outline-none w-full"
        />
        <input
          inputMode="numeric"
          onChange={handleMaxChange}
          value={localMax}
          type="number"
          placeholder={t?.max_placeholder || "max"}
          className="overflow-hidden p-3 bg-white rounded-[100px] outline-none w-full"
        />
      </div>

      {(localMin !== "" || localMax !== "") && (
        <button
          type="button"
          onClick={clear}
          className="self-start mt-2 text-xs underline text-gray-500 hover:text-gray-700 transition-colors"
        >
          {t?.təmizlə || "Təmizlə"}
        </button>
      )}
    </div>
  );
});

export default PriceRange;
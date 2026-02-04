// pages/Products/components/Pagination.tsx

import { memo, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { TranslationsKeys } from "../../../setting/Types";

// Multi-language pagination labels
const paginationLabels: Record<string, { previous: string; next: string }> = {
  az: { previous: "Əvvəlki", next: "Növbəti" },
  en: { previous: "Previous", next: "Next" },
};

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  translation: TranslationsKeys | undefined;
}

const Pagination = memo(({
  currentPage,
  lastPage,
  onPageChange,
  translation,
}: PaginationProps) => {
  const { lang = "az" } = useParams<{ lang: string }>();
  const labels = paginationLabels[lang] || paginationLabels.az;

  if (lastPage <= 1) return null;

  const getPageNumbers = useCallback(() => {
    const delta = 2;
    const pages: (number | string)[] = [1];

    if (currentPage > delta + 2) {
      pages.push("...");
    }

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(lastPage - 1, currentPage + delta);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < lastPage - delta - 1) {
      pages.push("...");
    }

    if (lastPage > 1) {
      pages.push(lastPage);
    }

    return pages;
  }, [currentPage, lastPage]);

  const pageNumbers = useMemo(() => getPageNumbers(), [getPageNumbers]);

  return (
    <div className="flex justify-center items-center gap-2 my-8 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg border transition-colors ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-black hover:bg-gray-50 border-gray-300"
        }`}
      >
        {translation?.previous || labels.previous}
      </button>

      {pageNumbers.map((pageNum, index) =>
        typeof pageNum === "number" ? (
          <button
            key={index}
            onClick={() => onPageChange(pageNum)}
            className={`px-4 py-2 rounded-lg min-w-[40px] transition-colors ${
              currentPage === pageNum
                ? "bg-[#3873C3] text-white font-semibold"
                : "bg-white text-black hover:bg-gray-50 border border-gray-300"
            }`}
          >
            {pageNum}
          </button>
        ) : (
          <span key={index} className="px-2 text-gray-400">
            {pageNum}
          </span>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className={`px-4 py-2 rounded-lg border transition-colors ${
          currentPage === lastPage
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-black hover:bg-gray-50 border-gray-300"
        }`}
      >
        {translation?.next || labels.next}
      </button>
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;

'use client';

import React from 'react';

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Filter } from 'lucide-react'; // Assuming you're using lucide-react for icons

// Multi-language labels
const filterLabels: Record<string, { filter: string; apply: string }> = {
  az: { filter: "Filtr", apply: "Tətbiq et" },
  ru: { filter: "Фильтр", apply: "Применить" },
  en: { filter: "Filter", apply: "Apply" },
  tr: { filter: "Filtre", apply: "Uygula" },
};

interface MobileFilterProps {
  children: React.ReactNode;
  translation?: any;
  selectedItems?: {
    category?: string | null;
    subCategory?: string | null;
    thirdCategory?: string | null;
    options?: number[];
  };
  onClose?: () => void;
}

export default function MobileFilter({ children, translation, onClose }: MobileFilterProps) {
  const { lang = "az" } = useParams<{ lang: string }>();
  const labels = filterLabels[lang] || filterLabels.az;
  const [isOpen, setIsOpen] = useState(false);

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const closeFilter = () => {
    setIsOpen(false);
    window.scroll({ top: 0, left: 0, behavior: 'smooth' });
    if (onClose) onClose();
  };

  // const getActiveFilterCount = () => {
  //   let count = 0;
  //   if (selectedItems?.category) count++;
  //   if (selectedItems?.subCategory) count++;
  //   if (selectedItems?.thirdCategory) count++;
  //   if (selectedItems?.options?.length) count += selectedItems.options.length;
  //   return count;
  // };

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      return React.cloneElement(child, { closeFilter } as any);
    }
    return child;
  });

  return (
    <>
      <button
        onClick={toggleFilter}
        className="md:hidden fixed bottom-4 left-4 z-50 flex items-center justify-center gap-2 bg-[#3873C3] text-white py-2 px-4 rounded-full shadow-lg"
      >
        <Filter size={18} />
        <span>{translation?.Filter || labels.filter}</span>
        {/* {getActiveFilterCount() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {getActiveFilterCount()}
          </span>
        )} */}
      </button>

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeFilter}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[50] transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex justify-between items-center pt-3 pb-1 px-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto"></div>
          <button onClick={closeFilter} className="absolute right-4 top-3 text-gray-500 p-2">
            ✕
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto pb-6">{childrenWithProps}</div>
        <div className="sticky bottom-0 w-full bg-white p-4 border-t border-gray-200">
          <button
            onClick={closeFilter}
            className="w-full py-3 bg-[#3873C3] text-white rounded-full font-medium"
          >
            {translation?.Apply || labels.apply}
          </button>
        </div>
      </div>
    </>
  );
}

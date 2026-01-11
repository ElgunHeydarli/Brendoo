// pages/Products/components/DropdownItemBrand.tsx

import { memo, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import GETRequest from "../../../setting/Request";
import type { TranslationsKeys } from "../../../setting/Types";
import type { Brand } from "../types";

interface DropdownItemBrandProps {
  brands: Brand[];
  selectedBrandIds: number[];
  onSelectBrand: (brandIds: number[]) => void;
}

const DropdownItemBrand = memo(({
  brands,
  selectedBrandIds,
  onSelectBrand,
}: DropdownItemBrandProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { lang = "ru" } = useParams<{ lang: string }>();
  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    "translates",
    [lang]
  );

  const toggleDropdown = useCallback(() => setIsOpen((prev) => !prev), []);

  const handleBrandClick = useCallback(
    (brandId: number) => {
      if (selectedBrandIds.includes(brandId)) {
        onSelectBrand(selectedBrandIds.filter((id) => id !== brandId));
      } else {
        onSelectBrand([...selectedBrandIds, brandId]);
      }
    },
    [selectedBrandIds, onSelectBrand]
  );

  const clearAll = useCallback(() => onSelectBrand([]), [onSelectBrand]);

  const filteredBrands = useMemo(
    () =>
      brands.filter((brand) =>
        brand.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [brands, searchTerm]
  );

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col w-full text-base">
        <div
          className="flex overflow-hidden flex-row gap-5 justify-between px-4 py-3.5 w-full bg-neutral-100 rounded-[100px] cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={toggleDropdown}
        >
          <div className="my-auto">
            {translation?.brendler_soz || "Brendlər"}
          </div>
          <img
            style={isOpen ? { transform: "rotate(180deg)" } : {}}
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/67247d6cece276d38b6843cadeec5ef50381594d81ab035a8f6139f4bac01ffa?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
            className="object-contain shrink-0 w-6 aspect-square transition-transform"
            alt="Dropdown Icon"
          />
        </div>
      </div>

      {isOpen && (
        <div className="bg-[#FAFAFA] mt-3 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
          <div className="sticky top-0 bg-[#FAFAFA] z-10 p-4 border-b border-[#E5E5E5]">
            <input
              type="text"
              placeholder={translation?.brend_placeholder || "Brend axtar..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-[#E5E5E5] rounded-md outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div
            className={`h-[44px] w-full px-[16px] py-[14px] text-[14px] font-normal border-b border-[#E5E5E5] cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedBrandIds.length === 0 ? "bg-[#EBF2FF] font-medium" : ""
            }`}
            onClick={clearAll}
          >
            {translation?.butun_brendler || "Bütün brendlər"}
          </div>

          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              className={`h-[44px] w-full px-[16px] py-[14px] text-[14px] font-normal border-b border-[#E5E5E5] cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedBrandIds.includes(brand.id)
                  ? "bg-[#EBF2FF] font-medium"
                  : ""
              }`}
              onClick={() => handleBrandClick(brand.id)}
            >
              {brand.title}
            </div>
          ))}

          {filteredBrands.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              {translation?.brend_not_found || "Brend tapılmadı"}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

DropdownItemBrand.displayName = 'DropdownItemBrand';

export default DropdownItemBrand;

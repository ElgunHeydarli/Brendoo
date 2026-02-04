// pages/Products/components/DropdownItemFilter.tsx

import { memo, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { Filter } from "../../../setting/Types";
import GETRequest from "../../../setting/Request";
import type { TranslationsKeys } from "../../../setting/Types";

interface DropdownItemFilterProps {
  data: Filter;
  setoptions: (par: any) => void;
  options: number[];
}

const DropdownItemFilter = memo(({
  data,
  setoptions,
  options,
}: DropdownItemFilterProps) => {
  const { lang = "az" } = useParams<{ lang: string }>();
  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    "translates",
    [lang]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const filteredOptions = useMemo(
    () =>
      data?.options?.filter((item) =>
        (item?.title || '').toLowerCase().includes((searchTerm || '').toLowerCase())
      ) || [],
    [data?.options, searchTerm]
  );

  const handleOptionClick = useCallback(
    (itemId: number) => {
      const isSelected = options.includes(itemId);
      if (isSelected) {
        setoptions(options.filter((id) => id !== itemId));
      } else {
        setoptions([...options, itemId]);
      }
    },
    [options, setoptions]
  );

  // data yoxdursa, göstərmə
  if (!data || !data.options) {
    return null;
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col w-full text-base">
        <div
          className="flex overflow-hidden flex-row gap-5 justify-between px-4 py-3.5 w-full bg-neutral-100 rounded-[100px] cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={toggleDropdown}
        >
          <div className="my-auto">{data.title || ''}</div>
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
        <div className="bg-[#F5F5F5] rounded-[20px] mt-3 max-h-[300px] overflow-y-auto p-5">
          <div className="mb-4">
            <input
              type="text"
              placeholder={`${data.title || ''} ${translation?.axtar ?? ""}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-[#E5E5E5] rounded-md outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-row flex-wrap justify-start gap-[14px]">
            {filteredOptions.map((item) => {
              const isSelected = options.includes(item.id);

              return item.color_code ? (
                <div
                  key={item.id}
                  className="flex justify-center items-center flex-col cursor-pointer"
                  onClick={() => handleOptionClick(item.id)}
                >
                  <div
                    style={{
                      backgroundColor: item.color_code,
                      border: isSelected
                        ? "2px solid #3873C3"
                        : "1px solid #ccc",
                    }}
                    className="w-11 h-11 rounded-full flex justify-center items-center transition-all duration-200 hover:scale-105"
                  >
                    {isSelected && (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M4.16675 9.99992L8.33341 14.1666L16.6667 5.83325"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-[10px] mt-2 text-black text-opacity-60">
                    {item.title || ''}
                  </p>
                </div>
              ) : (
                <div
                  key={item.id}
                  onClick={() => handleOptionClick(item.id)}
                  className={`overflow-hidden px-4 py-3.5 cursor-pointer rounded-[100px] text-sm transition-all duration-200 hover:scale-105 ${
                    isSelected
                      ? "bg-[#3873C3] text-white"
                      : "bg-[#FCFCFC] text-black hover:bg-gray-100"
                  }`}
                >
                  {item.title || ''}
                </div>
              );
            })}

            {filteredOptions.length === 0 && (
              <div className="text-gray-500 text-sm">
                {translation?.netice_yoxdur || "Nəticə yoxdur"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

DropdownItemFilter.displayName = 'DropdownItemFilter';

export default DropdownItemFilter;

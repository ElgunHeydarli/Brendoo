// pages/Products/components/DropdownItem.tsx

import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import type { Category } from "../../../setting/Types";
import ROUTES from "../../../setting/routes";

interface DropdownItemProps {
  data: Category;
}

const DropdownItem = memo(({ data }: DropdownItemProps) => {
  const navigate = useNavigate();
  const { lang = "ru" } = useParams<{ lang: string }>();
  const location = useLocation();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const subCategory = queryParams.get("subCategory");
  const category = queryParams.get("category");
  const third_category_id = queryParams.get("third_category_id");

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(category ? +category === data.id : false);
  }, [category, data.id]);

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  const renderSubCategories = useMemo(
    () =>
      isOpen && (
        <div className="flex flex-col w-full text-sm gap-3 my-3 mt-5">
          {data.subCategories.map((SubCategory) => {
            const isSelected = subCategory && +subCategory === SubCategory.id;

            if (isSelected) {
              return (
                <div key={SubCategory.id}>
                  <div
                    className="overflow-hidden px-4 py-2.5 w-full text-white bg-[#3873C3] rounded-[100px] flex flex-row justify-between cursor-pointer"
                    onClick={() =>
                      handleNavigate(
                        `/${lang}/${
                          ROUTES.product[lang as keyof typeof ROUTES.product]
                        }?category=${data.id}`
                      )
                    }
                  >
                    {SubCategory.title}
                    <img
                      style={{ transform: "rotate(180deg)" }}
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/67247d6cece276d38b6843cadeec5ef50381594d81ab035a8f6139f4bac01ffa?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                      className="object-contain shrink-0 w-6 aspect-square"
                      alt="Dropdown Icon"
                    />
                  </div>
                  <div className="bg-[#FAFAFA] mt-1 rounded-xl overflow-hidden">
                    {SubCategory.third_categories.map((item) => {
                      const isThirdSelected =
                        third_category_id && +third_category_id === item.id;

                      return (
                        <p
                          key={item.id}
                          className={`h-[44px] w-full px-[16px] py-[14px] text-[14px] font-normal border-b border-[#E5E5E5] cursor-pointer transition-colors ${
                            isThirdSelected ? "bg-[#EBF2FF] font-medium" : "hover:bg-gray-50"
                          }`}
                          onClick={() =>
                            handleNavigate(
                              `/${lang}/${
                                ROUTES.product[
                                  lang as keyof typeof ROUTES.product
                                ]
                              }?category=${data.id}&subCategory=${
                                SubCategory.id
                              }&third_category_id=${item.id}`
                            )
                          }
                        >
                          {item.title}
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={SubCategory.id}
                className="overflow-hidden px-4 py-2.5 w-full text-black bg-[#F5F5F5] rounded-[100px] flex flex-row justify-between cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() =>
                  handleNavigate(
                    `/${lang}/${
                      ROUTES.product[lang as keyof typeof ROUTES.product]
                    }?category=${data.id}&subCategory=${SubCategory.id}`
                  )
                }
              >
                {SubCategory.title}
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/67247d6cece276d38b6843cadeec5ef50381594d81ab035a8f6139f4bac01ffa?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                  className="object-contain shrink-0 w-6 aspect-square"
                  alt="Dropdown Icon"
                />
              </div>
            );
          })}
        </div>
      ),
    [
      isOpen,
      data.subCategories,
      data.id,
      subCategory,
      third_category_id,
      lang,
      handleNavigate,
    ]
  );

  const currentPath = useMemo(() => {
    const baseRoute = `/${lang}/${
      ROUTES.product[lang as keyof typeof ROUTES.product]
    }`;
    return category && +category === data.id
      ? baseRoute
      : `${baseRoute}?category=${data.id}`;
  }, [lang, category, data.id]);

  return (
    <div className="flex flex-col w-full">
      <Link reloadDocument to={currentPath}>
        <div className="flex flex-col w-full text-base">
          <div
            className={`flex overflow-hidden flex-row gap-5 justify-between px-4 py-3.5 w-full rounded-[100px] cursor-pointer transition-colors hover:bg-gray-200 ${
              category && +category === data.id
                ? "bg-neutral-100"
                : "bg-neutral-100"
            }`}
          >
            <div className="my-auto font-semibold truncate">{data.title}</div>
            <img
              style={isOpen ? { transform: "rotate(180deg)" } : {}}
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/67247d6cece276d38b6843cadeec5ef50381594d81ab035a8f6139f4bac01ffa?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
              className="object-contain shrink-0 w-6 aspect-square transition-transform"
              alt="Dropdown Icon"
            />
          </div>
        </div>
      </Link>
      {renderSubCategories}
    </div>
  );
});

DropdownItem.displayName = 'DropdownItem';

export default DropdownItem;

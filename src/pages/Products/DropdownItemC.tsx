import { useState, useEffect, memo, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ROUTES from "../../setting/routes";

interface SubCategoriesThirdCategories {
  id: number;
  title: string | null;
}

interface SubCategories {
  id: number;
  title: string | null;
  third_categories?: SubCategoriesThirdCategories[];
}

interface Category {
  id: number;
  title: string | null;
  subCategories?: SubCategories[];
  third_categories?: SubCategoriesThirdCategories[];
}

const DropdownItemC = memo(({ data }: { data: Category }) => {
  const { lang = "az" } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const selectedCategoryId = Number(searchParams.get("category_id"));
  const selectedSubCategoryId = Number(searchParams.get("sub_category_id"));

  const [isOpen, setIsOpen] = useState(false);
  const [openSubId, setOpenSubId] = useState<number | null>(null);

  // Sayfa yenilense bile URL’den aç/kapa state’ini geri yükle
  useEffect(() => {
    if (selectedCategoryId === data.id) {
      setIsOpen(true);
      if (selectedSubCategoryId) {
        setOpenSubId(selectedSubCategoryId);
      }
    }
  }, [selectedCategoryId, selectedSubCategoryId, data.id]);

  const handleNavigate = useCallback(
    (params: {
      category_id: number;
      sub_category_id?: number | null;
      third_category_id?: number | null;
    }) => {
      const newParams = new URLSearchParams();

      newParams.set("category_id", String(params.category_id));
      if (params.sub_category_id) {
        newParams.set("sub_category_id", String(params.sub_category_id));
      }
      if (params.third_category_id) {
        newParams.set("third_category_id", String(params.third_category_id));
      }

      navigate({
        pathname: `/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}`,
        search: newParams.toString(),
      });
    },
    [navigate, lang]
  );

  const toggleCategory = () => {
    setIsOpen((prev) => !prev);
  };

  const toggleSub = (id: number) => {
    setOpenSubId((prev) => (prev === id ? null : id));
    // subCategory seçilince filtrele
    handleNavigate({ category_id: data.id, sub_category_id: id });
  };

  const selectThird = (subId: number, thirdId: number) => {
    handleNavigate({
      category_id: data.id,
      sub_category_id: subId,
      third_category_id: thirdId,
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* Ana kategori */}
      <div
        className="flex flex-row gap-5 justify-between px-4 py-3.5 w-full bg-neutral-100 rounded-[100px] cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={toggleCategory}
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

      {/* SubCategories */}
      {isOpen && data?.subCategories && data?.subCategories?.length > 0 && (
        <div className="flex flex-col w-full text-sm gap-3 my-3 mt-5">
          {data?.subCategories?.map((sub) => (
            <div key={sub.id}>
              <div
                className={`px-4 py-2.5 w-full rounded-[100px] flex flex-row justify-between cursor-pointer transition-colors ${
                  openSubId === sub.id ? "bg-gray-300" : "bg-[#F5F5F5] hover:bg-gray-200"
                }`}
                onClick={() => toggleSub(sub.id)}
              >
                {sub.title}
                <img
                  style={
                    openSubId === sub.id ? { transform: "rotate(180deg)" } : {}
                  }
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/67247d6cece276d38b6843cadeec5ef50381594d81ab035a8f6139f4bac01ffa?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                  className="object-contain shrink-0 w-6 aspect-square transition-transform"
                  alt="Dropdown Icon"
                />
              </div>

              {/* Third Categories */}
              {openSubId === sub.id && sub.third_categories && (
                <div className="bg-[#FAFAFA] mt-1 rounded-xl overflow-hidden">
                  {sub.third_categories.map((item) => (
                    <p
                      key={item.id}
                      className="h-[44px] w-full px-[16px] py-[14px] text-[14px] font-normal border-b border-[#E5E5E5] cursor-pointer hover:bg-gray-50"
                      onClick={() => selectThird(sub.id, item.id)}
                    >
                      {item.title}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Eğer subCategory yok ama direkt third_categories varsa */}
      {isOpen && data?.third_categories && data?.third_categories?.length > 0 && (
        <div className="bg-[#FAFAFA] mt-3 rounded-xl overflow-hidden">
          {data?.third_categories?.map((item) => (
            <p
              key={item.id}
              onClick={() =>
                handleNavigate({
                  category_id: data.id,
                  third_category_id: item.id,
                })
              }
              className="h-[44px] w-full px-[16px] py-[14px] text-[14px] font-normal border-b border-[#E5E5E5] cursor-pointer hover:bg-gray-50"
            >
              {item.title}
            </p>
          ))}
        </div>
      )}
    </div>
  );
});

export default DropdownItemC;

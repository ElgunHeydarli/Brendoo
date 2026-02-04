import { ChevronRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import GETRequest from '../../setting/Request';
import { CatalogCategory, TranslationsKeys } from '../../setting/Types';
import { useEffect, useState } from 'react';
import ROUTES from '../../setting/routes';
import { AiFillProduct } from 'react-icons/ai';

export default function CategoryNavigation({ handleClose }: { handleClose: () => void }) {
  const [CurretCategory, setCurrentCategory] = useState<number>(0);
  const { lang = 'az' } = useParams<{
    lang: string;
  }>();
  const { data: catalog_categories } = GETRequest<CatalogCategory[]>(
    `/catalog_categories`,
    'catalog_categories',
    [lang],
  );
  useEffect(() => {
    if (catalog_categories) {
      setCurrentCategory(catalog_categories[0].id);
    }
  }, [catalog_categories]);

  const { data: translation } = GETRequest<TranslationsKeys>(`/translates`, 'translates', [
    lang,
  ]);

  return (
    <div className="w-full max-w-7xl mx-auto bg-white">
      <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] max-h-[400px] overflow-auto gap-4 p-4">
        {/* Sidebar Categories */}
        <div className="space-y-2">
          {catalog_categories?.map(item => (
            <CategoryLink
              link={`/${lang}/${
                ROUTES.product[lang as keyof typeof ROUTES.product]
              }?category=${item.id}`}
              action={() => {
                setCurrentCategory(item.id);
              }}
              active={item.id === CurretCategory}
              key={item.id}
            >
              <img src={item.image} alt="" className="w-5 h-5" />
              {item.title}
            </CategoryLink>
          ))}

          <div
            className={`flex items-center cursor-pointer justify-between p-2 rounded hover:bg-gray-100 transition-colors text-gray-700`}
          >
            <Link reloadDocument to={`/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}`}>
              <span className="flex flex-row gap-2 justify-center items-center">
                <AiFillProduct className="w-5 h-5" />
                {translation?.butun_mehsullar}
              </span>
            </Link>
          </div>
        </div>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {catalog_categories
            ?.filter(item => item.id === CurretCategory)
            .map(Category1 => {
              return Category1.subCategories.map(Category2 => (
                <div className="space-y-4" key={Category2.id}>
                  <h3 className="font-medium text-[#3873C3] flex flex-row gap-2  items-center hover:text-[#3873C3] hover:underline cursor-pointer">
                    <Link
                    reloadDocument
                      onClick={() => {
                        handleClose();
                      }}
                      to={`/${lang}/${
                        ROUTES.product[lang as keyof typeof ROUTES.product]
                      }?category=${Category1.id}&subCategory=${Category2.id}`}
                    >
                      {Category2.title}
                    </Link>
                  </h3>
                  <ul className="space-y-2">
                    {Category2.third_categories.map(item => (
                      <li key={item.id}>
                        <Link
                        reloadDocument
                          onClick={() => {
                            handleClose();
                          }}
                          to={`/${lang}/${
                            ROUTES.product[lang as keyof typeof ROUTES.product]
                          }?category=${Category1.id}&subCategory=${
                            Category2.id
                          }&third_category=${item.id}`}
                          className="text-sm text-gray-600 hover:text-[#3873C3] hover:underline"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ));
            })}
        </div>
      </div>
    </div>
  );
}

function CategoryLink({
  action,
  children,
  active = false,
  link,
}: {
  action?: () => void;
  children: React.ReactNode;
  active?: boolean;
  link: string;
}) {
  return (
    <div
      //@ts-expect-error action()
      onMouseEnter={() => action()}
      className={`flex items-center cursor-pointer justify-between p-2 rounded hover:bg-gray-100 transition-colors ${
        active ? 'text-[#3873C3] font-medium' : 'text-gray-700'
      }`}
    >
      <Link reloadDocument to={link}>
        <span className="flex flex-row gap-2 justify-center items-center">{children}</span>
      </Link>
      <ChevronRight className="h-4 w-4" />
    </div>
  );
}

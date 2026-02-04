import { Link, useLocation, useParams } from 'react-router-dom';
import { TranslationsKeys } from '../../setting/Types';
import GETRequest from '../../setting/Request';

export function BreadCump() {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  const { data: tarnslation } = GETRequest<TranslationsKeys>(`/translates`, 'translates', [
    lang,
  ]);

  return (
    <div className="flex gap-2 items-center flex-wrap text-base text-black text-opacity-70">
      <Link reloadDocument to="/">
        <h6 className="text-nowrap self-stretch my-auto text-black hover:text-blue-600">
          {tarnslation?.ana_sehife_key ?? ''}
        </h6>
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={name} className="flex items-center gap-2">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/64bb3b3dae771cd265db1accd95aa96f30bd9da3da88a57867743da53bebc0eb?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
              className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
            />
            {!isLast ? (
              <Link reloadDocument to={routeTo}>
                <h6 className="text-nowrap self-stretch my-auto hover:text-blue-600">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </h6>
              </Link>
            ) : (
              <h6 className="text-nowrap self-stretch my-auto">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </h6>
            )}
          </div>
        );
      })}
    </div>
  );
}

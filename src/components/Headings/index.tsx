/**
 * H1 Başlıq Komponenti - SEO-optimal
 * Hər səhifənin özünəməxsus H1 başlığı olmalıdır
 */
interface H1Props {
  children: string | React.ReactNode;
  className?: string;
  id?: string;
}

function H1({ children, className = '', id = 'page-h1' }: H1Props) {
  return (
    <h1
      id={id}
      className={`text-4xl font-bold text-gray-900 mb-4 ${className}`}
    >
      {children}
    </h1>
  );
}

/**
 * H2 Başlıq Komponenti - Əsas məzmun başlıqları
 */
interface H2Props {
  children: string | React.ReactNode;
  className?: string;
  id?: string;
}

function H2({ children, className = '', id = '' }: H2Props) {
  return (
    <h2
      id={id}
      className={`text-2xl font-semibold text-gray-800 mb-3 ${className}`}
    >
      {children}
    </h2>
  );
}

export default H1;
export { H2 };

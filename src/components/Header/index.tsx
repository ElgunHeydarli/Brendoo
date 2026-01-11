import { useHeader } from './hooks/useHeader';
import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';

// Re-export for backward compatibility
export { useLanguageStore } from './hooks/useHeader';

export default function Header() {
  const headerProps = useHeader();

  return (
    <div className="block w-full z-[99999999999] top-0 min-h-[68px]">
      <DesktopHeader {...headerProps} />
      <MobileHeader {...headerProps} />
    </div>
  );
}

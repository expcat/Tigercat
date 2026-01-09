import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

interface DemoSection {
  id: string;
  label: string;
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function DemoRouteLayout() {
  const location = useLocation();
  const pageRootRef = useRef<HTMLDivElement | null>(null);
  const [sections, setSections] = useState<DemoSection[]>([]);
  const [pageTitle, setPageTitle] = useState('');

  const isHome = useMemo(() => location.pathname === '/', [location.pathname]);

  useEffect(() => {
    const root = pageRootRef.current;
    if (!root) return;

    const h1 = root.querySelector('h1');
    const nextTitle = (h1?.textContent ?? '').trim();
    setPageTitle(nextTitle);

    const headings = Array.from(root.querySelectorAll('h2'))
      .map((el) => el as HTMLHeadingElement)
      .filter((el) => el.textContent && el.textContent.trim().length > 0);

    const usedIds = new Set<string>();
    const nextSections: DemoSection[] = [];

    for (const h2 of headings) {
      const label = (h2.textContent ?? '').trim();
      let id = h2.id?.trim();
      if (!id) id = slugify(label);
      if (!id) continue;

      let uniqueId = id;
      let counter = 2;
      while (usedIds.has(uniqueId) || document.getElementById(uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter += 1;
      }

      usedIds.add(uniqueId);
      h2.id = uniqueId;
      h2.setAttribute('data-demo-anchor', 'true');

      nextSections.push({ id: uniqueId, label });
    }

    setSections(nextSections);
  }, [location.pathname]);

  const headerTitle = useMemo(() => {
    if (pageTitle) return pageTitle;
    const lastSegment = location.pathname.split('/').filter(Boolean).pop();
    return lastSegment ? lastSegment : '';
  }, [location.pathname, pageTitle]);

  return (
    <div className="min-h-screen">
      {!isHome && (headerTitle || sections.length > 0) && (
        <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="max-w-5xl mx-auto px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 text-sm font-semibold text-gray-900 truncate">
                {headerTitle}
              </div>
              {sections.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="text-sm px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div ref={pageRootRef}>
        <Outlet />
      </div>

      {!isHome && (
        <Link
          to="/"
          aria-label="返回首页"
          className="fixed right-6 bottom-6 z-30 inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-2 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
          返回首页
        </Link>
      )}
    </div>
  );
}

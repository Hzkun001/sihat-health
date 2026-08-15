// src/components/search/GlobalCommandMenu.tsx
import React, { useEffect, useState, useCallback, useTransition } from 'react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  buildUnifiedSearchIndex,
  querySearchIndex,
  SearchItem,
  SearchResultItem,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  formatDistanceString,
  OPEN_COMMAND_EVENT,
  FOCUS_MAP_ITEM_EVENT,
} from '@/lib/searchEngine';
import {
  MapPin,
  Building2,
  Hospital,
  Cross,
  Pill,
  HeartHandshake,
  Trash2,
  FileText,
  Compass,
  ArrowRight,
  Clock,
  Trash,
  Navigation,
} from 'lucide-react';

export function GlobalCommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchItem[]>([]);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>([]);
  const [, startTransition] = useTransition();

  // Load unified search index on open
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      void buildUnifiedSearchIndex().then((loadedIndex) => {
        setIndex(loadedIndex);
      });
    }
  }, [open]);

  // Global Keyboard Shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    const handleCustomOpen = () => setOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener(OPEN_COMMAND_EVENT, handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener(OPEN_COMMAND_EVENT, handleCustomOpen);
    };
  }, []);

  // Update filtered search results
  useEffect(() => {
    startTransition(() => {
      if (!query.trim()) {
        setResults([]);
      } else {
        const filtered = querySearchIndex(index, query, { limit: 12 });
        setResults(filtered);
      }
    });
  }, [index, query]);

  const handleSelectItem = useCallback((item: SearchItem) => {
    saveRecentSearch(item);
    setOpen(false);
    setQuery('');

    // Handle Quick Action Routes
    if (item.actionRoute) {
      window.location.hash = item.actionRoute;
      return;
    }

    // Handle Map Navigation & Focus
    if (item.coordinates) {
      window.location.hash = '#/peta';
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent(FOCUS_MAP_ITEM_EVENT, {
            detail: {
              item,
              coordinates: item.coordinates,
              layerId: item.layerId,
            },
          })
        );
      }, 100);
    }
  }, []);

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  };

  const getItemIcon = (item: SearchItem) => {
    switch (item.category) {
      case 'rumahsakit':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
            <Hospital className="size-3.5" />
          </div>
        );
      case 'puskesmas':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex-shrink-0">
            <Cross className="size-3.5" />
          </div>
        );
      case 'klinik':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex-shrink-0">
            <Building2 className="size-3.5" />
          </div>
        );
      case 'apotek':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100 flex-shrink-0">
            <Pill className="size-3.5" />
          </div>
        );
      case 'homecare':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-100 flex-shrink-0">
            <HeartHandshake className="size-3.5" />
          </div>
        );
      case 'tps':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-600 border border-stone-200 flex-shrink-0">
            <Trash2 className="size-3.5" />
          </div>
        );
      case 'wilayah':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex-shrink-0">
            <Compass className="size-3.5" />
          </div>
        );
      case 'laporan':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex-shrink-0">
            <FileText className="size-3.5" />
          </div>
        );
      case 'aksi':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-mint text-brand-green border border-brand-green/20 flex-shrink-0">
            <Navigation className="size-3.5" />
          </div>
        );
      default:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-100 text-ink-600 border border-surface-200 flex-shrink-0">
            <MapPin className="size-3.5" />
          </div>
        );
    }
  };

  const getCategoryBadge = (item: SearchItem) => {
    switch (item.category) {
      case 'rumahsakit':
        return <span className="rounded-md bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-[10px] font-bold text-blue-700">Rumah Sakit</span>;
      case 'puskesmas':
        return <span className="rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Puskesmas</span>;
      case 'klinik':
        return <span className="rounded-md bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-700">Klinik</span>;
      case 'apotek':
        return <span className="rounded-md bg-teal-50 border border-teal-200/80 px-2 py-0.5 text-[10px] font-bold text-teal-700">Apotek</span>;
      case 'homecare':
        return <span className="rounded-md bg-yellow-50 border border-yellow-200/80 px-2 py-0.5 text-[10px] font-bold text-yellow-800">HomeCare</span>;
      case 'tps':
        return <span className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-700">TPS</span>;
      case 'wilayah':
        return <span className="rounded-md bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700">Wilayah</span>;
      case 'laporan':
        return <span className="rounded-md bg-rose-50 border border-rose-200/80 px-2 py-0.5 text-[10px] font-bold text-rose-700">Laporan</span>;
      default:
        return item.badge ? <span className="rounded-md bg-surface-100 border border-surface-200 px-2 py-0.5 text-[10px] font-bold text-ink-700">{item.badge}</span> : null;
    }
  };

  // Group filtered results by category
  const faskesResults = results.filter((r) =>
    ['rumahsakit', 'puskesmas', 'klinik', 'apotek', 'homecare', 'tps'].includes(r.category)
  );
  const wilayahResults = results.filter((r) => r.category === 'wilayah');
  const actionResults = results.filter((r) => r.category === 'aksi');
  const reportResults = results.filter((r) => r.category === 'laporan');

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Pencarian SIHAT"
      description="Cari fasilitas kesehatan, wilayah, laporan warga, atau menu navigasi..."
    >
      <CommandInput
        placeholder="Cari faskes, wilayah, no. tiket, atau fitur (cth: Ulin, Cempaka)..."
        value={query}
        onValueChange={setQuery}
        className="text-ink-900 placeholder:text-ink-400 text-sm font-medium"
      />

      <CommandList className="max-h-[380px] p-2 bg-white">
        <CommandEmpty className="py-8 text-center text-sm text-ink-500 bg-white">
          Tidak ada hasil yang cocok untuk &ldquo;{query}&rdquo;.
        </CommandEmpty>

        {/* Empty state: Show Quick Actions & Recent Searches */}
        {!query && (
          <>
            {recentSearches.length > 0 && (
              <CommandGroup
                heading={
                  <div className="flex items-center justify-between pr-2 text-xs font-bold text-ink-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      Pencarian Terakhir
                    </span>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-[11px] font-normal hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash className="size-3" />
                      Hapus Riwayat
                    </button>
                  </div>
                }
              >
                {recentSearches.map((item) => (
                  <CommandItem
                    key={`recent-${item.id}`}
                    value={`recent ${item.title} ${item.subtitle ?? ''}`}
                    onSelect={() => handleSelectItem(item)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-ink-800 hover:bg-surface-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getItemIcon(item)}
                      <div className="truncate">
                        <p className="text-sm font-semibold text-ink-900 truncate">{item.title}</p>
                        {item.subtitle && <p className="text-xs text-ink-500 truncate">{item.subtitle}</p>}
                      </div>
                    </div>
                    {getCategoryBadge(item)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {recentSearches.length > 0 && <CommandSeparator className="my-2 bg-surface-200" />}

            <CommandGroup heading="Fasilitas & Wilayah Populer">
              {index
                .filter((item) => ['rumahsakit', 'puskesmas', 'wilayah'].includes(item.category))
                .slice(0, 6)
                .map((facility) => (
                  <CommandItem
                    key={facility.id}
                    value={`${facility.title} ${facility.subtitle ?? ''} ${facility.searchableText}`}
                    onSelect={() => handleSelectItem(facility)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-ink-800 hover:bg-surface-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getItemIcon(facility)}
                      <div className="truncate">
                        <p className="text-sm font-semibold text-ink-900 truncate">{facility.title}</p>
                        {facility.subtitle && <p className="text-xs text-ink-500 truncate">{facility.subtitle}</p>}
                      </div>
                    </div>
                    {getCategoryBadge(facility)}
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}

        {/* Filtered Search Results */}
        {query && (
          <>
            {actionResults.length > 0 && (
              <CommandGroup heading="Navigasi & Menu">
                {actionResults.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.title} ${item.searchableText}`}
                    onSelect={() => handleSelectItem(item)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getItemIcon(item)}
                      <span className="text-sm font-semibold text-ink-900">{item.title}</span>
                    </div>
                    <ArrowRight className="size-4 text-ink-400" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {faskesResults.length > 0 && (
              <CommandGroup heading="Fasilitas Kesehatan & Sanitasi">
                {faskesResults.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.title} ${item.subtitle ?? ''} ${item.searchableText}`}
                    onSelect={() => handleSelectItem(item)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {getItemIcon(item)}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-ink-900 truncate">{item.title}</p>
                        {item.subtitle && <p className="text-xs text-ink-500 truncate">{item.subtitle}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {typeof item.distanceMeters === 'number' && (
                        <span className="rounded-full bg-brand-mint px-2 py-0.5 text-[11px] font-bold text-brand-green">
                          {formatDistanceString(item.distanceMeters)}
                        </span>
                      )}
                      {getCategoryBadge(item)}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {wilayahResults.length > 0 && (
              <CommandGroup heading="Wilayah Administratif">
                {wilayahResults.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.title} ${item.subtitle ?? ''} ${item.searchableText}`}
                    onSelect={() => handleSelectItem(item)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getItemIcon(item)}
                      <div>
                        <p className="text-sm font-bold text-ink-900">{item.title}</p>
                        {item.subtitle && <p className="text-xs text-ink-500">{item.subtitle}</p>}
                      </div>
                    </div>
                    {getCategoryBadge(item)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {reportResults.length > 0 && (
              <CommandGroup heading="Laporan Warga">
                {reportResults.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.title} ${item.searchableText}`}
                    onSelect={() => handleSelectItem(item)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getItemIcon(item)}
                      <div className="truncate">
                        <p className="text-sm font-semibold text-ink-900 truncate">{item.title}</p>
                        {item.subtitle && <p className="text-xs text-ink-500">{item.subtitle}</p>}
                      </div>
                    </div>
                    {getCategoryBadge(item)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
      
      <div className="flex items-center justify-between border-t border-surface-200 px-3 py-2 text-[11px] text-ink-500 bg-surface-50">
        <div className="flex items-center gap-3">
          <span>
            <kbd className="rounded bg-surface-200 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-700">↑↓</kbd> navigasi
          </span>
          <span>
            <kbd className="rounded bg-surface-200 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-700">↵</kbd> pilih
          </span>
          <span>
            <kbd className="rounded bg-surface-200 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-700">esc</kbd> tutup
          </span>
        </div>
        <span className="font-semibold text-brand-green">SIHAT Search</span>
      </div>
    </CommandDialog>
  );
}

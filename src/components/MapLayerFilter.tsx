import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Filter, X } from 'lucide-react';
import { Checkbox } from './ui/checkbox';


interface LayerItem {
  id: string;
  label: string;
  color?: string;
  emoji?: string;
}

interface LayerCategory {
  id: string;
  title: string;
  items: LayerItem[];
}

const layerCategories: LayerCategory[] = [
  {
    id: 'health-facilities',
    title: 'Fasilitas Kesehatan',
    items: [
      { id: 'rumahsakit',   label: 'Rumah Sakit', color: '#3498DB' },
      { id: 'puskesmas',   label: 'Puskesmas', color: '#1BA351' },
      { id: 'klinik',     label: 'Klinik', color: '#d843e8ff' },
      { id: 'apotek',  label: 'Apotek', color: '#090e97ff' },
      { id: 'ambulances',  label: 'Ambulan(Next Update)', color: '#ffffffff' },
      { id: 'posyandu',    label: 'Posyandu(Next Update)', color: '#ffffffff' },
      { id: 'homecare',    label: 'HomeCare Lansia', color: '#f2c193ff' },
    ],
  },
  {
    id: 'environment-health',
    title: ' Lingkungan dan Penyakit (coming soon)',
    items: [
      { id: 'airquality', label: 'Kualitas Udara', color: '#95A5A6' },
      { id: 'heat-island', label: 'Panas Perkotaan', color: '#F39C12' },
      { id: 'dengue-zone', label: 'Daerah Rawan DBD', color: '#E38BCF' },
      { id: 'bank-sampah', label: 'Bank Sampah', color: '#1BA180' },
      { id: 'tps', label: 'TPS', color: '#1BA360' },
      { id: 'jalan-berlubang', label: 'Jalan Berlubang', color: '#000000' },
      { id: 'genangan air', label: 'Genangan Air', color: '#00AEEF' },
    ],
  },
  {
    id: 'demographics',
    title: 'Data Demografis',
    items: [
      { id: 'population', label: 'Kepadatan Penduduk', color: '#34495E' },
      { id: 'children',   label: 'Sebaran Balita',      color: '#FF6B9D' },
      { id: 'elderly',    label: 'Sebaran Lansia',      color: '#8E44AD' },
      { id: 'disability', label: 'Sebaran Disabilitas', color: '#00AEEF' },
    ],
  },
];

export interface MapLayerFilterProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
  /** dipanggil ketika user toggle layer */
  onToggle?: (layerId: string, enabled: boolean) => void;
  /** set default pilihan awal (optional) */
  defaultSelections?: Record<string, boolean>;
}

export function MapLayerFilter({
  isOpen = true,
  onClose,
  isMobile = false,
  onToggle,
  defaultSelections = {},
}: MapLayerFilterProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    isMobile ? [] : ['health-facilities']
  );
  const [selectedLayers, setSelectedLayers] = useState<string[]>(() =>
    Object.entries(defaultSelections)
      .filter(([, v]) => !!v)
      .map(([k]) => k)
  );

  // apply default selections dari parent saat mount
  useEffect(() => {
    const preselected = Object.entries(defaultSelections)
      .filter(([, v]) => !!v)
      .map(([k]) => k);
    setSelectedLayers((prev) => {
      const nextSet = new Set(preselected);
      const isSameSelection =
        prev.length === nextSet.size && prev.every((id) => nextSet.has(id));
      return isSameSelection ? prev : preselected;
    });
  }, [defaultSelections]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const toggleLayer = (layerId: string) => {
    setSelectedLayers((prev) => {
      const enabled = !prev.includes(layerId);
      const next = enabled ? [...prev, layerId] : prev.filter((id) => id !== layerId);
      onToggle?.(layerId, enabled); // ← kirim event ke parent
      return next;
    });
  };

  const content = (
    <div className="flex flex-col" style={{ minHeight: isMobile ? '0' : '100%' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#D8F3DC' }}
          >
            <Filter size={20} className="text-brand-green" strokeWidth={2.5} />
          </div>
          <h3 className="text-ink-900" style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Filter Layer
          </h3>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors active:scale-95"
            aria-label="Close filter"
          >
            <X size={20} className="text-ink-700" />
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-4 flex-shrink-0">
        {layerCategories.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <div key={category.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors group"
              >
                <span className="text-ink-900 group-hover:text-brand-green transition-colors" style={{ fontSize: '15px', fontWeight: 600 }}>
                  {category.title}
                </span>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
                  <ChevronDown size={18} className="text-ink-500" strokeWidth={2.5} />
                </motion.div>
              </button>

              {/* Category Items */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 mt-2 ml-3">
                      {category.items.map((item) => {
                        const isSelected = selectedLayers.includes(item.id);
                        return (
                          <label key={item.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors group">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleLayer(item.id)}
                              className="border-2 data-[state=checked]:bg-brand-green data-[state=checked]:border-brand-green flex-shrink-0"
                            />
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {item.color && (
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor: item.color,
                                    boxShadow: isSelected ? `0 0 8px ${item.color}40` : 'none',
                                  }}
                                />
                              )}
                              <span className="text-ink-700 group-hover:text-ink-900 transition-colors truncate" style={{ fontSize: '14px', fontWeight: 500 }}>
                                {item.label}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer - Data Source */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex-shrink-0">
        <p className="text-ink-500 leading-relaxed" style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600 }}>Sumber Data:</span>
          <br />
          Dinas Kesehatan Banjarbaru, BPS Kota Banjarbaru, Geoportal Kota Banjarbaru
        </p>
      </div>
    </div>
  );

  // Desktop panel
  if (!isMobile && !onClose) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white rounded-[20px] p-6 h-full overflow-hidden flex flex-col"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}
      >
        {content}
      </motion.div>
    );
  }

  // Mobile drawer
  if (isMobile && onClose) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[20px] flex flex-col"
              style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', maxHeight: 'min(80vh, 600px)' }}
            >
              <div className="flex justify-center py-3 flex-shrink-0">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6">
                {content}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
  return null;
}

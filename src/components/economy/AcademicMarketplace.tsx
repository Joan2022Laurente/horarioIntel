'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Plus, 
  Search, 
  MessageCircle, 
  Lock, 
  CreditCard,
  Loader2,
  Sparkles,
  Utensils,
  GraduationCap,
  Laptop,
  PackageCheck
} from 'lucide-react';
import { AcademicServiceRow, MarketplaceCategory, DeliveryMethod } from '@/types/economy';
import { ProcessedCourse } from '@/types/utp';
import { useAgent } from '@/context/AgentContext';
import { fetchAcademicServices } from '@/lib/supabase/marketplace-service';
import { OrderModal } from './OrderModal';
import { PublishListingModal } from './PublishListingModal';

interface AcademicMarketplaceProps {
  courses?: ProcessedCourse[];
  onAskAi?: (prompt: string) => void;
}

export const AcademicMarketplace: React.FC<AcademicMarketplaceProps> = ({
  courses,
  onAskAi,
}) => {
  const { askAgent } = useAgent();
  const handleAsk = onAskAi || askAgent;

  const [services, setServices] = useState<AcademicServiceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory>('ALL');
  const [deliveryFilter, setDeliveryFilter] = useState<'ALL' | DeliveryMethod>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [selectedListingForOrder, setSelectedListingForOrder] = useState<AcademicServiceRow | null>(null);

  // Wallet
  const [walletBalance] = useState<number>(4500); // S/ 45.00
  const [lockedEscrow] = useState<number>(2000);  // S/ 20.00

  useEffect(() => {
    async function loadServices() {
      setIsLoading(true);
      const data = await fetchAcademicServices();
      setServices(data);
      setIsLoading(false);
    }
    loadServices();
  }, []);

  const handleListingCreated = (newListing: AcademicServiceRow) => {
    setServices(prev => [newListing, ...prev]);
  };

  const filteredListings = useMemo(() => {
    return services.filter((item) => {
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Delivery filter
      if (deliveryFilter !== 'ALL' && item.delivery_method !== deliveryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchSeller = item.mentor?.full_name.toLowerCase().includes(q);
        const matchTags = item.tags?.some(t => t.toLowerCase().includes(q));
        const matchLocation = item.campus_location?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchSeller || matchTags || matchLocation;
      }
      return true;
    });
  }, [services, selectedCategory, deliveryFilter, searchQuery]);

  const getCategoryBadge = (cat?: MarketplaceCategory) => {
    switch (cat) {
      case 'FOOD':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--badge-orange-text)] bg-[var(--badge-orange-bg)] border border-[var(--badge-orange-border)] px-2.5 py-0.5 rounded-full">
            <Utensils className="h-3 w-3" />
            Comida & Snacks
          </span>
        );
      case 'ACADEMIC':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--badge-yellow-text)] bg-[var(--badge-yellow-bg)] border border-[var(--badge-yellow-border)] px-2.5 py-0.5 rounded-full">
            <GraduationCap className="h-3 w-3" />
            Asesoría Académica
          </span>
        );
      case 'TECH_DESIGN':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--badge-purple-text)] bg-[var(--badge-purple-bg)] border border-[var(--badge-purple-border)] px-2.5 py-0.5 rounded-full">
            <Laptop className="h-3 w-3" />
            Tech & Diseño
          </span>
        );
      case 'SECOND_HAND':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--badge-cyan-text)] bg-[var(--badge-cyan-bg)] border border-[var(--badge-cyan-border)] px-2.5 py-0.5 rounded-full">
            <PackageCheck className="h-3 w-3" />
            Segunda Mano
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 text-white animate-in fade-in duration-150">
      
      {/* Header - Clean Title (Zero Icon) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Marketplace Universitario
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Economía entre estudiantes: snacks caseros, mentorías 1 a 1, diseño de diapositivas y materiales de estudio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPublishOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-yellow)] hover:bg-[var(--accent-yellow-hover)] px-4 py-2 text-xs font-black text-black transition active:scale-95 shadow-none"
          >
            <Plus className="h-4 w-4" />
            <span>Publicar Anuncio</span>
          </button>
        </div>
      </div>

      {/* Wallet & Escrow Strip (Flat Matte, Zero Card-ception) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 shadow-none flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--accent-lime)]" />
              <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Billetera Estudiantil (Escrow UTP)
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">UTP Pay ID: #WAL-9021</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">S/ {(walletBalance / 100).toFixed(2)}</span>
            <span className="text-xs font-semibold text-neutral-400">PEN disponibles</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[var(--accent-yellow)]" />
              <span>En garantía (Escrow): S/ {(lockedEscrow / 100).toFixed(2)}</span>
            </span>
            <span className="text-[var(--badge-emerald-text)] font-bold flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              Protección 100%
            </span>
          </div>
        </div>

        {/* Retiros Inmediatos */}
        <div className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 shadow-none flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-[var(--accent-orange)]" />
              <span>Pagos & Cobros</span>
            </p>
            <p className="text-[11px] text-neutral-400">Acepta o paga al instante vía Yape o Plin:</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-xl bg-[var(--badge-purple-bg)] border border-[var(--badge-purple-border)] text-[var(--badge-purple-text)] font-bold text-xs">
              Yape
            </div>
            <div className="px-3 py-1 rounded-xl bg-[var(--badge-cyan-bg)] border border-[var(--badge-cyan-border)] text-[var(--badge-cyan-text)] font-bold text-xs">
              Plin
            </div>
          </div>

          <button 
            onClick={() => handleAsk('¿Cómo funciona el pago seguro con Yape/Plin y la entrega en campus en el Marketplace?')}
            className="w-full py-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-muted)] text-xs font-bold text-neutral-300 hover:text-white transition shadow-none"
          >
            ¿Cómo funciona?
          </button>
        </div>
      </div>

      {/* Categorías Principales (Pills) & Búsqueda */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap shadow-none ${
                selectedCategory === 'ALL' 
                  ? 'bg-white text-black' 
                  : 'bg-[var(--surface-subtle)] text-neutral-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedCategory('FOOD')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap shadow-none ${
                selectedCategory === 'FOOD' 
                  ? 'bg-[var(--accent-orange)] text-white' 
                  : 'bg-[var(--surface-subtle)] text-neutral-400 hover:text-white'
              }`}
            >
              🥟 Comida & Snacks
            </button>
            <button
              onClick={() => setSelectedCategory('ACADEMIC')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap shadow-none ${
                selectedCategory === 'ACADEMIC' 
                  ? 'bg-[var(--accent-yellow)] text-black' 
                  : 'bg-[var(--surface-subtle)] text-neutral-400 hover:text-white'
              }`}
            >
              🎓 Asesorías & Labs
            </button>
            <button
              onClick={() => setSelectedCategory('TECH_DESIGN')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap shadow-none ${
                selectedCategory === 'TECH_DESIGN' 
                  ? 'bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)] border border-[var(--badge-purple-border)]' 
                  : 'bg-[var(--surface-subtle)] text-neutral-400 hover:text-white'
              }`}
            >
              💻 Tech & Freelance
            </button>
            <button
              onClick={() => setSelectedCategory('SECOND_HAND')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap shadow-none ${
                selectedCategory === 'SECOND_HAND' 
                  ? 'bg-[var(--badge-cyan-bg)] text-[var(--badge-cyan-text)] border border-[var(--badge-cyan-border)]' 
                  : 'bg-[var(--surface-subtle)] text-neutral-400 hover:text-white'
              }`}
            >
              📦 Segunda Mano
            </button>
          </div>

          {/* Modality Filter */}
          <div className="flex items-center gap-1.5 text-xs self-end sm:self-auto">
            <button
              onClick={() => setDeliveryFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                deliveryFilter === 'ALL'
                  ? 'bg-[var(--surface-muted)] text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setDeliveryFilter('CAMPUS_MEET')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                deliveryFilter === 'CAMPUS_MEET'
                  ? 'bg-[var(--surface-muted)] text-[var(--accent-orange)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              En Campus
            </button>
            <button
              onClick={() => setDeliveryFilter('VIRTUAL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                deliveryFilter === 'VIRTUAL'
                  ? 'bg-[var(--surface-muted)] text-[var(--badge-cyan-text)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Virtual
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por comida (empanadas, brownies), curso, asesoría, calculadora o vendedor..."
            className="w-full rounded-2xl bg-[var(--surface-card)] pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[var(--accent-yellow)]"
          />
        </div>
      </div>

      {/* Grid de Productos & Servicios (Flat, Zero Card-ception) */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-neutral-400 space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-yellow)]" />
          <p className="text-xs">Cargando publicaciones activas del campus...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="py-16 text-center space-y-3 rounded-3xl bg-[var(--surface-card)] p-8">
          <p className="text-sm font-bold text-white">No se encontraron publicaciones con estos filtros</p>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            ¿Tienes algo para vender o enseñar? Sé el primero en publicar un snack, asesoría o material.
          </p>
          <button
            onClick={() => setIsPublishOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-yellow)] px-4 py-2 text-xs font-black text-black transition active:scale-95 shadow-none"
          >
            <Plus className="h-4 w-4" />
            <span>Crear Publicación</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredListings.map((srv) => (
            <div
              key={srv.id}
              className="flex flex-col justify-between rounded-3xl bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] p-5 space-y-4 shadow-none transition-all group"
            >
              <div className="space-y-3">
                {/* Category badge & Rating */}
                <div className="flex items-center justify-between gap-2">
                  {getCategoryBadge(srv.category)}

                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--badge-yellow-text)] bg-[var(--badge-yellow-bg)] border border-[var(--badge-yellow-border)] px-2 py-0.5 rounded-full">
                    <Star className="h-3 w-3 fill-current" />
                    {srv.rating_avg}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[var(--accent-yellow)] transition-colors leading-snug">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                    {srv.description}
                  </p>
                </div>

                {/* Tags */}
                {srv.tags && srv.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {srv.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium text-neutral-300 bg-[var(--surface-subtle)] px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Location / Modality info */}
                {srv.campus_location && (
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 pt-1">
                    <MapPin className="h-3 w-3 text-[var(--accent-orange)] shrink-0" />
                    <span className="truncate">{srv.campus_location}</span>
                  </div>
                )}
              </div>

              {/* Bottom Strip: Seller, Price & Action */}
              <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{srv.mentor?.full_name}</p>
                    <p className="text-[10px] text-neutral-400">{srv.mentor?.career}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-[var(--accent-lime)]">
                      S/ {(srv.price_cents / 100).toFixed(2)}
                    </p>
                    {srv.unit_label && (
                      <p className="text-[10px] text-neutral-500 font-medium">{srv.unit_label}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedListingForOrder(srv)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--badge-yellow-bg)] hover:bg-[#382b0d] border border-[var(--badge-yellow-border)] py-2 text-xs font-bold text-[var(--badge-yellow-text)] hover:text-white transition active:scale-95 shadow-none"
                  >
                    <span>Pedir / Coordinar</span>
                  </button>

                  <button
                    onClick={() => setSelectedListingForOrder(srv)}
                    className="p-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-muted)] text-neutral-300 hover:text-white transition"
                    title="WhatsApp Directo"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Publicar Anuncio */}
      <PublishListingModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onListingCreated={handleListingCreated}
      />

      {/* Modal: Coordinar Pedido / WhatsApp / Escrow */}
      {selectedListingForOrder && (
        <OrderModal
          listing={selectedListingForOrder}
          isOpen={Boolean(selectedListingForOrder)}
          onClose={() => setSelectedListingForOrder(null)}
        />
      )}

    </div>
  );
};

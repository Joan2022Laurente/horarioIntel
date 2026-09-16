'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  Loader2, 
  CheckCircle2, 
  Sparkles, 
  Utensils, 
  GraduationCap, 
  Laptop, 
  PackageCheck, 
  MapPin, 
  Phone,
  Tag
} from 'lucide-react';
import { MarketplaceCategory, ServiceType, DeliveryMethod, AcademicServiceRow } from '@/types/economy';
import { createServiceInDb } from '@/lib/supabase/marketplace-service';

interface PublishListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated: (newListing: AcademicServiceRow) => void;
}

export const PublishListingModal: React.FC<PublishListingModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
}) => {
  const [category, setCategory] = useState<MarketplaceCategory>('FOOD');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceSol, setPriceSol] = useState('');
  const [unitLabel, setUnitLabel] = useState('por unidad');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('CAMPUS_MEET');
  const [campusLocation, setCampusLocation] = useState('Biblioteca Torre A - Piso 3');
  const [whatsappPhone, setWhatsappPhone] = useState('51987654321');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: MarketplaceCategory) => {
    setCategory(cat);
    if (cat === 'FOOD') {
      setUnitLabel('por unidad');
      setDeliveryMethod('CAMPUS_MEET');
      setCampusLocation('Biblioteca Torre A (o Cafetería)');
      if (!title) setTitle('Empanadas / Snacks Caseros');
    } else if (cat === 'ACADEMIC') {
      setUnitLabel('por hora de asesoría');
      setDeliveryMethod('VIRTUAL');
      setCampusLocation('Google Meet / Discord UTP');
      if (!title) setTitle('Mentoría 1 a 1: Curso / Tema');
    } else if (cat === 'TECH_DESIGN') {
      setUnitLabel('por trabajo');
      setDeliveryMethod('VIRTUAL');
      setCampusLocation('Entrega digital Figma/Canva');
      if (!title) setTitle('Diseño de Diapositivas o Setup Dev');
    } else if (cat === 'SECOND_HAND') {
      setUnitLabel('precio único');
      setDeliveryMethod('CAMPUS_MEET');
      setCampusLocation('Entrada Torre A');
      if (!title) setTitle('Calculadora Científica / Libro Seminuevo');
    }
  };

  const getServiceTypeForCategory = (cat: MarketplaceCategory): ServiceType => {
    switch (cat) {
      case 'FOOD': return 'FOOD_SNACKS';
      case 'ACADEMIC': return 'TUTORING_1ON1';
      case 'TECH_DESIGN': return 'DESIGN_SLIDES';
      case 'SECOND_HAND': return 'SECOND_HAND';
      default: return 'OTHER';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !priceSol) return;

    setIsSubmitting(true);
    const parsedPrice = parseFloat(priceSol.replace(',', '.')) || 5.0;
    const priceCents = Math.round(parsedPrice * 100);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const created = await createServiceInDb({
      mentorName: 'Tú (Estudiante UTP)',
      mentorCode: 'U20202020',
      mentorCareer: 'Ingeniería de Software',
      title: title.trim(),
      description: description.trim() || 'Servicio o producto disponible en campus.',
      serviceType: getServiceTypeForCategory(category),
      category,
      priceCents,
      unitLabel: unitLabel.trim() || 'por unidad',
      deliveryMethod,
      campusLocation: campusLocation.trim(),
      whatsappPhone: whatsappPhone.trim(),
      durationMinutes: category === 'ACADEMIC' ? 60 : undefined,
      tags: tags.length > 0 ? tags : ['Estudiantil', 'UTP'],
    });

    setIsSubmitting(false);

    if (created) {
      onListingCreated(created);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-6 space-y-5 shadow-2xl text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--accent-yellow)]" />
            <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
              Publicar en Marketplace Campus
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--surface-subtle)] text-neutral-400 hover:text-white transition"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <CheckCircle2 className="h-12 w-12 text-[var(--accent-lime)] mx-auto" />
            <h3 className="text-base font-bold text-white">¡Publicación Activa!</h3>
            <p className="text-xs text-neutral-400">
              Tu producto o servicio ya está visible para todos los estudiantes en el campus.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Selector de Categoría Rápido */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                ¿Qué estás ofreciendo?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('FOOD')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition ${
                    category === 'FOOD'
                      ? 'bg-[var(--badge-orange-bg)] text-[var(--badge-orange-text)] font-bold'
                      : 'bg-[var(--surface-subtle)] text-neutral-400 hover:text-white'
                  }`}
                >
                  <Utensils className="h-4 w-4" />
                  <span className="text-[11px]">Comida & Snacks</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('ACADEMIC')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition ${
                    category === 'ACADEMIC'
                      ? 'bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)] font-bold'
                      : 'bg-[var(--surface-subtle)] text-neutral-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-[11px]">Asesorías</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('TECH_DESIGN')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition ${
                    category === 'TECH_DESIGN'
                      ? 'bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)] font-bold'
                      : 'bg-[var(--surface-subtle)] text-neutral-400 hover:text-white'
                  }`}
                >
                  <Laptop className="h-4 w-4" />
                  <span className="text-[11px]">Tech & Freelance</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('SECOND_HAND')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition ${
                    category === 'SECOND_HAND'
                      ? 'bg-[var(--badge-cyan-bg)] text-[var(--badge-cyan-text)] font-bold'
                      : 'bg-[var(--surface-subtle)] text-neutral-400 hover:text-white'
                  }`}
                >
                  <PackageCheck className="h-4 w-4" />
                  <span className="text-[11px]">Segunda Mano</span>
                </button>
              </div>
            </div>

            {/* Título */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                Título de la publicación
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Empanadas caseras de pollo y carne recién horneadas"
                className="w-full rounded-xl bg-[var(--surface-subtle)] border-none px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[var(--accent-yellow)]"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                Descripción / Detalles
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu producto o servicio, horario de entrega o temas incluidos..."
                className="w-full rounded-xl bg-[var(--surface-subtle)] border-none px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[var(--accent-yellow)] resize-none"
              />
            </div>

            {/* Precio & Unidad */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                  Precio (S/ PEN)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-neutral-400 font-bold">S/</span>
                  <input
                    type="number"
                    step="0.50"
                    min="1"
                    required
                    value={priceSol}
                    onChange={(e) => setPriceSol(e.target.value)}
                    placeholder="4.50"
                    className="w-full rounded-xl bg-[var(--surface-subtle)] border-none pl-8 pr-3 py-2.5 text-xs font-bold text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[var(--accent-yellow)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                  Unidad / Medida
                </label>
                <input
                  type="text"
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  placeholder="por unidad / por hora"
                  className="w-full rounded-xl bg-[var(--surface-subtle)] border-none px-3 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[var(--accent-yellow)]"
                />
              </div>
            </div>

            {/* Punto de Encuentro / Modalidad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                  Modalidad de Entrega
                </label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                  className="w-full rounded-xl bg-[var(--surface-subtle)] border-none px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-yellow)]"
                >
                  <option value="CAMPUS_MEET">Encuentro en Campus</option>
                  <option value="VIRTUAL">Digital / Virtual</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                  Punto de encuentro / Enlace
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={campusLocation}
                    onChange={(e) => setCampusLocation(e.target.value)}
                    placeholder="Ej. Biblioteca Torre A Piso 3"
                    className="w-full rounded-xl bg-[var(--surface-subtle)] border-none pl-8 pr-3 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[var(--accent-yellow)]"
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp Contact & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                  WhatsApp de Contacto
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="51987654321"
                    className="w-full rounded-xl bg-[var(--surface-subtle)] border-none pl-8 pr-3 py-2.5 text-xs text-white font-mono placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[var(--accent-yellow)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                  Etiquetas (separadas por coma)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Caliente, Casero, Ají"
                    className="w-full rounded-xl bg-[var(--surface-subtle)] border-none pl-8 pr-3 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[var(--accent-yellow)]"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-muted)] text-neutral-400 hover:text-white font-bold transition shadow-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[var(--accent-yellow)] hover:bg-[var(--accent-yellow-hover)] text-black font-black transition active:scale-95 shadow-none flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                <span>{isSubmitting ? 'Publicando...' : 'Publicar Ahora'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

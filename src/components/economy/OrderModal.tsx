'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MessageCircle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  X, 
  CreditCard, 
  Copy, 
  Check, 
  ExternalLink,
  Lock,
  Loader2
} from 'lucide-react';
import { AcademicServiceRow } from '@/types/economy';
import { createEscrowOrderInDb } from '@/lib/supabase/marketplace-service';

interface OrderModalProps {
  listing: AcademicServiceRow;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ listing, isOpen, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState<'YAPE' | 'PLIN' | 'CASH'>('YAPE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!isOpen) return null;

  const phone = listing.whatsapp_phone || '51987654321';
  const cleanPhone = phone.replace(/\D/g, '');
  const priceFormatted = (listing.price_cents / 100).toFixed(2);
  const sellerName = listing.mentor?.full_name || 'Compañero UTP';

  const defaultWaMessage = encodeURIComponent(
    `¡Hola ${sellerName}! Vi tu publicación "${listing.title}" en el Campus Marketplace UTP (S/ ${priceFormatted}). ¿Sigue disponible para coordinar?`
  );
  const waUrl = `https://wa.me/${cleanPhone.startsWith('51') ? cleanPhone : '51' + cleanPhone}?text=${defaultWaMessage}`;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(cleanPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCreateOrder = async () => {
    setIsSubmitting(true);
    await createEscrowOrderInDb({
      serviceId: listing.id,
      amountCents: listing.price_cents,
      paymentMethod,
    });
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-6 space-y-5 shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--accent-lime)]" />
            <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
              Coordinar Pedido / Servicio
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
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95">
            <CheckCircle2 className="h-12 w-12 text-[var(--accent-lime)] mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">¡Trato Registrado con Éxito!</h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Tu solicitud quedó anotada. Ahora contacta a <strong className="text-white">{sellerName}</strong> por WhatsApp para acordar la hora y entrega exacta.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-emerald)] hover:bg-[#059669] py-3 text-xs font-black text-black transition active:scale-95 shadow-none"
              >
                <MessageCircle className="h-4 w-4 fill-current" />
                <span>Abrir WhatsApp con mensaje listo</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-bold text-neutral-400 hover:text-white transition"
              >
                Listo, cerrar ventana
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Listing Summary (Flat, No Card-ception) */}
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white leading-snug">
                {listing.title}
              </h3>
              <p className="text-xs text-neutral-400 line-clamp-2">
                {listing.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-neutral-300">
                <span className="flex items-center gap-1 text-[var(--accent-yellow)] font-bold">
                  S/ {priceFormatted} <span className="text-[11px] text-neutral-400 font-normal">({listing.unit_label || 'unidad'})</span>
                </span>
                {listing.campus_location && (
                  <span className="flex items-center gap-1 text-neutral-400">
                    <MapPin className="h-3.5 w-3.5 text-[var(--accent-orange)]" />
                    <span>{listing.campus_location}</span>
                  </span>
                )}
                {listing.duration_minutes && (
                  <span className="flex items-center gap-1 text-neutral-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{listing.duration_minutes} min</span>
                  </span>
                )}
              </div>
            </div>

            {/* Seller Contact Strip */}
            <div className="flex items-center justify-between py-3 border-y border-[var(--border-subtle)] text-xs">
              <div>
                <p className="font-bold text-white">{sellerName}</p>
                <p className="text-[11px] text-neutral-400">{listing.mentor?.career} · {listing.mentor?.campus}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-neutral-300">{phone}</span>
                <button
                  onClick={handleCopyPhone}
                  className="p-1.5 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--surface-muted)] text-neutral-400 hover:text-white transition"
                  title="Copiar número"
                >
                  {copiedPhone ? <Check className="h-3.5 w-3.5 text-[var(--accent-lime)]" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Canal de Pago Preferido */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                Método de pago preferido:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('YAPE')}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'YAPE'
                      ? 'bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)] border border-[var(--badge-purple-border)]'
                      : 'bg-[var(--surface-subtle)] text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Yape</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('PLIN')}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'PLIN'
                      ? 'bg-[var(--badge-cyan-bg)] text-[var(--badge-cyan-text)] border border-[var(--badge-cyan-border)]'
                      : 'bg-[var(--surface-subtle)] text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Plin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'CASH'
                      ? 'bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-text)] border border-[var(--badge-emerald-border)]'
                      : 'bg-[var(--surface-subtle)] text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Efectivo</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-emerald)] hover:bg-[#059669] py-2.5 text-xs font-black text-black transition active:scale-95 shadow-none"
              >
                <MessageCircle className="h-4 w-4 fill-current" />
                <span>Pedir por WhatsApp</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent-yellow)] hover:bg-[var(--accent-yellow-hover)] py-2.5 text-xs font-black text-black transition active:scale-95 shadow-none"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
                <span>{isSubmitting ? 'Guardando...' : 'Trato Seguro Escrow'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

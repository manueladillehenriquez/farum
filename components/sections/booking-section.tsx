"use client";

import { useMemo, useState } from "react";
import { Check, Clock, MapPin, Video } from "lucide-react";
import { siteConfig, waLink } from "@/lib/site-config";

const STORAGE_KEY = "farum_bookings_v1";

type Modality = "Presencial" | "Zoom";

function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayStr() {
  return fmtDate(new Date());
}

function slotsForDay(dow: number): { times: string[]; modality: Modality | null } {
  // 0 = domingo, 6 = sábado
  if (dow >= 1 && dow <= 5) {
    return { times: ["11:00", "12:00", "13:00", "14:00", "15:00"], modality: "Presencial" };
  }
  if (dow === 6) {
    return { times: ["10:00", "11:00", "12:00", "13:00", "14:00"], modality: "Zoom" };
  }
  return { times: [], modality: null };
}

function loadTaken(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveTaken(data: Record<string, string[]>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage puede fallar en modo privado; no es crítico acá.
  }
}

export function BookingSection() {
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const dayInfo = useMemo(() => {
    if (!date) return null;
    const [y, m, d] = date.split("-").map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    return slotsForDay(dow);
  }, [date]);

  const takenToday = useMemo(() => {
    void refreshKey; // fuerza recalcular tras confirmar una reserva
    if (!date) return [];
    return loadTaken()[date] || [];
  }, [date, refreshKey]);

  function handleDateChange(value: string) {
    setDate(value);
    setSelectedSlot(null);
    setSuccess(false);
  }

  function handleConfirm() {
    if (!selectedSlot || !date || !dayInfo?.modality) return;
    if (!name.trim() || !phone.trim()) {
      alert("Por favor completa tu nombre y tu WhatsApp de contacto.");
      return;
    }

    const taken = loadTaken();
    taken[date] = [...(taken[date] || []), selectedSlot];
    saveTaken(taken);

    const modalidadTxt =
      dayInfo.modality === "Presencial"
        ? `presencial en ${siteConfig.address.street}, ${siteConfig.address.comuna}`
        : "por videollamada Zoom";

    const msg =
      `Hola ${siteConfig.businessName}, quiero agendar una reunión ${modalidadTxt} el ${date} a las ${selectedSlot}.\n` +
      `Nombre: ${name}\nWhatsApp: ${phone}` +
      (note ? `\nSobre mi negocio: ${note}` : "");

    window.open(waLink(msg), "_blank");
    setSuccess(true);
    setRefreshKey((k) => k + 1);
  }

  const isToday = date === todayStr();
  const nowHour = new Date().getHours();

  return (
    <section id="agenda" className="border-t border-border bg-background py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Agenda tu reunión
          </p>
          <h2 className="mt-3 font-instrument-serif text-3xl text-foreground sm:text-4xl">
            Reserva tu hora, presencial o por Zoom
          </h2>
          <p className="mt-4 text-muted-foreground">
            Elige el día y la hora que más te acomode. Los cupos ocupados se
            bloquean automáticamente.
          </p>
        </div>

        <div className="grid gap-8 rounded-2xl border border-border bg-card p-8 md:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-foreground">¿Cómo funciona?</h3>
            <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 flex-none text-accent" />
              <span>
                {siteConfig.address.street}, {siteConfig.address.comuna}{" "}
                (reuniones presenciales)
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Clock className="mt-0.5 h-4 w-4 flex-none text-accent" />
              <span>{siteConfig.hours.weekdays} (1 cupo por hora)</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Video className="mt-0.5 h-4 w-4 flex-none text-accent" />
              <span>{siteConfig.hours.saturday}</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 flex-none text-accent" />
              <span>Confirmamos tu hora por WhatsApp apenas la reservas</span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground" htmlFor="booking-date">
              Elige el día
            </label>
            <input
              id="booking-date"
              type="date"
              min={todayStr()}
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
            />

            <div className="mt-5 mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Horarios disponibles
              </span>
              {dayInfo?.modality && (
                <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                  {dayInfo.modality === "Presencial"
                    ? "Presencial · Providencia"
                    : "Videollamada Zoom"}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
              {!date && (
                <span className="col-span-full text-sm text-muted-foreground">
                  Selecciona una fecha para ver los cupos disponibles.
                </span>
              )}
              {date && dayInfo && dayInfo.times.length === 0 && (
                <span className="col-span-full text-sm text-muted-foreground">
                  Cerrado los domingos. Elige otro día 🙂
                </span>
              )}
              {date &&
                dayInfo?.times.map((t) => {
                  const isTaken = takenToday.includes(t);
                  const isPast = isToday && parseInt(t.split(":")[0], 10) <= nowHour;
                  const disabled = isTaken || isPast;
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={disabled}
                      title={
                        isTaken
                          ? "Este horario ya está reservado"
                          : isPast
                            ? "Este horario ya pasó"
                            : undefined
                      }
                      onClick={() => {
                        setSelectedSlot(t);
                        setSuccess(false);
                      }}
                      className={`rounded-lg border px-2 py-2.5 text-center text-sm font-semibold transition-colors ${
                        disabled
                          ? "cursor-not-allowed border-border text-muted-foreground line-through opacity-40"
                          : selectedSlot === t
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border text-foreground hover:border-accent hover:text-accent"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
            </div>

            {selectedSlot && (
              <div className="mt-6 flex flex-col gap-3 animate-fade-slide-in-1">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted-foreground" htmlFor="booking-name">
                    Nombre
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted-foreground" htmlFor="booking-phone">
                    WhatsApp de contacto
                  </label>
                  <input
                    id="booking-phone"
                    type="tel"
                    placeholder="+56 9 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted-foreground" htmlFor="booking-note">
                    Cuéntanos brevemente tu negocio (opcional)
                  </label>
                  <input
                    id="booking-note"
                    type="text"
                    placeholder="Ej: Tengo una peluquería en Providencia"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--whatsapp)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--whatsapp-dark)]"
                >
                  Confirmar por WhatsApp
                </button>
              </div>
            )}

            {success && (
              <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-foreground">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" />
                <span>
                  ¡Listo! Se abrió WhatsApp con tu solicitud de hora. Confírmala
                  enviando el mensaje y te responderemos a la brevedad.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

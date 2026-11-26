'use client'

import React, { useRef, useState } from 'react'
import { BedDouble, CalendarDays, Users, ExternalLink, MoonStar, Flag } from 'lucide-react'
import { generateStay22AllezLink } from '../utils/stay22'
import { StayDates, formatShortDate, toISODate } from '../utils/tripStays'

export interface StayOption {
  /** 'destination' or 'night-<n>' */
  key: string
  /** Short label for the chip, e.g. "Night 1" or "Destination" */
  title: string
  /** Place name, e.g. "Lincoln, NE" (may be empty while loading) */
  placeName: string
  /** Extra context, e.g. "~8h / 480 mi in" */
  detail?: string
  lat: number
  lng: number
  /** Stay22-friendly address (e.g. "Lincoln, NE"); preferred over lat/lng when set */
  address?: string
  /** Whether the Stay22 map can show this place */
  mapStatus: 'resolving' | 'ready' | 'unavailable'
  dates: StayDates | null
}

interface WhereToStayPanelProps {
  options: StayOption[]
  selectedKey: string
  onSelect: (key: string) => void
  departureDate: string
  onDepartureDateChange: (date: string) => void
  destinationNights: number
  onDestinationNightsChange: (n: number) => void
  adults: number
  onAdultsChange: (n: number) => void
}

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'

/**
 * "Where to stay" panel shown above the Stay22 hotel map after a calculation.
 * Lets the traveller pick which night they're booking (overnight stop on a long
 * drive, or the destination) and passes real dates + guest count to Stay22 so
 * prices and bookings match the actual trip.
 */
export default function WhereToStayPanel({
  options,
  selectedKey,
  onSelect,
  departureDate,
  onDepartureDateChange,
  destinationNights,
  onDestinationNightsChange,
  adults,
  onAdultsChange,
}: WhereToStayPanelProps) {
  const dateRef = useRef<HTMLInputElement>(null)
  const [nudge, setNudge] = useState(false)
  const selected = options.find((o) => o.key === selectedKey) || options[options.length - 1]
  if (!selected) return null

  const hasDates = Boolean(selected.dates)
  const nightsOnRoad = options.length - 1
  const placeLabel = selected.placeName || (selected.key === 'destination' ? 'your destination' : 'this stop')

  const bookingUrl = generateStay22AllezLink({
    // A resolved town ("Lincoln, NE") beats the raw stop point, which may sit
    // between towns; otherwise use exact coordinates.
    lat: selected.address ? undefined : selected.lat,
    lng: selected.address ? undefined : selected.lng,
    address: selected.address || selected.placeName || undefined,
    checkin: selected.dates?.checkin,
    checkout: selected.dates?.checkout,
    adults,
    campaign: selected.key === 'destination' ? 'roadtrip_stay_dest' : 'roadtrip_stay_stop',
  })

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Bookings without real dates are the ones that get cancelled — ask for the
    // date first instead of sending the traveller off with default dates.
    if (!hasDates) {
      e.preventDefault()
      setNudge(true)
      dateRef.current?.focus()
      try {
        ;(dateRef.current as any)?.showPicker?.()
      } catch {
        /* showPicker not supported — focus is enough */
      }
    }
  }

  return (
    <div className="text-left" data-testid="where-to-stay">
      <div className="flex items-center gap-2 mb-1">
        <BedDouble className="h-5 w-5 text-blue-600 shrink-0" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Where to stay</h3>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        {nightsOnRoad > 0
          ? `This drive is long enough for ${nightsOnRoad === 1 ? 'an overnight stop' : `${nightsOnRoad} overnight stops`}. Pick a night to see hotels there.`
          : 'Live hotel prices near your destination.'}
      </p>

      {options.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 -mx-1 px-1" role="tablist" aria-label="Choose which night to book">
          {options.map((o) => {
            const active = o.key === selected.key
            const Icon = o.key === 'destination' ? Flag : MoonStar
            return (
              <button
                key={o.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelect(o.key)}
                className={`shrink-0 rounded-lg border px-3 py-2 text-left transition-colors ${
                  active
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
                  <Icon className="h-3.5 w-3.5" />
                  {o.title}
                </span>
                <span className="block text-sm font-medium">{o.placeName || 'Finding town…'}</span>
                {o.detail && <span className="block text-xs text-gray-500">{o.detail}</span>}
              </button>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        <label className="col-span-2 sm:col-span-1 block">
          <span className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
            <CalendarDays className="h-3.5 w-3.5" /> Departure date
          </span>
          <input
            ref={dateRef}
            id="trip-departure-date"
            type="date"
            min={toISODate(new Date())}
            value={departureDate}
            onChange={(e) => {
              onDepartureDateChange(e.target.value)
              if (e.target.value) setNudge(false)
            }}
            className={`${inputClass} ${nudge && !departureDate ? 'border-amber-500 ring-2 ring-amber-200' : ''}`}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-700 mb-1 block">Nights at destination</span>
          <select
            id="trip-destination-nights"
            value={destinationNights}
            onChange={(e) => onDestinationNightsChange(Number(e.target.value))}
            className={inputClass}
          >
            {Array.from({ length: 14 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'night' : 'nights'}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
            <Users className="h-3.5 w-3.5" /> Guests
          </span>
          <select
            id="trip-guests"
            value={adults}
            onChange={(e) => onAdultsChange(Number(e.target.value))}
            className={inputClass}
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'adult' : 'adults'}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <p className={`text-sm ${hasDates ? 'text-gray-700' : nudge ? 'text-amber-700 font-medium' : 'text-gray-500'}`}>
          {hasDates && selected.dates ? (
            <>
              <span className="font-medium text-gray-900">{placeLabel}</span>:{' '}
              {formatShortDate(selected.dates.checkin)} → {formatShortDate(selected.dates.checkout)} · {adults}{' '}
              {adults === 1 ? 'adult' : 'adults'}
            </>
          ) : (
            'Add your departure date so prices match the nights you actually need.'
          )}
        </p>
        <a
          href={bookingUrl}
          target="_blank"
          rel="sponsored noopener"
          onClick={handleCtaClick}
          className="sm:ml-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 whitespace-nowrap"
          data-testid="stay-cta"
        >
          {hasDates ? `Check prices in ${placeLabel.split(',')[0]}` : 'Choose dates to see prices'}
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <p className="mt-2 text-xs text-gray-500">Or browse the map below — tap any price to see the hotel.</p>
    </div>
  )
}

'use client';
import { useState, useEffect, useRef } from 'react';
import { eventYear, eventMonth, isSelectableMonth, lastSelectableDate } from '../lib/constants';

const MONTHS_FULL_GU = ['જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'];
const DAYS_GU = ['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'];
const MIN_DAYS = 5;

function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fromYMD(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isEventDate(date) {
  return !!date && isSelectableMonth(date.getFullYear(), date.getMonth());
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const total = getDaysInMonth(year, month);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));
  return cells;
}

export default function DateRangePicker({ fromDate, toDate, onChange }) {
  const [open, setOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState(null);
  const [selecting, setSelecting] = useState('from'); // 'from' | 'to'
  const ref = useRef(null);

  const from = fromYMD(fromDate);
  const to = fromYMD(toDate);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleDayClick(date) {
    if (!isEventDate(date)) return;
    if (selecting === 'from' || !from) {
      onChange(toYMD(date), '');
      setSelecting('to');
    } else {
      // second click
      if (date <= from) {
        // re-start from this date
        onChange(toYMD(date), '');
        setSelecting('to');
        return;
      }
      const diffDays = Math.round((date - from) / (1000 * 60 * 60 * 24));
      if (diffDays < MIN_DAYS - 1) {
        // Auto-extend to minimum, never past the last selectable day
        const minTo = new Date(from);
        minTo.setDate(minTo.getDate() + MIN_DAYS - 1);
        const lastDay = lastSelectableDate();
        if (minTo > lastDay) minTo.setTime(lastDay.getTime());
        onChange(toYMD(from), toYMD(minTo));
      } else {
        onChange(toYMD(from), toYMD(date));
      }
      setSelecting('from');
      setOpen(false);
    }
  }

  function isInRange(date) {
    if (!date) return false;
    const start = from;
    const end = to || hoverDate;
    if (!start || !end) return false;
    const lo = start <= end ? start : end;
    const hi = start <= end ? end : start;
    return date > lo && date < hi;
  }

  function isStart(date) { return date && from && sameDay(date, from); }
  function isEnd(date) { return date && to && sameDay(date, to); }

  const cells = buildCalendarDays(eventYear, eventMonth);

  // Minimum 5 days hint for hover
  function getMinEnd() {
    if (!from || selecting !== 'to') return null;
    const d = new Date(from);
    d.setDate(d.getDate() + MIN_DAYS - 1);
    return d;
  }
  const minEnd = getMinEnd();

  function isDimmed(date) {
    if (!date) return false;
    if (selecting === 'to' && from && date > from && minEnd && date < minEnd) return true;
    return false;
  }

  return (
    <div className="drp-wrap" ref={ref}>
      <label className="drp-label">સેવાની તારીખ :</label>
      <div
        className={`drp-trigger${open ? ' open' : ''}`}
        onClick={() => { setOpen(o => !o); setSelecting(from && !to ? 'to' : 'from'); }}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}
      >
        <span className="drp-icon">📅</span>
        {from && to ? (
          <span className="drp-range-text">
            <span className="drp-from">{fromDate}</span>
            <span className="drp-arrow">→</span>
            <span className="drp-to">{toDate}</span>
            {(() => { const d = Math.round((to - from) / (1000 * 60 * 60 * 24)); return <span className="drp-days-badge">{d + 1} દિવસ</span>; })()}
          </span>
        ) : from ? (
          <span className="drp-range-text drp-partial"><span className="drp-from">{fromDate}</span><span className="drp-arrow">→ ?</span></span>
        ) : (
          <span className="drp-placeholder">તારીખ પસંદ કરો (ડિસેમ્બર ૨૦૨૬)</span>
        )}
        <span className="drp-chevron">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="drp-popup">
          <div className="drp-hint">
            {selecting === 'from' ? '📌 શરૂઆતની તારીખ પસંદ કરો' : `📌 સમાપ્તિ તારીખ પસંદ કરો (ઓછામાં ઓછી ${MIN_DAYS} દિવસ)`}
          </div>

          <div className="drp-cal">
            <div className="drp-nav">
              <button type="button" className="drp-nav-btn" disabled aria-hidden="true">‹</button>
              <span className="drp-month-title">{MONTHS_FULL_GU[eventMonth]} {eventYear}</span>
              <button type="button" className="drp-nav-btn" disabled aria-hidden="true">›</button>
            </div>

            <div className="drp-grid">
              {DAYS_GU.map(d => <div key={d} className="drp-day-name">{d}</div>)}
              {cells.map((date, i) => {
                const start = isStart(date);
                const end = isEnd(date);
                const inRange = isInRange(date);
                const dimmed = isDimmed(date);
                let cls = 'drp-cell';
                if (!date) cls += ' drp-empty';
                if (start) cls += ' drp-start';
                if (end) cls += ' drp-end';
                if (inRange) cls += ' drp-in-range';
                if (dimmed) cls += ' drp-dimmed';
                return (
                  <div
                    key={i}
                    className={cls}
                    onClick={() => handleDayClick(date)}
                    onMouseEnter={() => setHoverDate(date)}
                    onMouseLeave={() => setHoverDate(null)}
                  >
                    {date ? date.getDate() : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {from && to && (
            <div className="drp-footer">
              <button type="button" className="drp-clear" onClick={() => { onChange('', ''); setSelecting('from'); }}>સાફ કરો</button>
              <button type="button" className="drp-confirm" onClick={() => setOpen(false)}>✓ ઓ.કે.</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

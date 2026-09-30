'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PrintPage({ params }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const searchParams = useSearchParams();
  const autoPrint = searchParams.get('autoprint') === '1';

  useEffect(() => {
    fetch(`/api/submissions/${params.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Unauthorized / not found');
        const json = await res.json();
        setData(json);
      })
      .catch((err) => { setError(err.message); });
  }, [params.id]);

  // auto-print once data is loaded
  useEffect(() => {
    if (autoPrint && data) {
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, [autoPrint, data]);

  if (error) {
    return <div className="no-print">{error}</div>;
  }

  if (!data) {
    return <div className="no-print">Loading...</div>;
  }

  const hasBhojanalay =
    Array.isArray(data.departments) &&
    data.departments.includes('ભોજનાલય વિભાગ');

  return (
    <>
      <div className="no-print print-toolbar">
        <button
          className="print-btn"
          onClick={() => window.print()}
        >
          🖨 Print
        </button>
      </div>

      <div className="print-page">

        {/* Original form */}
        <img
          src="/swayamsevak-form-template.png"
          alt="સ્વયંસેવક ફોર્મ"
          className="template"
        />

        {/* =================================
            અટક
        ================================= */}
        <PrintText
          value={data.surname}
          left="13.2%"
          top="28.50%"
          width="16%"
        />

        {/* =================================
            નામ
        ================================= */}
        <PrintText
          value={data.name}
          left="37.5%"
          top="28.50%"
          width="30%"
        />

        {/* =================================
            પિતાનું નામ
        ================================= */}
        <PrintText
          value={data.fatherName}
          left="21.0%"
          top="31.40%"
          width="30%"
        />

        {/* =================================
            ગામ
        ================================= */}
        <PrintText
          value={data.village}
          left="54.8%"
          top="31.40%"
          width="15%"
        />

        {/* =================================
            સરનામું
        ================================= */}
        <PrintText
          value={data.address}
          left="15.5%"
          top="34.30%"
          width="52%"
        />

        {/* =================================
            મોબાઇલ નંબર
        ================================= */}
        <PrintText
          value={data.mobile}
          left="14.0%"
          top="40.60%"
          width="30%"
        />

        {/* =================================
            ઉંમર
        ================================= */}
        <PrintText
          value={data.age}
          left="12.8%"
          top="43.80%"
          width="14%"
        />

        {/* =================================
            SHIRT SIZE CHECKBOXES
        ================================= */}

        <ShirtCheckbox
          selected={data.shirtSize}
          value="38"
          left="41.05%"
          top="44.0%"
        />

        <ShirtCheckbox
          selected={data.shirtSize}
          value="40"
          left="46.29%"
          top="44.0%"
        />

        <ShirtCheckbox
          selected={data.shirtSize}
          value="42"
          left="51.45%"
          top="44.0%"
        />

        <ShirtCheckbox
          selected={data.shirtSize}
          value="44"
          left="56.57%"
          top="44.0%"
        />

        <ShirtCheckbox
          selected={data.shirtSize}
          value="46"
          left="61.69%"
          top="44.0%"
        />

        <ShirtCheckbox
          selected={data.shirtSize}
          value="48"
          left="66.85%"
          top="44.0%"
        />

        {/* =================================
            SERVICE DATE - FROM
        ================================= */}

        <PrintText
          value={formatShortDate(data.fromDate)}
          left="11.0%"
          top="52.30%"
          width="6.9%"
          center
        />

        {/* =================================
            SERVICE DATE - TO
        ================================= */}

        <PrintText
          value={formatShortDate(data.toDate)}
          left="29.2%"
          top="52.30%"
          width="8.1%"
          center
        />

        {/* =================================
            DEPARTMENT
            ONLY BHOJANALAY
        ================================= */}

        {hasBhojanalay && (
          <DepartmentCheckbox
            left="30.75%"
            top="65.40%"
          />
        )}

        {/* =================================
            OTHER DEPARTMENT
        ================================= */}

        <PrintText
          value={data.otherDepartment}
          left="24%"
          top="75.87%"
          width="52%"
        />

        {/* =================================
            SANT NAME
        ================================= */}

        <PrintText
          value={data.santName}
          left="14.5%"
          top="82.20%"
          width="48%"
        />

        {/* =================================
            SANT MOBILE
        ================================= */}

        <PrintText
          value={data.santMobile}
          left="71.0%"
          top="82.20%"
          width="25%"
        />

        {/* =================================
            PASSPORT PHOTO
        ================================= */}

        {data.photoData && (
          <img
            src={data.photoData}
            alt="પાસપોર્ટ સાઈઝ ફોટો"
            className="print-photo"
          />
        )}
      </div>
    </>
  );
}


/* =========================================
   TEXT
========================================= */

function PrintText({
  value,
  left,
  top,
  width,
  center = false
}) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  return (
    <div
      className={`print-value ${center ? 'center' : ''}`}
      style={{
        left,
        top,
        width
      }}
    >
      {value}
    </div>
  );
}


/* =========================================
   SHIRT CHECKBOX
========================================= */

function ShirtCheckbox({
  selected,
  value,
  left,
  top
}) {
  if (String(selected) !== String(value)) {
    return null;
  }

  return (
    <div
      className="shirt-checkbox"
      style={{
        left,
        top
      }}
    >
      ✓
    </div>
  );
}


/* =========================================
   DEPARTMENT CHECKBOX
========================================= */

function DepartmentCheckbox({
  left,
  top
}) {
  return (
    <div
      className="department-checkbox"
      style={{
        left,
        top
      }}
    >
      ✓
    </div>
  );
}


/* =========================================
   DATE
   Original form already contains / / 2025
   So only DD/MM is printed.
========================================= */

function formatShortDate(value) {
  if (!value) {
    return '';
  }

  const parts = value.split('-');

  if (parts.length !== 3) {
    return value;
  }

  const [, month, day] = parts;

  return `${day}/${month}`;
}
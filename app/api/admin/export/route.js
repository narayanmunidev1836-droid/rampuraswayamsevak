import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import ExcelJS from 'exceljs';
import { verifyAdminToken } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/db';
import Submission from '../../../../lib/model';

export const runtime = 'nodejs';

const COLUMNS = [
  { header: 'ક્રમ નં.', key: 'sr', width: 12 },
  { header: 'અટક', key: 'surname', width: 12 },
  { header: 'નામ', key: 'name', width: 14 },
  { header: 'પિતાનું નામ', key: 'fatherName', width: 16 },
  { header: 'ગામ', key: 'village', width: 14 },
  { header: 'સરનામું', key: 'address', width: 32 },
  { header: 'મોબાઈલ નં.', key: 'mobile', width: 15 },
  { header: 'ઉંમર', key: 'age', width: 7 },
  { header: 'ટી-શર્ટ', key: 'shirtSize', width: 9 },
  { header: 'સેવા તારીખ થી', key: 'fromDate', width: 15 },
  { header: 'સેવા તારીખ સુધી', key: 'toDate', width: 15 },
  { header: 'વિભાગ', key: 'departments', width: 22 },
  { header: 'અન્ય વિભાગ', key: 'otherDepartment', width: 18 },
  { header: 'સેવા પ્રકાર', key: 'sevaType', width: 24 },
  { header: 'સંત નામ', key: 'santName', width: 16 },
  { header: 'સંત મોબાઈલ', key: 'santMobile', width: 15 },
  { header: 'નોંધણી તારીખ', key: 'createdAt', width: 20 },
];

const PHOTO_W = 58;
const PHOTO_H = 70;
const ROW_H = 78; // points

const IST = 'Asia/Kolkata';

function fmtDateTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('en-IN', {
    timeZone: IST,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function GET() {
  const token = cookies().get('admin_token')?.value;
  if (!(await verifyAdminToken(token || ''))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const rows = await Submission.find().sort({ createdAt: -1 }).lean();

  const wb = new ExcelJS.Workbook();
  wb.creator = 'ધોલેરાધામ સ્વયંસેવક';
  wb.created = new Date();

  // ── Main data sheet ──────────────────────────────────────────
  const ws = wb.addWorksheet('સ્વયંસેવક યાદી', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  ws.columns = COLUMNS;

  const header = ws.getRow(1);
  header.height = 30;
  header.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' }, name: 'Noto Sans Gujarati' };
  header.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8E1F0A' } };
  header.eachCell(cell => {
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF5A1B06' } },
      left: { style: 'thin', color: { argb: 'FF5A1B06' } },
      bottom: { style: 'thin', color: { argb: 'FF5A1B06' } },
      right: { style: 'thin', color: { argb: 'FF5A1B06' } },
    };
  });

  const thin = { style: 'hair', color: { argb: 'FFE8DDD6' } };
  const border = { top: thin, left: thin, bottom: thin, right: thin };

  rows.forEach((r, i) => {
    const excelRowNo = i + 2;
    const row = ws.addRow({
      sr: i + 1,
      surname: r.surname || '',
      name: r.name || '',
      fatherName: r.fatherName || '',
      village: r.village || '',
      address: r.address || '',
      mobile: r.mobile || '',
      age: /^\d+$/.test(r.age || '') ? Number(r.age) : (r.age || ''),
      shirtSize: r.shirtSize || '',
      fromDate: r.fromDate || '',
      toDate: r.toDate || '',
      departments: Array.isArray(r.departments) ? r.departments.join(', ') : (r.departments || ''),
      otherDepartment: r.otherDepartment || '',
      sevaType: Array.isArray(r.sevaType) ? r.sevaType.join(', ') : (r.sevaType || ''),
      santName: r.santName || '',
      santMobile: r.santMobile || '',
      createdAt: fmtDateTime(r.createdAt),
    });

    row.height = ROW_H;
    row.font = { size: 10, name: 'Noto Sans Gujarati' };
    row.alignment = { vertical: 'middle', wrapText: true };
    row.eachCell({ includeEmpty: true }, cell => {
      cell.border = border;
      if (cell.value === '' || cell.value === null || cell.value === undefined) {
        cell.value = cell.value === 0 ? cell.value : '';
      }
    });

    // Serial number sits in the bottom-right corner so the photo can float above it.
    const srCell = row.getCell(1);
    srCell.alignment = { vertical: 'bottom', horizontal: 'right', indent: 1 };
    srCell.font = { size: 9, color: { argb: 'FFA08070' }, name: 'Noto Sans Gujarati' };

  });

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLUMNS.length } };

  // ── Summary sheet ────────────────────────────────────────────
  const sum = wb.addWorksheet('સારાંશ');
  sum.columns = [
    { header: 'વિગત', key: 'label', width: 34 },
    { header: 'સંખ્યા', key: 'value', width: 18 },
  ];

  const sumHeader = sum.getRow(1);
  sumHeader.height = 26;
  sumHeader.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' }, name: 'Noto Sans Gujarati' };
  sumHeader.alignment = { vertical: 'middle', horizontal: 'center' };
  sumHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8E1F0A' } };

  const byVillage = {};
  const bySize = {};
  let withPhoto = 0;
  rows.forEach(r => {
    if (r.village) byVillage[r.village] = (byVillage[r.village] || 0) + 1;
    if (r.shirtSize) bySize[r.shirtSize] = (bySize[r.shirtSize] || 0) + 1;
    if (r.photoData) withPhoto += 1;
  });

  const summaryRows = [
    ['કુલ ફોર્મ સંખ્યા', rows.length],
    ['ફોટો સાથેના સ્વયંસેવક', withPhoto],
    ['ફોટો વગરના સ્વયંસેવક', rows.length - withPhoto],
    ['', ''],
    ['— ગામ પ્રમાણે —', ''],
    ...Object.entries(byVillage).sort((a, b) => b[1] - a[1]).map(([k, v]) => [`ગામ: ${k}`, v]),
    ['', ''],
    ['— ટી-શર્ટ પ્રમાણે —', ''],
    ...Object.entries(bySize).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => [`ટી-શર્ટ: ${k}`, v]),
  ];

  summaryRows.forEach(([label, value]) => {
    const row = sum.addRow({ label, value });
    row.font = { size: 10, name: 'Noto Sans Gujarati' };
    row.alignment = { vertical: 'middle' };
    if (label.startsWith('—')) {
      row.font = { size: 10, bold: true, name: 'Noto Sans Gujarati' };
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDF0EA' } };
    }
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const buffer = await wb.xlsx.writeBuffer();
  const stamp = fmtDateTime(new Date()).replace(/[\/: ]/g, '-');

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="swayamsevak-${stamp}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
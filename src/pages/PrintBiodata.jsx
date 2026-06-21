import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Row({ label, value, wide }) {
  return (
    <tr className={wide ? 'col-span-2' : ''}>
      <td className="py-1 pr-2 text-sm align-top w-44 font-medium">{label}</td>
      <td className="py-1 pr-2 text-sm align-top w-4">:</td>
      <td className="py-1 text-sm align-top">{value || '-'}</td>
    </tr>
  );
}

export default function PrintBiodata() {
  const [student, setStudent] = useState(null);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    async function load() {
      const [schools, s] = await Promise.all([
        base44.entities.SchoolInfo.list(),
        id ? base44.entities.Student.filter({ id }) : Promise.resolve([]),
      ]);
      setSchool(schools[0] || null);
      setStudent(s[0] || null);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!student) {
    return <div className="flex items-center justify-center h-screen text-muted-foreground">Data siswa tidak ditemukan.</div>;
  }

  const formatDate = (d) => {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch { return d; }
  };

  const _fullAddress = [student.street_address, student.village, student.district, student.city, student.province, student.postal_code ? `Kode Pos: ${student.postal_code}` : ''].filter(Boolean).join(', ') || student.address || '-';

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center py-8 print:bg-white print:py-0">
      {/* Print button — hidden when printing */}
      <div className="mb-4 print:hidden">
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="w-4 h-4" /> Cetak / Simpan PDF
        </Button>
      </div>

      {/* A4 Sheet */}
      <div
        className="bg-white shadow-xl print:shadow-none"
        style={{ width: '210mm', minHeight: '297mm', padding: '15mm 20mm', boxSizing: 'border-box', fontFamily: 'Times New Roman, serif', position: 'relative' }}
      >
        {/* Outer border frame */}
        <div style={{ border: '3px solid #000', minHeight: 'calc(297mm - 30mm)', padding: '10mm', display: 'flex', flexDirection: 'column' }}>

          {/* School Header */}
          <div style={{ borderBottom: '3px double #000', paddingBottom: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            {school?.logo_url && (
              <img src={school.logo_url} alt="Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
            )}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase' }}>{school?.school_name || 'NAMA SEKOLAH'}</div>
              <div style={{ fontSize: '9pt', marginTop: '2px' }}>{school?.address || ''}</div>
              {(school?.phone || school?.email) && (
                <div style={{ fontSize: '9pt' }}>
                  {school?.phone ? `Telp. ${school.phone}` : ''}{school?.phone && school?.email ? ' | ' : ''}{school?.email || ''}
                </div>
              )}
              {school?.npsn && <div style={{ fontSize: '9pt' }}>NPSN: {school.npsn}</div>}
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '14pt', fontWeight: 'bold', letterSpacing: '1px', textDecoration: 'underline', textTransform: 'uppercase' }}>
              LEMBAR BIODATA SISWA
            </div>
            <div style={{ fontSize: '10pt', marginTop: '4px' }}>Laporan Hasil Belajar (Rapor) Kurikulum 2013</div>
          </div>

          {/* Photo placeholder + Data Pribadi */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10pt', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                A. Data Pribadi
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <Row label="Nama Lengkap" value={student.full_name} />
                  <Row label="Nama Panggilan" value={student.nickname} />
                  <Row label="NIS" value={student.nis} />
                  <Row label="NISN" value={student.nisn} />
                  <Row label="Tempat, Tgl Lahir" value={`${student.birth_place || '-'}, ${formatDate(student.birth_date)}`} />
                  <Row label="Jenis Kelamin" value={student.gender} />
                  <Row label="Agama" value={student.religion} />
                  <Row label="Kelas" value={student.class_name} />
                </tbody>
              </table>
            </div>
            {/* Photo Box */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '90px', height: '120px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f9f9f9' }}>
                {student.photo_url
                  ? <img src={student.photo_url} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '8pt', color: '#888', textAlign: 'center', padding: '4px' }}>Foto Siswa 3×4</span>
                }
              </div>
              <span style={{ fontSize: '7pt', color: '#555' }}>3 × 4 cm</span>
            </div>
          </div>

          {/* Alamat */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10pt', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              B. Alamat Tempat Tinggal
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <Row label="Jalan / RT / RW" value={student.street_address} />
                <Row label="Desa / Kelurahan" value={student.village} />
                <Row label="Kecamatan" value={student.district} />
                <Row label="Kabupaten / Kota" value={student.city} />
                <Row label="Provinsi" value={student.province} />
                <Row label="Kode Pos" value={student.postal_code} />
              </tbody>
            </table>
          </div>

          {/* Data Orang Tua */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10pt', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              C. Data Orang Tua / Wali
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td colSpan={3} className="pb-1" style={{ fontSize: '9.5pt', fontStyle: 'italic', paddingTop: '4px', paddingBottom: '2px', fontWeight: 'bold' }}>Ayah</td></tr>
                <Row label="Nama Ayah" value={student.father_name} />
                <Row label="Pekerjaan Ayah" value={student.father_job} />
                <tr><td colSpan={3} style={{ fontSize: '9.5pt', fontStyle: 'italic', paddingTop: '8px', paddingBottom: '2px', fontWeight: 'bold' }}>Ibu</td></tr>
                <Row label="Nama Ibu" value={student.mother_name} />
                <Row label="Pekerjaan Ibu" value={student.mother_job} />
                {(student.guardian_name) && (
                  <>
                    <tr><td colSpan={3} style={{ fontSize: '9.5pt', fontStyle: 'italic', paddingTop: '8px', paddingBottom: '2px', fontWeight: 'bold' }}>Wali</td></tr>
                    <Row label="Nama Wali" value={student.guardian_name} />
                    <Row label="Pekerjaan Wali" value={student.guardian_job} />
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Signature area */}
          <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ fontSize: '9.5pt' }}>{student.city || '............'}, ........................ 20.....</div>
              <div style={{ fontSize: '9.5pt', marginTop: '4px' }}>Wali Kelas,</div>
              <div style={{ height: '50px' }}></div>
              <div style={{ borderTop: '1px solid #000', paddingTop: '2px', fontSize: '9.5pt', fontWeight: 'bold' }}>
                (...........................................)
              </div>
              <div style={{ fontSize: '8.5pt' }}>NIP. ......................................</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; background: white; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>
    </div>
  );
}
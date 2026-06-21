import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrintReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams(window.location.search);
      const studentId = params.get('student');
      const classId = params.get('class');
      if (!studentId || !classId) { setLoading(false); return; }

      const [student, classRoom, schoolInfoList, subjects,
        knowledgeGrades, skillGrades, attitudeGrades,
        attendanceList, extracurricularList, homeroomNotes
      ] = await Promise.all([
        base44.entities.Student.filter({ id: studentId }),
        base44.entities.ClassRoom.filter({ id: classId }),
        base44.entities.SchoolInfo.list(),
        base44.entities.Subject.list(),
        base44.entities.KnowledgeGrade.filter({ student_id: studentId, class_id: classId }),
        base44.entities.SkillGrade.filter({ student_id: studentId, class_id: classId }),
        base44.entities.AttitudeGrade.filter({ student_id: studentId, class_id: classId }),
        base44.entities.Attendance.filter({ student_id: studentId, class_id: classId }),
        base44.entities.Extracurricular.filter({ student_id: studentId, class_id: classId }),
        base44.entities.HomeroomNote.filter({ student_id: studentId, class_id: classId }),
      ]);

      setData({
        student: student[0],
        classRoom: classRoom[0],
        schoolInfo: schoolInfoList[0] || {},
        subjects: subjects.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
        knowledgeGrades,
        skillGrades,
        attitude: attitudeGrades[0] || {},
        attendance: attendanceList[0] || {},
        extracurriculars: extracurricularList,
        homeroomNote: homeroomNotes[0] || {},
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!data || !data.student) {
    return <div className="p-8 text-center text-muted-foreground">Data siswa tidak ditemukan.</div>;
  }

  const { student, classRoom, schoolInfo, subjects, knowledgeGrades, skillGrades, attitude, attendance, extracurriculars, homeroomNote } = data;

  const getKG = (subjectId) => knowledgeGrades.find(g => g.subject_id === subjectId);
  const getSG = (subjectId) => skillGrades.find(g => g.subject_id === subjectId);

  const groupedSubjects = {};
  subjects.forEach(s => {
    if (!groupedSubjects[s.group]) groupedSubjects[s.group] = [];
    groupedSubjects[s.group].push(s);
  });

  return (
    <div>
      {/* Print controls - hidden when printing */}
      <div className="print:hidden flex items-center gap-3 p-4 bg-card border-b border-border sticky top-0 z-10">
        <Link to="/report-recap">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Kembali</Button>
        </Link>
        <Button onClick={() => window.print()} size="sm">
          <Printer className="w-4 h-4 mr-1" /> Cetak / PDF
        </Button>
      </div>

      {/* Print-friendly report */}
      <div className="max-w-[210mm] mx-auto bg-white text-black p-8 print:p-6 print:m-0 print:shadow-none shadow-lg my-4 print:my-0" style={{ fontFamily: "'Times New Roman', serif", fontSize: '11pt', lineHeight: '1.4' }}>

        {/* Header */}
        <div className="text-center border-b-4 border-black pb-3 mb-4">
          <h1 className="text-lg font-bold uppercase tracking-wide">{schoolInfo.school_name || 'NAMA SEKOLAH'}</h1>
          <p className="text-xs">{schoolInfo.address || 'Alamat Sekolah'}</p>
          <p className="text-xs">Telp: {schoolInfo.phone || '-'} | Email: {schoolInfo.email || '-'}</p>
        </div>

        <h2 className="text-center text-base font-bold mb-4 underline">LAPORAN HASIL BELAJAR PESERTA DIDIK</h2>

        {/* Student identity */}
        <div className="grid grid-cols-2 gap-x-8 mb-4 text-xs">
          <table className="w-full">
            <tbody>
              <tr><td className="py-0.5 w-32">Nama Peserta Didik</td><td className="py-0.5">: {student.full_name}</td></tr>
              <tr><td className="py-0.5">NIS / NISN</td><td className="py-0.5">: {student.nis} / {student.nisn || '-'}</td></tr>
              <tr><td className="py-0.5">Tempat, Tgl Lahir</td><td className="py-0.5">: {student.birth_place || '-'}, {student.birth_date || '-'}</td></tr>
            </tbody>
          </table>
          <table className="w-full">
            <tbody>
              <tr><td className="py-0.5 w-28">Kelas</td><td className="py-0.5">: {classRoom?.name || '-'}</td></tr>
              <tr><td className="py-0.5">Semester</td><td className="py-0.5">: {classRoom?.semester === '1' ? '1 (Satu/Ganjil)' : '2 (Dua/Genap)'}</td></tr>
              <tr><td className="py-0.5">Tahun Pelajaran</td><td className="py-0.5">: {classRoom?.academic_year || '-'}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Attitude */}
        <h3 className="font-bold text-xs mb-1">A. SIKAP</h3>
        <table className="w-full border-collapse border border-black mb-4 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-2 py-1 w-8">No</th>
              <th className="border border-black px-2 py-1">Aspek</th>
              <th className="border border-black px-2 py-1 w-24">Predikat</th>
              <th className="border border-black px-2 py-1">Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black px-2 py-1 text-center">1</td>
              <td className="border border-black px-2 py-1">Sikap Spiritual</td>
              <td className="border border-black px-2 py-1 text-center">{attitude.spiritual_grade || '-'}</td>
              <td className="border border-black px-2 py-1">{attitude.spiritual_description || '-'}</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1 text-center">2</td>
              <td className="border border-black px-2 py-1">Sikap Sosial</td>
              <td className="border border-black px-2 py-1 text-center">{attitude.social_grade || '-'}</td>
              <td className="border border-black px-2 py-1">{attitude.social_description || '-'}</td>
            </tr>
          </tbody>
        </table>

        {/* Knowledge & Skills */}
        <h3 className="font-bold text-xs mb-1">B. PENGETAHUAN DAN KETERAMPILAN</h3>
        <table className="w-full border-collapse border border-black mb-4 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-1 py-1 w-6" rowSpan={2}>No</th>
              <th className="border border-black px-1 py-1" rowSpan={2}>Mata Pelajaran</th>
              <th className="border border-black px-1 py-1 text-center" colSpan={3}>Pengetahuan (KI-3)</th>
              <th className="border border-black px-1 py-1 text-center" colSpan={3}>Keterampilan (KI-4)</th>
            </tr>
            <tr className="bg-gray-100">
              <th className="border border-black px-1 py-1 text-center w-12">Nilai</th>
              <th className="border border-black px-1 py-1 text-center w-10">Pred</th>
              <th className="border border-black px-1 py-1 text-center">Deskripsi</th>
              <th className="border border-black px-1 py-1 text-center w-12">Nilai</th>
              <th className="border border-black px-1 py-1 text-center w-10">Pred</th>
              <th className="border border-black px-1 py-1 text-center">Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedSubjects).map(([group, subs]) => (
              <React.Fragment key={group}>
                <tr>
                  <td colSpan={8} className="border border-black px-2 py-1 font-bold bg-gray-50">{group}</td>
                </tr>
                {subs.map((sub, idx) => {
                  const kg = getKG(sub.id);
                  const sg = getSG(sub.id);
                  return (
                    <tr key={sub.id}>
                      <td className="border border-black px-1 py-1 text-center">{idx + 1}</td>
                      <td className="border border-black px-2 py-1">{sub.name}</td>
                      <td className="border border-black px-1 py-1 text-center">{kg?.final_score ?? '-'}</td>
                      <td className="border border-black px-1 py-1 text-center font-bold">{kg?.predicate || '-'}</td>
                      <td className="border border-black px-1 py-1 text-[9pt]">{kg?.description || '-'}</td>
                      <td className="border border-black px-1 py-1 text-center">{sg?.final_score ?? '-'}</td>
                      <td className="border border-black px-1 py-1 text-center font-bold">{sg?.predicate || '-'}</td>
                      <td className="border border-black px-1 py-1 text-[9pt]">{sg?.description || '-'}</td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Extracurriculars */}
        <h3 className="font-bold text-xs mb-1">C. EKSTRAKURIKULER</h3>
        <table className="w-full border-collapse border border-black mb-4 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-2 py-1 w-8">No</th>
              <th className="border border-black px-2 py-1">Kegiatan Ekstrakurikuler</th>
              <th className="border border-black px-2 py-1 w-24">Predikat</th>
              <th className="border border-black px-2 py-1">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {extracurriculars.length > 0 ? extracurriculars.map((ec, idx) => (
              <tr key={ec.id}>
                <td className="border border-black px-2 py-1 text-center">{idx + 1}</td>
                <td className="border border-black px-2 py-1">{ec.activity_name}</td>
                <td className="border border-black px-2 py-1 text-center">{ec.grade}</td>
                <td className="border border-black px-2 py-1">{ec.description || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="border border-black px-2 py-2 text-center">-</td></tr>
            )}
          </tbody>
        </table>

        {/* Attendance */}
        <h3 className="font-bold text-xs mb-1">D. KETIDAKHADIRAN</h3>
        <table className="w-full border-collapse border border-black mb-4 text-xs max-w-xs">
          <tbody>
            <tr><td className="border border-black px-2 py-1 w-32">Sakit</td><td className="border border-black px-2 py-1 text-center">{attendance.sick || 0} hari</td></tr>
            <tr><td className="border border-black px-2 py-1">Izin</td><td className="border border-black px-2 py-1 text-center">{attendance.permitted || 0} hari</td></tr>
            <tr><td className="border border-black px-2 py-1">Tanpa Keterangan</td><td className="border border-black px-2 py-1 text-center">{attendance.absent || 0} hari</td></tr>
          </tbody>
        </table>

        {/* Homeroom note */}
        <h3 className="font-bold text-xs mb-1">E. CATATAN WALI KELAS</h3>
        <div className="border border-black p-2 mb-4 min-h-[40px] text-xs">
          {homeroomNote.note || '-'}
        </div>

        {/* Parent response */}
        <h3 className="font-bold text-xs mb-1">F. TANGGAPAN ORANG TUA/WALI</h3>
        <div className="border border-black p-2 mb-6 min-h-[40px] text-xs">
          {homeroomNote.parent_response || ''}
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-4 text-xs text-center mt-8">
          <div>
            <p>Mengetahui,</p>
            <p>Orang Tua/Wali</p>
            <div className="h-16"></div>
            <p className="border-b border-black inline-block px-4">........................</p>
          </div>
          <div></div>
          <div>
            <p>....................., ................... 20......</p>
            <p>Wali Kelas</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{classRoom?.homeroom_teacher_name || '........................'}</p>
          </div>
        </div>

        <div className="text-center mt-8 text-xs">
          <p>Mengetahui,</p>
          <p>Kepala Sekolah</p>
          <div className="h-16"></div>
          <p className="font-bold underline">{schoolInfo.principal_name || '........................'}</p>
          <p>NIP. {schoolInfo.principal_nip || '.....................'}</p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { margin: 0; }
          @page { margin: 15mm; size: A4; }
        }
      `}</style>
    </div>
  );
}
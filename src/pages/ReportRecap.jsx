import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Printer } from 'lucide-react';

export default function ReportRecap() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [knowledgeGrades, setKnowledgeGrades] = useState([]);
  const [skillGrades, setSkillGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      const allClasses = await base44.entities.ClassRoom.list();
      const myClasses = allClasses.filter(c => c.homeroom_teacher_name === me.full_name);
      setClasses(myClasses);
      setLoading(false);
    }
    load();
  }, []);

  const handleSelectClass = async (classId) => {
    const cls = classes.find(c => c.id === classId);
    setSelectedClass(cls);
    setLoading(true);

    const [studentList, kg, sg, subjectList] = await Promise.all([
      base44.entities.Student.filter({ class_id: classId }),
      base44.entities.KnowledgeGrade.filter({ class_id: classId }),
      base44.entities.SkillGrade.filter({ class_id: classId }),
      base44.entities.Subject.list(),
    ]);

    setStudents(studentList.sort((a, b) => a.full_name.localeCompare(b.full_name)));
    setKnowledgeGrades(kg);
    setSkillGrades(sg);
    setSubjects(subjectList.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
    setLoading(false);
  };

  const getStudentKG = (studentId, subjectId) => {
    return knowledgeGrades.find(g => g.student_id === studentId && g.subject_id === subjectId);
  };

  const _getStudentSG = (studentId, subjectId) => {
    return skillGrades.find(g => g.student_id === studentId && g.subject_id === subjectId);
  };

  return (
    <div>
      <PageHeader title="Rekapitulasi & Cetak Rapor" description="Lihat rekap nilai dan cetak rapor per siswa" />

      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <Label>Pilih Kelas</Label>
        <Select value={selectedClass?.id || ''} onValueChange={handleSelectClass}>
          <SelectTrigger className="max-w-md mt-1">
            <SelectValue placeholder="Pilih kelas wali" />
          </SelectTrigger>
          <SelectContent>
            {classes.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name} ({c.academic_year} Smt {c.semester})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedClass && !loading && (
        <div className="space-y-6">
          {/* Student list with print buttons */}
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-3 py-3 text-left font-semibold w-8">No</th>
                  <th className="px-3 py-3 text-left font-semibold">Nama Siswa</th>
                  <th className="px-3 py-3 text-left font-semibold">NIS</th>
                  {subjects.map(sub => (
                    <th key={sub.id} className="px-2 py-3 text-center font-semibold text-xs whitespace-nowrap" title={sub.name}>
                      {sub.code || sub.name.substring(0, 5)}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center font-semibold">Cetak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium">{s.full_name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{s.nis}</td>
                    {subjects.map(sub => {
                      const kg = getStudentKG(s.id, sub.id);
                      return (
                        <td key={sub.id} className="px-2 py-2 text-center text-xs">
                          {kg?.final_score ?? '-'}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center">
                      <Link to={`/print-report?student=${s.id}&class=${selectedClass.id}`}>
                        <Button variant="outline" size="sm">
                          <Printer className="w-3.5 h-3.5 mr-1" /> Cetak
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && selectedClass && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
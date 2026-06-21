import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2 } from 'lucide-react';
import { getSpiritualDescription, getSocialDescription } from '@/lib/k13utils';

const grades = ['Sangat Baik', 'Baik', 'Cukup', 'Kurang'];

export default function AttitudeInput() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attitudes, setAttitudes] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

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

    const [studentList, existingAttitudes] = await Promise.all([
      base44.entities.Student.filter({ class_id: classId }),
      base44.entities.AttitudeGrade.filter({ class_id: classId }),
    ]);

    setStudents(studentList.sort((a, b) => a.full_name.localeCompare(b.full_name)));
    const attMap = {};
    existingAttitudes.forEach(a => { attMap[a.student_id] = a; });
    setAttitudes(attMap);
    setLoading(false);
  };

  const updateAttitude = (studentId, field, value) => {
    setAttitudes(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [field]: value }
    }));
  };

  const handleSave = async () => {
    if (!selectedClass) return;
    setSaving(true);

    for (const student of students) {
      const att = attitudes[student.id] || {};
      const data = {
        student_id: student.id, student_name: student.full_name,
        class_id: selectedClass.id,
        academic_year: selectedClass.academic_year, semester: selectedClass.semester,
        spiritual_grade: att.spiritual_grade || 'Baik',
        spiritual_description: getSpiritualDescription(att.spiritual_grade || 'Baik'),
        social_grade: att.social_grade || 'Baik',
        social_description: getSocialDescription(att.social_grade || 'Baik'),
      };

      if (att.id) {
        await base44.entities.AttitudeGrade.update(att.id, data);
      } else {
        const created = await base44.entities.AttitudeGrade.create(data);
        setAttitudes(prev => ({ ...prev, [student.id]: { ...data, id: created.id } }));
      }
    }

    toast({ title: 'Nilai sikap berhasil disimpan!' });
    setSaving(false);
  };

  return (
    <div>
      <PageHeader title="Nilai Sikap" description="Input nilai sikap spiritual (KI-1) dan sosial (KI-2)" />

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
        <>
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-3 py-3 text-left font-semibold w-8">No</th>
                  <th className="px-3 py-3 text-left font-semibold min-w-[160px]">Nama Siswa</th>
                  <th className="px-3 py-3 text-center font-semibold min-w-[140px]">Sikap Spiritual (KI-1)</th>
                  <th className="px-3 py-3 text-center font-semibold min-w-[140px]">Sikap Sosial (KI-2)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s, idx) => {
                  const att = attitudes[s.id] || {};
                  return (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                      <td className="px-3 py-2 font-medium">{s.full_name}</td>
                      <td className="px-2 py-1">
                        <Select value={att.spiritual_grade || 'Baik'} onValueChange={v => updateAttitude(s.id, 'spiritual_grade', v)}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-1">
                        <Select value={att.social_grade || 'Baik'} onValueChange={v => updateAttitude(s.id, 'social_grade', v)}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Nilai Sikap
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
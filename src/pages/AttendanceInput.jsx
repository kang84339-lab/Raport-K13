import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2 } from 'lucide-react';

export default function AttendanceInput() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
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

    const [studentList, existingAtt] = await Promise.all([
      base44.entities.Student.filter({ class_id: classId }),
      base44.entities.Attendance.filter({ class_id: classId }),
    ]);

    setStudents(studentList.sort((a, b) => a.full_name.localeCompare(b.full_name)));
    const attMap = {};
    existingAtt.forEach(a => { attMap[a.student_id] = a; });
    setAttendance(attMap);
    setLoading(false);
  };

  const updateAtt = (studentId, field, value) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [field]: value === '' ? 0 : Number(value) }
    }));
  };

  const handleSave = async () => {
    if (!selectedClass) return;
    setSaving(true);

    for (const student of students) {
      const att = attendance[student.id] || {};
      const data = {
        student_id: student.id, student_name: student.full_name,
        class_id: selectedClass.id,
        academic_year: selectedClass.academic_year, semester: selectedClass.semester,
        sick: att.sick || 0, permitted: att.permitted || 0, absent: att.absent || 0,
      };

      if (att.id) {
        await base44.entities.Attendance.update(att.id, data);
      } else {
        const created = await base44.entities.Attendance.create(data);
        setAttendance(prev => ({ ...prev, [student.id]: { ...data, id: created.id } }));
      }
    }

    toast({ title: 'Data absensi berhasil disimpan!' });
    setSaving(false);
  };

  return (
    <div>
      <PageHeader title="Absensi" description="Input kehadiran siswa (sakit, izin, alpa)" />

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
                  <th className="px-3 py-3 text-center font-semibold w-24">Sakit</th>
                  <th className="px-3 py-3 text-center font-semibold w-24">Izin</th>
                  <th className="px-3 py-3 text-center font-semibold w-24">Alpa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s, idx) => {
                  const att = attendance[s.id] || {};
                  return (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                      <td className="px-3 py-2 font-medium">{s.full_name}</td>
                      {['sick', 'permitted', 'absent'].map(field => (
                        <td key={field} className="px-1 py-1">
                          <Input
                            type="number" min="0"
                            className="w-20 text-center h-8 text-sm mx-auto"
                            value={att[field] ?? 0}
                            onChange={e => updateAtt(s.id, field, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Absensi
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
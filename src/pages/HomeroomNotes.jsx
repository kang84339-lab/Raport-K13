import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2 } from 'lucide-react';

export default function HomeroomNotes() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [notes, setNotes] = useState({});
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

    const [studentList, existingNotes] = await Promise.all([
      base44.entities.Student.filter({ class_id: classId }),
      base44.entities.HomeroomNote.filter({ class_id: classId }),
    ]);

    setStudents(studentList.sort((a, b) => a.full_name.localeCompare(b.full_name)));
    const noteMap = {};
    existingNotes.forEach(n => { noteMap[n.student_id] = n; });
    setNotes(noteMap);
    setLoading(false);
  };

  const updateNote = (studentId, field, value) => {
    setNotes(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [field]: value }
    }));
  };

  const handleSave = async () => {
    if (!selectedClass) return;
    setSaving(true);

    for (const student of students) {
      const note = notes[student.id] || {};
      const data = {
        student_id: student.id, student_name: student.full_name,
        class_id: selectedClass.id,
        academic_year: selectedClass.academic_year, semester: selectedClass.semester,
        note: note.note || '', parent_response: note.parent_response || '',
      };

      if (note.id) {
        await base44.entities.HomeroomNote.update(note.id, data);
      } else {
        const created = await base44.entities.HomeroomNote.create(data);
        setNotes(prev => ({ ...prev, [student.id]: { ...data, id: created.id } }));
      }
    }

    toast({ title: 'Catatan wali kelas berhasil disimpan!' });
    setSaving(false);
  };

  return (
    <div>
      <PageHeader title="Catatan Wali Kelas" description="Input catatan dan tanggapan orang tua" />

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
          <div className="space-y-4">
            {students.map((s, idx) => {
              const note = notes[s.id] || {};
              return (
                <div key={s.id} className="bg-card rounded-xl border border-border p-4">
                  <p className="font-semibold text-foreground mb-3">{idx + 1}. {s.full_name}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Catatan Wali Kelas</Label>
                      <Textarea
                        value={note.note || ''}
                        onChange={e => updateNote(s.id, 'note', e.target.value)}
                        placeholder="Tulis catatan untuk siswa..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Tanggapan Orang Tua</Label>
                      <Textarea
                        value={note.parent_response || ''}
                        onChange={e => updateNote(s.id, 'parent_response', e.target.value)}
                        placeholder="Tanggapan orang tua/wali..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Semua Catatan
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
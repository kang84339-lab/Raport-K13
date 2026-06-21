import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Save, LayoutGrid } from 'lucide-react';
import { calculateKnowledgeScore, getPredicate, getKnowledgeDescription } from '@/lib/k13utils';

export default function NilaiTematikPage() {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [existing, setExisting] = useState([]);
  const [grades, setGrades] = useState({});
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      const user = await base44.auth.me();
      const [asn, teachers] = await Promise.all([
        base44.entities.TeachingAssignment.list('-created_date', 100),
        base44.entities.Teacher.filter({ user_id: user.id }),
      ]);
      const teacher = teachers[0];
      const myAssignments = teacher ? asn.filter(a => a.teacher_id === teacher.id) : asn;
      setAssignments(myAssignments);
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedAssignment) return;
    loadGrades();
  }, [selectedAssignment]);

  async function loadGrades() {
    setLoading(true);
    const a = selectedAssignment;
    const [sts, existingGrades] = await Promise.all([
      base44.entities.Student.filter({ class_id: a.class_id }),
      base44.entities.NilaiTematik.filter({ class_id: a.class_id, subject_id: a.subject_id }),
    ]);
    setStudents(sts.sort((x, y) => x.full_name.localeCompare(y.full_name)));
    setExisting(existingGrades);
    const gradeMap = {};
    sts.forEach(s => {
      const eg = existingGrades.find(g => g.student_id === s.id);
      gradeMap[s.id] = { tema1: eg?.tema1 ?? '', tema2: eg?.tema2 ?? '', tema3: eg?.tema3 ?? '', tema4: eg?.tema4 ?? '', tema5: eg?.tema5 ?? '', uts: eg?.uts ?? '', uas: eg?.uas ?? '' };
    });
    setGrades(gradeMap);
    setLoading(false);
  }

  function setScore(studentId, field, value) {
    const v = value === '' ? '' : Math.min(100, Math.max(0, Number(value)));
    setGrades(g => ({ ...g, [studentId]: { ...g[studentId], [field]: v } }));
  }

  async function handleSave() {
    setSaving(true);
    const a = selectedAssignment;
    const ops = students.map(async s => {
      const g = grades[s.id] || {};
      const scores = [g.tema1, g.tema2, g.tema3, g.tema4, g.tema5].filter(v => v !== '').map(Number);
      const avgTema = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      const final = avgTema != null ? calculateKnowledgeScore(avgTema, null, null, g.uts || null, g.uas || null) : null;
      const predicate = final != null ? getPredicate(final, 75) : '';
      const description = predicate ? getKnowledgeDescription(a.subject_name, predicate, final) : '';
      const payload = { student_id: s.id, student_name: s.full_name, class_id: a.class_id, subject_id: a.subject_id, subject_name: a.subject_name, academic_year: a.academic_year, semester: a.semester, ...g, final_score: final, predicate, description };
      const ex = existing.find(e => e.student_id === s.id);
      if (ex) return base44.entities.NilaiTematik.update(ex.id, payload);
      return base44.entities.NilaiTematik.create(payload);
    });
    await Promise.all(ops);
    toast({ title: 'Berhasil', description: 'Nilai tematik berhasil disimpan.' });
    setSaving(false);
    loadGrades();
  }

  const scoreFields = [
    { key: 'tema1', label: 'Tema 1' }, { key: 'tema2', label: 'Tema 2' },
    { key: 'tema3', label: 'Tema 3' }, { key: 'tema4', label: 'Tema 4' },
    { key: 'tema5', label: 'Tema 5' }, { key: 'uts', label: 'UTS' }, { key: 'uas', label: 'UAS' },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Nilai Tematik SD"
        description="Input nilai per tema untuk menghasilkan nilai muatan mapel"
        actions={selectedAssignment && <Button onClick={handleSave} disabled={saving} className="gap-2"><Save className="w-4 h-4" />{saving ? 'Menyimpan...' : 'Simpan Nilai'}</Button>}
      />

      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <label className="text-sm font-medium text-muted-foreground block mb-2">Pilih Tugas Mengajar</label>
        <Select value={selectedAssignment?.id || ''} onValueChange={v => setSelectedAssignment(assignments.find(a => a.id === v) || null)}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Pilih kelas & mapel..." />
          </SelectTrigger>
          <SelectContent>
            {assignments.map(a => <SelectItem key={a.id} value={a.id}>{a.class_name} — {a.subject_name} (Sem. {a.semester})</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {!selectedAssignment ? (
        <div className="text-center py-16 text-muted-foreground">
          <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Pilih tugas mengajar untuk mulai input nilai tematik.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-3 py-3 text-left font-semibold text-muted-foreground sticky left-0 bg-muted/50 z-10 w-8">No</th>
                <th className="px-3 py-3 text-left font-semibold text-muted-foreground sticky left-8 bg-muted/50 z-10 min-w-[180px]">Nama Siswa</th>
                {scoreFields.map(f => <th key={f.key} className="px-2 py-3 text-center font-semibold text-muted-foreground w-20">{f.label}</th>)}
                <th className="px-3 py-3 text-center font-semibold text-muted-foreground w-20">Nilai Akhir</th>
                <th className="px-3 py-3 text-center font-semibold text-muted-foreground w-16">Pred.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((s, i) => {
                const g = grades[s.id] || {};
                const scores = [g.tema1, g.tema2, g.tema3, g.tema4, g.tema5].filter(v => v !== '').map(Number);
                const avgTema = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
                const final = avgTema != null ? calculateKnowledgeScore(avgTema, null, null, g.uts || null, g.uas || null) : null;
                const predicate = final != null ? getPredicate(final, 75) : '-';
                const predColor = { A: 'text-green-600', B: 'text-blue-600', C: 'text-yellow-600', D: 'text-red-600' }[predicate] || '';
                return (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2 text-muted-foreground sticky left-0 bg-card z-10">{i + 1}</td>
                    <td className="px-3 py-2 font-medium sticky left-8 bg-card z-10">{s.full_name}</td>
                    {scoreFields.map(f => (
                      <td key={f.key} className="px-2 py-2">
                        <Input
                          type="number" min="0" max="100"
                          value={g[f.key] ?? ''}
                          onChange={e => setScore(s.id, f.key, e.target.value)}
                          className="h-8 text-center w-16 text-sm"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-bold">{final ?? '-'}</td>
                    <td className={`px-3 py-2 text-center font-bold ${predColor}`}>{predicate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
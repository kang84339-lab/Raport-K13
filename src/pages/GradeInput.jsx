import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2 } from 'lucide-react';
import { calculateKnowledgeScore, calculateSkillScore, getPredicate, getKnowledgeDescription, getSkillDescription } from '@/lib/k13utils';

export default function GradeInput() {
  const [_user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [students, setStudents] = useState([]);
  const [knowledgeGrades, setKnowledgeGrades] = useState({});
  const [skillGrades, setSkillGrades] = useState({});
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);
      const allAssignments = await base44.entities.TeachingAssignment.list();
      const myAssignments = allAssignments.filter(a => a.teacher_name === me.full_name);
      setAssignments(myAssignments);
      setLoading(false);
    }
    load();
  }, []);

  const handleSelectAssignment = async (assignmentId) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    setSelectedAssignment(assignment);
    setLoading(true);

    const [studentList, subjectList, existingKG, existingSG] = await Promise.all([
      base44.entities.Student.filter({ class_id: assignment.class_id }),
      base44.entities.Subject.list(),
      base44.entities.KnowledgeGrade.filter({ class_id: assignment.class_id, subject_id: assignment.subject_id }),
      base44.entities.SkillGrade.filter({ class_id: assignment.class_id, subject_id: assignment.subject_id }),
    ]);

    const sub = subjectList.find(s => s.id === assignment.subject_id);
    setSubject(sub);
    setStudents(studentList.sort((a, b) => a.full_name.localeCompare(b.full_name)));

    const kgMap = {};
    existingKG.forEach(g => { kgMap[g.student_id] = g; });
    setKnowledgeGrades(kgMap);

    const sgMap = {};
    existingSG.forEach(g => { sgMap[g.student_id] = g; });
    setSkillGrades(sgMap);

    setLoading(false);
  };

  const updateKG = (studentId, field, value) => {
    setKnowledgeGrades(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [field]: value === '' ? null : Number(value) }
    }));
  };

  const updateSG = (studentId, field, value) => {
    setSkillGrades(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [field]: value === '' ? null : Number(value) }
    }));
  };

  const handleSave = async () => {
    if (!selectedAssignment || !subject) return;
    setSaving(true);
    const kkm = subject.kkm || 75;

    for (const student of students) {
      const kg = knowledgeGrades[student.id] || {};
      const finalKG = calculateKnowledgeScore(kg.nh1, kg.nh2, kg.nh3, kg.uts, kg.uas);
      const predicateKG = getPredicate(finalKG, kkm);
      const descKG = getKnowledgeDescription(subject.name, predicateKG, finalKG);

      const kgData = {
        student_id: student.id, student_name: student.full_name,
        subject_id: selectedAssignment.subject_id, subject_name: subject.name,
        class_id: selectedAssignment.class_id,
        academic_year: selectedAssignment.academic_year, semester: selectedAssignment.semester,
        nh1: kg.nh1 ?? null, nh2: kg.nh2 ?? null, nh3: kg.nh3 ?? null,
        uts: kg.uts ?? null, uas: kg.uas ?? null,
        final_score: finalKG, predicate: predicateKG, description: descKG,
      };

      if (kg.id) {
        await base44.entities.KnowledgeGrade.update(kg.id, kgData);
      } else {
        const created = await base44.entities.KnowledgeGrade.create(kgData);
        setKnowledgeGrades(prev => ({ ...prev, [student.id]: { ...kgData, id: created.id } }));
      }

      const sg = skillGrades[student.id] || {};
      const finalSG = calculateSkillScore(sg.practice_score, sg.product_score, sg.project_score);
      const predicateSG = getPredicate(finalSG, kkm);
      const descSG = getSkillDescription(subject.name, predicateSG);

      const sgData = {
        student_id: student.id, student_name: student.full_name,
        subject_id: selectedAssignment.subject_id, subject_name: subject.name,
        class_id: selectedAssignment.class_id,
        academic_year: selectedAssignment.academic_year, semester: selectedAssignment.semester,
        practice_score: sg.practice_score ?? null, product_score: sg.product_score ?? null, project_score: sg.project_score ?? null,
        final_score: finalSG, predicate: predicateSG, description: descSG,
      };

      if (sg.id) {
        await base44.entities.SkillGrade.update(sg.id, sgData);
      } else {
        const created = await base44.entities.SkillGrade.create(sgData);
        setSkillGrades(prev => ({ ...prev, [student.id]: { ...sgData, id: created.id } }));
      }
    }

    toast({ title: 'Semua nilai berhasil disimpan!' });
    setSaving(false);
  };

  if (loading && assignments.length === 0) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <PageHeader title="Input Nilai" description="Input nilai pengetahuan (KI-3) dan keterampilan (KI-4)" />

      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <Label>Pilih Tugas Mengajar</Label>
        <Select value={selectedAssignment?.id || ''} onValueChange={handleSelectAssignment}>
          <SelectTrigger className="max-w-md mt-1">
            <SelectValue placeholder="Pilih mapel & kelas" />
          </SelectTrigger>
          <SelectContent>
            {assignments.map(a => (
              <SelectItem key={a.id} value={a.id}>
                {a.subject_name} — {a.class_name} ({a.academic_year} Smt {a.semester})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedAssignment && !loading && (
        <>
          <Tabs defaultValue="knowledge" className="space-y-4">
            <TabsList>
              <TabsTrigger value="knowledge">Pengetahuan (KI-3)</TabsTrigger>
              <TabsTrigger value="skill">Keterampilan (KI-4)</TabsTrigger>
            </TabsList>

            <TabsContent value="knowledge">
              <div className="bg-card rounded-xl border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-3 py-3 text-left font-semibold w-8">No</th>
                      <th className="px-3 py-3 text-left font-semibold min-w-[160px]">Nama Siswa</th>
                      <th className="px-3 py-3 text-center font-semibold w-20">NH 1</th>
                      <th className="px-3 py-3 text-center font-semibold w-20">NH 2</th>
                      <th className="px-3 py-3 text-center font-semibold w-20">NH 3</th>
                      <th className="px-3 py-3 text-center font-semibold w-20">UTS</th>
                      <th className="px-3 py-3 text-center font-semibold w-20">UAS</th>
                      <th className="px-3 py-3 text-center font-semibold w-20">NA</th>
                      <th className="px-3 py-3 text-center font-semibold w-16">Predikat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map((s, idx) => {
                      const kg = knowledgeGrades[s.id] || {};
                      const finalScore = calculateKnowledgeScore(kg.nh1, kg.nh2, kg.nh3, kg.uts, kg.uas);
                      const predicate = getPredicate(finalScore, subject?.kkm || 75);
                      return (
                        <tr key={s.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium">{s.full_name}</td>
                          {['nh1', 'nh2', 'nh3', 'uts', 'uas'].map(field => (
                            <td key={field} className="px-1 py-1">
                              <Input
                                type="number" min="0" max="100"
                                className="w-16 text-center h-8 text-sm mx-auto"
                                value={kg[field] ?? ''}
                                onChange={e => updateKG(s.id, field, e.target.value)}
                              />
                            </td>
                          ))}
                          <td className="px-3 py-2 text-center font-bold">{finalScore ?? '-'}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              predicate === 'A' ? 'bg-green-100 text-green-700' :
                              predicate === 'B' ? 'bg-blue-100 text-blue-700' :
                              predicate === 'C' ? 'bg-yellow-100 text-yellow-700' :
                              predicate === 'D' ? 'bg-red-100 text-red-700' : ''
                            }`}>{predicate || '-'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Rumus: NA = ((2 × Rata-rata NH) + UTS + UAS) / 4 | KKM: {subject?.kkm || 75}
              </p>
            </TabsContent>

            <TabsContent value="skill">
              <div className="bg-card rounded-xl border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-3 py-3 text-left font-semibold w-8">No</th>
                      <th className="px-3 py-3 text-left font-semibold min-w-[160px]">Nama Siswa</th>
                      <th className="px-3 py-3 text-center font-semibold w-20">Praktik</th>
                      <th className="px-3 py-3 text-center font-semibold w-20">Produk</th>
                      <th className="px-3 py-3 text-center font-semibold w-20">Proyek</th>
                      <th className="px-3 py-3 text-center font-semibold w-20">NA</th>
                      <th className="px-3 py-3 text-center font-semibold w-16">Predikat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map((s, idx) => {
                      const sg = skillGrades[s.id] || {};
                      const finalScore = calculateSkillScore(sg.practice_score, sg.product_score, sg.project_score);
                      const predicate = getPredicate(finalScore, subject?.kkm || 75);
                      return (
                        <tr key={s.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium">{s.full_name}</td>
                          {['practice_score', 'product_score', 'project_score'].map(field => (
                            <td key={field} className="px-1 py-1">
                              <Input
                                type="number" min="0" max="100"
                                className="w-16 text-center h-8 text-sm mx-auto"
                                value={sg[field] ?? ''}
                                onChange={e => updateSG(s.id, field, e.target.value)}
                              />
                            </td>
                          ))}
                          <td className="px-3 py-2 text-center font-bold">{finalScore ?? '-'}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              predicate === 'A' ? 'bg-green-100 text-green-700' :
                              predicate === 'B' ? 'bg-blue-100 text-blue-700' :
                              predicate === 'C' ? 'bg-yellow-100 text-yellow-700' :
                              predicate === 'D' ? 'bg-red-100 text-red-700' : ''
                            }`}>{predicate || '-'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Nilai Akhir Keterampilan = Nilai Optimum (tertinggi) | KKM: {subject?.kkm || 75}
              </p>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Semua Nilai
            </Button>
          </div>
        </>
      )}

      {loading && selectedAssignment && (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      )}
    </div>
  );
}
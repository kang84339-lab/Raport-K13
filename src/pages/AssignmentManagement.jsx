import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';

export default function AssignmentManagement() {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ teacher_id: '', subject_id: '', class_id: '', academic_year: '2024/2025', semester: '1' });
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    const [a, t, s, c] = await Promise.all([
      base44.entities.TeachingAssignment.list(),
      base44.entities.Teacher.list(),
      base44.entities.Subject.list(),
      base44.entities.ClassRoom.list()
    ]);
    setAssignments(a);
    setTeachers(t);
    setSubjects(s);
    setClasses(c);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if (!form.teacher_id || !form.subject_id || !form.class_id) {
      toast({ variant: 'destructive', title: 'Semua field harus diisi' });
      return;
    }
    const teacher = teachers.find(t => t.id === form.teacher_id);
    const subject = subjects.find(s => s.id === form.subject_id);
    const cls = classes.find(c => c.id === form.class_id);
    await base44.entities.TeachingAssignment.create({
      ...form,
      teacher_name: teacher?.full_name || '',
      subject_name: subject?.name || '',
      class_name: cls?.name || ''
    });
    toast({ title: 'Tugas mengajar berhasil ditambahkan' });
    setDialogOpen(false);
    setForm({ teacher_id: '', subject_id: '', class_id: '', academic_year: '2024/2025', semester: '1' });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus tugas mengajar ini?')) return;
    await base44.entities.TeachingAssignment.delete(id);
    toast({ title: 'Tugas mengajar dihapus' });
    loadData();
  };

  const columns = [
    { header: 'Guru', accessor: 'teacher_name' },
    { header: 'Mata Pelajaran', accessor: 'subject_name' },
    { header: 'Kelas', accessor: 'class_name' },
    { header: 'Tahun', accessor: 'academic_year' },
    { header: 'Smt', accessor: 'semester' },
    {
      header: 'Aksi',
      cell: (row) => (
        <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} className="text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tugas Mengajar"
        description="Pemetaan guru, mapel, dan kelas"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Tambah
          </Button>
        }
      />
      <div className="bg-card rounded-xl border border-border p-1">
        <DataTable columns={columns} data={assignments} loading={loading} emptyMessage="Belum ada tugas mengajar" />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Tugas Mengajar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Guru *</Label>
              <Select value={form.teacher_id} onValueChange={v => setForm({...form, teacher_id: v})}>
                <SelectTrigger><SelectValue placeholder="Pilih guru" /></SelectTrigger>
                <SelectContent>
                  {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mata Pelajaran *</Label>
              <Select value={form.subject_id} onValueChange={v => setForm({...form, subject_id: v})}>
                <SelectTrigger><SelectValue placeholder="Pilih mapel" /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kelas *</Label>
              <Select value={form.class_id} onValueChange={v => setForm({...form, class_id: v})}>
                <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tahun Ajaran</Label>
                <Input value={form.academic_year} onChange={e => setForm({...form, academic_year: e.target.value})} />
              </div>
              <div>
                <Label>Semester</Label>
                <Select value={form.semester} onValueChange={v => setForm({...form, semester: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSave}>Tambah</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
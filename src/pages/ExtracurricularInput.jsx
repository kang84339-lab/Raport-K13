import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DataTable from '@/components/shared/DataTable';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';

const gradeOptions = ['Sangat Baik', 'Baik', 'Cukup', 'Kurang'];

export default function ExtracurricularInput() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ student_id: '', activity_name: '', grade: 'Baik', description: '' });
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
    const [studentList, existingRecords] = await Promise.all([
      base44.entities.Student.filter({ class_id: classId }),
      base44.entities.Extracurricular.filter({ class_id: classId }),
    ]);
    setStudents(studentList.sort((a, b) => a.full_name.localeCompare(b.full_name)));
    setRecords(existingRecords);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!form.student_id || !form.activity_name.trim()) {
      toast({ variant: 'destructive', title: 'Siswa dan nama kegiatan harus diisi' });
      return;
    }
    const student = students.find(s => s.id === form.student_id);
    await base44.entities.Extracurricular.create({
      ...form,
      student_name: student?.full_name || '',
      class_id: selectedClass.id,
      academic_year: selectedClass.academic_year,
      semester: selectedClass.semester,
    });
    toast({ title: 'Ekskul ditambahkan' });
    setDialogOpen(false);
    setForm({ student_id: '', activity_name: '', grade: 'Baik', description: '' });
    const updated = await base44.entities.Extracurricular.filter({ class_id: selectedClass.id });
    setRecords(updated);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data ekskul ini?')) return;
    await base44.entities.Extracurricular.delete(id);
    toast({ title: 'Data ekskul dihapus' });
    const updated = await base44.entities.Extracurricular.filter({ class_id: selectedClass.id });
    setRecords(updated);
  };

  const columns = [
    { header: 'Siswa', accessor: 'student_name' },
    { header: 'Kegiatan', accessor: 'activity_name' },
    { header: 'Nilai', accessor: 'grade' },
    { header: 'Keterangan', accessor: 'description' },
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
      <PageHeader title="Ekstrakurikuler" description="Input kegiatan ekskul siswa" />

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
          <div className="mb-4">
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Tambah Ekskul
            </Button>
          </div>
          <div className="bg-card rounded-xl border border-border p-1">
            <DataTable columns={columns} data={records} loading={false} emptyMessage="Belum ada data ekskul" />
          </div>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tambah Ekskul</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Siswa *</Label>
              <Select value={form.student_id} onValueChange={v => setForm({...form, student_id: v})}>
                <SelectTrigger><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
                <SelectContent>
                  {students.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nama Kegiatan *</Label>
              <Input value={form.activity_name} onChange={e => setForm({...form, activity_name: e.target.value})} placeholder="Pramuka" />
            </div>
            <div>
              <Label>Nilai</Label>
              <Select value={form.grade} onValueChange={v => setForm({...form, grade: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {gradeOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Keterangan</Label>
              <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={handleAdd}>Tambah</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
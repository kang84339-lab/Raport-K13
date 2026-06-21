import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const emptyForm = { name: '', grade: 'VII', academic_year: '2024/2025', semester: '1', homeroom_teacher_id: '', homeroom_teacher_name: '', kkm_default: 75 };

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    const [c, t] = await Promise.all([
      base44.entities.ClassRoom.list(),
      base44.entities.Teacher.list()
    ]);
    setClasses(c);
    setTeachers(t);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ variant: 'destructive', title: 'Nama kelas harus diisi' });
      return;
    }
    const teacher = teachers.find(t => t.id === form.homeroom_teacher_id);
    const data = { ...form, homeroom_teacher_name: teacher?.full_name || '', kkm_default: Number(form.kkm_default) };
    if (editId) {
      await base44.entities.ClassRoom.update(editId, data);
      toast({ title: 'Kelas berhasil diperbarui' });
    } else {
      await base44.entities.ClassRoom.create(data);
      toast({ title: 'Kelas berhasil ditambahkan' });
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditId(null);
    loadData();
  };

  const handleEdit = (cls) => {
    setForm({
      name: cls.name, grade: cls.grade || 'VII', academic_year: cls.academic_year || '2024/2025',
      semester: cls.semester || '1', homeroom_teacher_id: cls.homeroom_teacher_id || '',
      homeroom_teacher_name: cls.homeroom_teacher_name || '', kkm_default: cls.kkm_default || 75
    });
    setEditId(cls.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus kelas ini?')) return;
    await base44.entities.ClassRoom.delete(id);
    toast({ title: 'Kelas dihapus' });
    loadData();
  };

  const columns = [
    { header: 'Nama Kelas', accessor: 'name' },
    { header: 'Tingkat', accessor: 'grade' },
    { header: 'Tahun Ajaran', accessor: 'academic_year' },
    { header: 'Semester', accessor: 'semester' },
    { header: 'Wali Kelas', accessor: 'homeroom_teacher_name' },
    { header: 'KKM', accessor: 'kkm_default' },
    {
      header: 'Aksi',
      cell: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row)}><Pencil className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Data Kelas"
        description="Kelola kelas dan wali kelas"
        actions={
          <Button onClick={() => { setForm(emptyForm); setEditId(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Kelas
          </Button>
        }
      />
      <div className="bg-card rounded-xl border border-border p-1">
        <DataTable columns={columns} data={classes} loading={loading} emptyMessage="Belum ada data kelas" />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Kelas' : 'Tambah Kelas'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Nama Kelas *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="VII-A" />
            </div>
            <div>
              <Label>Tingkat</Label>
              <Select value={form.grade} onValueChange={v => setForm({...form, grade: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['VII','VIII','IX','X','XI','XII'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
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
                    <SelectItem value="1">1 (Ganjil)</SelectItem>
                    <SelectItem value="2">2 (Genap)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Wali Kelas</Label>
              <Select value={form.homeroom_teacher_id} onValueChange={v => setForm({...form, homeroom_teacher_id: v})}>
                <SelectTrigger><SelectValue placeholder="Pilih wali kelas" /></SelectTrigger>
                <SelectContent>
                  {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>KKM Default</Label>
              <Input type="number" value={form.kkm_default} onChange={e => setForm({...form, kkm_default: e.target.value})} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSave}>{editId ? 'Simpan' : 'Tambah'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
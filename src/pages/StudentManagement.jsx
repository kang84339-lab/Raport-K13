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

const emptyForm = { nis: '', nisn: '', full_name: '', gender: 'Laki-laki', birth_place: '', birth_date: '', religion: 'Islam', parent_name: '', address: '', phone: '', class_id: '', class_name: '' };

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    const [s, c] = await Promise.all([
      base44.entities.Student.list(),
      base44.entities.ClassRoom.list()
    ]);
    setStudents(s);
    setClasses(c);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.nis.trim()) {
      toast({ variant: 'destructive', title: 'NIS dan nama harus diisi' });
      return;
    }
    const selectedClass = classes.find(c => c.id === form.class_id);
    const data = { ...form, class_name: selectedClass?.name || '' };
    if (editId) {
      await base44.entities.Student.update(editId, data);
      toast({ title: 'Data siswa berhasil diperbarui' });
    } else {
      await base44.entities.Student.create(data);
      toast({ title: 'Siswa berhasil ditambahkan' });
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditId(null);
    loadData();
  };

  const handleEdit = (student) => {
    setForm({
      nis: student.nis || '', nisn: student.nisn || '', full_name: student.full_name,
      gender: student.gender || 'Laki-laki', birth_place: student.birth_place || '',
      birth_date: student.birth_date || '', religion: student.religion || 'Islam',
      parent_name: student.parent_name || '', address: student.address || '',
      phone: student.phone || '', class_id: student.class_id || '', class_name: student.class_name || ''
    });
    setEditId(student.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data siswa ini?')) return;
    await base44.entities.Student.delete(id);
    toast({ title: 'Data siswa dihapus' });
    loadData();
  };

  const columns = [
    { header: 'NIS', accessor: 'nis' },
    { header: 'Nama Lengkap', accessor: 'full_name' },
    { header: 'L/P', cell: (row) => row.gender === 'Perempuan' ? 'P' : 'L' },
    { header: 'Kelas', accessor: 'class_name' },
    { header: 'Agama', accessor: 'religion' },
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
        title="Data Siswa"
        description="Kelola data peserta didik"
        actions={
          <Button onClick={() => { setForm(emptyForm); setEditId(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Siswa
          </Button>
        }
      />
      <div className="bg-card rounded-xl border border-border p-1">
        <DataTable columns={columns} data={students} loading={loading} emptyMessage="Belum ada data siswa" />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Siswa' : 'Tambah Siswa'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label>NIS *</Label>
              <Input value={form.nis} onChange={e => setForm({...form, nis: e.target.value})} />
            </div>
            <div>
              <Label>NISN</Label>
              <Input value={form.nisn} onChange={e => setForm({...form, nisn: e.target.value})} />
            </div>
            <div className="col-span-2">
              <Label>Nama Lengkap *</Label>
              <Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
            </div>
            <div>
              <Label>Jenis Kelamin</Label>
              <Select value={form.gender} onValueChange={v => setForm({...form, gender: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kelas</Label>
              <Select value={form.class_id} onValueChange={v => setForm({...form, class_id: v})}>
                <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tempat Lahir</Label>
              <Input value={form.birth_place} onChange={e => setForm({...form, birth_place: e.target.value})} />
            </div>
            <div>
              <Label>Tanggal Lahir</Label>
              <Input type="date" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} />
            </div>
            <div>
              <Label>Agama</Label>
              <Select value={form.religion} onValueChange={v => setForm({...form, religion: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nama Orang Tua</Label>
              <Input value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})} />
            </div>
            <div>
              <Label>Telepon</Label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="col-span-2">
              <Label>Alamat</Label>
              <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>{editId ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
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

const emptyForm = { nip: '', full_name: '', gender: 'Laki-laki', phone: '', email: '', address: '' };

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    const data = await base44.entities.Teacher.list();
    setTeachers(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      toast({ variant: 'destructive', title: 'Nama harus diisi' });
      return;
    }
    if (editId) {
      await base44.entities.Teacher.update(editId, form);
      toast({ title: 'Data guru berhasil diperbarui' });
    } else {
      await base44.entities.Teacher.create(form);
      toast({ title: 'Guru berhasil ditambahkan' });
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditId(null);
    loadData();
  };

  const handleEdit = (teacher) => {
    setForm({ 
      nip: teacher.nip || '', 
      full_name: teacher.full_name, 
      gender: teacher.gender || 'Laki-laki', 
      phone: teacher.phone || '', 
      email: teacher.email || '', 
      address: teacher.address || '' 
    });
    setEditId(teacher.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data guru ini?')) return;
    await base44.entities.Teacher.delete(id);
    toast({ title: 'Data guru dihapus' });
    loadData();
  };

  const columns = [
    { header: 'NIP', accessor: 'nip' },
    { header: 'Nama Lengkap', accessor: 'full_name' },
    { header: 'L/P', cell: (row) => row.gender === 'Perempuan' ? 'P' : 'L' },
    { header: 'Telepon', accessor: 'phone' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Aksi',
      cell: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleDelete(row.id)} 
            className="text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Data Guru"
        description="Kelola data guru dan pegawai"
        actions={
          <Button onClick={() => { setForm(emptyForm); setEditId(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Guru
          </Button>
        }
      />
      <div className="bg-card rounded-xl border border-border p-1">
        <DataTable 
          columns={columns} 
          data={teachers} 
          loading={loading} 
          emptyMessage="Belum ada data guru" 
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Guru' : 'Tambah Guru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>NIP</Label>
              <Input 
                value={form.nip} 
                onChange={(e) => setForm({...form, nip: e.target.value})} 
                placeholder="Nomor Induk Pegawai" 
              />
            </div>
            <div>
              <Label>Nama Lengkap *</Label>
              <Input 
                value={form.full_name} 
                onChange={(e) => setForm({...form, full_name: e.target.value})} 
              />
            </div>
            <div>
              <Label>Jenis Kelamin</Label>
              <Select 
                value={form.gender} 
                onValueChange={(v) => setForm({...form, gender: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Telepon</Label>
              <Input 
                value={form.phone} 
                onChange={(e) => setForm({...form, phone: e.target.value})} 
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({...form, email: e.target.value})} 
              />
            </div>
            <div>
              <Label>Alamat</Label>
              <Input 
                value={form.address} 
                onChange={(e) => setForm({...form, address: e.target.value})} 
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSave}>
                {editId ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

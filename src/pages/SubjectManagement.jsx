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

const groups = ['Kelompok A (Umum)', 'Kelompok B (Umum)', 'Kelompok C (Peminatan)', 'Muatan Lokal'];
const emptyForm = { code: '', name: '', group: groups[0], kkm: 75, order_index: 0 };

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    const data = await base44.entities.Subject.list();
    setSubjects(data.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ variant: 'destructive', title: 'Nama mapel harus diisi' });
      return;
    }
    const data = { ...form, kkm: Number(form.kkm), order_index: Number(form.order_index) };
    if (editId) {
      await base44.entities.Subject.update(editId, data);
      toast({ title: 'Mapel berhasil diperbarui' });
    } else {
      await base44.entities.Subject.create(data);
      toast({ title: 'Mapel berhasil ditambahkan' });
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditId(null);
    loadData();
  };

  const handleEdit = (sub) => {
    setForm({ code: sub.code || '', name: sub.name, group: sub.group, kkm: sub.kkm || 75, order_index: sub.order_index || 0 });
    setEditId(sub.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus mata pelajaran ini?')) return;
    await base44.entities.Subject.delete(id);
    toast({ title: 'Mapel dihapus' });
    loadData();
  };

  const columns = [
    { header: 'Kode', accessor: 'code' },
    { header: 'Nama', accessor: 'name' },
    { header: 'Kelompok', accessor: 'group' },
    { header: 'KKM', accessor: 'kkm' },
    { header: 'Urutan', accessor: 'order_index' },
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
        title="Mata Pelajaran"
        description="Kelola data mata pelajaran"
        actions={
          <Button onClick={() => { setForm(emptyForm); setEditId(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Mapel
          </Button>
        }
      />
      <div className="bg-card rounded-xl border border-border p-1">
        <DataTable columns={columns} data={subjects} loading={loading} emptyMessage="Belum ada data mapel" />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Mapel' : 'Tambah Mapel'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Kode Mapel</Label>
              <Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="MTK" />
            </div>
            <div>
              <Label>Nama Mapel *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <Label>Kelompok</Label>
              <Select value={form.group} onValueChange={v => setForm({...form, group: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {groups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>KKM</Label>
                <Input type="number" value={form.kkm} onChange={e => setForm({...form, kkm: e.target.value})} />
              </div>
              <div>
                <Label>Urutan</Label>
                <Input type="number" value={form.order_index} onChange={e => setForm({...form, order_index: e.target.value})} />
              </div>
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
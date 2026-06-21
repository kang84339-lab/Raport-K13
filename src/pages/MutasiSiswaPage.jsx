import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, ArrowRightLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const emptyForm = { student_id: '', student_name: '', class_id: '', type: 'Masuk', date: '', from_school: '', to_school: '', reason: '', note: '', academic_year: '2024/2025', semester: '1' };

export default function MutasiSiswaPage() {
  const [mutasiList, setMutasiList] = useState([]);
  const [students, setStudents] = useState([]);
  const [_classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [m, s, c] = await Promise.all([
      base44.entities.MutasiSiswa.list('-date', 200),
      base44.entities.Student.list('full_name', 200),
      base44.entities.ClassRoom.list('name', 50),
    ]);
    setMutasiList(m);
    setStudents(s);
    setClasses(c);
    setLoading(false);
  }

  function openNew() { setForm(emptyForm); setEditingId(null); setDialogOpen(true); }

  function openEdit(m) {
    setForm({ student_id: m.student_id, student_name: m.student_name || '', class_id: m.class_id || '', type: m.type, date: m.date || '', from_school: m.from_school || '', to_school: m.to_school || '', reason: m.reason || '', note: m.note || '', academic_year: m.academic_year || '2024/2025', semester: m.semester || '1' });
    setEditingId(m.id);
    setDialogOpen(true);
  }

  function setField(key, value) { setForm(f => ({ ...f, [key]: value })); }

  async function handleSave() {
    if (!form.student_id || !form.date || !form.type) {
      toast({ title: 'Perhatian', description: 'Siswa, tanggal, dan jenis mutasi wajib diisi.' }); return;
    }
    setSaving(true);
    const stu = students.find(s => s.id === form.student_id);
    const payload = { ...form, student_name: stu?.full_name || form.student_name };
    if (editingId) await base44.entities.MutasiSiswa.update(editingId, payload);
    else await base44.entities.MutasiSiswa.create(payload);
    toast({ title: 'Berhasil', description: 'Data mutasi tersimpan.' });
    setDialogOpen(false);
    setSaving(false);
    loadData();
  }

  async function handleDelete(id) {
    if (!window.confirm('Hapus data mutasi ini?')) return;
    await base44.entities.MutasiSiswa.delete(id);
    toast({ title: 'Dihapus' });
    loadData();
  }

  const formatDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

  return (
    <div className="p-6">
      <PageHeader
        title="Mutasi Siswa"
        description="Data siswa pindah masuk dan pindah keluar sekolah"
        actions={<Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Tambah Mutasi</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[{ label: 'Masuk', icon: ArrowDownLeft, color: 'text-green-600 bg-green-50', count: mutasiList.filter(m => m.type === 'Masuk').length },
          { label: 'Keluar', icon: ArrowUpRight, color: 'text-red-600 bg-red-50', count: mutasiList.filter(m => m.type === 'Keluar').length }].map(item => (
          <div key={item.label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{item.count}</p>
              <p className="text-sm text-muted-foreground">Mutasi {item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : mutasiList.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Belum ada data mutasi siswa.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nama Siswa</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Jenis</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Tanggal</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Asal / Tujuan Sekolah</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Alasan</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mutasiList.map(m => (
                <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{m.student_name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${m.type === 'Masuk' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {m.type === 'Masuk' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      {m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(m.date)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.type === 'Masuk' ? (m.from_school || '-') : (m.to_school || '-')}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.reason || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => openEdit(m)}><Edit className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="w-7 h-7 hover:text-destructive" onClick={() => handleDelete(m.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Tambah'} Data Mutasi</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Nama Siswa <span className="text-destructive">*</span></Label>
              <Select value={form.student_id} onValueChange={v => setField('student_id', v)}>
                <SelectTrigger><SelectValue placeholder="Pilih siswa..." /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Jenis Mutasi <span className="text-destructive">*</span></Label>
                <Select value={form.type} onValueChange={v => setField('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masuk">Pindah Masuk</SelectItem>
                    <SelectItem value="Keluar">Pindah Keluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Tanggal <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.date} onChange={e => setField('date', e.target.value)} />
              </div>
            </div>
            {form.type === 'Masuk' ? (
              <div className="space-y-1">
                <Label>Asal Sekolah</Label>
                <Input value={form.from_school} onChange={e => setField('from_school', e.target.value)} placeholder="Nama sekolah asal" />
              </div>
            ) : (
              <div className="space-y-1">
                <Label>Sekolah Tujuan</Label>
                <Input value={form.to_school} onChange={e => setField('to_school', e.target.value)} placeholder="Nama sekolah tujuan" />
              </div>
            )}
            <div className="space-y-1">
              <Label>Alasan Mutasi</Label>
              <Input value={form.reason} onChange={e => setField('reason', e.target.value)} placeholder="Alasan pindah..." />
            </div>
            <div className="space-y-1">
              <Label>Keterangan Tambahan</Label>
              <Textarea value={form.note} onChange={e => setField('note', e.target.value)} placeholder="Catatan tambahan..." rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, BookMarked, Filter } from 'lucide-react';

const emptyForm = { subject_id: '', subject_name: '', code: '', description: '', type: 'Pengetahuan', semester: '1', academic_year: '2024/2025', order_index: 0 };

export default function KompetensiDasarPage() {
  const [kdList, setKdList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [kd, sub] = await Promise.all([
      base44.entities.KompetensiDasar.list('order_index', 500),
      base44.entities.Subject.list('name', 100),
    ]);
    setKdList(kd);
    setSubjects(sub);
    setLoading(false);
  }

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  }

  function openEdit(kd) {
    setForm({ subject_id: kd.subject_id, subject_name: kd.subject_name || '', code: kd.code, description: kd.description, type: kd.type, semester: kd.semester, academic_year: kd.academic_year || '2024/2025', order_index: kd.order_index || 0 });
    setEditingId(kd.id);
    setDialogOpen(true);
  }

  function setField(key, value) { setForm(f => ({ ...f, [key]: value })); }

  async function handleSave() {
    if (!form.subject_id || !form.code || !form.description) {
      toast({ title: 'Perhatian', description: 'Mapel, kode, dan deskripsi KD wajib diisi.' }); return;
    }
    setSaving(true);
    const sub = subjects.find(s => s.id === form.subject_id);
    const payload = { ...form, subject_name: sub?.name || form.subject_name };
    if (editingId) await base44.entities.KompetensiDasar.update(editingId, payload);
    else await base44.entities.KompetensiDasar.create(payload);
    toast({ title: 'Berhasil', description: 'KD berhasil disimpan.' });
    setDialogOpen(false);
    setSaving(false);
    loadData();
  }

  async function handleDelete(id) {
    if (!window.confirm('Hapus KD ini?')) return;
    await base44.entities.KompetensiDasar.delete(id);
    toast({ title: 'Dihapus', description: 'KD berhasil dihapus.' });
    loadData();
  }

  const filtered = kdList.filter(k =>
    (filterSubject === 'all' || k.subject_id === filterSubject) &&
    (filterSemester === 'all' || k.semester === filterSemester) &&
    (filterType === 'all' || k.type === filterType)
  );

  const grouped = {};
  filtered.forEach(k => {
    const key = k.subject_name || k.subject_id;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(k);
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Kompetensi Dasar (KD)"
        description="Kelola KD per mata pelajaran untuk deskripsi otomatis pada rapor SD K13"
        actions={<Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Tambah KD</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filter:</span>
        </div>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder="Semua Mapel" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Mapel</SelectItem>
            {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSemester} onValueChange={setFilterSemester}>
          <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Semua Sem." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Semester</SelectItem>
            <SelectItem value="1">Semester 1</SelectItem>
            <SelectItem value="2">Semester 2</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40 h-8 text-sm"><SelectValue placeholder="Semua Tipe" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="Pengetahuan">Pengetahuan (KI-3)</SelectItem>
            <SelectItem value="Keterampilan">Keterampilan (KI-4)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookMarked className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Belum ada KD. Klik "Tambah KD" untuk memulai.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([subName, kds]) => (
            <div key={subName} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 bg-primary/5 border-b border-border flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">{subName}</span>
                <span className="text-xs text-muted-foreground ml-auto">{kds.length} KD</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground w-24">Kode</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Deskripsi KD</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground w-32">Tipe</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground w-24">Semester</th>
                    <th className="px-4 py-2 text-center font-medium text-muted-foreground w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {kds.map(kd => (
                    <tr key={kd.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-medium text-primary">{kd.code}</td>
                      <td className="px-4 py-2.5">{kd.description}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${kd.type === 'Pengetahuan' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {kd.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">Sem. {kd.semester}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => openEdit(kd)}><Edit className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="w-7 h-7 hover:text-destructive" onClick={() => handleDelete(kd.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Tambah'} Kompetensi Dasar</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Mata Pelajaran <span className="text-destructive">*</span></Label>
              <Select value={form.subject_id} onValueChange={v => setField('subject_id', v)}>
                <SelectTrigger><SelectValue placeholder="Pilih mata pelajaran..." /></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Tipe KD</Label>
                <Select value={form.type} onValueChange={v => setField('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pengetahuan">Pengetahuan (KI-3)</SelectItem>
                    <SelectItem value="Keterampilan">Keterampilan (KI-4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Semester</Label>
                <Select value={form.semester} onValueChange={v => setField('semester', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Kode KD <span className="text-destructive">*</span></Label>
                <Input value={form.code} onChange={e => setField('code', e.target.value)} placeholder="cth: 3.1" />
              </div>
              <div className="space-y-1">
                <Label>Tahun Ajaran</Label>
                <Input value={form.academic_year} onChange={e => setField('academic_year', e.target.value)} placeholder="2024/2025" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Deskripsi KD <span className="text-destructive">*</span></Label>
              <Input value={form.description} onChange={e => setField('description', e.target.value)} placeholder="cth: Mengenal teks deskripsi sederhana..." />
            </div>
            <div className="space-y-1">
              <Label>Urutan</Label>
              <Input type="number" value={form.order_index} onChange={e => setField('order_index', Number(e.target.value))} />
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
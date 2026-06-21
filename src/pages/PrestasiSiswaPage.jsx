import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Trophy, Search } from 'lucide-react';

const CATEGORIES = ['Akademik', 'Non-Akademik', 'Seni', 'Olahraga', 'Keagamaan', 'Lainnya'];
const LEVELS = ['Sekolah', 'Kecamatan', 'Kabupaten/Kota', 'Provinsi', 'Nasional', 'Internasional'];

const emptyForm = { student_id: '', student_name: '', class_id: '', academic_year: '2024/2025', semester: '1', category: 'Akademik', title: '', level: 'Sekolah', rank: '', date: '', organizer: '' };

export default function PrestasiSiswaPage() {
  const [prestasiList, setPrestasiList] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [p, s, c] = await Promise.all([
      base44.entities.Prestasi.list('-date', 300),
      base44.entities.Student.list('full_name', 300),
      base44.entities.ClassRoom.list('name', 50),
    ]);
    setPrestasiList(p);
    setStudents(s);
    setClasses(c);
    setLoading(false);
  }

  function openNew() { setForm(emptyForm); setEditingId(null); setDialogOpen(true); }
  function openEdit(p) {
    setForm({ student_id: p.student_id, student_name: p.student_name || '', class_id: p.class_id || '', academic_year: p.academic_year || '2024/2025', semester: p.semester || '1', category: p.category || 'Akademik', title: p.title, level: p.level || 'Sekolah', rank: p.rank || '', date: p.date || '', organizer: p.organizer || '' });
    setEditingId(p.id); setDialogOpen(true);
  }
  function setField(key, value) { setForm(f => ({ ...f, [key]: value })); }

  async function handleSave() {
    if (!form.student_id || !form.title) { toast({ title: 'Perhatian', description: 'Siswa dan nama prestasi wajib diisi.' }); return; }
    setSaving(true);
    const stu = students.find(s => s.id === form.student_id);
    const payload = { ...form, student_name: stu?.full_name || form.student_name, class_id: stu?.class_id || form.class_id };
    if (editingId) await base44.entities.Prestasi.update(editingId, payload);
    else await base44.entities.Prestasi.create(payload);
    toast({ title: 'Berhasil', description: 'Prestasi berhasil disimpan.' });
    setDialogOpen(false); setSaving(false); loadData();
  }

  async function handleDelete(id) {
    if (!window.confirm('Hapus data prestasi ini?')) return;
    await base44.entities.Prestasi.delete(id);
    toast({ title: 'Dihapus' });
    loadData();
  }

  const filtered = prestasiList.filter(p =>
    (!search || p.student_name?.toLowerCase().includes(search.toLowerCase()) || p.title?.toLowerCase().includes(search.toLowerCase())) &&
    (filterClass === 'all' || p.class_id === filterClass)
  );

  const levelColor = { Sekolah: 'bg-gray-100 text-gray-700', Kecamatan: 'bg-blue-100 text-blue-700', 'Kabupaten/Kota': 'bg-indigo-100 text-indigo-700', Provinsi: 'bg-purple-100 text-purple-700', Nasional: 'bg-orange-100 text-orange-700', Internasional: 'bg-yellow-100 text-yellow-700' };

  return (
    <div className="p-6">
      <PageHeader
        title="Prestasi Siswa"
        description="Pencatatan prestasi akademik dan non-akademik siswa"
        actions={<Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Tambah Prestasi</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Cari nama siswa atau prestasi..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelas</SelectItem>
            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Belum ada data prestasi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm leading-tight">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.student_name}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => openEdit(p)}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="w-7 h-7 hover:text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColor[p.level] || 'bg-gray-100 text-gray-700'}`}>{p.level}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{p.category}</span>
                {p.rank && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">{p.rank}</span>}
              </div>
              {p.organizer && <p className="text-xs text-muted-foreground mt-2">{p.organizer}</p>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Tambah'} Prestasi Siswa</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Siswa <span className="text-destructive">*</span></Label>
              <Select value={form.student_id} onValueChange={v => setField('student_id', v)}>
                <SelectTrigger><SelectValue placeholder="Pilih siswa..." /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Nama Prestasi / Penghargaan <span className="text-destructive">*</span></Label>
              <Input value={form.title} onChange={e => setField('title', e.target.value)} placeholder="cth: Juara 1 Lomba Matematika" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Kategori</Label>
                <Select value={form.category} onValueChange={v => setField('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Tingkat</Label>
                <Select value={form.level} onValueChange={v => setField('level', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Juara / Peringkat</Label>
                <Input value={form.rank} onChange={e => setField('rank', e.target.value)} placeholder="cth: Juara 1" />
              </div>
              <div className="space-y-1">
                <Label>Tanggal</Label>
                <Input type="date" value={form.date} onChange={e => setField('date', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Penyelenggara</Label>
              <Input value={form.organizer} onChange={e => setField('organizer', e.target.value)} placeholder="cth: Dinas Pendidikan Kab. ..." />
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
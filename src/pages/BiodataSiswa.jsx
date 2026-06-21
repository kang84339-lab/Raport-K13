import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageHeader from '@/components/shared/PageHeader';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Printer, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const TABS = ['Informasi Pribadi', 'Alamat', 'Data Orang Tua / Wali'];

const emptyForm = {
  full_name: '', nickname: '', nis: '', nisn: '',
  birth_place: '', birth_date: '', gender: '', religion: '',
  phone: '', photo_url: '',
  street_address: '', village: '', district: '', city: '', province: '', postal_code: '',
  father_name: '', father_job: '', mother_name: '', mother_job: '',
  guardian_name: '', guardian_job: '',
  class_id: '', class_name: '', status: 'active',
};

export default function BiodataSiswa() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [s, c] = await Promise.all([
      base44.entities.Student.list('-created_date', 200),
      base44.entities.ClassRoom.list('name', 100),
    ]);
    setStudents(s);
    setClasses(c);
    setLoading(false);
  }

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setActiveTab(0);
    setDialogOpen(true);
  }

  function openEdit(s) {
    setForm({
      full_name: s.full_name || '', nickname: s.nickname || '',
      nis: s.nis || '', nisn: s.nisn || '',
      birth_place: s.birth_place || '', birth_date: s.birth_date || '',
      gender: s.gender || '', religion: s.religion || '',
      phone: s.phone || '', photo_url: s.photo_url || '',
      street_address: s.street_address || '', village: s.village || '',
      district: s.district || '', city: s.city || '',
      province: s.province || '', postal_code: s.postal_code || '',
      father_name: s.father_name || '', father_job: s.father_job || '',
      mother_name: s.mother_name || '', mother_job: s.mother_job || '',
      guardian_name: s.guardian_name || '', guardian_job: s.guardian_job || '',
      class_id: s.class_id || '', class_name: s.class_name || '',
      status: s.status || 'active',
    });
    setEditingId(s.id);
    setActiveTab(0);
    setDialogOpen(true);
  }

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.full_name || !form.nis || !form.class_id) {
      toast({ title: 'Perhatian', description: 'Nama Lengkap, NIS, dan Kelas wajib diisi.' });
      return;
    }
    setSaving(true);
    const cls = classes.find(c => c.id === form.class_id);
    const payload = {
      ...form,
      class_name: cls?.name || form.class_name,
      address: [form.street_address, form.village, form.district, form.city, form.province].filter(Boolean).join(', '),
      parent_name: form.father_name || form.guardian_name,
    };
    if (editingId) {
      await base44.entities.Student.update(editingId, payload);
    } else {
      await base44.entities.Student.create(payload);
    }
    toast({ title: 'Berhasil', description: `Biodata siswa ${editingId ? 'diperbarui' : 'disimpan'}.` });
    setDialogOpen(false);
    setSaving(false);
    loadData();
  }

  const filtered = students.filter(s => {
    const matchSearch = !search || s.full_name?.toLowerCase().includes(search.toLowerCase()) || s.nis?.includes(search) || s.nisn?.includes(search);
    const matchClass = filterClass === 'all' || s.class_id === filterClass;
    return matchSearch && matchClass;
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Biodata Siswa"
        description="Manajemen data biodata lengkap siswa sesuai standar Rapor K13"
        actions={
          <Button onClick={openNew} className="gap-2">
            <Plus className="w-4 h-4" /> Tambah Siswa
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Cari nama, NIS, atau NISN..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Semua Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelas</SelectItem>
            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Belum ada data siswa.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">No</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nama Lengkap</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">NIS</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">NISN</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Kelas</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">L/P</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Agama</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s, i) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{s.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.nis}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.nisn || '-'}</td>
                  <td className="px-4 py-3">{s.class_name || '-'}</td>
                  <td className="px-4 py-3">{s.gender === 'Laki-laki' ? 'L' : 'P'}</td>
                  <td className="px-4 py-3">{s.religion || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => openEdit(s)}>
                        <Edit className="w-3 h-3" /> Edit
                      </Button>
                      <Link to={`/print-biodata?id=${s.id}`} target="_blank">
                        <Button size="sm" variant="outline" className="gap-1 text-xs">
                          <Printer className="w-3 h-3" /> Cetak
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog Form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Tambah'} Biodata Siswa</DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex border-b border-border mb-4">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === idx ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 0: Informasi Pribadi */}
          {activeTab === 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label>Nama Lengkap <span className="text-destructive">*</span></Label>
                <Input value={form.full_name} onChange={e => setField('full_name', e.target.value)} placeholder="Nama sesuai akta lahir" />
              </div>
              <div className="space-y-1">
                <Label>Nama Panggilan</Label>
                <Input value={form.nickname} onChange={e => setField('nickname', e.target.value)} placeholder="Nama panggilan" />
              </div>
              <div className="space-y-1">
                <Label>Jenis Kelamin <span className="text-destructive">*</span></Label>
                <Select value={form.gender} onValueChange={v => setField('gender', v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>NIS <span className="text-destructive">*</span></Label>
                <Input value={form.nis} onChange={e => setField('nis', e.target.value)} placeholder="Nomor Induk Siswa" />
              </div>
              <div className="space-y-1">
                <Label>NISN</Label>
                <Input value={form.nisn} onChange={e => setField('nisn', e.target.value)} placeholder="Nomor Induk Siswa Nasional" />
              </div>
              <div className="space-y-1">
                <Label>Tempat Lahir</Label>
                <Input value={form.birth_place} onChange={e => setField('birth_place', e.target.value)} placeholder="Kota lahir" />
              </div>
              <div className="space-y-1">
                <Label>Tanggal Lahir</Label>
                <Input type="date" value={form.birth_date} onChange={e => setField('birth_date', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Agama</Label>
                <Select value={form.religion} onValueChange={v => setField('religion', v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih agama..." /></SelectTrigger>
                  <SelectContent>
                    {['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>No. Telepon / HP</Label>
                <Input value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="Nomor telepon" />
              </div>
              <div className="space-y-1">
                <Label>Kelas <span className="text-destructive">*</span></Label>
                <Select value={form.class_id} onValueChange={v => setField('class_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih kelas..." /></SelectTrigger>
                  <SelectContent>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setField('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    <SelectItem value="graduated">Lulus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Tab 1: Alamat */}
          {activeTab === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label>Jalan / RT / RW</Label>
                <Input value={form.street_address} onChange={e => setField('street_address', e.target.value)} placeholder="Contoh: Jl. Merdeka No.5 RT 02/03" />
              </div>
              <div className="space-y-1">
                <Label>Desa / Kelurahan</Label>
                <Input value={form.village} onChange={e => setField('village', e.target.value)} placeholder="Desa / Kelurahan" />
              </div>
              <div className="space-y-1">
                <Label>Kecamatan</Label>
                <Input value={form.district} onChange={e => setField('district', e.target.value)} placeholder="Kecamatan" />
              </div>
              <div className="space-y-1">
                <Label>Kabupaten / Kota</Label>
                <Input value={form.city} onChange={e => setField('city', e.target.value)} placeholder="Kabupaten / Kota" />
              </div>
              <div className="space-y-1">
                <Label>Provinsi</Label>
                <Input value={form.province} onChange={e => setField('province', e.target.value)} placeholder="Provinsi" />
              </div>
              <div className="space-y-1">
                <Label>Kode Pos</Label>
                <Input value={form.postal_code} onChange={e => setField('postal_code', e.target.value)} placeholder="Kode Pos" maxLength={5} />
              </div>
            </div>
          )}

          {/* Tab 2: Data Orang Tua / Wali */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data Ayah</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Nama Ayah</Label>
                  <Input value={form.father_name} onChange={e => setField('father_name', e.target.value)} placeholder="Nama lengkap ayah" />
                </div>
                <div className="space-y-1">
                  <Label>Pekerjaan Ayah</Label>
                  <Input value={form.father_job} onChange={e => setField('father_job', e.target.value)} placeholder="Pekerjaan ayah" />
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data Ibu</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Nama Ibu</Label>
                  <Input value={form.mother_name} onChange={e => setField('mother_name', e.target.value)} placeholder="Nama lengkap ibu" />
                </div>
                <div className="space-y-1">
                  <Label>Pekerjaan Ibu</Label>
                  <Input value={form.mother_job} onChange={e => setField('mother_job', e.target.value)} placeholder="Pekerjaan ibu" />
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data Wali (Jika Ada)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Nama Wali</Label>
                  <Input value={form.guardian_name} onChange={e => setField('guardian_name', e.target.value)} placeholder="Nama wali (opsional)" />
                </div>
                <div className="space-y-1">
                  <Label>Pekerjaan Wali</Label>
                  <Input value={form.guardian_job} onChange={e => setField('guardian_job', e.target.value)} placeholder="Pekerjaan wali" />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6 pt-4 border-t border-border">
            <div className="flex gap-2">
              {activeTab > 0 && <Button variant="outline" onClick={() => setActiveTab(t => t - 1)}>← Sebelumnya</Button>}
            </div>
            <div className="flex gap-2">
              {activeTab < TABS.length - 1 ? (
                <Button onClick={() => setActiveTab(t => t + 1)}>Selanjutnya →</Button>
              ) : (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Biodata'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
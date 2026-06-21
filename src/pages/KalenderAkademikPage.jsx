import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Calendar, CalendarDays } from 'lucide-react';

const emptyForm = { academic_year: '2024/2025', semester: '1', effective_days: '', start_date: '', end_date: '', mid_exam_start: '', mid_exam_end: '', final_exam_start: '', final_exam_end: '', report_date: '', note: '' };

export default function KalenderAkademikPage() {
  const [kalenderList, setKalenderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const data = await base44.entities.KalenderAkademik.list('-academic_year', 50);
    setKalenderList(data);
    setLoading(false);
  }

  function openNew() { setForm(emptyForm); setEditingId(null); setDialogOpen(true); }
  function openEdit(k) {
    setForm({ academic_year: k.academic_year || '2024/2025', semester: k.semester || '1', effective_days: k.effective_days ?? '', start_date: k.start_date || '', end_date: k.end_date || '', mid_exam_start: k.mid_exam_start || '', mid_exam_end: k.mid_exam_end || '', final_exam_start: k.final_exam_start || '', final_exam_end: k.final_exam_end || '', report_date: k.report_date || '', note: k.note || '' });
    setEditingId(k.id); setDialogOpen(true);
  }
  function setField(key, value) { setForm(f => ({ ...f, [key]: value })); }

  async function handleSave() {
    if (!form.academic_year || !form.semester) { toast({ title: 'Perhatian', description: 'Tahun ajaran dan semester wajib diisi.' }); return; }
    setSaving(true);
    const payload = { ...form, effective_days: form.effective_days ? Number(form.effective_days) : null };
    if (editingId) await base44.entities.KalenderAkademik.update(editingId, payload);
    else await base44.entities.KalenderAkademik.create(payload);
    toast({ title: 'Berhasil', description: 'Kalender akademik tersimpan.' });
    setDialogOpen(false); setSaving(false); loadData();
  }

  async function handleDelete(id) {
    if (!window.confirm('Hapus data kalender ini?')) return;
    await base44.entities.KalenderAkademik.delete(id);
    toast({ title: 'Dihapus' });
    loadData();
  }

  const formatDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  return (
    <div className="p-6">
      <PageHeader
        title="Kalender Akademik"
        description="Pengaturan hari efektif dan jadwal kegiatan akademik per semester"
        actions={<Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Tambah Kalender</Button>}
      />

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : kalenderList.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Belum ada kalender akademik.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {kalenderList.map(k => (
            <div key={k.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">T.A. {k.academic_year}</p>
                    <p className="text-sm text-muted-foreground">Semester {k.semester === '1' ? '1 (Ganjil)' : '2 (Genap)'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => openEdit(k)}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="w-8 h-8 hover:text-destructive" onClick={() => handleDelete(k.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Hari Efektif</p>
                  <p className="font-semibold">{k.effective_days ?? '-'} hari</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Pembagian Rapor</p>
                  <p className="font-semibold">{formatDate(k.report_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Awal Semester</p>
                  <p>{formatDate(k.start_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Akhir Semester</p>
                  <p>{formatDate(k.end_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">UTS/PTS</p>
                  <p>{formatDate(k.mid_exam_start)} — {formatDate(k.mid_exam_end)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">UAS/PAT</p>
                  <p>{formatDate(k.final_exam_start)} — {formatDate(k.final_exam_end)}</p>
                </div>
                {k.note && <div className="col-span-2 text-muted-foreground text-xs">{k.note}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Tambah'} Kalender Akademik</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Tahun Ajaran <span className="text-destructive">*</span></Label>
                <Input value={form.academic_year} onChange={e => setField('academic_year', e.target.value)} placeholder="2024/2025" />
              </div>
              <div className="space-y-1">
                <Label>Semester <span className="text-destructive">*</span></Label>
                <Select value={form.semester} onValueChange={v => setField('semester', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1 (Ganjil)</SelectItem>
                    <SelectItem value="2">Semester 2 (Genap)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Jumlah Hari Efektif</Label>
              <Input type="number" value={form.effective_days} onChange={e => setField('effective_days', e.target.value)} placeholder="cth: 120" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Awal Semester</Label><Input type="date" value={form.start_date} onChange={e => setField('start_date', e.target.value)} /></div>
              <div className="space-y-1"><Label>Akhir Semester</Label><Input type="date" value={form.end_date} onChange={e => setField('end_date', e.target.value)} /></div>
              <div className="space-y-1"><Label>Mulai UTS/PTS</Label><Input type="date" value={form.mid_exam_start} onChange={e => setField('mid_exam_start', e.target.value)} /></div>
              <div className="space-y-1"><Label>Selesai UTS/PTS</Label><Input type="date" value={form.mid_exam_end} onChange={e => setField('mid_exam_end', e.target.value)} /></div>
              <div className="space-y-1"><Label>Mulai UAS/PAT</Label><Input type="date" value={form.final_exam_start} onChange={e => setField('final_exam_start', e.target.value)} /></div>
              <div className="space-y-1"><Label>Selesai UAS/PAT</Label><Input type="date" value={form.final_exam_end} onChange={e => setField('final_exam_end', e.target.value)} /></div>
            </div>
            <div className="space-y-1"><Label>Tanggal Pembagian Rapor</Label><Input type="date" value={form.report_date} onChange={e => setField('report_date', e.target.value)} /></div>
            <div className="space-y-1"><Label>Catatan</Label><Textarea value={form.note} onChange={e => setField('note', e.target.value)} placeholder="Keterangan tambahan..." rows={2} /></div>
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
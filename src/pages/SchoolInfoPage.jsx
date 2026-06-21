import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2 } from 'lucide-react';

export default function SchoolInfoPage() {
  const [form, setForm] = useState({ school_name: '', npsn: '', address: '', phone: '', email: '', website: '', principal_name: '', principal_nip: '' });
  const [existingId, setExistingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      const data = await base44.entities.SchoolInfo.list();
      if (data.length > 0) {
        const info = data[0];
        setForm({
          school_name: info.school_name || '', npsn: info.npsn || '', address: info.address || '',
          phone: info.phone || '', email: info.email || '', website: info.website || '',
          principal_name: info.principal_name || '', principal_nip: info.principal_nip || ''
        });
        setExistingId(info.id);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    if (existingId) {
      await base44.entities.SchoolInfo.update(existingId, form);
    } else {
      const created = await base44.entities.SchoolInfo.create(form);
      setExistingId(created.id);
    }
    toast({ title: 'Info sekolah berhasil disimpan' });
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <PageHeader title="Informasi Sekolah" description="Data identitas sekolah untuk rapor" />
      <div className="bg-card rounded-xl border border-border p-6 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Nama Sekolah</Label>
            <Input value={form.school_name} onChange={e => setForm({...form, school_name: e.target.value})} />
          </div>
          <div>
            <Label>NPSN</Label>
            <Input value={form.npsn} onChange={e => setForm({...form, npsn: e.target.value})} />
          </div>
          <div>
            <Label>Telepon</Label>
            <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <Label>Website</Label>
            <Input value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
          </div>
          <div className="sm:col-span-2">
            <Label>Alamat</Label>
            <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          </div>
          <div>
            <Label>Nama Kepala Sekolah</Label>
            <Input value={form.principal_name} onChange={e => setForm({...form, principal_name: e.target.value})} />
          </div>
          <div>
            <Label>NIP Kepala Sekolah</Label>
            <Input value={form.principal_nip} onChange={e => setForm({...form, principal_nip: e.target.value})} />
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}
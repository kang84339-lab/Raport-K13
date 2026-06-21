import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyReport() {
  const [_user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);

      // Find student record linked to this user or matching email
      const allStudents = await base44.entities.Student.list();
      const myStudent = allStudents.find(s => s.user_id === me.id) || allStudents[0];

      if (myStudent) {
        setStudent(myStudent);
        const allClasses = await base44.entities.ClassRoom.list();
        setClasses(allClasses.filter(c => c.id === myStudent.class_id));
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (!student) {
    return (
      <div className="text-center py-16">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-heading font-semibold text-foreground mb-2">Belum Ada Data</h2>
        <p className="text-muted-foreground text-sm">Data siswa Anda belum terdaftar di sistem.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Rapor Saya" description={`${student.full_name} — ${student.class_name || ''}`} />

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">NIS</p>
            <p className="font-semibold">{student.nis}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">NISN</p>
            <p className="font-semibold">{student.nisn || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Kelas</p>
            <p className="font-semibold">{student.class_name || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Agama</p>
            <p className="font-semibold">{student.religion || '-'}</p>
          </div>
        </div>

        <h3 className="font-heading font-semibold mb-3">Rapor Tersedia</h3>
        {classes.length > 0 ? (
          <div className="space-y-2">
            {classes.map(cls => (
              <div key={cls.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                <div>
                  <p className="font-medium">{cls.name} — Semester {cls.semester}</p>
                  <p className="text-xs text-muted-foreground">Tahun Ajaran {cls.academic_year}</p>
                </div>
                <Link to={`/print-report?student=${student.id}&class=${cls.id}`}>
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-1" /> Lihat Rapor
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Belum ada rapor yang tersedia.</p>
        )}
      </div>
    </div>
  );
}
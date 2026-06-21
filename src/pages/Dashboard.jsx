import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import { Users, GraduationCap, School, BookOpen, ClipboardList, PenTool, FileText } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, to }) => {
  const Wrapper = to ? Link : 'div';
  return (
    <Wrapper to={to} className={`bg-card rounded-xl border border-border p-5 flex items-center gap-4 hover:shadow-md transition-shadow ${to ? 'cursor-pointer' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Wrapper>
  );
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);

      if (me.role === 'admin') {
        const [teachers, students, classes, subjects] = await Promise.all([
          base44.entities.Teacher.list(),
          base44.entities.Student.list(),
          base44.entities.ClassRoom.list(),
          base44.entities.Subject.list(),
        ]);
        setStats({ teachers: teachers.length, students: students.length, classes: classes.length, subjects: subjects.length });
      } else if (me.role === 'teacher' || me.role === 'homeroom') {
        const assignments = await base44.entities.TeachingAssignment.filter({ teacher_name: me.full_name });
        setStats({ assignments: assignments.length });
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const role = user?.role || 'student';

  return (
    <div>
      <PageHeader
        title={`Selamat Datang, ${user?.full_name || 'Pengguna'}`}
        description={`Anda masuk sebagai ${role === 'admin' ? 'Admin/Kurikulum' : role === 'teacher' ? 'Guru Mapel' : role === 'homeroom' ? 'Wali Kelas' : 'Siswa/Orang Tua'}`}
      />

      {role === 'admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Guru" value={stats.teachers || 0} color="bg-primary/10 text-primary" to="/teachers" />
          <StatCard icon={GraduationCap} label="Total Siswa" value={stats.students || 0} color="bg-accent/10 text-accent" to="/students" />
          <StatCard icon={School} label="Total Kelas" value={stats.classes || 0} color="bg-chart-3/10 text-chart-3" to="/classes" />
          <StatCard icon={BookOpen} label="Mata Pelajaran" value={stats.subjects || 0} color="bg-chart-4/10 text-chart-4" to="/subjects" />
        </div>
      )}

      {(role === 'teacher' || role === 'homeroom') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={ClipboardList} label="Tugas Mengajar" value={stats.assignments || 0} color="bg-primary/10 text-primary" to="/grade-input" />
          <StatCard icon={PenTool} label="Input Nilai" value="→" color="bg-accent/10 text-accent" to="/grade-input" />
          {role === 'homeroom' && (
            <StatCard icon={FileText} label="Cetak Rapor" value="→" color="bg-chart-3/10 text-chart-3" to="/report-recap" />
          )}
        </div>
      )}

      {role === 'student' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard icon={FileText} label="Lihat Rapor" value="→" color="bg-primary/10 text-primary" to="/my-report" />
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, TrendingUp, AlertTriangle, Award, BarChart2 } from 'lucide-react';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

export default function DashboardStatistik() {
  const [classes, setClasses] = useState([]);
  const [_subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const [c, s] = await Promise.all([
        base44.entities.ClassRoom.list('name', 50),
        base44.entities.Subject.list('name', 50),
      ]);
      setClasses(c);
      setSubjects(s);
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    loadStats(selectedClass);
  }, [selectedClass]);

  async function loadStats(classId) {
    setLoading(true);
    const [students, knowledgeGrades, attitudeGrades, prestasi] = await Promise.all([
      base44.entities.Student.filter({ class_id: classId }),
      base44.entities.KnowledgeGrade.filter({ class_id: classId }),
      base44.entities.AttitudeGrade.filter({ class_id: classId }),
      base44.entities.Prestasi.filter({ class_id: classId }),
    ]);

    const total = students.length;
    const predicateCounts = { A: 0, B: 0, C: 0, D: 0 };
    let belowKKM = 0;
    const subjectAvg = {};

    knowledgeGrades.forEach(g => {
      if (g.predicate) predicateCounts[g.predicate] = (predicateCounts[g.predicate] || 0) + 1;
      if (g.final_score != null && g.final_score < 75) belowKKM++;
      if (g.subject_name) {
        if (!subjectAvg[g.subject_name]) subjectAvg[g.subject_name] = { total: 0, count: 0 };
        subjectAvg[g.subject_name].total += g.final_score || 0;
        subjectAvg[g.subject_name].count++;
      }
    });

    const subjectChartData = Object.entries(subjectAvg).map(([name, v]) => ({
      name: name.length > 12 ? name.substring(0, 12) + '…' : name,
      rata: Math.round(v.total / v.count),
    })).sort((a, b) => b.rata - a.rata);

    const predicateData = Object.entries(predicateCounts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));

    const spiritualCount = {};
    attitudeGrades.forEach(g => { if (g.spiritual_grade) spiritualCount[g.spiritual_grade] = (spiritualCount[g.spiritual_grade] || 0) + 1; });

    setStats({ total, belowKKM, totalPrestasi: prestasi.length, predicateData, subjectChartData, spiritualCount });
    setLoading(false);
  }

  const StatCard = ({ icon: IconComp, label, value, color, sub }) => (
    <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <IconComp className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Statistik & Analitik Kelas"
        description="Visualisasi distribusi nilai dan analisis performa siswa"
      />

      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <label className="text-sm font-medium text-muted-foreground block mb-2">Pilih Kelas</label>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Pilih kelas..." />
          </SelectTrigger>
          <SelectContent>
            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} — T.A. {c.academic_year}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {!selectedClass ? (
        <div className="text-center py-16 text-muted-foreground">
          <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Pilih kelas untuk melihat statistik.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Siswa" value={stats.total} color="bg-blue-100 text-blue-600" />
            <StatCard icon={AlertTriangle} label="Di Bawah KKM" value={stats.belowKKM} color="bg-red-100 text-red-600" sub="nilai < 75" />
            <StatCard icon={TrendingUp} label="Nilai A" value={stats.predicateData.find(p => p.name === 'A')?.value || 0} color="bg-green-100 text-green-600" sub="predikat tertinggi" />
            <StatCard icon={Award} label="Prestasi" value={stats.totalPrestasi} color="bg-yellow-100 text-yellow-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold mb-4">Rata-rata Nilai per Mapel</h3>
              {stats.subjectChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.subjectChartData} margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v => [v, 'Rata-rata']} />
                    <Bar dataKey="rata" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-sm text-center py-10">Belum ada data nilai.</p>}
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold mb-4">Distribusi Predikat Nilai</h3>
              {stats.predicateData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={stats.predicateData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {stats.predicateData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-sm text-center py-10">Belum ada data predikat.</p>}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
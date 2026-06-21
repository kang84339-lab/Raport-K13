import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, School,
  ClipboardList, PenTool, Heart, CalendarCheck, Award,
  FileText, Settings, LogOut, ChevronLeft, ChevronRight, IdCard,
  BookMarked, LayoutGrid, ArrowRightLeft, Trophy, Calendar, BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Data Guru', path: '/teachers' },
  { icon: GraduationCap, label: 'Data Siswa', path: '/students' },
  { icon: IdCard, label: 'Biodata Siswa', path: '/biodata-siswa' },
  { icon: ArrowRightLeft, label: 'Mutasi Siswa', path: '/mutasi-siswa' },
  { icon: Trophy, label: 'Prestasi Siswa', path: '/prestasi-siswa' },
  { icon: School, label: 'Data Kelas', path: '/classes' },
  { icon: BookOpen, label: 'Mata Pelajaran', path: '/subjects' },
  { icon: ClipboardList, label: 'Tugas Mengajar', path: '/assignments' },
  { icon: BookMarked, label: 'Kompetensi Dasar', path: '/kompetensi-dasar' },
  { icon: Calendar, label: 'Kalender Akademik', path: '/kalender-akademik' },
  { icon: BarChart2, label: 'Statistik Kelas', path: '/statistik' },
  { icon: Settings, label: 'Info Sekolah', path: '/school-info' },
];

const teacherMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: PenTool, label: 'Input Nilai', path: '/grade-input' },
];

const homeroomMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: IdCard, label: 'Biodata Siswa', path: '/biodata-siswa' },
  { icon: BarChart2, label: 'Statistik Kelas', path: '/statistik' },
  { icon: PenTool, label: 'Input Nilai', path: '/grade-input' },
  { icon: LayoutGrid, label: 'Nilai Tematik', path: '/nilai-tematik' },
  { icon: Heart, label: 'Nilai Sikap', path: '/attitude-input' },
  { icon: CalendarCheck, label: 'Absensi', path: '/attendance-input' },
  { icon: Award, label: 'Ekstrakurikuler', path: '/extracurricular-input' },
  { icon: FileText, label: 'Catatan Wali', path: '/homeroom-notes' },
  { icon: Trophy, label: 'Prestasi Siswa', path: '/prestasi-siswa' },
  { icon: ClipboardList, label: 'Rekap & Cetak', path: '/report-recap' },
];

const studentMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FileText, label: 'Rapor Saya', path: '/my-report' },
];

function getMenuByRole(role) {
  switch (role) {
    case 'admin': return adminMenuItems;
    case 'teacher': return teacherMenuItems;
    case 'homeroom': return homeroomMenuItems;
    case 'student': return studentMenuItems;
    default: return studentMenuItems;
  }
}

export default function Sidebar({ userRole, collapsed, onToggle }) {
  const location = useLocation();
  const menuItems = getMenuByRole(userRole);

  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-card border-r border-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-foreground text-sm">Rapor Digital</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={onToggle} className="shrink-0">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border">
          <button
            onClick={() => base44.auth.logout('/')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Keluar' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </div>
    </>
  );
}
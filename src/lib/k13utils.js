// K13 Grading Utility Functions

export function calculateKnowledgeScore(nh1, nh2, nh3, uts, uas) {
  const scores = [nh1, nh2, nh3].filter(v => v != null && v !== '');
  if (scores.length === 0) return null;
  const avgNH = scores.reduce((a, b) => a + Number(b), 0) / scores.length;
  const utsVal = Number(uts) || 0;
  const uasVal = Number(uas) || 0;
  return Math.round(((2 * avgNH) + utsVal + uasVal) / 4);
}

export function calculateSkillScore(practice, product, project) {
  const scores = [practice, product, project].filter(v => v != null && v !== '').map(Number);
  if (scores.length === 0) return null;
  return Math.round(Math.max(...scores));
}

export function getPredicate(score, kkm = 75) {
  if (score == null) return '';
  const range = 100 - kkm;
  const interval = range / 3;
  if (score >= kkm + 2 * interval) return 'A';
  if (score >= kkm + interval) return 'B';
  if (score >= kkm) return 'C';
  return 'D';
}

export function getKnowledgeDescription(subjectName, predicate, score) {
  if (!predicate) return '';
  const descriptions = {
    'A': `Sangat baik dalam menguasai kompetensi pengetahuan ${subjectName}.`,
    'B': `Baik dalam menguasai kompetensi pengetahuan ${subjectName}.`,
    'C': `Cukup dalam menguasai kompetensi pengetahuan ${subjectName}, perlu peningkatan.`,
    'D': `Perlu bimbingan lebih lanjut dalam menguasai kompetensi pengetahuan ${subjectName}.`
  };
  return descriptions[predicate] || '';
}

export function getSkillDescription(subjectName, predicate) {
  if (!predicate) return '';
  const descriptions = {
    'A': `Sangat terampil dalam kompetensi keterampilan ${subjectName}.`,
    'B': `Terampil dalam kompetensi keterampilan ${subjectName}.`,
    'C': `Cukup terampil dalam kompetensi keterampilan ${subjectName}, perlu peningkatan.`,
    'D': `Perlu bimbingan lebih lanjut dalam kompetensi keterampilan ${subjectName}.`
  };
  return descriptions[predicate] || '';
}

export function getSpiritualDescription(grade) {
  const descriptions = {
    'Sangat Baik': 'Selalu berdoa sebelum dan sesudah melakukan kegiatan, serta selalu bersyukur.',
    'Baik': 'Sering berdoa sebelum dan sesudah melakukan kegiatan, dan bersyukur.',
    'Cukup': 'Kadang-kadang berdoa sebelum dan sesudah melakukan kegiatan.',
    'Kurang': 'Perlu bimbingan untuk meningkatkan sikap spiritual.'
  };
  return descriptions[grade] || '';
}

export function getSocialDescription(grade) {
  const descriptions = {
    'Sangat Baik': 'Selalu jujur, disiplin, tanggung jawab, santun, peduli, dan percaya diri dalam berinteraksi.',
    'Baik': 'Sering menunjukkan sikap jujur, disiplin, tanggung jawab, dan santun dalam berinteraksi.',
    'Cukup': 'Kadang-kadang menunjukkan sikap jujur, disiplin, dan tanggung jawab.',
    'Kurang': 'Perlu bimbingan untuk meningkatkan sikap sosial.'
  };
  return descriptions[grade] || '';
}

export const ROLE_LABELS = {
  admin: 'Admin/Kurikulum',
  teacher: 'Guru Mapel',
  homeroom: 'Wali Kelas',
  student: 'Siswa/Orang Tua'
};
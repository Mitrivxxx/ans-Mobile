import type { PublicEvent } from '../core/scraper/events/events.types';
import type {
  GradesIndex,
  SemesterGrades,
  SubjectGrade,
} from '../core/scraper/features/grades/grades.types';
import type { Lesson } from '../core/scraper/features/plan/plan.parse';
import { referenceDateFromWeekMondayKey } from '../core/scraper/features/plan/plan.dateRange';
import type { ProfileSummary } from '../core/scraper/features/profile/profile.types';
import { getCurrentWeek } from '../features/dashboard/utils/workWeek';

export const DEMO_USER_KEY = 'demo-screenshots';

export const DEMO_PROFILE_SUMMARY: ProfileSummary = {
  firstName: 'Anna',
  lastName: 'Kowalska',
  albumNumber: '482917',
  major: 'Informatyka — studia inżynierskie',
  photo: '',
};

const DEMO_SUBJECTS: SubjectGrade[] = [
  {
    subject: 'Programowanie aplikacji mobilnych',
    teacher: 'dr inż. Piotr Nowak',
    finalGrade: '5,0',
    subjectWeight: 6,
    weightedAverage: '5,0',
    pplsId: 1,
    partialGrades: [
      {
        form: 'Projekt zespołowy',
        finalGrade: '5,0',
        partialGrades: [
          { label: 'MVP aplikacji', value: '5,0' },
          { label: 'Prezentacja', value: '4,5' },
        ],
      },
      {
        form: 'Kolokwium',
        finalGrade: '5,0',
        partialGrades: [{ label: 'Kolokwium 1', value: '5,0' }],
      },
    ],
  },
  {
    subject: 'Bazy danych',
    teacher: 'prof. dr hab. Maria Wiśniewska',
    finalGrade: '4,5',
    subjectWeight: 5,
    weightedAverage: '4,5',
    pplsId: 2,
    partialGrades: [
      {
        form: 'Laboratorium',
        finalGrade: '4,5',
        partialGrades: [
          { label: 'Projekt ER', value: '5,0' },
          { label: 'SQL — zadania', value: '4,0' },
        ],
      },
    ],
  },
  {
    subject: 'Systemy operacyjne',
    teacher: 'mgr inż. Tomasz Zieliński',
    finalGrade: '4,0',
    subjectWeight: 4,
    weightedAverage: '4,0',
    pplsId: 3,
    partialGrades: [
      {
        form: 'Ćwiczenia',
        finalGrade: '4,0',
        partialGrades: [
          { label: 'Shell scripting', value: '4,5' },
          { label: 'Procesy i wątki', value: '3,5' },
        ],
      },
    ],
  },
  {
    subject: 'Sieci komputerowe',
    teacher: 'dr inż. Katarzyna Lewandowska',
    finalGrade: '5,0',
    subjectWeight: 5,
    weightedAverage: '5,0',
    pplsId: 4,
    partialGrades: [
      {
        form: 'Wykład',
        finalGrade: '5,0',
        partialGrades: [{ label: 'Egzamin', value: '5,0' }],
      },
    ],
  },
  {
    subject: 'Zarządzanie projektami IT',
    teacher: 'dr Joanna Kamińska',
    finalGrade: '4,5',
    subjectWeight: 3,
    weightedAverage: '4,5',
    pplsId: 5,
    partialGrades: [
      {
        form: 'Seminarium',
        finalGrade: '4,5',
        partialGrades: [
          { label: 'Plan projektu', value: '4,5' },
          { label: 'Raport końcowy', value: '4,5' },
        ],
      },
    ],
  },
];

export const DEMO_SEMESTER_GRADES: SemesterGrades = {
  semester: 4,
  semesterLabel: 'Semestr 4',
  academicSemester: '2025/2026',
  semesterType: 'Zimowy',
  semesterStatus: 'W trakcie',
  semesterAverage: '4,6',
  subjects: DEMO_SUBJECTS,
};

export const DEMO_GRADES_INDEX: GradesIndex = {
  semesters: [
    {
      semester: 4,
      semesterLabel: 'Semestr 4',
      academicSemester: '2025/2026',
      semesterType: 'Zimowy',
      semesterStatus: 'W trakcie',
      requestPath: '/demo',
    },
  ],
  initialSemesterNumber: 4,
};

export const DEMO_EVENTS: PublicEvent[] = [
  {
    id: 'demo-1',
    title: 'Dzień otwarty Wydziału Informatyki',
    url: 'https://ans-ns.edu.pl',
    dateLabel: '12 czerwca',
    day: 12,
    monthLabel: 'CZE',
  },
  {
    id: 'demo-2',
    title: 'Rekrutacja na praktyki letnie',
    url: 'https://ans-ns.edu.pl',
    dateLabel: '18 czerwca',
    day: 18,
    monthLabel: 'CZE',
  },
  {
    id: 'demo-3',
    title: 'Konferencja studencka InnoTech',
    url: 'https://ans-ns.edu.pl',
    dateLabel: '25 czerwca',
    day: 25,
    monthLabel: 'CZE',
  },
];

function formatLessonDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
}

function demoDayLessons(date: Date): Lesson[] {
  const dateLabel = formatLessonDate(date);
  const weekday = date.getDay();

  if (weekday === 0 || weekday === 6) {
    return [];
  }

  const lessons: Lesson[] = [
    {
      date: dateLabel,
      from: '08:00',
      to: '09:30',
      duration: '1,5',
      room: 's. 204',
      teacher: 'dr inż. Piotr Nowak',
      subject: 'Programowanie aplikacji mobilnych',
      type: 'W',
      groups: 'W1',
      notes: '',
    },
    {
      date: dateLabel,
      from: '10:00',
      to: '11:30',
      duration: '1,5',
      room: 'lab. 12',
      teacher: 'prof. dr hab. Maria Wiśniewska',
      subject: 'Bazy danych',
      type: 'L',
      groups: 'L2',
      notes: '',
    },
  ];

  if (weekday === 2 || weekday === 4) {
    lessons.push({
      date: dateLabel,
      from: '12:15',
      to: '13:45',
      duration: '1,5',
      room: 's. 118',
      teacher: 'mgr inż. Tomasz Zieliński',
      subject: 'Systemy operacyjne',
      type: 'Ćw',
      groups: 'Ćw1',
      notes: '',
    });
  }

  if (weekday === 3) {
    lessons.push({
      date: dateLabel,
      from: '14:00',
      to: '15:30',
      duration: '1,5',
      room: 's. 301',
      teacher: 'dr inż. Katarzyna Lewandowska',
      subject: 'Sieci komputerowe',
      type: 'W',
      groups: 'W2',
      notes: 'Zajęcia online',
    });
  }

  return lessons;
}

/** Lekcje na bieżący tydzień (panel harmonogramu na dashboardzie). */
export function getDemoWeekLessons(weekMondayKey?: string): Lesson[] {
  const referenceDate = weekMondayKey
    ? referenceDateFromWeekMondayKey(weekMondayKey)
    : new Date();
  const week = getCurrentWeek(referenceDate);
  return week.flatMap((day) => demoDayLessons(day.date));
}

/** Lekcje na bieżący miesiąc (ekran Plan w sidebarze). */
export function getDemoMonthLessons(referenceDate = new Date()): Lesson[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lessons: Lesson[] = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    lessons.push(...demoDayLessons(new Date(year, month, day)));
  }

  return lessons;
}

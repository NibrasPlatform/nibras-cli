import type { CatalogCourse } from '@nibras/contracts';
import GridCell from './GridCell';
import styles from './planner.module.css';

type DraftPlannedCourse = {
  catalogCourseId: string;
  plannedYear: number;
  plannedTerm: 'fall' | 'spring';
  sourceType: 'standard' | 'transfer' | 'petition' | 'manual';
  note: string | null;
};

type PlannerGridProps = {
  draftCourses: DraftPlannedCourse[];
  catalogCourses: CatalogCourse[];
  isLocked: boolean;
  onRemove: (catalogCourseId: string) => void;
};

const YEARS = [1, 2, 3, 4] as const;

function getCellCourses(
  draftCourses: DraftPlannedCourse[],
  year: number,
  term: 'fall' | 'spring'
): DraftPlannedCourse[] {
  return draftCourses.filter((c) => c.plannedYear === year && c.plannedTerm === term);
}

function getCellUnits(
  draftCourses: DraftPlannedCourse[],
  catalogCourses: CatalogCourse[],
  year: number,
  term: 'fall' | 'spring'
): number {
  return getCellCourses(draftCourses, year, term).reduce((sum, course) => {
    const catalog = catalogCourses.find((c) => c.id === course.catalogCourseId);
    return sum + (catalog?.defaultUnits ?? 0);
  }, 0);
}

export default function PlannerGrid({
  draftCourses,
  catalogCourses,
  isLocked,
  onRemove,
}: PlannerGridProps) {
  return (
    <div className={styles.gridWrapper}>
      <div className={styles.grid}>
        {/* ── Header row: blank + Year 1…4 ── */}
        <div /> {/* blank top-left corner */}
        {YEARS.map((year) => (
          <div key={`header-${year}`} className={styles.gridHeader}>
            Year {year}
          </div>
        ))}
        {/* ── Fall row ── */}
        <div className={styles.gridRowLabel}>Fall</div>
        {YEARS.map((year) => (
          <GridCell
            key={`fall-${year}`}
            year={year}
            term="fall"
            courses={getCellCourses(draftCourses, year, 'fall')}
            catalogCourses={catalogCourses}
            isLocked={isLocked}
            onRemove={onRemove}
          />
        ))}
        {/* ── Spring row ── */}
        <div className={styles.gridRowLabel}>Spring</div>
        {YEARS.map((year) => (
          <GridCell
            key={`spring-${year}`}
            year={year}
            term="spring"
            courses={getCellCourses(draftCourses, year, 'spring')}
            catalogCourses={catalogCourses}
            isLocked={isLocked}
            onRemove={onRemove}
          />
        ))}
        {/* ── Totals row ── */}
        <div className={styles.totalCellLabel}>Units</div>
        {YEARS.map((year) => {
          const fall = getCellUnits(draftCourses, catalogCourses, year, 'fall');
          const spring = getCellUnits(draftCourses, catalogCourses, year, 'spring');
          const total = fall + spring;
          return (
            <div key={`total-${year}`} className={styles.totalCell}>
              {fall} / {spring}
              {total > 0 && (
                <span style={{ display: 'block', fontSize: 10, opacity: 0.7 }}>{total} total</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

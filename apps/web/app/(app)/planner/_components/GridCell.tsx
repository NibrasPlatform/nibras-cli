'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { CatalogCourse } from '@nibras/contracts';
import styles from './planner.module.css';

type DraftPlannedCourse = {
  catalogCourseId: string;
  plannedYear: number;
  plannedTerm: 'fall' | 'spring';
  sourceType: 'standard' | 'transfer' | 'petition' | 'manual';
  note: string | null;
};

type DragData = {
  catalogCourseId: string;
  sourceYear: number;
  sourceTerm: 'fall' | 'spring';
};

type CourseChipProps = {
  course: DraftPlannedCourse;
  catalogCourse: CatalogCourse | undefined;
  isLocked: boolean;
  onRemove: () => void;
};

function CourseChip({ course, catalogCourse, isLocked, onRemove }: CourseChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: course.catalogCourseId,
    data: {
      catalogCourseId: course.catalogCourseId,
      sourceYear: course.plannedYear,
      sourceTerm: course.plannedTerm,
    } satisfies DragData,
    disabled: isLocked,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`${styles.chip} ${isDragging ? styles.chipDragging : ''}`}
      style={{ transform: CSS.Transform.toString(transform) }}
      title={catalogCourse?.title ?? course.catalogCourseId}
    >
      <span className={styles.chipTitle}>{catalogCourse?.title ?? course.catalogCourseId}</span>
      {!isLocked && (
        <button
          type="button"
          className={styles.chipRemove}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${catalogCourse?.title ?? 'course'}`}
        >
          ×
        </button>
      )}
    </div>
  );
}

type GridCellProps = {
  year: number;
  term: 'fall' | 'spring';
  courses: DraftPlannedCourse[];
  catalogCourses: CatalogCourse[];
  isLocked: boolean;
  onRemove: (catalogCourseId: string) => void;
};

export default function GridCell({
  year,
  term,
  courses,
  catalogCourses,
  isLocked,
  onRemove,
}: GridCellProps) {
  const cellId = `cell-${year}-${term}`;

  const { setNodeRef, isOver } = useDroppable({
    id: cellId,
    disabled: isLocked,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.cell} ${isOver ? styles.cellOver : ''} ${isLocked ? styles.cellLocked : ''}`}
    >
      {courses.map((course) => {
        const catalogCourse = catalogCourses.find((c) => c.id === course.catalogCourseId);
        return (
          <CourseChip
            key={course.catalogCourseId}
            course={course}
            catalogCourse={catalogCourse}
            isLocked={isLocked}
            onRemove={() => onRemove(course.catalogCourseId)}
          />
        );
      })}
    </div>
  );
}

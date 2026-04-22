'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { CatalogCourse } from '@nibras/contracts';
import styles from './planner.module.css';

type DragData = {
  catalogCourseId: string;
  sourceYear: null;
  sourceTerm: null;
};

type PaletteChipProps = {
  course: CatalogCourse;
  isLocked: boolean;
};

function PaletteChip({ course, isLocked }: PaletteChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: course.id,
    data: {
      catalogCourseId: course.id,
      sourceYear: null,
      sourceTerm: null,
    } satisfies DragData,
    disabled: isLocked,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`${styles.paletteChip} ${isDragging ? styles.paletteChipDragging : ''}`}
      style={{ transform: CSS.Transform.toString(transform) }}
      title={course.title}
    >
      {course.title}
    </div>
  );
}

type CoursePaletteProps = {
  unplacedCourses: CatalogCourse[];
  isLocked: boolean;
};

export default function CoursePalette({ unplacedCourses, isLocked }: CoursePaletteProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'palette',
    disabled: isLocked,
  });

  return (
    <div ref={setNodeRef} className={`${styles.palette} ${isOver ? styles.paletteOver : ''}`}>
      <p className={styles.paletteTitle}>
        Course Palette
        {unplacedCourses.length > 0 && <span> · {unplacedCourses.length}</span>}
      </p>

      {unplacedCourses.length === 0 ? (
        <p className={styles.paletteEmpty}>All courses placed</p>
      ) : (
        unplacedCourses.map((course) => (
          <PaletteChip key={course.id} course={course} isLocked={isLocked} />
        ))
      )}
    </div>
  );
}

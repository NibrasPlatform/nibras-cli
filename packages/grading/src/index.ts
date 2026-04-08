// ============================================================
// @nibras/grading — Public API
// ============================================================

// Main runner
export { grade } from "./runner";

// Individual validators (for direct use if needed)
export { gradeMCQ } from "./validators/mcq";
export { gradeExam } from "./validators/exam";
export { gradeFile } from "./validators/file";

// Types
export type {
  // Config
  GradingConfig,

  // MCQ
  MCQQuestion,
  MCQResult,
  MCQGradingResult,

  // Exam
  ExamQuestion,
  StudentAnswer,
  ExamQuestionResult,
  ExamGradingResult,

  // File
  FileGradingInput,
  FileGradingResult,

  // Union types
  GradingInput,
  GradingResult,
} from "./types";

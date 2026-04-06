import { z } from 'zod';

export const MCQQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  lectureSummary: z.string().optional()
});

export const MCQAnswerSchema = z.object({
  questionId: z.string(),
  studentChoice: z.string()
});

export const MCQResultSchema = z.object({
  questionId: z.string(),
  isCorrect: z.boolean(),
  correctOption: z.string(),
  explanation: z.string(),
  score: z.number()
});

export const EssayQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  modelAnswer: z.string(),
  points: z.number(),
  rubric: z.record(z.any()).optional()
});

export const EssayResultSchema = z.object({
  questionId: z.string(),
  score: z.number(),
  maxScore: z.number(),
  feedback: z.string(),
  isCorrect: z.boolean().optional()
});

export const AssignmentResultSchema = z.object({
  totalScore: z.number(),
  maxScore: z.number(),
  percentage: z.number(),
  breakdown: z.array(z.object({
    criterion: z.string(),
    score: z.number(),
    max: z.number(),
    feedback: z.string()
  })),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  overallFeedback: z.string()
});

export type MCQQuestion = z.infer<typeof MCQQuestionSchema>;
export type MCQAnswer = z.infer<typeof MCQAnswerSchema>;
export type MCQResult = z.infer<typeof MCQResultSchema>;
export type EssayQuestion = z.infer<typeof EssayQuestionSchema>;
export type EssayResult = z.infer<typeof EssayResultSchema>;
export type AssignmentResult = z.infer<typeof AssignmentResultSchema>;
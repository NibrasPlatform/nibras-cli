import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { GradingService } from '@nibras/grading';
import { z } from 'zod';

// Zod schemas for request validation
const GradeMCQSchema = z.object({
  submissionId: z.string(),
  question: z.string(),
  studentAnswer: z.string(),
  correctOption: z.string(),
});

const GradeExamSchema = z.object({
  submissionId: z.string(),
  question: z.string(),
  modelAnswer: z.string(),
  studentAnswer: z.string(),
  rubric: z.string(),
});

export async function gradingController(fastify: FastifyInstance) {
  const gradingService = new GradingService();

  // 🔹 POST /v1/grading/mcq - لتصحيح الكويزات
  fastify.post('/mcq', {
    schema: {
      body: GradeMCQSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            score: { type: 'number' },
            is_correct: { type: 'boolean' },
            feedback: { type: 'string' },
            explanation: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof GradeMCQSchema> }>, reply: FastifyReply) => {
    try {
      const result = await gradingService.gradeMCQ(request.body);
      
      // ✅ هنا ممكن تحفظ النتيجة في الداتابيز لاحقاً
      // await fastify.db.grades.create({...})
      
      return reply.code(200).send(result);
    } catch (error) {
      fastify.log.error({ error }, 'MCQ grading failed');
      return reply.code(500).send({ error: 'Failed to grade MCQ' });
    }
  });

  // 🔹 POST /v1/grading/exam - لتصحيح الامتحانات
  fastify.post('/exam', {
    schema: {
      body: GradeExamSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            overall_score: { type: 'number' },
            criteria_breakdown: { type: 'object' },
            strengths: { type: 'array' },
            improvements: { type: 'array' },
            confidence: { type: 'number' },
            flag_for_review: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof GradeExamSchema> }>, reply: FastifyReply) => {
    try {
      const result = await gradingService.gradeExam(request.body);
      
      // ✅ لو الـ AI علم إنه محتاج مراجعة بشرية
      if (result.flag_for_review) {
        fastify.log.info({ submissionId: request.body.submissionId }, 'Submission flagged for review');
      }
      
      return reply.code(200).send(result);
    } catch (error) {
      fastify.log.error({ error }, 'Exam grading failed');
      return reply.code(500).send({ error: 'Failed to grade exam' });
    }
  });
}

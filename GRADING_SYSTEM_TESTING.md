# @nibras/grading — Testing & QA Guide

> 🎯 Goal: Ensure grading accuracy, reliability, and safe AI output  
> 👥 Audience: QA Engineers & Backend Developers

---

## 🧪 Testing Levels

### 1️⃣ Unit Tests (Validators)
```typescript
// test/validators/mcq.test.ts
import { gradeMCQ } from "../../src/validators/mcq";

test("returns correct for exact match", async () => {
  const result = await gradeMCQ({
    question: { /* ... */ },
    studentAnswer: "B. Unique identifier",
    config: { apiKey: process.env.TEST_API_KEY! },
  });
  expect(result.isCorrect).toBe(true);
  expect(result.confidence).toBeGreaterThan(0.9);
});

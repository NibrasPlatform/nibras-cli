const fs = require("fs");
const path = require("path");

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function normalizeText(text) {
  return String(text).replace(/\s+/g, " ").trim();
}

function validateGradingSchema(grading, gradingPath) {
  if (!grading || typeof grading !== "object") {
    throw new Error(`Invalid grading.json format (${gradingPath}).`);
  }
  if (!Number.isFinite(Number(grading.totalPoints)) || Number(grading.totalPoints) <= 0) {
    throw new Error(`grading.json totalPoints must be a positive number (${gradingPath}).`);
  }
  if (!Array.isArray(grading.questions) || grading.questions.length === 0) {
    throw new Error(`grading.json must include a non-empty questions array (${gradingPath}).`);
  }
  const seenIds = new Set();
  let sumPoints = 0;
  grading.questions.forEach((question) => {
    if (!question.id || typeof question.id !== "string") {
      throw new Error(`Each question must have an id (${gradingPath}).`);
    }
    if (seenIds.has(question.id)) {
      throw new Error(`Duplicate question id "${question.id}" (${gradingPath}).`);
    }
    seenIds.add(question.id);
    if (!Number.isFinite(Number(question.points)) || Number(question.points) <= 0) {
      throw new Error(`Question ${question.id} must have positive points (${gradingPath}).`);
    }
    sumPoints += Number(question.points);
    if (!question.answerFile || typeof question.answerFile !== "string") {
      throw new Error(`Question ${question.id} must have answerFile (${gradingPath}).`);
    }
    if (!Array.isArray(question.solutions) || question.solutions.length === 0) {
      throw new Error(`Question ${question.id} must have solutions array (${gradingPath}).`);
    }
    const hasSolution = question.solutions.some((solution) => typeof solution === "string" && solution.trim());
    if (!hasSolution) {
      throw new Error(`Question ${question.id} solutions must contain non-empty strings (${gradingPath}).`);
    }
  });
  const totalPoints = Number(grading.totalPoints);
  const delta = Math.abs(sumPoints - totalPoints);
  if (delta > 1e-9) {
    throw new Error(
      `Sum of question points (${sumPoints}) must equal totalPoints (${totalPoints}) (${gradingPath}).`
    );
  }
}

function autoCheck({ cwd, projectPath, gradingFile, answersDir, requireGrading }) {
  const gradingPath = path.isAbsolute(gradingFile)
    ? gradingFile
    : path.join(cwd, projectPath, gradingFile);

  if (!fs.existsSync(gradingPath)) {
    if (requireGrading) {
      throw new Error(`grading.json not found (${gradingPath}).`);
    }
    return { used: false };
  }

  const grading = readJson(gradingPath);
  validateGradingSchema(grading, gradingPath);

  const results = [];
  let earnedPoints = 0;
  const totalPoints = Number(grading.totalPoints);
  const answerBase = answersDir
    ? path.isAbsolute(answersDir)
      ? answersDir
      : path.join(cwd, answersDir)
    : path.join(cwd, projectPath);

  grading.questions.forEach((question) => {
    const answerPath = path.join(answerBase, question.answerFile);
    const points = Number(question.points);

    if (!fs.existsSync(answerPath)) {
      throw new Error(`Missing answer file for ${question.id} (${answerPath}).`);
    }

    const answerText = fs.readFileSync(answerPath, "utf8");
    if (!answerText.trim()) {
      throw new Error(`Answer file is empty for ${question.id} (${answerPath}).`);
    }

    const normalizedAnswer = normalizeText(answerText);
    const matched = question.solutions.some((solution) => {
      if (typeof solution !== "string") return false;
      const normalizedSolution = normalizeText(solution);
      return normalizedSolution && normalizedSolution === normalizedAnswer;
    });

    const earned = matched ? points : 0;
    earnedPoints += earned;

    results.push({
      id: question.id,
      points,
      earned,
      matched,
      answerPath
    });
  });

  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  return { used: true, gradingPath, earnedPoints, totalPoints, percentage, results };
}

module.exports = { autoCheck };

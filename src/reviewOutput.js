const fs = require("fs");
const path = require("path");

function writeReviewOutput({ cwd, filePath, subject, project, summary }) {
  if (!filePath) return null;
  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  const payload = {
    subject,
    project,
    earnedPoints: summary.earnedPoints,
    totalPoints: summary.totalPoints,
    percentage: summary.percentage,
    reviewRequired: summary.reviewRequired,
    results: summary.results.map((result) => ({
      id: result.id,
      mode: result.mode,
      earned: result.earned,
      points: result.points,
      matched: result.matched,
      confidence: result.confidence,
      needsReview: result.needsReview,
      criterionScores: result.criterionScores || [],
      reasoningSummary: result.reasoningSummary || "",
      evidenceQuotes: result.evidenceQuotes || [],
      answerPath: result.answerPath
    }))
  };
  fs.writeFileSync(resolvedPath, JSON.stringify(payload, null, 2));
  return resolvedPath;
}

module.exports = { writeReviewOutput };

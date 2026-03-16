const fs = require("fs");
const path = require("path");

function readJsonIfExists(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err && err.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

function sumScores(scores) {
  let earned = 0;
  let total = 0;
  for (const score of scores) {
    const earnedValue = Number(score.earned);
    const totalValue = Number(score.points);
    if (Number.isFinite(earnedValue)) earned += earnedValue;
    if (Number.isFinite(totalValue)) total += totalValue;
  }
  return { earned, total };
}

function resolveManualScore({
  cwd,
  project,
  projectConfig,
  earnedOverride,
  totalOverride,
  scoresPathOverride
}) {
  const projectPath = path.join(cwd, projectConfig.path || project);
  const scoresPath = scoresPathOverride
    ? path.isAbsolute(scoresPathOverride)
      ? scoresPathOverride
      : path.join(cwd, scoresPathOverride)
    : path.join(projectPath, projectConfig.scoresFile || "scores.json");
  const scoresData = readJsonIfExists(scoresPath) || {};

  let earnedPoints = Number(earnedOverride);
  if (!Number.isFinite(earnedPoints)) {
    if (Number.isFinite(scoresData.earnedPoints)) {
      earnedPoints = Number(scoresData.earnedPoints);
    } else if (Array.isArray(scoresData.scores)) {
      earnedPoints = sumScores(scoresData.scores).earned;
    }
  }

  let totalPoints = Number(totalOverride);
  if (!Number.isFinite(totalPoints)) {
    if (Number.isFinite(projectConfig.totalPoints)) {
      totalPoints = Number(projectConfig.totalPoints);
    } else if (Number.isFinite(scoresData.totalPoints)) {
      totalPoints = Number(scoresData.totalPoints);
    } else if (Array.isArray(scoresData.scores)) {
      totalPoints = sumScores(scoresData.scores).total;
    }
  }

  if (!Number.isFinite(earnedPoints)) {
    throw new Error("earnedPoints not found. Provide --earned or set it in scores.json.");
  }
  if (!Number.isFinite(totalPoints) || totalPoints <= 0) {
    throw new Error("totalPoints not found. Provide --total or set it in config or scores.json.");
  }

  return { earnedPoints, totalPoints, projectPath, scoresPath };
}

function computePercentage(earnedPoints, totalPoints) {
  return Math.round((earnedPoints / totalPoints) * 100);
}

module.exports = { resolveManualScore, computePercentage };

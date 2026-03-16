# nibras CLI

CLI for college subjects and projects with percentage grading. Supports `check`
grading (auto-checking or manual) and optional `check50`-backed projects.

## Install

```bash
npm install
```

## Configuration

Create `.nibras.json` in your project root:

```json
{
  "subjects": {
    "cs161": {
      "taskFile": "CS161.md",
      "projects": {
        "exam1": {
          "type": "check",
          "path": "Stanford Data/cs161/Exams/1",
          "totalPoints": 100,
          "scoresFile": "scores.json",
          "setupUrl": "https://github.com/EpitomeZied/nibras-cli/releases/download/v1/exam1.zip",
          "setupZipName": "exam1.zip",
          "setupDir": "."
        }
      }
    }
  }
}
```

For auto-checking, keep `grading.json` in a private grading repo and point
`nibras` to it using `--grading-root` or `NIBRAS_GRADING_ROOT`. Students only
need to submit their answer files.
Expected layout:
`<grading-root>/<subject>/<project>/grading.json`

Example `grading.json` (strict exact match; multiple full-answer variants):

```json
{
  "totalPoints": 100,
  "questions": [
    {
      "id": "q1",
      "points": 45,
      "answerFile": "q1.txt",
      "solutions": ["Answer A", "Answer B"]
    }
  ]
}
```

For manual grading, create `scores.json`:

```json
{
  "earnedPoints": 60,
  "totalPoints": 100
}
```

## Usage

```bash
nibras cs161 test exam1
nibras cs161 test exam1 --earned 60 --total 100
nibras cs161 submit exam1
nibras cs161 task exam1
nibras cs161 setup exam1
nibras ping
```

## Grading

`check` grading prefers auto-checking if a grading file is found (private
grading root or local `grading.json`). Otherwise it falls back to `scores.json`.

Auto-checking rules:
- Answers are compared to solutions after trimming and collapsing whitespace.
- Case-sensitive exact match.
- No partial credit (full points or zero).

Validation rules:
- `grading.json` must exist when `NIBRAS_GRADING_ROOT` or `--grading-root` is set.
- Question IDs must be unique.
- Sum of question points must equal `totalPoints`.
- Each `answerFile` must exist and be non-empty.
- `earnedPoints` must be >= 0
- `totalPoints` must be > 0
- `earnedPoints` must be <= `totalPoints`

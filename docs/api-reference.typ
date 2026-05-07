// ─────────────────────────────────────────────────────────────────────────────
//  Nibras Platform — REST API Reference
//  Typst document · May 2026
// ─────────────────────────────────────────────────────────────────────────────

// ── Colour palette (matches mentor-report.typ) ────────────────────────────────
#let accent  = rgb("#6366f1")
#let green   = rgb("#10b981")
#let amber   = rgb("#f59e0b")
#let red     = rgb("#ef4444")
#let blue    = rgb("#3b82f6")
#let ink     = rgb("#1e1b4b")
#let muted   = rgb("#64748b")
#let border  = rgb("#e2e8f0")
#let surface = rgb("#f8fafc")
#let white   = rgb("#ffffff")

// ── HTTP method colours ───────────────────────────────────────────────────────
#let method-color(m) = {
  if m == "GET"    { green }
  else if m == "POST"   { blue }
  else if m == "PATCH"  { amber }
  else if m == "DELETE" { red }
  else if m == "PUT"    { rgb("#f97316") }
  else { muted }
}

// ── Font stacks ───────────────────────────────────────────────────────────────
#let sans  = ("Noto Sans",  "Liberation Sans")
#let mono  = ("Liberation Mono", "DejaVu Sans Mono")

// ── Page layout ───────────────────────────────────────────────────────────────
#set page(
  paper: "a4",
  margin: (top: 22mm, bottom: 22mm, left: 20mm, right: 20mm),
  numbering: "1",
  number-align: right,
  header: context {
    if counter(page).get().first() > 2 {
      box(width: 100%)[
        #text(font: sans, size: 8pt, fill: muted)[
          Nibras REST API Reference
          #h(1fr)
          #counter(page).display("1")
        ]
        #v(-0.4em)
        #line(length: 100%, stroke: 0.5pt + border)
      ]
    }
  }
)

#set text(font: sans, size: 10pt, fill: ink)
#set par(leading: 0.75em, justify: true)
#set heading(numbering: none)

// ── Heading styles ────────────────────────────────────────────────────────────
#show heading.where(level: 1): it => {
  pagebreak(weak: true)
  v(0.3em)
  text(font: sans, size: 8pt, weight: "bold", fill: accent, tracking: 0.18em,
    upper("Feature Area"))
  v(0.1em)
  text(font: sans, size: 20pt, weight: "bold", fill: ink, it.body)
  v(0.1em)
  line(length: 100%, stroke: 1.5pt + border)
  v(0.6em)
}

#show heading.where(level: 2): it => {
  v(0.8em)
  text(font: sans, size: 12pt, weight: "bold", fill: ink, it.body)
  v(0.25em)
}

#show heading.where(level: 3): it => {
  v(0.5em)
  text(font: sans, size: 8pt, weight: "bold", fill: muted,
    tracking: 0.1em, upper(it.body))
  v(0.15em)
}

// ── Component helpers ─────────────────────────────────────────────────────────

// Coloured HTTP-method pill
#let method-badge(m) = box(
  inset: (x: 6pt, y: 2.5pt),
  radius: 4pt,
  fill: method-color(m).lighten(82%),
)[#text(font: mono, size: 7.5pt, weight: "bold",
    fill: method-color(m).darken(20%), m)]

// Lock/open badge
#let auth-badge(required) = {
  if required {
    box(inset: (x: 5pt, y: 2pt), radius: 10pt,
      fill: rgb("#fef3c7"))[#text(font: sans, size: 7pt, weight: "bold",
        fill: rgb("#92400e"), "🔒 Auth")]
  } else {
    box(inset: (x: 5pt, y: 2pt), radius: 10pt,
      fill: rgb("#f0fdf4"))[#text(font: sans, size: 7pt, weight: "bold",
        fill: rgb("#15803d"), "🔓 Public")]
  }
}

// Single endpoint block
#let endpoint(method, path, auth: true, desc: "", body: none) = {
  block(
    width: 100%,
    inset: (x: 12pt, top: 10pt, bottom: 10pt),
    radius: 6pt,
    fill: surface,
    stroke: 0.6pt + border,
  )[
    // Header row
    #stack(dir: ltr, spacing: 6pt,
      method-badge(method),
      text(font: mono, size: 9pt, weight: "bold", fill: ink, path),
      h(1fr),
      auth-badge(auth),
    )
    // Description
    #if desc != "" {
      v(0.35em)
      text(size: 9pt, fill: muted, desc)
    }
    // Extra body (params / shapes)
    #if body != none {
      v(0.4em)
      body
    }
  ]
  v(0.5em)
}

// Params table (used inline inside endpoint body)
#let params-table(rows) = {
  text(font: sans, size: 7.5pt, weight: "bold", fill: muted, tracking: 0.08em,
    upper("Parameters"))
  v(0.15em)
  table(
    columns: (auto, auto, 1fr),
    stroke: none,
    fill: (col, row) => if row == 0 { border.lighten(30%) } else { white },
    inset: (x: 8pt, y: 5pt),
    table.header(
      text(font: sans, size: 8pt, weight: "bold", "Name"),
      text(font: sans, size: 8pt, weight: "bold", "Type"),
      text(font: sans, size: 8pt, weight: "bold", "Description"),
    ),
    ..rows.flatten()
  )
}

// Inline code block
#let code-block(src) = block(
  width: 100%,
  inset: (x: 10pt, y: 8pt),
  radius: 4pt,
  fill: rgb("#f1f5f9"),
)[#text(font: mono, size: 8pt, fill: rgb("#334155"), src)]

// Response label
#let response-label(code, desc) = stack(dir: ltr, spacing: 6pt,
  box(inset: (x: 6pt, y: 2pt), radius: 4pt,
    fill: if code == "200" or code == "201" { green.lighten(80%) }
          else { red.lighten(80%) },
  )[#text(font: mono, size: 7.5pt, weight: "bold",
      fill: if code == "200" or code == "201" { green.darken(30%) }
            else { red.darken(30%) }, code)],
  text(size: 8.5pt, fill: muted, desc),
)

// ─────────────────────────────────────────────────────────────────────────────
//  COVER PAGE
// ─────────────────────────────────────────────────────────────────────────────

#page(margin: (top: 40mm, bottom: 30mm, left: 30mm, right: 30mm), numbering: none)[
  // Top accent stripe
  #block(width: 100%, height: 6pt, fill: accent, radius: (bottom: 0pt))
  #v(32mm)

  #text(font: sans, size: 9pt, weight: "bold", fill: accent, tracking: 0.22em,
    upper("Nibras Platform"))
  #v(0.4em)
  #text(font: sans, size: 36pt, weight: "bold", fill: ink, leading: 0.9em)[
    REST API\
    Reference
  ]
  #v(1.2em)
  #line(length: 60pt, stroke: 2pt + accent)
  #v(1.6em)
  #text(size: 11pt, fill: muted)[
    Complete documentation for all 87 endpoints — authentication,\
    project tracking, submissions, team formation, program planning,\
    notifications, and administrative operations.
  ]

  #v(1fr)
  #grid(columns: (1fr, 1fr),
    [
      #text(font: sans, size: 8pt, weight: "bold", fill: muted,
        tracking: 0.1em, upper("Base URL")) \
      #text(font: mono, size: 9pt, fill: ink,
        "http://localhost:3001") \
      #v(0.5em)
      #text(font: sans, size: 8pt, weight: "bold", fill: muted,
        tracking: 0.1em, upper("Version")) \
      #text(font: mono, size: 9pt, fill: ink, "v1")
    ],
    [
      #text(font: sans, size: 8pt, weight: "bold", fill: muted,
        tracking: 0.1em, upper("Revised")) \
      #text(size: 9pt, fill: ink, "May 2026") \
      #v(0.5em)
      #text(font: sans, size: 8pt, weight: "bold", fill: muted,
        tracking: 0.1em, upper("Endpoints")) \
      #text(size: 9pt, fill: ink, "87 total")
    ],
  )
  #v(6mm)
  #block(width: 100%, height: 3pt, fill: border)
]

// ─────────────────────────────────────────────────────────────────────────────
//  TABLE OF CONTENTS PAGE
// ─────────────────────────────────────────────────────────────────────────────

#page(numbering: "i")[
  #text(font: sans, size: 18pt, weight: "bold", fill: ink, "Contents")
  #v(0.3em)
  #line(length: 100%, stroke: 1pt + border)
  #v(0.8em)

  #let toc-row(section, title, count) = {
    grid(columns: (auto, 1fr, auto),
      gutter: 0pt,
      text(font: sans, size: 9pt, fill: accent, weight: "bold", section + "  "),
      text(font: sans, size: 9.5pt, fill: ink, title),
      text(font: sans, size: 8pt, fill: muted, count + " endpoints"),
    )
    v(0.25em)
    line(length: 100%, stroke: 0.4pt + border)
    v(0.25em)
  }

  #toc-row("01", "Authentication & Sessions", "10")
  #toc-row("02", "System & Health", "5")
  #toc-row("03", "GitHub Integration", "5")
  #toc-row("04", "CLI Projects & Submissions", "9")
  #toc-row("05", "Tracking — Courses & Members", "13")
  #toc-row("06", "Tracking — Projects & Milestones", "14")
  #toc-row("07", "Tracking — Submissions & Reviews", "8")
  #toc-row("08", "Tracking — Team Formation", "7")
  #toc-row("09", "Tracking — Dashboards & Analytics", "6")
  #toc-row("10", "Program Planning", "22")
  #toc-row("11", "Notifications", "3")
  #toc-row("12", "Admin", "11")

  #v(1.5em)
  #text(font: sans, size: 10pt, weight: "bold", fill: ink,
    "Quick-Reference: All Endpoints")
  #v(0.2em)
  #line(length: 100%, stroke: 1pt + border)
  #v(0.6em)

  // Legend for method colours
  #stack(dir: ltr, spacing: 10pt,
    text(font: sans, size: 8.5pt, fill: muted, "Method colours:"),
    method-badge("GET"),  text(size: 8pt, fill: muted, "Read"),
    method-badge("POST"), text(size: 8pt, fill: muted, "Create / Action"),
    method-badge("PATCH"),text(size: 8pt, fill: muted, "Update"),
    method-badge("DELETE"),text(size: 8pt, fill: muted, "Delete"),
  )
  #v(0.5em)
  #text(size: 8.5pt, fill: muted)[
    All endpoints are prefixed with the base URL.
    Endpoints marked #box(inset: (x:4pt,y:1pt), radius:8pt,
      fill:rgb("#fef3c7"))[#text(size:7pt, weight:"bold",
      fill:rgb("#92400e"), "🔒 Auth")] require either a
    `Authorization: Bearer <token>` header (CLI) or a
    `nibras-session` cookie (web). Endpoints marked
    #box(inset:(x:4pt,y:1pt),radius:8pt,
      fill:rgb("#f0fdf4"))[#text(size:7pt, weight:"bold",
      fill:rgb("#15803d"), "🔓 Public")] are unauthenticated.
  ]
]

// ─────────────────────────────────────────────────────────────────────────────
//  QUICK REFERENCE TABLE  (all 87 endpoints)
// ─────────────────────────────────────────────────────────────────────────────

#page(numbering: "1")[
  #text(font: sans, size: 15pt, weight: "bold", fill: ink,
    "Quick-Reference: All Endpoints")
  #v(0.25em)
  #line(length: 100%, stroke: 1pt + border)
  #v(0.5em)

  #let qrow(m, p, a, t) = (
    method-badge(m),
    text(font: mono, size: 7pt, fill: ink, p),
    auth-badge(a),
    box(inset:(x:5pt,y:2pt), radius:8pt,
      fill: if t=="system"       { rgb("#e0e7ff") }
            else if t=="auth"    { rgb("#fce7f3") }
            else if t=="github"  { rgb("#f0fdf4") }
            else if t=="projects"{ rgb("#fef9c3") }
            else if t=="tracking"{ rgb("#dbeafe") }
            else if t=="programs"{ rgb("#fdf4ff") }
            else if t=="notifications"{ rgb("#fff7ed") }
            else                 { rgb("#fee2e2") }
    )[#text(font:sans, size:6.5pt, weight:"bold",
        fill: if t=="system"       { rgb("#3730a3") }
              else if t=="auth"    { rgb("#9d174d") }
              else if t=="github"  { rgb("#065f46") }
              else if t=="projects"{ rgb("#713f12") }
              else if t=="tracking"{ rgb("#1e40af") }
              else if t=="programs"{ rgb("#6b21a8") }
              else if t=="notifications"{ rgb("#7c2d12") }
              else                 { rgb("#991b1b") }, t)],
  )

  #set text(size: 8pt)
  #table(
    columns: (auto, 1fr, auto, auto),
    stroke: none,
    fill: (col, row) => if row == 0 { border } else if calc.odd(row) { white } else { surface },
    inset: (x: 6pt, y: 5pt),
    align: (left, left, center, center),
    table.header(
      text(weight: "bold", "Method"),
      text(weight: "bold", "Path"),
      text(weight: "bold", "Auth"),
      text(weight: "bold", "Tag"),
    ),
    // System
    ..qrow("GET",    "/healthz",                                               false, "system"),
    ..qrow("GET",    "/readyz",                                                false, "system"),
    ..qrow("GET",    "/metrics",                                               false, "system"),
    ..qrow("GET",    "/v1/health",                                             false, "system"),
    ..qrow("GET",    "/v1/ping",                                               false, "system"),
    // Auth
    ..qrow("POST",   "/v1/device/start",                                       false, "auth"),
    ..qrow("POST",   "/v1/device/poll",                                        false, "auth"),
    ..qrow("POST",   "/v1/device/authorize",                                   true,  "auth"),
    ..qrow("GET",    "/v1/github/oauth/start",                                 false, "auth"),
    ..qrow("GET",    "/v1/github/oauth/callback",                              false, "auth"),
    ..qrow("POST",   "/v1/auth/refresh",                                       false, "auth"),
    ..qrow("POST",   "/v1/logout",                                             true,  "auth"),
    ..qrow("GET",    "/v1/me",                                                 true,  "auth"),
    ..qrow("GET",    "/v1/web/session",                                        true,  "auth"),
    ..qrow("POST",   "/v1/web/logout",                                         true,  "auth"),
    ..qrow("DELETE", "/v1/me/account",                                         true,  "auth"),
    // GitHub
    ..qrow("GET",    "/v1/github/config",                                      false, "github"),
    ..qrow("GET",    "/v1/github/install-url",                                 true,  "github"),
    ..qrow("POST",   "/v1/github/setup/complete",                              true,  "github"),
    ..qrow("POST",   "/v1/github/repositories/validate",                       true,  "github"),
    ..qrow("POST",   "/v1/github/webhooks",                                    false, "github"),
    // Projects
    ..qrow("GET",    "/v1/projects/:key/manifest",                             true,  "projects"),
    ..qrow("GET",    "/v1/projects/:key/task",                                 true,  "projects"),
    ..qrow("GET",    "/v1/projects/:key/starter-bundle",                       true,  "projects"),
    ..qrow("POST",   "/v1/projects/:key/setup",                                true,  "projects"),
    ..qrow("POST",   "/v1/submissions/prepare",                                true,  "projects"),
    ..qrow("POST",   "/v1/submissions/:id/local-test-result",                  true,  "projects"),
    ..qrow("GET",    "/v1/submissions/:id",                                    true,  "projects"),
    ..qrow("GET",    "/v1/submissions/:id/stream",                             true,  "projects"),
    ..qrow("GET",    "/v1/me/submissions",                                     true,  "projects"),
    // Tracking – courses
    ..qrow("GET",    "/v1/tracking/courses",                                   true,  "tracking"),
    ..qrow("POST",   "/v1/tracking/courses",                                   true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/courses/:id/members",                       true,  "tracking"),
    ..qrow("POST",   "/v1/tracking/courses/:id/members",                       true,  "tracking"),
    ..qrow("DELETE", "/v1/tracking/courses/:id/members/:uid",                  true,  "tracking"),
    ..qrow("PATCH",  "/v1/tracking/courses/:id/members/:uid/level",            true,  "tracking"),
    ..qrow("POST",   "/v1/tracking/courses/:id/invites",                       true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/invites/:code",                             false, "tracking"),
    ..qrow("POST",   "/v1/tracking/invites/:code/join",                        true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/courses/:id/templates",                     true,  "tracking"),
    ..qrow("POST",   "/v1/tracking/courses/:id/templates",                     true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/courses/:id/projects",                      true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/courses/:id/export.csv",                    true,  "tracking"),
    // Tracking – projects & milestones
    ..qrow("POST",   "/v1/tracking/projects",                                  true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/projects/:id",                              true,  "tracking"),
    ..qrow("PATCH",  "/v1/tracking/projects/:id",                              true,  "tracking"),
    ..qrow("POST",   "/v1/tracking/projects/:id/publish",                      true,  "tracking"),
    ..qrow("POST",   "/v1/tracking/projects/:id/unpublish",                    true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/templates/:id",                             true,  "tracking"),
    ..qrow("PATCH",  "/v1/tracking/templates/:id",                             true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/projects/:id/milestones",                   true,  "tracking"),
    ..qrow("POST",   "/v1/tracking/projects/:id/milestones",                   true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/milestones/:id",                            true,  "tracking"),
    ..qrow("PATCH",  "/v1/tracking/milestones/:id",                            true,  "tracking"),
    ..qrow("DELETE", "/v1/tracking/milestones/:id",                            true,  "tracking"),
    // Tracking – submissions & reviews
    ..qrow("GET",    "/v1/tracking/milestones/:id/submissions",                true,  "tracking"),
    ..qrow("POST",   "/v1/tracking/milestones/:id/submissions",                true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/submissions/:id",                           true,  "tracking"),
    ..qrow("PATCH",  "/v1/tracking/submissions/:id",                           true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/submissions/:id/commits",                   true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/submissions/:id/review",                    true,  "tracking"),
    ..qrow("POST",   "/v1/tracking/submissions/:id/review",                    true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/review-queue",                              true,  "tracking"),
    // Tracking – teams
    ..qrow("POST",   "/v1/tracking/projects/:id/applications",                 true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/projects/:id/applications/me",              true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/projects/:id/applications",                 true,  "tracking"),
    ..qrow("POST",   "/v1/tracking/projects/:id/team-formation/generate",      true,  "tracking"),
    ..qrow("POST",   "/v1/tracking/projects/:id/team-formation/lock",          true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/projects/:id/teams",                        true,  "tracking"),
    ..qrow("PATCH",  "/v1/tracking/projects/:id/teams/:tid",                   true,  "tracking"),
    // Tracking – dashboards & analytics
    ..qrow("GET",    "/v1/tracking/dashboard/home",                            true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/dashboard/student",                         true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/dashboard/instructor",                      true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/dashboard/course/:id",                      true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/analytics/student",                         true,  "tracking"),
    ..qrow("GET",    "/v1/tracking/activity",                                  true,  "tracking"),
    // Programs
    ..qrow("GET",    "/v1/programs",                                           true,  "programs"),
    ..qrow("POST",   "/v1/programs",                                           true,  "programs"),
    ..qrow("GET",    "/v1/programs/:id/versions/:vid",                         true,  "programs"),
    ..qrow("POST",   "/v1/programs/:id/versions",                              true,  "programs"),
    ..qrow("POST",   "/v1/programs/:id/catalog-courses",                       true,  "programs"),
    ..qrow("POST",   "/v1/programs/:id/requirement-groups",                    true,  "programs"),
    ..qrow("PATCH",  "/v1/programs/:id/requirement-groups/:gid",               true,  "programs"),
    ..qrow("POST",   "/v1/programs/:id/tracks",                                true,  "programs"),
    ..qrow("PATCH",  "/v1/programs/:id/tracks/:tid",                           true,  "programs"),
    ..qrow("POST",   "/v1/programs/:id/enroll",                                true,  "programs"),
    ..qrow("GET",    "/v1/programs/student/me",                                true,  "programs"),
    ..qrow("PATCH",  "/v1/programs/student/me/plan",                           true,  "programs"),
    ..qrow("GET",    "/v1/programs/student/me/recommend-track",                true,  "programs"),
    ..qrow("POST",   "/v1/programs/student/me/select-track",                   true,  "programs"),
    ..qrow("GET",    "/v1/programs/student/me/sheet",                          true,  "programs"),
    ..qrow("POST",   "/v1/programs/student/me/generate-sheet",                 true,  "programs"),
    ..qrow("POST",   "/v1/programs/student/me/petitions",                      true,  "programs"),
    ..qrow("GET",    "/v1/programs/student/me/petitions",                      true,  "programs"),
    ..qrow("GET",    "/v1/programs/:id/petitions",                             true,  "programs"),
    ..qrow("PATCH",  "/v1/programs/:id/petitions/:pid",                        true,  "programs"),
    ..qrow("POST",   "/v1/programs/:id/approvals/:spid/advisor",               true,  "programs"),
    ..qrow("POST",   "/v1/programs/:id/approvals/:spid/department",            true,  "programs"),
    // Notifications
    ..qrow("GET",    "/v1/notifications",                                      true,  "notifications"),
    ..qrow("GET",    "/v1/notifications/count",                                true,  "notifications"),
    ..qrow("POST",   "/v1/notifications/read-all",                             true,  "notifications"),
    // Admin
    ..qrow("GET",    "/v1/admin/submissions",                                  true,  "admin"),
    ..qrow("PATCH",  "/v1/admin/submissions/:id/status",                       true,  "admin"),
    ..qrow("GET",    "/v1/admin/submissions/:id/logs",                         true,  "admin"),
    ..qrow("POST",   "/v1/admin/submissions/:id/retry",                        true,  "admin"),
    ..qrow("GET",    "/v1/admin/projects",                                     true,  "admin"),
    ..qrow("DELETE", "/v1/admin/courses/:id",                                  true,  "admin"),
    ..qrow("POST",   "/v1/admin/projects/:id/archive",                         true,  "admin"),
    ..qrow("GET",    "/v1/admin/users",                                        true,  "admin"),
    ..qrow("PATCH",  "/v1/admin/users/:id/role",                               true,  "admin"),
    ..qrow("GET",    "/v1/admin/students",                                     true,  "admin"),
    ..qrow("PATCH",  "/v1/admin/students/:id/year",                            true,  "admin"),
  )
]

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 01 — AUTHENTICATION & SESSIONS
// ─────────────────────────────────────────────────────────────────────────────

= Authentication & Sessions

All CLI clients authenticate using a *GitHub Device Flow*. The web dashboard uses server-side session cookies. Tokens are JWTs and must be refreshed with the refresh token when expired.

Two auth schemes are accepted on authenticated endpoints:
- *CLI clients* — `Authorization: Bearer <accessToken>` header
- *Web clients* — `nibras-session` HttpOnly cookie (set on login)

== Device Flow (CLI)

#endpoint("POST", "/v1/device/start", auth: false,
  desc: "Begin GitHub device flow. Returns a user-facing code and verification URL. The CLI displays this code and opens the browser.",
  body: [
    #response-label("200", "Device codes issued")
    #code-block(
"{ deviceCode: string,        // internal code — do not show
  userCode: string,           // show to user (e.g. \"ABCD-1234\")
  verificationUri: string,    // https://github.com/login/device
  verificationUriComplete: string,
  intervalSeconds: number,    // poll interval (default 5 s)
  expiresInSeconds: number }"
    )
  ]
)

#endpoint("POST", "/v1/device/poll", auth: false,
  desc: "Poll for authorization result. Call every `intervalSeconds` until status is `authorized` or `expired`.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"deviceCode"), text(font:mono,size:7.5pt,"string"), "The device code from /device/start"),
    ))
    #v(0.3em)
    #response-label("200", "Pending / success")
    #code-block(
"// Still waiting:
{ status: \"pending\" | \"expired\" | \"denied\" }

// Authorized:
{ status: \"authorized\",
  accessToken: string,
  refreshToken: string,
  user: { id, username, email, githubLogin,
          githubLinked, githubAppInstalled,
          systemRole: \"user\"|\"admin\", yearLevel } }"
    )
  ]
)

#endpoint("POST", "/v1/device/authorize", auth: true,
  desc: "Authorize a pending device code using the current web session. Called automatically by the web UI after the user approves the device.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"userCode"), text(font:mono,size:7.5pt,"string"), "The 8-character code shown to the user"),
    ))
    #response-label("200", `{ ok: true }`)
  ]
)

== Web OAuth

#endpoint("GET", "/v1/github/oauth/start", auth: false,
  desc: "Redirect the browser to GitHub OAuth. Begins web dashboard login. Accepts `?return_to=<url>` query parameter.",
  body: [#response-label("302", "Redirect to GitHub")]
)

#endpoint("GET", "/v1/github/oauth/callback", auth: false,
  desc: "GitHub OAuth callback — handled server-side. Sets the `nibras-session` cookie and redirects back to the app.",
  body: [#response-label("302", "Redirect to return_to URL")]
)

== Token Management

#endpoint("POST", "/v1/auth/refresh", auth: false,
  desc: "Exchange a refresh token for a new access + refresh token pair. CLI calls this automatically on 401 responses.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"refreshToken"), text(font:mono,size:7.5pt,"string"), "Current refresh token"),
    ))
    #response-label("200", "New token pair")
    #code-block("{ accessToken: string, refreshToken: string }")
  ]
)

#endpoint("POST", "/v1/logout", auth: true,
  desc: "Revoke a CLI Bearer session token. The refresh token is invalidated.",
  body: [#response-label("200", `{ ok: true }`)]
)

== User Identity

#endpoint("GET", "/v1/me", auth: true,
  desc: "Get the currently authenticated CLI user, API base URL, and course memberships.",
  body: [
    #response-label("200", "User object")
    #code-block(
"{ user: { id, username, email, githubLogin, githubLinked,
           githubAppInstalled, systemRole, yearLevel },
  apiBaseUrl: string,
  memberships: [{ courseId, role, level }] }"
    )
  ]
)

#endpoint("GET", "/v1/web/session", auth: true,
  desc: "Get the currently authenticated web user (session cookie). Same shape as GET /v1/me.",
  body: [#response-label("200", "Same as GET /v1/me")]
)

#endpoint("POST", "/v1/web/logout", auth: true,
  desc: "Revoke the current web session cookie.",
  body: [#response-label("200", `{ ok: true }`)]
)

#endpoint("DELETE", "/v1/me/account", auth: true,
  desc: "Permanently delete the authenticated user's account (GDPR erasure). Anonymises all submissions, revokes all tokens, and removes personal data. This action is irreversible.",
  body: [
    #response-label("200", `{ ok: true }`)
    #v(0.2em)
    #block(inset:(x:10pt,y:8pt), radius:4pt, fill:red.lighten(88%),
      stroke: 0.5pt + red.lighten(50%))[
      #text(size:8.5pt, fill:red.darken(20%))[
        *Warning:* This endpoint deletes all user data permanently.
        Submissions are anonymised, not deleted, to preserve course records.
      ]
    ]
  ]
)

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 02 — SYSTEM & HEALTH
// ─────────────────────────────────────────────────────────────────────────────

= System & Health

Health and metrics endpoints used by infrastructure monitoring. No authentication required.

#endpoint("GET", "/healthz", auth: false,
  desc: "Kubernetes liveness probe. Returns plain text `ok` when the process is alive.",
  body: [#response-label("200", `"ok"`)]
)

#endpoint("GET", "/readyz", auth: false,
  desc: "Kubernetes readiness probe. Verifies database connectivity before returning ok.",
  body: [
    #response-label("200", "Ready")
    #code-block(`{ status: "ok" }`)
    #response-label("503", "Database unavailable")
    #code-block(`{ status: "error", detail: string }`)
  ]
)

#endpoint("GET", "/metrics", auth: false,
  desc: "Prometheus-compatible metrics in Prometheus exposition format (plain text). Includes request counts, latencies, and DB pool stats.",
  body: [#response-label("200", "Plain text metrics")]
)

#endpoint("GET", "/v1/health", auth: false,
  desc: "Simple API health check.",
  body: [#response-label("200", `{ status: "ok" }`)]
)

#endpoint("GET", "/v1/ping", auth: false,
  desc: "Extended ping. Returns richer information when an auth token or session is provided — GitHub link and App installation status.",
  body: [
    #response-label("200", "")
    #code-block(
"{ ok: boolean,
  api: boolean,
  auth: boolean,            // true if valid token supplied
  githubLinked: boolean,
  githubAppInstalled: boolean }"
    )
  ]
)

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 03 — GITHUB INTEGRATION
// ─────────────────────────────────────────────────────────────────────────────

= GitHub Integration

Endpoints for GitHub App configuration, installation, repository validation, and inbound webhook processing.

#endpoint("GET", "/v1/github/config", auth: false,
  desc: "Return GitHub App configuration status. Used by the CLI to show whether the platform has a GitHub App installed.",
  body: [
    #response-label("200", "")
    #code-block(
"{ configured: boolean,
  appName: string | null,
  webBaseUrl: string | null }"
    )
  ]
)

#endpoint("GET", "/v1/github/install-url", auth: true,
  desc: "Get the OAuth URL to install the GitHub App for the authenticated user's account or organisation.",
  body: [
    #response-label("200", `{ installUrl: string }`)
  ]
)

#endpoint("POST", "/v1/github/setup/complete", auth: true,
  desc: "Link a GitHub App installation to the authenticated account after the user completes the GitHub App install flow.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"installationId"), text(font:mono,size:7.5pt,"string"), "GitHub App installation ID"),
    ))
    #response-label("200", "")
    #code-block(
"{ githubAppInstalled: boolean,
  installationId: string,
  redirectTo: string }"
    )
  ]
)

#endpoint("POST", "/v1/github/repositories/validate", auth: true,
  desc: "Validate a GitHub repository URL for submission eligibility. Checks that the App has access and the user has push rights.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"repoUrl"), text(font:mono,size:7.5pt,"string"), "Full GitHub repository URL"),
    ))
    #response-label("200", "")
    #code-block(
"{ repoUrl, owner, name, fullName,
  defaultBranch, visibility: \"public\"|\"private\",
  permission: string }"
    )
  ]
)

#endpoint("POST", "/v1/github/webhooks", auth: false,
  desc: "Receive inbound GitHub webhook events (push, pull_request). Validates the HMAC-SHA256 signature using the webhook secret. Push events are linked to active submissions and trigger the verification worker.",
  body: [
    #response-label("200", `{ ok: true }  // processed`)
    #response-label("204", "No-op event (not a push to a tracked branch)")
    #response-label("400", "Invalid HMAC signature")
  ]
)

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 04 — CLI PROJECTS & SUBMISSIONS
// ─────────────────────────────────────────────────────────────────────────────

= CLI Projects & Submissions

The project and submission endpoints are used exclusively by the `nibras` CLI. They handle project setup, task display, starter-kit download, and the full submission lifecycle.

== Project Setup

#endpoint("GET", "/v1/projects/:projectKey/manifest", auth: true,
  desc: "Fetch a project's manifest: test command, buildpack version, submission file paths, and allowed branch rules.",
  body: [
    #response-label("200", "")
    #code-block(
"{ projectKey, releaseVersion, apiBaseUrl,
  buildpack?: { node?: { version } },
  test?:       { command, timeout? },
  submission?: { allowedPaths?, ignorePaths? } }"
    )
  ]
)

#endpoint("GET", "/v1/projects/:projectKey/task", auth: true,
  desc: "Fetch project task instructions as Markdown. Displayed via `nibras task`.",
  body: [
    #response-label("200", `{ projectKey, task: string /* Markdown */ }`)
  ]
)

#endpoint("GET", "/v1/projects/:projectKey/starter-bundle", auth: true,
  desc: "Download the project starter kit as a ZIP archive (application/zip binary stream).",
  body: [
    #response-label("200", "application/zip binary stream")
  ]
)

#endpoint("POST", "/v1/projects/:projectKey/setup", auth: true,
  desc: "Provision a GitHub repository for the student and apply the project template. Called once per student per project.",
  body: [
    #response-label("200", "")
    #code-block(
"{ projectKey, manifest, task,
  repo: { owner, name, fullName, cloneUrl, defaultBranch },
  templateCloneUrl: string | null,
  starter: { type: \"none\" }
          | { type: \"bundle\", downloadUrl }
          | { type: \"github-template\", templateRepo } }"
    )
  ]
)

== Submission Lifecycle

#endpoint("POST", "/v1/submissions/prepare", auth: true,
  desc: "Create or reuse a submission attempt for a specific commit SHA. If a submission already exists for this commit, it is returned as-is.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"projectKey"),  text(font:mono,size:7.5pt,"string"), "Project identifier"),
      (text(font:mono,size:7.5pt,"commitSha"),   text(font:mono,size:7.5pt,"string"), "Full 40-char SHA"),
      (text(font:mono,size:7.5pt,"repoUrl"),     text(font:mono,size:7.5pt,"string"), "GitHub clone URL"),
      (text(font:mono,size:7.5pt,"branch"),      text(font:mono,size:7.5pt,"string"), "Branch name"),
    ))
    #response-label("200", "")
    #code-block(`{ submissionId: string, status: SubmissionStatus }`)
  ]
)

#endpoint("POST", "/v1/submissions/:submissionId/local-test-result", auth: true,
  desc: "Record the outcome of a local test run before the student pushes. Stored for instructor visibility.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"exitCode"),     text(font:mono,size:7.5pt,"number"), "Process exit code (0 = pass)"),
      (text(font:mono,size:7.5pt,"summary"),      text(font:mono,size:7.5pt,"string"), "Test output summary"),
      (text(font:mono,size:7.5pt,"ranPrevious"),  text(font:mono,size:7.5pt,"boolean?"), "Whether re-running a previous test"),
    ))
    #response-label("200", `{ ok: true }`)
  ]
)

#endpoint("GET", "/v1/submissions/:submissionId", auth: true,
  desc: "Get the current status of a submission attempt. Polled by the CLI until a terminal status is reached.",
  body: [
    #response-label("200", "")
    #code-block(
"{ submissionId, projectKey, commitSha, summary,
  status: \"queued\"|\"running\"|\"passed\"|\"failed\"|\"needs_review\",
  createdAt, updatedAt }"
    )
  ]
)

#endpoint("GET", "/v1/submissions/:submissionId/stream", auth: true,
  desc: "Stream submission status updates as Server-Sent Events (SSE). Each event carries `{ status, summary }`. The stream closes on terminal status.",
  body: [
    #response-label("200", "text/event-stream — events: `{ status, summary }`")
  ]
)

#endpoint("GET", "/v1/me/submissions", auth: true,
  desc: "List all submissions for the authenticated student (paginated). Supports `limit` and `offset` query parameters.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"limit"),  text(font:mono,size:7.5pt,"number?"), "Max records (1–200, default 50)"),
      (text(font:mono,size:7.5pt,"offset"), text(font:mono,size:7.5pt,"number?"), "Records to skip (default 0)"),
    ))
    #response-label("200", "StudentSubmission[] + X-Total-Count header")
    #code-block(
"StudentSubmission {
  id, projectKey, milestoneId, commitSha, repoUrl, branch,
  status, summary, submissionType, submissionValue, notes,
  submittedAt, createdAt, updatedAt, localTestExitCode
}"
    )
  ]
)

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 05 — TRACKING: COURSES & MEMBERS
// ─────────────────────────────────────────────────────────────────────────────

= Tracking — Courses & Members

Course management endpoints. Instructors and TAs create and manage courses; students join via invite links.

== Courses

#endpoint("GET", "/v1/tracking/courses", auth: true,
  desc: "List all courses the authenticated user is enrolled in or teaches. Supports pagination.",
  body: [
    #response-label("200", "CourseSummary[]")
    #code-block(
"{ id, slug, title, termLabel, courseCode, isActive }"
    )
  ]
)

#endpoint("POST", "/v1/tracking/courses", auth: true,
  desc: "Create a new course. Requires instructor or admin system role.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"slug"),       text(font:mono,size:7.5pt,"string"), "URL-safe identifier (e.g. \"cs101-f26\")"),
      (text(font:mono,size:7.5pt,"title"),      text(font:mono,size:7.5pt,"string"), "Display title"),
      (text(font:mono,size:7.5pt,"termLabel"),  text(font:mono,size:7.5pt,"string"), "e.g. \"Fall 2026\""),
      (text(font:mono,size:7.5pt,"courseCode"), text(font:mono,size:7.5pt,"string"), "e.g. \"CS101\""),
    ))
    #response-label("201", "CourseSummary")
  ]
)

== Members

#endpoint("GET", "/v1/tracking/courses/:courseId/members", auth: true,
  desc: "List all members of a course with their role and level. Restricted to instructors and TAs.",
  body: [
    #response-label("200", "CourseMember[]")
    #code-block(
"{ id, courseId, userId, username, githubLogin,
  role: \"student\"|\"instructor\"|\"ta\", level, createdAt }"
    )
  ]
)

#endpoint("POST", "/v1/tracking/courses/:courseId/members", auth: true,
  desc: "Add a member by GitHub login. Instructor or TA only.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"githubLogin"), text(font:mono,size:7.5pt,"string"), "GitHub username"),
      (text(font:mono,size:7.5pt,"role"), text(font:mono,size:7.5pt,"string"), `"student" | "instructor" | "ta"`),
    ))
    #response-label("201", "CourseMember")
  ]
)

#endpoint("DELETE", "/v1/tracking/courses/:courseId/members/:userId", auth: true,
  desc: "Remove a member from the course. Instructor only.",
  body: [#response-label("200", `{ ok: true }`)]
)

#endpoint("PATCH", "/v1/tracking/courses/:courseId/members/:userId/level", auth: true,
  desc: "Set a student's academic year level within the course (1–4).",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"level"), text(font:mono,size:7.5pt,"1|2|3|4"), "Academic year level"),
    ))
    #response-label("200", "CourseMember")
  ]
)

== Invites

#endpoint("POST", "/v1/tracking/courses/:courseId/invites", auth: true,
  desc: "Generate a time-limited invite link for the course.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"role"),          text(font:mono,size:7.5pt,"string"),  `"student" | "instructor" | "ta"`),
      (text(font:mono,size:7.5pt,"expiresInDays"), text(font:mono,size:7.5pt,"number?"), "Days until expiry (default 7)"),
    ))
    #response-label("200", `{ code: string, inviteUrl: string }`)
  ]
)

#endpoint("GET", "/v1/tracking/invites/:code", auth: false,
  desc: "Preview a course invite (course name, role) without joining. Used by the web UI to show a confirmation screen.",
  body: [
    #response-label("200", "")
    #code-block(
"{ code, courseTitle, courseCode, termLabel,
  role, expiresAt: string | null }"
    )
  ]
)

#endpoint("POST", "/v1/tracking/invites/:code/join", auth: true,
  desc: "Join a course using an invite code. Creates the membership record for the authenticated user.",
  body: [
    #response-label("200", `{ membership: CourseMember }`)
  ]
)

== Templates & Projects (Course-level)

#endpoint("GET", "/v1/tracking/courses/:courseId/templates", auth: true,
  desc: "List reusable project templates available in this course.",
  body: [#response-label("200", "ProjectTemplate[]")]
)

#endpoint("POST", "/v1/tracking/courses/:courseId/templates", auth: true,
  desc: "Create a new project template in the course. Instructor or TA only.",
  body: [#response-label("201", "ProjectTemplate")]
)

#endpoint("GET", "/v1/tracking/courses/:courseId/projects", auth: true,
  desc: "List all published (and draft, for instructors) projects in the course.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"limit"),  text(font:mono,size:7.5pt,"number?"), "Max records"),
      (text(font:mono,size:7.5pt,"offset"), text(font:mono,size:7.5pt,"number?"), "Skip N records"),
    ))
    #response-label("200", "TrackingProjectSummary[]")
  ]
)

#endpoint("GET", "/v1/tracking/courses/:courseId/export.csv", auth: true,
  desc: "Export all student submission data for the course as CSV. Columns: githubLogin, username, milestoneTitle, projectKey, status, submittedAt, commitSha.",
  body: [
    #response-label("200", "text/csv attachment")
  ]
)

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 06 — TRACKING: PROJECTS & MILESTONES
// ─────────────────────────────────────────────────────────────────────────────

= Tracking — Projects & Milestones

Project and milestone management. Projects contain ordered milestones; students submit per milestone.

== Projects

#endpoint("POST", "/v1/tracking/projects", auth: true,
  desc: "Create a new project in a course. Starts as `draft` — not visible to students until published.",
  body: [
    #code-block(
"{ courseId, title, description?, projectKey,
  deliveryMode: \"individual\"|\"team\",
  level?, templateId?, teamSize?,
  gradeWeight?, startDate?, endDate? }"
    )
    #response-label("201", "TrackingProjectSummary")
  ]
)

#endpoint("GET", "/v1/tracking/projects/:projectId", auth: true,
  desc: "Get full project details including all milestones, team formation status, and linked template.",
  body: [
    #response-label("200", "")
    #code-block(
"{ id, projectKey, courseId, title, description,
  status: \"draft\"|\"published\"|\"archived\",
  deliveryMode, teamFormationStatus,
  applicationOpenAt, applicationCloseAt, teamLockAt,
  teamSize, gradeWeight, startDate, endDate,
  milestones: MilestoneSummary[],
  template: ProjectTemplateSummary | null }"
    )
  ]
)

#endpoint("PATCH", "/v1/tracking/projects/:projectId", auth: true,
  desc: "Update a project's metadata. Accepts any subset of the create body.",
  body: [#response-label("200", "TrackingProjectSummary")]
)

#endpoint("POST", "/v1/tracking/projects/:projectId/publish", auth: true,
  desc: "Publish a draft project so students can view it and submit.",
  body: [#response-label("200", `{ ok: true, status: "published" }`)]
)

#endpoint("POST", "/v1/tracking/projects/:projectId/unpublish", auth: true,
  desc: "Revert a published project to draft status. Hides it from students.",
  body: [#response-label("200", `{ ok: true, status: "draft" }`)]
)

== Templates

#endpoint("GET", "/v1/tracking/templates/:templateId", auth: true,
  desc: "Get full template details including defined roles, default milestones, and rubric criteria.",
  body: [#response-label("200", "ProjectTemplate")]
)

#endpoint("PATCH", "/v1/tracking/templates/:templateId", auth: true,
  desc: "Update a project template's roles, milestones, or rubric.",
  body: [#response-label("200", "ProjectTemplate")]
)

== Milestones

#endpoint("GET", "/v1/tracking/projects/:projectId/milestones", auth: true,
  desc: "List all milestones for a project in display order.",
  body: [
    #response-label("200", "MilestoneSummary[]")
    #code-block(
"MilestoneSummary {
  id, projectId, title, description, order,
  dueAt, dueDateLabel, status, statusLabel, isFinal
}"
    )
  ]
)

#endpoint("POST", "/v1/tracking/projects/:projectId/milestones", auth: true,
  desc: "Create a new milestone in the project. Instructor or TA only.",
  body: [
    #code-block(
"{ title, description?, order?,
  dueAt?, isFinal?: boolean }"
    )
    #response-label("201", "MilestoneSummary")
  ]
)

#endpoint("GET", "/v1/tracking/milestones/:milestoneId", auth: true,
  desc: "Get milestone details together with all submission attempts and reviews for that milestone.",
  body: [
    #response-label("200", "")
    #code-block(
"{ milestone: MilestoneSummary,
  submissions: SubmissionSummary[],
  reviews:     ReviewSummary[] }"
    )
  ]
)

#endpoint("PATCH", "/v1/tracking/milestones/:milestoneId", auth: true,
  desc: "Update a milestone's title, due date, or other fields.",
  body: [#response-label("200", "MilestoneSummary")]
)

#endpoint("DELETE", "/v1/tracking/milestones/:milestoneId", auth: true,
  desc: "Delete a milestone. Only allowed when no submissions exist for it.",
  body: [#response-label("200", `{ ok: true }`)]
)

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 07 — TRACKING: SUBMISSIONS & REVIEWS
// ─────────────────────────────────────────────────────────────────────────────

= Tracking — Submissions & Reviews

Endpoints for milestone submissions and instructor code reviews. Submissions can be GitHub-based, link-based, or text-based.

== Submissions

#endpoint("GET", "/v1/tracking/milestones/:milestoneId/submissions", auth: true,
  desc: "List all submissions for a milestone. Instructors and TAs see all; students see only their own.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"limit"),  text(font:mono,size:7.5pt,"number?"), ""),
      (text(font:mono,size:7.5pt,"offset"), text(font:mono,size:7.5pt,"number?"), ""),
    ))
    #response-label("200", "Submission[] + X-Total-Count")
    #code-block(
"Submission {
  id, userId, projectId, projectKey, milestoneId,
  teamId, teamName, teamMemberUserIds[],
  commitSha, repoUrl, branch, status, summary,
  submissionType: \"github\"|\"link\"|\"text\",
  submissionValue, notes, submittedAt,
  createdAt, updatedAt, localTestExitCode
}"
    )
  ]
)

#endpoint("POST", "/v1/tracking/milestones/:milestoneId/submissions", auth: true,
  desc: "Create a new submission for a milestone.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"submissionType"),  text(font:mono,size:7.5pt,"string"),  `"github" | "link" | "text"`),
      (text(font:mono,size:7.5pt,"submissionValue"), text(font:mono,size:7.5pt,"string"),  "The submission content (URL, text, etc.)"),
      (text(font:mono,size:7.5pt,"notes"),           text(font:mono,size:7.5pt,"string?"), "Optional student notes"),
      (text(font:mono,size:7.5pt,"repoUrl"),         text(font:mono,size:7.5pt,"string?"), "Required for `github` type"),
      (text(font:mono,size:7.5pt,"branch"),          text(font:mono,size:7.5pt,"string?"), "Branch name"),
      (text(font:mono,size:7.5pt,"commitSha"),       text(font:mono,size:7.5pt,"string?"), "Commit SHA"),
    ))
    #response-label("201", "Submission")
  ]
)

#endpoint("GET", "/v1/tracking/submissions/:submissionId", auth: true,
  desc: "Get a single submission by ID. Access is restricted to the submitter, team members, and instructors.",
  body: [#response-label("200", "Submission")]
)

#endpoint("PATCH", "/v1/tracking/submissions/:submissionId", auth: true,
  desc: "Update a submission (change repository URL, add notes, resubmit). Only allowed before the review is approved or graded.",
  body: [#response-label("200", "Submission")]
)

#endpoint("GET", "/v1/tracking/submissions/:submissionId/commits", auth: true,
  desc: "Get GitHub push delivery events linked to this submission. Each record represents a webhook push event received from GitHub.",
  body: [
    #response-label("200", "GithubDelivery[]")
    #code-block(
"GithubDelivery {
  id, submissionId, repoUrl,
  eventType,           // \"push\", \"pull_request\" …
  deliveryId,          // GitHub delivery UUID
  ref,                 // \"refs/heads/main\"
  commitSha,
  payload: Record<string, unknown>,
  receivedAt
}"
    )
  ]
)

== Reviews

#endpoint("GET", "/v1/tracking/submissions/:submissionId/review", auth: true,
  desc: "Get the instructor review for a submission. Returns 404 if no review has been created yet.",
  body: [
    #response-label("200", "")
    #code-block(
"Review {
  id, submissionId, reviewerUserId, status, score,
  status: \"pending\"|\"approved\"|\"changes_requested\"|\"graded\",
  feedback, rubric: [{ criterion, maxScore, earned? }],
  reviewedAt, createdAt, updatedAt,
  // AI grading (when enabled):
  aiConfidence?, aiNeedsReview?, aiReasoningSummary?,
  aiModel?, aiGradedAt?, aiCriterionScores?,
  aiEvidenceQuotes?
}"
    )
    #response-label("404", "No review yet")
  ]
)

#endpoint("POST", "/v1/tracking/submissions/:submissionId/review", auth: true,
  desc: "Create or update the instructor review for a submission. Instructor or TA only. Idempotent — subsequent calls update the existing review.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"status"),   text(font:mono,size:7.5pt,"string"),  `"pending" | "approved" | "changes_requested" | "graded"`),
      (text(font:mono,size:7.5pt,"score"),    text(font:mono,size:7.5pt,"number?"), "Numeric score"),
      (text(font:mono,size:7.5pt,"feedback"), text(font:mono,size:7.5pt,"string?"), "Markdown feedback"),
      (text(font:mono,size:7.5pt,"rubric"),   text(font:mono,size:7.5pt,"array?"),  "[{ criterion, maxScore, earned? }]"),
    ))
    #response-label("200", "Review")
  ]
)

#endpoint("GET", "/v1/tracking/review-queue", auth: true,
  desc: "Get the instructor's pending review queue. Filterable by course, project, and status. Paginated.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"courseId"),  text(font:mono,size:7.5pt,"string?"), "Filter by course"),
      (text(font:mono,size:7.5pt,"projectId"), text(font:mono,size:7.5pt,"string?"), "Filter by project"),
      (text(font:mono,size:7.5pt,"status"),    text(font:mono,size:7.5pt,"string?"), "Filter by submission status"),
      (text(font:mono,size:7.5pt,"limit"),     text(font:mono,size:7.5pt,"number?"), ""),
      (text(font:mono,size:7.5pt,"offset"),    text(font:mono,size:7.5pt,"number?"), ""),
    ))
    #response-label("200", `{ submissions: Submission[] }`)
  ]
)

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 08 — TRACKING: TEAM FORMATION
// ─────────────────────────────────────────────────────────────────────────────

= Tracking — Team Formation

Role applications, automated team formation, and team management for group projects.

#endpoint("POST", "/v1/tracking/projects/:projectId/applications", auth: true,
  desc: "Submit or update a role application for a team project. Students rank preferred roles; the formation algorithm uses these preferences.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"statement"),        text(font:mono,size:7.5pt,"string?"), "Optional motivation statement"),
      (text(font:mono,size:7.5pt,"availabilityNote"), text(font:mono,size:7.5pt,"string?"), "Scheduling notes"),
      (text(font:mono,size:7.5pt,"preferences"),      text(font:mono,size:7.5pt,"array"),   "[{ templateRoleId, rank }]"),
    ))
    #response-label("200", "RoleApplication")
  ]
)

#endpoint("GET", "/v1/tracking/projects/:projectId/applications/me", auth: true,
  desc: "Get the current user's role application for a project.",
  body: [
    #response-label("200", "RoleApplication")
    #response-label("404", "No application submitted yet")
  ]
)

#endpoint("GET", "/v1/tracking/projects/:projectId/applications", auth: true,
  desc: "List all role applications for a project. Instructor or TA only.",
  body: [#response-label("200", "RoleApplication[]")]
)

#endpoint("POST", "/v1/tracking/projects/:projectId/team-formation/generate", auth: true,
  desc: "Run the team formation algorithm over submitted applications. Returns a suggestion set — does not create teams yet. Safe to run multiple times.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"algorithmVersion"), text(font:mono,size:7.5pt,"string?"), "Pin a specific algorithm version"),
    ))
    #response-label("200", "TeamFormationRun")
    #code-block(
"TeamFormationRun {
  id, projectId, algorithmVersion,
  result: {
    suggestions: [{ name, members: [{ userId, username,
                    level, roleKey, roleLabel }],
                    averageLevel }],
    waitlist:    [{ userId, username, level }]
  },
  createdByUserId, createdAt
}"
    )
  ]
)

#endpoint("POST", "/v1/tracking/projects/:projectId/team-formation/lock", auth: true,
  desc: "Lock the suggested teams, creating permanent Team records. Once locked, team formation cannot be re-run.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"formationRunId"), text(font:mono,size:7.5pt,"string?"), "Lock a specific run's suggestions"),
    ))
    #response-label("200", "Team[]")
  ]
)

#endpoint("GET", "/v1/tracking/projects/:projectId/teams", auth: true,
  desc: "List all teams for a project. Visible to all course members.",
  body: [
    #response-label("200", "Team[]")
    #code-block(
"Team {
  id, projectId, name,
  status: \"suggested\"|\"locked\",
  lockedAt, members: TeamMember[],
  repo: TeamRepo | null,
  createdAt, updatedAt
}"
    )
  ]
)

#endpoint("PATCH", "/v1/tracking/projects/:projectId/teams/:teamId", auth: true,
  desc: "Update a team's name or member role assignments. Instructor or TA only.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"name"),    text(font:mono,size:7.5pt,"string?"), "New team name"),
      (text(font:mono,size:7.5pt,"members"), text(font:mono,size:7.5pt,"array?"),  "[{ userId, roleKey, roleLabel }]"),
    ))
    #response-label("200", "Team")
  ]
)

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 09 — TRACKING: DASHBOARDS & ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

= Tracking — Dashboards & Analytics

Aggregated views for students and instructors, plus per-student submission analytics.

#endpoint("GET", "/v1/tracking/dashboard/home", auth: true,
  desc: "Role-aware home dashboard. Returns a student view, instructor view, or both, depending on the user's roles and the `mode` query param.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"mode"), text(font:mono,size:7.5pt,"string?"), `"student" | "instructor"`),
    ))
    #response-label("200", "")
    #code-block(
"{ availableModes: (\"student\"|\"instructor\")[],
  defaultMode,
  student?:    StudentDashboard,
  instructor?: InstructorDashboard }"
    )
  ]
)

#endpoint("GET", "/v1/tracking/dashboard/student", auth: true,
  desc: "Detailed student project dashboard for a specific course — attention items, course snapshots, submission health, and upcoming milestones.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"courseId"), text(font:mono,size:7.5pt,"string?"), "Filter to a specific course"),
    ))
    #response-label("200", "StudentProjectsDashboardResponse")
  ]
)

#endpoint("GET", "/v1/tracking/dashboard/instructor", auth: true,
  desc: "Instructor overview dashboard — review queue summary, urgent items, per-course stats, and recent activity.",
  body: [#response-label("200", "InstructorDashboardResponse")]
)

#endpoint("GET", "/v1/tracking/dashboard/course/:courseId", auth: true,
  desc: "Full stats dashboard for a single course. Instructors, TAs, and admins only.",
  body: [#response-label("200", "InstructorDashboardResponse")]
)

#endpoint("GET", "/v1/tracking/analytics/student", auth: true,
  desc: "Per-course, per-project, per-milestone submission analytics for the authenticated student. Used to power the Submissions page progress bars.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"courseId"), text(font:mono,size:7.5pt,"string?"), "Filter to a specific course"),
    ))
    #response-label("200", "")
    #code-block(
"{ userId,
  analytics: [{
    courseId, courseTitle,
    projects: [{
      projectId, projectTitle,
      totalMilestones, submittedMilestones, passedMilestones,
      milestones: [{
        milestoneId, milestoneTitle, dueAt,
        submissionCount,
        latestStatus: \"queued\"|\"running\"|\"passed\"|\"failed\"|\"needs_review\"|null,
        latestSubmittedAt
      }]
    }]
  }]
}"
    )
  ]
)

#endpoint("GET", "/v1/tracking/activity", auth: true,
  desc: "Activity feed for the current user — recent events across all their courses (submissions, reviews, membership changes).",
  body: [
    #response-label("200", "ActivityEvent[]")
    #code-block(
"ActivityEvent {
  id, actorUserId, courseId, projectId,
  milestoneId, submissionId,
  action, summary, createdAt
}"
    )
  ]
)

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 10 — PROGRAM PLANNING
// ─────────────────────────────────────────────────────────────────────────────

= Program Planning

Academic program management: programs, versions, catalog courses, requirement groups, specialization tracks, student plans, petitions, and approvals.

== Programs

#endpoint("GET", "/v1/programs", auth: true,
  desc: "List all published academic programs.",
  body: [
    #response-label("200", "ProgramSummary[]")
    #code-block(
"ProgramSummary {
  id, slug, title, code, academicYear,
  totalUnitRequirement,
  status: \"draft\"|\"published\"|\"archived\",
  activeVersionId, createdAt, updatedAt
}"
    )
  ]
)

#endpoint("POST", "/v1/programs", auth: true,
  desc: "Create a new academic program. Program manager role required.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"slug"),         text(font:mono,size:7.5pt,"string"),  "URL-safe identifier"),
      (text(font:mono,size:7.5pt,"title"),         text(font:mono,size:7.5pt,"string"),  "Display title"),
      (text(font:mono,size:7.5pt,"code"),          text(font:mono,size:7.5pt,"string"),  "e.g. \"BSc-CS\""),
      (text(font:mono,size:7.5pt,"academicYear"),  text(font:mono,size:7.5pt,"string"),  "e.g. \"2026–27\""),
      (text(font:mono,size:7.5pt,"totalUnitReq"),  text(font:mono,size:7.5pt,"number?"), "Required credit units"),
      (text(font:mono,size:7.5pt,"status"),        text(font:mono,size:7.5pt,"string?"), `"draft" | "published" | "archived"`),
    ))
    #response-label("201", "ProgramSummary")
  ]
)

#endpoint("GET", "/v1/programs/:programId/versions/:versionId", auth: true,
  desc: "Get the full detail of a program version including tracks, catalog courses, and requirement groups.",
  body: [
    #response-label("200", "")
    #code-block(
"{ program: ProgramSummary,
  version: VersionSummary,
  tracks: TrackSummary[],
  catalogCourses: CatalogCourse[],
  requirementGroups: RequirementGroup[] }"
    )
  ]
)

#endpoint("POST", "/v1/programs/:programId/versions", auth: true,
  desc: "Create a new version of a program (e.g. for a new academic year).",
  body: [#response-label("201", "VersionSummary")]
)

#endpoint("POST", "/v1/programs/:programId/catalog-courses", auth: true,
  desc: "Add a course to the program's catalog of eligible courses.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"subjectCode"),   text(font:mono,size:7.5pt,"string"), "e.g. \"CS\""),
      (text(font:mono,size:7.5pt,"catalogNumber"), text(font:mono,size:7.5pt,"string"), "e.g. \"161\""),
      (text(font:mono,size:7.5pt,"title"),         text(font:mono,size:7.5pt,"string"), "Course title"),
      (text(font:mono,size:7.5pt,"defaultUnits"),  text(font:mono,size:7.5pt,"number"), "Credit units"),
      (text(font:mono,size:7.5pt,"department"),    text(font:mono,size:7.5pt,"string"), "Offering department"),
    ))
    #response-label("201", "CatalogCourse")
  ]
)

== Requirement Groups & Tracks

#endpoint("POST", "/v1/programs/:programId/requirement-groups", auth: true,
  desc: "Create a requirement group (foundation, core, depth, elective, capstone, or policy) in a program version.",
  body: [
    #code-block(
"{ title, category: \"foundation\"|\"core\"|\"depth\"|\"elective\"|\"capstone\"|\"policy\",
  trackId?, minUnits?, minCourses?, notes?, sortOrder?, noDoubleCount? }"
    )
    #response-label("201", "RequirementGroup")
  ]
)

#endpoint("PATCH", "/v1/programs/:programId/requirement-groups/:groupId", auth: true,
  desc: "Update a requirement group's fields or rules.",
  body: [#response-label("200", "RequirementGroup")]
)

#endpoint("POST", "/v1/programs/:programId/tracks", auth: true,
  desc: "Create a specialization track in a program version.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"slug"),  text(font:mono,size:7.5pt,"string"),  "URL-safe identifier"),
      (text(font:mono,size:7.5pt,"title"), text(font:mono,size:7.5pt,"string"),  "Display title"),
      (text(font:mono,size:7.5pt,"desc"),  text(font:mono,size:7.5pt,"string?"), "Description"),
      (text(font:mono,size:7.5pt,"selectionYearStart"), text(font:mono,size:7.5pt,"number?"), "Earliest year for selection"),
    ))
    #response-label("201", "TrackSummary")
  ]
)

#endpoint("PATCH", "/v1/programs/:programId/tracks/:trackId", auth: true,
  desc: "Update a specialization track's title, description, or selection year.",
  body: [#response-label("200", "TrackSummary")]
)

== Student Plan

#endpoint("POST", "/v1/programs/:programId/enroll", auth: true,
  desc: "Enroll the authenticated student in an academic program. Creates a StudentProgramPlan.",
  body: [#response-label("200", "StudentProgramPlan")]
)

#endpoint("GET", "/v1/programs/student/me", auth: true,
  desc: "Get the current student's full program plan: selected track, planned courses, requirement decisions, petitions, and approvals.",
  body: [
    #response-label("200", "StudentProgramPlan")
    #code-block(
"StudentProgramPlan {
  id, userId, program, version, selectedTrack,
  availableTracks, status, isLocked, canSelectTrack,
  catalogCourses[], requirementGroups[],
  plannedCourses[], decisions[], petitions[], approvals[],
  latestSheet: { generatedAt } | null
}"
    )
  ]
)

#endpoint("PATCH", "/v1/programs/student/me/plan", auth: true,
  desc: "Update the student's planned courses (called on every drag-and-drop interaction in the planner UI).",
  body: [
    #code-block(
"{ plannedCourses: [{
    catalogCourseId, plannedYear, plannedTerm: \"fall\"|\"spring\",
    sourceType?: \"standard\"|\"transfer\"|\"petition\"|\"manual\",
    note?
  }] }"
    )
    #response-label("200", "StudentProgramPlan")
  ]
)

#endpoint("GET", "/v1/programs/student/me/recommend-track", auth: true,
  desc: "Get track recommendations based on the student's Year 1 planned courses. Score is the fraction of unit overlap between planned courses and each track's requirements.",
  body: [
    #response-label("200", "")
    #code-block(
"{ recommendations: [{
    trackId, trackTitle, trackSlug, trackDescription,
    matchScore: number,     // 0.0 – 1.0
    matchedUnits, totalTrackUnits, matchedCourseCount,
    reason: string
  }],
  year1CourseCount: number }"
    )
  ]
)

#endpoint("POST", "/v1/programs/student/me/select-track", auth: true,
  desc: "Formally select a specialization track for the student's program. Can only be done when `canSelectTrack` is true on the plan.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"trackId"), text(font:mono,size:7.5pt,"string"), "Track CUID to select"),
    ))
    #response-label("200", "StudentProgramPlan")
  ]
)

== Program Sheet

#endpoint("GET", "/v1/programs/student/me/sheet", auth: true,
  desc: "Get the printable program sheet view — all requirement groups with matched and unmatched courses, petition summaries, and approval status.",
  body: [#response-label("200", "ProgramSheetView")]
)

#endpoint("POST", "/v1/programs/student/me/generate-sheet", auth: true,
  desc: "Snapshot and regenerate the printable program sheet. Useful before advisor review.",
  body: [#response-label("200", "ProgramSheetView")]
)

== Petitions

#endpoint("POST", "/v1/programs/student/me/petitions", auth: true,
  desc: "Submit a petition (transfer credit, course substitution, or requirement waiver).",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"type"),          text(font:mono,size:7.5pt,"string"),  `"transfer_credit" | "substitution" | "waiver"`),
      (text(font:mono,size:7.5pt,"justification"), text(font:mono,size:7.5pt,"string"),  "Reason for petition"),
      (text(font:mono,size:7.5pt,"targetGroupId"), text(font:mono,size:7.5pt,"string?"), "Requirement group this affects"),
      (text(font:mono,size:7.5pt,"originalId"),    text(font:mono,size:7.5pt,"string?"), "Original catalog course ID"),
      (text(font:mono,size:7.5pt,"substituteId"),  text(font:mono,size:7.5pt,"string?"), "Substitute catalog course ID"),
    ))
    #response-label("201", "Petition")
  ]
)

#endpoint("GET", "/v1/programs/student/me/petitions", auth: true,
  desc: "List the current student's petitions.",
  body: [#response-label("200", "Petition[]")]
)

#endpoint("GET", "/v1/programs/:programId/petitions", auth: true,
  desc: "List all petitions for a program. Program managers only.",
  body: [#response-label("200", "Petition[]")]
)

#endpoint("PATCH", "/v1/programs/:programId/petitions/:petitionId", auth: true,
  desc: "Approve or reject a petition. Program manager only.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"status"),        text(font:mono,size:7.5pt,"string"),  `"approved" | "rejected"`),
      (text(font:mono,size:7.5pt,"reviewerNotes"), text(font:mono,size:7.5pt,"string?"), "Optional reviewer notes"),
    ))
    #response-label("200", "Petition")
  ]
)

== Approvals

#endpoint("POST", "/v1/programs/:programId/approvals/:studentProgramId/advisor", auth: true,
  desc: "Record advisor-stage approval or rejection for a student's program plan.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"status"), text(font:mono,size:7.5pt,"string"),  `"approved" | "rejected"`),
      (text(font:mono,size:7.5pt,"notes"),  text(font:mono,size:7.5pt,"string?"), "Optional notes"),
    ))
    #response-label("200", "ProgramApproval")
  ]
)

#endpoint("POST", "/v1/programs/:programId/approvals/:studentProgramId/department", auth: true,
  desc: "Record department-stage approval or rejection for a student's program plan.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"status"), text(font:mono,size:7.5pt,"string"),  `"approved" | "rejected"`),
      (text(font:mono,size:7.5pt,"notes"),  text(font:mono,size:7.5pt,"string?"), "Optional notes"),
    ))
    #response-label("200", "ProgramApproval")
  ]
)

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 11 — NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

= Notifications

In-app notification endpoints. The web dashboard polls `/count` every 60 seconds to show the unread badge.

#endpoint("GET", "/v1/notifications", auth: true,
  desc: "List the latest 50 notifications for the authenticated user, newest first.",
  body: [
    #response-label("200", "")
    #code-block(
"{ notifications: [{
    id, type, title, body,
    link: string | null,
    read: boolean,
    createdAt
  }] }"
    )
  ]
)

#endpoint("GET", "/v1/notifications/count", auth: true,
  desc: "Return the number of unread notifications. Polled every 60 s by the web dashboard header.",
  body: [#response-label("200", `{ count: number }`)]
)

#endpoint("POST", "/v1/notifications/read-all", auth: true,
  desc: "Mark all of the authenticated user's notifications as read.",
  body: [#response-label("200", `{ ok: true }`)]
)

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 12 — ADMIN
// ─────────────────────────────────────────────────────────────────────────────

= Admin

Platform-wide admin endpoints. All require `systemRole: "admin"`.

== Submission Admin

#endpoint("GET", "/v1/admin/submissions", auth: true,
  desc: "List all submissions platform-wide. Filter by status or project.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"status"),    text(font:mono,size:7.5pt,"string?"), "Submission status filter"),
      (text(font:mono,size:7.5pt,"projectId"), text(font:mono,size:7.5pt,"string?"), "Filter by project"),
    ))
    #response-label("200", "Submission[]")
  ]
)

#endpoint("PATCH", "/v1/admin/submissions/:submissionId/status", auth: true,
  desc: "Override a submission's verification status. Use to correct false-positive/negative automated results.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"status"),  text(font:mono,size:7.5pt,"string"),  `"passed" | "failed" | "needs_review"`),
      (text(font:mono,size:7.5pt,"summary"), text(font:mono,size:7.5pt,"string?"), "Optional override message"),
    ))
    #response-label("200", "Submission")
  ]
)

#endpoint("GET", "/v1/admin/submissions/:submissionId/logs", auth: true,
  desc: "Retrieve the raw verification worker logs for a submission.",
  body: [#response-label("200", `{ logs: string }`)]
)

#endpoint("POST", "/v1/admin/submissions/:submissionId/retry", auth: true,
  desc: "Re-queue a submission for fresh automated verification. Resets status to `queued`.",
  body: [#response-label("200", `{ ok: true, status: "queued" }`)]
)

== Platform Management

#endpoint("GET", "/v1/admin/projects", auth: true,
  desc: "List all projects across all courses on the platform.",
  body: [#response-label("200", "TrackingProjectSummary[]")]
)

#endpoint("DELETE", "/v1/admin/courses/:courseId", auth: true,
  desc: "Permanently delete a course and all its data. Irreversible.",
  body: [
    #response-label("200", `{ ok: true }`)
    #v(0.2em)
    #block(inset:(x:10pt,y:8pt), radius:4pt, fill:red.lighten(88%),
      stroke: 0.5pt + red.lighten(50%))[
      #text(size:8.5pt, fill:red.darken(20%))[
        *Warning:* This permanently deletes the course, all its projects,
        milestones, and submission records. There is no recovery path.
      ]
    ]
  ]
)

#endpoint("POST", "/v1/admin/projects/:projectId/archive", auth: true,
  desc: "Archive a project. Students can no longer submit; historical data is preserved.",
  body: [#response-label("200", `{ ok: true, status: "archived" }`)]
)

== User Management

#endpoint("GET", "/v1/admin/users", auth: true,
  desc: "List all platform users.",
  body: [
    #response-label("200", "UserRecord[]")
    #code-block(
"UserRecord {
  id, username, email, githubLogin,
  githubLinked, githubAppInstalled,
  systemRole: \"user\"|\"admin\", yearLevel
}"
    )
  ]
)

#endpoint("PATCH", "/v1/admin/users/:userId/role", auth: true,
  desc: "Promote or demote a user's system role.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"role"), text(font:mono,size:7.5pt,"string"), `"user" | "admin"`),
    ))
    #response-label("200", "UserRecord")
  ]
)

#endpoint("GET", "/v1/admin/students", auth: true,
  desc: "List all students with their global academic year level.",
  body: [
    #response-label("200", "StudentRecord[]")
    #code-block(`StudentRecord { userId, username, githubLogin, yearLevel }`)
  ]
)

#endpoint("PATCH", "/v1/admin/students/:userId/year", auth: true,
  desc: "Set a student's global academic year level (1–4). This is separate from the per-course level.",
  body: [
    #params-table((
      (text(font:mono,size:7.5pt,"yearLevel"), text(font:mono,size:7.5pt,"1|2|3|4"), "Global year level"),
    ))
    #response-label("200", "StudentRecord")
  ]
)

// ─────────────────────────────────────────────────────────────────────────────
//  BACK PAGE
// ─────────────────────────────────────────────────────────────────────────────

#pagebreak()
#v(1fr)
#align(center)[
  #line(length: 80pt, stroke: 1pt + border)
  #v(1em)
  #text(font: sans, size: 9pt, fill: muted)[
    Nibras Platform · REST API Reference · May 2026 \
    87 endpoints · 12 feature areas \
    Generated from #raw("packages/contracts/src/api-reference.ts")
  ]
  #v(0.5em)
  #text(font: sans, size: 8pt, fill: border)[
    Internal documentation — not for public distribution
  ]
  #v(1em)
  #line(length: 80pt, stroke: 1pt + border)
]
#v(1fr)

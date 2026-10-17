/** 61 original 2026-10-14 source-sheet routes are preserved below. Later UX-only routes carry sourceRow:null and an explicit editorial note; no source-sheet provenance is claimed. */
export const PLANNING_ROUTES = Object.freeze([
  {
    "from": "N00",
    "answer": "Yes",
    "to": "N01",
    "sourceRow": 5,
    "editorial": "Main path"
  },
  {
    "from": "N00",
    "answer": "No",
    "to": "N00B",
    "sourceRow": 6,
    "editorial": "Explore ideas"
  },
  {
    "from": "N00B",
    "answer": "Return",
    "to": "N00",
    "sourceRow": 7,
    "editorial": "Back to topic"
  },
  {
    "from": "N01",
    "answer": "Continue",
    "to": "N01V",
    "sourceRow": 8,
    "editorial": "After defining the aim, identify an intended beneficiary and possible meaningful use of the results"
  },
  {
    "from": "N02",
    "answer": "Statistics",
    "to": "N03",
    "sourceRow": 9,
    "editorial": "Data-led route"
  },
  {
    "from": "N02",
    "answer": "Modelling",
    "to": "N03",
    "sourceRow": 10,
    "editorial": "Data-led route"
  },
  {
    "from": "N02",
    "answer": "No data",
    "to": "N02T",
    "sourceRow": 11,
    "editorial": "Teacher checkpoint"
  },
  {
    "from": "N02",
    "answer": "Unsure",
    "to": "N02U",
    "sourceRow": 12,
    "editorial": "Clarify route"
  },
  {
    "from": "N02U",
    "answer": "Return",
    "to": "N02",
    "sourceRow": 13,
    "editorial": "Reconsider"
  },
  {
    "from": "N03",
    "answer": "Primary",
    "to": "N03P",
    "sourceRow": 14,
    "editorial": "Short-answer primary questions"
  },
  {
    "from": "N03",
    "answer": "Secondary",
    "to": "N03S",
    "sourceRow": 15,
    "editorial": "Short-answer secondary questions"
  },
  {
    "from": "N03",
    "answer": "Both",
    "to": "N03B",
    "sourceRow": 16,
    "editorial": "Both question sets"
  },
  {
    "from": "N03B",
    "answer": "Primary questions",
    "to": "N03P",
    "sourceRow": 17,
    "editorial": "Complete primary part"
  },
  {
    "from": "N03B",
    "answer": "Secondary questions",
    "to": "N03S",
    "sourceRow": 18,
    "editorial": "Complete secondary part"
  },
  {
    "from": "N03P",
    "answer": "Complete",
    "to": "N03J",
    "sourceRow": 19,
    "editorial": "Primary data details complete, now compare and justify method"
  },
  {
    "from": "N03S",
    "answer": "Complete",
    "to": "N03J",
    "sourceRow": 20,
    "editorial": "Secondary data details complete, now compare and justify method"
  },
  {
    "from": "N03D",
    "answer": "Continue",
    "to": "N03E",
    "sourceRow": 21,
    "editorial": "Rate feasibility"
  },
  {
    "from": "N03E",
    "answer": "Continue",
    "to": "N03F",
    "sourceRow": 22,
    "editorial": "Continue to practical feasibility"
  },
  {
    "from": "N03E",
    "answer": "Revise",
    "to": "N03R",
    "sourceRow": 23,
    "editorial": "Act on readiness warnings"
  },
  {
    "from": "N03R",
    "answer": "Retry",
    "to": "N03",
    "sourceRow": 24,
    "editorial": "Return to data choice"
  },
  {
    "from": "N03F",
    "answer": "Feasibility questions answered",
    "to": "N03G",
    "sourceRow": 25,
    "editorial": "Assess non-mathematical workload and dependencies"
  },
  {
    "from": "N03F",
    "answer": "Safety / privacy / consent unresolved",
    "to": "N02T",
    "sourceRow": 26,
    "editorial": "Teacher discussion before collecting or using affected data"
  },
  {
    "from": "N03G",
    "answer": "Practical plan is workable",
    "to": "N03H",
    "sourceRow": 27,
    "editorial": "Full project timeline after practical completion-ease rating"
  },
  {
    "from": "N03G",
    "answer": "Reduce workload or resolve blockers",
    "to": "N03F",
    "sourceRow": 28,
    "editorial": "Revise access, time, resources or backup plan"
  },
  {
    "from": "N04",
    "answer": "AI SL / AA SL",
    "to": "N04S",
    "sourceRow": 29,
    "editorial": "Show selected course's menu"
  },
  {
    "from": "N04",
    "answer": "Other / AA HL",
    "to": "N04T",
    "sourceRow": 30,
    "editorial": "Teacher judgement"
  },
  {
    "from": "N04S",
    "answer": "Techniques selected or unsure",
    "to": "N01P",
    "sourceRow": 31,
    "editorial": "Initial maths selected → type-specific prediction choices and WHY"
  },
  {
    "from": "N04M",
    "answer": "Continue",
    "to": "N05V",
    "sourceRow": 32,
    "editorial": "Choose a first representation before first mathematical action"
  },
  {
    "from": "N05",
    "answer": "Continue",
    "to": "N06E",
    "sourceRow": 33,
    "editorial": "Ask how investigation might adapt to results"
  },
  {
    "from": "N06",
    "answer": "Student reviews plan and chooses to generate",
    "to": "N07",
    "sourceRow": 34,
    "editorial": "Create personalised planning document; allow editing before export"
  },
  {
    "from": "N07",
    "answer": "Revisit an answer or correct a detail",
    "to": "N06",
    "sourceRow": 35,
    "editorial": "Return to review, retain existing entries, and regenerate only after student confirms"
  },
  {
    "from": "N02T",
    "answer": "Continue with provisional plan",
    "to": "N08",
    "sourceRow": 36,
    "editorial": "No-data branch: teacher discussion before pursuing; bypass irrelevant data collection questions; summary still available"
  },
  {
    "from": "N04T",
    "answer": "Record tentative maths and teacher question",
    "to": "N08",
    "sourceRow": 37,
    "editorial": "AA HL/other course: course suitability pending, still export"
  },
  {
    "from": "N04M",
    "answer": "Outside-course maths or unclear mathematical depth",
    "to": "N08",
    "sourceRow": 38,
    "editorial": "Flag concern, retain techniques, offer summary without teacher response"
  },
  {
    "from": "N03R",
    "answer": "No accessible data; request teacher guidance",
    "to": "N08",
    "sourceRow": 39,
    "editorial": "Keep existing data answers; allow summary even if access uncertain"
  },
  {
    "from": "N03G",
    "answer": "Practical obstacles not yet resolved",
    "to": "N08",
    "sourceRow": 40,
    "editorial": "Carry forward warnings, partial ratings and questions; allow summary"
  },
  {
    "from": "N08",
    "answer": "Optional: identify first safe mathematical step",
    "to": "N05V",
    "sourceRow": 41,
    "editorial": "Optional initial graph or simplified example; teacher flag retained"
  },
  {
    "from": "N08",
    "answer": "Review answers and export provisional plan",
    "to": "N06T",
    "sourceRow": 42,
    "editorial": "Universal teacher check-in then summary review"
  },
  {
    "from": "N08",
    "answer": "Revisit existing planning answers",
    "to": "N01",
    "sourceRow": 43,
    "editorial": "Return without deleting prior entries or teacher flags"
  },
  {
    "from": "N00",
    "answer": "Optional: compare more than one idea",
    "to": "N00C",
    "sourceRow": 44,
    "editorial": "Do a quick practical comparison; single-idea route remains"
  },
  {
    "from": "N00B",
    "answer": "I brainstormed possible ideas",
    "to": "N00C",
    "sourceRow": 45,
    "editorial": "Compare 2–3 candidate IA topics"
  },
  {
    "from": "N00B",
    "answer": "Ready with one idea",
    "to": "N01",
    "sourceRow": 46,
    "editorial": "No comparison required"
  },
  {
    "from": "N00C",
    "answer": "Selected one idea",
    "to": "N01",
    "sourceRow": 47,
    "editorial": "Define its tentative aim"
  },
  {
    "from": "N00C",
    "answer": "Keep original idea",
    "to": "N01",
    "sourceRow": 48,
    "editorial": "No penalty for choosing first idea"
  },
  {
    "from": "N01P",
    "answer": "Prediction made or 'not sure'",
    "to": "N04R",
    "sourceRow": 49,
    "editorial": "After prediction/why, prompt return to mathematics choices and show appropriate suggestions"
  },
  {
    "from": "N03J",
    "answer": "Method justification or 'not sure'",
    "to": "N03D",
    "sourceRow": 50,
    "editorial": "Continue to data timing and readiness"
  },
  {
    "from": "N03B",
    "answer": "Both data sources complete",
    "to": "N03J",
    "sourceRow": 51,
    "editorial": "Only after BOTH primary and secondary answers, not just one"
  },
  {
    "from": "N03H",
    "answer": "Milestones recorded or pending",
    "to": "N04",
    "sourceRow": 52,
    "editorial": "Move to course-specific mathematics"
  },
  {
    "from": "N05V",
    "answer": "Representation planned or uncertain",
    "to": "N05",
    "sourceRow": 53,
    "editorial": "First meaningful mathematics"
  },
  {
    "from": "N06E",
    "answer": "Possible changes considered or unsure",
    "to": "N06T",
    "sourceRow": 54,
    "editorial": "Offer teacher consultation to everyone"
  },
  {
    "from": "N06T",
    "answer": "Record question or skip",
    "to": "N06",
    "sourceRow": 55,
    "editorial": "Review and export"
  },
  {
    "from": "N06T",
    "answer": "Specialist teacher issue",
    "to": "N08",
    "sourceRow": 56,
    "editorial": "Use conditional teacher-check-in questions, then review/export"
  },
  {
    "from": "N08",
    "answer": "Optional: plan milestones before export",
    "to": "N03H",
    "sourceRow": 57,
    "editorial": "If the student wants, enter school deadlines and a working timeline, then return through later nodes"
  },
  {
    "from": "N04R",
    "answer": "Keep / add / remove maths or remain unsure",
    "to": "N04M",
    "sourceRow": 58,
    "editorial": "Continue to mathematical suitability; suggestions not compulsory and not auto-selected"
  },
  {
    "from": "N07",
    "answer": "Continue into Completing in this session",
    "to": "C00",
    "sourceRow": 59,
    "editorial": "Pass student planning fields directly after generating/viewing planning report"
  },
  {
    "from": "N01V",
    "answer": "The results could help me directly",
    "to": "N02",
    "sourceRow": 94,
    "editorial": "Student explains what they could decide, change or understand and why; then continue to IA type"
  },
  {
    "from": "N01V",
    "answer": "I could offer advice to someone else",
    "to": "N02",
    "sourceRow": 95,
    "editorial": "Student describes an audience/role and the decision or recommendation the findings may inform"
  },
  {
    "from": "N01V",
    "answer": "Both personal benefit and advice",
    "to": "N02",
    "sourceRow": 96,
    "editorial": "Allow both, without duplicate questions"
  },
  {
    "from": "N01V",
    "answer": "I'm not sure yet",
    "to": "N02",
    "sourceRow": 97,
    "editorial": "Show a small purpose nudge; record as To be confirmed and optionally ask teacher; summary still available"
  },
  {
    "from": "N01P",
    "answer": "Edit 'Who is this for?' while predicting",
    "to": "N01V",
    "sourceRow": 98,
    "editorial": "Open current beneficiary/purpose fields inline; preserve prediction, WHY, maths and other answers. Return here after confirmation."
  },
  {
    "from": "N01V",
    "answer": "Return to prediction after editing beneficiary",
    "to": "N01P",
    "sourceRow": 99,
    "editorial": "Only when N01V was opened from prediction. Update dynamic wording; confirm or revise previously written implication; do not repeat earlier planning stages."
  },
  {"from":"N02","answer":"Choose maths after statistics","to":"N02M","sourceRow":null,"editorial":"UX 2026-10-17: students select course and possible mathematics immediately after investigation type, before their data plan"},
  {"from":"N02","answer":"Choose maths after modelling","to":"N02M","sourceRow":null,"editorial":"UX 2026-10-17: introduce early course-level mathematical possibilities before evidence planning"},
  {"from":"N02","answer":"Choose maths after theoretical route","to":"N02M","sourceRow":null,"editorial":"UX 2026-10-17: record course and tentative mathematics before theoretical teacher checkpoint"},
  {"from":"N02M","answer":"Proceed to evidence planning","to":"N03","sourceRow":null,"editorial":"UX 2026-10-17: continue data-first routes after early maths review"},
  {"from":"N02M","answer":"Discuss theoretical maths with teacher","to":"N02T","sourceRow":null,"editorial":"UX 2026-10-17: theoretical routes retain existing teacher consultation"},
  {"from":"N03H","answer":"Continue with mathematics already explored","to":"N01P","sourceRow":null,"editorial":"UX 2026-10-17: no duplicate course/technique screen after evidence planning; prediction then maths refinement"},
  {"from":"N03P","answer":"Continue to sampling","to":"N03P2","sourceRow":null,"editorial":"UX 2026-10-17: combine collection procedure, quantities and recording accuracy"},
  {"from":"N03P2","answer":"Complete primary plan","to":"N03J","sourceRow":null,"editorial":"UX 2026-10-17: sampling decisions and readiness finish primary data plan"},
  {"from":"N03P2","answer":"Finish primary data plan","to":"N03D","sourceRow":null,"editorial":"UX 2026-10-17: skip repeated planned method justification; revisit actual method in IA Studio"},
  {"from":"N03S","answer":"Finish secondary data plan","to":"N03D","sourceRow":null,"editorial":"UX 2026-10-17: skip repeated method justification after secondary source selection"},
  {"from":"N03B","answer":"Continue to evidence timing","to":"N03D","sourceRow":null,"editorial":"UX 2026-10-17: combine both validated source branches without a second comparison essay"},
  {"from":"N03E","answer":"Continue to manageability","to":"N03G","sourceRow":null,"editorial":"UX 2026-10-17: essential consent and access checks live on data readiness, bypass lengthy feasibility questionnaire"},
  {"from":"N03E","answer":"Safety / privacy / consent unresolved","to":"N02T","sourceRow":null,"editorial":"UX 2026-10-17: teacher discussion reachable directly from the short consent check"},
  {"from":"N03G","answer":"Revisit practical checks","to":"N03E","sourceRow":null,"editorial":"UX 2026-10-17: return to quick feasibility checks instead of retired long form"},
  {"from":"N03D","answer":"Continue after evidence checks","to":"N03H","sourceRow":null,"editorial":"UX 2026-10-17: merge two readiness ratings and their checklists into source availability and safeguards"},
  {"from":"N03D","answer":"Safety / privacy / consent unresolved","to":"N02T","sourceRow":null,"editorial":"UX 2026-10-17: keep permission and teacher guidance available without separate readiness screens"},
  {"from":"N03D","answer":"Reconsider my data route","to":"N03R","sourceRow":null,"editorial":"UX 2026-10-17: offer targeted help for inaccessible evidence"}
]);

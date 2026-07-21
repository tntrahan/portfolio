import { useState, useEffect, useRef } from "react";

// ---- Design tokens ----
// Ink navy ledger palette — evokes a bookkeeper's tally, not a generic AI-demo gradient.
const tokens = {
  ink: "#14213D",
  inkLight: "#1E2E4F",
  inkLighter: "#28395C",
  paper: "#F2EFE6",
  brass: "#C9A227",
  brassDim: "#8A6F1C",
  sage: "#8CA37E",
  textPrimary: "#F2EFE6",
  textMuted: "#8FA3C0",
};

const QUESTIONS = [
  {
    id: "scheduling",
    label: "Scheduling & appointments",
    skippable: false,
    prompt: "How do you currently handle scheduling and appointments?",
    options: [
      { text: "Phone calls, texts, or paper", hours: 5 },
      { text: "Spreadsheet or shared calendar, updated by hand", hours: 3 },
      { text: "Booking software, but I still confirm manually", hours: 1 },
      { text: "Fully automated booking", hours: 0.25 },
    ],
  },
  {
    id: "invoicing",
    label: "Invoicing & payments",
    skippable: false,
    prompt: "How do invoices and payment follow-ups get handled?",
    options: [
      { text: "Written up by hand or in a document each time", hours: 4 },
      { text: "Spreadsheet template I fill in and send", hours: 2.5 },
      { text: "Invoicing software, but I enter everything manually", hours: 1.5 },
      { text: "Automated invoicing and reminders", hours: 0.3 },
    ],
  },
  {
    id: "followup",
    label: "Customer follow-up",
    skippable: false,
    prompt: "How do you follow up with customers or leads?",
    options: [
      { text: "I try to remember, or I don't get to it", hours: 3 },
      { text: "Manual texts, calls, or emails when I think of it", hours: 1.5 },
      { text: "Some reminders are automated", hours: 0.75 },
      { text: "Fully automated follow-up sequence", hours: 0.2 },
    ],
  },
  {
    id: "recordkeeping",
    label: "Data entry & records",
    skippable: false,
    prompt: "How much do you re-type or re-enter the same information across tools?",
    options: [
      { text: "Constantly — several systems, none of them talk", hours: 5 },
      { text: "Some duplication between a couple of tools", hours: 2.5 },
      { text: "Mostly one system, occasional overlap", hours: 1 },
      { text: "One clean system, no duplication", hours: 0.3 },
    ],
  },
  {
    id: "reporting",
    label: "Reporting & decisions",
    skippable: false,
    prompt: "When you need numbers to make a decision, how do you get them?",
    options: [
      { text: "I compile everything by hand when I need it", hours: 4 },
      { text: "Half-built spreadsheets I update sometimes", hours: 2 },
      { text: "A dashboard I check, but data entry is manual", hours: 1 },
      { text: "Automated, up-to-date reporting", hours: 0.3 },
    ],
  },
  {
    id: "dispatch",
    label: "Dispatch & job routing",
    skippable: true,
    prompt: "For service businesses — how are jobs assigned and routed to staff?",
    options: [
      { text: "Phone calls and manual routing", hours: 4 },
      { text: "Group chat or spreadsheet", hours: 2 },
      { text: "Routing or dispatch software", hours: 0.5 },
      { text: "Fully automated dispatch", hours: 0.1 },
    ],
  },
  {
    id: "estimates",
    label: "Estimates & quotes",
    skippable: true,
    prompt: "For service businesses — how do you put together estimates or quotes?",
    options: [
      { text: "From scratch, every time", hours: 3 },
      { text: "I have a template but fill it in by hand", hours: 1.5 },
      { text: "Software with manual entry", hours: 0.75 },
      { text: "Automated quoting", hours: 0.3 },
    ],
  },
  {
    id: "value",
    label: "The value of your time",
    skippable: false,
    type: "input",
    prompt: "Roughly, what does an hour of this work cost your business?",
    helper:
      "Think about what it would cost to pay someone to do these tasks — whether that's your own time or an admin role. In many areas that starts around $14–$18/hour.",
    defaultValue: 18,
  },
];

function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = value;
    startRef.current = null;
    let raf;
    const step = (ts) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(fromRef.current + (target - fromRef.current) * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

export default function TimeWasteCalculator() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [skipped, setSkipped] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [inputDraft, setInputDraft] = useState("");

  const question = QUESTIONS[step];

  useEffect(() => {
    if (question?.type === "input") {
      const existing = answers[question.id]?.value;
      setInputDraft(String(existing ?? question.defaultValue ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  const answeredCount = Object.keys(answers).length;

  const hoursSoFar = QUESTIONS.reduce((sum, q) => {
    if (q.id === "value") return sum;
    const a = answers[q.id];
    return sum + (a && typeof a.hours === "number" ? a.hours : 0);
  }, 0);

  const animatedHours = useCountUp(showResults ? hoursSoFar : 0, 900);

  const hourlyValue = answers.value?.value ?? 18;
  const annualDollars = hoursSoFar * hourlyValue * 52;
  const animatedDollars = useCountUp(showResults ? annualDollars : 0, 1100);

  function selectOption(q, option) {
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
    goNext();
  }

  function submitValue(q) {
    const num = parseFloat(inputDraft);
    if (isNaN(num) || num <= 0) return;
    setAnswers((prev) => ({ ...prev, [q.id]: { value: num } }));
    goNext();
  }

  function skipQuestion(q) {
    setSkipped((prev) => ({ ...prev, [q.id]: true }));
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[q.id];
      return next;
    });
    goNext();
  }

  function goNext() {
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setShowResults(true);
    }
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  function restart() {
    setAnswers({});
    setSkipped({});
    setStep(0);
    setShowResults(false);
  }

  const breakdown = QUESTIONS.filter(
    (q) => q.id !== "value" && answers[q.id] && answers[q.id].hours > 0.05
  )
    .map((q) => ({ label: q.label, hours: answers[q.id].hours }))
    .sort((a, b) => b.hours - a.hours);

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .twc-option:hover { border-color: #C9A227 !important; background: #28395C !important; }
        .twc-option:focus-visible { outline: 2px solid #C9A227; outline-offset: 2px; }
        .twc-btn:focus-visible { outline: 2px solid #C9A227; outline-offset: 2px; }
        .twc-skip:hover { color: #F2EFE6 !important; }
        @media (prefers-reduced-motion: reduce) {
          .twc-fade { animation: none !important; }
        }
        @keyframes twcFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .twc-fade { animation: twcFadeIn 0.35s ease both; }
      `}</style>

      <div style={styles.container}>
        {/* Header / tally */}
        <div style={styles.header}>
          <div style={styles.eyebrow}>FREE, NO-EMAIL-REQUIRED ASSESSMENT</div>
          <h1 style={styles.h1}>
            How many hours is your business losing each week?
          </h1>
          {!showResults && (
            <p style={styles.subhead}>
              Answer a few quick questions about how your week actually runs.
              Skip anything that doesn't apply.
            </p>
          )}
        </div>

        {!showResults ? (
          <div key={question.id} className="twc-fade" style={styles.card}>
            <div style={styles.entryRow}>
              <span style={styles.entryLabel}>
                ENTRY {String(step + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}
              </span>
              <span style={styles.entryCategory}>{question.label}</span>
            </div>

            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${((step) / QUESTIONS.length) * 100}%`,
                }}
              />
            </div>

            <p style={styles.prompt}>{question.prompt}</p>

            {question.type === "input" ? (
              <div>
                {question.helper && (
                  <p style={styles.helperText}>{question.helper}</p>
                )}
                <div style={styles.inputRow}>
                  <span style={styles.inputPrefix}>$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    inputMode="decimal"
                    value={inputDraft}
                    onChange={(e) => setInputDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitValue(question);
                    }}
                    style={styles.numberInput}
                    aria-label="Dollars per hour"
                  />
                  <span style={styles.inputSuffix}>/ hour</span>
                </div>
                <button
                  className="twc-btn"
                  style={{
                    ...styles.ctaBtn,
                    marginTop: 18,
                    opacity:
                      isNaN(parseFloat(inputDraft)) || parseFloat(inputDraft) <= 0
                        ? 0.5
                        : 1,
                  }}
                  onClick={() => submitValue(question)}
                >
                  Continue
                </button>
              </div>
            ) : (
              <div style={styles.optionsList}>
                {question.options.map((opt, i) => (
                  <button
                    key={i}
                    className="twc-option"
                    style={styles.option}
                    onClick={() => selectOption(question, opt)}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            <div style={styles.navRow}>
              <button
                className="twc-btn"
                style={{
                  ...styles.ghostBtn,
                  visibility: step === 0 ? "hidden" : "visible",
                }}
                onClick={goBack}
              >
                ← Back
              </button>
              {question.skippable && (
                <button
                  className="twc-skip"
                  style={styles.skipBtn}
                  onClick={() => skipQuestion(question)}
                >
                  Doesn't apply to my business — skip →
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="twc-fade" style={styles.card}>
            <div style={styles.resultLabel}>YOUR ESTIMATED WEEKLY LOSS</div>

            <div style={styles.tallyRow}>
              <div style={styles.tallyBlock}>
                <div style={styles.tallyNumber}>
                  {animatedHours.toFixed(1)}
                </div>
                <div style={styles.tallyUnit}>hours / week</div>
              </div>
              <div style={styles.tallyDivider} />
              <div style={styles.tallyBlock}>
                <div style={{ ...styles.tallyNumber, color: tokens.sage }}>
                  ${Math.round(animatedDollars).toLocaleString()}
                </div>
                <div style={styles.tallyUnit}>estimated / year</div>
              </div>
            </div>

            {breakdown.length > 0 && (
              <div style={styles.breakdown}>
                <div style={styles.breakdownTitle}>Where it's going</div>
                {breakdown.map((b) => (
                  <div key={b.label} style={styles.breakdownRow}>
                    <span style={styles.breakdownLabel}>{b.label}</span>
                    <span style={styles.breakdownHours}>
                      {b.hours.toFixed(1)} hrs/wk
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p style={styles.disclaimer}>
              This is a general estimate based on common patterns in small
              businesses like yours. A full audit will determine more precise
              numbers and a specific plan for getting that time back.
            </p>

            <a
              href="#"
              style={styles.ctaBtn}
              onClick={(e) => e.preventDefault()}
            >
              Book a Free Audit Call
            </a>

            <button
              className="twc-skip"
              style={styles.restartBtn}
              onClick={restart}
            >
              Start over
            </button>
          </div>
        )}

        <div style={styles.footerNote}>
          {answeredCount > 0 && !showResults && (
            <span>{answeredCount} of {QUESTIONS.length} answered</span>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: tokens.ink,
    display: "flex",
    justifyContent: "center",
    padding: "48px 20px",
    fontFamily: "'Raleway', sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: 560,
  },
  header: {
    textAlign: "center",
    marginBottom: 28,
  },
  eyebrow: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 11,
    letterSpacing: "0.14em",
    color: tokens.brass,
    marginBottom: 14,
    fontWeight: 500,
  },
  h1: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600,
    fontSize: "clamp(24px, 5vw, 34px)",
    color: tokens.textPrimary,
    lineHeight: 1.2,
    margin: "0 0 12px",
  },
  subhead: {
    color: tokens.textMuted,
    fontSize: 15,
    lineHeight: 1.5,
    margin: 0,
  },
  card: {
    background: tokens.inkLight,
    border: `1px solid ${tokens.inkLighter}`,
    borderRadius: 14,
    padding: "28px 26px",
  },
  entryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 6,
  },
  entryLabel: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 12,
    letterSpacing: "0.08em",
    color: tokens.brass,
  },
  entryCategory: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 12,
    color: tokens.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  progressTrack: {
    height: 3,
    background: tokens.inkLighter,
    borderRadius: 2,
    marginBottom: 22,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: tokens.brass,
    transition: "width 0.4s ease",
  },
  prompt: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 20,
    fontWeight: 500,
    color: tokens.textPrimary,
    lineHeight: 1.35,
    margin: "0 0 20px",
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  option: {
    textAlign: "left",
    background: "transparent",
    border: `1px solid ${tokens.inkLighter}`,
    borderRadius: 9,
    padding: "13px 16px",
    color: tokens.textPrimary,
    fontFamily: "'Raleway', sans-serif",
    fontSize: 14.5,
    cursor: "pointer",
    transition: "border-color 0.15s ease, background 0.15s ease",
  },
  helperText: {
    fontSize: 13.5,
    color: tokens.textMuted,
    lineHeight: 1.55,
    margin: "-8px 0 18px",
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: tokens.ink,
    border: `1px solid ${tokens.inkLighter}`,
    borderRadius: 9,
    padding: "12px 16px",
  },
  inputPrefix: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 20,
    color: tokens.brass,
  },
  numberInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "'Poppins', sans-serif",
    fontSize: 22,
    color: tokens.textPrimary,
    width: "100%",
    MozAppearance: "textfield",
  },
  inputSuffix: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: 13,
    color: tokens.textMuted,
    whiteSpace: "nowrap",
  },
  navRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
  },
  ghostBtn: {
    background: "none",
    border: "none",
    color: tokens.textMuted,
    fontSize: 13.5,
    cursor: "pointer",
    padding: "6px 4px",
    fontFamily: "'Raleway', sans-serif",
  },
  skipBtn: {
    background: "none",
    border: "none",
    color: tokens.textMuted,
    fontSize: 13,
    cursor: "pointer",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    marginLeft: "auto",
    fontFamily: "'Raleway', sans-serif",
    transition: "color 0.15s ease",
  },
  resultLabel: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 12,
    letterSpacing: "0.12em",
    color: tokens.brass,
    textAlign: "center",
    marginBottom: 18,
  },
  tallyRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  tallyBlock: {
    textAlign: "center",
  },
  tallyNumber: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "clamp(32px, 8vw, 44px)",
    fontWeight: 600,
    color: tokens.paper,
    lineHeight: 1,
  },
  tallyUnit: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 11,
    color: tokens.textMuted,
    letterSpacing: "0.06em",
    marginTop: 6,
  },
  tallyDivider: {
    width: 1,
    height: 46,
    background: tokens.inkLighter,
  },
  breakdown: {
    borderTop: `1px solid ${tokens.inkLighter}`,
    paddingTop: 16,
    marginBottom: 20,
  },
  breakdownTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 11,
    letterSpacing: "0.08em",
    color: tokens.textMuted,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  breakdownRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "7px 0",
    fontSize: 14,
    color: tokens.textPrimary,
    borderBottom: `1px solid ${tokens.inkLighter}`,
  },
  breakdownLabel: {
    color: tokens.textPrimary,
  },
  breakdownHours: {
    fontFamily: "'Poppins', sans-serif",
    color: tokens.brass,
    fontSize: 13,
  },
  disclaimer: {
    fontSize: 13,
    color: tokens.textMuted,
    lineHeight: 1.55,
    marginBottom: 22,
  },
  ctaBtn: {
    display: "block",
    textAlign: "center",
    background: tokens.brass,
    color: tokens.ink,
    fontWeight: 600,
    fontSize: 15,
    textDecoration: "none",
    borderRadius: 9,
    padding: "14px 20px",
    fontFamily: "'Raleway', sans-serif",
    cursor: "pointer",
  },
  restartBtn: {
    display: "block",
    margin: "16px auto 0",
    background: "none",
    border: "none",
    color: tokens.textMuted,
    fontSize: 13,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    cursor: "pointer",
    fontFamily: "'Raleway', sans-serif",
    transition: "color 0.15s ease",
  },
  footerNote: {
    textAlign: "center",
    marginTop: 16,
    fontFamily: "'Poppins', sans-serif",
    fontSize: 11,
    color: tokens.textMuted,
    minHeight: 16,
  },
};

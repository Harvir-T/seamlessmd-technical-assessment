# SeamlessMD Software Test Engineer — Technical Assessment

**Submitted by:** Harvir
**Estimated time spent:** 3 1/2 hours

---

## Part 1 — Manual QA Review

### Top 5 Issues

#### 1. Bariatrics Main Tracker — Q5 "31 to 45 grams" incorrectly shows "Go to nearest emergency room"

- **Type:** Logic/configuration
- **Severity:** Critical — This bug can create a false alarm that incorrectly advises a patient to go to an emergency room
- **Location:** Bariatrics Main Tracker, Question 5 ("How many grams of protein did you have yesterday?") — the "31 to 45 grams" option
- **What's wrong:** The "Go to the nearest emergency room" tag for the 31–45 grams option is incorrect. All other options show "Try these self-care tips," even options where the patient consumes less protein. The explanation wording is nearly identical across all options, suggesting the escalation tag itself is the error, not the message content.
- **Why it matters to the patient:** A patient logging 31–45 grams of protein would receive a false message telling them to go to the emergency room. This can cause panic and unnecessary financial stress, erode the patient's trust in the platform after a false alarm, and create real cost for the hospital partner, directly undercutting SeamlessMD's core value proposition of reducing unnecessary ER visits.
- **How I'd verify:** Compare this option's tag against the neighboring options — "16 to 30 grams" and "46 to 60 grams" both correctly show "Try these self-care tips," which isolates this as a single-cell error rather than a systemic issue. I'd also check the CMS's version/edit history on this row to see if it was recently modified, likely a copy/paste or template error during content authoring.
- **Suggested fix:** Change the logic so "Try these self-care tips" appears for the 31–45 grams option. If the current logic is intentional and patients genuinely need to go to the ER at that protein level, the wording should be revised to be more urgent and distinct from the calmer self-care messages.

#### 2. Bariatrics Main Tracker — Q4 "Trouble breathing" has no independent reporting path

- **Type:** Logic/configuration
- **Severity:** Critical — Trouble breathing is a serious standalone symptom with zero reporting path outside the calf-pain dependency. Unlike a misrouted question, this gap produces no error signal for anyone to catch, so it fails silently rather than visibly.
- **Location:** Bariatrics Main Tracker, Question 4 ("Do you have any of these other signs?") — the "Trouble breathing" option
- **What's wrong:** The "Trouble breathing" option is nested under Question 4, which only displays if the patient selected "Calf" pain in Question 2. This pairing makes clinical sense in context — calf pain combined with trouble breathing is a recognized pattern for a blood clot that has progressed to the lungs (pulmonary embolism), which is why Question 4 correctly escalates that combination to the ER. The bug is that trouble breathing is also a serious symptom on its own, independent of calf pain, and this tool provides no way for a patient to report it unless they first select Calf pain in Question 2.
- **Why it matters to the patient:** A patient experiencing trouble breathing for any other reason (a cardiac event, a respiratory complication, an allergic reaction) has no path anywhere in this health check to flag it. The tool's silence could be misread by the patient as reassurance that nothing is wrong, when the honest answer is the app never had a way to ask.
- **How I'd verify:** Complete a test flow as a patient with trouble breathing but no calf pain, and confirm there is no way to report it anywhere in this health check.
- **Suggested fix:** Add "Trouble breathing" as an independent option under Question 2, and update the question wording to "Do you have any of these kinds of pains or symptoms?" so patients can report it without requiring calf pain as a prerequisite.

#### 3. Bariatrics Main Tracker — Q6 "Show if ALL dependencies" logic is unreachable

- **Type:** Logic/configuration
- **Severity:** High — Major functionality of the system is broken because an intended question is not being shown to the patient, but it is contained (no direct patient safety risk).
- **Location:** Bariatrics Main Tracker, Question 6 ("What made it hard for you to eat enough protein yesterday?") — Show dependency configuration
- **What's wrong:** The dependency for showing Question 6 requires ALL of the following to be true simultaneously: Q5 = "0 to 15 grams" AND "16 to 30 grams" AND "31 to 45 grams" AND "46 to 60 grams." Since these are mutually exclusive values from the same question, this condition can never be satisfied, meaning Question 6 will never display to any patient.
- **Why it matters to the patient:** An intentional, supportive follow-up question never appears. The healthcare team loses insight into why patients are struggling to meet their protein goals, and patients miss out on a moment for reflection/support the care plan was designed to provide.
- **How I'd verify:** Test the survey by selecting only one option for Question 5 and confirming whether Question 6 appears. I'd also check analytics for how many patients have ever answered Question 6 — a near-zero response rate would confirm this has been silently failing in production.
- **Suggested fix:** Change Question 5 from a Checkbox (multi-select) to a Radio button (single-select) — its current type is likely what allowed this contradictory rule to be authored undetected. Change the Q6 dependency logic from "Show if ALL dependencies are met" to "Show if ANY dependency is met."

#### 4. 14 Day Satisfaction Survey — Q3 time dependency window doesn't match survey delivery timing

- **Type:** Logic/configuration
- **Severity:** Medium — System does not work as intended; no direct patient harm, but a designed feedback channel is silently lost.
- **Location:** 14 Day Satisfaction Survey, Question 3 ("What do you like most about the at-home part of this online program?")
- **What's wrong:** The survey is named the "14 Day Satisfaction Survey," and Questions 1 and 2 use wording that assumes the survey is being completed 2 weeks after discharge. However, Question 3's time dependency is configured to display only from 0 days–12:00 AM to 12 days–12:00 AM after discharge, a window that closes before day 14.
- **Why it matters to the patient:** Because the survey is sent to patients 14 days after discharge, but Q3 stops appearing after day 12, no patient completing this survey as intended will ever see Q3. SeamlessMD loses the qualitative feedback on what patients valued most about the at-home program, data that would otherwise inform improvements to future care plans. The patient experience itself isn't harmed directly, but the program silently loses a feedback channel it was designed to have.
- **How I'd verify:** Use a test patient with discharge set to 15 days ago and confirm Question 3 does not display. I'd also check analytics on Question 3 response rates to confirm they're near zero relative to overall survey completion.
- **Suggested fix:** Extend the time dependency to 21 days, and communicate to patients when the survey is sent that questions may expire within 7 days of receipt.

#### 5. Bariatrics Main Tracker — Q2/Q3 chest pain dependency is missing

- **Type:** Logic/configuration
- **Severity:** Medium — Causes patients without chest pain to answer a question that presumes they have it, creating false data for the care team.
- **Location:** Bariatrics Main Tracker, Question 2 ("Do you have any of these kinds of pain?") and Question 3 ("Is this new or sudden chest pain?")
- **What's wrong:** Question 2 is missing a rule for the "Chest" option that would display Question 3 only if selected. As a result, Question 3 — which has only "Yes" and "No" answers, both implying the patient has chest pain — is shown to every patient unconditionally, including those who never indicated chest pain in Question 2. This also explains why Q2's "Chest" option currently has no rule configured; it likely was intended to route directly to Q3, but the dependency link was never built.
- **Why it matters to the patient:** Patients without chest pain are forced to answer a question that presumes a symptom they don't have, producing untruthful data and an unpleasant, confusing experience on the platform.
- **How I'd verify:** Complete a test run as a patient with no chest pain and confirm whether Question 3 still appears, forcing an answer that implies a symptom the patient doesn't have.
- **Suggested fix:** Add a rule in Question 2 so that selecting "Chest" pain displays Question 3, mirroring the existing Calf pain → Question 4 pattern, and remove Question 3's current unconditional display so it only appears via this new dependency.

---

### Prioritization Call

If I could only fix three of these five before launch, I would fix the two Critical bugs first: the false "go to emergency room" alarm on the 31–45g protein bracket, and the missing independent reporting path for trouble breathing, since both risk direct, immediate patient harm — one through a false alarm, the other through a silent gap that could be mistaken for reassurance. Third, I'd fix the Question 6 dependency bug (High) over the two remaining Medium issues, because it's the cheapest of the three to fix (a single logic change from ALL to ANY) and it restores a support mechanism that feeds directly back into patient care, unlike the two Medium bugs, which affect satisfaction data and cross-document consistency rather than the patient's active care experience. The two Medium bugs are real and worth fixing, but neither poses an immediate safety risk, and both can reasonably wait for the next release cycle without harming a patient in the interim.

---

### Stakeholder Message

> Hi Patient Education Specialist,
>
> I found something in the Bariatrics tracker that needs an immediate look before this goes live. On the daily protein question (Question 5), if a patient logs 31 to 45 grams, they currently get sent a message telling them to go to the nearest emergency room.
>
> That doesn't look right; every other protein amount, including some lower than this one, shows a "try these self-care tips" message instead. It looks like this one row may have gotten the wrong message attached, maybe copied from a different question by accident.
>
> If that's not intentional, we need to get this changed to match the self-care message like the others. If it is intentional and patients really should be told to go to the ER at that protein level, no worries, just let me know and I'll flag it differently, since right now the wording matches the other calmer messages, which seems like a mismatch either way.
>
> Wanted to catch this before launch since a false ER alert could genuinely alarm a patient.
>
> Thank you,
> Harvir

---

### Additional Issues Noticed (Optional)

- Ideal protein range does not match between the Protein Page (50–70g) and the Bariatrics Main Tracker (60–80g).
- 14 Day Satisfaction Survey Question 4 appears to be the wrong question type — it should be Radio but is currently typed as Text, despite displaying fixed answer options.
- The Protein Page states a daily gram target but doesn't quantify how much protein is in a shake or a teaspoon/tablespoon of protein powder, making it difficult for a patient to calculate whether they're meeting the stated goal from the guidance given.
- Bariatrics Main Tracker Question 5's chart has a "Reverse y-axis" toggle enabled, worth confirming this is intentional given protein is a metric where higher is better.

---

## Part 2 — Test Automation

### Part 2A — Code Review & Debugging

**Original test:**

```javascript
describe('Post-Surgery Symptom Survey', () => {
  it('should complete symptom survey successfully', () => {
    cy.visit('https://ca-qa.seamless.md/#/login')
    cy.get('input[name="email"]').type('patient@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button').click()
    cy.wait(5000)
    cy.get('.survey-link').click()
    cy.wait(3000)
    cy.get('#question1').click()
    cy.get('#question2').type('I feel great!')
    cy.get('#question3').click()
    cy.wait(2000)
    cy.contains('Submit').click()
    cy.wait(5000)
    cy.get('.success-message').should('be.visible')
    cy.url().should('include', '/dashboard')
  })
})
```

**Issues identified:**

- **Hardcoded account credentials** are a real security risk that would affect the whole suite. QA account credentials should be rotated periodically to keep the system secure, and hardcoding them in source control prevents safe rotation and exposes them to anyone with repo access.
- **No error/step verification** during the test. There's no way to confirm the correct page loaded or the correct elements were selected, since no assertions are made along the way. This can cause a false-positive test that would allow real bugs to go unnoticed.
- **Weak selector choices** — `cy.get('button')` will select the first button on the page and click it regardless of what it is. Any UI change (a new button added above it) can silently break this test's actual behavior without producing a clear failure.
- **No cleanup or teardown.** If this test runs multiple times, one user account could submit the survey multiple times, altering environment state each run. This could cause failures or inconsistent behavior if the backend has rules against duplicate submissions.

**Revised version:**

```javascript
describe('Post-Surgery Symptom Survey', () => {
  beforeEach(() => {
    cy.visit('https://ca-qa.seamless.md/#/login')
  })

  it('should complete symptom survey successfully', () => {
    // Credentials pulled from Cypress env config, not hardcoded
    cy.get('input[name="email"]').type(Cypress.env('TEST_EMAIL'))
    cy.get('input[name="password"]').type(Cypress.env('TEST_PASSWORD'))
    cy.get('button[type="submit"]').as('loginButton') // scoped selector, not generic 'button'
    cy.get('@loginButton').click()

    // Replace arbitrary wait with an assertion that waits for the actual page state
    cy.url().should('include', '/home') // or whatever the real post-login route is
    cy.get('.survey-link').should('be.visible').click()

    // Wait for survey to actually load instead of a fixed timer
    cy.get('#question1', { timeout: 10000 }).should('be.visible')

    cy.get('#question1').click()
    cy.get('#question1').should('have.class', 'selected') // assert the click registered

    cy.get('#question2').type('I feel great!')
    cy.get('#question2').should('have.value', 'I feel great!') // assert input was captured

    cy.get('#question3').click()
    cy.get('#question3').should('have.class', 'selected')

    // Scope the submit button instead of relying on text match alone
    cy.get('[data-testid="survey-submit-button"]').click()

    cy.get('.success-message', { timeout: 10000 }).should('be.visible')
    cy.url().should('include', '/dashboard')
  })

  it('should show an error when login fails with invalid credentials', () => {
    cy.get('input[name="email"]').type('invalid@example.com')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()

    cy.get('.error-message').should('be.visible')
    cy.url().should('include', '/login') // should NOT navigate away on failed login
  })

  afterEach(() => {
    // NOTE: If multiple submissions from the same account cause issues in the backend,
    // this hook would ideally reset state (e.g., delete the test submission, log out).
    // I don't have visibility into backend behavior from this assessment, so I'm flagging
    // this as an unresolved assumption rather than implementing unverified reset logic.
  })
})
```

> **Note:** Selectors like `[data-testid="survey-submit-button"]`, `/home`, and `.error-message` are informed assumptions based on common patterns, not verified against the live page for this specific flow (unlike Part 2B, where I inspected the real DOM). I'd confirm these against the actual application before merging.

---

### Part 2B — Practical Test Writing

Tests written against the real patient login page (`https://ca-qa.seamless.md/#/`), using selectors confirmed via live DOM inspection.

**`cypress/support/commands.js`**


**`cypress/e2e/login.spec.cy.js`**


**Selector strategy:** I inspected the live login page's DOM rather than guessing at selectors. The submit button has no `id`, `name`, or `data-testid`, only `type="submit"` and utility CSS classes generated by what appears to be a Tailwind/React Aria-based component library, so I combined `button[type="submit"]` with `.contains('Login')` for a selector that's resilient to both duplicate submit buttons and future copy changes. The empty-field validation messages use a semantic `data-slot="error-message"` attribute, a stable, purpose-built hook. The failed-login error uses `role="alert"`, a real ARIA role, both more resilient than the surrounding styling classes. I'd recommend the engineering team add `data-testid` attributes to key interactive elements going forward, since relying on utility CSS classes or visible text is fragile against unrelated styling changes.

**Scenarios prioritized, and why:** I ranked scenarios by confidence rather than by the order listed in the assignment. Form rendering and empty-field validation are client-side and don't depend on backend behavior, so I could test them with full confidence. Failed-login error handling requires a real backend round-trip with content I couldn't know in advance, so it's more assumption-heavy and I added an explicit timeout to account for network latency. I tested submitting a malformed-but-non-empty email (e.g., "notanemail") and found it produces the same generic "please enter your username/password" validation as the empty-field case — there's no distinct client-side format check separate from the required-field check. I didn't include a separate format-validation test since it would be redundant with the empty-field test already covering that code path. If I had more time, I'd flag this as worth confirming with engineering: whether format validation is intentionally deferred to the backend, or whether it's a gap worth adding client-side for faster user feedback. With more time, I'd also add full accessibility coverage (via `cypress-axe`) and additional viewport breakpoints beyond mobile.

---

## Part 3 — AI Tool Usage

### What did I use?

I used Claude throughout this assessment for drafting the stakeholder message, restructuring this document, and as a second reviewer to help confirm or challenge my findings before finalizing them.

### Prompt Example

While reviewing Question 5 on the Bariatrics Main Tracker, I asked Claude to help me figure out why the "31 to 45 grams" bracket incorrectly showed an ER escalation, and whether the pattern extended further.

**The output:**

> "The bigger miss you should catch: you're focused on 31-45g having a tag the others don't. But look at what's missing from the bracket that actually deserves escalation most: 0-15g is the most severe protein deficiency shown (virtually no protein) and it only gets 'try these self-care tips.' If any bracket should trigger a serious action, it's that one, and it doesn't. So the real bug isn't just '31-45 is wrongly tagged,' it's that the escalation logic is inverted/non-monotonic across the whole range: the most severe input gets the mildest response, and a middle input gets the most severe response."

**My critique:**

I checked the 46–60g bracket specifically, the one directly above the buggy one, not the one Claude pointed me toward, and found it correctly showed "Try these self-care tips." That was enough on its own to disprove the systemic-inversion theory, since a truly inverted scale would have broken that bracket too. All options also contained nearly identically worded messages that didn't imply an ER visit was needed elsewhere. So through further investigation I found that Claude's suggested root cause was misleading and could've led a team down a rabbit hole that didn't exist.

**What I changed:** I didn't just accept the "check the most severe bracket" direction Claude gave me — I continued examining the screenshots independently and arrived at a different, narrower conclusion than what Claude proposed: an isolated single-cell error rather than a systemic logic flaw.

### Catching AI Mistakes in QA

**(a) A Cypress test that passes but asserts nothing meaningful:** I'd catch this immediately because when I create tests I make sure there are assertions at each step to verify the test is flowing as expected. In the original Cypress test I reviewed for this assessment, actions like clicking a checkbox or typing an answer had no verification that the click or input actually registered — the test could click nothing, or click the wrong element, and still pass as long as the final page eventually looked right. I'd also check whether the test would still pass if I intentionally broke the underlying feature; if I can't think of a way to make the test fail by breaking real functionality, it's not actually testing anything. I also make a habit of adding comments to AI-generated code so I'm following the reasoning behind each line, not just accepting it.

**(b) A care-plan content edit that reads perfectly but is clinically wrong:** I'd catch this by not trusting my own or an AI tool's read on clinical plausibility, since neither of us has real clinical authority. For genuinely uncertain clinical content, I'd route it to the actual content owner — a dietitian or clinical reference document — rather than resolve it based on how convincing the wording sounds, since content that reads fluently and confidently is exactly what makes an AI-generated or AI-approved clinical error dangerous. It doesn't look wrong.

---

## Assumptions Made

- Some selectors in Part 2A's rewritten test (e.g., `[data-testid="survey-submit-button"]`, `.error-message`, the `/home` post-login route) are informed assumptions, not verified against the live application, since the original buggy test's flow (post-login survey) wasn't directly accessible to inspect during this assessment. Part 2B's selectors, by contrast, were confirmed via live DOM inspection of the actual login page.
- Where bug severity depends on clinical correctness I couldn't independently verify (e.g., the protein range mismatch between the Protein Page and Bariatrics Main Tracker), I flagged the need to consult source clinical documentation rather than asserting which value is correct.

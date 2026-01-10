-- Migration: Insert Initial Terms of Service
-- Description: Inserts the initial terms of service from Terms 323network.txt

-- Convert markdown-like content to HTML
-- Insert Terms of Service (only if it doesn't exist)
INSERT INTO application_terms (
  title,
  content,
  term_type,
  version,
  is_active
)
SELECT 
  'US Venture Prep – Start - Clickwrap Enrollment Agreement (Terms of Enrollment)',
  '<h1>US Venture Prep – Start</h1>
<h2>Clickwrap Enrollment Agreement (Terms of Enrollment)</h2>

<p><strong>Effective Date:</strong> The date you click "I Agree" (or equivalent) during enrollment.<br/>
<strong>Parties:</strong> This agreement is between <strong>the Program Provider</strong> ("Provider," "we," "us") and <strong>you</strong> ("Participant," "you").</p>

<p>By selecting the checkbox <strong>"I Agree"</strong> and completing enrollment, you confirm that you have read, understood, and agree to be legally bound by this Agreement.</p>

<hr/>

<h2>1) Program Scope (Education & Mentorship — No Promise of Results)</h2>
<p><strong>1.1 Program Nature.</strong> US Venture Prep – Start (the "Program") provides education, training, mentorship, templates, and guidance related to entrepreneurship in the United States, which may include business fundamentals, validation, business planning, marketing/sales strategy, basic financial modeling, and fundraising readiness (e.g., sponsor/grant/investor preparation).</p>

<p><strong>1.2 No Guarantees.</strong> You understand and agree that the Program is <strong>educational and mentoring in nature</strong> and <strong>does not</strong> guarantee outcomes or results, including (without limitation): business success, revenue, profit, funding, grants, sponsorships, investor introductions, approvals, visas, licenses, permits, bank accounts, or employment authorization.</p>

<p><strong>1.3 Not Included.</strong> Unless explicitly stated in writing by Provider as a separate paid service, the Program does <strong>not</strong> include:</p>
<ul>
<li>legal services or immigration services,</li>
<li>accounting, tax, audit, or bookkeeping services,</li>
<li>regulated investment/financial advice, broker services, or fundraising intermediation,</li>
<li>representation before any government agency or third party,</li>
<li>execution of your operations (sales, ads management, hiring, etc.).</li>
</ul>

<hr/>

<h2>2) Payments</h2>
<p><strong>2.1 Fees.</strong> You agree to pay the Program fee presented at checkout ("Fees"), including any applicable taxes.</p>

<p><strong>2.2 Payment Plans.</strong> If you choose a payment plan:</p>
<ul>
<li>you authorize Provider (and its payment processor) to charge each installment automatically on the scheduled dates, and</li>
<li>you remain responsible for all installments regardless of Program usage or attendance.</li>
</ul>

<p><strong>2.3 Failed Payments.</strong> If a payment fails or becomes overdue, Provider may suspend or terminate your access until payment is resolved. Provider may also charge permitted late fees or collection costs where allowed by law.</p>

<hr/>

<h2>3) Refund Policy (No Refunds)</h2>
<p><strong>3.1 All Sales Final.</strong> Due to immediate access to digital materials and limited-capacity mentorship/community access, <strong>all sales are final</strong> once access is granted and/or the first session occurs.</p>

<p><strong>3.2 No Refunds.</strong> <strong>No refunds</strong> will be issued for any reason, including (without limitation): non-attendance, partial participation, change of schedule, dissatisfaction, inability to complete assignments, business outcomes, or early withdrawal, <strong>except where required by applicable law</strong>.</p>

<p><strong>3.3 Chargebacks.</strong> Initiating a chargeback or payment dispute without first contacting Provider in good faith to resolve the issue may result in immediate suspension or termination of access and may be treated as a material breach of this Agreement.</p>

<hr/>

<h2>4) Participant Conduct (Respect, Ethics, Participation)</h2>
<p><strong>4.1</strong> You agree to behave respectfully and ethically in all Program spaces (live sessions, community chats, email, platforms).</p>

<p><strong>4.2 No Harassment / Hate / Abuse.</strong> Harassment, discrimination, hate speech, threats, bullying, or abusive conduct is prohibited.</p>

<p><strong>4.3 No Spamming / Unsolicited Selling.</strong> You may not spam, solicit, scrape, or aggressively market to other participants without written permission from Provider.</p>

<p><strong>4.4 No Disruption.</strong> You agree not to disrupt sessions, derail discussions, or interfere with other participants'' learning.</p>

<p>Provider may remove content, mute, suspend, or remove participants to protect the community.</p>

<hr/>

<h2>5) Community Rules (WhatsApp/Zoom/Online Spaces)</h2>
<p><strong>5.1 No Recording by Participants.</strong> You may not record, screenshot, capture, or redistribute Program content or live calls without Provider''s prior written consent.</p>

<p><strong>5.2 Zoom Etiquette.</strong> Be punctual, keep your mic muted when not speaking, and follow moderator directions.</p>

<p><strong>5.3 WhatsApp/Community Etiquette.</strong> No spam, repeated messages, off-topic flooding, or sharing third-party personal data.</p>

<p><strong>5.4</strong> Provider may moderate, restrict, or remove access to community spaces at its sole discretion for rule enforcement.</p>

<hr/>

<h2>6) Intellectual Property (No Sharing / No Resale)</h2>
<p><strong>6.1</strong> All Program content, materials, templates, slides, recordings, methods, branding, and assets are owned by Provider or licensed to Provider and are protected by intellectual property laws.</p>

<p><strong>6.2</strong> Provider grants you a <strong>limited, personal, non-exclusive, non-transferable, revocable</strong> license to use the materials for your personal educational purposes only.</p>

<p><strong>6.3</strong> You may not copy, reproduce, distribute, resell, sublicense, publish, or share Program materials (including links or recordings) with any third party.</p>

<hr/>

<h2>7) Mandatory Media & Testimonials Release (Required)</h2>
<p><strong>7.1 Grant of Rights.</strong> By enrolling, you grant Provider permission to use your image, voice, name, likeness, and/or testimonials (written, audio, video), including content captured during live sessions, events, or community participation, for Provider''s marketing and promotional purposes (including website, social media, ads, case studies, and internal training), without additional compensation.</p>

<p><strong>7.2 Scope & Duration.</strong> This permission is worldwide, royalty-free, and may be used by Provider and its contractors solely for Provider''s marketing/promotion and related business purposes, for the duration of Provider''s business operations, unless restricted by applicable law.</p>

<p><strong>7.3 No Approval Required.</strong> You waive any right to inspect or approve final marketing materials, except where prohibited by law.</p>

<hr/>

<h2>8) Mandatory Confidentiality (Required)</h2>
<p><strong>8.1 Confidential Information.</strong> "Confidential Information" includes non-public information disclosed by Provider or other participants, including (without limitation): business ideas, strategies, financials, customer data, pricing, vendor lists, pitch materials, templates, recordings, private messages, and community discussions.</p>

<p><strong>8.2 Non-Disclosure.</strong> You agree not to disclose, publish, share, or distribute Confidential Information to any third party without prior written consent from Provider (and the relevant participant, if applicable).</p>

<p><strong>8.3 Permitted Disclosures.</strong> Confidentiality does not apply to information that:</p>
<ul>
<li>becomes public through no fault of yours,</li>
<li>you independently developed without using Confidential Information, or</li>
<li>must be disclosed by law or court order (in which case you will provide notice to Provider when legally permitted).</li>
</ul>

<p><strong>8.4 No Recording / Redistribution.</strong> You agree not to record, retransmit, or share Program calls, content, or community discussions in any form.</p>

<hr/>

<h2>9) Assumption of Risk; Release & Waiver of Liability (Activities On/Off Platform)</h2>
<p><strong>9.1 Activities Covered.</strong> The Program may involve or encourage activities inside or outside your home or usual environment, including (without limitation): attending in-person meetups, workshops, networking events, travel to/from any location, meeting other participants, filming content, participating in business activities, site visits, or any other voluntary activity related to the Program (collectively, "Program-Related Activities").</p>

<p><strong>9.2 Assumption of Risk.</strong> You understand and voluntarily assume all risks arising from Program-Related Activities, whether known or unknown, including (without limitation): personal injury, illness, disability, death, emotional distress, theft, loss of property, damage to property, accidents, and risks associated with third-party venues, transportation, weather, food/beverages, and interactions with other individuals.</p>

<p><strong>9.3 Release and Waiver.</strong> To the maximum extent permitted by law, you <strong>release, waive, and discharge</strong> Provider and its owners, officers, employees, contractors, representatives, speakers, hosts, volunteers, and affiliates (collectively, "Released Parties") from any and all claims, demands, actions, causes of action, damages, losses, liabilities, costs, or expenses (including attorneys'' fees) arising out of or related to:</p>
<ul>
<li>your participation in the Program or any Program-Related Activities, and/or</li>
<li>any injury, accident, illness, loss, theft, or damage occurring during or in connection with the Program or Program-Related Activities,</li>
</ul>
<p>even if caused in whole or in part by the <strong>ordinary negligence</strong> of any Released Party.</p>

<p><strong>9.4 Important Legal Limitation.</strong> This waiver does <strong>not</strong> apply to claims that cannot be waived under applicable law, which may include (depending on jurisdiction) claims based on <strong>gross negligence</strong> or <strong>willful misconduct</strong>.</p>

<p><strong>9.5 Medical Disclaimer.</strong> Provider does not provide medical advice. You are solely responsible for determining whether you are physically, mentally, and emotionally fit to participate in any Program-Related Activities. You are responsible for your own medical care and health insurance coverage.</p>

<p><strong>9.6 Third Parties / Venues.</strong> Provider does not own or control third-party venues, transportation providers, or participants. Provider is not responsible for the acts or omissions of any third party.</p>

<p><strong>9.7 Indemnification.</strong> To the maximum extent permitted by law, you agree to <strong>defend, indemnify, and hold harmless</strong> the Released Parties from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys'' fees) arising from or related to:</p>
<ul>
<li>your participation in the Program or Program-Related Activities,</li>
<li>your violation of this Agreement,</li>
<li>your negligent or wrongful acts or omissions, or</li>
<li>your breach of confidentiality or misuse of Program materials.</li>
</ul>

<hr/>

<h2>10) Limitation of Liability (Not Legal/Accounting Advice)</h2>
<p><strong>10.1 Educational Only.</strong> The Program is for educational purposes and does not provide legal, tax, accounting, immigration, or regulated financial advice.</p>

<p><strong>10.2 Your Responsibility.</strong> You are solely responsible for your decisions, actions, compliance with laws, and results.</p>

<p><strong>10.3 No Indirect Damages.</strong> To the maximum extent permitted by law, Provider will not be liable for indirect, incidental, special, consequential, or punitive damages, including lost profits, lost revenue, lost opportunities, or business interruption.</p>

<p><strong>10.4 Liability Cap.</strong> To the maximum extent permitted by law, Provider''s total liability arising from or related to the Program will not exceed the total amount you paid to Provider for the Program.</p>

<hr/>

<h2>11) Termination, Suspension, and Inactivation</h2>
<p><strong>11.1 By You.</strong> You may stop participating at any time. Refunds, if any, follow Section 3 (No Refunds).</p>

<p><strong>11.2 By Provider (For Cause).</strong> Provider may suspend or terminate your access without refund if you:</p>
<ul>
<li>violate conduct or community rules,</li>
<li>share or resell materials,</li>
<li>harass others,</li>
<li>engage in fraud, chargeback abuse, or illegal activity,</li>
<li>materially breach this Agreement (including Sections 6, 7, 8, or 9).</li>
</ul>

<p><strong>11.3 Nonpayment.</strong> Provider may suspend access for overdue payments and terminate access if nonpayment persists.</p>

<hr/>

<h2>12) Program Changes</h2>
<p>Provider may update schedules, speakers, delivery format, platforms, or materials to improve the Program or respond to operational needs, while maintaining the overall educational purpose of the Program.</p>

<hr/>

<h2>13) Dispute Resolution, Governing Law, and Venue (Arizona)</h2>
<p><strong>13.1 Governing Law.</strong> This Agreement is governed by the laws of the <strong>State of Arizona</strong>, without regard to conflict-of-law principles.</p>

<p><strong>13.2 Venue.</strong> Any dispute arising out of or related to this Agreement or the Program will be brought exclusively in the state or federal courts located in the <strong>State of Arizona</strong>, unless applicable consumer protection laws require otherwise.</p>

<p><strong>13.3 Informal Resolution First.</strong> Before filing a claim, you agree to contact Provider to attempt a good-faith resolution within 30 days.</p>

<hr/>

<h2>14) Miscellaneous</h2>
<p><strong>14.1 Entire Agreement.</strong> This Agreement constitutes the entire agreement between you and Provider regarding the Program and supersedes prior discussions.</p>

<p><strong>14.2 Severability.</strong> If any provision is found unenforceable, the remaining provisions remain in effect.</p>

<p><strong>14.3 No Waiver.</strong> Failure to enforce a provision is not a waiver of the right to enforce it later.</p>

<p><strong>14.4 Electronic Acceptance.</strong> You agree that your electronic acceptance (clicking "I Agree") is legally binding and equivalent to a handwritten signature.</p>

<hr/>

<h2>15) Conspicuous Notice (Place Immediately Above the Checkbox)</h2>
<p><strong>NOTICE: BY CLICKING "I AGREE," YOU ARE (1) AGREEING TO A NO-REFUND POLICY; (2) GRANTING A MANDATORY MEDIA & TESTIMONIALS RELEASE; (3) AGREEING TO MANDATORY CONFIDENTIALITY; AND (4) WAIVING AND RELEASING CERTAIN LEGAL CLAIMS AGAINST THE PROGRAM PROVIDER FOR INJURY, ACCIDENTS, ILLNESS, DEATH, PROPERTY DAMAGE, THEFT, OR OTHER LOSSES ARISING FROM YOUR PARTICIPATION IN PROGRAM-RELATED ACTIVITIES (SECTION 9), TO THE MAXIMUM EXTENT PERMITTED BY LAW.</strong></p>

<hr/>

<h2>16) Click-to-Accept</h2>
<p><strong>By checking the box and clicking "I Agree," you confirm you have read and agree to this US Venture Prep – Start Clickwrap Enrollment Agreement, including Sections 7, 8, and 9.</strong></p>',
  1,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM application_terms 
  WHERE term_type = 'terms_of_service' 
  AND is_active = true
);

-- Insert empty Privacy Policy (infrastructure ready, content blank)
INSERT INTO application_terms (
  title,
  content,
  term_type,
  version,
  is_active
)
SELECT 
  'Política de Privacidade - 323 Network',
  '<p>Conteúdo da política de privacidade será adicionado em breve.</p>',
  'privacy_policy',
  1,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM application_terms 
  WHERE term_type = 'privacy_policy' 
  AND is_active = true
);

'use strict';

// Body HTML for the static /privacy/ and /terms/ pages.
//
// The privacy text describes what the site actually does today: no accounts, no forms, no
// cookies, no analytics or advertising scripts, saved opportunities kept in the browser, Google
// Fonts on the interactive site, GitHub Pages hosting. If any of that changes (analytics, a
// newsletter, a sign-up form), update this file BEFORE shipping the change and bump LEGAL_UPDATED.
// scripts/legal-pages.test.js fails if the site starts loading external scripts or setting cookies
// without this page being revisited.

const LEGAL_UPDATED = '2026-11-16';
const LEGAL_UPDATED_LABEL = '16 November 2026';
const CONTACT = 'contact@setacareersportal.abrdns.com';
const mail = `<a href="mailto:${CONTACT}">${CONTACT}</a>`;

function privacyBody() {
  return '<nav class="muted"><a href="/">Home</a> / Privacy Policy</nav>' +
    '<h1>Privacy Policy</h1>' +
    `<p class="muted">Last updated ${LEGAL_UPDATED_LABEL}</p>` +
    '<section class="card"><strong>In short:</strong> OpportunitiesZA has no accounts, no sign-up forms, no cookies, no analytics and no advertising. We do not ask for your ID, CV, certificates or any other document. Saved opportunities stay in your own browser.</section>' +
    '<h2>1. Who we are</h2>' +
    `<p>OpportunitiesZA is an independent information website run by an individual in South Africa. We publish learnerships, bursaries, internships and apprenticeships and link to the official source of each. We are not an employer, recruiter or government department. You can contact us at ${mail}.</p>` +
    '<h2>2. What the website collects</h2>' +
    '<p>Nothing that identifies you. The site has no registration, no newsletter or other sign-up form, and no comment or upload feature. We do not use analytics or advertising tools, and the site does not set cookies.</p>' +
    '<h2>3. What stays on your device</h2>' +
    '<p>If you save an opportunity, the site keeps its identifier in your browser’s local storage so the list is still there next time. It is never sent to us. You can remove it at any time by clearing the site’s data in your browser.</p>' +
    '<h2>4. Our hosting and other services</h2>' +
    '<ul class="list">' +
    '<li><strong>GitHub Pages.</strong> The site is hosted by GitHub, Inc. Like any web host, GitHub receives technical details of each request (such as your IP address and browser type) and handles them under <a rel="noopener" href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">its own privacy statement</a>. We do not receive visitor-level logs and do not use them to identify anyone.</li>' +
    '<li><strong>Google Fonts.</strong> The interactive version of the site loads its fonts from Google (fonts.googleapis.com and fonts.gstatic.com), so your browser sends Google a request that includes your IP address. The simple static pages (listing pages, guides, this page) do not load anything from other sites.</li>' +
    '</ul>' +
    '<p>GitHub and Google are based in the United States, so this technical data may be processed outside South Africa.</p>' +
    '<h2>5. If you email us</h2>' +
    `<p>We use your email address and message only to reply, to look into a scam report or to consider a listing you suggest. We do not share it, and we delete it when it is no longer needed. Please do not send ID numbers, certificates or other sensitive documents by email: we do not need them.</p>` +
    '<h2>6. Links to other websites</h2>' +
    '<p>Each listing links to the official page where you apply. Those sites have their own privacy practices, which we do not control. Before you enter personal details anywhere, check that the address belongs to the organisation named in the advert. No genuine learnership, bursary or internship asks you to pay to apply.</p>' +
    '<h2>7. What we never do</h2>' +
    '<ul class="list"><li>Sell, rent or trade information about visitors.</li><li>Ask you for documents or payment.</li><li>Profile you for advertising.</li></ul>' +
    '<h2>8. Your rights (POPIA)</h2>' +
    `<p>Under the Protection of Personal Information Act you may ask what personal information we hold about you, ask us to correct or delete it, and object to our processing it. Apart from emails you send us, we hold none. Write to ${mail}. If you are unhappy with our response you may complain to the <a rel="noopener" href="https://inforegulator.org.za/">Information Regulator</a>.</p>` +
    '<h2>9. Children</h2>' +
    '<p>The site is meant for school leavers and other job and study seekers. Because we collect no personal information through it, we hold none about children.</p>' +
    '<h2>10. Changes</h2>' +
    '<p>If we ever add analytics, a newsletter or anything else that collects information, we will update this page first and change the date at the top.</p>';
}

function termsBody() {
  return '<nav class="muted"><a href="/">Home</a> / Terms of Use</nav>' +
    '<h1>Terms of Use and Disclaimer</h1>' +
    `<p class="muted">Last updated ${LEGAL_UPDATED_LABEL}</p>` +
    '<section class="card"><strong>In short:</strong> OpportunitiesZA points you to official opportunity pages. Always confirm the details with the official provider before you apply, and never pay to apply.</section>' +
    '<h2>1. What this website is</h2>' +
    '<p>OpportunitiesZA is an independent information service. We are not an employer, recruiter, training provider, SETA, bursary provider or government department, and we are not affiliated with the organisations whose opportunities we list. We do not take applications and cannot influence who is selected.</p>' +
    '<h2>2. Accuracy and verification</h2>' +
    '<ul class="list">' +
    '<li>Listings summarise information from the official source we link to. Closing dates, requirements and availability can change without notice, and we may be slow to catch a change.</li>' +
    '<li>A listing marked <strong>Unverified</strong> has not been fully confirmed against an official page. Treat it as a lead and check the source yourself.</li>' +
    '<li>Where an advert does not state something (such as the stipend or required documents) we say it is not stated rather than guess.</li>' +
    '<li>The official advert always overrides what we publish.</li>' +
    '</ul>' +
    '<h2>3. No fees, no guarantees</h2>' +
    '<p>We never charge to view listings and we do not charge applicants. We do not promise that you will qualify for, or be offered, any opportunity. Our checkers and calculators give a rough indication only and are not a decision by any provider.</p>' +
    '<h2>4. Scams</h2>' +
    `<p>Genuine learnerships, bursaries and internships do not ask applicants to pay. Be careful with anyone who asks for money, a fee for a “placement” or documents sent to a personal email or WhatsApp number. If you see anything claiming to be us that does this, report it to ${mail}.</p>` +
    '<h2>5. Links to other websites</h2>' +
    '<p>Links to official pages and application portals are for your convenience. We do not control those sites and are not responsible for their content, availability or what they do with your information.</p>' +
    '<h2>6. Using the website</h2>' +
    '<ul class="list"><li>You may link to our pages and share them.</li><li>Names, logos and adverts of listed organisations belong to them.</li><li>Do not use automated tools in a way that overloads the site, and do not present our content as your own or imply that we endorse you.</li></ul>' +
    '<h2>7. Liability</h2>' +
    '<p>We provide the site and its information as it is. To the extent the law allows, we are not liable for loss or damage that results from relying on it, including a missed deadline or a rejected application. Nothing here limits any right you have that cannot be limited by law, including under the Consumer Protection Act.</p>' +
    '<h2>8. Changes and law</h2>' +
    '<p>We may update these terms; the date at the top shows the latest version. They are governed by the laws of the Republic of South Africa.</p>' +
    `<h2>9. Contact</h2><p>${mail}</p>`;
}

module.exports = { LEGAL_UPDATED, privacyBody, termsBody, CONTACT };

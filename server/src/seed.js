const MIN = 60_000;

const start = new Date();
start.setSeconds(0, 0);

const ago = (minutes) => new Date(start.getTime() - minutes * MIN).toISOString();

function dayAt(plusDays, hour, minute = 0) {
  const d = new Date(start);
  d.setDate(d.getDate() + plusDays);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const iso = (plusDays, hour, minute = 0) => dayAt(plusDays, hour, minute).toISOString();
const wd = (plusDays) =>
  dayAt(plusDays, 12).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

const P = {
  ananya: { name: 'Ananya Rao', email: 'ananya@relay.studio' },
  aarav: { name: 'Aarav Shah', email: 'aarav@northwindlabs.com' },
  zoya: { name: 'Zoya Rahman', email: 'zoya@atelierrasa.com' },
  karan: { name: 'Dr. Karan Mehta', email: 'office@meridianheart.in' },
  priya: { name: 'Priya Nair', email: 'priya@meridian.vc' },
  meera: { name: 'Meera Iyer', email: 'meera@northwindlabs.com' },
  tara: { name: 'Tara Menon', email: 'tara@northwindlabs.com' },
  kabir: { name: 'Kabir Shah', email: 'kabir@northwindlabs.com' },
  vikram: { name: 'Vikram Rao', email: 'vikram@foundry.vc' },
  aws: { name: 'AWS Billing', email: 'no-reply@aws.amazon.com' },
  stripe: { name: 'Stripe', email: 'notifications@stripe.com' },
  nisha: { name: 'Nisha Kapoor', email: 'nisha@talentbridge.io' },
  camille: { name: 'Camille Moreau', email: 'camille@maisonlumen.fr' },
  ritu: { name: 'Ritu Shah', email: 'accounts@harpersbazaar.in' },
  books: { name: 'Farah · Atelier books', email: 'books@atelierrasa.com' },
  vogue: { name: 'Vogue India', email: 'newsletter@vogue.in' },
  terra: { name: 'Ishaan Bhatt', email: 'legal@terra-beauty.com' },
  bluedart: { name: 'Suresh · BlueDart', email: 'pickups@bluedart.com' },
  trident: { name: 'Trident Nariman Point', email: 'reservations@tridenthotels.com' },
  cut: { name: 'Amelia Grant', email: 'amelia.grant@thecut.com' },
  mill: { name: 'Rakesh · Surat Mill', email: 'rakesh@kamalsilks.in' },
  landlord: { name: 'Nikhil Joshi', email: 'nikhil@joshi-estates.in' },
  sneha: { name: 'Sneha · Clinic desk', email: 'desk@meridianheart.in' },
  rohit: { name: 'Rohit Deshpande', email: 'rohit.deshpande@gmail.com' },
  summit: { name: 'Dr. Alka Menon', email: 'program@cardiacsummit.in' },
  lab: { name: 'Meridian Labs', email: 'no-reply@meridianlabs.in' },
  rep: { name: 'Anil Kumar', email: 'anil.kumar@sunpharma.com' },
  comms: { name: 'Hospital Communications', email: 'comms@meridianhealth.in' },
  dubai: { name: 'Congress Secretariat', email: 'secretariat@dubaicardio.ae' },
};

const msg = (id, direction, from, minutesAgo, body, to = []) => ({
  id,
  direction,
  from,
  to,
  at: ago(minutesAgo),
  body,
});

export const user = {
  id: 'u-ananya',
  name: 'Ananya Rao',
  firstName: 'Ananya',
  email: 'ananya@relay.studio',
  role: 'Personal assistant',
  workspace: 'Relay Studio',
};

export const clients = [
  {
    id: 'c-aarav',
    name: 'Aarav Shah',
    firstName: 'Aarav',
    role: 'Founder & CEO',
    company: 'Northwind Labs',
    email: 'aarav@northwindlabs.com',
    initials: 'AS',
    accent: 'clay',
    priority: 'VIP',
  },
  {
    id: 'c-zoya',
    name: 'Zoya Rahman',
    firstName: 'Zoya',
    role: 'Creative Director',
    company: 'Atelier Rasa',
    email: 'zoya@atelierrasa.com',
    initials: 'ZR',
    accent: 'plum',
  },
  {
    id: 'c-karan',
    name: 'Dr. Karan Mehta',
    firstName: 'Karan',
    role: 'Consultant Cardiologist',
    company: 'Meridian Heart Clinic',
    email: 'office@meridianheart.in',
    initials: 'KM',
    accent: 'sage',
  },
];

export const accounts = [
  {
    id: 'acc-aarav',
    clientId: 'c-aarav',
    provider: 'google',
    address: 'aarav@northwindlabs.com',
    label: 'Northwind Labs',
    status: 'connected',
    health: 'ok',
    connectedAt: ago(60 * 24 * 46),
    lastSyncAt: ago(3),
    scopes: ['gmail.readonly', 'gmail.send', 'calendar.events'],
    messageCount: 1286,
  },
  {
    id: 'acc-zoya',
    clientId: 'c-zoya',
    provider: 'google',
    address: 'zoya@atelierrasa.com',
    label: 'Atelier Rasa',
    status: 'connected',
    health: 'expiring',
    connectedAt: ago(60 * 24 * 71),
    lastSyncAt: ago(6),
    scopes: ['gmail.readonly', 'gmail.send'],
    messageCount: 942,
    note: 'Access token needs renewing in 9 days',
  },
  {
    id: 'acc-karan',
    clientId: 'c-karan',
    provider: 'microsoft',
    address: 'office@meridianheart.in',
    label: 'Meridian Heart Clinic',
    status: 'connected',
    health: 'ok',
    connectedAt: ago(60 * 24 * 18),
    lastSyncAt: ago(11),
    scopes: ['mail.read', 'mail.send', 'calendars.readwrite'],
    messageCount: 641,
  },
];

export const threads = [
  {
    id: 't-a1',
    accountId: 'acc-aarav',
    clientId: 'c-aarav',
    subject: 'Northwind: Series A term sheet',
    unread: true,
    starred: true,
    status: 'open',
    tags: ['Legal', 'Fundraise'],
    deadlines: [{ label: 'Term sheet response', at: iso(2, 18), kind: 'deadline' }],
    brief: {
      summary:
        'Meridian sent a $6M Series A term sheet at a $34M pre-money, and asked for 48-hour exclusivity while diligence runs.',
      bullets: [
        '$6M at $34M pre-money, 1x non-participating preference',
        'Board seat requested for Meridian',
        `Exclusivity requested through ${wd(2)}`,
      ],
      suggestedAction: 'Aarav should review with counsel before Meridian\u2019s Thursday deadline.',
    },
    messages: [
      msg(
        'm-a1-1',
        'in',
        P.priya,
        4 * 1440,
        `Hi Aarav,

Great to meet you and Kabir on Friday. As promised, I'm sending over our term sheet this week. Nothing unusual in it, and happy to walk you through the model once you've had a look.

Best,
Priya`,
        [P.aarav],
      ),
      msg(
        'm-a1-2',
        'out',
        P.aarav,
        3 * 1440,
        `Priya, thanks for the time today. Send the terms across and I'll review with our counsel this week.

Aarav`,
        [P.priya],
      ),
      msg(
        'm-a1-3',
        'in',
        P.priya,
        42,
        `Hi Aarav,

Following our conversation, here is Meridian's term sheet for Northwind's Series A.

Headline terms: $6M at a $34M pre-money, 1x non-participating preference, and a board seat for Meridian. The one ask from our side is exclusivity through ${wd(2)} so we can complete diligence without a competing process.

This is a decision only you can make. I'd suggest we speak before then. I'm free most of Wednesday.

Best,
Priya
Partner, Meridian Ventures`,
        [P.aarav],
      ),
    ],
    events: [
      {
        id: 'e-a1-1',
        at: ago(4 * 1440),
        kind: 'system',
        text: 'Account connected and 4 years of history indexed.',
      },
    ],
  },
  {
    id: 't-a2',
    accountId: 'acc-aarav',
    clientId: 'c-aarav',
    subject: 'Board meeting: move to ' + wd(8) + '?',
    unread: false,
    starred: false,
    status: 'open',
    tags: ['Board', 'Meetings'],
    deadlines: [{ label: 'Board meeting', at: iso(8, 10), kind: 'meeting' }],
    brief: {
      summary:
        'Two board members are traveling next week. Meera has asked to move the board meeting to ' + wd(8) + ' at 10:00.',
      bullets: ['Same agenda and room', 'Meera will re-send all invites', 'Ananya already acknowledged the request'],
      suggestedAction: 'Confirm the new date so invites go out today.',
    },
    messages: [
      msg(
        'm-a2-1',
        'in',
        P.meera,
        260,
        `Hi Ananya,

Two board members are traveling next week. Could we move the board meeting from ${wd(7)} to ${wd(8)}, 10:00 IST? Same agenda, same room.

If that works I'll re-send the calendar invites to everyone.

Thanks,
Meera`,
        [P.ananya],
      ),
      msg(
        'm-a2-2',
        'out',
        P.ananya,
        180,
        `Hi Meera,

${wd(8)} at 10:00 works for Aarav. Please go ahead and re-send the invites. I'll keep the prep doc in the same folder.

Thanks,
Ananya`,
        [P.meera],
      ),
      msg(
        'm-a2-3',
        'in',
        P.meera,
        150,
        `Perfect, invites are out. One small thing: Aarav's slide on the hiring plan is still marked draft. Could you get the final version to me by ${wd(6)}?

Thanks!
Meera`,
        [P.ananya],
      ),
    ],
  },
  {
    id: 't-a3',
    accountId: 'acc-aarav',
    clientId: 'c-aarav',
    subject: 'Offer approval: Staff Engineer (L5), start Dec 8',
    unread: true,
    starred: true,
    status: 'open',
    tags: ['Hiring', 'Important'],
    deadlines: [{ label: 'Offer expiry', at: iso(3, 20), kind: 'deadline' }],
    brief: {
      summary:
        'Tara wants to offer Rohan Gupta L5 at ₹78L fixed plus 0.18% equity. The equity sits above the agreed band, so she needs Aarav\u2019s approval before the candidate\u2019s competing offer expires.',
      bullets: [
        'Panel was unanimous',
        '₹78L fixed + 0.18% equity',
        'Competing offer expires ' + wd(3),
      ],
      suggestedAction: 'Aarav should approve or adjust the equity number today.',
    },
    messages: [
      msg(
        'm-a3-1',
        'in',
        P.tara,
        205,
        `Hi Aarav,

We finished the loop for Rohan Gupta yesterday. The panel was unanimous and the team is keen.

We'd like to offer L5 at ₹78L fixed + 0.18% equity. He has a competing offer that expires ${wd(3)}, so I need your approval on the comp before I send the letter tonight.

The equity number is above the band we agreed in September, and that part is your call. I don't want to commit above band without you.

Thanks,
Tara`,
        [P.aarav],
      ),
    ],
  },
  {
    id: 't-a4',
    accountId: 'acc-aarav',
    clientId: 'c-aarav',
    subject: 'Intro: Daniel Okafor → Aarav',
    unread: true,
    starred: false,
    status: 'open',
    tags: ['Intro'],
    deadlines: [],
    brief: {
      summary:
        'Vikram is offering a warm intro to Daniel Okafor, who leads product partnerships at Figma. He has left the next step open.',
      bullets: ['No decision required yet', 'Vikram offered to coordinate', 'No deadline mentioned'],
      suggestedAction: 'Ask Aarav whether he wants the intro, or have the assistant schedule it directly.',
    },
    messages: [
      msg(
        'm-a4-1',
        'in',
        P.vikram,
        370,
        `Hi both,

Daniel runs product partnerships at Figma and would love to compare notes on design tooling with you. Thought the two of you should meet.

Aarav, want me to find a time, or would you rather keep it light for now?

V`,
        [P.aarav],
      ),
    ],
  },
  {
    id: 't-a5',
    accountId: 'acc-aarav',
    clientId: 'c-aarav',
    subject: 'Your AWS invoice for November is available',
    unread: false,
    starred: false,
    status: 'open',
    tags: ['Billing'],
    deadlines: [],
    brief: {
      summary: 'Automated billing notice from AWS. No action required.',
      bullets: ['Auto-generated message', 'No reply expected'],
      suggestedAction: 'Filed automatically. Nothing to do.',
    },
    messages: [
      msg(
        'm-a5-1',
        'in',
        P.aws,
        520,
        `Hello Aarav Shah,

Your AWS invoice for the billing period November 1 to 15, 2026 is now available in the Billing console. Total due: $4,218.40.

This is an automated message from a no-reply address. Please do not reply to this email.

Amazon Web Services`,
        [P.aarav],
      ),
    ],
  },
  {
    id: 't-a6',
    accountId: 'acc-aarav',
    clientId: 'c-aarav',
    subject: 'Stripe payout summary: November 1 to 15',
    unread: false,
    starred: false,
    status: 'done',
    tags: ['Billing'],
    deadlines: [],
    brief: {
      summary: 'Stripe payout notification for the first half of November. Already reconciled.',
      bullets: ['Automated summary', 'Marked done by Ananya'],
      suggestedAction: 'No action needed.',
    },
    messages: [
      msg(
        'm-a6-1',
        'in',
        P.stripe,
        2 * 1440,
        `Payout of $182,940.00 was initiated to your bank account ending 8842.

This is a notification only. Do not reply to this email.
Stripe`,
        [P.aarav],
      ),
    ],
  },
  {
    id: 't-a7',
    accountId: 'acc-aarav',
    clientId: 'c-aarav',
    subject: 'Staff backend role: would Aarav be open?',
    unread: false,
    starred: false,
    status: 'open',
    tags: ['Recruiting'],
    deadlines: [],
    brief: {
      summary:
        'An external recruiter is asking whether Aarav is open to a staff engineering role elsewhere. Routine outreach that the assistant can decline.',
      bullets: ['External recruiter, no prior relationship', 'No action needed from Aarav'],
      suggestedAction: 'Send the standard decline on Aarav\u2019s behalf.',
    },
    messages: [
      msg(
        'm-a7-1',
        'in',
        P.nisha,
        610,
        `Hi there,

I'm working with a Series C fintech on a Staff Backend role in Bangalore and wanted to check whether Aarav would be open to a conversation. Comp is strong and the remit is close to what he's built at Northwind.

Could you let me know if there's a good way to reach his office?

Best,
Nisha Kapoor
Talent Bridge`,
        [P.aarav],
      ),
    ],
  },
  {
    id: 't-a8',
    accountId: 'acc-aarav',
    clientId: 'c-aarav',
    subject: 'Re: the TechCrunch piece, need your read',
    unread: true,
    starred: true,
    status: 'open',
    tags: ['Press', 'Important'],
    deadlines: [{ label: 'Press comment due', at: iso(1, 18), kind: 'deadline' }],
    brief: {
      summary:
        'A reporter has asked for Northwind\u2019s comment on a layoff rumor before 6pm tomorrow. Kabir thinks the wording is sensitive and wants Aarav\u2019s judgment.',
      bullets: ['On-the-record comment requested', 'Deadline tomorrow 6pm', 'Kabir is waiting on Aarav'],
      suggestedAction: 'Aarav should approve the wording. This is his call.',
    },
    messages: [
      msg(
        'm-a8-1',
        'in',
        P.kabir,
        95,
        `Hey Aarav,

The TechCrunch reporter has our comment on the layoff rumor. She's asking whether we want to add anything on the record before 6pm tomorrow.

I don't want to say the wrong thing here. Can you call me once you've read her note? This is your call, not mine.

K`,
        [P.aarav],
      ),
    ],
    events: [
      {
        id: 'e-a8-1',
        at: ago(88),
        kind: 'ai',
        text: 'Relay re-checked this conversation after Kabir\u2019s reply and moved it from Assistant to reply to Client to reply.',
      },
    ],
  },
  {
    id: 't-z1',
    accountId: 'acc-zoya',
    clientId: 'c-zoya',
    subject: 'Paris showroom: fitting on ' + wd(4),
    unread: true,
    starred: false,
    status: 'open',
    tags: ['Meetings', 'Travel'],
    deadlines: [{ label: 'Paris fitting', at: iso(4, 10), kind: 'meeting' }],
    brief: {
      summary:
        'Maison Lumen has reserved its Paris showroom for Zoya\u2019s fitting on ' + wd(4) + ' at 10:00. They need arrival time and shoe size, and will arrange the car.',
      bullets: ['Fitting window 10:00, about 90 minutes', 'Three looks from the winter capsule', 'Car from Le Marais arranged by showroom'],
      suggestedAction: 'Confirm arrival details with Camille and add the fitting to Zoya\u2019s calendar.',
    },
    messages: [
      msg(
        'm-z1-1',
        'in',
        P.camille,
        58,
        `Bonjour Ananya,

We've reserved the showroom on ${wd(4)} from 10:00. Zoya's fitting will take about 90 minutes, and the team would love to see the three looks from the winter capsule.

Could you confirm her arrival time and shoe size? We'll arrange the car from Le Marais.

Merci,
Camille
Maison Lumen`,
        [P.ananya],
      ),
    ],
  },
  {
    id: 't-z2',
    accountId: 'acc-zoya',
    clientId: 'c-zoya',
    subject: 'Invoice #4471: 18 days overdue',
    unread: false,
    starred: false,
    status: 'open',
    tags: ['Invoices', 'Finance'],
    deadlines: [{ label: 'Month-end close', at: iso(6, 17), kind: 'deadline' }],
    brief: {
      summary:
        'Invoice #4471 for the October cover shoot (₹4.8L) is 18 days overdue with Harper\u2019s Bazaar. Farah needs a payment date for month-end close.',
      bullets: ['₹4,80,000 outstanding', 'Reminder already sent to Ritu', 'Month-end close on ' + wd(6)],
      suggestedAction: 'Chase Ritu again and get a confirmed payment date.',
    },
    messages: [
      msg(
        'm-z2-1',
        'in',
        P.books,
        3 * 60,
        `Hi Ananya,

Invoice #4471 to Harper's Bazaar for the October cover shoot (₹4,80,000) is now 18 days past due. I've emailed Ritu twice but haven't had a date back.

Can you follow up from Zoya's side? I need something concrete before month-end close on ${wd(6)}.

Thanks,
Farah`,
        [P.ananya],
      ),
      msg(
        'm-z2-2',
        'out',
        P.ananya,
        2 * 60,
        `Hi Ritu,

Following up on invoice #4471 (₹4,80,000). It's now 18 days past due. Could you confirm the payment date so we can close our books for the month?

Happy to resend the invoice if helpful.

Best,
Ananya
On behalf of Zoya Rahman`,
        [P.ritu],
      ),
    ],
  },
  {
    id: 't-z3',
    accountId: 'acc-zoya',
    clientId: 'c-zoya',
    subject: 'Vogue India: your November press release',
    unread: false,
    starred: false,
    status: 'open',
    tags: ['Press'],
    deadlines: [],
    brief: {
      summary: 'Press release digest from Vogue India. Newsletter, no response needed.',
      bullets: ['Automated newsletter', 'No reply expected'],
      suggestedAction: 'No action needed.',
    },
    messages: [
      msg(
        'm-z3-1',
        'in',
        P.vogue,
        7 * 60,
        `VOGUE INDIA: PRESS DIGEST

Your submitted release has been received and will be considered for the December digital edition. You can view the full release in your press portal.

You are receiving this because you are on the Vogue India press list. Unsubscribe | View in browser`,
        [P.zoya],
      ),
    ],
  },
  {
    id: 't-z4',
    accountId: 'acc-zoya',
    clientId: 'c-zoya',
    subject: 'Collab agreement: clause 7.3 (exclusivity)',
    unread: true,
    starred: false,
    status: 'open',
    tags: ['Legal', 'Contracts'],
    deadlines: [{ label: 'Sign-off requested', at: iso(2, 17), kind: 'deadline' }],
    brief: {
      summary:
        'Terra Beauty\u2019s counsel has added a six-month beauty exclusivity clause that changes the commercial terms. They won\u2019t proceed without Zoya\u2019s explicit approval.',
      bullets: ['Clause 7.3 adds 6-month beauty exclusivity', 'Commercial terms change', 'Sign-off requested by ' + wd(2)],
      suggestedAction: 'Zoya should review the clause with her lawyer before signing.',
    },
    messages: [
      msg(
        'm-z4-1',
        'in',
        P.terra,
        6 * 60,
        `Hi Zoya,

Our counsel has flagged clause 7.3 of the collaboration agreement. As drafted, it gives Terra a six-month exclusivity in the beauty category, which is broader than what we discussed in October.

This changes the commercial terms, so I don't want to proceed without your explicit approval. Could you confirm by ${wd(2)}?

Best,
Ishaan
Legal, Terra Beauty`,
        [P.zoya],
      ),
    ],
  },
  {
    id: 't-z5',
    accountId: 'acc-zoya',
    clientId: 'c-zoya',
    subject: 'Sample box pickup: tomorrow 11 to 1',
    unread: false,
    starred: false,
    status: 'open',
    tags: ['Logistics'],
    deadlines: [{ label: 'Courier pickup', at: iso(1, 11), kind: 'meeting' }],
    brief: {
      summary:
        'BlueDart can collect the sample box tomorrow between 11:00 and 13:00. Pickup address and box count are confirmed; waiting on their collection reference.',
      bullets: ['Window: 11:00 to 13:00 tomorrow', 'Address and box count shared', 'Waiting for BlueDart to confirm the docket'],
      suggestedAction: 'No action until BlueDart confirms the docket number.',
    },
    messages: [
      msg(
        'm-z5-1',
        'in',
        P.bluedart,
        5 * 60,
        `Hi Ananya,

The courier can collect the sample box tomorrow between 11 and 1. Please confirm the pickup address and the number of boxes.

Suresh
BlueDart`,
        [P.ananya],
      ),
      msg(
        'm-z5-2',
        'out',
        P.ananya,
        4 * 60,
        `Hi Suresh,

Address: Atelier Rasa studio, 2nd floor, Khar West. Two boxes, 12 kg total, pre-packed.

Could you share the docket number once it's assigned? Zoya's team needs it for the Paris consignment.

Thanks,
Ananya`,
        [P.bluedart],
      ),
    ],
  },
  {
    id: 't-z6',
    accountId: 'acc-zoya',
    clientId: 'c-zoya',
    subject: 'Booking confirmed: Trident, Nariman Point',
    unread: false,
    starred: false,
    status: 'open',
    tags: ['Travel', 'Meetings'],
    deadlines: [{ label: 'Check-in', at: iso(3, 14), kind: 'travel' }],
    brief: {
      summary: 'Hotel stay confirmed for ' + wd(3) + ' at Trident Nariman Point. Confirmation only.',
      bullets: ['Check-in from 14:00 on ' + wd(3), 'Confirmation TRN-88214', 'Breakfast included'],
      suggestedAction: 'Added to Zoya\u2019s travel timeline. No reply needed.',
    },
    messages: [
      msg(
        'm-z6-1',
        'in',
        P.trident,
        9 * 60,
        `Dear Ms. Rahman,

Your reservation is confirmed for ${wd(3)}, 1 night, Deluxe Sea View. Confirmation number TRN-88214. Check-in from 14:00.

This is an automated confirmation. For changes, please call the reservations desk.
Trident, Nariman Point`,
        [P.zoya],
      ),
    ],
  },
  {
    id: 't-z7',
    accountId: 'acc-zoya',
    clientId: 'c-zoya',
    subject: 'Interview request: The Cut, December issue',
    unread: true,
    starred: false,
    status: 'open',
    tags: ['Press'],
    deadlines: [{ label: 'Hold the slot', at: iso(4, 18), kind: 'deadline' }],
    brief: {
      summary:
        'The Cut has asked Zoya to write a first-person piece about building Atelier Rasa. They need a yes by ' + wd(4) + ' to hold the December slot.',
      bullets: ['1,200-word first-person essay', 'December issue', 'Response needed by ' + wd(4)],
      suggestedAction: 'Zoya should decide whether she wants to write this herself.',
    },
    messages: [
      msg(
        'm-z7-1',
        'in',
        P.cut,
        7 * 60 + 20,
        `Hi Zoya,

I'm editing the December issue and would love a first-person piece from you on building Atelier Rasa out of a two-person studio, in your voice, 1,200 words.

Would you be open to it? We'd need a yes by ${wd(4)} to hold the slot, and we can work around your show calendar.

Warmly,
Amelia Grant
The Cut`,
        [P.zoya],
      ),
    ],
  },
  {
    id: 't-z8',
    accountId: 'acc-zoya',
    clientId: 'c-zoya',
    subject: 'Fabric order: minimum quantity change from January',
    unread: true,
    starred: false,
    status: 'open',
    tags: ['Suppliers'],
    deadlines: [],
    brief: {
      summary:
        'Kamal Silks is raising the minimum order for silk twill from 120m to 300m per color from January, adding roughly ₹6.2L to the March production run.',
      bullets: ['New minimum: 300m per color', 'Adds ~₹6.2L to March production', 'No deadline given'],
      suggestedAction: 'Zoya needs to decide whether to absorb the volume or find a second mill.',
    },
    messages: [
      msg(
        'm-z8-1',
        'in',
        P.mill,
        8 * 60,
        `Hello Zoya,

From January our mill is raising the minimum for the silk twill from 120m to 300m per color. At your current March plan that would add about ₹6.2L to the run.

Let me know how you'd like to proceed. We can hold your current rate until the end of the month.

Rakesh
Kamal Silks`,
        [P.zoya],
      ),
    ],
  },
  {
    id: 't-z9',
    accountId: 'acc-zoya',
    clientId: 'c-zoya',
    subject: 'Mumbai store: lease renewal terms',
    unread: true,
    starred: true,
    status: 'open',
    tags: ['Legal', 'Finance', 'Important'],
    deadlines: [{ label: 'Lease response', at: iso(5, 12), kind: 'deadline' }],
    brief: {
      summary:
        'The Bandra store lease expires at the end of January. The landlord proposes a 12% increase with a three-year lock-in, and wants a decision by ' + wd(5) + '.',
      bullets: ['12% increase proposed', 'Three-year lock-in', 'Decision requested by ' + wd(5)],
      suggestedAction: 'Zoya should decide personally. This is a three-year financial commitment.',
    },
    messages: [
      msg(
        'm-z9-1',
        'in',
        P.landlord,
        11 * 60,
        `Dear Zoya,

The lease on the Bandra store expires on January 31. The landlord is proposing a 12% increase with a three-year lock-in, with a 5% escalation in year three.

We need your confirmation before ${wd(5)} to hold the current rate. Happy to walk you through the options.

Nikhil Joshi
Joshi Estates`,
        [P.zoya],
      ),
    ],
  },
  {
    id: 't-k1',
    accountId: 'acc-karan',
    clientId: 'c-karan',
    subject: 'Follow-up slot for Mrs. Iyer this week',
    unread: false,
    starred: false,
    status: 'open',
    tags: ['Appointments'],
    deadlines: [{ label: 'Mrs. Iyer follow-up', at: iso(3, 16), kind: 'meeting' }],
    brief: {
      summary:
        'The clinic desk needs a follow-up slot for Mrs. Iyer. Thursday 16:30 and Friday 09:00 are both open; she prefers mornings.',
      bullets: ['Three-month follow-up', 'Thursday 16:30 or Friday 09:00', 'Patient prefers mornings'],
      suggestedAction: 'Confirm Friday 09:00 with the desk and inform the patient.',
    },
    messages: [
      msg(
        'm-k1-1',
        'in',
        P.sneha,
        140,
        `Hi Ananya,

Mrs. Iyer called about her three-month follow-up. Dr. Mehta's list is full until ${wd(3)}; shall I offer her ${wd(3)} at 4:30pm or ${wd(4)} at 9am? She'd prefer a morning.

Thanks,
Sneha`,
        [P.ananya],
      ),
      msg(
        'm-k1-2',
        'out',
        P.ananya,
        120,
        `Hi Sneha,

Let's offer ${wd(4)} at 9am. The morning slot suits her better. Please confirm with her and add it to Dr. Mehta's list.

Thanks,
Ananya`,
        [P.sneha],
      ),
    ],
  },
  {
    id: 't-k2',
    accountId: 'acc-karan',
    clientId: 'c-karan',
    subject: 'Second opinion request: Mr. Deshpande (family friend)',
    unread: true,
    starred: true,
    status: 'open',
    tags: ['Clinical', 'Important'],
    deadlines: [],
    brief: {
      summary:
        'A family friend is asking Dr. Mehta for a personal read on his father\u2019s angiogram. The cardiologist has recommended a stent this week, and the family is unsure whether to wait.',
      bullets: ['70% LAD block reported', 'Stent recommended this week', 'Request is personal, not a formal consultation'],
      suggestedAction: 'Dr. Mehta should respond personally. Clinical judgment and a personal relationship are both involved.',
    },
    messages: [
      msg(
        'm-k2-1',
        'in',
        P.rohit,
        165,
        `Dr. Mehta,

My father's angiogram shows a 70% LAD block. Our cardiologist is recommending a stent this week, but the family is unsure whether to wait and get a second opinion first.

I know you can't take him on as a patient, and I'm not asking you to. I'm asking you personally, as a friend, what you would do in our position.

Rohit`,
        [P.karan],
      ),
    ],
  },
  {
    id: 't-k3',
    accountId: 'acc-karan',
    clientId: 'c-karan',
    subject: 'Cardiology Summit: speaker confirmation and slides',
    unread: true,
    starred: false,
    status: 'open',
    tags: ['Meetings', 'Travel'],
    deadlines: [
      { label: 'Final slides due', at: iso(8, 18), kind: 'deadline' },
      { label: 'Keynote', at: iso(12, 11), kind: 'meeting' },
    ],
    brief: {
      summary:
        'The summit team has confirmed Dr. Mehta\u2019s keynote and needs AV requirements plus final slides by ' + wd(8) + '. Travel and hotel are already booked.',
      bullets: ['Keynote on ' + wd(12) + ' at 11:40', 'Slides due ' + wd(8), 'Travel and hotel booked'],
      suggestedAction: 'Confirm AV needs and block time for the slide review.',
    },
    messages: [
      msg(
        'm-k3-1',
        'in',
        P.summit,
        10 * 60,
        `Dear Dr. Mehta,

We're delighted to confirm your keynote at the Cardiology Summit on ${wd(12)} at 11:40. The session is 30 minutes plus 10 minutes of questions.

Could Ananya confirm your AV requirements and send the final slides by ${wd(8)}? Travel and hotel are booked as per the attached itinerary.

Warm regards,
Dr. Alka Menon
Program Chair`,
        [P.karan, P.ananya],
      ),
    ],
  },
  {
    id: 't-k4',
    accountId: 'acc-karan',
    clientId: 'c-karan',
    subject: '3 results ready in the patient portal',
    unread: false,
    starred: false,
    status: 'open',
    tags: ['Clinical'],
    deadlines: [],
    brief: {
      summary: 'Automated lab notice: three results are ready in the clinic portal. No reply needed.',
      bullets: ['Automated notification', 'Results visible in portal'],
      suggestedAction: 'No action needed.',
    },
    messages: [
      msg(
        'm-k4-1',
        'in',
        P.lab,
        12 * 60,
        `Three results are ready for review in the Meridian Labs portal for patient ID MRD-2291.

This is an automated notification. Please do not reply to this message.
Meridian Labs`,
        [P.karan],
      ),
    ],
  },
  {
    id: 't-k5',
    accountId: 'acc-karan',
    clientId: 'c-karan',
    subject: 'Meeting request: Cardizen (Sun Pharma)',
    unread: true,
    starred: false,
    status: 'open',
    tags: ['Pharma'],
    deadlines: [],
    brief: {
      summary:
        'A pharma representative is requesting 15 minutes to introduce a new ARB combination. It could be routed to the assistant, but compliance policy makes the call ambiguous.',
      bullets: ['Industry meeting request', 'No prior relationship', 'Clinic compliance policy applies'],
      suggestedAction: 'Ananya should check the disclosure policy before accepting or declining.',
    },
    messages: [
      msg(
        'm-k5-1',
        'in',
        P.rep,
        14 * 60,
        `Dear Dr. Mehta,

I'd like 15 minutes to introduce Cardizen, our new ARB combination launched this quarter. Happy to work around clinic hours, and of course we can meet at your convenience.

Could Ananya suggest a slot in the next couple of weeks?

Regards,
Anil Kumar
Sun Pharma`,
        [P.karan],
      ),
    ],
  },
  {
    id: 't-k6',
    accountId: 'acc-karan',
    clientId: 'c-karan',
    subject: 'Statement for the cardiac wing opening',
    unread: true,
    starred: false,
    status: 'open',
    tags: ['Press', 'Important'],
    deadlines: [{ label: 'Quote approval', at: iso(2, 11), kind: 'deadline' }],
    brief: {
      summary:
        'The hospital wants a short quote from Dr. Mehta for the cardiac wing press release. The draft language touches on ICU expansion, so communications need his approval on the wording.',
      bullets: ['Quote requested for press release', 'Wording covers ICU expansion', 'Approval needed by ' + wd(2)],
      suggestedAction: 'Dr. Mehta should approve the exact wording personally.',
    },
    messages: [
      msg(
        'm-k6-1',
        'in',
        P.comms,
        9 * 60,
        `Dear Dr. Mehta,

The hospital would like a short quote from you for the press release on the new cardiac wing. The board asked for you specifically.

The draft language touches on our ICU expansion and staffing plans, so we'd need your approval on the exact wording before ${wd(2)}.

Warm regards,
Hospital Communications`,
        [P.karan],
      ),
    ],
  },
  {
    id: 't-k7',
    accountId: 'acc-karan',
    clientId: 'c-karan',
    subject: 'Visa invitation letter for the Dubai congress',
    unread: false,
    starred: false,
    status: 'open',
    tags: ['Travel', 'Admin'],
    deadlines: [{ label: 'Visa letter due', at: iso(3, 17), kind: 'deadline' }],
    brief: {
      summary:
        'The congress secretariat needs a letter on clinic letterhead confirming Dr. Mehta\u2019s position and travel dates for his UAE visa.',
      bullets: ['Letter on clinic letterhead', 'Position and travel dates required', 'Due ' + wd(3)],
      suggestedAction: 'Generate the letter and send it to the secretariat.',
    },
    messages: [
      msg(
        'm-k7-1',
        'in',
        P.dubai,
        20 * 60,
        `Dear Dr. Mehta,

To process your UAE visa we need a letter from the clinic confirming your position and your dates of travel. This can come from your assistant on clinic letterhead.

Could it be sent to us by ${wd(3)}?

Regards,
Congress Secretariat`,
        [P.karan],
      ),
    ],
  },
];

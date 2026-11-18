export const EVAL_CLIENTS = {
  aarav: { name: 'Aarav Shah', firstName: 'Aarav', email: 'aarav@northwindlabs.com' },
  zoya: { name: 'Zoya Rahman', firstName: 'Zoya', email: 'zoya@atelierrasa.com' },
  karan: { name: 'Dr. Karan Mehta', firstName: 'Karan', email: 'office@meridianheart.in' },
};

const AT = '2026-11-01T09:00:00.000Z';

export const EVAL_CASES = [
  {
    id: 'e01',
    client: 'aarav',
    subject: 'Series A: term sheet next steps',
    from: { name: 'Priya Nair', email: 'priya@meridian.vc', title: 'Partner' },
    body: `Hi Aarav,

Our investment committee approved moving ahead. The term sheet is attached: $18M pre-money, a 15% option pool, and a 30-day exclusivity window. We would like your signature by Friday.

Best,
Priya`,
    expected: 'client',
  },
  {
    id: 'e02',
    client: 'aarav',
    subject: 'Board sync: acquisition decision',
    from: { name: 'Vikram Rao', email: 'vikram@foundry.vc', title: 'Board member' },
    body: `Hi Aarav,

Before Thursday's board call, I need your view on the acquisition. The team is split on price, and the final call is yours.

Vikram`,
    expected: 'client',
  },
  {
    id: 'e03',
    client: 'aarav',
    subject: 'Interview request: 20 minutes on the record',
    from: { name: 'Amelia Grant', email: 'amelia.grant@thecut.com', title: 'Editor' },
    body: `Hi Aarav,

I'm writing a piece on founder burnout and would like to interview you on the record. We would need 20 minutes this month, and quotes will run in the December issue.

Amelia`,
    expected: 'client',
  },
  {
    id: 'e04',
    client: 'aarav',
    subject: 'Offer approval: Staff Engineer',
    from: { name: 'Nisha Kapoor', email: 'nisha@talentbridge.io', title: 'Recruiter' },
    body: `Hi Aarav,

The offer letter is ready. Compensation, equity and the start date are in schedule A. We need your signature before we can send it to the candidate.

Nisha`,
    expected: 'client',
  },
  {
    id: 'e05',
    client: 'zoya',
    subject: 'Mumbai studio: lease renewal terms',
    from: { name: 'Nikhil Joshi', email: 'nikhil@joshi-estates.in', title: 'Landlord' },
    body: `Hi Zoya,

The lease renewal is ready for review. The landlord is proposing a three-year lock-in with a 9% increase. We need your confirmation before we countersign.

Nikhil`,
    expected: 'client',
  },
  {
    id: 'e06',
    client: 'karan',
    subject: 'Second opinion: stent recommendation',
    from: { name: 'Rohit Deshpande', email: 'rohit.deshpande@gmail.com' },
    body: `Hi Karan,

A family friend, Mr. Deshpande, has been advised to get a stent. He asked whether you would look at the angiogram and give a second opinion. He is asking you personally.

Rohit`,
    expected: 'client',
  },
  {
    id: 'e07',
    client: 'aarav',
    subject: 'One for you, not the office',
    from: { name: 'Kabir Shah', email: 'kabir@northwindlabs.com' },
    body: `Hi Aarav,

I'm asking you personally, as a friend. Would you back Rahul's startup with a small cheque? No pressure, and please keep this off the group thread.

Kabir`,
    expected: 'client',
  },
  {
    id: 'e08',
    client: 'zoya',
    subject: 'A first-person piece for the December issue',
    from: { name: 'Sana Kapoor', email: 'sana@vogue.in', title: 'Features editor' },
    body: `Hi Zoya,

We loved your show notes. Would you write a first-person piece in your voice about building the label? 800 words, byline included.

Sana`,
    expected: 'client',
  },
  {
    id: 'e09',
    client: 'aarav',
    subject: 'The fund wants a second meeting',
    from: { name: 'Priya Nair', email: 'priya@meridian.vc', title: 'Partner' },
    body: `Hi Aarav,

The fund wants a second meeting before the holidays. Should we take it now, or wait until after the board update? Your call.

Priya`,
    expected: 'client',
  },
  {
    id: 'e10',
    client: 'aarav',
    subject: 'Pricing change: need your call before Friday',
    from: { name: 'Meera Iyer', email: 'meera@northwindlabs.com', title: 'Co-founder' },
    body: `Hi Aarav,

The team wants to raise the platform price by 12% next quarter. We need your call before we tell customers. Finance has modelled both options.

Meera`,
    expected: 'client',
  },
  {
    id: 'e11',
    client: 'zoya',
    subject: 'Exclusivity clause 7.3',
    from: { name: 'Ishaan Bhatt', email: 'legal@terra-beauty.com', title: 'Counsel' },
    body: `Hi Zoya,

Counsel has flagged clause 7.3 in the exclusivity agreement. Please confirm how you would like us to respond before we reply to their lawyer.

Ishaan`,
    expected: 'client',
  },
  {
    id: 'e12',
    client: 'aarav',
    subject: 'Grant agreement: your approval on the language',
    from: { name: 'Tara Menon', email: 'tara@northwindfoundation.org', title: 'Program director' },
    body: `Hi Aarav,

The foundation has drafted the grant agreement. We need your approval on the reporting language before the board signs. The change is in section 4.

Tara`,
    expected: 'client',
  },

  {
    id: 'e13',
    client: 'zoya',
    subject: 'Shoot prep call: move to 4:30?',
    from: { name: 'Neha', email: 'ops@studio-calendar.in', title: 'Studio ops' },
    body: `Hi Ananya,

The photographer has a conflict. Could we move the prep call to 4:30 on the same day, or 10:00 the next morning? Let me know which works and I'll resend the invite.

Neha`,
    expected: 'assistant',
  },
  {
    id: 'e14',
    client: 'zoya',
    subject: 'Pickup tomorrow: confirm address',
    from: { name: 'Suresh', email: 'pickups@bluedart.com' },
    body: `Hi Ananya,

The courier is booked for tomorrow between 11 and 1. Please confirm the address and a contact number for the pickup.

Suresh`,
    expected: 'assistant',
  },
  {
    id: 'e15',
    client: 'zoya',
    subject: 'Invoice #4471: 18 days overdue',
    from: { name: 'Farah', email: 'books@atelierrasa.com' },
    body: `Hi Ananya,

Invoice #4471 for the October shoot is 18 days past due. Could you confirm a payment date so we can close the books?

Farah`,
    expected: 'assistant',
  },
  {
    id: 'e16',
    client: 'karan',
    subject: 'Booking: arrival time for Friday',
    from: { name: 'Trident reservations', email: 'reservations@tridenthotels.com' },
    body: `Hi Ananya,

The room is confirmed for Friday. Could you share the arrival time and whether you need the airport pickup?

Reservations`,
    expected: 'assistant',
  },
  {
    id: 'e17',
    client: 'karan',
    subject: 'Two slots opened on Friday',
    from: { name: 'Sneha', email: 'desk@meridianheart.in' },
    body: `Hi Ananya,

Two slots opened on Friday at 9:30 and 11:00. Let me know which works for the clinic list and I'll block it.

Sneha`,
    expected: 'assistant',
  },
  {
    id: 'e18',
    client: 'karan',
    subject: 'Dubai visa: passport details',
    from: { name: 'Summit program team', email: 'program@cardiacsummit.in' },
    body: `Hi Ananya,

For the visa invitation letter, please send a scan of the passport and the travel dates by Wednesday.

Program team`,
    expected: 'assistant',
  },
  {
    id: 'e19',
    client: 'zoya',
    subject: 'Internet down 2 to 4pm: move the fitting',
    from: { name: 'Priya', email: 'ops@studio-calendar.in' },
    body: `Hi Ananya,

The studio internet will be down from 2 to 4pm on Thursday. Please move the fitting to the morning and tell the tailor.

Priya`,
    expected: 'assistant',
  },
  {
    id: 'e20',
    client: 'aarav',
    subject: 'Docket 8821 out for delivery',
    from: { name: 'Dock', email: 'docket@fastline.in' },
    body: `Hi Ananya,

Docket 8821 is out for delivery this afternoon. Please confirm someone is at reception to sign for it.

Dock`,
    expected: 'assistant',
  },
  {
    id: 'e21',
    client: 'aarav',
    subject: 'Staff backend role: would Aarav be open?',
    from: { name: 'Nisha Kapoor', email: 'nisha@talentbridge.io', title: 'Recruiter' },
    body: `Hi Ananya,

I'm reaching out about a staff backend role with a portfolio company. Would Aarav be open to a short intro call? Happy to work around his calendar.

Nisha`,
    expected: 'assistant',
  },
  {
    id: 'e22',
    client: 'karan',
    subject: 'Mumbai itinerary: hotel pickup',
    from: { name: 'Travel desk', email: 'travel@meridianheart.in' },
    body: `Hi Ananya,

Here is the updated itinerary for Mumbai. Could you confirm the hotel pickup time and send it to the driver?

Travel desk`,
    expected: 'assistant',
  },
  {
    id: 'e23',
    client: 'aarav',
    subject: 'Travel expenses: reimburse by Friday',
    from: { name: 'Accounts', email: 'accounts@northwindlabs.com' },
    body: `Hi Ananya,

Please reimburse the November travel expenses by Friday so we can close the month. The receipts are in the shared folder.

Accounts`,
    expected: 'assistant',
  },
  {
    id: 'e24',
    client: 'karan',
    subject: 'Speaker slides due Monday',
    from: { name: 'Alka Menon', email: 'program@cardiacsummit.in', title: 'Program chair' },
    body: `Hi Ananya,

Can you send the speaker slides by Monday? We need them for the AV check, and please confirm your session slot.

Alka`,
    expected: 'assistant',
  },

  {
    id: 'e25',
    client: 'aarav',
    subject: 'Your weekly digest',
    from: { name: 'Figma', email: 'no-reply@figma.com' },
    body: `Here is what changed in your workspace this week: 12 files updated, 3 comments resolved.

You are receiving this because you subscribed to the weekly digest. Unsubscribe | View in browser`,
    expected: 'none',
  },
  {
    id: 'e26',
    client: 'aarav',
    subject: 'Payout summary: November 1 to 15',
    from: { name: 'Stripe', email: 'notifications@stripe.com' },
    body: `Your payout summary is ready. $12,480.20 will arrive in your bank account on Nov 18. No action is needed.`,
    expected: 'none',
  },
  {
    id: 'e27',
    client: 'aarav',
    subject: 'Your AWS invoice for November is available',
    from: { name: 'AWS Billing', email: 'billing@aws.amazon.com' },
    body: `Your AWS invoice for November is now available in the billing console. This is an automated notification.`,
    expected: 'none',
  },
  {
    id: 'e28',
    client: 'aarav',
    subject: 'Invitation: Board sync',
    from: { name: 'Google Calendar', email: 'calendar-notification@google.com' },
    body: `This is an automated message. Do not reply. The meeting details are in your calendar.`,
    expected: 'none',
  },
  {
    id: 'e29',
    client: 'aarav',
    subject: 'Security alert: new sign-in',
    from: { name: 'GitHub', email: 'no-reply@github.com' },
    body: `A new sign-in to your account was detected from Mumbai. If this was you, no action is needed.`,
    expected: 'none',
  },
  {
    id: 'e30',
    client: 'zoya',
    subject: 'The December issue: press digest',
    from: { name: 'Vogue India', email: 'newsletter@vogue.in' },
    body: `This week in fashion: the quiet luxury report and five collections to watch.

View in browser · Unsubscribe`,
    expected: 'none',
  },
  {
    id: 'e31',
    client: 'aarav',
    subject: 'Your trip receipt',
    from: { name: 'Uber', email: 'receipts@uber.com' },
    body: `Thanks for riding. Your receipt for the trip on Nov 14 is attached. Total: $18.40.`,
    expected: 'none',
  },
  {
    id: 'e32',
    client: 'aarav',
    subject: 'What changed in your workspace',
    from: { name: 'Notion', email: 'updates@notion.so' },
    body: `12 pages were updated and 3 comments were resolved this week. You are receiving this because you follow the workspace.`,
    expected: 'none',
  },
  {
    id: 'e33',
    client: 'zoya',
    subject: 'New post: the quiet collection',
    from: { name: 'Substack', email: 'mailer@substack.com' },
    body: `A new post is live on the publication you follow. Read it in the app or view in browser.`,
    expected: 'none',
  },
  {
    id: 'e34',
    client: 'karan',
    subject: 'Cloud recording is ready',
    from: { name: 'Zoom', email: 'no-reply@zoom.us' },
    body: `The cloud recording for your meeting is ready. This is an automated notification.`,
    expected: 'none',
  },
  {
    id: 'e35',
    client: 'aarav',
    subject: 'Daily digest: five stories for you',
    from: { name: 'Medium', email: 'digest@medium.com' },
    body: `Five stories picked for you today. Unsubscribe from the daily digest at any time.`,
    expected: 'none',
  },
  {
    id: 'e36',
    client: 'zoya',
    subject: 'How did we do?',
    from: { name: 'Typeform', email: 'survey@typeform.com' },
    body: `This is a notification about your recent order. Do not reply to this message. Manage preferences in your account.`,
    expected: 'none',
  },

  {
    id: 'e37',
    client: 'aarav',
    subject: 'Intro: Daniel Okafor → Aarav',
    from: { name: 'Aditi Sharma', email: 'aditi@commonroom.vc', title: 'Partner' },
    body: `Hi both,

A founder in our portfolio is exploring a partnership that might overlap with Northwind. Happy to make an intro if it's useful, or we can leave it for now.

No rush, just let me know.

Aditi`,
    expected: 'review',
  },
  {
    id: 'e38',
    client: 'aarav',
    subject: 'Quick one: deck timing',
    from: { name: 'Renee', email: 'renee@northwindlabs.com' },
    body: `Hi team,

Not sure who owns this. Renee asked when the deck will be ready. No rush.

Thanks`,
    expected: 'review',
  },
  {
    id: 'e39',
    client: 'zoya',
    subject: 'Lunch next week?',
    from: { name: 'Camille Moreau', email: 'camille@maisonlumen.fr' },
    body: `Hi Zoya,

I'm in Mumbai next week. Lunch?

Camille`,
    expected: 'review',
  },
  {
    id: 'e40',
    client: 'aarav',
    subject: 'Following up on our chat',
    from: { name: 'Kabir Shah', email: 'kabir@northwindlabs.com' },
    body: `Hi Aarav,

Following up on our chat last week. Nothing urgent.

Kabir`,
    expected: 'review',
  },
  {
    id: 'e41',
    client: 'aarav',
    subject: 'Saw this and thought of you',
    from: { name: 'Meera Iyer', email: 'meera@northwindlabs.com' },
    body: `Hi Aarav,

This piece on pricing teams is good. No action needed.

Meera`,
    expected: 'review',
  },
  {
    id: 'e42',
    client: 'karan',
    subject: 'Can we talk sometime?',
    from: { name: 'Sanjay Kulkarni', email: 'sanjay@example.com' },
    body: `Hi,

Can we talk sometime this week?

Sanjay`,
    expected: 'review',
  },
  {
    id: 'e43',
    client: 'zoya',
    subject: 'Re: your note',
    from: { name: 'Ritu Shah', email: 'accounts@harpersbazaar.in' },
    body: `Hi Zoya,

Thanks, will revert.

Ritu`,
    expected: 'review',
  },
  {
    id: 'e44',
    client: 'aarav',
    subject: 'Hi Ananya and Aarav',
    from: { name: 'Meera Iyer', email: 'meera@northwindlabs.com' },
    body: `Hi Ananya and Aarav,

The offsite dates are still moving. I'll share once they are fixed.

Meera`,
    expected: 'review',
  },
  {
    id: 'e45',
    client: 'aarav',
    subject: 'Please advise',
    from: { name: 'Deepa', email: 'deepa@example.com' },
    body: `Hello,

Please advise on the below when you get a chance.

Deepa`,
    expected: 'review',
  },
  {
    id: 'e46',
    client: 'zoya',
    subject: 'Either way works',
    from: { name: 'Camille Moreau', email: 'camille@maisonlumen.fr' },
    body: `Hi Zoya,

Happy either way on the venue. Let me know when you decide.

Camille`,
    expected: 'review',
  },
  {
    id: 'e47',
    client: 'aarav',
    subject: 'Quick one',
    from: { name: 'Kabir Shah', email: 'kabir@northwindlabs.com' },
    body: `Hi Aarav,

Can we push the review to next month? No urgency.

Kabir`,
    expected: 'review',
  },
  {
    id: 'e48',
    client: 'karan',
    subject: 'Fwd: device trial notes',
    from: { name: 'Anil', email: 'anil@example.com' },
    body: `Hi Karan,

Forwarding these notes. Thoughts?

Anil`,
    expected: 'review',
  },

  {
    id: 'e49',
    client: 'aarav',
    subject: 'Conference sponsorship',
    from: { name: 'Priya Nair', email: 'priya@meridian.vc', title: 'Partner' },
    body: `Hi Aarav,

The team wants to know if we should sponsor the founders conference this year. The budget is approved either way, but the final decision is yours.

Priya`,
    expected: 'client',
  },
  {
    id: 'e50',
    client: 'zoya',
    subject: 'Partner lunch on Friday',
    from: { name: 'Neha', email: 'ops@studio-calendar.in', title: 'Studio ops' },
    body: `Hi Ananya,

Could you book the usual room for the partner lunch on Friday? Same setup as last time.

Neha`,
    expected: 'assistant',
  },
  {
    id: 'e51',
    client: 'zoya',
    subject: 'Your subscription renews on Dec 1',
    from: { name: 'Ritu Shah', email: 'accounts@harpersbazaar.in' },
    body: `Hi Ananya,

Your Harper's Bazaar subscription renews on Dec 1. Manage preferences in your account.

Ritu`,
    expected: 'none',
  },
].map((c) => ({ ...c, at: AT }));

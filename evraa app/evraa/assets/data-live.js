// EVRAA 2027 content managed on the admin page (evraa/admin). This file is rewritten on every save there:
// do not edit it by hand, your changes would be lost. The other lists (sports and venues, billeting schools, logos) are in data.js.
// Last saved: November 15, 2026 1:34 AM (Philippine time)

// Announcements page, newest first (push: true = also highlighted at the top of the Home page)
const ANNOUNCEMENTS = [
  {"tag":"Test Announcement","title":"Testing of the Site","body":"","accent":"var(--flame)"},
  {"tag":"EVRAA 2027 Application","title":"Download the Official EVRAA 2027 Application now!","body":"","accent":"var(--green)","push":true},
  {"tag":"New","date":"October 13, 2026","title":"New on the site: Directory, Medal Tally, Games and Special Events","body":"Schedules, playing venues, hotlines and more will be posted in these sections as committees confirm them.","accent":"var(--flame)"},
  {"tag":"Pinned","title":"EVRAA 2027 runs March 31 – April 5, 2027","body":"Calbayog City and Catbalogan City are hosting this year's Eastern Visayas Regional Athletic Association meet.","accent":"var(--gold)"},
  {"tag":"Billeting","title":"14 billeting schools in Calbayog City","body":"Delegations will stay in 14 schools across Calbayog City. See the list and map on the Billeting Areas page.","link":["See the billeting schools","evraa/billeting.html"],"accent":"var(--teal)"},
];

// Game schedule per sport: [date, time, what's on, team, versus team] (the teams are empty for events without opposing teams)
const SCHEDULE = {
};

// Directory → Directions / Locations: name, description, Google Maps search, accent colour
const PLACES = [
  ["Calbayog City","Host city and home of the 14 billeting schools.","Calbayog City, Samar","var(--teal)"],
  ["Catbalogan City","Co-host city, the capital of Samar province.","Catbalogan City, Samar","var(--sky)"],
  ["Calbayog Airport","The airport serving Calbayog City.","Calbayog Airport, Samar","var(--gold)"],
];

// Directory → Hotlines: label, number (empty = to be announced), accent colour
const HOTLINES = [
  ["National Emergency Hotline","911","var(--flame)"],
  ["EVRAA 2027 Secretariat","","var(--green)"],
  ["Medical Services","","var(--teal)"],
  ["Security & Safety (PNP)","","var(--sky)"],
  ["CDRRMO","","var(--gold)"],
  ["Transportation & Traffic","","var(--green)"],
];

// Directory → Contact Persons: name, position, what to ask them about, mobile number, email
const CONTACTS = [
];

// Medal Tally: delegation, gold, silver, bronze
const TALLY = [
  ["Baybay City",0,0,0],
  ["Biliran",0,0,0],
  ["Borongan City",0,0,0],
  ["Calbayog City",0,0,0],
  ["Catbalogan City",0,0,0],
  ["Eastern Samar",0,0,0],
  ["Leyte",0,0,0],
  ["Maasin City",0,0,0],
  ["Northern Samar",0,0,0],
  ["Ormoc City",0,0,0],
  ["Samar",0,0,0],
  ["Southern Leyte",0,0,0],
  ["Tacloban City",0,0,0],
];

// Special Events: title, date (YYYY-MM-DD or empty), description
const EVENTS = [
  ["100 Days Countdown","2026-12-21","Marks 100 days to go before the opening of EVRAA 2027."],
  ["Opening Ceremony & Parade","2027-03-31","The parade of delegations and the official opening of the games."],
  ["Solidarity Meeting / Conference","","Delegation heads and officials meet before the competitions begin."],
  ["Welcome Night","","An evening welcoming the delegations to the host cities."],
  ["Cultural Shows","","Performances celebrating the culture of Eastern Visayas, including Calbayog's Hadang Festival and Catbalogan's Manaragat Festival."],
  ["Tourism Expo & Souvenirs","","Local products, tourism booths and EVRAA 2027 souvenirs."],
  ["EVRAA Street Party","","A street celebration for delegates, guests and the host communities."],
];

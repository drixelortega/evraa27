// EVRAA 2027 site content that rarely changes: sports and their venues, billeting schools, acknowledgement logos. Edit the lists below.
// Announcements, the Directory lists, the Medal Tally, the Games Schedule and Special Events are edited on the admin page
// (evraa/admin), which saves them to data-live.js; every page loads that file right after this one.

// Games Schedule and Playing Venues: sport, its venues, and an optional note (e.g. the level the venues are for).
// Each venue is [name, latitude, longitude, approximate]; leave the coordinates out until it is located.
// true marks an approximate pin (only the barangay or campus is mapped), shown gray with a dashed ring.
// Example: ['Athletics', [['NWSSU Track & Field', 12.0710, 124.5962]]]
// The map shows each venue with its sport's icon; sports at the same coordinates share one pin.
const SPORTS = [
  ['Archery', [['Bagacay Integrated School – back area', 12.0597092, 124.6147613]]],
  ['Arnis', [['Calbayog City Convention Center', 12.0685947, 124.5886112]]],
  ['Athletics', [['NWSSU Track & Field', 12.0710268, 124.5961802, true]]],
  ['Badminton', [['NWSSU RSU Hall', 12.0710268, 124.5961802, true]]],
  ['Baseball', [['Aguit-itan Open Field', 12.0660820, 124.5945704, true]]],
  ['Softball', [['Aguit-itan Open Field', 12.0660820, 124.5945704, true]]],
  ['Basketball', [['Calbayog Sports Center', 12.0684740, 124.5852639], ['Joggers', 12.0679803, 124.5977534], ['Oquendo', 12.1294361, 124.5370093]], 'Secondary'],
  ['Boxing', [['Calbayog Land Transport Terminal', 12.0623549, 124.6116474]]],
  ['Football', [['NWSSU Oval', 12.0710268, 124.5961802, true], ['Trinidad Elementary School', 12.0739724, 124.5410872]]],
  ['Gymnastics', [['Trinidad Covered Court', 12.0749836, 124.5417144]]],
  ['Special Games', [['Gaisano Grand Calbayog', 12.0693637, 124.5924760], ['St. Vincent de Paul College Seminary', 12.0792314, 124.5917404]]],
  ['Taekwondo', [['Sta. Margarita Covered Court', 12.0379945, 124.6577853, true]]],
  ['Lawn Tennis', [['Calbayog Sports Center', 12.0684740, 124.5852639], ['NWSSU Dormitory', 12.0738714, 124.6027996]]],
  ['Volleyball', [['Christ the King College Gymnatorium', 12.0689975, 124.5974713]], 'Elementary'],
  ['Wrestling', [['Carmen Covered Court', 12.0704765, 124.5896068, true]]],
  ['Wushu', [['Bagacay Covered Court', 12.0582700, 124.6145725, true]]],
  ['Weightlifting', [['Nijaga Park', 12.0681994, 124.5929658]]],
];

// Billeting Areas page map. Coordinates from OpenStreetMap; true marks an approximate pin (shown gray).
// Tinambacan ES isn't mapped there, so it uses the Tinambacan district center.
const SCHOOLS = [
  ['Carayman Elementary School', 12.0534782, 124.6290303],
  ['Bagacay Integrated School', 12.0597092, 124.6147613],
  ['Calbayog Pilot Central School', 12.0670014, 124.5955717],
  ['Calbayog City SPED Center', 12.0674256, 124.5957815],
  ['Calbayog City National High School', 12.0728162, 124.5963643],
  ['Calbayog East Central Elementary School', 12.0712209, 124.5951855],
  ['San Policarpo National High School', 12.0687842, 124.5674557],
  ['San Policarpo Elementary School', 12.0675902, 124.5703374],
  ['Trinidad Elementary School', 12.0739724, 124.5410872],
  ['Trinidad National High School', 12.0739079, 124.5399796],
  ['Oquendo National High School', 12.1311789, 124.5378891],
  ['Oquendo Central School', 12.1296042, 124.5378196],
  ['Tinambacan Elementary School', 12.0948536, 124.5021848, true],
  ['Rafael Lentejas Memorial School of Fisheries', 12.0940804, 124.5015128],
];

// Acknowledgement carousel on the Home page: name, logo file in evraa/images/Acknowledgement.
// To add one: put its logo in that folder and add a line here. They are shown in this order.
const ACKNOWLEDGEMENTS = [
  ['Department of Education', 'DepEd Logo.png'],
  ['DepEd Regional Office VIII', 'DepEd Region VIII Logo.png'],
  ['Schools Division of Calbayog City', 'SDOCal.png'],
  ['City Government of Calbayog', 'LGU Official Logo.png'],
  ['Bagong Pilipinas', 'Bagong Pilipinas.png'],
];

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
  ['Taekwondo', [['Sta. Margarita Covered Court', 12.0366268, 124.6658736]]],
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
// To add one: put its logo in that folder (a small copy, e.g. a .webp about 360 px wide, loads fastest) and add a line here. They are shown in this order.
// Blank "Your logo here" tiles shown between the logos, for sponsors still to come (0 to show none)
const SPONSOR_SLOTS = 5;
const ACKNOWLEDGEMENTS = [
  ['Department of Education', 'deped-logo.webp'],
  ['DepEd Regional Office VIII', 'deped-region-viii-logo.webp'],
  ['Schools Division of Calbayog City', 'sdocal.webp'],
  ['City Government of Calbayog', 'lgu-official-logo.webp'],
  ['Bagong Pilipinas', 'bagong-pilipinas.webp'],
];

// Delegations: name (as in the Medal Tally), moniker, primary colour, accent colour, moniker logo.
// Colours from evraa/images/Delegation Colors.xlsx; monikers and logos from evraa/images/EVRAA_2026_Moniker_Logos_v3
// (small copies in evraa/images/monikers). When a visitor picks their delegation on the Home page, the app takes on its
// colours and shows its logo; "No team" keeps the EVRAA green.
const DELEGATIONS = [
  ['Baybay City', 'Palaski Dragons', '#1B7A3D', '#F4C430', 'baybay-city-palaski-dragons'],
  ['Biliran', 'Panamao Rangers', '#D95D1E', '#2B3A67', 'biliran-panamao-rangers'],
  ['Borongan City', 'Golden Sunrise Warriors', '#1F2421', '#D4AF37', 'borongan-city-golden-sunrise-warriors'],
  ['Calbayog City', 'Supersonics', '#5B2C83', '#F4B400', 'calbayog-city-supersonics'],
  ['Catbalogan City', 'Katbalaugan Warriors', '#801818', '#E5B80B', 'catbalogan-city-katbalaugan-warriors'],
  ['Eastern Samar', 'Valiant Hawks', '#1A5296', '#FFD100', 'eastern-samar-valiant-hawks'],
  ['Leyte', 'Roaring Lions', '#8B1E24', '#F5B700', 'leyte-roaring-lions'],
  ['Maasin City', 'Tigers', '#7A286B', '#F39200', 'maasin-city-tigers'],
  ['Northern Samar', 'Norte Eagles', '#C84B11', '#F7B538', 'northern-samar-norte-eagles'],
  ['Ormoc City', 'Siglaro Elites', '#123466', '#E6AF2E', 'ormoc-city-siglaro-elites'],
  ['Samar', 'Kusog Tandaya', '#A61C1C', '#FF9F1C', 'samar-kusog-tandaya'],
  ['Southern Leyte', 'Whale Sharks', '#006494', '#7CC6FE', 'southern-leyte-whale-sharks'],
  ['Tacloban City', 'Phoenix', '#B81D24', '#F9C80E', 'tacloban-city-phoenix'],
];

// Directory → Hotels (from evraa/images/Hotels.rtf). Each hotel's facade photo is evraa/images/hotels/<photo>.webp
// (a copy of <photo>.jpg about 960 px wide); a hotel without one shows a placeholder. The Google Maps link searches its name and address.
// rates: sections of [room, details, price]; prices in pesos, as given by the hotel.
const HOTELS = [
  {
    name: "Antonio's Inn", photo: 'antonios-inn', area: 'Brgy. Capoocan',
    about: [
      "Antonio's Inn, a hospitality gem in Calbayog City, adheres meticulously to tourism standards, ensuring a seamless and enriching experience for its guests.",
      "The inn has become synonymous with comfort and quality service. Boasting 30 well-appointed rooms, each equipped with modern amenities like free Wi-Fi, air conditioning, and complimentary carwash services, Antonio's Inn caters to the diverse needs of travelers.",
      "As Antonio's Inn aligns with and exceeds tourism standards, it not only provides a haven for travelers but also contributes positively to the local tourism landscape.",
    ],
    rates: [
      ['Building 1', [
        ['Standard Double', 'Double size bed (2 pax)', '1,190'],
        ['Standard 2 Single Bed', '2 single beds (2 pax)', '1,190'],
        ['Standard Family', '1 double bed & extra single bed (3 pax)', '1,499'],
      ]],
      ['Building 2', [
        ['Deluxe King', 'King size bed (2 pax)', '1,690'],
        ['Deluxe Family', '1 matrimonial bed & extra single bed (3 pax)', '1,880'],
        ['Deluxe Trio', '3 single beds (3 pax)', '1,990'],
        ['Deluxe Quad', '1 matrimonial bed & 2 extra single beds (4 pax)', '2,590'],
        ['Deluxe Premier', '1 matrimonial bed & 3 extra single beds (5 pax)', '2,790'],
      ]],
    ],
    amenities: ['Free Wi-Fi', 'Air-conditioned rooms', 'Complimentary carwash', '30 rooms'],
    address: 'P1, Bernate Compound, Brgy. Capoocan, Calbayog City',
    phones: ['(055) 2094-203', '0927 807 7248'],
  },
  {
    name: 'La Vista Pensionne', photo: 'la-vista', area: 'Brgy. Capoocan',
    about: [
      'Discover the charm of Calbayog at La Vista Pensionne, ideally located at Brgy. Capoocan, just a 5–10 minute walk from Nijaga Park, Cardinal Julio Rosales Plaza and the Sts. Peter & Paul Cathedral.',
      'You can indulge in a culinary adventure with Chinese cuisine or snacks at the coffee shop / café. La Vista Pensionne offers room service during limited hours and a daily complimentary reception to foster a friendly atmosphere among guests.',
      "With 56 air-conditioned rooms featuring flat-screen televisions, Wi-Fi, complimentary toiletries, and housekeeping on request, the hotel seamlessly blends modern amenities with comfort. Don't miss out also on the refreshing swimming pool and the option to host events in the conference room.",
      'Experience the perfect blend of convenience and relaxation at La Vista Pensionne during your Calbayog getaway.',
    ],
    rates: [
      ['Family rooms (without / with breakfast)', [
        ['Super Deluxe Family Room', '2 matrimonial beds with mini kitchen', '2,900 / 4,050'],
        ['Deluxe Family Room', '2 matrimonial beds with mini kitchen', '2,600 / 3,520'],
        ['Standard Family Room', 'Matrimonial bed & 1 single bed', '1,800 / 2,490'],
      ]],
      ['Deluxe rooms (without / with breakfast)', [
        ['Quadruple Bed', '', '1,909 / 2,820'],
        ['Triple Bed', '', '1,700 / 2,390'],
        ['Matrimonial Bed', '', '1,500 / 1,960'],
        ['Matrimonial or Twin Bed (small)', '', '1,300 / 1,760'],
      ]],
      ['Standard & ordinary rooms (without / with breakfast)', [
        ['Standard Room', 'Matrimonial or twin bed', '1,100 / 1,560'],
        ['Ordinary Triple Bed', 'With A/C, common toilet', '1,100 / 1,700'],
        ['Ordinary Twin Bed', 'With A/C, common toilet', '900 / 1,360'],
        ['Ordinary Single Bed', 'With A/C, common toilet', '800 / 1,030'],
        ['Ordinary Single Bed', 'Without A/C, common toilet', '600 / 830'],
        ['Extra bed', 'Air-conditioned room', '450'],
      ]],
    ],
    amenities: ['All air-conditioned rooms', 'Cable flat-screen TV', 'Electric key card', 'Hot & cold shower', 'Wi-Fi', 'Wide parking space', 'Swimming pool', 'Standby generator', 'Coffee shop', 'Conference room'],
    address: 'Bernate Compound, P-1, Brgy. Capoocan, Calbayog City',
    phones: ['0917 636 8806'],
  },
  {
    name: 'La Choeben Suites', photo: 'la-choeben-suites', area: 'West Awang',
    about: [
      'La Choeben Suites Hotel is a haven of modern comfort and hospitality. Boasting 28 fully furnished rooms, the hotel provides a delightful stay with amenities like Smart TVs, fast Wi-Fi, and a renowned coffee shop featuring the best-selling tinapa dish.',
      'Committed to guest satisfaction, La Choeben Suites embraces technology through online bookings and key card access. With plans for expansion on the horizon, La Choeben Suites is a promising destination that combines contemporary conveniences with a warm and welcoming ambiance.',
    ],
    rates: [
      ['Promo rates (regular rate in brackets)', [
        ['Family Zen', '5 pax, with breakfast for 2 (regular 3,500)', '3,099'],
        ['Family Deluxe', '4 pax, with breakfast for 2 (regular 3,400)', '2,899'],
        ['Queen / Twin', '2 pax, with breakfast for 2 (regular 2,500)', '1,899'],
        ['Premium Single', '1 pax, with breakfast (regular 1,600)', '1,349'],
        ['Standard Single', '1 pax, with breakfast (regular 1,550)', '1,199'],
      ]],
    ],
    amenities: ['Air conditioning', 'Toiletries', 'Netflix Premium', 'Fast internet', 'Parking', 'Coffee shop', 'Key card access'],
    address: 'J. D. Avelino St., West Awang, Calbayog City',
    phones: ['0966 890 5235'],
  },
  {
    name: 'West Prime Hotel & Restaurant', photo: 'west-prime', area: 'Brgy. Capoocan',
    about: [
      'Experience luxury redefined at West Prime Hotel & Restaurant – where elegance meets comfort, setting the standard for a seamless blend of modern amenities, best service, and a warm ambiance. Your picturesque escape awaits.',
      'Indulge also in a culinary journey at the hotel, where every meal is a masterpiece and every sip is a celebration.',
    ],
    rates: [
      ['Rooms', [
        ['Deluxe Queen', '2 pax (1 queen-size bed)', '2,500'],
        ['Premium Deluxe', '2 pax (1 queen-size bed with balcony)', '2,650'],
        ['Premier King', '2 adults & 1 child (1 king-size bed), with or without balcony', '2,750'],
        ['Superior Double', '4 adults (2 double-size beds)', '2,950'],
        ['Superior King', '4 adults & 1 child (1 king-size & 1 double-size bed)', '3,350'],
      ]],
    ],
    amenities: ['Rooms with balcony', 'Non-smoking rooms', 'Hot & cold shower', 'Cable TV with Netflix', 'Free Wi-Fi', 'Bar / lounge', 'Couple rooms', 'Toiletries', 'Restaurant'],
    address: 'Maharlika Highway, Brgy. Capoocan, Calbayog City (in front of the Convention Center)',
    phones: ['0906 278 4921'],
  },
  {
    name: 'Marju Krisel Hotel and Resort', photo: 'marju-krisel', area: 'Brgy. San Policarpo',
    about: [
      'Marju Krisel provides top-notch accommodation in luxurious rooms at affordable rates. Their trained staff offers exceptional service to ensure a memorable stay. Additionally, the resort features event halls suitable for business meetings, conferences, and other gatherings. Guests can also savor delicious local cuisines crafted by their expert chefs.',
      "From its humble beginnings, Marju Krisel Hotel and Resort has evolved into a destination known for its luxurious accommodations and picturesque setting, offering travelers an authentic escape and embodying the Aquino family's dream of growth and harmony.",
    ],
    rates: [
      ['Rooms', [
        ['Family Room (1)', 'Good for 5 pax', '3,000'],
        ['Family Room (2)', 'Good for 6 pax', '3,500'],
        ['Family Room (3)', 'Good for 7 pax', '3,700'],
        ['Suite Room', 'Good for 2 pax', '2,699'],
        ['Superior Deluxe (garden)', 'Good for 2 pax', '1,799'],
        ['Deluxe (old building)', 'Good for 2 pax', '1,299'],
        ['Economy', 'Good for 2 pax', '500'],
      ]],
      ['Extra bed', [
        ['Adult', '', '500'],
        ['Child', '', '300'],
      ]],
    ],
    amenities: ['Cable TV', 'Hot & cold shower', 'Private balcony or garden', 'Complimentary resort access', 'Swimming pool', 'Event halls', 'Restaurant'],
    address: 'Maharlika Highway, Brgy. San Policarpo, Calbayog City, Samar',
    phones: ['0917 115 1722'],
  },
  {
    name: 'Inn City Calbayog', photo: 'inn-city', area: 'West Awang',
    about: [
      'Inn City Calbayog offers contemporary hospitality with 28 meticulously designed rooms, each providing a unique and luxurious experience. From the cozy ambiance of the Deluxe Twin Charm to the spacious elegance of the Deluxe Suite Room, Inn City caters to diverse preferences, ensuring a delightful stay for every guest.',
      'With amenities such as Smart TVs, fully air-conditioned rooms, hot and cold showers, free Wi-Fi, and complimentary breakfast, the hotel is dedicated to providing a seamless and indulgent retreat.',
      "Guests can indulge in not just comfortable accommodations but also a delightful culinary experience at the hotel's restaurant, which offers a delectable array of delicious food and refreshing beverages.",
    ],
    rates: [
      ['Rooms', [
        ['Deluxe Triple Charm', '', '3,300'],
        ['Deluxe Twin Charm', 'With city view', '2,500'],
        ['Deluxe Queen Charm', 'With city view · single / double occupancy', '2,000 / 2,500'],
        ['Deluxe Twin Charm Inner', '', '2,300'],
        ['Deluxe Queen Charm Inner', 'Single / double occupancy', '1,800 / 2,300'],
        ['Deluxe Suite Room', 'Daily (weekly 14,500 · monthly 49,500, electricity billed separately)', '3,800'],
      ]],
      ['Additional', [
        ['Extra bed', '', '1,000'],
        ['Extra person', '', '300'],
      ]],
    ],
    amenities: ['Complimentary breakfast', 'Smart TV (Netflix & YouTube)', 'Fully air-conditioned rooms', 'Hot & cold shower', 'Free Wi-Fi', 'Airport transfer', 'Restaurant'],
    address: 'Rosales Blvd. cor. Galit St., Brgy. West Awang, Calbayog City, Samar',
    phones: ['0915 744 6626'],
  },
  {
    name: 'Central Inn', photo: 'central-inn', area: 'Central (Poblacion)',
    about: [
      'Central Inn – comfort and convenience at your own pace.',
      'Central Inn offers a comfortable and convenient stay designed to fit your schedule. With flexible check-in times and a choice of 3-hour, 6-hour, 12-hour, or 24-hour room options, guests can enjoy a relaxing stay whether they need a quick rest or an extended visit.',
      'Their air-conditioned rooms are equipped with free Wi-Fi, television, and a private bathroom with hot and cold shower, providing the essentials for a pleasant and hassle-free experience.',
    ],
    rates: [
      ['Rooms', [
        ['24 hours', '', '1,499'],
        ['12 hours', '', '999'],
        ['6 hours', '', '699'],
        ['3 hours', '', '499'],
        ['Extra bed', '', '350'],
      ]],
    ],
    amenities: ['Air-conditioned rooms', 'Free Wi-Fi', 'Television', 'Private bathroom', 'Hot & cold shower', 'Flexible check-in'],
    address: 'Navarro Street, Central (Pob.), Calbayog City, Samar',
    phones: ['0917 134 8713'],
    facebook: 'https://www.facebook.com/CentralinnCalbayog/',
  },
  {
    name: 'Grand Mercy Hotel', photo: 'grand-mercy', area: 'Brgy. Rawis',
    about: [
      'Grand Mercy Hotel, formerly known as Seaside Inn, offers comfortable and elegant accommodations designed to provide guests with a relaxing and memorable stay.',
      'The hotel features 29 well-appointed rooms with modern amenities, including queen-size beds, smart TVs, refrigerators, and fast Wi-Fi. It also provides two fully equipped conference halls ideal for weddings, reunions, seminars, and other special occasions, accommodating up to 120 guests.',
      'With convenient parking, flexible check-in arrangements, and guest-friendly policies, Grand Mercy Hotel combines comfort, convenience, and quality hospitality for every visitor.',
    ],
    rates: [
      ['Rooms (per night)', [
        ['Economy Room', '', '1,500'],
        ['Queen Room', '', '2,000'],
        ['Queen Deluxe Room', '', '2,300'],
        ['Family Standard Room', '', '3,700'],
        ['Family Deluxe Room', '', '3,900'],
      ]],
      ['Condotels (per night)', [
        ['Family Suite', '5 pax', '6,200'],
        ['Executive Suite', '5 pax', '6,200'],
        ['Presidential Suite', '6 pax', '6,700'],
      ]],
      ['Function halls', [
        ['Function Hall (2nd floor)', '100–120 pax · air-conditioned, projector, lights & sound, tables & chairs, 6 hours consumable', '15,000'],
        ['Reception Hall (6th floor)', '50–80 pax · air-conditioned, projector, Bluetooth speaker & mic, tables & chairs, 6 hours consumable', '10,000'],
      ]],
    ],
    amenities: ['24-hour front desk', 'Daily housekeeping', 'Free Wi-Fi', 'Smart TVs', 'Refrigerators', 'Parking space', 'Function hall rental', 'Safe & secure'],
    address: 'Maharlika Highway, Purok 1, Brgy. Rawis, Calbayog City, Samar',
    phones: ['0917 159 7033'],
  },
];

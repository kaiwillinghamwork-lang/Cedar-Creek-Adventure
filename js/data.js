/* ============================================================ */
/* data.js — all the CONTENT for the site lives here.           */
/*   BUILDINGS: every building's words, features, stats, images */
/*   ORDER:     the order the building cards appear in           */
/*   ACTIVITIES: the guided-trip list + deep-dive content        */
/* To change what a building SAYS, you edit this file.          */
/* ============================================================ */

/* ============ BUILDING DATA WITH IMAGES ============ */
const BUILDINGS = {};

/* ---- Image helper ----
   alt is filled in by app.js with the real building name + view.
   loading="lazy" lets the browser skip downloading an image until it's
   about to scroll into view — faster first paint, no custom code. */
function img(url){return `<img src="${url}" alt="" loading="lazy" style="width:100%;height:auto;object-fit:cover;">`;}

/* ====== OWNER'S LODGE ====== */
BUILDINGS.owners={
  name:"Owner's Lodge", tagline:"The creek-side retreat",
  peak:"Step off the deck into a creek-cold plunge, then back into the sauna while the sky goes dark enough to see the Milky Way.",
  desc:"The creek is the first thing you hear in the morning and the last thing at night. Coffee on the deck with your feet up over the water, the smell of cedar and woodsmoke, and a sky so dark you can see the Milky Way. End the day in the wood-fired sauna, then the cold plunge straight off the deck, then back to a stone fireplace that's still throwing heat when you turn in. It's the most private, most finished place on the property — and the one you'll be telling people about for years.",
  features:["Wraparound deck over the creek","Wood-fired sauna","Creek-cold plunge","Stone fireplace & vaulted timber ceilings","Floor-to-ceiling creek windows","Full kitchen & great room","Master suite + guest room"],
  stats:[["Setting","Right on the creek"],["Feel","Private & finished"],["Best at","First light & last light"]],
  out:img('images/img-01.jpg'),
  in:img('images/img-02.jpg'),
};

/* ====== CENTRAL LODGE ====== */
BUILDINGS.central={
  name:"Central Lodge", tagline:"Where the camp comes together",
  peak:"Come in cold and wet off the mountain to a hot meal already on the table and the whole camp swapping stories from the day.",
  desc:"You smell dinner before you're through the door — woodsmoke off the hearth, coffee on, something good on the stove. Walk in cold off the mountain and the fire's already going; you don't lift a finger. Long tables fill up with the whole camp trading the day's stories, and in the morning breakfast is on before you're fully awake. Need a tag, a box of shells, or last-minute gear? The pro-shop counter's right here. This is the room people remember the laughter in.",
  features:["Big shared kitchen — meals handled for you","Long-table dining hall for the whole camp","Central stone hearth","Pro-shop counter: tags, licenses, ammo & gear","Morning coffee & provisions bar","Big-window forest views","Covered entry porch"],
  stats:[["Feel","The gathering place"],["Meals","Cooked for you"],["Holds","The whole camp"]],
  out:img('images/img-03.jpg'),
  in:img('images/img-04.jpg'),
};

/* ====== THE CABINS ====== */
BUILDINGS.cabins={
  name:"The Cabins", tagline:"Your own spot in the timber",
  peak:"Wake up to the smell of pine, walk to the lodge, and someone else already has the coffee and breakfast going.",
  desc:"You wake up to the smell of pine and the creek running somewhere past the trees — no alarm, no traffic, just the wind in the timber. It's your own warm cabin, private and quiet and just yours. No cooking, no cleanup, no chores: step onto the porch into the cool morning and walk over to the lodge where breakfast is already going. The wood stove takes the chill off, the bed's the kind you sink into after a long day outside, and the only sound at night is the creek and the pines. All the comfort of a cabin, none of the work of a house.",
  features:["Your own private cabin in the trees","Wake up, walk to the lodge — meals are handled","Warm wood stove","A bed you sink into after a long day","Private covered porch","Forest & creek views","Warm cedar interior"],
  stats:[["Feel","Private & quiet"],["Mornings","Coffee's already on"],["Setting","Tucked in the timber"]],
  out:img('images/img-05.jpg'),
  in:img('images/img-05.jpg'),
};

/* ====== BATHHOUSE ====== */
BUILDINGS.bathhouse={
  name:"Bathhouse", tagline:"Hot water after a long day out",
  peak:"Step out of a hot rainfall shower onto a heated floor while it's still freezing outside.",
  desc:"Hot water hits and the cold of the whole day washes off — steam rising, a heated floor under your bare feet while it's still freezing outside. This is where you get warm again after a cold, muddy day on the mountain: rainfall showers, a fireside lounge to thaw out in, and skylights and high timber ceilings that keep it bright and open. It feels less like a campground washroom and more like a small spa in the woods. You walk out warm, clean, and ready to do it all again tomorrow.",
  features:["Hot rainfall showers","Heated floors","Fireside lounge to warm up in","Private vanity stations","Bright skylights & high timber ceilings","Towel & gear storage","Covered porch entry"],
  stats:[["Feel","Warm-up spot"],["Floors","Heated"],["For","Everyone in camp"]],
  out:img('images/img-06.jpg'),
  in:img('images/img-06.jpg'),
};

/* ====== GAME PROCESSING + COLD STORAGE ====== */
BUILDINGS.processing={
  name:"Game Processing + Cold Storage", tagline:"Your harvest, handled right here",
  peak:"Take your animal from field to freezer without a two-hour drive to Spokane — it's all done on-site.",
  desc:"You come off a hard, lucky day and the work is already handled — no scramble, no two-hour drive to find a processor before the meat turns. Hang it, cool it, and have it cut, wrapped, and ready to take home, all right here on the property. Clean, cold, and done right, with a walk-in cooler and proper hanging rails. It's the part of the hunt nobody else around here can offer, and it means your harvest is cared for the way it should be.",
  features:["Field-to-freezer, all on-site","Walk-in cooler & freezer","Custom cut, wrap & vacuum seal","Game hanging rails & hoist","Cold-storage lockers for your meat","Clean stainless work stations","Cedar exterior that fits the camp"],
  stats:[["Does","Field to freezer"],["Cold","Walk-in cooler"],["Why it matters","No drive to Spokane"]],
  out:img('images/img-07.jpg'),
  in:img('images/img-07.jpg'),
};

/* ====== OUTDOOR AREA ====== */
BUILDINGS.outdoor={
  name:"Creek-side Outdoor Area", tagline:"Where the evening lands",
  peak:"String lights come on over the fire pit as the creek glows gold and the whole camp settles in for the night.",
  desc:"The fire's crackling, the string lights flick on, and the creek runs gold in the last of the light — this is where everyone ends up when the day winds down. Burgers on the grill, a drink in hand, feet up on a flat creek-rock at the water's edge, the Adirondack chairs pulled in close. It's the slow, easy part of the trip: the long evening by the fire that's still going when the stars come out. It's where the stories get told and the trip gets remembered.",
  features:["Fire pit ringed with Adirondack chairs","String lights over the water","Grills for camp cookouts","Creek-edge rock seating","Steps down to the water","Covered prep counter","Shade trees & open lawn"],
  stats:[["Feel","Slow evenings"],["Setting","Right on the creek"],["Best at","Golden hour"]],
  out:img('images/img-08.jpg'),
  in:img('images/img-08.jpg'),
};

/* ====== RV + TENT ====== */
BUILDINGS.rv={
  name:"RV Pads & Tent Sites", tagline:"Roll in, set up, settle in",
  peak:"Pull your rig in, light the fire ring, and you're set up with the creek and the whole basecamp a short walk away.",
  desc:"You back in under the pines, kill the engine, and it goes quiet — just the creek and the wind and your own fire ring waiting to be lit. Bring your rig or pitch a tent; either way you've got a level spot and the run of the basecamp. Get set up and you're minutes from the creek, the fire pit, hot showers, and a hot meal at the lodge. It's the easy way to come stay: your own setup under the trees, with everything the camp offers right there when you want it.",
  features:["Level RV pads with power & water","Flat tent sites under the pines","Your own fire ring at each site","Hot showers at the bathhouse","Steps from the creek & fire pit","Picnic tables","Easy pull-through access"],
  stats:[["Bring","Your rig or tent"],["Each site","Own fire ring"],["Steps to","Creek & lodge"]],
  out:img('images/img-09.jpg'),
  in:img('images/img-09.jpg'),
};

/* ====== STORAGE LOT ====== */
BUILDINGS.storage={
  name:"Storage Lot", tagline:"Leave the toys, skip the haul",
  peak:"Leave your boat, ATV, or RV up here over the season instead of towing it back and forth every trip.",
  desc:"You drive up with an empty hitch and you're on the water in twenty minutes — your boat, ATV, or RV already here waiting, not sitting in a driveway six hours away. Covered, secured bays keep your gear close to where you actually use it, so coming back is as easy as showing up. Pull in, grab your machine, and go. It's the quiet convenience that makes the trip an easy yes, and it keeps the rest of the camp clean and open.",
  features:["Covered, weather-protected bays","ATV / UTV, boat & trailer storage","Secured, fenced perimeter","Leave it for the season","Right where you ride & launch","Easy gravel access","Tucked out of the guest areas"],
  stats:[["For","Boats · ATVs · RVs"],["Bays","Covered & secured"],["Saves you","The long haul"]],
  out:img('images/img-10.jpg'),
  in:img('images/img-10.jpg'),
};

/* ============ ORDER FOR CARDS ============ */
const ORDER=["owners","central","cabins","bathhouse","processing","outdoor","rv","storage"];

/* ============================================================ */
/* ============ ACTIVITIES SIDE MENU + DEEP DIVES ============= */
/* ============================================================ */
const ACTIVITIES = [
  {
    key:"whitetail", icon:"🦌", price:6500,
    name:"Selkirk Late-Season Whitetail Rut Hunt",
    short:"5-day guided trophy hunt",
    tagline:"Premium 1-on-1 · November rut",
    desc:"Our flagship hunt — five days, fully guided, one-on-one, chasing mature trophy-class white-tailed bucks on exclusive private timberland leases in Stevens and Pend Oreille counties. We time it for the November rut, when big bucks expand their range and cross open ground searching for does, putting them right in front of you. Because tags are over-the-counter \"Any Buck\" here, out-of-state hunters skip the multi-year permit-draw wait.",
    day:[
      "Pre-dawn breakfast at the Central Lodge, then out to your private stand",
      "Morning sit over rut corridors and creek bottoms with your personal guide",
      "Midday warm-up, lunch, and a gear/scouting reset back at camp",
      "Evening hunt glassing open edges as bucks move to feed",
      "Field dressing + on-site lymph-node extraction for CWD compliance",
      "Dinner, fireside debrief, and game plan for the next morning"
    ],
    included:[
      "Personal 1-on-1 professional guide","Comfortable lodge/cabin accommodations",
      "All meals catered on-site","Exclusive private timberland access",
      "Professional field preparation","CWD lymph-node extraction handled for you",
      "Help with MyWDFW electronic tagging"
    ],
    stats:[["Length","5 days"],["Style","1-on-1 guided"],["Season","November rut"],["Price","$6,500 / hunter"]],
    season:[[11,1],[11,30]]
  },
  {
    key:"turkey", icon:"🦃", price:2450,
    name:"NE Washington Merriam's Turkey Double-Header",
    short:"3-day spring gobbler hunt",
    tagline:"2-on-1 · Spring strut, Apr–May",
    desc:"A three-day, two-on-one guided spring gobbler hunt working the incredible Merriam's turkey densities along the forest-and-farmland edges of Stevens and Ferry counties. We run it during the peak strut from mid-April through May, calling birds into high-end decoy setups for some of the best wing-shooting in the region. Eastern Washington allows a two-bearded-bird spring limit, so there's real opportunity to fill tags.",
    day:[
      "Before-light setup near a known roost with your guide",
      "Expert calling to work gobblers into the decoy spread",
      "Run-and-gun to relocate birds as they move through the morning",
      "Midday break, lunch, and scouting the afternoon's setup",
      "Afternoon field hunting the forest-ag margins",
      "Field cleaning and help with WDFW electronic harvest reporting"
    ],
    included:[
      "Professional guides & expert calling","Shared cabin lodging","Catered meals",
      "High-end decoy setups","Private land access","Field cleaning",
      "Electronic harvest-reporting assistance"
    ],
    stats:[["Length","3 days"],["Style","2-on-1 guided"],["Season","Apr 15 – May 31"],["Price","$2,450 / hunter"]],
    season:[[4,15],[5,31]]
  },
  {
    key:"charter", icon:"🎣", price:3200,
    name:"Walleye & Lake Roosevelt Sturgeon Charter",
    short:"4-day freshwater angling",
    tagline:"Guided boat charter · Jun–Jul",
    desc:"A four-day premium freshwater package that blends heavy-tackle white sturgeon harvest with fast-action walleye trolling. We split time between the deep bends of the Spokane Arm of Lake Roosevelt for walleye and the main reservoir for sturgeon, all aboard a fully-equipped 22-foot jet boat run by a USCG-licensed captain. The June 15 sturgeon opener makes this a true bucket-list trip.",
    day:[
      "Morning launch with your licensed captain on Lake Roosevelt",
      "Heavy-tackle sturgeon trolling the main reservoir (slot 50–63\")",
      "Onshore lunch lakeside",
      "Afternoon walleye trolling the deep Spokane Arm bends",
      "Optional fly-fishing for native redband trout on the Spokane River",
      "Complete fish processing — filleting, vacuum sealing, cold-chain prep"
    ],
    included:[
      "USCG-licensed captain & 22-ft jet boat","Premium tackle, rods & bait",
      "Onshore lunches","Lakeside lodging & dinners","Complete fish processing",
      "Catch Record Card compliance handled","All launch fees & permits"
    ],
    stats:[["Length","4 days"],["Boat","22-ft jet boat"],["Season","mid-Jun – mid-Jul"],["Price","$3,200 / angler"]],
    season:[[6,15],[7,15]]
  },
  {
    key:"biggame", icon:"🏔️", options:[{label:"Deer",price:4500},{label:"Elk",price:5500},{label:"Black Bear",price:3500}],
    name:"Archery, Muzzleloader & Rifle Big Game",
    short:"Deer, elk & bear seasons",
    tagline:"Multi-species · Sept–Dec",
    desc:"Beyond the flagship rut hunt, we guide the full big-game calendar across the 100-series GMUs: white-tailed and mule deer, Rocky Mountain elk, and black bear, in archery, muzzleloader, and modern-firearm seasons from September through December. September combo trips are a highlight — bugling elk in the mornings and glassing berry-covered hillsides for bears in the afternoon.",
    day:[
      "Match the weapon and unit to the open season and your tag",
      "Morning hunt — elk timber, deer corridors, or bear berry slopes",
      "Guide handles calling, glassing, and stalk strategy",
      "Midday reset and meal at camp",
      "Evening hunt over feed edges and travel routes",
      "Full field care, processing, and CWD/bear-tooth compliance"
    ],
    included:[
      "Guided archery, muzzleloader or rifle hunts","Multi-species September combos",
      "Private land & public timber access","Field processing","CWD compliance handling",
      "Bear-ID verification & tooth submission","Lodge accommodations & meals"
    ],
    stats:[["Species","Deer · Elk · Bear"],["Weapons","Bow · Muzzle · Rifle"],["Season","Sept – Dec"]],
    season:[[9,1],[12,15]]
  },
  {
    key:"upland", icon:"🐦", price:950,
    name:"Upland Bird Wing-Shooting",
    short:"Grouse, quail & pheasant",
    tagline:"Wing shooting · Sept–Dec",
    desc:"Active wing-shooting that pairs perfectly with a big-game hunt or stands on its own. Forest grouse open September 1 and run through the end of the year, with California quail and ring-necked pheasant opening in October along the grain fields and forest edges. A fun, fast-paced way to round out a fall trip in camp.",
    day:[
      "Head out to grouse cover, quail edges, or pheasant fields",
      "Walk-up wing-shooting with your guide",
      "Bird identification and safe-shooting coaching",
      "Lunch in the field or back at the lodge",
      "Afternoon covey work along forest-ag margins",
      "Bird cleaning back at the Game Processing building"
    ],
    included:[
      "Guided upland wing-shooting","Access to productive grouse/quail/pheasant ground",
      "Bird cleaning","Can be paired with big-game hunts","Lodge meals & lodging"
    ],
    stats:[["Birds","Grouse · Quail · Pheasant"],["Grouse limit","4 / day"],["Season","Sept – Dec"]],
    season:[[9,1],[12,31]]
  },
  {
    key:"flyfish", icon:"🪰", options:[{label:"1–2 hours",price:200},{label:"3–4 hours",price:400},{label:"All day",price:650}],
    name:"Spokane River Fly-Fishing",
    short:"Native redband trout",
    tagline:"Catch & release · selective gear",
    desc:"Premier fly-fishing for wild native redband rainbow trout on the Spokane River, managed under selective-gear, catch-and-release rules. We can run it as a standalone day or fold it into the sturgeon-and-walleye charter — morning sturgeon trolling, afternoon dry-fly on the river. Barbless hooks, knotless nets, fish kept wet: we fish it right so the redbands stay healthy.",
    day:[
      "Gear check — barbless hooks, no bait or scent, selective-gear rules",
      "Wade or float productive redband water on the Spokane",
      "Guided casting and reading the river",
      "Streamside lunch",
      "Afternoon dry-fly and swing sessions",
      "Proper catch-and-release handling throughout"
    ],
    included:[
      "Guided fly-fishing for native redband trout","Selective-gear rule compliance",
      "Can combine with the sturgeon/walleye charter","Catch-and-release coaching",
      "Streamside lunch on full-day trips"
    ],
    stats:[["Target","Redband trout"],["Rules","Catch & release"],["Pairs with","Sturgeon charter"]],
    season:[[5,24],[3,15]]
  },
  {
    key:"sasquatch", icon:"🦶", options:[{label:"Evening Track-and-Call",price:350},{label:"Half-Day Summit",price:550},{label:"Overnight Expedition",price:850}],
    name:"The Sasquatch Expedition",
    short:"Guided hike & backcountry camp-out",
    tagline:"Bigfoot hike & camp · summer–fall",
    desc:"This one is all about getting out into the backcountry on foot — a guided hike and camp-out built around the hunt for the Pacific Northwest's most famous resident. The Selkirk and Kettle ranges around Colville have logged Sasquatch reports for generations, so we lace up and hike deep into the timber where the sightings cluster, scanning the trail for tracks as we climb. You earn every mile, and the trail pays you back: it tops out at one of the most jaw-dropping mountain overlooks in northeast Washington — the Selkirks rolling out to the horizon, the Columbia and Pend Oreille valleys far below. On the longer trips we pack in and make camp on the ridgeline, cook over the fire, and run a dusk call-and-listen sequence under the stars before turning in. Your guide carries the cryptid field kit — track-casting plaster, optics, a call horn — but the real trip is the hike up and the night out in big country. Pick how far you want to go: the EASY EVENING TRACK-AND-CALL is a 1–3 mile loop with gentle climbing, about 2–3 hours, perfect after dinner and great for families. The HALF-DAY SUMMIT OVERLOOK is roughly 7 miles round trip with about 1,580 feet of climbing to a 6,200-foot vista over the Columbia and Pend Oreille valleys — figure 5–6 hours and our most popular pick. The OVERNIGHT BACKCOUNTRY EXPEDITION is an 8-plus mile push into the high Selkirk country with a full ridgeline camp, dusk and dawn calls, and the biggest views of all — one or two nights out for the committed cryptid hunter.",
    day:[
      "Trailhead briefing — pack check, track ID, and the Sasquatch field-report history of the area",
      "Hike up through the timber the sightings cluster around, reading the trail for prints as you climb",
      "Top out at the overlook ridgeline — drop packs and take in the Selkirk panorama",
      "On overnight trips, make camp on the ridge and cook dinner over the fire",
      "Dusk call-and-listen sequence under the stars; plaster-cast any track you turn up",
      "Break camp and hike out on a different line for a fresh stretch of trail (and a second shot at a sighting)"
    ],
    included:[
      "Professional hiking guide & cryptid field kit","Choice of easy, half-day, or overnight backpack route",
      "Backcountry camp gear & ridgeline campsite on overnight trips","Track-casting plaster (keep your cast)",
      "Trail snacks, summit lunch & fireside camp dinner on longer trips","Transport to the trailhead from camp",
      "An overlook view worth the climb whether Bigfoot shows or not"
    ],
    stats:[["Quarry","Sasquatch (allegedly)"],["Routes","Easy · Half-day · Overnight"],["Payoff","Selkirk summit overlook"],["Season","Jun – Oct"]],
    season:[[6,15],[10,15]]
  },
  {
    key:"boatrental", icon:"🚤", options:[{label:"Half-day",price:250},{label:"Full-day",price:400}],
    name:"Boat Rental",
    short:"Self-guided day on the water",
    tagline:"Rent & go · open water season",
    desc:"Take the lake or river on your own schedule. We rent a ready-to-go boat right from camp — fueled, life-jacketed, and cleaned — so you can spend the day fishing, cruising, or just soaking up the water without hauling your own rig across the state. Lake Roosevelt and the surrounding waters are right in reach. You handle the day; we handle the boat. Bring a valid boater education card if your state requires one, and we'll walk you through the launch before you head out.",
    day:[
      "Quick check-in and safety walkthrough at the dock",
      "Load up your gear — coolers, rods, and people",
      "Launch and run the day on your own schedule",
      "Fish, cruise, or beach it wherever looks good",
      "Return and refuel at the end of the day"
    ],
    included:[
      "Ready-to-go boat, fueled & cleaned","Life jackets for everyone aboard",
      "Pre-launch safety & operation walkthrough","Cooler & basic gear on request",
      "Launch right from camp — no long tow","Half-day or full-day rates"
    ],
    stats:[["Style","Self-guided rental"],["Terms","Half-day · Full-day"],["Bring","Boater card if required"],["Season","Open water"]],
    season:[[5,1],[10,15]]
  },
  {
    key:"atvrental", icon:"🏍️", options:[{label:"2-Hour Rental",price:120},{label:"All-Day Rental",price:325}],
    name:"4-Wheeler (ATV) Rental",
    short:"Self-guided trail riding",
    tagline:"Rent & ride · spring–fall",
    desc:"Hundreds of miles of forest road and backcountry trail surround the property, and the easiest way to see them is on four wheels. We rent well-maintained ATVs straight from camp — helmets included — so you can chase ridgelines, scout for game, or just rip around the timber for an afternoon. We'll point you to the best loops for your skill level and hand you a trail map before you roll out. Ride solo or take the whole group out together.",
    day:[
      "Gear up — helmet fitting and a quick controls rundown",
      "Trail briefing with a map and our favorite loops",
      "Head out onto the forest roads and backcountry trail",
      "Stop for the views, picnic, or scout a hunting spot",
      "Fuel up and return at the end of your block"
    ],
    included:[
      "Well-maintained ATV, fueled & ready","DOT helmets for every rider",
      "Trail map & route recommendations","Controls & safety walkthrough",
      "Single or multi-machine bookings","Half-day or full-day rates"
    ],
    stats:[["Style","Self-guided rental"],["Terms","Half-day · Full-day"],["Includes","Helmets & trail map"],["Season","Apr – Nov"]],
    season:[[4,1],[11,15]]
  },
  {
    key:"snowmobilerental", icon:"🛷", options:[{label:"2-Hour Rental",price:130},{label:"All-Day Rental",price:350}],
    name:"Snowmobile Rental",
    short:"Self-guided winter sledding",
    tagline:"Rent & ride · deep winter",
    desc:"When the snow flies, the same country turns into a snowmobiler's playground. We rent sleds right from camp through the winter season — helmets included — so you can run the groomed forest roads and open powder without trailering a machine up from home. We'll set you up with a trail map, point you to the best riding for the day's conditions, and get you out into the quiet, snow-loaded timber. Solo riders welcome, and we can outfit the whole group.",
    day:[
      "Gear up — helmet fitting and cold-weather check",
      "Conditions & trail briefing with a winter map",
      "Head out onto groomed roads and powder country",
      "Stop for the snowy overlooks and a warm-up break",
      "Return and refuel at the end of your ride"
    ],
    included:[
      "Maintained snowmobile, fueled & ready","Helmets for every rider",
      "Winter trail map & conditions briefing","Controls & safety walkthrough",
      "Single or multi-sled bookings","Half-day or full-day rates"
    ],
    stats:[["Style","Self-guided rental"],["Terms","Half-day · Full-day"],["Includes","Helmets & trail map"],["Season","Dec – Mar"]],
    season:[[12,1],[3,15]]
  },
  {
    key:"kayaking", icon:"🛶", options:[{label:"Half-day",price:75},{label:"Full-day",price:120}],
    name:"Kayak & Canoe Rental",
    short:"Self-guided paddling on the water",
    tagline:"Rent & paddle · spring–fall",
    desc:"Launch straight from camp and paddle into some of the best water in Northeast Washington. Lake Roosevelt's deep, protected bays and the slower sections of the Spokane River offer scenic paddling — from calm morning floats to half-day exploring. We rent well-maintained kayaks and canoes ready to go, and our guides can recommend the best paddling for the conditions and your skill level. Launch early, chase the light, and come back ready for a fire-pit dinner.",
    day:[
      "Gear check — life jackets, paddle fit, and a quick safety briefing",
      "Route recommendation based on conditions and your level",
      "Launch from camp right onto the water",
      "Paddle scenic bays, creek arms, or calm river sections",
      "Stop on sandy banks, explore coves, or fish from your boat",
      "Return to camp and secure the boats for the evening"
    ],
    included:[
      "Well-maintained kayak or canoe, fueled & ready","Life jackets for every paddler",
      "Paddle, spray skirt, and safety gear included","Pre-launch route & safety briefing",
      "Single or multi-boat bookings","Half-day or full-day rates",
      "Launch right from camp — no long haul","Great for mixed skill levels"
    ],
    stats:[["Style","Self-guided rental"],["Terms","Half-day · Full-day"],["Launch","Right from camp"],["Season","May – Oct"]],
    season:[[5,1],[10,15]],
    media:[
      {src:"images/img-11.jpg", alt:"Four paddlers in kayaks in front of a waterfall on the water"},
      {src:"images/img-12.jpg", alt:"Kayaker in a green kayak with arms raised in front of a waterfall"}
    ]
  }
];

/* ============================================================ */
/* ============ SUMMER CAMPS (weekly, June–July) ============== */
/*   The age group rotates every week (A = 13–15, B = 15–17).   */
/* ============================================================ */
const CAMPS = [
  {
    key:"boyscamp", icon:"🪖",
    name:"Boys' Adventure & Combat Camp",
    short:"Week-long overnight · ages 13–17",
    tagline:"Survival, jiu-jitsu & brotherhood · Jun–Jul",
    price:1200,   // per camper, per week (placeholder — set your real rate)
    desc:"A week-long overnight camp for boys, built around grit, skill, and brotherhood. It's led by Mykle — a combat veteran — who runs the survival skills and military-style challenges, while Kai, a jiu-jitsu purple belt with 5 years on the mats and 3 years of wrestling, coaches grappling and takedowns. It's a real workout camp and a genuinely fun one: you'll train hard, recover in the wood-fired sauna and cold plunge, and bond with a new crew of friends around the fire. Meals are provided all week, and campers get the run of the property. The age group rotates every week, so everyone trains with their own peers.",
    includes:[
      "Survival & military-style training with Mykle (combat veteran)",
      "Jiu-jitsu & wrestling with Kai (purple belt · 5 yrs BJJ · 3 yrs wrestling)",
      "Week-long workout camp — push hard, get stronger",
      "Make new friends and bond — the fun kind of hard",
      "All meals provided",
      "Recovery built in: wood-fired sauna & cold plunge",
      "Run of the property — creek, trails & fire-pit nights"
    ],
    ages:{ A:"Ages 13–15", B:"Ages 15–17" },
    weeks:[
      { start:"2026-06-01", end:"2026-06-06", label:"Jun 1 – 6",       age:"A" },
      { start:"2026-06-08", end:"2026-06-13", label:"Jun 8 – 13",      age:"B" },
      { start:"2026-06-15", end:"2026-06-20", label:"Jun 15 – 20",     age:"A" },
      { start:"2026-06-22", end:"2026-06-27", label:"Jun 22 – 27",     age:"B" },
      { start:"2026-06-29", end:"2026-07-04", label:"Jun 29 – Jul 4",  age:"A" },
      { start:"2026-07-06", end:"2026-07-11", label:"Jul 6 – 11",      age:"B" },
      { start:"2026-07-13", end:"2026-07-18", label:"Jul 13 – 18",     age:"A" },
      { start:"2026-07-20", end:"2026-07-25", label:"Jul 20 – 25",     age:"B" },
      { start:"2026-07-27", end:"2026-08-01", label:"Jul 27 – Aug 1",  age:"A" }
    ]
  }
];

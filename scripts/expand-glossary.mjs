#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

const glossary = JSON.parse(readFileSync('./public/data/glossary.json', 'utf8'));

const newEntries = [
  {
    term: "Superdreadnought",
    category: "naval",
    classification: { roleId: "brawler", sizeId: "capital" },
    definition: "An extreme-scale battleship exceeding 200,000 DT. Mounts multiple spinal weapons and armor exceeding standard limits.",
    ceRaw: "The largest combat vessel possible. Requires dedicated shipyards and decades of construction.",
    mnemeNotes: "Only the Houses and Guilds have built superdreadnoughts. Most were destroyed in the Collapse Wars.",
    alsoKnownAs: ["Superbattleship", "Doomsday Vessel"],
    tlRange: "14-15",
    typicalDt: "200000+"
  },
  {
    term: "Monitors",
    category: "naval",
    classification: { roleId: "brawler", sizeId: "capital" },
    definition: "Non-jump capital ships designed for static system defense. Immobile fortresses with spinal-mount weapons.",
    ceRaw: "Monitors are system-defense vessels too large for jump drives. They rely on tugs or jump carriers for interstellar movement.",
    mnemeNotes: "The Hegemony clans deploy monitors at warp points and gas giants. Houses use them as mobile star fortresses.",
    alsoKnownAs: ["System Monitor", "Battle Station"],
    tlRange: "12-15",
    typicalDt: "10000-500000"
  },
  {
    term: "Defense Fortresses",
    category: "naval",
    classification: { roleId: "brawler", sizeId: "capital" },
    definition: "Immobile or limited-mobility defensive installations. Orbital platforms or planetary surface fortifications.",
    ceRaw: "Defense fortresses are not ships — they are installations. They mount the heaviest weapons and thickest armor possible.",
    mnemeNotes: "Guild-built defense fortresses are automated. House fortresses are manned by elite troops. Hegemony fortresses are clan honor posts.",
    alsoKnownAs: ["Orbital Fortress", "Planetary Defense Platform"],
    tlRange: "10-15",
    typicalDt: "50000+"
  },
  {
    term: "Light Cruiser",
    category: "naval",
    classification: { roleId: "vanguard", sizeId: "lineShip" },
    definition: "A smaller cruiser (1,000–3,000 DT) optimized for high thrust-to-mass ratio. Sacrifices payload for speed.",
    ceRaw: "Light cruisers are fast, independent patrol vessels. They scout ahead of the fleet and respond to distress calls.",
    mnemeNotes: "Popular with the Federation patrol corps. House light cruisers often carry a noble officer as political officer.",
    alsoKnownAs: ["Scout Cruiser", "Light Patrol"],
    tlRange: "10-13",
    typicalDt: "1000-3000"
  },
  {
    term: "Heavy Cruiser",
    category: "naval",
    classification: { roleId: "vanguard", sizeId: "lineShip" },
    definition: "A larger cruiser (5,000–9,000 DT) with enhanced armor and firepower. Lower thrust efficiency than light cruisers.",
    ceRaw: "Heavy cruisers are the fleet's heavy hitters. They can engage enemy capital ships and survive punishment that would destroy lighter vessels.",
    mnemeNotes: "The Hegemony builds heavy cruisers as clan flagships. Each carries the war banner of its commissioning clan.",
    alsoKnownAs: ["Armored Cruiser", "Heavy Patrol"],
    tlRange: "11-14",
    typicalDt: "5000-9000"
  },
  {
    term: "Patrol Cruiser",
    category: "naval",
    classification: { roleId: "vanguard", sizeId: "lineShip" },
    definition: "A cruiser optimized for law enforcement and piracy suppression. Extended sensors and prisoner facilities.",
    ceRaw: "Patrol cruisers carry marines, detention cells, and advanced sensor suites for tracking smugglers and pirates.",
    mnemeNotes: "Federation Patrol Service operates thousands of these. Independent patrol cruisers are common in the Frontier.",
    alsoKnownAs: ["Police Cruiser", "Law Enforcement Vessel"],
    tlRange: "10-13",
    typicalDt: "2000-5000"
  },
  {
    term: "Mercenary Cruiser",
    category: "naval",
    classification: { roleId: "vanguard", sizeId: "lineShip" },
    definition: "A cruiser designed to transport and support mercenary companies. Vehicle bays, troop quarters, and modular mission equipment.",
    ceRaw: "Mercenary cruisers are mobile bases for hire. They carry troops, vehicles, and enough supplies for extended operations.",
    mnemeNotes: "The classic Broadsword-class. Many operate in the Frontier under letters of marque from minor Houses.",
    alsoKnownAs: ["Merc Cruiser", "Troop Cruiser"],
    tlRange: "10-13",
    typicalDt: "3000-6000"
  },
  {
    term: "Assault Carrier",
    category: "naval",
    classification: { roleId: "support", sizeId: "lineShip" },
    definition: "A carrier optimized for planetary assault operations. Drop ships, marine barracks, and heavy vehicle bays.",
    ceRaw: "Assault carriers carry drop ships and landing craft instead of fighters. They are the centerpiece of planetary invasion forces.",
    mnemeNotes: "Hegemony clans prize assault carriers above all other vessels. A clan without one cannot claim major power status.",
    alsoKnownAs: ["Landing Carrier", "Invasion Ship"],
    tlRange: "11-14",
    typicalDt: "5000-15000"
  },
  {
    term: "Troop Transport",
    category: "naval",
    classification: { roleId: "support", sizeId: "lineShip" },
    definition: "A vessel optimized for carrying armies. Barracks, drop equipment, and vehicle bays dominate the hull.",
    ceRaw: "Troop transports carry thousands of soldiers. They are prime targets — killing one can end a campaign.",
    mnemeNotes: "Often converted from bulk transports. The Houses use contracted transports; the Hegemony uses dedicated clan vessels.",
    alsoKnownAs: ["Assault Transport", "Troopship"],
    tlRange: "10-14",
    typicalDt: "3000-20000"
  },
  {
    term: "Strike Cruiser",
    category: "naval",
    classification: { roleId: "striker", sizeId: "lineShip" },
    definition: "A fast, heavily armed cruiser designed for commerce raiding and deep strikes. Speed + firepower, minimal payload.",
    ceRaw: "Strike cruisers are commerce raiders. They hit hard, take what they can, and run before the fleet arrives.",
    mnemeNotes: "Corsair kings and rogue Houses operate strike cruisers. The Federation considers them pirates regardless of papers.",
    alsoKnownAs: ["Raider Cruiser", "Commerce Raider"],
    tlRange: "11-14",
    typicalDt: "3000-8000"
  },
  {
    term: "Armored Cruiser",
    category: "naval",
    classification: { roleId: "brawler", sizeId: "lineShip" },
    definition: "A cruiser with armor exceeding standard limits. Sacrifices speed and payload for survivability.",
    ceRaw: "Armored cruisers trade agility for protection. They can absorb hits that would cripple standard cruisers.",
    mnemeNotes: "Hegemony armored cruisers are called Ironclads. They lead clan charges into enemy formations.",
    alsoKnownAs: ["Ironclad", "Heavy Armor Cruiser"],
    tlRange: "11-14",
    typicalDt: "4000-10000"
  },
  {
    term: "Jump Carrier",
    category: "naval",
    classification: { roleId: "support", sizeId: "lineShip" },
    definition: "A vessel designed to carry other ships through jump space. Uses external jump grids and grapple frames.",
    ceRaw: "Jump carriers transport non-jump vessels between systems. They are essential for moving monitors and defense boats.",
    mnemeNotes: "Rare and expensive. The Guilds maintain the largest jump carrier fleet, moving their own monitors between contracts.",
    alsoKnownAs: ["Jump Tender", "Tug Carrier"],
    tlRange: "12-15",
    typicalDt: "5000-20000"
  },
  {
    term: "Corvette",
    category: "naval",
    classification: { roleId: "vanguard", sizeId: "escort" },
    definition: "A generic term for small starships used for patrol and escort. Often overlaps with Patrol Corvette.",
    ceRaw: "Corvettes are the smallest starships capable of independent jump operations. They patrol, escort, and perform customs duties.",
    mnemeNotes: "In Mneme, Patrol Corvette is the specific classification. Corvette is the generic term.",
    alsoKnownAs: ["Patrol Corvette", "Escort Corvette"],
    tlRange: "9-12",
    typicalDt: "200-600"
  },
  {
    term: "Close Escort",
    category: "naval",
    classification: { roleId: "brawler", sizeId: "escort" },
    definition: "A fast, heavily armed escort vessel designed to screen capital ships from missile and fighter attack.",
    ceRaw: "Close escorts stay near the ships they protect. They have powerful point defense and enough speed to intercept threats.",
    mnemeNotes: "Federation close escorts are standardized. House close escorts are often customized for specific fleet doctrines.",
    alsoKnownAs: ["Fleet Screen", "Point Defense Escort"],
    tlRange: "10-13",
    typicalDt: "200-400"
  },
  {
    term: "Fleet Escort",
    category: "naval",
    classification: { roleId: "vanguard", sizeId: "escort" },
    definition: "A long-range escort designed for convoy protection and independent patrol. Larger and more self-sufficient than close escorts.",
    ceRaw: "Fleet escorts operate far from the main fleet. They have enough fuel and supplies for weeks of independent operations.",
    mnemeNotes: "The workhorse of Federation anti-piracy operations. Many retired fleet escorts find second lives as Frontier patrol vessels.",
    alsoKnownAs: ["Convoy Escort", "Long-Range Patrol"],
    tlRange: "10-13",
    typicalDt: "300-800"
  },
  {
    term: "Missile Boat",
    category: "naval",
    classification: { roleId: "striker", sizeId: "escort" },
    definition: "A dedicated missile platform. Minimal armor, maximum missile capacity. Designed to saturate enemy point defense.",
    ceRaw: "Missile boats are one-trick ponies — they launch missiles and run. A squadron can overwhelm a much larger vessel.",
    mnemeNotes: "Hegemony clans use missile boats as honor-duel weapons. Guild missile boats are automated drones.",
    alsoKnownAs: ["Missile Platform", "Saturation Vessel"],
    tlRange: "10-13",
    typicalDt: "200-600"
  },
  {
    term: "Destroyer Escort",
    category: "naval",
    classification: { roleId: "striker", sizeId: "escort" },
    definition: "A smaller destroyer (400–800 DT) optimized for escort duty. Faster than a frigate, lighter than a line destroyer.",
    ceRaw: "Destroyer escorts bridge the gap between escorts and line ships. They have the speed of a destroyer with the endurance of an escort.",
    mnemeNotes: "Federation designation. House navies rarely distinguish destroyer escorts from full destroyers.",
    alsoKnownAs: ["Light Destroyer", "Escort Destroyer"],
    tlRange: "10-13",
    typicalDt: "400-800"
  },
  {
    term: "Escort Frigate",
    category: "naval",
    classification: { roleId: "brawler", sizeId: "escort" },
    definition: "An escort-sized combatant (200–600 DT) with heavy armor and weapons for its size. Patrol and combat optimized.",
    ceRaw: "Escort frigates are heavy combatants in the escort size range. They sacrifice speed for armor and firepower.",
    mnemeNotes: "Mneme distinguishes Escort Frigates (Brawler/Escort) from Heavy Frigates (Brawler/Line Ship).",
    alsoKnownAs: ["Light Frigate", "Patrol Frigate"],
    tlRange: "10-13",
    typicalDt: "200-600"
  },
  {
    term: "Light Frigate",
    category: "naval",
    classification: { roleId: "vanguard", sizeId: "escort" },
    definition: "A balanced escort-sized vessel with moderate armor, speed, and payload. The multi-role workhorse of small navies.",
    ceRaw: "Light frigates are general-purpose escorts. They can patrol, escort, or perform light combat duties.",
    mnemeNotes: "Popular with independent system defense forces. Many Houses gift light frigates to allied minor worlds.",
    alsoKnownAs: ["Utility Frigate", "General Escort"],
    tlRange: "9-12",
    typicalDt: "200-500"
  },
  {
    term: "Express",
    category: "civilian",
    classification: { roleId: "sprinter", sizeId: "escort" },
    definition: "A civilian courier operating on scheduled express routes. Part of the X-Boat or interstellar mail network.",
    ceRaw: "Express vessels carry mail, data, and urgent passengers on fixed schedules. Speed is everything.",
    mnemeNotes: "The X-Boat network uses dedicated express vessels. Private express companies compete for lucrative corporate contracts.",
    alsoKnownAs: ["Mail Ship", "Express Courier"],
    tlRange: "10-13",
    typicalDt: "100-400"
  },
  {
    term: "Free Trader",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "The iconic 200 DT tramp merchant. Independent operator, speculative cargo, no fixed route.",
    ceRaw: "Free traders are the romantic image of space commerce — independent captains, speculative cargoes, and the freedom of the stars.",
    mnemeNotes: "The most common ship in the Frontier. Every Free Trader captain has a story, a debt, and a gun under the console.",
    alsoKnownAs: ["Tramp Merchant", "Independent Trader"],
    tlRange: "9-11",
    typicalDt: "200"
  },
  {
    term: "Far Trader",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "A 200 DT merchant with Jump-2 capability. Trades higher-value cargo over longer distances than the Free Trader.",
    ceRaw: "Far traders are Jump-2 merchants. They reach markets that Jump-1 vessels cannot, carrying higher-value cargoes.",
    mnemeNotes: "More profitable than Free Trading but riskier. A Far Trader stuck between systems with no fuel is a dead ship.",
    alsoKnownAs: ["Jump-2 Merchant", "Long-Haul Trader"],
    tlRange: "10-12",
    typicalDt: "200"
  },
  {
    term: "Subsidized Merchant",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "A merchant vessel (400–600 DT) operating under government subsidy. Carries priority cargo and passengers on fixed routes.",
    ceRaw: "Subsidized merchants receive government support in exchange for carrying mail, passengers, and strategic cargoes on less profitable routes.",
    mnemeNotes: "Federation and House subsidized merchants are common. The subsidy comes with strings — priority cargo, military transport clauses.",
    alsoKnownAs: ["Subsidized Trader", "Route Merchant"],
    tlRange: "10-12",
    typicalDt: "400-600"
  },
  {
    term: "Trader",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "Generic term for any cargo-carrying merchant vessel. Covers all sizes and configurations.",
    ceRaw: "Trader is the catch-all term for commercial cargo vessels.",
    mnemeNotes: "In the Frontier, Trader is a profession, not a ship type. Every vessel that carries cargo is a trader.",
    alsoKnownAs: ["Merchant", "Cargo Ship"],
    tlRange: "9-12",
    typicalDt: "200-1000"
  },
  {
    term: "Fleet Tender",
    category: "naval",
    classification: { roleId: "support", sizeId: "escort" },
    definition: "A mobile support vessel that maintains squadrons in deep space. Machine shops, spare parts, and engineering crews.",
    ceRaw: "Fleet tenders carry the infrastructure to keep a squadron operational far from base. They are the oilers and repair ships of space.",
    mnemeNotes: "Essential for extended Hegemony clan wars. House fleet tenders are often converted from old merchant hulls.",
    alsoKnownAs: ["Squadron Tender", "Mobile Base"],
    tlRange: "10-13",
    typicalDt: "300-900"
  },
  {
    term: "Collier",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "A specialized vessel for transporting munitions, missiles, and ordnance. Heavily armored and partitioned.",
    ceRaw: "Colliers carry the ammunition that keeps a fleet fighting. They are prime targets and heavily protected.",
    mnemeNotes: "Guild colliers are automated. House colliers are escorted by close escorts. Hegemony colliers are clan honor vessels.",
    alsoKnownAs: ["Ammunition Ship", "Ordnance Transport"],
    tlRange: "10-13",
    typicalDt: "300-1000"
  },
  {
    term: "Oiler",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "A military fuel tender. Carries refined hydrogen and jump fuel for fleet operations.",
    ceRaw: "Oilers refuel fleets at sea. In space, they carry the hydrogen that makes jump travel possible.",
    mnemeNotes: "Every fleet operation requires oilers. Without them, ships are stranded. House oilers are priority targets in clan wars.",
    alsoKnownAs: ["Fuel Tender", "Replenishment Ship"],
    tlRange: "10-13",
    typicalDt: "300-1000"
  },
  {
    term: "Safari Ship",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "An expedition vessel equipped for hunting, exploration, and wildlife observation on alien worlds.",
    ceRaw: "Safari ships carry hunters, explorers, and scientists to dangerous worlds. They are rugged and well-armed.",
    mnemeNotes: "Popular with House nobles seeking exotic trophies. Federation safari ships are strictly scientific.",
    alsoKnownAs: ["Expedition Vessel", "Hunting Ship"],
    tlRange: "10-13",
    typicalDt: "200-600"
  },
  {
    term: "Laboratory Ship",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "A dedicated scientific research platform. Extensive labs, sensor arrays, and zero-G facilities.",
    ceRaw: "Laboratory ships are floating universities. They conduct research that cannot be done on planetary surfaces.",
    mnemeNotes: "Guild laboratory ships are state-of-the-art. Independent lab ships are often underfunded and desperate for grants.",
    alsoKnownAs: ["Science Ship", "Research Platform"],
    tlRange: "10-14",
    typicalDt: "200-800"
  },
  {
    term: "Survey Vessel",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "A vessel equipped for planetary and system survey. Mapping, resource assessment, and habitability studies.",
    ceRaw: "Survey vessels map worlds. They determine whether a planet is worth colonizing, mining, or ignoring.",
    mnemeNotes: "Federation Survey Service operates the largest fleet. Independent surveyors sell data to the highest bidder.",
    alsoKnownAs: ["Scout Surveyor", "Mapping Ship"],
    tlRange: "10-13",
    typicalDt: "200-600"
  },
  {
    term: "Scout/Courier",
    category: "civilian",
    classification: { roleId: "sprinter", sizeId: "escort" },
    definition: "The standard exploration and message vessel. Fast, self-sufficient, and lightly armed.",
    ceRaw: "Scout/couriers explore the frontier and carry messages between distant worlds. They are the eyes and ears of civilization.",
    mnemeNotes: "The classic Type-S. Every Frontier pilot dreams of owning one. Federation scouts are the most advanced.",
    alsoKnownAs: ["Scout Ship", "Courier", "Type-S"],
    tlRange: "10-13",
    typicalDt: "100-200"
  },
  {
    term: "Seeker",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "A prospecting vessel equipped for resource location and claim staking. Minimal comforts, maximum sensors.",
    ceRaw: "Seekers find valuable resources — minerals, gases, exotic materials. They stake claims and sell the coordinates.",
    mnemeNotes: "The most common first ship for Frontier entrepreneurs. Most fail. A few strike it rich.",
    alsoKnownAs: ["Prospector", "Claim Jumper"],
    tlRange: "9-12",
    typicalDt: "100-400"
  },
  {
    term: "Prospector",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "A vessel designed for resource extraction surveying. Heavy sensors, sample labs, and claim documentation.",
    ceRaw: "Prospectors evaluate claims. They determine whether a find is worth the investment of a full mining operation.",
    mnemeNotes: "Often converted from old scouts. Guild prospectors have advanced analysis equipment. Independents use whatever they can afford.",
    alsoKnownAs: ["Resource Surveyor", "Claim Evaluator"],
    tlRange: "9-12",
    typicalDt: "100-400"
  },
  {
    term: "Asteroid Miner",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "A dedicated asteroid mining vessel. Drills, extractors, and onboard refining capacity.",
    ceRaw: "Asteroid miners extract valuable materials from rocks. They are the industrial backbone of frontier economies.",
    mnemeNotes: "Guild asteroid miners are efficient factories. Independent miners are desperate gamblers. Hegemony clans use slave labor.",
    alsoKnownAs: ["Rock Hound", "Belter"],
    tlRange: "9-12",
    typicalDt: "200-600"
  },
  {
    term: "Refinery Ship",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "A mobile refining platform that processes raw ore into usable materials. Reduces cargo volume by 80%.",
    ceRaw: "Refinery ships process ore in space. They turn low-value rock into high-value refined materials.",
    mnemeNotes: "Guild monopoly on advanced refining. Independent refinery ships use older, less efficient equipment.",
    alsoKnownAs: ["Processing Ship", "Refinery Platform"],
    tlRange: "10-13",
    typicalDt: "400-2000"
  },
  {
    term: "Factory Ship",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "A mobile manufacturing facility. Produces finished goods from raw materials at destination.",
    ceRaw: "Factory ships manufacture goods at the point of need. They eliminate the cost of shipping finished products.",
    mnemeNotes: "Rare. Most factory ships are Guild-operated. A few House factory ships exist for specialized luxury goods.",
    alsoKnownAs: ["Manufacturing Ship", "Mobile Factory"],
    tlRange: "11-14",
    typicalDt: "1000-5000"
  },
  {
    term: "Hydroponics Vessel",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "A dedicated food production ship. Grows crops in controlled environments for fleet or colony support.",
    ceRaw: "Hydroponics vessels produce food in space. They are essential for long-duration fleet operations and colony support.",
    mnemeNotes: "Guild hydroponics vessels are automated. House vessels employ agricultural specialists. Hegemony clans disdain them as dishonorable.",
    alsoKnownAs: ["Farm Ship", "Agro Ship"],
    tlRange: "10-13",
    typicalDt: "300-1000"
  },
  {
    term: "Q-Ship",
    category: "naval",
    classification: { roleId: "brawler", sizeId: "escort" },
    definition: "An armed merchant vessel disguised as a civilian ship. Concealed weapons revealed only in combat.",
    ceRaw: "Q-ships are warships disguised as merchants. They lure pirates into attacking, then reveal their true nature.",
    mnemeNotes: "Common in House space and the Frontier. Hegemony clans consider Q-ships honorable deception. Guilds consider them terrorism.",
    alsoKnownAs: ["Decoy Merchant", "Wolf in Sheep Clothing"],
    tlRange: "10-13",
    typicalDt: "200-800"
  },
  {
    term: "Armed Merchant Cruiser",
    category: "naval",
    classification: { roleId: "brawler", sizeId: "escort" },
    definition: "A heavily armed merchant vessel with visible weapons. Not disguised — openly combat-capable.",
    ceRaw: "Armed merchant cruisers are merchants that carry enough weapons to defend themselves and others.",
    mnemeNotes: "Federation subsidized merchants often carry House-supplied weapons. Independent armed merchants are common in pirate zones.",
    alsoKnownAs: ["Armed Merchant", "Defensive Trader"],
    tlRange: "10-13",
    typicalDt: "400-1000"
  },
  {
    term: "Hospital Ship",
    category: "naval",
    classification: { roleId: "support", sizeId: "escort" },
    definition: "A mobile medical facility. Protected by convention. Unarmed or minimally armed.",
    ceRaw: "Hospital ships treat casualties far from planetary medical facilities. They are protected by convention but still need escorts.",
    mnemeNotes: "Federation hospital ships are white-hulled and unarmed. House hospital ships carry weapons for defense. Hegemony clans honor hospital ships.",
    alsoKnownAs: ["Medical Ship", "Mercy Vessel"],
    tlRange: "10-14",
    typicalDt: "300-1000"
  },
  {
    term: "Prison Ship",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "An inmate transport vessel. Secure detention facilities, minimal life support, heavy security.",
    ceRaw: "Prison ships transport convicts between facilities. They are grim places with minimal comforts and maximum security.",
    mnemeNotes: "Guild prison ships are automated and inhumane. House prison ships vary by House morality. Federation prison ships have rehabilitation programs.",
    alsoKnownAs: ["Convict Transport", "Hulk"],
    tlRange: "9-12",
    typicalDt: "200-600"
  },
  {
    term: "Rescue Ship",
    category: "naval",
    classification: { roleId: "support", sizeId: "escort" },
    definition: "A dedicated search and rescue vessel. Medical bays, salvage equipment, and long-range sensors.",
    ceRaw: "Rescue ships find and recover survivors from space disasters. They are the emergency services of the void.",
    mnemeNotes: "Federation Rescue Service operates hundreds. Independent rescue ships are often former scouts. Hegemony clans rescue their own; others are left.",
    alsoKnownAs: ["SAR Vessel", "Recovery Ship"],
    tlRange: "10-13",
    typicalDt: "200-600"
  },
  {
    term: "Packet",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "escort" },
    definition: "A scheduled mail and passenger vessel operating on fixed routes. Reliable but inflexible.",
    ceRaw: "Packets operate on schedules. They carry mail, passengers, and light cargo between major ports.",
    mnemeNotes: "House packet services are reliable and expensive. Federation packets are subsidized. Frontier packets are irregular and dangerous.",
    alsoKnownAs: ["Mail Packet", "Route Liner"],
    tlRange: "9-12",
    typicalDt: "200-600"
  },
  {
    term: "Fighter",
    category: "craft",
    classification: { roleId: "striker", sizeId: "craft" },
    definition: "A generic combat small craft. Fast, armed, and fragile. The standard space superiority platform.",
    ceRaw: "Fighters are the most common combat craft. They are fast, maneuverable, and deadly in numbers.",
    mnemeNotes: "Every faction operates fighters. Hegemony clan fighters are personalized. Guild fighters are mass-produced drones.",
    alsoKnownAs: ["Space Fighter", "Combat Craft"],
    tlRange: "9-12",
    typicalDt: "10-40"
  },
  {
    term: "Light Fighter",
    category: "craft",
    classification: { roleId: "striker", sizeId: "craft" },
    definition: "A 10 DT single-seat fighter optimized for extreme agility. Minimal armor, maximum speed.",
    ceRaw: "Light fighters are the nimblest combat craft. They rely on speed and maneuverability to survive.",
    mnemeNotes: "The classic dogfighter. House light fighters are status symbols for noble pilots. Independent light fighters are cheap and disposable.",
    alsoKnownAs: ["Scout Fighter", "Interceptor"],
    tlRange: "9-12",
    typicalDt: "10"
  },
  {
    term: "Heavy Fighter",
    category: "craft",
    classification: { roleId: "brawler", sizeId: "craft" },
    definition: "A 20–40 DT fighter with enhanced armor and weapons. Trades agility for survivability.",
    ceRaw: "Heavy fighters carry more armor and weapons than light fighters. They can survive hits that would destroy lighter craft.",
    mnemeNotes: "Hegemony heavy fighters are clan champions. Guild heavy fighters are automated gun platforms. House heavy fighters are piloted by knights.",
    alsoKnownAs: ["Assault Fighter", "Heavy Interceptor"],
    tlRange: "10-13",
    typicalDt: "20-40"
  },
  {
    term: "Attack Craft",
    category: "craft",
    classification: { roleId: "striker", sizeId: "craft" },
    definition: "A small craft optimized for ground attack and anti-ship strikes. Heavy ordnance, minimal dogfighting capability.",
    ceRaw: "Attack craft are bombers and strike platforms. They carry heavy weapons for hitting ground targets and slow ships.",
    mnemeNotes: "Hegemony attack craft are suicide-honor vessels. Federation attack craft are precision strike platforms. House attack craft are mercenary tools.",
    alsoKnownAs: ["Strike Craft", "Bomber"],
    tlRange: "10-13",
    typicalDt: "20-60"
  },
  {
    term: "Bomber",
    category: "craft",
    classification: { roleId: "striker", sizeId: "craft" },
    definition: "A small craft designed to deliver heavy ordnance to large targets. Slow but devastating.",
    ceRaw: "Bombers carry missiles, torpedoes, and heavy bombs. They are vulnerable to fighters but deadly to ships.",
    mnemeNotes: "Rare in the Frontier. Most bombers are carrier-based. Independent bombers are usually converted cargo shuttles.",
    alsoKnownAs: ["Torpedo Bomber", "Missile Craft"],
    tlRange: "10-13",
    typicalDt: "30-80"
  },
  {
    term: "Modular Cutter",
    category: "craft",
    classification: { roleId: "vanguard", sizeId: "craft" },
    definition: "A cutter with interchangeable mission pods. Cargo, passenger, fuel, or weapons modules swap in hours.",
    ceRaw: "Modular cutters are the Swiss Army knives of small craft. One hull, infinite missions.",
    mnemeNotes: "The most versatile craft in the Frontier. A single modular cutter can be a cargo hauler in the morning and a gunboat by evening.",
    alsoKnownAs: ["Multi-Role Cutter", "Pod Cutter"],
    tlRange: "10-13",
    typicalDt: "40-90"
  },
  {
    term: "Patrol Craft",
    category: "craft",
    classification: { roleId: "vanguard", sizeId: "craft" },
    definition: "A short-range law enforcement craft. Sensors, communications, and minimal armament.",
    ceRaw: "Patrol craft enforce law in orbital space and planetary approaches. They are the space police.",
    mnemeNotes: "Federation patrol craft are standardized. House patrol craft are House-colored. Frontier patrol craft are whatever the local strongman says they are.",
    alsoKnownAs: ["Police Boat", "Customs Craft"],
    tlRange: "9-12",
    typicalDt: "20-60"
  },
  {
    term: "Racing Craft",
    category: "craft",
    classification: { roleId: "sprinter", sizeId: "craft" },
    definition: "A competitive speed craft built for racing. Stripped down, overpowered, and dangerous.",
    ceRaw: "Racing craft are the sports cars of space. They prioritize speed above everything else — including safety.",
    mnemeNotes: "House nobles bet fortunes on racing craft. Federation racing is regulated. Frontier racing is lethal.",
    alsoKnownAs: ["Racer", "Speed Boat"],
    tlRange: "10-14",
    typicalDt: "10-30"
  },
  {
    term: "Launch",
    category: "craft",
    classification: { roleId: "hauler", sizeId: "craft" },
    definition: "A generic small cargo craft. The simplest and cheapest form of small craft.",
    ceRaw: "Launches are basic small craft. They move cargo and people short distances.",
    mnemeNotes: "Every port has dozens. They are disposable, replaceable, and essential.",
    alsoKnownAs: ["Cargo Launch", "Work Boat"],
    tlRange: "9-11",
    typicalDt: "10-30"
  },
  {
    term: "Cargo Shuttle",
    category: "craft",
    classification: { roleId: "hauler", sizeId: "craft" },
    definition: "A dedicated freight small craft. No passenger accommodations, maximum cargo volume.",
    ceRaw: "Cargo shuttles are flying boxes. They exist to move freight from orbit to surface and back.",
    mnemeNotes: "The most common small craft in civilized space. Every station, port, and ship has cargo shuttles.",
    alsoKnownAs: ["Freight Shuttle", "Cargo Boat"],
    tlRange: "9-11",
    typicalDt: "20-60"
  },
  {
    term: "Shuttle",
    category: "craft",
    classification: { roleId: "hauler", sizeId: "craft" },
    definition: "A mixed-use small craft carrying both passengers and cargo. The standard utility craft.",
    ceRaw: "Shuttles are the workhorses of small craft. They carry people, cargo, and anything else that needs moving.",
    mnemeNotes: "Standard equipment on almost every starship. A ship without a shuttle is crippled in port.",
    alsoKnownAs: ["Utility Shuttle", "Passenger Shuttle"],
    tlRange: "9-12",
    typicalDt: "30-90"
  },
  {
    term: "Gig",
    category: "craft",
    classification: null,
    definition: "The captain's personal boat. A small craft reserved for the commanding officer and VIP guests.",
    ceRaw: "Gigs are the captain's private craft. They are small, fast, and often luxurious.",
    mnemeNotes: "House gigs are status symbols. A noble's gig is more expensive than some starships. Hegemony clan chiefs ride to battle in armored gigs.",
    alsoKnownAs: ["Captain's Boat", "VIP Launch"],
    tlRange: "10-13",
    typicalDt: "10-30"
  },
  {
    term: "Slow Boat",
    category: "craft",
    classification: { roleId: "hauler", sizeId: "craft" },
    definition: "An unpowered or minimally powered cargo craft. Towed or pushed by tugs.",
    ceRaw: "Slow boats are unpowered cargo containers with minimal thrusters. They are cheap but helpless.",
    mnemeNotes: "Used for bulk cargo in safe systems. In the Frontier, slow boats are pirate bait.",
    alsoKnownAs: ["Barge", "Cargo Container"],
    tlRange: "9-11",
    typicalDt: "20-100"
  },
  {
    term: "Slow Pinnace",
    category: "craft",
    classification: { roleId: "hauler", sizeId: "craft" },
    definition: "An unpowered personnel carrier. Towed between ships or from orbit to surface.",
    ceRaw: "Slow pinnaces are unpowered passenger capsules. They are the cheapest way to move people in space.",
    mnemeNotes: "Emergency evacuation craft. Also used for prisoner transfers where escape must be impossible.",
    alsoKnownAs: ["Passenger Capsule", "Evacuation Pod"],
    tlRange: "9-11",
    typicalDt: "10-40"
  },
  {
    term: "Boarding Craft",
    category: "craft",
    classification: { roleId: "support", sizeId: "craft" },
    definition: "A small craft equipped for breaching enemy ships. Cutting torches, breaching charges, and assault ramps.",
    ceRaw: "Boarding craft are the pirate's best friend. They cut through hulls and deliver troops directly into enemy vessels.",
    mnemeNotes: "Hegemony boarding craft are clan honor weapons. House boarding craft are used by marine regiments. Guild boarding craft are automated drones.",
    alsoKnownAs: ["Breacher", "Assault Boat"],
    tlRange: "10-13",
    typicalDt: "15-40"
  },
  {
    term: "Landing Craft",
    category: "craft",
    classification: { roleId: "support", sizeId: "craft" },
    definition: "A small craft designed for planetary assault. Armored, armed, and capable of delivering troops under fire.",
    ceRaw: "Landing craft deliver troops to planetary surfaces. They are armored against ground fire and armed for self-defense.",
    mnemeNotes: "Hegemony landing craft are sacrificial. Federation landing craft are heavily armored. House landing craft carry noble marine officers.",
    alsoKnownAs: ["Drop Boat", "Planetary Assault Craft"],
    tlRange: "10-13",
    typicalDt: "20-60"
  },
  {
    term: "Life Boat",
    category: "craft",
    classification: { roleId: "support", sizeId: "craft" },
    definition: "An emergency escape craft designed to evacuate crew from a stricken vessel. Minimal propulsion, maximum survival.",
    ceRaw: "Life boats are emergency craft. They carry survivors until rescue arrives.",
    mnemeNotes: "Regulated by all factions. A ship without enough life boats is not spaceworthy. Hegemony life boats carry weapons for survival.",
    alsoKnownAs: ["Escape Boat", "Survival Craft"],
    tlRange: "9-12",
    typicalDt: "10-40"
  },
  {
    term: "Escape Pod",
    category: "craft",
    classification: { roleId: "support", sizeId: "craft" },
    definition: "An individual or small-group survival capsule. Ejected from a ship in extremis.",
    ceRaw: "Escape pods are one-use survival capsules. They preserve life until rescue, then are discarded.",
    mnemeNotes: "Standard equipment on all starships. Guild escape pods are automated. House escape pods have beacons that signal House rescue services.",
    alsoKnownAs: ["Survival Pod", "Ejection Capsule"],
    tlRange: "9-12",
    typicalDt: "1-5"
  },
  {
    term: "EVA Pod",
    category: "craft",
    classification: { roleId: "support", sizeId: "craft" },
    definition: "A small craft for extravehicular activity. Maintenance, repair, and construction in vacuum.",
    ceRaw: "EVA pods are work craft. They allow crew to perform maintenance and repairs outside the ship.",
    mnemeNotes: "Essential for any ship operating far from port. Guild EVA pods are automated. Independent ships use whatever they can afford.",
    alsoKnownAs: ["Work Pod", "Maintenance Craft"],
    tlRange: "9-12",
    typicalDt: "2-10"
  },
  {
    term: "Rescue Craft",
    category: "craft",
    classification: { roleId: "support", sizeId: "craft" },
    definition: "A dedicated search and rescue small craft. Medical equipment, salvage gear, and long-range sensors.",
    ceRaw: "Rescue craft are the emergency vehicles of space. They find and recover survivors from disasters.",
    mnemeNotes: "Federation rescue craft are white with red crosses. House rescue craft are House-colored. Frontier rescue craft are independent operators.",
    alsoKnownAs: ["SAR Craft", "Recovery Boat"],
    tlRange: "10-13",
    typicalDt: "10-40"
  },
  {
    term: "Work Pod",
    category: "craft",
    classification: { roleId: "support", sizeId: "craft" },
    definition: "A small utility craft for construction and repair work. Manipulator arms, welding torches, and cargo grapples.",
    ceRaw: "Work pods are the construction workers of space. They build, repair, and maintain stations and ships.",
    mnemeNotes: "Essential for any shipyard or construction site. Guild work pods are mass-produced. Independent work pods are often jury-rigged.",
    alsoKnownAs: ["Construction Pod", "Repair Craft"],
    tlRange: "9-12",
    typicalDt: "5-20"
  },
  {
    term: "Repair Skiff",
    category: "craft",
    classification: { roleId: "support", sizeId: "craft" },
    definition: "A small craft equipped for minor repairs and maintenance. The mechanic's tool kit in space.",
    ceRaw: "Repair skiffs are mobile workshops. They carry tools, spare parts, and a mechanic to fix problems in the field.",
    mnemeNotes: "Common on large ships and stations. A repair skiff can mean the difference between a quick fix and a catastrophic failure.",
    alsoKnownAs: ["Maintenance Skiff", "Work Boat"],
    tlRange: "9-12",
    typicalDt: "5-15"
  },
  {
    term: "Colony Ship",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "lineShip" },
    definition: "A vessel designed to transport colonists and establish new settlements. Self-sufficient for years.",
    ceRaw: "Colony ships carry everything needed to start a new world — people, equipment, seeds, and hope.",
    mnemeNotes: "The Houses fund colony ships to expand their domains. Federation colony ships are democratic expeditions. Hegemony clans do not colonize — they conquer.",
    alsoKnownAs: ["Settler Ship", "Ark"],
    tlRange: "11-14",
    typicalDt: "5000-50000"
  },
  {
    term: "Generation Ship",
    category: "civilian",
    classification: { roleId: "hauler", sizeId: "capital" },
    definition: "A sub-light vessel designed for multi-generational journeys between stars. A self-contained world.",
    ceRaw: "Generation ships are mobile worlds. Crews live and die over centuries as the ship crawls between stars.",
    mnemeNotes: "Rare and ancient. Some pre-Collapse generation ships still drift between systems, their crews forgotten by the galaxy.",
    alsoKnownAs: ["Worldship", "Sleeper Ark"],
    tlRange: "8-10",
    typicalDt: "100000+"
  },
  {
    term: "Mobile Base",
    category: "naval",
    classification: { roleId: "support", sizeId: "capital" },
    definition: "A mobile military installation. Command center, repair facilities, and accommodations for thousands.",
    ceRaw: "Mobile bases are fleet headquarters that can relocate. They carry everything needed to support major operations.",
    mnemeNotes: "House mobile bases are noble palaces. Hegemony mobile bases are clan fortresses. Guild mobile bases are administrative centers.",
    alsoKnownAs: ["Fleet Base", "Mobile Headquarters"],
    tlRange: "12-15",
    typicalDt: "50000+"
  },
  {
    term: "X-Boat",
    category: "civilian",
    classification: { roleId: "sprinter", sizeId: "escort" },
    definition: "An unmanned or minimally crewed express vessel. Automated navigation, pre-programmed routes, minimal life support.",
    ceRaw: "X-boats are automated message carriers. They are cheap, fast, and expendable.",
    mnemeNotes: "The Guilds operate the X-Boat network. Independent X-boats are courier drones. House X-boats carry encrypted diplomatic traffic.",
    alsoKnownAs: ["Express Drone", "Mail Boat"],
    tlRange: "11-14",
    typicalDt: "50-200"
  }
];

// Add all new entries
glossary.entries.push(...newEntries);

// Sort by term name
glossary.entries.sort((a, b) => a.term.localeCompare(b.term));

writeFileSync('./public/data/glossary.json', JSON.stringify(glossary, null, 2));
console.log('Glossary expanded:');
console.log('  Previous entries:', 39);
console.log('  Added:', newEntries.length);
console.log('  Total:', glossary.entries.length);

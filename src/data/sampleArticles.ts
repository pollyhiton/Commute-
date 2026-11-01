export interface ArticleItem {
  id: string;
  title: string;
  source: string;
  category: string;
  readTime: string;
  content: string;
  included: boolean;
}

export interface PresetPack {
  id: string;
  name: string;
  icon: string;
  description: string;
  articles: ArticleItem[];
}

export const SAMPLE_PRESET_PACKS: PresetPack[] = [
  {
    id: 'tech-frontier',
    name: 'Tech & AI Frontier',
    icon: 'Cpu',
    description: 'Autonomous transit breakthroughs, next-gen solid-state batteries, and on-device AI.',
    articles: [
      {
        id: 'art-1',
        title: 'Autonomous Transit Networks Expand to 15 New Metro Cities',
        source: 'Wired Mobility',
        category: 'Technology',
        readTime: '3 min read',
        included: true,
        content: `Municipal transportation authorities across North America and Europe announced a coordinated deployment of level-4 autonomous shuttle corridors designed to bridge the "first-and-last-mile" transit gap. 

Equipped with dual solid-state LiDAR sensors and local edge-compute vision systems, the electric shuttles operate seamlessly in mixed pedestrian and vehicle traffic. Pilot trials conducted over the past 14 months demonstrated a 99.4% on-time arrival rate and a 42% reduction in downtown congestion hotspots. City planners anticipate that connecting these autonomous feeders with high-capacity rail lines will increase public transit adoption by up to 28% among daily suburban commuters.`,
      },
      {
        id: 'art-2',
        title: 'Solid-State Battery Breakthrough Cuts EV Charge Times to 8 Minutes',
        source: 'Clean Energy Review',
        category: 'CleanTech',
        readTime: '4 min read',
        included: true,
        content: `Materials scientists have revealed a ceramic-electrolyte solid-state battery architecture that withstands more than 2,000 rapid charge cycles with negligible dendrite formation. 

The breakthrough battery pack achieves an energy density of 480 watt-hours per kilogram—nearly double current lithium-ion cells—enabling production electric passenger vehicles to achieve 600 miles of highway range on a single charge. Crucially for commuters and road-trippers, high-voltage test charges reached 80% capacity in just under eight minutes at standard 350-kilowatt fast chargers, effectively neutralizing range anxiety and matching standard gas station refueling stops.`,
      },
      {
        id: 'art-3',
        title: 'On-Device Reasoning Models Bring Real-Time Local Intelligence to Phones',
        source: 'Silicon Daily',
        category: 'AI & Mobile',
        readTime: '3 min read',
        included: true,
        content: `Next-generation mobile neural processing units (NPUs) now execute complex multi-step reasoning models entirely on-device without contacting cloud servers. 

By operating at less than 2.5 watts of peak power, these models perform instant offline audio transcription, real-time contextual translation, and predictive commute rerouting. Because data never leaves the handset, commuters traveling through underground tunnels, subways, and cellular dead zones can access uninterrupted contextual summaries and personal productivity assistants with zero latency and complete privacy guarantees.`,
      },
    ],
  },
  {
    id: 'markets-economy',
    name: 'Markets & Commuter Economy',
    icon: 'TrendingUp',
    description: 'Central bank rate decisions, flexible commute transit habits, and urban commercial shifts.',
    articles: [
      {
        id: 'art-4',
        title: 'Global Central Banks Signal Stable Rates as Inflation Cools to Target Bands',
        source: 'Financial Dispatch',
        category: 'Economy',
        readTime: '4 min read',
        included: true,
        content: `Monetary policy committees delivered coordinated statements indicating that benchmark interest rates have reached their terminal plateau, with headline consumer price indices settling into target 2% ranges across major economies. 

Labor markets remain resilient despite tightened monetary conditions, while mortgage refinancing and corporate borrowing spreads have begun to normalize. Economists attribute the steady landing to improved supply chain logistics, stabilizing energy prices, and continued productivity gains across automated manufacturing and logistics sectors.`,
      },
      {
        id: 'art-5',
        title: 'The Midweek Commute Surge: Transit Data Reveals Hybrid Work Routines',
        source: 'Urban Planning Quarterly',
        category: 'Urban Living',
        readTime: '3 min read',
        included: true,
        content: `An aggregate analysis of contactless fare-gate taps across 20 major metropolitan areas shows that Tuesday through Thursday now capture 78% of all weekly office commute volume. 

Mondays and Fridays remain anchor work-from-home days, causing transit agencies to restructure timetables toward high-frequency express loops during the midweek peak. Meanwhile, suburban coffee roasters, gym studios, and neighborhood co-working spaces report record revenue on Monday mornings and Friday afternoons as workers spend discretionary dollars locally rather than in central business districts.`,
      },
      {
        id: 'art-6',
        title: 'Smart Road Pricing and Real-Time Tolling Reduce Rush Hour Gridlock by 25%',
        source: 'Transit Tech Journal',
        category: 'Infrastructure',
        readTime: '3 min read',
        included: true,
        content: `Dynamic corridor tolling powered by automated number-plate recognition and machine-learning traffic prediction has reduced peak rush-hour transit delays by an average of 18 minutes per commuter. 

Revenues generated by dynamic congestion fees are directly earmarked for rapid bus transit lines and cycling superhighways. Survey results show that 68% of surveyed motorists prefer predictable travel times over free but gridlocked freeways, signaling growing public acceptance of algorithmic congestion pricing in major hubs.`,
      },
    ],
  },
  {
    id: 'science-wellness',
    name: 'Science & Morning Wellness',
    icon: 'Sun',
    description: 'Circadian morning light research, space exploration, and urban micro-forests.',
    articles: [
      {
        id: 'art-7',
        title: 'Morning Commute Sunlight Exposure Doubles Daytime Alertness and Sleep Quality',
        source: 'Neuroscience Today',
        category: 'Health',
        readTime: '3 min read',
        included: true,
        content: `A clinical trial tracking 1,200 participants demonstrated that receiving just 15 to 20 minutes of natural daylight exposure during the morning commute accelerates cortisol awakening response and advances melatonin onset by nearly 50 minutes each evening. 

Researchers found that outdoor walkers, cyclists, and transit riders seated near windows reported 35% higher subjective focus throughout the morning workday compared to those who commuted in dark or enclosed environments. Health practitioners now recommend pairing audio podcast listening with an active morning walk or transit stroll to compound cognitive and physical vitality.`,
      },
      {
        id: 'art-8',
        title: 'Deep Space Telescope Discovers Atmospheric Water Vapor on Nearby Exoplanet',
        source: 'Cosmic Horizons',
        category: 'Space Science',
        readTime: '4 min read',
        included: true,
        content: `Astronomers utilizing high-resolution infrared transmission spectroscopy have detected clear water vapor signatures, methane, and carbon dioxide in the upper atmosphere of a temperate rocky super-Earth located 48 light-years away. 

The planetary system orbits an M-dwarf star within the liquid-water habitable zone. While surface temperature modeling suggests warm oceans under thick cloud decks, the absence of toxic sulfur clouds makes the world the most compelling candidate yet for future biosignature searches and deep atmospheric characterization by space agencies.`,
      },
    ],
  },
];

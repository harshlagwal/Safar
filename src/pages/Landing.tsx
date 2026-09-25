import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Route,
  Wallet,
  Bus,
  Train,
  Bike,
  Car,
  Plane,
  GraduationCap,
  Users,
  Palmtree,
  ShieldCheck,
  Compass,
  FileDown,
  CheckCircle2,
  XCircle,
  Ticket,
} from 'lucide-react';
import { Button } from '../components/Button';
import { IndiaMapSvg } from '../components/IndiaMapSvg';
import { AgliChhuttiSection } from '../components/AgliChhuttiSection';
import { useTranslation } from 'react-i18next';

export const Landing: React.FC = () => {
  const { t } = useTranslation();
  // Motion easing and animation specs
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  // Multi-Modal Mobility Technical Specifications (Zero Emojis — Apple Spec Standard)
  const transportSpecs = [
    {
      name: 'Vande Bharat & Superfast Rail',
      mode: 'Train',
      icon: <Train className="w-5 h-5" />,
      badge: 'LOW FATIGUE',
      badgeColor: 'text-[#34c759] bg-[#34c759]/10 border-[#34c759]/20',
      tagline: 'Speed-to-cost efficiency champion for 300–800 km corridors.',
      specs: [
        { label: 'Ideal Range', val: '300–900 km' },
        { label: 'Overnight Rest', val: 'Full Sleeper berth' },
        { label: 'Traffic Immunity', val: '100% Toll-free' },
      ],
      idealFor: 'Intercity connections & college groups',
    },
    {
      name: 'Volvo & BharatBenz AC Sleepers',
      mode: 'Bus',
      icon: <Bus className="w-5 h-5" />,
      badge: 'POINT-TO-POINT',
      badgeColor: 'text-[#ff6b35] bg-[#ff6b35]/10 border-[#ff6b35]/20',
      tagline: 'Direct door-to-destination transit bypassing remote train hubs.',
      specs: [
        { label: 'Ideal Range', val: '200–600 km' },
        { label: 'Boarding Flexibility', val: 'Multiple city points' },
        { label: 'Hill Access', val: 'Direct to hill towns' },
      ],
      idealFor: 'Weekend hill trails & coastal corridors',
    },
    {
      name: 'National Expressways & Self-Drive',
      mode: 'Car',
      icon: <Car className="w-5 h-5" />,
      badge: 'MAX AUTONOMY',
      badgeColor: 'text-[#ff6b35] bg-[#ff6b35]/10 border-[#ff6b35]/20',
      tagline: 'FASTag electronic tolling with complete detour freedom.',
      specs: [
        { label: 'Ideal Range', val: '150–500 km' },
        { label: 'Highway Choice', val: 'NH & Access-controlled' },
        { label: 'Pitstop Freedom', val: 'Authentic dhabas' },
      ],
      idealFor: 'Family vacations & friend roadtrips',
    },
    {
      name: 'Himalayan & Coastal Motorcycle',
      mode: 'Bike',
      icon: <Bike className="w-5 h-5" />,
      badge: 'HIGH ADVENTURE',
      badgeColor: 'text-[#ff6b35] bg-[#ff6b35]/10 border-[#ff6b35]/20',
      tagline: 'Elevation profiling with high-altitude fuel range calculation.',
      specs: [
        { label: 'Pacing', val: '180–300 km/day' },
        { label: 'Terrain Alert', val: 'Ghat curves & passes' },
        { label: 'Fuel Buffer', val: '150 km reserve rule' },
      ],
      idealFor: 'Ghat trails, Ladakh & Western Ghats',
    },
    {
      name: 'Domestic Direct Aviation',
      mode: 'Flight',
      icon: <Plane className="w-5 h-5" />,
      badge: 'MAX TIME-SAVER',
      badgeColor: 'text-[#34c759] bg-[#34c759]/10 border-[#34c759]/20',
      tagline: 'Rapid transit across 1,000+ km with airport cab buffers.',
      specs: [
        { label: 'Ideal Range', val: '800–2,500+ km' },
        { label: 'Transit Time', val: '1.5–3.5 hrs' },
        { label: 'Last-Mile Buffer', val: 'Cab timing factored' },
      ],
      idealFor: 'Long-distance escapes & brief holidays',
    },
  ];

  // Comparison Matrix: Safar vs Generic AI Chatbots
  const comparisonRows = [
    {
      feature: 'Mountain & Ghat Transit Speeds',
      genericAi: 'Assumes uniform highway speed (hallucinates 4 hrs for Manali to Leh)',
      safarEngine: 'Factors hairpin geometry, high passes, and real 25–35 km/h hill transit physics',
    },
    {
      feature: 'Multi-Modal Transport Selection',
      genericAi: 'Vague generic advice ("hire a cab or take a public bus")',
      safarEngine: 'Evaluates Vande Bharat vs Volvo Sleeper vs Expressways with cost-per-km metrics',
    },
    {
      feature: 'Budget Mathematics',
      genericAi: 'Rough lump-sum guesses with zero itemized breakdown',
      safarEngine: 'Scientific formula: Stay (35-45%), Transit (25-35%), Meals (20%), Emergency Buffer (10%)',
    },
    {
      feature: 'Actionable Booking Links',
      genericAi: 'Dead text — you have to search IRCTC & bus portals manually',
      safarEngine: '1-click direct booking links to IRCTC, RedBus, AbhiBus, and MakeMyTrip prefilled',
    },
    {
      feature: 'Offline Travel Dossier',
      genericAi: 'Chat logs that disappear without hill network connectivity',
      safarEngine: 'Instant A4 vector PDF itinerary with embedded typography and emergency helplines',
    },
  ];

  // Tailored Travel Playbooks
  const tripPlaybooks = [
    {
      title: 'College Thrift Expedition',
      badge: 'Max Rupee-to-Experience',
      icon: <GraduationCap className="w-6 h-6 text-[#ff6b35]" />,
      desc: 'Engineered for students: overnight sleeper trains, vetted backpacker dorms, and iconic street food spots that preserve every rupee.',
      metrics: [
        { key: 'Stay Logic', val: 'Hostels & Shared Dorms' },
        { key: 'Transit Strategy', val: 'Sleeper Class / Volvo AC' },
        { key: 'Pacing Style', val: 'High Activity / Max Sightseeing' },
      ],
    },
    {
      title: 'Friends Roadtrip & Getaway',
      badge: 'Balanced Action & Leisure',
      icon: <Users className="w-6 h-6 text-[#ff6b35]" />,
      desc: 'Built for group dynamics: self-drive SUV waypoints, scenic cafe stops, sunset viewpoints, and equalized expense management.',
      metrics: [
        { key: 'Stay Logic', val: 'Boutique Stays & Villas' },
        { key: 'Transit Strategy', val: 'Expressway Car / Self-Drive' },
        { key: 'Pacing Style', val: 'Flexible / Cafe & Nature Trails' },
      ],
    },
    {
      title: 'Curated Heritage Vacation',
      badge: 'Uncompromised Comfort',
      icon: <Palmtree className="w-6 h-6 text-[#34c759]" />,
      desc: 'Designed for family & relaxation: relaxed morning starts, verified outstation cabs, heritage plantation properties, and zero rush.',
      metrics: [
        { key: 'Stay Logic', val: 'Heritage Havelis & Resorts' },
        { key: 'Transit Strategy', val: 'First AC Train / Private Cab' },
        { key: 'Pacing Style', val: 'Gentle Pacing / Cultural Depth' },
      ],
    },
  ];

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* ==========================================
          1. HERO SECTION (Living Map & CTA)
          ========================================== */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
        <div className="max-w-[1100px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Hero Text Column */}
          <motion.div
            className="lg:col-span-7 flex flex-col items-start space-y-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f2f2f5] dark:bg-[#2c2c2e] border border-[#d2d2d7] dark:border-[#333336] text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
              <span className="w-2 h-2 rounded-full bg-[#ff6b35]" />
              <span>Smart AI-Powered India Travel Planner</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0c0c0e] dark:text-[#f5f5f7] tracking-[-0.04em] leading-[1.04]">
              {t('hero.headlineStart')} <br />
              <span className="text-[#0c0c0e] dark:text-[#f5f5f7]">{t('hero.headlineEnd')}</span>
            </h1>

            <p className="text-base sm:text-lg text-[#374151] dark:text-[#d1d5db] max-w-xl leading-relaxed font-medium">
              {t('hero.subtitle')}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link to="/plan">
                <Button size="lg" variant="primary" className="shadow-md w-full sm:w-auto cursor-pointer">
                  <span>{t('hero.ctaPlan')}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>

              <Link to="/trips">
                <Button size="lg" variant="outline" className="w-full sm:w-auto cursor-pointer border-[#d2d2d7] dark:border-[#333336] shadow-xs">
                  <span>{t('hero.ctaViewSaved')}</span>
                </Button>
              </Link>
            </div>

            <div className="pt-4 flex items-center gap-6 text-xs text-[#86868b] dark:text-[#a1a1a6] border-t border-[#d2d2d7] dark:border-[#333336] w-full">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#34c759]" /> ₹500–₹1,00,000 Budget Fit
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Compass className="w-4 h-4 text-[#ff6b35]" /> Instant State-wise Timeline
              </span>
            </div>
          </motion.div>

          {/* Right Hero Graphic: Subtle Animated Route India Map */}
          <motion.div
            className="lg:col-span-5 flex justify-center items-center relative w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative w-full flex justify-center items-center">
              <IndiaMapSvg className="w-full max-w-[560px] lg:max-w-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          AGLI CHHUTTI DETECTOR (F2)
          ========================================== */}
      <AgliChhuttiSection />

      {/* ==========================================
          2. THE CORE LOGISTICS ENGINE (Apple Bento Grid)
          ========================================== */}
      <section className="py-24 bg-[#f8f8fa] dark:bg-[#141416] border-y border-[#d2d2d7] dark:border-[#333336]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-bold tracking-wider uppercase text-[#ea580c] bg-[#ff6b35]/10 px-3 py-1 rounded-full border border-[#ff6b35]/20">
              Engineered for Indian Ground Realities
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0c0c0e] dark:text-[#f5f5f7] tracking-[-0.035em] leading-tight mt-4">
              Not just an AI prompt. <br />
              An Indian travel logistics engine.
            </h2>
            <p className="text-base sm:text-lg text-[#374151] dark:text-[#d1d5db] mt-4 leading-relaxed font-medium">
              Generic chatbots fail because they don't know ghat curves, highway toll corridors, or Vande Bharat timetables. Safar was built from the ground up for how India actually moves.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bento 1: Interstate Highway Routing Engine (Col 7) */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-7 bg-white dark:bg-[#1d1d1f] border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xs"
            >
              <div>
                {/* Frameless Floating Icon */}
                <div className="text-[#ea580c] dark:text-[#ff6b35] mb-5">
                  <Route className="w-8 h-8 stroke-[2.4]" />
                </div>
                <div className="text-xs font-bold tracking-wider text-[#ea580c] dark:text-[#ff6b35] mb-2 uppercase">
                  Highway Routing Intelligence
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#0c0c0e] dark:text-[#f5f5f7] tracking-tight mb-4">
                  Kilometer-precise interstate routing
                </h3>
                <p className="text-sm text-[#374151] dark:text-[#d1d5db] font-medium leading-relaxed">
                  Computes realistic road physics: National Highway corridors (NH44, NH48, Yamuna Expressway), state border crossings, and realistic ghat curve speed limits — not straight-line fantasy estimates.
                </p>
              </div>

              {/* Highway Telemetry Preview */}
              <div className="mt-8 pt-6 border-t border-[#d2d2d7] dark:border-[#3a3a3c]">
                <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] p-4 rounded-lg border border-[#d2d2d7] dark:border-[#38383a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 font-mono text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <span className="font-semibold text-[#ff6b35]">DELHI</span>
                    <span className="text-[#86868b]">── NH44 ──►</span>
                    <span className="font-semibold">CHANDIGARH</span>
                    <span className="text-[#86868b]">── NH5 Ghat ──►</span>
                    <span className="font-semibold text-[#34c759]">SHIMLA</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#86868b] dark:text-[#a1a1a6]">
                    <span className="px-2.5 py-0.5 rounded bg-white dark:bg-[#1d1d1f] border border-[#d2d2d7] dark:border-[#38383a] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      342 km
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-white dark:bg-[#1d1d1f] border border-[#d2d2d7] dark:border-[#38383a] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      7.5 hrs realistic
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bento 2: Rupee-Precise Budget Architecture (Col 5) */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-5 bg-white dark:bg-[#1d1d1f] border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xs"
            >
              <div>
                {/* Frameless Floating Icon */}
                <div className="text-[#10b981] mb-5">
                  <Wallet className="w-8 h-8 stroke-[2.4]" />
                </div>
                <div className="text-xs font-bold tracking-wider text-[#10b981] mb-2 uppercase">
                  Budget Architecture
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#0c0c0e] dark:text-[#f5f5f7] tracking-tight mb-4">
                  Rupee-to-rupee mathematical splits
                </h3>
                <p className="text-sm text-[#374151] dark:text-[#d1d5db] font-medium leading-relaxed">
                  Every rupee accounted for: Stay (35-45%), Transit/Fuel (25-35%), Meals (20%), and Emergency Reserve (10%). Scales from ₹500 college escapes to ₹1,00,000 luxury vacations.
                </p>
              </div>

              {/* Split Bar Preview */}
              <div className="mt-8 pt-6 border-t border-[#e5e5ea] dark:border-[#3a3a3c]">
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full bg-[#e2e2e7] dark:bg-[#38383a] overflow-hidden flex">
                    <div className="h-full bg-[#ff6b35]" style={{ width: '40%' }} title="Stay 40%" />
                    <div className="h-full bg-[#1d1d1f] dark:bg-white" style={{ width: '30%' }} title="Transit 30%" />
                    <div className="h-full bg-[#34c759]" style={{ width: '20%' }} title="Food 20%" />
                    <div className="h-full bg-[#86868b]" style={{ width: '10%' }} title="Buffer 10%" />
                  </div>
                  <div className="flex justify-between text-xs font-medium text-[#86868b] dark:text-[#a1a1a6]">
                    <span>Stay 40%</span>
                    <span>Transit 30%</span>
                    <span>Meals 20%</span>
                    <span>Buffer 10%</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bento 3: 1-Click Booking Integration (Col 5) */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-5 bg-white dark:bg-[#1d1d1f] border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xs"
            >
              <div>
                {/* Frameless Floating Icon */}
                <div className="text-[#ea580c] dark:text-[#ff6b35] mb-5">
                  <Ticket className="w-8 h-8 stroke-[2.4]" />
                </div>
                <div className="text-xs font-bold tracking-wider text-[#ea580c] dark:text-[#ff6b35] mb-2 uppercase">
                  Executable Logistics
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#0c0c0e] dark:text-[#f5f5f7] tracking-tight mb-4">
                  1-Click direct booking deep-links
                </h3>
                <p className="text-sm text-[#374151] dark:text-[#d1d5db] font-medium leading-relaxed">
                  Zero manual searching. Instant deep-links to IRCTC for trains, RedBus and AbhiBus for sleeper coaches, and MakeMyTrip for vetted accommodations with cities prefilled.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-[#e5e5ea] dark:border-[#3a3a3c] flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#d2d2d7] dark:border-[#38383a] text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <span className="w-2 h-2 rounded-full bg-[#ff6b35]" /> IRCTC Rail Connect
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#d2d2d7] dark:border-[#38383a] text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <span className="w-2 h-2 rounded-full bg-[#ff6b35]" /> RedBus Live
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#d2d2d7] dark:border-[#38383a] text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <span className="w-2 h-2 rounded-full bg-[#34c759]" /> MakeMyTrip
                </span>
              </div>
            </motion.div>

            {/* Bento 4: Offline Executive Vector Dossier (Col 7) */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-7 bg-white dark:bg-[#1d1d1f] border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xs"
            >
              <div>
                {/* Frameless Floating Icon */}
                <div className="text-[#10b981] mb-5">
                  <FileDown className="w-8 h-8 stroke-[2.4]" />
                </div>
                <div className="text-xs font-bold tracking-wider text-[#10b981] mb-2 uppercase">
                  Executive Export
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#0c0c0e] dark:text-[#f5f5f7] tracking-tight mb-4">
                  Print-ready A4 vector PDF dossier
                </h3>
                <p className="text-sm text-[#374151] dark:text-[#d1d5db] font-medium leading-relaxed">
                  Export a publication-grade itinerary with embedded TrueType Inter typography, hour-by-hour day plans, road packing checklists, and official emergency helpline contacts (112, NHAI 1033, Railway 139) that works deep in remote hill ranges without cellular network.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-[#e5e5ea] dark:border-[#3a3a3c] flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-[#86868b] dark:text-[#a1a1a6]">
                  <span className="flex items-center gap-1.5 font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <CheckCircle2 className="w-4 h-4 text-[#34c759]" /> 100% Offline Ready
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <ShieldCheck className="w-4 h-4 text-[#ff6b35]" /> Emergency Helplines
                  </span>
                </div>
                <span className="text-xs font-bold tracking-wider text-[#1d1d1f] dark:text-[#f5f5f7] uppercase">
                  Vector A4 Standard
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==========================================
          3. "KYU SAHI HAI" — SAFAR vs GENERIC CHATBOTS (Apple Specs Matrix)
          ========================================== */}
      <section className="py-24 bg-white dark:bg-[#000000]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ea580c] dark:text-[#ff6b35]">
              Engineered vs Estimated
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0c0c0e] dark:text-[#f5f5f7] tracking-[-0.035em] mt-3">
              Why generic chatbots fail on Indian trips.
            </h2>
            <p className="text-base sm:text-lg text-[#374151] dark:text-[#d1d5db] mt-3 leading-relaxed font-medium">
              Generic LLMs guess distance in straight lines and hallucinate travel times. Here is how Safar's ground logic differs.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111113] rounded-2xl border border-[#e5e5ea] dark:border-[#27272a] shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-1 md:grid-cols-12 p-6 sm:p-8 bg-[#f8f8fa] dark:bg-[#18181b] border-b border-[#e5e5ea] dark:border-[#27272a] text-xs font-bold tracking-wider uppercase text-[#475569] dark:text-[#cbd5e1]">
              <div className="md:col-span-4">Capability</div>
              <div className="md:col-span-4 text-red-500 dark:text-red-400 flex items-center gap-1.5 font-bold">
                <XCircle className="w-4 h-4" /> Generic AI Chatbots
              </div>
              <div className="md:col-span-4 text-[#ea580c] dark:text-[#ff6b35] flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Safar Logistics Engine
              </div>
            </div>

            {/* Table Rows (Visible Data Lines) */}
            <div className="divide-y divide-[#e5e5ea] dark:divide-[#27272a]">
              {comparisonRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-12 p-6 sm:p-8 gap-4 items-center hover:bg-[#fafafa] dark:hover:bg-[#1a1a1d] transition-colors"
                >
                  <div className="md:col-span-4 font-bold text-sm text-[#0c0c0e] dark:text-[#f5f5f7]">
                    {row.feature}
                  </div>
                  <div className="md:col-span-4 text-sm text-[#374151] dark:text-[#d1d5db] font-medium leading-relaxed">
                    <span className="md:hidden font-semibold text-red-500 block mb-1">Generic AI: </span>
                    {row.genericAi}
                  </div>
                  <div className="md:col-span-4 text-sm font-semibold text-[#0c0c0e] dark:text-[#f5f5f7] leading-relaxed">
                    <span className="md:hidden font-semibold text-[#ea580c] block mb-1">Safar Engine: </span>
                    {row.safarEngine}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          4. MULTI-MODAL TRANSIT SPECIFICATION (Antigravity Frameless Style)
          ========================================== */}
      <section className="py-24 bg-[#fafafa] dark:bg-[#0c0c0e] border-t border-[#e5e5ea] dark:border-[#27272a]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#ea580c] dark:text-[#ff6b35]">
                Multi-Modal Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0c0c0e] dark:text-[#f5f5f7] tracking-[-0.035em] mt-2">
                Every way India travels, compared.
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#374151] dark:text-[#d1d5db] max-w-md font-medium leading-relaxed">
              Safar calculates fatigue index, time efficiency, and cost per kilometer to recommend the exact mode for your route.
            </p>
          </div>

          {/* Frameless Open Architecture Grid (Zero Boxy Containers) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {transportSpecs.map((spec, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group border-t border-[#e2e2e7] dark:border-[#27272a] pt-7 flex flex-col justify-between"
              >
                <div>
                  {/* Frameless Clean Floating Icon Row */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="text-[#ea580c] dark:text-[#ff6b35] transition-transform duration-300 group-hover:scale-110 [&>svg]:w-7 [&>svg]:h-7">
                      {spec.icon}
                    </div>
                    <span className={`text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${spec.badgeColor}`}>
                      {spec.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-[#0c0c0e] dark:text-[#f5f5f7] tracking-tight mb-2">
                    {spec.name}
                  </h3>
                  <p className="text-sm text-[#374151] dark:text-[#d1d5db] font-medium leading-relaxed mb-6">
                    {spec.tagline}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-[#e5e5ea]/80 dark:border-[#27272a]">
                    {spec.specs.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-[#475569] dark:text-[#94a3b8] font-medium">{item.label}</span>
                        <span className="font-semibold text-[#0c0c0e] dark:text-[#f5f5f7]">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#e5e5ea]/80 dark:border-[#27272a] text-xs text-[#475569] dark:text-[#94a3b8]">
                  <span className="font-semibold text-[#0c0c0e] dark:text-[#f5f5f7]">Ideal For:</span> {spec.idealFor}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          5. TAILORED TRAVEL ARCHETYPES (Antigravity Frameless Playbooks)
          ========================================== */}
      <section className="py-24 bg-white dark:bg-[#000000] border-t border-[#e5e5ea] dark:border-[#27272a]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ea580c] dark:text-[#ff6b35]">
              Tailored Itinerary Playbooks
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0c0c0e] dark:text-[#f5f5f7] tracking-[-0.035em] mt-3">
              Custom logic for how your group travels.
            </h2>
            <p className="text-base sm:text-lg text-[#374151] dark:text-[#d1d5db] mt-3 leading-relaxed font-medium">
              One size never fits all in India. Here is how Safar dynamically tunes its engine for your group.
            </p>
          </div>

          {/* Frameless Editorial Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {tripPlaybooks.map((playbook, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group border-t-2 border-[#e5e5ea] dark:border-[#27272a] pt-8 flex flex-col justify-between hover:border-[#ea580c] transition-colors duration-300"
              >
                <div>
                  {/* Frameless Floating Icon */}
                  <div className="mb-5 text-[#ea580c] dark:text-[#ff6b35] transition-transform duration-300 group-hover:scale-110 [&>svg]:w-9 [&>svg]:h-9">
                    {playbook.icon}
                  </div>
                  <span className="inline-block text-[11px] font-bold tracking-wider text-[#ea580c] bg-[#ff6b35]/10 px-3 py-1 rounded-full mb-3 border border-[#ff6b35]/20 uppercase">
                    {playbook.badge}
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#0c0c0e] dark:text-[#f5f5f7] tracking-tight mb-3">
                    {playbook.title}
                  </h3>
                  <p className="text-sm text-[#374151] dark:text-[#d1d5db] font-medium leading-relaxed mb-6">
                    {playbook.desc}
                  </p>

                  <div className="space-y-3 pt-5 border-t border-[#e5e5ea] dark:border-[#27272a]">
                    {playbook.metrics.map((m, i) => (
                      <div key={i} className="text-xs flex flex-col">
                        <span className="text-[#86868b] dark:text-[#a1a1a6] text-[11px] uppercase font-bold tracking-wider">
                          {m.key}
                        </span>
                        <span className="font-semibold text-[#0c0c0e] dark:text-[#f5f5f7] mt-1 text-[13px]">
                          {m.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          6. EXECUTIVE LAUNCH CTA (Apple Minimalist Banner)
          ========================================== */}
      <section className="py-24 bg-[#0c0c0e] text-white">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ff6b35]">
            Instant Route Synthesis
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-[-0.035em] mt-3 leading-tight">
            Ready to plan your next Indian journey?
          </h2>
          <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto mt-4 leading-relaxed font-normal">
            Enter your starting point, destination, and budget. Safar calculates your exact highway route, realistic day plan, and booking links in seconds.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/plan">
              <Button size="lg" variant="primary" className="shadow-lg w-full sm:w-auto cursor-pointer">
                <span>Plan Your Trip Now</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>

            <Link to="/trips">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto cursor-pointer text-white bg-white/10 hover:bg-white/20 border-white/30"
              >
                <span>View Saved Trips</span>
              </Button>
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34c759]" /> ₹500–₹1,00,000 Budget Engine
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#ff6b35]" /> 100% Free & No Sign-up Required
            </span>
            <span className="flex items-center gap-1.5">
              <FileDown className="w-4 h-4 text-[#ff6b35]" /> Printable A4 Vector Dossier
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

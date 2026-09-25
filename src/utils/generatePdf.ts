import { jsPDF } from 'jspdf';
import { PlanResponse } from '../types/plan';
import { slugifyCity } from './bookingLinks';
import { registerInterFonts } from '../assets/fonts/interFonts';
import { SAFAR_ICON_PNG } from '../assets/logo/safarLogoPng';

export function buildTripPdfDoc(plan: PlanResponse): { doc: jsPDF; filename: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  // Register real embedded Inter TrueType fonts (400, 500, 600, 700)
  registerInterFonts(doc);

  // ==========================================
  // PAGE GEOMETRY & CONSTANTS (A4, 52pt margins)
  // ==========================================
  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const MARGIN_LEFT = 52;
  const MARGIN_RIGHT = 52;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 491.28pt
  const CONTENT_RIGHT = PAGE_WIDTH - MARGIN_RIGHT; // 543.28pt
  const MAX_CONTENT_Y = 780;

  // Extract trip metadata safely
  const origin = plan.request?.origin || plan.route?.[0]?.from || 'Origin';
  const destination = plan.request?.destination || plan.route?.[plan.route.length - 1]?.to || 'Destination';
  const tripType = plan.request?.tripType || 'vacation';
  const days = plan.request?.days || plan.dayPlan?.length || 3;
  const travellers = plan.request?.travellers || 1;
  const budget = plan.request?.budget || 5000;
  const chosenMode = plan.modeRecommendation?.chosen || plan.request?.transportMode || 'Train';

  // Helper to draw mini header on continuation pages
  const drawPageContinuationHeader = (): void => {
    // 5pt saffron strip at very top
    doc.setFillColor(255, 107, 53);
    doc.rect(0, 0, PAGE_WIDTH, 5, 'F');

    // Mini header icon (left, top)
    try {
      doc.addImage(SAFAR_ICON_PNG, 'PNG', MARGIN_LEFT, 18, 16, 16);
    } catch {
      // Fallback dot if image not loaded
      doc.setFillColor(255, 107, 53);
      doc.circle(MARGIN_LEFT + 8, 26, 6, 'F');
    }

    // Left text: Origin → Destination · TRIPTYPE
    doc.setFont('Inter600', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(134, 134, 139); // #86868b
    doc.text(`${origin} → ${destination} · ${tripType.toUpperCase()}`, MARGIN_LEFT + 24, 30);

    // Right text: SAFAR ITINERARY
    doc.text('SAFAR ITINERARY', CONTENT_RIGHT, 30, { align: 'right' });

    // Hairline divider
    doc.setDrawColor(232, 232, 237);
    doc.setLineWidth(0.75);
    doc.line(MARGIN_LEFT, 42, CONTENT_RIGHT, 42);
  };

  // ==========================================
  // PAGE 1: OVERVIEW, ROUTE & COSTS
  // ==========================================

  // 1. 8pt full-width saffron strip at the very top
  doc.setFillColor(255, 107, 53);
  doc.rect(0, 0, PAGE_WIDTH, 8, 'F');

  // 2. Header: logo icon (left, top) + "SAFAR" Inter700 13pt next to it;
  // right-aligned meta: "{days} DAYS • {travellers} TRAVELLERS • Rs.{budget} / PERSON"
  let y = 30;
  try {
    doc.addImage(SAFAR_ICON_PNG, 'PNG', MARGIN_LEFT, y, 22, 22);
  } catch {
    doc.setFillColor(255, 107, 53);
    doc.circle(MARGIN_LEFT + 10, y + 10, 8, 'F');
  }

  doc.setFont('Inter700', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(29, 29, 31);
  doc.text('SAFAR', MARGIN_LEFT + 30, y + 16);

  const daysLabel = days === 1 ? '1 DAY' : `${days} DAYS`;
  const travLabel = travellers === 1 ? '1 TRAVELLER' : `${travellers} TRAVELLERS`;
  const budgetPerPerson = Math.round(budget / travellers);
  const metaText = `${daysLabel} • ${travLabel} • Rs.${budgetPerPerson.toLocaleString('en-IN')} / PERSON`;

  doc.setFont('Inter500', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(134, 134, 139);
  doc.text(metaText, CONTENT_RIGHT, y + 16, { align: 'right' });

  // 3. Title: "{origin} → {destination}" Inter700 28pt
  y += 44;
  doc.setFont('Inter700', 'normal');
  doc.setFontSize(28);
  doc.setTextColor(29, 29, 31);
  doc.text(`${origin} → ${destination}`, MARGIN_LEFT, y);

  // 4. Chips row (rounded 8.5, height 17)
  y += 14;
  const chipHeight = 17;
  const chipRadius = 8.5;

  // Chip 1: tripType chip (bg #fff0e8, text saffron #ff6b35, Inter600 8pt uppercase)
  const typeText = tripType.toUpperCase();
  doc.setFont('Inter600', 'normal');
  doc.setFontSize(8);
  const typeWidth = doc.getTextWidth(typeText) + 16;
  doc.setFillColor(255, 240, 232); // #fff0e8
  doc.roundedRect(MARGIN_LEFT, y, typeWidth, chipHeight, chipRadius, chipRadius, 'F');
  doc.setTextColor(255, 107, 53);
  doc.text(typeText, MARGIN_LEFT + 8, y + 11.5);

  // Chip 2: mode chip (bg #f5f5f7, text #86868b, Inter600 8pt uppercase)
  const modeText = chosenMode.toUpperCase();
  const modeWidth = doc.getTextWidth(modeText) + 16;
  const modeX = MARGIN_LEFT + typeWidth + 8;
  doc.setFillColor(245, 245, 247); // #f5f5f7
  doc.roundedRect(modeX, y, modeWidth, chipHeight, chipRadius, chipRadius, 'F');
  doc.setTextColor(134, 134, 139);
  doc.text(modeText, modeX + 8, y + 11.5);

  // 5. Hairline #e8e8ed
  y += 26;
  doc.setDrawColor(232, 232, 237);
  doc.setLineWidth(0.75);
  doc.line(MARGIN_LEFT, y, CONTENT_RIGHT, y);

  // 6. TRIP SUMMARY: 20×3pt saffron bar + label Inter600 8.5pt #86868b uppercase,
  // body Inter400 10pt leading 15, block width = page width minus 112pt (narrow for readable line length)
  y += 18;
  doc.setFillColor(255, 107, 53);
  doc.rect(MARGIN_LEFT, y - 6.5, 20, 3, 'F');

  doc.setFont('Inter600', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(134, 134, 139);
  doc.text('TRIP SUMMARY', MARGIN_LEFT + 26, y);

  y += 14;
  const summaryWidth = PAGE_WIDTH - 112; // 483.28pt
  const summaryText = plan.summary || 'A curated travel itinerary designed for maximum comfort, efficiency, and cultural immersion.';
  doc.setFont('Inter', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(29, 29, 31);
  const summaryLines = doc.splitTextToSize(summaryText, summaryWidth);
  doc.text(summaryLines, MARGIN_LEFT, y, { lineHeightFactor: 1.5 });
  y += summaryLines.length * 15;

  // 7. RECOMMENDED MODE callout: rounded 8 box, bg #fff0e8, 3pt saffron left bar, height ~56
  y += 10;
  const calloutHeight = 56;
  doc.setFillColor(255, 240, 232); // #fff0e8
  doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, calloutHeight, 8, 8, 'F');
  // 3pt saffron left bar
  doc.setFillColor(255, 107, 53);
  doc.roundedRect(MARGIN_LEFT, y, 3.5, calloutHeight, 1.75, 1.75, 'F');

  doc.setFont('Inter600', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(255, 107, 53);
  doc.text(`RECOMMENDED MODE — ${chosenMode.toUpperCase()}`, MARGIN_LEFT + 14, y + 18);

  const reasonText = plan.modeRecommendation?.reason || 'Optimal route balancing journey comfort and overall budget efficiency.';
  doc.setFont('Inter', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(110, 110, 115); // #6e6e73
  const reasonLines = doc.splitTextToSize(reasonText, CONTENT_WIDTH - 28);
  doc.text(reasonLines.slice(0, 2), MARGIN_LEFT + 14, y + 33, { lineHeightFactor: 1.35 });
  y += calloutHeight + 16;

  // 8. ROUTE TIMELINE (NOT a table): per leg — saffron dot (r 4.5) on a
  // left rail, dotted #e8e8ed connector between dots; right-aligned
  // "LEG 01" Inter600 7.5pt #a1a1a6; leg title Inter600 11.5pt; meta
  // "TRAIN · 260 KM · 3.5 HRS" Inter500 7.5pt grey; note Inter400 9pt
  // #6e6e73 wrapped; hairline between legs; ~60pt per leg
  doc.setFillColor(255, 107, 53);
  doc.rect(MARGIN_LEFT, y - 6.5, 20, 3, 'F');

  doc.setFont('Inter600', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(134, 134, 139);
  doc.text('ROUTE TIMELINE', MARGIN_LEFT + 26, y);
  y += 14;

  const routes = plan.route && plan.route.length > 0 ? plan.route : [
    { from: origin, to: destination, state: 'India', km: 260, hours: 3.5, note: 'Direct scenic transport corridor.' }
  ];

  const railX = MARGIN_LEFT + 7;
  const legContentX = MARGIN_LEFT + 24;

  for (let i = 0; i < routes.length; i++) {
    const hop = routes[i];
    const legNum = `LEG ${String(i + 1).padStart(2, '0')}`;
    const legY = y;
    const isLastLeg = i === routes.length - 1;

    // Saffron dot (r 4.5) on rail
    doc.setFillColor(255, 107, 53);
    doc.circle(railX, legY + 5.5, 4.5, 'F');

    // Dotted #e8e8ed connector rail if not last
    if (!isLastLeg) {
      doc.setDrawColor(232, 232, 237);
      doc.setLineWidth(1.2);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(railX, legY + 12, railX, legY + 54);
      doc.setLineDashPattern([], 0); // reset dash
    }

    // Right-aligned "LEG 01" Inter600 7.5pt #a1a1a6
    doc.setFont('Inter600', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(161, 161, 166); // #a1a1a6
    doc.text(legNum, CONTENT_RIGHT, legY + 6, { align: 'right' });

    // Leg title Inter600 11.5pt #1d1d1f
    doc.setFont('Inter600', 'normal');
    doc.setFontSize(11.5);
    doc.setTextColor(29, 29, 31);
    doc.text(`${hop.from} → ${hop.to}`, legContentX, legY + 7);

    // Meta: "TRAIN · 260 KM · 3.5 HRS" Inter500 7.5pt grey
    const hopMode = chosenMode.toUpperCase();
    const metaLine = `${hopMode} · ${Math.round(hop.km || 100)} KM · ${hop.hours || 2} HRS`;
    doc.setFont('Inter500', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(134, 134, 139);
    doc.text(metaLine, legContentX, legY + 20);

    // Note Inter400 9pt #6e6e73 wrapped
    const noteText = hop.note || 'Scenic corridor with local refreshments and smooth transit.';
    doc.setFont('Inter', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 115);
    const noteLines = doc.splitTextToSize(noteText, CONTENT_WIDTH - 30);
    doc.text(noteLines.slice(0, 2), legContentX, legY + 33, { lineHeightFactor: 1.3 });

    y += 54;
    // Hairline between legs
    doc.setDrawColor(232, 232, 237);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_LEFT, y, CONTENT_RIGHT, y);
    y += 10;
  }

  // 9. COST ESTIMATES: header labels Inter600 8pt grey; rows 20pt, zebra
  // #fafafa on odd; item Inter400 10 left, range Inter500 10 right;
  // 6pt extra gap + hairline; TOTAL row bg #f5f5f7 Inter700 with
  // right-aligned range; hairline; per-person row: "Per person · inside
  // budget" Inter600 10 grey left + range Inter700 11pt SAFFRON right.
  // "inside budget" only when perPersonCost.max <= budget, else "over budget" in grey.
  y += 4;
  doc.setFillColor(255, 107, 53);
  doc.rect(MARGIN_LEFT, y - 6.5, 20, 3, 'F');

  doc.setFont('Inter600', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(134, 134, 139);
  doc.text('COST ESTIMATES', MARGIN_LEFT + 26, y);
  y += 14;

  // Header row
  doc.setFont('Inter600', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(134, 134, 139);
  doc.text('EXPENSE ITEM', MARGIN_LEFT + 6, y);
  doc.text('ESTIMATED RANGE (INR)', CONTENT_RIGHT - 6, y, { align: 'right' });
  y += 6;
  doc.setDrawColor(232, 232, 237);
  doc.setLineWidth(0.75);
  doc.line(MARGIN_LEFT, y, CONTENT_RIGHT, y);
  y += 3;

  const costItems = plan.costs && plan.costs.length > 0 ? plan.costs : [
    { item: 'Transit / Fares', min: 1200, max: 2500 },
    { item: 'Stay & Accommodation', min: 2000, max: 4000 },
    { item: 'Food & Meals', min: 800, max: 1500 },
    { item: 'Activities & Buffer', min: 500, max: 1000 },
  ];

  const rowHeight = 20;
  costItems.forEach((c, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(250, 250, 250); // zebra #fafafa
      doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, rowHeight, 'F');
    }

    doc.setFont('Inter', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(29, 29, 31);
    doc.text(c.item, MARGIN_LEFT + 6, y + 14);

    doc.setFont('Inter500', 'normal');
    doc.setFontSize(10);
    const rangeStr = `Rs.${Math.round(c.min).toLocaleString('en-IN')} – Rs.${Math.round(c.max).toLocaleString('en-IN')}`;
    doc.text(rangeStr, CONTENT_RIGHT - 6, y + 14, { align: 'right' });

    y += rowHeight;
  });

  // 6pt extra gap + hairline
  y += 4;
  doc.setDrawColor(232, 232, 237);
  doc.setLineWidth(0.75);
  doc.line(MARGIN_LEFT, y, CONTENT_RIGHT, y);

  // TOTAL row bg #f5f5f7 Inter700 with right-aligned range
  const totalMin = plan.totalCost?.min || costItems.reduce((acc, curr) => acc + curr.min, 0);
  const totalMax = plan.totalCost?.max || costItems.reduce((acc, curr) => acc + curr.max, 0);

  doc.setFillColor(245, 245, 247); // #f5f5f7
  doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 22, 'F');

  doc.setFont('Inter700', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(29, 29, 31);
  doc.text('Total Estimated Trip Cost', MARGIN_LEFT + 6, y + 15);

  const totalRangeStr = `Rs.${Math.round(totalMin).toLocaleString('en-IN')} – Rs.${Math.round(totalMax).toLocaleString('en-IN')}`;
  doc.text(totalRangeStr, CONTENT_RIGHT - 6, y + 15, { align: 'right' });
  y += 22;

  // Hairline
  doc.setDrawColor(232, 232, 237);
  doc.setLineWidth(0.75);
  doc.line(MARGIN_LEFT, y, CONTENT_RIGHT, y);
  y += 4;

  // Per-person row: "Per person · inside budget" Inter600 10 grey left + range Inter700 11pt SAFFRON right
  const perPersonMin = plan.perPersonCost?.min || Math.round(totalMin / travellers);
  const perPersonMax = plan.perPersonCost?.max || Math.round(totalMax / travellers);
  const maxPerPersonBudget = Math.round(budget / travellers);
  const isInsideBudget = perPersonMax <= maxPerPersonBudget;

  doc.setFont('Inter600', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(134, 134, 139);
  const budgetLabel = isInsideBudget ? 'Per person · inside budget' : 'Per person · over budget';
  doc.text(budgetLabel, MARGIN_LEFT + 6, y + 14);

  doc.setFont('Inter700', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(255, 107, 53); // SAFFRON
  const perPersonStr = `Rs.${Math.round(perPersonMin).toLocaleString('en-IN')} – Rs.${Math.round(perPersonMax).toLocaleString('en-IN')}`;
  doc.text(perPersonStr, CONTENT_RIGHT - 6, y + 14, { align: 'right' });


  // ==========================================
  // PAGE 2+: DAY-BY-DAY PLAN, PACKING & TIPS
  // ==========================================
  doc.addPage();
  drawPageContinuationHeader();
  y = 60;

  // Header for Day Plan
  doc.setFillColor(255, 107, 53);
  doc.rect(MARGIN_LEFT, y - 6.5, 20, 3, 'F');
  doc.setFont('Inter600', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(134, 134, 139);
  doc.text('DAY-BY-DAY PLAN', MARGIN_LEFT + 26, y);
  y += 16;

  const dayPlans = plan.dayPlan && plan.dayPlan.length > 0 ? plan.dayPlan : [
    { day: 1, title: 'Arrival & Check-in', details: 'Check in to stay, explore the local area, and enjoy a traditional dinner.' },
    { day: 2, title: 'Sightseeing & Culture', details: 'Visit prominent viewpoints, heritage landmarks, and local craft bazaars.' },
    { day: 3, title: 'Departure & Memories', details: 'Morning stroll, souvenir shopping, and return journey.' },
  ];

  for (let idx = 0; idx < dayPlans.length; idx++) {
    const d = dayPlans[idx];
    const detailsLines = doc.splitTextToSize(d.details, CONTENT_WIDTH - 38);
    const dayBlockHeight = 44;

    // Check if we need a page break (when y > MAX_CONTENT_Y - 50)
    if (y + dayBlockHeight > MAX_CONTENT_Y) {
      doc.addPage();
      drawPageContinuationHeader();
      y = 60;
    }

    const dayNumStr = String(d.day || idx + 1).padStart(2, '0');

    // Left column: big saffron numeral "01" Inter700 15pt (34pt left column)
    doc.setFont('Inter700', 'normal');
    doc.setFontSize(15);
    doc.setTextColor(255, 107, 53);
    doc.text(dayNumStr, MARGIN_LEFT, y + 14);

    // Right column: "Day N — {title}" Inter600 10.5pt
    doc.setFont('Inter600', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(29, 29, 31);
    doc.text(`Day ${d.day || idx + 1} — ${d.title}`, MARGIN_LEFT + 36, y + 10);

    // Details Inter400 9.5pt #6e6e73 wrapped max 2 lines
    doc.setFont('Inter', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(110, 110, 115);
    doc.text(detailsLines.slice(0, 2), MARGIN_LEFT + 36, y + 24, { lineHeightFactor: 1.35 });

    y += dayBlockHeight;

    // Hairline between days
    doc.setDrawColor(232, 232, 237);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_LEFT, y, CONTENT_RIGHT, y);
    y += 10;
  }

  // ==========================================
  // PACKING CHECKLIST & LOCAL TIPS
  // ==========================================
  const checklist = plan.checklist && plan.checklist.length > 0 ? plan.checklist : [
    'Valid Government Photo ID',
    'Emergency cash in INR',
    'Comfortable walking shoes',
    'Personal prescriptions & first aid',
    'Power bank & chargers',
    'Light jacket or weather wear',
    'Sunscreen & sunglasses',
    'Reusable water bottle',
  ];

  const tips = plan.tips && plan.tips.length > 0 ? plan.tips : [
    'Reserve train & Volvo tickets well in advance during holiday rush.',
    'Keep small INR notes for auto fares and roadside tea stalls.',
    'Early mornings offer the best photography lighting and minimal crowds.',
  ];

  // Space check: Checklist & Tips need ~150pt
  if (y + 160 > MAX_CONTENT_Y) {
    doc.addPage();
    drawPageContinuationHeader();
    y = 60;
  } else {
    y += 10;
  }

  const sectionTopY = y;

  // Left Section: PACKING CHECKLIST (two columns of 4)
  doc.setFillColor(255, 107, 53);
  doc.rect(MARGIN_LEFT, sectionTopY - 6.5, 20, 3, 'F');
  doc.setFont('Inter600', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(134, 134, 139);
  doc.text('PACKING CHECKLIST', MARGIN_LEFT + 26, sectionTopY);

  const col1X = MARGIN_LEFT;
  const col2X = MARGIN_LEFT + 130;
  const colWidth = 115;
  const maxItems = Math.min(8, checklist.length);

  for (let i = 0; i < maxItems; i++) {
    const isCol2 = i >= 4;
    const itemX = isCol2 ? col2X : col1X;
    const rowIdx = isCol2 ? i - 4 : i;
    const itemY = sectionTopY + 18 + rowIdx * 28;

    // Drawn 8pt rounded squares (1.1pt saffron stroke)
    doc.setDrawColor(255, 107, 53);
    doc.setLineWidth(1.1);
    doc.roundedRect(itemX, itemY, 8.5, 8.5, 2, 2, 'S');

    // Saffron tick drawn inside
    doc.setLineWidth(1.1);
    doc.line(itemX + 2, itemY + 4.5, itemX + 3.8, itemY + 6.5);
    doc.line(itemX + 3.8, itemY + 6.5, itemX + 7, itemY + 2.5);

    // Item text Inter400 8.5pt wrapped to 112pt
    doc.setFont('Inter', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(29, 29, 31);
    const itemLines = doc.splitTextToSize(checklist[i], colWidth);
    doc.text(itemLines.slice(0, 2), itemX + 13, itemY + 7, { lineHeightFactor: 1.25 });
  }

  // Right Section: LOCAL TIPS box
  const tipsBoxX = MARGIN_LEFT + 265;
  const tipsBoxWidth = CONTENT_RIGHT - tipsBoxX;
  const tipsBoxHeight = Math.max(124, tips.length * 36 + 20);

  // bg #fafafa rounded 8
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(tipsBoxX, sectionTopY, tipsBoxWidth, tipsBoxHeight, 8, 8, 'F');

  // 3pt saffron left bar
  doc.setFillColor(255, 107, 53);
  doc.roundedRect(tipsBoxX, sectionTopY, 3, tipsBoxHeight, 1.5, 1.5, 'F');

  // "LOCAL TIPS" label Inter600 8.5pt saffron
  doc.setFont('Inter600', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 107, 53);
  doc.text('LOCAL TIPS', tipsBoxX + 12, sectionTopY + 16);

  let tipItemY = sectionTopY + 30;
  for (let t = 0; t < tips.length; t++) {
    // Saffron "—" dash
    doc.setFont('Inter700', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(255, 107, 53);
    doc.text('—', tipsBoxX + 12, tipItemY);

    // Tip text Inter400 9pt #6e6e73
    doc.setFont('Inter', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 115);
    const tipLines = doc.splitTextToSize(tips[t], tipsBoxWidth - 28);
    doc.text(tipLines.slice(0, 2), tipsBoxX + 24, tipItemY, { lineHeightFactor: 1.3 });

    tipItemY += Math.max(26, tipLines.length * 13 + 6);
  }


  // ==========================================
  // FOOTER ON EVERY PAGE: "Page X of Y"
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Hairline divider
    doc.setDrawColor(232, 232, 237);
    doc.setLineWidth(0.75);
    doc.line(MARGIN_LEFT, PAGE_HEIGHT - 36, CONTENT_RIGHT, PAGE_HEIGHT - 36);

    // Left: Generated by Safar — Har Safar. Perfectly Planned.
    doc.setFont('Inter', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(134, 134, 139);
    doc.text('Generated by Safar — Har Safar. Perfectly Planned.', MARGIN_LEFT, PAGE_HEIGHT - 22);

    // Right: Page X of Y
    doc.text(`Page ${p} of ${totalPages}`, CONTENT_RIGHT, PAGE_HEIGHT - 22, { align: 'right' });
  }

  // File naming: safar-{origin}-{destination}-{shareId}.pdf
  const shareIdSlug = plan.shareId ? plan.shareId.slice(0, 8) : 'plan';
  const filename = `safar-${slugifyCity(origin)}-${slugifyCity(destination)}-${shareIdSlug}.pdf`;

  return { doc, filename };
}

export function generateTripPdf(plan: PlanResponse): void {
  try {
    const { doc, filename } = buildTripPdfDoc(plan);
    doc.save(filename);
  } catch (err) {
    console.error('jsPDF generation failed, falling back to window.print():', err);
    window.print();
  }
}

export function generateTripPdfBase64(plan: PlanResponse): { base64: string; filename: string } | null {
  try {
    const { doc, filename } = buildTripPdfDoc(plan);
    const dataUri = doc.output('datauristring');
    const base64 = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;
    return { base64, filename };
  } catch (err) {
    console.warn('Failed to generate PDF base64:', err);
    return null;
  }
}

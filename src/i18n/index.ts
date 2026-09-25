import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const resources = {
  en: {
    translation: {
      nav: {
        planTrip: 'Plan Trip',
        savedTrips: 'Saved Trips',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        logOut: 'Log Out',
        deleteAccount: 'Delete Account',
        apiKey: 'Gemini API Key',
      },
      hero: {
        tag: 'Instant State-Wise Itineraries • Real Budgeting',
        headlineStart: 'Har Safar.',
        headlineEnd: 'Perfectly Planned.',
        subtitle:
          'Smart AI travel planner for India. Tell us your budget, origin, and crew — get kilometer-precise road timelines, train recommendations, day-by-day itineraries, and exact cost breakdowns.',
        ctaPlan: 'Plan Your Journey',
        ctaViewSaved: 'View Saved Trips',
      },
      plan: {
        title: 'Design your journey.',
        subtitle:
          'Fill out your travel parameters to get a state-wise itinerary and exact budget breakdown.',
        surprisePrompt: 'Confused where to go with this budget?',
        surpriseBtn: 'Ya phir… Surprise Me 🎲',
        step1: '1. What kind of trip is this?',
        step2: '2. Where are you travelling from and to?',
        step3: '3. Duration & Group Size',
        step4: '4. Luggage & Packing Style',
        step5: '5. Total Trip Budget (INR)',
        step6: '6. Preferred Transport Mode',
        submit: 'Generate my plan',
        originLabel: 'Origin City',
        destLabel: 'Destination City',
        daysLabel: 'Days',
        travellersLabel: 'Travellers',
      },
      result: {
        modify: 'Modify requirements',
        saveTrip: 'Save Trip',
        saved: 'Saved',
        regenerate: 'Regenerate',
        share: 'Share',
        downloadPdf: 'Download PDF',
        routeTimeline: 'Interstate Route Timeline',
        costBreakdown: 'Rupee-Precise Cost Breakdown',
        dayPlan: 'Day-by-Day Itinerary',
        weather: 'Mausam & Weather Forecast',
        checklist: 'Essential Travel Checklist',
        kharcha: 'Kharcha Tracker (Live Expenses)',
        proTips: 'Pro Local Travel Tips',
      },
    },
  },
  hi: {
    translation: {
      nav: {
        planTrip: 'यात्रा प्लान करें',
        savedTrips: 'सहेजी गई यात्राएं',
        signIn: 'लॉग इन',
        signUp: 'साइन अप',
        logOut: 'लॉग आउट',
        deleteAccount: 'खाता हटाएं',
        apiKey: 'जेमिनी API कुंजी',
      },
      hero: {
        tag: 'राज्य-वार सटीक रूटिंग • वास्तविक बजट हिसाब',
        headlineStart: 'हर सफ़र।',
        headlineEnd: 'Perfectly Planned.',
        subtitle:
          'अतुल्य भारत का पहला स्मार्ट AI यात्रा प्लानर। अपना बजट, प्रस्थान शहर और साथी बताएं — और पाएं किलोमीटर-सटीक रोड मैप, ट्रेन सलाह, दिन-प्रतिदिन का यात्रा कार्यक्रम और खर्च का पूरा विवरण।',
        ctaPlan: 'सफ़र शुरू करें',
        ctaViewSaved: 'सहेजी गई यात्राएं देखें',
      },
      plan: {
        title: 'अपनी यात्रा का विवरण दें',
        subtitle:
          'यात्रा के मुख्य पैरामीटर भरें और तुरंत विस्तृत दिन-वार प्लान और बजट ब्रेकडाउन प्राप्त करें।',
        surprisePrompt: 'समझ नहीं आ रहा कि इस बजट में कहाँ जाएं?',
        surpriseBtn: 'या फिर… Surprise Me 🎲',
        step1: '1. यह कैसी यात्रा है?',
        step2: '2. आप कहाँ से कहाँ जाना चाहते हैं?',
        step3: '3. यात्रा की अवधि और साथियों की संख्या',
        step4: '4. सामान और पैकिंग स्टाइल',
        step5: '5. कुल यात्रा बजट (₹ INR)',
        step6: '6. पसंदीदा आवागमन का साधन',
        submit: 'मेरा यात्रा प्लान बनाएं',
        originLabel: 'प्रस्थान शहर (Origin)',
        destLabel: 'गंतव्य शहर (Destination)',
        daysLabel: 'दिन',
        travellersLabel: 'यात्री संख्या',
      },
      result: {
        modify: 'विकल्प बदलें',
        saveTrip: 'यात्रा सहेजें',
        saved: 'सहेजा गया',
        regenerate: 'पुनः बनाएं',
        share: 'शेयर करें',
        downloadPdf: 'PDF डाउनलोड करें',
        routeTimeline: 'रूट टाइमलाइन',
        costBreakdown: 'सटीक बजट और खर्च विवरण',
        dayPlan: 'दिन-वार यात्रा कार्यक्रम',
        weather: 'मौसम और पूर्वानुमान',
        checklist: 'आवश्यक पैकिंग चेकलिस्ट',
        kharcha: 'खर्चा ट्रैकर (लाइव खर्च)',
        proTips: 'स्थानीय यात्रा सुझाव',
      },
    },
  },
};

const savedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('safar-lang') || 'en' : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

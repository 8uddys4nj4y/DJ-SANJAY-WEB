'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ta';

interface TranslationContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "Home": "Home",
    "Packages": "Packages",
    "Track": "Track",
    "Settings": "Settings",
    "Sign In": "Sign In",
    "THE BEAT STARTS": "THE BEAT STARTS",
    "RIGHT HERE.": "RIGHT HERE.",
    "DJ SANJAY: Premium Experience for Weddings and Corporate Events in Chennai.": "DJ SANJAY: Premium Experience for Weddings and Corporate Events in Chennai.",
    "BOOK DJ SHOW": "BOOK DJ SHOW",
    "VIEW PACKAGES": "VIEW PACKAGES",
    "Booked": "Booked",
    "Completed": "Completed",
    "Why DJ SANJAY": "Why DJ SANJAY",
    "Professionalism meets high-energy performance. With over a decade of experience, we specialize in seamless genre transitions.": "Professionalism meets high-energy performance. With over a decade of experience, we specialize in seamless genre transitions.",
    "Start Your Booking": "Start Your Booking",
    "Elite Sound": "Elite Sound",
    "High-end systems for crystal clear audio.": "High-end systems for crystal clear audio.",
    "Intelligent FX": "Intelligent FX",
    "Lighting synced to every beat transition.": "Lighting synced to every beat transition.",
    "Crowd Reading": "Crowd Reading",
    "Adapting genres to keep the dancefloor alive.": "Adapting genres to keep the dancefloor alive.",
    "100% Reliable": "100% Reliable",
    "No delays. Your event is our priority.": "No delays. Your event is our priority.",
    "Reviews": "Reviews",
    "Verified stories from the hottest dancefloors": "Verified stories from the hottest dancefloors",
    "Add Review": "Add Review",
    "Submit Review": "Submit Review",
    "Track Booking": "Track Booking",
    "Real-time status of your event": "Real-time status of your event",
    "Reference (e.g. NS-1234)": "Reference (e.g. NS-1234)",
    "SEARCH": "SEARCH",
    "Status": "Status",
    "Ref ID": "Ref ID",
    "Received": "Received",
    "Verified": "Verified",
    "Dispatched": "Dispatched",
    "Live": "Live",
    "No Records Found": "No Records Found",
    "History": "History",
    "Items": "Items",
    "Details": "Details",
    "Checkout": "Checkout",
    "Admin": "Admin",
    "Admin Dashboard": "Admin Dashboard",
    "Profile Picture": "Profile Picture",
    "Email": "Email",
    "Name": "Name",
    "Language": "Language",
    "Book DJ": "Book DJ",
    "Sign Out": "Sign Out",
    "Official Name": "Official Name",
    "Contact Number": "Contact Number",
    "Area / Address": "Area / Address",
    "Update Profile": "Update Profile",
    "Write a comment...": "Write a comment...",
    "Star Rating": "Star Rating",
    "Submit": "Submit",
    "Cancel": "Cancel",
    "Your Name": "Your Name"
  },
  ta: {
    "Home": "முகப்பு",
    "Packages": "பேக்கேஜ்கள்",
    "Track": "கண்காணிப்பு",
    "Settings": "அமைப்புகள்",
    "Sign In": "உள்நுழைக",
    "THE BEAT STARTS": "இசை தொடங்குகிறது",
    "RIGHT HERE.": "இங்கேயே.",
    "DJ SANJAY: Premium Experience for Weddings and Corporate Events in Chennai.": "டிஜே சஞ்சய்: சென்னையில் திருமணங்கள் மற்றும் கார்ப்பரேட் நிகழ்ச்சிகளுக்கான பிரீமியம் அனுபவம்.",
    "BOOK DJ SHOW": "டிஜே ஷோ புக் செய்க",
    "VIEW PACKAGES": "பேக்கேஜ்களைப் பார்க்க",
    "Booked": "புக் செய்யப்பட்டது",
    "Completed": "முடிந்தது",
    "Why DJ SANJAY": "ஏன் டிஜே சஞ்சய்",
    "Professionalism meets high-energy performance. With over a decade of experience, we specialize in seamless genre transitions.": "தொழில்முறை மற்றும் உயர் ஆற்றல் செயல்பாடு. ஒரு தசாப்தத்திற்கும் மேலான அனுபவத்துடன், தடையற்ற இசை மாற்றங்களில் நாங்கள் நிபுணத்துவம் பெற்றுள்ளோம்.",
    "Start Your Booking": "உங்கள் புக்கிங்கைத் தொடங்குக",
    "Elite Sound": "உயர்தர ஒலி",
    "High-end systems for crystal clear audio.": "தெளிவான ஆடியோவிற்கான உயர்தர அமைப்புகள்.",
    "Intelligent FX": "அறிவுசார்ந்த FX",
    "Lighting synced to every beat transition.": "ஒவ்வொரு பீட் மாற்றத்திற்கும் ஒத்திசைக்கப்பட்ட விளக்குகள்.",
    "Crowd Reading": "கூட்டத்தை கவர்தல்",
    "Adapting genres to keep the dancefloor alive.": "நடன தளத்தை கலகலப்பாக வைத்திருக்க இசையை மாற்றுதல்.",
    "100% Reliable": "100% நம்பகமானது",
    "No delays. Your event is our priority.": "தாமதங்கள் இல்லை. உங்கள் நிகழ்வே எங்கள் முன்னுரிமை.",
    "Reviews": "மதிப்புரைகள்",
    "Verified stories from the hottest dancefloors": "மிகச்சிறந்த நடன தளங்களில் இருந்து சரிபார்க்கப்பட்ட கதைகள்",
    "Add Review": "மதிப்புரை சேர்க்க",
    "Submit Review": "மதிப்புரை சமர்ப்பிக்கவும்",
    "Track Booking": "புக்கிங் விவரத்தைக் கண்காணிக்க",
    "Real-time status of your event": "உங்கள் நிகழ்வின் நிகழ்நேர நிலை",
    "Reference (e.g. NS-1234)": "குறிப்பு எண் (உதாரணம் NS-1234)",
    "SEARCH": "தேடுக",
    "Status": "நிலை",
    "Ref ID": "குறிப்பு ஐடி",
    "Received": "பெறப்பட்டது",
    "Verified": "சரிபார்க்கப்பட்டது",
    "Dispatched": "அனுப்பப்பட்டது",
    "Live": "நேரடி",
    "No Records Found": "பதிவுகள் எதுவும் இல்லை",
    "History": "வரலாறு",
    "Items": "பொருட்கள்",
    "Details": "விவரங்கள்",
    "Checkout": "செக்அவுட்",
    "Admin": "அட்மின்",
    "Admin Dashboard": "அட்மின் டேஷ்போர்டு",
    "Profile Picture": "சுயவிவரப் படம்",
    "Email": "மின்னஞ்சல்",
    "Name": "பெயர்",
    "Language": "மொழி",
    "Book DJ": "டிஜே புக் செய்க",
    "Sign Out": "வெளியேறுக",
    "Official Name": "அதிகாரப்பூர்வ பெயர்",
    "Contact Number": "தொடர்பு எண்",
    "Area / Address": "பகுதி / முகவரி",
    "Update Profile": "சுயவிவரத்தை புதுப்பி",
    "Write a comment...": "உங்கள் கருத்தை எழுதுங்கள்...",
    "Star Rating": "நட்சத்திர மதிப்பீடு",
    "Submit": "சமர்ப்பி",
    "Cancel": "ரத்துசெய்",
    "Your Name": "உங்கள் பெயர்"
  }
};

const TranslationContext = createContext<TranslationContextProps>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('dj_sanjay_lang') as Language;
    if (saved === 'en' || saved === 'ta') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dj_sanjay_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);

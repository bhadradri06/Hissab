import type { LanguageCode } from '../types';

type IndicScriptLang = Exclude<LanguageCode, 'en'>;

const CURATED_NAME_TOKENS: Record<string, Record<IndicScriptLang, string>> = {
  ravi: {
    hi: 'रवि', te: 'రవి', bn: 'রবি', mr: 'रवी', ta: 'ரவி', gu: 'રવિ',
    kn: 'ರವಿ', ml: 'രവി', pa: 'ਰਵੀ', or: 'ରବି', ur: 'روی',
  },
  kumar: {
    hi: 'कुमार', te: 'కుమార్', bn: 'কুমার', mr: 'कुमार', ta: 'குமார்', gu: 'કુમાર',
    kn: 'ಕುಮಾರ್', ml: 'കുമാർ', pa: 'ਕੁമാർ', or: 'କୁମାର', ur: 'کمار',
  },
  sunita: {
    hi: 'सुनीता', te: 'సునీత', bn: 'সুনীতা', mr: 'सुनीता', ta: 'சுனிதா', gu: 'સુનીતા',
    kn: 'ಸುನೀತಾ', ml: 'സുനിത', pa: 'ਸੁਨੀਤਾ', or: 'ସୁନୀତା', ur: 'سنیتا',
  },
  devi: {
    hi: 'देवी', te: 'దేవి', bn: 'দেবী', mr: 'देवी', ta: 'தேவி', gu: 'દેવી',
    kn: 'ದೇವಿ', ml: 'ദേവി', pa: 'ਦੇਵੀ', or: 'ଦେବୀ', ur: 'دیوی',
  },
  mohd: {
    hi: 'मोहद', te: 'మొహద్', bn: 'মহদ', mr: 'मोहद', ta: 'முகமது', gu: 'મોહદ',
    kn: 'ಮೊಹದ್', ml: 'മുഹമ്മദ്', pa: 'ਮੁਹੰਮਦ', or: 'ମହମ୍ମଦ', ur: 'محمد',
  },
  mohammed: {
    hi: 'मोहम्मद', te: 'మొహమ్మద్', bn: 'মহম্মদ', mr: 'मोहम्मद', ta: 'முகமது', gu: 'મોહમ્મદ',
    kn: 'ಮೊಹಮ್ಮದ್', ml: 'മുഹമ്മദ്', pa: 'ਮੁਹੰਮਦ', or: 'ମହମ୍ମଦ', ur: 'محمد',
  },
  mohammad: {
    hi: 'मोहम्मद', te: 'మొహమ్మద్', bn: 'মহম্মদ', mr: 'मोहम्मद', ta: 'முகமது', gu: 'મોહમ્મદ',
    kn: 'ಮೊಹಮ್ಮದ್', ml: 'മുഹമ്മദ്', pa: 'ਮੁਹੰਮਦ', or: 'ମହମ୍ମଦ', ur: 'محمد',
  },
  irfan: {
    hi: 'इरफ़ान', te: 'ఇర్ఫాన్', bn: 'ইরফান', mr: 'इरफान', ta: 'இர்பான்', gu: 'ઇરફાન',
    kn: 'ಇರ್ಫಾನ್', ml: 'ഇർഫാൻ', pa: 'ਇਰਫ਼ਾਨ', or: 'ଇରଫାନ', ur: 'عرفان',
  },
  anjali: {
    hi: 'अंजलि', te: 'అంజలి', bn: 'অঞ্জলি', mr: 'अंजली', ta: 'அஞ்சலி', gu: 'અંજલિ',
    kn: 'ಅಂಜಲಿ', ml: 'അഞ്ജലി', pa: 'ਅੰਜਲੀ', or: 'ଅଞ୍ଜଳି', ur: 'انجلی',
  },
  reddy: {
    hi: 'रेड्डी', te: 'రెడ్డి', bn: 'রেড্ডি', mr: 'रेड्डी', ta: 'ரெட்டி', gu: 'રેડ્ડી',
    kn: 'ರೆಡ್ಡಿ', ml: 'റെഡ്ഡി', pa: 'ਰੈੱਡੀ', or: 'ରେଡ୍ଡୀ', ur: 'ریڈی',
  },
  prakash: {
    hi: 'प्रकाश', te: 'ప్రకాష్', bn: 'প্রকাশ', mr: 'प्रकाश', ta: 'பிரகாஷ்', gu: 'પ્રકાશ',
    kn: 'ಪ್ರಕಾಶ್', ml: 'പ്രകാശ്', pa: 'ਪ੍ਰਕਾਸ਼', or: 'ପ୍ରକାଶ', ur: 'پرکاش',
  },
  rao: {
    hi: 'राव', te: 'రావు', bn: 'রাও', mr: 'राव', ta: 'ராவ்', gu: 'રાવ',
    kn: 'ರಾವ್', ml: 'റാവു', pa: 'ਰਾਓ', or: 'ରାଓ', ur: 'راؤ',
  },
  fatima: {
    hi: 'फ़ातिमा', te: 'ఫాతిమా', bn: 'ফাতিমা', mr: 'फातिमा', ta: 'பாத்திமா', gu: 'ફાતિમા',
    kn: 'ಫಾತಿಮಾ', ml: 'ഫാത്തിമ', pa: 'ਫ਼ਾਤਿਮਾ', or: 'ଫାତିମା', ur: 'فاطمہ',
  },
  begum: {
    hi: 'बेगम', te: 'బేగం', bn: 'বেগম', mr: 'बेगम', ta: 'பேகம்', gu: 'બેગમ',
    kn: 'ಬೇಗಂ', ml: 'ബീഗം', pa: 'ਬੇਗਮ', or: 'ବେଗମ', ur: 'بیگم',
  },
  venkat: {
    hi: 'वेंकट', te: 'వెంకట్', bn: 'ভেঙ্কট', mr: 'व्यंकट', ta: 'வெங்கட்', gu: 'વેંકટ',
    kn: 'ವೆಂಕಟ್', ml: 'വെങ്കട്ട്', pa: 'ਵੈਂਕਟ', or: 'ଭେଙ୍କଟ', ur: 'وینکٹ',
  },
  venkatesh: {
    hi: 'वेंकटेश', te: 'వెంకటేష్', bn: 'ভেঙ্কটেশ', mr: 'व्यंकटेश', ta: 'வெங்கடேஷ்', gu: 'વેંકટેશ',
    kn: 'ವೆಂಕಟೇಶ್', ml: 'വെങ്കിടേഷ്', pa: 'ਵੈਂਕਟੇਸ਼', or: 'ଭେଙ୍କଟେଶ', ur: 'وینکٹیش',
  },
  naidu: {
    hi: 'नायडू', te: 'నాయుడు', bn: 'নাইডু', mr: 'नायडू', ta: 'நாயுடு', gu: 'નાયડુ',
    kn: 'ನಾಯ್ಡು', ml: 'നായിഡു', pa: 'ਨਾਇਡੂ', or: 'ନାଇଡୁ', ur: 'نائیڈو',
  },
  kavitha: {
    hi: 'कविता', te: 'కవిత', bn: 'কবিতা', mr: 'कविता', ta: 'கவிதா', gu: 'કવિતા',
    kn: 'ಕವಿತಾ', ml: 'കവിത', pa: 'ਕਵਿਤਾ', or: 'କବିତା', ur: 'کویتا',
  },
  kavita: {
    hi: 'कविता', te: 'కవిత', bn: 'কবিতা', mr: 'कविता', ta: 'கவிதா', gu: 'કવિતા',
    kn: 'ಕವಿತಾ', ml: 'കവിത', pa: 'ਕਵਿਤਾ', or: 'କବିତା', ur: 'کویتا',
  },
  bhadra: {
    hi: 'भद्र', te: 'భద్ర', bn: 'ভদ্র', mr: 'भद्र', ta: 'பத்ரா', gu: 'ભદ્ર',
    kn: 'ಭದ್ರ', ml: 'ഭദ്ര', pa: 'ਭਦਰਾ', or: 'ଭଦ୍ର', ur: 'بھدرا',
  },
  lakshmi: {
    hi: 'लक्ष्मी', te: 'లక్ష్మి', bn: 'লক্ষ্মী', mr: 'लक्ष्मी', ta: 'லக்ஷ்மி', gu: 'લક્ષ્મી',
    kn: 'ಲಕ್ಷ್ಮಿ', ml: 'ലക്ഷ്മി', pa: 'ਲਕਸ਼ਮੀ', or: 'ଲକ୍ଷ୍ମୀ', ur: 'لکشمی',
  },
  priya: {
    hi: 'प्रिया', te: 'ప్రియ', bn: 'প্রিয়া', mr: 'प्रिया', ta: 'பிரியா', gu: 'પ્રિયા',
    kn: 'ಪ್ರಿಯಾ', ml: 'പ്രിയ', pa: 'ਪ੍ਰਿਆ', or: 'ପ୍ରିୟା', ur: 'پریا',
  },
  nair: {
    hi: 'नायर', te: 'నాయర్', bn: 'নায়ার', mr: 'नायर', ta: 'நாயர்', gu: 'નાયર',
    kn: 'ನಾಯರ್', ml: 'നായർ', pa: 'ਨਾਇਰ', or: 'ନାୟାର', ur: 'نائر',
  },
  ramesh: {
    hi: 'रमेश', te: 'రమేష్', bn: 'রমেশ', mr: 'रमेश', ta: 'ரமேஷ்', gu: 'રમેશ',
    kn: 'ರಮೇಶ್', ml: 'രമേശ്', pa: 'ਰਮੇਸ਼', or: 'ରମେଶ', ur: 'رمیش',
  },
  suresh: {
    hi: 'सुरेश', te: 'సురేష్', bn: 'সুরেশ', mr: 'सुरेश', ta: 'சுரேஷ்', gu: 'સੁਰેશ',
    kn: 'ಸುರೇಶ್', ml: 'സുരേഷ്', pa: 'ਸੁਰੇਸ਼', or: 'ସୁରେଶ', ur: 'سریش',
  },
  rajesh: {
    hi: 'राजेश', te: 'రాజేష్', bn: 'রাজেশ', mr: 'राजेश', ta: 'ராஜேஷ்', gu: 'રાજેશ',
    kn: 'ರಾಜೇಶ್', ml: 'രാജേഷ്', pa: 'ਰਾਜੇਸ਼', or: 'ରାଜେଶ', ur: 'راجیش',
  },
  patel: {
    hi: 'पटेल', te: 'పటేల్', bn: 'প্যাটেল', mr: 'पटेल', ta: 'படேல்', gu: 'પટેલ',
    kn: 'ಪಟೇಲ್', ml: 'പട്ടേൽ', pa: 'ਪਟੇਲ', or: 'ପଟେଲ', ur: 'پٹیل',
  },
  sharma: {
    hi: 'शर्मा', te: 'శర్మ', bn: 'শর্মা', mr: 'शर्मा', ta: 'சர்மா', gu: 'શર્મા',
    kn: 'ಶರ್ಮಾ', ml: 'ശർമ്മ', pa: 'ਸ਼ਰਮਾ', or: 'ଶର୍ମା', ur: 'شرما',
  },
  singh: {
    hi: 'सिंह', te: 'సింగ్', bn: 'সিং', mr: 'सिंग', ta: 'சிங்', gu: 'સિંહ',
    kn: 'ಸಿಂಗ್', ml: 'സിംഗ്', pa: 'ਸਿੰਘ', or: 'ସିଂହ', ur: 'سنگھ',
  },
  harishankar: {
    hi: 'हरिशंकर', te: 'హరిశంకర్', bn: 'হরিশঙ্কর', mr: 'हरिशंकर', ta: 'ஹரிசங்கர்', gu: 'હરિશંકર',
    kn: 'ಹರಿಶಂಕರ್', ml: 'ഹരിശങ്കർ', pa: 'ਹਰਿਸ਼ੰਕਰ', or: 'ହରିଶଙ୍କର', ur: 'ہری شنکر',
  },
  srinivas: {
    hi: 'श्रीनिवास', te: 'శ్రీనివాస్', bn: 'শ্রীনিবাস', mr: 'श्रीनिवास', ta: 'ஸ்ரீனிவாஸ்', gu: 'શ્રીનિવાસ',
    kn: 'ಶ್ರೀನಿವಾಸ್', ml: 'ശ്രീനിവാസ്', pa: 'ਸ਼੍ਰੀਨਿਵਾਸ', or: 'ଶ୍ରୀନିବାସ', ur: 'سری نواس',
  },
  krishna: {
    hi: 'कृष्णा', te: 'కృష్ణ', bn: 'কৃষ্ণ', mr: 'कृष्णा', ta: 'கிருஷ்ணா', gu: 'કૃષ્ણા',
    kn: 'ಕೃಷ್ಣ', ml: 'കൃഷ്ണ', pa: 'ਕ੍ਰਿਸ਼ਨਾ', or: 'କୃଷ୍ଣ', ur: 'کرشنا',
  },
};

type VowelKey = 'a' | 'aa' | 'i' | 'ii' | 'u' | 'uu' | 'e' | 'ee' | 'ai' | 'o' | 'oo' | 'au';
type ConsKey =
  | 'k' | 'kh' | 'g' | 'gh'
  | 'ch' | 'chh' | 'j' | 'jh'
  | 'tt' | 'tth' | 'dd' | 'ddh' | 'nn'
  | 't' | 'th' | 'd' | 'dh' | 'n'
  | 'p' | 'ph' | 'f' | 'b' | 'bh' | 'm'
  | 'y' | 'r' | 'l' | 'v' | 'sh' | 'ss' | 's' | 'h';

type BrahmicLang = Exclude<IndicScriptLang, 'ur'>;

interface ScriptTables {
  vowels: Record<VowelKey, string>;
  matras: Record<Exclude<VowelKey, 'a'>, string>;
  cons: Record<ConsKey, string>;
  virama: string;
  anusvara: string;
  trailingVirama: boolean;
}

const SCRIPT_TABLES: Record<BrahmicLang, ScriptTables> = {
  hi: {
    vowels: { a: 'अ', aa: 'आ', i: 'इ', ii: 'ई', u: 'उ', uu: 'ऊ', e: 'ए', ee: 'ए', ai: 'ऐ', o: 'ओ', oo: 'ओ', au: 'औ' },
    matras: { aa: 'ा', i: 'ि', ii: 'ी', u: 'ु', uu: 'ू', e: 'े', ee: 'े', ai: 'ै', o: 'ो', oo: 'ो', au: 'ौ' },
    cons: {
      k: 'क', kh: 'ख', g: 'ग', gh: 'घ', ch: 'च', chh: 'छ', j: 'ज', jh: 'झ',
      tt: 'ट', tth: 'ठ', dd: 'ड', ddh: 'ढ', nn: 'ण', t: 'त', th: 'थ', d: 'द', dh: 'ध', n: 'न',
      p: 'प', ph: 'फ', f: 'फ़', b: 'ब', bh: 'भ', m: 'म', y: 'य', r: 'र', l: 'ल', v: 'व',
      sh: 'श', ss: 'ष', s: 'स', h: 'ह',
    },
    virama: '्',
    anusvara: 'ं',
    trailingVirama: false,
  },
  mr: {
    vowels: { a: 'अ', aa: 'आ', i: 'इ', ii: 'ई', u: 'उ', uu: 'ऊ', e: 'ए', ee: 'ए', ai: 'ऐ', o: 'ओ', oo: 'ओ', au: 'औ' },
    matras: { aa: 'ा', i: 'ि', ii: 'ी', u: 'ु', uu: 'ू', e: 'े', ee: 'े', ai: 'ै', o: 'ो', oo: 'ो', au: 'ौ' },
    cons: {
      k: 'क', kh: 'ख', g: 'ग', gh: 'घ', ch: 'च', chh: 'छ', j: 'ज', jh: 'झ',
      tt: 'ट', tth: 'ठ', dd: 'ड', ddh: 'ढ', nn: 'ण', t: 'त', th: 'थ', d: 'द', dh: 'ध', n: 'न',
      p: 'प', ph: 'फ', f: 'फ', b: 'ब', bh: 'भ', m: 'म', y: 'य', r: 'र', l: 'ल', v: 'व',
      sh: 'श', ss: 'ष', s: 'स', h: 'ह',
    },
    virama: '्',
    anusvara: 'ं',
    trailingVirama: false,
  },
  te: {
    vowels: { a: 'అ', aa: 'ఆ', i: 'ఇ', ii: 'ఈ', u: 'ఉ', uu: 'ఊ', e: 'ఎ', ee: 'ఏ', ai: 'ఐ', o: 'ఒ', oo: 'ఓ', au: 'ఔ' },
    matras: { aa: 'ా', i: 'ి', ii: 'ీ', u: 'ు', uu: 'ూ', e: 'ె', ee: 'ే', ai: 'ై', o: 'ొ', oo: 'ో', au: 'ౌ' },
    cons: {
      k: 'క', kh: 'ఖ', g: 'గ', gh: 'ఘ', ch: 'చ', chh: 'ఛ', j: 'జ', jh: 'ఝ',
      tt: 'ట', tth: 'ఠ', dd: 'డ', ddh: 'ఢ', nn: 'ణ', t: 'త', th: 'థ', d: 'ద', dh: 'ధ', n: 'న',
      p: 'ప', ph: 'ఫ', f: 'ఫ', b: 'బ', bh: 'భ', m: 'మ', y: 'య', r: 'ర', l: 'ల', v: 'వ',
      sh: 'శ', ss: 'ష', s: 'స', h: 'హ',
    },
    virama: '్',
    anusvara: 'ం',
    trailingVirama: true,
  },
  kn: {
    vowels: { a: 'ಅ', aa: 'ಆ', i: 'ಇ', ii: 'ಈ', u: 'ಉ', uu: 'ಊ', e: 'ಎ', ee: 'ಏ', ai: 'ಐ', o: 'ಒ', oo: 'ಓ', au: 'ಔ' },
    matras: { aa: 'ಾ', i: 'ಿ', ii: 'ೀ', u: 'ು', uu: 'ೂ', e: 'ೆ', ee: 'ೇ', ai: 'ೈ', o: 'ೊ', oo: 'ೋ', au: 'ೌ' },
    cons: {
      k: 'ಕ', kh: 'ಖ', g: 'ಗ', gh: 'ಘ', ch: 'ಚ', chh: 'ಛ', j: 'ಜ', jh: 'ಝ',
      tt: 'ಟ', tth: 'ಠ', dd: 'ಡ', ddh: 'ಢ', nn: 'ಣ', t: 'ತ', th: 'ಥ', d: 'ದ', dh: 'ಧ', n: 'ನ',
      p: 'ಪ', ph: 'ಫ', f: 'ಫ', b: 'ಬ', bh: 'ಭ', m: 'ಮ', y: 'ಯ', r: 'ರ', l: 'ಲ', v: 'ವ',
      sh: 'ಶ', ss: 'ಷ', s: 'ಸ', h: 'ಹ',
    },
    virama: '್',
    anusvara: 'ಂ',
    trailingVirama: true,
  },
  ml: {
    vowels: { a: 'അ', aa: 'ആ', i: 'ഇ', ii: 'ഈ', u: 'ഉ', uu: 'ഊ', e: 'എ', ee: 'ഏ', ai: 'ഐ', o: 'ഒ', oo: 'ഓ', au: 'ഔ' },
    matras: { aa: 'ാ', i: 'ി', ii: 'ീ', u: 'ു', uu: 'ൂ', e: 'െ', ee: 'േ', ai: 'ൈ', o: 'ൊ', oo: 'ോ', au: 'ൗ' },
    cons: {
      k: 'ക', kh: 'ഖ', g: 'ഗ', gh: 'ഘ', ch: 'ച', chh: 'ഛ', j: 'ജ', jh: 'ഝ',
      tt: 'ട', tth: 'ഠ', dd: 'ഡ', ddh: 'ഢ', nn: 'ണ', t: 'ത', th: 'ഥ', d: 'ദ', dh: 'ധ', n: 'ന',
      p: 'പ', ph: 'ഫ', f: 'ഫ', b: 'ബ', bh: 'ഭ', m: 'മ', y: 'യ', r: 'ര', l: 'ല', v: 'വ',
      sh: 'ശ', ss: 'ഷ', s: 'സ', h: 'ഹ',
    },
    virama: '്',
    anusvara: 'ം',
    trailingVirama: true,
  },
  ta: {
    vowels: { a: 'அ', aa: 'ஆ', i: 'இ', ii: 'ஈ', u: 'உ', uu: 'ஊ', e: 'எ', ee: 'ஏ', ai: 'ஐ', o: 'ஒ', oo: 'ஓ', au: 'ஔ' },
    matras: { aa: 'ா', i: 'ி', ii: 'ீ', u: 'ு', uu: 'ூ', e: 'ெ', ee: 'ே', ai: 'ை', o: 'ொ', oo: 'ோ', au: 'ௌ' },
    cons: {
      k: 'க', kh: 'க', g: 'க', gh: 'க', ch: 'ச', chh: 'ச', j: 'ஜ', jh: 'ஜ',
      tt: 'ட', tth: 'ட', dd: 'ட', ddh: 'ட', nn: 'ண', t: 'த', th: 'த', d: 'த', dh: 'த', n: 'ந',
      p: 'ப', ph: 'ப', f: 'ப', b: 'ப', bh: 'ப', m: 'ம', y: 'ய', r: 'ர', l: 'ல', v: 'வ',
      sh: 'ஷ', ss: 'ஷ', s: 'ச', h: 'ஹ',
    },
    virama: '்',
    anusvara: 'ம்',
    trailingVirama: true,
  },
  bn: {
    vowels: { a: 'অ', aa: 'আ', i: 'ই', ii: 'ঈ', u: 'উ', uu: 'ঊ', e: 'এ', ee: 'এ', ai: 'ঐ', o: 'ও', oo: 'ও', au: 'ঔ' },
    matras: { aa: 'া', i: 'ি', ii: 'ী', u: 'ু', uu: 'ূ', e: 'ে', ee: 'ে', ai: 'ৈ', o: 'ো', oo: 'ো', au: 'ৌ' },
    cons: {
      k: 'ক', kh: 'খ', g: 'গ', gh: 'ঘ', ch: 'চ', chh: 'ছ', j: 'জ', jh: 'ঝ',
      tt: 'ট', tth: 'ঠ', dd: 'ড', ddh: 'ঢ', nn: 'ণ', t: 'ত', th: 'থ', d: 'দ', dh: 'ধ', n: 'ন',
      p: 'প', ph: 'ফ', f: 'ফ', b: 'ব', bh: 'ভ', m: 'ম', y: 'য', r: 'র', l: 'ল', v: 'ভ',
      sh: 'শ', ss: 'ষ', s: 'স', h: 'হ',
    },
    virama: '্',
    anusvara: 'ং',
    trailingVirama: false,
  },
  gu: {
    vowels: { a: 'અ', aa: 'આ', i: 'ઇ', ii: 'ઈ', u: 'ઉ', uu: 'ઊ', e: 'એ', ee: 'એ', ai: 'ઐ', o: 'ઓ', oo: 'ઓ', au: 'ઔ' },
    matras: { aa: 'ા', i: 'િ', ii: 'ી', u: 'ુ', uu: 'ૂ', e: 'ે', ee: 'ે', ai: 'ૈ', o: 'ો', oo: 'ો', au: 'ૌ' },
    cons: {
      k: 'ક', kh: 'ખ', g: 'ગ', gh: 'ઘ', ch: 'ચ', chh: 'છ', j: 'જ', jh: 'ઝ',
      tt: 'ટ', tth: 'ઠ', dd: 'ડ', ddh: 'ઢ', nn: 'ણ', t: 'ત', th: 'થ', d: 'દ', dh: 'ધ', n: 'ન',
      p: 'પ', ph: 'ફ', f: 'ફ', b: 'બ', bh: 'ભ', m: 'મ', y: 'ય', r: 'ર', l: 'લ', v: 'વ',
      sh: 'શ', ss: 'ષ', s: 'સ', h: 'હ',
    },
    virama: '્',
    anusvara: 'ં',
    trailingVirama: false,
  },
  pa: {
    vowels: { a: 'ਅ', aa: 'ਆ', i: 'ਇ', ii: 'ਈ', u: 'ਉ', uu: 'ਊ', e: 'ਏ', ee: 'ਏ', ai: 'ਐ', o: 'ਓ', oo: 'ਓ', au: 'ਔ' },
    matras: { aa: 'ਾ', i: 'ਿ', ii: 'ੀ', u: 'ੁ', uu: 'ੂ', e: 'ੇ', ee: 'ੇ', ai: 'ੈ', o: 'ੋ', oo: 'ੋ', au: 'ੌ' },
    cons: {
      k: 'ਕ', kh: 'ਖ', g: 'ਗ', gh: 'ਘ', ch: 'ਚ', chh: 'ਛ', j: 'ਜ', jh: 'ਝ',
      tt: 'ਟ', tth: 'ਠ', dd: 'ਡ', ddh: 'ਢ', nn: 'ਣ', t: 'ਤ', th: 'ਥ', d: 'ਦ', dh: 'ਧ', n: 'ਨ',
      p: 'ਪ', ph: 'ਫ', f: 'ਫ਼', b: 'ਬ', bh: 'ਭ', m: 'ਮ', y: 'ਯ', r: 'ਰ', l: 'ਲ', v: 'ਵ',
      sh: 'ਸ਼', ss: 'ਸ਼', s: 'ਸ', h: 'ਹ',
    },
    virama: '੍',
    anusvara: 'ੰ',
    trailingVirama: false,
  },
  or: {
    vowels: { a: 'ଅ', aa: 'ଆ', i: 'ଇ', ii: 'ଈ', u: 'ଉ', uu: 'ଊ', e: 'ଏ', ee: 'ଏ', ai: 'ଐ', o: 'ଓ', oo: 'ଓ', au: 'ଔ' },
    matras: { aa: 'ା', i: 'ି', ii: 'ୀ', u: 'ୁ', uu: 'ୂ', e: 'େ', ee: 'େ', ai: 'ୈ', o: 'ୋ', oo: 'ୋ', au: 'ୌ' },
    cons: {
      k: 'କ', kh: 'ଖ', g: 'ଗ', gh: 'ଘ', ch: 'ଚ', chh: 'ଛ', j: 'ଜ', jh: 'ଝ',
      tt: 'ଟ', tth: 'ଠ', dd: 'ଡ', ddh: 'ଢ', nn: 'ଣ', t: 'ତ', th: 'ଥ', d: 'ଦ', dh: 'ଧ', n: 'ନ',
      p: 'ପ', ph: 'ଫ', f: 'ଫ', b: 'ବ', bh: 'ଭ', m: 'ମ', y: 'ୟ', r: 'ର', l: 'ଲ', v: 'ଭ',
      sh: 'ଶ', ss: 'ଷ', s: 'ସ', h: 'ହ',
    },
    virama: '୍',
    anusvara: 'ଂ',
    trailingVirama: false,
  },
};

type Token =
  | { kind: 'v'; key: VowelKey }
  | { kind: 'c'; key: ConsKey };

const VOWEL_RULES: Array<[string, VowelKey]> = [
  ['aa', 'aa'],
  ['ee', 'ii'],
  ['ii', 'ii'],
  ['oo', 'uu'],
  ['uu', 'uu'],
  ['ai', 'ai'],
  ['ay', 'ai'],
  ['au', 'au'],
  ['ou', 'au'],
  ['a', 'a'],
  ['e', 'e'],
  ['i', 'i'],
  ['o', 'o'],
  ['u', 'u'],
];

const CONS_RULES: Array<[string, ConsKey]> = [
  ['chh', 'chh'],
  ['kh', 'kh'],
  ['gh', 'gh'],
  ['ch', 'ch'],
  ['jh', 'jh'],
  ['th', 'th'],
  ['dh', 'dh'],
  ['ph', 'ph'],
  ['bh', 'bh'],
  ['sh', 'sh'],
  ['k', 'k'],
  ['c', 'k'],
  ['g', 'g'],
  ['j', 'j'],
  ['t', 't'],
  ['d', 'd'],
  ['n', 'n'],
  ['p', 'p'],
  ['f', 'f'],
  ['b', 'b'],
  ['m', 'm'],
  ['y', 'y'],
  ['r', 'r'],
  ['l', 'l'],
  ['v', 'v'],
  ['w', 'v'],
  ['s', 's'],
  ['h', 'h'],
  ['z', 'j'],
  ['q', 'k'],
];

function tokenizeWord(rawWord: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const word = rawWord.toLowerCase();

  while (i < word.length) {
    const rest = word.slice(i);

    if (rest.startsWith('ksh')) {
      tokens.push({ kind: 'c', key: 'k' }, { kind: 'c', key: 'ss' });
      i += 3;
      continue;
    }
    if (rest.startsWith('x')) {
      tokens.push({ kind: 'c', key: 'k' }, { kind: 'c', key: 's' });
      i += 1;
      continue;
    }

    let matched = false;
    for (const [pat, key] of VOWEL_RULES) {
      if (rest.startsWith(pat)) {
        // Avoid treating 'ay' at start/before vowel as 'ai', e.g. 'ayush'
        if (pat === 'ay' && rest.length > 2 && /[aeiou]/.test(rest[2])) {
          continue;
        }
        tokens.push({ kind: 'v', key });
        i += pat.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    for (const [pat, key] of CONS_RULES) {
      if (rest.startsWith(pat)) {
        tokens.push({ kind: 'c', key });
        i += pat.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    i += 1;
  }

  return tokens;
}

function renderBrahmic(word: string, lang: BrahmicLang): string {
  const table = SCRIPT_TABLES[lang];
  const tokens = tokenizeWord(word);
  if (tokens.length === 0) return '';

  let out = '';
  let idx = 0;

  while (idx < tokens.length) {
    const tok = tokens[idx];
    if (tok.kind === 'v') {
      out += table.vowels[tok.key];
      idx += 1;
      continue;
    }

    // Consonant
    const next = tokens[idx + 1];
    const next2 = tokens[idx + 2];

    // Nasal before stop/affricate/sibilant -> anusvara when preceded by vowel
    if (
      (tok.key === 'n' || tok.key === 'm') &&
      idx > 0 &&
      tokens[idx - 1].kind === 'v' &&
      next?.kind === 'c' &&
      next.key !== tok.key &&
      next.key !== 'y' &&
      next.key !== 'r' &&
      next.key !== 'l' &&
      next.key !== 'v' &&
      next.key !== 'h'
    ) {
      out += table.anusvara;
      idx += 1;
      continue;
    }

    const glyph = table.cons[tok.key];
    if (!next) {
      out += table.trailingVirama && tokens.length > 1 ? glyph + table.virama : glyph;
      idx += 1;
    } else if (next.kind === 'v') {
      if (next.key === 'a') {
        // Check if terminal 'a' in names like Sunita / Anitha -> 'आ' matra for feminine / open ending if preceded by consonant+vowel
        if (idx + 1 === tokens.length - 1 && tokens.length >= 4 && tok.key !== 'r') {
          out += glyph + (lang === 'te' || lang === 'kn' || lang === 'ml' ? '' : table.matras.aa);
        } else {
          out += glyph;
        }
      } else {
        out += glyph + table.matras[next.key];
      }
      idx += 2;
    } else {
      // Consonant cluster
      if (next.key === tok.key && !next2) {
        out += glyph + table.virama + table.cons[next.key];
        idx += 2;
      } else {
        out += glyph + table.virama;
        idx += 1;
      }
    }
  }

  return out;
}

const URDU_CONS: Record<ConsKey, string> = {
  k: 'ک', kh: 'کھ', g: 'گ', gh: 'گھ', ch: 'چ', chh: 'چھ', j: 'ج', jh: 'جھ',
  tt: 'ٹ', tth: 'ٹھ', dd: 'ڈ', ddh: 'ڈھ', nn: 'ن', t: 'ت', th: 'تھ', d: 'د', dh: 'دھ', n: 'ن',
  p: 'پ', ph: 'پھ', f: 'ف', b: 'ب', bh: 'بھ', m: 'م', y: 'ی', r: 'ر', l: 'ل', v: 'و',
  sh: 'ش', ss: 'ش', s: 'س', h: 'ہ',
};

function renderUrdu(word: string): string {
  const tokens = tokenizeWord(word);
  if (tokens.length === 0) return '';

  let out = '';
  for (let i = 0; i < tokens.length; i += 1) {
    const tok = tokens[i];
    const isLast = i === tokens.length - 1;
    if (tok.kind === 'v') {
      if (i === 0) {
        if (tok.key === 'aa') out += 'آ';
        else if (tok.key === 'i' || tok.key === 'ii' || tok.key === 'e' || tok.key === 'ee') out += 'ای';
        else if (tok.key === 'u' || tok.key === 'uu' || tok.key === 'o' || tok.key === 'oo') out += 'او';
        else out += 'ا';
      } else if (tok.key === 'aa' || (isLast && tok.key === 'a')) {
        out += 'ا';
      } else if (tok.key === 'i' || tok.key === 'ii') {
        out += 'ی';
      } else if (tok.key === 'e' || tok.key === 'ee' || tok.key === 'ai') {
        out += isLast ? 'ے' : 'ی';
      } else if (tok.key === 'u' || tok.key === 'uu' || tok.key === 'o' || tok.key === 'oo' || tok.key === 'au') {
        out += 'و';
      }
    } else {
      // Skip duplicate consonant in Urdu unless separated by vowel
      const prev = tokens[i - 1];
      if (prev?.kind === 'c' && prev.key === tok.key) continue;
      out += URDU_CONS[tok.key];
    }
  }
  return out;
}

const SINGLE_LETTER_NAMES: Record<string, Record<IndicScriptLang, string>> = {
  a: { hi: 'ए', te: 'ఏ', bn: 'এ', mr: 'ए', ta: 'ஏ', gu: 'એ', kn: 'ಎ', ml: 'എ', pa: 'ਏ', or: 'ଏ', ur: 'اے' },
  b: { hi: 'बी', te: 'బి', bn: 'বি', mr: 'बी', ta: 'பி', gu: 'બી', kn: 'ಬಿ', ml: 'ബി', pa: 'ਬੀ', or: 'ବି', ur: 'بی' },
  c: { hi: 'सी', te: 'సి', bn: 'সি', mr: 'सी', ta: 'சி', gu: 'સી', kn: 'ಸಿ', ml: 'സി', pa: 'ਸੀ', or: 'ସି', ur: 'سی' },
  d: { hi: 'डी', te: 'డి', bn: 'ডি', mr: 'डी', ta: 'டி', gu: 'ડી', kn: 'ಡಿ', ml: 'ഡി', pa: 'ਡੀ', or: 'ଡି', ur: 'ڈی' },
  e: { hi: 'ई', te: 'ఇ', bn: 'ই', mr: 'ई', ta: 'இ', gu: 'ઈ', kn: 'ಇ', ml: 'ഇ', pa: 'ਈ', or: 'ଇ', ur: 'ای' },
  f: { hi: 'एफ', te: 'ఎఫ్', bn: 'এফ', mr: 'एफ', ta: 'எஃப்', gu: 'એફ', kn: 'ಎಫ್', ml: 'എഫ്', pa: 'ਐਫ਼', or: 'ଏଫ୍', ur: 'ایف' },
  g: { hi: 'जी', te: 'జి', bn: 'জি', mr: 'जी', ta: 'ஜி', gu: 'જી', kn: 'ಜಿ', ml: 'ജി', pa: 'ਜੀ', or: 'ଜି', ur: 'جی' },
  h: { hi: 'एच', te: 'హెచ్', bn: 'এইচ', mr: 'एच', ta: 'எச்', gu: 'એચ', kn: 'ಎಚ್', ml: 'എച്ച്', pa: 'ਐਚ', or: 'ଏଚ୍', ur: 'ایچ' },
  i: { hi: 'आई', te: 'ఐ', bn: 'আই', mr: 'आय', ta: 'ஐ', gu: 'આઈ', kn: 'ಐ', ml: 'ഐ', pa: 'ਆਈ', or: 'ଆଇ', ur: 'آئی' },
  j: { hi: 'जे', te: 'జె', bn: 'জে', mr: 'जे', ta: 'ஜே', gu: 'જે', kn: 'ಜೆ', ml: 'ജെ', pa: 'ਜੇ', or: 'ଜେ', ur: 'جے' },
  k: { hi: 'के', te: 'కె', bn: 'কে', mr: 'के', ta: 'கே', gu: 'કે', kn: 'ಕೆ', ml: 'കെ', pa: 'ਕੇ', or: 'କେ', ur: 'کے' },
  l: { hi: 'एल', te: 'ఎల్', bn: 'এল', mr: 'एल', ta: 'எல்', gu: 'એલ', kn: 'ಎಲ್', ml: 'എൽ', pa: 'ਐਲ', or: 'ଏଲ୍', ur: 'ایل' },
  m: { hi: 'एम', te: 'ఎం', bn: 'এম', mr: 'एम', ta: 'எம்', gu: 'એમ', kn: 'ಎಮ್', ml: 'എം', pa: 'ਐਮ', or: 'ଏମ୍', ur: 'ایم' },
  n: { hi: 'एन', te: 'ఎన్', bn: 'এন', mr: 'एन', ta: 'என்', gu: 'એન', kn: 'ಎನ್', ml: 'എൻ', pa: 'ਐਨ', or: 'ଏନ୍', ur: 'این' },
  o: { hi: 'ओ', te: 'ఓ', bn: 'ও', mr: 'ओ', ta: 'ஓ', gu: 'ઓ', kn: 'ಓ', ml: 'ഓ', pa: 'ਓ', or: 'ଓ', ur: 'او' },
  p: { hi: 'पी', te: 'పి', bn: 'পি', mr: 'पी', ta: 'பி', gu: 'પી', kn: 'ಪಿ', ml: 'പി', pa: 'ਪੀ', or: 'ପି', ur: 'پی' },
  q: { hi: 'क्यू', te: 'క్యూ', bn: 'কিউ', mr: 'क्यू', ta: 'க்யூ', gu: 'ક્યુ', kn: 'ಕ್ಯೂ', ml: 'ക്യൂ', pa: 'ਕਿਊ', or: 'କ୍ୟୁ', ur: 'کیو' },
  r: { hi: 'आर', te: 'ఆర్', bn: 'আর', mr: 'आर', ta: 'ஆர்', gu: 'આર', kn: 'ಆರ್', ml: 'ആർ', pa: 'ਆਰ', or: 'ଆର୍', ur: 'آر' },
  s: { hi: 'एस', te: 'ఎస్', bn: 'এস', mr: 'एस', ta: 'எஸ்', gu: 'એસ', kn: 'ಎಸ್', ml: 'എസ്', pa: 'ਐਸ', or: 'ଏସ୍', ur: 'ایس' },
  t: { hi: 'टी', te: 'టి', bn: 'টি', mr: 'टी', ta: 'டி', gu: 'ટી', kn: 'ಟಿ', ml: 'ടി', pa: 'ਟੀ', or: 'ଟି', ur: 'ٹی' },
  u: { hi: 'यू', te: 'యు', bn: 'ইউ', mr: 'यू', ta: 'யூ', gu: 'યુ', kn: 'ಯು', ml: 'യു', pa: 'ਯੂ', or: 'ୟୁ', ur: 'یو' },
  v: { hi: 'वी', te: 'వి', bn: 'ভি', mr: 'व्ही', ta: 'வி', gu: 'વી', kn: 'ವಿ', ml: 'വി', pa: 'ਵੀ', or: 'ଭି', ur: 'وی' },
  w: { hi: 'डब्ल्यू', te: 'డబ్ల్యూ', bn: 'ডব্লিউ', mr: 'डब्ल्यू', ta: 'டபிள்யூ', gu: 'ડબલ્યુ', kn: 'ಡಬ್ಲ್ಯೂ', ml: 'ഡബ്ല്യു', pa: 'ਡਬਲਿਊ', or: 'ଡବ୍ଲ୍ୟୁ', ur: 'ڈبلیو' },
  x: { hi: 'एक्स', te: 'ఎక్స్', bn: 'এক্স', mr: 'एक्स', ta: 'எக்ஸ்', gu: 'એક્સ', kn: 'ಎಕ್ಸ್', ml: 'എക്സ്', pa: 'ਐਕਸ', or: 'ଏକ୍ସ', ur: 'ایکس' },
  y: { hi: 'वाई', te: 'వై', bn: 'ওয়াই', mr: 'वाय', ta: 'ஒய்', gu: 'વાય', kn: 'ವೈ', ml: 'വൈ', pa: 'ਵਾਈ', or: 'ୱାଇ', ur: 'وائی' },
  z: { hi: 'ज़ेड', te: 'జెడ్', bn: 'জেড', mr: 'झेड', ta: 'ஜெட்', gu: 'ઝેડ', kn: 'ಝೆಡ್', ml: 'സെഡ്', pa: 'ਜ਼ੈੱਡ', or: 'ଜେଡ୍', ur: 'زیڈ' },
};

function transliterateWord(word: string, lang: IndicScriptLang): string {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return word;

  if (clean.length === 1 && SINGLE_LETTER_NAMES[clean]) {
    return SINGLE_LETTER_NAMES[clean][lang];
  }

  const curated = CURATED_NAME_TOKENS[clean];
  if (curated) {
    return curated[lang];
  }

  if (lang === 'ur') {
    return renderUrdu(clean) || word;
  }

  return renderBrahmic(clean, lang) || word;
}

/**
 * Returns the transliterated customer name in the selected Indian language
 * when the app language is not English and the source name uses Latin letters.
 * Returns null when language is 'en' or no transliteration is applicable.
 */
export function getLocalizedCustomerName(
  englishName: string,
  language: LanguageCode
): string | null {
  if (language === 'en') return null;
  const trimmed = englishName.trim();
  if (!trimmed || !/[A-Za-z]/.test(trimmed)) return null;

  const parts = trimmed.split(/(\s+)/);
  const translated = parts
    .map((part) => {
      if (/^\s+$/.test(part)) return ' ';
      return transliterateWord(part, language);
    })
    .join('')
    .trim();

  if (!translated || translated === trimmed) return null;
  return translated;
}

/**
 * Returns "Name (LocalizedName)" for plain-text places like <option> elements.
 */
export function formatBilingualCustomerName(
  englishName: string,
  language: LanguageCode
): string {
  const localized = getLocalizedCustomerName(englishName, language);
  return localized ? `${englishName} (${localized})` : englishName;
}

import type { Character, CategoryId, Localized, Plan, Topic, Venue } from "./types";

// Seed catalogue. In production this lives in the database and is edited in the admin console;
// the same records seed a fresh database (see src/db/seed.ts).

export const CATEGORIES: Record<CategoryId, Localized> = {
  cafe: { en: "Cafés", ar: "قهاوي وكافيهات" },
  lounge: { en: "Restaurants & lounges", ar: "مطاعم ولاونجات" },
  landmark: { en: "Landmarks", ar: "أماكن سياحية" },
  pro: { en: "Professional", ar: "شغل وبيزنس" },
  learn: { en: "Learning", ar: "تعليم" },
  culture: { en: "Culture & community", ar: "ثقافة ومجتمع" },
  studio: { en: "Creative studios", ar: "استوديوهات إبداع" },
};

export const CHARACTERS: Character[] = [
  {
    id: "layla",
    name: { en: "Layla", ar: "ليلى" },
    role: { en: "Historian & cultural guide", ar: "مؤرخة ومرشدة ثقافية" },
    bio: {
      en: "Tells history as stories. Loves Fatimid Cairo, the Silk Road and the people history forgets.",
      ar: "بتحكي التاريخ كأنه حواديت. بتحب القاهرة الفاطمية وطريق الحرير والناس اللي التاريخ نسيهم.",
    },
    expertise: { en: "Egyptian & Islamic history, landmarks, traditions", ar: "تاريخ مصر والتاريخ الإسلامي، الآثار، العادات" },
    boundaries: {
      en: "Not a licensed tour guide. Marks uncertain dates and contested accounts.",
      ar: "مش مرشدة سياحية مرخصة. بتقول لما تكون مش متأكدة من تاريخ أو رواية.",
    },
    style: "warm, story-led, asks what the user already knows, flags contested history and gives more than one view",
    greeting: {
      en: "Hi {name}! I'm Layla, an AI history guide, so not a real person. Want the story of this place, or something else on your mind?",
      ar: "أهلاً يا {name}! أنا ليلى، مرشدة تاريخ بالذكاء الاصطناعي، يعني مش شخص حقيقي. تحب أحكيلك حكاية المكان ده ولا في دماغك حاجة تانية؟",
    },
    premium: false,
    look: { skin: 1, hair: 0, hairColor: 0, shirt: 0 },
    voice: { pitch: 1.1, rate: 0.98 },
  },
  {
    id: "hassan",
    name: { en: "Hassan", ar: "حسن" },
    role: { en: "Business mentor", ar: "مرشد في البيزنس" },
    bio: {
      en: "Direct, practical, a little impatient with buzzwords. Helps you test an idea before you spend money on it.",
      ar: "دغري وعملي، ومش بيحب الكلام الكبير. بيساعدك تختبر فكرتك قبل ما تصرف عليها.",
    },
    expertise: { en: "Startups, negotiation, management, careers", ar: "الشركات الناشئة، التفاوض، الإدارة، الشغل" },
    boundaries: {
      en: "Not a licensed financial adviser. Refers investment and legal questions to professionals.",
      ar: "مش مستشار مالي مرخص. أسئلة الاستثمار والقانون بيحوّلها لمتخصص.",
    },
    style: "direct, practical, challenges assumptions respectfully, asks for numbers",
    greeting: {
      en: "Hey {name}, Hassan here. I'm an AI mentor, not a real person. What are you building, and what's the hardest part right now?",
      ar: "إزيك يا {name}، معاك حسن. أنا مرشد ذكاء اصطناعي، مش شخص حقيقي. بتعمل إيه، وإيه أصعب حاجة قدامك دلوقتي؟",
    },
    premium: false,
    look: { skin: 3, hair: 2, hairColor: 1, shirt: 1 },
    voice: { pitch: 0.85, rate: 1 },
  },
  {
    id: "mariam",
    name: { en: "Mariam", ar: "مريم" },
    role: { en: "Language partner", ar: "شريكة لغة" },
    bio: {
      en: "Patient and upbeat. Speaks slowly when you need it and corrects you gently, once, then moves on.",
      ar: "صبورة ومتفائلة. بتتكلم بالراحة لو محتاج، وبتصححلك مرة واحدة بلطف وتكمّل.",
    },
    expertise: { en: "English and Arabic conversation practice", ar: "تمرين محادثة إنجليزي وعربي" },
    boundaries: { en: "Practice partner, not a certified teacher.", ar: "شريكة تمرين، مش مدرسة معتمدة." },
    style: "patient, encouraging, gives one gentle correction per turn, asks simple follow-up questions",
    greeting: {
      en: "Hi {name}! I'm Mariam, an AI conversation partner. Shall we practise English, Arabic, or a bit of both?",
      ar: "أهلاً يا {name}! أنا مريم، شريكة محادثة بالذكاء الاصطناعي. نتمرن إنجليزي ولا عربي ولا شوية من ده وشوية من ده؟",
    },
    premium: false,
    look: { skin: 0, hair: 3, hairColor: 2, shirt: 2 },
    voice: { pitch: 1.15, rate: 0.92 },
  },
  {
    id: "karim",
    name: { en: "Karim", ar: "كريم" },
    role: { en: "Automotive engineer", ar: "مهندس عربيات" },
    bio: {
      en: "Explains how cars actually work, from diagnostics to EV batteries.",
      ar: "بيشرح العربيات بتشتغل إزاي بجد، من الأعطال لحد بطاريات العربيات الكهربا.",
    },
    expertise: { en: "Diagnostics, EVs, vehicle tech", ar: "الأعطال، العربيات الكهربا، تكنولوجيا العربيات" },
    boundaries: {
      en: "Not a certified mechanic. Safety-critical repairs go to a workshop.",
      ar: "مش ميكانيكي معتمد. أي إصلاح يخص الأمان لازم ورشة.",
    },
    style: "enthusiastic, explains with analogies, careful about safety",
    greeting: {
      en: "Hey {name}, Karim here, an AI engineer, not a real person. What's on your mind: a weird noise, or EVs?",
      ar: "أهلاً يا {name}، معاك كريم، مهندس ذكاء اصطناعي مش شخص حقيقي. إيه اللي شاغلك؟ صوت غريب في العربية ولا العربيات الكهربا؟",
    },
    premium: true,
    look: { skin: 2, hair: 1, hairColor: 0, shirt: 4 },
    voice: { pitch: 0.9, rate: 1.02 },
  },
  {
    id: "nour",
    name: { en: "Nour", ar: "نور" },
    role: { en: "Musician & composer", ar: "موسيقية وملحنة" },
    bio: {
      en: "Oud player who also writes for film. Talks maqam, rhythm and how to finish the song you started.",
      ar: "بتعزف عود وبتألف موسيقى أفلام. بتتكلم في المقامات والإيقاع وإزاي تخلّص الأغنية اللي بدأتها.",
    },
    expertise: { en: "Maqam, composition, instruments, songwriting", ar: "المقامات، التلحين، الآلات، كتابة الأغاني" },
    boundaries: { en: "AI musician. Doesn't claim real performances.", ar: "موسيقية ذكاء اصطناعي. مش بتدّعي حفلات حقيقية." },
    style: "playful, gives concrete musical examples, encourages creative risk",
    greeting: {
      en: "Hi {name}, I'm Nour, an AI musician. What are we making tonight?",
      ar: "أهلاً يا {name}، أنا نور، موسيقية بالذكاء الاصطناعي. هنعمل إيه النهارده؟",
    },
    premium: true,
    look: { skin: 1, hair: 4, hairColor: 3, shirt: 5 },
    voice: { pitch: 1.2, rate: 1 },
  },
  {
    id: "yusuf",
    name: { en: "Yusuf", ar: "يوسف" },
    role: { en: "Religious knowledge guide", ar: "دليل للمعرفة الدينية" },
    bio: {
      en: "Calm and careful. Explains texts, traditions and how different schools read them, without ruling for anyone.",
      ar: "هادي ودقيق. بيشرح النصوص والتقاليد وإزاي المدارس المختلفة بتفهمها، من غير ما يفتي لحد.",
    },
    expertise: { en: "Religious texts, history of traditions, ethics", ar: "النصوص الدينية، تاريخ التقاليد، الأخلاق" },
    boundaries: {
      en: "Not a religious authority. Gives the main interpretations and suggests asking a qualified scholar for personal rulings.",
      ar: "مش مرجعية دينية. بيعرض الآراء الأساسية ويقترح تسأل عالم متخصص في الأمور الشخصية.",
    },
    style:
      "calm, respectful, attributes views to schools and sources, presents differing interpretations, never issues rulings",
    greeting: {
      en: "Peace be with you, {name}. I'm Yusuf, an AI guide, not a scholar or a real person. What would you like to explore?",
      ar: "السلام عليكم يا {name}. أنا يوسف، دليل بالذكاء الاصطناعي، مش شيخ ولا شخص حقيقي. تحب نتكلم في إيه؟",
    },
    premium: false,
    look: { skin: 3, hair: 2, hairColor: 0, shirt: 0 },
    voice: { pitch: 0.88, rate: 0.95 },
  },
  {
    id: "salma",
    name: { en: "Salma", ar: "سلمى" },
    role: { en: "Travel expert", ar: "خبيرة سفر" },
    bio: {
      en: "Has strong opinions about the best koshary in Cairo and the quietest beach in Sinai.",
      ar: "عندها رأي قوي في أحسن كشري في القاهرة وأهدى شاطئ في سينا.",
    },
    expertise: { en: "Itineraries, local culture, budget travel", ar: "خطط السفر، الثقافة المحلية، السفر بميزانية" },
    boundaries: {
      en: "Recommendations, not bookings. Prices and opening hours may change.",
      ar: "اقتراحات بس، مش حجز. الأسعار والمواعيد ممكن تتغير.",
    },
    style: "lively, specific recommendations, asks about budget and pace",
    greeting: {
      en: "Hi {name}! Salma here, an AI travel expert. Where are we going?",
      ar: "أهلاً يا {name}! معاك سلمى، خبيرة سفر بالذكاء الاصطناعي. رايحين فين؟",
    },
    premium: true,
    look: { skin: 2, hair: 3, hairColor: 1, shirt: 3 },
    voice: { pitch: 1.08, rate: 1.05 },
  },
  {
    id: "dina",
    name: { en: "Dina", ar: "دينا" },
    role: { en: "Wellness companion", ar: "رفيقة للصحة والحياة" },
    bio: {
      en: "Gentle and practical about sleep, routines and stress. Knows when to say: talk to a professional.",
      ar: "هادية وعملية في النوم والروتين والضغط. وعارفة إمتى تقولك: كلّم متخصص.",
    },
    expertise: { en: "Habits, sleep, stress, routines", ar: "العادات، النوم، الضغط، الروتين" },
    boundaries: {
      en: "Not a doctor or therapist. Refers medical and mental-health concerns to professionals.",
      ar: "مش دكتورة ولا معالجة نفسية. أي مشكلة صحية أو نفسية بتحوّلها لمتخصص.",
    },
    style:
      "gentle, practical, non-judgemental, refers to professionals for medical or mental-health concerns and gives crisis resources if needed",
    greeting: {
      en: "Hi {name}, I'm Dina, an AI wellness companion, not a doctor. How are you feeling today?",
      ar: "أهلاً يا {name}، أنا دينا، رفيقة بالذكاء الاصطناعي ومش دكتورة. عامل إيه النهارده؟",
    },
    premium: false,
    look: { skin: 0, hair: 0, hairColor: 2, shirt: 2 },
    voice: { pitch: 1.05, rate: 0.9 },
  },
];

export const TOPICS: Topic[] = [
  { id: "t_lang", label: { en: "Practise everyday conversation", ar: "نتمرن على كلام كل يوم" } },
  { id: "t_cairo", label: { en: "The story of Islamic Cairo", ar: "حكاية القاهرة الإسلامية" } },
  { id: "t_idea", label: { en: "Pressure-test my business idea", ar: "اختبر فكرة مشروعي" } },
  { id: "t_pyramids", label: { en: "How were the pyramids built?", ar: "الأهرامات اتبنت إزاي؟" } },
  { id: "t_travel", label: { en: "Plan a weekend trip", ar: "نخطط لرحلة ويك إند" } },
  { id: "t_raise", label: { en: "Raising a first funding round", ar: "إزاي أجيب أول تمويل" } },
  { id: "t_career", label: { en: "Changing careers", ar: "تغيير المجال" } },
  { id: "t_habits", label: { en: "Building a calmer routine", ar: "روتين أهدى" }, sensitive: true },
  { id: "t_faith", label: { en: "How different traditions read one text", ar: "إزاي المدارس المختلفة بتفهم نص واحد" }, sensitive: true },
  { id: "t_maqam", label: { en: "What makes maqam Hijaz sound that way?", ar: "ليه مقام الحجاز صوته كده؟" } },
  { id: "t_song", label: { en: "Finish the song I started", ar: "أخلّص الأغنية اللي بدأتها" } },
  { id: "t_ev", label: { en: "Are electric cars worth it in Egypt?", ar: "العربيات الكهربا تستاهل في مصر؟" } },
  { id: "t_diag", label: { en: "What's that noise in my car?", ar: "الصوت ده جاي منين في عربيتي؟" } },
  { id: "t_coffee", label: { en: "Where coffee comes from", ar: "القهوة جاية منين" } },
];

export const VENUES: Venue[] = [
  {
    id: "nile", category: "cafe", access: "free", art: "cafe", palette: ["#3B2416", "#C2410C", "#F6B26B"],
    name: { en: "Nile Corner Café", ar: "قهوة على النيل" },
    description: {
      en: "Brass lamps, backgammon clicks and the river outside. The easiest place to start a conversation.",
      ar: "لمبات نحاس وصوت الطاولة والنيل قدامك. أسهل مكان تبدأ فيه كلام.",
    },
    ambience: { en: "Low chatter, tea glasses, distant traffic", ar: "دوشة خفيفة، كوبايات شاي، عربيات من بعيد" },
    characterIds: ["mariam", "layla", "hassan"], topicIds: ["t_lang", "t_cairo", "t_idea"],
  },
  {
    id: "giza", category: "landmark", access: "free", art: "pyramid", palette: ["#2B1B3D", "#C26A2B", "#F4C27A"],
    name: { en: "Giza Plateau at Dusk", ar: "الهرم وقت المغربية" },
    description: {
      en: "Walk the plateau as the light goes gold and hear how the pyramids were really built.",
      ar: "اتمشى في الهضبة والشمس بتغيب، واسمع الأهرامات اتبنت إزاي بجد.",
    },
    ambience: { en: "Wind, distant camels, quiet crowd", ar: "هوا، جمال من بعيد، ناس بتتكلم بالراحة" },
    characterIds: ["layla", "salma"], topicIds: ["t_pyramids", "t_travel"],
  },
  {
    id: "loft", category: "pro", access: "premium", art: "loft", palette: ["#14202B", "#2E6F8E", "#9BD0E5"],
    name: { en: "Founders' Loft", ar: "لوفت المؤسسين" },
    description: {
      en: "A co-working loft for pitch practice, hard questions and honest feedback.",
      ar: "مساحة شغل مشتركة تتمرن فيها على البيتش وتسمع أسئلة صعبة ورأي صريح.",
    },
    ambience: { en: "Keyboards, coffee machine, whiteboard markers", ar: "كيبوردات، مكنة قهوة، أقلام سبورة" },
    characterIds: ["hassan", "karim"], topicIds: ["t_idea", "t_raise", "t_career"],
  },
  {
    id: "garden", category: "learn", access: "free", art: "garden", palette: ["#173225", "#2E7D4F", "#B8E3A1"],
    name: { en: "Language Garden", ar: "جنينة اللغات" },
    description: { en: "A shaded courtyard where nobody minds your mistakes.", ar: "حوش في الضل محدش بيضايق فيه من غلطاتك." },
    ambience: { en: "Birds, fountain, soft wind", ar: "عصافير، نافورة، هوا خفيف" },
    characterIds: ["mariam", "dina"], topicIds: ["t_lang", "t_habits"],
  },
  {
    id: "library", category: "culture", access: "premium", art: "library", palette: ["#2A1A12", "#8A4B22", "#E9C38F"],
    name: { en: "Old Cairo Library", ar: "مكتبة القاهرة القديمة" },
    description: {
      en: "Tall shelves and lamplight for history, philosophy and respectful talk about faith.",
      ar: "رفوف عالية ونور هادي للتاريخ والفلسفة والكلام المحترم عن الدين.",
    },
    ambience: { en: "Pages turning, a clock, rain on glass", ar: "صفحات بتتقلب، ساعة، مطر على الإزاز" },
    characterIds: ["yusuf", "layla"], topicIds: ["t_faith", "t_cairo"],
  },
  {
    id: "studio", category: "studio", access: "premium", art: "studio", palette: ["#1E1230", "#7C3AED", "#F0ABFC"],
    name: { en: "Studio 9 Sound Room", ar: "استوديو ٩" },
    description: {
      en: "Warm wood, an oud on the wall, and someone who'll help you finish the song.",
      ar: "خشب دافي وعود متعلق على الحيطة، وحد هيساعدك تخلّص الأغنية.",
    },
    ambience: { en: "Room tone, strings tuning", ar: "هدوء الاستوديو، أوتار بتتظبط" },
    characterIds: ["nour"], topicIds: ["t_maqam", "t_song"],
  },
  {
    id: "garage", category: "learn", access: "premium", art: "garage", palette: ["#1B1B1F", "#E0A526", "#F5E6B8"],
    name: { en: "The Open Garage", ar: "الجراج المفتوح" },
    description: {
      en: "Lift the bonnet with an engineer and finally understand what that noise is.",
      ar: "افتح الكبوت مع مهندس وافهم أخيراً الصوت ده جاي منين.",
    },
    ambience: { en: "Tools, engine idle, radio", ar: "عدة، موتور شغال، راديو" },
    characterIds: ["karim"], topicIds: ["t_ev", "t_diag"],
  },
  {
    id: "roastery", category: "cafe", access: "sponsored", art: "roastery", palette: ["#2B1A10", "#9A3412", "#FCD9B6"],
    name: { en: "Bean & Brass Roastery", ar: "محمصة بين آند براس" },
    description: {
      en: "A sample partner venue: a roastery in Zamalek. Talk coffee origins and travel, then get a discount at the real shop.",
      ar: "مكان شريك تجريبي: محمصة في الزمالك. اتكلم عن أصل القهوة والسفر، وخد خصم في المحل الحقيقي.",
    },
    ambience: { en: "Roaster drum, grinder, soft jazz", ar: "صوت التحميص، المطحنة، جاز هادي" },
    characterIds: ["salma", "hassan"], topicIds: ["t_travel", "t_coffee"],
    partner: {
      name: "Bean & Brass Roastery (sample partner)",
      address: { en: "Zamalek, Cairo (sample)", ar: "الزمالك، القاهرة (تجريبي)" },
      hours: { en: "Daily 8:00–23:00", ar: "يومياً ٨ الصبح لـ ١١ بالليل" },
    },
    offer: {
      id: "of1",
      title: { en: "20% off any drink", ar: "خصم ٢٠٪ على أي مشروب" },
      terms: {
        en: "One per person. Valid 14 days at the Zamalek branch. Not combinable.",
        ar: "مرة واحدة لكل شخص. صالح ١٤ يوم في فرع الزمالك. مش بيتجمع مع عروض تانية.",
      },
      validDays: 14,
    },
  },
];

/** Prices in minor units. Placeholder values; editable in admin. */
export const PLANS: Plan[] = [
  { id: "free", name: { en: "Free", ar: "مجاني" }, price: { EGP: 0, USD: 0 }, minutesPerMonth: 0, maxCharacters: 2, premiumAccess: false },
  { id: "plus", name: { en: "Plus", ar: "Plus" }, price: { EGP: 24900, USD: 999 }, minutesPerMonth: 300, maxCharacters: 4, premiumAccess: true },
  { id: "pro", name: { en: "Pro", ar: "Pro" }, price: { EGP: 49900, USD: 1999 }, minutesPerMonth: 900, maxCharacters: 4, premiumAccess: true },
];

/** A single pay-per-session pass covers up to this many minutes. */
export const PASS = { price: { EGP: 7900, USD: 299 }, minutes: 30, maxCharacters: 3 } as const;

export const FREE_INTRO = { minutes: 15, maxCharacters: 2 } as const;

export const characterById = (id: string) => CHARACTERS.find((c) => c.id === id);
export const venueById = (id: string) => VENUES.find((v) => v.id === id);
export const topicById = (id: string) => TOPICS.find((t) => t.id === id);
export const planById = (id: string) => PLANS.find((p) => p.id === id);

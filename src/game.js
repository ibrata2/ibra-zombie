// IBRA ZOMBIE - صحيت لكيت الدنيا زومبي
// برمجة وتطوير ابراهيم الخزرجي
'use strict';
(() => {
const VERSION = (window.ibra && window.ibra.version) || '1.0.0', REPO = 'ibrata2/ibra-zombie', T = 16;
const $ = s => document.querySelector(s);
let LANG = localStorage.getItem('ibz_lang') || 'ar';
const tr = (a, e) => LANG === 'ar' ? a : e, L = p => Array.isArray(p) ? p[LANG === 'ar' ? 0 : 1] : p;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, rand = (a, b) => a + Math.random() * (b - a), pick = a => a[(Math.random() * a.length) | 0], hyp = Math.hypot;
const wait = ms => new Promise(r => setTimeout(r, ms));
const cv = $('#cv'), ctx = cv.getContext('2d');
let G = null;
const R = { mode: 'title', busy: 0, zombies: [], act: [], fx: [], bubbles: [], npcs: [], objs: [], cam: { x: 400, y: 880, z: 3, vx: 0, vy: 0 }, keys: {}, mouse: { x: 0, y: 0, l: false, r: false, t: 0 }, t: 0, near: null, atk: 0, swing: 0, inv: 0, aim: 0, hudT: 0, panT: 0, shake: 0, vol: 1, lastAuto: -99, wasSafe: true, tips: {} };
const S = World.spots;

// ---------------------------------------------------------------- data
const ITEMS = {
  samoon: { n: ['صمون', 'Samoon bread'], food: 16 }, can: { n: ['معلبات', 'Canned food'], food: 28 }, dates: { n: ['تمر', 'Dates'], food: 11, en: 4 },
  dolma: { n: ['دولمة', 'Dolma'], food: 100, hp: 100, d: ['تصفّي كلشي. طبخ بيت.', 'Fixes everything. Home cooking.'] },
  water: { n: ['قنينة ماي', 'Water bottle'], water: 36 }, tea: { n: ['استكان چاي', 'Glass of tea'], en: 30, water: 6 },
  bandage: { n: ['لفّاف', 'Bandage'], hp: 18 }, medkit: { n: ['إسعافات', 'Medkit'], hp: 55 },
  fuel: { n: ['جليكان بانزين', 'Fuel can'], fuel: 40 }, scrap: { n: ['سكراب', 'Scrap'] }, parts: { n: ['قطع غيار', 'Spare parts'] },
  ammo9: { n: ['رصاص مسدس', 'Pistol ammo'] }, ammo7: { n: ['رصاص رشاشة', 'Rifle ammo'] },
  medicine: { n: ['دوه', 'Medicine'], q: 1 }, key_gate: { n: ['مفتاح السيطرة', 'Checkpoint key'], q: 1 }, key_police: { n: ['مفتاح مركز الشرطة', 'Police station key'], q: 1 },
  key_armory: { n: ['مفتاح المشجب', 'Armory key'], q: 1 }, key_truck: { n: ['سويچ الجكسارة', 'Armored truck key'], q: 1 }, cutter: { n: ['قاطع حديد', 'Bolt cutter'], q: 1 },
  book: { n: ['كتاب "تاريخ المشروبات الغازية"', 'Book: "A History of Fizzy Drinks"'], q: 1 }, kettle: { n: ['قوري أبو جاسم', "Abu Jasim's teapot"], q: 1, d: ['استكان چاي كل صبح', 'A glass of tea every morning'] },
  jacket: { n: ['جاكيت رياضي من التسعينات', '90s track jacket'], q: 1, d: ['سرعة +5%', '+5% speed'] }, invoice: { n: ['فاتورة مولدة', 'Generator bill'], q: 1, d: ['حتى بنهاية العالم يطلبوك.', 'Even at the end of the world, you owe.'] }
};
const FOODS = ['samoon', 'dates', 'can'];
const WEAPONS = {
  fist: { n: ['إيدك', 'Fists'], dmg: 5, range: 15, cd: .4, kb: 60 },
  pipe: { n: ['بوري حديد', 'Iron pipe'], dmg: 14, range: 22, cd: .5, kb: 110, dur: 60 },
  wrench: { n: ['عتلة', 'Crowbar'], dmg: 19, range: 22, cd: .55, kb: 120, dur: 80 },
  cleaver: { n: ['ساطور', 'Cleaver'], dmg: 24, range: 18, cd: .33, kb: 70, dur: 70 },
  bat: { n: ['مجرفة', 'Shovel'], dmg: 20, range: 26, cd: .6, kb: 230, dur: 70 },
  pistol: { n: ['مسدس', 'Pistol'], gun: 1, dmg: 36, range: 230, cd: .35, ammo: 'ammo9', noise: 300 },
  rifle: { n: ['رشاشة', 'Rifle'], gun: 1, dmg: 26, range: 280, cd: .11, ammo: 'ammo7', noise: 440 }
};
const WORDER = ['fist', 'pipe', 'wrench', 'cleaver', 'bat', 'pistol', 'rifle'];
const VEH = {
  bike: { n: ['بايسكل', 'Bicycle'], sp: 118, acc: 190, turn: 5, r: 5, seats: 1, tank: 0, hp: 40, use: 0 },
  stuta: { n: ['ستوتة', 'Stuta trike'], sp: 138, acc: 150, turn: 3.6, r: 6, seats: 3, tank: 40, hp: 80, use: .02 },
  kia: { n: ['كيا حمل', 'Kia pickup'], sp: 168, acc: 150, turn: 3.2, r: 7, seats: 6, tank: 80, hp: 160, use: .028 },
  saipa: { n: ['سايبا', 'Saipa'], sp: 198, acc: 190, turn: 3.6, r: 6, seats: 4, tank: 60, hp: 120, use: .024 },
  truck: { n: ['جكسارة مدرّعة', 'Armored truck'], sp: 158, acc: 120, turn: 2.8, r: 8, seats: 9, tank: 120, hp: 400, use: .04 }
};
const NPC = {
  aj: { n: ['أبو جاسم', 'Abu Jasim'] }, noor: { n: ['نور', 'Noor'] }, mur: { n: ['مرتضى', 'Murtadha'] }, cat: { n: ['بسبوسة', 'Basbousa'] },
  saif: { n: ['سيف التكتوكر', 'Saif the TikToker'] }, sol: { n: ['الجندي حسن', 'Private Hassan'] }, haji: { n: ['حجي كاظم', 'Haji Kadhim'] },
  umali: { n: ['أم علي', 'Um Ali'] }, book: { n: ['أبو الكتب', 'The Bookseller'] }
};
const COMPS = ['aj', 'noor', 'mur', 'cat', 'saif', 'sol'];
const LOOK = {
  player: { id: 'pl', shirt: '#c9a84c', pants: '#2a2f3a', hair: '#17110d' },
  aj: { id: 'aj', robe: '#e9e4d6', shirt: '#e9e4d6', hat: 'shemagh', hatc: '#ececec', beard: 1, hair: '#666', fat: 1 },
  noor: { id: 'no', shirt: '#f4f4f4', pants: '#3a5a8a', hat: 'hijab', hatc: '#8e3b5e' },
  mur: { id: 'mu', shirt: '#3d5a80', pants: '#333', hair: '#111', stache: 1, hat: 'cap', hatc: '#c33' },
  saif: { id: 'sa', shirt: '#e2334a', pants: '#1a1a1a', hair: '#2b1b10', phone: 1 },
  sol: { id: 'so', shirt: '#5a6b3a', pants: '#4a5a30', hat: 'helmet', hatc: '#4a5a30' },
  haji: { id: 'hj', robe: '#8a7a5a', shirt: '#8a7a5a', beard: 1, hair: '#ddd', hat: 'shemagh', hatc: '#c33' },
  umali: { id: 'um', robe: '#16161a', shirt: '#16161a', hat: 'hijab', hatc: '#16161a' },
  book: { id: 'bk', shirt: '#6b4f2a', pants: '#444', hair: '#ccc', beard: 1 }
};
const ZT = { normal: { hp: 30, sp: 17, dmg: 7 }, vendor: { hp: 30, sp: 15, dmg: 7 }, cop: { hp: 42, sp: 19, dmg: 8 }, gen: { hp: 70, sp: 11, dmg: 10 }, fat: { hp: 80, sp: 12, dmg: 12 }, soldier: { hp: 55, sp: 20, dmg: 10 }, hassan: { hp: 26, sp: 14, dmg: 5 }, colonel: { hp: 170, sp: 18, dmg: 14 }, boss: { hp: 750, sp: 24, dmg: 22 } };
const ZLINES = {
  normal: [['أأأأه..', 'مخخخ..', 'وين.. الكهرباء..', 'راتب.. راتب..', 'مممم.. تمن ومرق..', 'الوطني.. طفت..', 'نت.. ضعيف..'], ['Uuugh..', 'Braaains..', 'Where... is the power..', 'Salary... salary..', 'Mmm... rice and stew..', 'The grid... is out..', 'Wifi... weak..']],
  vendor: [['باكلة.. باكلة حارّة..', 'لبلبي.. لبلبي..', 'غاز.. غاز..', 'طماطة بألف..', 'عتيك.. للبيع..'], ['Beans... hot beans..', 'Chickpeas... chickpeas..', 'Gas... gas cylinders..', 'Tomatoes... one thousand..', 'Old stuff... for sale..']],
  cop: [['صفّ على اليمين..', 'سنويّتك..', '*صفااارة*', 'وين الحزام؟', 'ممنوع.. الوكوف..'], ['Pull over...', 'Registration...', '*whiiistle*', 'Seatbelt?', 'No... parking..']],
  gen: [['الأمبير.. بعشرين..', 'سحب.. مولدة..', 'ادفع.. الاشتراك..', 'طفّي.. السبلت..'], ['Twenty... per amp..', 'Generator... line..', 'Pay... the subscription..', 'Turn off... the AC..']],
  fat: [['كباااب..', 'بعد.. نفر..', 'تشريب..'], ['Kebaaab..', 'One more... portion..', 'Tashreeb..']],
  soldier: [['استعد..', 'إجازة.. إجازة..', 'منو.. بالباب..', 'واجب.. ليلي..'], ['Atten-tion..', 'Leave... I want leave..', "Who's... at the gate..", 'Night... shift..']],
  hassan: [['صمووون..', 'ألف.. دينار..', 'جيراااان..'], ['Breaaad..', 'One thousand... dinars..', 'Neighbooor..']],
  colonel: [['وين.. التحية؟', 'ملف.. ملف..', 'باجر.. تعال..'], ['Where is... the salute?', 'File... file..', 'Come back... tomorrow..']],
  boss: [['بييييبسي!', 'غازاااات!', 'منتهييي!'], ['PEEEPSI!', 'FIIIZZ!', 'EXPIIIRED!']]
};
const OUCH = [['آخ!', 'وكعت..', 'رجلي!', 'منو دفرني؟'], ['Ow!', 'I fell..', 'My leg!', 'Who pushed me?']];
const ZONES = [['بغداد الجديدة', 'Baghdad Jadida'], ['السوق', 'The Market'], ['الكرادة', 'Karrada'], ['شارع المتنبي', 'Mutanabbi St.'], ['صوب المعسكر', 'East Bank']];
const EMPTY = [['فارغ. بس غبرة.', 'ماكو شي.. حتى الصرصر هاجر.', 'فارغ. واحد سبقني.', 'بس كياسة نايلون جوّه كيس نايلون.'], ['Empty. Just dust.', 'Nothing... even the roaches moved out.', 'Empty. Someone beat me to it.', 'Only plastic bags inside a plastic bag.']];
const ORD = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر'];
const dayTitle = () => tr('اليوم ' + (ORD[G.day - 1] || G.day), 'Day ' + G.day);

const INTRO = [['اسمي {name}. ومحد يصدكني..', 'بس اني كاعد أتخيل شي.', 'تخيّل تكعد الصبح.. ببغداد الجديدة.. والدنيا كلها صايرة زومبي.', '~ والبطل عنده قوة خارقة ويطير.', 'لا لا.. خلّيه واحد عادي. مثلي. بس عنده بوري.', 'يلا نبدي.. اليوم الأول.'],
  ['My name is {name}. Nobody believes me...', "But I keep imagining something.", 'Imagine waking up one morning... in Baghdad Jadida... and the whole world has gone zombie.', '~ And the hero has superpowers and can fly.', 'No, no... make him a regular guy. Like me. But he has a pipe.', "Alright, let's begin... Day One."]];
const DIARY = {
  2: [['الحمد لله بعدني عايش.', 'الزومبيات بطيئة.. أبطأ من معاملة بدائرة حكومية.', 'لازم ألكى أكل. الثلاجة بيها نص ليمونة بس.'], ['Still alive, thank God.', 'The zombies are slow... slower than paperwork at a government office.', 'Need to find food. The fridge has half a lemon.']],
  3: [['صار ثلاث أيام بلا كهرباء وطنية.', 'الصراحة.. ما حسّيت بفرق.', 'بس المولدة هم طفت. هاي المصيبة.'], ['Three days without grid power.', "Honestly... I didn't notice a difference.", 'But the generator is off too. Now THAT is a disaster.']],
  4: [['شفت زومبي شرطي مرور.', 'بعده يأشّر للسيارات.. وماكو سيارات.', 'أول مرة أشوف واحد ملتزم بالدوام هيج.'], ['Saw a traffic-cop zombie.', 'Still waving at cars... there are no cars.', "First time I've seen someone this committed to their shift."]],
  5: [['اليوم أكلت تمن بارد.', 'مو مشكلة. حتى قبل الزومبي جان بارد.'], ['Ate cold rice today.', 'No problem. It was cold before the zombies too.']],
  6: [['لاحظت شي: الزومبي ما يعبرون الشارع إلا بالغلط.', 'يعني بالضبط مثل قبل.'], ['Noticed something: zombies only cross the street by accident.', 'So, exactly like before.']],
  7: [['أسبوع كامل.', '~ اليوم البطل لكى طيارة وطار لأوروبا.', 'لا.. الفيزا صعبة حتى بالخيال.'], ['A full week.', '~ Today the hero found a plane and flew to Europe.', 'No... the visa is hard even in imagination.']],
  10: [['عشر أيام.', 'صرت أميّز الزومبيات من مشيتهم.', 'ذاك أبو المولدة.. وذاك أبو الباكلة.. صرنا عشرة عمر.'], ['Ten days.', 'I can tell the zombies apart by their walk now.', 'That one is the generator guy... that one sells beans... we go way back.']]
};
const DGEN = [
  [['يوم جديد.', 'الجو حار والزومبي ما عدهم مبردة. مساكين.'], ['A new day.', 'It is hot and the zombies have no air cooler. Poor things.']],
  [['حلمت البارحة بالكهرباء الوطنية.', 'كعدت أبجي.'], ['Dreamed of grid power last night.', 'Woke up crying.']],
  [['~ اليوم راح أرتاح وما أطلع.', 'لا.. الأكل ما يجي وحده. مع الأسف.'], ['~ Today I rest and stay in.', "No... food doesn't deliver itself. Sadly."]],
  [['الزومبيات هواي.. بس الزحمة أقل من قبل.', 'كلشي بي خير.'], ['Lots of zombies... but less traffic than before.', 'Silver linings.']],
  [['سمعت صوت بالليل.', 'طلع زومبي متعثر بسطل. ضحكت نص ساعة.'], ['Heard a noise at night.', 'A zombie tripped over a bucket. I laughed for half an hour.']],
  [['بعدني عايش.', 'والله إنجاز.'], ['Still alive.', "Honestly, that's an achievement."]],
  [['لازم أنظّم الأكل والماي.', 'واني اللي ما جنت أنظّم غرفتي.'], ['I need to ration food and water.', "Me. The guy who never tidied his room."]]
];
const PAGES = [
  [['~ البطل اسمه "القنّاص الأسود" وعمره ٢٥ وعضلاته هيج.', 'لا.. خلّي اسمه مثل اسمي. وعضلاته مثل عضلاتي.', 'يعني ماكو.'], ['~ The hero is called "The Black Sniper", age 25, muscles like THIS.', 'No... give him my name. And my muscles.', 'Meaning: none.']],
  [['~ الزومبيات سريعة ومخيفة وتطير.', 'لا لا.. إذا سريعة منو يكدر يهرب؟', 'خلّيها بطيئة وتتعثر. أحسن وأضحك.'], ['~ The zombies are fast, scary, and they fly.', 'No, no... if they are fast who can run away?', 'Make them slow and clumsy. Better. Funnier.']],
  [['~ والحكومة تعلن حالة الطوارئ وتنقذ الناس.', '...', 'خلّيها قصة خيال. مو خيال علمي.'], ['~ And the government declares an emergency and rescues everyone.', '...', "Keep it fiction. Not science fiction."]],
  [['ملاحظة: لازم بالقصة بزّونة.', 'كل قصة حلوة بيها بزّونة.', 'اسمها بسبوسة.'], ['Note: the story needs a cat.', 'Every good story has a cat.', 'Her name is Basbousa.']],
  [['إذا أمي صاحت عليّه للعشا.. القصة تخلص.', 'فلازم أكتب بسرعة.'], ['If Mom calls me for dinner... the story ends.', 'So I must write fast.']]
];
const LEAVE = {
  aj: ['أبو جاسم عافنه. كال "اني سايق مو متطوع" وأخذ الكيا وياه.', 'Abu Jasim left. Said "I am a driver, not a volunteer" and took the Kia with him.'],
  noor: ['نور راحت. كالت "اني أعالج الناس، مو أجوع وياهم".', 'Noor left. Said "I heal people, I don\'t starve with them".'],
  mur: ['مرتضى شال عدّته وراح. كال "حتى المولدة تنطيني أكثر منك".', 'Murtadha packed his tools and left. Said "Even the generator gives me more than you do".'],
  cat: ['بسبوسة اختفت. البزازين ما تسامح.', 'Basbousa vanished. Cats do not forgive.'],
  sol: ['الجندي حسن رجع للمعسكر. كال "هناك على الأقل اكو صمون عسكري".', 'Private Hassan went back to base. Said "At least there is army bread there".'],
  saif: ['سيف راح.', 'Saif left.']
};
const GREET = {
  aj: [['ها عمّي؟ شكو؟', 'كول، بس لا تطوّلها. الزحمة تنتظر.'], ['Yes, pal? What is it?', 'Speak, but keep it short. Traffic is waiting.']],
  noor: [['شلونك؟ تشرب ماي كفاية؟', 'نعم؟ لا تكلي انجرحت مرة ثانية.'], ['How are you? Drinking enough water?', "Yes? Don't tell me you're hurt again."]],
  mur: [['أمر؟ كلشي يتصلّح.. إلا الكهرباء الوطنية.', 'ها أبو الشباب؟'], ['Yes? Everything can be fixed... except the grid.', 'What is up, chief?']],
  cat: [['مياو.', 'مياااو؟ (تباوع على جيبك)'], ['Meow.', 'Meooow? (staring at your pocket)']],
  saif: [['لحظة لحظة.. خلّي أثبّت الكاميرا.', 'شباب لايك وشير!'], ['Wait, wait... let me set up the camera.', 'Like and share, guys!']],
  sol: [['نعم سيدي؟.. قصدي، نعم أخي؟', 'حاضر.'], ['Yes sir?... I mean, yes brother?', 'Ready.']]
};
const REQ = {
  aj: ['fuel', 1, ['الكيا عطشانة، وما أتحمّل أشوفها هيج. عندك جليكان بانزين؟', "The Kia is thirsty and I can't stand seeing her like this. Got a can of fuel?"], ['عاشت إيدك! هسه الكيا تضحك.', 'Bless you! Now the Kia is smiling.'], ['هيج؟ زين.. زين.', 'Like that? Fine... fine.']],
  noor: ['medkit', 1, ['لكيت واحد مجروح ورا المول. أحتاج إسعافات إله. تنطيني؟', 'I found a wounded man behind the mall. I need a medkit for him. Will you give me one?'], ['شكراً. هذا اللي يفرقنا عن الزومبي.', 'Thank you. This is what separates us from the zombies.'], ['... تمام. بس لا تنسى، باجر يمكن انت اللي تحتاج.', "...Okay. But don't forget, tomorrow it might be you who needs it."]],
  mur: ['scrap', 3, ['أريد أسوي فخ للزومبي من سكراب. تنطيني ٣ قطع؟', 'I want to build a zombie trap out of scrap. Spare me 3 pieces?'], ['حبيبي! راح تشوف شغل معلّم.', "My man! You'll see a master at work."], ['بخيل.. حتى السكراب بخلت بي.', "Stingy... you'd even hold back scrap."]],
  cat: ['can', 1, ['مياو. مياااو. (تأشّر على المعلبات بإصرار مخيف)', 'Meow. Meooow. (pointing at the canned food with scary determination)'], ['*خرخرة* (ترجمة: مقبول)', '*purr* (translation: acceptable)'], ['*تدير وجهها* (ترجمة: راح تندم)', '*turns away* (translation: you will regret this)']]
};
const END = {
  good: g => [['نور غلّت چاي ثكيل.. مخدّر عالفحم.', 'رشّيناه على بغداد كلها.', 'وأول واحد صحى؟ أبو حسن. فتح عينه وكال: "وين كيس الصمون مالتي؟"', 'الكهرباء بعدها طافية. بس الناس رجعت.', 'النهاية. (الحلوة)'], ['Noor brewed strong tea... slow, over charcoal.', 'We sprayed it all over Baghdad.', 'First one to wake up? Abu Hassan. Opened his eyes and said: "Where is my bag of bread?"', 'The power is still out. But the people are back.', 'The End. (The good one)']],
  sad: g => [['عرفت الحقيقة.. بس وحدي.', 'محد وياي يفتهم بالدوه. ومحد يعرف يسوي چاي عدل.', 'كعدت على سطح المخزن أباوع على بغداد.', (g.comps.cat.st === 'with' || g.comps.cat.st === 'home') ? 'بسبوسة كعدت بحضني. على الأقل هي بقت.' : 'حتى بزّونة ماكو.', 'باجر أدوّر على ناس.. يمكن.', 'النهاية. (مو كلّش حلوة)'], ['I found the truth... but alone.', 'Nobody with me understands medicine. Nobody can brew proper tea.', 'I sat on the warehouse roof, looking at Baghdad.', (g.comps.cat.st === 'with' || g.comps.cat.st === 'home') ? 'Basbousa sat on my lap. At least she stayed.' : 'Not even a cat.', "Tomorrow I'll look for people... maybe.", 'The End. (Not the best one)']],
  secret: g => [['...', '"ولك {name}! كوم تعشّى! شبيك كاعد تكتب خرابيط من الصبح؟!"', 'سدّيت الدفتر. طلع كلشي خيال.', 'نزلت للمطبخ. دولمة.', 'بس من باوعت من الشباك.. شفت أبو حسن واكف يم الباب.', 'ويتمايل.', 'النهاية؟'], ['...', '"{name}! Come eat dinner! Why have you been scribbling nonsense since morning?!"', 'I closed the notebook. It was all imagination.', 'Went down to the kitchen. Dolma.', 'But when I looked out the window... I saw Abu Hassan standing at the door.', 'Swaying.', 'The End?']]
};

// ---------------------------------------------------------------- helpers
const has = (id, n = 1) => (G.inv[id] || 0) >= n;
const add = (id, n = 1) => { G.inv[id] = (G.inv[id] || 0) + n; };
const take = (id, n = 1) => { G.inv[id] = (G.inv[id] || 0) - n; if (G.inv[id] <= 0) delete G.inv[id]; };
const comp = id => G.comps[id];
const here = id => comp(id).st === 'with' || comp(id).st === 'home';
const dirOf = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
const isNight = () => { const h = G.time % 24; return h >= 19 || h < 5.5; };
function darkness() { const h = G.time % 24; if (h >= 6 && h < 17.5) return 0; if (h >= 17.5 && h < 20) return (h - 17.5) / 2.5 * .74; if (h >= 20 || h < 4.5) return .74; return (6 - h) / 1.5 * .74; }
let AC = null;
function sfx(n) {
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    const D = { swing: ['triangle', 220, 90, .08, .08], hit: ['square', 140, 50, .1, .12], shot: ['sawtooth', 700, 60, .12, .2], rifle: ['sawtooth', 500, 80, .07, .15], pick: ['square', 660, 990, .08, .06], ui: ['square', 440, 520, .05, .05], hurt: ['sawtooth', 180, 60, .2, .15], eat: ['triangle', 300, 200, .12, .08], crash: ['sawtooth', 90, 30, .25, .2], door: ['square', 120, 80, .08, .08], fix: ['square', 520, 780, .2, .07], horn: ['square', 370, 370, .35, .12], click: ['square', 900, 900, .03, .05], day: ['triangle', 392, 784, .5, .08], page: ['triangle', 880, 1320, .25, .07] }[n];
    if (!D) return; const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.connect(g); g.connect(AC.destination);
    o.type = D[0]; o.frequency.setValueAtTime(D[1], t); o.frequency.exponentialRampToValueAtTime(Math.max(20, D[2]), t + D[3]);
    g.gain.setValueAtTime(D[4] * R.vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + D[3]); o.start(t); o.stop(t + D[3] + .02);
  } catch (e) { /* no audio */ }
}
let lastToast = '', lastToastT = 0;
function toast(text, ms = 3600) {
  if (text === lastToast && R.t - lastToastT < 1.5) return; lastToast = text; lastToastT = R.t;
  const box = $('#toasts'), d = document.createElement('div'); d.className = 'toast'; d.textContent = text; box.appendChild(d);
  while (box.children.length > 4) box.firstChild.remove(); setTimeout(() => d.remove(), ms);
}
const tip = (k, a, e) => { if (R.tips[k]) return; R.tips[k] = 1; toast(tr(a, e), 6000); };
function bubble(e, text, dur = 2.6) { for (let i = R.bubbles.length - 1; i >= 0; i--) if (R.bubbles[i].e === e) R.bubbles.splice(i, 1); R.bubbles.push({ e, text, t: dur }); }

// ---------------------------------------------------------------- dialog / notebook / panel
const dlg = $('#dlg'), nb = $('#nb'), panel = $('#panel');
function say(who, text, opts) {
  return new Promise(res => {
    R.busy++; dlg.hidden = false; R.mouse.l = R.mouse.r = false; R.keys = {};
    dlg.querySelector('h4').textContent = who === 'me' ? G.name : who ? L(NPC[who] ? NPC[who].n : who) : '';
    dlg.querySelector('p').textContent = text.replace('{name}', G.name);
    const ob = dlg.querySelector('.opts'); ob.innerHTML = '';
    const done = v => { dlg.hidden = true; R.busy--; R.dlgAny = R.dlgNum = null; res(v); };
    if (opts) {
      opts.forEach((o, i) => { const b = document.createElement('button'); b.textContent = (i + 1) + '. ' + o; b.onclick = e => { e.stopPropagation(); sfx('ui'); done(i); }; ob.appendChild(b); });
      R.dlgNum = i => { if (i < opts.length) { sfx('ui'); done(i); } }; R.dlgAny = null; dlg.querySelector('.hint').textContent = tr('اختار بالرقم أو بالماوس', 'Choose with a number key or the mouse');
    } else { R.dlgNum = null; R.dlgAny = () => { sfx('click'); done(0); }; dlg.querySelector('.hint').textContent = tr('[E / Enter] كمّل', '[E / Enter] continue'); }
  });
}
dlg.onclick = () => R.dlgAny && R.dlgAny();
function notebook(lines, opt = {}) {
  return new Promise(res => {
    R.busy++; nb.hidden = false; R.mouse.l = R.mouse.r = false; R.keys = {};
    nb.querySelector('h3').textContent = opt.title || ''; const body = nb.querySelector('.body'), hint = nb.querySelector('.hint'); body.innerHTML = ''; hint.textContent = tr('[اضغط] تخطّي', '[click] skip');
    const full = lines.map(s => s.replace('{name}', G ? G.name : '')); let i = 0, ci = 0, cur = null, tm = 0, fin = false;
    const mkp = s => { const p = document.createElement('p'); if (s[0] === '~') p.className = 'strike'; body.appendChild(p); return p; }, txt = s => s[0] === '~' ? s.slice(1) : s;
    const finish = () => { fin = true; hint.textContent = tr('[اضغط] كمّل', '[click] continue'); };
    const step = () => {
      if (i >= full.length) return finish(); if (!cur) { cur = mkp(full[i]); ci = 0; }
      const s = txt(full[i]); cur.textContent = s.slice(0, ++ci); if (ci % 3 === 0) sfx('click');
      if (ci >= s.length) { i++; cur = null; tm = setTimeout(step, 320); } else tm = setTimeout(step, 24);
    };
    R.nbAny = () => {
      if (!fin) { clearTimeout(tm); if (cur) { cur.textContent = txt(full[i]); i++; cur = null; } for (; i < full.length; i++) mkp(full[i]).textContent = txt(full[i]); finish(); }
      else { nb.hidden = true; R.busy--; R.nbAny = null; res(); }
    };
    sfx('page'); step();
  });
}
nb.onclick = () => R.nbAny && R.nbAny();
let panelRes = null;
function openPanel(title, build) {
  return new Promise(res => {
    if (!panel.hidden) closePanel();
    R.busy++; panel.hidden = false; R.mouse.l = R.mouse.r = false; R.keys = {}; panelRes = res;
    const box = panel.querySelector('.box'); box.innerHTML = '';
    const h = document.createElement('h2'), s = document.createElement('span'), x = document.createElement('button'); s.textContent = title; x.textContent = '✕'; x.onclick = closePanel; h.append(s, x); box.appendChild(h);
    build(box);
  });
}
function closePanel() { if (panel.hidden) return; panel.hidden = true; R.busy--; const r = panelRes; panelRes = null; r && r(); }
const el = (tag, txt, cls) => { const e = document.createElement(tag); if (txt != null) e.textContent = txt; if (cls) e.className = cls; return e; };
const btn = (txt, fn, cls) => { const b = el('button', txt, cls); b.onclick = () => { sfx('ui'); fn(); }; return b; };

// ---------------------------------------------------------------- save / load
const users = () => { try { return JSON.parse(localStorage.getItem('ibz_users') || '[]'); } catch (e) { return []; } };
function save(auto) {
  if (!G || R.mode !== 'play') return;
  for (const n of R.npcs) if (n.follow) { comp(n.id).x = n.x; comp(n.id).y = n.y; }
  localStorage.setItem('ibz_save_' + G.name, JSON.stringify(G));
  const u = users().filter(x => x.name !== G.name); u.unshift({ name: G.name, day: G.day, t: Date.now() }); localStorage.setItem('ibz_users', JSON.stringify(u));
  R.lastAuto = R.t; toast(auto ? tr('حفظ تلقائي ✓', 'Autosaved ✓') : tr('انحفظت اللعبة ✓', 'Game saved ✓'), 1800);
}
function blank(name) {
  const comps = {}; for (const id of COMPS) comps[id] = { st: 'none', trust: 50, joinDay: 0, asked: 0 };
  const veh = [['bike', 'bike', 0], ['stuta', 'stuta', 0], ['kia', 'kia', 0], ['saipa', 'saipa', 0], ['truck', 'truck', 70]].map(([t, s, f]) => ({ t, x: S[s].x, y: S[s].y, a: 0, sp: 0, fuel: f, hp: VEH[t].hp, up: { armor: 0, tank: 0, horn: 0, seats: 0 } }));
  return { v: 1, name, day: 1, time: 6.4, x: S.start.x, y: S.start.y, dir: 0, fr: 0, hp: 100, food: 72, water: 72, en: 100, inv: {}, weps: {}, cur: 'fist', flags: {}, looted: {}, lootN: 0, pages: [], taken: {}, kills: 0, dayKills: 0, comps, veh, inVeh: -1, lastVeh: -1, shel: {}, safe: { x: S.start.x, y: S.start.y }, zoom: 3, deaths: 0 };
}
function enterWorld() {
  World.gen(); View3D.build();
  for (const k in World.gates) if (G.flags[k]) World.setGate(k, true);
  for (const k in World.locks) if (G.flags['lk_' + k]) World.setLock(k, true);
  buildObjs(); syncNpcs(); spawnAll();
  R.fx.length = 0; R.bubbles.length = 0; R.cam.x = G.x; R.cam.y = G.y; R.wasSafe = true; R.mode = 'play';
  $('#menu').hidden = true; $('#hud').hidden = false; hud();
}
async function startNew(name, skipIntro) {
  G = blank(name); enterWorld();
  if (!skipIntro) {
    await notebook(L(INTRO), { title: tr('دفتر {name}', "{name}'s notebook").replace('{name}', name) });
    await introLapse();
    await notebook([tr('كعدت من النوم. البيت ساكت.. أكثر من اللازم.', 'I woke up. The house is quiet... too quiet.')], { title: dayTitle() });
    bubble(G, tr('يمّه؟.. يمّه وين الريوك؟', "Mom?... Mom, where's breakfast?"), 3.2);
    setTimeout(() => R.mode === 'play' && bubble(G, tr('محد يرد. والكهرباء طافية.. عادي.', 'No answer. And the power is out... normal.'), 3.4), 3600);
    setTimeout(() => R.mode === 'play' && toast(tr('WASD أو الأسهم: حركة — Shift: ركض — الماوس: تصويب وضرب — E: تفاعل — العجلة: تقريب الكاميرا', 'WASD / arrows: move — Shift: run — Mouse: aim & attack — E: interact — Wheel: camera zoom'), 9000), 7400);
  }
  save(true);
}
function loadGame(name) {
  try { const g = JSON.parse(localStorage.getItem('ibz_save_' + name)); if (!g) return false; const b = blank(name); G = Object.assign(b, g); for (const id of COMPS) if (!G.comps[id]) G.comps[id] = b.comps[id]; enterWorld(); toast(tr('هلا بيك من جديد، ', 'Welcome back, ') + name); return true; } catch (e) { return false; }
}

// ---------------------------------------------------------------- npcs & objects
function homeSpot(id) { const i = COMPS.indexOf(id); if (G.flags.mall) return { x: S.mall.x - 40 + i * 18, y: S.mall.y + 30 }; return { x: S.home.x - 24 + i * 12, y: S.home.y + 14 }; }
function syncNpcs() {
  const old = R.npcs; R.npcs = [];
  const put = (id, p, follow) => { const o = old.find(n => n.id === id), e = { id, x: p.x, y: p.y, dir: 0, fr: 0, follow: !!follow, atk: 0, far: 0, find: rand(50, 90) }; if (o && follow && o.follow) { e.x = o.x; e.y = o.y; } R.npcs.push(e); };
  for (const id of COMPS) {
    const c = comp(id);
    if (c.st === 'with') put(id, c.x != null ? c : World.freeNear(G.x, G.y), 1);
    else if (c.st === 'home') put(id, homeSpot(id));
    else if (c.st === 'none' && (id !== 'saif' || (G.day >= 3 && !G.flags.saifNo))) put(id, S[id]);
  }
  if (G.day >= 2) put('haji', S.haji);
  if (G.flags.umali) put('umali', { x: S.home.x + 28, y: S.home.y - 10 }); else if (G.day >= 4) put('umali', S.umali);
  put('book', S.book);
}
function buildObjs() {
  const o = R.objs; o.length = 0;
  R.fuelC = World.containers.find(c => c.fixed === 'fuel');
  o.push({ x: S.homeBed.x, y: S.homeBed.y, label: ['نام', 'Sleep'], act: () => sleepAct(S.start) });
  o.push({ x: S.mallBed.x, y: S.mallBed.y, r: 30, label: ['نام', 'Sleep'], act: () => sleepAct({ x: S.mallBed.x, y: S.mallBed.y + 26 }) });
  o.push({ x: S.homeBench.x, y: S.homeBench.y, label: ['طوّر الملجأ', 'Upgrade shelter'], act: shelter });
  o.push({ x: S.radio.x, y: S.radio.y, label: ['الراديو', 'Radio'], act: radio });
  o.push({ x: S.mallBench.x, y: S.mallBench.y, label: ['الورشة', 'Workshop'], act: () => { if (!G.flags.gen) toast(tr('الورشة بلا كهرباء. المولدة عطلانة.', 'The workshop has no power. The generator is dead.')); else if (comp('mur').st === 'left') toast(tr('مرتضى راح.. ومحد يعرف يشتغل عليها.', 'Murtadha is gone... nobody else knows how to use it.')); else workshop(); } });
  o.push({ x: S.mallGen.x, y: S.mallGen.y, label: ['المولدة', 'Generator'], act: () => toast(G.flags.gen ? tr('المولدة تشتغل. صوتها أحلى من الموسيقى.', 'The generator is running. Sweeter than music.') : tr('مولدة المول عطلانة. يرادلها مرتضى و٣ قطع غيار.', 'The mall generator is dead. It needs Murtadha and 3 spare parts.')) });
  o.push({ x: S.pepsi.x, y: S.pepsi.y, r: 26, label: ['افحص الصندوق', 'Inspect the crate'], act: pepsi });
  for (const k in World.gates) o.push({ x: S[k].x, y: S[k].y, r: 44, label: ['افحص الصبّات', 'Inspect the barrier'], hide: () => G.flags[k], act: () => gateAct(k) });
  const lk = { police: ['key_police', S.policeDoor], armory: ['key_armory', S.armoryDoor], warehouse: [null, S.wareDoor] };
  for (const k in lk) o.push({ x: lk[k][1].x + (k === 'warehouse' ? 8 : 0), y: lk[k][1].y, r: 24, label: ['افتح الباب', 'Open the door'], hide: () => G.flags['lk_' + k], act: () => lockAct(k, lk[k][0]) });
}
function gateAct(k) {
  if (k === 'g1') toast(tr('صبّات كونكريتية. يرادلها سيارة تدفعها.', 'Concrete T-walls. Only a vehicle could shove these.'));
  else if (k === 'g2') { if (has('key_gate')) { openGate(k); toast(tr('انفتحت السيطرة! الطريق للكرادة مفتوح.', 'Checkpoint open! The road to Karrada is clear.')); } else toast(tr('مقفولة بقفل. مفتاحها أكيد بكابينة السيطرة.', 'Padlocked. The key must be in the checkpoint booth.')); }
  else if (k === 'g3') { if (has('cutter')) { openGate(k); toast(tr('قصّيت السلاسل. الطريق للمتنبي مفتوح.', 'Chains cut. The road to Mutanabbi is open.')); } else toast(tr('سلاسل حديد ثخينة.. يرادلها قاطع حديد.', 'Thick iron chains... needs a bolt cutter.')); }
  else toast(tr('صبّات الجسر ثكيلة. بس سيارة مدرّعة تكسرها.. ادعمها بسرعة.', 'The bridge barrier is heavy. Only an armored vehicle can break it... ram it at speed.'));
}
function openGate(k) { World.setGate(k, true); G.flags[k] = 1; R.shake = .5; sfx('crash'); for (let i = 0; i < 14; i++) R.fx.push({ k: 'puff', x: S[k].x + rand(-10, 10), y: S[k].y + rand(-34, 34), t: rand(.3, .8), c: '#aaa' }); save(true); }
function lockAct(k, key) {
  if (k === 'warehouse') { if (G.flags.boss) { World.setLock(k, true); G.flags['lk_' + k] = 1; sfx('door'); } else toast(tr('باب المخزن مسدود.. والحارس العملاق ما يخليك تقرب.', "The warehouse door is shut... and the giant guard won't let you near.")); return; }
  if (has(key)) { World.setLock(k, true); G.flags['lk_' + k] = 1; sfx('door'); toast(tr('انفتح الباب.', 'The door is open.')); } else toast(tr('مقفول. يرادله مفتاح.', 'Locked. You need a key.'));
}

// ---------------------------------------------------------------- zombies
const ZL = {};
function zlook(type, v) {
  const k = type + v; if (ZL[k]) return ZL[k];
  const o = { id: 'z' + k, z: 1, skin: ['#8fae7a', '#7fa08a', '#9ab07a'][v % 3], shirt: ['#7a4a4a', '#4a5d7a', '#6a6a55', '#5a4a6a', '#8a7a4a', '#3f5f4f'][v % 6], pants: ['#33373f', '#4a4033', '#2f3a33'][v % 3], hair: '#22201a' };
  const rb = ['#b9b4a0', '#8a8f96', '#a39070'][v % 3];
  if (type === 'cop') Object.assign(o, { shirt: '#dfe6ee', pants: '#1c2f55', hat: 'cap', hatc: '#f4f4f4', vest: '#b8e04a' });
  if (type === 'vendor') Object.assign(o, { robe: rb, shirt: rb, stache: 1 });
  if (type === 'fat') o.fat = 1;
  if (type === 'gen') Object.assign(o, { shirt: '#3d5a80', fat: 1, stache: 1 });
  if (type === 'soldier') Object.assign(o, { shirt: '#5a6b3a', pants: '#4a5a30', hat: 'helmet', hatc: '#4a5a30' });
  if (type === 'hassan') Object.assign(o, { robe: '#e9e4d6', shirt: '#e9e4d6', bald: 1, stache: 1, bag: 1, fat: 1 });
  if (type === 'colonel') Object.assign(o, { shirt: '#1c2f55', pants: '#1c2f55', hat: 'cap', hatc: '#1c2f55', fat: 1, stache: 1 });
  if (type === 'boss') Object.assign(o, { shirt: '#1b4fa3', pants: '#222', fat: 1, bald: 1 });
  return ZL[k] = o;
}
function mkZ(type, x, y) { const s = ZT[type]; return { type, s, x, y, hp: s.hp, look: zlook(type, (Math.random() * 6) | 0), dir: (Math.random() * 4) | 0, wob: rand(0, 6), kx: 0, ky: 0, fall: 0, scare: 0, alert: 0, at: .5, wt: rand(0, 3), wa: null, say: rand(3, 12), flash: 0, guard: 0 }; }
function ztype(zn) { const r = Math.random(); if (zn === 0) return r < .1 ? 'vendor' : r < .18 ? 'fat' : 'normal'; if (zn === 1) return r < .32 ? 'vendor' : r < .42 ? 'cop' : r < .49 ? 'gen' : r < .56 ? 'fat' : 'normal'; if (zn === 2) return r < .2 ? 'cop' : r < .3 ? 'fat' : r < .36 ? 'gen' : 'normal'; if (zn === 3) return r < .22 ? 'vendor' : r < .3 ? 'gen' : 'normal'; return r < .6 ? 'soldier' : 'normal'; }
const ZCOUNT = [22, 32, 34, 26, 36];
function spawnAll() {
  R.zombies.length = 0; const f = G.flags;
  if (f.ended === 'good') return;
  for (let zn = 0; zn < 5; zn++) { const n = Math.round(ZCOUNT[zn] * (1 + Math.min(G.day, 12) * .035)); for (let i = 0; i < n; i++) { const p = World.randOutdoor(zn); if (!p || hyp(p.x - G.x, p.y - G.y) < 170) continue; if (zn === 0 && !f.hassan && hyp(p.x - S.home.x, p.y - S.home.y) < 260) continue; R.zombies.push(mkZ(ztype(zn), p.x, p.y)); } }
  if (!f.hassan) { const z = mkZ('hassan', S.hassan.x, S.hassan.y); z.guard = 1; z.dir = 2; R.zombies.push(z); }
  if (!f.g2) for (let i = 0; i < 6; i++) R.zombies.push(mkZ('cop', S.cops.x + rand(-20, 20), S.cops.y + rand(-20, 30)));
  if (!f.colonel) R.zombies.push(mkZ('colonel', S.colonel.x, S.colonel.y));
  if (!f.boss) { const z = mkZ('boss', S.boss.x, S.boss.y); z.guard = 2; R.zombies.push(z); }
  for (let i = 0; i < 9; i++) R.zombies.push(mkZ('soldier', 190 * 16 + rand(20, 190), 40 * 16 + rand(0, 180)));
}
function solidAt(px, py, z) { const tx = px >> 4, ty = py >> 4; return World.solid(tx, ty) || (z === 1 && World.safe[ty * World.W + tx] === 1); }
function move(e, dx, dy, r, z) {
  const nx = e.x + dx; if (!(solidAt(nx - r, e.y - r, z) || solidAt(nx + r, e.y - r, z) || solidAt(nx - r, e.y + r - 1, z) || solidAt(nx + r, e.y + r - 1, z))) e.x = nx; else e.hitx = 1;
  const ny = e.y + dy; if (!(solidAt(e.x - r, ny - r, z) || solidAt(e.x + r, ny - r, z) || solidAt(e.x - r, ny + r - 1, z) || solidAt(e.x + r, ny + r - 1, z))) e.y = ny; else e.hity = 1;
}
function stepZ(z, a, sp, dt) { z.hitx = z.hity = 0; move(z, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt, 4, 1); z.wob += dt * (4 + sp * .25); z.dir = dirOf(Math.cos(a), Math.sin(a)); if (z.hitx && z.hity) z.wa = rand(0, 6.28); }
function updZombies(dt, title) {
  const px = G.x, py = G.y, night = isNight(), A = R.act; A.length = 0;
  const hidden = title || (G.inVeh < 0 && R.pSafe);
  for (const z of R.zombies) {
    const dx = px - z.x, dy = py - z.y, d = hyp(dx, dy); if (d > 560) continue; A.push(z);
    if (z.flash > 0) z.flash -= dt;
    if (z.kx || z.ky) { move(z, z.kx * dt, z.ky * dt, 4, 1); z.kx *= .86; z.ky *= .86; if (Math.abs(z.kx) + Math.abs(z.ky) < 4) z.kx = z.ky = 0; }
    if (z.fall > 0) { z.fall -= dt; continue; }
    if (z.scare > 0) { z.scare -= dt; stepZ(z, Math.atan2(-dy, -dx), z.s.sp * 2.4, dt); continue; }
    if (z.guard === 1) { if (d < 34 || G.weps.pipe != null) z.guard = 0; else { z.wob += dt * 1.5; z.say -= dt; if (z.say <= 0 && d < 150) { z.say = rand(4, 8); bubble(z, pick(L(ZLINES.hassan))); } continue; } }
    if (z.guard === 2) { if (d < 120) z.guard = 0; else { z.wob += dt; continue; } }
    z.alert -= dt;
    const sight = (night ? 128 : 96) * (R.pInside && !World.bAt(z.x >> 4, z.y >> 4) ? .5 : 1) * (z.type === 'boss' ? 2 : 1);
    if (!hidden && (d < sight || z.alert > 0)) {
      if (d < sight) z.alert = Math.max(z.alert, 3);
      stepZ(z, Math.atan2(dy, dx) + Math.sin(z.wob * .5) * .4, z.s.sp * (night ? 1.15 : 1), dt);
      if (Math.random() < dt * .04 && z.type !== 'boss') { z.fall = 1.3; bubble(z, pick(L(OUCH)), 1.2); }
      if (d < (z.type === 'boss' ? 20 : 12)) { z.at -= dt; if (z.at <= 0) { z.at = 1.1; zAttack(z); } }
    } else { z.wt -= dt; if (z.wt <= 0) { z.wt = rand(2, 6); z.wa = Math.random() < .3 ? null : rand(0, 6.28); } if (z.wa != null) stepZ(z, z.wa, z.s.sp * .5, dt); }
    z.say -= dt; if (z.say <= 0 && d < 170) { z.say = rand(6, 15); bubble(z, pick(L(ZLINES[z.type] || ZLINES.normal))); }
  }
  for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) { const a = A[i], b = A[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy; if (d2 < 64 && d2 > .01) { const d = Math.sqrt(d2), p = (8 - d) * .5 / d; move(a, -dx * p, -dy * p, 4, 1); move(b, dx * p, dy * p, 4, 1); } }
}
function zAttack(z) {
  if (G.inVeh >= 0) { const v = G.veh[G.inVeh]; v.hp -= z.s.dmg * .4 * (1 - v.up.armor * .3); sfx('hit'); return; }
  if (R.inv > 0) return; G.hp -= z.s.dmg; R.inv = .5; R.shake = .25; sfx('hurt'); $('#hurt').style.opacity = 1; setTimeout(() => $('#hurt').style.opacity = 0, 160);
  if (G.hp <= 0) die();
}
function hitZ(z, dmg, a, kb) {
  z.hp -= dmg; z.kx = Math.cos(a) * kb; z.ky = Math.sin(a) * kb; z.flash = .12; z.alert = 6; z.guard = 0; sfx('hit');
  R.fx.push({ k: 'puff', x: z.x, y: z.y - 9, t: .25, c: '#7a1a1a' }); if (z.hp <= 0) killZ(z);
}
function killZ(z) {
  const i = R.zombies.indexOf(z); if (i >= 0) R.zombies.splice(i, 1);
  for (let j = 0; j < 6; j++) R.fx.push({ k: 'puff', x: z.x + rand(-5, 5), y: z.y - rand(2, 14), t: rand(.25, .6), c: j % 2 ? '#5d7a3a' : '#7a1a1a' });
  G.kills++; G.dayKills++; const r = Math.random(), got = (id, n = 1) => { add(id, n); toast('+ ' + L(ITEMS[id].n) + (n > 1 ? ' ×' + n : ''), 2200); };
  if (z.type === 'hassan') { G.flags.hassan = 1; add('samoon', 2); toast(tr('أبو حسن وكع.. وكيس الصمون صار إلك. الله يرحمه، جان يطلبني ألف دينار.', 'Abu Hassan is down... and his bag of bread is yours. Rest in peace — I owed him a thousand dinars.'), 6500); save(true); }
  else if (z.type === 'colonel') { G.flags.colonel = 1; add('key_police'); toast(tr('العقيد وكع. أخذت مفتاح مركز الشرطة من حزامه.', 'The Colonel is down. Took the police station key from his belt.'), 5500); }
  else if (z.type === 'boss') { G.flags.boss = 1; R.shake = 1; toast(tr('العملاق وكع! باب المخزن صار بلا حارس.', 'The giant is down! The warehouse door is unguarded.'), 6000); add('scrap', 6); save(true); }
  else if (z.type === 'cop' && r < .28) got('ammo9', 3); else if (z.type === 'soldier' && r < .35) got('ammo7', 8); else if (z.type === 'vendor' && r < .22) got('dates'); else if (z.type === 'gen' && r < .5) got('parts'); else if (r < .2) got('scrap');
}

// ---------------------------------------------------------------- player
const bestWep = () => { let b = 'fist'; for (const w of WORDER) if (G.weps[w] != null && !WEAPONS[w].gun) b = w; return b; };
function cycleWeapon() { const have = WORDER.filter(w => w === 'fist' || G.weps[w] != null); G.cur = have[(have.indexOf(G.cur) + 1) % have.length]; sfx('click'); hud(); }
function attack() {
  if (R.atk > 0 || G.inVeh >= 0) return; const w = WEAPONS[G.cur], a = R.aim, ca = Math.cos(a), sa = Math.sin(a);
  if (w.gun) {
    if (!has(w.ammo)) { toast(tr('ماكو رصاص!', 'Out of ammo!')); R.atk = .4; sfx('click'); return; }
    take(w.ammo); R.atk = w.cd; sfx(G.cur === 'rifle' ? 'rifle' : 'shot');
    let hx = G.x, hy = G.y - 8, hit = null; const sx = hx, sy = hy;
    for (let s = 0; s < w.range && !hit; s += 4) {
      hx += ca * 4; hy += sa * 4; const tt = World.tiles[World.I(hx >> 4, hy >> 4)]; if (tt === 4 || tt === 7 || tt === 13 || tt === 11) break;
      for (const z of R.act) { const zr = z.type === 'boss' ? 13 : 7; if (Math.abs(z.x - hx) < zr && Math.abs(z.y - 9 - hy) < zr + 3) { hit = z; break; } }
    }
    R.fx.push({ k: 'line', x: sx + ca * 10, y: sy + sa * 10, x2: hx, y2: hy, t: .07 }); if (hit) hitZ(hit, w.dmg, a, 60);
    for (const z of R.zombies) if (hyp(z.x - G.x, z.y - G.y) < w.noise) z.alert = 7;
    tip('noise', 'صوت الطلق يجمّع الزومبي عليك.. استعمله للضرورة.', 'Gunfire attracts zombies... use it only when you must.');
  } else {
    R.atk = w.cd; R.swing = .18; sfx('swing'); let any = false;
    for (const z of R.act.slice()) { const dx = z.x - G.x, dy = z.y - G.y, d = hyp(dx, dy), zr = z.type === 'boss' ? 10 : 0; if (d > w.range + 6 + zr) continue; let da = Math.atan2(dy, dx) - a; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < 1.05 || d < 8) { hitZ(z, w.dmg, a, w.kb); any = true; } }
    if (any && G.cur !== 'fist') { G.weps[G.cur]--; if (G.weps[G.cur] <= 0) { delete G.weps[G.cur]; toast(tr('انكسر ' + L(w.n) + '!', L(w.n) + ' broke!')); G.cur = bestWep(); } }
  }
  G.dir = dirOf(ca, sa);
}
function updPlayer(dt) {
  const k = R.keys; let ix = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0), iy = (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0);
  { const wv = View3D.toWorld(ix, iy); ix = wv[0]; iy = wv[1]; }
  const pk = View3D.pick(R.mouse.x, R.mouse.y), wx = pk.x, wy = pk.y;
  if (R.mouse.r) { const dx = wx - G.x, dy = wy - G.y, d = hyp(dx, dy); if (d > 6) { ix = dx / d; iy = dy / d; } }
  const m = hyp(ix, iy); if (m > 1) { ix /= m; iy /= m; }
  if (G.camFollow !== 0) { if (G.inVeh >= 0) { const v = G.veh[G.inVeh]; if (v.sp > 25) View3D.follow(Math.PI / 2 - v.a, dt, 1.5); } else if (m > 0 && !R.mouse.r) View3D.follow(Math.atan2(ix, iy), dt, 1.1); }
  if (G.inVeh >= 0) { updVeh(dt, ix, iy, m); return; }
  if (R.mouse.t > 0) R.aim = Math.atan2(wy - G.y, wx - G.x);
  const run = (k.ShiftLeft || k.ShiftRight) && G.en > 0 && m > 0;
  const sp = (run ? 96 : 62) * (has('jacket') ? 1.05 : 1) * (G.en <= 0 ? .65 : 1);
  if (m > 0) { move(G, ix * sp * dt, iy * sp * dt, 5); G.fr += dt * (run ? 12 : 8); if (R.atk <= 0) G.dir = dirOf(ix, iy); if (run) G.en = Math.max(0, G.en - dt * .5); if (R.mouse.t <= 0) R.aim = Math.atan2(iy, ix); } else G.fr = 0;
  if ((R.mouse.l || k.Space) && R.atk <= 0) attack();
}
const maxHp = v => VEH[v.t].hp * (1 + v.up.armor * .5), maxFuel = v => VEH[v.t].tank + v.up.tank * 40;
function nearVeh(r = 60) { let b = -1, bd = r; G.veh.forEach((v, i) => { if (v.gone) return; const d = hyp(v.x - G.x, v.y - G.y); if (d < bd) { bd = d; b = i; } }); return b; }
function updVeh(dt, ix, iy, m) {
  const v = G.veh[G.inVeh], d = VEH[v.t], dead = (d.tank && v.fuel <= 0) || v.hp <= 0, max = d.sp * (dead ? .12 : 1);
  if (m > 0) { let da = Math.atan2(iy, ix) - v.a; da = Math.atan2(Math.sin(da), Math.cos(da)); const tr_ = d.turn * dt * (v.sp < 30 ? 1.6 : 1); v.a += clamp(da, -tr_, tr_); v.sp = Math.min(max, v.sp + d.acc * dt * (Math.abs(da) > 1.6 ? .25 : 1)); } else v.sp *= Math.pow(.15, dt);
  if (v.sp > max) v.sp = Math.max(max, v.sp - 200 * dt);
  const ox = v.x, oy = v.y; v.hitx = v.hity = 0; move(v, Math.cos(v.a) * v.sp * dt, Math.sin(v.a) * v.sp * dt, d.r);
  if (v.hitx || v.hity) {
    if (v.sp > 70) {
      const g4 = S.g4; if (!G.flags.g4 && Math.abs(v.x - g4.x) < 44 && Math.abs(v.y - g4.y) < 40) { if (v.up.armor > 0 || v.t === 'truck') { openGate('g4'); toast(tr('كسرت صبّات الجسر! الصوب الثاني مفتوح.', 'You smashed the bridge barrier! The other bank is open.'), 5000); } else tip('g4', 'السيارة ما تتحمّل.. درّعها عند مرتضى أول.', "The car can't take it... get it armored by Murtadha first."); }
      sfx('crash'); v.hp -= v.t === 'bike' ? 1 : 2; R.shake = .2;
    }
    v.sp *= .45;
  }
  if (d.tank) v.fuel = Math.max(0, v.fuel - hyp(v.x - ox, v.y - oy) * d.use);
  for (const z of R.act.slice()) { const dd = hyp(z.x - v.x, z.y - v.y); if (dd < d.r + 7 && v.sp > 45) { if (v.t === 'bike') { hitZ(z, 6, v.a, 130); v.sp *= .35; } else { hitZ(z, v.sp * .45, v.a, v.sp * 1.5); v.hp -= Math.max(.4, 2.5 - v.up.armor * 1.1); v.sp *= .84; } } }
  G.x = v.x; G.y = v.y; G.dir = dirOf(Math.cos(v.a), Math.sin(v.a));
  if (v.hp <= 0 && !v.brk) { v.brk = 1; toast(tr('السيارة عطلت! يرادلها تصليح عند مرتضى.', 'The vehicle broke down! Murtadha can repair it.')); }
  if (d.tank && v.fuel <= 0) tip('nofuel' + G.inVeh, 'خلص البانزين! افتح الحقيبة (I) واستعمل جليكان.', 'Out of fuel! Open your bag (I) and use a fuel can.');
}
function enterVeh(i) {
  const v = G.veh[i];
  if (v.t === 'kia' && comp('aj').st === 'none') return toast(tr('هاي كيا أبو جاسم.. استأذن منه أول.', "This is Abu Jasim's Kia... ask him first."));
  if (v.t === 'saipa' && !G.flags.saipa) return toast(tr('السايبا عطلانة. مرتضى يكدر يصلّحها (٣ قطع غيار).', 'The Saipa is dead. Murtadha can fix it (3 spare parts).'));
  if (v.t === 'truck' && !has('key_truck')) return toast(tr('مقفولة. سويچها أكيد بالمشجب.', 'Locked. The key must be in the armory.'));
  G.inVeh = i; G.lastVeh = i; v.sp = 0; sfx('door'); R.near = null;
  if (VEH[v.t].tank && v.fuel <= 0) toast(tr('ماكو بانزين! افتح الحقيبة (I) واستعمل جليكان.', 'No fuel! Open your bag (I) and use a fuel can.'));
  tip('drive', 'نفس أزرار المشي تسوق بيها — E: انزل — H: هورن', 'Same keys to drive as to walk — E: exit — H: horn');
}
function exitVeh() { const v = G.veh[G.inVeh]; v.sp = 0; const p = World.freeNear(v.x + Math.cos(v.a + 1.57) * 16, v.y + Math.sin(v.a + 1.57) * 16); G.x = p.x; G.y = p.y; G.inVeh = -1; sfx('door'); }
function horn() {
  if (G.inVeh < 0) return; const v = G.veh[G.inVeh]; sfx('horn'); if (v.t === 'bike') return bubble(G, tr('ترن ترن!', 'Ring ring!'), 1);
  bubble(G, tr('طاااط!', 'HOOONK!'), 1);
  for (const z of R.act) { const d = hyp(z.x - v.x, z.y - v.y); if (v.up.horn) { if (d < 170) z.scare = 4; } else if (d < 300) z.alert = 6; }
  if (!v.up.horn) tip('horn', 'الهورن العادي يجمّع الزومبي عليك! ركّب هورن مطوّر عند مرتضى.', 'A normal horn attracts zombies! Get the upgraded horn from Murtadha.');
}
function useItem(id) {
  const it = ITEMS[id]; if (!has(id)) return;
  if (it.fuel) { const i = G.inVeh >= 0 ? G.inVeh : nearVeh(); if (i < 0 || !VEH[G.veh[i].t].tank) return toast(tr('لازم تكون يم سيارة بيها خزان.', 'You need to be next to a vehicle with a tank.')); const v = G.veh[i]; v.fuel = Math.min(maxFuel(v), v.fuel + it.fuel); take(id); sfx('fix'); return toast(tr('عبّيت ' + L(VEH[v.t].n) + ' بانزين.', 'Refuelled the ' + L(VEH[v.t].n) + '.')); }
  if (it.food || it.water || it.hp || it.en) { take(id); G.food = Math.min(100, G.food + (it.food || 0)); G.water = Math.min(100, G.water + (it.water || 0)); G.hp = Math.min(100, G.hp + (it.hp || 0)); G.en = Math.min(100, G.en + (it.en || 0)); sfx('eat'); if (id === 'dolma') toast(tr('دولمة.. رجعتلي الروح.', 'Dolma... my soul is back.')); }
}
function quick(kind) { const list = kind === 'eat' ? (G.water < G.food ? ['water', 'tea', 'samoon', 'dates', 'can'] : ['samoon', 'dates', 'can', 'water']) : ['bandage', 'medkit']; const id = list.find(x => has(x)); if (id) { useItem(id); toast('− ' + L(ITEMS[id].n), 1500); } else toast(kind === 'eat' ? tr('ماكو أكل ولا ماي!', 'No food or water!') : tr('ماكو إسعافات!', 'No medical supplies!')); }
async function die() {
  if (R.dying) return; R.dying = 1; G.deaths++; G.hp = 0;
  await notebook(L([['~ ومات البطل. النهاية.', 'لا لا لا.. شنو مات؟ هاي قصتي واني حرّ بيها.', 'نرجّعه للملجأ.. ونكول جان كابوس داخل كابوس.'], ['~ And the hero died. The End.', "No no no... died? It's my story and I do what I want.", "Back to the shelter... we'll say it was a nightmare inside a nightmare."]]), { title: dayTitle() });
  if (G.inVeh >= 0) G.inVeh = -1; G.x = G.safe.x; G.y = G.safe.y; G.hp = 60; G.food = Math.max(G.food, 30); G.water = Math.max(G.water, 30); G.en = Math.max(G.en, 40);
  syncNpcs(); for (const n of R.npcs) if (n.follow) { n.x = G.x + rand(-14, 14); n.y = G.y + rand(8, 20); } spawnAll(); R.dying = 0; R.inv = 2;
}

// ---------------------------------------------------------------- companions
function seatsOf(v) { return VEH[v.t].seats + v.up.seats * 2 - 1; }
function updComps(dt) {
  let k = 0; const riding = G.inVeh >= 0, seats = riding ? seatsOf(G.veh[G.inVeh]) : 0;
  for (const e of R.npcs) {
    if (!e.follow) continue; k++; const id = e.id, c = comp(id);
    if (riding && k <= seats) { e.hidden = true; e.x = G.x; e.y = G.y; continue; }
    if (e.hidden) { e.hidden = false; const p = World.freeNear(G.x + rand(-18, 18), G.y + rand(-18, 18)); e.x = p.x; e.y = p.y; }
    let tx = G.x, ty = G.y, target = null, bd = id === 'sol' ? 125 : 70;
    if (id !== 'cat' && id !== 'noor' && id !== 'saif') for (const z of R.act) { const d = hyp(z.x - e.x, z.y - e.y); if (d < bd) { bd = d; target = z; } }
    e.atk -= dt;
    if (target) {
      const a = Math.atan2(target.y - e.y, target.x - e.x);
      if (id === 'sol') { if (e.atk <= 0) { e.atk = 1.1; R.fx.push({ k: 'line', x: e.x, y: e.y - 9, x2: target.x, y2: target.y - 9, t: .07 }); sfx('shot'); hitZ(target, 24, a, 50); e.dir = dirOf(Math.cos(a), Math.sin(a)); } target = null; }
      else { tx = target.x; ty = target.y; if (bd < 15 && e.atk <= 0) { e.atk = .8; hitZ(target, id === 'mur' ? 15 : 11, a, 90); } }
    }
    if (id === 'noor' && G.hp < 70 && G.inVeh < 0 && G.food > 0 && G.water > 0) G.hp = Math.min(70, G.hp + dt * 1.6);
    if (id === 'cat') { e.find -= dt; if (e.find <= 0) { e.find = rand(70, 120); const it = pick(['scrap', 'dates', 'bandage', 'ammo9', 'can', 'water']); add(it); bubble(e, tr('مياو!', 'Meow!'), 2); toast(tr('بسبوسة جابتلك: ', 'Basbousa brought you: ') + L(ITEMS[it].n)); } }
    if (id === 'saif' && Math.random() < dt * .03) bubble(e, pick(L([['شباب هذا زومبي حقيقي!', 'لا تنسون اللايك!', 'ترند.. أكيد ترند.'], ['Guys, a REAL zombie!', "Don't forget to like!", 'Trending... for sure.']])));
    const d = hyp(tx - e.x, ty - e.y), stop = target ? 11 : 16 + k * 9;
    if (!target && d > 115) { e.far += dt; if (e.far > 3.5 || d > 330) { const p = World.freeNear(G.x + rand(-20, 20), G.y + rand(-20, 20)); e.x = p.x; e.y = p.y; e.far = 0; } } else e.far = 0;
    if (riding && d > 90 && Math.random() < dt * .25) bubble(e, tr('انتظرنا!!', 'Wait for us!!'), 1.4);
    if (d > stop) { const sp = (riding ? 112 : d > 60 ? 94 : 62) * (id === 'cat' ? 1.15 : 1) * dt; move(e, (tx - e.x) / d * sp, (ty - e.y) / d * sp, 4); e.fr += dt * 9; e.dir = dirOf(tx - e.x, ty - e.y); } else e.fr = 0;
  }
}

// ---------------------------------------------------------------- loot
function openCont(c) {
  if (G.looted[c.id]) return toast(tr('فارغ.. فتّشته قبل.', 'Empty. Already searched.'));
  G.looted[c.id] = G.day; G.lootN++; const got = [], r = Math.random; let msg = null;
  const g = (id, n = 1) => { add(id, n); got.push(L(ITEMS[id].n) + (n > 1 ? ' ×' + n : '')); };
  if (c.fixed && !G.flags['fx' + c.id]) {
    G.flags['fx' + c.id] = 1;
    switch (c.fixed) {
      case 'homefridge': g('samoon'); g('water'); msg = tr('ثلاجة بيها صمونة وقنينة ماي ونص ليمونة. الليمونة عفتها للذكرى.', 'A fridge with one bread, one water bottle and half a lemon. Left the lemon for old times.'); break;
      case 'homecup': g('bandage'); g('invoice'); msg = tr('فاتورة مولدة. حتى بنهاية العالم يطلبوك فلوس.', 'A generator bill. Even at the end of the world, you owe money.'); break;
      case 'fuel': g('fuel'); g('scrap', 2); break;
      case 'gatekey': g('key_gate'); g('tea'); msg = tr('مفتاح السيطرة! ويمّه استكان چاي.. بعده حار. غريبة.', 'The checkpoint key! And a glass of tea next to it... still warm. Strange.'); break;
      case 'mallfood': g('can', 3); g('water', 2); break;
      case 'medicine': g('medicine'); g('bandage', 2); break;
      case 'pistol': G.weps.pistol = 1; G.flags.pistol = 1; G.cur = 'pistol'; got.push(L(WEAPONS.pistol.n)); g('ammo9', 18); break;
      case 'policeammo': g('ammo9', 14); g('medkit'); break;
      case 'rifle': G.weps.rifle = 1; G.flags.rifle = 1; G.cur = 'rifle'; got.push(L(WEAPONS.rifle.n)); g('ammo7', 90); break;
      case 'truckkey': g('key_truck'); break;
      case 'armoryammo': g('ammo7', 60); g('ammo9', 12); break;
    }
  } else switch (c.kind) {
    case 'fridge': if (r() < .2) { g('water'); msg = tr('ثلاجة بيها قنينة ماي ونص ليمونة. الليمونة عفتها.', 'A fridge with a water bottle and half a lemon. Left the lemon.'); } else { g(pick(['samoon', 'can', 'dates', 'samoon'])); if (r() < .6) g('water'); if (r() < .06) { g('dolma'); msg = tr('دولمة! بعدها زينة.. معجزة.', 'Dolma! Still good... a miracle.'); } } break;
    case 'cupboard': { const x = r(); if (x < .3) g('bandage'); else if (x < .55) g('scrap', 1 + (r() * 2 | 0)); else if (x < .7) g('dates', 2); else if (x < .8 && !has('jacket')) { g('jacket'); msg = tr('جاكيت رياضي من التسعينات. لبسته.. أحس نفسي أسرع.', "A 90s track jacket. Put it on... I feel faster."); } else if (x < .9) g('medkit'); else if (x < .95) g('tea'); } break;
    case 'shelf': g(pick(['can', 'water', 'samoon', 'can', 'dates'])); if (r() < .5) g(pick(['can', 'water', 'scrap'])); if (r() < .12) g('fuel'); if (r() < .15) g('tea'); break;
    case 'crate': g('scrap', 1 + (r() * 3 | 0)); if (r() < .4) g('parts'); if (r() < .25) g('can'); break;
    case 'trunk': if (r() < .38) g('fuel'); if (r() < .6) g('scrap', 1 + (r() * 2 | 0)); if (r() < .3) g('parts'); if (r() < .2) g('water'); if (!got.length) msg = tr('صندوق السيارة بي بس سبير منفّس.', 'The trunk holds nothing but a flat spare tire.'); break;
    case 'med': g('bandage', 1 + (r() * 2 | 0)); if (r() < .6) g('medkit'); break;
    case 'locker': g('ammo9', 3 + (r() * 5 | 0)); if (r() < .4) g('bandage'); break;
    case 'desk': if (r() < .5) g('scrap'); else msg = tr('أوراق معاملات.. الزومبي أرحم.', 'Government paperwork... the zombies are kinder.'); if (r() < .3) g('tea'); break;
  }
  if (got.length) { toast('+ ' + got.join(tr('، ', ', '))); sfx('pick'); }
  if (msg) toast(msg, 5500); else if (!got.length) toast(pick(L(EMPTY)));
}
async function takePickup(p) {
  G.taken[p.id] = 1; sfx('pick');
  if (p.w) { G.weps[p.w] = WEAPONS[p.w].dur; G.cur = p.w; toast('+ ' + L(WEAPONS[p.w].n)); if (p.w === 'pipe') { G.flags.pipe = 1; bubble(G, tr('بوري! هسه صرنا نحچي.', "A pipe! Now we're talking."), 3); } }
  else if (p.page != null) { G.pages.push(p.page); await notebook(L(PAGES[p.page]), { title: tr('ورقة مشكوكة (' + G.pages.length + '/5)', 'Torn page (' + G.pages.length + '/5)') }); if (G.pages.length === 5) toast(tr('جمّعت كل الأوراق المشكوكة.. القصة يمكن إلها نهاية ثانية.', 'You found every torn page... the story may have another ending.'), 7000); }
}

// ---------------------------------------------------------------- scripts
const afford = c => Object.keys(c).every(k => has(k, c[k])), pay = c => Object.keys(c).forEach(k => take(k, c[k]));
const costStr = c => Object.keys(c).map(k => L(ITEMS[k].n) + ' ×' + c[k]).join(' + ');
function join(id, trust) { const c = comp(id); c.st = 'with'; c.trust = trust; c.joinDay = G.day; c.x = null; syncNpcs(); toast(tr(L(NPC[id].n) + ' صار وياك!', L(NPC[id].n) + ' joined you!'), 4500); sfx('fix'); }
const trustLine = t => t >= 80 ? tr('وياك للموت.. بس خلّيها بعيدة شوية.', "With you till death... just keep that far away.") : t >= 50 ? tr('ماشي الحال. لحد هسه ما ندمت.', "We're fine. No regrets so far.") : t >= 25 ? tr('الصراحة؟ دا أفكّر.', "Honestly? I'm thinking about it.") : tr('إذا بقينا هيج.. أعوفك.', "If this goes on... I'm leaving.");
async function compMenu(id) {
  const c = comp(id), o = [c.st === 'with' ? tr('ابقى بالملجأ', 'Stay at the shelter') : tr('تعال وياي', 'Come with me')];
  if (id !== 'cat') o.push(tr('شلون الثقة بيناتنه؟', 'How are we doing?'));
  if (id === 'mur' && G.flags.gen) o.push(tr('افتح الورشة', 'Open the workshop'));
  if (id === 'noor') o.push(tr('عالجيني', 'Patch me up'));
  o.push(tr('ماكو شي', 'Never mind'));
  const i = await say(id, pick(L(GREET[id])), o), ch = o[i];
  if (i === 0) { c.st = c.st === 'with' ? 'home' : 'with'; c.x = null; syncNpcs(); toast(c.st === 'with' ? tr(L(NPC[id].n) + ' يمشي وياك.', L(NPC[id].n) + ' is following you.') : tr(L(NPC[id].n) + ' رجع للملجأ.', L(NPC[id].n) + ' went back to the shelter.')); }
  else if (ch === tr('شلون الثقة بيناتنه؟', 'How are we doing?')) await say(id, trustLine(c.trust) + '  (' + Math.round(c.trust) + '%)');
  else if (ch === tr('افتح الورشة', 'Open the workshop')) await workshop();
  else if (ch === tr('عالجيني', 'Patch me up')) { if (G.hp >= 95) await say('noor', tr('ما بيك شي. روح اشرب ماي.', "You're fine. Go drink some water.")); else if (c.healDay === G.day) await say('noor', tr('عالجتك اليوم.. اني دكتورة مو مصنع.', "I already treated you today... I'm a doctor, not a factory.")); else { c.healDay = G.day; G.hp = Math.min(100, G.hp + 55); sfx('fix'); await say('noor', tr('اكعد.. لا تتحرك. خلص، صرت مثل الحصان.', "Sit... don't move. Done, strong as a horse.")); } }
}
const SC = {
  async aj() {
    const c = comp('aj');
    if (c.st !== 'none') return compMenu('aj');
    if (!G.flags.ajMet) {
      G.flags.ajMet = 1;
      await say('aj', tr('ولك إنت عايش؟! الحمد لله.. تعال تعال. اني أبو جاسم، سايق كيا من ثلاثين سنة.', "You're alive?! Thank God... come, come. I'm Abu Jasim — thirty years driving a Kia."));
      await say('aj', tr('الزومبيات؟ عادي. نفس زحمة الباب الشرقي، بس ذولة على الأقل ما يزمّرون.', "The zombies? Normal. Same as rush hour at Bab Al-Sharqi — at least these ones don't honk."));
      await say('aj', tr('الكيا مصفّرة، ما بيها قطرة. جيبلي جليكان بانزين وأفتحلك الصبّات للسوق.', "The Kia is bone dry. Bring me a can of fuel and I'll shove those T-walls open to the market."));
      return;
    }
    const filled = G.veh[2].fuel >= 30;
    if (!has('fuel') && !filled) return say('aj', tr('وين البانزين؟ دوّر بصناديق السيارات المتروكة عالشارع.', "Where's the fuel? Check the trunks of the abandoned cars on the road."));
    if (filled) await say('aj', tr('شفتك عبّيتها بإيدك! هيج الشباب.', 'I saw you fill her up yourself! That is the spirit.')); else take('fuel');
    G.veh[2].fuel = Math.max(G.veh[2].fuel, 45); G.weps.wrench = WEAPONS.wrench.dur; add('kettle');
    await say('aj', tr('عاشت إيدك! اصعد ورا، ولا تلعب بالراديو.', "Bless your hands! Hop in the back, and don't touch the radio."));
    await say('aj', tr('وهاي عتلة، أحسن من بوريّك. والقوري وياك أمانة.. كل صبح استكان چاي، وإلا ما أتحرك.', "And here's a crowbar, better than your pipe. Keep my teapot safe... a glass of tea every morning, or I don't move."));
    openGate('g1'); G.cur = 'wrench'; join('aj', 62);
    toast(tr('أبو جاسم دفع الصبّات بالكيا! الطريق للسوق مفتوح.', 'Abu Jasim shoved the T-walls with the Kia! The road to the market is open.'), 5500);
  },
  async noor() {
    const f = G.flags, c = comp('noor');
    if (f.murHealed) return c.st === 'none' ? (await say('noor', tr('خلّصت شغلي هنا. إذا تريد دكتورة وياك.. اني جاهزة.', "My work here is done. If you want a doctor with you... I'm ready.")), join('noor', 65)) : compMenu('noor');
    if (!f.noorMet) {
      f.noorMet = 1;
      await say('noor', tr('وكّف! خلّيني أشوف عينك.. لا، مو زومبي. بس وجهك تعبان.', "Stop! Let me see your eyes... no, not a zombie. You just look tired."));
      await say('noor', tr('اني نور، طالبة طب.. جنت سادس مرحلة من صارت السالفة. مرتضى وكعت عليه المولدة وانكسرت رجله.', "I'm Noor, a medical student... sixth year when it all happened. The generator fell on Murtadha and broke his leg."));
      await say('noor', tr('أحتاج دوه من الصيدلية اللي كبال المول. بس الزومبيات هناك هواي. تجيبه؟', 'I need medicine from the pharmacy across the street. But there are a lot of zombies. Will you get it?'));
      return;
    }
    if (!has('medicine')) return say('noor', tr('الصيدلية كبال المول بالضبط، عبر الشارع. الدوه بالرف الأبيض.', 'The pharmacy is right across from the mall. The medicine is on the white shelf.'));
    take('medicine'); f.murHealed = 1;
    await say('noor', tr('هذا هو! عفية عليك.', "That's it! Well done."));
    await say('mur', tr('آآآخ.. إي.. هسه أحسن. والله لو ما إنتو جان صرت زومبي من الوجع.', "Aaagh... yes... better now. I swear without you two I'd have turned zombie from the pain alone."));
    await say('noor', tr('من اليوم اني وياك. بس وعد: تشرب ماي، وما تاكل شي منتهي.', "From today I'm with you. But promise: drink water, and don't eat anything expired."));
    join('noor', 66);
  },
  async mur() {
    const f = G.flags, c = comp('mur');
    if (!f.murHealed) return say('mur', tr('آخ رجلي.. وكعت عليّه المولدة. تخيّل، ثلاثين سنة أصلّح مولدات وبالأخير وحدة تغدر بيّه.', 'Ow, my leg... the generator fell on me. Imagine, thirty years fixing generators and one finally betrays me.'));
    if (!f.gen) {
      if (!f.murAsk) { f.murAsk = 1; await say('mur', tr('اني مرتضى، أبو المولدات. مولدة المول أكدر أشغّلها، بس يرادلي ٣ قطع غيار. تلكاها بصناديق السيارات وبالصناديق الخشب.', "I'm Murtadha, the generator man. I can start the mall generator, but I need 3 spare parts. Look in car trunks and wooden crates.")); return; }
      if (!has('parts', 3)) return say('mur', tr('بعد ما كملن. ٣ قطع غيار، مو أقل. (عندك ' + (G.inv.parts || 0) + ')', "Not enough yet. 3 spare parts, no less. (You have " + (G.inv.parts || 0) + ')'));
      take('parts', 3); f.gen = 1; add('cutter'); sfx('fix'); R.shake = .3;
      await say('mur', tr('دررررر.. اشتغلت! سمعت؟ هذا أحلى صوت بالعراق.', 'Brrrrr... it runs! Hear that? The sweetest sound in Iraq.'));
      await say('mur', tr('الورشة صارت تشتغل: أصلّح، أدرّع، أركّب. وهذا قاطع حديد، تحتاجه للسلاسل اللي عالطريق للمتنبي. والراديو هم اشتغل، جرّبه.', "The workshop is live: I repair, armor, upgrade. Here's a bolt cutter for the chains on the road to Mutanabbi. The radio works now too — try it."));
      if (c.st === 'none') join('mur', 64);
      return;
    }
    if (c.st === 'none') return join('mur', 64);
    return compMenu('mur');
  },
  async cat() {
    const c = comp('cat'); if (c.st !== 'none') return compMenu('cat');
    if (!has('can')) return say('cat', tr('*تباوع عليك باحتقار* (يمكن تريد معلبات)', '*looks at you with contempt* (maybe she wants canned food)'));
    take('can'); await say('cat', tr('مياو. (ترجمة: زين.. أجي وياك. بس لا تتعوّد)', "Meow. (translation: fine... I'll come. Don't get used to it)")); join('cat', 60);
  },
  async saif() {
    const c = comp('saif'); if (c.st !== 'none') return compMenu('saif');
    await say('saif', tr('هلو شباب! وياكم سيف من قلب الحدث! لحظة.. إنت حقيقي؟ مو زومبي؟', "Hey guys! Saif here, live from the scene! Wait... you're real? Not a zombie?"));
    const i = await say('saif', tr('خلّيني أمشي وياك يومين! أصوّرك وانت تضرب زومبي، نطلع ترند عالمي!', "Let me tag along for two days! I'll film you smashing zombies — we'll go viral worldwide!"), [tr('تعال.. بس لا تصيّح', 'Come... just keep it down'), tr('لا شكراً، عندي مشاكل كفاية', 'No thanks, I have enough problems')]);
    if (i === 0) join('saif', 50); else { G.flags.saifNo = 1; await say('saif', tr('خسرت شهرة يا معوّد!', 'You just lost fame, my friend!')); syncNpcs(); }
  },
  async sol() {
    const c = comp('sol'); if (c.st !== 'none') return compMenu('sol');
    if (!G.flags.solMet) { G.flags.solMet = 1; await say('sol', tr('وكّف! منو؟.. آه، بشر. الحمد لله. اني الجندي حسن، محاصر هنا من أسبوعين. آكل صمون عسكري.. والصمون العسكري أقسى من الزومبي.', "Halt! Who goes... ah, a human. Thank God. Private Hassan — trapped here two weeks. Eating army bread... which is tougher than the zombies.")); }
    if (has('key_armory') || G.flags.lk_armory) { await say('sol', tr('تريدني وياك؟ حاضر. بس طلعني من هنا.', 'Want me along? Yes sir. Just get me out of here.')); return join('sol', 60); }
    const i = await say('sol', tr('مفتاح المشجب وياي. بس اني مجروح.. عندك إسعافات؟', "I have the armory key. But I'm wounded... got a medkit?"), [tr('تفضّل إسعافات', 'Here, a medkit'), tr('بس انطيني المفتاح', 'Just give me the key')]);
    if (i === 0 && has('medkit')) { take('medkit'); add('key_armory'); await say('sol', tr('عاشت إيدك. هاك المفتاح.. واني وياك، سلاحي وياي.', "Bless you. Here's the key... and I'm with you, rifle and all.")); join('sol', 70); }
    else { if (i === 0) toast(tr('ما عندك إسعافات!', "You don't have a medkit!")); add('key_armory'); await say('sol', tr('هاك.. اخذه. اني أبقى هنا لحد ما أتحسن. (ارجعله بإسعافات إذا تريده وياك)', "Here... take it. I'll stay until I heal. (Come back with a medkit if you want him along)")); }
  },
  async haji() {
    for (;;) {
      const tds = [[{ can: 2 }, 'ammo9', 8], [{ scrap: 3 }, 'dates', 3], [{ scrap: 4 }, 'fuel', 1], [{ dates: 3 }, 'water', 2], [{ scrap: 5 }, 'medkit', 1]];
      const o = tds.map(t => costStr(t[0]) + '  ←  ' + L(ITEMS[t[1]].n) + ' ×' + t[2]); o.push(tr('الله وياك حجي', 'Take care, Haji'));
      const i = await say('haji', tr('هلا بالعزيز. السوك ما يوكف حتى لو الدنيا خربت. شتريد تبادل؟', 'Welcome, dear. The market never stops, even when the world does. What will you trade?'), o);
      if (i >= tds.length) return; const t = tds[i];
      if (!afford(t[0])) { await say('haji', tr('عمّي ما عندك. الدَّين ممنوع والعتب مرفوع.', "Son, you don't have it. No credit, no hard feelings.")); continue; }
      pay(t[0]); add(t[1], t[2]); sfx('pick'); toast('+ ' + L(ITEMS[t[1]].n) + ' ×' + t[2]);
    }
  },
  async umali() {
    if (G.flags.umali) return say('umali', tr('أكلت؟ وجهك أصفر. اكعد أسويلك شي.', "Have you eaten? You look pale. Sit, I'll make you something."));
    const i = await say('umali', tr('يمّه إنت ابن الجيران؟ الحمد لله. والله عطشانة من البارحة.. عندك قنينتين ماي؟', "Dear, aren't you the neighbors' boy? Thank God. I've been thirsty since yesterday... do you have two bottles of water?"), [tr('تفضلي خالة (ماي ×٢)', 'Here you go, Auntie (water ×2)'), tr('والله ما عندي', "I'm sorry, I don't")]);
    if (i === 0 && has('water', 2)) { take('water', 2); G.flags.umali = 1; add('dolma', 2); await say('umali', tr('الله يحفظك. هاك دولمة، طابختها قبل ما تصير السالفة.. وبعدها أحسن من أكل المطاعم. واني أسكن ببيتك وأخبزلكم كل يوم.', "God keep you. Here's dolma, cooked before it all happened... still better than restaurant food. I'll stay at your house and bake for you every day.")); syncNpcs(); }
    else { if (i === 0) toast(tr('ما عندك قنينتين ماي!', "You don't have two bottles!")); await say('umali', tr('ميخالف يمّه.. الله كريم.', "It's alright, dear... God is generous.")); }
  },
  async book() {
    const f = G.flags;
    if (!f.book) {
      await say('book', tr('أهلاً بالقارئ الأخير ببغداد. الزومبيات ما يدخلون المكتبة.. ولا قبل جانوا يدخلون.', "Welcome, last reader in Baghdad. The zombies never enter the bookshop... they never did before, either."));
      await say('book', tr('تسأل عن السالفة؟ كلها بدت من مخزن المشروبات عبر الجسر. قريت بهذا الكتاب: "الغاز إذا عتّك.. يصير شي ثاني".', 'Asking how it began? It all started at the drinks warehouse across the bridge. I read it in this book: "When the fizz grows old... it becomes something else."'));
      await say('book', tr('صبّات الجسر ما تنكسر إلا بسيارة مدرّعة. خلّي مرتضى يدرّعلك وحدة. وهاك الكتاب، هدية.', 'The bridge barrier only breaks to an armored vehicle. Have Murtadha armor one for you. And take the book — a gift.'));
      f.book = 1; add('book'); return;
    }
    return say('book', pick(L([['خير جليس بالزمان كتاب.. وخير سلاح بوري.', 'إذا لكيت زومبي يقرا.. عوفه، هذا واحد منّا.', 'الكتب ما تنباع هالأيام. مثل قبل بالضبط.'], ['The best companion is a book... the best weapon, a pipe.', "If you see a zombie reading... leave him, he's one of us.", "Books don't sell these days. Exactly like before."]])));
  }
};
async function workshop() {
  for (;;) {
    const lv = G.lastVeh, vi = G.inVeh >= 0 ? G.inVeh : (lv >= 0 && !G.veh[lv].gone && hyp(G.veh[lv].x - G.x, G.veh[lv].y - G.y) < 520 ? lv : nearVeh(420)), v = vi >= 0 && !G.veh[vi].gone ? G.veh[vi] : null, vn = v ? L(VEH[v.t].n) : tr('ماكو سيارة قريبة', 'no vehicle nearby'), o = [];
    const A = (label, cost, fn) => o.push({ label: label + '  —  ' + costStr(cost), cost, fn });
    if (Object.keys(G.weps).some(k => WEAPONS[k].dur && G.weps[k] < WEAPONS[k].dur)) A(tr('صلّح كل الأسلحة', 'Repair all weapons'), { scrap: 2 }, () => { for (const k in G.weps) if (WEAPONS[k].dur) G.weps[k] = WEAPONS[k].dur; });
    if (!G.flags.saipa) A(tr('صلّح السايبا المتروكة يم المول', 'Fix the abandoned Saipa by the mall'), { parts: 3 }, () => { G.flags.saipa = 1; G.veh[3].fuel = 35; });
    if (v) {
      if (v.hp < maxHp(v)) A(tr('صلّح ', 'Repair ') + vn, { scrap: 3 }, () => { v.hp = maxHp(v); v.brk = 0; });
      if (v.up.armor < 2 && v.t !== 'bike') A(tr('تدريع ', 'Armor for ') + vn + ' (' + v.up.armor + '/2)', { scrap: 6, parts: 2 }, () => { v.up.armor++; v.hp = maxHp(v); });
      if (VEH[v.t].tank && v.up.tank < 2) A(tr('خزان أكبر ', 'Bigger tank ') + '(' + v.up.tank + '/2)', { scrap: 4 }, () => v.up.tank++);
      if (!v.up.horn && v.t !== 'bike') A(tr('هورن يخرّع الزومبي', 'Zombie-scaring horn'), { scrap: 3, parts: 1 }, () => v.up.horn = 1);
      if (v.up.seats < 1 && v.t !== 'bike') A(tr('مكان ركاب زيادة', 'Extra seats'), { scrap: 4 }, () => v.up.seats++);
    }
    const labels = o.map(x => x.label); labels.push(tr('خلص، شكراً', "That's all, thanks"));
    const i = await say('mur', tr('شتريد أسويلك؟  (السيارة: ' + vn + ')', 'What do you need?  (Vehicle: ' + vn + ')'), labels); if (i >= o.length) return;
    if (!afford(o[i].cost)) { await say('mur', tr('ما عندك كفاية.. مو بلاش الشغل عمّي.', "You don't have enough... I don't work for free, pal.")); continue; }
    pay(o[i].cost); o[i].fn(); sfx('fix'); toast(tr('تم ✓', 'Done ✓'));
  }
}
async function shelter() {
  for (;;) {
    const s = G.shel, o = [];
    if (!s.bar) o.push([tr('سدّ الشبابيك بالخشب (نوم أحسن)', 'Board up the windows (better sleep)'), { scrap: 5 }, 'bar']);
    if (!s.tank) o.push([tr('خزان ماي عالسطح (ماي كل يوم)', 'Roof water tank (water every day)'), { scrap: 4 }, 'tank']);
    if (!s.garden) o.push([tr('ازرع بالحديقة (أكل كل يوم)', 'Plant the garden (food every day)'), { scrap: 4, water: 2 }, 'garden']);
    if (!s.gen) o.push([tr('شغّل مولدة البيت (ضوه بالليل)', 'Start the house generator (light at night)'), { scrap: 6, fuel: 1 }, 'gen']);
    if (!o.length) return toast(tr('الملجأ كامل.. والكمال لله.', 'The shelter is complete... well, as complete as it gets.'));
    const labels = o.map(x => x[0] + '  —  ' + costStr(x[1])); labels.push(tr('مو هسه', 'Not now'));
    const i = await say('me', tr('شنو أطوّر بالبيت؟', 'What should I upgrade at home?'), labels); if (i >= o.length) return;
    if (!afford(o[i][1])) { toast(tr('ما عندك كفاية مواد.', 'Not enough materials.')); continue; }
    pay(o[i][1]); s[o[i][2]] = 1; sfx('fix'); toast(tr('تم ✓', 'Done ✓'));
  }
}
async function radio() {
  if (!G.flags.gen) return toast(tr('الراديو ساكت.. ماكو كهرباء.', 'The radio is silent... no power.'));
  if (!G.flags.radio) {
    G.flags.radio = 1;
    await say(tr('الراديو', 'Radio'), tr('كششش.. إلى كل من يسمعنا.. كششش.. المصدر.. مخزن المشروبات.. عبر الجسر.. كششش..', "Kshhh... to anyone listening... kshhh... the source... the drinks warehouse... across the bridge... kshhh..."));
    await say(tr('الراديو', 'Radio'), tr('..ومركز شرطة الكرادة بي سلاح.. المفتاح عند العقيد.. والعقيد.. كششش.. ما رايح يتقاعد.', "...Karrada police station has weapons... the Colonel has the key... and the Colonel... kshhh... is never retiring."));
    return say('me', tr('مخزن مشروبات؟ شنو علاقة المشروبات بالزومبي؟ لازم أعرف.', 'A drinks warehouse? What do drinks have to do with zombies? I have to find out.'));
  }
  return say(tr('الراديو', 'Radio'), pick(L([['كششش.. نشرة الأحوال الجوية: حار. كششش.. باجر: حار.', 'كششش.. وزارة الكهرباء تعتذر عن.. كششش.. كلشي.', 'كششش.. أغنية قديمة.. كششش..'], ['Kshhh... weather report: hot. Kshhh... tomorrow: hot.', 'Kshhh... the Ministry of Electricity apologises for... kshhh... everything.', 'Kshhh... an old song... kshhh...']])));
}
async function pepsi() {
  const f = G.flags; if (f.ended) return toast(tr('صندوق البيبسي المنتهي. بعده يفوّر.', 'The expired Pepsi crate. Still fizzing.'));
  await say('me', tr('صندوق بيبسي.. تاريخ الانتهاء: ٢٠٠٣.', 'A crate of Pepsi... expiry date: 2003.'));
  await say('me', tr('وورقة مكتوب بيها: "تحذير: لا تفتح. الغاز مالته صار.. شي ثاني."', 'And a note: "WARNING: do not open. The fizz has become... something else."'));
  await say('me', tr('يعني واحد فتح علبة منتهية من ٢٠٠٣ بالسوك، شربها، تجشّأ.. وكلمن شمّها تحوّل. هاي هي كل السالفة؟!', "So someone opened a can expired since 2003 at the market, drank it, burped... and everyone who smelled it turned. THAT's the whole story?!"));
  let kind = 'sad';
  if (here('noor')) { kind = 'good'; await say('noor', tr('لحظة.. الغاز الفاسد يتعادل ويه مادة التانين. يعني.. چاي. چاي ثكيل، مخدّر زين.', 'Wait... spoiled fizz is neutralised by tannin. Meaning... tea. Strong, properly brewed tea.')); if (here('aj')) await say('aj', tr('كلتلكم القوري ينفع! محد يسمعني!', 'I TOLD you the teapot matters! Nobody listens to me!')); }
  else await say('me', tr('لو أكو واحد يفتهم بالدوه وياي.. جان عرفنا شنسوي.', 'If only someone who understands medicine were with me... we would know what to do.'));
  if (G.pages.length >= 5) { const i = await say('me', tr('الأوراق المشكوكة الخمسة كلها وياي. أحس القصة تريد تخلص بطريقة ثانية..', 'I have all five torn pages. I feel the story wants to end another way...'), [tr('سدّ الدفتر', 'Close the notebook'), tr('كمّل القصة', 'Keep the story going')]); if (i === 0) kind = 'secret'; }
  f.ended = kind; await notebook(L(END[kind](G)), { title: tr('الصفحة الأخيرة', 'The Last Page') });
  if (kind === 'good') R.zombies.length = 0;
  save(true); await aboutPanel(true);
  toast(tr('تكدر تكمّل تلعب وتستكشف بغداد براحتك.', 'You can keep playing and exploring Baghdad freely.'), 7000);
}

// ---------------------------------------------------------------- day cycle
async function sleepAct(spot) {
  const h = G.time % 24; if (h >= 6 && h < 18 && G.en > 35) return toast(tr('بعد وكت.. ما نعسان. (تنام بعد المغرب أو إذا تعبان)', 'Not sleepy yet. (Sleep after sunset or when exhausted)'));
  const i = await say('me', tr('أنام لباجر الصبح؟', 'Sleep until morning?'), [tr('إي، نام', 'Yes, sleep'), tr('لا بعدين', 'Not yet')]);
  if (i === 0) { G.safe = { x: spot.x, y: spot.y }; nextDay(true); }
}
async function nextDay(slept) {
  if (R.nexting) return; R.nexting = 1; R.busy++; $('#fade').classList.add('on'); await wait(650);
  const notes = [], dk = G.dayKills; G.dayKills = 0; G.day++; G.time = 6;
  if (slept) { G.en = 100; G.hp = Math.min(100, G.hp + (G.shel.bar ? 45 : 25)); } else G.en = Math.max(G.en, 35);
  G.food = Math.max(0, G.food - 8); G.water = Math.max(0, G.water - 10);
  if (G.shel.tank) { add('water'); notes.push(tr('خزان السطح نطاني قنينة ماي.', 'The roof tank gave me a bottle of water.')); }
  if (G.shel.garden) { add('dates', 2); notes.push(tr('الحديقة طلّعت تمر. الأرض بعدها تحبّنه.', 'The garden gave dates. The land still loves us.')); }
  if (G.flags.umali) { add('samoon'); notes.push(tr('أم علي خبزتلنا خبز حار.', 'Um Ali baked us hot bread.')); }
  if (has('kettle') && here('aj')) { add('tea'); notes.push(tr('أبو جاسم خدّر چاي. يكول "بلا چاي ماكو قيادة".', 'Abu Jasim brewed tea. He says "no tea, no driving".')); }
  for (const id of COMPS) {
    const c = comp(id); if (!here(id)) continue; const nm = L(NPC[id].n);
    if (id === 'saif' && G.day - c.joinDay >= 2) { c.st = 'left'; notes.push(tr('سيف عافنه. كال "رايح أسوي بث مباشر ويه الزومبي". الله وياه.', 'Saif left. Said he is "going live with the zombies". Godspeed.')); if (has('can')) { take('can'); notes.push(tr('..وأخذ علبة معلبات وياه. الوغد.', '...and took a can of food with him. The rascal.')); } else { add('ammo9', 5); notes.push(tr('بس عاف النه رصاص هدية.', 'But he left us some ammo as a gift.')); } continue; }
    const fid = (id === 'cat' && has('can')) ? 'can' : FOODS.find(x => has(x));
    if (fid) { take(fid); c.trust = Math.min(100, c.trust + 4); } else { c.trust -= 14; notes.push(tr(nm + ' بقى بلا أكل.. وجهه ما يطمّن.', nm + ' went hungry... not a happy face.')); }
    if (c.trust <= 0) { c.st = 'left'; notes.push(L(LEAVE[id])); if (id === 'aj') { G.veh[2].gone = 1; if (G.inVeh === 2) G.inVeh = -1; } }
  }
  for (const k in G.looted) if (!World.containers[k].fixed && Math.random() < .1) delete G.looted[k];
  syncNpcs(); spawnAll(); await wait(250); $('#fade').classList.remove('on'); R.busy--; sfx('day');
  const lines = (DIARY[G.day] ? L(DIARY[G.day]) : L(pick(DGEN))).slice();
  if (!slept) lines.unshift(tr('ما نمت البارحة. عيوني مثل الطماطة.', "Didn't sleep last night. My eyes look like tomatoes."));
  if (dk > 0) lines.push(tr('أمس طيّحت ' + dk + ' زومبي. ' + (dk > 15 ? 'صرت محترف.' : 'مو بطّال.'), 'Dropped ' + dk + ' zombies yesterday. ' + (dk > 15 ? 'Going pro.' : 'Not bad.')));
  await notebook(lines.concat(notes), { title: dayTitle() });
  for (const id of ['aj', 'noor', 'mur', 'cat']) {
    const c = comp(id); if (!here(id) || c.asked || G.day - c.joinDay < 2) continue; c.asked = 1; const [item, n, q, ok, no] = REQ[id];
    const i = await say(id, L(q), [tr('تفضّل (' + L(ITEMS[item].n) + ' ×' + n + ')', 'Here (' + L(ITEMS[item].n) + ' ×' + n + ')'), tr('ما أكدر هسه', "I can't right now")]);
    if (i === 0 && has(item, n)) { take(item, n); c.trust = Math.min(100, c.trust + 20); await say(id, L(ok)); } else { if (i === 0) toast(tr('ما عندك!', "You don't have it!")); c.trust -= 15; await say(id, L(no)); }
    break;
  }
  R.nexting = 0; save(true);
}


// ---------------------------------------------------------------- intro time-lapse: "Day zero, an ordinary city"
const CIVC = ['#3b6ea5', '#8a3a3a', '#4a7a4a', '#c9c2b0', '#6a5a8a', '#b08a3a', '#2f3440', '#a05a2a'];
function introLapse() {
  return new Promise(res => {
    const hx = S.home.x, civ = [], cars = [], L = { civ, cars, t: 14.2, done: false, end: 0, res };
    R.zombies.length = 0; R.act.length = 0; R.bubbles.length = 0; R.fx.length = 0;
    const rows = [53 * 16 + 8, 58 * 16 + 8, 19 * 16 + 8, 22 * 16 + 8];
    for (let i = 0; i < 46; i++) { const robe = i % 5 === 0, c = CIVC[i % CIVC.length];
      civ.push({ x: rand(3 * 16, 54 * 16), y: rows[i % 2 === 0 ? 0 : (i % 4 === 1 ? 1 : (i % 8 === 3 ? 2 : 1))] + rand(-5, 5), d: i % 2 ? 1 : -1, sp: rand(34, 52), z: 0, fall: 0, hide: false, night: i % 3 !== 0, turn: rand(29.55, 30.25),
        look: { id: 'cv' + i, skin: ['#c99870', '#b98860', '#d8a880'][i % 3], shirt: robe ? null : c, robe: robe ? ['#e9e4d6', '#8a7a5a', '#16161a'][i % 3] : null, pants: '#2c2f36', hair: '#1b1410', hat: i % 7 === 0 ? 'hijab' : (robe && i % 2 ? 'shemagh' : null), hatc: i % 7 === 0 ? ['#16161a', '#8e3b5e', '#3a5a8a'][i % 3] : '#ececec', fat: i % 9 === 0 } }); }
    for (let i = 0; i < 9; i++) { const east = i % 2 === 0; cars.push({ t: ['saipa', 'kia', 'saipa'][i % 3], col: ['#c9a02a', '#d9d8d2', '#8a8f96', '#5a6f8a', '#a8322a', '#c9a02a'][i % 6], x: rand(2 * 16, 54 * 16), y: (east ? 56 : 54) * 16 + (east ? 12 : 12), a: east ? 0 : Math.PI, sp: rand(150, 230), east, night: i % 3 !== 0, crash: rand(29.6, 30.15), hide: false }); }
    View3D.resetYaw(); R.lapse = L; R.mode = 'intro'; $('#hud').hidden = true; const lp = $('#lapse'); lp.hidden = false; G.time = L.t; R.cam.x = hx + 60; R.cam.y = 56 * 16; R.cam.z = 2.4;
    L.finish = () => { if (L.done) return; L.done = true; $('#fade').classList.add('on'); setTimeout(() => { R.lapse = null; lp.hidden = true; G.time = 6.4; R.cam.x = G.x; R.cam.y = G.y; R.cam.z = 3; spawnAll(); R.mode = 'play'; $('#hud').hidden = false; hud(); $('#fade').classList.remove('on'); res(); }, 700); };
  });
}
function updLapse(dt) {
  const L = R.lapse; if (!L || L.done) return;
  const chaos = L.t >= 29.5; L.t += dt * (chaos ? .16 : L.t > 28.6 ? .45 : .95); G.time = L.t; const h = L.t % 24, night = h >= 21.5 || h < 4.8;
  R.cam.x += dt * 5; R.cam.z += (2.6 - R.cam.z) * dt * .05;
  for (const e of L.civ) {
    if (e.fall > 0) { e.fall -= dt; continue; }
    if (!e.z && L.t >= e.turn) { e.z = 1; e.fall = 1.6; e.hide = false; e.sp = rand(8, 14); e.look = Object.assign({}, e.look, { id: e.look.id + 'z', z: 1, skin: ['#8fae7a', '#7fa08a', '#9ab07a'][(Math.random() * 3) | 0] }); R.fx.push({ k: 'puff', x: e.x, y: e.y - 9, t: .5, c: '#7a1a1a' }); e.swap = 1; continue; }
    e.hide = !e.z && night && e.night;
    if (e.z) { e.wa = e.wa == null || Math.random() < dt * .4 ? rand(0, 6.28) : e.wa; const nx = e.x + Math.cos(e.wa) * e.sp * dt, ny = e.y + Math.sin(e.wa) * e.sp * dt; if (!World.solid(nx >> 4, ny >> 4)) { e.x = nx; e.y = ny; } else e.wa = null; }
    else { const run = chaos && L.t > e.turn - .25; e.x += e.d * e.sp * dt * (run ? 5 : 2.4); if (e.x < 2 * 16 || e.x > 55 * 16) e.d *= -1; }
  }
  for (const c of L.cars) {
    if (c.dead) continue; c.hide = night && c.night;
    if (L.t >= c.crash) { c.a += (c.east ? 1 : -1) * dt * 2.2 * (c.sp / 200); c.sp *= Math.pow(.12, dt); if (c.sp < 12) { c.dead = 1; sfx('crash'); R.shake = .3; for (let i = 0; i < 8; i++) R.fx.push({ k: 'puff', x: c.x + rand(-10, 10), y: c.y + rand(-10, 10), t: rand(.5, 1.2), c: i % 2 ? '#333' : '#888' }); } }
    const nx = c.x + Math.cos(c.a) * c.sp * dt * 1.6, ny = c.y + Math.sin(c.a) * c.sp * dt * 1.6;
    if (World.solid(nx >> 4, ny >> 4)) { c.sp = 0; if (L.t >= c.crash) { c.dead = 1; sfx('crash'); } } else { c.x = nx; c.y = ny; }
    if (L.t < c.crash) { if (c.x > 55 * 16) c.x = 1.5 * 16; if (c.x < 1.5 * 16) c.x = 55 * 16; }
  }
  for (const e of L.civ) if (e.swap) e.swap = 0;
  const hh = Math.floor(h), mm = Math.floor((h - hh) * 60), lp = $('#lapse');
  lp.children[0].textContent = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  lp.children[1].textContent = L.t < 20 ? tr('اليوم صفر. مدينة عادية.', 'DAY 0. AN ORDINARY CITY.') : L.t < 28.4 ? tr('الناس نامت. والكهرباء، كالعادة، تروح وتجي.', 'EVERYONE SLEPT. THE POWER, AS USUAL, CAME AND WENT.') : L.t < 29.5 ? tr('بس وجه الصبح.. بدا شي مو طبيعي.', 'BUT AT DAWN... SOMETHING STRANGE BEGAN.') : tr('وكلشي تغيّر، قبل ما يكعد ' + G.name + ' من النوم.', 'AND EVERYTHING CHANGED, BEFORE ' + G.name.toUpperCase() + ' WOKE UP.');
  lp.children[2].textContent = tr('[Enter] تخطّي', '[Enter] skip');
  if (L.t >= 30.42) { L.end += dt; if (L.end > 1.6) L.finish(); }
}

// ---------------------------------------------------------------- interaction
function findNear() {
  let best = null, bd = 1e9; const px = G.x, py = G.y - 4;
  const chk = (x, y, r, label, act, bias = 0) => { const d = hyp(x - px, y - py); if (d < r && d + bias < bd) { bd = d + bias; best = { x, y, label, act }; } };
  for (const c of World.containers) if (Math.abs(c.x - px) < 34 && Math.abs(c.y - py) < 34) chk(c.x, c.y, c.kind === 'trunk' ? 30 : 25, tr('فتّش', 'Search'), () => openCont(c));
  for (const p of World.pickups) if (!G.taken[p.id]) chk(p.x, p.y, 20, tr('اخذ', 'Pick up'), () => takePickup(p));
  G.veh.forEach((v, i) => { if (!v.gone) chk(v.x, v.y, 26, tr('اركب ', 'Get on ') + L(VEH[v.t].n), () => enterVeh(i)); });
  for (const n of R.npcs) if (!n.hidden) chk(n.x, n.y - 4, n.follow ? 15 : 24, tr('احچي ويه ', 'Talk to ') + L(NPC[n.id].n), () => SC[n.id](), n.follow ? 30 : 0);
  for (const o of R.objs) if (!o.hide || !o.hide()) chk(o.x, o.y, o.r || 24, L(o.label), o.act);
  R.near = best;
}
function interact() { if (R.busy > 0) return; if (G.inVeh >= 0) return exitVeh(); if (R.near) R.near.act(); }
function objective() {
  const f = G.flags;
  if (f.ended) return [tr('عيش يومك.. وابقى عايش', 'Live your day... and stay alive'), null];
  if (!f.pipe) return [tr('اطلع من البيت ودوّر شي تدافع بيه عن نفسك', 'Leave the house and find something to defend yourself with'), S.pipe];
  if (!f.hassan) return [tr('أبو حسن واكف يم الباب.. تصرّف ويّاه', 'Abu Hassan is by the door... deal with him'), R.zombies.find(z => z.type === 'hassan') || S.hassan];
  if (G.lootN < 3 && !f.ajMet) return [tr('دوّر أكل وماي ببيوت المحلة (' + G.lootN + '/3)', 'Search the neighborhood houses for food and water (' + G.lootN + '/3)'), null];
  if (!f.ajMet) return [tr('امشِ عالشارع العام باتجاه السوق (شرق)', 'Follow the main road east toward the market'), S.aj];
  if (!f.g1) return has('fuel') ? [tr('رجّع البانزين لأبو جاسم', 'Bring the fuel to Abu Jasim'), S.aj] : [tr('لكي جليكان بانزين بسيارة متروكة', 'Find a fuel can in an abandoned car'), (R.fuelC && G.looted[R.fuelC.id]) ? null : S.fuelWreck];
  if (!f.g2) return has('key_gate') ? [tr('افتح سيطرة الكرادة بالمفتاح', 'Open the Karrada checkpoint with the key'), S.g2] : [tr('دوّر مفتاح السيطرة بالكابينة آخر السوق', 'Find the checkpoint key in the booth at the end of the market'), S.booth];
  if (!f.mall) return [tr('ادخل مول الكرادة', 'Enter the Karrada mall'), S.mallDoor];
  if (!f.noorMet) return [tr('احچي ويه نور بالمول', 'Talk to Noor in the mall'), S.noor];
  if (!f.murHealed) return has('medicine') ? [tr('رجّع الدوه لنور', 'Bring the medicine to Noor'), S.noor] : [tr('جيب الدوه من الصيدلية كبال المول', 'Get the medicine from the pharmacy across the street'), S.pharm];
  if (!f.gen) return [tr('جمّع ٣ قطع غيار لمرتضى (' + (G.inv.parts || 0) + '/3)', 'Collect 3 spare parts for Murtadha (' + (G.inv.parts || 0) + '/3)'), has('parts', 3) || !f.murAsk ? S.mur : null];
  if (!f.radio) return [tr('جرّب الراديو بالمول', 'Try the radio in the mall'), S.radio];
  if (!f.pistol) return has('key_police') ? [tr('افتح مركز الشرطة وخذ السلاح', 'Open the police station and take the weapon'), S.policeDoor] : [tr('خذ مفتاح المركز من العقيد الزومبي', 'Take the station key from the zombie Colonel'), R.zombies.find(z => z.type === 'colonel') || S.colonel];
  if (!f.g3) return [tr('افتح الطريق للمتنبي بقاطع الحديد', 'Open the road to Mutanabbi with the bolt cutter'), S.g3];
  if (!f.book) return [tr('اسأل أبو الكتب بشارع المتنبي', 'Ask the Bookseller on Mutanabbi Street'), S.book];
  if (!f.g4) return [tr('درّع سيارة عند مرتضى واكسر صبّات الجسر', 'Have Murtadha armor a vehicle, then ram the bridge barrier'), S.g4];
  if (!f.rifle) return has('key_armory') ? [tr('افتح المشجب بالمعسكر', 'Open the armory at the base'), S.armoryDoor] : [tr('دوّر على سلاح أقوى بالمعسكر', 'Look for a stronger weapon at the base'), S.sol];
  if (!f.boss) return [tr('روح لمخزن المشروبات.. واحذر الحارس', 'Go to the drinks warehouse... beware the guard'), S.boss];
  return [tr('ادخل المخزن واعرف الحقيقة', 'Enter the warehouse and learn the truth'), S.pepsi];
}

// ---------------------------------------------------------------- update
function update(dt) {
  R.t += dt;
  for (let i = R.fx.length - 1; i >= 0; i--) if ((R.fx[i].t -= dt) <= 0) R.fx.splice(i, 1);
  for (let i = R.bubbles.length - 1; i >= 0; i--) if ((R.bubbles[i].t -= dt) <= 0) R.bubbles.splice(i, 1);
  if (R.shake > 0) R.shake -= dt;
  if (R.mode === 'intro') { updLapse(dt); return; }
  if (R.mode === 'title') { R.panT += dt; G.x = 360 + ((R.panT * 16) % 2300); G.y = 55 * 16 + Math.sin(R.panT * .15) * 50; R.cam.x = G.x; R.cam.y = G.y; R.cam.z += (3 - R.cam.z) * .1; updZombies(dt, true); return; }
  const zt = clamp(G.zoom - (G.inVeh >= 0 && G.veh[G.inVeh].t !== 'bike' ? 1 : 0), 2, 5); R.cam.z += (zt - R.cam.z) * Math.min(1, dt * 9); if (Math.abs(zt - R.cam.z) < .02) R.cam.z = zt;
  R.cam.x += (G.x - R.cam.x) * Math.min(1, dt * 7); R.cam.y += (G.y - R.cam.y) * Math.min(1, dt * 7);
  if (R.busy > 0) return;
  if (R.atk > 0) R.atk -= dt; if (R.swing > 0) R.swing -= dt; if (R.inv > 0) R.inv -= dt; if (R.mouse.t > 0) R.mouse.t -= dt;
  const pb = World.bAt(G.x >> 4, G.y >> 4); R.pb = G.inVeh >= 0 ? 0 : pb; R.pInside = !!R.pb; R.pSafe = World.safe[World.I(G.x >> 4, G.y >> 4)] === 1 && G.inVeh < 0;
  updPlayer(dt); updZombies(dt); updComps(dt);
  if (G.inVeh < 0) findNear(); else R.near = null;
  // needs & time
  G.time += dt / 20; const hr = dt / 20;
  G.food = Math.max(0, G.food - hr * 2.2); G.water = Math.max(0, G.water - hr * 3); G.en = Math.max(0, G.en - hr * 3.6);
  if (G.food <= 0 || G.water <= 0) { G.hp -= dt * .55; if (G.hp <= 0) die(); } else if (G.food > 55 && G.water > 55 && G.hp < 100) G.hp = Math.min(100, G.hp + dt * .35);
  if (G.food < 20) tip('hungry' + G.day, 'جوعان! اضغط F تاكل وتشرب بسرعة.', 'Hungry! Press F to eat and drink quickly.');
  if (G.time >= 30) nextDay(false);
  const h = G.time % 24; if (h >= 18.5 && h < 19 && G.time < 24) tip('night' + G.day, 'الدنيا صارت ليل.. الزومبي أخطر. ارجع للملجأ ونام.', 'Night is falling... zombies get worse. Head back to the shelter and sleep.');
  // safe-zone autosave + story triggers
  if (R.pSafe && !R.wasSafe) { const mall = pb && World.buildings[pb - 1].type === 'mall'; G.safe = mall ? { x: S.mallBed.x, y: S.mallBed.y + 26 } : { x: S.start.x, y: S.start.y }; if (mall && !G.flags.mall) { G.flags.mall = 1; toast(tr('مول الكرادة: مكان آمن. الزومبي ما يدخلون هنا.', 'Karrada mall: a safe place. Zombies do not come in here.'), 6000); } if (R.t - R.lastAuto > 25) save(true); }
  R.wasSafe = R.pSafe;
  if ((R.hudT -= dt) <= 0) { R.hudT = .12; hud(); }
}
function hud() {
  if (R.mode !== 'play') return;
  const set = (id, v) => { const e = $('#b-' + id); e.querySelector('.fl').style.width = clamp(v, 0, 100) + '%'; e.classList.toggle('low', v < 22); };
  set('hp', G.hp); set('food', G.food); set('water', G.water); set('en', G.en);
  const h = G.time % 24, hh = Math.floor(h), mm = Math.floor((h - hh) * 6) * 10, c = $('#clock');
  c.children[0].textContent = dayTitle(); c.children[1].textContent = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); c.children[2].textContent = L(ZONES[World.zoneOf(G.x >> 4)]);
  const ob = objective(), o = $('#obj'); o.children[0].textContent = tr('المهمة', 'OBJECTIVE'); o.children[1].textContent = ob[0]; R.objT = ob[1];
  const w = $('#wep');
  if (G.inVeh >= 0) { const v = G.veh[G.inVeh], d = VEH[v.t]; w.children[0].textContent = L(d.n); w.children[1].textContent = (d.tank ? tr('بانزين ', 'Fuel ') + Math.round(v.fuel) + '/' + maxFuel(v) + '  ·  ' : '') + tr('الحالة ', 'Body ') + Math.max(0, Math.round(v.hp / maxHp(v) * 100)) + '%'; }
  else { const d = WEAPONS[G.cur]; w.children[0].textContent = L(d.n); w.children[1].textContent = d.gun ? tr('رصاص: ', 'Ammo: ') + (G.inv[d.ammo] || 0) : d.dur ? tr('المتانة: ', 'Durability: ') + G.weps[G.cur] + '/' + d.dur : tr('[Q] بدّل السلاح', '[Q] switch weapon'); }
  const cb = $('#comps'), list = COMPS.filter(here); cb.hidden = !list.length;
  if (list.length) { cb.innerHTML = ''; for (const id of list) { const d = el('div'), t = comp(id).trust; d.append(el('span', L(NPC[id].n) + (comp(id).st === 'home' ? tr(' (بالملجأ)', ' (home)') : '')), el('em', Math.round(t) + '%', t < 25 ? 'bad' : '')); cb.appendChild(d); } }
  const p = $('#prompt'); if (G.inVeh >= 0) { p.hidden = false; p.innerHTML = '<kbd>E</kbd>' + tr('انزل', 'Get off'); } else if (R.near && R.busy === 0) { p.hidden = false; p.innerHTML = '<kbd>E</kbd>'; p.append(R.near.label); } else p.hidden = true;
}

// ---------------------------------------------------------------- render (3D world + 2D overlay)
let lastR = performance.now();
function render() {
  const now = performance.now(), dt = Math.min(.05, (now - lastR) / 1000); lastR = now;
  const w = cv.width, h = cv.height, play = R.mode === 'play', pb = play ? (R.pb || 0) : 0;
  View3D.frame(G, R, play, LOOK, zlook, dt);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, w, h);
  const bOf = e => World.bAt(e.x >> 4, e.y >> 4), see = e => { const b = bOf(e); return b === 0 || b === pb; };
  if (play) {
    // loot sparkles
    for (const c of World.containers) { if (G.looted[c.id] || Math.abs(c.x - G.x) > 420 || Math.abs(c.y - G.y) > 420 || (c.b && c.b !== pb)) continue; const p = View3D.project(c.x, c.y, c.kind === 'trunk' ? 1.2 : 1.45), k = Math.sin(R.t * 5 + c.id) > 0; ctx.fillStyle = '#000'; ctx.fillRect(p.x - 4, p.y - 4, 8, 8); ctx.fillStyle = k ? '#ffe27a' : '#c9a84c'; ctx.fillRect(p.x - 3, p.y - 3, 6, 6); }
    // talk markers
    for (const n of R.npcs) if (!n.follow && !n.hidden && see(n) && Math.sin(R.t * 4) > -.3) { const p = View3D.project(n.x, n.y, 1.55); ctx.fillStyle = '#000'; ctx.fillRect(p.x - 4, p.y - 16, 8, 18); ctx.fillStyle = '#e8cf7a'; ctx.fillRect(p.x - 2, p.y - 14, 4, 9); ctx.fillRect(p.x - 2, p.y - 3, 4, 3); }
    // zombie health bars
    for (const z of R.act) if (z.hp < z.s.hp && see(z)) { const boss = z.type === 'boss', p = View3D.project(z.x, z.y, boss ? 2.7 : 1.4), bw = boss ? 90 : 34; ctx.fillStyle = '#000'; ctx.fillRect(p.x - bw / 2 - 1, p.y - 4, bw + 2, 6); ctx.fillStyle = '#c33'; ctx.fillRect(p.x - bw / 2, p.y - 3, Math.max(0, bw * z.hp / z.s.hp), 4); }
    // objective marker
    if (R.objT) { const p = View3D.project(R.objT.x, R.objT.y, 2.1), by = p.y + Math.sin(R.t * 5) * 5; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(p.x - 13, by - 14); ctx.lineTo(p.x + 13, by - 14); ctx.lineTo(p.x, by + 8); ctx.fill(); ctx.fillStyle = '#e8cf7a'; ctx.beginPath(); ctx.moveTo(p.x - 9, by - 12); ctx.lineTo(p.x + 9, by - 12); ctx.lineTo(p.x, by + 4); ctx.fill(); }
  }
  for (const f of R.fx) {
    if (f.k === 'line') { const a = View3D.project(f.x, f.y + 8, .8), b = View3D.project(f.x2, f.y2 + 8, .8); ctx.strokeStyle = '#ffe9a0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    else { const p = View3D.project(f.x, f.y + 9, .7 + (1 - f.t) * .6), sz = f.t > .3 ? 7 : 5; ctx.fillStyle = f.c; ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz); }
  }
  ctx.font = '700 17px Handjet, Tahoma, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = LANG === 'ar' ? 'rtl' : 'ltr';
  for (const b of R.bubbles) {
    const e = b.e; if (e.hidden || (e !== G && !see(e))) continue;
    const p = View3D.project(e.x, e.y, e.type === 'boss' ? 2.9 : 1.55), bx = Math.round(p.x), by = Math.round(p.y) - 18, tw = ctx.measureText(b.text).width + 14;
    if (bx < -100 || bx > w + 100 || by < -20 || by > h + 20) continue;
    ctx.globalAlpha = Math.min(1, b.t * 3); ctx.fillStyle = '#000'; ctx.fillRect(bx - tw / 2 - 2, by - 13, tw + 4, 26); ctx.fillStyle = e.s ? '#dfeccf' : '#fff'; ctx.fillRect(bx - tw / 2, by - 11, tw, 22); ctx.fillStyle = '#000'; ctx.fillRect(bx - 3, by + 11, 6, 3);
    ctx.fillStyle = e.s ? '#24401a' : '#16161c'; ctx.fillText(b.text, bx, by + 1); ctx.globalAlpha = 1;
  }
  if (play && R.objT && R.busy === 0) {
    const p = View3D.project(R.objT.x, R.objT.y, 1), tx = p.x, ty = p.y;
    if (tx < 30 || tx > w - 30 || ty < 60 || ty > h - 60) {
      const a = Math.atan2(ty - h / 2, tx - w / 2), ex = clamp(w / 2 + Math.cos(a) * w, 46, w - 46), ey = clamp(h / 2 + Math.sin(a) * w, 110, h - 120);
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(a); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-12, -15); ctx.lineTo(-12, 15); ctx.fill(); ctx.fillStyle = '#e8cf7a'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, -10); ctx.lineTo(-8, 10); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#000'; ctx.direction = 'ltr'; const dm = Math.round(hyp(R.objT.x - G.x, R.objT.y - G.y) / 16) + 'm'; ctx.fillText(dm, ex + 1, ey + 27); ctx.fillStyle = '#e8cf7a'; ctx.fillText(dm, ex, ey + 26);
    }
  }
}

// ---------------------------------------------------------------- panels & menus
function invPanel() {
  openPanel(tr('الحقيبة', 'Bag'), box => {
    const draw = () => {
      while (box.children.length > 1) box.lastChild.remove();
      box.appendChild(el('h3', tr('الأسلحة', 'Weapons')));
      for (const w of WORDER) { if (w !== 'fist' && G.weps[w] == null) continue; const d = WEAPONS[w], row = el('div', null, 'row'), nm = el('span', L(d.n) + '  '); nm.appendChild(el('small', d.gun ? tr('رصاص ', 'ammo ') + (G.inv[d.ammo] || 0) : d.dur ? G.weps[w] + '/' + d.dur : '')); row.append(nm, G.cur === w ? el('small', tr('✔ مجهّز', '✔ equipped')) : btn(tr('جهّز', 'Equip'), () => { G.cur = w; draw(); })); box.appendChild(row); }
      box.appendChild(el('h3', tr('الأغراض', 'Items'))); const ids = Object.keys(G.inv); if (!ids.length) box.appendChild(el('p', tr('الحقيبة فارغة.. مثل الثلاجة.', 'The bag is empty... like the fridge.')));
      for (const id of ids) { const it = ITEMS[id], row = el('div', null, 'row'), nm = el('span', L(it.n) + ' ×' + G.inv[id] + '  '); const eff = [it.food && tr('أكل +', 'food +') + it.food, it.water && tr('ماي +', 'water +') + it.water, it.hp && tr('صحة +', 'health +') + it.hp, it.en && tr('طاقة +', 'energy +') + it.en, it.fuel && tr('بانزين +', 'fuel +') + it.fuel, it.d && L(it.d)].filter(Boolean).join(' · '); nm.appendChild(el('small', eff)); row.appendChild(nm); if (it.food || it.water || it.hp || it.en || it.fuel) row.appendChild(btn(tr('استعمل', 'Use'), () => { useItem(id); hud(); draw(); })); box.appendChild(row); }
      box.appendChild(el('h3', tr('الإحصائيات', 'Stats')));
      box.appendChild(el('p', tr('الأيام: ', 'Days: ') + G.day + '   ·   ' + tr('زومبي طايح: ', 'Zombies dropped: ') + G.kills + '   ·   ' + tr('أوراق مشكوكة: ', 'Torn pages: ') + G.pages.length + '/5'));
      const s = G.shel, sh = [s.bar && tr('شبابيك مسدودة', 'boarded windows'), s.tank && tr('خزان ماي', 'water tank'), s.garden && tr('حديقة', 'garden'), s.gen && tr('مولدة', 'generator')].filter(Boolean); if (sh.length) box.appendChild(el('p', tr('الملجأ: ', 'Shelter: ') + sh.join(tr('، ', ', '))));
    }; draw();
  });
}
function mapPanel() {
  openPanel(tr('الخريطة', 'Map'), box => {
    const c = el('canvas'); c.width = World.W * 4; c.height = World.H * 4; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(World.ground, 0, 0, c.width, c.height);
    for (const b of World.buildings) { g.fillStyle = b.type === 'home' ? '#7fc24b' : b.type === 'mall' ? '#c9a84c' : b.type === 'police' ? '#5d6f8a' : b.type === 'warehouse' ? '#b33' : b.type === 'pharmacy' ? '#eee' : '#8f8672'; g.fillRect(b.x * 4, b.y * 4, b.w * 4, b.h * 4); }
    const mark = (p, col, s = 7) => { g.fillStyle = '#000'; g.fillRect(p.x / 4 - s / 2 - 1, p.y / 4 - s / 2 - 1, s + 2, s + 2); g.fillStyle = col; g.fillRect(p.x / 4 - s / 2, p.y / 4 - s / 2, s, s); };
    G.veh.forEach(v => !v.gone && mark(v, '#6cf', 5)); if (R.objT) mark(R.objT, '#e8cf7a', 9); mark(G, '#fff', 7); mark(G, '#d24a3a', 3);
    g.font = '700 15px Handjet, Tahoma'; g.textAlign = 'center'; [[28, 0], [80, 1], [127, 2], [163, 3], [205, 4]].forEach(([x, i]) => { g.fillStyle = '#000'; g.fillText(L(ZONES[i]), x * 4 + 1, 13); g.fillStyle = '#fff'; g.fillText(L(ZONES[i]), x * 4, 12); });
    box.appendChild(c); box.appendChild(el('p', tr('⬜ إنت   🟨 المهمة   🟦 السيارات   🟩 البيت   المول ذهبي', 'White: you   Gold: objective / mall   Blue: vehicles   Green: home')));
  });
}
function controlsPanel() {
  return openPanel(tr('التحكم', 'Controls'), box => {
    const rows = [['W A S D  /  ↑ ← ↓ →', tr('الحركة والسياقة (نفس الأزرار)', 'Move and drive (same keys)')], ['Shift', tr('ركض', 'Run')], [tr('الماوس', 'Mouse'), tr('تصويب — الزر الأيسر ضرب/إطلاق', 'Aim — left button attacks / fires')], [tr('الزر الأيمن (ضغط مستمر)', 'Right button (hold)'), tr('امشي/سوق باتجاه المؤشر', 'Walk / drive toward the cursor')], ['Space', tr('ضرب (بالكيبورد)', 'Attack (keyboard)')], [tr('عجلة الماوس', 'Mouse wheel'), tr('تقريب وتبعيد الكاميرا', 'Camera zoom in / out')], ['C', tr('رجّع الكاميرا للوضع الطبيعي', 'Reset the camera')], ['V', tr('الكاميرا: تدور ويه اتجاهك / ثابتة', 'Camera: follow your direction / fixed')], ['E', tr('تفاعل / اركب / انزل / احچي', 'Interact / get on / get off / talk')], ['Q', tr('بدّل السلاح', 'Switch weapon')], ['F', tr('أكل وشرب سريع', 'Quick eat / drink')], ['X', tr('علاج سريع', 'Quick heal')], ['H', tr('هورن (بالسيارة)', 'Horn (in a vehicle)')], ['I  /  Tab', tr('الحقيبة', 'Bag')], ['M', tr('الخريطة', 'Map')], ['F5', tr('حفظ يدوي', 'Manual save')], ['F11', tr('ملء الشاشة', 'Fullscreen')], ['Esc', tr('القائمة', 'Menu')]];
    const t = el('table'); for (const r of rows) { const row = el('tr'); row.append(el('td', r[0]), el('td', r[1])); t.appendChild(row); } box.appendChild(t);
    box.appendChild(el('p', tr('الحفظ التلقائي يصير من تدخل مكان آمن (البيت، المول) ومن تنام.', 'Autosave happens when you enter a safe place (home, mall) and when you sleep.')));
  });
}
function aboutPanel(credits) {
  return openPanel(credits ? tr('النهاية', 'The End') : tr('حول', 'About'), box => {
    const logo = el('p'); logo.innerHTML = '<b style="font-size:46px;color:var(--gold);direction:ltr;display:block;text-align:center">IBRA <span style="color:var(--green)">ZOMBIE</span></b>'; box.appendChild(logo);
    const c = el('p', tr('صحيت لكيت الدنيا زومبي', 'Woke Up to a Zombie World')); c.style.textAlign = 'center'; box.appendChild(c);
    if (credits) box.appendChild(el('p', tr('شكراً لأن لعبت القصة للأخير. ' + (G.flags.ended === 'secret' ? 'لكيت النهاية السرية!' : G.flags.ended === 'good' ? 'هاي النهاية الحلوة.' : 'اكو نهايات ثانية.. جرّب تخلّي نور وياك، ودوّر الأوراق المشكوكة.'), 'Thank you for playing the story to the end. ' + (G.flags.ended === 'secret' ? 'You found the secret ending!' : G.flags.ended === 'good' ? 'This is the good ending.' : 'There are other endings... try keeping Noor with you, and look for the torn pages.'))));
    box.appendChild(el('h3', tr('برمجة وتطوير ابراهيم الخزرجي', 'Programming & development: Ibrahim Al-Khazraji')));
    const link = (label, url) => { const p = el('p', label + ': '), a = el('a', url.replace('https://', '')); a.onclick = () => window.ibra ? window.ibra.open(url) : window.open(url); p.appendChild(a); p.style.direction = 'ltr'; p.style.textAlign = 'center'; box.appendChild(p); };
    link('Telegram', 'https://t.me/ibraprogram'); link('TikTok', 'https://www.tiktok.com/@ibraprogram');
    const v = el('p', tr('الإصدار ', 'Version ') + VERSION); v.style.textAlign = 'center'; v.style.color = '#a9a493'; box.appendChild(v);
    const row = el('div', null, 'col'); row.appendChild(btn(tr('افحص التحديثات', 'Check for updates'), () => checkUpdate(true))); box.appendChild(row);
  });
}
function pauseMenu() {
  openPanel(tr('القائمة', 'Menu'), box => {
    const c = el('div', null, 'col');
    c.append(btn(tr('كمّل اللعب', 'Resume'), closePanel, 'gold'), btn(tr('حفظ اللعبة', 'Save game'), () => { closePanel(); save(false); }), btn(tr('الحقيبة', 'Bag'), invPanel), btn(tr('الخريطة', 'Map'), mapPanel), btn(tr('التحكم', 'Controls'), controlsPanel),
      btn('English / عربي', () => { setLang(LANG === 'ar' ? 'en' : 'ar'); closePanel(); pauseMenu(); }), btn(tr('الصوت: ', 'Sound: ') + (R.vol ? tr('شغّال', 'on') : tr('طافي', 'off')), () => { R.vol = R.vol ? 0 : 1; closePanel(); pauseMenu(); }), btn(tr('ملء الشاشة (F11)', 'Fullscreen (F11)'), () => window.ibra && window.ibra.fullscreen()), btn(tr('حول', 'About'), () => aboutPanel()),
      btn(tr('حفظ ورجوع للقائمة الرئيسية', 'Save & return to main menu'), () => { closePanel(); save(false); toTitle(); }));
    box.appendChild(c);
  });
}
function setLang(l) { LANG = l; localStorage.setItem('ibz_lang', l); document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'; if (R.mode === 'title') renderMenu(); else hud(); }
function toTitle() { R.mode = 'title'; View3D.resetYaw(); World.gen(); View3D.build(); G = blank(''); G.time = 7.5; spawnAll(); R.npcs = []; R.bubbles.length = 0; $('#hud').hidden = true; $('#menu').hidden = false; renderMenu(); }
function renderMenu() {
  document.documentElement.lang = LANG; document.documentElement.dir = LANG === 'ar' ? 'rtl' : 'ltr';
  $('#sub').textContent = tr('صحيت لكيت الدنيا زومبي', 'Woke Up to a Zombie World'); const m = $('#mbtns'); m.innerHTML = ''; const u = users();
  if (u.length) m.appendChild(btn(tr('كمّل اللعب', 'Continue'), continuePanel, 'gold'));
  m.append(btn(tr('لعبة جديدة', 'New Game'), newPanel, u.length ? '' : 'gold'), btn(tr('التحكم', 'Controls'), controlsPanel), btn('English / عربي', () => setLang(LANG === 'ar' ? 'en' : 'ar')), btn(tr('حول', 'About'), () => aboutPanel()), btn(tr('خروج', 'Exit'), () => window.ibra ? window.ibra.quit() : window.close()));
  $('#ver').textContent = 'v' + VERSION; $('#credit').textContent = tr('برمجة وتطوير ابراهيم الخزرجي', 'Developed by Ibrahim Al-Khazraji');
}
function newPanel() {
  openPanel(tr('لعبة جديدة', 'New Game'), box => {
    box.appendChild(el('p', tr('اكتب اسمك.. هذا اسم صاحب الدفتر وبطل القصة:', 'Type your name... the owner of the notebook and hero of the story:')));
    const inp = el('input'); inp.type = 'text'; inp.maxLength = 16; inp.placeholder = tr('اسم اللاعب', 'Player name'); box.appendChild(inp);
    const warn = el('p', ''); warn.style.color = '#e8a23a'; box.appendChild(warn);
    const go = () => { const n = inp.value.trim(); if (!n) { warn.textContent = tr('لازم تكتب اسم.', 'Please type a name.'); return; } if (users().some(x => x.name === n) && warn.dataset.ok !== n) { warn.dataset.ok = n; warn.textContent = tr('اكو لاعب بهذا الاسم. اضغط مرة ثانية حتى تبدي من جديد وتمسح حفظه.', 'A player with this name exists. Press again to start over and erase that save.'); return; } closePanel(); startNew(n); };
    const c = el('div', null, 'col'); c.style.marginTop = '10px'; c.appendChild(btn(tr('ابدي القصة', 'Begin the story'), go, 'gold')); box.appendChild(c);
    inp.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') go(); if (e.key === 'Escape') closePanel(); }; setTimeout(() => inp.focus(), 30);
  });
}
function continuePanel() {
  openPanel(tr('اختار اللاعب', 'Choose a player'), box => {
    const draw = () => { while (box.children.length > 1) box.lastChild.remove(); const u = users(); if (!u.length) { closePanel(); renderMenu(); return; }
      for (const x of u) { const row = el('div', null, 'row'), nm = el('span', x.name + '  '); nm.appendChild(el('small', tr('اليوم ', 'Day ') + x.day)); const bs = el('span'); bs.append(btn(tr('العب', 'Play'), () => { closePanel(); if (!loadGame(x.name)) toast(tr('الحفظ خربان!', 'Save is corrupted!')); }, 'gold'), ' ', btn(tr('امسح', 'Delete'), () => { localStorage.removeItem('ibz_save_' + x.name); localStorage.setItem('ibz_users', JSON.stringify(users().filter(y => y.name !== x.name))); draw(); })); row.append(nm, bs); box.appendChild(row); } };
    draw();
  });
}
const cmpVer = (a, b) => { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); } return 0; };
async function checkUpdate(manual) {
  try {
    const r = await fetch('https://api.github.com/repos/' + REPO + '/releases/latest', { cache: 'no-store' }); if (!r.ok) throw 0;
    const j = await r.json(), v = String(j.tag_name || '').replace(/^v/, '');
    if (v && cmpVer(v, VERSION) > 0) {
      const a = (j.assets || []).find(x => /\.exe$/i.test(x.name)), url = a ? a.browser_download_url : j.html_url, u = $('#upd'); u.innerHTML = ''; u.hidden = false;
      u.append(el('span', tr('نزلت نسخة جديدة v' + v + ' (نسختك v' + VERSION + ')', 'New version v' + v + ' is out (you have v' + VERSION + ')')), btn(tr('حمّل التحديث', 'Download update'), () => window.ibra ? window.ibra.open(url) : window.open(url), 'gold'), btn(tr('بعدين', 'Later'), () => u.hidden = true));
    } else if (manual) toast(tr('نسختك آخر إصدار ✓', 'You have the latest version ✓'));
  } catch (e) { if (manual) toast(tr('ما كدرت أفحص التحديثات. تأكد من النت.', "Couldn't check for updates. Check your connection.")); }
}

// ---------------------------------------------------------------- input & boot
addEventListener('keydown', e => {
  const k = e.code;
  if (k === 'F11') { e.preventDefault(); window.ibra && window.ibra.fullscreen(); return; }
  if (!nb.hidden) { if (!e.repeat && ['Enter', 'Space', 'KeyE', 'Escape'].includes(k)) R.nbAny && R.nbAny(); e.preventDefault(); return; }
  if (!dlg.hidden) { if (!e.repeat) { if (R.dlgAny && ['Enter', 'Space', 'KeyE'].includes(k)) R.dlgAny(); else if (R.dlgNum && /^(Digit|Numpad)[1-9]$/.test(k)) R.dlgNum(+k.slice(-1) - 1); } e.preventDefault(); return; }
  if (R.mode === 'intro') { if (!e.repeat && ['Enter', 'Space', 'Escape'].includes(k) && R.lapse) R.lapse.finish(); e.preventDefault(); return; }
  if (!panel.hidden) { if (k === 'Escape' || (!e.repeat && (k === 'KeyI' || k === 'KeyM' || k === 'Tab') && e.target.tagName !== 'INPUT')) { closePanel(); e.preventDefault(); } return; }
  if (R.mode !== 'play') return;
  R.keys[k] = true; if (['Tab', 'F5', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) e.preventDefault();
  if (e.repeat || R.busy > 0) return;
  switch (k) {
    case 'Escape': pauseMenu(); break; case 'KeyE': interact(); break; case 'KeyI': case 'Tab': invPanel(); break; case 'KeyM': mapPanel(); break;
    case 'KeyQ': cycleWeapon(); break; case 'KeyC': G.zoom = 3; View3D.resetYaw(); break; case 'KeyV': G.camFollow = G.camFollow === 0 ? 1 : 0; if (!G.camFollow) View3D.resetYaw(); toast(G.camFollow ? tr('الكاميرا تدور ويه اتجاهك', 'Camera follows your direction') : tr('الكاميرا ثابتة', 'Camera fixed')); break; case 'KeyH': horn(); break; case 'F5': save(false); break; case 'KeyF': quick('eat'); break; case 'KeyX': quick('heal'); break;
  }
});
addEventListener('keyup', e => { R.keys[e.code] = false; });
addEventListener('blur', () => { R.keys = {}; R.mouse.l = R.mouse.r = false; });
cv.addEventListener('mousemove', e => { R.mouse.x = e.clientX; R.mouse.y = e.clientY; R.mouse.t = 2.5; });
cv.addEventListener('mousedown', e => { if (R.mode === 'intro' && R.lapse) return R.lapse.finish(); if (e.button === 0) R.mouse.l = true; if (e.button === 2) R.mouse.r = true; R.mouse.x = e.clientX; R.mouse.y = e.clientY; R.mouse.t = 2.5; });
addEventListener('mouseup', e => { if (e.button === 0) R.mouse.l = false; if (e.button === 2) R.mouse.r = false; });
addEventListener('contextmenu', e => e.preventDefault());
addEventListener('wheel', e => { if (R.mode === 'play' && R.busy === 0) G.zoom = clamp(G.zoom - Math.sign(e.deltaY), 2, 5); }, { passive: true });
function resize() { cv.width = innerWidth; cv.height = innerHeight; View3D.resize(); }
addEventListener('resize', resize);
addEventListener('beforeunload', () => { if (R.mode === 'play' && R.busy === 0 && G.hp > 0) { try { save(true); } catch (e) { /* ignore */ } } });

let last = performance.now();
function loop(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; try { update(dt); render(); } catch (e) { console.error(e); } requestAnimationFrame(loop); }
View3D.init($('#gl')); resize(); World.gen(); View3D.build(); G = blank(''); G.time = 7.5; spawnAll(); renderMenu(); requestAnimationFrame(loop);
setTimeout(() => checkUpdate(false), 1500);
window.__izFast = () => setInterval(() => { try { update(1 / 60); } catch (e) { console.error(e); } }, 16);
window.__iz = { get G() { return G; }, R, World, S, startNew, loadGame, add, join, openGate, SC, nextDay, hud, invPanel, introLapse, mapPanel, aboutPanel, pauseMenu, setLang, notebook, say, enterVeh, VEH, mkZ, toTitle, closePanel, die };
})();

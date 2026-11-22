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
  book: { n: ['كتاب "تاريخ المشروبات الغازية"', 'Book: "A History of Fizzy Drinks"'], q: 1 }, zbody: { n: ['جثة زومبي', 'Zombie body'], q: 1, d: ['وصّلها للمستشفى', 'Take it to the hospital'] }, kettle: { n: ['قوري أبو جاسم', "Abu Jasim's teapot"], q: 1, d: ['استكان چاي كل صبح', 'A glass of tea every morning'] },
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
for (let i = 0; i < 16; i++) NPC['sv' + i] = { n: ['ناجي', 'Survivor'] };
for (let i = 0; i < 4; i++) NPC['st' + i] = { n: ['ناجي محاصر', 'Trapped survivor'] };
const idleN = () => G.col.pop - (G.col.trainee || 0) - Object.values(G.col.jobs).reduce((a, b) => a + (b || 0), 0);
const JOBS = { soldier: ['جنود', 'Soldiers', 'يدافعون بالليل بالسلاح (يحتاج معسكر)', 'Defend at night with guns (needs a camp)'], medic: ['مسعفين', 'Medics', 'يعالجون الجرحى ويرجّعون الزومبي لوعيهم (يحتاج مستشفى)', 'Treat the wounded, revive zombies (needs hospital)'], guard: ['حرّاس', 'Guards', 'يقللون هجمات الزومبي عالمقر', 'Thin out the hordes at the base'], farm: ['مزارعين', 'Farmers', 'كل مزارع يأكّل نفرين', 'Each farmer feeds two people'], scav: ['جمّاعين', 'Scavengers', 'يجيبون أغراض كل يوم', 'Bring back supplies every day'], doc: ['باحثين', 'Researchers', 'يشتغلون على اللقاح', 'Work on the vaccine'] };
const CLV = [[0, ['ملجأ', 'Shelter'], -1], [4, ['نقطة ناجين', 'Survivor outpost'], 2], [8, ['حيّ محرَّر', 'Liberated district'], 1], [12, ['مستعمرة', 'Colony'], 0], [16, ['مدينة ناجين', 'Survivor city'], 3]];
const colLevel = () => { let l = 0; for (let i = 0; i < CLV.length; i++) if (G.col.pop >= CLV[i][0]) l = i; return l; };
const secured = zn => { const l = colLevel(); for (let i = 1; i <= l; i++) if (CLV[i][2] === zn) return true; return false; };
const LOOK = {
  player: { id: 'pl', model: 'C01', shirt: '#c9a84c', pants: '#2a2f3a', hair: '#17110d' },
  aj: { id: 'aj', model: 'C02', robe: '#e9e4d6', shirt: '#e9e4d6', hat: 'shemagh', hatc: '#ececec', beard: 1, hair: '#666', fat: 1 },
  noor: { id: 'no', model: 'C03', shirt: '#f4f4f4', pants: '#3a5a8a', hat: 'hijab', hatc: '#8e3b5e' },
  mur: { id: 'mu', model: 'C04', shirt: '#3d5a80', pants: '#333', hair: '#111', stache: 1, hat: 'cap', hatc: '#c33' },
  saif: { id: 'sa', model: 'C05', shirt: '#e2334a', pants: '#1a1a1a', hair: '#2b1b10', phone: 1 },
  sol: { id: 'so', model: 'C06', shirt: '#5a6b3a', pants: '#4a5a30', hat: 'helmet', hatc: '#4a5a30' },
  haji: { id: 'hj', robe: '#8a7a5a', shirt: '#8a7a5a', beard: 1, hair: '#ddd', hat: 'shemagh', hatc: '#c33' },
  umali: { id: 'um', robe: '#16161a', shirt: '#16161a', hat: 'hijab', hatc: '#16161a' },
  book: { id: 'bk', shirt: '#6b4f2a', pants: '#444', hair: '#ccc', beard: 1 }
};
for (let i = 0; i < 4; i++) LOOK['st' + i] = { id: 'st' + i, skin: '#c99870', shirt: ['#8a6a3a', '#3a5a6a', '#6a3a3a', '#5a5a5a'][i], pants: '#33373f', hair: '#1b1410', hat: i === 2 ? 'hijab' : null, hatc: '#5a3a4a' };
for (let i = 0; i < 16; i++) LOOK['sv' + i] = { id: 'sv' + i, skin: ['#c99870', '#b98860', '#d8a880'][i % 3], shirt: i % 4 === 1 ? null : ['#4a7a4a', '#8a3a3a', '#3b6ea5', '#6a5a8a', '#a05a2a'][i % 5], robe: i % 4 === 1 ? ['#e9e4d6', '#16161a'][i % 2] : null, pants: '#2c2f36', hair: '#1b1410', hat: i % 3 === 2 ? 'hijab' : null, hatc: ['#8e3b5e', '#16161a', '#3a5a8a'][i % 3], beard: i % 4 === 3, fat: i === 5 };
const ZT = { normal: { hp: 30, sp: 17, dmg: 7 }, vendor: { hp: 30, sp: 15, dmg: 7 }, cop: { hp: 42, sp: 19, dmg: 8 }, gen: { hp: 70, sp: 11, dmg: 10 }, fat: { hp: 80, sp: 12, dmg: 12 }, soldier: { hp: 55, sp: 20, dmg: 10 }, hassan: { hp: 26, sp: 14, dmg: 5 }, colonel: { hp: 170, sp: 18, dmg: 14 }, boss: { hp: 750, sp: 24, dmg: 22 } };
const ZLINES = {
  normal: [['جوعاااان..', 'مخخخ.. أريد مخخخ..', 'أكل.. أكل..', 'عضّة.. بس عضّة..', 'لحمممم..', 'غغغغ.. ريحتك طيبة..', 'تعال.. تعال يمّي..', 'آآآم..'], ['Hungryyyy..', 'Braaains.. I want braaains..', 'Food.. food..', 'One bite.. just one bite..', 'Meeeat..', 'Grrr.. you smell good..', 'Come.. come here..', 'Aaahm..']],
  vendor: [['باكلة.. بمخ..', 'لبلبي.. ويه لحم بشر..', 'أريد أعضّ.. عالحساب..', 'طازة.. إنت طازة..', 'كيلو.. مخ..'], ['Beans.. with brains..', 'Chickpeas.. with human meat..', 'I want a bite.. on credit..', 'Fresh.. you are fresh..', 'A kilo.. of brains..']],
  cop: [['وكّف.. أريد أعضّك..', 'هوية.. وبعدين.. أاكلك..', 'مخالفة.. مخك..', 'غغغ.. لا تهرب..'], ['Stop.. I want to bite you..', 'ID.. then.. I eat you..', 'Fine.. your brain..', 'Grrr.. no running..']],
  gen: [['أمبير.. ولحم..', 'مخ.. بعشرين ألف..', 'ادفع.. بذراعك..', 'جوعاان.. والمولدة طافية..'], ['Amps.. and meat..', 'Brains.. twenty thousand each..', 'Pay.. with your arm..', 'Hungry.. and the generator is off..']],
  fat: [['جوعااااان.. جوعااان..', 'نفر.. بشر.. مشوي..', 'أاكلك.. وأطلب بعد..', 'عضّة.. اثنين.. ثلاثة..'], ['Hungryyyy.. hungryyy..', 'One portion.. of human.. grilled..', 'I eat you.. then order more..', 'One bite.. two.. three..']],
  soldier: [['استعد.. للعضّة..', 'أريد.. لحم..', 'تعيين.. مخخخ..', 'غغغ.. جوعان من الواجب..'], ['Ready.. for the bite..', 'Want.. meat..', 'Rations.. braaains..', 'Grrr.. hungry since my shift..']],
  hassan: [['جيراااان.. جوعااان..', 'صمون.. ولحم جار..', 'تعال.. أريد أعضّك يا جار..'], ['Neighbooor.. hungryyy..', 'Bread.. and neighbor meat..', 'Come.. I want to bite you, neighbor..']],
  colonel: [['تحية.. وبعدين عضّة..', 'مخك.. للتحقيق..', 'جوعان.. منذ الفجر..'], ['Salute.. then a bite..', 'Your brain.. for questioning..', 'Hungry.. since dawn..']],
  boss: [['بييييبسي.. ولحممم!', 'جوعاااان!', 'مخخخخ!'], ['PEEEPSI.. and meeeat!', 'HUNGRYYYY!', 'BRAAAINS!']]
};
const OUCH = [['غغغ..!', 'آآآخ.. جوعان..', 'وكعت.. بس بعدني جوعان..', 'رجلي.. أكلتها؟'], ['Grrr..!', 'Aaagh.. hungry..', 'Fell.. still hungry..', 'My leg.. did I eat it?']];
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
  return { v: 1, name, day: 1, time: 6.4, x: S.start.x, y: S.start.y, dir: 0, fr: 0, hp: 100, food: 72, water: 72, en: 100, inv: {}, weps: {}, cur: 'fist', flags: {}, looted: {}, lootN: 0, floor: 0, flr: 1, stash: {}, dis: {}, fac: { fuel: 0, food: 0, water: 0, med: 0, arms: 0 }, links: {}, conv: {}, fort: {}, prod: {}, mis: null, crops: 0, strand: [], col: { pop: 0, bodies: 0, hurt: 0, trainee: 0, jobs: { guard: 0, farm: 0, scav: 0, doc: 0, soldier: 0, medic: 0, cook: 0, water: 0, fuel: 0, pharm: 0, smith: 0 }, bDay: 0, research: 0, horde: 0 }, pages: [], taken: {}, kills: 0, dayKills: 0, comps, veh, inVeh: -1, lastVeh: -1, shel: {}, safe: { x: S.start.x, y: S.start.y }, zoom: 3, deaths: 0 };
}
function enterWorld() {
  World.gen(); setupLife(); applyConv(); View3D.build(); R.bodies = []; R.raid = null; R.defs = [];
  for (const k in World.gates) if (G.flags[k]) World.setGate(k, true);
  for (const k in World.locks) if (G.flags['lk_' + k]) World.setLock(k, true);
  applyFloor(); buildObjs(); syncNpcs(); spawnAll();
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
  try { const g = JSON.parse(localStorage.getItem('ibz_save_' + name)); if (!g) return false; const b = blank(name); G = Object.assign(b, g); for (const id of COMPS) if (!G.comps[id]) G.comps[id] = b.comps[id]; G.col.jobs = Object.assign({ soldier: 0, medic: 0, cook: 0, water: 0, fuel: 0, pharm: 0, smith: 0 }, G.col.jobs); G.col.trainee = G.col.trainee || 0; G.conv = G.conv || {}; if (!g.fort) { G.fort = {}; if (G.conv.hosp != null) G.fort.hosp = 1; if (G.conv.camp != null) G.fort.camp = 1; } G.prod = G.prod || {}; G.strand = G.strand || []; enterWorld(); toast(tr('هلا بيك من جديد، ', 'Welcome back, ') + name); return true; } catch (e) { return false; }
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
    else if (c.st === 'post') { const o = old.find(n => n.id === id && n.poster === c.post); put(id, o || postSpot(c.post)); const e = R.npcs[R.npcs.length - 1]; e.poster = c.post; if (o) Object.assign(e, { job: o.job, path: o.path, pi: o.pi, wt: o.wt, st: o.st, carry: o.carry, ws: o.ws, cyc: o.cyc, hop: o.hop, tgt: o.tgt }); }
    else if (c.st === 'none' && (id !== 'saif' || (G.day >= 3 && !G.flags.saifNo))) put(id, S[id]);
  }
  if (G.day >= 2) put('haji', S.haji);
  if (G.flags.umali && G.flags.umaliMoved) { const o = old.find(n => n.id === 'umali'); put('umali', o || postSpot('kitchen')); const e = R.npcs[R.npcs.length - 1]; e.poster = 'kitchen'; if (o) Object.assign(e, { job: o.job, path: o.path, pi: o.pi, wt: o.wt, st: o.st, carry: o.carry, ws: o.ws, cyc: o.cyc }); }
  else if (G.flags.umali) put('umali', { x: S.home.x + 28, y: S.home.y - 10 }); else if (G.day >= 4) put('umali', S.umali);
  put('book', S.book);
  for (const st of G.strand) put('st' + st.k, st);
  for (let i = 0; i < Math.min(16, G.col.pop); i++) { const id = 'sv' + i, o = old.find(n => n.id === id); put(id, o || mallSpot()); const e = R.npcs[R.npcs.length - 1]; e.worker = 1; e.idx = i; if (o) { e.job = o.job; e.path = o.path; e.pi = o.pi; e.wt = o.wt; e.st = o.st; e.tgt = o.tgt; e.carry = o.carry; e.ws = o.ws; e.cyc = o.cyc; e.hop = o.hop; } }
}
function buildObjs() {
  const o = R.objs; o.length = 0;
  R.fuelC = World.containers.find(c => c.fixed === 'fuel');
  const LB = { home: [['بيتك', 'Your home'], '#7fc24b'], mall: [['مول الكرادة — مكان آمن', 'Karrada Mall — safe place'], '#c9a84c'], booth: [['كابينة السيطرة', 'Checkpoint booth'], '#e8cf7a'], pharmacy: [['صيدلية', 'Pharmacy'], '#7fe0a0'], police: [['مركز الشرطة', 'Police station'], '#8fb0e8'], butcher: [['قصّاب', 'Butcher'], '#e08a7a'], bookshop: [['مكتبة المتنبي', 'Mutanabbi bookshop'], '#d8b98a'], armory: [['المشجب', 'Armory'], '#a8c070'], hospital: [['المستشفى', 'Hospital'], '#ff7b7b'], camp: [['المعسكر', 'Camp'], '#b8d080'], waterplant: [['محطة الماي', 'Water plant'], '#3d8fd6'], refinery: [['المصفى', 'Refinery'], '#e08a3a'], warehouse: [['مخزن المشروبات', 'Drinks warehouse'], '#e06a5a'] };
  const LBX = { hospital: () => op('hosp') ? null : ['مستشفى مهجور — يحتاج تحصين', 'Abandoned hospital — needs fortifying'], camp: () => op('camp') ? null : ['ساحة معسكر مهجورة — تحتاج تحصين', 'Abandoned camp yard — needs fortifying'], waterplant: () => G.fac.water ? null : ['محطة ماي عاطلة', 'Broken water plant'], refinery: () => G.fac.fuel ? null : ['مصفى عاطل', 'Broken refinery'] };
  R.labels = World.buildings.filter(b => LB[b.type]).map(b => ({ b: b.i + 1, x: (b.x + b.w / 2) * 16, y: (b.y + b.h / 2) * 16, h: b.type === 'mall' ? 6.6 : b.type === 'warehouse' ? 5 : 3.4, t: (LBX[b.type] && LBX[b.type]()) || LB[b.type][0], c: LB[b.type][1] }));
  const mb = R.mini = Art.mk(World.W, World.H), mg = mb.getContext('2d'), MC = { 0: '#8f7f5c', 8: '#6f7a4c', 1: '#33343a', 2: '#77736a', 5: '#2f6068', 6: '#55565c', 7: '#1a1a1e', 10: '#555', 11: '#e3b62f' };
  for (let y = 0; y < World.H; y++) for (let x = 0; x < World.W; x++) { mg.fillStyle = MC[World.tiles[World.I(x, y)]] || '#8f7f5c'; mg.fillRect(x, y, 1, 1); }
  for (const b of World.buildings) { mg.fillStyle = LB[b.type] ? LB[b.type][1] : '#b3a88e'; mg.fillRect(b.x, b.y, b.w, b.h); }
  o.push({ x: S.homeBed.x, y: S.homeBed.y, label: ['نام', 'Sleep'], act: () => sleepAct(S.start) });
  o.push({ x: S.mallBed.x, y: S.mallBed.y, r: 30, label: ['نام', 'Sleep'], act: () => sleepAct({ x: S.mallBed.x, y: S.mallBed.y + 26 }) });
  for (const b of World.inner) if (b.k === 'bed' && !World.safe[World.I(b.x >> 4, b.y >> 4)]) o.push({ x: b.x, y: b.y, r: 26, label: ['نام هنا (مو آمن مثل المقر)', 'Sleep here (not as safe as base)'], act: () => sleepAct(World.freeNear(b.x, b.y + 20), true) });
  o.push({ x: S.homeBench.x, y: S.homeBench.y, label: ['طوّر الملجأ', 'Upgrade shelter'], act: shelter });
  o.push({ x: S.radio.x, y: S.radio.y, label: ['الراديو', 'Radio'], act: radio });
  o.push({ x: S.mallBench.x, y: S.mallBench.y, label: ['الورشة', 'Workshop'], act: () => { if (!G.flags.gen) toast(tr('الورشة بلا كهرباء. المولدة عطلانة.', 'The workshop has no power. The generator is dead.')); else if (comp('mur').st === 'left') toast(tr('مرتضى راح.. ومحد يعرف يشتغل عليها.', 'Murtadha is gone... nobody else knows how to use it.')); else workshop(); } });
  o.push({ x: S.mallGen.x, y: S.mallGen.y, label: ['المولدة', 'Generator'], act: () => toast(G.flags.gen ? tr('المولدة تشتغل. صوتها أحلى من الموسيقى.', 'The generator is running. Sweeter than music.') : tr('مولدة المول عطلانة. يرادلها مرتضى و٣ قطع غيار.', 'The mall generator is dead. It needs Murtadha and 3 spare parts.')) });
  o.push({ x: S.board.x, y: S.board.y, label: ['تطوير المقر', 'Develop the base'], act: baseMenu });
  for (const k of ['hosp', 'camp']) { const b = bOfK(k); if (!b) continue; const dy = b.door === 'S' ? b.dy - 1 : b.dy + 1, dy2 = b.door === 'S' ? b.dy + 1 : b.dy - 1; if (op(k)) o.push({ x: b.dx * 16 + 8, y: dy * 16 + 8, r: 30, label: k === 'hosp' ? ['المستشفى', 'Hospital'] : ['المعسكر', 'Camp'], act: () => { if (!supplyAct(k)) (k === 'hosp' ? hospMenu : colonyPanel)(); } }); else o.push({ x: b.dx * 16 + 8, y: dy2 * 16 + 8, r: 34, label: k === 'hosp' ? ['حصّن المستشفى', 'Fortify the hospital'] : ['حصّن المعسكر', 'Fortify the camp'], act: () => fortify(k) }); }
  o.push({ x: S.stairs.x, y: S.stairs.y, r: 26, fl: 'all', label: ['الدرج', 'Stairs'], act: stairsMenu });
  for (const f of S._mall.floors[0]) if (f.k === 'bed') o.push({ x: f.tx * 16 + 8, y: f.ty * 16 + 8, fl: 1, label: ['نام', 'Sleep'], act: () => sleepAct({ x: S.mallBed.x, y: S.mallBed.y + 26 }) });
  for (const f of S._mall.floors[1]) { if (f.stash) o.push({ x: f.tx * 16 + 8, y: f.ty * 16 + 8, fl: 2, label: ['المخزن', 'Storage'], act: stashPanel }); if (f.clinic) o.push({ x: f.tx * 16 + 8, y: f.ty * 16 + 8, fl: 2, r: 28, label: ['سرير العيادة', 'Clinic bed'], act: clinic }); }
  for (const k in LINKS) { const l = LINKS[k]; for (const [from, to, nm] of [[l.a, l.b, l.nb], [l.b, l.a, l.na]]) o.push({ x: S[from].x, y: S[from].y, r: 22, label: [l.n[0] + ' ← ' + nm[0], l.n[1] + ' → ' + nm[1]], hide: () => !G.links[k], act: () => travel(S[to]) }); }
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
const ZL = {}, ZMODEL = { normal: 'Z01', vendor: 'Z02', fat: 'Z05', gen: 'Z04', soldier: 'Z06', hassan: 'Z07', colonel: 'Z08' };
function zlook(type, v) {
  const k = type + v; if (ZL[k]) return ZL[k];
  const o = { id: 'z' + k, z: 1, skin: ['#8fae7a', '#7fa08a', '#9ab07a'][v % 3], shirt: ['#7a4a4a', '#4a5d7a', '#6a6a55', '#5a4a6a', '#8a7a4a', '#3f5f4f'][v % 6], pants: ['#33373f', '#4a4033', '#2f3a33'][v % 3], hair: '#22201a' };
  const rb = ['#b9b4a0', '#8a8f96', '#a39070'][v % 3];
  if (ZMODEL[type]) o.model = ZMODEL[type];
  if (type === 'cop') Object.assign(o, { shirt: '#dfe6ee', pants: '#1c2f55', hat: 'cap', hatc: '#f4f4f4', vest: '#b8e04a' });
  if (type === 'vendor') Object.assign(o, { robe: rb, shirt: rb, stache: 1 });
  if (type === 'fat') o.fat = 1;
  if (type === 'gen') Object.assign(o, { shirt: '#3d5a80', fat: 1, stache: 1 });
  if (type === 'soldier') Object.assign(o, { shirt: '#5a6b3a', pants: '#4a5a30', hat: 'helmet', hatc: '#4a5a30' });
  if (type === 'hassan') Object.assign(o, { robe: '#e9e4d6', shirt: '#e9e4d6', bald: 1, stache: 1, bag: 1, fat: 1 });
  if (type === 'colonel') Object.assign(o, { shirt: '#1c2f55', pants: '#1c2f55', hat: 'cap', hatc: '#1c2f55', fat: 1, stache: 1 });
  if (type === 'boss') Object.assign(o, { shirt: '#1b4fa3', pants: '#222', fat: 1, bald: 1 });
  if (type === 'doctor') Object.assign(o, { shirt: '#eef0f0', pants: '#5a7a9a' });
  if (type === 'giant') Object.assign(o, { fat: 1, shirt: '#5a3a2a', bald: 1 });
  if (type === 'ali') Object.assign(o, { shirt: '#1f7a3a', pants: '#2c2f36', skin: '#a9b88a' });
  return ZL[k] = o;
}
function mkZ(type, x, y) { const s = ZT[type]; return { type, s, x, y, hp: s.hp, look: zlook(type, (Math.random() * 6) | 0), dir: (Math.random() * 4) | 0, wob: rand(0, 6), kx: 0, ky: 0, fall: 0, scare: 0, alert: 0, at: .5, wt: rand(0, 3), wa: null, say: rand(3, 12), flash: 0, guard: 0 }; }
function ztype(zn) { const r = Math.random(); if (zn === 0) return r < .1 ? 'vendor' : r < .18 ? 'fat' : 'normal'; if (zn === 1) return r < .32 ? 'vendor' : r < .42 ? 'cop' : r < .49 ? 'gen' : r < .56 ? 'fat' : 'normal'; if (zn === 2) return r < .2 ? 'cop' : r < .3 ? 'fat' : r < .36 ? 'gen' : 'normal'; if (zn === 3) return r < .22 ? 'vendor' : r < .3 ? 'gen' : 'normal'; return r < .6 ? 'soldier' : 'normal'; }
const ZCOUNT = [22, 32, 34, 26, 36];
function spawnAll() {
  R.zombies.length = 0; const f = G.flags;
  { const H = bOfK('hosp'), C = bOfK('camp'); if (H && !op('hosp')) for (let i = 0; i < 5; i++) { const p = bldSpot(H), z = mkZ('doctor', p.x, p.y); z.look = zlook('doctor', i); R.zombies.push(z); } if (C && !op('camp')) for (let i = 0; i < 4; i++) { const p = doorOut(C, 6); R.zombies.push(mkZ('soldier', p.x, p.y)); } }
  if (f.ch2 && !f.bigBoss) spawnGiant(S.g4.x - 60, S.g4.y + 10, { big: 1 });
  if (f.aliQ === 1 && f.g3) spawnAli();
  misSpawn();
  for (const st of G.strand) for (let i = 0; i < 3; i++) { const a = rand(0, 6.28), z = mkZ(ztype(World.zoneOf(st.x >> 4)), st.x + Math.cos(a) * 60, st.y + Math.sin(a) * 60); if (!solidAt(z.x, z.y, 1)) R.zombies.push(z); }
  if (G.col.horde) { const n = Math.max(4, 12 + G.col.pop + (G.col.raid || 0) - G.col.jobs.guard * 3); G.col.raid = 0; for (let i = 0; i < n; i++) { const a = rand(0, 6.28), z = mkZ(ztype(2), S.mallDoor.x + Math.cos(a) * rand(120, 240), S.mallDoor.y + 60 + Math.abs(Math.sin(a)) * rand(40, 160)); z.alert = 20; if (!solidAt(z.x, z.y, 1)) R.zombies.push(z); } G.col.horde = 0; }
  for (let zn = 0; zn < 5; zn++) { const n = Math.round(ZCOUNT[zn] * (1 + Math.min(G.day, 12) * .035 + G.col.pop * .04) * (secured(zn) ? .3 : 1)); for (let i = 0; i < n; i++) { const p = World.randOutdoor(zn); if (!p || hyp(p.x - G.x, p.y - G.y) < 170) continue; if (zn === 0 && !f.hassan && hyp(p.x - S.home.x, p.y - S.home.y) < 260) continue; R.zombies.push(mkZ(ztype(zn), p.x, p.y)); } }
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
    if (z.raid && R.raid) { const dd = hyp(S.mallDoor.x - z.x, S.mallDoor.y + 14 - z.y); if (!(d < 110 && !hidden)) { if (dd > 22) { const a = flowDir(z); stepZ(z, a, z.s.sp * 1.3, dt); } else { R.raid.dmg += dt; z.wob += dt * 3; } continue; } }
    const sight = (night ? 128 : 96) * (R.pInside && !World.bAt(z.x >> 4, z.y >> 4) ? .5 : 1) * (z.type === 'boss' ? 2 : 1);
    if (!hidden && (d < sight || z.alert > 0)) {
      if (d < sight) z.alert = Math.max(z.alert, 3);
      stepZ(z, Math.atan2(dy, dx) + Math.sin(z.wob * .5) * .4, z.s.sp * (night ? 1.15 : 1), dt);
      if (Math.random() < dt * .04 && z.type !== 'boss' && z.type !== 'giant') { z.fall = 1.3; bubble(z, pick(L(OUCH)), 1.2); }
      if (d < (z.type === 'boss' ? 20 : z.type === 'giant' ? 24 : 12)) { z.at -= dt; if (z.at <= 0) { z.at = 1.1; zAttack(z); } }
    } else { z.wt -= dt; if (z.wt <= 0) { z.wt = rand(2, 6); z.wa = Math.random() < .3 ? null : rand(0, 6.28); } if (z.wa != null) stepZ(z, z.wa, z.s.sp * .5, dt); }
    z.say -= dt; if (z.say <= 0 && d < 170) { z.say = rand(6, 15); bubble(z, pick(L(ZLINES[z.type] || ZLINES.normal))); }
  }
  for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) { const a = A[i], b = A[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy; if (d2 < 64 && d2 > .01) { const d = Math.sqrt(d2), p = (8 - d) * .5 / d; move(a, -dx * p, -dy * p, 4, 1); move(b, dx * p, dy * p, 4, 1); } }
}
function zAttack(z) {
  if (G.inVeh >= 0) { const v = G.veh[G.inVeh]; v.hp -= z.s.dmg * .4 * (1 - v.up.armor * .3); sfx('hit'); return; }
  if (R.inv > 0) return; G.hp -= z.s.dmg * (1 - gearCut()); R.inv = .5; R.shake = z.type === 'giant' ? .7 : .25; sfx('hurt'); $('#hurt').style.opacity = 1; setTimeout(() => $('#hurt').style.opacity = 0, 160);
  if (G.hp <= 0) die();
}
function hitZ(z, dmg, a, kb) {
  if (z.type === 'giant') kb *= .12;
  z.hp -= dmg; z.kx = Math.cos(a) * kb; z.ky = Math.sin(a) * kb; z.flash = .12; z.alert = 6; z.guard = 0; sfx('hit');
  R.fx.push({ k: 'puff', x: z.x, y: z.y - 9, t: .25, c: '#7a1a1a' }); if (z.hp <= 0) killZ(z);
}
function killZ(z) {
  const i = R.zombies.indexOf(z); if (i >= 0) R.zombies.splice(i, 1);
  for (let j = 0; j < 6; j++) R.fx.push({ k: 'puff', x: z.x + rand(-5, 5), y: z.y - rand(2, 14), t: rand(.25, .6), c: j % 2 ? '#5d7a3a' : '#7a1a1a' });
  if (R.raid && z.raid) R.raid.killed++;
  if (z.type === 'ali') { add('alibody'); G.flags.aliQ = 2; toast(tr('علي وكع! هذا هو.. فانيلة المنتخب والنظارات. شلته على كتفي. وصّله لنور بالمستشفى.', 'Ali is down! That is him... green jersey and glasses. On my shoulder now. Take him to Noor at the hospital.'), 8000); save(true); return; }
  if (z.type === 'giant') { R.shake = .8; G.flags.giants = (G.flags.giants || 0) + 1; toast(z.big ? tr('«أبو كرش» وكع! الأرض ارتاحت. بغداد كلها سمعت الصوت.', '«Abu Karsh» is down! The ground can rest. All of Baghdad heard it.') : tr('الضخم وكع! فتّش جيوبه..', 'The giant is down! Check his pockets...'), 4000); if (z.big) { G.flags.bigBoss = 1; save(true); } }
  if (op('hosp') && !z.guard && !['boss', 'colonel', 'hassan', 'giant'].includes(z.type) && R.bodies.length < 30) R.bodies.push({ x: z.x, y: z.y, look: z.look, t: 150 });
  G.kills++; G.dayKills++; const r = Math.random(), got = (id, n = 1) => { add(id, n); toast('+ ' + L(ITEMS[id].n) + (n > 1 ? ' ×' + n : ''), 2200); };
  if (z.type === 'hassan') { G.flags.hassan = 1; add('samoon', 2); toast(tr('أبو حسن وكع.. وكيس الصمون صار إلك. الله يرحمه، جان يطلبني ألف دينار.', 'Abu Hassan is down... and his bag of bread is yours. Rest in peace — I owed him a thousand dinars.'), 6500); save(true); }
  else if (z.type === 'colonel') { G.flags.colonel = 1; add('key_police'); toast(tr('العقيد وكع. أخذت مفتاح مركز الشرطة من حزامه.', 'The Colonel is down. Took the police station key from his belt.'), 5500); }
  else if (z.type === 'boss') { G.flags.boss = 1; R.shake = 1; toast(tr('العملاق وكع! باب المخزن صار بلا حارس.', 'The giant is down! The warehouse door is unguarded.'), 6000); add('scrap', 6); save(true); }
  else dropLoot(z);
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
  if (d.tank) v.fuel = Math.max(0, v.fuel - hyp(v.x - ox, v.y - oy) * d.use * .5);
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
  if (it.gear) return wearGear(id);
  if (it.wep) { take(id); G.weps[it.wep] = WEAPONS[it.wep].dur; G.cur = it.wep; sfx('fix'); return toast(tr('صار عندك ' + L(WEAPONS[it.wep].n) + '.', 'You now have a ' + L(WEAPONS[it.wep].n) + '.')); }
  if (it.fuel) { const i = G.inVeh >= 0 ? G.inVeh : nearVeh(); if (i < 0 || !VEH[G.veh[i].t].tank) return toast(tr('لازم تكون يم سيارة بيها خزان.', 'You need to be next to a vehicle with a tank.')); const v = G.veh[i]; v.fuel = Math.min(maxFuel(v), v.fuel + it.fuel); take(id); sfx('fix'); return toast(tr('عبّيت ' + L(VEH[v.t].n) + ' بانزين.', 'Refuelled the ' + L(VEH[v.t].n) + '.')); }
  if (it.food || it.water || it.hp || it.en) { take(id); G.food = Math.min(100, G.food + (it.food || 0)); G.water = Math.min(100, G.water + (it.water || 0)); G.hp = Math.min(100, G.hp + (it.hp || 0)); G.en = Math.min(100, G.en + (it.en || 0)); sfx('eat'); if (id === 'dolma') toast(tr('دولمة.. رجعتلي الروح.', 'Dolma... my soul is back.')); }
}
function quick(kind) { const list = kind === 'eat' ? (G.water < G.food ? ['water', 'tea', 'samoon', 'dates', 'can'] : ['samoon', 'dates', 'can', 'water']) : ['bandage', 'medkit']; const id = list.find(x => has(x)); if (id) { useItem(id); toast('− ' + L(ITEMS[id].n), 1500); } else toast(kind === 'eat' ? tr('ماكو أكل ولا ماي!', 'No food or water!') : tr('ماكو إسعافات!', 'No medical supplies!')); }
async function die() {
  if (R.dying) return; R.dying = 1; G.deaths++; G.hp = 0;
  await notebook(L([['~ ومات البطل. النهاية.', 'لا لا لا.. شنو مات؟ هاي قصتي واني حرّ بيها.', 'نرجّعه للملجأ.. ونكول جان كابوس داخل كابوس.'], ['~ And the hero died. The End.', "No no no... died? It's my story and I do what I want.", "Back to the shelter... we'll say it was a nightmare inside a nightmare."]]), { title: dayTitle() });
  if (G.inVeh >= 0) G.inVeh = -1; G.floor = 0; applyFloor(); G.x = G.safe.x; G.y = G.safe.y; G.hp = 60; G.food = Math.max(G.food, 30); G.water = Math.max(G.water, 30); G.en = Math.max(G.en, 40);
  syncNpcs(); for (const n of R.npcs) if (n.follow) { n.x = G.x + rand(-14, 14); n.y = G.y + rand(8, 20); } spawnAll(); R.dying = 0; R.inv = 2;
}

// ---------------------------------------------------------------- companions
function seatsOf(v) { return VEH[v.t].seats + v.up.seats * 2 - 1; }
// ---------------- survivors go to their jobs
const JOBT = { soldier: ['جندي', 'Soldier'], guard: ['حارس', 'Guard'], scav: ['جمّاع', 'Scavenger'], farm: ['مزارع', 'Farmer'], doc: ['باحث', 'Researcher'], medic: ['مسعف', 'Medic'], idle: ['ناجي بلا شغل', 'Idle survivor'] };
const JOBL = { soldier: [['واحد.. اثنين.. استعد!', 'السلاح نظيف، والقلب قوي.'], ['One... two... ready!', 'Rifle clean, heart strong.']], guard: [['كلشي هادي بالباب.', 'محد يعبر بلا ما أشوفه.'], ['All quiet at the door.', 'Nobody passes without me seeing.']], scav: [['طالع أدوّر أغراض.', 'لكيت شي! خلّي أشيله.'], ['Heading out to scavenge.', 'Found something! Let me grab it.']], farm: [['التربة هنا زينة.', 'الطماطة تحتاج ماي.'], ['Good soil here.', 'The tomatoes need water.']], doc: [['العينة رقم ١٢.. فشلت. نعيد.', 'قريبين من اللقاح.. أحس.'], ['Sample #12... failed. Again.', 'We are close to a vaccine... I feel it.']], medic: [['وين الجرحى؟', 'الضماد خلص.. نحتاج دوه.'], ['Where are the wounded?', 'Out of bandages... we need medicine.']], idle: [['منتظر شغل.. وزّعوني!', 'ماكو شي أسويه؟'], ['Waiting for work... assign me!', 'Nothing for me to do?']] };
function jobOf(i) { const j = G.col.jobs; let k = 0; for (const name of ['soldier', 'guard', 'scav', 'farm', 'doc', 'medic']) { k += j[name] || 0; if (i < k) return name; } return 'idle'; }
function mallSpot() { return World.freeNear((121 + Math.random() * 11) * 16, (39 + Math.random() * 10) * 16); }
function bldSpot(b) { return World.freeNear((b.x + 1 + Math.random() * (b.w - 2)) * 16, (b.y + 1 + Math.random() * (b.h - 2)) * 16); }
function doorOut(b, spread) { const y = b.door === 'S' ? b.dy + 1 : b.dy - 1; return World.freeNear((b.dx + (Math.random() - .5) * spread) * 16 + 8, (y + (b.door === 'S' ? 1 : -1) * Math.random() * 2) * 16 + 8); }
function farmSpot() { if (!R.farm) { const cx = 127, cy = 31; outer: for (let r = 0; r < 20; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = cx + dx, y = cy + dy, t = World.tiles[World.I(x, y)]; if ((t === 0 || t === 8) && !World.bAt(x, y) && !World.block[World.I(x, y)]) { R.farm = { x: x * 16, y: y * 16 }; break outer; } } R.farm = R.farm || S.mallDoor; } return World.freeNear(R.farm.x + (Math.random() - .5) * 48, R.farm.y + (Math.random() - .5) * 48); }
function workSpot(job, phase) {
  const mall = World.buildings[S._mall.b - 1], B = id => World.buildings.find(b => b.type === id), night = G.time % 24 >= 20 || G.time % 24 < 6;
  if (night && job !== 'guard') return mallSpot();
  if (job === 'guard') return doorOut(mall, 6);
  if (job === 'soldier') return G.conv.camp != null ? doorOut(World.buildings[G.conv.camp], 5) : doorOut(mall, 8);
  if (job === 'farm') return farmSpot();
  if (job === 'doc' || job === 'medic') { const h = G.conv.hosp != null ? World.buildings[G.conv.hosp] : B('pharmacy'); return h ? bldSpot(h) : mallSpot(); }
  if (job === 'scav') { if (phase === 'back') return mallSpot(); const zs = [2]; if (G.flags.g1) zs.push(1); if (G.flags.g3) zs.push(3); for (let t = 0; t < 12; t++) { const p = World.randOutdoor(pick(zs)); if (p && hyp(p.x - S.mallDoor.x, p.y - S.mallDoor.y) < 640) return p; } return doorOut(mall, 10); }
  return mallSpot();
}
function findPath(fx, fy, tx, ty) {
  const W = World.W, H = World.H, N = W * H, prev = R.pprev || (R.pprev = new Int32Array(N)), q = R.pq || (R.pq = new Int32Array(N)); prev.fill(-2);
  const s = fx + fy * W, g = tx + ty * W; let h = 0, t = 0; q[t++] = s; prev[s] = -1;
  while (h < t) { const c = q[h++]; if (c === g) break; const x = c % W, y = (c / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 1 || ny < 1 || nx >= W - 1 || ny >= H - 1) continue; const n = nx + ny * W; if (prev[n] !== -2 || World.solid(nx, ny)) continue; prev[n] = c; q[t++] = n; } }
  if (prev[g] === -2) return null; const path = []; for (let c = g; c !== -1; c = prev[c]) path.push(c); path.reverse();
  const out = []; for (let i = 1; i < path.length; i++) if (i === path.length - 1 || i % 2 === 0) out.push({ x: (path[i] % W) * 16 + 8, y: ((path[i] / W) | 0) * 16 + 8 }); return out;
}
function updWorkersOld(dt) {
  let budget = 2;
  for (const e of R.npcs) {
    if (!e.worker) continue; const job = jobOf(e.idx);
    if (job !== e.job) { e.job = job; e.path = null; e.wt = 0; e.st = 'go'; }
    if (e.wt > 0) { e.wt -= dt; e.fr = 0; continue; }
    if (!e.path) { if (budget-- <= 0) continue; const phase = e.job === 'scav' && e.st === 'out' ? 'back' : 'go', p = workSpot(e.job, phase), path = findPath(e.x >> 4, e.y >> 4, p.x >> 4, p.y >> 4); e.path = path && path.length ? path : [p]; e.pi = 0; e.st = phase === 'back' ? 'back' : (e.job === 'scav' ? 'out' : 'go'); continue; }
    const w = e.path[e.pi], dx = w.x - e.x, dy = w.y - e.y, d = hyp(dx, dy), sp = (e.job === 'scav' ? 58 : 44) * dt;
    if (d < 3) { e.pi++; if (e.pi >= e.path.length) { e.path = null; e.wt = e.job === 'scav' ? (e.st === 'out' ? rand(4, 7) : rand(6, 10)) : rand(3, 8); if (e.st === 'back') e.st = 'go'; if (hyp(e.x - G.x, e.y - G.y) < 260 && Math.random() < .35) bubble(e, pick(L(JOBL[e.job])), 2.6); } continue; }
    e.x += dx / d * Math.min(sp, d); e.y += dy / d * Math.min(sp, d); e.fr += dt * 8; e.dir = dirOf(dx, dy);
  }
}
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
  if (G.looted[c.id] && c.kind === 'trunk') {
    const left = 3 - (G.day - (G.dis[c.id] || -9)); if (left > 0) return toast(tr('فكّكت الي ينفك منها. ارجعلها بعد ' + left + ' أيام.', 'Stripped what could be stripped. Come back in ' + left + ' days.'));
    if (G.en < 10) return toast(tr('تعبان.. ما بيّه حيل أفكّك.', 'Too tired to strip it.'));
    G.dis[c.id] = G.day; G.en -= 8; G.time += .4; const n = 2 + ((Math.random() * 3) | 0); add('scrap', n); const pt = Math.random() < .4; if (pt) add('parts'); sfx('fix'); for (const z of R.zombies) if (hyp(z.x - G.x, z.y - G.y) < 150) z.alert = 5;
    return toast('+ ' + L(ITEMS.scrap.n) + ' ×' + n + (pt ? tr('، قطع غيار ×1', ', spare parts ×1') : '') + tr('  (التفكيك يسوي صوت)', '  (stripping is noisy)'));
  }
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
  const PO = { noor: ['hosp', () => op('hosp'), ['امسكي المستشفى', 'Run the hospital']], sol: ['camp', () => op('camp'), ['استلم المعسكر ودرّب الناس', 'Take the camp and train people']], mur: ['garage', () => G.flags.gen, ['امسك ورشة المول', 'Run the mall workshop']], aj: ['gate', () => G.flags.mall, ['اكعد يم باب المول وسوّي چاي للحرس', 'Sit by the mall door and brew tea for the guards']], saif: ['radio', () => G.flags.radio, ['صير مذيع إذاعة المول', 'Become the mall radio host']] }, po = PO[id];
  if (po && po[1]() && !(c.st === 'post' && c.post === po[0])) o.push(L(po[2]));
  o.push(tr('ماكو شي', 'Never mind'));
  const i = await say(id, pick(L(GREET[id])), o), ch = o[i];
  if (po && ch === L(po[2])) { c.st = 'post'; c.post = po[0]; c.x = null; syncNpcs(); sfx('fix'); return toast(tr(L(NPC[id].n) + ' استلم مكانه. تشوفه هناك يشتغل.', L(NPC[id].n) + ' took the post. You will see them working there.'), 5000); }
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
    const mode = await say('haji', tr('هلا بالعزيز. السوك ما يوكف حتى لو الدنيا خربت. شتريد؟  (فلوسك: ' + (G.inv.dinar || 0).toLocaleString('en') + ' دينار)', 'Welcome, dear. The market never stops, even when the world does. What do you want?  (money: ' + (G.inv.dinar || 0).toLocaleString('en') + ' dinars)'), [tr('أشتري بالفلوس', 'Buy with money'), tr('أبيع أغراض', 'Sell items'), tr('أبادل غرض بغرض', 'Swap items'), tr('الله وياك حجي', 'Take care, Haji')]);
    if (mode === 3) return;
    if (mode < 2) for (;;) { const tds = mode === 0 ? HAJI_BUY : HAJI_SELL, o = tds.map(t => (mode === 0 ? (ICON[t[1]] || '') + ' ' + L(ITEMS[t[1]].n) + ' ×' + t[2] + '  ←  ' + t[0].dinar.toLocaleString('en') + tr(' دينار', ' dinars') : (ICON[Object.keys(t[0])[0]] || '') + ' ' + L(ITEMS[Object.keys(t[0])[0]].n) + ' (' + tr('عندك ', 'have ') + (G.inv[Object.keys(t[0])[0]] || 0) + ')  ←  ' + t[2].toLocaleString('en') + tr(' دينار', ' dinars'))); o.push(tr('رجوع', 'Back'));
      const i = await say('haji', tr('فلوسك: ' + (G.inv.dinar || 0).toLocaleString('en') + ' دينار', 'Money: ' + (G.inv.dinar || 0).toLocaleString('en') + ' dinars'), o); if (i >= tds.length) return SC.haji(); const t = tds[i];
      if (!afford(t[0])) { await say('haji', mode === 0 ? tr('عمّي الفلوس ما تكفي. الدَّين ممنوع والعتب مرفوع.', "Son, not enough money. No credit, no hard feelings.") : tr('ما عندك هذا الغرض يا معوّد.', "You don't have that, my friend.")); continue; }
      pay(t[0]); add(t[1], t[2]); sfx('pick'); toast('+ ' + (ICON[t[1]] || '') + ' ' + L(ITEMS[t[1]].n) + ' ×' + t[2].toLocaleString('en')); }
    for (;;) {
      const tds = [[{ samoon: 2 }, 'scrap', 3], [{ water: 2 }, 'scrap', 3], [{ scrap: 4 }, 'parts', 1], [{ can: 2 }, 'ammo9', 8], [{ scrap: 3 }, 'dates', 3], [{ scrap: 4 }, 'fuel', 1], [{ dates: 3 }, 'water', 2], [{ scrap: 5 }, 'medkit', 1]];
      const o = tds.map(t => costStr(t[0]) + '  ←  ' + L(ITEMS[t[1]].n) + ' ×' + t[2]); o.push(tr('الله وياك حجي', 'Take care, Haji'));
      const i = await say('haji', tr('هلا بالعزيز. السوك ما يوكف حتى لو الدنيا خربت. شتريد تبادل؟', 'Welcome, dear. The market never stops, even when the world does. What will you trade?'), o);
      if (i >= tds.length) return; const t = tds[i];
      if (!afford(t[0])) { await say('haji', tr('عمّي ما عندك. الدَّين ممنوع والعتب مرفوع.', "Son, you don't have it. No credit, no hard feelings.")); continue; }
      pay(t[0]); add(t[1], t[2]); sfx('pick'); toast('+ ' + L(ITEMS[t[1]].n) + ' ×' + t[2]);
    }
  },
  async umali() {
    if (G.flags.umali) return umaliTalk();
    if (0) return say('umali', tr('أكلت؟ وجهك أصفر. اكعد أسويلك شي.', "Have you eaten? You look pale. Sit, I'll make you something."));
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
for (let i = 0; i < 16; i++) SC['sv' + i] = async () => { if (await say('sv' + i, pick(L([['الحمد لله لكينا مكان. سمعنا صوتك بالراديو.', 'اني جنت معلم.. هسه أحرس باب مول. الدنيا دوّارة.', 'شكو أكل اليوم؟ لا تكلي تمر مرة ثانية.', 'إذا تحتاج شي كول. إحنا أهل.', 'الزومبيات برّه تزيد كل ما نزيد إحنا.. يشمّون الأمل.'], ['Thank God we found a place. We heard your voice on the radio.', 'I was a teacher... now I guard a mall door. Life is funny.', "What's for dinner? Don't say dates again.", 'If you need anything, say so. We are family now.', 'The more of us there are, the more zombies gather outside... they smell hope.']])), [tr('وزّع الشغل على الناس', 'Assign jobs to people'), tr('ولا شي', 'Never mind')]) === 0) colonyPanel(); };
async function broadcast() {
  const c = G.col; if (c.bDay === G.day) return say(tr('الراديو', 'Radio'), tr('بثّيت اليوم. خلّي النداء يوصل.. جرّب باجر.', 'You already broadcast today. Let the call travel... try tomorrow.'));
  if (c.pop >= colCap()) return say('me', tr('ماكو مكان بعد.. المول يشيل ' + colCap() + ' بس. لازم أفتح طابق ثاني من الدرج.', 'No more room... the mall holds only ' + colCap() + '. I need to open another floor from the stairs.'));
  c.bDay = G.day; c.incoming = 1; c.horde = 1; sfx('page');
  await say('me', tr('"إلى كل من يسمعني.. هنا مول الكرادة. عدنا أكل وماي وسكف. تعالوا. والزومبي بطيء، لا تخافون."', '"To anyone who can hear me... this is Karrada Mall. We have food, water and a roof. Come. The zombies are slow, don\'t be afraid."'));
  toast(tr('النداء انبث. الناجين يوصلون باجر الصبح.. والصوت راح يجمّع زومبي حول المول الليلة.', 'The call is out. Survivors arrive tomorrow morning... and the noise will draw zombies around the mall tonight.'), 7000);
}
function colonyDay(notes) {
  const c = G.col, j = c.jobs;
  if (c.incoming) { c.incoming = 0; const n = Math.min(Math.max(0, colCap() - c.pop), 1 + ((Math.random() * 3) | 0) + (colLevel() >= 2 ? 1 : 0)); c.pop += n; c.trainee = (c.trainee || 0) + n; notes.push(tr('وصلوا ' + n + ' ناجين على صوت الراديو! صرنا ' + c.pop + '. اليوم يتدرّبون، وباجر يستلمون شغل.', n + ' survivors followed the radio! We are ' + c.pop + ' now. They train today and start work tomorrow.')); }
  if (!c.pop) return;
  const lv0 = c.lv || 0; let food = 0, got = [];
  for (let i = 0; i < 0; i++) { const r = Math.random(); if (r < .45) food++; else if (r < .65) { add('scrap'); got.push('scrap'); } else if (r < .78) { add('water'); got.push('water'); } else if (r < .86) { add('parts'); got.push('parts'); } else if (r < .92) { add('ammo9', 3); got.push('ammo9'); } else if (r < .95) { add('fuel'); got.push('fuel'); } }
  let lack = c.pop - food; while (lack > 0) { const f = FOODS.find(x => G.stash[x] > 0); if (!f) break; if (--G.stash[f] <= 0) delete G.stash[f]; lack--; }
  while (lack > 0) { const f = FOODS.find(x => has(x)); if (!f) break; take(f); lack--; }
  if (lack > 0) { const gone = Math.min(c.pop, Math.ceil(lack / (umaliMall() ? 4 : 2))); if (umaliMall()) notes.push(tr('أم علي قسّمت الأكل بالعدل.. بس ما كفّى.', 'Um Ali shared the food fairly... it still was not enough.')); c.pop -= gone; let g = gone; for (const k of ['scav', 'doc', 'guard', 'farm', 'soldier', 'medic', 'cook', 'water', 'fuel', 'pharm', 'smith']) { const d = Math.min(j[k], g); j[k] -= d; g -= d; } notes.push(tr('الأكل ما كفّى المستعمرة. ' + gone + ' عافونه وراحوا يدورون رزقهم.', 'Not enough food for the colony. ' + gone + ' left to fend for themselves.')); }
  else if (food > c.pop) { const ex = Math.min(3, food - c.pop); add('samoon', ex); notes.push(tr('المزارعين طلّعوا أكل زايد: صمون ×' + ex + '.', 'The farmers had a surplus: bread ×' + ex + '.')); }
  if (got.length) notes.push(tr('الجمّاعين رجعوا بـ ' + got.length + ' غرض.', 'The scavengers came back with ' + got.length + ' items.'));
  if (c.hurt) { if (op('hosp')) { notes.push(tr(c.hurt + ' جرحى بأسرّة المستشفى.. المسعفين يعالجوهم واحد واحد.', c.hurt + ' wounded in the hospital beds... the medics treat them one by one.')); } else { const d = Math.ceil(c.hurt / 2); c.pop = Math.max(0, c.pop - d); fixJobs(); notes.push(tr('بلا مستشفى.. ' + d + ' من الجرحى ما صمدوا.', 'Without a hospital... ' + d + ' of the wounded did not make it.')); c.hurt = 0; } }
  if (c.bodies && op('hosp')) { const ch = Math.min(.8, .12 + c.research * .01 + j.medic * .08 + (atPost('noor', 'hosp') ? .18 : here('noor') ? .1 : 0)); let ok = 0; for (let i = 0; i < c.bodies; i++) if (Math.random() < ch) ok++; ok = Math.min(ok, Math.max(0, colCap() - c.pop)); const bad = c.bodies - ok; c.bodies = 0; c.pop += ok; c.trainee = (c.trainee || 0) + ok;
    if (ok) notes.push(tr('المستشفى رجّع ' + ok + ' زومبي لوعيهم! أول سؤال سألوه: "شكد الساعة؟ عندي دوام."', 'The hospital brought ' + ok + ' zombies back! First question: "What time is it? I have work."')); if (bad) notes.push(tr(bad + ' جثث ما نفع وياهم العلاج. دفنّاهم بكرامة.', bad + ' bodies could not be saved. We buried them with dignity.')); }
  if (op('hosp') && G.col.pop < colCap() && Math.random() < .5 && G.flags.mall) { c.pop++; c.trainee = (c.trainee || 0) + 1; notes.push(tr('واحد وصل للمول وحده بالليل.. شاف ضوه المستشفى.', 'Someone reached the mall alone last night... they saw the hospital lights.')); }
  if (j.soldier) { let a = j.soldier; while (a > 0 && (G.stash.ammo9 > 0 || has('ammo9'))) { if (G.stash.ammo9 > 0) { if (--G.stash.ammo9 <= 0) delete G.stash.ammo9; } else take('ammo9'); a--; } c.noAmmo = a > 0; if (a > 0) notes.push(tr('الجنود ما عدهم رصاص كافي.. يقاتلون بالعصي.', "The soldiers are short on ammo... they're fighting with sticks.")); }
  if (false) { const b = c.research; for (const [th, a, e] of [[8, 'الباحثين: "عرفنا شي.. الزومبي يهدأ من يشمّ چاي".', 'Researchers: "We learned something... zombies calm down at the smell of tea."'], [20, 'الباحثين جرّبوا لقاح رقم ٧ على زومبي.. كام يرقص. مو هذا المطلوب.', 'The researchers tried vaccine #7 on a zombie... it started dancing. Not the goal.'], [40, 'اللقاح التجريبي اشتغل على واحد! رجع يحچي.. وأول شي سأل عن راتبه.', 'The trial vaccine worked on one! He can talk again... first thing he asked about was his salary.']]) if (b < th && c.research >= th) { notes.push(tr(a, e)); if (th === 40) G.flags.vaccine = 1; } }
  c.lv = colLevel(); if (c.lv > lv0) notes.push(tr('المكان كبر! صرنا "' + CLV[c.lv][1][0] + '". ' + L(ZONES[CLV[c.lv][2]]) + ' صارت منطقة مؤمّنة.. بس الزومبيات برّه زادت.', 'We grew! We are now a "' + CLV[c.lv][1][1] + '". ' + L(ZONES[CLV[c.lv][2]]) + ' is secured... but the zombies outside multiplied.'));
}
function colonyPanel() {
  return openPanel(tr('المستعمرة', 'The Colony'), box => {
    const draw = () => { while (box.children.length > 1) box.lastChild.remove(); const c = G.col, j = c.jobs, lv = colLevel(), free = idleN(), nx = CLV[lv + 1];
      box.appendChild(el('p', tr('المستوى: ', 'Level: ') + L(CLV[lv][1]) + '   ·   ' + tr('الناجين: ', 'Survivors: ') + c.pop + (nx ? '   ·   ' + tr('التوسعة الجاية عند ', 'Next expansion at ') + nx[0] : '')));
      const sec = [0, 1, 2, 3].filter(secured).map(z => L(ZONES[z])); box.appendChild(el('p', tr('المناطق المؤمّنة: ', 'Secured areas: ') + (sec.length ? sec.join(tr('، ', ', ')) : tr('ولا وحدة بعد', 'none yet'))));
      box.appendChild(el('p', tr('الأكل بالمخزن: ', 'Food in storage: ') + FOODS.reduce((a, k) => a + (G.stash[k] || 0), 0) + tr('، والناس ياكلون كل يوم ', ', people eat per day ') + c.pop + '   ·   ' + tr('بحث اللقاح: ', 'Vaccine research: ') + Math.min(100, Math.round(c.research / 40 * 100)) + '%'));
      if (c.trainee) box.appendChild(el('p', tr('بالتدريب هسه: ', 'In training now: ') + c.trainee + tr(' — يستلمون شغل باجر الصبح', ' — they start work tomorrow morning')));
      { const pr = Object.keys(G.prod || {}).filter(k => G.prod[k] > 0); box.appendChild(el('p', tr('إنتاج اليوم لحد هسه: ', 'Produced today so far: ') + (pr.length ? pr.map(k => L(ITEMS[k].n) + ' ×' + G.prod[k]).join(tr('، ', ', ')) : tr('بعد ولا شي', 'nothing yet')))); }
      box.appendChild(el('h3', tr('توزيع الشغل', 'Jobs') + (free ? '  (' + tr('بلا شغل: ', 'idle: ') + free + ')' : '')));
      for (const k in JOBS) { const row = el('div', null, 'row'), nm = el('span', L(JOBS[k]) + ': ' + j[k] + '  '); nm.appendChild(el('small', tr(JOBS[k][2], JOBS[k][3]))); const bs = el('span'); bs.append(btn('−', () => { if (j[k] > 0) { j[k]--; draw(); } }), ' ', btn('+', () => { if (k === 'soldier' && !op('camp')) return toast(tr('حصّن المعسكر أول (روح لباب المعسكر).', 'Fortify the camp first (go to the camp door).')); if ((k === 'medic' || k === 'doc') && !op('hosp')) return toast(tr('حصّن المستشفى أول (روح لباب المستشفى).', 'Fortify the hospital first (go to the hospital door).')); if (WORK[k]) { const lv = G.fac[WORK[k].fac]; if (!lv) return toast(tr('صلّح ' + L(FAC[WORK[k].fac].n) + ' أول من "تطوير المقر".', 'Repair the ' + L(FAC[WORK[k].fac].n) + ' first from "Develop the base".')); if (j[k] >= lv * 2) return toast(tr('المعمل بمستواه هذا يشيل ' + lv * 2 + ' عمال بس. طوّره.', 'At this level the plant holds only ' + lv * 2 + ' workers. Upgrade it.')); } if (idleN() > 0) { j[k]++; draw(); } })); row.append(nm, bs); box.appendChild(row); }
      if (!c.pop) box.appendChild(el('p', tr('ماكو ناجين بعد. بث نداء من الراديو.', 'No survivors yet. Broadcast a call from the radio.'))); };
    draw();
  });
}
const FAC = {
  fuel: { n: ['مصفى بانزين صغير', 'Small fuel refinery'], out: ['جليكان بانزين', 'fuel can'], part: 1, need: () => G.flags.gen ? null : tr('يحتاج مولدة المول', 'needs the mall generator') },
  food: { n: ['مطبخ المول', 'Mall kitchen'], out: ['صمون', 'bread'], part: 0, need: () => G.flags.gen ? null : tr('يحتاج مولدة المول', 'needs the mall generator') },
  water: { n: ['فلتر ماي', 'Water filter'], out: ['ماي', 'water'], part: 0, need: () => G.flags.gen ? null : tr('يحتاج مولدة المول', 'needs the mall generator') },
  med: { n: ['معمل دوه بالصيدلية', 'Pharmacy medicine lab'], out: ['دوه', 'medicine'], part: 1, need: () => here('noor') || atPost('noor') ? null : tr('يحتاج نور وياك', 'needs Noor with you') },
  arms: { n: ['ورشة سلاح بالمشجب', 'Armory weapon shop'], out: ['رصاص', 'ammo'], part: 1, need: () => G.flags.lk_armory ? null : tr('يحتاج تفتح المشجب', 'needs the armory unlocked') }
};
const facCost = (k, lv) => { const c = { scrap: 5 + lv * 4 }; if (FAC[k].part) c.parts = lv + 1; return c; };
const LINKS = {
  hm: { a: 'tunHome', b: 'tunMall', n: ['ممر سري', 'Secret tunnel'], na: ['البيت', 'Home'], nb: ['المول', 'Mall'], cost: { scrap: 12 }, need: () => null },
  mp: { a: 'brMall', b: 'brPharm', n: ['مجسر', 'Skybridge'], na: ['المول', 'Mall'], nb: ['الصيدلية', 'Pharmacy'], cost: { scrap: 8 }, need: () => null },
  ma: { a: 'tunMall2', b: 'tunArm', n: ['ممر سري', 'Secret tunnel'], na: ['المول', 'Mall'], nb: ['المشجب', 'Armory'], cost: { scrap: 16, parts: 4 }, need: () => G.flags.lk_armory ? null : tr('يحتاج توصل للمشجب أول', 'reach the armory first') }
};
const CRAFT = [['pipe', { scrap: 2 }], ['wrench', { scrap: 4 }], ['cleaver', { scrap: 5 }], ['bat', { scrap: 5 }]];
async function baseMenu() {
  for (;;) {
    const o = [];
    for (const k in FAC) { const f = FAC[k], lv = G.fac[k], nd = f.need(); if (lv >= 3) continue; const c = facCost(k, lv); o.push({ t: L(f.n) + ' (' + lv + '/3)  —  ' + (nd || costStr(c)), c, nd, fn: () => { G.fac[k]++; const jk = Object.keys(WORK).find(w => WORK[w].fac === k); toast(tr((lv ? 'تطوّر ✓ ' : 'اشتغل ✓ ') + L(f.n) + ': العمال يطلّعون ' + L(f.out) + ' بإيدهم ويشيلوه للمخزن. يشيل ' + G.fac[k] * 2 + ' عمال — وزّعهم من المستعمرة (K).', (lv ? 'Upgraded ✓ ' : 'Running ✓ ') + L(f.n) + ': workers make ' + L(f.out) + ' by hand and carry it to storage. Holds ' + G.fac[k] * 2 + ' workers — assign them in the colony (K).'), 9000); if (!lv && (k === 'water' || k === 'fuel')) setTimeout(rebuildWorld, 50); if (jk && idleN() > 0 && !G.col.jobs[jk]) G.col.jobs[jk] = 1; } }); }
    for (const k in LINKS) { const l = LINKS[k]; if (G.links[k]) continue; const nd = l.need(); o.push({ t: L(l.n) + ': ' + L(l.na) + ' ↔ ' + L(l.nb) + '  —  ' + (nd || costStr(l.cost)), c: l.cost, nd, fn: () => { G.links[k] = 1; toast(tr('انبنى ' + L(l.n) + '! مدخله علامة مضوية عالأرض داخل المول يم الباب، والثانية بالطرف الآخر. أوكف عليها واضغط E.', L(l.n) + ' built! Its entrance is a glowing floor pad inside the mall by the door, and another at the far end. Stand on it and press E.'), 9000); } }); }
    if (!op('hosp')) o.push({ t: tr('المستشفى خلف المول: موجود بس مهجور — روح لبابه وحصّنه', 'The hospital behind the mall exists but is abandoned — go to its door and fortify it'), c: {}, nd: tr('روح لباب المستشفى (اتبع اسمه بالخريطة) واضغط E', 'Go to the hospital door (follow its name on the map) and press E') });
    if (!op('camp')) o.push({ t: tr('ساحة المعسكر: موجودة بس مفتوحة — روح لبابها وحصّنها', 'The camp yard exists but is open — go to its gate and fortify it'), c: {}, nd: tr('روح لباب المعسكر واضغط E', 'Go to the camp gate and press E') });
    if (G.fac.arms > 0) for (const [w, c] of CRAFT) o.push({ t: tr('اصنع ', 'Craft ') + L(WEAPONS[w].n) + '  —  ' + costStr(c), c, fn: () => { G.weps[w] = WEAPONS[w].dur; } });
    const labels = o.map(x => x.t); labels.push(tr('خلص', 'Done'));
    const i = await say('me', tr('شنو نبني بالمقر؟  (سكراب: ' + (G.inv.scrap || 0) + '، قطع غيار: ' + (G.inv.parts || 0) + ')', 'What do we build?  (scrap: ' + (G.inv.scrap || 0) + ', parts: ' + (G.inv.parts || 0) + ')'), labels); if (i >= o.length) return;
    if (o[i].nd) { toast(o[i].nd); continue; } if (!afford(o[i].c)) { toast(tr('ما عندك كفاية مواد.', 'Not enough materials.')); continue; }
    pay(o[i].c); o[i].fn(); sfx('fix'); save(true);
  }
}
function facDay(notes) {
  return;
  const f = G.fac, out = [];
  if (f.fuel) { add('fuel', f.fuel); out.push(tr('بانزين ×', 'fuel ×') + f.fuel); }
  if (f.food) { add('samoon', f.food * 2); out.push(tr('صمون ×', 'bread ×') + f.food * 2); }
  if (f.water) { add('water', f.water * 2); out.push(tr('ماي ×', 'water ×') + f.water * 2); }
  if (f.med) { add('bandage', f.med); if (f.med >= 2) add('medkit', f.med - 1); out.push(tr('دوه ×', 'meds ×') + (f.med * 2 - 1)); }
  if (f.arms) { add('ammo9', f.arms * 4); if (f.arms >= 2) add('ammo7', (f.arms - 1) * 8); out.push(tr('رصاص ×', 'ammo ×') + (f.arms * 4 + Math.max(0, f.arms - 1) * 8)); }
  if (out.length) notes.push(tr('المقر أنتج اليوم: ', 'The base produced today: ') + out.join(tr('، ', ', ')) + '.');
}
async function travel(to) {
  if (G.inVeh >= 0) return; R.busy++; $('#fade').classList.add('on'); sfx('door'); await wait(450);
  G.x = to.x; G.y = to.y + 14; const p = World.freeNear(G.x, G.y); G.x = p.x; G.y = p.y; R.cam.x = G.x; R.cam.y = G.y; G.time += .2;
  for (const n of R.npcs) if (n.follow) { const q = World.freeNear(G.x + rand(-14, 14), G.y + rand(-14, 14)); n.x = q.x; n.y = q.y; }
  await wait(250); $('#fade').classList.remove('on'); R.busy--;
}
function fixJobs() { const j = G.col.jobs; let over = -idleN(); for (const k of ['scav', 'farm', 'doc', 'medic', 'guard', 'soldier']) { if (over <= 0) break; const d = Math.min(j[k], over); j[k] -= d; over -= d; } }
function applyConv() { if (!G || !G.conv) return; for (const k in G.conv) { const b = World.buildings[G.conv[k]]; if (!b || !CONVT[k]) continue; b.type = CONVT[k][0]; b.st = CONVT[k][1]; b.roof = null; b.fort = (op(k) || (k === 'water' && G.fac.water) || (k === 'fuel' && G.fac.fuel)) ? 1 : 0; if (b.fort) for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) World.safe[World.I(x, y)] = 1; } }
function pickConv(k) { const tx = S.mall.x / 16 + CONVP[k][0], ty = S.mall.y / 16 + CONVP[k][1]; let best = -1, bd = 1e9; for (const b of World.buildings) { if (b.type !== 'house' || Object.values(G.conv).includes(b.i)) continue; const d = hyp(b.x + b.w / 2 - tx, b.y + b.h / 2 - ty); if (d < bd) { bd = d; best = b.i; } } return best; }
async function convert(k) { const i = pickConv(k); if (i < 0) return; G.conv[k] = i; R.busy++; $('#fade').classList.add('on'); await wait(400); World.gen(); for (const g in World.gates) if (G.flags[g]) World.setGate(g, true); for (const l in World.locks) if (G.flags['lk_' + l]) World.setLock(l, true); applyConv(); applyFloor(); View3D.build(); buildObjs(); syncNpcs(); $('#fade').classList.remove('on'); R.busy--; toast(k === 'hosp' ? tr('انبنى المستشفى خلف المول! صار يعالج الجرحى، وتكدر توصّله جثث الزومبي حتى يحاولون يرجعوهم ناس. ووزّع مسعفين من المستعمرة (K).', 'The hospital is built behind the mall! It treats the wounded, and you can bring zombie bodies so they try to bring them back. Assign medics in the colony (K).') : tr('انبنى المعسكر يم المول! هسه تكدر تحوّل الناجين لجنود من المستعمرة (K). الجنود يدافعون بالليل ويصرفون رصاص.', 'The camp is built next to the mall! Turn survivors into soldiers in the colony (K). Soldiers defend at night and use ammo.'), 9000); save(true); }
async function hospMenu() {
  const c = G.col, n = G.inv.zbody || 0, ch = Math.round(Math.min(.8, .12 + c.research * .01 + c.jobs.medic * .08 + (atPost('noor', 'hosp') ? .18 : here('noor') ? .1 : 0)) * 100), o = [];
  if (has('alibody')) { take('alibody'); G.flags.aliQ = 3; await say('noor', tr('هذا علي ابن أم علي؟ مدّدوه عالسرير.. الليلة ما أنام. باجر الصبح تعال.', 'This is Um Ali\'s son? Lay him on the bed... I will not sleep tonight. Come back in the morning.')); save(true); return; }
  if (n) o.push(tr('سلّم ' + n + ' جثث للمستشفى', 'Deliver ' + n + ' bodies'));
  o.push(tr('عالجوني', 'Treat me'), tr('ولا شي', 'Never mind'));
  const i = await say(tr('المستشفى', 'Hospital'), tr('جثث تنتظر العلاج: ' + c.bodies + '   ·   فرصة الإرجاع: ' + ch + '%   ·   مسعفين: ' + c.jobs.medic + '\nالجثث تتعالج بالليل، والنتيجة تنكتب بالدفتر الصبح.', 'Bodies waiting: ' + c.bodies + '   ·   Revival chance: ' + ch + '%   ·   Medics: ' + c.jobs.medic + '\nBodies are treated overnight; results go in the diary.'), o);
  if (n && i === 0) { take('zbody', n); c.bodies += n; sfx('fix'); return toast(tr('سلّمت ' + n + ' جثث. الليلة يحاولون وياهم.', 'Delivered ' + n + ' bodies. They will try tonight.')); }
  if (o[i] === tr('عالجوني', 'Treat me')) { if (!c.jobs.medic && !here('noor') && !atPost('noor')) return toast(tr('ماكو مسعف بالمستشفى. وزّع مسعف من المستعمرة.', 'No medic on duty. Assign one in the colony.')); G.hp = 100; sfx('fix'); toast(tr('تعالجت ✓', 'Treated ✓')); }
}
// ---------------- night raids
function buildFlow() {
  const W = World.W, I = World.I, f = R.flow = new Int16Array(W * World.H).fill(-1), sx = S.mallDoor.x >> 4, sy = (S.mallDoor.y + 14) >> 4, q = [sx + sy * W]; f[q[0]] = 0;
  for (let h = 0; h < q.length; h++) { const c = q[h], x = c % W, y = (c / W) | 0; if (f[c] > 46) continue; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, n = I(nx, ny); if (nx < 1 || ny < 1 || nx >= W - 1 || ny >= World.H - 1 || f[n] >= 0 || World.solid(nx, ny) || World.safe[n]) continue; f[n] = f[c] + 1; q.push(n); } }
}
function flowDir(z) {
  const W = World.W, tx = z.x >> 4, ty = z.y >> 4, f = R.flow, here = f ? f[tx + ty * W] : -1;
  if (here > 0) { let b = here, bx = tx, by = ty; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const v = f[tx + dx + (ty + dy) * W]; if (v >= 0 && v < b && (dx === 0 || dy === 0 || (f[tx + dx + ty * W] >= 0 && f[tx + (ty + dy) * W] >= 0))) { b = v; bx = tx + dx; by = ty + dy; } } return Math.atan2(by * 16 + 8 - z.y, bx * 16 + 8 - z.x); }
  return Math.atan2(S.mallDoor.y + 14 - z.y, S.mallDoor.x - z.x);
}
function raidPower() { return Math.min(45, Math.round(6 + G.day * 1.5 + G.col.pop * .6)); }
function startRaid(scale, day) {
  G.raidDay = G.day; const n = Math.round(raidPower() * (scale || 1)), d = S.mallDoor; let made = 0; buildFlow();
  for (let t = 0; t < n * 6 && made < n; t++) { const a = rand(0, 6.28), r = rand(240, 420), x = d.x + Math.cos(a) * r, y = d.y + 40 + Math.abs(Math.sin(a)) * r * .8; if (solidAt(x, y, 1) || World.bAt(x >> 4, y >> 4) || R.flow[(x >> 4) + (y >> 4) * World.W] < 0) continue; const z = mkZ(ztype(2), x, y); z.raid = 1; z.alert = 0; R.zombies.push(z); made++; }
  const c = G.col, defs = []; const nd = Math.min(12, c.jobs.guard + c.jobs.soldier);
  for (let i = 0; i < nd; i++) { const sol = i < c.jobs.soldier, k = i - (nd - 1) / 2; defs.push({ id: 'df' + i, kind: sol ? 'soldier' : 'guard', x: d.x + k * 18, y: d.y + 34 + (i % 2) * 12, cd: rand(0, 1), look: sol ? Object.assign({}, LOOK.sol, { id: 'dfs' }) : Object.assign({}, LOOK.sv3, { id: 'dfg' }), face: 0 }); }
  const ng = G.day >= 4 ? Math.min(3, Math.floor((G.day - 1) / 3) * (scale || 1)) : 0; for (let i = 0; i < ng; i++) { const a = rand(0, 6.28), z = spawnGiant(d.x + Math.cos(a) * 300, d.y + 60 + Math.abs(Math.sin(a)) * 220); if (z && !solidAt(z.x, z.y, 1) && R.flow[(z.x >> 4) + (z.y >> 4) * World.W] >= 0) { z.raid = 1; made++; } else if (z) R.zombies.splice(R.zombies.indexOf(z), 1); }
  R.defs = defs; R.raid = { n: made, killed: 0, dmg: 0, day: !!day }; sfx('horn'); R.shake = .4;
  toast(tr((day ? 'هجمة بالنهار! ' : 'هجمة الليل! ') + made + ' زومبي جايين للمول' + (ng ? ' (وبيهم ضخم)' : '') + '. ' + (nd ? nd + ' مدافعين واكفين عالباب.' : 'وماكو مدافعين.. دافع إنت!'), 'Night raid! ' + made + ' zombies heading for the mall. ' + (nd ? nd + ' defenders at the door.' : 'No defenders... defend it yourself!')), 8000);
}
function updRaid(dt) {
  const R2 = R.raid; if (!R2) return; const left = R.zombies.filter(z => z.raid);
  for (const df of R.defs) { df.cd -= dt; const rng = df.kind === 'soldier' ? 150 : 40; let t = null, bd = rng; for (const z of left) { const d = hyp(z.x - df.x, z.y - df.y); if (d < bd) { bd = d; t = z; } } if (!t) continue; const a = Math.atan2(t.y - df.y, t.x - df.x); df.face = Math.PI / 2 - a;
    if (df.cd <= 0) { if (df.kind === 'soldier') { df.cd = 1.1; R.fx.push({ k: 'line', x: df.x, y: df.y - 9, x2: t.x, y2: t.y - 9, t: .07 }); if (Math.random() < .5) sfx('shot'); hitZ(t, G.col.noAmmo ? 8 : 20, a, 50); } else { df.cd = .9; hitZ(t, 10, a, 90); } } }
  if (!left.length || G.time >= 28.5 || (R2.day && G.time % 24 >= 17.5)) endRaid();
}
function endRaid() {
  const R2 = R.raid; if (!R2) return; R.raid = null; R.defs = []; for (const z of R.zombies) z.raid = 0;
  const c = G.col; let msg = tr('انتهت هجمة الليل. طاح ' + R2.killed + ' زومبي.', 'The night raid is over. ' + R2.killed + ' zombies dropped.');
  if (R2.dmg > 12 && c.pop) { const h = Math.min(c.pop, Math.ceil(R2.dmg / 12)); c.hurt = (c.hurt || 0) + h; const lost = Math.min(G.stash.samoon || 0, h * 2); if (lost) G.stash.samoon -= lost; msg += tr(' بس وصلوا للباب: ' + h + ' جرحى' + (lost ? ' وراح ' + lost + ' صمون' : '') + '.', ' But they reached the door: ' + h + ' wounded' + (lost ? ', ' + lost + ' bread lost' : '') + '.'); }
  else msg += tr(' المول بأمان ✓', ' The mall is safe ✓');
  toast(msg, 8000);
}
function autoRaid(notes) {
  G.raidDay = G.day - 1; const c = G.col, s = raidPower(), def = c.jobs.guard * 3 + c.jobs.soldier * (c.noAmmo ? 3 : 6);
  if (def >= s) return notes.push(tr('هجمة بالليل وإحنا نايمين.. الحرّاس والجنود صدّوها ✓', 'A raid hit while we slept... the guards and soldiers held ✓'));
  const h = Math.min(c.pop, Math.ceil((s - def) / 8)); if (h) c.hurt = (c.hurt || 0) + h;
  notes.push(tr('هجمة بالليل وإحنا نايمين! ' + (h ? h + ' جرحى. ' : '') + 'نحتاج حرّاس وجنود أكثر.', 'A raid hit while we slept! ' + (h ? h + ' wounded. ' : '') + 'We need more guards and soldiers.'));
}
// ---------------- trapped survivors around the city
function strandDay(notes) {
  if (!G.flags.ajMet || G.strand.length >= 3) return; const zs = [0]; if (G.flags.g1) zs.push(1); if (G.flags.g2) zs.push(2); if (G.flags.g3) zs.push(3); if (G.flags.g4) zs.push(4);
  const n = 1 + (G.flags.radio && Math.random() < .5 ? 1 : 0);
  for (let i = 0; i < n && G.strand.length < 3; i++) { const zn = pick(zs), p = World.randOutdoor(zn); if (!p) continue; const k = [0, 1, 2, 3].find(x => !G.strand.some(s => s.k === x)); G.strand.push({ k, x: p.x, y: p.y }); notes.push(tr('سمعت صريخ من ' + L(ZONES[zn]) + '.. واحد محاصر بين الزومبي. (نقطة خضرة بالخريطة)', 'Heard screaming from ' + L(ZONES[zn]) + '... someone trapped among zombies. (green dot on the map)')); }
}
for (let i = 0; i < 4; i++) SC['st' + i] = async () => {
  const st = G.strand.find(s => s.k === i); if (!st) return;
  const a = await say('st' + i, pick(L([['الحمد لله! ظنيت محد راح يجي.. صارلي يومين محاصر.', 'إنت بشر؟ احلف. والله ظنيتك زومبي يمشي عدل.'], ['Thank God! I thought nobody would come... trapped for two days.', 'Are you human? Swear it. I thought you were a zombie that walks straight.']])), [tr('روح للمول.. اكو مكان إلك وشغل', 'Go to the mall... there is room and work for you'), tr('مو هسه', 'Not now')]);
  if (a !== 0) return; if (!G.flags.mall) return toast(tr('بعد ما عندي مقر آمن أوديه بيه. لازم أوصل للمول أول.', "I don't have a safe base yet. I need to reach the mall first."));
  if (G.col.pop >= colCap()) return toast(tr('المول مليان. افتح طابق ثاني من الدرج.', 'The mall is full. Open another floor from the stairs.'));
  G.col.pop++; G.col.trainee = (G.col.trainee || 0) + 1; G.strand.splice(G.strand.indexOf(st), 1); syncNpcs(); sfx('fix'); toast(tr('الناجي راح للمول! اليوم يتدرّب، وباجر يستلم شغل.', 'The survivor went to the mall! Trains today, starts work tomorrow.'), 6000);
};
const colCap = () => 8 + (G.flr >= 2 ? 8 : 0) + (G.flr >= 3 ? 4 : 0);
function applyFloor() {
  const M = S._mall, B = World.block, I = World.I;
  if (!M.base) { M.base = []; for (let y = M.y0; y <= M.y1; y++) for (let x = M.x0; x <= M.x1; x++) M.base.push(B[I(x, y)]); }
  let k = 0; for (let y = M.y0; y <= M.y1; y++) for (let x = M.x0; x <= M.x1; x++) { B[I(x, y)] = G.floor ? 0 : M.base[k]; k++; }
  if (G.floor) for (const o of M.floors[G.floor - 1]) B[I(o.tx, o.ty)] = 1;
  B[I(133, 43)] = 1; B[I(126, 52)] = B[I(127, 52)] = G.floor ? 1 : 0;
}
async function stairsMenu() {
  const o = [], go = f => async () => { R.busy++; $('#fade').classList.add('on'); sfx('door'); await wait(350); G.floor = f; applyFloor(); const p = World.freeNear(S.stairs.x - 16, S.stairs.y + 16); G.x = p.x; G.y = p.y; for (const n of R.npcs) if (n.follow) { n.x = G.x; n.y = G.y; } await wait(200); $('#fade').classList.remove('on'); R.busy--; };
  const names = [['الطابق الأرضي (المقر)', 'Ground floor (base)'], ['الطابق الثاني (السكن)', 'Second floor (dorms)'], ['الطابق الثالث (المخزن والعيادة)', 'Third floor (storage & clinic)']], cost = [null, { scrap: 10 }, { scrap: 14, parts: 2 }];
  for (let f = 0; f < 3; f++) { if (f === G.floor) continue; if (f < G.flr) o.push({ t: L(names[f]), fn: go(f) }); else if (f === G.flr) o.push({ t: tr('افتح ', 'Open ') + L(names[f]) + '  —  ' + costStr(cost[f]), c: cost[f], open: f }); }
  const labels = o.map(x => x.t); labels.push(tr('ولا شي', 'Never mind'));
  const i = await say('me', tr('الدرج. وين أروح؟', 'The stairs. Where to?'), labels); if (i >= o.length) return;
  if (o[i].fn) return o[i].fn();
  if (!afford(o[i].c)) return toast(tr('الدرج مسدود بأثاث وسكراب.. يرادلي مواد حتى أفتحه وأأمّنه.', 'The stairs are blocked with furniture and junk... I need materials to clear and secure them.'));
  pay(o[i].c); G.flr = o[i].open + 1; sfx('fix'); save(true);
  toast(o[i].open === 1 ? tr('انفتح الطابق الثاني! ١٠ جرابي، والمول صار يشيل ' + colCap() + ' ناجي.', 'Second floor open! 10 beds, and the mall now holds ' + colCap() + ' survivors.') : tr('انفتح الطابق الثالث! مخزن للأغراض وعيادة، والمول صار يشيل ' + colCap() + '.', 'Third floor open! Storage and a clinic, and the mall now holds ' + colCap() + '.'), 7000);
}
async function clinic() {
  if (!here('noor')) return toast(tr('العيادة بلا دكتورة. نور لازم تكون ويانه.', 'A clinic with no doctor. Noor has to be with us.'));
  if (G.clinicDay === G.day) return say('noor', tr('عالجتك اليوم. باجر تعال.', 'I treated you today. Come back tomorrow.'));
  G.clinicDay = G.day; G.hp = 100; sfx('fix'); return say('noor', tr('تمدّد.. خلّيني أشوف. هسه عندي عيادة صدك، مو بس شنطة. خلص، صرت جديد.', 'Lie down... let me look. Now I have a real clinic, not just a bag. Done, good as new.'));
}
function stashPanel() {
  return openPanel(tr('مخزن المول', 'Mall storage'), box => {
    const mv = (from, to, id, n) => { from[id] -= n; if (from[id] <= 0) delete from[id]; to[id] = (to[id] || 0) + n; };
    const draw = () => { while (box.children.length > 1) box.lastChild.remove();
      box.appendChild(el('p', tr('الأكل الي بالمخزن ياكلون منه الناجين قبل ما ياخذون من حقيبتك.', 'Survivors eat from stored food before taking from your bag.')));
      const c = el('div', null, 'col'); c.appendChild(btn(tr('خزّن كل الأكل والماي والمواد', 'Store all food, water and materials'), () => { for (const id of Object.keys(G.inv)) if (!ITEMS[id].q && !/^ammo/.test(id)) mv(G.inv, G.stash, id, G.inv[id]); draw(); }, 'gold')); box.appendChild(c);
      for (const [title, src, dst, lab] of [[tr('بحقيبتك', 'In your bag'), G.inv, G.stash, tr('خزّن', 'Store')], [tr('بالمخزن', 'In storage'), G.stash, G.inv, tr('اخذ', 'Take')]]) { box.appendChild(el('h3', title)); const ids = Object.keys(src).filter(id => !ITEMS[id].q); if (!ids.length) box.appendChild(el('p', tr('فارغ.', 'Empty.')));
        for (const id of ids) { const row = el('div', null, 'row'), bs = el('span'); bs.append(btn(lab + ' 1', () => { mv(src, dst, id, 1); draw(); }), ' ', btn(lab + tr(' الكل', ' all'), () => { mv(src, dst, id, src[id]); draw(); })); { const sp = el('span'); sp.append(icon(id, 26), L(ITEMS[id].n) + ' ×' + src[id]); row.append(sp, bs); } box.appendChild(row); } } };
    draw();
  });
}
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
  const ri = await say('me', tr('الراديو شغّال. شسوي؟', 'The radio is live. What now?'), [tr('أبث نداء للناجين', 'Broadcast a call for survivors'), tr('شؤون المستعمرة (' + G.col.pop + ' ناجي)', 'Colony affairs (' + G.col.pop + ' survivors)'), tr('أسمع بس', 'Just listen')]);
  if (ri === 0) return broadcast(); if (ri === 1) return colonyPanel();
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
  f.ended = kind; await notebook(L(END[kind](G)), { title: tr('نهاية الدفتر الأول', 'End of Notebook One') });
  f.ch2 = 1; await notebook(L(CH2), { title: tr('الدفتر الثاني', 'Notebook Two') }); spawnGiant(S.g4.x - 60, S.g4.y + 10, { big: 1 });
  save(true); await aboutPanel(true);
  toast(tr('القصة ما خلصت.. الدفتر الثاني بدا. شوف المهمة فوك.', 'The story is not over... notebook two has begun. See the objective at the top.'), 7000);
}

// ---------------------------------------------------------------- day cycle
async function sleepAct(spot, rough) {
  const h = G.time % 24; if (h >= 6 && h < 18 && G.en > 35) return toast(tr('بعد وكت.. ما نعسان. (تنام بعد المغرب أو إذا تعبان)', 'Not sleepy yet. (Sleep after sunset or when exhausted)'));
  const i = await say('me', tr('أنام لباجر الصبح؟', 'Sleep until morning?'), [tr('إي، نام', 'Yes, sleep'), tr('لا بعدين', 'Not yet')]);
  if (i === 0) { G.safe = { x: spot.x, y: spot.y }; G.rough = rough ? 1 : 0; nextDay(true); }
}
async function nextDay(slept) {
  if (R.nexting) return; if (R.raid) endRaid(); R.nexting = 1; R.busy++; $('#fade').classList.add('on'); await wait(650);
  const notes = [], dk = G.dayKills; G.dayKills = 0; G.day++; G.time = 6;
  const rough = slept && G.rough; G.rough = 0;
  if (rough) { G.en = 80; G.hp = Math.min(100, G.hp + 8); notes.push(tr('نمت ببيت غريب. نص نومة.. كل شوية أكعد على صوت.', "Slept in a stranger's house. Half a sleep... kept waking at every noise.")); }
  else if (slept) { G.en = 100; G.hp = Math.min(100, G.hp + (G.shel.bar ? 45 : 25)); } else G.en = Math.max(G.en, 35);
  G.food = Math.max(0, G.food - 8); G.water = Math.max(0, G.water - 10);
  if (G.shel.tank) { add('water'); notes.push(tr('خزان السطح نطاني قنينة ماي.', 'The roof tank gave me a bottle of water.')); }
  if (G.shel.garden) { add('dates', 2); notes.push(tr('الحديقة طلّعت تمر. الأرض بعدها تحبّنه.', 'The garden gave dates. The land still loves us.')); }
  if (G.flags.umali && !umaliMall()) { add('samoon'); notes.push(tr('أم علي خبزتلنا خبز حار.', 'Um Ali baked us hot bread.')); }
  lifeDay(notes);
  if (has('kettle') && here('aj')) { add('tea'); notes.push(tr('أبو جاسم خدّر چاي. يكول "بلا چاي ماكو قيادة".', 'Abu Jasim brewed tea. He says "no tea, no driving".')); }
  colonyDay(notes); facDay(notes);
  for (const id of COMPS) {
    const c = comp(id); if (!here(id)) continue; const nm = L(NPC[id].n);
    if (id === 'saif' && G.day - c.joinDay >= 2) { c.st = 'left'; notes.push(tr('سيف عافنه. كال "رايح أسوي بث مباشر ويه الزومبي". الله وياه.', 'Saif left. Said he is "going live with the zombies". Godspeed.')); if (has('can')) { take('can'); notes.push(tr('..وأخذ علبة معلبات وياه. الوغد.', '...and took a can of food with him. The rascal.')); } else { add('ammo9', 5); notes.push(tr('بس عاف النه رصاص هدية.', 'But he left us some ammo as a gift.')); } continue; }
    const fid = (id === 'cat' && has('can')) ? 'can' : FOODS.find(x => has(x));
    if (fid) { take(fid); c.trust = Math.min(100, c.trust + 4); } else { c.trust -= 14; notes.push(tr(nm + ' بقى بلا أكل.. وجهه ما يطمّن.', nm + ' went hungry... not a happy face.')); }
    if (c.trust <= 0) { c.st = 'left'; notes.push(L(LEAVE[id])); if (id === 'aj') { G.veh[2].gone = 1; if (G.inVeh === 2) G.inVeh = -1; } }
  }
  for (const k in G.looted) if (!World.containers[k].fixed && Math.random() < .18) delete G.looted[k];
  if (G.flags.mall && G.raidDay !== G.day - 1) autoRaid(notes);
  strandDay(notes);
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
  if (!G.floor) for (const c of World.containers) if (Math.abs(c.x - px) < 34 && Math.abs(c.y - py) < 34) chk(c.x, c.y, c.kind === 'trunk' ? 30 : 25, G.looted[c.id] && c.kind === 'trunk' ? tr('فكّك السيارة للسكراب', 'Strip the car for scrap') : tr('فتّش', 'Search'), () => openCont(c));
  for (const p of World.pickups) if (!G.taken[p.id] && !G.floor) chk(p.x, p.y, 20, tr('اخذ', 'Pick up'), () => takePickup(p));
  G.veh.forEach((v, i) => { if (!v.gone) chk(v.x, v.y, 26, tr('اركب ', 'Get on ') + L(VEH[v.t].n), () => enterVeh(i)); });
  if (!G.floor) for (const b of R.bodies) chk(b.x, b.y, 22, tr('شيل الجثة للمستشفى', 'Carry the body to the hospital'), () => { if ((G.inv.zbody || 0) >= 3) return toast(tr('ما أكدر أشيل أكثر من ٣ جثث.. ظهري.', "Can't carry more than 3 bodies... my back.")); add('zbody'); R.bodies.splice(R.bodies.indexOf(b), 1); sfx('pick'); tip('body', 'وصّل الجثث لباب المستشفى. المسعفين والباحثين يحاولون يرجعوهم ناس.', 'Bring the bodies to the hospital door. Medics and researchers will try to bring them back.'); });
  for (const n of R.npcs) if (!n.hidden && !G.floor) chk(n.x, n.y - 4, n.follow ? 15 : 24, tr('احچي ويه ', 'Talk to ') + (n.worker ? L(JOBT[n.job || 'idle']) : L(NPC[n.id].n)), () => SC[n.id](), n.follow ? 30 : 0);
  for (const o of R.objs) if ((o.fl === 'all' || (o.fl || 0) === G.floor) && (!o.hide || !o.hide())) chk(o.x, o.y, o.r || 24, L(o.label), o.act);
  R.near = best;
}
function interact() { if (R.busy > 0) return; if (G.inVeh >= 0) return exitVeh(); if (R.near) R.near.act(); }
function nearestLoot() { let b = null, bd = 1e9; for (const c of World.containers) { if (G.floor || G.looted[c.id] || !c.b || c.x > 56 * 16) continue; const d = hyp(c.x - G.x, c.y - G.y); if (d < bd) { bd = d; b = c; } } return b; }
function objective() {
  const f = G.flags;
  if (R.raid) return [tr((R.raid.day ? 'هجمة بالنهار' : 'هجمة الليل') + '! دافع عن المول — باقي ' + R.zombies.filter(z => z.raid).length + ' زومبي', 'Night raid! Defend the mall — ' + R.zombies.filter(z => z.raid).length + ' zombies left'), S.mallDoor];
  if (f.ended) return ch2Obj();
  if (!f.pipe) return [tr('اطلع من البيت ودوّر شي تدافع بيه عن نفسك', 'Leave the house and find something to defend yourself with'), S.pipe];
  if (!f.hassan) return [tr('أبو حسن واكف يم الباب.. تصرّف ويّاه', 'Abu Hassan is by the door... deal with him'), R.zombies.find(z => z.type === 'hassan') || S.hassan];
  if (G.lootN < 3 && !f.ajMet) return [tr('ادخل البيوت وفتّش الثلاجات والكناتير (النقاط الصفرة) (' + G.lootN + '/3)', 'Enter houses and search fridges and cupboards (yellow dots) (' + G.lootN + '/3)'), R.needT || nearestLoot()];
  if (!f.ajMet) return [tr('امشِ عالشارع العام باتجاه السوق (شرق)', 'Follow the main road east toward the market'), S.aj];
  if (!f.g1) return has('fuel') ? [tr('رجّع البانزين لأبو جاسم', 'Bring the fuel to Abu Jasim'), S.aj] : [tr('لكي جليكان بانزين بسيارة متروكة', 'Find a fuel can in an abandoned car'), (R.fuelC && G.looted[R.fuelC.id]) ? null : S.fuelWreck];
  if (!f.g2) return has('key_gate') ? [tr('افتح سيطرة الكرادة بالمفتاح', 'Open the Karrada checkpoint with the key'), S.g2] : [tr('امشِ شرق لآخر السوق.. المفتاح بكابينة السيطرة يم الصبّات (اتبع السهم الذهبي)', 'Go east to the end of the market... the key is in the checkpoint booth by the barrier (follow the gold arrow)'), S.booth];
  if (!f.mall) return [tr('ادخل مول الكرادة: البناية الزرقة الكبيرة يسار الشارع بعد السيطرة', 'Enter the Karrada mall: the big blue building left of the road past the checkpoint'), S.mallDoor];
  if (!f.noorMet) return [tr('احچي ويه نور بالمول', 'Talk to Noor in the mall'), S.noor];
  if (!f.murHealed) return has('medicine') ? [tr('رجّع الدوه لنور', 'Bring the medicine to Noor'), S.noor] : [tr('جيب الدوه من الصيدلية كبال المول', 'Get the medicine from the pharmacy across the street'), S.pharm];
  if (!f.gen) return [tr('جمّع ٣ قطع غيار لمرتضى (' + (G.inv.parts || 0) + '/3)', 'Collect 3 spare parts for Murtadha (' + (G.inv.parts || 0) + '/3)'), has('parts', 3) || !f.murAsk ? S.mur : null];
  if (!f.radio) return [tr('جرّب الراديو بالمول', 'Try the radio in the mall'), S.radio];
  if (!f.col1 && G.col.pop === 0 && G.col.bDay === 0) return [tr('ارجع للراديو وبث نداء للناجين', 'Go back to the radio and broadcast a call for survivors'), S.radio];
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
  const zt = clamp(G.zoom - (G.inVeh >= 0 && G.veh[G.inVeh].t !== 'bike' ? 1 : 0), 2, 8); R.cam.z += (zt - R.cam.z) * Math.min(1, dt * 9); if (Math.abs(zt - R.cam.z) < .02) R.cam.z = zt;
  R.cam.x += (G.x - R.cam.x) * Math.min(1, dt * 7); R.cam.y += (G.y - R.cam.y) * Math.min(1, dt * 7);
  if (R.busy > 0) return;
  if (R.atk > 0) R.atk -= dt; if (R.swing > 0) R.swing -= dt; if (R.inv > 0) R.inv -= dt; if (R.mouse.t > 0) R.mouse.t -= dt;
  const pb = World.bAt(G.x >> 4, G.y >> 4); R.pb = G.inVeh >= 0 ? 0 : pb; R.pInside = !!R.pb; R.pSafe = World.safe[World.I(G.x >> 4, G.y >> 4)] === 1 && G.inVeh < 0;
  updPlayer(dt); updZombies(dt); updComps(dt); updWorkers(dt); lifeTick(dt);
  if (G.inVeh < 0) findNear(); else R.near = null;
  // needs & time
  G.time += dt / 20; const hr = dt / 20;
  G.food = Math.max(0, G.food - hr * 2.2); G.water = Math.max(0, G.water - hr * 3); G.en = Math.max(0, G.en - hr * 3.6);
  if (G.food <= 0 || G.water <= 0) { G.hp -= dt * .55; if (G.hp <= 0) die(); } else if (G.food > 55 && G.water > 55 && G.hp < 100) G.hp = Math.min(100, G.hp + dt * .35);
  if (G.food < 20) tip('hungry' + G.day, 'جوعان! اضغط F تاكل وتشرب بسرعة.', 'Hungry! Press F to eat and drink quickly.');
  if (G.flags.mall && G.time >= 21 && G.time < 28.5 && G.raidDay !== G.day && !R.raid) startRaid();
  updRaid(dt); for (const b of R.bodies) b.t -= dt; if (R.bodies.length && R.bodies[0].t <= 0) R.bodies = R.bodies.filter(b => b.t > 0);
  if ((R.t % 5) < dt) for (const n of R.npcs) if (n.id[0] === 's' && n.id[1] === 't' && hyp(n.x - G.x, n.y - G.y) < 380) bubble(n, tr('ساعدووني!', 'Help me!'), 2);
  if (G.time >= 30) { endRaid(); nextDay(false); }
  const h = G.time % 24; if (h >= 18.5 && h < 19 && G.time < 24) tip('night' + G.day, 'الدنيا صارت ليل.. الزومبي أخطر. نام بالبيت أو بالمول، أو بأي بيت بيه جرباية.', 'Night is falling... zombies get worse. Sleep at home, at the mall, or in any house with a bed.');
  // safe-zone autosave + story triggers
  if (G.flags.mall && !op('hosp') && G.col.pop >= 2) tip('hospHint2', 'المستشفى خلف المول موجود بس مهجور. نظّفه من الزومبي وروح لبابه وحصّنه.', 'The hospital behind the mall is there but abandoned. Clear the zombies, go to its door and fortify it.');
  if (R.pSafe && !R.wasSafe) { const mall = pb && World.buildings[pb - 1].type === 'mall'; G.safe = mall ? { x: S.mallBed.x, y: S.mallBed.y + 26 } : { x: S.start.x, y: S.start.y }; if (mall && !G.flags.mall) { G.flags.mall = 1; toast(tr('مول الكرادة: مكان آمن. الزومبي ما يدخلون هنا.', 'Karrada mall: a safe place. Zombies do not come in here.'), 6000); } if (R.t - R.lastAuto > 25) save(true); }
  if (R.pSafe && G.flags.gen && pb && World.buildings[pb - 1].type === 'mall') tip('board', 'ميز "تطوير المقر" بالمول: تبني منه مصفى بانزين ومطبخ وفلتر ماي وممرات.', 'The "Develop the base" desk in the mall: build a refinery, kitchen, water filter and passages.');
  R.wasSafe = R.pSafe;
  if ((R.hudT -= dt) <= 0) { R.hudT = .12; hud(); }
}
function hud() {
  if (R.mode !== 'play') return;
  const set = (id, v) => { const e = $('#b-' + id); e.querySelector('.fl').style.width = clamp(v, 0, 100) + '%'; e.classList.toggle('low', v < 22); };
  set('hp', G.hp); set('food', G.food); set('water', G.water); set('en', G.en);
  const h = G.time % 24, hh = Math.floor(h), mm = Math.floor((h - hh) * 6) * 10, c = $('#clock');
  c.children[0].textContent = dayTitle(); c.children[1].textContent = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); c.children[2].textContent = G.floor ? tr('المول — الطابق ' + (G.floor + 1), 'Mall — floor ' + (G.floor + 1)) : L(ZONES[World.zoneOf(G.x >> 4)]);
  const ob = objective(), o = $('#obj'); o.children[0].textContent = tr('المهمة', 'OBJECTIVE'); o.children[1].textContent = ob[0]; R.objT = ob[1];
  const w = $('#wep');
  if (G.inVeh >= 0) { const v = G.veh[G.inVeh], d = VEH[v.t]; w.children[0].textContent = L(d.n); w.children[1].textContent = (d.tank ? tr('بانزين ', 'Fuel ') + Math.round(v.fuel) + '/' + maxFuel(v) + '  ·  ' : '') + tr('الحالة ', 'Body ') + Math.max(0, Math.round(v.hp / maxHp(v) * 100)) + '%'; }
  else { const d = WEAPONS[G.cur]; w.children[0].textContent = L(d.n); w.children[1].textContent = d.gun ? tr('رصاص: ', 'Ammo: ') + (G.inv[d.ammo] || 0) : d.dur ? tr('المتانة: ', 'Durability: ') + G.weps[G.cur] + '/' + d.dur : tr('[Q] بدّل السلاح', '[Q] switch weapon'); }
  const cb = $('#comps'), list = COMPS.filter(here); cb.hidden = !list.length;
  if (list.length) { cb.innerHTML = ''; for (const id of list) { const d = el('div'), t = comp(id).trust; d.append(el('span', L(NPC[id].n) + (comp(id).st === 'home' ? tr(' (بالملجأ)', ' (home)') : '')), el('em', Math.round(t) + '%', t < 25 ? 'bad' : '')); cb.appendChild(d); } }
  // minimap
  const mc = $('#mini'), mx = mc.getContext('2d'); mx.imageSmoothingEnabled = false; mx.drawImage(R.mini, 0, 0, mc.width, mc.height); const ms = mc.width / World.W / 16, dot = (o, c, r) => { mx.fillStyle = '#000'; mx.fillRect(o.x * ms - r - 1, o.y * ms - r - 1, r * 2 + 2, r * 2 + 2); mx.fillStyle = c; mx.fillRect(o.x * ms - r, o.y * ms - r, r * 2, r * 2); };
  for (const k in World.gates) if (!World.gates[k].open) { mx.fillStyle = '#e3b62f'; mx.fillRect(World.gates[k].x * 16 * ms - 1, 52 * 16 * ms, 3, 8 * 16 * ms); }
  for (const st of G.strand) dot(st, '#7fe07f', 3);
  G.veh.forEach(v => !v.gone && dot(v, '#6cc4ff', 2)); if (R.objT && Math.sin(R.t * 6) > -.4) dot(R.objT, '#ffe27a', 4); dot(G, '#fff', 3); dot(G, '#d24a3a', 1.5);
  // nearest food / water when running low and the bag has none
  R.needT = null; const lowW = G.water < 38 && !has('water') && !has('tea'), lowF = G.food < 38 && !FOODS.some(x => has(x)) && !has('dolma');
  if (lowW || lowF) { const lim = (G.flags.g4 ? 999 : G.flags.g3 ? 177 : G.flags.g2 ? 150 : G.flags.g1 ? 104 : 56) * 16; let bd = 1e9; for (const c of World.containers) { if (G.looted[c.id] || c.x > lim || (c.kind !== 'fridge' && c.kind !== 'shelf')) continue; const d = hyp(c.x - G.x, c.y - G.y); if (d < bd) { bd = d; R.needT = c; } } if (R.needT) R.needT = { x: R.needT.x, y: R.needT.y, label: lowW ? tr('أقرب ماي وأكل', 'Nearest water & food') : tr('أقرب أكل', 'Nearest food') }; }
  else if ((G.water < 38 || G.food < 38)) tip('eatF' + G.day, 'عندك أكل أو ماي بالحقيبة.. اضغط F.', 'You have food or water in your bag... press F.');
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
    for (const n of R.npcs) if (!G.floor && !n.follow && !n.hidden && see(n) && Math.sin(R.t * 4) > -.3) { const p = View3D.project(n.x, n.y, 1.55); ctx.fillStyle = '#000'; ctx.fillRect(p.x - 4, p.y - 16, 8, 18); ctx.fillStyle = '#e8cf7a'; ctx.fillRect(p.x - 2, p.y - 14, 4, 9); ctx.fillRect(p.x - 2, p.y - 3, 4, 3); }
    // zombie health bars
    for (const z of R.act) if (z.hp < z.s.hp && see(z)) { const boss = z.type === 'boss' || z.type === 'giant', p = View3D.project(z.x, z.y, boss ? 2.9 : 1.4), bw = boss ? 90 : 34; ctx.fillStyle = '#000'; ctx.fillRect(p.x - bw / 2 - 1, p.y - 4, bw + 2, 6); ctx.fillStyle = '#c33'; ctx.fillRect(p.x - bw / 2, p.y - 3, Math.max(0, bw * z.hp / z.s.hp), 4); }
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
    const p = View3D.project(e.x, e.y, e.type === 'boss' || e.type === 'giant' ? 3.1 : 1.55), bx = Math.round(p.x), by = Math.round(p.y) - 18, tw = ctx.measureText(b.text).width + 14;
    if (bx < -100 || bx > w + 100 || by < -20 || by > h + 20) continue;
    ctx.globalAlpha = Math.min(1, b.t * 3); ctx.fillStyle = '#000'; ctx.fillRect(bx - tw / 2 - 2, by - 13, tw + 4, 26); ctx.fillStyle = e.s ? '#dfeccf' : '#fff'; ctx.fillRect(bx - tw / 2, by - 11, tw, 22); ctx.fillStyle = '#000'; ctx.fillRect(bx - 3, by + 11, 6, 3);
    ctx.fillStyle = e.s ? '#24401a' : '#16161c'; ctx.fillText(b.text, bx, by + 1); ctx.globalAlpha = 1;
  }
  if (play) {
    // names over the important buildings
    ctx.font = '700 18px Handjet, Tahoma, sans-serif'; ctx.direction = LANG === 'ar' ? 'rtl' : 'ltr';
    for (const l of R.labels) { if (l.b === pb || Math.abs(l.x - G.x) > 520 || Math.abs(l.y - G.y) > 520) continue; const p = View3D.project(l.x, l.y, l.h), t = L(l.t), tw = ctx.measureText(t).width + 16; ctx.fillStyle = 'rgba(8,8,12,.82)'; ctx.fillRect(p.x - tw / 2, p.y - 13, tw, 26); ctx.fillStyle = l.c; ctx.fillRect(p.x - tw / 2, p.y + 11, tw, 2); ctx.fillText(t, p.x, p.y + 1); }
    for (const k in LINKS) if (G.links[k] && !G.floor) for (const sp of [[LINKS[k].a, LINKS[k].nb], [LINKS[k].b, LINKS[k].na]]) { const e = S[sp[0]], eb = World.bAt(e.x >> 4, e.y >> 4); if ((eb && eb !== pb) || Math.abs(e.x - G.x) > 360 || Math.abs(e.y - G.y) > 360) continue; const p = View3D.project(e.x, e.y, 1.1), t = L(LINKS[k].n) + (LANG === 'ar' ? ' ← ' : ' → ') + L(sp[1]), tw = ctx.measureText(t).width + 14; ctx.fillStyle = 'rgba(8,8,12,.85)'; ctx.fillRect(p.x - tw / 2, p.y - 12, tw, 24); ctx.fillStyle = '#9fe0ff'; ctx.fillText(t, p.x, p.y + 1); }
    if (R.busy === 0) { if (R.objT) guideArrow(R.objT, '#e8cf7a', tr('المهمة', 'Objective'), 96); if (R.needT) guideArrow(R.needT, '#6cc4ff', R.needT.label, 62); let ns = null, nd = 1e9; for (const st of G.strand) { const d = hyp(st.x - G.x, st.y - G.y); if (d < nd) { nd = d; ns = st; } } if (ns && !R.raid) guideArrow(ns, '#7fe07f', tr('ناجي محاصر', 'Trapped survivor'), 130); if (R.side && !R.raid) guideArrow(R.side, '#ff9ad0', R.side.label, 112); }
  }
}
function guideArrow(tg, col, label, rad) {
  const w = cv.width, h = cv.height, p = View3D.project(tg.x, tg.y, 1), me = View3D.project(G.x, G.y, .6), dx = p.x - me.x, dy = p.y - me.y, d = hyp(dx, dy); if (d < rad + 60) return;
  const a = Math.atan2(dy, dx), ex = clamp(me.x + Math.cos(a) * rad, 40, w - 40), ey = clamp(me.y + Math.sin(a) * rad, 40, h - 40), m = Math.round(hyp(tg.x - G.x, tg.y - G.y) / 16) + 'm';
  ctx.save(); ctx.translate(ex, ey); ctx.rotate(a); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(-12, -16); ctx.lineTo(-5, 0); ctx.lineTo(-12, 16); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-8, -11); ctx.lineTo(-2, 0); ctx.lineTo(-8, 11); ctx.fill(); ctx.restore();
  ctx.font = '700 17px Handjet, Tahoma, sans-serif'; ctx.direction = LANG === 'ar' ? 'rtl' : 'ltr'; const t = label + ' ' + m, tx = ex - Math.cos(a) * 34, ty = ey - Math.sin(a) * 34 + 22; ctx.fillStyle = '#000'; ctx.fillText(t, tx + 1, ty + 1); ctx.fillStyle = col; ctx.fillText(t, tx, ty);
}

// ---------------------------------------------------------------- panels & menus
function invPanel() {
  openPanel(tr('الحقيبة', 'Bag'), box => {
    const draw = () => {
      while (box.children.length > 1) box.lastChild.remove();
      box.appendChild(el('h3', tr('الأسلحة', 'Weapons')));
      for (const w of WORDER) { if (w !== 'fist' && G.weps[w] == null) continue; const d = WEAPONS[w], row = el('div', null, 'row'), nm = el('span', L(d.n) + '  '); nm.appendChild(el('small', d.gun ? tr('رصاص ', 'ammo ') + (G.inv[d.ammo] || 0) : d.dur ? G.weps[w] + '/' + d.dur : '')); row.append(nm, G.cur === w ? el('small', tr('✔ مجهّز', '✔ equipped')) : btn(tr('جهّز', 'Equip'), () => { G.cur = w; draw(); })); box.appendChild(row); }
      box.appendChild(el('h3', tr('الأغراض', 'Items'))); const ids = Object.keys(G.inv); if (!ids.length) box.appendChild(el('p', tr('الحقيبة فارغة.. مثل الثلاجة.', 'The bag is empty... like the fridge.')));
      for (const id of ids) { const it = ITEMS[id], row = el('div', null, 'row'), nm = el('span'); nm.append(icon(id), L(it.n) + ' ×' + G.inv[id].toLocaleString('en') + '  '); const eff = [it.food && tr('أكل +', 'food +') + it.food, it.water && tr('ماي +', 'water +') + it.water, it.hp && tr('صحة +', 'health +') + it.hp, it.en && tr('طاقة +', 'energy +') + it.en, it.fuel && tr('بانزين +', 'fuel +') + it.fuel, it.d && L(it.d)].filter(Boolean).join(' · '); nm.appendChild(el('small', eff)); row.appendChild(nm); if (it.gear || it.wep) row.appendChild(btn(it.gear ? tr('البس', 'Wear') : tr('جهّز', 'Equip'), () => { useItem(id); draw(); })); else if (it.food || it.water || it.hp || it.en || it.fuel) row.appendChild(btn(tr('استعمل', 'Use'), () => { useItem(id); hud(); draw(); })); box.appendChild(row); }
      box.appendChild(el('h3', tr('الإحصائيات', 'Stats')));
      { const g = G.gear || {}; box.appendChild(el('p', tr('فلوسك: ', 'Money: ') + (G.inv.dinar || 0).toLocaleString('en') + tr(' دينار', ' dinars') + '   ·   ' + tr('لابس: ', 'Wearing: ') + ([g.helmet && L(ITEMS.helmet.n), g.vest && L(ITEMS.vest.n)].filter(Boolean).join(tr('، ', ', ')) || tr('ملابس عادية', 'regular clothes')))); }
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
    const rows = [['W A S D  /  ↑ ← ↓ →', tr('الحركة والسياقة (نفس الأزرار)', 'Move and drive (same keys)')], ['Shift', tr('ركض', 'Run')], [tr('الماوس', 'Mouse'), tr('تصويب — الزر الأيسر ضرب/إطلاق', 'Aim — left button attacks / fires')], [tr('الزر الأيمن (ضغط مستمر)', 'Right button (hold)'), tr('امشي/سوق باتجاه المؤشر', 'Walk / drive toward the cursor')], ['Space', tr('ضرب (بالكيبورد)', 'Attack (keyboard)')], [tr('عجلة الماوس', 'Mouse wheel'), tr('تقريب وتبعيد الكاميرا', 'Camera zoom in / out')], ['C', tr('رجّع الكاميرا للوضع الطبيعي', 'Reset the camera')], ['V', tr('الكاميرا: تدور ويه اتجاهك / ثابتة', 'Camera: follow your direction / fixed')], ['E', tr('تفاعل / اركب / انزل / احچي', 'Interact / get on / get off / talk')], ['Q', tr('بدّل السلاح', 'Switch weapon')], ['F', tr('أكل وشرب سريع', 'Quick eat / drink')], ['X', tr('علاج سريع', 'Quick heal')], ['H', tr('هورن (بالسيارة)', 'Horn (in a vehicle)')], ['I  /  Tab', tr('الحقيبة', 'Bag')], ['M', tr('الخريطة', 'Map')], ['K', tr('المستعمرة', 'Colony')], ['F5', tr('حفظ يدوي', 'Manual save')], ['F11', tr('ملء الشاشة', 'Fullscreen')], ['Esc', tr('القائمة', 'Menu')]];
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
    case 'KeyQ': cycleWeapon(); break; case 'KeyC': G.zoom = 3; View3D.resetYaw(); break; case 'KeyV': G.camFollow = G.camFollow === 0 ? 1 : 0; if (!G.camFollow) View3D.resetYaw(); toast(G.camFollow ? tr('الكاميرا تدور ويه اتجاهك', 'Camera follows your direction') : tr('الكاميرا ثابتة', 'Camera fixed')); break; case 'KeyH': horn(); break; case 'KeyK': colonyPanel(); break; case 'F5': save(false); break; case 'KeyF': quick('eat'); break; case 'KeyX': quick('heal'); break;
  }
});
addEventListener('keyup', e => { R.keys[e.code] = false; });
addEventListener('blur', () => { R.keys = {}; R.mouse.l = R.mouse.r = false; });
cv.addEventListener('mousemove', e => { R.mouse.x = e.clientX; R.mouse.y = e.clientY; R.mouse.t = 2.5; });
cv.addEventListener('mousedown', e => { if (R.mode === 'intro' && R.lapse) return R.lapse.finish(); if (e.button === 0) R.mouse.l = true; if (e.button === 2) R.mouse.r = true; R.mouse.x = e.clientX; R.mouse.y = e.clientY; R.mouse.t = 2.5; });
addEventListener('mouseup', e => { if (e.button === 0) R.mouse.l = false; if (e.button === 2) R.mouse.r = false; });
addEventListener('contextmenu', e => e.preventDefault());
addEventListener('wheel', e => { if (R.mode === 'play' && R.busy === 0) G.zoom = clamp(G.zoom - Math.sign(e.deltaY), 2, 8); }, { passive: true });
function resize() { cv.width = innerWidth; cv.height = innerHeight; View3D.resize(); }
addEventListener('resize', resize);
addEventListener('beforeunload', () => { if (R.mode === 'play' && R.busy === 0 && G.hp > 0) { try { save(true); } catch (e) { /* ignore */ } } });

let last = performance.now();
function loop(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; try { update(dt); render(); } catch (e) { console.error(e); } requestAnimationFrame(loop); }
// ================================================================ LIFE — real work you can see, an endless city, the story that keeps going
const op = k => !!(G.fort && G.fort[k]);
const atPost = (id, k) => { const c = G.comps[id]; return !!c && c.st === 'post' && (!k || c.post === k); };
const bOfK = k => G.conv[k] != null ? World.buildings[G.conv[k]] : null;
const bType = t => World.buildings.find(b => b.type === t);
const mallB = () => World.buildings[S._mall.b - 1];
const inB = (b, x, y) => !!b && x >= b.x * 16 && x < (b.x + b.w) * 16 && y >= b.y * 16 && y < (b.y + b.h) * 16;
const bPt = (b, fx, fy) => ({ x: (b.x + 1 + fx * (b.w - 2)) * 16 + 8, y: (b.y + 1 + fy * (b.h - 2)) * 16 + 8 });
const umaliMall = () => !!(G.flags.umali && G.flags.mall);
const CONVT = { hosp: ['hospital', 1], camp: ['camp', 5], water: ['waterplant', 2], fuel: ['refinery', 3] };
const CONVP = { hosp: [0, -20], camp: [-18, 2], water: [16, -8], fuel: [-9, 17] };
const WORK = {
  cook: { fac: 'food', st: 'stove', out: 'samoon', n: lv => 1 + (lv >> 1), cyc: 24, l: [['العجين خمّر.. الصمون بالفرن.', 'صمون حار! محد يلمس لحد ما يبرد.'], ['The dough rose... bread in the oven.', 'Hot bread! Nobody touch it till it cools.']] },
  water: { fac: 'water', st: 'tank', out: 'water', n: lv => 1 + (lv >> 1), cyc: 22, l: [['الفلتر يشتغل.. الماي صافي.', 'قنينة.. قنينتين.. عبّيناهن.'], ['The filter is running... clean water.', 'One bottle... two... filled.']] },
  fuel: { fac: 'fuel', st: 'still', out: 'fuel', n: () => 1, cyc: 34, l: [['ريحة البانزين.. أحلى من العطر.', 'جليكان جديد طالع.'], ['Smell of petrol... better than perfume.', 'A fresh can coming out.']] },
  pharm: { fac: 'med', st: 'bench', out: 'bandage', n: () => 1, cyc: 30, l: [['لفّافات معقّمة.. حاضرة.', 'نور كالت: النظافة نص العلاج.'], ['Sterile bandages... ready.', 'Noor says cleanliness is half the cure.']] },
  smith: { fac: 'arms', st: 'anvil', out: 'ammo9', n: lv => 2 + lv, cyc: 30, l: [['رصاص معبّى بالإيد.. دقيق.', 'طك.. طك.. طلع شريط.'], ['Hand-loaded rounds... precise.', 'Clack... clack... a clip is done.']] }
};
const WORKB = { cook: () => mallB(), water: () => bOfK('water'), fuel: () => bOfK('fuel'), pharm: () => bType('pharmacy'), smith: () => bType('armory') };
const JOBORD = ['soldier', 'guard', 'scav', 'farm', 'doc', 'medic', 'cook', 'water', 'fuel', 'pharm', 'smith'];
const JOBX = { cook: ['طبّاخين', 'Cooks', 'بمطبخ المول: يطلّعون صمون حار (يحتاج المطبخ)', 'Mall kitchen: bake bread (needs the kitchen)'], water: ['عمال الماي', 'Water workers', 'بمحطة الماي: يعبّون قناني (يحتاج المحطة)', 'Water plant: fill bottles (needs the plant)'], fuel: ['عمال المصفى', 'Refinery workers', 'بالمصفى: يطلّعون بانزين (يحتاج المصفى)', 'Refinery: make fuel (needs the refinery)'], pharm: ['صيادلة', 'Pharmacists', 'بالصيدلية: لفّافات وإسعافات (يحتاج المعمل)', 'Pharmacy: bandages & medkits (needs the lab)'], smith: ['عمال المشجب', 'Armorers', 'بالمشجب: يعبّون رصاص (يحتاج الورشة)', 'Armory: load ammo (needs the shop)'] };
ITEMS.veg = { n: ['خضرة', 'Vegetables'], food: 14 };
ITEMS.alibody = { n: ['علي (فاقد الوعي)', 'Ali (unconscious)'], q: 1, d: ['وصّله للمستشفى، لنور', 'Take him to Noor at the hospital'] };
FOODS.push('veg');
NPC.umali.n = ['أم علي', 'Um Ali']; NPC.ali = { n: ['علي', 'Ali'] }; LOOK.ali = { id: 'al', shirt: '#1f7a3a', pants: '#2c2f36', hair: '#1b1410' };
Object.assign(ZT, { giant: { hp: 340, sp: 10, dmg: 22 }, doctor: { hp: 30, sp: 15, dmg: 7 }, ali: { hp: 45, sp: 13, dmg: 3 } });
Object.assign(ZMODEL, { giant: 'Z05' });
Object.assign(ZLINES, {
  giant: [['جوعاااااان!', 'مخخخ.. كثييير مخ..', 'أاكل.. المول كله..', 'هغغغغ.. لحممم..'], ['HUNGRYYYY!', 'Braaains.. lots of braaains..', 'I eat.. the whole mall..', 'Hhhggg.. meeeat..']],
  doctor: [['افتح حلگك.. أريد أعضّ..', 'عملية.. على مخك..', 'جوعان.. من الخفارة..'], ['Open wide.. I want to bite..', 'Surgery.. on your brain..', 'Hungry.. since the night shift..']],
  ali: [['يمّه.. جوعااان..', 'كتاب.. ومخ..', 'غغغ.. شنو الغدا.. إنت؟'], ['Mom.. hungryyy..', 'Book.. and brains..', 'Grrr.. what is lunch.. you?']]
});

// ---------------------------------------------------------------- setup per world build
function setupLife() {
  for (const k of ['hosp', 'camp', 'water', 'fuel']) if (G.conv[k] == null) { const i = pickConv(k); if (i >= 0) G.conv[k] = i; }
  const m = mallB(), pin = (b, off) => { const y = b.door === 'S' ? b.dy - 1 : b.dy + 1; return World.freeNear((b.dx + off) * 16 + 8, y * 16 + 8); };
  S.padMH = World.freeNear(128 * 16 + 8, 50 * 16 + 8); S.padMC = World.freeNear(130 * 16 + 8, 50 * 16 + 8); S.padMW = World.freeNear(132 * 16 + 8, 50 * 16 + 8); S.padMF = World.freeNear(132 * 16 + 8, 47 * 16 + 8);
  const H = bOfK('hosp'), C = bOfK('camp'), Wb = bOfK('water'), Fb = bOfK('fuel');
  if (H) S.padHM = pin(H, 1); if (C) S.padCM = pin(C, 1); if (Wb) S.padWM = pin(Wb, 1); if (Fb) S.padFM = pin(Fb, 1);
  S.padHK = World.freeNear(18 * 16 + 8, 50 * 16 + 8);
  let mk = null, md = 1e9; for (const b of World.buildings) { if (World.zoneOf(b.x) !== 1 || b.type === 'booth') continue; const d = hyp((b.x + b.w / 2) * 16 - S.haji.x, (b.y + b.h / 2) * 16 - S.haji.y); if (d < md) { md = d; mk = b; } }
  if (mk) S.padKH = pin(mk, 0);
  const L2 = (a, b, n, na, nb, cost, need) => ({ a, b, n, na, nb, cost, need });
  LINKS.mh = L2('padMH', 'padHM', ['ممر سري', 'Secret tunnel'], ['المول', 'Mall'], ['المستشفى', 'Hospital'], { scrap: 10 }, () => op('hosp') ? null : tr('حصّن المستشفى أول', 'fortify the hospital first'));
  LINKS.mc = L2('padMC', 'padCM', ['ممر سري', 'Secret tunnel'], ['المول', 'Mall'], ['المعسكر', 'Camp'], { scrap: 10 }, () => op('camp') ? null : tr('حصّن المعسكر أول', 'fortify the camp first'));
  LINKS.mw = L2('padMW', 'padWM', ['ممر سري', 'Secret tunnel'], ['المول', 'Mall'], ['محطة الماي', 'Water plant'], { scrap: 8 }, () => G.fac.water ? null : tr('صلّح محطة الماي أول', 'repair the water plant first'));
  LINKS.mf = L2('padMF', 'padFM', ['ممر سري', 'Secret tunnel'], ['المول', 'Mall'], ['المصفى', 'Refinery'], { scrap: 10, parts: 2 }, () => G.fac.fuel ? null : tr('صلّح المصفى أول', 'repair the refinery first'));
  if (S.padKH) LINKS.hk = L2('padHK', 'padKH', ['ممر سري', 'Secret tunnel'], ['البيت', 'Home'], ['السوق', 'Market'], { scrap: 12 }, () => G.flags.g1 ? null : tr('افتح طريق السوق أول', 'open the market road first'));
  window.IZ_PADS = [['hm', 'tunHome', '#7fc24b'], ['hm', 'tunMall', '#7fc24b'], ['mp', 'brMall', '#6cc4ff'], ['mp', 'brPharm', '#6cc4ff'], ['ma', 'tunMall2', '#e3b62f'], ['ma', 'tunArm', '#e3b62f'], ['mh', 'padMH', '#ff7b7b'], ['mh', 'padHM', '#ff7b7b'], ['mc', 'padMC', '#b8d080'], ['mc', 'padCM', '#b8d080'], ['mw', 'padMW', '#3d8fd6'], ['mw', 'padWM', '#3d8fd6'], ['mf', 'padMF', '#e08a3a'], ['mf', 'padFM', '#e08a3a'], ['hk', 'padHK', '#d8b98a'], ['hk', 'padKH', '#d8b98a']];
  R.farm = null; R.stSig = ''; R.patients = [];
}
function rebuildWorld() {
  World.gen(); setupLife(); for (const g in World.gates) if (G.flags[g]) World.setGate(g, true); for (const l in World.locks) if (G.flags['lk_' + l]) World.setLock(l, true);
  applyConv(); applyFloor(); View3D.build(); buildObjs(); syncNpcs(); R.stSig = '';
}
async function fortify(k) {
  const b = bOfK(k); if (!b || op(k)) return;
  const nm = k === 'hosp' ? tr('المستشفى', 'the hospital') : tr('المعسكر', 'the camp'), cost = k === 'hosp' ? { scrap: 14, parts: 2 } : { scrap: 12, parts: 2 };
  const inside = R.zombies.filter(z => inB(b, z.x, z.y)).length;
  if (inside) return toast(tr('اكو ' + inside + ' زومبي داخل ' + nm + '. نظّفه أول، بعدين نحصّنه.', 'There are ' + inside + ' zombies inside ' + nm + '. Clear it first, then fortify.'), 5000);
  const i = await say('me', k === 'hosp' ? tr('المستشفى موجود.. بس مهجور. الشبابيك مكسورة والباب مخلوع. نحصّنه: أكياس رمل، سياج، ونصلّح المولدة الصغيرة.', 'The hospital is here... just abandoned. Broken windows, door ripped off. We fortify it: sandbags, a fence, and fix its small generator.') : tr('ساحة المعسكر موجودة.. بس مفتوحة للزومبي. نحصّنها بسياج وأكياس رمل.', 'The camp yard is here... but open to zombies. We fortify it with a fence and sandbags.'), [tr('حصّنه (' + costStr(cost) + ')', 'Fortify (' + costStr(cost) + ')'), tr('بعدين', 'Later')]);
  if (i !== 0) return; if (!afford(cost)) return toast(tr('ما عندك كفاية مواد.', 'Not enough materials.'));
  pay(cost); G.fort[k] = 1; R.busy++; $('#fade').classList.add('on'); sfx('fix'); await wait(400); rebuildWorld(); $('#fade').classList.remove('on'); R.busy--;
  toast(k === 'hosp' ? tr('تحصّن المستشفى ✓ هسه وزّع مسعفين وباحثين (K)، وخلّي نور تمسكه (احچي وياها). والجثث تتعالج هنا بالليل.', 'Hospital fortified ✓ Now assign medics and researchers (K), and put Noor in charge (talk to her). Bodies are treated here overnight.') : tr('تحصّن المعسكر ✓ كل ناجي جديد يتدرّب هنا أول يوم، والجنود يتمرّنون ويحرسون. خلّي الجندي حسن يستلمه.', 'Camp fortified ✓ Every new survivor trains here on day one, and soldiers drill and stand guard. Put Private Hassan in charge.'), 9000);
  save(true);
}

// ---------------------------------------------------------------- spots
const dropSpot = () => World.freeNear(129 * 16 + 8 + rand(-10, 10), 49 * 16 + 8 + rand(-6, 6));
const STOVES = [[121.6, 46.5], [121.6, 48.5], [121.6, 50.5]];
function stationPts(job) {
  const b = WORKB[job] && WORKB[job](); if (!b) return [];
  if (job === 'cook') return STOVES.map(([x, y]) => ({ x: x * 16, y: y * 16 }));
  return [bPt(b, .3, .4), bPt(b, .7, .4), bPt(b, .5, .75)];
}
function campYard() { const c = op('camp') ? bOfK('camp') : mallB(); const y = c.door === 'S' ? c.dy + 3 : c.dy - 3; return { x: c.dx * 16 + 8, y: y * 16 + 8 }; }
function farmPlots() { if (!R.farm) farmSpot(); const f = R.farm; return [[0, 0], [24, 0], [0, 24], [24, 24]].map(([dx, dy]) => ({ x: f.x + dx - 12, y: f.y + dy - 12 })); }
function hospPts() { const h = bOfK('hosp'); return h ? { beds: [bPt(h, .15, .2), bPt(h, .15, .5), bPt(h, .15, .8), bPt(h, .45, .2), bPt(h, .45, .5), bPt(h, .45, .8)], bench: bPt(h, .8, .3) } : null; }
function postSpot(k) {
  if (k === 'hosp') { const h = hospPts(); if (h) return World.freeNear(h.bench.x - 14, h.bench.y + 12); }
  if (k === 'camp') { const y = campYard(); return World.freeNear(y.x, y.y - 10); }
  if (k === 'garage') return World.freeNear(S.mallBench.x, S.mallBench.y + 16);
  if (k === 'gate') return World.freeNear(S.mallDoor.x + 20, S.mallDoor.y - 16);
  if (k === 'radio') return World.freeNear(S.radio.x, S.radio.y + 16);
  if (k === 'kitchen') return World.freeNear(STOVES[0][0] * 16 + 16, STOVES[0][1] * 16 + 8);
  return mallSpot();
}

// ---------------------------------------------------------------- the visible world of work
function lifeStations() {
  const L2 = [];
  for (const job in WORK) { if (!G.fac[WORK[job].fac]) continue; for (const p of stationPts(job)) L2.push({ k: WORK[job].st, x: p.x, y: p.y }); }
  if (umaliMall() && !G.fac.food) L2.push({ k: 'stove', x: STOVES[0][0] * 16, y: STOVES[0][1] * 16 });
  const h = hospPts(); if (h && op('hosp')) { for (const b of h.beds) L2.push({ k: 'bed', x: b.x, y: b.y }); L2.push({ k: 'bench', x: h.bench.x, y: h.bench.y }); }
  if (G.col.pop || G.flags.mall) { const y = campYard(); for (let i = 0; i < 3; i++) L2.push({ k: 'dummy', x: y.x - 40 + i * 40, y: y.y + 34 }); }
  if (G.col.jobs.farm || G.crops) { const st = Math.min(3, (G.crops || 0) >> 1); for (const p of farmPlots()) L2.push({ k: 'crop', x: p.x, y: p.y, n: G.col.jobs.farm ? Math.max(1, st) : st }); }
  if (G.flags.mall) { let i = 0; for (const it of ['water', 'samoon', 'veg', 'fuel', 'bandage', 'ammo9']) { const n = G.stash[it] || 0; if (n) L2.push({ k: 'pile', it, n: Math.ceil(n / 2), x: (130.6 + (i % 3) * 1.1) * 16, y: (50.6 + ((i / 3) | 0) * 1.1) * 16 }); i++; } }
  const sig = JSON.stringify(L2) + '|' + (G.col.hurt || 0) + op('hosp'); if (sig === R.stSig) return; R.stSig = sig; View3D.stations(L2);
  const hp = hospPts(); R.patients = hp && op('hosp') ? hp.beds.slice(0, Math.min(6, G.col.hurt || 0)).map((b, i) => ({ id: 'pt' + i, x: b.x, y: b.y + 2, look: LOOK['sv' + ((i * 5 + 3) % 16)] })) : [];
}
function jobOfL(i) { const j = G.col.jobs; let k = 0; for (const name of JOBORD) { k += j[name] || 0; if (i < k) return name; } k += G.col.trainee || 0; if (i < k) return 'trainee'; return 'idle'; }
function linkFor(e, p) {
  const be = World.bAt(e.x >> 4, e.y >> 4), bp = World.bAt(p.x >> 4, p.y >> 4); if (be && be === bp) return null;
  for (const k in LINKS) { if (!G.links[k]) continue; const l = LINKS[k], A = S[l.a], B = S[l.b]; if (!A || !B) continue;
    for (const [X, Y] of [[A, B], [B, A]]) { const bx = World.bAt(X.x >> 4, X.y >> 4), by = World.bAt(Y.x >> 4, Y.y >> 4); if ((be && be === bx || hyp(e.x - X.x, e.y - X.y) < 200) && (bp && bp === by || hyp(p.x - Y.x, p.y - Y.y) < 200) && hyp(e.x - p.x, e.y - p.y) > 260) return { a: X, b: Y }; } }
  return null;
}
function goTo(e, p) { const lk = linkFor(e, p), to = lk ? lk.a : p, path = findPath(e.x >> 4, e.y >> 4, to.x >> 4, to.y >> 4); e.path = path && path.length ? path : [to]; e.pi = 0; e.hop = lk; e.tgt = p; }
function stepPath(e, dt) {
  const w = e.path[e.pi], dx = w.x - e.x, dy = w.y - e.y, d = hyp(dx, dy), sp = (e.carry ? 40 : e.job === 'scav' ? 58 : 46) * dt;
  if (d < 3) { e.pi++; if (e.pi < e.path.length) return false;
    if (e.hop) { const h = e.hop; e.hop = null; for (let j = 0; j < 4; j++) R.fx.push({ k: 'puff', x: e.x, y: e.y - 6, t: .35, c: '#e8cf7a' }); e.x = h.b.x; e.y = h.b.y; const path = findPath(e.x >> 4, e.y >> 4, e.tgt.x >> 4, e.tgt.y >> 4); e.path = path && path.length ? path : [e.tgt]; e.pi = 0; return false; }
    e.path = null; return true; }
  e.x += dx / d * Math.min(sp, d); e.y += dy / d * Math.min(sp, d); e.fr += dt * 8; e.dir = dirOf(dx, dy); e.face = null; return false;
}
function facePt(e, p) { if (p) e.face = Math.atan2(p.x - e.x, p.y - e.y); }
function deliver(e) {
  const [it, n] = e.carry; G.stash[it] = (G.stash[it] || 0) + n; G.prod[it] = (G.prod[it] || 0) + n; e.carry = null; e.cit = null;
  bubble(e, '+' + n + ' ' + L(ITEMS[it].n), 2.4); if (hyp(e.x - G.x, e.y - G.y) < 300) sfx('pick');
}
function resNote(b, a) {
  for (const [th, ar, en] of [[8, 'الباحثين: "عرفنا شي.. الزومبي يهدأ من يشمّ چاي".', 'Researchers: "We learned something... zombies calm down at the smell of tea."'], [20, 'الباحثين جرّبوا لقاح رقم ٧ على زومبي.. كام يرقص. مو هذا المطلوب.', 'The researchers tried vaccine #7 on a zombie... it started dancing. Not the goal.'], [40, 'اللقاح التجريبي اشتغل على واحد! رجع يحچي.. وأول شي سأل عن راتبه.', 'The trial vaccine worked on one! He can talk again... first thing he asked about was his salary.'], [70, 'نور: "اللقاح صار ثابت. نحتاج ناس أكثر حتى نوصّله لكل بغداد."', 'Noor: "The vaccine is stable now. We need more people to take it across Baghdad."']])
    if (b < th && a >= th) { toast(tr(ar, en), 8000); if (th === 40) G.flags.vaccine = 1; }
}
const SCAVLOOT = [['water', 1, .2], ['veg', 2, .18], ['scrap', 2, .22], ['parts', 1, .1], ['can', 1, .1], ['ammo9', 3, .08], ['fuel', 1, .06], ['bandage', 1, .06]];
function scavLoot() { let r = Math.random(); for (const [it, n, p] of SCAVLOOT) { if (r < p) return [it, n]; r -= p; } return ['scrap', 1]; }
function scavTarget() {
  const zs = [0, 2]; if (G.flags.g1) zs.push(1); if (G.flags.g3) zs.push(3);
  for (let t = 0; t < 14; t++) { const c = World.containers[(Math.random() * World.containers.length) | 0]; if (!c || c.fixed || !zs.includes(c.zone)) continue; if (hyp(c.x - S.mallDoor.x, c.y - S.mallDoor.y) > 760) continue; return World.freeNear(c.x, c.y + 14); }
  const p = World.randOutdoor(2); return p || S.mallDoor;
}
const POSTL = {
  hosp: [['اكعد هنا.. خلّيني أشوف الجرح.', 'نحتاج لفّافات أكثر. والصبر.', 'العينة رقم ١٣.. أحسن من ١٢.'], ['Sit here... let me see the wound.', 'We need more bandages. And patience.', 'Sample #13... better than #12.']],
  camp: [['واحد! اثنين! ارفع رجلك!', 'هذا مو مسدس ماي، شدّ عليه زين!', 'الجندي الزين ياكل صمون عسكري ويسكت.'], ['One! Two! Lift those knees!', "That's not a water pistol, grip it properly!", 'A good soldier eats army bread and keeps quiet.']],
  garage: [['هاي السيارة تحتاج دعاء أكثر من قطع غيار.', 'دررر.. اشتغلت!', 'منو خلّى الكيا بلا دهن؟!'], ['This car needs prayers more than parts.', 'Brrr... it runs!', 'Who left the Kia without oil?!']],
  gate: [['استكان چاي للحرس.. بلا چاي ماكو حراسة.', 'الزحمة برّه.. نفس الباب الشرقي.'], ['Tea for the guards... no tea, no guarding.', 'Traffic outside... same as Bab Al-Sharqi.']],
  radio: [['هنا إذاعة المول! لايك واشتراك وتعالوا!', 'كششش.. سيف معاكم من قلب الحدث!'], ['This is Mall Radio! Like, subscribe and come over!', 'Kshhh... Saif live from the scene!']],
  kitchen: [['يمّه تعالوا تريّكوا.', 'الدولمة تحتاج وكت.. والصبر من الإيمان.', 'منو أخذ الطاوة؟!'], ['Come have breakfast, dears.', 'Dolma takes time... patience is faith.', 'Who took the frying pan?!']]
};
function finishWork(e) {
  const j = e.job, c = G.col;
  if (WORK[j]) { const lv = G.fac[WORK[j].fac], it = j === 'pharm' && lv >= 2 && Math.random() < .4 ? 'medkit' : WORK[j].out; e.carry = [it, it === 'medkit' ? 1 : WORK[j].n(lv)]; if (Math.random() < .3) bubble(e, pick(L(WORK[j].l)), 2.4); return; }
  if (j === 'scav') { e.carry = scavLoot(); bubble(e, tr('لكيت شي! راجع للمول.', 'Found something! Heading back.'), 2.2); return; }
  if (j === 'farm') { G.crops = (G.crops || 0) + 1; if (G.crops >= 7) { G.crops = 0; e.carry = ['veg', 3]; bubble(e, tr('الحصاد! طماطة وخيار.', 'Harvest! Tomatoes and cucumbers.'), 2.4); } else bubble(e, pick(L([['سقيت الزرع.', 'الطماطة دتحمر.'], ['Watered the crops.', 'The tomatoes are reddening.']])), 2); return; }
  if (j === 'doc') { const b = c.research; c.research += atPost('noor', 'hosp') ? .9 : .5; resNote(b, c.research); bubble(e, tr('+ بحث اللقاح', '+ vaccine research'), 2); return; }
  if (j === 'medic' || e.poster === 'hosp') { if (c.hurt > 0) { c.hurt--; bubble(e, tr('واحد طاب ✓ رجع لشغله.', 'One recovered ✓ back to work.'), 2.4); R.stSig = ''; } else { if (e.poster === 'hosp') { const b = c.research; c.research += .4; resNote(b, c.research); } if (Math.random() < .4) bubble(e, pick(L(e.poster ? POSTL.hosp : [['ماكو جرحى.. الحمد لله.', 'نعقّم الأسرّة.'], ['No wounded... thank God.', 'Sterilising the beds.']])), 2.4); } return; }
  if (e.poster === 'kitchen') { e.carry = ['samoon', G.fac.food ? 3 : 2]; if (Math.random() < .5) bubble(e, pick(L(POSTL.kitchen)), 2.6); return; }
  if (e.poster === 'gate') { e.carry = Math.random() < .5 ? ['tea', 1] : null; if (!e.carry || Math.random() < .5) bubble(e, pick(L(POSTL.gate)), 2.4); return; }
  if (e.poster === 'garage') { const v = G.veh.filter(v => !v.gone && v.hp < VEH[v.t].hp).sort((a, b) => a.hp - b.hp)[0]; if (v) { v.hp = Math.min(VEH[v.t].hp, v.hp + 20); bubble(e, tr('صلّحت ' + L(VEH[v.t].n) + ' شوية.', 'Patched up the ' + L(VEH[v.t].n) + '.'), 2.4); } else { e.carry = Math.random() < .35 ? ['parts', 1] : null; bubble(e, pick(L(POSTL.garage)), 2.4); } return; }
  if (e.poster) { if (Math.random() < .5) bubble(e, pick(L(POSTL[e.poster] || POSTL.gate)), 2.6); return; }
  if ((j === 'trainee' || j === 'soldier') && Math.random() < .35) bubble(e, pick(L([['واحد! اثنين!', 'يمين.. يسار.. لا يسارك الثاني!', 'متى الغدا؟'], ['One! Two!', 'Right... left... no, your OTHER left!', 'When is lunch?']])), 2);
  if (j === 'idle' && Math.random() < .5) bubble(e, pick(L(JOBL.idle)), 2.4);
}
function planWork(e, night) {
  const j = e.job;
  if (e.carry) { e.st = 'deliver'; return goTo(e, dropSpot()); }
  if (e.poster) { e.st = 'work'; e.cyc = e.poster === 'kitchen' ? 34 : e.poster === 'camp' ? 7 : rand(14, 22); e.ws = e.poster === 'kitchen' ? { x: STOVES[0][0] * 16, y: STOVES[0][1] * 16 } : e.poster === 'hosp' ? (hospPts() || {}).bench : e.poster === 'camp' ? campYard() : null; return goTo(e, postSpot(e.poster)); }
  if (night && j !== 'guard' && j !== 'soldier') { e.st = 'rest'; e.cyc = 20; e.ws = null; return goTo(e, mallSpot()); }
  if (WORK[j]) { const pts = stationPts(j); if (!pts.length || !G.fac[WORK[j].fac]) { e.st = 'idle'; e.cyc = 6; return goTo(e, mallSpot()); } const p = pts[e.idx % pts.length]; e.ws = p; e.st = 'work'; e.cyc = WORK[j].cyc * rand(.85, 1.15); return goTo(e, World.freeNear(p.x + 14, p.y + 10)); }
  if (j === 'scav') { e.st = 'work'; e.cyc = rand(4, 6); e.ws = null; return goTo(e, scavTarget()); }
  if (j === 'farm') { const p = farmPlots()[e.idx % 4]; e.ws = p; e.st = 'work'; e.cyc = rand(12, 16); return goTo(e, World.freeNear(p.x + 14, p.y)); }
  if (j === 'doc' || j === 'medic') { const h = op('hosp') && hospPts(); if (!h) { e.st = 'idle'; e.cyc = 6; return goTo(e, mallSpot()); } const p = j === 'doc' ? h.bench : h.beds[e.idx % 6]; e.ws = p; e.st = 'work'; e.cyc = j === 'doc' ? rand(20, 26) : rand(16, 22); return goTo(e, World.freeNear(p.x + 14, p.y + 4)); }
  if (j === 'guard') { const sites = [mallB()]; if (op('hosp')) sites.push(bOfK('hosp')); if (op('camp')) sites.push(bOfK('camp')); e.st = 'guard'; e.cyc = rand(8, 12); e.ws = null; return goTo(e, doorOut(sites[e.idx % sites.length], 5)); }
  if (j === 'soldier' || j === 'trainee') { const y = campYard(); e.st = 'drill'; e.cyc = rand(3, 6); e.ws = { x: y.x - 40 + (e.idx % 3) * 40, y: y.y + 34 }; return goTo(e, World.freeNear(y.x + rand(-50, 50), y.y + rand(-16, 10))); }
  e.st = 'idle'; e.cyc = rand(5, 9); e.ws = null; return goTo(e, World.freeNear(S.board.x + rand(-40, 40), S.board.y + rand(10, 40)));
}
function arriveWork(e) {
  if (e.st === 'deliver') { deliver(e); e.wt = .8; e.st = 'next'; return; }
  e.wt = e.cyc || 4; facePt(e, e.ws);
}
function fightTick(e, dt) {
  const j = e.job, sol = j === 'soldier' || e.poster === 'camp', gd = j === 'guard' || e.poster === 'gate';
  if ((!sol && !gd) || e.hidden) return; e.gun = sol ? 'rifle' : 'pipe';
  if ((e.cd = (e.cd || rand(0, .6)) - dt) > 0) return; e.cd = sol ? 1 : .8;
  const rng = sol ? 170 : 70; let t = null, bd = rng; for (const z of R.zombies) { const d = Math.abs(z.x - e.x) + Math.abs(z.y - e.y); if (d < bd * 1.4) { const dd = hyp(z.x - e.x, z.y - e.y); if (dd < bd) { bd = dd; t = z; } } }
  if (!t) { if (sol && e.st === 'drill' && e.wt > 0 && e.ws && Math.random() < .35) { R.fx.push({ k: 'line', x: e.x, y: e.y - 9, x2: e.ws.x, y2: e.ws.y - 12, t: .06 }); if (hyp(e.x - G.x, e.y - G.y) < 260) sfx('shot'); facePt(e, e.ws); } return; }
  const a = Math.atan2(t.y - e.y, t.x - e.x); e.face = Math.PI / 2 - a;
  const hz = (dmg, kb) => { if (hyp(t.x - G.x, t.y - G.y) < 360) return hitZ(t, dmg, a, kb); t.hp -= dmg; t.alert = 6; if (t.hp <= 0) { const i = R.zombies.indexOf(t); if (i >= 0) R.zombies.splice(i, 1); if (R.raid && t.raid) R.raid.killed++; if (op('hosp') && t.type !== 'giant' && R.bodies.length < 30) R.bodies.push({ x: t.x, y: t.y, look: t.look, t: 150 }); } };
  if (sol) { R.fx.push({ k: 'line', x: e.x, y: e.y - 9, x2: t.x, y2: t.y - 9, t: .07 }); if (hyp(e.x - G.x, e.y - G.y) < 420) sfx('shot'); hz(G.col.noAmmo ? 9 : (atPost('sol', 'camp') ? 24 : 18), 40); }
  else if (bd < 26) hz(11, 90);
}
function updWorkers(dt) {
  let budget = 3; const night = isNight(), raid = !!R.raid;
  for (const e of R.npcs) {
    if (!e.worker && !e.poster) continue;
    const job = e.poster ? 'post' : jobOfL(e.idx);
    if (job !== e.job) { e.job = job; e.path = null; e.wt = 0; e.st = 'next'; e.carry = null; }
    e.hidden = raid && (job === 'guard' || job === 'soldier'); e.work = 0; e.gun = null;
    fightTick(e, dt);
    if (e.wt > 0) { e.wt -= dt; if (e.st === 'work' || e.st === 'drill') { e.work = 1; facePt(e, e.ws); } if (e.wt <= 0) { if (e.st === 'work' || e.st === 'drill' || e.st === 'guard' || e.st === 'idle') finishWork(e); e.st = 'next'; } continue; }
    if (e.path) { if (stepPath(e, dt)) arriveWork(e); continue; }
    if (budget-- <= 0) continue; planWork(e, night);
  }
}

// ---------------------------------------------------------------- endless zombies, giants, daytime attacks
function spawnGiant(x, y, tag) {
  if (x == null) { for (let t = 0; t < 16; t++) { const a = rand(0, 6.28), r = rand(420, 600), px = G.x + Math.cos(a) * r, py = G.y + Math.sin(a) * r; if (px < 32 || py < 32 || px > World.W * 16 - 32 || py > World.H * 16 - 32 || solidAt(px, py, 1) || World.bAt(px >> 4, py >> 4)) continue; x = px; y = py; break; } if (x == null) return null; }
  const z = mkZ('giant', x, y); z.look = zlook('giant', 0); if (tag) Object.assign(z, tag); if (z.big) { z.hp = 650; z.s = Object.assign({}, z.s, { hp: 650 }); } R.zombies.push(z); return z;
}
function lifeZombies(dt) {
  if ((R.zt = (R.zt || 0) - dt) > 0) return; R.zt = 2.2;
  let near = 0; for (const z of R.zombies) if (!z.raid && Math.abs(z.x - G.x) < 700 && Math.abs(z.y - G.y) < 700) near++;
  const zn = World.zoneOf(G.x >> 4), target = Math.round(((secured(zn) ? 5 : 13) + Math.min(G.day, 30) * .45) * (isNight() ? 1.35 : 1));
  if (near < target && R.zombies.length < 280) for (let k = 0; k < 2; k++) for (let t = 0; t < 10; t++) { const a = rand(0, 6.28), r = rand(430, 660), x = G.x + Math.cos(a) * r, y = G.y + Math.sin(a) * r, tx = x >> 4, ty = y >> 4; if (tx < 2 || ty < 2 || tx >= World.W - 2 || ty >= World.H - 2 || solidAt(x, y, 1) || World.bAt(tx, ty)) continue; const z = mkZ(ztype(World.zoneOf(tx)), x, y); if (Math.random() < .3) z.alert = 4; R.zombies.push(z); break; }
  if (R.zombies.length > 250) { const i = R.zombies.findIndex(z => !z.raid && !z.guard && !z.nest && !z.mis && !z.big && ['normal', 'vendor', 'fat', 'cop', 'gen'].includes(z.type) && hyp(z.x - G.x, z.y - G.y) > 1400); if (i >= 0) R.zombies.splice(i, 1); }
  const h = G.time % 24, slot = G.day * 2 + (h >= 12 ? 1 : 0);
  if (G.day >= 3 && G.giantS !== slot && ((h >= 12 && h < 13) || (h >= 0 && h < 1) || h >= 23.5)) { G.giantS = slot; if (Math.random() < .45 && spawnGiant()) { R.shake = .6; sfx('crash'); toast(tr('الأرض تهتز.. زومبي ضخم بالمنطقة! يحتاج سلاح ناري أو جماعة.', 'The ground shakes... a giant zombie nearby! You need a gun or a crew.'), 6500); } }
  if (G.flags.mall && G.col.pop > 0 && G.day >= 3 && G.dayRaid !== G.day && h >= 14 && h < 15 && !R.raid) { G.dayRaid = G.day; if (Math.random() < .55) { const rd = G.raidDay; startRaid(.5, true); G.raidDay = rd; } }
}

// ---------------------------------------------------------------- missions: the story never stops
const MIS_T = {
  nest: m => [tr('نظّف عش الزومبي بـ ' + L(ZONES[m.zn]) + ' — اكو ناجين مختبين جوّه', 'Clear the zombie nest in ' + L(ZONES[m.zn]) + ' — survivors are hiding inside'), m],
  giant: m => [tr('الجمّاعين شافوا زومبي ضخم بـ ' + L(ZONES[m.zn]) + '.. طيّحه', 'Scavengers spotted a giant zombie in ' + L(ZONES[m.zn]) + '... take it down'), R.zombies.find(z => z.mis) || m],
  supply: m => [tr('وصّل ' + L(ITEMS[m.it].n) + ' ×' + m.n + ' لـ' + (m.to === 'hosp' ? 'لمستشفى' : 'لمعسكر') + ' (عندك ' + (G.inv[m.it] || 0) + ')', 'Deliver ' + L(ITEMS[m.it].n) + ' ×' + m.n + ' to the ' + (m.to === 'hosp' ? 'hospital' : 'camp') + ' (you have ' + (G.inv[m.it] || 0) + ')'), (() => { const b = bOfK(m.to); return b ? { x: b.dx * 16 + 8, y: (b.door === 'S' ? b.dy + 1 : b.dy - 1) * 16 + 8 } : S.mallDoor; })()],
  rescue: m => [tr('انقذ الناجي المحاصر (النقطة الخضرة)', 'Rescue the trapped survivor (green dot)'), G.strand.find(s => s.k === m.k) || null]
};
function newMission(notes) {
  const zs = [0, 2]; if (G.flags.g1) zs.push(1); if (G.flags.g3) zs.push(3); if (G.flags.g4) zs.push(4);
  const types = ['nest', 'giant', 'rescue']; if (op('hosp') || op('camp')) types.push('supply');
  const t = pick(types), zn = pick(zs);
  if (t === 'nest') { const bs = World.buildings.filter(b => b.type === 'house' && World.zoneOf(b.x) === zn && hyp(b.dx * 16 - S.mallDoor.x, b.dy * 16 - S.mallDoor.y) > 300); const b = pick(bs); if (!b) return; const p = doorOut(b, 4); G.mis = { t, zn, x: p.x, y: p.y, n: Math.min(16, 7 + (G.day >> 1)), g: G.day % 3 === 0 }; notes.push(tr('مهمة اليوم: عش زومبي بـ ' + L(ZONES[zn]) + '. نسمع صوت ناس محصورين جوّه البيت.', "Today's mission: a zombie nest in " + L(ZONES[zn]) + '. We hear people trapped inside the house.')); }
  else if (t === 'giant') { const p = World.randOutdoor(zn); if (!p) return; G.mis = { t, zn, x: p.x, y: p.y }; notes.push(tr('مهمة اليوم: زومبي ضخم يخرّب بـ ' + L(ZONES[zn]) + '. الجمّاعين ما يكدرون يطلعون.', "Today's mission: a giant zombie wrecking " + L(ZONES[zn]) + '. The scavengers cannot go out.')); }
  else if (t === 'supply') { const to = op('hosp') && (!op('camp') || Math.random() < .5) ? 'hosp' : 'camp', [it, n] = to === 'hosp' ? pick([['bandage', 3], ['medkit', 1], ['water', 4]]) : pick([['ammo9', 10], ['samoon', 4], ['fuel', 1]]); G.mis = { t, to, it, n }; notes.push(to === 'hosp' ? tr('مهمة اليوم: المستشفى يحتاج ' + L(ITEMS[it].n) + ' ×' + n + '.', "Today's mission: the hospital needs " + L(ITEMS[it].n) + ' ×' + n + '.') : tr('مهمة اليوم: المعسكر يحتاج ' + L(ITEMS[it].n) + ' ×' + n + '.', "Today's mission: the camp needs " + L(ITEMS[it].n) + ' ×' + n + '.')); }
  else { const p = World.randOutdoor(zn); if (!p || G.strand.length >= 3) return; const k = [0, 1, 2, 3].find(x => !G.strand.some(s => s.k === x)); G.strand.push({ k, x: p.x, y: p.y }); G.mis = { t, k, zn }; notes.push(tr('مهمة اليوم: واحد يصيح من ' + L(ZONES[zn]) + '. محاصر بين الزومبي.', "Today's mission: someone screaming from " + L(ZONES[zn]) + '. Trapped among zombies.')); }
}
function misDone(txt, rw) {
  G.mis = null; G.misN = (G.misN || 0) + 1; for (const k in rw) add(k, rw[k]); sfx('fix'); save(true);
  toast(tr('✓ المهمة خلصت! ', '✓ Mission complete! ') + txt + '  ' + Object.keys(rw).map(k => '+' + L(ITEMS[k].n) + ' ×' + rw[k]).join(tr('، ', ', ')), 8000);
}
function misTick() {
  const m = G.mis; if (!m) return;
  if (m.t === 'nest' && m.live && !R.zombies.some(z => z.nest)) { const n = Math.min(2, Math.max(0, colCap() - G.col.pop)); G.col.pop += n; G.col.trainee = (G.col.trainee || 0) + n; syncNpcs(); misDone(n ? tr('طلعوا ' + n + ' ناجين من البيت وراحوا للمول يتدرّبون.', n + ' survivors came out and went to the mall to train.') : tr('البيت صار آمن.', 'The house is safe.'), { scrap: 6, parts: 2 }); }
  else if (m.t === 'giant' && m.live && !R.zombies.some(z => z.mis)) misDone(tr('الضخم وكع. الجمّاعين رجعوا يطلعون.', 'The giant is down. The scavengers can go out again.'), { parts: 3, ammo9: 6 });
  else if (m.t === 'rescue' && !G.strand.some(s => s.k === m.k)) misDone(tr('الناجي وصل.', 'The survivor made it.'), { scrap: 4 });
}
function misSpawn() {
  const m = G.mis; if (!m) return;
  if (m.t === 'nest') { m.live = 1; for (let i = 0; i < m.n; i++) { const a = rand(0, 6.28), r = rand(10, 70), z = mkZ(ztype(m.zn), m.x + Math.cos(a) * r, m.y + Math.sin(a) * r * .7); z.nest = 1; if (!solidAt(z.x, z.y, 1)) R.zombies.push(z); } if (m.g) { const z = spawnGiant(m.x + 30, m.y + 20, { nest: 1 }); if (!z) m.g = 0; } }
  if (m.t === 'giant') { m.live = 1; spawnGiant(m.x, m.y, { mis: 1 }); }
}
function supplyAct(k) {
  const m = G.mis; if (!m || m.t !== 'supply' || m.to !== k) return false;
  if (!has(m.it, m.n)) { toast(tr('يحتاجون ' + L(ITEMS[m.it].n) + ' ×' + m.n + ' — عندك ' + (G.inv[m.it] || 0) + '.', 'They need ' + L(ITEMS[m.it].n) + ' ×' + m.n + ' — you have ' + (G.inv[m.it] || 0) + '.')); return false; }
  take(m.it, m.n); const n = G.col.pop < colCap() ? 1 : 0; G.col.pop += n; G.col.trainee = (G.col.trainee || 0) + n; syncNpcs();
  misDone(n ? tr('واحد من الجرحى القدماء تطوّع وانضم للتدريب.', 'One of the old patients volunteered and joined training.') : tr('شكروك من كل كلبهم.', 'They thanked you from the heart.'), { scrap: 3 });
  return true;
}

// ---------------------------------------------------------------- side story: Um Ali & Ali, Saif's comeback
function lifeSide() {
  const f = G.flags; let s = null;
  if (f.aliQ === 1 && f.g3) { const z = R.zombies.find(z => z.type === 'ali'); s = Object.assign({ label: tr('أم علي: دوّر علي', 'Um Ali: find Ali') }, z ? { x: z.x, y: z.y } : S.book); }
  else if (f.aliQ === 2) { const b = bOfK('hosp'); s = { label: tr('وصّل علي للمستشفى', 'Take Ali to the hospital'), x: b.dx * 16 + 8, y: (b.door === 'S' ? b.dy + 1 : b.dy - 1) * 16 + 8 }; }
  else if (G.mis && !f.ended) { const o = MIS_T[G.mis.t](G.mis); if (o[1]) s = { label: tr('مهمة', 'Mission'), x: o[1].x, y: o[1].y }; }
  R.side = s;
}
async function umaliTalk() {
  const f = G.flags;
  if (f.mall && f.umali && !f.umaliMoved) { f.umaliMoved = 1; syncNpcs(); return say('umali', tr('يمّه سمعت إنتو بالمول وعدكم ناس هواي.. منو يطبخلهم؟ لا لا، اني أجي. المطبخ مالتي من اليوم.', 'Dear, I heard you are at the mall with lots of people... who cooks for them? No no, I am coming. The kitchen is mine from today.')); }
  if (f.umali && !f.aliQ && G.day >= 5) {
    f.aliQ = 1;
    await say('umali', tr('يمّه.. أريد أطلب منك شي. علي ابني راح للمتنبي يوم الجمعة يشتري كتب. يحب الكتب.. مو مثلك.', 'Dear... I want to ask you something. My son Ali went to Mutanabbi on Friday to buy books. He loves books... not like you.'));
    await say('umali', tr('من يومها ما رجع. إذا شفته تعرفه: فانيلة المنتخب الخضرة ونظارات.', 'He never came back. You will know him: green national team jersey and glasses.'));
    await say('umali', tr('وإذا صاير زومبي.. لا تضربه هواي. بس شوية، حتى يكعد. ووصّله لنور.. هي تعرف شتسوي.', "And if he turned... don't hit him much. Just a little, so he sits down. And bring him to Noor... she knows what to do."));
    toast(f.g3 ? tr('مهمة جانبية: دوّر على علي بشارع المتنبي (السهم الوردي).', 'Side quest: find Ali on Mutanabbi Street (pink arrow).') : tr('مهمة جانبية: علي بالمتنبي.. بس الطريق للمتنبي بعده مسدود.', 'Side quest: Ali is in Mutanabbi... but the road there is still closed.'), 7000);
    if (f.g3) spawnAli(); save(true); return;
  }
  if (f.aliQ === 4) return say('umali', pick(L([['علي رجع يقرا. الحمد لله.. بس بعده ياكل مثل الزومبي.', 'يمّه الله يخليك. لولاك جان علي بعده يدور بالشارع.'], ['Ali is reading again. Thank God... he still eats like a zombie though.', 'God keep you, dear. Without you Ali would still be roaming the street.']])));
  if (f.umaliMoved) return say('umali', pick(L([['أكلت؟ وجهك أصفر.', 'الصمون حار.. خذ وحدة وروح.', 'لا تخلّي الشباب ينامون بلا عشا.'], ['Have you eaten? You look pale.', 'The bread is hot... take one and go.', "Don't let the boys sleep without dinner."]])));
  return say('umali', tr('أكلت؟ وجهك أصفر. اكعد أسويلك شي.', "Have you eaten? You look pale. Sit, I'll make you something."));
}
function spawnAli() { if (R.zombies.some(z => z.type === 'ali')) return; const p = World.freeNear(S.book.x + 70, S.book.y + 40), z = mkZ('ali', p.x, p.y); z.look = zlook('ali', 0); R.zombies.push(z); }
function lifeDay(notes) {
  const c = G.col, f = G.flags;
  if (f.umali && f.mall && !f.umaliMoved) { f.umaliMoved = 1; notes.push(tr('أم علي سمعت إن بالمول ناس هواي.. لمّت طاواتها وجت. كالت: "منو يطبخلهم؟ إنتو؟ لا يمّه." المطبخ صار مالتها.', 'Um Ali heard there are many people at the mall... packed her pans and came. She said: "Who cooks for them? You? No, dear." The kitchen is hers now.')); }
  if (c.trainee) { const n = c.trainee; c.trainee = 0; const got = autoAssign(n); notes.push(tr(n + ' تخرّجوا من التدريب' + (op('camp') ? ' بالمعسكر' : ' كدام المول') + (atPost('sol', 'camp') ? ' (الجندي حسن دربهم بقسوة.. وبحب)' : '') + ' وتوزّعوا: ' + got + '.', n + ' graduated from training and were assigned: ' + got + '.')); }
  const pr = Object.keys(G.prod || {}).filter(k => G.prod[k] > 0); if (pr.length) notes.push(tr('شغل الناس أمس: ', "People's work yesterday: ") + pr.map(k => L(ITEMS[k].n) + ' ×' + G.prod[k]).join(tr('، ', ', ')) + tr(' — كلها بالمخزن.', ' — all in storage.')); G.prod = {};
  for (const k in WORK) { const fac = WORK[k].fac; if (G.fac[fac] && !c.jobs[k]) notes.push(tr(L(FAC[fac].n) + ' واكف.. ماكو عمال. وزّع ناس من المستعمرة (K).', L(FAC[fac].n) + ' is idle... no workers. Assign people in the colony (K).')); }
  if (op('hosp') && c.hurt && !c.jobs.medic && !atPost('noor', 'hosp')) notes.push(tr(c.hurt + ' جرحى ينتظرون بالمستشفى.. ماكو مسعف.', c.hurt + ' wounded waiting at the hospital... no medic.'));
  if (f.aliQ === 3) { if (op('hosp')) { f.aliQ = 4; if (c.pop < colCap()) { c.pop++; c.jobs.doc++; } notes.push(tr('نور سهرت على علي طول الليل. الصبح فتح عيونه ودوّر على نظاراته.', 'Noor stayed up all night with Ali. In the morning he opened his eyes and looked for his glasses.')); R.aliScene = 1; } }
  const sf = comp('saif'); if (sf.st === 'left' && !f.saifBack && f.mall && G.day - sf.joinDay >= 5) { f.saifBack = 1; sf.st = 'post'; sf.post = 'radio'; sf.trust = 55; const n = Math.min(2, Math.max(0, colCap() - c.pop)); c.pop += n; c.trainee = (c.trainee || 0) + n; notes.push(tr('رجع سيف! ووياه ' + n + ' من متابعينه. يكول: "كلتلكم المول أحسن لوكيشن". هسه يمسك إذاعة المول.', 'Saif is back! With ' + n + ' of his followers. He says: "I told you the mall is the best location." He runs the mall radio now.')); }
  if (atPost('saif', 'radio') && c.pop < colCap() && Math.random() < .5) { c.pop++; c.trainee = (c.trainee || 0) + 1; notes.push(tr('واحد وصل على صوت إذاعة سيف.. كال "جيت أطلع بالبث".', 'Someone arrived following Saif\'s radio... said "I came to be on the stream."')); }
  if (G.mis && (G.mis.t === 'nest' || G.mis.t === 'giant')) G.mis.live = 0;
  if (!G.mis && (f.radio || f.ended)) newMission(notes);
  if (G.day % 10 === 0) notes.unshift(tr('— الدفتر رقم ' + (G.day / 10 + 1) + '. الأول خلص ورق. —', '— Notebook #' + (G.day / 10 + 1) + '. The last one ran out of pages. —'));
}
function autoAssign(n) {
  const j = G.col.jobs, got = {}, give = k => { j[k] = (j[k] || 0) + 1; got[k] = (got[k] || 0) + 1; };
  for (let i = 0; i < n; i++) {
    let k = null;
    for (const w in WORK) { const lv = G.fac[WORK[w].fac]; if (lv && (j[w] || 0) < lv * 2) { k = w; break; } }
    if (!k && op('hosp') && j.medic < 2) k = 'medic'; if (!k && op('hosp') && j.doc < 2) k = 'doc';
    if (!k && j.guard < 2) k = 'guard'; if (!k && op('camp') && j.soldier < 3) k = 'soldier'; if (!k && j.farm < 2) k = 'farm';
    give(k || 'scav');
  }
  return Object.keys(got).map(k => L(JOBT[k] || JOBX[k]) + ' ×' + got[k]).join(tr('، ', ', '));
}
async function aliScene() {
  R.aliScene = 0;
  await say(tr('علي', 'Ali'), tr('يمّه..؟ شنو الغدا؟ وليش الكل يباوعون عليّه هيج؟', "Mom...? What's for lunch? And why is everyone staring at me?"));
  await say('umali', tr('علي! يمّه! ... دولمة يمّه. دولمة.', 'Ali! My son! ... Dolma, dear. Dolma.'));
  await say('noor', tr('هذا أول واحد يرجع كامل. حتى نظاراته يتذكرها. أم علي.. إنتِ السبب، صبرتِ عليه.', 'He is the first one back completely. He even remembers his glasses. Um Ali... it was you, you waited for him.'));
  await say(tr('علي', 'Ali'), tr('أشتغل ويه نور بالبحث. الكتب علّمتني شي.. بس الزومبي علّمني أكثر.', 'I will work with Noor on the research. Books taught me something... being a zombie taught me more.'));
  add('dolma', 2); toast(tr('علي انضم للمستعمرة كباحث. وأم علي طبخت دولمة للكل (دولمة ×٢).', 'Ali joined the colony as a researcher. Um Ali cooked dolma for everyone (dolma ×2).'), 7000); save(true);
}

// ---------------------------------------------------------------- chapter two objectives
function ch2Obj() {
  const f = G.flags;
  if (!op('hosp')) { const b = bOfK('hosp'); return [tr('الدفتر الثاني: حصّن المستشفى المهجور خلف المول', 'Notebook two: fortify the abandoned hospital behind the mall'), b ? { x: b.dx * 16 + 8, y: (b.door === 'S' ? b.dy + 1 : b.dy - 1) * 16 + 8 } : null]; }
  if (comp('noor').st !== 'left' && comp('noor').st !== 'none' && !atPost('noor', 'hosp')) { const n = R.npcs.find(e => e.id === 'noor'); return [tr('خلّي نور تمسك المستشفى (احچي وياها)', 'Put Noor in charge of the hospital (talk to her)'), n || null]; }
  if (!f.bigBoss) { const z = R.zombies.find(z => z.big); return [tr('«أبو كرش» — أضخم زومبي ببغداد — واكف يم الجسر. لازم يوكع', '«Abu Karsh» — the biggest zombie in Baghdad — stands by the bridge. He must fall'), z || S.g4]; }
  if (G.mis) return MIS_T[G.mis.t](G.mis);
  if (!f.vaccine) return [tr('ساعد نور: وزّع باحثين بالمستشفى حتى يكمل اللقاح (' + Math.min(100, Math.round(G.col.research / 40 * 100)) + '%)', 'Help Noor: assign researchers at the hospital to finish the vaccine (' + Math.min(100, Math.round(G.col.research / 40 * 100)) + '%)'), null];
  return [tr('كبّر المستعمرة: بث بالراديو، صلّح المعامل، وابني الممرات', 'Grow the colony: broadcast on the radio, repair the plants, build the tunnels'), S.radio];
}
const CH2 = [['سدّيت الدفتر الأول.', 'بس الزومبي ما قروا الدفتر.. بعدهم بالشوارع، وكل يوم يجون أكثر.', 'نور تكول: الچاي يهدّيهم، بس ما يرجّعهم. نحتاج مستشفى محصّن ولقاح حقيقي.', 'وأبو جاسم يكول: نحتاج بانزين. أبو جاسم دائماً يحتاج بانزين.', 'فتحت دفتر جديد. كتبت بأول صفحة: "اليوم الأول.. مرة ثانية."'], ['I closed the first notebook.', 'But the zombies never read it... they are still in the streets, more every day.', 'Noor says: tea calms them, it does not bring them back. We need a fortified hospital and a real vaccine.', 'And Abu Jasim says: we need fuel. Abu Jasim always needs fuel.', 'I opened a new notebook. On the first page I wrote: "Day one... again."']];

// ---------------------------------------------------------------- per-frame
function lifeTick(dt) {
  lifeZombies(dt);
  if ((R.lt = (R.lt || 0) - dt) <= 0) { R.lt = 1; misTick(); lifeSide(); lifeStations(); }
  if (R.aliScene && R.busy === 0 && !R.nexting) aliScene();
}

// ---------------------------------------------------------------- loot on zombies, money, gear, item icons
Object.assign(ITEMS, {
  dinar: { n: ['دينار', 'Dinars'], d: ['فلوس.. حتى بنهاية العالم حجي كاظم يقبلها', 'Money... even at the end of the world Haji takes it'] },
  phone: { n: ['موبايل', 'Mobile phone'], d: ['ينباع لحجي كاظم', 'Sells to Haji Kadhim'] }, watch: { n: ['ساعة يد', 'Wristwatch'], d: ['ينباع لحجي كاظم', 'Sells to Haji Kadhim'] },
  cig: { n: ['باكيت جكاير', 'Pack of cigarettes'], d: ['عملة السوك الحقيقية', 'The real market currency'] }, gold: { n: ['خاتم ذهب', 'Gold ring'], d: ['غالي.. حجي يحبه', 'Valuable... Haji loves it'] },
  shirt: { n: ['ملابس نظيفة', 'Clean clothes'], en: 18, d: ['تبدّل وترجع إنسان', 'Change and feel human again'] },
  helmet: { n: ['خوذة', 'Helmet'], gear: 'helmet', d: ['تلبسها: ضرر أقل ٢٠٪', 'Wear it: 20% less damage'] }, vest: { n: ['سترة واقية', 'Body armor'], gear: 'vest', d: ['تلبسها: ضرر أقل ٣٠٪', 'Wear it: 30% less damage'] },
  knife: { n: ['سچينة مطبخ', 'Kitchen knife'], wep: 'cleaver', d: ['سلاح: ساطور', 'Weapon: cleaver'] }
});
const ICON = { samoon: '🥖', can: '🥫', dates: '🌴', dolma: '🍲', water: '💧', tea: '🍵', bandage: '🩹', medkit: '🧰', fuel: '⛽', scrap: '🔩', parts: '⚙️', ammo9: '🔸', ammo7: '🔶', medicine: '💊', key_gate: '🔑', key_police: '🔑', key_armory: '🔑', key_truck: '🔑', cutter: '✂️', book: '📕', zbody: '🧟', alibody: '🧟', kettle: '🫖', jacket: '🧥', invoice: '🧾', veg: '🍅', dinar: '💵', phone: '📱', watch: '⌚', cig: '🚬', gold: '💍', shirt: '👕', helmet: '🪖', vest: '🦺', knife: '🔪' };
function icon(id, sz) { const w = el('span', null, 'ico'); w.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:' + (sz || 30) + 'px;height:' + (sz || 30) + 'px;margin-inline-end:8px;vertical-align:middle;font-size:' + Math.round((sz || 30) * .68) + 'px;background:rgba(255,255,255,.06);border:1px solid rgba(232,207,122,.25);border-radius:6px;'; const im = new Image(); im.width = im.height = (sz || 30) - 2; im.style.cssText = 'image-rendering:auto;object-fit:contain'; im.onerror = () => { im.remove(); w.textContent = ICON[id] || '▪'; }; im.src = 'icons/' + id + '.png'; w.appendChild(im); return w; }
const ZDROP = {
  normal: [['dinar', .35, 1000, 5000], ['phone', .07], ['cig', .1], ['watch', .04], ['shirt', .05], ['water', .07], ['scrap', .14]],
  vendor: [['dinar', .5, 2000, 9000], ['dates', .2, 1, 2], ['samoon', .15], ['veg', .12, 1, 2], ['cig', .1]],
  cop: [['ammo9', .35, 3, 6], ['dinar', .25, 2000, 6000], ['cig', .12], ['vest', .035], ['helmet', .03], ['pistol', .04]],
  gen: [['parts', .42], ['fuel', .14], ['dinar', .32, 5000, 20000], ['scrap', .2, 1, 2], ['invoice', .03]],
  fat: [['can', .25], ['samoon', .2, 1, 2], ['dinar', .2, 1000, 4000], ['shirt', .08], ['knife', .04]],
  soldier: [['ammo7', .32, 6, 12], ['helmet', .07], ['vest', .05], ['medkit', .08], ['dinar', .15, 2000, 5000], ['rifle', .015]],
  doctor: [['bandage', .35], ['medkit', .12], ['dinar', .2, 3000, 8000], ['watch', .06]],
  giant: [['dinar', 1, 15000, 40000], ['gold', .5], ['parts', 1, 2, 2], ['scrap', 1, 4, 4]]
};
function dropLoot(z) {
  const T = ZDROP[z.type]; if (!T) return; const got = [];
  for (const [id, p, a, b] of T) { if (Math.random() >= p) continue;
    if (id === 'pistol' || id === 'rifle') { if (G.weps[id] != null) continue; G.weps[id] = 1; got.push((id === 'pistol' ? '🔫 ' : '🔫 ') + L(WEAPONS[id].n) + tr(' (لكيته بحزامه!)', ' (found on his belt!)')); continue; }
    let n = a ? Math.round(rand(a, b || a)) : 1; if (id === 'dinar') n = Math.round(n / 250) * 250; add(id, n); got.push((ICON[id] || '') + ' ' + L(ITEMS[id].n) + (n > 1 ? ' ×' + n.toLocaleString('en') : '')); }
  if (got.length) toast(tr('لكيت عليه: ', 'Found on him: ') + got.join(tr('، ', ', ')), 2800);
}
function wearGear(id) { G.gear = G.gear || {}; if (G.gear[id]) return toast(tr('لابسها من قبل.', 'Already wearing it.')); take(id); G.gear[id] = 1; sfx('fix'); toast(id === 'helmet' ? tr('لبست الخوذة. راسي صار أغلى من قبل.', 'Helmet on. My head is worth more now.') : tr('لبست السترة الواقية. أحس روحي جندي.. بلا راتب.', 'Body armor on. I feel like a soldier... without the salary.')); }
const gearCut = () => { const g = G.gear || {}; return (g.helmet ? .2 : 0) + (g.vest ? .3 : 0); };
const HAJI_BUY = [[{ dinar: 1500 }, 'samoon', 2], [{ dinar: 2000 }, 'water', 2], [{ dinar: 6000 }, 'parts', 1], [{ dinar: 9000 }, 'fuel', 1], [{ dinar: 8000 }, 'ammo9', 8], [{ dinar: 15000 }, 'ammo7', 12], [{ dinar: 14000 }, 'medkit', 1], [{ dinar: 25000 }, 'vest', 1], [{ dinar: 12000 }, 'helmet', 1]];
const HAJI_SELL = [[{ phone: 1 }, 'dinar', 5000], [{ watch: 1 }, 'dinar', 8000], [{ cig: 1 }, 'dinar', 3000], [{ gold: 1 }, 'dinar', 30000], [{ shirt: 1 }, 'dinar', 2000], [{ invoice: 1 }, 'dinar', 250]];

Object.assign(JOBS, JOBX);
View3D.init($('#gl')); resize(); World.gen(); View3D.build(); G = blank(''); G.time = 7.5; spawnAll(); renderMenu(); requestAnimationFrame(loop);
setTimeout(() => checkUpdate(false), 1500);
window.__izFast = () => setInterval(() => { try { update(1 / 60); } catch (e) { console.error(e); } }, 16);
window.__iz = { dropLoot, invPanel, lifeTick, lifeDay, spawnGiant, fortify, rebuildWorld, newMission, jobOfL, autoAssign, op, startRaid, update, updComps, findNear, hud, LOOK, zlook, syncNpcs, updWorkers, jobOf, findPath, startRaid, endRaid, convert, hospMenu, strandDay, stairsMenu, stashPanel, applyFloor, colCap, baseMenu, travel, facDay, colonyPanel, colonyDay, colLevel, get G() { return G; }, R, World, S, startNew, loadGame, add, join, openGate, SC, nextDay, hud, invPanel, introLapse, mapPanel, aboutPanel, pauseMenu, setLang, notebook, say, enterVeh, VEH, mkZ, toTitle, closePanel, die };
})();

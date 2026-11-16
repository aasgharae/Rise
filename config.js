export const CONFIG={seasonLength:45,dayMs:86400000,tickMs:1000,storageBase:12000,storagePerKeep:4000,worldW:56,worldH:36,castleW:26,castleH:18};
export const BATCH_OPTIONS=[1,10,50,100];
export const START_RESOURCES={food:2500,wood:1800,stone:1200,iron:500,gold:400};
export const RESMETA={food:{name:'غذا',icon:'🌾'},wood:{name:'چوب',icon:'🪵'},stone:{name:'سنگ',icon:'🪨'},iron:{name:'آهن',icon:'⛓️'},gold:{name:'طلا',icon:'🪙'}};
export function resName(k){return (RESMETA[k]&&RESMETA[k].name)||k;}
export const TROOPS={
swordsman:{name:'شمشیرزن',icon:'⚔️',desc:'متعادل نبرد نزدیک',atk:12,def:10,hp:70,power:14,upkeep:1,unlock:1,time:6,cost:{food:80,iron:15},iconPath:'assets/icons/swordsman.svg'},
spearman:{name:'نیزه‌دار',icon:'🔱',desc:'ضد سواره‌نظام',atk:13,def:14,hp:75,power:15,upkeep:1,unlock:1,time:7,cost:{food:90,wood:30},iconPath:'assets/icons/spearman.svg'},
axeman:{name:'تبرزن',icon:'🪓',desc:'دیوارشکن، ضد ساختمان',atk:22,def:8,hp:80,power:22,upkeep:2,unlock:2,time:12,cost:{food:130,wood:60,iron:20},iconPath:'assets/icons/axeman.svg'},
archer:{name:'کماندار',icon:'🏹',desc:'دوربرد پرآسیب',atk:20,def:6,hp:50,power:24,upkeep:2,unlock:2,time:12,cost:{food:120,wood:70,gold:15},iconPath:'assets/icons/archer.svg'},
cavalry:{name:'سواره‌نظام',icon:'🐎',desc:'سریع و سنگین',atk:38,def:22,hp:150,power:55,upkeep:4,unlock:3,time:22,cost:{food:280,iron:90,gold:40},iconPath:'assets/icons/cavalry.svg'},
knight:{name:'شوالیه',icon:'🛡️',desc:'تانک، تلفات کمتر',atk:30,def:45,hp:220,power:70,upkeep:5,unlock:4,time:35,cost:{food:350,iron:150,gold:80},iconPath:'assets/icons/knight.svg'},
ballista:{name:'بالستا',icon:'🎯',desc:'محاصره دقیق ضد دفاع',atk:85,def:12,hp:180,power:110,upkeep:6,unlock:4,time:50,cost:{wood:380,stone:280,gold:120},iconPath:'assets/icons/ballista.svg'},
catapult:{name:'منجنیق',icon:'💥',desc:'سلاح نهایی محاصره',atk:110,def:10,hp:240,power:150,upkeep:8,unlock:5,time:70,cost:{wood:500,stone:400,gold:200},iconPath:'assets/icons/catapult.svg'}
};
export const BUILDINGS={
keep:{name:'قلعه',icon:'🏰',desc:'مرکز فرماندهی، افزایش انبار',max:10,baseCost:{wood:500,stone:400,gold:100},baseProd:0},
farm:{name:'مزرعه',icon:'🌾',desc:'تولید غذا',max:12,prod:'food',baseProd:24,baseCost:{wood:120,stone:60}},
lumber:{name:'چوب‌بری',icon:'🪵',desc:'تولید چوب',max:12,prod:'wood',baseProd:18,baseCost:{wood:100,stone:80}},
quarry:{name:'معدن سنگ',icon:'🪨',desc:'تولید سنگ',max:10,prod:'stone',baseProd:14,baseCost:{wood:150,stone:50}},
ironmine:{name:'معدن آهن',icon:'⛓️',desc:'تولید آهن',max:10,prod:'iron',baseProd:10,baseCost:{wood:200,stone:150}},
goldmine:{name:'معدن طلا',icon:'🪙',desc:'تولید طلا',max:10,prod:'gold',baseProd:6,baseCost:{wood:300,stone:250}},
barracks:{name:'سربازخانه',icon:'⚔️',desc:'بازکردن نیرو و سرعت آموزش',max:10,baseProd:0,baseCost:{wood:250,stone:200,gold:50}},
wall:{name:'دیوار',icon:'🧱',desc:'دفاع شهر',max:10,baseProd:0,baseCost:{wood:100,stone:150}}
};
export function buildingCost(type,curLevel){const def=BUILDINGS[type];if(!def)return{};const nl=(curLevel||0)+1;const mult=Math.pow(1.65,nl-1)*nl;const o={};for(const k in def.baseCost)o[k]=Math.ceil(def.baseCost[k]*mult);if(nl>=5)o.gold=Math.ceil((o.gold||50)+nl*20);return o;}
export function buildingProd(type,level){const def=BUILDINGS[type];if(!def||!def.baseProd||!def.prod)return{};const v=Math.floor(def.baseProd*level*Math.pow(1.35,level-1));const o={};o[def.prod]=v;return o;}
export const DEFAULT_TRIBES=[
{id:'red-clan',name:'قبیله سرخ',color:'#e74c3c',x:10,y:8,power:180,def:20,territory:'دشت‌های جنوبی',reputation:'تهاجمی'},
{id:'golden',name:'قبیله طلایی',color:'#f1c40f',x:28,y:5,power:250,def:25,territory:'فلات مرکزی',reputation:'ثروتمند'},
{id:'mountain',name:'قبیله کوهستان',color:'#8e9aaf',x:45,y:8,power:350,def:32,territory:'کوهستان شمالی',reputation:'دفاعی'},
{id:'green-field',name:'قبیله دشت سبز',color:'#2ecc71',x:12,y:28,power:220,def:22,territory:'دشت‌های غربی',reputation:'کشاورز'},
{id:'river',name:'قبیله رود',color:'#3498db',x:44,y:27,power:300,def:28,territory:'کنار رود بزرگ',reputation:'بازرگان'}
];
export const EXTRA_TRIBES=[
{id:'wolf',name:'قبیله گرگ',color:'#9b59b6',territory:'جنگل مه‌آلود',reputation:'وحشی'},
{id:'falcon',name:'قبیله شاهین',color:'#e67e22',territory:'صخره‌های بلند',reputation:'تیزبین'},
{id:'dragon',name:'قبیله اژدها',color:'#c0392b',territory:'آتشفشان',reputation:'افسانه‌ای'},
{id:'panther',name:'قبیله پلنگ',color:'#1abc9c',territory:'بیشه',reputation:'چابک'},
{id:'eagle',name:'قبیله عقاب',color:'#f39c12',territory:'قله‌ها',reputation:'مغرور'},
{id:'bear',name:'قبیله خرس',color:'#795548',territory:'غار شمالی',reputation:'سنگین'},
{id:'fox',name:'قبیله روباه',color:'#ff7043',territory:'تپه‌ها',reputation:'حیله‌گر'},
{id:'lion',name:'قبیله شیر',color:'#ffc107',territory:'ساوانا',reputation:'شاه'},
{id:'snake',name:'قبیله مار',color:'#4caf50',territory:'مرداب',reputation:'زهرآگین'},
{id:'boar',name:'قبیله گراز',color:'#8d6e63',territory:'جنگل بلوط',reputation:'سرسخت'},
{id:'crow',name:'قبیله کلاغ',color:'#607d8b',territory:'ویرانه',reputation:'مرموز'},
{id:'tiger',name:'قبیله ببر',color:'#ff5722',territory:'جنگل بامبو',reputation:'درنده'}
];
export const STARTER_CASTLE=[
{id:'keep-1',type:'keep',x:13,y:8,level:1},
{id:'farm-1',type:'farm',x:8,y:6,level:1},{id:'farm-2',type:'farm',x:18,y:6,level:1},
{id:'lumber-1',type:'lumber',x:6,y:10,level:1},{id:'lumber-2',type:'lumber',x:20,y:10,level:1},
{id:'quarry-1',type:'quarry',x:9,y:13,level:1},{id:'iron-1',type:'ironmine',x:17,y:13,level:1},
{id:'gold-1',type:'goldmine',x:13,y:4,level:1},
{id:'bar-1',type:'barracks',x:5,y:6,level:1},{id:'bar-2',type:'barracks',x:21,y:6,level:1},{id:'bar-3',type:'barracks',x:13,y:12,level:1},
{id:'wall-1',type:'wall',x:11,y:7,level:1},{id:'wall-2',type:'wall',x:15,y:7,level:1},
{id:'wall-3',type:'wall',x:11,y:10,level:1},{id:'wall-4',type:'wall',x:15,y:10,level:1}
];
export const STARTER_CASTLE_BUILDINGS=STARTER_CASTLE;
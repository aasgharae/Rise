export const CONFIG = {
  world: { cols: 100, rows: 62, seed: 74129 },
  castle: { cols: 42, rows: 30, seed: 9217 },
  seasonLength: 45,
  productionIntervalMs: 5000,
  autosaveIntervalMs: 15000
};

export const BUILDINGS = {
  farm:     { name: "مزرعه", icon: "🌾", cost: { wood: 20, stone: 5 }, production: { food: 4 } },
  lumber:   { name: "چوب‌بری", icon: "🪵", cost: { wood: 15, stone: 10 }, production: { wood: 3 } },
  quarry:   { name: "معدن سنگ", icon: "⛏️", cost: { wood: 15, stone: 15 }, production: { stone: 2 } },
  barracks: { name: "سربازخانه", icon: "⚔️", cost: { wood: 30, stone: 25 }, production: {} },
  wall:     { name: "دیوار", icon: "🧱", cost: { wood: 5, stone: 20 }, production: {} }
};

export const DEFAULT_TRIBES = [
  { id:"red-clan", name:"قبیله گرگ سرخ", color:"#c85b51", x:18, y:15, territory:"شمال غرب", power:420, reputation:"تهاجمی" },
  { id:"mountain", name:"فرزندان کوهستان", color:"#a47bc5", x:77, y:13, territory:"شمال شرق", power:560, reputation:"دفاعی" },
  { id:"green-field", name:"اتحاد دشت سبز", color:"#72a96b", x:21, y:48, territory:"جنوب غرب", power:350, reputation:"تجاری" },
  { id:"river", name:"نگهبانان رود", color:"#58a9bd", x:78, y:46, territory:"جنوب شرق", power:490, reputation:"متعادل" },
  { id:"golden", name:"شیرهای طلایی", color:"#c5a04d", x:49, y:10, territory:"مرکز شمالی", power:610, reputation:"تهاجمی" }
];

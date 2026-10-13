// Pixel portraits (36x36) and S.T.A.L.K.E.R. 2 gear/artefact data.
const N = 36;
const PAL = ['#0d0f0c','#1f221d','#2f332b','#474c40','#646a59','#8a8f7a','#b8b9a6','#e6e2d3','#3b4a2a','#556b35','#7a8f45','#4a3a2a','#6e5238','#94704a','#b89468','#2a2522','#3e3833','#5e1f1a','#9a2f24','#c8432f','#20304a','#34557a','#5b82a8','#8fb3cf','#2e4a2e','#3f6b38','#5f9448','#a85a1c','#d9822b','#f0b043','#f2d27a','#6d6d6d','#9a9a9a','#c7c7c7','#3a3d42','#575c63','#7d848c','#f1c9a5','#dba57f','#b97a55','#8a5636','#5c3824','#2c3d3a','#6f9a8c','#b5832a','#1a1a1a','#c7a76a','#a64b2a','#4f3524','#8b8b84','#2f8f8a','#7a5aa8','#e3c13a','#a89566','#7d6c45','#4d4560','#6f6588','#18233a','#7a1c2c','#6b6a3a','#d8d6cc','#5a5e3a'];
const CH = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SKINS = [37,38,39,40,41];
const SKD = {37:38,38:39,39:40,40:41,41:15}, SKDD = {37:39,38:40,39:41,40:15,41:1};
const HAIRS = [45,48,47,46,49];

/* ---------- gear (names from the S.T.A.L.K.E.R. 2 armour list) ---------- */
const torso = (d, c) => { d.S(24,9,14,c); d.S(25,6,15,c); d.S(26,4,16,c); d.S(27,3,17,c); for (let y = 28; y < N; y++) d.S(y,2,17,c); };
const shadeR = (d, c) => d.R(31,28,33,35,c);
const arms = (d, c) => { d.R(8,30,8,35,c); d.R(27,30,27,35,c); };
const SUITS = [
  {label:'Debut Suit', group:'Jackets', front(d){ torso(d,12); shadeR(d,11); arms(d,11); d.R(13,24,15,26,13); d.R(20,24,22,26,13); d.R(16,26,19,35,4); d.R(15,27,15,35,13); d.R(20,27,20,35,13); d.R(10,31,13,32,11); }},
  {label:'Sunrise Suit', group:'Light suits', back(d){ d.R(11,21,24,24,8); }, front(d){ torso(d,9); shadeR(d,8); arms(d,8); d.S(24,12,14,8); d.S(25,13,15,8); d.R(13,25,14,29,2); d.R(21,25,22,29,2); d.R(9,29,26,29,2); [[10,13],[16,19],[22,25]].forEach(([a,b]) => { d.R(a,30,b,33,3); d.R(a,30,b,30,2); }); }},
  {label:'Bandit Jacket', group:'Jackets', front(d){ torso(d,15); shadeR(d,1); arms(d,1); d.R(12,24,15,27,16); d.R(20,24,23,27,16); d.R(16,26,19,35,20); d.R(16,26,16,35,7); d.R(19,26,19,35,7); d.R(15,28,15,35,16); d.R(20,28,20,35,16); }},
  {label:'Wind of Freedom', group:'Light suits', front(d){ torso(d,25); shadeR(d,24); arms(d,24); d.R(13,23,15,25,24); d.R(20,23,22,25,24); d.R(11,28,24,33,24); d.R(11,28,24,28,26); d.set(12,30,26); d.set(23,30,26); d.RM(2,26,6,29,26); d.RM(2,26,6,26,10); }},
  {label:'PSZ-9D Duty Armor', group:'Armour', front(d){ torso(d,1); shadeR(d,15); d.R(12,22,14,25,2); d.R(21,22,23,25,2); d.RM(2,25,8,29,17); d.RM(2,25,8,25,18); d.R(12,27,23,34,34); d.R(12,27,23,27,35); d.R(12,30,23,30,1); d.R(17,27,18,34,1); }},
  {label:'Mercenary Suit', group:'Light suits', front(d){ torso(d,21); for (let y = 24; y < N; y++) for (let x = 2; x < 34; x++) if (d.get(x,y) === 21){ const h = (x*7 + y*13 + ((x*y) % 5)) % 9; if (h === 0 || h === 4) d.set(x,y,20); else if (h === 2) d.set(x,y,22); } d.R(12,24,13,27,34); d.R(22,24,23,27,34); d.R(10,27,25,35,34); d.R(11,30,14,33,35); d.R(21,30,24,33,35); d.R(16,31,19,34,35); }},
  {label:'SEVA-V Suit', group:'Sealed and scientific', hood:true, back(d){ d.S(4,14,17,9); d.S(5,12,17,9); for (let y = 6; y <= 21; y++) d.S(y,10,17,9); d.S(22,11,17,9); d.S(23,12,17,9); d.R(24,6,25,21,8); }, front(d){ torso(d,9); shadeR(d,8); arms(d,8); d.R(13,22,22,25,3); d.R(13,22,22,22,4); d.R(10,28,15,34,10); d.R(20,28,25,34,10); d.R(17,25,18,35,3); }},
  {label:'SSP-99 Ecologist', group:'Sealed and scientific', front(d){ torso(d,28); shadeR(d,27); arms(d,27); d.R(12,22,23,25,32); d.R(12,22,23,22,33); d.R(14,28,21,33,33); d.set(15,29,50); d.set(16,29,29); d.set(17,29,19); for (let y = 25; y <= 31; y++){ d.set(23,y,y%2?31:1); d.set(24,y,y%2?31:1); } }},
  {label:'Exoskeleton', group:'Exoskeletons', front(d){ torso(d,35); for (let y = 27; y < N; y++) d.S(y,1,17,35); d.R(31,28,34,35,34); d.R(11,26,24,34,36); d.R(11,30,24,30,34); d.R(17,26,18,34,34); d.R(10,27,10,35,31); d.R(25,27,25,35,31); d.RM(1,24,9,30,36); d.RM(1,30,9,30,34); d.RM(1,24,1,30,34); d.R(12,22,14,25,34); d.R(21,22,23,25,34); }},
  {label:'PSZ-12V Bulat', group:'Armour', front(d){ torso(d,3); shadeR(d,2); arms(d,2); d.R(12,23,23,25,2); d.R(9,26,26,35,8); d.R(9,30,26,30,2); d.R(9,33,26,33,2); d.RM(2,25,7,30,8); d.RM(2,25,7,25,9); }}
];

// Archetypes for the rest of the S.T.A.L.K.E.R. 2 suits. p = {c: main, C: shade, x: secondary, y: trim}
const camo = (d, c, a, b) => { for (let y = 24; y < N; y++) for (let x = 1; x < 35; x++) if (d.get(x,y) === c){ const h = (x*7 + y*13 + ((x*y) % 5)) % 9; if (h === 0 || h === 4) d.set(x,y,a); else if (h === 2) d.set(x,y,b); } };
const ARCH = {
  jacket:(p) => ({front(d){ torso(d,p.c); shadeR(d,p.C); arms(d,p.C);
    if (p.zip){ d.R(13,23,22,25,p.y); d.R(17,25,18,35,p.C); d.R(16,28,16,30,p.x); d.R(19,28,19,30,p.x); }
    else { d.R(13,24,15,26,p.y); d.R(20,24,22,26,p.y); d.R(16,26,19,35,p.x); d.R(15,27,15,35,p.y); d.R(20,27,20,35,p.y); }
    if (p.vest){ d.R(10,27,25,35,p.vest); d.R(10,27,25,27,p.y); d.R(11,30,14,33,p.C); d.R(21,30,24,33,p.C); }
    if (p.patch){ d.R(4,31,7,34,p.patch); d.R(23,32,25,35,p.patch2 || p.patch); } }}),
  coat:(p) => ({front(d){ torso(d,p.c); shadeR(d,p.C); arms(d,p.C); d.R(12,22,14,26,p.C); d.R(21,22,23,26,p.C); d.R(17,27,18,35,p.C); d.set(16,29,p.y); d.set(16,32,p.y); d.set(19,29,p.y); d.set(19,32,p.y); for (let t = 0; t < 10; t++){ d.set(9 + t, 26 + t, p.x); d.set(10 + t, 26 + t, p.x); } }}),
  light:(p) => ({back(d){ d.R(11,21,24,24,p.C); }, front(d){ torso(d,p.c); if (p.camo) camo(d,p.c,p.C,p.x); shadeR(d,p.C); arms(d,p.C); d.S(24,12,14,p.C); d.S(25,13,15,p.C); d.R(13,25,14,29,p.x); d.R(21,25,22,29,p.x); d.R(9,29,26,29,p.x); [[10,13],[16,19],[22,25]].forEach(([a,b]) => { d.R(a,30,b,33,p.y); d.R(a,30,b,30,p.x); }); }}),
  armor:(p) => ({front(d){ torso(d,p.c); if (p.camo) camo(d,p.c,p.C,p.x); shadeR(d,p.C); arms(d,p.C); d.R(12,23,14,25,p.x); d.R(21,23,23,25,p.x); d.R(10,27,25,34,p.x); d.R(10,27,25,27,p.y); d.R(10,31,25,31,p.C); d.R(17,28,18,34,p.C); d.RM(2,25,7,29,p.x); d.RM(2,25,7,25,p.y); }}),
  heavy:(p) => ({front(d){ torso(d,p.c); if (p.camo) camo(d,p.c,p.C,p.y); shadeR(d,p.C); d.R(12,22,23,25,p.C); d.R(12,22,23,22,p.x); d.R(9,26,26,35,p.x); d.R(9,26,26,26,p.y); d.R(9,30,26,30,p.C); d.R(9,33,26,33,p.C); d.R(17,27,18,35,p.C); d.RM(1,24,8,30,p.x); d.RM(1,24,8,24,p.y); d.RM(1,30,8,30,p.C); }}),
  sealed:(p) => ({hood:true, back(d){ d.S(4,14,17,p.c); d.S(5,12,17,p.c); for (let y = 6; y <= 21; y++) d.S(y,10,17,p.c); d.S(22,11,17,p.c); d.S(23,12,17,p.c); d.R(24,6,25,21,p.C); }, front(d){ torso(d,p.c); shadeR(d,p.C); arms(d,p.C); d.R(13,22,22,25,p.y); d.R(13,22,22,22,p.x); d.R(10,28,15,34,p.x); d.R(20,28,25,34,p.x); d.R(17,25,18,35,p.y); }}),
  lab:(p) => ({hood:true, back(d){ d.S(4,14,17,p.c); d.S(5,12,17,p.c); for (let y = 6; y <= 21; y++) d.S(y,10,17,p.c); d.S(22,11,17,p.c); d.S(23,12,17,p.c); d.R(24,6,25,21,p.C); }, front(d){ torso(d,p.c); shadeR(d,p.C); arms(d,p.C); d.R(12,22,23,25,p.y); d.R(12,22,23,22,33); d.R(14,28,21,33,p.x); d.set(15,29,50); d.set(16,29,29); d.set(17,29,19); d.RM(3,28,6,35,p.x); for (let y = 25; y <= 31; y++){ d.set(23,y,y%2?31:1); d.set(24,y,y%2?31:1); } }}),
  exo:(p) => ({front(d){ torso(d,p.c); for (let y = 27; y < N; y++) d.S(y,1,17,p.c); d.R(31,28,34,35,p.C); d.R(11,26,24,34,p.x); d.R(11,30,24,30,p.C); d.R(17,26,18,34,p.C); d.R(10,27,10,35,p.y); d.R(25,27,25,35,p.y); d.RM(1,24,9,30,p.x); d.RM(1,30,9,30,p.C); d.RM(1,24,1,30,p.C); d.R(12,22,14,25,p.C); d.R(21,22,23,25,p.C); }})
};
[
  ['Leather Jacket','Jackets','jacket',{c:11,C:15,x:31,y:12}],
  ['Armored Bandit Jacket','Jackets','jacket',{c:15,C:1,x:20,y:16,vest:3}],
  ['Tourist Suit','Jackets','jacket',{c:21,C:20,x:23,y:22,zip:true}],
  ['Wanderer Suit','Jackets','coat',{c:13,C:12,x:11,y:30}],
  ['Marauder Suit','Jackets','jacket',{c:12,C:11,x:4,y:13,vest:9,patch:25,patch2:21}],
  ['Mercenary\u2019s Light Suit','Light suits','light',{c:21,C:20,x:34,y:35,camo:true}],
  ['X7 Suit','Light suits','light',{c:2,C:1,x:34,y:35}],
  ['PSZ-5D Universal Protection','Armour','armor',{c:2,C:1,x:34,y:18}],
  ['PSZ-5V Guardian of Freedom','Armour','armor',{c:25,C:24,x:9,y:26}],
  ['PSZ-5I Hawk','Armour','armor',{c:53,C:54,x:3,y:52}],
  ['PSZ-9I Falcon','Armour','heavy',{c:54,C:11,x:53,y:52}],
  ['PSZ-9N Wolfhound','Armour','heavy',{c:55,C:57,x:56,y:51}],
  ['PSZ-20W Convoy','Armour','armor',{c:21,C:20,x:57,y:23}],
  ['PSZ-21W Shturm','Armour','heavy',{c:57,C:20,x:21,y:23}],
  ['PSZ-7 Military Body Armor','Armour','armor',{c:9,C:8,x:61,y:10}],
  ['Berill-5M Armored Suit','Armour','heavy',{c:59,C:8,x:9,y:10,camo:true}],
  ['Corundum Suit','Armour','armor',{c:3,C:2,x:58,y:19}],
  ['Zircon Suit','Armour','armor',{c:31,C:34,x:32,y:33}],
  ['OZK Explorer\u2019s Suit','Sealed and scientific','sealed',{c:59,C:8,x:61,y:3}],
  ['SEVA Suit','Sealed and scientific','sealed',{c:13,C:12,x:14,y:3}],
  ['SEVA-D Suit','Sealed and scientific','sealed',{c:2,C:1,x:17,y:18}],
  ['SEVA-I Suit','Sealed and scientific','sealed',{c:53,C:54,x:30,y:54}],
  ['SSP-100 Discovery','Sealed and scientific','lab',{c:60,C:6,x:28,y:31}],
  ['SSP-100I Survey','Sealed and scientific','lab',{c:52,C:44,x:3,y:31}],
  ['SSP-100M SIRCAA','Sealed and scientific','lab',{c:22,C:21,x:60,y:31}],
  ['Liberty Exoskeleton','Exoskeletons','exo',{c:25,C:24,x:26,y:31}],
  ['Bulwark Exosuit','Exoskeletons','exo',{c:1,C:15,x:17,y:18}],
  ['Brummbar Exoskeleton','Exoskeletons','exo',{c:9,C:8,x:61,y:31}],
  ['Cuirass Exoskeleton','Exoskeletons','exo',{c:21,C:20,x:22,y:31}],
  ['Diamond Exoskeleton','Exoskeletons','exo',{c:33,C:32,x:6,y:36}],
  ['Operator Exoskeleton','Exoskeletons','exo',{c:34,C:1,x:2,y:31}],
  ['Ruby Exosuit','Exoskeletons','exo',{c:58,C:17,x:18,y:31}]
].forEach(([label, group, a, p]) => SUITS.push(Object.assign({label, group}, ARCH[a](p))));
const SUIT_GROUPS = ['Jackets','Light suits','Armour','Sealed and scientific','Exoskeletons'];
const fullMask = (d, c, sh) => { d.S(6,14,17,c); d.S(7,13,17,c); for (let y = 8; y <= 19; y++) d.S(y,12,17,c); d.S(20,13,17,c); d.S(21,14,17,c); for (let y = 11; y <= 17; y++){ d.set(11,y,c); d.set(24,y,c); } d.R(23,8,23,19,sh); d.R(24,11,24,17,sh); };
const dome = (d, c, hi, sh) => { d.S(5,14,17,c); d.S(6,12,17,c); for (let y = 7; y <= 10; y++) d.S(y,11,17,c); d.RM(11,11,12,13,c); d.R(14,6,17,6,hi); d.R(12,7,13,8,hi); d.R(23,6,24,13,sh); };
const strap = d => { d.RM(12,14,12,17,1); d.RM(13,18,13,18,1); d.RM(14,19,14,19,1); };
const HELMETS = [
  {label:'No helmet', note:'', draw(){} },
  {label:'Optician Gas Mask', note:'Loners', hair:true, face:true, draw(d){ fullMask(d,3,2); d.RM(12,11,16,15,1); d.RM(13,12,15,14,42); d.set(13,12,43); d.set(20,12,43); d.R(15,17,20,22,34); d.R(15,18,20,18,35); d.R(15,20,20,20,35); d.R(16,22,19,23,1); }},
  {label:'PG-4 Facehugger', note:'Bandits', draw(d){ d.R(14,16,21,20,1); d.R(15,16,20,16,2); d.R(11,17,13,20,34); d.R(22,17,24,20,34); d.R(11,17,11,20,35); d.R(24,17,24,20,35); d.R(12,15,13,15,1); d.R(22,15,23,15,1); }},
  {label:'Aurora Gas Mask', note:'Duty', hair:true, face:true, draw(d){ fullMask(d,1,15); d.R(13,11,22,14,42); d.R(13,11,16,11,43); d.R(11,17,14,21,34); d.R(11,18,14,18,35); d.R(11,20,14,20,35); d.R(16,17,19,19,2); }},
  {label:'PA-7 Gas Mask', note:'Mercenaries', hair:true, face:true, draw(d){ fullMask(d,2,1); d.RM(12,11,16,14,1); d.RM(13,12,15,13,42); d.set(13,12,43); d.set(20,12,43); d.RM(10,17,13,21,35); d.RM(10,17,13,17,36); d.R(16,18,19,19,1); }},
  {label:'PA-10 Gas Mask', note:'Military', hair:true, face:true, draw(d){ fullMask(d,9,8); d.RM(12,11,16,14,8); d.RM(13,12,15,13,42); d.set(13,12,43); d.set(20,12,43); d.R(15,18,20,22,8); d.R(15,19,20,19,3); d.R(15,21,20,21,3); }},
  {label:'Ballistic Helmet', note:'Military', hair:true, draw(d){ dome(d,8,9,3); strap(d); }},
  {label:'Tactical Helmet', note:'Military', hair:true, draw(d){ dome(d,34,35,1); d.R(12,12,23,14,1); d.RM(13,12,15,13,42); d.set(13,12,43); d.set(20,12,43); d.R(16,4,19,6,1); d.R(17,3,18,3,35); strap(d); }},
  {label:'Mask-1 Helmet', note:'Freedom', hair:true, face:true, draw(d){ dome(d,8,9,3); d.S(11,12,17,4); for (let y = 12; y <= 19; y++) d.S(y,12,17,4); d.S(20,13,17,4); d.S(21,14,17,4); d.R(13,13,16,13,1); d.R(19,13,22,13,1); d.set(16,18,1); d.set(19,18,1); d.set(17,19,1); d.set(18,19,1); d.R(12,12,12,19,5); d.R(23,12,23,19,3); }},
  {label:'Sphere M20 Helmet', note:'Duty', hair:true, face:true, draw(d){ d.S(4,14,17,1); d.S(5,12,17,1); for (let y = 6; y <= 12; y++) d.S(y,11,17,1); d.RM(11,13,11,19,1); d.R(13,5,16,6,2); d.R(13,18,22,21,2); d.R(12,11,23,17,42); d.R(12,11,17,11,43); d.set(13,12,43); d.R(16,19,19,22,34); d.R(16,20,19,20,35); }},
  {label:'Aeroprotection Gas Mask', note:'Ward', hair:true, face:true, draw(d){ d.S(3,14,17,33); d.S(4,12,17,33); for (let y = 5; y <= 12; y++) d.S(y,10,17,33); d.RM(9,13,11,17,32); d.R(13,4,16,4,7); d.R(23,5,25,12,32); d.R(12,9,23,13,44); d.R(12,9,15,9,30); d.R(13,14,22,20,2); d.R(14,21,21,21,2); for (let y = 21; y <= 28; y++){ d.set(17,y,y%2?31:1); d.set(18,y,y%2?31:1); } }}
];
const FACES = [
  {label:'Clean', draw(){}},
  {label:'Stubble', draw(d,k){ const rows = {18:[12,14,21,23],19:[13,22],20:[14,21],21:[15,20]}; for (const y in rows){ const r = rows[y]; for (let x = r[0]; x <= r[r.length-1]; x++){ if (r.length === 4 && x > r[1] && x < r[2]) continue; if (+y === 19 && x >= 16 && x <= 19) continue; if ((x + +y) % 2 === 0) d.set(x,+y,k.hair); } } }},
  {label:'Moustache', draw(d,k){ d.R(15,18,20,18,k.hair); d.set(15,19,k.hair); d.set(20,19,k.hair); }},
  {label:'Beard', draw(d,k){ d.RM(12,16,12,18,k.hair); d.RM(13,18,15,18,k.hair); d.R(15,18,20,18,k.hair); d.RM(13,19,15,19,k.hair); d.S(20,14,17,k.hair); d.S(21,15,17,k.hair); d.S(22,16,17,k.hair); }},
  {label:'Scar', draw(d){ d.set(14,11,19); d.set(14,12,19); d.set(15,13,19); d.set(15,15,19); d.set(16,16,19); }}
];
const FACTIONS = [
  {name:'Loners', c:14, ink:'#17130a', line:'Free stalkers. No banner, no boss, just the Zone.'},
  {name:'Duty', c:19, ink:'#fff', line:'Discipline, and the mission to contain the Zone.'},
  {name:'Freedom', c:26, ink:'#0e100d', line:'The Zone should be open to everyone.'},
  {name:'Monolith', c:33, ink:'#0e100d', line:'Devoted to the Monolith at the heart of the Zone.'},
  {name:'Ward', c:22, ink:'#0e100d', line:'Guards the Zone and the roads into it.'},
  {name:'Spark', c:52, ink:'#17130a', line:'Scar’s people, with their own plans for the Zone.'},
  {name:'Noon', c:51, ink:'#fff', line:'Strider’s veterans on Wild Island.'},
  {name:'Mercenaries', c:50, ink:'#0e100d', line:'Work for whoever pays.'},
  {name:'Bandits', c:31, ink:'#fff', line:'Easy money and quick hands.'},
  {name:'Ecologists', c:28, ink:'#17130a', line:'Study the Zone and pay well for artefacts.'},
  {name:'Clear Sky', era:1, c:23, ink:'#0e100d', line:'Swamp researchers in sky-blue camo who tried to understand the Zone.'},
  {name:'Ukrainian Military', era:1, c:9, ink:'#fff', line:'Held the perimeter, and the checkpoints took bribes.'},
  {name:'SBU', era:1, c:20, ink:'#fff', line:'Ukraine\u2019s security service. Major Degtyarev went in undercover.'},
  {name:'Renegades', era:1, c:12, ink:'#fff', line:'Swamp outcasts at war with Clear Sky.'},
  {name:'MSOP', era:0, c:61, ink:'#fff', line:'Joint military forces guarding the Zone\u2019s restricted sites.'},
  {name:'SIRCAA', era:0, c:60, ink:'#0e100d', line:'The state research institute run by Dr. Dalin.'},
  {name:'Corps', era:0, c:36, ink:'#0e100d', line:'A little-known group whose patches turn up in the Zone.'},
  {name:'Zombified', era:0, c:4, ink:'#fff', line:'Stalkers whose minds the Zone burned out.'}
];
const FACTION_ERAS = ['In S.T.A.L.K.E.R. 2', 'From the earlier games'];

/* ---------- artefacts (from the S.T.A.L.K.E.R. 2 artifact list) ---------- */
const TYPES = {
  electro:{label:'Electro', pal:['#123a5a','#2f7fc0','#8fd3ff','#f0ffff'], spikes:true},
  thermal:{label:'Thermal', pal:['#5a1a08','#c4471a','#f59a2c','#ffe39a']},
  gravi:{label:'Gravitational', pal:['#2a2238','#5d4a7a','#9c86c0','#e8dcff'], quad:true},
  acid:{label:'Acid', pal:['#24400f','#5e8f1f','#a8d43a','#efffb0'], drip:true},
  chem:{label:'Chemical', pal:['#3d3510','#8a7a22','#d1bd4a','#fff3b0'], drip:true},
  altered:{label:'Altered', pal:['#3a0f2e','#8a2a6e','#d65ab0','#ffd6f2'], quad:true, spikes:true}
};
const RAR = [{n:'Common',v:150},{n:'Uncommon',v:400},{n:'Rare',v:900},{n:'Legendary',v:2500}];
const ART = [
  ['Battery','electro',0,'Doesn’t burn on contact. A small boost to endurance.'],
  ['Flash','electro',0,'Its powder keeps discharging long after pickup.'],
  ['Snowflake','electro',0,'Leaves phantom shocks in your fingers.'],
  ['Chocolate Bar','electro',0,'Weak electric and radiation protection.'],
  ['Sparkler','electro',0,'Used in ultra-high-capacity batteries.'],
  ['Harp','electro',1,'Weak electric protection, steady radiation shielding.'],
  ['Moonlight','electro',1,'Pretty enough to become an obsession.'],
  ['Soul','electro',1,'Almost impossible to destroy.'],
  ['Lantern','electro',1,'Glows so bright even the blind can see it.'],
  ['Glare','electro',2,'Strong protection, but you won’t sleep.'],
  ['Starfish','electro',2,'Medium protection from bleeding and radiation.'],
  ['Thunderberry','electro',3,'Maximum endurance and radiation protection.'],
  ['Spinner','thermal',0,'Its sparks change colour outside the Zone.'],
  ['Fireball','thermal',0,'Cold to the touch despite the fire inside.'],
  ['Eye','thermal',0,'Weak thermal protection. Some say it watches.'],
  ['Steak','thermal',0,'Burns your skin if you hold it too long.'],
  ['Flaw','thermal',1,'Looks red-hot, feels barely warm.'],
  ['Mama’s Beads','thermal',1,'Valued mostly as jewellery.'],
  ['Plasma','thermal',1,'Medium thermal and radiation protection.'],
  ['Petal','thermal',2,'Never burns, even bare-handed.'],
  ['Torch','thermal',2,'Its flame stays lit in a vacuum.'],
  ['Hypercube','thermal',3,'Emits long-wave radio. Nobody knows why.'],
  ['Jellyfish','gravi',0,'Attracts or repels radioactive particles.'],
  ['Stone Blood','gravi',0,'A dark lump with no known effect.'],
  ['Gravi','gravi',0,'So dense only plasma tools can cut it.'],
  ['Goldfish','gravi',1,'Sinks in salt water, floats in distilled.'],
  ['Crown','gravi',1,'Fetches a fortune on the black market.'],
  ['Spring','gravi',1,'Keeps its compression cycle under any load.'],
  ['Night Star','gravi',2,'Brittle needles. Disinfect any puncture.'],
  ['Magic Cube','gravi',2,'Turns transparent under infrared light.'],
  ['Compass','gravi',3,'Maximum physical and radiation protection.'],
  ['Slime','acid',0,'Curls into a spiral when the temperature swings.'],
  ['Thorn','acid',0,'Fractal needles. Weak radiation protection.'],
  ['Bubble','acid',0,'Holds a liquid like a Fruit Punch anomaly.'],
  ['Urchin','acid',1,'Its needles grow in salt water.'],
  ['Devil’s Mushroom','acid',2,'Highly toxic if eaten. Don’t.'],
  ['Liquid Rock','acid',3,'Eases migraines while carried.'],
  ['Kolobok','chem',1,'Slips from your grip and leaves small wounds.'],
  ['Tourist’s Breakfast','chem',1,'Smells foul. Handle with a gas mask.'],
  ['Skipjack','chem',2,'Reeks of ammonia.'],
  ['Pellicle','chem',2,'Long thought to be a myth.'],
  ['Weird Ball','altered',3,'Stops bullets best when you stand still.'],
  ['Weird Water','altered',3,'Eases radiation, with spells of weakness.'],
  ['Weird Flower','altered',3,'Masks your scent while you sleep.']
].map(([name,type,r,line]) => ({name,type,r,line}));
const ARTBY = Object.fromEntries(ART.map(a => [a.name, a]));

/* ---------- helpers ---------- */
function rng(seed){ let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const uid = () => Math.random().toString(36).slice(2, 10);
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

/* ---------- portrait composition ---------- */
function compose(p){
  const g = new Int8Array(N * N).fill(-1);
  const set = (x, y, c) => { if (x >= 0 && x < N && y >= 0 && y < N && c >= 0) g[y * N + x] = c; };
  const R = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c); };
  const d = {set, R, get:(x, y) => g[y * N + x],
    S:(y, x0, x1, c) => { for (let x = x0; x <= x1; x++){ set(x, y, c); set(N - 1 - x, y, c); } },
    RM:(x0, y0, x1, y1, c) => { R(x0, y0, x1, y1, c); R(N - 1 - x1, y0, N - 1 - x0, y1, c); }};
  const L = p.look, s = SKINS[L.skin], k = {s, d:SKD[s], dd:SKDD[s], hair:HAIRS[L.hairC]};
  const suit = SUITS[L.suit], helmet = HELMETS[L.helmet];
  if (suit.back) suit.back(d);
  // head
  d.S(7,14,17,k.s); d.S(8,13,17,k.s); for (let y = 9; y <= 18; y++) d.S(y,12,17,k.s); d.S(19,13,17,k.s); d.S(20,14,17,k.s); d.S(21,15,17,k.s);
  if (!suit.hood){ for (let y = 13; y <= 16; y++){ set(11,y,k.s); set(24,y,k.s); } R(11,14,11,15,k.d); R(24,14,24,15,k.d); }
  R(23,9,23,18,k.d); set(22,19,k.d); set(21,20,k.d);
  R(15,22,20,26,k.s); R(15,22,20,22,k.d); R(20,23,20,26,k.d);
  R(13,12,15,12,k.hair); R(20,12,22,12,k.hair);
  R(14,14,15,14,1); R(20,14,21,14,1); set(13,14,k.d); set(22,14,k.d);
  set(18,15,k.d); set(18,16,k.d); set(17,17,k.d); set(18,17,k.d);
  R(16,19,19,19,k.dd);
  if (!suit.hood && !helmet.hair){ d.S(6,14,17,k.hair); d.S(7,13,17,k.hair); d.S(8,12,17,k.hair); d.S(9,12,13,k.hair); d.S(10,12,12,k.hair); }
  if (!helmet.face) FACES[L.face].draw(d, k);
  suit.front(d);
  R(26,26,30,30,1); R(27,27,29,29,FACTIONS[L.faction].c);
  helmet.draw(d);
  // hand-painted layer: '.' = untouched, '_' = erased, otherwise a palette colour
  if (p.paint && p.paint.length === N * N) for (let i = 0; i < N * N; i++){ const ch = p.paint[i]; if (ch === '.') continue; if (ch === '_'){ g[i] = -1; continue; } const v = CH.indexOf(ch); if (v >= 0 && v < PAL.length) g[i] = v; }
  return g;
}
// Turns an old full-picture drawing into a layer of differences from the gear.
function paintFromCustom(custom, look){
  if (!custom || custom.length !== N * N) return null;
  const base = compose({look});
  let out = '', any = false;
  for (let i = 0; i < N * N; i++){ const v = CH.indexOf(custom[i]), c = v >= 0 && v < PAL.length ? v : -1; if (c === base[i]) out += '.'; else { out += c < 0 ? '_' : CH[c]; any = true; } }
  return any ? out : null;
}
const toStr = g => Array.from(g, v => v < 0 ? '.' : CH[v]).join('');

function draw(cv, g, outline, size){
  size = size || N;
  const ctx = cv.getContext('2d'), pad = outline ? 1 : 0;
  ctx.clearRect(0, 0, cv.width, cv.height);
  const at = (x, y) => x < 0 || y < 0 || x >= size || y >= size ? -1 : g[y * size + x];
  if (outline){
    ctx.fillStyle = '#0d0f0c';
    for (let y = -1; y <= size; y++) for (let x = -1; x <= size; x++)
      if (at(x, y) < 0 && (at(x-1,y) >= 0 || at(x+1,y) >= 0 || at(x,y-1) >= 0 || at(x,y+1) >= 0)) ctx.fillRect(x + pad, y + pad, 1, 1);
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++){ const v = g[y * size + x]; if (v >= 0){ ctx.fillStyle = PAL[v]; ctx.fillRect(x + pad, y + pad, 1, 1); } }
}
const portrait = (p, px) => { const c = canvas(N + 2, N + 2); draw(c, compose(p), true); if (px){ c.style.width = px + 'px'; c.style.height = px + 'px'; } return c; };

/* ---------- artefact icons ---------- */
const ICONS = {};
function artGrid(a){
  if (ICONS[a.name]) return ICONS[a.name];
  const S = 12, t = TYPES[a.type], r = rng(hash(a.name)), g = new Int8Array(S * S).fill(-1);
  const put = (x, y, v) => { const m = [[x,y],[S-1-x,y]]; if (t.quad){ m.push([x,S-1-y],[S-1-x,S-1-y]); } m.forEach(([u,w]) => { if (u >= 0 && u < S && w >= 0 && w < S) g[w * S + u] = v; }); };
  const yMax = t.quad ? 6 : S;
  for (let y = 0; y < yMax; y++) for (let x = 0; x < 6; x++){
    const dd = Math.hypot(x - 5.5, y - 5.5), p = dd < 2.6 ? 1 : dd < 3.8 ? .7 : dd < 5 ? .3 : 0;
    if (r() < p){ let v = 1; if (y < 5 && r() < .45) v = 2; if (x + y > 12 && r() < .5) v = 0; if (r() < .07) v = 3; put(x, y, v); }
  }
  if (t.spikes){ const arms = 2 + Math.floor(r() * 3); for (let i = 0; i < arms; i++){ const dx = [0,1,1][i % 3], dy = [1,1,0][i % 3]; for (let s = 3; s < 6; s++) if (r() < .85) put(Math.round(5.5 - dx * s), Math.round(5.5 - dy * s), s === 5 ? 3 : 2); } }
  if (t.drip){ for (let x = 2; x < 6; x++) if (r() < .35){ let y = S - 1; while (y > 0 && g[y * S + x] < 0) y--; if (y < S - 2){ put(x, y + 1, 1); if (r() < .5) put(x, y + 2, 0); } } }
  g[5 * S + 5] = g[5 * S + 6] = 3; g[6 * S + 5] = g[6 * S + 6] = 2;
  return ICONS[a.name] = g;
}
function artIcon(a, px){
  const g = artGrid(a), S = 12, t = TYPES[a.type], c = canvas(S + 2, S + 2), ctx = c.getContext('2d');
  const at = (x, y) => x < 0 || y < 0 || x >= S || y >= S ? -1 : g[y * S + x];
  ctx.fillStyle = '#0d0f0c';
  for (let y = -1; y <= S; y++) for (let x = -1; x <= S; x++) if (at(x,y) < 0 && (at(x-1,y) >= 0 || at(x+1,y) >= 0 || at(x,y-1) >= 0 || at(x,y+1) >= 0)) ctx.fillRect(x + 1, y + 1, 1, 1);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++){ const v = g[y * S + x]; if (v >= 0){ ctx.fillStyle = t.pal[v]; ctx.fillRect(x + 1, y + 1, 1, 1); } }
  if (px){ c.style.width = px + 'px'; c.style.height = px + 'px'; }
  return c;
}
const rarColor = r => ['var(--r0)','var(--r1)','var(--r2)','var(--r3)'][r];


function randomLook(r){ const pick = n => Math.floor(r() * n); return {skin:pick(SKINS.length), hairC:pick(HAIRS.length), face:pick(FACES.length), helmet:pick(HELMETS.length), suit:pick(SUITS.length), faction:pick(FACTIONS.length)}; }
function randomArt(r, maxR){ const pool = ART.filter(a => a.r <= maxR); const w = pool.map(a => [8,4,2,1][a.r]); let t = r() * w.reduce((s, v) => s + v, 0); for (let i = 0; i < pool.length; i++){ t -= w[i]; if (t <= 0) return pool[i].name; } return pool[0].name; }
function fixLook(L){ L = Object.assign({}, L || {}); const lim = (k, n) => { if (!(Number.isInteger(L[k]) && L[k] >= 0 && L[k] < n)) L[k] = 0; }; lim('skin',SKINS.length); lim('hairC',HAIRS.length); lim('face',FACES.length); lim('helmet',HELMETS.length); lim('suit',SUITS.length); lim('faction',FACTIONS.length); return L; }
export { FACTION_ERAS, SUIT_GROUPS, paintFromCustom, N, PAL, CH, SKINS, HAIRS, SUITS, HELMETS, FACES, FACTIONS, TYPES, RAR, ART, ARTBY, rng, hash, uid, compose, toStr, draw, portrait, artIcon, rarColor, randomLook, randomArt, fixLook };

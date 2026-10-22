// Bar cards for the five artefacts, in English and Russian (same text as the printed cards).
const ICONS = {
  'Battery': '<rect x="22" y="10" width="32" height="58" rx="6"/><line x1="22" y1="26" x2="54" y2="26"/><line x1="22" y1="40" x2="54" y2="40"/><line x1="22" y1="54" x2="54" y2="54"/><path d="M44 14 L34 34 L44 34 L32 62" stroke="var(--c)" stroke-width="4"/>',
  'Meat Chunk': '<path d="M12 44 C8 30 20 16 36 18 C50 12 68 22 64 38 C70 50 58 64 42 60 C28 68 12 60 12 44 Z"/><path d="M24 36 C30 30 36 42 44 34 C50 28 54 40 58 36" stroke="var(--c)"/><path d="M22 50 C30 46 38 54 48 48" stroke="var(--c)"/>',
  'Bubble': '<circle cx="32" cy="42" r="18"/><circle cx="52" cy="28" r="12"/><circle cx="54" cy="54" r="9"/><circle cx="20" cy="20" r="7" stroke="var(--c)"/><circle cx="26" cy="36" r="3" stroke="var(--c)"/>',
  'Wrenched': '<path d="M26 68 C22 56 50 52 46 40 C42 28 18 30 24 18 C28 10 44 10 48 6"/><path d="M40 68 C36 58 60 52 58 40 C56 30 32 28 36 18 C38 12 52 12 56 8"/><path d="M30 30 L52 26 M28 50 L48 46" stroke="var(--c)"/>',
  'Spring': '<rect x="12" y="8" width="52" height="8" rx="2"/><rect x="12" y="60" width="52" height="8" rx="2"/><path d="M20 22 C56 22 56 30 20 30 C56 30 56 38 20 38 C56 38 56 46 20 46 C56 46 56 54 20 54" stroke="var(--c)"/>'
};

export const COCKTAILS = {
  'Battery': { color: '#2f7fc0',
    en: { name: 'Battery', type: 'Electro · Common', tagline: 'Stored energy in a glass. It crackles when you sip.',
      rows: [['40 ml', 'vodka'], ['10 ml', 'lime juice'], ['120 ml', 'Non-Stop energy drink'], ['10 ml', 'blue curaçao, floated on top']],
      clean: 'Same, without the vodka. Use blue curaçao syrup for the float.',
      build: 'Rim the glass with lime and popping candy. Fill with ice, add vodka, lime and Non-Stop, then pour the blue curaçao slowly over a spoon so it sinks through the yellow like a discharge.',
      price: '1 × Battery', foot: 'One per stalker: energy drink hides the vodka.' },
    ru: { name: 'Батарейка', type: 'Электра · обычный', tagline: 'Запас энергии в стакане. Трещит, когда пьёшь.',
      rows: [['40 мл', 'водка'], ['10 мл', 'сок лайма'], ['120 мл', 'энергетик Non-Stop'], ['10 мл', 'ликёр блю кюрасао, слоем сверху']],
      clean: 'То же без водки, а вместо ликёра — сироп блю кюрасао.',
      build: 'Край стакана — в лайм и шипучие конфеты (Pop Rocks). Лёд, водка, лайм и Non-Stop, затем медленно влить блю кюрасао по ложке: синий опустится сквозь жёлтый, как разряд.',
      price: '1 × Батарейка', foot: 'Одна на сталкера: энергетик прячет водку.' } },
  'Meat Chunk': { color: '#a3322a',
    en: { name: 'Meat Chunk', type: 'Acid · Common', tagline: 'Vodka and sausage. The most stalker drink there is.',
      rows: [['40 ml', 'vodka'], ['120 ml', 'tomato juice'], ['10 ml', 'lemon juice'], ['10 ml', 'pickle brine'], ['dash', 'Worcestershire, Tabasco, salt, pepper, horseradish']],
      clean: 'Same, without the vodka. The brine and spice carry it.',
      build: 'Stir everything with ice in the glass. Garnish with a skewer: a chunk of smoked sausage or kabanos and a pickled gherkin.',
      price: '1 × Meat Chunk', foot: 'Eat the garnish. Not the artefact.' },
    ru: { name: 'Ломоть мяса', type: 'Кислотный · обычный', tagline: 'Водка и колбаса. Самый сталкерский напиток из всех.',
      rows: [['40 мл', 'водка'], ['120 мл', 'томатный сок'], ['10 мл', 'лимонный сок'], ['10 мл', 'огуречный рассол'], ['щепоть', 'вустерский соус, табаско, соль, перец, хрен']],
      clean: 'То же без водки. Рассол и специи вытянут вкус.',
      build: 'Размешать всё со льдом прямо в стакане. Украсить шпажкой: кусок копчёной колбасы или кабанос и маринованный огурчик.',
      price: '1 × Ломоть мяса', foot: 'Закуску съесть. Артефакт — нет.' } },
  'Bubble': { color: '#5e7d17',
    en: { name: 'Bubble', type: 'Acid · Common', tagline: 'It holds a liquid like a Fruit Punch anomaly. So: fruit punch.',
      rows: [['40 ml', 'white rum'], ['80 ml', 'multifruit juice'], ['10 ml', 'lime juice'], ['80 ml', 'Zhivchik, to top']],
      clean: '100 ml multifruit juice and 10 ml lime juice, topped with Zhivchik.',
      build: 'Pour over ice, top with Zhivchik and stir once. Drop in popping boba, or frozen green grapes, as the bubbles. Easy to make by the jug.',
      price: '1 × Bubble', foot: 'Mildly acidic. Perfectly safe.' },
    ru: { name: 'Пузырь', type: 'Кислотный · обычный', tagline: 'Внутри жидкость, как в аномалии «Фруктовый пунш». Значит — фруктовый пунш.',
      rows: [['40 мл', 'белый ром'], ['80 мл', 'мультифруктовый сок'], ['10 мл', 'сок лайма'], ['80 мл', '«Живчик», долить сверху']],
      clean: '100 мл мультифруктового сока и 10 мл сока лайма, долить «Живчиком».',
      build: 'Налить на лёд, долить «Живчик» и один раз размешать. Бросить шарики бабл-ти или замороженный зелёный виноград — это пузыри. Легко сделать сразу кувшином.',
      price: '1 × Пузырь', foot: 'Слегка кислотный. Совершенно безопасен.' } },
  'Wrenched': { color: '#9a5a1c',
    en: { name: 'Wrenched', type: 'Gravitational · Common', tagline: 'Warm when it’s cold, cool when it’s hot. Ice cold, then the heat comes.',
      rows: [['40 ml', 'Nemiroff Honey Pepper'], ['15 ml', 'lemon juice'], ['60 ml', 'Zhivchik'], ['top', 'ginger beer']],
      clean: 'Swap the horilka for 10 ml ginger shot or ginger syrup and a pinch of chilli.',
      build: 'Twist a long strip of orange peel into a corkscrew and coil it down the inside of the glass. Add ice, horilka, lemon and Zhivchik, then top with ginger beer.',
      price: '1 × Wrenched', foot: 'Contains chilli. You were warned.' },
    ru: { name: 'Выверт', type: 'Гравитационный · обычный', tagline: 'Тёплый в холод, прохладный в жару. Сначала ледяной, потом приходит жар.',
      rows: [['40 мл', 'Nemiroff «Медовая с перцем»'], ['15 мл', 'лимонный сок'], ['60 мл', '«Живчик»'], ['долить', 'имбирное пиво']],
      clean: 'Вместо горилки — 10 мл имбирного шота или сиропа и щепоть чили.',
      build: 'Скрутить длинную полоску апельсиновой цедры штопором и пустить её спиралью по стенке стакана. Лёд, горилка, лимон и «Живчик», сверху — имбирное пиво.',
      price: '1 × Выверт', foot: 'Внутри чили. Тебя предупредили.' } },
  'Spring': { color: '#b8361f',
    en: { name: 'Spring', type: 'Gravitational · Uncommon', tagline: 'Layers held apart by gravity, with a coil inside. The rare one.',
      rows: [['15 ml', 'grenadine, at the bottom'], ['40 ml', 'vodka or tequila'], ['100 ml', 'multifruit juice'], ['splash', 'Zhivchik, on top']],
      clean: 'Same, without the vodka or tequila.',
      build: 'Grenadine first. Fill with ice, then pour the spirit and multifruit mix very slowly over the back of a spoon so it floats. Finish with Zhivchik and stand a spiral of lemon or cucumber peel in the glass.',
      price: '1 × Spring', foot: 'Don’t stir. Admire first.' },
    ru: { name: 'Пружина', type: 'Гравитационный · необычный', tagline: 'Слои, которые держит гравитация, и спираль внутри. Редкий артефакт.',
      rows: [['15 мл', 'гренадин, на дно'], ['40 мл', 'водка или текила'], ['100 мл', 'мультифруктовый сок'], ['чуть', '«Живчик», сверху']],
      clean: 'То же без водки и текилы.',
      build: 'Сначала гренадин. Лёд, затем очень медленно влить смесь спирта и сока по обратной стороне ложки, чтобы она легла слоем. Сверху «Живчик» и спираль из лимонной или огуречной кожуры.',
      price: '1 × Пружина', foot: 'Не мешать. Сначала полюбоваться.' } }
};

const LABELS = {
  en: { head: 'Zone Bar · Artefact recipe', stalker: 'Stalker’s version', clean: 'Clean version · no alcohol', build: 'Build', price: 'Price' },
  ru: { head: 'Бар «Зона» · рецепт', stalker: 'Для сталкера', clean: 'Чистый · без алкоголя', build: 'Как собрать', price: 'Цена' }
};

function el(tag, cls, text){ const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }

function cardFor(key, lang){
  const c = COCKTAILS[key], t = c[lang], L = LABELS[lang];
  const card = el('article', 'bc bc-' + lang); card.lang = lang; card.style.setProperty('--c', c.color);
  const top = el('div', 'bc-top'); top.append(el('span', '', L.head), el('span', 'bc-type', t.type));
  const hero = el('div', 'bc-hero');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 76 76'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('class', 'bc-icon');
  svg.innerHTML = ICONS[key];
  const titles = el('div'); titles.append(el('h2', 'bc-name', t.name), el('p', 'bc-tag', t.tagline));
  hero.append(svg, titles);
  const sec = (h, body) => { const s = el('section', 'bc-sec'); s.append(el('h3', '', h)); s.append(body); return s; };
  const rows = el('div', 'bc-rows'); t.rows.forEach(([a, b]) => rows.append(el('b', '', a), el('span', '', b)));
  const s1 = sec(L.stalker, rows); s1.classList.add('bc-rule');
  const foot = el('div', 'bc-foot');
  const price = el('div'); price.append(el('small', '', L.price), el('strong', '', t.price));
  foot.append(price, el('p', '', t.foot));
  card.append(top, hero, s1, sec(L.clean, el('p', '', t.clean)), sec(L.build, el('p', '', t.build)), foot);
  return card;
}

export function showCocktail(key){
  if (!COCKTAILS[key]) return;
  const box = document.getElementById('cocktail'), cards = document.getElementById('cocktailCards');
  cards.replaceChildren(cardFor(key, 'en'), cardFor(key, 'ru'));
  box.hidden = false;
  document.getElementById('cocktailClose').focus();
}
export function hideCocktail(){ document.getElementById('cocktail').hidden = true; }

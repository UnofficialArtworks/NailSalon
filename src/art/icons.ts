export interface Layer {
  path: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}
const pink = '#f0769b',
  gold = '#edbd54',
  mint = '#77ba99',
  blue = '#7abdd6',
  ink = '#554158',
  cream = '#fff7db';
const heart = 'M32 54C22 46 6 36 6 22C6 7 24 4 32 18C40 4 58 7 58 22C58 36 42 46 32 54Z';
const star = 'M32 3L40 22L61 24L45 38L50 59L32 48L14 59L19 38L3 24L24 22Z';
const circle = 'M32 4A28 28 0 1 0 32 60A28 28 0 1 0 32 4Z';
const flower =
  'M32 26C13 8 16 0 26 3C34-7 47 7 37 24C57 8 67 20 52 31C68 46 54 58 37 39C47 62 28 70 27 44C10 62 0 47 22 34C-5 31 5 11 27 27Z';
const leaf = 'M9 54Q1 6 57 7Q59 55 9 54Z';
const shapes: Layer[][] = [
  [{ path: heart, fill: pink }],
  [{ path: star, fill: gold }],
  [
    { path: flower, fill: cream },
    { path: 'M32 23A9 9 0 1 0 32 41A9 9 0 1 0 32 23Z', fill: gold },
  ],
  [
    { path: 'M31 33C-12-12 0 63 29 40C10 71 60 71 35 40C70 62 77-12 33 33Z', fill: '#b998d8' },
    { path: 'M29 22H35V49H29Z', fill: ink },
  ],
  [{ path: 'M46 5A28 28 0 1 0 57 45A25 25 0 0 1 46 5Z', fill: gold }],
  [
    { path: star, fill: gold },
    { path: 'M32 14A18 18 0 1 0 32 50A18 18 0 1 0 32 14Z', fill: '#ffda78' },
  ],
  [
    { path: 'M4 51A28 28 0 0 1 60 51H51A19 19 0 0 0 13 51Z', fill: pink },
    { path: 'M13 51A19 19 0 0 1 51 51H43A11 11 0 0 0 21 51Z', fill: gold },
    { path: 'M21 51A11 11 0 0 1 43 51H37A5 5 0 0 0 27 51Z', fill: blue },
  ],
  [
    { path: 'M17 39Q26 15 43 9Q36 32 48 40', fill: 'none', stroke: mint },
    {
      path: 'M16 30A14 14 0 1 0 16 58A14 14 0 1 0 16 30ZM48 30A14 14 0 1 0 48 58A14 14 0 1 0 48 30Z',
      fill: pink,
    },
  ],
  [
    { path: 'M9 20Q32 9 55 20Q51 43 32 59Q13 43 9 20Z', fill: pink },
    { path: 'M12 20L24 9L32 18L43 8L53 20Z', fill: mint },
    { path: 'M22 30L24 34M39 30L41 34M29 43L31 47', fill: 'none', stroke: cream },
  ],
  [
    { path: 'M30 31Q-9-6 6 54L30 37L34 37L58 54Q74-6 34 31Z', fill: pink },
    { path: 'M27 25H38V43H27Z', fill: '#d55683' },
  ],
  [
    {
      path: 'M32 28C21 25 10 41 14 51Q32 58 50 51C54 41 43 25 32 28ZM12 7A7 10 0 1 0 12 27A7 10 0 1 0 12 7ZM27 1A7 10 0 1 0 27 21A7 10 0 1 0 27 1ZM43 3A7 10 0 1 0 43 23A7 10 0 1 0 43 3ZM57 13A6 9 0 1 0 57 31A6 9 0 1 0 57 13Z',
      fill: ink,
    },
  ],
  [
    { path: circle, fill: gold },
    { path: 'M19 23L19 28M45 23L45 28M18 38Q32 54 46 38', fill: 'none', stroke: ink },
  ],
  [{ path: 'M35 2L9 36H28L22 62L56 23H35Z', fill: gold }],
  [{ path: 'M14 51C-5 50 0 28 15 29C13 8 39 1 46 25C66 19 77 49 53 51Z', fill: blue }],
  [
    { path: leaf, fill: mint },
    { path: 'M12 51L47 18M24 39L20 22M34 29L48 32', fill: 'none', stroke: '#4e9373' },
  ],
  [
    { path: 'M23 26H41L44 58H20Z', fill: cream },
    { path: 'M3 31Q5-5 32 3Q59-5 61 31Z', fill: pink },
    {
      path: 'M18 13A4 4 0 1 0 18 21A4 4 0 1 0 18 13ZM42 9A5 5 0 1 0 42 19A5 5 0 1 0 42 9Z',
      fill: cream,
    },
  ],
  [
    {
      path: 'M32 4V60M8 18L56 46M8 46L56 18M24 9L32 17L40 9M24 55L32 47L40 55M8 28L18 26L18 16M46 48L46 38L56 36',
      fill: 'none',
      stroke: blue,
    },
  ],
  [
    {
      path: 'M24 48V13L53 5V42M24 13L53 5V16L24 24ZM14 39A10 8 0 1 0 14 55A10 8 0 1 0 14 39ZM43 33A10 8 0 1 0 43 49A10 8 0 1 0 43 33Z',
      fill: '#ad86ca',
      stroke: '#ad86ca',
    },
  ],
  [
    { path: 'M13 9H51L62 28L32 60L2 28Z', fill: blue },
    { path: 'M13 9L24 28L32 60L40 28L51 9M2 28H62', fill: 'none', stroke: cream },
  ],
  [
    { path: circle, fill: '#b79bd8' },
    { path: 'M2 44Q24 30 60 19Q77 28 39 43Q0 61 2 44Z', fill: 'none', stroke: gold },
  ],
  [
    { path: 'M8 53L3 14L21 28L32 5L43 28L61 14L56 53Z', fill: gold },
    { path: 'M12 44H52', fill: 'none', stroke: '#fff4c7' },
  ],
  [
    { path: 'M32 55Q-4 40 6 17Q18-2 32 14Q46-2 58 17Q68 40 32 55Z', fill: pink },
    { path: 'M32 53V16M32 53L16 16M32 53L48 16', fill: 'none', stroke: cream },
  ],
  [
    {
      path: 'M31 31C-6 34 0-4 31 18C28-13 66-2 46 29C82 28 67 67 39 46C42 80 1 62 22 42Z',
      fill: mint,
    },
  ],
  [
    { path: 'M31 1Q42 19 44 22L48 12Q75 51 34 61Q-1 61 12 31L24 41Q24 16 31 1Z', fill: '#f9a25e' },
    { path: 'M32 31Q53 56 32 60Q13 55 32 31Z', fill: gold },
  ],
  [
    { path: 'M2 31Q20 5 32 19Q44 5 62 31Q48 62 32 51Q16 62 2 31Z', fill: pink },
    { path: 'M5 31Q32 39 59 31', fill: 'none', stroke: '#b84971' },
  ],
  [
    { path: 'M7 28L5 4L24 15Q32 10 40 15L59 4L57 28Q70 63 32 61Q-6 63 7 28Z', fill: gold },
    { path: 'M20 31V35M44 31V35M27 43L32 47L37 43M13 44H2M51 44H62', fill: 'none', stroke: ink },
  ],
  [
    {
      path: 'M25 60V14Q32-2 39 14V32H47V23Q56 10 61 23V36Q60 47 39 45V60ZM25 43Q2 46 3 32V25Q10 12 16 25V31H25Z',
      fill: mint,
    },
  ],
  [
    { path: 'M30 29Q1-6 4 21Q4 34 25 34M35 29Q64-6 60 21Q60 34 40 34', fill: blue },
    { path: 'M32 25A18 18 0 1 0 32 61A18 18 0 1 0 32 25Z', fill: gold },
    { path: 'M17 37H48M17 48H48', fill: 'none', stroke: ink },
  ],
  [
    { path: 'M32 3A22 25 0 1 0 32 53A22 25 0 1 0 32 3Z', fill: pink },
    { path: 'M32 52L29 58H35ZM32 58Q19 61 28 64', fill: 'none', stroke: ink },
  ],
  [
    { path: 'M32 60V32M32 53Q4 48 8 31Q30 34 32 53', fill: 'none', stroke: mint },
    { path: 'M12 5L25 15L32 3L39 15L52 5V25Q32 55 12 25Z', fill: pink },
  ],
];
const petal = '#fffaf0',
  berry = '#f4498b',
  purple = '#a16ce0',
  teal = '#45c7b5';
const fill = (path: string, color: string): Layer => ({ path, fill: color });
const line = (path: string, color = ink, width = 2.5): Layer => ({
  path,
  fill: 'none',
  stroke: color,
  strokeWidth: width,
});
const dot = (x: number, y: number, r: number, color: string): Layer =>
  fill(`M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`, color);
const gleam = (path: string) => line(path, '#fffaf0', 3);

// Original miniature illustrations, kept inside the 64px sticker sheet.
const refined: Record<number, Layer[]> = {
  30: [
    fill('M8 51Q25 12 53 12Q26 28 16 57Z', '#8acfea'),
    fill('M7 47Q29 22 51 16Q29 34 17 55Z', '#f8abd7'),
    fill('M44 4L49 14L60 16L52 24L54 36L43 30L33 36L35 24L27 16L39 14Z', gold),
    gleam('M41 13L43 10'),
    dot(12, 22, 2, cream),
    dot(26, 48, 2, gold),
  ],
  31: [
    line('M12 55L42 22', '#9e70d5', 8),
    line('M14 53L39 25', '#f7bded', 2),
    fill('M44 3L48 14L60 17L50 24L49 37L40 28L28 31L33 20L27 10L39 12Z', gold),
    gleam('M40 17L44 13'),
    line('M9 17V25M5 21H13M56 43V51M52 47H60', '#80cbe0', 3),
  ],
  32: [
    fill(heart, '#f28bae'),
    fill('M10 28Q32 8 54 28V35Q32 17 10 35Z', '#ffd76f'),
    fill('M12 35Q32 18 52 35L47 41Q32 27 17 41Z', '#92dec1'),
    fill('M17 41Q32 28 47 41L41 47Q32 38 23 47Z', '#8ccbe9'),
    gleam('M13 19Q16 11 23 13'),
  ],
  33: [
    fill('M13 35H51L45 58H19Z', '#ae8de3'),
    line('M24 41L26 54M33 41V54M42 41L40 54', '#e4cbff', 2),
    fill('M8 35Q2 24 17 22Q12 9 27 12Q33 1 39 13Q54 10 49 22Q63 25 56 35Z', '#ffb6da'),
    dot(33, 10, 5, '#ef6393'),
    gleam('M14 27Q15 24 20 25'),
    line('M27 21L30 24M40 26L43 23M23 31H26', '#fff8d0', 2),
  ],
  34: [
    fill('M8 57V26H17V20H23V57ZM41 57V20H47V26H56V57ZM20 57V35H44V57Z', '#f4cb7b'),
    fill('M26 57V48Q32 37 38 48V57Z', '#bd8755'),
    line('M7 58H58M17 32H23M41 32H48', '#e1ac57', 3),
    line('M32 35V6', '#9c71bf', 2),
    fill('M33 6L50 13L33 21Z', '#f187bc'),
    gleam('M12 35V48'),
  ],
  35: [
    fill('M23 43L16 55L17 35L25 25ZM41 43L48 55L47 35L39 25Z', '#a886dc'),
    fill('M25 45L32 61L39 45Z', '#ffd362'),
    fill('M29 45L32 55L35 45Z', '#ff8c74'),
    fill('M22 44V25Q23 10 32 3Q41 10 42 25V44Z', '#e7f8ff'),
    fill('M22 25Q23 11 32 3Q41 11 42 25Z', '#ee8db5'),
    dot(32, 31, 7, '#80c8e5'),
    dot(30, 29, 2, '#fff'),
    line('M22 43H42', '#a785c5', 3),
  ],
  17: [
    line('M23 45V16L51 8V38', purple, 5),
    fill('M23 16L51 8V17L23 25Z', purple),
    fill('M22 39C6 32 3 54 17 54Q25 54 25 45Z', purple),
    fill('M50 32C34 25 31 47 45 47Q53 47 53 38Z', purple),
  ],
  21: [
    fill(
      'M8 24Q3 12 14 12Q16 4 24 9Q32 1 40 9Q48 4 50 12Q61 12 56 24L43 51Q32 58 21 51Z',
      '#f99ec5',
    ),
    line('M32 50V13M28 50L18 16M36 50L46 16M24 47L11 24M40 47L53 24', '#fff4e2', 2.5),
    fill('M22 50Q32 46 42 50L40 57H24Z', '#ed69a4'),
  ],
  0: [fill(heart, berry), gleam('M15 22Q15 15 23 15')],
  1: [fill(star, '#ffcf44'), fill('M32 11L36 23L47 25L34 29Z', '#fff1a1')],
  2: [
    ...[
      [32, 13],
      [47, 21],
      [47, 39],
      [32, 49],
      [17, 39],
      [17, 21],
    ].map(([x, y]) => dot(x, y, 10, petal)),
    dot(32, 31, 11, '#ffc84a'),
    dot(28, 29, 1.5, ink),
    dot(36, 29, 1.5, ink),
    line('M29 34Q32 37 35 34', ink, 1.5),
  ],
  3: [
    fill(
      'M29 29C21 10 5 4 6 22C6 35 20 38 29 35C11 36 7 52 17 56C26 60 31 45 32 38C33 45 38 60 47 56C57 52 53 36 35 35C44 38 58 35 58 22C59 4 43 10 35 29Z',
      purple,
    ),
    fill('M24 27C19 17 10 13 11 23Q12 30 24 32ZM40 27C45 17 54 13 53 23Q52 30 40 32Z', '#fba9dc'),
    dot(20, 46, 4, '#65e1d1'),
    dot(44, 46, 4, '#65e1d1'),
    line('M32 25V44', ink, 4),
    line('M30 25L25 18M34 25L39 18', ink, 2),
  ],
  4: [
    fill('M43 5C17 2 4 22 10 41C17 61 43 65 56 45C39 50 26 36 30 22Q32 11 43 5Z', '#ffd264'),
    dot(19, 29, 2, ink),
    dot(27, 35, 2, ink),
    line('M18 39Q21 42 24 41', ink, 1.5),
    gleam('M17 21Q20 13 28 11'),
  ],
  5: [
    line(
      'M32 4V11M32 53V60M4 32H11M53 32H60M12 12L17 17M47 47L52 52M12 52L17 47M47 17L52 12',
      '#ffb72d',
      4,
    ),
    dot(32, 32, 19, '#ffce4a'),
    dot(26, 29, 2, ink),
    dot(38, 29, 2, ink),
    line('M26 37Q32 43 38 37'),
    gleam('M21 25Q23 20 28 19'),
  ],
  6: [
    fill('M5 47A27 27 0 0 1 59 47H52A20 20 0 0 0 12 47Z', '#f66bac'),
    fill('M12 47A20 20 0 0 1 52 47H45A13 13 0 0 0 19 47Z', '#ffd361'),
    fill('M19 47A13 13 0 0 1 45 47H38A6 6 0 0 0 26 47Z', '#66d2cb'),
    fill('M3 48Q0 40 8 39Q10 32 17 37Q25 34 26 43Q27 52 17 52H9Q3 52 3 48Z', petal),
    fill('M38 45Q37 36 45 37Q50 31 55 39Q64 39 61 48Q59 52 48 52Q38 52 38 45Z', petal),
  ],
  7: [
    line('M18 37Q22 17 37 9Q37 24 46 37', '#48977c', 3),
    fill('M28 17Q29 2 45 6Q43 19 28 17Z', teal),
    dot(17, 44, 12, '#f6467d'),
    dot(47, 44, 12, '#ec3467'),
    gleam('M11 41Q11 37 15 36M41 41Q41 37 45 36'),
  ],
  8: [
    fill('M10 23Q10 13 32 15Q54 13 54 23Q50 46 32 59Q14 46 10 23Z', '#f95a83'),
    fill('M12 18L23 8L30 16L35 6L41 17L52 11L49 23L34 21L24 27L23 20Z', teal),
    ...[
      [21, 31],
      [39, 30],
      [29, 40],
      [40, 42],
      [27, 50],
    ].map(([x, y]) => line(`M${x} ${y}l1 3`, petal, 2)),
    gleam('M16 26L18 32'),
  ],
  9: [
    fill(
      'M27 23L9 12Q4 10 4 18V44Q4 51 11 47L27 38ZM37 23L55 12Q60 10 60 18V44Q60 51 53 47L37 38Z',
      '#f668b3',
    ),
    fill('M25 35L16 57L29 52L33 58L37 36Z', '#da418a'),
    line('M10 21L25 30M54 21L39 30', '#b6357c', 2),
    fill('M26 23Q32 20 38 23L38 39Q32 42 26 39Z', '#ffacd8'),
    gleam('M29 26V32'),
  ],
  10: [
    fill('M18 38Q24 27 32 29Q40 27 46 38Q57 54 42 57Q32 52 22 57Q7 54 18 38Z', '#a577c8'),
    dot(11, 24, 7, purple),
    dot(25, 13, 7, purple),
    dot(41, 13, 7, purple),
    dot(54, 25, 7, purple),
    gleam('M23 39Q26 34 30 35'),
  ],
  11: [
    dot(32, 32, 27, '#ffce4a'),
    dot(22, 27, 3, ink),
    dot(42, 27, 3, ink),
    fill('M18 37Q32 41 46 37Q44 52 32 52Q20 52 18 37Z', ink),
    fill('M25 47Q32 42 39 47Q32 53 25 47Z', '#f980a5'),
    gleam('M15 20Q19 13 26 12'),
  ],
  13: [
    fill(
      'M14 51C1 51 1 32 13 31C12 17 25 10 36 18C45 15 55 22 54 32C66 37 63 51 52 51Z',
      '#a1e5f4',
    ),
    dot(24, 38, 1.8, ink),
    dot(40, 38, 1.8, ink),
    line('M29 43Q32 46 35 43', ink, 1.5),
    gleam('M19 28Q21 23 27 23'),
  ],
  15: [
    fill('M24 29H40L44 56Q32 62 20 56Z', petal),
    fill('M5 31Q6 5 32 5Q58 5 59 31Q32 39 5 31Z', '#ee6098'),
    dot(18, 20, 5, petal),
    dot(39, 14, 4, petal),
    dot(47, 27, 3, petal),
    dot(28, 47, 1.5, ink),
    dot(36, 47, 1.5, ink),
    line('M29 52Q32 55 35 52', ink, 1.5),
  ],
  19: [
    dot(32, 31, 19, '#a381de'),
    fill('M16 21Q25 12 38 15L34 20Q23 17 16 27Z', '#d2b3fa'),
    line('M11 29C-5 40 8 51 36 40C62 29 69 16 51 19', '#ffd269', 5),
    dot(54, 9, 2.5, '#ffcf60'),
  ],
  22: [
    dot(22, 18, 11, teal),
    dot(42, 18, 11, teal),
    dot(22, 38, 11, teal),
    dot(42, 38, 11, teal),
    line('M33 30Q40 52 26 59', '#319882', 4),
    gleam('M16 16L20 13M37 16L41 13'),
  ],
  25: [
    fill('M8 27L7 8L23 17Q32 13 41 17L57 8L56 27Q62 56 32 58Q2 56 8 27Z', '#ffc96d'),
    fill('M12 16L20 21L13 26ZM52 16L44 21L51 26Z', '#f59bb6'),
    dot(22, 34, 2.5, ink),
    dot(42, 34, 2.5, ink),
    fill('M28 42Q32 38 36 42L32 46Z', '#ec7096'),
    line(
      'M32 46Q27 51 23 47M32 46Q37 51 41 47M5 40L17 42M5 47L17 45M47 42L59 40M47 45L59 47',
      ink,
      1.5,
    ),
  ],
  27: [
    fill('M29 24C16 2 2 9 9 24Q15 34 29 30ZM35 24C48 2 62 9 55 24Q49 34 35 30Z', '#b2eaf5'),
    fill('M15 38Q15 25 32 25Q49 25 49 38Q49 59 32 59Q15 59 15 38Z', '#ffd35b'),
    fill('M16 36H48V42H16ZM19 49H45Q44 53 41 55H23Q20 53 19 49Z', ink),
    dot(25, 30, 1.5, ink),
    dot(39, 30, 1.5, ink),
    line('M28 33Q32 36 36 33', ink, 1.5),
    line('M26 24L22 18M38 24L42 18', ink, 2),
  ],
  28: [
    fill('M32 5C6 5 5 41 29 50L25 56H39L35 50C59 41 58 5 32 5Z', '#f779bd'),
    gleam('M18 20Q18 12 26 12'),
    line('M32 56Q42 58 31 62', purple, 2),
  ],
  29: [
    line('M32 33V59', '#429980', 4),
    fill('M31 54Q10 53 9 37Q27 38 31 54ZM33 48Q52 45 54 31Q37 32 33 48Z', teal),
    fill('M12 9L25 17L32 6L39 17L52 9V27Q51 42 32 42Q13 42 12 27Z', '#f669ad'),
    line('M25 18L26 31M39 18L38 31', '#d44389', 2),
    gleam('M18 23V28'),
  ],
};

export function iconLayers(id: string): Layer[] {
  const index = id === 'heart' ? 0 : id === 'star' ? 1 : Number(id.split('-')[1]);
  return (refined[index] ?? shapes[index] ?? refined[0]).map((l) =>
    l.fill !== 'none' && !l.stroke ? { ...l, stroke: '#75436b', strokeWidth: 1.25 } : l,
  );
}

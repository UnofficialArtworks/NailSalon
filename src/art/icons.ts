export interface Layer {
  path: string;
  fill: string;
  stroke?: string;
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
export function iconLayers(id: string): Layer[] {
  if (id === 'heart') return shapes[0];
  if (id === 'star') return shapes[1];
  return shapes[Number(id.split('-')[1]) % shapes.length] ?? shapes[0];
}

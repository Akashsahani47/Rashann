// Parses Hindi/Hinglish/English voice transcripts into structured grocery items.
// Examples that parse correctly:
//   "atta paanch kilo, doodh do liter, dahi 500 gram"
//   "do kilo basmati chawal aur ek packet namak"
//   "Aashirvaad atta 10 kg"

const NUMBER_WORDS = {
  ek: 1, ik: 1, एक: 1, one: 1,
  do: 2, दो: 2, two: 2,
  teen: 3, तीन: 3, three: 3,
  char: 4, chaar: 4, चार: 4, four: 4,
  paanch: 5, panch: 5, पांच: 5, पाँच: 5, five: 5,
  chhe: 6, chhah: 6, छह: 6, छे: 6, six: 6,
  saat: 7, सात: 7, seven: 7,
  aath: 8, आठ: 8, eight: 8,
  nau: 9, नौ: 9, nine: 9,
  das: 10, dus: 10, दस: 10, ten: 10,
  gyaarah: 11, ग्यारह: 11,
  baarah: 12, बारह: 12,
  pandrah: 15, पंद्रह: 15, fifteen: 15,
  bees: 20, बीस: 20, twenty: 20,
  paccis: 25, पच्चीस: 25,
  tees: 30, तीस: 30, thirty: 30,
  pachaas: 50, पचास: 50, fifty: 50,
  sau: 100, सौ: 100, hundred: 100,
  hazaar: 1000, हज़ार: 1000, हजार: 1000, thousand: 1000,
};

const UNIT_MAP = {
  kg: 'kg', kilo: 'kg', kilos: 'kg', kilogram: 'kg', kilograms: 'kg',
  किलो: 'kg', kilogm: 'kg',
  g: 'g', gm: 'g', gms: 'g', gram: 'g', grams: 'g', ग्राम: 'g',
  l: 'L', ltr: 'L', litre: 'L', liter: 'L', litres: 'L', liters: 'L',
  लीटर: 'L', लिटर: 'L',
  ml: 'mL', millilitre: 'mL', milliliter: 'mL',
  pcs: 'pcs', piece: 'pcs', pieces: 'pcs', dana: 'pcs', dane: 'pcs', एक: 'pcs',
  packet: 'pack', pkt: 'pack', pack: 'pack', packs: 'pack', पैकेट: 'pack',
  bottle: 'pack', bottles: 'pack',
};

// Resolve a sequence of word-numbers like ["do", "sau"] → 200, ["paanch","hazaar"] → 5000.
function resolveNumberPhrase(words) {
  if (!words.length) return null;
  let total = 0;
  let current = 0;
  for (const w of words) {
    const v = NUMBER_WORDS[w.toLowerCase()] ?? null;
    if (v === null) {
      // not a recognised number word
      if (/^\d+(\.\d+)?$/.test(w)) {
        current = Number(w);
        continue;
      }
      return null;
    }
    if (v === 100 || v === 1000) {
      current = (current || 1) * v;
      total += current;
      current = 0;
    } else {
      current += v;
    }
  }
  total += current;
  return total || null;
}

function parseChunk(chunkRaw) {
  const chunk = chunkRaw.trim().toLowerCase();
  if (!chunk) return null;

  // Tokenise — keep digits attached
  const tokens = chunk.split(/\s+/);
  let qty = null;
  let unit = null;
  const nameTokens = [];

  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];

    // Digit form: 5, 5kg, 2.5
    const digitMatch = t.match(/^(\d+(?:\.\d+)?)(kg|g|gm|gms|ml|l|ltr|pcs|pkt|pack)?$/);
    if (digitMatch && qty === null) {
      qty = Number(digitMatch[1]);
      if (digitMatch[2]) unit = UNIT_MAP[digitMatch[2]] || digitMatch[2];
      i++;
      continue;
    }

    // Word-number phrase — consume as long as next tokens are also number words
    if (NUMBER_WORDS[t] !== undefined && qty === null) {
      const phrase = [t];
      let j = i + 1;
      while (j < tokens.length && NUMBER_WORDS[tokens[j]] !== undefined) {
        phrase.push(tokens[j]);
        j++;
      }
      const resolved = resolveNumberPhrase(phrase);
      if (resolved !== null) {
        qty = resolved;
        i = j;
        continue;
      }
    }

    // Unit word
    if (UNIT_MAP[t] && !unit) {
      unit = UNIT_MAP[t];
      i++;
      continue;
    }

    nameTokens.push(t);
    i++;
  }

  const itemName = nameTokens
    .filter((w) => !/^(of|ka|ki|ke|और|aur|please|chahiye|de|do|dena)$/i.test(w))
    .join(' ')
    .trim();

  if (!itemName) return null;

  return {
    itemName: titleCase(itemName),
    quantity: qty ?? 1,
    unit: unit ?? (qty && qty >= 1 ? 'pcs' : 'pcs'),
    estimatedPrice: 0,
    category: '',
    notes: '',
  };
}

function titleCase(s) {
  return s
    .split(' ')
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

export function parseVoiceTranscript(transcript) {
  if (!transcript) return [];
  const chunks = transcript
    .split(/,|।|\.|\s+aur\s+|\s+और\s+|\s+then\s+|;/i)
    .map((s) => s.trim())
    .filter(Boolean);
  return chunks.map(parseChunk).filter(Boolean);
}

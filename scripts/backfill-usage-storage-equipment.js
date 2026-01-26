const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const defaultFreePath = path.join(repoRoot, 'src', 'data', 'free-recipes.json');
const defaultPremiumPath = path.join(repoRoot, 'src', 'data', 'recipes.json');

const EMPTY_USAGE = {
  summary: '',
  dosage: '',
  frequency: '',
  maxDuration: '',
  applicationAreas: '',
  bestPractices: '',
};

const EMPTY_STORAGE = {
  yield: '',
  shelfLife: '',
  costEstimate: '',
  storageTemp: '',
  spoilageIndicators: '',
};

const TEMPLATE_USAGE = {
  internal: {
    dosage: '1 cup (240 ml) or 1-2 ml tincture (30-60 drops), based on preparation type',
    frequency: '2-3 times daily',
    maxDuration: '2-6 weeks, then take a 1-week break',
    applicationAreas: 'Internal use',
    bestPractices: 'Dilute tinctures in water; take between meals unless sensitive; start low and increase gradually.',
  },
  acuteInternal: {
    dosage: '1 cup (240 ml) or 1-2 ml tincture (30-60 drops), based on preparation type',
    frequency: 'Every 2-3 hours as needed for up to 7 days',
    maxDuration: '7-14 days',
    applicationAreas: 'Internal use',
    bestPractices: 'Stay hydrated; take with food if stomach irritation occurs; discontinue if symptoms worsen.',
  },
  topical: {
    dosage: 'Apply a thin layer',
    frequency: '2-4 times daily as needed',
    maxDuration: 'Until condition resolves; discontinue if irritation occurs',
    applicationAreas: 'Affected area only',
    bestPractices: 'Clean and dry skin before use; patch-test first; avoid broken skin; wash hands after application.',
  },
};

const TEMPLATE_STORAGE = {
  tincture: {
    yield: 'Typically 8-16 oz (240-480 ml) per batch',
    shelfLife: '3-5 years when stored properly',
    costEstimate: '$15-30 per batch',
    storageTemp: 'Room temperature (60-75°F / 15-24°C), away from light and heat',
    spoilageIndicators: 'Off odor, mold, or unusual cloudiness',
  },
  vinegar: {
    yield: 'Typically 8-16 oz (240-480 ml) per batch',
    shelfLife: '6-12 months',
    costEstimate: '$10-25 per batch',
    storageTemp: 'Cool, dark place; refrigerate to extend shelf life',
    spoilageIndicators: 'Off odor, mold, or slimy texture',
  },
  glycerite: {
    yield: 'Typically 8-16 oz (240-480 ml) per batch',
    shelfLife: '1 year',
    costEstimate: '$12-25 per batch',
    storageTemp: 'Room temperature (60-75°F / 15-24°C), away from light',
    spoilageIndicators: 'Off odor, mold, or unusual cloudiness',
  },
  wine: {
    yield: 'Typically 16-32 oz (480-960 ml) per batch',
    shelfLife: '3-6 months refrigerated',
    costEstimate: '$12-30 per batch',
    storageTemp: 'Refrigerate',
    spoilageIndicators: 'Sour smell, fizzing, or mold',
  },
  infusion: {
    yield: '1-2 cups (240-480 ml) per batch',
    shelfLife: '24 hours refrigerated',
    costEstimate: '$2-6 per batch',
    storageTemp: 'Refrigerate immediately',
    spoilageIndicators: 'Cloudiness, sour smell, or mold',
  },
  decoction: {
    yield: '1-2 cups (240-480 ml) per batch',
    shelfLife: '48 hours refrigerated',
    costEstimate: '$3-8 per batch',
    storageTemp: 'Refrigerate immediately',
    spoilageIndicators: 'Cloudiness, sour smell, or mold',
  },
  syrup: {
    yield: '1-2 cups (240-480 ml) per batch',
    shelfLife: '2-4 weeks refrigerated',
    costEstimate: '$8-15 per batch',
    storageTemp: 'Refrigerate',
    spoilageIndicators: 'Mold growth, fizzing, or off odor',
  },
  salve: {
    yield: '4-12 oz (120-360 ml) per batch',
    shelfLife: '1 year (2-3 years refrigerated)',
    costEstimate: '$10-25 per batch',
    storageTemp: 'Room temperature; refrigerate in hot climates',
    spoilageIndicators: 'Rancid smell, mold, or grainy texture',
  },
  oil: {
    yield: '8-16 oz (240-480 ml) per batch',
    shelfLife: '1 year (2-3 years refrigerated)',
    costEstimate: '$10-20 per batch',
    storageTemp: 'Cool, dark place; refrigerate to extend shelf life',
    spoilageIndicators: 'Rancid smell or cloudiness',
  },
  powder: {
    yield: 'Varies; typically 2-8 oz (60-240 g)',
    shelfLife: '6-12 months',
    costEstimate: '$5-15 per batch',
    storageTemp: 'Airtight container; refrigerate or freeze for maximum freshness',
    spoilageIndicators: 'Loss of aroma, moisture clumping, or discoloration',
  },
  paste: {
    yield: '4-16 oz (120-480 ml) per batch',
    shelfLife: '1 year',
    costEstimate: '$10-25 per batch',
    storageTemp: 'Cool, dark place; refrigerate to extend shelf life',
    spoilageIndicators: 'Fermentation bubbles, mold, or off odor',
  },
  poultice: {
    yield: 'Single-use batch',
    shelfLife: 'Use immediately; up to 24 hours refrigerated',
    costEstimate: '$2-6 per batch',
    storageTemp: 'Refrigerate if storing briefly',
    spoilageIndicators: 'Off odor or slimy texture',
  },
  capsule: {
    yield: 'Varies by batch size',
    shelfLife: '1 year',
    costEstimate: '$10-30 per batch',
    storageTemp: 'Cool, dry place',
    spoilageIndicators: 'Moisture clumping, odor, or discoloration',
  },
};

const TEMPLATE_EQUIPMENT = {
  tincture: [
    'Glass mason jar (quart)',
    'Fine mesh strainer',
    'Cheesecloth or muslin',
    'Funnel',
    'Amber glass dropper bottles',
    'Kitchen scale',
    'Labels',
  ],
  vinegar: [
    'Glass mason jar (quart)',
    'Fine mesh strainer',
    'Cheesecloth or muslin',
    'Funnel',
    'Glass bottles with caps',
    'Labels',
  ],
  glycerite: [
    'Glass mason jar (quart)',
    'Fine mesh strainer',
    'Cheesecloth or muslin',
    'Funnel',
    'Glass bottles with caps',
    'Labels',
  ],
  wine: [
    'Glass mason jar (quart)',
    'Fine mesh strainer',
    'Cheesecloth or muslin',
    'Funnel',
    'Glass bottles with caps',
    'Labels',
  ],
  infusion: ['Tea kettle or pot', 'Fine mesh strainer', 'Measuring cups', 'Mug or jar'],
  decoction: ['Saucepan', 'Fine mesh strainer', 'Measuring cups', 'Mug or jar'],
  syrup: ['Saucepan', 'Fine mesh strainer', 'Cheesecloth', 'Funnel', 'Glass bottle with cap'],
  salve: ['Double boiler', 'Saucepan', 'Whisk or spoon', 'Fine mesh strainer', 'Tins or jars', 'Labels'],
  oil: ['Glass mason jar', 'Fine mesh strainer', 'Cheesecloth', 'Funnel', 'Glass bottles', 'Labels'],
  powder: ['Mortar and pestle or grinder', 'Fine mesh sieve', 'Airtight containers', 'Kitchen scale'],
  paste: ['Mixing bowl', 'Spatula or spoon', 'Airtight jar', 'Labels'],
  poultice: ['Bowl', 'Clean cloth or muslin', 'Hot water', 'Plastic wrap (optional)'],
  capsule: ['Capsule machine (optional)', 'Empty capsules', 'Funnel or scoop', 'Airtight container'],
};

function parseArgs(argv) {
  const args = {};
  argv.slice(2).forEach((arg) => {
    if (!arg.startsWith('--')) return;
    const [key, value] = arg.replace(/^--/, '').split('=');
    args[key] = value ?? true;
  });
  return args;
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function writeJsonAtomic(filePath, data) {
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmpPath, filePath);
}

function backupFile(filePath) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(dir, `${base}.bak.${stamp}`);
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function normalizeUsage(usage) {
  if (!usage || typeof usage === 'string') {
    return { ...EMPTY_USAGE, summary: usage ?? '' };
  }
  return { ...EMPTY_USAGE, ...usage };
}

function normalizeStorage(storage) {
  if (!storage || typeof storage === 'string') {
    return { ...EMPTY_STORAGE };
  }
  return { ...EMPTY_STORAGE, ...storage };
}

function normalizeEquipmentNeeded(equipmentNeeded) {
  if (Array.isArray(equipmentNeeded)) {
    return equipmentNeeded.filter((item) => typeof item === 'string');
  }
  return [];
}

function isEmpty(value) {
  return value == null || value === '';
}

function normalizeText(value) {
  return String(value ?? '').toLowerCase();
}

function detectPreparationType(recipe) {
  const text = normalizeText([
    recipe.title,
    recipe.ingredients,
    recipe.detailedMeasurements,
    recipe.preparationSteps,
    recipe.description,
    recipe.warning,
  ].join(' '));

  const has = (fragment) => text.includes(fragment);
  const matches = (regex) => regex.test(text);

  if (has('liniment')) return 'liniment';
  if (has('salve') || has('balm') || has('ointment') || has('beeswax')) return 'salve';
  if (has('infused oil') || (has('oil') && has('infuse'))) return 'oil';
  if (has('syrup') || (has('honey') && has('syrup'))) return 'syrup';
  if (has('paste') || has('electuary') || has('confectio') || has('gao')) return 'paste';
  if (has('powder') || has('powdered')) return 'powder';
  if (has('capsule') || has('capsules') || has('pill')) return 'capsule';
  if (has('poultice') || has('compress') || has('fomentation')) return 'poultice';
  if (has('glycerite') || has('glycerin')) return 'glycerite';
  if (has('vinegar')) return 'vinegar';
  if (has('wine') || has('cordial')) return 'wine';
  if (has('tincture') || has('macerate') || matches(/\bvodka\b|\bbrandy\b|\bgin\b|\brum\b|\balcohol\b/)) return 'tincture';
  if (has('decoction') || has('simmer')) return 'decoction';
  if (has('infusion') || has('steep') || has('tea')) return 'infusion';

  return 'infusion';
}

function detectTopical(recipe) {
  const text = normalizeText([
    recipe.title,
    recipe.description,
    recipe.warning,
    recipe.usage?.summary,
  ].join(' '));

  if (text.includes('external use') || text.includes('do not ingest') || text.includes('topical')) return true;
  if (text.includes('apply') || text.includes('rub')) return true;
  return false;
}

function suggestApplicationAreas(recipe) {
  const usedFor = normalizeText(recipe.usedFor);
  if (usedFor.includes('respiratory')) return 'Chest, upper back, throat';
  if (usedFor.includes('musculoskeletal')) return 'Affected joints and muscles';
  if (usedFor.includes('skin')) return 'Affected skin area';
  if (usedFor.includes('nervous')) return 'Temples, back of neck (if topical)';
  return 'Affected area only';
}

function shouldUseAcuteTemplate(recipe) {
  const text = normalizeText([recipe.usedFor, recipe.warning, recipe.description].join(' '));
  return text.includes('acute') || text.includes('fever') || text.includes('infection') || text.includes('cold');
}

function applyUsageTemplate(usage, recipe, prepType) {
  const isTopical = detectTopical(recipe) || ['salve', 'oil', 'liniment', 'poultice'].includes(prepType);
  const isAcute = shouldUseAcuteTemplate(recipe);
  const template = isTopical
    ? TEMPLATE_USAGE.topical
    : isAcute
      ? TEMPLATE_USAGE.acuteInternal
      : TEMPLATE_USAGE.internal;

  if (isEmpty(usage.dosage)) usage.dosage = template.dosage;
  if (isEmpty(usage.frequency)) usage.frequency = template.frequency;
  if (isEmpty(usage.maxDuration)) usage.maxDuration = template.maxDuration;
  if (isEmpty(usage.applicationAreas)) {
    usage.applicationAreas = isTopical ? suggestApplicationAreas(recipe) : template.applicationAreas;
  }
  if (isEmpty(usage.bestPractices)) usage.bestPractices = template.bestPractices;
}

function applyStorageTemplate(storage, prepType) {
  const template = TEMPLATE_STORAGE[prepType] ?? TEMPLATE_STORAGE.infusion;
  if (isEmpty(storage.yield)) storage.yield = template.yield;
  if (isEmpty(storage.shelfLife)) storage.shelfLife = template.shelfLife;
  if (isEmpty(storage.costEstimate)) storage.costEstimate = template.costEstimate;
  if (isEmpty(storage.storageTemp)) storage.storageTemp = template.storageTemp;
  if (isEmpty(storage.spoilageIndicators)) storage.spoilageIndicators = template.spoilageIndicators;
}

function applyEquipmentTemplate(recipe, prepType) {
  if (Array.isArray(recipe.equipmentNeeded) && recipe.equipmentNeeded.length > 0) return;
  recipe.equipmentNeeded = TEMPLATE_EQUIPMENT[prepType] ?? [];
}

function updateRecipes(recipes, label) {
  const counts = {
    total: recipes.length,
    updatedUsage: 0,
    updatedStorage: 0,
    updatedEquipment: 0,
  };

  const updated = recipes.map((recipe) => {
    const prepType = detectPreparationType(recipe);
    const usage = normalizeUsage(recipe.usage);
    const storage = normalizeStorage(recipe.storage);
    const equipmentNeeded = normalizeEquipmentNeeded(recipe.equipmentNeeded);

    const usageBefore = JSON.stringify(usage);
    const storageBefore = JSON.stringify(storage);
    const equipmentBefore = equipmentNeeded.length;

    applyUsageTemplate(usage, recipe, prepType);
    applyStorageTemplate(storage, prepType);

    recipe.usage = usage;
    recipe.storage = storage;
    recipe.equipmentNeeded = equipmentNeeded;

    applyEquipmentTemplate(recipe, prepType);

    if (usageBefore !== JSON.stringify(usage)) counts.updatedUsage += 1;
    if (storageBefore !== JSON.stringify(storage)) counts.updatedStorage += 1;
    if (equipmentBefore !== recipe.equipmentNeeded.length) counts.updatedEquipment += 1;

    return recipe;
  });

  console.log(`${label}: ${counts.total} recipes processed.`);
  console.log(`${label}: usage updated for ${counts.updatedUsage} recipes.`);
  console.log(`${label}: storage updated for ${counts.updatedStorage} recipes.`);
  console.log(`${label}: equipment updated for ${counts.updatedEquipment} recipes.`);

  return updated;
}

function main() {
  const args = parseArgs(process.argv);
  const freePath = path.resolve(process.cwd(), args.free ?? defaultFreePath);
  const premiumPath = path.resolve(process.cwd(), args.premium ?? defaultPremiumPath);
  const dryRun = Boolean(args['dry-run']);

  const freeRecipes = readJson(freePath);
  const premiumRecipes = readJson(premiumPath);

  if (!Array.isArray(freeRecipes) || !Array.isArray(premiumRecipes)) {
    throw new Error('Recipe datasets must be JSON arrays.');
  }

  const updatedFree = updateRecipes(freeRecipes, 'free-recipes.json');
  const updatedPremium = updateRecipes(premiumRecipes, 'recipes.json');

  if (dryRun) {
    console.log('Dry run enabled: no files were written.');
    return;
  }

  const freeBackup = backupFile(freePath);
  const premiumBackup = backupFile(premiumPath);

  writeJsonAtomic(freePath, updatedFree);
  writeJsonAtomic(premiumPath, updatedPremium);

  console.log('Backfill complete.');
  console.log(`Backups created:`);
  console.log(`- ${freeBackup}`);
  console.log(`- ${premiumBackup}`);
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}

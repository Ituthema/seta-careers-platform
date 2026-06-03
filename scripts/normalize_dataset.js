const fs = require("fs");
const path = require("path");

const INPUT_PATHS = {
  opportunities: "./data/opportunities.json",
  guides: "./data/guides.json",
  categories: "./data/categories.json",
  provinces: "./data/provinces.json"
};

const OUTPUT_PATH = "./data/clean/";
const LOG_PATH = "./logs/";

const DATE_FIELDS = ["closing_date", "posted_date", "updated_date", "published_date"];
const URL_FIELDS = ["source_url", "application_url"];

const PROVINCE_MAP = {
  gp: "Gauteng",
  gauteng: "Gauteng",
  "gauteng province": "Gauteng",

  wc: "Western Cape",
  "western cape": "Western Cape",
  "western-cape": "Western Cape",

  kzn: "KwaZulu-Natal",
  "kwazulu natal": "KwaZulu-Natal",
  "kwazulu-natal": "KwaZulu-Natal"
};

const CATEGORY_MAP = {
  learnerships: "learnership",
  learnership: "learnership",

  internships: "internship",
  internship: "internship",

  bursaries: "bursary",
  bursary: "bursary",

  apprenticeships: "apprenticeship",
  apprenticeship: "apprenticeship"
};

function ensureBackupExists() {
  if (!fs.existsSync("./data/backup")) {
    fs.mkdirSync("./data/backup", { recursive: true });
  }
}

function ensureOutputDirectories() {
  fs.mkdirSync(OUTPUT_PATH, { recursive: true });
  fs.mkdirSync(LOG_PATH, { recursive: true });
}

function resolveInputPath(inputPath) {
  if (fs.existsSync(inputPath)) return inputPath;

  const alternatePath = inputPath.replace(/^\.\/data\//, "./Data/");
  if (fs.existsSync(alternatePath)) return alternatePath;

  return inputPath;
}

function loadJSON(inputPath) {
  const resolvedPath = resolveInputPath(inputPath);

  try {
    const raw = fs.readFileSync(resolvedPath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Invalid JSON: ${resolvedPath}`, err.message);
    return null;
  }
}

function normalizeProvince(value) {
  if (!value) return null;

  const key = value.toString().trim().toLowerCase();

  return PROVINCE_MAP[key] || value;
}

function normalizeCategory(value) {
  if (!value) return null;

  const key = value.toString().trim().toLowerCase();

  return CATEGORY_MAP[key] || value;
}

function normalizeBoolean(value) {
  if (value === true || value === false) return value;

  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true" || v === "yes" || v === "1") return true;
    if (v === "false" || v === "no" || v === "0") return false;
  }

  if (value === 1) return true;
  if (value === 0) return false;

  return null;
}

function isValidISODateParts(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function normalizeDate(value) {
  if (!value) return null;

  const stringValue = value.toString().trim();
  const isoDateMatch = stringValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch.map(Number);

    if (!isValidISODateParts(year, month, day)) {
      return { error: "INVALID_DATE", value };
    }

    return stringValue;
  }

  const date = new Date(stringValue);

  if (isNaN(date.getTime())) {
    return { error: "INVALID_DATE", value };
  }

  return date.toISOString().split("T")[0];
}

function normalizeURL(url) {
  if (!url) return null;

  let cleaned = url.toString().trim();

  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = "https://" + cleaned;
  }

  return cleaned;
}

function normalizeOpportunity(record) {
  const changes = [];

  const normalized = { ...record };

  // Province
  if (record.province !== undefined) {
    const oldProvince = record.province;
    const newProvince = normalizeProvince(oldProvince);

    if (oldProvince !== newProvince) {
      changes.push({
        field: "province",
        from: oldProvince,
        to: newProvince
      });
      normalized.province = newProvince;
    }
  }

  // Category
  if (record.category !== undefined) {
    const oldCategory = record.category;
    const newCategory = normalizeCategory(oldCategory);

    if (oldCategory !== newCategory) {
      changes.push({
        field: "category",
        from: oldCategory,
        to: newCategory
      });
      normalized.category = newCategory;
    }
  }

  // Boolean fields
  if (record.verified !== undefined) {
    const oldVal = record.verified;
    const newVal = normalizeBoolean(oldVal);

    if (oldVal !== newVal) {
      changes.push({
        field: "verified",
        from: oldVal,
        to: newVal
      });
      normalized.verified = newVal;
    }
  }

  // Dates
  DATE_FIELDS.forEach(field => {
    if (record[field]) {
      const oldVal = record[field];
      const newVal = normalizeDate(oldVal);

      if (typeof newVal === "object" && newVal.error) {
        changes.push({
          field,
          error: "INVALID_DATE",
          value: oldVal
        });
      } else if (oldVal !== newVal) {
        changes.push({
          field,
          from: oldVal,
          to: newVal
        });
        normalized[field] = newVal;
      }
    }
  });

  // URLs
  URL_FIELDS.forEach(field => {
    if (record[field]) {
      const oldVal = record[field];
      const newVal = normalizeURL(oldVal);

      if (oldVal !== newVal) {
        changes.push({
          field,
          from: oldVal,
          to: newVal
        });
        normalized[field] = newVal;
      }
    }
  });

  return { normalized, changes };
}

function processFile(fileKey, data) {
  const results = [];
  const allChanges = [];

  if (!Array.isArray(data)) {
    return {
      results,
      allChanges: [
        {
          id: null,
          changes: [
            {
              file: fileKey,
              error: "INVALID_DATASET_SHAPE",
              value: data === null ? "null" : typeof data
            }
          ]
        }
      ]
    };
  }

  data.forEach(record => {
    const { normalized, changes } = normalizeOpportunity(record);

    results.push(normalized);

    if (changes.length > 0) {
      allChanges.push({
        id: record.id || null,
        changes
      });
    }
  });

  return { results, allChanges };
}

function writeOutput(fileName, data) {
  const outputFile = path.join(OUTPUT_PATH, fileName);
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2) + "\n");
}

function writeLogs(allChanges) {
  const logFile = path.join(LOG_PATH, "changes-log.json");

  fs.writeFileSync(logFile, JSON.stringify(allChanges, null, 2) + "\n");
}

function buildNormalizationReport(globalChanges, processedFiles) {
  const files = globalChanges.map(fileLog => {
    const modifiedRecords = fileLog.changes.length;
    const totalChanges = fileLog.changes.reduce((sum, recordLog) => sum + recordLog.changes.length, 0);
    const invalidDates = fileLog.changes.reduce(
      (sum, recordLog) => sum + recordLog.changes.filter(change => change.error === "INVALID_DATE").length,
      0
    );

    return {
      file: fileLog.file,
      input: processedFiles[fileLog.file]?.input || INPUT_PATHS[fileLog.file],
      output: `${OUTPUT_PATH}${fileLog.file}.json`,
      recordsProcessed: processedFiles[fileLog.file]?.recordsProcessed || 0,
      modifiedRecords,
      totalChanges,
      invalidDates,
      outputWritten: true
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    safety: {
      originalDataOverwritten: false,
      backupDirectoryEnsured: "./data/backup",
      outputDirectory: OUTPUT_PATH,
      logDirectory: LOG_PATH
    },
    totals: {
      filesProcessed: files.length,
      recordsProcessed: files.reduce((sum, file) => sum + file.recordsProcessed, 0),
      modifiedRecords: files.reduce((sum, file) => sum + file.modifiedRecords, 0),
      totalChanges: files.reduce((sum, file) => sum + file.totalChanges, 0),
      invalidDates: files.reduce((sum, file) => sum + file.invalidDates, 0)
    },
    files
  };
}

function writeNormalizationReport(report) {
  const reportFile = path.join(LOG_PATH, "normalization-report.json");
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + "\n");
}

function run() {
  ensureBackupExists();
  ensureOutputDirectories();

  const globalChanges = [];
  const processedFiles = {};

  Object.keys(INPUT_PATHS).forEach(key => {
    const data = loadJSON(INPUT_PATHS[key]);

    if (!data) return;

    const { results, allChanges } = processFile(key, data);

    writeOutput(key + ".json", results);

    processedFiles[key] = {
      input: resolveInputPath(INPUT_PATHS[key]),
      recordsProcessed: Array.isArray(data) ? data.length : 0
    };

    globalChanges.push({
      file: key,
      changes: allChanges
    });
  });

  writeLogs(globalChanges);
  writeNormalizationReport(buildNormalizationReport(globalChanges, processedFiles));

  console.log("Normalization complete.");
}

if (require.main === module) {
  run();
}

module.exports = {
  CATEGORY_MAP,
  PROVINCE_MAP,
  normalizeBoolean,
  normalizeCategory,
  normalizeDate,
  normalizeOpportunity,
  normalizeProvince,
  normalizeURL,
  processFile,
  run
};

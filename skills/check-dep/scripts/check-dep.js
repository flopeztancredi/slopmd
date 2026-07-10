#!/usr/bin/env node

const REQUEST_TIMEOUT_MS = 10000;
const SIGNAL_NAME_WIDTH = 16;
const STATUS_LABEL_WIDTH = 7;
const HTTP_NOT_FOUND = 404;
const HTTP_ERROR_MIN = 400;
const AGE_RED_FLAG_DAYS = 90;
const STALE_AGE_DAYS = 3 * 365;
const LOW_WEEKLY_DOWNLOADS = 500;
const TYPOSQUAT_MAX_DISTANCE = 2;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const EXIT_TRUSTED = 0;
const EXIT_CAUTION = 1;
const EXIT_REQUIRES_APPROVAL = 2;
const EXIT_USAGE_ERROR = 3;

const VERDICT_TRUSTED = "trusted";
const VERDICT_CAUTION = "caution";
const VERDICT_REQUIRES_APPROVAL = "requires-approval";

const STATUS_PASS = "pass";
const STATUS_WARN = "warn";
const STATUS_FAIL = "fail";
const STATUS_UNKNOWN = "unknown";

const NPM_REGISTRY_URL = "https://registry.npmjs.org/";
const NPM_DOWNLOADS_URL = "https://api.npmjs.org/downloads/point/last-week/";
const PYPI_URL = "https://pypi.org/pypi/";
const PYPISTATS_URL = "https://pypistats.org/api/packages/";
const OSV_QUERY_URL = "https://api.osv.dev/v1/query";

const OSV_ECOSYSTEM = { npm: "npm", pypi: "PyPI" };
const USER_AGENT = "slopmd-check-dep (https://github.com/flopeztancredi/slopmd)";

const USAGE =
  "usage: node check-dep.js <package-name>[@version] [--eco npm|pypi] [--json]";

const POPULAR_NPM = [
  "react", "react-dom", "lodash", "express", "axios", "typescript", "next",
  "vue", "webpack", "vite", "jest", "eslint", "prettier", "chalk",
  "commander", "zod", "prisma", "tailwindcss", "moment", "dayjs", "uuid",
  "dotenv", "cors", "body-parser", "mongoose", "sequelize", "pg", "mysql2",
  "redis", "ioredis", "socket.io", "ws", "node-fetch", "got", "cheerio",
  "puppeteer", "playwright", "jsdom", "yargs", "minimist", "inquirer",
  "ora", "glob", "rimraf", "mkdirp", "fs-extra", "semver", "debug",
  "winston", "pino", "morgan", "nodemon", "ts-node", "tsx", "esbuild",
  "rollup", "core-js", "classnames", "clsx", "styled-components", "redux",
  "react-redux", "react-router", "react-router-dom", "mobx", "rxjs",
  "immer", "ramda", "underscore", "jquery", "bootstrap", "sass", "postcss",
  "autoprefixer", "mocha", "chai", "sinon", "supertest", "cypress",
  "vitest", "husky", "lint-staged", "stylelint", "graphql", "koa",
  "fastify", "passport", "jsonwebtoken", "bcrypt", "bcryptjs", "validator",
  "joi", "yup", "ajv", "date-fns", "luxon", "d3", "three", "chart.js",
  "svelte", "preact", "handlebars", "ejs", "pug", "mustache", "marked",
  "markdown-it", "sharp", "xlsx", "papaparse", "js-yaml", "xml2js",
  "form-data", "multer", "compression", "helmet", "cookie-parser",
  "concurrently", "cross-env", "execa", "electron", "react-native",
  "@types/node", "@babel/core", "@angular/core", "@nestjs/core",
  "@testing-library/react", "@typescript-eslint/parser",
  "@aws-sdk/client-s3", "@emotion/react", "@mui/material",
  "@reduxjs/toolkit", "@tanstack/react-query", "@vitejs/plugin-react",
];

const POPULAR_PYPI = [
  "requests", "numpy", "pandas", "django", "flask", "fastapi", "pydantic",
  "boto3", "sqlalchemy", "pytest", "urllib3", "certifi",
  "charset-normalizer", "idna", "setuptools", "wheel", "pip", "six",
  "python-dateutil", "pytz", "pyyaml", "packaging", "typing-extensions",
  "cryptography", "cffi", "attrs", "jinja2", "markupsafe", "click",
  "itsdangerous", "werkzeug", "gunicorn", "uvicorn", "starlette", "httpx",
  "aiohttp", "websockets", "scipy", "matplotlib", "seaborn", "plotly",
  "scikit-learn", "tensorflow", "torch", "keras", "transformers",
  "datasets", "tokenizers", "huggingface-hub", "openai", "anthropic",
  "langchain", "tiktoken", "nltk", "spacy", "opencv-python", "pillow",
  "imageio", "beautifulsoup4", "lxml", "html5lib", "soupsieve", "scrapy",
  "selenium", "playwright", "oauthlib", "pyjwt", "passlib", "bcrypt",
  "paramiko", "celery", "redis", "kombu", "pika", "kafka-python",
  "pymongo", "psycopg2", "psycopg2-binary", "pymysql", "alembic",
  "peewee", "asyncpg", "aiofiles", "anyio", "sniffio", "h11", "httpcore",
  "rich", "tqdm", "colorama", "tabulate", "termcolor", "loguru",
  "structlog", "sentry-sdk", "python-dotenv", "marshmallow", "jsonschema",
  "more-itertools", "toolz", "arrow", "pendulum", "freezegun", "faker",
  "factory-boy", "hypothesis", "tox", "coverage", "pytest-cov",
  "pytest-asyncio", "mock", "responses", "flake8", "pylint", "black",
  "isort", "mypy", "ruff", "pre-commit", "twine", "poetry", "virtualenv",
  "awscli", "grpcio", "protobuf",
];

const VERSION_PATTERN = /^v?\d+(\.\d+){0,2}([-+.][0-9A-Za-z.+-]+)?$/;

function levenshtein(a, b) {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}

function splitSpec(spec) {
  const at = spec.lastIndexOf("@");
  if (at <= 0) return { name: spec, version: null };
  const candidate = spec.slice(at + 1);
  if (candidate.includes("/")) return { name: spec, version: null };
  const name = spec.slice(0, at);
  if (VERSION_PATTERN.test(candidate)) return { name, version: candidate };
  return { name, version: null };
}

function parseArgs(argv) {
  const parsed = { spec: null, eco: "npm", json: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") {
      parsed.json = true;
      continue;
    }
    if (arg === "--eco") {
      const value = argv[++i];
      if (value !== "npm" && value !== "pypi") {
        return { error: "invalid --eco value, expected npm or pypi" };
      }
      parsed.eco = value;
      continue;
    }
    if (arg.startsWith("--")) return { error: "unknown flag: " + arg };
    if (parsed.spec) return { error: "unexpected extra argument: " + arg };
    parsed.spec = arg;
  }
  if (!parsed.spec) return { error: USAGE };
  return parsed;
}

function signal(status, detail) {
  return { status, detail };
}

function notApplicable() {
  return signal(STATUS_UNKNOWN, "not applicable, package not found");
}

function networkUnknown(what) {
  return signal(STATUS_UNKNOWN, what + " unavailable (network failure)");
}

async function fetchJson(url, init = {}) {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "user-agent": USER_AGENT, ...init.headers },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    return { httpStatus: res.status, body };
  } catch {
    return null;
  }
}

function isoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function ageSignal(createdMs) {
  if (createdMs == null || Number.isNaN(createdMs)) {
    return signal(STATUS_UNKNOWN, "first publish date not available");
  }
  const days = Math.floor((Date.now() - createdMs) / MS_PER_DAY);
  if (days < AGE_RED_FLAG_DAYS) {
    return signal(
      STATUS_FAIL,
      "first published " + days + " days ago (younger than " +
        AGE_RED_FLAG_DAYS + " days, slopsquat window)",
    );
  }
  return signal(STATUS_PASS, "first published " + isoDate(createdMs));
}

function maintenanceSignal(latestMs) {
  if (latestMs == null || Number.isNaN(latestMs)) {
    return signal(STATUS_UNKNOWN, "latest release date not available");
  }
  const days = Math.floor((Date.now() - latestMs) / MS_PER_DAY);
  if (days > STALE_AGE_DAYS) {
    return signal(
      STATUS_WARN,
      "latest release " + isoDate(latestMs) + " (older than 3 years)",
    );
  }
  return signal(STATUS_PASS, "latest release " + isoDate(latestMs));
}

function downloadsSignal(weekly) {
  if (weekly == null || Number.isNaN(weekly)) {
    return signal(STATUS_UNKNOWN, "download stats unavailable (API failure)");
  }
  if (weekly < LOW_WEEKLY_DOWNLOADS) {
    return signal(
      STATUS_WARN,
      weekly + " downloads last week (below " + LOW_WEEKLY_DOWNLOADS + ")",
    );
  }
  return signal(STATUS_PASS, weekly + " downloads last week");
}

function repositorySignal(url) {
  if (!url) return signal(STATUS_WARN, "no repository link in metadata");
  return signal(STATUS_PASS, "repository: " + url);
}

function typosquatSignal(name, eco) {
  const popular = eco === "npm" ? POPULAR_NPM : POPULAR_PYPI;
  const target = name.toLowerCase();
  if (popular.includes(target)) {
    return signal(STATUS_PASS, "exact match with well-known popular package");
  }
  let closest = null;
  let best = Infinity;
  for (const candidate of popular) {
    const dist = levenshtein(target, candidate);
    if (dist < best) {
      best = dist;
      closest = candidate;
    }
  }
  if (best <= TYPOSQUAT_MAX_DISTANCE) {
    return signal(
      STATUS_FAIL,
      'name is distance ' + best + ' from popular package "' + closest +
        '" (possible typosquat)',
    );
  }
  return signal(STATUS_PASS, "no lookalike among popular package names");
}

async function queryOsv(name, eco, version) {
  const body = { package: { name, ecosystem: OSV_ECOSYSTEM[eco] } };
  if (version) body.version = version;
  const res = await fetchJson(OSV_QUERY_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res || res.httpStatus >= HTTP_ERROR_MIN) return null;
  return Array.isArray(res.body?.vulns) ? res.body.vulns.length : 0;
}

async function vulnerabilitiesSignal(name, eco, version, latestVersion) {
  const total = await queryOsv(name, eco, null);
  if (total == null) return networkUnknown("vulnerability data");
  if (total === 0) return signal(STATUS_PASS, "no known vulnerabilities");
  const effective = version ?? latestVersion;
  if (!effective) {
    return signal(
      STATUS_WARN,
      total + " known vulnerabilities across versions (no version resolved)",
    );
  }
  const matching = await queryOsv(name, eco, effective);
  if (matching == null) return networkUnknown("vulnerability data");
  if (matching > 0) {
    return signal(
      STATUS_FAIL,
      matching + " known vulnerabilities affect version " + effective,
    );
  }
  if (version) {
    return signal(
      STATUS_WARN,
      total + " known vulnerabilities in other versions, none affect " + version,
    );
  }
  return signal(
    STATUS_PASS,
    "no vulnerabilities affect latest version " + effective + " (" + total +
      " known in older versions)",
  );
}

function markMetadataUnavailable(signals) {
  signals.exists = networkUnknown("registry metadata");
  signals.age = networkUnknown("first publish date");
  signals.maintenance = networkUnknown("latest release date");
  signals.downloads = networkUnknown("download stats");
  signals.vulnerabilities = networkUnknown("vulnerability data");
  signals.repository = networkUnknown("repository link");
}

function npmRepositoryUrl(doc) {
  const latest = doc["dist-tags"]?.latest;
  const repo = doc.repository ?? doc.versions?.[latest]?.repository;
  if (!repo) return null;
  if (typeof repo === "string") return repo;
  return repo.url ?? null;
}

async function gatherNpm(name, signals) {
  const meta = await fetchJson(NPM_REGISTRY_URL + encodeURIComponent(name));
  if (!meta) {
    markMetadataUnavailable(signals);
    return { found: false };
  }
  if (meta.httpStatus === HTTP_NOT_FOUND) {
    signals.exists = signal(STATUS_FAIL, `not found on npm registry (HTTP ${HTTP_NOT_FOUND})`);
    return { found: false };
  }
  const doc = meta.body ?? {};
  signals.exists = signal(STATUS_PASS, "found on npm registry");
  signals.age = ageSignal(Date.parse(doc.time?.created));
  const latest = doc["dist-tags"]?.latest;
  signals.maintenance = maintenanceSignal(Date.parse(doc.time?.[latest]));
  signals.repository = repositorySignal(npmRepositoryUrl(doc));

  const dl = await fetchJson(NPM_DOWNLOADS_URL + encodeURIComponent(name));
  const weekly = dl && dl.httpStatus < 400 ? dl.body?.downloads : null;
  signals.downloads = downloadsSignal(typeof weekly === "number" ? weekly : null);
  return { found: true, latestVersion: latest ?? null };
}

function pypiUploadTimes(releases) {
  const times = [];
  for (const files of Object.values(releases ?? {})) {
    for (const file of files) {
      const ms = Date.parse(file.upload_time_iso_8601 ?? file.upload_time);
      if (!Number.isNaN(ms)) times.push(ms);
    }
  }
  return times;
}

function pypiRepositoryUrl(info) {
  const urls = Object.values(info?.project_urls ?? {});
  if (info?.home_page) urls.push(info.home_page);
  return urls.find((u) => /github\.com|gitlab/i.test(u ?? "")) ?? null;
}

async function gatherPypi(name, signals) {
  const meta = await fetchJson(PYPI_URL + encodeURIComponent(name) + "/json");
  if (!meta) {
    markMetadataUnavailable(signals);
    return { found: false };
  }
  if (meta.httpStatus === HTTP_NOT_FOUND) {
    signals.exists = signal(STATUS_FAIL, `not found on PyPI (HTTP ${HTTP_NOT_FOUND})`);
    return { found: false };
  }
  const doc = meta.body ?? {};
  signals.exists = signal(STATUS_PASS, "found on PyPI");
  const times = pypiUploadTimes(doc.releases);
  signals.age = ageSignal(times.length ? Math.min(...times) : null);
  signals.maintenance = maintenanceSignal(times.length ? Math.max(...times) : null);
  signals.repository = repositorySignal(pypiRepositoryUrl(doc.info));

  const stats = await fetchJson(
    PYPISTATS_URL + encodeURIComponent(name) + "/recent",
  );
  const weekly = stats && stats.httpStatus < 400 ? stats.body?.data?.last_week : null;
  signals.downloads = downloadsSignal(typeof weekly === "number" ? weekly : null);
  return { found: true, latestVersion: doc.info?.version ?? null };
}

function computeVerdict(signals) {
  const hardFail =
    signals.exists.status === STATUS_FAIL ||
    signals.age.status === STATUS_FAIL ||
    signals.typosquat.status === STATUS_FAIL ||
    signals.vulnerabilities.status === STATUS_FAIL;
  if (hardFail) {
    return { verdict: VERDICT_REQUIRES_APPROVAL, exitCode: EXIT_REQUIRES_APPROVAL };
  }
  const statuses = Object.values(signals).map((s) => s.status);
  if (statuses.includes(STATUS_WARN) || statuses.includes(STATUS_UNKNOWN)) {
    return { verdict: VERDICT_CAUTION, exitCode: EXIT_CAUTION };
  }
  return { verdict: VERDICT_TRUSTED, exitCode: EXIT_TRUSTED };
}

const VERDICT_LABEL = {
  [VERDICT_TRUSTED]: "TRUSTED",
  [VERDICT_CAUTION]: "CAUTION",
  [VERDICT_REQUIRES_APPROVAL]: "REQUIRES APPROVAL",
};

const VERDICT_INSTRUCTION = {
  [VERDICT_TRUSTED]:
    "OK to install. No red flags found in public registry data.",
  [VERDICT_CAUTION]:
    "Install only if necessary. Report the warnings above to the human.",
  [VERDICT_REQUIRES_APPROVAL]:
    "Do not install. Ask the human to approve this dependency explicitly.",
};

const STATUS_LABEL = {
  [STATUS_PASS]: "PASS",
  [STATUS_WARN]: "WARN",
  [STATUS_FAIL]: "FAIL",
  [STATUS_UNKNOWN]: "UNKNOWN",
};

const STATUS_COLOR = {
  [STATUS_PASS]: "32",
  [STATUS_WARN]: "33",
  [STATUS_FAIL]: "31",
  [STATUS_UNKNOWN]: "36",
};

function colorize(code, text) {
  if (!process.stdout.isTTY) return text;
  return "\x1b[" + code + "m" + text + "\x1b[0m";
}

function printReport(name, eco, version, signals, verdict) {
  const lines = [];
  lines.push(colorize("1", "PRESCRIPTION CHECK"));
  lines.push("  package:   " + name);
  lines.push("  ecosystem: " + eco);
  lines.push("  version:   " + (version ?? "(not specified)"));
  lines.push("");
  for (const [key, sig] of Object.entries(signals)) {
    const label = STATUS_LABEL[sig.status].padEnd(STATUS_LABEL_WIDTH);
    const tagged = colorize(STATUS_COLOR[sig.status], label);
    lines.push("  " + tagged + " " + key.padEnd(SIGNAL_NAME_WIDTH) + " " + sig.detail);
  }
  lines.push("");
  lines.push(
    colorize("1", "VERDICT: " + VERDICT_LABEL[verdict]) + "\n" +
      VERDICT_INSTRUCTION[verdict],
  );
  process.stdout.write(lines.join("\n") + "\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.error) {
    process.stderr.write(args.error + "\n" + USAGE + "\n");
    process.exit(EXIT_USAGE_ERROR);
  }
  const { name, version } = splitSpec(args.spec);
  const signals = {
    exists: signal(STATUS_UNKNOWN, "not checked"),
    age: notApplicable(),
    maintenance: notApplicable(),
    downloads: notApplicable(),
    vulnerabilities: notApplicable(),
    typosquat: typosquatSignal(name, args.eco),
    repository: notApplicable(),
  };

  const gather = args.eco === "npm" ? gatherNpm : gatherPypi;
  const result = await gather(name, signals);
  if (result.found) {
    signals.vulnerabilities = await vulnerabilitiesSignal(
      name,
      args.eco,
      version,
      result.latestVersion,
    );
  }

  const { verdict, exitCode } = computeVerdict(signals);
  if (args.json) {
    const payload = {
      package: name,
      ecosystem: args.eco,
      version,
      signals,
      verdict,
      exitCode,
    };
    process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
  } else {
    printReport(name, args.eco, version, signals, verdict);
  }
  process.exit(exitCode);
}

main().catch((err) => {
  process.stderr.write("internal error: " + (err?.message ?? err) + "\n");
  process.exit(EXIT_USAGE_ERROR);
});

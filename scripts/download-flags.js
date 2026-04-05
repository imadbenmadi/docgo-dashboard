#!/usr/bin/env node

/**
 * Download flag SVG files from CDN and save to public/flags/ folder
 * Usage: node scripts/download-flags.js
 */

import https from "https";
import http from "http";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const flagsDir = join(__dirname, "../public/flags");

// Ensure directory exists
if (!fs.existsSync(flagsDir)) {
  fs.mkdirSync(flagsDir, { recursive: true });
}

// Country to flag country code mapping
const countryFlags = {
  France: "fr",
  Canada: "ca",
  Belgium: "be",
  Switzerland: "ch",
  Morocco: "ma",
  Algeria: "dz",
  Tunisia: "tn",
  Senegal: "sn",
  "Ivory Coast": "ci",
  Luxembourg: "lu",
  "United States": "us",
  "United Kingdom": "gb",
  Germany: "de",
  Spain: "es",
  Italy: "it",
  Netherlands: "nl",
  Austria: "at",
  Portugal: "pt",
  Greece: "gr",
  Sweden: "se",
  Norway: "no",
  Denmark: "dk",
  Finland: "fi",
  Poland: "pl",
  Turkey: "tr",
  Japan: "jp",
  China: "cn",
  India: "in",
  Brazil: "br",
  Mexico: "mx",
  "South Africa": "za",
  Australia: "au",
};

// CDN URL - using flagicons library from jsDelivr
const cdnBase = "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3";

let downloaded = 0;
let failed = 0;
const failedFlags = [];

const downloadFlag = (countryName, countryCode) => {
  return new Promise((resolve) => {
    const url = `${cdnBase}/${countryCode}.svg`;
    const fileName = join(flagsDir, `${countryCode}.svg`);

    const protocol = url.startsWith("https") ? https : http;

    const req = protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        console.error(
          `  ❌ ${countryName} (${countryCode}): HTTP ${res.statusCode}`,
        );
        failed++;
        failedFlags.push(countryName);
        resolve(false);
        return;
      }

      const fileStream = fs.createWriteStream(fileName);
      res.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close();
        console.log(`  ✅ ${countryName} (${countryCode})`);
        downloaded++;
        resolve(true);
      });

      fileStream.on("error", (err) => {
        fs.unlink(fileName, () => {});
        console.error(`  ❌ ${countryName} (${countryCode}): ${err.message}`);
        failed++;
        failedFlags.push(countryName);
        resolve(false);
      });
    });

    req.on("error", (err) => {
      console.error(`  ❌ ${countryName} (${countryCode}): ${err.message}`);
      failed++;
      failedFlags.push(countryName);
      resolve(false);
    });
  });
};

const downloadAllFlags = async () => {
  console.log("🚩 Downloading flag icons...\n");
  console.log(`Source: ${cdnBase}`);
  console.log(`Destination: ${flagsDir}\n`);

  const entries = Object.entries(countryFlags);
  for (const [countryName, countryCode] of entries) {
    await downloadFlag(countryName, countryCode);
  }

  console.log("\n📊 Download Summary:");
  console.log(`✅ Downloaded: ${downloaded}`);
  console.log(`❌ Failed: ${failed}`);

  if (failedFlags.length > 0) {
    console.log(`\nFailed countries: ${failedFlags.join(", ")}`);
  }

  console.log("\n✨ Done! Flags are ready in public/flags/");
};

downloadAllFlags();

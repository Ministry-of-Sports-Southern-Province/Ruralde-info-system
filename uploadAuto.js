// uploadAuto.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

// --- Setup Firebase Admin ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Path to your service account key
const serviceAccountPath = path.join(__dirname, "src", "serviceAccountKey.json");

// ✅ Load service account
const serviceAccount = JSON.parse(await fs.readFile(serviceAccountPath, "utf8"));

// ✅ Initialize Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// --- Base folder containing district data ---
const baseDir = path.join(__dirname, "src", "data");

// --- Upload a single division file ---
async function uploadDivision(district, divisionFile) {
  try {
    const divisionName = path.basename(divisionFile, ".json");
    const filePath = path.join(baseDir, district.toLowerCase(), divisionFile);

    // ✅ Check file exists
    try {
      await fs.access(filePath);
    } catch {
      console.error(`❌ File not found: ${filePath}`);
      return;
    }

    // ✅ Parse JSON
    const fileText = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(fileText);

    if (!Array.isArray(data)) {
      console.error(`❌ Invalid data format in ${divisionFile}`);
      return;
    }

    console.log(`📤 Uploading ${data.length} villages for ${divisionName} (${district})`);

    // ✅ Upload each document
    const ref = db
      .collection("districts")
      .doc(district)
      .collection("divisions")
      .doc(divisionName)
      .collection("villages");

    for (const item of data) {
      await ref.add({
        district,
        division: divisionName,
        ...item,
      });
    }

    console.log(`✅ Completed ${divisionName} (${district})`);
  } catch (err) {
    console.error(`🔥 Error in ${district}/${divisionFile}:`, err.message);
  }
}

// --- Upload all divisions from all districts ---
async function uploadAll() {
  const districts = ["Galle", "Matara", "Hambantota"];

  for (const district of districts) {
    const dir = path.join(baseDir, district.toLowerCase());

    try {
      const files = await fs.readdir(dir);
      const jsonFiles = files.filter((f) => f.endsWith(".json"));

      if (jsonFiles.length === 0) {
        console.warn(`⚠️ No JSON files found in ${dir}`);
        continue;
      }

      for (const file of jsonFiles) {
        await uploadDivision(district, file);
      }
    } catch (err) {
      console.warn(`⚠️ Skipping ${district} — Folder not found: ${dir}`);
    }
  }

  console.log("🎉 All districts and divisions uploaded successfully!");
}

uploadAll();

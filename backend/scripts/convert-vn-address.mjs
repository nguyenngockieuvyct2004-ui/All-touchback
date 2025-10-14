// Convert provided devvn-vn-address.json or SQL into a compact JSON for the frontend
// Usage (optional): node scripts/convert-vn-address.mjs path/to/devvn-vn-address.json > backend/frontend/public/data/vn-address.json
// Note: This script expects a JSON structure from common community dataset (devvn). If you only have SQL, import to MySQL and export as JSON or adapt a parser.

import fs from "fs";

function normalizeSpaces(s) {
  return (s || "").toString().replace(/\s+/g, " ").trim();
}

function buildFromFlat(data) {
  const provinces = data
    .filter((x) => x.level === 1)
    .map((x) => ({ code: String(x.code), name: normalizeSpaces(x.name) }));
  const districtsByProvince = {};
  const wardsByDistrict = {};
  data
    .filter((x) => x.level === 2)
    .forEach((d) => {
      const pid = String(d.parent_code);
      const list = districtsByProvince[pid] || (districtsByProvince[pid] = []);
      list.push({ code: String(d.code), name: normalizeSpaces(d.name) });
    });
  data
    .filter((x) => x.level === 3)
    .forEach((w) => {
      const did = String(w.parent_code);
      const list = wardsByDistrict[did] || (wardsByDistrict[did] = []);
      list.push({ code: String(w.code), name: normalizeSpaces(w.name) });
    });
  return { provinces, districtsByProvince, wardsByDistrict };
}

function buildFromNested(array) {
  // array: [{ Id/Code, Name, Districts: [{ Id/Code, Name, Wards: [{ Id/Code, Name }] }] }]
  const provinces = [];
  const districtsByProvince = {};
  const wardsByDistrict = {};
  for (const p of array) {
    const pCode = String(p.code || p.Id || p.id || p.Code);
    const pName = normalizeSpaces(
      p.name ||
        p.Name ||
        p.Name_with_type ||
        p.name_with_type ||
        p.ProvinceName ||
        p.Title
    );
    if (!pCode) continue;
    provinces.push({ code: pCode, name: pName });
    districtsByProvince[pCode] = [];
    for (const d of p.districts || p.Districts || []) {
      const dCode = String(d.code || d.Id || d.id || d.Code);
      const dName = normalizeSpaces(
        d.name ||
          d.Name ||
          d.Name_with_type ||
          d.name_with_type ||
          d.DistrictName ||
          d.Title
      );
      if (!dCode) continue;
      districtsByProvince[pCode].push({ code: dCode, name: dName });
      wardsByDistrict[dCode] = [];
      for (const w of d.wards || d.Wards || []) {
        const wCode = String(w.code || w.Id || w.id || w.Code);
        const wName = normalizeSpaces(
          w.name ||
            w.Name ||
            w.Name_with_type ||
            w.name_with_type ||
            w.WardName ||
            w.Title
        );
        if (!wCode) continue;
        wardsByDistrict[dCode].push({ code: wCode, name: wName });
      }
    }
  }
  return { provinces, districtsByProvince, wardsByDistrict };
}

function buildFromDevvnThreeTables(obj) {
  const t1 =
    obj["1_devvn_tinhthanhpho"] || obj.tinhthanh || obj.provinces || [];
  const t2 = obj["2_devvn_quanhuyen"] || obj.quanhuyen || obj.districts || [];
  const t3 = obj["3_devvn_xaphuongthitran"] || obj.xaphuong || obj.wards || [];
  const provinces = t1.map((p) => ({
    code: String(p.matp || p.code || p.id),
    name: normalizeSpaces(p.name || p.title || p.ten),
  }));
  const districtsByProvince = {};
  const wardsByDistrict = {};
  for (const p of t1) {
    districtsByProvince[String(p.matp || p.code || p.id)] = [];
  }
  for (const d of t2) {
    const pid = String(d.matp || d.parent_code || d.pid || d.parentId);
    const code = String(d.maqh || d.code || d.id);
    const name = normalizeSpaces(d.name || d.title || d.ten);
    if (!pid || !code) continue;
    (districtsByProvince[pid] || (districtsByProvince[pid] = [])).push({
      code,
      name,
    });
    if (!wardsByDistrict[code]) wardsByDistrict[code] = [];
  }
  for (const w of t3) {
    const did = String(w.maqh || w.parent_code || w.did || w.parentId);
    const code = String(w.xaid || w.code || w.id);
    const name = normalizeSpaces(w.name || w.title || w.ten);
    if (!did || !code) continue;
    (wardsByDistrict[did] || (wardsByDistrict[did] = [])).push({ code, name });
  }
  return { provinces, districtsByProvince, wardsByDistrict };
}

function build(data) {
  if (Array.isArray(data)) {
    // Either flat (has level) or nested (has Districts)
    if (data.length && (data[0].level || data[0].Level)) {
      const mapped = data.map((x) => ({
        code: x.code ?? x.Code ?? x.Id ?? x.id,
        name: x.name ?? x.Name ?? x.Title,
        level: Number(x.level ?? x.Level),
        parent_code: x.parent_code ?? x.ParentCode ?? x.parent_code,
      }));
      return buildFromFlat(mapped);
    }
    return buildFromNested(data);
  }
  // object: try 3-tables, else nested object maps
  const keys = Object.keys(data || {});
  const looksLikeThreeTables = keys.some((k) => /^\d+_devvn_/i.test(k));
  if (
    looksLikeThreeTables ||
    data["1_devvn_tinhthanhpho"] ||
    data["2_devvn_quanhuyen"] ||
    data["3_devvn_xaphuongthitran"]
  ) {
    return buildFromDevvnThreeTables(data);
  }
  // Nested object maps: { [provinceCode]: { name, districts|quan: { [districtCode]: { name, wards|phuong: { [wardCode]: { name } } } } } }
  const provinces = [];
  const districtsByProvince = {};
  const wardsByDistrict = {};
  for (const pCode of keys) {
    const p = data[pCode];
    if (!p || typeof p !== "object") continue;
    const pName = normalizeSpaces(
      p.name || p.Name || p.Title || p.full_name || p.fullName || p.ProvinceName
    );
    if (!pName) continue;
    provinces.push({ code: String(pCode), name: pName });
    const dMap =
      p.districts ||
      p.Districts ||
      p["quan-huyen"] ||
      p.quan ||
      p.district ||
      p.District ||
      {};
    districtsByProvince[String(pCode)] = [];
    for (const dCode of Object.keys(dMap)) {
      const d = dMap[dCode];
      const dName = normalizeSpaces(
        d?.name || d?.Name || d?.Title || d?.full_name || d?.DistrictName
      );
      if (!dName) continue;
      districtsByProvince[String(pCode)].push({
        code: String(dCode),
        name: dName,
      });
      const wMap =
        d.wards ||
        d.Wards ||
        d["xa-phuong"] ||
        d.phuong ||
        d.ward ||
        d.Ward ||
        {};
      wardsByDistrict[String(dCode)] = [];
      for (const wCode of Object.keys(wMap)) {
        const w = wMap[wCode];
        const wName = normalizeSpaces(
          w?.name || w?.Name || w?.Title || w?.full_name || w?.WardName
        );
        if (!wName) continue;
        wardsByDistrict[String(dCode)].push({
          code: String(wCode),
          name: wName,
        });
      }
    }
  }
  return { provinces, districtsByProvince, wardsByDistrict };
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Provide input JSON path");
  process.exit(1);
}
const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const out = build(raw);
process.stdout.write(JSON.stringify(out));

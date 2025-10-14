// Load VN administrative divisions from a static JSON placed under public/data/vn-address.json
// Data shape expected:
// { provinces: [{ code, name }], districtsByProvince: { [code]: [{ code, name }] }, wardsByDistrict: { [code]: [{ code, name }] } }

function normSpace(s) {
  return (s || "").toString().replace(/\s+/g, " ").trim();
}

function fromCompact(obj) {
  if (
    obj &&
    Array.isArray(obj.provinces) &&
    obj.districtsByProvince &&
    obj.wardsByDistrict
  ) {
    return obj;
  }
  return null;
}

function fromFlatArray(arr) {
  if (!Array.isArray(arr) || !arr.length) return null;
  const hasLevel = arr.some((x) => x.level != null || x.Level != null);
  if (!hasLevel) return null;
  const data = arr.map((x) => ({
    code: String(x.code ?? x.Code ?? x.Id ?? x.id),
    name: normSpace(x.name ?? x.Name ?? x.Title),
    level: Number(x.level ?? x.Level),
    parent: String(x.parent_code ?? x.ParentCode ?? x.pid ?? x.parentId ?? ""),
  }));
  const provinces = data
    .filter((x) => x.level === 1)
    .map((x) => ({ code: x.code, name: x.name }));
  const districtsByProvince = {};
  const wardsByDistrict = {};
  for (const d of data.filter((x) => x.level === 2)) {
    (districtsByProvince[d.parent] ||= []).push({ code: d.code, name: d.name });
  }
  for (const w of data.filter((x) => x.level === 3)) {
    (wardsByDistrict[w.parent] ||= []).push({ code: w.code, name: w.name });
  }
  return { provinces, districtsByProvince, wardsByDistrict };
}

function fromThreeTables(obj) {
  if (!obj || typeof obj !== "object") return null;
  const t1 = obj["1_devvn_tinhthanhpho"] || obj.tinhthanh || obj.provinces;
  const t2 = obj["2_devvn_quanhuyen"] || obj.quanhuyen || obj.districts;
  const t3 = obj["3_devvn_xaphuongthitran"] || obj.xaphuong || obj.wards;
  if (!Array.isArray(t1) || !Array.isArray(t2) || !Array.isArray(t3))
    return null;
  const provinces = t1.map((p) => ({
    code: String(p.matp || p.code || p.id),
    name: normSpace(p.name || p.title || p.ten),
  }));
  const districtsByProvince = {};
  const wardsByDistrict = {};
  for (const p of t1) {
    districtsByProvince[String(p.matp || p.code || p.id)] = [];
  }
  for (const d of t2) {
    const pid = String(d.matp || d.parent_code || d.pid || d.parentId);
    const code = String(d.maqh || d.code || d.id);
    const name = normSpace(d.name || d.title || d.ten);
    if (!pid || !code) continue;
    (districtsByProvince[pid] ||= []).push({ code, name });
    wardsByDistrict[code] ||= [];
  }
  for (const w of t3) {
    const did = String(w.maqh || w.parent_code || w.did || w.parentId);
    const code = String(w.xaid || w.code || w.id);
    const name = normSpace(w.name || w.title || w.ten);
    if (!did || !code) continue;
    (wardsByDistrict[did] ||= []).push({ code, name });
  }
  return { provinces, districtsByProvince, wardsByDistrict };
}

function fromNestedArray(arr) {
  if (!Array.isArray(arr) || !arr.length) return null;
  const looksNested = !!(arr[0].districts || arr[0].Districts);
  if (!looksNested) return null;
  const provinces = [];
  const districtsByProvince = {};
  const wardsByDistrict = {};
  for (const p of arr) {
    const pCode = String(p.code || p.Id || p.id || p.Code);
    const pName = normSpace(
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
      const dName = normSpace(
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
        const wName = normSpace(
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

function fromObjectMaps(obj) {
  if (!obj || typeof obj !== "object") return null;
  // Heuristic: keys are province codes mapping to objects with name + districts map
  const keys = Object.keys(obj);
  if (!keys.length) return null;
  const first = obj[keys[0]];
  // Case A: province object has inner 'districts' map
  const hasDistricts =
    first &&
    (first.districts ||
      first.Districts ||
      first["quan-huyen"] ||
      first.quan ||
      first.district);
  if (hasDistricts) {
    const provinces = [];
    const districtsByProvince = {};
    const wardsByDistrict = {};
    for (const pCode of keys) {
      const p = obj[pCode];
      const pName =
        normSpace(
          p?.name || p?.Name || p?.Title || p?.full_name || p?.ProvinceName
        ) || String(pCode);
      provinces.push({ code: String(pCode), name: pName });
      const dMap =
        p.districts ||
        p.Districts ||
        p["quan-huyen"] ||
        p.quan ||
        p.district ||
        {};
      districtsByProvince[pCode] = [];
      for (const dCode of Object.keys(dMap)) {
        const d = dMap[dCode];
        const dName =
          normSpace(
            d?.name || d?.Name || d?.Title || d?.full_name || d?.DistrictName
          ) || String(dCode);
        districtsByProvince[pCode].push({ code: String(dCode), name: dName });
        const wMap =
          d.wards || d.Wards || d["xa-phuong"] || d.phuong || d.ward || {};
        wardsByDistrict[dCode] = [];
        for (const wCode of Object.keys(wMap)) {
          const w = wMap[wCode];
          const wName =
            normSpace(
              w?.name || w?.Name || w?.Title || w?.full_name || w?.WardName
            ) || String(wCode);
          wardsByDistrict[dCode].push({ code: String(wCode), name: wName });
        }
      }
    }
    return { provinces, districtsByProvince, wardsByDistrict };
  }
  // Case B: Your file format — province key (slug) maps directly to a map of districts, each with wards
  const looksLikeProvinceSlugToDistrictMap =
    first &&
    typeof first === "object" &&
    Object.values(first).some(
      (v) => v && typeof v === "object" && (v.wards || v.Wards)
    );
  if (looksLikeProvinceSlugToDistrictMap) {
    const provinces = [];
    const districtsByProvince = {};
    const wardsByDistrict = {};
    const pretty = (slug) =>
      normSpace(
        String(slug)
          .replace(/_/g, " ")
          .replace(/([A-Z])(?!$)/g, "$1")
      );
    for (const slug of keys) {
      const pObj = obj[slug] || {};
      const pname = normSpace(pObj.name) || pretty(slug);
      provinces.push({ code: String(slug), name: pname });
      // District map may be nested under known keys or be the object itself (with a 'name' metadata key)
      const rawDistrictMap =
        pObj.districts ||
        pObj.Districts ||
        pObj["quan-huyen"] ||
        pObj.quan ||
        pObj.district ||
        pObj;
      districtsByProvince[slug] = [];
      for (const dCode of Object.keys(rawDistrictMap)) {
        if (dCode === "name") continue; // skip province display name
        const d = rawDistrictMap[dCode];
        if (!d || typeof d !== "object") continue;
        // Only take entries that look like districts (have wards)
        const wMap = d.wards || d.Wards;
        if (!wMap || typeof wMap !== "object") continue;
        const dName = normSpace(d?.name || d?.Title || d?.ten) || String(dCode);
        districtsByProvince[slug].push({ code: String(dCode), name: dName });
        wardsByDistrict[dCode] = [];
        for (const wCode of Object.keys(wMap)) {
          const w = wMap[wCode];
          const wName =
            normSpace(w?.name || w?.Title || w?.ten) || String(wCode);
          wardsByDistrict[dCode].push({ code: String(wCode), name: wName });
        }
      }
    }
    return { provinces, districtsByProvince, wardsByDistrict };
  }
  return null;
}

export async function loadVnAddress() {
  const res = await fetch("/data/vn-address.json");
  if (!res.ok) throw new Error("Không tải được dữ liệu địa chỉ");
  const raw = await res.json();
  return (
    fromCompact(raw) ||
    fromThreeTables(raw) ||
    (Array.isArray(raw)
      ? fromFlatArray(raw) || fromNestedArray(raw)
      : fromObjectMaps(raw)) || {
      provinces: [],
      districtsByProvince: {},
      wardsByDistrict: {},
    }
  );
}

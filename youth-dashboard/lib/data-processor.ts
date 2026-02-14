import { Respondent, DashboardStats, FilterState } from "./types";

export function normalizeGender(val: string): string {
  const v = val?.toLowerCase().trim();
  if (v === "male" || v === "m") return "Male";
  if (v === "female" || v === "f") return "Female";
  return val || "Unknown";
}

export function normalizeEmployment(val: string): string {
  const v = val?.toLowerCase().trim();
  if (v.includes("self employed") || v.includes("self-employed")) return "Self Employed";
  if (v.includes("employed") && !v.includes("un")) return "Employed";
  if (v.includes("unemployed")) return "Unemployed";
  if (v.includes("student")) return "Student";
  return val || "Unknown";
}

export function normalizeEducation(val: string): string {
  const v = val?.toUpperCase().trim();
  if (v.includes("PHD") || v.includes("DOCTORATE")) return "PhD";
  if (v.includes("MSC") || v.includes("MASTERS") || v.includes("M.SC")) return "MSc";
  if (v.includes("BSC") || v.includes("B.SC") || v.includes("DEGREE")) return "BSc";
  if (v.includes("HND")) return "HND";
  if (v.includes("OND")) return "OND";
  if (v.includes("SECONDARY") || v.includes("SSCE") || v.includes("WAEC")) return "Secondary";
  if (v.includes("TERTIARY")) return "Tertiary";
  return val || "Unknown";
}

export function normalizeBranch(val: string): string {
  if (!val) return "Unknown";
  const cleaned = val.trim()
    .replace(/dunamis\s+int['']?l\s+gospel\s+cent(er|re)/gi, "")
    .replace(/dunamis\s+international\s+gospel\s+(centre|center|church)/gi, "")
    .replace(/dunamis\s+(church|branch|location|int['']?l)/gi, "")
    .replace(/DIGC\s*/gi, "")
    .replace(/dunamis\s*/gi, "")
    .trim()
    .replace(/,\s*(lagos|ogun|ekiti|ondo|osun)\s*(state)?/gi, "")
    .replace(/,?\s*nigeria/gi, "")
    .trim();
  return cleaned || val.trim();
}

export function extractLocation(address: string): string {
  if (!address) return "Unknown";
  const addr = address.toLowerCase();
  const states = [
    { name: "Lagos", keywords: ["lagos", "ajah", "gbagada", "ikeja", "surulere", "festac", "apapa", "ikorodu", "isolo", "okokomaiko", "egbeda", "mushin", "yaba", "bariga", "shomolu"] },
    { name: "Ogun", keywords: ["ogun", "mowe", "ibafo", "sango ota", "abeokuta", "sagamu"] },
    { name: "Abuja (FCT)", keywords: ["abuja", "nyanya", "gwagwalada"] },
    { name: "Enugu", keywords: ["enugu"] },
    { name: "Ekiti", keywords: ["ekiti", "ado ekiti"] },
    { name: "Ondo", keywords: ["ondo", "akure"] },
    { name: "Osun", keywords: ["osun", "osogbo"] },
    { name: "Delta", keywords: ["agbor", "asaba"] },
  ];
  for (const state of states) {
    if (state.keywords.some(k => addr.includes(k))) return state.name;
  }
  return "Other";
}

export function parseRows(rows: string[][]): Respondent[] {
  if (!rows || rows.length < 2) return [];
  return rows.slice(1).map((row, i) => ({
    id: i + 1,
    timestamp: row[0] || "",
    fullName: row[1] || "",
    email: row[2] || "",
    address: row[3] || "",
    phone: row[4] || "",
    gender: normalizeGender(row[5] || ""),
    maritalStatus: row[6] || "",
    birthday: row[7] || "",
    employmentStatus: normalizeEmployment(row[8] || ""),
    education: normalizeEducation(row[9] || ""),
    courseOfStudy: row[10] || "",
    branch: normalizeBranch(row[11] || ""),
  }));
}

export function computeStats(respondents: Respondent[]): DashboardStats {
  const count = (arr: string[]) =>
    arr.reduce<Record<string, number>>((acc, val) => {
      const k = val || "Unknown";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

  const genderBreakdown = count(respondents.map(r => r.gender));
  const employmentBreakdown = count(respondents.map(r => r.employmentStatus));
  const educationBreakdown = count(respondents.map(r => r.education));
  const maritalBreakdown = count(respondents.map(r => r.maritalStatus));
  const branchBreakdown = count(respondents.map(r => r.branch));
  const locationBreakdown = count(respondents.map(r => extractLocation(r.address)));

  // Monthly registrations
  const monthlyRegistrations: Record<string, number> = {};
  respondents.forEach(r => {
    if (!r.timestamp) return;
    const parts = r.timestamp.split(/[/\s]/);
    if (parts.length >= 2) {
      const month = parseInt(parts[1]);
      const year = parts[2]?.split(" ")[0] || "2025";
      const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const key = `${monthNames[month - 1]} ${year}`;
      monthlyRegistrations[key] = (monthlyRegistrations[key] || 0) + 1;
    }
  });

  // Top branches
  const sortedBranches = Object.entries(branchBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / respondents.length) * 100),
    }));

  // Course categories
  const courseCats: Record<string, number> = {};
  respondents.forEach(r => {
    const c = r.courseOfStudy?.toLowerCase() || "";
    if (!c || c === "unknown") return;
    let cat = "Other";
    if (c.match(/computer|software|it|technology|information/)) cat = "ICT/Technology";
    else if (c.match(/business|accounting|commerce|management|admin|economics|finance|marketing/)) cat = "Business/Finance";
    else if (c.match(/science|biology|chemistry|biochemistry|physics|microbio|lab/)) cat = "Sciences";
    else if (c.match(/social|public admin|sociology|psychology|political/)) cat = "Social Sciences";
    else if (c.match(/engineering|civil|electrical|mechanical|polymer/)) cat = "Engineering";
    else if (c.match(/arts|english|theatre|mass comm|journalism|philosophy|language/)) cat = "Arts/Humanities";
    else if (c.match(/health|medical|nursing|radiography|pharmacy|nutrition/)) cat = "Health Sciences";
    else if (c.match(/education|mathematics/)) cat = "Education";
    else if (c.match(/law/)) cat = "Law";
    courseCats[cat] = (courseCats[cat] || 0) + 1;
  });

  return {
    total: respondents.length,
    genderBreakdown,
    employmentBreakdown,
    educationBreakdown,
    maritalBreakdown,
    branchBreakdown,
    locationBreakdown,
    monthlyRegistrations,
    topBranches: sortedBranches,
    courseCategories: courseCats,
  };
}

export function filterRespondents(respondents: Respondent[], filters: FilterState): Respondent[] {
  return respondents.filter(r => {
    if (filters.gender && filters.gender !== "all" && r.gender !== filters.gender) return false;
    if (filters.employment && filters.employment !== "all" && r.employmentStatus !== filters.employment) return false;
    if (filters.education && filters.education !== "all" && r.education !== filters.education) return false;
    if (filters.marital && filters.marital !== "all" && r.maritalStatus !== filters.marital) return false;
    if (filters.branch && filters.branch !== "all" && !r.branch.toLowerCase().includes(filters.branch.toLowerCase())) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!r.fullName.toLowerCase().includes(s) &&
          !r.email.toLowerCase().includes(s) &&
          !r.branch.toLowerCase().includes(s) &&
          !r.address.toLowerCase().includes(s)) return false;
    }
    return true;
  });
}

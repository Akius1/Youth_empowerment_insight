import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "respondents";

  const baseUrl = new URL(request.url).origin;
  const dataRes = await fetch(`${baseUrl}/api/data?static=true`);
  const { respondents, stats } = await dataRes.json();

  let csvContent = "";
  if (type === "stats") {
    csvContent = generateStatsCsv(stats);
  } else {
    csvContent = generateRespondentsCsv(respondents);
  }

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="youth-empowerment-${type}-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

function generateRespondentsCsv(respondents: any[]): string {
  const headers = ["S/N", "Full Name", "Email", "Phone", "Gender", "Marital Status", "Employment Status", "Education Level", "Course of Study", "Branch", "Address", "Timestamp"];
  const rows = respondents.map((r: any, i: number) => [
    i + 1, r.fullName, r.email, r.phone, r.gender, r.maritalStatus,
    r.employmentStatus, r.education, r.courseOfStudy, r.branch, r.address, r.timestamp,
  ]);
  return [headers, ...rows].map(row => row.map((cell: any) => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
}

function generateStatsCsv(stats: any): string {
  const lines: string[] = ["YOUTH EMPOWERMENT FORM - SUMMARY STATISTICS", `Generated: ${new Date().toLocaleString()}`, "", "GENDER BREAKDOWN", "Gender,Count"];
  Object.entries(stats.genderBreakdown).forEach(([k, v]) => lines.push(`${k},${v}`));
  lines.push("", "EMPLOYMENT STATUS", "Status,Count");
  Object.entries(stats.employmentBreakdown).forEach(([k, v]) => lines.push(`${k},${v}`));
  lines.push("", "EDUCATION LEVEL", "Level,Count");
  Object.entries(stats.educationBreakdown).forEach(([k, v]) => lines.push(`${k},${v}`));
  lines.push("", "TOP BRANCHES", "Branch,Count,Percentage");
  stats.topBranches.forEach((b: any) => lines.push(`${b.name},${b.count},${b.percentage}%`));
  return lines.join("\n");
}

import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;
  const dataRes = await fetch(`${baseUrl}/api/data?static=true`);
  const { respondents, stats } = await dataRes.json();

  const wb = XLSX.utils.book_new();

  // Sheet 1: All Respondents
  const respondentData = respondents.map((r: any, i: number) => ({
    "S/N": i + 1,
    "Full Name": r.fullName,
    "Email": r.email,
    "Phone": r.phone,
    "Gender": r.gender,
    "Marital Status": r.maritalStatus,
    "Employment Status": r.employmentStatus,
    "Education Level": r.education,
    "Course of Study": r.courseOfStudy,
    "Branch": r.branch,
    "Address": r.address,
    "Timestamp": r.timestamp,
  }));
  const ws1 = XLSX.utils.json_to_sheet(respondentData);
  ws1["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 35 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 40 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Respondents");

  // Sheet 2: Summary Statistics
  const statsRows: any[] = [
    { Category: "TOTAL RESPONDENTS", Item: "Total", Count: respondents.length },
    { Category: "", Item: "", Count: "" },
    { Category: "GENDER", Item: "", Count: "" },
    ...Object.entries(stats.genderBreakdown).map(([k, v]) => ({ Category: "Gender", Item: k, Count: v })),
    { Category: "", Item: "", Count: "" },
    { Category: "EMPLOYMENT STATUS", Item: "", Count: "" },
    ...Object.entries(stats.employmentBreakdown).map(([k, v]) => ({ Category: "Employment", Item: k, Count: v })),
    { Category: "", Item: "", Count: "" },
    { Category: "EDUCATION LEVEL", Item: "", Count: "" },
    ...Object.entries(stats.educationBreakdown).map(([k, v]) => ({ Category: "Education", Item: k, Count: v })),
    { Category: "", Item: "", Count: "" },
    { Category: "MARITAL STATUS", Item: "", Count: "" },
    ...Object.entries(stats.maritalBreakdown).map(([k, v]) => ({ Category: "Marital", Item: k, Count: v })),
  ];
  const ws2 = XLSX.utils.json_to_sheet(statsRows);
  ws2["!cols"] = [{ wch: 25 }, { wch: 30 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Summary Statistics");

  // Sheet 3: Branch Analysis
  const branchData = stats.topBranches.map((b: any) => ({
    Branch: b.name,
    Count: b.count,
    Percentage: `${b.percentage}%`,
  }));
  const ws3 = XLSX.utils.json_to_sheet(branchData);
  ws3["!cols"] = [{ wch: 40 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Branch Analysis");

  // Sheet 4: Location Breakdown
  const locationData = Object.entries(stats.locationBreakdown)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([k, v]) => ({ State: k, Count: v, Percentage: `${Math.round(((v as number) / respondents.length) * 100)}%` }));
  const ws4 = XLSX.utils.json_to_sheet(locationData);
  XLSX.utils.book_append_sheet(wb, ws4, "Location Breakdown");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="youth-empowerment-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}

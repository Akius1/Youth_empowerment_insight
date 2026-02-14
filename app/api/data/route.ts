import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/google-sheets";
import { parseRows, computeStats, filterRespondents } from "@/lib/data-processor";
import { FilterState } from "@/lib/types";
import { STATIC_ROWS } from "@/lib/static-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  let rows: string[][];

  if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
    rows = STATIC_ROWS;
  } else {
    try {
      rows = await getSheetData();
      if (!rows || rows.length < 2) rows = STATIC_ROWS;
    } catch (error) {
      console.error("Google Sheets error, using static data:", error);
      rows = STATIC_ROWS;
    }
  }

  const respondents = parseRows(rows);

  const filters: FilterState = {
    gender: searchParams.get("gender") || "all",
    employment: searchParams.get("employment") || "all",
    education: searchParams.get("education") || "all",
    branch: searchParams.get("branch") || "all",
    marital: searchParams.get("marital") || "all",
    search: searchParams.get("search") || "",
  };

  const filtered = filterRespondents(respondents, filters);
  const stats = computeStats(filtered);

  return NextResponse.json({
    respondents: filtered,
    stats,
    total: respondents.length,
    filteredCount: filtered.length,
    lastUpdated: new Date().toISOString(),
  });
}

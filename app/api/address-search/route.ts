import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIP } from "@/app/lib/rateLimit";

export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);
  const limit = rateLimit(`address:${clientIP}`, 30, 60000);
  
  if (!limit.success) {
    return NextResponse.json(
      { results: [], error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q");
  
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const viewbox = "5.6,43.9,6.8,43.0";
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=8&countrycodes=fr&addressdetails=1&viewbox=${viewbox}&bounded=1`,
      {
        headers: {
          "Accept": "application/json",
          "User-Agent": "RepairPro/1.0"
        }
      }
    );

    if (!response.ok) {
      throw new Error("API error");
    }

    const data = await response.json();
    
    const results = data.map((item: { display_name: string; lat: string; lon: string; type: string }) => ({
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
      type: item.type,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Address search error:", error);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 });
  }
}

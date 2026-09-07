export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerLine = headers.map(csvEscape).join(",");
  const bodyLines = rows.map((row) =>
    row.map((cell) => csvEscape(cell)).join(",")
  );
  return [headerLine, ...bodyLines].join("\r\n");
}

export function downloadCsvResponse(csv: string, filename: string) {
  // Ensure UTF-8 BOM so Excel renders Unicode correctly
  const csvWithBom = "\uFEFF" + csv;
  return new Response(csvWithBom, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
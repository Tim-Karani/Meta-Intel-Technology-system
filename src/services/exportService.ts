// Real CSV export generator for Meta Intel Technologies Field Platform

export class ExportService {
  public static downloadCSV(filename: string, headers: string[], rows: (string | number | boolean)[][]) {
    const csvContent = [
      headers.map(this.escapeCSV).join(','),
      ...rows.map(row => row.map(this.escapeCSV).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private static escapeCSV(val: string | number | boolean | null | undefined): string {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  }
}

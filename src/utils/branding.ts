export function formatBrandingText(text: string, appName: string): string {
  if (!text || !appName) return text;
  const cleanAppName = appName.trim();
  const shortName = cleanAppName.split(' ')[0] || cleanAppName;
  const upperBrandNoSpace = cleanAppName.toUpperCase().replace(/\s+/g, '');
  const lowerBrandNoSpace = cleanAppName.toLowerCase().replace(/\s+/g, '');
  let formatted = text;
  formatted = formatted.replace(/sonupharmacy/gi, () => lowerBrandNoSpace);
  formatted = formatted.replace(/sonumedicals/gi, () => lowerBrandNoSpace);
  formatted = formatted.replace(/parthapharmacy/gi, () => lowerBrandNoSpace);
  formatted = formatted.replace(/Basanti\s+(Medicals|Pharmacy|Medical Store|Health|Medical)/gi, cleanAppName);
  formatted = formatted.replace(/Basanti\s+(Medicals|Pharmacy|Medical Store|Health|Medical)/gi, cleanAppName);
  formatted = formatted.replace(/SONU\s+PREMIUM\s+CLUB/gi, cleanAppName.toUpperCase() + " PREMIUM CLUB");
  formatted = formatted.replace(/PARTHA\s+PREMIUM\s+CLUB/gi, cleanAppName.toUpperCase() + " PREMIUM CLUB");
  formatted = formatted.replace(/SONU/g, upperBrandNoSpace);
  formatted = formatted.replace(/PARTHA/g, upperBrandNoSpace);
  formatted = formatted.replace(/Basanti/g, shortName);
  formatted = formatted.replace(/Basanti/g, shortName);
  formatted = formatted.replace(/sonu/g, lowerBrandNoSpace);
  formatted = formatted.replace(/partha/g, lowerBrandNoSpace);
  return formatted;
}

export function formatAnyValue(val: any, appName: string): any {
  if (!val || !appName) return val;
  if (typeof val === 'string') return formatBrandingText(val, appName);
  if (Array.isArray(val)) return val.map(item => formatAnyValue(item, appName));
  if (typeof val === 'object') {
    const formatted: any = {};
    for (const key of Object.keys(val)) {
      if (['appName', 'id', 'image', 'imageUrl', 'customLogoUrl', 'primaryColorHex', 'upiQrCode', 'role', 'email', 'password', 'mode', 'status'].includes(key)) {
        formatted[key] = val[key];
      } else {
        formatted[key] = formatAnyValue(val[key], appName);
      }
    }
    return formatted;
  }
  return val;
}

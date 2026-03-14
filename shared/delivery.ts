/**
 * Calcular distância entre dois pontos usando a fórmula Haversine
 * @param lat1 Latitude do ponto 1
 * @param lon1 Longitude do ponto 1
 * @param lat2 Latitude do ponto 2
 * @param lon2 Longitude do ponto 2
 * @returns Distância em km
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Multiplicar por 0.8 para aproximar da realidade
  return distance * 0.8;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calcular taxa de entrega baseada na distância
 * Até 5 km → R$ 12,00
 * Acima de 5 km → R$ 12,00 + R$ 2,00 por km adicional
 * @param distanceKm Distância em km
 * @param zones Zonas de entrega (opcional)
 * @returns Taxa de entrega em reais
 */
export function calculateDeliveryFee(
  distanceKm: number,
  zones?: Array<{ minDistanceKm: number; maxDistanceKm: number; baseFee: string; perKmFee?: string }>
): number {
  if (zones && zones.length > 0) {
    const zone = zones.find(
      (z) => distanceKm >= z.minDistanceKm && distanceKm <= z.maxDistanceKm
    );
    if (zone) {
      const baseFee = Number(zone.baseFee);
      const perKmFee = Number(zone.perKmFee || 0);
      const additionalKm = Math.max(0, distanceKm - zone.minDistanceKm);
      return baseFee + additionalKm * perKmFee;
    }
  }

  const BASE_FEE = 12;
  const ADDITIONAL_FEE_PER_KM = 2;
  const THRESHOLD_KM = 5;

  if (distanceKm <= THRESHOLD_KM) {
    return BASE_FEE;
  }

  const additionalKm = distanceKm - THRESHOLD_KM;
  return BASE_FEE + additionalKm * ADDITIONAL_FEE_PER_KM;
}

/**
 * Calcular comissão do marketplace
 * @param total Valor total do pedido
 * @param commissionPercentage Percentual de comissão (padrão 10%)
 * @returns Valor da comissão
 */
export function calculateCommission(
  total: number,
  commissionPercentage: number = 10
): number {
  return (total * commissionPercentage) / 100;
}

/**
 * Calcular valor líquido para o lojista
 * @param total Valor total do pedido
 * @param commissionPercentage Percentual de comissão (padrão 10%)
 * @returns Valor líquido para o lojista
 */
export function calculateNetValue(
  total: number,
  commissionPercentage: number = 10
): number {
  return total - calculateCommission(total, commissionPercentage);
}

export type BarangayPerformance = {
  name: string;
  coordinates: [number, number];
  collectionRate: number;
  assessedAmount: number;
  collectedAmount: number;  
};

export const STA_RITA_BARANGAY_DATA: BarangayPerformance[] = [
  { name: 'Alegria', coordinates: [11.3753963, 124.9942696] },
  { name: 'Anibongan', coordinates: [11.4691187, 124.9963205] },
  { name: 'Aslum', coordinates: [11.4337161, 124.9962983] },
  { name: 'Bagolibas', coordinates: [11.3942155, 125.0012056] },
  { name: 'Binanalan', coordinates: [11.4939885, 125.0273470] },
  { name: 'Cabacungan', coordinates: [11.3842767, 125.0076798] },
  { name: 'Cabunga-an', coordinates: [11.4691011, 124.8831102] },
  { name: 'Camayse', coordinates: [11.4692933, 125.0074848] },
  { name: 'Cansadong', coordinates: [11.4935259, 124.9049655] },
  { name: 'Caticugan', coordinates: [11.3324706, 125.0136457] },
  { name: 'Dampigan', coordinates: [11.3321189, 124.9903609] },
  { name: 'Guinbalot-an', coordinates: [11.4333593, 124.9778961] },
  { name: 'Hinangudtan', coordinates: [11.4674838, 124.9162914] },
  { name: 'Igang-igang', coordinates: [11.4651019, 124.8622936] },
  { name: 'La Paz', coordinates: [11.3988559, 124.9877928] },
  { name: 'Lupig', coordinates: [11.4283624, 125.0123349] },
  { name: 'Magsaysay', coordinates: [11.3622912, 125.0263337] },
  { name: 'Maligaya', coordinates: [11.4587867, 125.0528940] },
  { name: 'New Manunca', coordinates: [11.4444289, 125.0125344] },
  { name: 'Old Manunca', coordinates: [11.4380195, 125.0153845] },
  { name: 'Pagsulhogon', coordinates: [11.3728397, 125.0213201] },
  { name: 'Salvacion', coordinates: [11.4364937, 124.9644831] },
  { name: 'San Eduardo', coordinates: [11.4740910, 125.0410392] },
  { name: 'San Isidro', coordinates: [11.5062627, 125.0263517] },
  { name: 'San Juan', coordinates: [11.3186042, 124.9775722] },
  { name: 'San Pascual (Crossing)', coordinates: [11.4036400, 124.9964841] },
  { name: 'San Pedro', coordinates: [11.3079778, 124.9832423] },
  { name: 'San Roque', coordinates: [11.4525000, 124.9450000] },
  { name: 'Santa Elena', coordinates: [11.3553584, 125.0105753] },
  { name: 'Tagacay', coordinates: [11.4938223, 124.8843140] },
  { name: 'Tominamos', coordinates: [11.4523264, 125.0204000] },
  { name: 'Tulay', coordinates: [11.4691438, 125.0195549] },
  { name: 'Union', coordinates: [11.4457647, 125.0825161] },
  { name: 'Bokinggan Poblacion (Zone I)', coordinates: [11.4525024, 124.9449563] },
  { name: 'Bougainvilla Poblacion (Zone II)', coordinates: [11.4513904, 124.9425396] },
  { name: 'Gumamela Poblacion (Zone III)', coordinates: [11.4621237, 124.9451521] },
  { name: 'Rosal Poblacion (Zone IV)', coordinates: [11.4693052, 124.9532551] },
  { name: 'Santan Poblacion (Zone V)', coordinates: [11.4515928, 124.9407345] },
].map((b, i): BarangayPerformance => {
  const collectionRate = 60 + ((i * 9) % 36);
  const assessedAmount = 750000 + i * 42500;
  return {
    ...b,
    coordinates: b.coordinates as [number, number],
    collectionRate,
    assessedAmount,
    collectedAmount: Math.round((assessedAmount * collectionRate) / 100),
  };
});

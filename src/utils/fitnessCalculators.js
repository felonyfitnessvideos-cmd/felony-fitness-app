/**
 * @file fitnessCalculators.js
 * @description Pure function utility for fitness calculations
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @project Felony Fitness
 */

/**
 * Calculate One Rep Max (1RM) using Epley Formula
 * @param {number} weight - Weight lifted
 * @param {number} reps - Number of repetitions
 * @returns {number} Estimated 1RM
 * 
 * @example
 * calculate1RM(225, 5) // Returns 264
 */
export const calculate1RM = (weight, reps) => {
  if (!weight || !reps || isNaN(weight) || isNaN(reps)) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};

/**
 * Generate percentage chart for training at different intensities
 * @param {number} oneRepMax - One rep max value
 * @returns {Array<Object>} Array of percentage/weight/reps/zone objects
 * 
 * @example
 * getPercentageChart(300)
 * // Returns [{ label: '95%', weight: 285, reps: '1-3', zone: 'Max Strength' }, ...]
 */
export const getPercentageChart = (oneRepMax) => {
  if (!oneRepMax || isNaN(oneRepMax)) return [];
  
  const trainingZones = [
    { percentage: 0.95, reps: '1-3', zone: 'Max Strength' },
    { percentage: 0.90, reps: '3-5', zone: 'Strength' },
    { percentage: 0.85, reps: '5-6', zone: 'Strength & Size' },
    { percentage: 0.80, reps: '7-8', zone: 'Hypertrophy' },
    { percentage: 0.75, reps: '8-10', zone: 'Hypertrophy' },
    { percentage: 0.70, reps: '10-12', zone: 'Endurance' },
    { percentage: 0.65, reps: '12-15', zone: 'Muscular Endurance' }
  ];
  
  return trainingZones.map(zone => ({
    label: `${zone.percentage * 100}%`,
    weight: Math.round(oneRepMax * zone.percentage),
    reps: zone.reps,
    zone: zone.zone
  }));
};

/**
 * Calculate Lean Body Mass and TDEE using Boer and Katch-McArdle formulas
 * @param {number} weightLbs - Body weight in pounds
 * @param {number} heightInches - Height in inches
 * @param {string} gender - 'male' or 'female'
 * @param {number} activityMult - Activity multiplier (1.2-1.9)
 * @param {number|null} bodyFatPercent - Optional body fat % for accurate LBM (5-50)
 * @returns {Object} LBM, BMR, TDEE values, and method used
 * 
 * @example
 * // With body fat % (more accurate)
 * calculateBodyComp(180, 72, 'male', 1.5, 15)
 * // Returns { lbmLbs: 153, bmr: 1966, tdee: 2950, method: 'actual' }
 * 
 * // Without body fat % (estimated)
 * calculateBodyComp(180, 72, 'male', 1.5)
 * // Returns { lbmLbs: 150, bmr: 1850, tdee: 2775, method: 'estimated' }
 */
export const calculateBodyComp = (weightLbs, heightInches, gender, activityMult, bodyFatPercent = null) => {
  if (!weightLbs || !heightInches || !gender || !activityMult) {
    return { lbmLbs: 0, bmr: 0, tdee: 0, method: 'none' };
  }

  if (isNaN(weightLbs) || isNaN(heightInches) || isNaN(activityMult)) {
    return { lbmLbs: 0, bmr: 0, tdee: 0, method: 'none' };
  }

  const wKg = weightLbs * 0.453592;
  let lbmKg;
  let method;
  
  // If body fat % provided, use actual calculation (more accurate)
  if (bodyFatPercent !== null && !isNaN(bodyFatPercent) && bodyFatPercent >= 5 && bodyFatPercent <= 50) {
    // Actual LBM = Weight × (1 - BodyFat%/100)
    lbmKg = wKg * (1 - (bodyFatPercent / 100));
    method = 'actual';
  } else {
    // Fall back to Boer Formula estimation
    const hCm = heightInches * 2.54;
    lbmKg = gender === 'male' 
      ? (0.407 * wKg) + (0.267 * hCm) - 19.2
      : (0.252 * wKg) + (0.473 * hCm) - 48.3;
    method = 'estimated';
  }
  
  const lbmLbs = Math.round(lbmKg * 2.20462);
  const bmr = 370 + (21.6 * lbmKg); // Katch-McArdle uses LBM
  const tdee = Math.round(bmr * activityMult);
  
  // BMI = (weight in lbs / (height in inches)²) × 703
  const bmi = ((weightLbs / (heightInches * heightInches)) * 703).toFixed(1);

  return { lbmLbs, bmr: Math.round(bmr), tdee, bmi, method };
};

/**
 * Calculate heart rate training zones using Karvonen formula
 * @param {number} age - Age in years
 * @param {number} restingHR - Resting heart rate
 * @returns {Object} Max HR and training zones
 * 
 * @example
 * calculateHeartZones(30, 60)
 * // Returns { maxHR: 190, zones: [...] }
 */
export const calculateHeartZones = (age, restingHR) => {
  if (!age || !restingHR || isNaN(age) || isNaN(restingHR)) {
    return { maxHR: 0, zones: [] };
  }

  const maxHR = 220 - age;
  const reserve = maxHR - restingHR;
  
  const getZone = (min, max) => ({
    min: Math.round((reserve * min) + restingHR),
    max: Math.round((reserve * max) + restingHR)
  });

  return {
    maxHR,
    zones: [
      { name: 'Zone 1 (Recovery)', ...getZone(0.50, 0.60) },
      { name: 'Zone 2 (Endurance)', ...getZone(0.60, 0.70) },
      { name: 'Zone 3 (Aerobic)', ...getZone(0.70, 0.80) },
      { name: 'Zone 4 (Threshold)', ...getZone(0.80, 0.90) },
      { name: 'Zone 5 (VO2 Max)', ...getZone(0.90, 1.00) },
    ]
  };
};

/**
 * Calculate macro split using residual method
 * Protein locked to LBM, Fat at 30% TDEE, Carbs fill remainder
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {number} lbmLbs - Lean Body Mass in pounds
 * @param {number} goalAdjustment - Calorie adjustment for goal (+/- calories)
 * @param {number} proteinRatio - Protein multiplier (default 1.0g per lb LBM)
 * @returns {Object} Complete macro breakdown
 * 
 * @example
 * calculateMacros(2500, 150, -500, 1.0)
 * // Returns { totalCals: 2000, protein: {...}, fat: {...}, carbs: {...} }
 */
export const calculateMacros = (tdee, lbmLbs, goalAdjustment = 0, proteinRatio = 1.0) => {
  if (!tdee || !lbmLbs || isNaN(tdee) || isNaN(lbmLbs)) {
    return {
      totalCals: 0,
      protein: { g: 0, cals: 0, pct: 0 },
      fat: { g: 0, cals: 0, pct: 0 },
      carbs: { g: 0, cals: 0, pct: 0 },
    };
  }

  const totalCals = tdee + (goalAdjustment || 0);
  
  // Protein: 1g (or ratio) per lb of LBM
  const proteinG = Math.round(lbmLbs * (proteinRatio || 1.0));
  const proteinCals = proteinG * 4;

  // Fat: 30% of Total Budget
  const fatCals = Math.round(totalCals * 0.30);
  const fatG = Math.round(fatCals / 9);

  // Carbs: Remainder
  const usedCals = proteinCals + fatCals;
  const carbCals = Math.max(0, totalCals - usedCals);
  const carbG = Math.round(carbCals / 4);

  return {
    totalCals,
    protein: { g: proteinG, cals: proteinCals, pct: Math.round((proteinCals/totalCals)*100) },
    fat: { g: fatG, cals: fatCals, pct: Math.round((fatCals/totalCals)*100) },
    carbs: { g: carbG, cals: carbCals, pct: Math.round((carbCals/totalCals)*100) },
  };
};

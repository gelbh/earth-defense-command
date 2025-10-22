/**
 * Risk calculation utilities for Earth Defense Command
 */

export const calculateAsteroidRisk = (asteroid) => {
  const { diameter, velocity, missDistance, isHazardous } = asteroid;
  
  let riskScore = 0;
  
  // Size factor (larger = more dangerous)
  if (diameter > 1000) riskScore += 3;
  else if (diameter > 500) riskScore += 2;
  else if (diameter > 100) riskScore += 1;
  
  // Velocity factor (faster = more dangerous)
  if (velocity > 20) riskScore += 3;
  else if (velocity > 15) riskScore += 2;
  else if (velocity > 10) riskScore += 1;
  
  // Miss distance factor (closer = more dangerous)
  if (missDistance < 1000000) riskScore += 3; // Less than 1M km
  else if (missDistance < 5000000) riskScore += 2; // Less than 5M km
  else if (missDistance < 10000000) riskScore += 1; // Less than 10M km
  
  // Hazardous flag
  if (isHazardous) riskScore += 2;
  
  // Determine risk level
  if (riskScore >= 7) return 'critical';
  if (riskScore >= 4) return 'moderate';
  if (riskScore >= 2) return 'low';
  return 'safe';
};

export const getRiskColor = (riskLevel) => {
  const colors = {
    safe: '#00FF88',      // Green
    low: '#FFD700',       // Yellow
    moderate: '#FF8C00',  // Orange
    critical: '#FF0040'   // Red
  };
  return colors[riskLevel] || colors.safe;
};

export const getRiskDescription = (riskLevel) => {
  const descriptions = {
    safe: 'No immediate threat',
    low: 'Low risk - monitor closely',
    moderate: 'Moderate risk - prepare defenses',
    critical: 'CRITICAL THREAT - immediate action required'
  };
  return descriptions[riskLevel] || descriptions.safe;
};

export const calculateImpactDamage = (asteroid) => {
  const { diameter, velocity } = asteroid;
  
  // Simplified damage calculation based on kinetic energy
  // KE = 0.5 * mass * velocity^2
  // Assuming density of 2000 kg/m³ for asteroids
  const density = 2000; // kg/m³
  const radius = diameter / 2; // meters
  const volume = (4/3) * Math.PI * Math.pow(radius, 3); // m³
  const mass = volume * density; // kg
  const velocityMs = velocity * 1000; // m/s
  const kineticEnergy = 0.5 * mass * Math.pow(velocityMs, 2); // Joules
  
  // Convert to damage percentage (0-100)
  // This is a simplified model for game purposes
  const damage = Math.min(100, Math.max(0, (kineticEnergy / 1e15) * 10));
  
  return Math.round(damage);
};

export const calculateDeflectionDifficulty = (asteroid) => {
  const { diameter, velocity, missDistance } = asteroid;
  
  let difficulty = 0.5; // Base 50% success rate
  
  // Larger asteroids are harder to deflect
  if (diameter > 1000) difficulty -= 0.3;
  else if (diameter > 500) difficulty -= 0.2;
  else if (diameter > 100) difficulty -= 0.1;
  
  // Faster asteroids are harder to deflect
  if (velocity > 20) difficulty -= 0.2;
  else if (velocity > 15) difficulty -= 0.1;
  
  // Closer asteroids have less time for deflection
  if (missDistance < 1000000) difficulty -= 0.2;
  else if (missDistance < 5000000) difficulty -= 0.1;
  
  return Math.max(0.1, Math.min(0.9, difficulty)); // Clamp between 10% and 90%
};

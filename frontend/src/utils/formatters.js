export const formatDistance = (parsecs) => {
  if (!parsecs) return 'Unknown';
  const lightYears = (parsecs * 3.26156).toFixed(2);
  return `${lightYears} ly`;
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return 'Unknown';
  return num.toLocaleString();
};

export const formatRadius = (earthRadii) => {
  if (!earthRadii) return 'Unknown';
  return `${earthRadii.toFixed(2)} R⊕`;
};

export const formatMass = (earthMasses) => {
  if (!earthMasses) return 'Unknown';
  return `${earthMasses.toFixed(2)} M⊕`;
};

export const formatTemperature = (kelvin) => {
  if (!kelvin) return 'Unknown';
  return `${kelvin} K`;
};

export const getPlanetSizeCategory = (radius) => {
  if (!radius) return 'Unknown';
  if (radius < 1.25) return 'Earth-size';
  if (radius < 2) return 'Super-Earth';
  if (radius < 6) return 'Neptune-size';
  return 'Jupiter-size';
};

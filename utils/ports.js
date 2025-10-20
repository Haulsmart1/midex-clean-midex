// Port coordinates (lat, lng) for known ferry corridors.

export const PORTS = {
  HOLYHEAD:   { lat: 53.306, lng: -4.632 },
  DUBLIN:     { lat: 53.346, lng: -6.195 },
  CAIRNRYAN:  { lat: 54.969, lng: -5.028 },
  LARNE:      { lat: 54.854, lng: -5.812 },
};

export const CORRIDORS = {
  'Holyhead-Dublin': { A: PORTS.HOLYHEAD, B: PORTS.DUBLIN },
  'Dublin-Holyhead': { A: PORTS.DUBLIN,   B: PORTS.HOLYHEAD },
  'Cairnryan-Larne': { A: PORTS.CAIRNRYAN, B: PORTS.LARNE },
  'Larne-Cairnryan': { A: PORTS.LARNE,     B: PORTS.CAIRNRYAN },
};

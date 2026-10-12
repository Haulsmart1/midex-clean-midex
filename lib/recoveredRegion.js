// Recovered from the existing production page factory; framework imports remapped locally.
const interopDefault = value => () => value.default || value;

function n() {
  let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
  return e.toString().toUpperCase().replace(/\s+/g, "").trim();
}
null;
let o = ["A41", "A42", "A45", "A63", "C15", "D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D11", "D12", "D13", "D14", "D15", "D16", "D17", "D18", "D20", "D22", "D24", "D6W", "E21", "E25", "E32", "E34", "E41", "E45", "F12", "F23", "F26", "F28", "F31", "F35", "F42", "F45", "F52", "F56", "G04", "H12", "H14", "H16", "H18", "H23", "H53", "H54", "H62", "H65", "K32", "K34", "K36", "N37", "N39", "N41", "N91", "N92", "P12", "P14", "P17", "P24", "P25", "P31", "P32", "P36", "P43", "P47", "P51", "P56", "P61", "R14", "R21", "R32", "R35", "R42", "R45", "R51", "R56", "R93", "T12", "T23", "T34", "T45", "T56", "V14", "V15", "V23", "V31", "V35", "V42", "V92", "V93", "V94", "V95", "W12", "W23", "W34", "W91", "X35", "X42", "X91", "Y14", "Y21", "Y25", "Y34"];
function i() {
  let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
  return e ? !function () {
    let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
    return n(e).startsWith("BT");
  }(e) ? !function () {
    let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "",
      r = n(e);
    return r.startsWith("JE") || r.startsWith("GY");
  }(e) ? !function () {
    let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
    return n(e).startsWith("IM");
  }(e) ? !function () {
    let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "",
      r = n(e);
    return o.some(e => r.startsWith(e));
  }(e) ? !function () {
    let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "",
      r = n(e);
    return !(r.startsWith("BT") || r.startsWith("JE") || r.startsWith("GY") || r.startsWith("IM")) && /^[A-Z]{1,2}\d/.test(r);
  }(e) ? "EU" : "GB" : "IE" : "IOM" : "CI" : "NI" : "UNKNOWN";
}
export { i as JN };
export { n as h$ };

export { i as getRegion, n as normalizePostcode };

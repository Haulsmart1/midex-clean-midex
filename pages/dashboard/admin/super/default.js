// Recovered from the existing production page factory; framework imports remapped locally.
import * as dep37876 from 'react/jsx-runtime';
import * as dep77328 from 'next/head';
const interopDefault = value => () => value.default || value;

null, null;
var s = dep37876,
  r = dep77328,
  d = interopDefault(r);
function l() {
  return (0, s.jsxs)(s.Fragment, {
    children: [(0, s.jsx)(d(), {
      children: (0, s.jsx)("title", {
        children: "Dashboard | Midnight Express"
      })
    }), (0, s.jsxs)("main", {
      style: {
        minHeight: "100vh",
        backgroundColor: "#050505",
        color: "#fff",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      },
      children: [(0, s.jsx)("h1", {
        style: {
          fontSize: "2rem"
        },
        children: "Default Dashboard"
      }), (0, s.jsx)("p", {
        style: {
          maxWidth: "600px",
          lineHeight: 1.6
        },
        children: "You are logged in but no specific role has been assigned yet."
      })]
    })]
  });
}
export default l;

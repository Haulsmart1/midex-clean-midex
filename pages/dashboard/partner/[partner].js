// Recovered from the existing production page factory; framework imports remapped locally.
import * as dep37876 from 'react/jsx-runtime';
import * as dep10553 from 'next-auth/react';
import * as dep89099 from 'next/router';
import * as dep14232 from 'react';
import dep47440 from '@/lib/recoveredPartnerConfig';
const interopDefault = value => () => value.default || value;

null, null;
var t = dep37876,
  o = dep10553,
  a = dep89099,
  i = dep14232;
function s(e) {
  let {
      title: r,
      content: n,
      href: o,
      color: a
    } = e,
    i = !!o,
    s = {
      flex: "1 1 260px",
      padding: 24,
      borderRadius: 14,
      background: "linear-gradient(160deg, #0a2a53, #1d447a)",
      color: "#ffffff",
      fontWeight: 600,
      fontSize: 18,
      minHeight: 120,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      cursor: i ? "pointer" : "default",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 18px ".concat(a || "#00000040"),
      border: "2px solid ".concat(a || "#ffffff44"),
      textDecoration: "none"
    };
  return i ? (0, t.jsx)("a", {
    href: o,
    style: s,
    children: (0, t.jsx)("strong", {
      children: r
    })
  }) : (0, t.jsxs)("div", {
    style: s,
    children: [(0, t.jsx)("strong", {
      style: {
        marginBottom: 10
      },
      children: r
    }), (0, t.jsx)("div", {
      children: n
    })]
  });
}
function d() {
  var e;
  let {
      data: r,
      status: d
    } = (0, o.useSession)(),
    l = (0, a.useRouter)(),
    [f, c] = (0, i.useState)(null),
    g = (0, i.useMemo)(() => {
      var e;
      if (!l.isReady) return "";
      let r = null == (e = l.query) ? void 0 : e.partner;
      return "string" == typeof r ? r.toLowerCase().trim() : "";
    }, [l.isReady, null == (e = l.query) ? void 0 : e.partner]),
    u = (0, i.useMemo)(() => (null == r ? void 0 : r.user) ? Array.isArray(r.user.roles) ? r.user.roles.map(e => String(e || "").toLowerCase()) : [String(r.user.role || "").toLowerCase()].filter(Boolean) : [], [r]),
    p = u.includes("partner"),
    h = u.includes("partner_admin");
  u.includes("vehicle");
  let x = p || h || u.includes("transport_partner"),
    b = p || h,
    y = p || h,
    v = p || h;
  return ((0, i.useEffect)(() => {
    if (l.isReady && "loading" !== d) {
      if (!(null == r ? void 0 : r.user)) return void l.replace("/login");
      if (!x) return void l.replace("/dashboard");
      if (!g) return void l.replace("/dashboard/partner");
      dep47440("./".concat(g, "Config")).then(e => c(e.default || e)).catch(() => {
        c({
          name: g,
          primaryColor: "#4ecdc4",
          coverageAreas: []
        });
      });
    }
  }, [l.isReady, d, r, g, x, l]), l.isReady && "loading" !== d && f) ? (0, t.jsx)("div", {
    style: {
      minHeight: "100vh",
      background: "linear-gradient(145deg, #002b5c 0%, ".concat(f.primaryColor, ")"),
      color: "#ffffff",
      fontFamily: "Poppins, Arial, sans-serif",
      padding: 32
    },
    children: (0, t.jsxs)("div", {
      style: {
        maxWidth: 1120,
        margin: "0 auto"
      },
      children: [(0, t.jsxs)("div", {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28
        },
        children: [(0, t.jsxs)("h1", {
          style: {
            fontSize: 38,
            fontWeight: 800,
            background: "linear-gradient(to right, #dcefff, #ffffff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: 1
          },
          children: [f.name, " Dashboard"]
        }), (0, t.jsx)("button", {
          onClick: () => (0, o.signOut)({
            callbackUrl: "/"
          }),
          style: {
            background: "#ffffff",
            color: "#002b5c",
            padding: "10px 22px",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            transition: "0.3s ease",
            fontSize: 14
          },
          children: "Log Out"
        })]
      }), (0, t.jsxs)("div", {
        style: {
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          marginBottom: 32
        },
        children: [(0, t.jsx)(s, {
          title: "Bookings",
          href: "/dashboard/partner/".concat(g, "/bookings"),
          color: "#5eb3f3"
        }), b && (0, t.jsx)(s, {
          title: "Finance",
          href: "/dashboard/partner/".concat(g, "/finance"),
          color: "#9d7eff"
        }), v && (0, t.jsx)(s, {
          title: "Settings",
          href: "/dashboard/partner/".concat(g, "/settings"),
          color: "#00c2b2"
        }), y && (0, t.jsx)(s, {
          title: "Archive",
          href: "/dashboard/partner/".concat(g, "/archive"),
          color: "#ff77cc"
        }), (0, t.jsx)(s, {
          title: "Coverage",
          content: Array.isArray(f.coverageAreas) && f.coverageAreas.length > 0 ? (0, t.jsx)("div", {
            style: {
              maxHeight: 220,
              overflowY: "auto",
              paddingRight: 6
            },
            children: f.coverageAreas.map((e, r) => (0, t.jsx)("span", {
              style: {
                display: "inline-block",
                background: "#021e3f",
                border: "1px solid #84baf2",
                borderRadius: 6,
                padding: "4px 10px",
                marginRight: 6,
                marginBottom: 6,
                fontSize: 13,
                fontWeight: 500,
                color: "#d4eaff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
              },
              children: e
            }, r))
          }) : "N/A"
        })]
      })]
    })
  }) : (0, t.jsx)("div", {
    style: {
      padding: 40,
      color: "#fff"
    },
    children: "Loading..."
  });
}
export default d;

import { releaseRouteAccess } from '@/lib/server/releaseRouteAccess';
export function getServerSideProps(context) { return releaseRouteAccess(context, ["partner","partner_admin","transport_partner","super_admin"], true); }

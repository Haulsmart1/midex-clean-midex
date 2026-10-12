import useReleaseSupabase from '@/hooks/useReleaseSupabase';
// Recovered from the existing production page factory; framework imports remapped locally.
import * as dep37876 from 'react/jsx-runtime';
import * as dep14232 from 'react';
import * as dep10553 from 'next-auth/react';
import * as dep89099 from 'next/router';
import { supabase as import51524_0 } from '@/lib/supabaseClient';
const dep51524 = {"N": import51524_0};
import { getRegion as import9828_0 } from '@/lib/recoveredRegion';
import { normalizePostcode as import9828_2 } from '@/lib/recoveredRegion';
const dep9828 = {"JN": import9828_0,"h$": import9828_2};
import dep47440 from '@/lib/recoveredPartnerConfig';
const interopDefault = value => () => value.default || value;

null, null;
var n = dep37876,
  o = dep14232,
  i = dep10553,
  s = dep89099,
  l = dep51524,
  d = dep9828;
let a = ["Internal Bookings", "Cross-Border Bookings", "Currys", "Car Batteries", "Luminescence"];
function c() {
  const l = { N: useReleaseSupabase() };
  let {
      data: e,
      status: r
    } = (0, i.useSession)(),
    c = (0, s.useRouter)(),
    [u, p] = (0, o.useState)(""),
    [h, g] = (0, o.useState)(null),
    [f, v] = (0, o.useState)({}),
    [x, y] = (0, o.useState)(a[0]),
    [m, b] = (0, o.useState)(!0),
    [C, j] = (0, o.useState)(new Set()),
    [D, _] = (0, o.useState)(""),
    [k, w] = (0, o.useState)(1);
  (0, o.useEffect)(() => {
    c.query.partner && p(String(c.query.partner).toLowerCase());
  }, [c.query.partner]), (0, o.useEffect)(() => {
    u && dep47440("./".concat(u, "Config")).then(e => g(e.default)).catch(() => g({
      name: "Partner",
      primaryColor: "#66e3e8",
      coverageAreas: [],
      filterLeg: () => !0
    }));
  }, [u]), (0, o.useEffect)(() => {
    var t, n, o;
    if (!h || !u || "loading" === r) return;
    if (!(null == e ? void 0 : e.user)) return void c.replace("/login");
    let i = Array.isArray(null == e || null == (t = e.user) ? void 0 : t.roles) ? e.user.roles.map(e => String(e || "").toLowerCase()) : [String((null == e || null == (n = e.user) ? void 0 : n.role) || "").toLowerCase()].filter(Boolean),
      s = String((null == e || null == (o = e.user) ? void 0 : o.partner_type) || "").toLowerCase().trim();
    if (!(i.includes("partner") || i.includes("partner_admin") || i.includes("transport_partner") || i.includes("vehicle"))) return void c.replace("/dashboard");
    s && s !== u && console.warn("[partner archive] partner_type mismatch", {
      email: e.user.email,
      roles: i,
      partnerType: s,
      partnerSlug: u
    }), E();
  }, [e, r, h, u]);
  let N = e => {
      if (!e) return [];
      if ("object" == typeof e) return e;
      try {
        return JSON.parse(e);
      } catch (e) {
        return [];
      }
    },
    P = e => {
      var r, t;
      let n = (null == (r = N(e.collectionpoints)) ? void 0 : r[0]) || {
          postcode: e.postcode || "",
          address: e.address || "",
          contact: e.customer_name || e.contact || "",
          phone: e.mobile || e.phone || ""
        },
        o = (null == (t = N(e.deliverypoints)) ? void 0 : t[0]) || {
          postcode: e.delivery_postcode || "",
          address: e.delivery_address || "",
          contact: e.delivery_contact || "",
          phone: e.delivery_phone || ""
        };
      return {
        ...e,
        col: n,
        del: o,
        origin: (0, d.h$)(n.postcode || ""),
        destination: (0, d.h$)(o.postcode || "")
      };
    },
    E = async () => {
      b(!0);
      let [e, r, t, n] = await Promise.all([l.N.from("bookings_archive").select("*"), l.N.from("bookings_currys_archive").select("*"), l.N.from("bookings_car_batteries_archive").select("*"), l.N.from("bookings_luminescence_archive").select("*")]),
        o = [],
        i = [];
      (e.data || []).map(P).forEach(e => {
        var r, t;
        (0, d.JN)(e.origin) !== (0, d.JN)(e.destination) ? (null == (r = h.filterLeg) ? void 0 : r.call(h, {
          postcode: e.destination
        })) && i.push(e) : (null == (t = h.filterLeg) ? void 0 : t.call(h, {
          postcode: e.origin
        })) && o.push(e);
      });
      let s = e => ((null == e ? void 0 : e.data) || []).map(P).filter(e => {
        var r;
        return null == (r = h.filterLeg) ? void 0 : r.call(h, {
          postcode: e.origin
        });
      });
      v({
        "Internal Bookings": o,
        "Cross-Border Bookings": i,
        Currys: s(r),
        "Car Batteries": s(t),
        Luminescence: s(n)
      }), j(new Set()), b(!1);
    },
    S = e => (0, n.jsx)("span", {
      style: {
        background: "#fff",
        color: "#000",
        padding: "4px 8px",
        borderRadius: 6,
        fontWeight: 600,
        fontSize: 13,
        display: "inline-block",
        marginTop: 4
      },
      children: e
    }),
    W = async e => {
      let {
        error: r
      } = await l.N.from({
        Currys: "bookings_currys_archive",
        "Car Batteries": "bookings_car_batteries_archive",
        Luminescence: "bookings_luminescence_archive"
      }[x] || "bookings_archive").delete().eq("id", e);
      if (r) return void console.error("Delete archive error:", r.message);
      v(r => ({
        ...r,
        [x]: (r[x] || []).filter(r => r.id !== e)
      }));
    },
    L = e => {
      if (!D) return e;
      let r = D.toLowerCase();
      return e.filter(e => {
        var t, n, o, i, s, l, d;
        return (null == (t = e.id) ? void 0 : t.toLowerCase().includes(r)) || (null == (o = e.col) || null == (n = o.postcode) ? void 0 : n.toLowerCase().includes(r)) || (null == (s = e.del) || null == (i = s.postcode) ? void 0 : i.toLowerCase().includes(r)) || (null == (l = e.consignment_ref) ? void 0 : l.toLowerCase().includes(r)) || (null == (d = e.internal_ref) ? void 0 : d.toLowerCase().includes(r));
      });
    };
  return (0, n.jsx)("div", {
    style: {
      minHeight: "100vh",
      background: "linear-gradient(120deg, #0c1628 60%, #66e3e8)",
      color: "#fff",
      fontFamily: "Poppins, Arial, sans-serif",
      padding: 32
    },
    children: (0, n.jsxs)("div", {
      style: {
        maxWidth: 1120,
        margin: "0 auto"
      },
      children: [(0, n.jsxs)("div", {
        style: {
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24
        },
        children: [(0, n.jsxs)("h1", {
          children: [null == h ? void 0 : h.name, " Archive"]
        }), (0, n.jsx)("button", {
          onClick: () => (0, i.signOut)({
            callbackUrl: "/"
          }),
          style: {
            background: null == h ? void 0 : h.primaryColor,
            color: "#000",
            padding: "10px 22px",
            borderRadius: 8,
            fontWeight: 700
          },
          children: "Log Out"
        })]
      }), (0, n.jsx)("button", {
        onClick: () => c.push("/dashboard/partner/".concat(u, "/bookings")),
        style: {
          background: "#fff",
          color: "#000",
          padding: "8px 16px",
          borderRadius: 6,
          fontWeight: 600,
          marginBottom: 20
        },
        children: "← Back to Bookings"
      }), (0, n.jsxs)("div", {
        style: {
          display: "flex",
          gap: 12,
          marginBottom: 20
        },
        children: [a.map(e => (0, n.jsx)("button", {
          onClick: () => {
            y(e), w(1), _(""), j(new Set());
          },
          style: {
            background: x === e ? "#fff" : "#1a2a3d",
            color: x === e ? "#000" : "#fff",
            padding: "8px 16px",
            borderRadius: 8,
            fontWeight: 600
          },
          children: e
        }, e)), (0, n.jsx)("input", {
          type: "text",
          placeholder: "Search job, postcode, ref...",
          value: D,
          onChange: e => {
            _(e.target.value), w(1);
          },
          style: {
            flex: 1,
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
            fontWeight: 500,
            background: "#000",
            color: "#fff"
          }
        })]
      }), m ? (0, n.jsx)("p", {
        children: "Loading…"
      }) : (() => {
        let e = L(f[x] || []),
          r = (k - 1) * 100;
        return e.slice(r, r + 100);
      })().map(e => {
        var r, t, o, i, s, l, a;
        let c = C.has(e.id);
        return (0, n.jsxs)("div", {
          style: {
            background: "#1a2a3d",
            padding: 16,
            borderRadius: 10,
            border: "2px solid #999",
            marginBottom: 20,
            opacity: .9
          },
          children: [(0, n.jsxs)("div", {
            onClick: () => {
              var r;
              return r = e.id, void j(e => {
                let t = new Set(e);
                return t.has(r) ? t.delete(r) : t.add(r), t;
              });
            },
            style: {
              display: "flex",
              justifyContent: "space-between",
              cursor: "pointer",
              alignItems: "center"
            },
            children: [(0, n.jsxs)("div", {
              children: [(0, n.jsx)("div", {
                children: (0, n.jsx)("strong", {
                  children: e.consignment_ref || e.internal_ref || e.id
                })
              }), (0, n.jsxs)("div", {
                style: {
                  fontSize: 12
                },
                children: [e.date || "No Date", " \xb7 \xa3", (null == (r = e.total_price) ? void 0 : r.toFixed(2)) || "0.00"]
              })]
            }), (0, n.jsx)("span", {
              style: {
                fontSize: 20
              },
              children: c ? "▼" : "▲"
            })]
          }), c && (0, n.jsxs)("div", {
            style: {
              marginTop: 16,
              background: "#0c1628",
              padding: 16,
              borderRadius: 8
            },
            children: [(0, n.jsxs)("div", {
              style: {
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12
              },
              children: [(0, n.jsxs)("div", {
                children: [(0, n.jsx)("strong", {
                  style: {
                    color: "#ffc600"
                  },
                  children: "\uD83D\uDCE6 Collection"
                }), (0, n.jsx)("div", {
                  children: S(null == (t = e.col) ? void 0 : t.postcode)
                })]
              }), (0, n.jsxs)("div", {
                children: [(0, n.jsx)("strong", {
                  style: {
                    color: "#66e3e8"
                  },
                  children: "\uD83D\uDE9A Delivery"
                }), (0, n.jsx)("div", {
                  children: S(null == (o = e.del) ? void 0 : o.postcode)
                })]
              }), (0, n.jsxs)("div", {
                children: [(0, n.jsx)("strong", {
                  style: {
                    color: "#ff77cc"
                  },
                  children: "\uD83D\uDCCD Region"
                }), (0, n.jsx)("div", {
                  children: S((0, d.JN)(e.destination))
                })]
              })]
            }), (0, n.jsxs)("p", {
              style: {
                marginTop: 12
              },
              children: [(0, n.jsx)("strong", {
                children: "Collection Contact:"
              }), " ", null == (i = e.col) ? void 0 : i.contact]
            }), (0, n.jsxs)("p", {
              children: [(0, n.jsx)("strong", {
                children: "Collection Phone:"
              }), " ", null == (s = e.col) ? void 0 : s.phone]
            }), (0, n.jsx)("hr", {
              style: {
                margin: "12px 0",
                borderColor: "#333"
              }
            }), (0, n.jsxs)("p", {
              children: [(0, n.jsx)("strong", {
                children: "Delivery Contact:"
              }), " ", null == (l = e.del) ? void 0 : l.contact]
            }), (0, n.jsxs)("p", {
              children: [(0, n.jsx)("strong", {
                children: "Delivery Phone:"
              }), " ", null == (a = e.del) ? void 0 : a.phone]
            }), e.document_url && (0, n.jsx)("a", {
              href: e.document_url,
              target: "_blank",
              rel: "noopener noreferrer",
              style: {
                display: "inline-block",
                marginTop: 12,
                background: "#ffc600",
                color: "#000",
                padding: "10px 14px",
                borderRadius: 6,
                fontWeight: 600,
                textDecoration: "none"
              },
              children: "\uD83D\uDCC4 View POD"
            }), (0, n.jsx)("button", {
              onClick: () => W(e.id),
              style: {
                background: "#ff4444",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: 6,
                marginTop: 16,
                fontWeight: 600,
                border: "none"
              },
              children: "\uD83D\uDDD1 Delete from Archive"
            })]
          })]
        }, e.id);
      }), (0, n.jsxs)("div", {
        style: {
          marginTop: 20,
          display: "flex",
          justifyContent: "center",
          gap: 10
        },
        children: [(0, n.jsx)("button", {
          disabled: 1 === k,
          onClick: () => w(e => e - 1),
          children: "⬅ Prev"
        }), (0, n.jsxs)("span", {
          children: ["Page ", k]
        }), (0, n.jsx)("button", {
          disabled: L(f[x] || []).length <= 100 * k,
          onClick: () => w(e => e + 1),
          children: "Next ➡"
        })]
      })]
    })
  });
}
export default c;

import { releaseRouteAccess } from '@/lib/server/releaseRouteAccess';
export function getServerSideProps(context) { return releaseRouteAccess(context, ["partner","partner_admin","transport_partner","vehicle","super_admin"], true); }

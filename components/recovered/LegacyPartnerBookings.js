import useReleaseSupabase from '@/hooks/useReleaseSupabase';
// Recovered from the existing production page factory; framework imports remapped locally.
import * as dep37876 from 'react/jsx-runtime';
import * as dep77328 from 'next/head';
import * as dep14232 from 'react';
import * as dep10553 from 'next-auth/react';
import * as dep89099 from 'next/router';
import { supabase as import51524_0 } from '@/lib/supabaseClient';
const dep51524 = {"N": import51524_0};
import { getRegion as import9828_0 } from '@/lib/recoveredRegion';
import { normalizePostcode as import9828_2 } from '@/lib/recoveredRegion';
const dep9828 = {"JN": import9828_0,"h$": import9828_2};
import * as dep48230 from 'next/link';
import dep47440 from '@/lib/recoveredPartnerConfig';
const interopDefault = value => () => value.default || value;

null, null;
var r = dep37876,
  n = dep77328,
  i = interopDefault(n),
  o = dep14232,
  l = dep10553,
  a = dep89099,
  c = dep51524,
  d = dep9828;
dep48230;
let u = ["Internal Bookings", "Cross-Border Bookings", "Currys", "Car Batteries", "Luminescence"],
  h = function () {
 const c = { N: useReleaseSupabase() };
    let {
        data: e,
        status: t
      } = (0, l.useSession)(),
      n = (0, a.useRouter)(),
      [h, g] = (0, o.useState)(""),
      [p, m] = (0, o.useState)(null),
      [b, D] = (0, o.useState)({}),
      [f, v] = (0, o.useState)(u[0]),
      [x, j] = (0, o.useState)(!0),
      C = (0, o.useRef)(null);
    (0, o.useEffect)(() => {
      n.query.partner && g(n.query.partner.toLowerCase());
    }, [n.query.partner]), (0, o.useEffect)(() => {
      h && dep47440("./".concat(h, "Config")).then(e => m(e.default)).catch(() => m({
        name: "Partner",
        primaryColor: "#66e3e8",
        coverageAreas: [],
        filterLeg: () => !0
      }));
    }, [h]), (0, o.useEffect)(() => {
      var s, r, i, o, l;
      if ("loading" === t || !h || !p) return;
      if (!e) return n.replace("/login");
      let a = Array.isArray(null == e || null == (s = e.user) ? void 0 : s.roles) ? e.user.roles.map(e => null == e ? void 0 : e.toLowerCase()) : [null == e || null == (i = e.user) || null == (r = i.role) ? void 0 : r.toLowerCase()].filter(Boolean),
        c = null == e || null == (l = e.user) || null == (o = l.partner_type) ? void 0 : o.toLowerCase();
      return a.includes("partner") && c === h ? (_(), () => clearInterval(C.current)) : n.replace("/dashboard");
    }, [e, t, h, p]);
    let N = e => {
        if (!e) return [];
        if ("object" == typeof e) return e;
        try {
          return JSON.parse(e);
        } catch (e) {
          return [];
        }
      },
      y = e => {
        var t, s;
        let r = (null == (t = N(e.collectionpoints)) ? void 0 : t[0]) || {
            postcode: e.postcode || "",
            address: e.address || "",
            contact: e.customer_name || "",
            phone: e.mobile || ""
          },
          n = (null == (s = N(e.deliverypoints)) ? void 0 : s[0]) || {
            postcode: e.delivery_postcode || "",
            address: e.delivery_address || "",
            contact: e.delivery_contact || "",
            phone: e.delivery_phone || ""
          };
        return {
          ...e,
          col: r,
          del: n,
          origin: (0, d.h$)(r.postcode),
          destination: (0, d.h$)(n.postcode)
        };
      },
      _ = async () => {
        j(!0);
        let [e, t, s, r] = await Promise.all([c.N.from("bookings").select("*"), c.N.from("bookings_currys").select("*"), c.N.from("bookings_car_batteries").select("*"), c.N.from("bookings_luminescence").select("*")]),
          n = [],
          i = [],
          o = e => {
            var t;
            let s = (null == (t = N(e.collectionpoints)) ? void 0 : t[0]) || {
              postcode: e.postcode
            };
            return "archived" !== e.status && p.filterLeg({
              postcode: (null == s ? void 0 : s.postcode) || ""
            });
          };
        (e.data || []).forEach(e => {
          if ("archived" === e.status) return;
          let t = y(e),
            s = (0, d.JN)(t.origin) !== (0, d.JN)(t.destination);
          !s && o(e) && n.push(t), s && (e => {
            var t;
            let s = (null == (t = N(e.deliverypoints)) ? void 0 : t[0]) || {
              postcode: e.delivery_postcode
            };
            return "archived" !== e.status && p.filterLeg({
              postcode: (null == s ? void 0 : s.postcode) || ""
            });
          })(e) && i.push(t);
        });
        let l = e => (e || []).filter(o).map(y);
        D({
          "Internal Bookings": n,
          "Cross-Border Bookings": i,
          Currys: l(t.data),
          "Car Batteries": l(s.data),
          Luminescence: l(r.data)
        }), j(!1);
      },
      k = async (e, t) => {
        await c.N.from("bookings_currys").update({
          status: t
        }).eq("id", e), _();
      },
      E = async (e, t) => {
        await c.N.from("bookings_currys").update({
          progress: t
        }).eq("id", e), _();
      };
    return (0, r.jsxs)(r.Fragment, {
      children: [(0, r.jsx)(i(), {
        children: (0, r.jsxs)("title", {
          children: [null == p ? void 0 : p.name, " Bookings"]
        })
      }), (0, r.jsxs)("div", {
        className: "container py-4 text-white",
        children: [(0, r.jsxs)("div", {
          className: "d-flex justify-content-between mb-3",
          children: [(0, r.jsx)("button", {
            className: "btn btn-secondary",
            onClick: () => n.push("/dashboard"),
            children: "← Back"
          }), (0, r.jsx)("button", {
            className: "btn btn-outline-light",
            onClick: () => (0, l.signOut)({
              callbackUrl: "/"
            }),
            children: "Log Out"
          })]
        }), (0, r.jsxs)("h2", {
          children: [null == p ? void 0 : p.name, " Bookings"]
        }), (0, r.jsx)("div", {
          className: "mb-4",
          children: u.map(e => (0, r.jsx)("button", {
            className: "btn me-2 ".concat(e === f ? "btn-primary" : "btn-outline-light"),
            onClick: () => v(e),
            children: e
          }, e))
        }), x ? (0, r.jsx)("p", {
          children: "Loading…"
        }) : (0, r.jsx)("div", {
          className: "card-grid",
          children: (b[f] || []).map(e => (0, r.jsx)("div", {
            className: "grid-item",
            children: ((e, t) => {
              var s, n, i;
              let o = e.document_url || (Array.isArray(e.file_urls) && e.file_urls.length > 0 ? "https://jrhvorrsppjzbkropmub.supabase.co/storage/v1/object/public/files/".concat(e.file_urls[0]) : null),
                l = "number" == typeof e.progress ? e.progress : 0;
              return (0, r.jsxs)("div", {
                className: "booking-card border rounded p-3 mb-4 bg-dark text-light",
                children: [(0, r.jsx)("h5", {
                  className: "card-title mb-2",
                  children: e.internal_ref || e.consignment_ref || e.id
                }), (0, r.jsxs)("div", {
                  className: "booking-details-grid mb-3",
                  children: [(0, r.jsxs)("div", {
                    children: [(0, r.jsx)("strong", {
                      children: "\uD83D\uDCC5 Created:"
                    }), " ", new Date(e.created_at).toLocaleString()]
                  }), (0, r.jsxs)("div", {
                    children: [(0, r.jsx)("strong", {
                      children: "\uD83D\uDC64 Customer:"
                    }), " ", e.customer_name || "—"]
                  }), (0, r.jsxs)("div", {
                    children: [(0, r.jsx)("strong", {
                      children: "\uD83D\uDCCD From:"
                    }), " ", null == (s = e.col) ? void 0 : s.address, " (", e.origin, ")"]
                  }), (0, r.jsxs)("div", {
                    children: [(0, r.jsx)("strong", {
                      children: "\uD83D\uDCE6 To:"
                    }), " ", null == (n = e.del) ? void 0 : n.address, " (", e.destination, ")"]
                  }), (0, r.jsxs)("div", {
                    children: [(0, r.jsx)("strong", {
                      children: "☎️ Phone:"
                    }), " ", e.mobile || (null == (i = e.col) ? void 0 : i.phone) || "—"]
                  }), (0, r.jsxs)("div", {
                    children: [(0, r.jsx)("strong", {
                      children: "\uD83D\uDCE7 Email:"
                    }), " ", e.email || "—"]
                  }), (0, r.jsxs)("div", {
                    children: [(0, r.jsx)("strong", {
                      children: "\uD83D\uDE9A Vehicle:"
                    }), " ", e.vehicle_type || "—"]
                  }), (0, r.jsxs)("div", {
                    children: [(0, r.jsx)("strong", {
                      children: "⚖️ Weight:"
                    }), " ", e.weight || "—"]
                  }), (0, r.jsxs)("div", {
                    children: [(0, r.jsx)("strong", {
                      children: "\uD83D\uDCDD Notes:"
                    }), " ", e.notes || "—"]
                  })]
                }), (0, r.jsxs)("p", {
                  children: [(0, r.jsx)("strong", {
                    children: "Status:"
                  }), " ", e.status]
                }), (0, r.jsxs)("div", {
                  className: "btn-group btn-group-sm flex-wrap mb-2 d-flex gap-2",
                  children: [(0, r.jsx)("button", {
                    className: "btn btn-secondary",
                    onClick: () => k(e.id, "accepted"),
                    children: "✅ Accept Job"
                  }), (0, r.jsx)("button", {
                    className: "btn btn-secondary",
                    onClick: () => k(e.id, "on_route"),
                    children: "\uD83D\uDEE3 On Route"
                  }), (0, r.jsx)("button", {
                    className: "btn btn-secondary",
                    onClick: () => k(e.id, "on_site"),
                    children: "\uD83C\uDFD7 On Site"
                  }), (0, r.jsx)("button", {
                    className: "btn btn-secondary",
                    onClick: () => k(e.id, "delivered"),
                    children: "\uD83D\uDCE6 Delivered"
                  }), (0, r.jsx)("button", {
                    className: "btn btn-secondary",
                    onClick: () => k(e.id, "signed_off"),
                    children: "\uD83D\uDD8A Signed Off"
                  }), (0, r.jsx)("button", {
                    className: "btn btn-danger",
                    onClick: () => k(e.id, "archived"),
                    children: "\uD83D\uDDC3 Archive"
                  }), (0, r.jsx)("button", {
                    className: "btn btn-primary",
                    onClick: () => k(e.id, "haulsmart_allocated"),
                    children: "\uD83D\uDE9A Allocate to Haulsmart"
                  })]
                }), (0, r.jsxs)("p", {
                  className: "mt-2",
                  children: [(0, r.jsx)("strong", {
                    children: "\uD83D\uDCCA Progress:"
                  }), " ", l, "%"]
                }), (0, r.jsx)("div", {
                  className: "progress mb-2",
                  children: (0, r.jsx)("div", {
                    className: "progress-bar bg-info",
                    style: {
                      width: "".concat(l, "%")
                    }
                  })
                }), (0, r.jsx)("div", {
                  className: "btn-group btn-group-sm d-flex gap-2",
                  children: [25, 50, 75, 100].map(t => (0, r.jsxs)("button", {
                    className: "btn btn-outline-light",
                    onClick: () => E(e.id, t),
                    children: [t, "%"]
                  }, t))
                }), o && (0, r.jsx)("a", {
                  href: o,
                  target: "_blank",
                  rel: "noreferrer",
                  className: "btn btn-warning btn-sm mt-3",
                  children: "\uD83D\uDCCE View Attachment"
                })]
              }, e.id);
            })(e, 0)
          }, e.id))
        })]
      })]
    });
  };
export default h;

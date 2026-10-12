import useReleaseSupabase from '@/hooks/useReleaseSupabase';
// Recovered from the existing production page factory; framework imports remapped locally.
import * as dep37876 from 'react/jsx-runtime';
import * as dep14232 from 'react';
import * as dep48230 from 'next/link';
import { supabase as import51524_0 } from '@/lib/supabaseClient';
const dep51524 = {"N": import51524_0};
const interopDefault = value => () => value.default || value;

null, null;
var n = dep37876,
  t = dep14232,
  l = dep48230,
  o = interopDefault(l),
  i = dep51524;
function a() {
  const i = { N: useReleaseSupabase() };
  let [s, e] = (0, t.useState)([]),
    [r, l] = (0, t.useState)(!0);
  (0, t.useEffect)(() => {
    (async () => {
      l(!0);
      let {
        data: s,
        error: r
      } = await i.N.from("bookings_currys").select("*");
      if (r) {
        console.error("❌ Supabase error:", r.message), e([]), l(!1);
        return;
      }
      e(s || []), l(!1);
    })();
  }, []);
  let a = async (s, r) => {
      let {
        error: n
      } = await i.N.from("bookings_currys").update({
        progress: r
      }).eq("id", s);
      n ? console.error("❌ Progress update failed:", n.message) : e(e => e.map(e => e.id === s ? {
        ...e,
        progress: r
      } : e));
    },
    c = async (s, r) => {
      let {
        error: n
      } = await i.N.from("bookings_currys").update({
        status: r
      }).eq("id", s);
      n ? console.error("❌ Status update failed:", n.message) : e(e => e.map(e => e.id === s ? {
        ...e,
        status: r
      } : e));
    };
  return (0, n.jsxs)("div", {
    className: "container py-5",
    style: {
      backgroundColor: "#1a1831",
      minHeight: "100vh",
      color: "#fff"
    },
    children: [(0, n.jsxs)("div", {
      className: "d-flex justify-content-between align-items-center mb-4",
      children: [(0, n.jsx)("h2", {
        style: {
          color: "#ffc600",
          fontWeight: "bold"
        },
        children: "\uD83D\uDED2 Currys Bookings"
      }), (0, n.jsx)(o(), {
        href: "/dashboard",
        children: (0, n.jsx)("button", {
          className: "btn btn-warning",
          children: "← Back to Dashboard"
        })
      })]
    }), r ? (0, n.jsx)("p", {
      children: "Loading bookings..."
    }) : 0 === s.length ? (0, n.jsx)("p", {
      children: "No bookings found."
    }) : (0, n.jsx)("div", {
      className: "row",
      children: s.map(s => {
        let e = s.file_url || (Array.isArray(s.file_urls) && s.file_urls.length > 0 ? "https://jrhvorrsppjzbkropmub.supabase.co/storage/v1/object/public/currysdocs/".concat(s.file_urls[0]) : null);
        return (0, n.jsx)("div", {
          className: "col-md-6 col-lg-4 mb-4",
          children: (0, n.jsx)("div", {
            className: "card h-100 shadow-sm",
            style: {
              backgroundColor: "#2b254a",
              color: "#fff"
            },
            children: (0, n.jsxs)("div", {
              className: "card-body",
              children: [(0, n.jsx)("h5", {
                className: "card-title fw-bold",
                children: s.internal_ref || "No Ref"
              }), s.created_at && (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "\uD83D\uDCC5 Created:"
                }), " ", new Date(s.created_at).toLocaleString()]
              }), (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "\uD83D\uDC64 Customer:"
                }), " ", s.customer_name]
              }), (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "\uD83D\uDCCD Address:"
                }), " ", s.address, ", ", s.postcode]
              }), (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "\uD83D\uDCDE Phone:"
                }), " ", s.mobile]
              }), (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "\uD83D\uDCE7 Email:"
                }), " ", s.email]
              }), (0, n.jsx)("hr", {
                style: {
                  borderColor: "#444"
                }
              }), (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "\uD83D\uDD0B Battery Type:"
                }), " ", s.battery_type]
              }), (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "\uD83D\uDD22 Serial:"
                }), " ", s.battery_serial]
              }), (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "\uD83D\uDCE6 Quantity:"
                }), " ", s.quantity]
              }), (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "\uD83E\uDDEA Triage:"
                }), " ", s.triage_action]
              }), (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "\uD83D\uDCC6 Collection:"
                }), " ", s.collection_date]
              }), (0, n.jsx)("hr", {
                style: {
                  borderColor: "#444"
                }
              }), (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "\uD83D\uDEAA Parking:"
                }), " ", s.parking]
              }), (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "\uD83D\uDC3E Pets:"
                }), " ", s.pets]
              }), (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "♿ Accessibility:"
                }), " ", s.accessibility_issues]
              }), (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "⚠️ H&S:"
                }), " ", s.health_safety_issues]
              }), (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "\uD83D\uDDD2️ Notes:"
                }), " ", s.notes]
              }), (0, n.jsxs)("p", {
                children: [(0, n.jsx)("strong", {
                  children: "\uD83D\uDCE6 Status:"
                }), " ", s.status || "—"]
              }), (0, n.jsxs)("div", {
                className: "btn-group mt-2",
                role: "group",
                children: [(0, n.jsx)("button", {
                  className: "btn btn-sm btn-secondary",
                  onClick: () => c(s.id, "on_route"),
                  children: "\uD83D\uDEE3 On Route"
                }), (0, n.jsx)("button", {
                  className: "btn btn-sm btn-secondary",
                  onClick: () => c(s.id, "on_site_collection"),
                  children: "\uD83C\uDFD7 On Site Collection"
                }), (0, n.jsx)("button", {
                  className: "btn btn-sm btn-secondary",
                  onClick: () => c(s.id, "on_way_to_delivery"),
                  children: "\uD83D\uDE9A On Way to Delivery"
                })]
              }), "number" == typeof s.progress && (0, n.jsxs)(n.Fragment, {
                children: [(0, n.jsxs)("p", {
                  className: "mt-3",
                  children: [(0, n.jsx)("strong", {
                    children: "\uD83D\uDCCA Progress:"
                  }), " ", s.progress, "%"]
                }), (0, n.jsx)("div", {
                  className: "progress",
                  style: {
                    height: "8px"
                  },
                  children: (0, n.jsx)("div", {
                    className: "progress-bar bg-success",
                    role: "progressbar",
                    style: {
                      width: "".concat(s.progress, "%")
                    },
                    "aria-valuenow": s.progress,
                    "aria-valuemin": "0",
                    "aria-valuemax": "100"
                  })
                }), (0, n.jsx)("div", {
                  className: "btn-group mt-2",
                  role: "group",
                  children: [25, 50, 75, 100].map(e => (0, n.jsxs)("button", {
                    className: "btn btn-sm btn-outline-light",
                    onClick: () => a(s.id, e),
                    children: [e, "%"]
                  }, e))
                })]
              }), e && (0, n.jsx)("a", {
                href: e,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "btn btn-sm btn-warning mt-3",
                children: "\uD83D\uDCCE View Attachment"
              }), (0, n.jsx)(o(), {
                href: "/dashboard/currys/bookings/edit/".concat(s.id),
                className: "btn btn-outline-light btn-sm mt-3 d-block",
                children: "✏️ Edit"
              })]
            })
          })
        }, s.id);
      })
    })]
  });
}
export default a;

import { releaseRouteAccess } from '@/lib/server/releaseRouteAccess';
export function getServerSideProps(context) { return releaseRouteAccess(context, ["currys_admin","currys_user","currys","super_admin"], false); }

import useReleaseSupabase from '@/hooks/useReleaseSupabase';
// Recovered from the existing production page factory; framework imports remapped locally.
import * as dep37876 from 'react/jsx-runtime';
import * as dep14232 from 'react';
import * as dep10553 from 'next-auth/react';
import * as dep89099 from 'next/router';
import { supabase as import51524_0 } from '@/lib/supabaseClient';
const dep51524 = {"N": import51524_0};
const interopDefault = value => () => value.default || value;

null, null;
var d = dep37876,
  i = dep14232,
  a = dep10553,
  n = dep89099,
  s = dep51524;
function o() {
  const s = { N: useReleaseSupabase() };
  var e;
  let {
      data: r,
      status: t
    } = (0, a.useSession)(),
    o = (0, n.useRouter)(),
    l = (0, i.useMemo)(() => {
      var e;
      let r = null == (e = o.query) ? void 0 : e.partner;
      return "string" == typeof r ? r.toLowerCase() : "";
    }, [null == (e = o.query) ? void 0 : e.partner]),
    [c, u] = (0, i.useState)(!1),
    [p, g] = (0, i.useState)([]),
    [f, h] = (0, i.useState)({
      reg_no: "",
      make: "",
      model: "",
      capacity_kg: "",
      notes: ""
    }),
    [y, x] = (0, i.useState)({
      type: "",
      text: ""
    }),
    v = (0, i.useMemo)(() => {
      var e, t;
      return (Array.isArray(null == r || null == (e = r.user) ? void 0 : e.roles) ? r.user.roles : [null == r || null == (t = r.user) ? void 0 : t.role].filter(Boolean)).map(e => String(e || "").toLowerCase());
    }, [r]),
    m = v.includes("partner_admin") || v.includes("admin") || v.includes("super_admin");
  v.includes("vehicle"), (0, i.useEffect)(() => {
    if (!o.isReady || "loading" === t) return;
    if (!(null == r ? void 0 : r.user)) return void o.replace("/login");
    b();
  }, [o.isReady, t, r]);
  let b = async () => {
      u(!0), x({
        type: "",
        text: ""
      });
      let {
        data: e,
        error: r
      } = await s.N.from("vehicles").select("id, owner_user_id, reg_no, make, model, capacity_kg, active, notes, created_at").order("created_at", {
        ascending: !1
      });
      r ? x({
        type: "error",
        text: r.message
      }) : g(e || []), u(!1);
    },
    k = async e => {
      var t;
      if (e.preventDefault(), !m) return void x({
        type: "error",
        text: "Only partner admins can add vehicles."
      });
      u(!0), x({
        type: "",
        text: ""
      });
      let d = {
          owner_user_id: null == r || null == (t = r.user) ? void 0 : t.id,
          reg_no: f.reg_no.trim(),
          make: f.make.trim() || null,
          model: f.model.trim() || null,
          capacity_kg: f.capacity_kg ? Number(f.capacity_kg) : null,
          notes: f.notes.trim() || null,
          active: !0
        },
        {
          error: i
        } = await s.N.from("vehicles").insert([d]);
      i ? x({
        type: "error",
        text: i.message
      }) : (x({
        type: "success",
        text: "Vehicle added."
      }), h({
        reg_no: "",
        make: "",
        model: "",
        capacity_kg: "",
        notes: ""
      }), await b()), u(!1);
    },
    _ = async e => {
      if (!m) return void x({
        type: "error",
        text: "Only partner admins can delete vehicles."
      });
      if (!confirm("Delete this vehicle?")) return;
      u(!0);
      let {
        error: r
      } = await s.N.from("vehicles").delete().eq("id", e);
      r ? x({
        type: "error",
        text: r.message
      }) : (x({
        type: "success",
        text: "Vehicle deleted."
      }), g(r => r.filter(r => r.id !== e))), u(!1);
    };
  return (0, d.jsx)("div", {
    style: {
      minHeight: "100vh",
      background: "linear-gradient(145deg, #001f3f 0%, #0065bd 100%)",
      color: "#fff",
      fontFamily: "Inter, system-ui, sans-serif",
      padding: 32
    },
    children: (0, d.jsxs)("div", {
      style: {
        maxWidth: 960,
        margin: "0 auto"
      },
      children: [(0, d.jsxs)("div", {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20
        },
        children: [(0, d.jsx)("h1", {
          style: {
            fontSize: 30,
            fontWeight: 800
          },
          children: "Vehicles"
        }), (0, d.jsx)("button", {
          onClick: () => o.push("/dashboard/partner/".concat(l)),
          style: {
            background: "#19324d",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #2b517d"
          },
          children: "← Back"
        })]
      }), m && (0, d.jsxs)("div", {
        style: {
          background: "#0e1a2b",
          padding: 16,
          borderRadius: 12,
          marginBottom: 18
        },
        children: [(0, d.jsx)("h3", {
          style: {
            marginBottom: 10,
            fontWeight: 800
          },
          children: "Add Vehicle"
        }), (0, d.jsxs)("form", {
          onSubmit: k,
          style: {
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 2fr auto",
            gap: 8
          },
          children: [(0, d.jsx)("input", {
            placeholder: "Registration *",
            required: !0,
            value: f.reg_no,
            onChange: e => h(r => ({
              ...r,
              reg_no: e.target.value
            })),
            style: {
              padding: 10,
              borderRadius: 8,
              border: "1px solid #304562",
              background: "#0a1422",
              color: "#fff"
            }
          }), (0, d.jsx)("input", {
            placeholder: "Make",
            value: f.make,
            onChange: e => h(r => ({
              ...r,
              make: e.target.value
            })),
            style: {
              padding: 10,
              borderRadius: 8,
              border: "1px solid #304562",
              background: "#0a1422",
              color: "#fff"
            }
          }), (0, d.jsx)("input", {
            placeholder: "Model",
            value: f.model,
            onChange: e => h(r => ({
              ...r,
              model: e.target.value
            })),
            style: {
              padding: 10,
              borderRadius: 8,
              border: "1px solid #304562",
              background: "#0a1422",
              color: "#fff"
            }
          }), (0, d.jsx)("input", {
            type: "number",
            placeholder: "Capacity (kg)",
            value: f.capacity_kg,
            onChange: e => h(r => ({
              ...r,
              capacity_kg: e.target.value
            })),
            style: {
              padding: 10,
              borderRadius: 8,
              border: "1px solid #304562",
              background: "#0a1422",
              color: "#fff"
            }
          }), (0, d.jsx)("input", {
            placeholder: "Notes",
            value: f.notes,
            onChange: e => h(r => ({
              ...r,
              notes: e.target.value
            })),
            style: {
              padding: 10,
              borderRadius: 8,
              border: "1px solid #304562",
              background: "#0a1422",
              color: "#fff"
            }
          }), (0, d.jsx)("button", {
            type: "submit",
            disabled: c,
            style: {
              background: "#00d0ff",
              color: "#001f3f",
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              fontWeight: 800
            },
            children: c ? "Saving…" : "Add"
          })]
        })]
      }), y.text && (0, d.jsx)("div", {
        style: {
          marginBottom: 12,
          padding: "10px 12px",
          borderRadius: 8,
          background: "error" === y.type ? "#7f1d1d" : "#064e3b",
          color: "#fff",
          fontWeight: 600
        },
        children: y.text
      }), (0, d.jsxs)("div", {
        style: {
          background: "#0e1a2b",
          borderRadius: 12,
          overflow: "hidden"
        },
        children: [(0, d.jsxs)("div", {
          style: {
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
            padding: "12px 14px",
            background: "#173257",
            fontWeight: 700
          },
          children: [(0, d.jsx)("div", {
            children: "Registration"
          }), (0, d.jsx)("div", {
            children: "Make"
          }), (0, d.jsx)("div", {
            children: "Model"
          }), (0, d.jsx)("div", {
            children: "Capacity"
          }), (0, d.jsx)("div", {
            children: "Status"
          }), (0, d.jsx)("div", {
            children: "Actions"
          })]
        }), 0 === p.length ? (0, d.jsx)("div", {
          style: {
            padding: 16,
            color: "#9fb7d2"
          },
          children: "No vehicles yet."
        }) : p.map(e => (0, d.jsxs)("div", {
          style: {
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
            padding: "10px 14px",
            borderTop: "1px solid #18385e",
            alignItems: "center"
          },
          children: [(0, d.jsx)("div", {
            style: {
              fontWeight: 700
            },
            children: e.reg_no
          }), (0, d.jsx)("div", {
            children: e.make || "—"
          }), (0, d.jsx)("div", {
            children: e.model || "—"
          }), (0, d.jsx)("div", {
            children: e.capacity_kg ? "".concat(e.capacity_kg, " kg") : "—"
          }), (0, d.jsx)("div", {
            children: e.active ? "Active" : "Inactive"
          }), (0, d.jsx)("div", {
            style: {
              display: "flex",
              gap: 8,
              justifyContent: "flex-end"
            },
            children: m && (0, d.jsx)("button", {
              onClick: () => _(e.id),
              style: {
                background: "#e03c3c",
                color: "#fff",
                border: "none",
                padding: "6px 10px",
                borderRadius: 8,
                fontWeight: 700
              },
              children: "Delete"
            })
          })]
        }, e.id))]
      })]
    })
  });
}
export default o;

import { releaseRouteAccess } from '@/lib/server/releaseRouteAccess';
export function getServerSideProps(context) { return releaseRouteAccess(context, ["partner","partner_admin","transport_partner","vehicle","admin","super_admin"], true); }

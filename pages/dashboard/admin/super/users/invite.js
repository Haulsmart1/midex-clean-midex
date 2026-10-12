import useReleaseSupabase from '@/hooks/useReleaseSupabase';
// Recovered from the existing production page factory; framework imports remapped locally.
import * as dep37876 from 'react/jsx-runtime';
import * as dep75961 from 'styled-jsx/style';
import * as dep77328 from 'next/head';
import import59465_0 from '@/components/layouts/SuperAdminLayout';
const dep59465 = {"A": import59465_0};
import * as dep14232 from 'react';
import * as dep10553 from 'next-auth/react';
import { supabase as import51524_0 } from '@/lib/supabaseClient';
const dep51524 = {"N": import51524_0};
const interopDefault = value => () => value.default || value;

null, null;
var r = dep37876,
  a = dep75961,
  i = interopDefault(a),
  n = dep77328,
  d = interopDefault(n),
  o = dep59465,
  l = dep14232,
  c = dep10553,
  u = dep51524;
let h = [{
    label: "Admin",
    value: "admin"
  }, {
    label: "Super Admin",
    value: "super_admin"
  }, {
    label: "Partner",
    value: "partner"
  }, {
    label: "Forwarder",
    value: "forwarder"
  }, {
    label: "Distributor",
    value: "distributor"
  }, {
    label: "Manufacturer",
    value: "manufacturer"
  }, {
    label: "Supplier",
    value: "supplier"
  }],
  p = ["cash", "credit", "supplier"];
function m() {
  const u = { N: useReleaseSupabase() };
  let {
      data: e,
      status: s
    } = (0, c.useSession)(),
    [t, a] = (0, l.useState)(""),
    [n, m] = (0, l.useState)("partner"),
    [b, x] = (0, l.useState)("cash"),
    [f, _] = (0, l.useState)([]),
    [g, j] = (0, l.useState)(""),
    [v, S] = (0, l.useState)(!1),
    [y, D] = (0, l.useState)(null);
  (0, l.useEffect)(() => {
    "authenticated" === s && u.N.from("invoice_company").select("id,name").order("name", {
      ascending: !0
    }).then(e => {
      let {
        data: s,
        error: t
      } = e;
      !t && s && _(s);
    });
  }, [s]);
  let N = () => {
      a(""), m("partner"), x("cash"), j(""), D(null);
    },
    C = async e => {
      if (e.preventDefault(), D(null), !/^\S+@\S+\.\S+$/.test(t)) return void D({
        type: "error",
        text: "Please enter a valid email address."
      });
      S(!0);
      try {
        let e = await fetch("/api/admin/invite", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: t,
              role: n,
              account_type: b,
              invoice_company_id: g || null
            })
          }),
          s = await e.json();
        if (!e.ok) throw Error(s.error || "Invite failed");
        D({
          type: "success",
          text: "Invite sent to ".concat(t, ". They’ll set their own password from the email link.")
        }), N();
      } catch (e) {
        D({
          type: "error",
          text: e.message
        });
      } finally {
        S(!1);
      }
    };
  return "loading" === s ? null : (null == e ? void 0 : e.user) ? (0, r.jsxs)(o.A, {
    user: e.user,
    children: [(0, r.jsx)(d(), {
      children: (0, r.jsx)("title", {
        className: "jsx-4b6c031594eba05d",
        children: "Invite User | Midnight Express"
      })
    }), (0, r.jsxs)("div", {
      className: "jsx-4b6c031594eba05d invite-wrap",
      children: [(0, r.jsx)("h1", {
        className: "jsx-4b6c031594eba05d page-title",
        children: "✉️ Invite User"
      }), (0, r.jsxs)("form", {
        onSubmit: C,
        className: "jsx-4b6c031594eba05d card",
        children: [(0, r.jsxs)("div", {
          className: "jsx-4b6c031594eba05d row",
          children: [(0, r.jsxs)("div", {
            className: "jsx-4b6c031594eba05d field",
            children: [(0, r.jsx)("label", {
              className: "jsx-4b6c031594eba05d",
              children: "Email"
            }), (0, r.jsx)("input", {
              type: "email",
              placeholder: "name@example.com",
              value: t,
              onChange: e => a(e.target.value),
              required: !0,
              className: "jsx-4b6c031594eba05d"
            }), (0, r.jsx)("small", {
              className: "jsx-4b6c031594eba05d",
              children: "We’ll email them an invite to create a password."
            })]
          }), (0, r.jsxs)("div", {
            className: "jsx-4b6c031594eba05d field compact",
            children: [(0, r.jsx)("label", {
              className: "jsx-4b6c031594eba05d",
              children: "Role"
            }), (0, r.jsx)("select", {
              value: n,
              onChange: e => m(e.target.value),
              className: "jsx-4b6c031594eba05d",
              children: h.map(e => (0, r.jsx)("option", {
                value: e.value,
                className: "jsx-4b6c031594eba05d",
                children: e.label
              }, e.value))
            })]
          }), (0, r.jsxs)("div", {
            className: "jsx-4b6c031594eba05d field compact",
            children: [(0, r.jsx)("label", {
              className: "jsx-4b6c031594eba05d",
              children: "Account Type"
            }), (0, r.jsx)("select", {
              value: b,
              onChange: e => x(e.target.value),
              className: "jsx-4b6c031594eba05d",
              children: p.map(e => (0, r.jsx)("option", {
                value: e,
                className: "jsx-4b6c031594eba05d",
                children: e.charAt(0).toUpperCase() + e.slice(1)
              }, e))
            })]
          }), (0, r.jsxs)("div", {
            className: "jsx-4b6c031594eba05d field",
            children: [(0, r.jsx)("label", {
              className: "jsx-4b6c031594eba05d",
              children: "Invoice Company (optional)"
            }), (0, r.jsxs)("select", {
              value: g,
              onChange: e => j(e.target.value),
              className: "jsx-4b6c031594eba05d",
              children: [(0, r.jsx)("option", {
                value: "",
                className: "jsx-4b6c031594eba05d",
                children: "— Select —"
              }), f.map(e => (0, r.jsx)("option", {
                value: e.id,
                className: "jsx-4b6c031594eba05d",
                children: e.name
              }, e.id))]
            }), (0, r.jsx)("small", {
              className: "jsx-4b6c031594eba05d",
              children: "Used for assigning default billing for this user."
            })]
          })]
        }), (0, r.jsxs)("div", {
          className: "jsx-4b6c031594eba05d actions",
          children: [(0, r.jsx)("button", {
            type: "submit",
            disabled: v,
            className: "jsx-4b6c031594eba05d",
            children: v ? "Sending…" : "Send Invite"
          }), (0, r.jsx)("button", {
            type: "button",
            onClick: N,
            disabled: v,
            className: "jsx-4b6c031594eba05d secondary",
            children: "Reset"
          })]
        }), y && (0, r.jsx)("div", {
          className: "jsx-4b6c031594eba05d " + "alert ".concat("success" === y.type ? "ok" : "err"),
          children: y.text
        })]
      })]
    }), (0, r.jsx)(i(), {
      id: "4b6c031594eba05d",
      children: ".invite-wrap.jsx-4b6c031594eba05d{min-height:100vh;padding:32px 20px 80px;background:radial-gradient(1e3px 600px at 20%-10%,rgba(0,255,255,.08),transparent),radial-gradient(1e3px 600px at 120%20%,rgba(255,0,255,.08),transparent),#0e1726;display:flex;flex-direction:column;align-items:center}.page-title.jsx-4b6c031594eba05d{width:100%;max-width:920px;color:#fff;font-weight:800;letter-spacing:.3px;margin:12px auto 18px;font-size:28px;text-shadow:0 2px 18px rgba(0,0,0,.35)}.card.jsx-4b6c031594eba05d{width:100%;max-width:920px;background:linear-gradient(135deg,#1f3b73 0%,#0084ff 100%);border-radius:16px;padding:18px;box-shadow:0 10px 30px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.06)}.row.jsx-4b6c031594eba05d{display:grid;grid-template-columns:1.5fr .8fr .8fr;gap:14px}.field.jsx-4b6c031594eba05d{display:flex;flex-direction:column}.field.compact.jsx-4b6c031594eba05d select.jsx-4b6c031594eba05d,.field.compact.jsx-4b6c031594eba05d input.jsx-4b6c031594eba05d{height:40px}label.jsx-4b6c031594eba05d{color:#e8f0ff;font-size:12px;letter-spacing:.4px;margin-bottom:6px;text-transform:uppercase;opacity:.9}input.jsx-4b6c031594eba05d,select.jsx-4b6c031594eba05d{background:rgba(8,12,26,.75);border:1px solid rgba(255,255,255,.12);color:#fff;padding:10px 12px;border-radius:10px;outline:none}input.jsx-4b6c031594eba05d::placeholder{color:rgba(255,255,255,.5)}input.jsx-4b6c031594eba05d:focus,select.jsx-4b6c031594eba05d:focus{border-color:#7cc3ff;box-shadow:0 0 0 4px rgba(124,195,255,.18)}small.jsx-4b6c031594eba05d{margin-top:6px;color:rgba(255,255,255,.8);font-size:12px}.actions.jsx-4b6c031594eba05d{display:flex;gap:10px;margin-top:16px}button.jsx-4b6c031594eba05d{background:#0cc2ff;color:#0a1020;font-weight:800;border:none;padding:10px 16px;border-radius:10px;cursor:pointer;transition:transform.05s ease,box-shadow.2s ease;box-shadow:0 8px 20px rgba(12,194,255,.35)}button.jsx-4b6c031594eba05d:hover{transform:translatey(-1px)}button.jsx-4b6c031594eba05d:disabled{opacity:.6;cursor:default;transform:none}.secondary.jsx-4b6c031594eba05d{background:#2b2f4a;color:#e7ebff;box-shadow:none;border:1px solid rgba(255,255,255,.12)}.alert.jsx-4b6c031594eba05d{margin-top:14px;border-radius:10px;padding:10px 12px;font-weight:600}.alert.ok.jsx-4b6c031594eba05d{background:rgba(56,255,172,.15);color:#bfffe8;border:1px solid rgba(56,255,172,.35)}.alert.err.jsx-4b6c031594eba05d{background:rgba(255,68,68,.15);color:#ffd2d2;border:1px solid rgba(255,68,68,.35)}@media(max-width:980px){.row.jsx-4b6c031594eba05d{grid-template-columns:1fr}.page-title.jsx-4b6c031594eba05d{font-size:24px}}"
    })]
  }) : (0, r.jsx)("p", {
    className: "text-center text-white mt-5",
    children: "Not authorised"
  });
}
export default m;

import { releaseRouteAccess } from '@/lib/server/releaseRouteAccess';
export function getServerSideProps(context) { return releaseRouteAccess(context, ["super_admin"], false); }

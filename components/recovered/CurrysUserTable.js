import useReleaseSupabase from '@/hooks/useReleaseSupabase';
// Recovered from the existing production page factory; framework imports remapped locally.
import * as dep37876 from 'react/jsx-runtime';
import * as dep14232 from 'react';
import { supabase as import51524_0 } from '@/lib/supabaseClient';
const dep51524 = {"N": import51524_0};
import { toast as import4301_0 } from 'react-toastify';
const dep4301 = {"oR": import4301_0};
const interopDefault = value => () => value.default || value;

null;
var a = dep37876,
  n = dep14232,
  r = dep51524,
  i = dep4301;
function l(e) {
  const r = { N: useReleaseSupabase() };
  let {
      currentUser: s
    } = e,
    [t, l] = (0, n.useState)([]),
    [c, d] = (0, n.useState)(""),
    [o, u] = (0, n.useState)(!1),
    [h, m] = (0, n.useState)(""),
    [x, v] = (0, n.useState)("currys"),
    [j, b] = (0, n.useState)(!1);
  async function f() {
    u(!0);
    let {
      data: e,
      error: s
    } = await r.N.from("users").select("id,email,name,role,status,last_sign_in_at").or("roles.cs.{currys,currys_admin}");
    s ? (i.oR.error("Failed to load users: " + s.message), l([])) : l(e || []), u(!1);
  }
  async function N() {
    if (!h) return;
    let e = h.trim().toLowerCase(),
      {
        error: s
      } = await r.N.from("users").upsert([{
        email: e,
        role: x,
        roles: [x],
        status: "invited"
      }], {
        onConflict: "email"
      });
    s ? i.oR.error("Invite failed: " + s.message) : (i.oR.success("User invited!"), m(""), b(!1), f());
  }
  async function p(e, s) {
    let {
      error: t
    } = await r.N.from("users").update({
      role: s,
      roles: [s]
    }).eq("id", e);
    t ? i.oR.error("Role update failed: " + t.message) : f();
  }
  async function g(e) {
    let {
      error: s
    } = await r.N.from("users").update({
      status: "inactive"
    }).eq("id", e);
    s ? i.oR.error("Deactivate failed: " + s.message) : f();
  }
  async function _(e) {
    let {
      error: s
    } = await r.N.from("users").update({
      status: "active"
    }).eq("id", e);
    s ? i.oR.error("Reactivate failed: " + s.message) : f();
  }
  (0, n.useEffect)(() => {
    f();
  }, []);
  let y = t.filter(e => {
    var s, t;
    return !c || (null == (s = e.email) ? void 0 : s.toLowerCase().includes(c.toLowerCase())) || (null == (t = e.name) ? void 0 : t.toLowerCase().includes(c.toLowerCase()));
  });
  return (0, a.jsxs)("div", {
    children: [(0, a.jsxs)("div", {
      className: "d-flex mb-2",
      style: {
        gap: 12
      },
      children: [(0, a.jsx)("input", {
        className: "form-control",
        placeholder: "Search users",
        value: c,
        onChange: e => d(e.target.value)
      }), (0, a.jsx)("button", {
        className: "btn btn-success",
        onClick: () => b(!0),
        children: "➕ Invite User"
      })]
    }), j && (0, a.jsxs)("div", {
      className: "card mb-3 p-3",
      children: [(0, a.jsx)("h5", {
        children: "Invite User"
      }), (0, a.jsx)("input", {
        className: "form-control mb-2",
        placeholder: "Email",
        value: h,
        onChange: e => m(e.target.value)
      }), (0, a.jsxs)("select", {
        className: "form-select mb-2",
        value: x,
        onChange: e => v(e.target.value),
        children: [(0, a.jsx)("option", {
          value: "currys",
          children: "CSR / Booker"
        }), (0, a.jsx)("option", {
          value: "currys_admin",
          children: "Currys Admin"
        })]
      }), (0, a.jsx)("button", {
        className: "btn btn-primary me-2",
        onClick: N,
        children: "Send Invite"
      }), (0, a.jsx)("button", {
        className: "btn btn-secondary",
        onClick: () => b(!1),
        children: "Cancel"
      })]
    }), o && (0, a.jsx)("div", {
      className: "mb-2",
      children: "Loading…"
    }), (0, a.jsxs)("table", {
      className: "table table-dark table-striped table-bordered",
      children: [(0, a.jsx)("thead", {
        children: (0, a.jsxs)("tr", {
          children: [(0, a.jsx)("th", {
            children: "Email"
          }), (0, a.jsx)("th", {
            children: "Name"
          }), (0, a.jsx)("th", {
            children: "Role"
          }), (0, a.jsx)("th", {
            children: "Status"
          }), (0, a.jsx)("th", {
            children: "Last Login"
          }), (0, a.jsx)("th", {
            children: "Actions"
          })]
        })
      }), (0, a.jsxs)("tbody", {
        children: [y.map(e => (0, a.jsxs)("tr", {
          children: [(0, a.jsx)("td", {
            children: e.email
          }), (0, a.jsx)("td", {
            children: e.name || "—"
          }), (0, a.jsx)("td", {
            children: (0, a.jsxs)("select", {
              className: "form-select",
              value: e.role,
              disabled: (null == s ? void 0 : s.id) === e.id,
              onChange: s => p(e.id, s.target.value),
              children: [(0, a.jsx)("option", {
                value: "currys",
                children: "CSR / Booker"
              }), (0, a.jsx)("option", {
                value: "currys_admin",
                children: "Currys Admin"
              }), (0, a.jsx)("option", {
                value: "adr_ops",
                children: "ADR Ops"
              })]
            })
          }), (0, a.jsx)("td", {
            children: e.status || "active"
          }), (0, a.jsx)("td", {
            children: e.last_sign_in_at ? new Date(e.last_sign_in_at).toLocaleString() : "—"
          }), (0, a.jsx)("td", {
            children: "inactive" !== e.status ? (0, a.jsx)("button", {
              className: "btn btn-sm btn-danger",
              onClick: () => g(e.id),
              disabled: (null == s ? void 0 : s.id) === e.id,
              children: "Deactivate"
            }) : (0, a.jsx)("button", {
              className: "btn btn-sm btn-success",
              onClick: () => _(e.id),
              disabled: (null == s ? void 0 : s.id) === e.id,
              children: "Reactivate"
            })
          })]
        }, e.id)), !o && 0 === y.length && (0, a.jsx)("tr", {
          children: (0, a.jsx)("td", {
            colSpan: 6,
            className: "text-center",
            children: "No users found."
          })
        })]
      })]
    })]
  });
}
export { l as A };

export default l;

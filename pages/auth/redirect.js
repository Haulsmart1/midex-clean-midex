// Recovered from the existing production page factory; framework imports remapped locally.
import * as dep37876 from 'react/jsx-runtime';
import * as dep14232 from 'react';
import * as dep10553 from 'next-auth/react';
import * as dep89099 from 'next/router';
const interopDefault = value => () => value.default || value;

null, null;
var i = dep37876,
  s = dep14232,
  u = dep10553,
  a = dep89099;
function d() {
  let {
      data: e,
      status: r
    } = (0, u.useSession)(),
    n = (0, a.useRouter)(),
    d = (0, s.useRef)(!1),
    t = (0, s.useMemo)(() => {
      let r = (null == e ? void 0 : e.user) || {};
      return (Array.isArray(r.roles) ? r.roles : [r.role]).filter(Boolean).map(e => String(e).toLowerCase());
    }, [e]);
  return (0, s.useEffect)(() => {
    if ("authenticated" === r && (null == e ? void 0 : e.user) && !d.current) {
      if (d.current = !0, t.includes("super_admin")) return void n.replace("/dashboard/admin/super");
      if (t.includes("admin")) return void n.replace("/dashboard/admin");
      if (t.includes("forwarder")) return void n.replace("/dashboard/forwarder");
      if (t.includes("currys_admin")) return void n.replace("/dashboard/currys");
      if (t.includes("customs_agent")) return void n.replace("/dashboard/customs");
      if (t.includes("user")) return void n.replace("/dashboard/user");
      if (t.includes("partner") || t.includes("partner_admin") || t.includes("vehicle")) return void n.replace("/dashboard/partner");
      n.replace("/login");
    }
  }, [r, e, t, n]), (0, i.jsx)("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#000",
      color: "#fff",
      fontSize: 22
    },
    children: "Signing you in…"
  });
}
export default d;

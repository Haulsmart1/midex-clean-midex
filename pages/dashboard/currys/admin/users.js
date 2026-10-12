// Recovered from the existing production page factory; framework imports remapped locally.
import * as dep37876 from 'react/jsx-runtime';
import * as dep10553 from 'next-auth/react';
import * as dep14232 from 'react';
import import50886_0 from '@/components/recovered/CurrysUserTable';
const dep50886 = {"A": import50886_0};
const interopDefault = value => () => value.default || value;

null, null;
var a = dep37876,
  n = dep10553,
  r = dep14232,
  i = dep50886;
function l() {
  let {
      data: e,
      status: s
    } = (0, n.useSession)(),
    [t, l] = (0, r.useState)(!1);
  return ((0, r.useEffect)(() => {
    var t;
    "loading" !== s && (((null == e || null == (t = e.user) ? void 0 : t.roles) || []).includes("currys_admin") || l(!0));
  }, [e, s]), "loading" === s) ? (0, a.jsx)("div", {
    className: "text-center p-4",
    children: "\uD83D\uDD04 Loading..."
  }) : t ? (0, a.jsx)("div", {
    className: "text-center text-danger p-5",
    children: "❌ Not authorized. Only Currys Admins can access this page."
  }) : (0, a.jsxs)("div", {
    className: "container py-4",
    children: [(0, a.jsx)("h2", {
      className: "mb-4",
      children: "Currys User Management"
    }), (0, a.jsx)(i.A, {
      currentUser: null == e ? void 0 : e.user
    })]
  });
}
export default l;

import { releaseRouteAccess } from '@/lib/server/releaseRouteAccess';
export function getServerSideProps(context) { return releaseRouteAccess(context, ["currys_admin","super_admin"], false); }

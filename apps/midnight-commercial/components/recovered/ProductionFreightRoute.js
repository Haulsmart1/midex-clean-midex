// Recovered from the existing production page factory; framework imports remapped locally.
import * as dep37876 from 'react/jsx-runtime';
import * as dep77328 from 'next/head';
import * as dep48230 from 'next/link';
const interopDefault = value => () => value.default || value;

null, null;
var n = dep37876,
  i = dep77328,
  o = interopDefault(i),
  a = dep48230,
  s = interopDefault(a),
  c = !0;
function d(e) {
  let {
      slug: r,
      description: t
    } = e,
    i = r.split("-").map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(" "),
    a = "https://www.midnight-xpress.com/freight/".concat(r);
  return (0, n.jsxs)(n.Fragment, {
    children: [(0, n.jsxs)(o(), {
      children: [(0, n.jsxs)("title", {
        children: [i, " | Sameday Courier Pallets & Freight | Midnight Express"]
      }), (0, n.jsx)("meta", {
        name: "description",
        content: t
      }), (0, n.jsx)("meta", {
        name: "keywords",
        content: "Sameday Courier, Pallet Carrier, Freight Couriers, Express Pallets, ADR Freight, ".concat(i, ", ").concat(r.replace(/-/g, " "))
      }), (0, n.jsx)("meta", {
        property: "og:title",
        content: "".concat(i, " | Midnight Express Freight")
      }), (0, n.jsx)("meta", {
        property: "og:description",
        content: t
      }), (0, n.jsx)("meta", {
        property: "og:image",
        content: "/midex7.jpg"
      }), (0, n.jsx)("meta", {
        property: "og:type",
        content: "website"
      }), (0, n.jsx)("meta", {
        property: "og:url",
        content: a
      }), (0, n.jsx)("link", {
        rel: "canonical",
        href: a
      }), (0, n.jsx)("script", {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Sameday Courier — ".concat(i),
            description: t,
            brand: {
              "@type": "Organization",
              name: "Midnight Express"
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "GBP",
              price: "From 49.00",
              availability: "https://schema.org/InStock"
            },
            url: a,
            category: "CourierService"
          })
        }
      })]
    }), (0, n.jsx)("main", {
      style: {
        minHeight: "100vh",
        backgroundImage: 'url("/midex.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "3rem",
        color: "white"
      },
      children: (0, n.jsxs)("article", {
        style: {
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          padding: "2rem",
          borderRadius: "8px"
        },
        children: [(0, n.jsx)("h1", {
          children: i
        }), (0, n.jsx)("p", {
          children: (0, n.jsx)("strong", {
            children: t
          })
        }), (0, n.jsx)("p", {
          children: "This route is operated by Midnight Express sameday couriers and pallet carriers with ADR and customs-ready freight."
        }), (0, n.jsx)("p", {
          children: "Book by 12:00 noon for next-day delivery. Tracked, sealed, and delivered with compliance and care."
        }), (0, n.jsxs)("div", {
          style: {
            marginTop: "2rem",
            display: "flex",
            gap: "1rem"
          },
          children: [(0, n.jsx)(s(), {
            href: "/contact",
            children: (0, n.jsx)("span", {
              style: {
                display: "inline-block",
                backgroundColor: "#28a745",
                padding: "10px 20px",
                color: "white",
                fontWeight: "bold",
                borderRadius: "6px",
                textDecoration: "none",
                cursor: "pointer"
              },
              children: "Contact Us"
            })
          }), (0, n.jsx)(s(), {
            href: "/",
            children: (0, n.jsx)("span", {
              style: {
                display: "inline-block",
                backgroundColor: "#444",
                padding: "10px 20px",
                color: "white",
                fontWeight: "bold",
                borderRadius: "6px",
                textDecoration: "none",
                cursor: "pointer"
              },
              children: "← Back to Routes"
            })
          })]
        })]
      })
    })]
  });
}
export { c as __N_SSG };
export default d;

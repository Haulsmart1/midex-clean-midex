import { XeroClient } from 'xero-node';

export default async function handler(req, res) {
  const xero = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID,
    clientSecret: process.env.XERO_CLIENT_SECRET,
    redirectUris: ['https://yourdomain.com/api/xero/callback'],
    scopes: 'openid profile email accounting.transactions accounting.contacts offline_access'
  });

  const consentUrl = await xero.buildConsentUrl();
  res.redirect(consentUrl);
}

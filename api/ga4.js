import { createSign } from 'node:crypto';

const buttons = [
  ['diamond', 'Conheça o Diamond', 'https://wa.me/5583991139391?text=Ol%C3%A1!%20Quero%20mais%20informa%C3%A7%C3%B5es%20sobre%20o%20Diamond.'],
  ['mirante-golden', 'Conheça o Mirante Golden', 'https://wa.me/5583991139391?text=Ol%C3%A1!%20Quero%20mais%20informa%C3%A7%C3%B5es%20sobre%20o%20Mirante%20Golden.'],
  ['agende-visita', 'Agende uma visita', 'https://wa.me/5583987260270?text=Ol%C3%A1!%20Quero%20agendar%20uma%20visita.'],
  ['whatsapp-equipe', 'Fale com a equipe pelo WhatsApp', 'https://wa.me/5583991139391?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20a%20equipe.%0A'],
  ['obras', 'Acompanhe nossas obras', 'https://wa.me/5583991139391?text=Ol%C3%A1!%20Gostaria%20de%20acompanhar%20o%20andamento%20das%20obras'],
];
const valid = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '');
const b64 = x => Buffer.from(x).toString('base64url');

async function token() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!email || !key || !process.env.GA4_PROPERTY_ID) throw Error('GA4 não configurado no servidor.');
  const now = Math.floor(Date.now() / 1000), audience = 'https://oauth2.googleapis.com/token';
  const unsigned = `${b64(JSON.stringify({alg:'RS256',typ:'JWT'}))}.${b64(JSON.stringify({iss:email,scope:'https://www.googleapis.com/auth/analytics.readonly',aud:audience,iat:now,exp:now+3600}))}`;
  const signer = createSign('RSA-SHA256'); signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(key, 'base64url')}`;
  const r = await fetch(audience, {method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion})});
  if (!r.ok) throw Error('Não foi possível autenticar no Google Analytics.'); return (await r.json()).access_token;
}
async function report(accessToken, body) {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA4_PROPERTY_ID}:runReport`, {method:'POST',headers:{authorization:`Bearer ${accessToken}`,'content-type':'application/json'},body:JSON.stringify(body)});
  if (!r.ok) throw Error('Não foi possível consultar os dados do GA4.'); return r.json();
}
const total = r => Number(r.rows?.[0]?.metricValues?.[0]?.value || 0);
const clicks = range => ({dateRanges:[range],dimensions:[{name:'linkUrl'}],metrics:[{name:'eventCount'}],dimensionFilter:{filter:{fieldName:'eventName',stringFilter:{value:'click'}}},limit:1000});
export default async function handler(req, res) {
  const {startDate,endDate,previousStartDate,previousEndDate} = req.query;
  if (![startDate,endDate,previousStartDate,previousEndDate].every(valid)) return res.status(400).json({error:'Intervalo de datas inválido.'});
  try {
    const accessToken = await token(), current={startDate,endDate}, previous={startDate:previousStartDate,endDate:previousEndDate};
    const basic = (range, metric) => ({dateRanges:[range],metrics:[{name:metric}],...(metric === 'eventCount' ? {dimensionFilter:{filter:{fieldName:'eventName',stringFilter:{value:'click'}}}} : {})});
    const [currentViews, previousViews, currentClicks, previousClicks, currentLinks, previousLinks] = await Promise.all([
      report(accessToken,basic(current,'screenPageViews')), report(accessToken,basic(previous,'screenPageViews')),
      report(accessToken,basic(current,'eventCount')), report(accessToken,basic(previous,'eventCount')),
      report(accessToken,clicks(current)), report(accessToken,clicks(previous))
    ]);
    const find = (rows, url) => Number(rows?.find(r=>r.dimensionValues?.[0]?.value===url)?.metricValues?.[0]?.value || 0);
    return res.status(200).json({pageViews:[total(currentViews),total(previousViews)],totalClicks:[total(currentClicks),total(previousClicks)],buttons:buttons.map(([id,label,url])=>({id,label,current:find(currentLinks.rows,url),previous:find(previousLinks.rows,url)}))});
  } catch (error) { console.error(error); return res.status(500).json({error:error.message || 'Erro ao consultar o GA4.'}); }
}

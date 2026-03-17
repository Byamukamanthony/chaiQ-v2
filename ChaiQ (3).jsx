import { useState, useRef, useEffect, useCallback, memo } from "react";

/* ─────────────────────────────────────────────────────────────────
   THEME
───────────────────────────────────────────────────────────────── */
const C = {
  bg:"#0A100E",  sur:"#111817",  card:"#162019",  card2:"#1B2923",
  b:"rgba(255,255,255,0.06)",  bhi:"rgba(255,255,255,0.1)",
  teal:"#6ECFBE", tMid:"#1F4940", tBright:"#2A5E54", tGlow:"rgba(110,207,190,0.09)",
  tx:"#E9EDEB",  sub:"#7B9A90",  mut:"#354845",  mutL:"#4C6860",
  red:"#E05C5C", redD:"rgba(224,92,92,0.09)",
  yel:"#D4A444", yelD:"rgba(212,164,68,0.09)",
  grn:"#4CAF87", grnD:"rgba(76,175,135,0.09)",
  blu:"#5BA4CF", bluD:"rgba(91,164,207,0.09)",
};

/* ─────────────────────────────────────────────────────────────────
   SYSTEM PROMPT
───────────────────────────────────────────────────────────────── */
const SYS = (lang) => `You are ChaiQ — expert AI agronomist for East African tea farming (Uganda, Kenya, Rwanda, Tanzania). Help smallholder tea farmers with disease identification & treatment (blister blight, red rust, root rot, grey blight, purple blotch, brown blight, dieback), pest control (tea mosquito bug, mites, thrips, looper caterpillars, shot-hole borer), NPK fertilizer schedules, pruning & plucking, soil pH (target 4.5–5.5), yield optimization, weather-based decisions, and factory price negotiation.
When diagnosing from images: describe exactly what you observe on the plant, state disease name, confidence %, severity (Critical/High/Medium/Low), numbered treatment steps, and 2 prevention tips. Always close disease advice with "Visit your nearest extension officer if symptoms worsen." Reference TRFK, NARO Uganda, Uganda Tea Association where relevant.
${lang==="sw"?"Respond in Kiswahili. Simple, practical language.":lang==="lg"?"Respond in Luganda. Simple, practical farming language.":"Respond in clear, practical English."}`;

/* ─────────────────────────────────────────────────────────────────
   TRANSLATIONS
───────────────────────────────────────────────────────────────── */
const TR = {
  en:{
    greet:"Hello 👋 I'm ChaiQ — your AI tea farming assistant. Upload a leaf photo for instant diagnosis, or ask me anything about your farm.",
    ph:"Message ChaiQ…",
    chips:["Why are leaves yellowing?","Treat blister blight?","Best fertilizer schedule?","When to harvest?","How to improve tea grade?"],
    scanSub:"Upload a real leaf photo for AI vision diagnosis",
    upTap:"Tap to upload leaf photo",  upSub:"JPG · PNG · Close-up works best",
    demo:"▶  Run Demo Scan",  newScan:"New Scan",  askMore:"Ask ChaiQ about this",
    diagDone:"Diagnosis Complete",  scanning:"Analyzing your leaf…",  vScan:"Analyzing with AI Vision…",
    connErr:"Connection issue — try again.",  scanPfx:"My leaf scan result: ",
    tabs:["Scan","Chat","Market","Weather","More"],
    seg:["Off","Favorites","On"],  qs:"Quick Save",
    mktT:"Tea Market",  mktS:"Factory gate prices · Uganda & Kenya",
    wxT:"Farm Weather",  wxS:"7-day forecast + farming calendar",
    moreT:"More",
    disT:"Disease Reference",  guideT:"Farming Guides",  waT:"WhatsApp",  settT:"Settings",
    histT:"Scan History",  histE:"No scans yet",
    sev:{Critical:"Critical",High:"High",Medium:"Medium",Low:"Low"},
    trend:{up:"↑ Rising",down:"↓ Falling",stable:"→ Stable"},
    online:"online",  ver:"Version 1.0 · Beta",
    waSteps:["Save ChaiQ's WhatsApp number","Send a photo of your sick tea leaf","Get a diagnosis in seconds","Ask follow-up questions in your language"],
    waCta:"Save +256 700 CHAIQ · Send \"Hello\" to begin",
    gradeQ:"How do I improve my tea grade to get BOPF prices? What factors matter most?",
    wxQ:"Given this week's weather — rain Tuesday, dry Wednesday to Friday — what farm tasks should I do in order of priority?",
    region:"East Africa",  status:"Connected",
  },
  sw:{
    greet:"Habari 👋 Mimi ni ChaiQ — msaidizi wako wa AI kwa kilimo cha chai. Pakia picha ya jani kwa uchunguzi wa haraka, au niulize chochote kuhusu shamba lako.",
    ph:"Tuma ujumbe…",
    chips:["Kwa nini majani yanageuka njano?","Kutibu malengelenge?","Ratiba bora ya mbolea?","Ni lini kuvuna?","Kuboresha daraja la chai?"],
    scanSub:"Pakia picha ya jani halisi kwa uchunguzi wa AI vision",
    upTap:"Gusa kupakia picha ya jani",  upSub:"JPG · PNG · Picha ya karibu inafaa zaidi",
    demo:"▶  Onyesha Skana",  newScan:"Skana Mpya",  askMore:"Uliza ChaiQ kuhusu hili",
    diagDone:"Uchunguzi Umekamilika",  scanning:"Inachambua jani lako…",  vScan:"Inachambua kwa AI Vision…",
    connErr:"Tatizo la mtandao — jaribu tena.",  scanPfx:"Skana yangu inaonyesha: ",
    tabs:["Skana","Mazungumzo","Soko","Hewa","Zaidi"],
    seg:["Hapana","Vipendwa","Ndiyo"],  qs:"Hifadhi Haraka",
    mktT:"Soko la Chai",  mktS:"Bei za kiwanda · Uganda na Kenya",
    wxT:"Hali ya Hewa Shambani",  wxS:"Utabiri wa siku 7 + kalenda ya kilimo",
    moreT:"Zaidi",
    disT:"Magonjwa ya Chai",  guideT:"Miongozo ya Kilimo",  waT:"WhatsApp",  settT:"Mipangilio",
    histT:"Historia ya Skana",  histE:"Hakuna skana bado",
    sev:{Critical:"Hatari",High:"Juu",Medium:"Wastani",Low:"Chini"},
    trend:{up:"↑ Inaongezeka",down:"↓ Inashuka",stable:"→ Imara"},
    online:"mtandaoni",  ver:"Toleo 1.0 · Beta",
    waSteps:["Hifadhi nambari ya WhatsApp ya ChaiQ","Tuma picha ya jani la chai lililoathirika","Pata uchunguzi kwa sekunde chache","Uliza maswali zaidi kwa lugha yako"],
    waCta:"Hifadhi +256 700 CHAIQ · Tuma \"Habari\" kuanza",
    gradeQ:"Ninawezaje kuboresha daraja la chai yangu kupata bei ya BOPF? Ni mambo gani muhimu zaidi?",
    wxQ:"Kwa kuzingatia hali ya hewa wiki hii — mvua Jumanne, kavu Jumatano hadi Ijumaa — ni kazi gani za kilimo ninazopaswa kuzipanga kwanza?",
    region:"Afrika Mashariki",  status:"Imeunganishwa",
  },
  lg:{
    greet:"Osibye otya 👋 Nze ChaiQ — omuyambi wo omukugu mu kulima chai. Yongera ekifaananyi ky'ekijani okufuna okunnoonyereza amangu, oba mbuuze kintu kyonna ku ggaasi lyo.",
    ph:"Tuma obubaka…",
    chips:["Lwaki ebijani bikyuka okuba njeru?","Engeri y'okuwonya amafuufa?","Nambula ennungi y'mbolebole?","Edda ki okuuma?","Okwongera omuwendo gw'chai?"],
    scanSub:"Yongera ekifaananyi ky'ekijani ky'amazima okufuna okunnoonyereza kw'AI vision",
    upTap:"Nyiga okuyingiza ekifaananyi ky'ekijani",  upSub:"JPG · PNG · Ekifaananyi eky'okumpi kinnungi",
    demo:"▶  Laga Okukeba",  newScan:"Okukeba Okuggya",  askMore:"Buuza ChaiQ ku kino",
    diagDone:"Okunnoonyereza Kumala",  scanning:"Ekijani kikebwa…",  vScan:"Ekikebwa na AI Vision…",
    connErr:"Ekizibu ky'omukutu — gezaako nate.",  scanPfx:"Okukebwa kwange kulagira: ",
    tabs:["Okukeba","Okwogerako","Ssoko","Obudde","Nnyini"],
    seg:["Nedda","Ebyokusanyukira","Yego"],  qs:"Tereka Mangu",
    mktT:"Ssoko lya Chai",  mktS:"Bbeeyi z'ettaka · Uganda ne Kenya",
    wxT:"Obudde ku Ggaasi",  wxS:"Ebiteeso by'ennaku 7 + nambula y'okulima",
    moreT:"Nnyini",
    disT:"Endwadde za Chai",  guideT:"Ebiragiro by'Okulima",  waT:"WhatsApp",  settT:"Entegeka",
    histT:"Ebyakukebwa",  histE:"Tewali kukebwa nakyali",
    sev:{Critical:"Obuzibu",High:"Okusingayo",Medium:"Wakati",Low:"Pimo"},
    trend:{up:"↑ Ewedda",down:"↓ Ekendeera",stable:"→ Egumira"},
    online:"online",  ver:"Etandika 1.0 · Beta",
    waSteps:["Tereka nambala ya WhatsApp ya ChaiQ","Tuma ekifaananyi ky'ekijani eky'obulwadde","Funa okunnoonyereza mu nkumi","Buuza ebibuuzo mu lulimi lwo"],
    waCta:"Tereka +256 700 CHAIQ · Tuma \"Osibye otya\" okutandika",
    gradeQ:"Nsobola ntya okwongera omuwendo gw'chai gwange okufuna bbeeyi ya BOPF?",
    wxQ:"Okusinziira ku budde bwa wiiki eno — enkuba Lwakubiri, enjuyi Lwasatu okutuuka Lwakukaaga — bikozesebwa ki by'okulima bye neetaaga okusooka?",
    region:"Afrika y'Amazima",  status:"Ekwataniddwa",
  },
};

/* ─────────────────────────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────────────────────────── */
const DISEASES = [
  {name:"Blister Blight",ico:"🔵",sev:"High",    desc:"White blister pustules on young shoots & flush",     rx:"Copper fungicide 2g/L every 14 days · remove infected shoots"},
  {name:"Grey Blight",   ico:"⚫",sev:"High",    desc:"Irregular grey-brown spots with dark borders",       rx:"Mancozeb or copper spray · clear leaf litter beneath bushes"},
  {name:"Red Rust",      ico:"🟠",sev:"Medium",  desc:"Orange-red algal crust on stems & branches",        rx:"Copper-based spray · thin canopy to improve airflow"},
  {name:"Root Rot",      ico:"🟤",sev:"Critical",desc:"Wilting, collar rot, yellowing from soil line up",   rx:"Metalaxyl drench · urgent drainage work · replace affected plants"},
  {name:"Purple Blotch", ico:"🟣",sev:"Medium",  desc:"Purple-brown blotches on mature leaves",             rx:"Copper fungicide · remove & burn affected leaves"},
  {name:"Brown Blight",  ico:"🟫",sev:"High",    desc:"Water-soaked brown lesions spreading rapidly",       rx:"Copper spray · prune infected twigs to healthy wood"},
  {name:"Die-back",      ico:"⚠️",sev:"High",    desc:"Shoot tips dying back, bark splitting or cracking",  rx:"Hard prune to healthy tissue · foliar micronutrient feed"},
];

const MARKETS = [
  {r:"Kericho, KE",  g:"BOPF", p:"KES 48/kg",    t:"up",    w:"+8%"},
  {r:"Nandi, KE",    g:"PF1",  p:"KES 42/kg",    t:"stable",w:" 0%"},
  {r:"Limuru, KE",   g:"Dust", p:"KES 38/kg",    t:"up",    w:"+3%"},
  {r:"Kagera, UG",   g:"BOP",  p:"UGX 2,100/kg", t:"up",    w:"+5%"},
  {r:"Mbarara, UG",  g:"Dust", p:"UGX 1,800/kg", t:"down",  w:"-2%"},
  {r:"Rwenzori, UG", g:"BOP",  p:"UGX 1,950/kg", t:"stable",w:" 0%"},
];

const WX_DAYS = [
  {d:"Today",ico:"⛅",hi:"22°C",lo:"16°C",rain:"60%",farm:"Hold off spraying"},
  {d:"Tue",  ico:"🌧️",hi:"19°C",lo:"14°C",rain:"90%",farm:"No pesticides — rain"},
  {d:"Wed",  ico:"☀️",hi:"26°C",lo:"17°C",rain:"5%", farm:"Ideal plucking day"},
  {d:"Thu",  ico:"⛅",hi:"23°C",lo:"15°C",rain:"35%",farm:"Check for blight"},
  {d:"Fri",  ico:"☀️",hi:"27°C",lo:"18°C",rain:"5%", farm:"Apply fertilizer"},
  {d:"Sat",  ico:"⛅",hi:"24°C",lo:"16°C",rain:"40%",farm:"Prune if needed"},
  {d:"Sun",  ico:"🌧️",hi:"20°C",lo:"14°C",rain:"75%",farm:"Early-AM harvest only"},
];

const GUIDES = [
  {ico:"🌱",t:"Planting New Tea",    q:"How do I plant new tea seedlings? Spacing, soil prep, nursery care?"},
  {ico:"✂️",t:"Pruning Guide",       q:"When and how to prune tea? Light vs heavy pruning, tools, aftercare?"},
  {ico:"🧪",t:"Fertilizer Schedule", q:"Full fertilizer schedule for East African tea — NPK, timing, foliar feeding?"},
  {ico:"🐛",t:"Pest Management",     q:"Most damaging tea pests in East Africa and how to control them organically and chemically?"},
  {ico:"💰",t:"Improve Tea Grade",   q:"How do I improve my tea grade to achieve BOPF and higher factory prices?"},
  {ico:"💧",t:"Drought Management",  q:"How to manage tea during drought and dry season? Irrigation and conservation tips?"},
  {ico:"🌿",t:"Organic Farming",     q:"How to transition to organic tea farming? What certifications and price premiums exist?"},
  {ico:"📦",t:"Post-Harvest Quality",q:"How to handle green leaf after plucking to maintain factory quality standards?"},
];

const WA_DEMO = {
  en:[
    {f:true, m:"📷 [Photo of tea leaf with white spots attached]",t:"8:02"},
    {f:false,m:"I can see white blister-like pustules on your young tea shoots.\n\n🔬 Blister Blight — 87% confidence\nSeverity: High\n\nTreatment:\n1. Spray copper fungicide at 2g per litre\n2. Remove heavily infected shoots immediately\n3. Apply early morning — never before rain\n4. Repeat every 14 days until clear\n\nVisit your nearest extension officer if it spreads.",t:"8:02"},
    {f:true, m:"How much fungicide for my 2 acres?",t:"8:06"},
    {f:false,m:"For 2 acres:\n\nMix 400g copper fungicide in 200 litres water\n(~100L per acre with a knapsack sprayer)\n\nBrands to ask for:\n• Vitigran Blue\n• Kocide 2000\n• Blue Shield\n\n⚠️ Wait 7 days after spraying before plucking.",t:"8:06"},
  ],
  sw:[
    {f:true, m:"📷 [Picha ya jani la chai lenye madoa meupe]",t:"8:02"},
    {f:false,m:"Naona vidonda kama malengelenge kwenye machipukizi.\n\n🔬 Ugonjwa wa Malengelenge — 87%\nUkali: Juu\n\nMatibabu:\n1. Nyunyiza dawa ya shaba 2g/lita\n2. Ondoa machipukizi yaliyoathirika haraka\n3. Nyunyiza asubuhi mapema — si kabla ya mvua\n4. Rudia kila siku 14\n\nTembelea afisa ugani kama itaenea.",t:"8:02"},
    {f:true, m:"Dawa ngapi kwa ekari zangu 2?",t:"8:06"},
    {f:false,m:"Kwa ekari 2:\n\nChanganya gramu 400 za dawa ya shaba katika lita 200 za maji\n\nBrand: Vitigran Blue, Kocide 2000, Blue Shield\n\n⚠️ Subiri siku 7 kabla ya kuvuna baada ya kunyunyizia.",t:"8:06"},
  ],
  lg:[
    {f:true, m:"📷 [Ekifaananyi ky'ekijani ekirimu amabala amawera]",t:"8:02"},
    {f:false,m:"Ndaba ebintu nga amafuufa ku ebisinde by'chai byo.\n\n🔬 Endwadde y'Amafuufa — 87%\nObuzibu: Okusingayo\n\nObuwonyefu:\n1. Siga eddagala ly'omubisi 2g ku liita\n2. Ggyawo ebisinde ebyononekadde mangu\n3. Siga enkya ennyo — si nga enkuba bwegenda kuba\n4. Ddamu buli ennaku 14\n\nGenda gy'omupangisi bw'endwadde bw'egaziwa.",t:"8:02"},
    {f:true, m:"Eddagala emeka ku bikka byo ebibiri?",t:"8:06"},
    {f:false,m:"Ku bikka 2:\n\nYunganya gramu 400 z'eddagala mu liita 200 z'amazzi\n\nBrand: Vitigran Blue, Kocide 2000, Blue Shield\n\n⚠️ Linda ennaku 7 oluvannyuma lw'okusiga nga tonnaba kuuma.",t:"8:06"},
  ],
};

/* ─────────────────────────────────────────────────────────────────
   SEVERITY STYLES
───────────────────────────────────────────────────────────────── */
const SEV = {
  Critical:{bg:C.redD, bd:`${C.red}44`, tx:C.red},
  High:    {bg:C.yelD, bd:`${C.yel}44`, tx:C.yel},
  Medium:  {bg:C.grnD, bd:`${C.grn}44`, tx:C.grn},
  Low:     {bg:C.bluD, bd:`${C.blu}44`, tx:C.blu},
};

/* ─────────────────────────────────────────────────────────────────
   SMALL REUSABLE COMPONENTS
───────────────────────────────────────────────────────────────── */
const Logo = memo(({sz=110}) => {
  const r=sz/2, n=10, iR=r*.42, dR=r*.79;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      {Array.from({length:n}).map((_,i)=>{
        const a=(i/n)*2*Math.PI-Math.PI/2, span=.54/n*2*Math.PI;
        const p=(a_)=>[r+dR*Math.cos(a_), r+dR*Math.sin(a_)];
        const [x1,y1]=p(a), [x2,y2]=p(a+span);
        return <path key={i} d={`M${x1},${y1} A${dR},${dR} 0 0,1 ${x2},${y2}`} stroke={C.teal} strokeWidth={r*.13} strokeLinecap="round" fill="none"/>;
      })}
      <circle cx={r} cy={r} r={iR} fill={C.teal}/>
      <text x={r} y={r+iR*.37} textAnchor="middle" fontSize={iR*.94} fill={C.bg}>🍃</text>
    </svg>
  );
});

const SegCtrl = memo(({opts,val,set}) => (
  <div style={{display:"flex",background:C.card,borderRadius:50,padding:3,border:`1px solid ${C.b}`}}>
    {opts.map(o=>(
      <button key={o} onClick={()=>set(o)} style={{flex:1,padding:"9px 4px",borderRadius:50,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:val===o?C.tBright:"transparent",color:val===o?C.teal:C.sub,transition:"all .15s"}}>
        {o}
      </button>
    ))}
  </div>
));

const TealBtn = memo(({children,onClick,ghost,disabled,flex}) => (
  <button onClick={onClick} disabled={disabled} style={{flex:flex||undefined,padding:"13px",background:disabled?C.card:ghost?C.card:C.tMid,border:`1px solid ${disabled?C.b:ghost?C.b:C.teal+"33"}`,borderRadius:50,color:disabled?C.mut:ghost?C.sub:C.teal,fontSize:14,fontWeight:700,cursor:disabled?"not-allowed":"pointer",letterSpacing:.2,width:flex?"100%":undefined}}>
    {children}
  </button>
));

const SevTag = memo(({sev,label}) => (
  <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:SEV[sev]?.bg,color:SEV[sev]?.tx,border:`1px solid ${SEV[sev]?.bd}`,fontWeight:700,flexShrink:0}}>
    {label||sev}
  </span>
));

const SecHdr = memo(({title,pad="14px 18px 7px"}) => (
  <div style={{padding:pad,fontSize:10.5,fontWeight:700,color:C.mutL,letterSpacing:1,textTransform:"uppercase"}}>
    {title}
  </div>
));

const Divider = () => <div style={{height:1,background:C.b,margin:"0 18px"}}/>;

/* ─────────────────────────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────────────────────────── */
async function toB64(file) {
  return new Promise((res,rej)=>{
    const rd=new FileReader();
    rd.onload=()=>res(rd.result.split(",")[1]);
    rd.onerror=rej;
    rd.readAsDataURL(file);
  });
}

async function callClaude(messages, lang, maxTokens=900) {
  const r = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514", max_tokens:maxTokens, system:SYS(lang), messages}),
  });
  const d = await r.json();
  return d.content?.map(b=>b.text||"").join("")||"…";
}

/* ─────────────────────────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────────────────────────── */
export default function ChaiQ() {
  const [lang, setLang]       = useState("en");
  const [tab,  setTab]        = useState("scan");
  // chat
  const [msgs, setMsgs]       = useState([]);
  const [inp,  setInp]        = useState("");
  const [busy, setBusy]       = useState(false);
  // scan
  const [scanRes, setScanRes] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [imgUrl, setImgUrl]   = useState(null);
  const [imgB64, setImgB64]   = useState(null);
  const [imgMime,setImgMime]  = useState("image/jpeg");
  // ui state
  const [saveMode, setSaveMode] = useState("Favorites");
  const [hist, setHist]       = useState([]);
  const [wxDay, setWxDay]     = useState(0);
  const [waStep,setWaStep]    = useState(0);
  const fileRef = useRef(null);
  const chatEnd = useRef(null);
  const Tx = TR[lang];
  const waMsgs = WA_DEMO[lang]||WA_DEMO.en;

  // reset on language change
  useEffect(()=>{
    setMsgs([{r:"a",c:Tx.greet}]);
    setScanRes(null); setImgUrl(null); setImgB64(null); setWaStep(0);
  },[lang]); // eslint-disable-line

  useEffect(()=>{ chatEnd.current?.scrollIntoView({behavior:"smooth"}); },[msgs,busy]);

  /* ── send chat message ── */
  const sendChat = useCallback(async(text)=>{
    if(!text?.trim()) return;
    const next=[...msgs,{r:"u",c:text}];
    setMsgs(next); setInp(""); setBusy(true);
    try {
      const reply = await callClaude(next.map(m=>({role:m.r==="u"?"user":"assistant",content:m.c})), lang);
      setMsgs([...next,{r:"a",c:reply}]);
    } catch { setMsgs([...next,{r:"a",c:Tx.connErr}]); }
    setBusy(false);
  },[msgs,lang,Tx.connErr]);

  /* ── scan a leaf ── */
  const runScan = useCallback(async(b64,mime,demo)=>{
    setIsScanning(true); setScanRes(null);
    try {
      let msgs_api;
      if(demo||!b64){
        await new Promise(r=>setTimeout(r,1600));
        msgs_api=[{role:"user",content:"Demo: simulate analyzing a tea leaf photo showing moderate Blister Blight. Give disease name, confidence %, severity, 4 treatment steps, 2 prevention tips. Be specific."}];
      } else {
        msgs_api=[{role:"user",content:[
          {type:"image",source:{type:"base64",media_type:mime,data:b64}},
          {type:"text",text:"This photo is from an East African tea farmer. Analyze it carefully. If you see a tea leaf or plant: identify any disease, pest, or deficiency. Give disease name, confidence %, severity, exactly what you observe, numbered treatment steps, and 2 prevention tips. If it's not a tea plant, politely say so and ask them to upload a tea leaf photo."},
        ]}];
      }
      const result = await callClaude(msgs_api, lang, 700);
      setScanRes(result);
      setHist(h=>[{id:Date.now(),r:result,t:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})},...h.slice(0,9)]);
    } catch { setScanRes(Tx.connErr); }
    setIsScanning(false);
  },[lang,Tx.connErr]);

  const onFile = useCallback(async(e)=>{
    const f=e.target.files[0]; if(!f) return; e.target.value="";
    setImgUrl(URL.createObjectURL(f));
    const b64=await toB64(f);
    setImgB64(b64); setImgMime(f.type||"image/jpeg");
    runScan(b64,f.type||"image/jpeg",false);
  },[runScan]);

  const goChat = useCallback((q)=>{ setTab("chat"); setTimeout(()=>sendChat(q),80); },[sendChat]);

  /* ── tab definitions ── */
  const TABS = [
    {id:"scan",   label:Tx.tabs[0], Icon:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.8" fill="currentColor"/>{[0,36,72,108,144,180,216,252,288,324].map((a,i)=>{const x=12+9.6*Math.cos(a*Math.PI/180),y=12+9.6*Math.sin(a*Math.PI/180);return<circle key={i} cx={x} cy={y} r="1.25" fill="currentColor" opacity=".5"/>;})}</svg>},
    {id:"chat",   label:Tx.tabs[1], Icon:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>},
    {id:"market", label:Tx.tabs[2], Icon:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="16 7 22 7 22 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>},
    {id:"weather",label:Tx.tabs[3], Icon:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="3.8" stroke="currentColor" strokeWidth="1.8"/><path d="M6 20a4 4 0 014-4h4a4 4 0 014 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 2v1.5M4.5 4.5l1 1M2 12h1.5M19.5 4.5l-1 1M22 12h-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".45"/></svg>},
    {id:"more",   label:Tx.tabs[4], Icon:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5"  r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="19" r="1.6" fill="currentColor"/></svg>},
  ];

  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto",color:C.tx}}>

      {/* ══════════════════════════════ SCAN ══════════════════════════════ */}
      {tab==="scan" && !scanRes && !isScanning && (
        <div style={{flex:1,display:"flex",flexDirection:"column",padding:"36px 20px 14px",minHeight:"calc(100vh - 68px)"}}>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:6}}>
            <button onClick={()=>setTab("more")} style={{background:"none",border:"none",cursor:"pointer",color:C.sub,fontSize:19,lineHeight:1,padding:4}}>ℹ</button>
          </div>

          {/* hero */}
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,paddingBottom:20}}>
            <div style={{position:"relative",cursor:"pointer"}} onClick={()=>fileRef.current?.click()}>
              <Logo sz={118}/>
              <div style={{position:"absolute",inset:"-20px",borderRadius:"50%",background:C.tGlow,filter:"blur(28px)",zIndex:-1}}/>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:30,fontWeight:800,color:C.tx,letterSpacing:"-.6px",lineHeight:1.1}}>ChaiQ</div>
              <div style={{fontSize:13,color:C.teal,fontWeight:600,marginTop:4,letterSpacing:.6}}>AI Tea Scanner</div>
            </div>
            <div style={{fontSize:13,color:C.sub,textAlign:"center",maxWidth:220,lineHeight:1.65}}>{Tx.scanSub}</div>
          </div>

          {/* upload zone */}
          <div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${C.teal}2A`,borderRadius:14,padding:"15px 18px",background:C.tGlow,display:"flex",alignItems:"center",gap:14,cursor:"pointer",marginBottom:10}}>
            <div style={{fontSize:30}}>📷</div>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:C.tx}}>{Tx.upTap}</div>
              <div style={{fontSize:12,color:C.sub,marginTop:2}}>{Tx.upSub}</div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{display:"none"}}/>

          <div style={{display:"flex",alignItems:"center",gap:10,margin:"4px 0"}}>
            <div style={{flex:1,height:1,background:C.b}}/><span style={{fontSize:11,color:C.mut}}>or</span><div style={{flex:1,height:1,background:C.b}}/>
          </div>
          <TealBtn onClick={()=>runScan(null,null,true)} flex>{Tx.demo}</TealBtn>

          {/* quick save */}
          <div style={{marginTop:14}}>
            <div style={{fontSize:11.5,color:C.sub,textAlign:"center",marginBottom:8,fontWeight:600}}>{Tx.qs}</div>
            <SegCtrl opts={Tx.seg} val={saveMode} set={setSaveMode}/>
          </div>

          {/* recent scans */}
          {hist.length>0 && (
            <div style={{background:C.card,borderRadius:12,padding:"11px 13px",border:`1px solid ${C.b}`,marginTop:12}}>
              <div style={{fontSize:10,color:C.mut,textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>{Tx.histT}</div>
              {hist.slice(0,3).map((h,i)=>(
                <div key={h.id} onClick={()=>setScanRes(h.r)} style={{display:"flex",gap:8,marginBottom:i<2?7:0,cursor:"pointer",alignItems:"center"}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:C.teal,flexShrink:0}}/>
                  <div style={{fontSize:12.5,color:C.sub,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.r.slice(0,55)}…</div>
                  <div style={{fontSize:10,color:C.mut}}>{h.t}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* scanning spinner */}
      {tab==="scan" && isScanning && (
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24,padding:"0 28px",minHeight:"calc(100vh - 68px)"}}>
          <div style={{position:"relative"}}>
            <Logo sz={118}/>
            <div style={{position:"absolute",inset:"-22px",borderRadius:"50%",background:C.tGlow,filter:"blur(32px)",zIndex:-1,animation:"glow 1.3s ease-in-out infinite alternate"}}/>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:700,color:C.tx,marginBottom:5}}>{imgB64?Tx.vScan:Tx.scanning}</div>
            <div style={{fontSize:12.5,color:C.sub}}>{lang==="en"?"Checking 40+ tea diseases…":lang==="sw"?"Inakagua magonjwa 40+…":"Ekekebwa endwadde 40+…"}</div>
          </div>
          <div style={{width:"100%",height:3,borderRadius:3,background:C.card,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:3,background:C.teal,animation:"bar 2s ease forwards"}}/>
          </div>
          {imgUrl && <img src={imgUrl} alt="" style={{width:96,height:96,borderRadius:12,objectFit:"cover",border:`2px solid ${C.teal}2A`}}/>}
        </div>
      )}

      {/* scan result */}
      {tab==="scan" && scanRes && !isScanning && (
        <div style={{flex:1,display:"flex",flexDirection:"column",padding:"28px 18px 14px",minHeight:"calc(100vh - 68px)"}}>
          {/* header row */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <Logo sz={34}/>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,color:C.tx}}>{Tx.diagDone}</div>
              <div style={{fontSize:11,color:C.teal,marginTop:1}}>ChaiQ AI Vision · {new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
            </div>
            {imgUrl && (
              <div style={{position:"relative"}}>
                <img src={imgUrl} alt="" style={{width:48,height:48,borderRadius:10,objectFit:"cover",border:`2px solid ${C.teal}2A`}}/>
                <div style={{position:"absolute",bottom:-3,right:-3,width:14,height:14,borderRadius:"50%",background:C.grn,border:`2px solid ${C.bg}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8}}>✓</div>
              </div>
            )}
          </div>

          {/* result card */}
          <div style={{flex:1,background:C.card,borderRadius:14,padding:"16px",border:`1px solid ${C.b}`,overflow:"auto",marginBottom:14}}>
            <div style={{fontSize:13.5,color:C.sub,lineHeight:1.78,whiteSpace:"pre-wrap"}}>{scanRes}</div>
          </div>

          {/* action row */}
          <div style={{display:"flex",gap:9}}>
            <button onClick={()=>{setScanRes(null);setImgUrl(null);setImgB64(null);}} style={{flex:1,padding:"13px",background:C.card,border:`1px solid ${C.b}`,borderRadius:50,color:C.sub,cursor:"pointer",fontSize:13.5,fontWeight:600}}>
              {Tx.newScan}
            </button>
            <button onClick={()=>goChat(Tx.scanPfx+scanRes.slice(0,220)+"…")} style={{flex:2,padding:"13px",background:C.tMid,border:`1px solid ${C.teal}33`,borderRadius:50,color:C.teal,cursor:"pointer",fontSize:13.5,fontWeight:700}}>
              {Tx.askMore}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════ CHAT ══════════════════════════════ */}
      {tab==="chat" && (
        <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"calc(100vh - 68px)"}}>
          {/* header */}
          <div style={{padding:"13px 18px 11px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.b}`,background:C.sur}}>
            <Logo sz={34}/>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,color:C.tx}}>ChaiQ</div>
              <div style={{fontSize:11,color:C.teal}}>● {Tx.online}</div>
            </div>
            {/* language selector */}
            <div style={{display:"flex",gap:5}}>
              {[["en","🇬🇧"],["sw","🇹🇿"],["lg","🇺🇬"]].map(([code,flag])=>(
                <button key={code} onClick={()=>setLang(code)} style={{width:30,height:30,borderRadius:"50%",background:lang===code?C.tMid:"transparent",border:`1px solid ${lang===code?C.teal+"44":C.b}`,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {flag}
                </button>
              ))}
            </div>
            <button onClick={()=>fileRef.current?.click()} style={{background:C.tMid,border:`1px solid ${C.teal}33`,borderRadius:20,padding:"5px 11px",fontSize:12,color:C.teal,cursor:"pointer",fontWeight:600}}>
              📷
            </button>
          </div>

          {/* messages */}
          <div style={{flex:1,overflow:"auto",padding:"12px 14px 6px"}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.r==="u"?"flex-end":"flex-start",marginBottom:4}}>
                {m.r==="a" && <div style={{width:24,height:24,borderRadius:"50%",background:C.tMid,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,marginRight:6,flexShrink:0,marginTop:2}}>🍃</div>}
                <div style={{maxWidth:"78%",background:m.r==="u"?C.tMid:C.card,border:`1px solid ${m.r==="u"?C.teal+"28":C.b}`,borderRadius:m.r==="u"?"14px 3px 14px 14px":"3px 14px 14px 14px",padding:"9px 13px"}}>
                  <div style={{fontSize:13.5,color:C.tx,whiteSpace:"pre-wrap",lineHeight:1.62}}>{m.c}</div>
                  <div style={{fontSize:9.5,color:C.mut,textAlign:"right",marginTop:3}}>
                    {new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                  </div>
                </div>
              </div>
            ))}
            {busy && (
              <div style={{display:"flex",marginBottom:4}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:C.tMid,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,marginRight:6,flexShrink:0}}>🍃</div>
                <div style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:"3px 14px 14px 14px",padding:"10px 14px",display:"flex",gap:5,alignItems:"center"}}>
                  {[0,1,2].map(d=><div key={d} style={{width:7,height:7,borderRadius:"50%",background:C.teal,animation:"pulse 1.2s ease infinite",animationDelay:`${d*.2}s`}}/>)}
                </div>
              </div>
            )}
            <div ref={chatEnd}/>
          </div>

          {/* chips */}
          <div style={{padding:"4px 12px 4px",display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none"}}>
            {Tx.chips.map(q=>(
              <button key={q} onClick={()=>sendChat(q)} style={{flexShrink:0,background:C.card,border:`1px solid ${C.b}`,borderRadius:20,padding:"5px 11px",fontSize:11,color:C.sub,cursor:"pointer",whiteSpace:"nowrap"}}>
                {q}
              </button>
            ))}
          </div>

          {/* input */}
          <div style={{padding:"6px 12px 10px",display:"flex",gap:8,alignItems:"center"}}>
            <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendChat(inp)} placeholder={Tx.ph} style={{flex:1,background:C.card,border:`1px solid ${C.b}`,borderRadius:24,padding:"10px 15px",color:C.tx,fontSize:13.5,outline:"none",fontFamily:"inherit"}}/>
            <button onClick={()=>sendChat(inp)} disabled={busy||!inp.trim()} style={{width:40,height:40,borderRadius:"50%",flexShrink:0,background:busy||!inp.trim()?C.card:C.tMid,border:`1px solid ${C.teal}33`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:busy||!inp.trim()?C.mut:C.teal,fontSize:16}}>▶</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════ MARKET ══════════════════════════════ */}
      {tab==="market" && (
        <div style={{flex:1,overflow:"auto",minHeight:"calc(100vh - 68px)"}}>
          <div style={{padding:"22px 18px 12px",background:C.sur,borderBottom:`1px solid ${C.b}`}}>
            <div style={{fontSize:22,fontWeight:800,color:C.tx}}>{Tx.mktT}</div>
            <div style={{fontSize:13,color:C.sub,marginTop:2}}>{Tx.mktS}</div>
          </div>

          {/* highlight */}
          <div style={{margin:"13px 15px 0",background:C.grnD,border:`1px solid ${C.grn}33`,borderRadius:13,padding:"12px 15px"}}>
            <div style={{fontSize:10.5,color:C.grn,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,marginBottom:5}}>📈 {lang==="en"?"This Week":lang==="sw"?"Wiki Hii":"Wiiki Eno"}</div>
            <div style={{fontSize:13.5,color:C.tx,lineHeight:1.6}}>
              {lang==="en"?"BOPF up 8% in Kericho — strong Pakistan demand. Uganda BOP also rising. Good week to renegotiate factory contracts.":
               lang==="sw"?"Bei ya BOPF imeongezeka 8% Kericho — mahitaji makubwa kutoka Pakistan. BOP Uganda pia inaongezeka. Wiki nzuri ya kujadiliana mikataba ya kiwanda.":
               "Bbeeyi ya BOPF eweddewo 8% Kericho — okwetaagibwa okusingayo okuva Pakistan. BOP Uganda nayo ewedda. Wiiki ennungi okubuulagana emiteeka y'ettaka."}
            </div>
          </div>

          <SecHdr title={lang==="en"?"Kenya":"Kenya"}/>
          {MARKETS.filter(m=>m.r.includes("KE")).map((m,i)=><MktRow key={i} m={m} Tx={Tx}/>)}
          <SecHdr title={lang==="en"?"Uganda":"Uganda"}/>
          {MARKETS.filter(m=>m.r.includes("UG")).map((m,i)=><MktRow key={i} m={m} Tx={Tx}/>)}

          <SecHdr title={lang==="en"?"Tea Grades":lang==="sw"?"Madaraja ya Chai":"Emiwendo y'Chai"}/>
          <div style={{padding:"0 15px"}}>
            {[
              {g:"BOPF",d:lang==="en"?"Best quality — highest factory price":"Ubora bora — bei ya juu"},
              {g:"BOP", d:lang==="en"?"Good broken leaf — strong demand":"Jani lililomegwa la ubora mzuri"},
              {g:"PF1", d:lang==="en"?"Pekoe fannings — medium grade":"Pekoe fannings — daraja la kati"},
              {g:"Dust",d:lang==="en"?"Finest particles — lower price, massive volume":"Chembe ndogo — bei ndogo, mahitaji makubwa"},
            ].map((r,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 13px",background:C.card,borderRadius:11,marginBottom:7,border:`1px solid ${C.b}`}}>
                <div style={{width:36,height:36,borderRadius:9,background:C.card2,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:C.teal,flexShrink:0}}>{r.g}</div>
                <div style={{fontSize:13,color:C.sub,lineHeight:1.45}}>{r.d}</div>
              </div>
            ))}
          </div>
          <div style={{padding:"6px 15px 18px"}}>
            <TealBtn onClick={()=>goChat(Tx.gradeQ)} flex>{lang==="en"?"Ask ChaiQ: How to improve my grade?":lang==="sw"?"Uliza ChaiQ: Jinsi ya kuboresha daraja?":"Buuza ChaiQ: Engeri y'okwongera omuwendo?"}</TealBtn>
          </div>
        </div>
      )}

      {/* ══════════════════════════════ WEATHER ══════════════════════════════ */}
      {tab==="weather" && (
        <div style={{flex:1,overflow:"auto",minHeight:"calc(100vh - 68px)"}}>
          <div style={{padding:"22px 18px 12px",background:C.sur,borderBottom:`1px solid ${C.b}`}}>
            <div style={{fontSize:22,fontWeight:800,color:C.tx}}>{Tx.wxT}</div>
            <div style={{fontSize:13,color:C.sub,marginTop:2}}>{Tx.wxS}</div>
          </div>

          {/* now hero */}
          <div style={{margin:"13px 15px 0",background:C.card,border:`1px solid ${C.b}`,borderRadius:16,padding:"18px"}}>
            <div style={{fontSize:10.5,color:C.mutL,textTransform:"uppercase",letterSpacing:.7,marginBottom:8}}>{lang==="en"?"Now · Kericho / Mbarara":lang==="sw"?"Sasa · Kericho / Mbarara":"Kati · Kericho / Mbarara"}</div>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontSize:48}}>⛅</div>
              <div>
                <div style={{fontSize:34,fontWeight:900,color:C.tx,lineHeight:1}}>22°C</div>
                <div style={{fontSize:12.5,color:C.sub,marginTop:3}}>{lang==="en"?"Partly cloudy · Humidity 78% · 12km/h":lang==="sw"?"Mawingu kidogo · Unyevu 78%":"Ebire · Unyevu 78%"}</div>
              </div>
            </div>
            <div style={{marginTop:12,padding:"9px 12px",background:C.yelD,border:`1px solid ${C.yel}33`,borderRadius:9,fontSize:13,color:C.yel}}>
              ⚠️ {lang==="en"?"Heavy rain Tuesday — avoid spraying Monday, plan plucking for Wednesday":lang==="sw"?"Mvua kubwa Jumanne — epuka kunyunyizia Jumatatu, panga kuvuna Jumatano":"Enkuba nnyingi Lwakubiri — kereba okusiga Lwatandatu, teeka okuuma Lwasatu"}
            </div>
          </div>

          {/* 7-day strip */}
          <SecHdr title={lang==="en"?"7-Day Forecast":lang==="sw"?"Siku 7":"Ennaku 7"}/>
          <div style={{padding:"0 15px 2px"}}>
            <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none"}}>
              {WX_DAYS.map((w,i)=>(
                <div key={i} onClick={()=>setWxDay(i)} style={{flexShrink:0,background:wxDay===i?C.tBright:C.card,border:`1px solid ${wxDay===i?C.teal+"55":C.b}`,borderRadius:13,padding:"10px 9px",textAlign:"center",minWidth:70,cursor:"pointer",transition:"all .15s"}}>
                  <div style={{fontSize:10,color:wxDay===i?C.teal:C.sub,marginBottom:4,fontWeight:wxDay===i?700:400}}>{w.d}</div>
                  <div style={{fontSize:20,marginBottom:3}}>{w.ico}</div>
                  <div style={{fontSize:12.5,fontWeight:600,color:C.tx}}>{w.hi}</div>
                  <div style={{fontSize:9.5,color:C.mut}}>{w.lo}</div>
                  <div style={{fontSize:9.5,color:C.blu,marginTop:2}}>💧{w.rain}</div>
                </div>
              ))}
            </div>
          </div>

          {/* selected day detail */}
          <div style={{padding:"10px 15px 0"}}>
            <div style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:13,padding:"14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
                <span style={{fontSize:26}}>{WX_DAYS[wxDay].ico}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:C.tx}}>{WX_DAYS[wxDay].d} · {WX_DAYS[wxDay].hi} / {WX_DAYS[wxDay].lo}</div>
                  <div style={{fontSize:12,color:C.blu}}>💧 {lang==="en"?"Rain chance":lang==="sw"?"Uwezekano wa mvua":"Obukiika bw'enkuba"}: {WX_DAYS[wxDay].rain}</div>
                </div>
              </div>
              <div style={{padding:"9px 12px",background:C.grnD,border:`1px solid ${C.grn}33`,borderRadius:9,fontSize:13,color:C.grn}}>
                🌿 {lang==="en"?"Farm advice":lang==="sw"?"Ushauri wa kilimo":"Amagezi g'okulima"}: <span style={{color:C.tx}}>{WX_DAYS[wxDay].farm}</span>
              </div>
            </div>
          </div>

          {/* calendar tasks */}
          <SecHdr title={lang==="en"?"Farming Calendar":lang==="sw"?"Kalenda ya Kilimo":"Nambula y'Okulima"}/>
          {[
            {ico:"✂️",t:lang==="en"?"Plucking rounds":lang==="sw"?"Wakati wa kuvuna":"Ebiseera by'okuuma",     v:lang==="en"?"Wed & Fri (dry days)":lang==="sw"?"Jumatano na Ijumaa":"Lwasatu ne Lwakukaaga"},
            {ico:"🧪",t:lang==="en"?"Spray window":lang==="sw"?"Wakati wa kunyunyizia":"Ekiseera ky'okusiga",  v:lang==="en"?"Thu–Fri only":lang==="sw"?"Alhamisi–Ijumaa tu":"Lwakuna–Lwakukaaga"},
            {ico:"💊",t:lang==="en"?"Fertilizer day":lang==="sw"?"Siku ya mbolea":"Lunaku lw'mbolebole",       v:lang==="en"?"Friday recommended":lang==="sw"?"Ijumaa inapendekezwa":"Lwakukaaga"},
            {ico:"🌿",t:lang==="en"?"Pruning window":lang==="sw"?"Wakati wa kupogoa":"Ekiseera ky'okulonda",   v:lang==="en"?"Dry season in 3 weeks":lang==="sw"?"Kiangazi wiki 3":"Biseera by'enjuyi wiiki 3"},
          ].map((r,i,a)=>(
            <div key={i}>
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 18px"}}>
                <div style={{width:36,height:36,borderRadius:9,background:C.card,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{r.ico}</div>
                <div><div style={{fontSize:13.5,fontWeight:600,color:C.tx}}>{r.t}</div><div style={{fontSize:12.5,color:C.sub,marginTop:1}}>{r.v}</div></div>
              </div>
              {i<a.length-1&&<Divider/>}
            </div>
          ))}
          <div style={{padding:"10px 15px 18px"}}>
            <TealBtn onClick={()=>goChat(Tx.wxQ)} flex>{lang==="en"?"Ask ChaiQ: This week's farm plan":lang==="sw"?"Uliza ChaiQ: Mpango wa kilimo wiki hii":"Buuza ChaiQ: Entegeka y'okulima wiiki eno"}</TealBtn>
          </div>
        </div>
      )}

      {/* ══════════════════════════════ MORE ══════════════════════════════ */}
      {tab==="more" && (
        <div style={{flex:1,overflow:"auto",minHeight:"calc(100vh - 68px)"}}>
          <div style={{padding:"22px 18px 12px",background:C.sur,borderBottom:`1px solid ${C.b}`}}>
            <div style={{fontSize:22,fontWeight:800,color:C.tx}}>{Tx.moreT}</div>
          </div>

          {/* disease reference */}
          <SecHdr title={Tx.disT}/>
          <div style={{padding:"0 15px"}}>
            {DISEASES.map((d,i)=>(
              <div key={i} onClick={()=>goChat(`Tell me about ${d.name} in tea: how to identify it, the cause, and exactly how to treat and prevent it.`)} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"11px 13px",background:C.card,borderRadius:12,marginBottom:7,border:`1px solid ${C.b}`,cursor:"pointer"}}>
                <div style={{fontSize:22,flexShrink:0,marginTop:1}}>{d.ico}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                    <span style={{fontSize:14,fontWeight:600,color:C.tx}}>{d.name}</span>
                    <SevTag sev={d.sev} label={Tx.sev[d.sev]}/>
                  </div>
                  <div style={{fontSize:12.5,color:C.sub,marginBottom:2,lineHeight:1.4}}>{d.desc}</div>
                  <div style={{fontSize:11.5,color:C.mut,lineHeight:1.4}}>{d.rx}</div>
                </div>
                <span style={{color:C.mut,fontSize:15,marginTop:2}}>›</span>
              </div>
            ))}
          </div>

          {/* farming guides */}
          <SecHdr title={Tx.guideT}/>
          <div style={{padding:"0 15px"}}>
            {GUIDES.map((g,i)=>(
              <div key={i} onClick={()=>goChat(g.q)} style={{display:"flex",gap:12,alignItems:"center",padding:"11px 13px",background:C.card,borderRadius:12,marginBottom:7,border:`1px solid ${C.b}`,cursor:"pointer"}}>
                <div style={{width:40,height:40,borderRadius:11,background:C.tMid,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{g.ico}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13.5,fontWeight:600,color:C.tx}}>{g.t}</div>
                  <div style={{fontSize:11.5,color:C.mut,marginTop:1}}>{lang==="en"?"Tap to ask ChaiQ →":lang==="sw"?"Gusa kuuliza →":"Nyiga okubuuza →"}</div>
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp */}
          <SecHdr title={Tx.waT}/>
          <div style={{padding:"0 15px"}}>
            <div style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:14,padding:"16px",marginBottom:10}}>
              <div style={{fontSize:10.5,color:C.teal,textTransform:"uppercase",letterSpacing:.8,fontWeight:700,marginBottom:11}}>{lang==="en"?"How It Works":lang==="sw"?"Jinsi Inavyofanya Kazi":"Engeri Ey'okukola"}</div>
              {Tx.waSteps.map((s,i)=>(
                <div key={i} style={{display:"flex",gap:10,marginBottom:9,alignItems:"flex-start"}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:C.tMid,border:`1px solid ${C.teal}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.teal,flexShrink:0}}>{i+1}</div>
                  <div style={{fontSize:13.5,color:C.tx,lineHeight:1.5}}>{s}</div>
                </div>
              ))}
              {/* WA demo */}
              <div style={{background:"#090F15",borderRadius:11,overflow:"hidden",marginTop:4}}>
                <div style={{background:"#172030",padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:C.tMid,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🍃</div>
                  <div style={{flex:1}}><div style={{fontSize:12.5,fontWeight:600,color:C.tx}}>ChaiQ</div><div style={{fontSize:10,color:C.teal}}>{Tx.online}</div></div>
                  <div style={{fontSize:14,color:"#536471"}}>📞</div>
                </div>
                <div style={{padding:"9px 9px",minHeight:80}}>
                  {waMsgs.slice(0,waStep+1).map((msg,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:msg.f?"flex-end":"flex-start",marginBottom:5}}>
                      <div style={{maxWidth:"82%",background:msg.f?"#004D3D":"#172030",borderRadius:msg.f?"8px 2px 8px 8px":"2px 8px 8px 8px",padding:"6px 10px"}}>
                        <div style={{fontSize:12,color:C.tx,whiteSpace:"pre-wrap",lineHeight:1.5}}>{msg.m}</div>
                        <div style={{fontSize:9,color:"#536471",textAlign:"right",marginTop:2}}>{msg.t}{msg.f?" ✓✓":""}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{padding:"5px 9px 9px",display:"flex",gap:6,borderTop:"1px solid rgba(255,255,255,.04)"}}>
                  <button onClick={()=>setWaStep(0)} style={{flex:1,padding:"7px",background:"#172030",border:"none",borderRadius:7,color:"#536471",cursor:"pointer",fontSize:11}}>↺</button>
                  <button onClick={()=>setWaStep(s=>Math.min(s+1,waMsgs.length-1))} disabled={waStep>=waMsgs.length-1} style={{flex:3,padding:"7px",background:waStep>=waMsgs.length-1?"#172030":"#00A884",border:"none",borderRadius:7,color:waStep>=waMsgs.length-1?"#536471":"#fff",cursor:"pointer",fontSize:12,fontWeight:600}}>
                    {waStep>=waMsgs.length-1?(lang==="en"?"✓ Full conversation":lang==="sw"?"✓ Mazungumzo yote":"✓ Okwogerako kwona"):(lang==="en"?"Next →":lang==="sw"?"Inayofuata →":"Obuddako →")}
                  </button>
                </div>
              </div>
            </div>
            <div style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:13,padding:"14px",marginBottom:10,textAlign:"center"}}>
              <div style={{fontSize:12,color:C.sub,marginBottom:10}}>{Tx.waCta}</div>
              <div style={{background:C.sur,border:`1px solid ${C.b}`,borderRadius:10,padding:"10px 14px",fontSize:17,fontWeight:800,color:"#25D366",letterSpacing:.5}}>+256 700 CHAIQ</div>
            </div>
          </div>

          {/* settings */}
          <SecHdr title={Tx.settT}/>
          <div style={{padding:"0 15px"}}>
            <div style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:14,overflow:"hidden",marginBottom:10}}>
              {/* language */}
              <div style={{padding:"13px 15px 14px",borderBottom:`1px solid ${C.b}`}}>
                <div style={{fontSize:10.5,color:C.mutL,textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>{lang==="en"?"Language":lang==="sw"?"Lugha":"Olulimi"}</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {[["en","🇬🇧","English"],["sw","🇹🇿","Kiswahili"],["lg","🇺🇬","Luganda"]].map(([code,flag,name])=>(
                    <button key={code} onClick={()=>setLang(code)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",background:lang===code?C.tMid:"transparent",border:`1px solid ${lang===code?C.teal+"44":C.b}`,borderRadius:10,cursor:"pointer",width:"100%",textAlign:"left"}}>
                      <span style={{fontSize:20}}>{flag}</span>
                      <span style={{fontSize:14,fontWeight:600,color:lang===code?C.teal:C.tx,flex:1}}>{name}</span>
                      {lang===code&&<span style={{color:C.teal}}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
              {/* quick save */}
              <div style={{padding:"13px 15px 14px",borderBottom:`1px solid ${C.b}`}}>
                <div style={{fontSize:10.5,color:C.mutL,textTransform:"uppercase",letterSpacing:.8,marginBottom:9}}>{Tx.qs}</div>
                <SegCtrl opts={Tx.seg} val={saveMode} set={setSaveMode}/>
              </div>
              {/* status rows */}
              {[
                [lang==="en"?"AI Status":lang==="sw"?"Hali ya AI":"Obutonde bwa AI", Tx.status, C.grn],
                [lang==="en"?"Region":lang==="sw"?"Eneo":"Akaalo", Tx.region, C.sub],
                [lang==="en"?"Scans done":lang==="sw"?"Skana zilizofanywa":"Okukeba okomala", String(hist.length), C.teal],
              ].map(([k,v,col],i,arr)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 15px",borderBottom:i<arr.length-1?`1px solid ${C.b}`:"none"}}>
                  <span style={{fontSize:13.5,color:C.sub}}>{k}</span>
                  <span style={{fontSize:13.5,fontWeight:600,color:col}}>{v}</span>
                </div>
              ))}
            </div>

            {/* scan history */}
            {hist.length>0 && (
              <div style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:14,padding:"12px 14px",marginBottom:10}}>
                <div style={{fontSize:10.5,color:C.mutL,textTransform:"uppercase",letterSpacing:.8,marginBottom:9}}>{Tx.histT}</div>
                {hist.map((h,i)=>(
                  <div key={h.id} onClick={()=>{setScanRes(h.r);setTab("scan");}} style={{display:"flex",gap:9,marginBottom:i<hist.length-1?9:0,cursor:"pointer",alignItems:"center"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:C.teal,flexShrink:0}}/>
                    <div style={{fontSize:12.5,color:C.sub,flex:1,lineHeight:1.4}}>{h.r.slice(0,65)}…</div>
                    <div style={{fontSize:10,color:C.mut}}>{h.t}</div>
                  </div>
                ))}
              </div>
            )}

            {/* about */}
            <div style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:14,padding:"14px 15px",marginBottom:22}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:11}}>
                <Logo sz={42}/>
                <div>
                  <div style={{fontSize:17,fontWeight:800,color:C.tx}}>ChaiQ</div>
                  <div style={{fontSize:11,color:C.sub}}>{Tx.ver}</div>
                </div>
              </div>
              <div style={{fontSize:13,color:C.sub,lineHeight:1.72}}>
                {lang==="en"?"AI-powered tea disease detection and farming assistant for East African smallholder farmers. Built for Uganda & Kenya. Powered by Claude AI.":
                 lang==="sw"?"Msaidizi wa AI wa kugundua magonjwa ya chai na kilimo kwa wakulima wadogo wa Afrika Mashariki. Imejengwa kwa Uganda na Kenya.":
                 "Omuyambi wa AI okuzuula endwadde z'chai n'okulima eri abalimi abato ba Afrika y'Amazima. Ezimbiddwa eri Uganda ne Kenya."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════ NAV ══════════════════════════════ */}
      <div style={{background:C.sur,borderTop:`1px solid ${C.b}`,display:"flex",position:"sticky",bottom:0,zIndex:100,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
        {TABS.map(({id,label,Icon})=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"9px 0 6px",position:"relative",color:tab===id?C.teal:C.mut,transition:"color .15s"}}>
            {tab===id && <div style={{position:"absolute",top:0,left:"24%",right:"24%",height:2,background:C.teal,borderRadius:"0 0 3px 3px"}}/>}
            {id==="scan" && tab!==id && hist.length>0 && <div style={{position:"absolute",top:8,right:"calc(50% - 13px)",width:6,height:6,borderRadius:"50%",background:C.teal}}/>}
            <Icon/>
            <span style={{fontSize:9.5,fontWeight:tab===id?700:400}}>{label}</span>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes pulse{0%,80%,100%{transform:scale(.55);opacity:.3}40%{transform:scale(1);opacity:1}}
        @keyframes glow{from{opacity:.28}to{opacity:.82}}
        @keyframes bar{from{width:0}to{width:100%}}
        *{box-sizing:border-box}::-webkit-scrollbar{display:none}
        input::placeholder{color:${C.mut}}
        button:active{opacity:.72}
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MARKET ROW (extracted to avoid re-render)
───────────────────────────────────────────────────────────────── */
const MktRow = memo(({m,Tx})=>{
  const col = m.t==="up"?C.grn : m.t==="down"?C.red : C.sub;
  return (
    <div style={{display:"flex",alignItems:"center",padding:"10px 18px",borderBottom:`1px solid ${C.b}`}}>
      <div style={{flex:1}}>
        <div style={{fontSize:14,fontWeight:600,color:C.tx}}>{m.r}</div>
        <div style={{fontSize:12,color:C.sub,marginTop:1}}>{m.g} Grade</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:14.5,fontWeight:700,color:C.tx}}>{m.p}</div>
        <div style={{fontSize:11.5,fontWeight:600,color:col}}>{Tx.trend[m.t]} <span style={{opacity:.7}}>{m.w}</span></div>
      </div>
    </div>
  );
});

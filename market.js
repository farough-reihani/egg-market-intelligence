const $market = id => document.getElementById(id);
const faMarket = value => Number(value).toLocaleString("fa-IR", { maximumFractionDigits: 2 });

function showMarketEmpty(message) {
  $market("marketChart").innerHTML = '<div class="chart-empty">' + message + '</div>';
  $market("pointCount").textContent = "";
  $market("lastUpdate").textContent = "";
}

function drawMarketChart(rows) {
  const values = rows.map(row => Number(row.index_value)).filter(Number.isFinite);
  if (!values.length) {
    showMarketEmpty("هنوز داده‌ای برای نمایش نمودار ثبت نشده است.");
    return;
  }

  const width = 900, height = 320, left = 65, right = 25, top = 25, bottom = 45;
  const min = Math.min(...values), max = Math.max(...values);
  const spread = max - min || Math.max(Math.abs(max) * 0.08, 1);
  const low = min - spread * 0.12, high = max + spread * 0.12;
  const x = i => left + (rows.length === 1 ? (width-left-right)/2 : i * (width-left-right)/(rows.length-1));
  const y = value => top + (high-value) * (height-top-bottom)/(high-low);
  const points = rows.map((row,i) => x(i)+","+y(Number(row.index_value))).join(" ");
  const grid = [0,1,2,3].map(i => {
    const yy = top + i*(height-top-bottom)/3;
    const value = high - i*(high-low)/3;
    return '<line class="grid-line" x1="'+left+'" y1="'+yy+'" x2="'+(width-right)+'" y2="'+yy+'"></line><text class="axis-label" x="'+(left-10)+'" y="'+(yy+4)+'" text-anchor="end">'+faMarket(value)+'</text>';
  }).join("");
  const dots = rows.map((row,i) => '<circle class="chart-dot" cx="'+x(i)+'" cy="'+y(Number(row.index_value))+'" r="4"><title>'+new Date(row.recorded_at).toLocaleString("fa-IR")+' — '+faMarket(row.index_value)+'</title></circle>').join("");
  const firstDate = new Date(rows[0].recorded_at).toLocaleDateString("fa-IR");
  const lastDate = new Date(rows[rows.length-1].recorded_at).toLocaleDateString("fa-IR");
  $market("marketChart").innerHTML = '<svg viewBox="0 0 '+width+' '+height+'" role="img" aria-label="روند شاخص بازار">'+grid+'<polyline class="chart-line" points="'+points+'"></polyline>'+dots+'<text class="axis-label" x="'+left+'" y="'+(height-12)+'">'+firstDate+'</text><text class="axis-label" x="'+(width-right)+'" y="'+(height-12)+'" text-anchor="end">'+lastDate+'</text></svg>';
  $market("pointCount").textContent = faMarket(rows.length) + " نقطه داده";
  $market("lastUpdate").textContent = "آخرین ثبت: " + new Date(rows[rows.length-1].recorded_at).toLocaleString("fa-IR");
}

async function loadMarketData() {
  const status = $market("marketStatus");
  status.className = "market-status";
  status.textContent = "در حال دریافت اطلاعات...";
  if (!window.supabaseClient) {
    status.textContent = "اتصال پایگاه داده در دسترس نیست. صفحه را دوباره بارگذاری کنید.";
    showMarketEmpty("امکان دریافت داده‌ها وجود ندارد.");
    return;
  }

  const { data, error } = await window.supabaseClient
    .from("market_index_points")
    .select("recorded_at,index_name,index_value")
    .order("recorded_at", { ascending: true })
    .limit(365);

  if (error) {
    status.textContent = "دریافت داده‌ها ناموفق بود. دسترسی خواندن جدول را بررسی می‌کنیم.";
    showMarketEmpty("فعلاً داده‌ای قابل دریافت نیست.");
    return;
  }

  if (!data || data.length === 0) {
    status.textContent = "اتصال برقرار است؛ هنوز نقطه‌ای از شاخص در پایگاه داده ثبت نشده است.";
    showMarketEmpty("به‌محض ثبت داده‌های شاخص، نمودار در همین صفحه نمایش داده می‌شود.");
    return;
  }

  // Display one index series only; source/channel details are never queried or exposed.
  const latestIndexName = data[data.length - 1].index_name;
  const selected = data.filter(row => row.index_name === latestIndexName && Number.isFinite(Number(row.index_value)));
  selected.sort((a,b) => new Date(a.recorded_at) - new Date(b.recorded_at));
  status.textContent = "اطلاعات شاخص با موفقیت دریافت شد.";
  drawMarketChart(selected);
}

$market("refreshMarket").addEventListener("click", loadMarketData);
loadMarketData();

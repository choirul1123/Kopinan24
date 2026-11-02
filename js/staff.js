/* staff.js - role-based kitchen/cashier/barista/waiter/owner dashboard */
(() => {
  const $ = id => document.getElementById(id);
  const role = new URLSearchParams(location.search).get("role") || "cashier";
  const shiftNames = window.KOPINAN_SHIFTS;
  let activePage = "dashboard";
  let orderFilter = "all";
  const ROLE_INFO = {
    cashier:{label:"Kasir",title:"Dashboard Kasir",subtitle:"Kelola pesanan, pembayaran, dan transaksi.",nav:[["dashboard","Dashboard","⌂"],["orders","Pesanan Masuk","▤"],["reports","Laporan Penjualan","▥"],["tables","Meja & Area","▦"]]},
    barista:{label:"Barista",title:"Dashboard Barista",subtitle:"Kelola antrean dan persiapan minuman.",nav:[["dashboard","Dashboard","⌂"],["orders","Antrean Minuman","☕"]]},
    kitchen:{label:"Dapur / Kitchen",title:"Dashboard Dapur",subtitle:"Kelola pesanan makanan dan persediaan bahan dapur.",nav:[["dashboard","Dashboard Dapur","⌂"],["orders","Pesanan Dapur","▤"],["stock","Stok Bahan","▣"],["movements","Barang Masuk / Keluar","⇄"],["reports","Laporan Dapur","▥"]]},
    waiter:{label:"Pelayan / Waiter",title:"Dashboard Pelayan",subtitle:"Kelola pengantaran pesanan dan kondisi meja.",nav:[["dashboard","Dashboard","⌂"],["orders","Pesanan Diantar","▤"],["tables","Meja & Area","▦"]]},
    owner:{label:"Owner",title:"Dashboard Owner",subtitle:"Pantau penjualan, transaksi, tren menu, dan kinerja usaha.",nav:[["dashboard","Ringkasan Bisnis","⌂"],["reports","Laporan Penjualan","▥"],["transactions","Riwayat Transaksi","▤"]]}
  };
  const info=ROLE_INFO[role]||ROLE_INFO.cashier;
  function data(){return {menu:K24.getMenu(),ingredients:K24.getIngredients(),tables:K24.getTables(),orders:K24.getOrders(),movements:K24.getMovements()}}
  function setTitle(title,subtitle){$("staffPageTitle").textContent=title;$("staffPageSubtitle").textContent=subtitle}
  function initShell(){
    $("staffRoleName").textContent=info.label;
    $("roleAvatar").textContent=info.label.charAt(0).toUpperCase();
    $("welcomeHeading").textContent=`Selamat Datang, ${info.label}!`;
    $("staffNav").innerHTML=info.nav.map(([id,label,icon])=>`<button class="staff-nav-item ${id==="dashboard"?"active":""}" data-page="${id}"><span class="nav-icon">${icon}</span><span>${label}</span></button>`).join("");
    document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>navigate(b.dataset.page));
    const shiftControl=$("staffShiftControl");
    if(role==="owner"){
      // Owner monitors all operations and is not assigned to an operational shift.
      shiftControl.hidden=true;
    }else{
      $("activeShift").value=K24.getShift();
      $("activeShift").addEventListener("change",()=>{K24.setShift($("activeShift").value);K24.toast("Shift aktif diperbarui.")});
    }
    $("staffRefresh").onclick=renderCurrentPage;
    $("staffMobileToggle").onclick=()=>{$("staffSidebar").classList.toggle("open");$("staffMobileScrim").classList.toggle("show")};
    $("staffMobileScrim").onclick=()=>{$("staffSidebar").classList.remove("open");$("staffMobileScrim").classList.remove("show")};
    $("staffModalClose").onclick=closeModal;
    $("staffModalBackdrop").onclick=e=>{if(e.target===$("staffModalBackdrop"))closeModal()};
    const globalSearch = $("globalSearch");
    if(globalSearch) globalSearch.addEventListener("input",()=>{if(role==="cashier")navigate("orders")});
  }
  function navigate(page){
    activePage=page;
    document.querySelectorAll(".staff-nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
    $("staffSidebar").classList.remove("open");$("staffMobileScrim").classList.remove("show");
    renderCurrentPage();
  }
  function renderStats(){
    const d=data(),paid=d.orders.filter(o=>o.paymentStatus==="Lunas");
    const revenue=paid.reduce((s,o)=>s+o.total,0);
    let cards=[];
    if(role==="cashier")cards=[["Pesanan Menunggu",d.orders.filter(o=>o.paymentStatus!=="Lunas").length,"▤"],["Transaksi Lunas",paid.length,"✓"],["Penjualan",K24.money(revenue),"Rp"],["Meja Kosong",d.tables.filter(t=>t.status==="kosong").length,"▦"]];
    else if(role==="barista")cards=[["Antrean Minuman",d.orders.filter(o=>o.paymentStatus==="Lunas"&&!o.drinkReady&&o.items.some(i=>i.category!=="food")).length,"☕"],["Minuman Siap",d.orders.filter(o=>o.paymentStatus==="Lunas"&&o.drinkReady).length,"✓"],["Selesai Diantar",d.orders.filter(o=>o.delivered).length,"↗"],["Shift Aktif",`Shift ${K24.getShift()}`,"◷"]];
    else if(role==="kitchen")cards=[["Pesanan Makanan Baru",d.orders.filter(o=>o.paymentStatus==="Lunas"&&!o.foodReady&&o.items.some(i=>i.category==="food")).length,"♨"],["Sedang Diproses",d.orders.filter(o=>o.paymentStatus==="Lunas"&&!o.foodReady&&o.items.some(i=>i.category==="food")).length,"▤"],["Makanan Siap",d.orders.filter(o=>o.foodReady&&o.items.some(i=>i.category==="food")).length,"✓"],["Bahan Menipis",d.ingredients.filter(i=>K24.stockStatus(i)!=="safe").length,"!"]];
    else if(role==="waiter")cards=[["Meja Kosong",d.tables.filter(t=>t.status==="kosong").length,"▦"],["Meja Terisi",d.tables.filter(t=>t.status==="terisi").length,"♧"],["Menunggu Dibersihkan",d.tables.filter(t=>t.status==="cleaning").length,"✧"],["Pesanan Diantar",d.orders.filter(o=>o.delivered).length,"✓"]];
    else if(role==="owner"){
      const today=K24.todayKey();
      const todayPaid=paid.filter(o=>o.createdAt&&K24.todayKey(new Date(o.createdAt))===today);
      const todaySales=todayPaid.reduce((s,o)=>s+o.total,0);
      cards=[["Penjualan Hari Ini",K24.money(todaySales),"Rp"],["Transaksi Hari Ini",todayPaid.length,"▤"],["Total Transaksi Lunas",paid.length,"✓"],["Pajak Tercatat",K24.money(paid.reduce((s,o)=>s+o.tax,0)),"%"]];
    }
    $("staffStats").innerHTML=cards.map(([label,value,icon])=>`<article class="kpi-card"><span class="kpi-icon">${icon}</span><div><small>${label}</small><strong>${value}</strong></div></article>`).join("");
  }
  function renderCurrentPage(){
    renderStats();
    if(activePage==="dashboard")renderDashboard();
    if(activePage==="orders")renderOrdersPage();
    if(activePage==="transactions")renderTransactionsPage();
    if(activePage==="stock")renderStockPage();
    if(activePage==="movements")renderMovementsPage();
    if(activePage==="reports")renderReportsPage();
    if(activePage==="tables")renderTablesPage();
  }
  function panel(title,sub,body,extra=""){
    return `<section class="staff-panel ${extra}"><div class="panel-heading"><div><span class="eyebrow">KOPINAN 24 · ${role.toUpperCase()}</span><h2>${title}</h2>${sub?`<p>${sub}</p>`:""}</div></div>${body}</section>`;
  }
  function renderDashboard(){
    const d=data();let body="";
    if(role==="cashier"){
      const latestOrders=d.orders.slice(0,5);
      body=`<div class="staff-grid-2">${panel("Pesanan Terbaru","Pantau pesanan dan status pembayaran yang dipilih pelanggan.",orderCards(latestOrders,"cashier"))}${panel("Ringkasan Shift",`Shift ${K24.getShift()} · ${shiftNames[K24.getShift()].time}`,shiftSummary())}</div>
      ${panel("Laporan Penjualan","Filter harian, bulanan, rentang tanggal, dan shift.",reportWidget())}
      ${panel("Meja & Area","Kasir dapat melihat status meja sebelum memproses pembayaran.",tableOverview(d.tables))}`;
    } else if(role==="owner"){
      body=`${panel("Laporan Penjualan","Pantau penjualan berdasarkan periode dan perbandingan shift operasional.",reportWidget())}
      <div class="staff-grid-2">${panel("Menu Terlaris","Peringkat dihitung dari transaksi yang sudah lunas.",bestSellingItems(d.orders))}
      ${panel("Aktivitas Transaksi","Ringkasan transaksi pembayaran terbaru.",recentPaidTransactions(d.orders))}</div>
      ${panel("Fokus Pemantauan Owner","Ringkasan area pengelolaan bisnis.",`<div class="owner-focus-grid"><div><b>Penjualan</b><small>Omzet, pajak, dan metode pembayaran</small></div><div><b>Produk</b><small>Menu populer dan performa produk</small></div><div><b>Persediaan</b><small>Pantau stok bahan melalui laporan dapur</small></div><div><b>Tim</b><small>Pantau pelaksanaan operasional seluruh tim</small></div></div>`)}`;
    } else if(role==="kitchen"){
      const food=d.orders.filter(o=>o.paymentStatus==="Lunas"&&!o.foodReady&&o.items.some(i=>i.category==="food"));
      body=`<div class="staff-grid-2">${panel("Antrean Pesanan Dapur","Pesanan makanan yang telah dibayar.",orderCards(food,"kitchen"))}${panel("Stok Bahan Dapur","Bahan yang perlu dipantau.",ingredientPreview(d.ingredients,true))}</div>
      ${panel("Aktivitas Shift","Catat barang masuk dan pemakaian bahan.",movementQuickActions())}
      ${panel("Menu Makanan Hari Ini","Foto contoh menu makanan.",favoriteMenu(d.menu.filter(m=>m.category==="food").slice(0,3)))}`;
    } else if(role==="barista"){
      const drinks=d.orders.filter(o=>o.paymentStatus==="Lunas"&&!o.drinkReady&&o.items.some(i=>i.category!=="food"));
      body=`${panel("Antrean Minuman","Minuman dari pesanan yang sudah dibayar.",orderCards(drinks,"barista"))}
      ${panel("Menu Minuman","Foto menu kopi dan non-kopi.",favoriteMenu(d.menu.filter(m=>m.category!=="food").slice(0,4)))}`;
    } else if(role==="waiter"){
      body=`${panel("Monitoring Meja","Status meja per area. Selesaikan pembersihan setelah checkout pengunjung.",tableOverview(d.tables,true))}
      ${panel("Pesanan Siap Diantar","Pesanan yang seluruh itemnya telah siap.",orderCards(d.orders.filter(o=>o.paymentStatus==="Lunas"&&o.drinkReady&&o.foodReady&&!o.delivered),"waiter"))}`;
    }
    body += dashboardGuide();
    $("staffWorkspace").innerHTML=body;
    bindOrderButtons();bindTableButtons();bindReportControls();bindMovementButtons();
  }
  function bestSellingItems(orderList){
    const paid=orderList.filter(o=>o.paymentStatus==="Lunas"),totals={};
    paid.forEach(o=>(o.items||[]).forEach(i=>{totals[i.name]=(totals[i.name]||0)+Number(i.qty||0)}));
    const items=Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,5);
    return items.length?`<div class="owner-ranking">${items.map(([name,qty],i)=>`<div class="owner-rank-row"><span class="rank-number">${i+1}</span><b>${K24.esc(name)}</b><strong>${qty} item</strong></div>`).join("")}</div>`:
      `<div class="preview-explainer"><span class="preview-label">CONTOH TAMPILAN</span><b>Analisis menu terlaris</b><p>Setelah transaksi lunas tercatat, sistem akan mengurutkan menu berdasarkan jumlah item yang terjual.</p><div class="preview-menu-strip">${data().menu.filter(m=>m.category==="food").slice(0,3).map(m=>`<div><img src="${K24.esc(m.image)}" alt="${K24.esc(m.name)}"><small>${K24.esc(m.name)}</small></div>`).join("")}</div></div>`;
  }
  function recentPaidTransactions(orderList){
    const paid=orderList.filter(o=>o.paymentStatus==="Lunas").slice(0,5);
    return paid.length?`<div class="owner-recent-list">${paid.map(o=>`<div class="owner-recent-row"><div><b>${K24.esc(o.number)}</b><small>${K24.esc(o.customer)} · ${K24.esc(o.paymentMethod||"")}</small></div><strong>${K24.money(o.total)}</strong></div>`).join("")}</div>`:
      `<div class="preview-steps"><div><b>01</b><span>Pesanan dibuat pelanggan</span></div><div><b>02</b><span>Kasir mengonfirmasi pembayaran</span></div><div><b>03</b><span>Transaksi tercatat di laporan Owner</span></div></div><p class="preview-footnote">Belum ada transaksi asli. Ringkasan akan terisi otomatis setelah pembayaran berhasil.</p>`;
  }
  function demoOrderPreview(mode){
    const menu=data().menu;
    const presets={
      cashier:[
        {code:"DEMO-2401",guest:"Contoh Pelanggan",table:"IN-02",items:["Kopi Susu Klotok × 1","Chicken Hot Lava × 1"],status:"Contoh pesanan baru",image:"assets/chicken-hot-lava.jpg"},
        {code:"DEMO-2402",guest:"Contoh Pelanggan",table:"NG-01",items:["Cappuccino × 2","French Fries × 1"],status:"Contoh menunggu pembayaran",image:"assets/french-fries.jpg"}
      ],
      kitchen:[
        {code:"DEMO-K01",guest:"Contoh antrean",table:"TG-02",items:["Chicken Hot Lava × 1","French Fries × 1"],status:"Contoh antrean dapur",image:"assets/chicken-hot-lava.jpg"},
        {code:"DEMO-K02",guest:"Contoh antrean",table:"IN-03",items:["Ricebowl Beef Sambal Matah × 1"],status:"Contoh pesanan makanan",image:"assets/ricebowl-beef.jpg"}
      ],
      barista:[
        {code:"DEMO-B01",guest:"Contoh antrean",table:"IN-02",items:["Kopi Susu Klotok × 1","Cappuccino × 1"],status:"Contoh antrean minuman",image:"assets/kopi-susu-klotok.jpg"},
        {code:"DEMO-B02",guest:"Contoh antrean",table:"NG-01",items:["Matcha Latte × 2"],status:"Contoh pesanan minuman",image:"assets/matcha-latte.jpg"}
      ],
      waiter:[
        {code:"DEMO-W01",guest:"Contoh pengantaran",table:"TG-02",items:["Makanan & minuman siap"],status:"Contoh siap diantar",image:"assets/french-fries.jpg"},
        {code:"DEMO-W02",guest:"Contoh meja",table:"IN-03",items:["Menunggu checkout pelanggan"],status:"Contoh alur meja",image:"assets/ropang-tiramisu.jpg"}
      ]
    };
    const rows=presets[mode]||presets.cashier;
    return `<div class="preview-notice"><span>✦</span><div><b>Contoh tampilan dashboard</b><small>Ini data ilustrasi, bukan pesanan atau transaksi sebenarnya. Pesanan asli akan muncul di sini setelah pelanggan membuat pesanan.</small></div></div>
      <div class="order-list demo-order-list">${rows.map((o,i)=>`<article class="staff-order-card demo-order-card"><img src="${o.image}" alt="Contoh menu" onerror="this.style.display='none'"><div class="staff-order-main"><b>${o.code} · ${o.guest}</b><p>${o.items.map(K24.esc).join("<br>")}</p><div class="staff-order-meta">${o.table} · Dine-in</div><span class="order-status">${o.status}</span></div><div class="order-actions"><span class="demo-stamp">PREVIEW</span></div></article>`).join("")}</div>`;
  }
  function dashboardGuide(){
    const guides={
      cashier:[["01","Periksa transaksi","Cocokkan nomor pesanan, menu, jumlah, dan meja."],["02","Pantau pembayaran","Periksa metode dan status pembayaran yang dipilih pelanggan."],["03","Bantu pelanggan","Tangani pertanyaan atau kendala pembayaran di lokasi."]],
      barista:[["01","Ambil antrean minuman","Periksa nama menu dan jumlah pesanan."],["02","Siapkan minuman","Ikuti detail pesanan dari kasir."],["03","Tandai minuman siap","Pelayan dapat melihat status minuman."]],
      kitchen:[["01","Periksa antrean makanan","Lihat menu, jumlah, dan nomor meja."],["02","Cek bahan dapur","Pastikan stok cukup sebelum memasak."],["03","Tandai makanan siap","Status diteruskan ke pelayan."]],
      waiter:[["01","Periksa pesanan siap","Pastikan makanan dan minuman selesai."],["02","Antarkan ke meja","Cocokkan kode meja dan nomor pesanan."],["03","Bersihkan setelah checkout","Ubah status meja menjadi kosong setelah dibersihkan."]],
      owner:[["01","Pantau penjualan","Gunakan filter periode dan shift operasional bila diperlukan."],["02","Lihat menu terlaris","Peringkat muncul dari transaksi lunas."],["03","Tinjau transaksi","Periksa metode pembayaran, pajak, dan omzet."]]
    };
    const rows=guides[role]||guides.cashier;
    return `<section class="staff-panel dashboard-guide"><div class="panel-heading"><div><span class="eyebrow">PANDUAN KERJA</span><h2>Alur Tugas ${info.label}</h2><p>${role==="owner"?"Ringkasan hal yang perlu dipantau oleh pemilik usaha.":"Langkah singkat untuk membantu pekerjaan pada shift bertugas."}</p></div></div><div class="guide-steps">${rows.map(([n,t,d])=>`<article><span>${n}</span><div><b>${t}</b><small>${d}</small></div></article>`).join("")}</div></section>`;
  }
  function orderCards(list,mode){
    if(!list.length)return demoOrderPreview(mode);
    return `<div class="order-list">${list.map(o=>{
      let items=o.items;
      if(mode==="kitchen")items=items.filter(i=>i.category==="food");
      if(mode==="barista")items=items.filter(i=>i.category!=="food");
      const action=mode==="cashier"&&o.paymentStatus!=="Lunas"?`<button data-pay="${o.id}">Proses Pembayaran</button>`:
        mode==="kitchen"?`<button data-ready-food="${o.id}">Tandai Makanan Siap</button>`:
        mode==="barista"?`<button data-ready-drink="${o.id}">Tandai Minuman Siap</button>`:
        mode==="waiter"?`<button data-deliver="${o.id}">Tandai Sudah Diantar</button>`:"";
      const status=o.delivered?"Sudah Diantar":o.paymentStatus!=="Lunas"?"Menunggu Bayar":o.drinkReady&&o.foodReady?"Siap Diantar":"Diproses";
      const img=(items[0]&&data().menu.find(m=>m.id===items[0].id)?.image)||"assets/ropang-tiramisu.jpg";
      return `<article class="staff-order-card"><img src="${K24.esc(img)}" alt="Menu pesanan" onerror="this.src='${K24.esc(img)}'"><div class="staff-order-main"><b>${K24.esc(o.number)} · ${K24.esc(o.customer)}</b><p>${items.map(i=>`${K24.esc(i.name)} × ${i.qty}`).join("<br>")}</p><div class="staff-order-meta">${K24.esc(o.tableId||"Takeaway")} · ${K24.esc(o.orderType)} · ${K24.money(o.total)}${o.paymentMethod?` · Pilihan: ${K24.esc(o.paymentMethod)}`:""}</div><span class="order-status ${status==="Sudah Diantar"?"done":status==="Diproses"?"processing":""}">${status}</span></div><div class="order-actions">${action}</div></article>`;
    }).join("")}</div>`;
  }
  function bindOrderButtons(){
    document.querySelectorAll("[data-pay]").forEach(b=>b.onclick=()=>openPayment(Number(b.dataset.pay)));
    document.querySelectorAll("[data-ready-food]").forEach(b=>b.onclick=()=>updateOrder(Number(b.dataset.readyFood),o=>o.foodReady=true));
    document.querySelectorAll("[data-ready-drink]").forEach(b=>b.onclick=()=>updateOrder(Number(b.dataset.readyDrink),o=>o.drinkReady=true));
    document.querySelectorAll("[data-deliver]").forEach(b=>b.onclick=()=>updateOrder(Number(b.dataset.deliver),o=>o.delivered=true));
  }
  function updateOrder(id,fn){const orders=K24.getOrders();const o=orders.find(x=>x.id===id);if(!o)return;fn(o);K24.setOrders(orders);renderCurrentPage();K24.toast("Status pesanan diperbarui.")}
  function shiftSummary(){
    const s=K24.getShift(),d=data(),today=K24.todayKey();
    const paid=d.orders.filter(o=>o.paymentStatus==="Lunas"&&o.shift===s&&K24.dateOf(o)&&K24.todayKey(K24.dateOf(o))===today);
    return `<div class="shift-summary"><div><span>Shift bertugas</span><b>${shiftNames[s].name}</b></div><div><span>Jam kerja</span><b>${shiftNames[s].time}</b></div><div><span>Transaksi di shift ini</span><b>${paid.length}</b></div><div><span>Penjualan shift ini</span><b>${K24.money(paid.reduce((a,o)=>a+o.total,0))}</b></div></div>`;
  }
  function ingredientPreview(items,showActions=false){
    const list=items.slice(0,7);
    return `<div class="ingredient-list">${list.map(i=>`<div class="ingredient-row"><div><b>${K24.esc(i.name)}</b><small>${K24.esc(i.category)}</small></div><span class="ingredient-amount">${i.stock} ${K24.esc(i.unit)}</span><span class="stock-status ${K24.stockStatus(i)}">${K24.stockStatus(i)==="safe"?"Aman":K24.stockStatus(i)==="low"?"Menipis":"Habis"}</span></div>`).join("")}</div>${showActions?`<div class="stock-action-row"><button class="primary-action" data-goto-stock>Kelola Stok Bahan</button></div>`:""}`;
  }
  function favoriteMenu(items){
    return `<div class="favorite-items">${items.map(m=>`<div class="favorite-item"><img src="${K24.esc(m.image)}" alt="${K24.esc(m.name)}"><div><b>${K24.esc(m.name)}</b><small>${K24.money(m.price)}</small></div></div>`).join("")}</div>`;
  }
  function tableOverview(tables,actions=false){
    return `<div class="table-area-grid">${window.KOPINAN_AREAS.map(a=>`<div class="table-area"><h3>${a.name}</h3><div class="table-mini-grid">${tables.filter(t=>t.area===a.id).map(t=>`<div class="table-mini ${t.status}">${t.id}<small>${K24.labelStatus(t.status)}</small>${actions&&t.status==="cleaning"?`<button data-clean="${t.id}">Sudah Dibersihkan</button>`:""}</div>`).join("")}</div></div>`).join("")}</div>`;
  }
  function bindTableButtons(){document.querySelectorAll("[data-clean]").forEach(b=>b.onclick=()=>cleanTable(b.dataset.clean));}
  function cleanTable(id){const tables=K24.getTables(),t=tables.find(x=>x.id===id);if(!t||t.status!=="cleaning")return;t.status="kosong";t.orderId=null;t.customer="";K24.setTables(tables);renderCurrentPage();K24.toast(id+" kembali kosong.")}
  function movementQuickActions(){return `<p class="section-help">Tim dapur mencatat bahan yang diterima dan bahan yang dipakai agar jumlah stok tetap akurat.</p><div class="stock-action-row"><button class="primary-action" data-movement="in">＋ Barang Masuk</button><button class="outline-action" data-movement="out">− Pemakaian Bahan</button><button class="outline-action" data-goto-movements>Lihat Riwayat</button></div>`;}
  function renderOrdersPage(){
    const d=data();let list=d.orders;
    if(role==="barista")list=list.filter(o=>o.items.some(i=>i.category!=="food"));
    if(role==="kitchen")list=list.filter(o=>o.items.some(i=>i.category==="food"));
    const q=($("globalSearch")?.value||"").toLowerCase().trim();if(q)list=list.filter(o=>o.number.toLowerCase().includes(q)||o.customer.toLowerCase().includes(q)||String(o.tableId).toLowerCase().includes(q));
    if(role==="barista")list=list.filter(o=>o.paymentStatus==="Lunas"&&!o.drinkReady);
    if(role==="kitchen")list=list.filter(o=>o.paymentStatus==="Lunas"&&!o.foodReady);
    let mode=role==="kitchen"?"kitchen":role==="barista"?"barista":role==="waiter"?"waiter":"cashier";
    $("staffWorkspace").innerHTML=`<div class="staff-page-heading"><div><span class="eyebrow">ORDER MANAGEMENT</span><h2>${role==="kitchen"?"Pesanan Dapur":role==="barista"?"Antrean Minuman":role==="waiter"?"Pesanan Siap Diantar":"Daftar Transaksi Pesanan"}</h2><p>Periksa detail pesanan dan perbarui status sesuai tugas.</p></div></div>${orderCards(list,mode)}`;
    bindOrderButtons();
  }
  function renderStockPage(){
    if(role!=="kitchen"){
      $("staffWorkspace").innerHTML=panel("Stok Bahan (Lihat Saja)","Owner hanya memantau persediaan. Perubahan stok dilakukan tim dapur.",renderStockPageReadOnly());
      return;
    }
    const ingredients=K24.getIngredients();
    $("staffWorkspace").innerHTML=`
      <div class="staff-page-heading"><div><span class="eyebrow">KITCHEN INVENTORY</span><h2>Stok Bahan Dapur</h2><p>Bagian dapur mengelola persediaan bahan makanan dan kebutuhan dapur.</p></div><div class="toolbar-actions"><button class="primary-action" id="newIngredient">＋ Tambah Bahan</button><button id="stockCsv">Unduh CSV</button></div></div>
      <div class="summary-row"><div class="summary-box"><small>Total jenis bahan</small><b>${ingredients.length}</b></div><div class="summary-box"><small>Stok aman</small><b>${ingredients.filter(x=>K24.stockStatus(x)==="safe").length}</b></div><div class="summary-box"><small>Menipis</small><b>${ingredients.filter(x=>K24.stockStatus(x)==="low").length}</b></div><div class="summary-box"><small>Habis</small><b>${ingredients.filter(x=>K24.stockStatus(x)==="out").length}</b></div></div>
      <section class="staff-panel"><div class="panel-heading"><div><span class="eyebrow">INGREDIENT LIST</span><h2>Daftar Persediaan</h2></div><input class="menu-search" id="ingredientSearch" placeholder="Cari bahan..."></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>No.</th><th>Nama Bahan</th><th>Kategori</th><th>Stok</th><th>Satuan</th><th>Batas Minimum</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="ingredientRows"></tbody></table></div></section>`;
    const renderRows=()=>{
      const q=$("ingredientSearch").value.toLowerCase();
      const rows=K24.getIngredients().filter(x=>x.name.toLowerCase().includes(q));
      $("ingredientRows").innerHTML=rows.map((x,i)=>`<tr><td>${i+1}</td><td><b>${K24.esc(x.name)}</b></td><td>${K24.esc(x.category)}</td><td>${x.stock}</td><td>${K24.esc(x.unit)}</td><td>${x.minimum}</td><td><span class="pill ${K24.stockStatus(x)}">${K24.stockStatus(x)==="safe"?"Aman":K24.stockStatus(x)==="low"?"Menipis":"Habis"}</span></td><td><button class="table-action" data-edit-ingredient="${x.id}">Edit</button></td></tr>`).join("");
      document.querySelectorAll("[data-edit-ingredient]").forEach(b=>b.onclick=()=>openIngredientForm(Number(b.dataset.editIngredient)));
    };
    $("ingredientSearch").oninput=renderRows;renderRows();
    $("newIngredient").onclick=()=>openIngredientForm();
    $("stockCsv").onclick=()=>downloadCsv("stok-bahan-kopinan24.csv",["Nama Bahan","Kategori","Stok","Satuan","Minimum","Status"],K24.getIngredients().map(x=>[x.name,x.category,x.stock,x.unit,x.minimum,K24.stockStatus(x)]));
  }
  function renderMovementsPage(){
    const movements=K24.getMovements(),ingredients=K24.getIngredients();
    $("staffWorkspace").innerHTML=`
      <div class="staff-page-heading"><div><span class="eyebrow">STOCK MOVEMENT</span><h2>Barang Masuk & Pemakaian</h2><p>Catat penambahan dan penggunaan bahan dapur.</p></div><div class="toolbar-actions"><button class="primary-action" data-movement="in">＋ Barang Masuk</button><button data-movement="out">− Pemakaian Bahan</button></div></div>
      <section class="staff-panel"><div class="panel-heading"><div><span class="eyebrow">ACTIVITY HISTORY</span><h2>Riwayat Stok</h2></div></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Waktu</th><th>Jenis</th><th>Bahan</th><th>Jumlah</th><th>Catatan</th><th>Shift</th></tr></thead><tbody>${movements.length?movements.map(m=>`<tr><td>${new Date(m.createdAt).toLocaleString("id-ID")}</td><td>${m.type==="in"?"Barang Masuk":"Pemakaian"}</td><td>${K24.esc(m.ingredient)}</td><td>${m.qty}</td><td>${K24.esc(m.note)}</td><td>Shift ${m.shift}</td></tr>`).join(""):'<tr><td colspan="6">Belum ada riwayat stok.</td></tr>'}</tbody></table></div></section>`;
    bindMovementButtons();
  }
  function renderReportsPage(){
    if(role==="owner"||role==="cashier"){
      $("staffWorkspace").innerHTML=`<div class="staff-page-heading"><div><span class="eyebrow">BUSINESS PERFORMANCE</span><h2>Laporan Penjualan</h2><p>Atur laporan per hari, per bulan, rentang tanggal, dan shift pembayaran.</p></div></div><section class="staff-panel">${reportWidget()}</section>`;
      bindReportControls();
      return;
    }
    const d=data();
    $("staffWorkspace").innerHTML=`
      <div class="staff-page-heading"><div><span class="eyebrow">KITCHEN PERFORMANCE</span><h2>Laporan Dapur</h2><p>Filter laporan berdasarkan hari, bulan, tanggal, dan shift.</p></div></div>
      <section class="staff-panel"><div class="report-controls"><label>Periode<select id="kReportPeriod"><option value="today">Hari Ini</option><option value="week">7 Hari Terakhir</option><option value="month">Bulan Ini</option><option value="custom">Rentang Tanggal</option></select></label><label>Shift<select id="kReportShift"><option value="all">Semua Shift</option><option value="1">Shift 1</option><option value="2">Shift 2</option><option value="3">Shift 3</option></select></label><label id="kDateStart" class="hidden">Mulai<input type="date" id="kStartDate"></label><label id="kDateEnd" class="hidden">Sampai<input type="date" id="kEndDate"></label><button class="primary-action" id="applyKitchenReport">Tampilkan</button></div></section>
      <div id="kReportOutput" style="margin-top:12px"></div>`;
    const now=new Date(),key=K24.todayKey(now);
    $("kStartDate").value=key;$("kEndDate").value=key;
    $("kReportPeriod").onchange=()=>{const custom=$("kReportPeriod").value==="custom";$("kDateStart").classList.toggle("hidden",!custom);$("kDateEnd").classList.toggle("hidden",!custom)};
    $("applyKitchenReport").onclick=renderKitchenReport;renderKitchenReport();
  }
  function renderKitchenReport(){
    const d=data(),period=$("kReportPeriod").value,shift=$("kReportShift").value,now=new Date();
    let start,end;
    if(period==="today")start=end=K24.todayKey(now);
    else if(period==="week"){const s=new Date(now);s.setDate(s.getDate()-6);start=K24.todayKey(s);end=K24.todayKey(now)}
    else if(period==="month"){start=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`;end=K24.todayKey(now)}
    else{start=$("kStartDate").value;end=$("kEndDate").value}
    if(!start||!end||start>end){alert("Rentang tanggal tidak valid.");return}
    const orders=d.orders.filter(o=>{const dt=K24.dateOf(o);if(!dt)return false;const k=K24.todayKey(dt);return k>=start&&k<=end&&(shift==="all"||o.shift===shift)});
    const completed=orders.filter(o=>o.foodReady),qty=completed.reduce((s,o)=>s+o.items.filter(i=>i.category==="food").reduce((a,i)=>a+i.qty,0),0);
    const movements=d.movements.filter(m=>{const k=K24.todayKey(new Date(m.createdAt));return k>=start&&k<=end&&(shift==="all"||m.shift===shift)});
    const incoming=movements.filter(m=>m.type==="in").length,used=movements.filter(m=>m.type==="out").length;
    $("kReportOutput").innerHTML=`<div class="summary-row"><div class="summary-box"><small>Pesanan makanan selesai</small><b>${completed.length}</b></div><div class="summary-box"><small>Item disiapkan</small><b>${qty}</b></div><div class="summary-box"><small>Catatan barang masuk</small><b>${incoming}</b></div><div class="summary-box"><small>Catatan pemakaian</small><b>${used}</b></div></div><section class="staff-panel"><h2 style="font:600 18px 'Playfair Display'">Rincian Kegiatan Dapur</h2><p class="section-help">${start} sampai ${end} · ${shift==="all"?"Semua Shift":"Shift "+shift}</p><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Waktu</th><th>Aktivitas</th><th>Nama / Nomor</th><th>Shift</th></tr></thead><tbody>${orders.map(o=>`<tr><td>${K24.esc(o.date)}</td><td>Pesanan ${o.foodReady?"selesai":"diproses"}</td><td>${K24.esc(o.number)}</td><td>Shift ${o.shift||"-"}</td></tr>`).join("")}${movements.map(m=>`<tr><td>${new Date(m.createdAt).toLocaleString("id-ID")}</td><td>${m.type==="in"?"Barang masuk":"Pemakaian bahan"}</td><td>${K24.esc(m.ingredient)} · ${m.qty}</td><td>Shift ${m.shift}</td></tr>`).join("")||(!orders.length?'<tr><td colspan="4">Belum ada aktivitas pada periode ini.</td></tr>':"")}</tbody></table></div></section>`;
  }
  function renderTransactionsPage(){
    const paid=K24.getOrders().filter(o=>o.paymentStatus==="Lunas");
    $("staffWorkspace").innerHTML=`<div class="staff-page-heading"><div><span class="eyebrow">BUSINESS TRANSACTIONS</span><h2>Riwayat Transaksi</h2><p>Daftar transaksi yang telah dibayar. Halaman ini untuk pemantauan bisnis, bukan pengelolaan meja.</p></div></div>
      <section class="staff-panel"><div class="data-table-wrap"><table class="data-table"><thead><tr><th>No. Pesanan</th><th>Tanggal</th><th>Pelanggan</th><th>Jumlah Item</th><th>Metode Pembayaran</th><th>Shift</th><th>Subtotal</th><th>Pajak</th><th>Total</th></tr></thead><tbody>
      ${paid.length?paid.map(o=>`<tr><td>${K24.esc(o.number)}</td><td>${K24.esc(o.date||"")}</td><td>${K24.esc(o.customer||"")}</td><td>${(o.items||[]).reduce((n,i)=>n+i.qty,0)}</td><td>${K24.esc(o.paymentMethod||"-")}</td><td>${o.shift||"-"}</td><td>${K24.money(o.subtotal||0)}</td><td>${K24.money(o.tax||0)}</td><td><b>${K24.money(o.total||0)}</b></td></tr>`).join(""):'<tr><td colspan="9">Belum ada transaksi lunas.</td></tr>'}
      </tbody></table></div></section>`;
  }
  function renderTablesPage(){
    $("staffWorkspace").innerHTML=`<div class="staff-page-heading"><div><span class="eyebrow">TABLE MONITORING</span><h2>Meja & Area</h2><p>Pelayan memantau status meja dan membersihkan meja setelah checkout pengunjung.</p></div></div><section class="staff-panel">${tableOverview(K24.getTables(),role==="waiter")}</section>`;
    bindTableButtons();
  }
  function tableOverview(tables,actions){
    return `<div class="table-area-grid">${window.KOPINAN_AREAS.map(a=>`<div class="table-area"><h3>${a.name}</h3><div class="table-mini-grid">${tables.filter(t=>t.area===a.id).map(t=>`<div class="table-mini ${t.status}">${t.id}<small>${K24.labelStatus(t.status)}</small>${actions&&t.status==="cleaning"?`<button data-clean="${t.id}">Sudah Dibersihkan</button>`:""}</div>`).join("")}</div></div>`).join("")}</div>`;
  }
  function bindTableButtons(){document.querySelectorAll("[data-clean]").forEach(b=>b.onclick=()=>{const tables=K24.getTables(),t=tables.find(x=>x.id===b.dataset.clean);if(t){t.status="kosong";t.orderId=null;t.customer="";K24.setTables(tables);renderCurrentPage();K24.toast("Meja sudah kosong kembali.")}})}
  function renderStockPageReadOnly(){
    const ingredients=K24.getIngredients();
    return `<div class="ingredient-list">${ingredients.map(i=>`<div class="ingredient-row"><div><b>${K24.esc(i.name)}</b><small>${K24.esc(i.category)}</small></div><span>${i.stock} ${K24.esc(i.unit)}</span><span class="stock-status ${K24.stockStatus(i)}">${K24.stockStatus(i)==="safe"?"Aman":K24.stockStatus(i)==="low"?"Menipis":"Habis"}</span></div>`).join("")}</div>`;
  }
  function renderCurrentPageStockOwner(){ $("staffWorkspace").innerHTML=panel("Stok Bahan (Lihat Saja)","Owner dapat memantau persediaan; tim dapur yang memperbarui stok.",renderStockPageReadOnly());}
  function renderStockOwner(){renderCurrentPageStockOwner()}
  function renderStockForOwner(){renderCurrentPageStockOwner()}
  function openPayment(orderId){
    const orders=K24.getOrders(),order=orders.find(o=>o.id===orderId);if(!order)return;
    const shift=$("activeShift").value;
    openModal("Pembayaran Pesanan",`
      <div class="payment-summary"><b>${K24.esc(order.number)} · ${K24.esc(order.customer)}</b><p>Area / meja: ${K24.esc(order.tableId||"Takeaway")} · ${K24.esc(order.orderType)}</p>
      ${order.items.map(i=>`<div class="payment-line"><span>${K24.esc(i.name)} × ${i.qty}</span><b>${K24.money(i.price*i.qty)}</b></div>`).join("")}
      <div class="payment-line"><span>Subtotal</span><b>${K24.money(order.subtotal)}</b></div><div class="payment-line"><span>Pajak (${Math.round(order.taxRate*100)}%)</span><b>${K24.money(order.tax)}</b></div><div class="payment-line payment-total"><span>Total</span><b>${K24.money(order.total)}</b></div></div>
      <form id="paymentForm" class="modal-form"><label>Shift kasir<select id="paymentShift"><option value="1">Shift 1 · Pagi</option><option value="2">Shift 2 · Sore</option><option value="3">Shift 3 · Malam</option></select></label><label>Metode pembayaran (pilihan pelanggan)<select id="paymentMethod"><option value="Tunai" ${order.paymentMethod==="Tunai"?"selected":""}>Tunai</option><option value="QRIS" ${order.paymentMethod==="QRIS"?"selected":""}>QRIS</option><option value="Debit" ${order.paymentMethod==="Debit"?"selected":""}>Debit</option></select></label><div id="cashInputs"><label>Uang diterima<input type="number" id="cashReceived" min="${order.total}" placeholder="Masukkan uang diterima"></label><p id="changeText" class="change-text">Kembalian: Rp0</p></div><div class="modal-actions"><button type="button" class="secondary" id="cancelPayment">Batal</button><button type="submit">Konfirmasi Pembayaran</button></div></form>`);
    $("paymentShift").value=shift;
    $("paymentMethod").onchange=()=>$("cashInputs").classList.toggle("hidden",$("paymentMethod").value!=="Tunai");
    $("cashInputs").classList.toggle("hidden",$("paymentMethod").value!=="Tunai");
    $("cashReceived").oninput=()=>{$("changeText").textContent="Kembalian: "+K24.money(Number($("cashReceived").value||0)-order.total)};
    $("cancelPayment").onclick=closeModal;
    $("paymentForm").onsubmit=e=>{
      e.preventDefault();const method=$("paymentMethod").value,chosenShift=$("paymentShift").value;
      if(method==="Tunai"&&Number($("cashReceived").value)<order.total){alert("Uang diterima kurang dari total pembayaran.");return}
      const latest=K24.getOrders(),o=latest.find(x=>x.id===orderId);if(!o)return;
      o.paymentStatus="Lunas";o.paymentMethod=method;o.shift=chosenShift;o.paidAt=new Date().toISOString();
      const tables=K24.getTables();if(o.tableId){const t=tables.find(x=>x.id===o.tableId);if(t&&t.orderId===o.id)t.status="terisi"}
      K24.setOrders(latest);K24.setTables(tables);closeModal();renderCurrentPage();K24.toast("Pembayaran berhasil dicatat.");
      if(method==="Tunai")alert("Kembalian: "+K24.money(Number($("cashReceived")?.value||0)-order.total));
    };
  }
  function reportWidget(){
    return `<div class="report-controls"><label>Periode<select id="salesPeriod"><option value="today">Hari Ini</option><option value="month">Bulan Ini</option><option value="custom">Rentang Tanggal</option></select></label><label>Shift Operasional<select id="salesShift"><option value="all">Semua Shift</option><option value="1">Shift 1</option><option value="2">Shift 2</option><option value="3">Shift 3</option></select></label><label id="salesStartWrap" class="hidden">Mulai<input type="date" id="salesStart"></label><label id="salesEndWrap" class="hidden">Sampai<input type="date" id="salesEnd"></label><button class="primary-action" id="runSalesReport">Tampilkan</button></div><div id="salesReportContent"></div>`;
  }
  function bindReportControls(){
    if(!$("salesPeriod"))return;
    const today=K24.todayKey();$("salesStart").value=today;$("salesEnd").value=today;
    $("salesPeriod").onchange=()=>{const custom=$("salesPeriod").value==="custom";$("salesStartWrap").classList.toggle("hidden",!custom);$("salesEndWrap").classList.toggle("hidden",!custom)};
    $("runSalesReport").onclick=renderSalesReport;renderSalesReport();
  }
  function renderSalesReport(){
    const d=data(),period=$("salesPeriod").value,shift=$("salesShift").value,now=new Date();let start,end;
    if(period==="today")start=end=K24.todayKey();
    else if(period==="month"){start=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`;end=K24.todayKey()}
    else{start=$("salesStart").value;end=$("salesEnd").value}
    if(!start||!end||start>end){$("salesReportContent").innerHTML="Tanggal laporan tidak valid.";return}
    const filtered=d.orders.filter(o=>o.paymentStatus==="Lunas"&&o.createdAt&&K24.todayKey(new Date(o.createdAt))>=start&&K24.todayKey(new Date(o.createdAt))<=end&&(shift==="all"||o.shift===shift));
    const gross=filtered.reduce((s,o)=>s+o.total,0),tax=filtered.reduce((s,o)=>s+o.tax,0),net=filtered.reduce((s,o)=>s+o.subtotal,0);
    $("salesReportContent").innerHTML=`<div class="report-kpis"><div class="report-kpi"><small>Total Penjualan</small><b>${K24.money(gross)}</b></div><div class="report-kpi"><small>Subtotal</small><b>${K24.money(net)}</b></div><div class="report-kpi"><small>Pajak Terkumpul</small><b>${K24.money(tax)}</b></div><div class="report-kpi"><small>Transaksi Lunas</small><b>${filtered.length}</b></div></div>${filtered.length?'<div class="report-period-note">Laporan menampilkan transaksi lunas pada periode yang dipilih.</div>':'<div class="preview-notice report-no-data"><span>▤</span><div><b>Belum ada transaksi pada periode ini</b><small>Setelah kasir menyelesaikan pembayaran, omzet, pajak, metode pembayaran, dan shift akan otomatis tampil di laporan.</small></div></div>'}<div class="data-table-wrap"><table class="data-table"><thead><tr><th>No. Pesanan</th><th>Waktu</th><th>Pelanggan</th><th>Meja</th><th>Metode</th><th>Shift</th><th>Total</th></tr></thead><tbody>${filtered.length?filtered.map(o=>`<tr><td>${K24.esc(o.number)}</td><td>${new Date(o.paidAt||o.createdAt).toLocaleString("id-ID")}</td><td>${K24.esc(o.customer)}</td><td>${K24.esc(o.tableId||"Takeaway")}</td><td>${K24.esc(o.paymentMethod)}</td><td>${o.shift||"-"}</td><td><b>${K24.money(o.total)}</b></td></tr>`).join(""):'<tr><td colspan="7">Belum ada transaksi lunas pada periode ini.</td></tr>'}</tbody></table></div>`;
  }
  function renderIngredientAlerts(){
    const low=K24.getIngredients().filter(i=>K24.stockStatus(i)!=="safe");
    return low.length?low.map(i=>`<div class="alert-line"><span class="alert-dot"></span><div><b>${K24.esc(i.name)}</b><small>${i.stock<=0?"Stok habis":`Sisa ${i.stock} ${K24.esc(i.unit)} · minimum ${i.minimum}`}</small></div></div>`).join(""):'<div class="empty-state">Semua stok bahan dalam kondisi aman.</div>';
  }
  function renderStockPage(){
    const ingredients=K24.getIngredients();
    $("staffWorkspace").innerHTML=`<div class="staff-page-heading"><div><span class="eyebrow">KITCHEN INVENTORY</span><h2>Stok Bahan Dapur</h2><p>Tim dapur mengelola persediaan bahan makanan dan kebutuhan dapur.</p></div><div class="toolbar-actions"><button class="primary-action" id="newIngredient">＋ Tambah Bahan</button><button id="stockCsv">Unduh CSV</button></div></div>
    <div class="summary-row"><div class="summary-box"><small>Total jenis bahan</small><b>${ingredients.length}</b></div><div class="summary-box"><small>Stok aman</small><b>${ingredients.filter(x=>K24.stockStatus(x)==="safe").length}</b></div><div class="summary-box"><small>Menipis</small><b>${ingredients.filter(x=>K24.stockStatus(x)==="low").length}</b></div><div class="summary-box"><small>Habis</small><b>${ingredients.filter(x=>K24.stockStatus(x)==="out").length}</b></div></div>
    <section class="staff-panel"><div class="panel-heading"><div><span class="eyebrow">INGREDIENT LIST</span><h2>Daftar Persediaan</h2></div><input class="menu-search" id="ingredientSearch" placeholder="Cari bahan..."></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>No.</th><th>Nama Bahan</th><th>Kategori</th><th>Stok</th><th>Satuan</th><th>Minimum</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="ingredientRows"></tbody></table></div></section>
    <div class="staff-grid-2" style="margin-top:12px">${panel("Peringatan Stok","Bahan di bawah batas minimum.",renderIngredientAlerts())}${panel("Catatan Pengelolaan","Barang masuk dan pemakaian dicatat untuk menjaga stok tetap akurat.",movementQuickActions())}</div>`;
    const draw=()=>{const q=$("ingredientSearch").value.toLowerCase();const rows=K24.getIngredients().filter(x=>x.name.toLowerCase().includes(q));$("ingredientRows").innerHTML=rows.map((x,i)=>`<tr><td>${i+1}</td><td><b>${K24.esc(x.name)}</b></td><td>${K24.esc(x.category)}</td><td>${x.stock}</td><td>${K24.esc(x.unit)}</td><td>${x.minimum}</td><td><span class="pill ${K24.stockStatus(x)}">${K24.stockStatus(x)==="safe"?"Aman":K24.stockStatus(x)==="low"?"Menipis":"Habis"}</span></td><td><button class="table-action" data-edit-ingredient="${x.id}">Edit</button></td></tr>`).join("");document.querySelectorAll("[data-edit-ingredient]").forEach(b=>b.onclick=()=>openIngredientForm(Number(b.dataset.editIngredient)))};
    $("ingredientSearch").oninput=draw;draw();$("newIngredient").onclick=()=>openIngredientForm();$("stockCsv").onclick=()=>downloadCsv("stok-bahan-kopinan24.csv",["Bahan","Kategori","Stok","Satuan","Minimum"],K24.getIngredients().map(x=>[x.name,x.category,x.stock,x.unit,x.minimum]));bindMovementButtons();document.querySelectorAll("[data-goto-movements]").forEach(b=>b.onclick=()=>navigate("movements"));
  }
  function bindMovementButtons(){
    document.querySelectorAll("[data-movement]").forEach(b=>b.onclick=()=>openMovementForm(b.dataset.movement));
    document.querySelectorAll("[data-goto-stock]").forEach(b=>b.onclick=()=>navigate("stock"));
    document.querySelectorAll("[data-goto-movements]").forEach(b=>b.onclick=()=>navigate("movements"));
  }
  function openMovementForm(type){
    const ingredients=K24.getIngredients();
    openModal(type==="in"?"Barang Masuk":"Pemakaian Bahan",`<form class="modal-form" id="movementForm"><label>Nama bahan<select id="moveIngredient">${ingredients.map(i=>`<option value="${i.id}">${K24.esc(i.name)} · stok ${i.stock} ${K24.esc(i.unit)}</option>`).join("")}</select></label><label>Jumlah (${ingredients[0]?.unit||"satuan"})<input type="number" id="moveQty" step="0.01" min="0.01" required></label><label>Catatan<input id="moveNote" placeholder="${type==="in"?"Contoh: pembelian supplier":"Contoh: pemakaian produksi"}"></label><div class="modal-actions"><button type="button" class="secondary" id="moveCancel">Batal</button><button type="submit">Simpan</button></div></form>`);
    $("moveCancel").onclick=closeModal;
    $("movementForm").onsubmit=e=>{e.preventDefault();const id=Number($("moveIngredient").value),qty=Number($("moveQty").value),list=K24.getIngredients(),item=list.find(x=>x.id===id);if(!item||qty<=0)return;if(type==="out"&&qty>item.stock){alert("Pemakaian melebihi stok yang tersedia.");return}item.stock=type==="in"?item.stock+qty:item.stock-qty;K24.setIngredients(list);K24.addMovement(type,item.name,qty,$("moveNote").value,$("activeShift").value);closeModal();renderCurrentPage();K24.toast("Pergerakan stok berhasil dicatat.")};
  }
  function openIngredientForm(id=null){
    const item=id?K24.getIngredients().find(x=>x.id===id):null;
    openModal(item?"Edit Bahan":"Tambah Bahan",`<form class="modal-form" id="ingredientForm"><label>Nama bahan<input id="ingName" required value="${item?K24.esc(item.name):""}"></label><div class="form-row"><label>Kategori<select id="ingCategory"><option ${item?.category==="Makanan"?"selected":""}>Makanan</option><option ${item?.category==="Bumbu"?"selected":""}>Bumbu</option><option ${item?.category==="Bahan Pokok"?"selected":""}>Bahan Pokok</option><option ${item?.category==="Bahan Minuman"?"selected":""}>Bahan Minuman</option><option ${item?.category==="Lainnya"?"selected":""}>Lainnya</option></select></label><label>Satuan<input id="ingUnit" required value="${item?K24.esc(item.unit):"kg"}"></label></div><div class="form-row"><label>Stok awal<input type="number" min="0" step="0.01" id="ingStock" value="${item?item.stock:0}" required></label><label>Batas minimum<input type="number" min="0" step="0.01" id="ingMin" value="${item?item.minimum:1}" required></label></div><div class="modal-actions"><button type="button" class="secondary" id="ingCancel">Batal</button><button type="submit">Simpan Bahan</button></div></form>`);
    $("ingCancel").onclick=closeModal;$("ingredientForm").onsubmit=e=>{e.preventDefault();const list=K24.getIngredients(),record={id:item?item.id:Date.now(),name:$("ingName").value.trim(),category:$("ingCategory").value,unit:$("ingUnit").value.trim(),stock:Number($("ingStock").value),minimum:Number($("ingMin").value)};if(item){const ix=list.findIndex(x=>x.id===item.id);list[ix]=record}else list.push(record);K24.setIngredients(list);closeModal();renderCurrentPage();K24.toast("Data bahan disimpan.")};
  }
  function renderMovementsPage(){
    const moves=K24.getMovements();
    $("staffWorkspace").innerHTML=`<div class="staff-page-heading"><div><span class="eyebrow">STOCK MOVEMENT</span><h2>Barang Masuk & Pemakaian</h2><p>Setiap perubahan persediaan dicatat oleh tim dapur.</p></div><div class="toolbar-actions"><button class="primary-action" data-movement="in">＋ Barang Masuk</button><button data-movement="out">− Pemakaian</button></div></div><section class="staff-panel"><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Waktu</th><th>Jenis</th><th>Bahan</th><th>Jumlah</th><th>Catatan</th><th>Shift</th></tr></thead><tbody>${moves.length?moves.map(m=>`<tr><td>${new Date(m.createdAt).toLocaleString("id-ID")}</td><td>${m.type==="in"?"Barang Masuk":"Pemakaian"}</td><td>${K24.esc(m.ingredient)}</td><td>${m.qty}</td><td>${K24.esc(m.note)}</td><td>Shift ${m.shift}</td></tr>`).join(""):'<tr><td colspan="6">Belum ada pergerakan stok.</td></tr>'}</tbody></table></div></section>`;
    bindMovementButtons();
  }
  function openModal(title,body){$("staffModalTitle").textContent=title;$("staffModalBody").innerHTML=body;$("staffModalBackdrop").classList.add("show")}
  function closeModal(){$("staffModalBackdrop").classList.remove("show")}
  function downloadCsv(filename,headers,rows){
    const csv=[headers,...rows].map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
    const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
  }
  function renderCurrentPage(){
    renderStats();
    if(activePage==="dashboard")renderDashboard();
    else if(activePage==="orders")renderOrdersPage();
    else if(activePage==="transactions")renderTransactionsPage();
    else if(activePage==="stock")renderStockPage();
    else if(activePage==="movements")renderMovementsPage();
    else if(activePage==="reports")renderReportsPage();
    else if(activePage==="tables")renderTablesPage();
  }
  function renderTablesPage(){
    $("staffWorkspace").innerHTML=`<div class="staff-page-heading"><div><span class="eyebrow">TABLE MONITORING</span><h2>Meja & Area</h2><p>Pelayan mengelola status meja. Meja kembali kosong setelah checkout pelanggan dan dibersihkan.</p></div></div><section class="staff-panel">${tableOverview(K24.getTables(),role==="waiter")}</section>`;
    bindTableButtons();
  }
  window.addEventListener("storage",e=>{if(Object.values(K24.KEYS).includes(e.key))renderCurrentPage()});
  window.addEventListener("k24:datachange",()=>{if(role)renderCurrentPage()});
  initShell();renderStats();navigate("dashboard");
})();

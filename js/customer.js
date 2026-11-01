/* customer.js - landing, menu, cart, seat reservation and visitor checkout */
(() => {
  const $ = id => document.getElementById(id);
  let menu=K24.getMenu(),tables=K24.getTables(),cart={},filter="all",selectedTable="";
  const taxRate=window.KOPINAN_TAX_RATE;
  const PROFILE_KEY="k24_customer_profile_v1";
  const getProfile=()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||"null")}catch{return null}};
  const saveProfile=profile=>localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));
  const currentOperationalShift=()=>{
    const hour=new Date().getHours();
    if(hour>=7&&hour<15)return "1";
    if(hour>=15&&hour<23)return "2";
    return "3";
  };
  const subtotal=()=>Object.entries(cart).reduce((sum,[id,qty])=>{
    const item=menu.find(x=>x.id===Number(id));return sum+(item?item.price*qty:0);
  },0);
  function renderMenu(){
    menu=K24.getMenu();
    const keyword=$("menuSearch").value.toLowerCase().trim();
    const list=menu.filter(x=>(filter==="all"||x.category===filter)&&
      (x.name.toLowerCase().includes(keyword)||x.description.toLowerCase().includes(keyword)));
    $("menuGrid").innerHTML=list.length?list.map(x=>`
      <article class="menu-card">
        <img class="menu-photo" src="${K24.esc(x.image)}" alt="${K24.esc(x.name)}">
        <div class="menu-info">
          <div class="menu-meta"><span class="menu-tag">${x.category==="coffee"?"KOPI":x.category==="noncoffee"?"NON COFFEE":"MAKANAN"}</span>
          <span class="stock-badge ${x.stock<=0?"out":""}">${x.stock<=0?"Habis":"Stok "+x.stock}</span></div>
          <h3>${K24.esc(x.name)}</h3><p>${K24.esc(x.description)}</p>
          <div class="menu-bottom"><span class="price">${K24.money(x.price)}</span><button class="add-btn" data-add="${x.id}" ${x.stock<=0?"disabled":""}>+</button></div>
        </div>
      </article>`).join(""):'<p class="loading">Menu tidak ditemukan.</p>';
    document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addToCart(Number(b.dataset.add)));
  }
  function renderCart(){
    menu=K24.getMenu();
    const rows=Object.entries(cart).filter(([,q])=>q>0);
    const count=rows.reduce((sum,[,qty])=>sum+qty,0);
    $("cartCount").textContent=count;
    $("cartItems").innerHTML=rows.length?rows.map(([id,qty])=>{
      const m=menu.find(x=>x.id===Number(id));
      return `<div class="cart-row"><div><b>${K24.esc(m.name)}</b><small>${K24.money(m.price)} / item</small></div>
      <div class="qty"><button data-minus="${id}">−</button><span>${qty}</span><button data-plus="${id}">+</button></div></div>`;
    }).join(""):'<p class="empty-cart">Keranjang masih kosong. Pilih menu favoritmu.</p>';
    document.querySelectorAll("[data-minus]").forEach(b=>b.onclick=()=>changeQty(Number(b.dataset.minus),-1));
    document.querySelectorAll("[data-plus]").forEach(b=>b.onclick=()=>changeQty(Number(b.dataset.plus),1));
    const sub=subtotal(),tax=Math.round(sub*taxRate);
    $("billSubtotal").textContent=K24.money(sub);$("billTax").textContent=K24.money(tax);$("billGrand").textContent=K24.money(sub+tax);
    $("taxRateLabel").textContent=taxRate*100;
    const payButton=$("submitOrder");
    if(payButton)payButton.textContent=rows.length?`Bayar Sekarang · ${K24.money(sub+tax)} →`:"Bayar Sekarang →";
  }
  function addToCart(id){
    menu=K24.getMenu();const item=menu.find(x=>x.id===id);
    if(!item||item.stock<(cart[id]||0)+1){K24.toast("Stok menu tidak mencukupi.");return}
    cart[id]=(cart[id]||0)+1;renderCart();openCart();
  }
  function changeQty(id,delta){
    menu=K24.getMenu();const item=menu.find(x=>x.id===id);
    const next=(cart[id]||0)+delta;
    if(next<=0)delete cart[id];else if(item&&next<=item.stock)cart[id]=next;else K24.toast("Jumlah melebihi stok.");
    renderCart();
  }
  function openCart(){$("cartDrawer").classList.add("show");$("cartBackdrop").classList.add("show");$("cartDrawer").setAttribute("aria-hidden","false")}
  function closeCart(){$("cartDrawer").classList.remove("show");$("cartBackdrop").classList.remove("show");$("cartDrawer").setAttribute("aria-hidden","true")}
  function renderAreas(){
    tables=K24.getTables();
    $("customerAreas").innerHTML=window.KOPINAN_AREAS.map(area=>{
      const areaTables=tables.filter(t=>t.area===area.id);
      return `<article class="area-card">
        <div class="area-banner ${area.id}"><h3>${area.name}</h3><p>${area.description} · ${areaTables.length} meja contoh</p></div>
        <div class="table-buttons">${areaTables.map(t=>`
          <button class="table-choice ${t.status} ${selectedTable===t.id?"chosen":""}" ${t.status==="kosong"?`data-seat="${t.id}"`:"disabled"}>
            ${t.id}<small>${K24.labelStatus(t.status)}</small>
          </button>`).join("")}</div></article>`;
    }).join("");
    document.querySelectorAll("[data-seat]").forEach(b=>b.onclick=()=>selectSeat(b.dataset.seat));
    $("selectedTableNote").textContent=selectedTable?
      `Meja terpilih: ${selectedTable}. Lanjutkan memilih menu, lalu konfirmasi pesanan.`:
      "Belum memilih meja. Pilih meja berstatus kosong untuk Dine-in.";
  }
  function selectSeat(id){
    tables=K24.getTables();const t=tables.find(x=>x.id===id);
    if(!t||t.status!=="kosong"){K24.toast("Meja sudah tidak tersedia.");renderAreas();return}
    selectedTable=id;$("orderType").value="Dine-in";$("selectedTableInput").value=id;
    renderAreas();openCart();
  }
  function submitOrder(){
    menu=K24.getMenu();tables=K24.getTables();
    const orders=K24.getOrders();
    const customer=$("customerName").value.trim();
    if(!customer){alert("Masukkan nama pelanggan.");$("customerName").focus();return}
    const selectedPayment=document.querySelector('input[name="customerPaymentMethod"]:checked');
    if(!selectedPayment){alert("Pilih metode pembayaran terlebih dahulu.");document.querySelector(".customer-payment-picker")?.scrollIntoView({behavior:"smooth",block:"center"});return}
    const paymentMethod=selectedPayment.value;
    const entries=Object.entries(cart).filter(([,q])=>q>0);
    if(!entries.length){alert("Keranjang masih kosong.");return}
    const type=$("orderType").value;let tableId="";
    if(type==="Dine-in"){
      tableId=selectedTable;
      const t=tables.find(x=>x.id===tableId);
      if(!t||t.status!=="kosong"){alert("Pilih meja kosong pada denah terlebih dahulu.");renderAreas();return}
    }
    const items=[];
    for(const [id,qty] of entries){
      const m=menu.find(x=>x.id===Number(id));
      if(!m||m.stock<qty){alert(`Stok ${m?.name||"menu"} tidak mencukupi.`);renderMenu();return}
      items.push({id:m.id,name:m.name,category:m.category,price:m.price,qty});
    }
    const sub=items.reduce((s,x)=>s+x.price*x.qty,0);
    const tax=Math.round(sub*taxRate);
    const order={
      id:Date.now(),number:"K24-"+String(Date.now()).slice(-6),
      createdAt:new Date().toISOString(),date:new Date().toLocaleString("id-ID"),
      customer,customerEmail:(getProfile()?.email||""),customerPhone:(getProfile()?.phone||""),orderType:type,tableId,items,subtotal:sub,taxRate,tax,total:sub+tax,
      // Prototype payment: customer confirms the selected method and the demo marks it paid.
      // A real site must replace this with a payment-gateway/server verification callback.
      paymentStatus:"Lunas",paymentMethod,shift:currentOperationalShift(),
      paidAt:new Date().toISOString(),paymentMode:"simulasi",
      drinkReady:!items.some(x=>x.category==="coffee"||x.category==="noncoffee"),
      foodReady:!items.some(x=>x.category==="food"),
      delivered:false,visitCheckout:false
    };
    items.forEach(i=>{const m=menu.find(x=>x.id===i.id);m.stock-=i.qty});
    orders.unshift(order);
    if(tableId){const t=tables.find(x=>x.id===tableId);t.status="terisi";t.orderId=order.id;t.customer=customer}
    K24.setMenu(menu);K24.setTables(tables);K24.setOrders(orders);
    cart={};selectedTable="";$("customerName").value="";$("selectedTableInput").value="";
    document.querySelectorAll('input[name="customerPaymentMethod"]').forEach(input=>input.checked=false);
    renderMenu();renderCart();renderAreas();renderAccount();renderCustomerOrders();closeCart();
    alert(`Pembayaran berhasil (simulasi)!\nPesanan: ${order.number}\nMetode: ${paymentMethod}\nSubtotal: ${K24.money(sub)}\nPajak contoh ${taxRate*100}%: ${K24.money(tax)}\nTotal dibayar: ${K24.money(order.total)}\nMeja: ${tableId||"Takeaway"}\n\nPesanan sudah lunas dan diteruskan ke Barista/Dapur.`);
  }
  function statusForCustomer(order){
    if(order.visitCheckout)return ["Kunjungan selesai","done"];
    if(order.delivered)return ["Sudah diantar","done"];
    if(order.paymentStatus!=="Lunas")return ["Menunggu pembayaran","waiting"];
    if(order.drinkReady&&order.foodReady)return ["Siap diantar","ready"];
    return ["Sedang disiapkan","processing"];
  }
  function currentCustomerOrders(){
    const profile=getProfile(),all=K24.getOrders();
    if(!profile)return all;
    const phone=(profile.phone||"").replace(/\D/g,"");
    const email=(profile.email||"").toLowerCase();
    return all.filter(o=>{
      const samePhone=phone&&String(o.customerPhone||"").replace(/\D/g,"")===phone;
      const sameEmail=email&&String(o.customerEmail||"").toLowerCase()===email;
      const sameName=profile.name&&String(o.customer||"").toLowerCase()===profile.name.toLowerCase();
      return samePhone||sameEmail||sameName;
    });
  }
  function renderCustomerOrders(){
    const host=$("customerOrderList");if(!host)return;
    const profile=getProfile(),orders=currentCustomerOrders();
    $("ordersAccountLabel").textContent=profile?`Riwayat untuk ${profile.name}`:"Riwayat pesanan pada browser ini";
    host.innerHTML=orders.length?orders.slice(0,30).map(o=>{
      const [status,cls]=statusForCustomer(o);
      return `<article class="customer-order-card">
        <div class="customer-order-top"><div><b>${K24.esc(o.number)}</b><small>${K24.esc(o.date||"")}</small></div><span class="customer-order-status ${cls}">${status}</span></div>
        <div class="customer-order-items">${(o.items||[]).map(i=>`<span>${K24.esc(i.name)} × ${i.qty}</span>`).join("")}</div>
        <div class="customer-order-bottom"><span>${K24.esc(o.tableId||"Takeaway")} · ${K24.esc(o.orderType||"")}</span><b>${K24.money(o.total)}</b></div>
        <small class="customer-order-payment">Pembayaran: ${K24.esc(o.paymentStatus||"Menunggu")} ${o.paymentMethod?"· "+K24.esc(o.paymentMethod):""}</small>
      </article>`;
    }).join(""):'<div class="empty-customer-state">Belum ada riwayat pesanan. Pilih menu favoritmu untuk memulai pesanan pertama.</div>';
  }
  function renderAccount(){
    const profile=getProfile(),orders=currentCustomerOrders();
    if(profile){
      $("accountName").value=profile.name||"";
      $("accountEmail").value=profile.email||"";
      $("accountPhone").value=profile.phone||"";
      $("customerName").value=profile.name||$("customerName").value;
      $("accountDisplayName").textContent=profile.name||"Pelanggan Kopinan 24";
      $("accountDisplayContact").textContent=[profile.email,profile.phone].filter(Boolean).join(" · ")||"Profil pelanggan tersimpan";
      $("accountAvatar").textContent=(profile.name||"K").trim().charAt(0).toUpperCase();
    }else{
      $("accountDisplayName").textContent="Pelanggan Kopinan 24";
      $("accountDisplayContact").textContent="Lengkapi profil untuk menyimpan informasi pelanggan.";
      $("accountAvatar").textContent="K";
    }
    $("accountOrderCount").textContent=orders.length;
    $("accountPaidCount").textContent=orders.filter(o=>o.paymentStatus==="Lunas").length;
  }
  function saveCustomerProfile(event){
    event.preventDefault();
    const profile={
      name:$("accountName").value.trim(),
      email:$("accountEmail").value.trim(),
      phone:$("accountPhone").value.trim()
    };
    if(!profile.name){alert("Nama lengkap wajib diisi.");return}
    saveProfile(profile);
    renderAccount();renderCustomerOrders();
    K24.toast("Profil pelanggan berhasil disimpan.");
  }
  function visitCheckout(){
    const number=$("visitOrderNumber").value.trim();
    if(!number){alert("Masukkan nomor pesanan.");return}
    const orders=K24.getOrders(),tables=K24.getTables();
    const order=orders.find(x=>x.number.toLowerCase()===number.toLowerCase());
    if(!order){alert("Nomor pesanan tidak ditemukan.");return}
    if(!order.delivered){alert("Checkout kunjungan hanya bisa dilakukan setelah pesanan ditandai sudah diantar pelayan.");return}
    if(order.visitCheckout){alert("Pesanan ini sudah checkout kunjungan.");return}
    order.visitCheckout=true;
    if(order.tableId){const t=tables.find(x=>x.id===order.tableId);if(t&&t.orderId===order.id)t.status="cleaning"}
    K24.setOrders(orders);K24.setTables(tables);
    $("visitOrderNumber").value="";
    alert("Checkout kunjungan berhasil. Meja masuk antrean pembersihan.");
    renderAreas();renderCustomerOrders();renderAccount();
  }
  document.querySelectorAll(".filter-chip").forEach(b=>b.onclick=()=>{
    document.querySelectorAll(".filter-chip").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");filter=b.dataset.filter;renderMenu();
  });
  $("menuSearch").addEventListener("input",renderMenu);
  $("openCart").onclick=openCart;$("closeCart").onclick=closeCart;$("cartBackdrop").onclick=closeCart;
  $("submitOrder").onclick=submitOrder;$("visitCheckoutBtn").onclick=visitCheckout;
  document.querySelectorAll('input[name="customerPaymentMethod"]').forEach(input=>input.addEventListener("change",()=>{
    const note=$("customerPaymentNote");
    if(note)note.textContent=`Metode ${input.value} dipilih. Tekan Bayar Sekarang untuk menyelesaikan pembayaran simulasi.`;
  }));
  $("customerAccountForm").addEventListener("submit",saveCustomerProfile);
  $("refreshCustomerOrders").onclick=renderCustomerOrders;
  const savedProfile=getProfile();if(savedProfile?.name)$("customerName").value=savedProfile.name;
  $("orderType").addEventListener("change",()=>{if($("orderType").value==="Takeaway"){selectedTable="";$("selectedTableInput").value="";renderAreas()}});
  $("mobileNavToggle").onclick=()=>$("mainNav").classList.toggle("open");
  document.querySelectorAll("#mainNav a").forEach(a=>a.addEventListener("click",()=>$("mainNav").classList.remove("open")));
  window.addEventListener("storage",e=>{
    if([K24.KEYS.menu,K24.KEYS.tables,K24.KEYS.orders].includes(e.key)){renderMenu();renderAreas();renderCustomerOrders();renderAccount()}
  });
  window.addEventListener("k24:datachange",e=>{
    if([K24.KEYS.menu,K24.KEYS.tables,K24.KEYS.orders].includes(e.detail?.key)){renderMenu();renderAreas();renderCustomerOrders();renderAccount()}
  });
  renderMenu();renderCart();renderAreas();renderAccount();renderCustomerOrders();
})();

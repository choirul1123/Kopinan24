/* common.js - utilitas data localStorage dan format */
window.K24 = (() => {
  const KEYS = {
    menu:"k24_menu_responsive_v1",
    ingredients:"k24_ingredients_responsive_v1",
    tables:"k24_tables_responsive_v1",
    orders:"k24_orders_responsive_v1",
    movements:"k24_movements_responsive_v1",
    shift:"k24_active_shift_v1"
  };
  const clone = x => JSON.parse(JSON.stringify(x));
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : clone(fallback);
    } catch { return clone(fallback); }
  }
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("k24:datachange",{detail:{key}}));
  }
  function makeTables() {
    return window.KOPINAN_AREAS.flatMap(area =>
      Array.from({length:area.count},(_,i)=>({
        id:area.prefix+"-"+String(i+1).padStart(2,"0"),
        area:area.id,status:"kosong",orderId:null,customer:""
      }))
    );
  }
  function seed() {
    if (!localStorage.getItem(KEYS.menu)) write(KEYS.menu,window.KOPINAN_MENU);
    if (!localStorage.getItem(KEYS.ingredients)) write(KEYS.ingredients,window.KOPINAN_INGREDIENTS);
    if (!localStorage.getItem(KEYS.tables)) write(KEYS.tables,makeTables());
    if (!localStorage.getItem(KEYS.orders)) write(KEYS.orders,[]);
    if (!localStorage.getItem(KEYS.movements)) write(KEYS.movements,[]);
    if (!localStorage.getItem(KEYS.shift)) write(KEYS.shift,"2");
  }
  function getMenu(){return read(KEYS.menu,window.KOPINAN_MENU)}
  function getIngredients(){return read(KEYS.ingredients,window.KOPINAN_INGREDIENTS)}
  function getTables(){
    const current=read(KEYS.tables,makeTables());
    const known=new Set(current.map(t=>t.id));
    const additions=makeTables().filter(t=>!known.has(t.id));
    // Add new demo tables without overwriting statuses or active orders already stored.
    if(additions.length){const merged=[...current,...additions];write(KEYS.tables,merged);return merged;}
    return current;
  }
  function getOrders(){return read(KEYS.orders,[])}
  function getMovements(){return read(KEYS.movements,[])}
  function setMenu(v){write(KEYS.menu,v)}
  function setIngredients(v){write(KEYS.ingredients,v)}
  function setTables(v){write(KEYS.tables,v)}
  function setOrders(v){write(KEYS.orders,v)}
  function setMovements(v){write(KEYS.movements,v)}
  function setShift(v){write(KEYS.shift,String(v))}
  function money(v){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Math.round(Number(v)||0))}
  function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
  function todayKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`}
  function dateOf(order){const d=new Date(order.createdAt||order.date||"");return Number.isNaN(d.getTime())?null:d}
  function stockStatus(item){if(Number(item.stock)<=0)return "out";if(Number(item.stock)<=Number(item.minimum))return "low";return "safe"}
  function labelStatus(s){return ({kosong:"Kosong",dipesan:"Dipesan",terisi:"Terisi",cleaning:"Perlu dibersihkan"})[s]||s}
  function toast(message){
    let el=document.getElementById("toast");
    if(!el){el=document.createElement("div");el.id="toast";el.className="toast";document.body.appendChild(el)}
    el.textContent=message;el.classList.add("show");clearTimeout(el._timer);el._timer=setTimeout(()=>el.classList.remove("show"),1900);
  }
  function addMovement(type,ingredient,qty,note,shift){
    const movements=getMovements();
    movements.unshift({id:Date.now(),createdAt:new Date().toISOString(),type,ingredient,qty,note:note||"",shift:String(shift)});
    setMovements(movements);
  }
  seed();
  return {KEYS,read,write,getMenu,getIngredients,getTables,getOrders,getMovements,setMenu,setIngredients,setTables,setOrders,setMovements,getShift:()=>read(KEYS.shift,"2"),setShift,money,esc,todayKey,dateOf,stockStatus,labelStatus,toast,addMovement,makeTables};
})();

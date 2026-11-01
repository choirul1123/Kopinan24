/* Data awal Kopinan 24 - sesuaikan menu, harga, stok, dan bahan dengan data asli. */
window.KOPINAN_MENU = [
  {id:1,name:"Kopi Susu Klotok",category:"coffee",price:18000,description:"Kopi susu creamy khas Kopinan 24.",image:"assets/kopi-susu-klotok.jpg",stock:24},
  {id:2,name:"Cappuccino",category:"coffee",price:20000,description:"Espresso dengan susu dan foam lembut.",image:"assets/cappuccino.jpg",stock:20},
  {id:3,name:"Matcha Latte",category:"noncoffee",price:22000,description:"Matcha creamy dengan rasa khas.",image:"assets/matcha-latte.jpg",stock:18},
  {id:4,name:"Chocolate",category:"noncoffee",price:20000,description:"Minuman cokelat dengan rasa rich.",image:"assets/chocolate.jpg",stock:17},
  {id:5,name:"Wedang Susu",category:"noncoffee",price:17000,description:"Minuman susu hangat.",image:"assets/wedang-susu.jpg",stock:20},
  {id:6,name:"Wedang Lemon",category:"noncoffee",price:17000,description:"Minuman lemon hangat yang segar.",image:"assets/wedang-lemon.jpg",stock:20},
  {id:7,name:"Ropang Matcha",category:"food",price:18000,description:"Roti panggang dengan topping matcha.",image:"assets/ropang-matcha.jpg",stock:15},
  {id:8,name:"Ropang Tiramisu",category:"food",price:18000,description:"Roti panggang dengan rasa tiramisu.",image:"assets/ropang-tiramisu.jpg",stock:15},
  {id:9,name:"Chicken Hot Lava",category:"food",price:20000,description:"Ayam dengan sensasi pedas.",image:"assets/chicken-hot-lava.jpg",stock:15},
  {id:10,name:"French Fries",category:"food",price:18000,description:"Kentang goreng renyah.",image:"assets/french-fries.jpg",stock:20},
  {id:11,name:"Ricebowl Beef Sambal Matah",category:"food",price:25000,description:"Ricebowl beef dengan sambal matah.",image:"assets/ricebowl-beef.jpg",stock:15},
  {id:12,name:"Nasi Goreng Beef",category:"food",price:18000,description:"Nasi goreng beef.",image:"assets/nasi-goreng-beef.jpg",stock:15}
];

window.KOPINAN_INGREDIENTS = [
  {id:1,name:"Ayam Fillet",category:"Makanan",stock:2,unit:"kg",minimum:3},
  {id:2,name:"Daging Sapi",category:"Makanan",stock:5,unit:"kg",minimum:2},
  {id:3,name:"Keju Cheddar",category:"Makanan",stock:0.5,unit:"kg",minimum:1},
  {id:4,name:"Kentang",category:"Makanan",stock:8,unit:"kg",minimum:3},
  {id:5,name:"Beras",category:"Bahan Pokok",stock:10,unit:"kg",minimum:4},
  {id:6,name:"Susu UHT",category:"Bahan Minuman",stock:12,unit:"liter",minimum:4},
  {id:7,name:"Matcha Bubuk",category:"Bahan Minuman",stock:0.7,unit:"kg",minimum:1},
  {id:8,name:"Biji Kopi Arabika",category:"Bahan Minuman",stock:5,unit:"kg",minimum:2}
];

window.KOPINAN_AREAS = [
  {id:"indoor",name:"Indoor",prefix:"IN",count:10,description:"Area dalam ruangan"},
  {id:"middle",name:"Tengah",prefix:"TG",count:10,description:"Area tengah / semi terbuka"},
  {id:"lounge",name:"Nongkrong",prefix:"NG",count:10,description:"Area santai dan berkumpul"}
];

window.KOPINAN_SHIFTS = {
  "1":{name:"Shift 1 · Pagi",time:"07.00–15.00"},
  "2":{name:"Shift 2 · Sore",time:"15.00–23.00"},
  "3":{name:"Shift 3 · Malam",time:"23.00–07.00"}
};

window.KOPINAN_TAX_RATE = 0.10; // Tarif contoh prototipe. Sesuaikan dengan ketentuan pajak usaha.


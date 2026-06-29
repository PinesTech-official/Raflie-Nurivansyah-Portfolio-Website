export type PaymentMethod = "QR" | "Transfer Bank";
export type ShippingStatus = "Menunggu" | "Diproses" | "Dikirim" | "Tiba" | "Selesai";
export type ItemCondition = "Brand New" | "Like New" | "Used";
export type ItemCategory =
  | "Mens" | "Women" | "Clothes" | "Pants"
  | "Bags" | "Electronics" | "Miscellaneous";

export type FrameCount = 1 | 2 | 3 | 4 | 5 | 6;

/** One slot inside a photo frame */
export interface FrameSlot {
  positionKey: string;
  positionLabel: string;
  photo: string | null;
  price: number;
  quantity: number;
  // Per-item fields (each slot is one product)
  itemName?: string;
  condition?: ItemCondition;
  category?: ItemCategory;
  sizes?: SizeQty[];
}

/** Returns the slot template for a given frame count */
export function getFrameSlots(count: FrameCount): FrameSlot[] {
  const templates: Record<FrameCount, string[]> = {
    1: ["tengah"],
    2: ["kiri", "kanan"],
    3: ["kiri atas", "kanan atas", "bawah"],
    4: ["kiri atas", "kanan atas", "kiri bawah", "kanan bawah"],
    5: ["kiri atas", "kanan atas", "kiri bawah", "kanan bawah", "bawah"],
    6: ["kiri atas", "tengah atas", "kanan atas", "kiri bawah", "tengah bawah", "kanan bawah"],
  };
  return templates[count].map((k) => ({
    positionKey: k,
    positionLabel: k.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    photo: null,
    price: 0,
    quantity: 1,
  }));
}

export interface SizeQty {
  size: string;
  quantity: number;
}

export interface BuyerOrder {
  id: string;
  customerName: string;
  address: string;
  city: string;
  itemName: string;
  itemType: string;
  size: string;
  quantity: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  paymentProof?: string;
  notes: string;
  tracking: string;
  shippingService: string;
  shippingStatus: ShippingStatus;
  itemPhotos: string[];
  orderDate: string;
}

export interface SellerItem {
  id: string;
  customerName: string;
  address: string;
  itemName: string;
  itemType: string;
  size: string;
  quantity: number;
  sellingPrice: number;
  disbursed: boolean;
  submitDate: string;
  itemPhotos: string[];
  notes: string;
}

export interface MarketingItem {
  id: string;
  itemName: string;
  category: ItemCategory;
  condition: ItemCondition;
  sizes: SizeQty[];
  frameCount: FrameCount;
  frameSlots: FrameSlot[];
  description: string;
  uploadedAt: string;
  uploaded: boolean;
  totalQuantity: number;
}

export type ReturnReason =
  | "Barang Rusak / Damaged"
  | "Barang Salah / Wrong Item"
  | "Item Kurang / Missing Item"
  | "Kualitas Tidak Sesuai / Quality Issue"
  | "Lainnya / Other";

export interface ReturnRefundItem {
  id: string;
  orderId: string;
  customerName: string;
  itemName: string;
  reason: ReturnReason;
  description: string;
  photos: string[];
  videoProof: string | null;
  paymentProof: string | null;
  status: "Menunggu Review" | "Diproses" | "Disetujui" | "Ditolak";
  submittedAt: string;
  totalPrice: number;
}

export const returnRefundData: ReturnRefundItem[] = [
  {
    id: "REF-001",
    orderId: "ORD-004",
    customerName: "Rina Marlina",
    itemName: "Dress Batik",
    reason: "Kualitas Tidak Sesuai / Quality Issue",
    description: "Jahitan pada bagian kerah tidak rapi dan ada lubang kecil di bagian samping. Tidak sesuai dengan deskripsi produk.",
    photos: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop",
    ],
    videoProof: null,
    paymentProof: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop",
    status: "Menunggu Review",
    submittedAt: "2024-06-08",
    totalPrice: 275000,
  },
  {
    id: "REF-002",
    orderId: "ORD-002",
    customerName: "Sari Dewi",
    itemName: "Celana Jeans Levis",
    reason: "Barang Salah / Wrong Item",
    description: "Saya pesan ukuran 28 tapi yang datang ukuran 30. Tolong ditukar atau refund.",
    photos: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
    ],
    videoProof: null,
    paymentProof: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop",
    status: "Diproses",
    submittedAt: "2024-06-10",
    totalPrice: 320000,
  },
];

export interface ChatMessage {
  id: string;
  sender: "customer" | "admin";
  text: string;
  time: string;
  orderRef?: string;
  negotiationOffer?: number;
}

export interface ChatThread {
  id: string;
  customerName: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: ChatMessage[];
  threadType: "buyer" | "seller";
}

export const buyerOrders: BuyerOrder[] = [
  {
    id: "ORD-001",
    customerName: "Budi Santoso",
    address: "Jl. Merdeka No. 12, Kebayoran Baru, Jakarta Selatan 12110",
    city: "Jakarta Selatan",
    itemName: "Kemeja Flannel",
    itemType: "Atasan",
    size: "L",
    quantity: 2,
    totalPrice: 185000,
    paymentMethod: "Transfer Bank",
    paymentProof: "https://images.unsplash.com/photo-1612831455543-4a850a76e0a8?w=400&h=600&fit=crop",
    notes: "Tolong dikemas rapi, untuk hadiah",
    tracking: "JNE1234567890",
    shippingService: "JNE REG",
    shippingStatus: "Dikirim",
    itemPhotos: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=400&fit=crop",
    ],
    orderDate: "2024-06-10",
  },
  {
    id: "ORD-002",
    customerName: "Sari Dewi",
    address: "Jl. Gatot Subroto No. 45, Tebet, Jakarta Selatan 12890",
    city: "Jakarta Selatan",
    itemName: "Celana Jeans Levis",
    itemType: "Bawahan",
    size: "28",
    quantity: 1,
    totalPrice: 320000,
    paymentMethod: "QR",
    paymentProof: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop",
    notes: "Kondisi second hand ya kak",
    tracking: "SICEPAT9876543",
    shippingService: "SiCepat BEST",
    shippingStatus: "Tiba",
    itemPhotos: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop"],
    orderDate: "2024-06-09",
  },
  {
    id: "ORD-003",
    customerName: "Ahmad Fauzi",
    address: "Jl. Sudirman Kav. 7, Senayan, Jakarta Pusat 10270",
    city: "Jakarta Pusat",
    itemName: "Jaket Bomber",
    itemType: "Outerwear",
    size: "XL",
    quantity: 1,
    totalPrice: 450000,
    paymentMethod: "Transfer Bank",
    paymentProof: "https://images.unsplash.com/photo-1612831455543-4a850a76e0a8?w=400&h=600&fit=crop",
    notes: "-",
    tracking: "JNTEX1122334455",
    shippingService: "J&T Express",
    shippingStatus: "Diproses",
    itemPhotos: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop"],
    orderDate: "2024-06-11",
  },
  {
    id: "ORD-004",
    customerName: "Rina Marlina",
    address: "Jl. Ahmad Yani No. 88, Bekasi Timur, Kota Bekasi 17113",
    city: "Bekasi",
    itemName: "Dress Batik",
    itemType: "Dress",
    size: "M",
    quantity: 1,
    totalPrice: 275000,
    paymentMethod: "QR",
    paymentProof: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop",
    notes: "Minta foto detail jahitan sebelum kirim",
    tracking: "POSIND5566778899",
    shippingService: "Pos Indonesia",
    shippingStatus: "Selesai",
    itemPhotos: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop"],
    orderDate: "2024-06-07",
  },
  {
    id: "ORD-005",
    customerName: "Denny Pratama",
    address: "Jl. Raya Bogor Km.25, Cimanggis, Depok 16452",
    city: "Depok",
    itemName: "Sneakers Nike Air Max",
    itemType: "Sepatu",
    size: "42",
    quantity: 1,
    totalPrice: 890000,
    paymentMethod: "Transfer Bank",
    paymentProof: "https://images.unsplash.com/photo-1612831455543-4a850a76e0a8?w=400&h=600&fit=crop",
    notes: "Cek sole masih bagus tidak",
    tracking: "-",
    shippingService: "JNE YES",
    shippingStatus: "Menunggu",
    itemPhotos: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"],
    orderDate: "2024-06-12",
  },
  {
    id: "ORD-006",
    customerName: "Fitri Handayani",
    address: "Jl. Pahlawan No. 3, Ngagel, Surabaya 60246",
    city: "Surabaya",
    itemName: "Blouse Vintage",
    itemType: "Atasan",
    size: "S",
    quantity: 2,
    totalPrice: 140000,
    paymentMethod: "QR",
    paymentProof: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop",
    notes: "-",
    tracking: "JNE4455667788",
    shippingService: "JNE REG",
    shippingStatus: "Selesai",
    itemPhotos: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop"],
    orderDate: "2024-05-28",
  },
];

export const sellerItems: SellerItem[] = [
  {
    id: "SELL-001",
    customerName: "Hendra Wijaya",
    address: "Jl. Veteran No. 5, Bintaro, Tangerang Selatan 15225",
    itemName: "Kemeja Oxford Vintage",
    itemType: "Atasan",
    size: "M",
    quantity: 3,
    sellingPrice: 120000,
    disbursed: true,
    submitDate: "2024-06-05",
    itemPhotos: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=400&fit=crop",
    ],
    notes: "Kondisi baik, ada sedikit noda kecil di kerah",
  },
  {
    id: "SELL-002",
    customerName: "Putri Amelia",
    address: "Jl. Dago No. 22, Coblong, Bandung 40135",
    itemName: "Rok Midi Floral",
    itemType: "Bawahan",
    size: "S",
    quantity: 2,
    sellingPrice: 85000,
    disbursed: true,
    submitDate: "2024-06-06",
    itemPhotos: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop"],
    notes: "Masih bagus, jarang dipakai",
  },
  {
    id: "SELL-003",
    customerName: "Rizky Firmansyah",
    address: "Jl. Pemuda No. 100, Semarang Tengah 50132",
    itemName: "Sepatu Boots Kulit",
    itemType: "Sepatu",
    size: "41",
    quantity: 1,
    sellingPrice: 350000,
    disbursed: false,
    submitDate: "2024-06-08",
    itemPhotos: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"],
    notes: "Kulit asli, kondisi like new",
  },
  {
    id: "SELL-004",
    customerName: "Mega Kartika",
    address: "Jl. Malioboro No. 15, Gedongtengen, Yogyakarta 55271",
    itemName: "Tas Selempang Kulit",
    itemType: "Aksesoris",
    size: "One Size",
    quantity: 1,
    sellingPrice: 200000,
    disbursed: false,
    submitDate: "2024-06-09",
    itemPhotos: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop"],
    notes: "Original brand, ada dustbag",
  },
  {
    id: "SELL-005",
    customerName: "Bagas Nugroho",
    address: "Jl. Rungkut Industri No. 7, Rungkut, Surabaya 60293",
    itemName: "Celana Cargo Army",
    itemType: "Bawahan",
    size: "32",
    quantity: 2,
    sellingPrice: 95000,
    disbursed: false,
    submitDate: "2024-06-10",
    itemPhotos: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop"],
    notes: "Bekas dipakai beberapa kali",
  },
];

function generateDailyData(): TransactionDay[] {
  const days: TransactionDay[] = [];
  const today = new Date(2024, 5, 12);
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const label = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    const seed = i * 7 + d.getDay();
    const pembelian = Math.round(((Math.sin(seed) + 1.4) * 280000) / 1000) * 1000;
    const penjualan = Math.round(((Math.cos(seed * 1.3) + 1.2) * 180000) / 1000) * 1000;
    days.push({
      date: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      fullDate: label,
      rawDate: d.toISOString().split("T")[0],
      pembelian,
      penjualan,
      pembelianItems: Math.floor(pembelian / 120000) + 1,
      penjualanItems: Math.floor(penjualan / 90000) + 1,
    });
  }
  return days;
}

export interface TransactionDay {
  date: string;
  fullDate: string;
  rawDate: string;
  pembelian: number;
  penjualan: number;
  pembelianItems: number;
  penjualanItems: number;
}

export const allTransactionData: TransactionDay[] = generateDailyData();

export const buyerChatThreads: ChatThread[] = [
  {
    id: "CHT-B1", threadType: "buyer",
    customerName: "Budi Santoso", avatar: "BS",
    lastMessage: "Kak, orderan saya sudah dikirim belum?", lastTime: "10:32", unread: 2,
    messages: [
      { id: "m1", sender: "customer", text: "Halo kak, mau tanya orderan saya ORD-001 sudah diproses belum ya?", time: "10:15", orderRef: "ORD-001" },
      { id: "m2", sender: "admin", text: "Halo Kak Budi! Orderan ORD-001 sudah kami proses dan sedang dalam perjalanan ya kak 😊", time: "10:20" },
      { id: "m3", sender: "customer", text: "Kak, orderan saya sudah dikirim belum?", time: "10:32" },
    ],
  },
  {
    id: "CHT-B2", threadType: "buyer",
    customerName: "Sari Dewi", avatar: "SD",
    lastMessage: "Oke kak makasih infonya!", lastTime: "09:15", unread: 0,
    messages: [
      { id: "m1", sender: "customer", text: "Kak mau nanya, celana jeans ORD-002 ukuran 28 masih available kan?", time: "08:55", orderRef: "ORD-002" },
      { id: "m2", sender: "admin", text: "Masih available Kak Sari! Kondisinya masih bagus, ada fading natural yang memberikan kesan vintage 👖", time: "09:00" },
      { id: "m3", sender: "customer", text: "Wah sip kak! Oke lanjut aja ya ordernya", time: "09:10" },
      { id: "m4", sender: "admin", text: "Siap Kak! Sudah kami konfirmasi. Nanti kami update resi pengirimannya ya 🚚", time: "09:12" },
      { id: "m5", sender: "customer", text: "Oke kak makasih infonya!", time: "09:15" },
    ],
  },
  {
    id: "CHT-B3", threadType: "buyer",
    customerName: "Denny Pratama", avatar: "DP",
    lastMessage: "Oke ditunggu ya kak", lastTime: "Kemarin", unread: 1,
    messages: [
      { id: "m1", sender: "customer", text: "Kak bisa kirim foto detail sole sneakers ORD-005 dulu sebelum bayar?", time: "Kemarin 14:00", orderRef: "ORD-005" },
      { id: "m2", sender: "admin", text: "Bisa Kak Denny! Sebentar kami foto dulu ya", time: "Kemarin 14:05" },
      { id: "m3", sender: "customer", text: "Oke ditunggu ya kak", time: "Kemarin 14:06" },
    ],
  },
];

export const sellerChatThreads: ChatThread[] = [
  {
    id: "CHT-S1", threadType: "seller",
    customerName: "Hendra Wijaya", avatar: "HW",
    lastMessage: "Kapan dana saya bisa cair kak?", lastTime: "11:00", unread: 1,
    messages: [
      { id: "m1", sender: "customer", text: "Kak mau nanya soal SELL-001 kemeja oxford yang saya titip, sudah ada yang beli belum?", time: "10:45", orderRef: "SELL-001" },
      { id: "m2", sender: "admin", text: "Halo Kak Hendra! Kemeja Oxfordnya sudah terjual semua ya kak 🎉 Proses pencairan sedang kami siapkan", time: "10:52" },
      { id: "m3", sender: "customer", text: "Kapan dana saya bisa cair kak?", time: "11:00" },
    ],
  },
  {
    id: "CHT-S2", threadType: "seller",
    customerName: "Rizky Firmansyah", avatar: "RF",
    lastMessage: "Siap kak, saya tunggu", lastTime: "09:30", unread: 0,
    messages: [
      { id: "m1", sender: "customer", text: "Kak, sepatu boots SELL-003 sudah diterima tim toko?", time: "09:15", orderRef: "SELL-003" },
      { id: "m2", sender: "admin", text: "Sudah Kak Rizky! Kondisinya bagus banget. Kami sedang foto untuk upload ke platform 📸", time: "09:22" },
      { id: "m3", sender: "customer", text: "Berapa harga yang bisa ditawar kak untuk sepatu ini?", time: "09:28" },
      { id: "m4", sender: "admin", text: "Kita coba nego ya kak. Harga awal Rp 350.000, bisa kami usulkan ke owner.", time: "09:29" },
      { id: "m5", sender: "customer", text: "Siap kak, saya tunggu", time: "09:30" },
    ],
  },
];

export const marketingItems: MarketingItem[] = [
  {
    id: "MKT-001",
    itemName: "Frame Mix Kemeja Flannel",
    category: "Clothes",
    condition: "Like New",
    sizes: [{ size: "M", quantity: 2 }, { size: "L", quantity: 1 }],
    frameCount: 4,
    frameSlots: [
      { positionKey: "kiri atas", positionLabel: "Kiri Atas", photo: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&h=300&fit=crop", price: 185000, quantity: 1 },
      { positionKey: "kanan atas", positionLabel: "Kanan Atas", photo: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=300&h=300&fit=crop", price: 165000, quantity: 2 },
      { positionKey: "kiri bawah", positionLabel: "Kiri Bawah", photo: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop", price: 145000, quantity: 1 },
      { positionKey: "kanan bawah", positionLabel: "Kanan Bawah", photo: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop", price: 195000, quantity: 3 },
    ],
    description: "Koleksi kemeja flannel vintage pilihan. Pilih sesuai posisi yang kamu inginkan!",
    uploadedAt: "2024-06-10",
    uploaded: true,
    totalQuantity: 7,
  },
  {
    id: "MKT-002",
    itemName: "Celana Jeans Levis 501",
    category: "Pants",
    condition: "Used",
    sizes: [{ size: "28", quantity: 1 }, { size: "30", quantity: 2 }],
    frameCount: 2,
    frameSlots: [
      { positionKey: "kiri", positionLabel: "Kiri", photo: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop", price: 320000, quantity: 1 },
      { positionKey: "kanan", positionLabel: "Kanan", photo: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=400&fit=crop", price: 285000, quantity: 2 },
    ],
    description: "Levis 501 original, fading alami yang memberikan karakter vintage.",
    uploadedAt: "2024-06-09",
    uploaded: true,
    totalQuantity: 3,
  },
  {
    id: "MKT-003",
    itemName: "Tas Kulit Vintage",
    category: "Bags",
    condition: "Like New",
    sizes: [{ size: "One Size", quantity: 3 }],
    frameCount: 1,
    frameSlots: [
      { positionKey: "tengah", positionLabel: "Tengah", photo: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop", price: 520000, quantity: 3 },
    ],
    description: "Tas kulit genuine, warna coklat klasik. Ada dustbag original.",
    uploadedAt: "2024-06-08",
    uploaded: false,
    totalQuantity: 3,
  },
];

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown, ArrowRight, Check, Facebook, MapPin, Menu,
  MessageCircle, Minus, Plus, ShoppingBag, Shirt, Trash2, X,
} from "lucide-react";
import { products } from "./data/products";
import { CheckoutField as Field } from "./components/CheckoutField";
import {
  ADDRESS, BRAND_NAME, DELIVERY_INSIDE_DHAKA, DELIVERY_OUTSIDE_DHAKA,
  FACEBOOK_URL, TAGLINE, WHATSAPP_DISPLAY, WHATSAPP_NUMBER,
} from "./config";

type Product = (typeof products)[number];
type CartLine = { productId: string; size: string; qty: number };
type Customer = { name: string; phone: string; address: string };
const money = (amount: number) => `৳${amount.toLocaleString("en-BD")}`;

function App() {
  const [cart, setCart] = useState<CartLine[]>(() => {
    try { return JSON.parse(localStorage.getItem("hanger-cart") || "[]"); } catch { return []; }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [category, setCategory] = useState("All pieces");
  const [maxPrice, setMaxPrice] = useState(2500);
  const [filterSize, setFilterSize] = useState("Any size");
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "", address: "" });
  const [deliveryArea, setDeliveryArea] = useState<"Inside Dhaka" | "Outside Dhaka">("Inside Dhaka");
  const [payment, setPayment] = useState<"COD" | "WhatsApp">("COD");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [sizeErrors, setSizeErrors] = useState<Record<string, boolean>>({});

  useEffect(() => { localStorage.setItem("hanger-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    document.title = "HANGER | Style That Hangs Different";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
    meta.setAttribute("content", "Considered casual shirts and polos, made for the Dhaka day. Shop premium fabrics from HANGER.");
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const visibleProducts = useMemo(() => products.filter((product: Product) =>
    (category === "All pieces" || product.category === category) &&
    product.price <= maxPrice &&
    (filterSize === "Any size" || product.sizes.includes(filterSize))
  ), [category, maxPrice, filterSize]);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((entry: Product) => entry.id === item.productId);
    return sum + (product?.price ?? 0) * item.qty;
  }, 0);
  const delivery = deliveryArea === "Inside Dhaka" ? DELIVERY_INSIDE_DHAKA : DELIVERY_OUTSIDE_DHAKA;
  const total = subtotal + (cart.length ? delivery : 0);
  const cartDetails = cart.map((line) => ({
    ...line,
    product: products.find((product: Product) => product.id === line.productId)!,
  }));

  const addToCart = (product: Product) => {
    const size = selectedSizes[product.id];
    if (!size) { setSizeErrors((prev) => ({ ...prev, [product.id]: true })); return; }
    setSizeErrors((prev) => ({ ...prev, [product.id]: false }));
    setCart((prev) => {
      const existing = prev.find((line) => line.productId === product.id && line.size === size);
      return existing
        ? prev.map((line) => line.productId === product.id && line.size === size ? { ...line, qty: line.qty + 1 } : line)
        : [...prev, { productId: product.id, size, qty: 1 }];
    });
    setNotice("Added to cart");
  };
  const quickBuy = (product: Product) => {
    const size = selectedSizes[product.id];
    if (!size) { setSizeErrors((prev) => ({ ...prev, [product.id]: true })); return; }
    setSizeErrors((prev) => ({ ...prev, [product.id]: false }));
    const message = `Hello HANGER! I want to order: ${product.name}, Size: ${size}, Price: ৳${product.price.toLocaleString("en-BD")}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };
  const changeQty = (line: CartLine, delta: number) => setCart((prev) => prev.map((item) =>
    item.productId === line.productId && item.size === line.size ? { ...item, qty: item.qty + delta } : item
  ).filter((item) => item.qty > 0));
  const removeLine = (line: CartLine) => setCart((prev) => prev.filter((item) =>
    !(item.productId === line.productId && item.size === line.size)
  ));
  const clearFilters = () => { setCategory("All pieces"); setMaxPrice(2500); setFilterSize("Any size"); };
  const validateCheckout = () => {
    const next: Record<string, string> = {};
    if (customer.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!/^01\d{9}$/.test(customer.phone.trim())) next.phone = "Use a valid 11-digit number, e.g. 01712345678.";
    if (customer.address.trim().length < 8) next.address = "Please enter your full delivery address.";
    setErrors(next);
    if (!cart.length) return false;
    if (Object.keys(next).length) return false;
    setConfirmationOpen(true);
    return true;
  };
  const orderText = () => {
    const items = cartDetails.map((line, index) =>
      `${index + 1}. ${line.product.name} | Size: ${line.size} | Qty: ${line.qty} | ৳${(line.product.price * line.qty).toLocaleString("en-BD")}`
    ).join("\n");
    return `🛍️ *New Order - HANGER*\n👤 Name: ${customer.name.trim()}\n📞 Phone: ${customer.phone.trim()}\n📍 Address: ${customer.address.trim()}\n🚚 Delivery: ${deliveryArea} (৳${delivery})\n💳 Payment: ${payment}\n*Items:*\n${items}\n💰 *Total: ৳${total.toLocaleString("en-BD")}*`;
  };
  const submitOrder = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderText())}`, "_blank", "noopener,noreferrer");
    setCart([]);
    setConfirmationOpen(false);
    setDrawerOpen(false);
    setCustomer({ name: "", phone: "", address: "" });
    setNotice("Order details ready in WhatsApp");
  };
  const jumpTo = (id: string) => { setMobileOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <div className="bg-[#E10600] px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[.2em] text-white sm:text-[11px]">
        Dhaka delivery from ৳70 <span className="mx-2 opacity-50">/</span> Outside Dhaka ৳130
      </div>
      <header className="sticky top-0 z-40 border-b border-white/[.08] bg-[#0b0b0b]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between px-4 sm:px-7 lg:px-10">
          <a href="#home" className="flex shrink-0 items-center gap-3" aria-label="HANGER home">
            <img src="/hanger-logo.jpg" alt="HANGER" className="h-11 w-11 rounded-full object-cover ring-1 ring-white/15" />
            <span className="block">
              <span className="display-font block text-[12px] font-extrabold tracking-[.16em] sm:text-[14px] sm:tracking-[.18em]">HANGER</span>
              <span className="mt-0.5 block whitespace-nowrap text-[6px] font-semibold tracking-[.11em] text-[#9A9A9A] sm:text-[8px] sm:tracking-[.17em]">{TAGLINE}</span>
            </span>
          </a>
          <nav className="hidden items-center gap-8 lg:flex">
            {[["Home", "home"], ["Shirts", "shirts"], ["T-Shirts / Polo", "polos"], ["About Us", "about"], ["Contact Us", "contact"]].map(([label, id]) =>
              <a key={id} href={`#${id}`} className="text-[12px] font-medium text-white/65 transition hover:text-white">{label}</a>
            )}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-full border border-[#2ebd66]/40 px-4 py-2.5 text-[11px] font-semibold text-[#61dc8c] transition hover:bg-[#1b6639]/20 md:flex">
              <MessageCircle size={15} /> Order on WhatsApp
            </a>
            <button onClick={() => setDrawerOpen(true)} data-testid="button-open-cart" aria-label={`Open cart, ${itemCount} items`} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition hover:border-[#E10600]/60 hover:text-[#ff514c]">
              <ShoppingBag size={18} />
              {itemCount > 0 && <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#E10600] px-1 text-[9px] font-bold">{itemCount}</span>}
            </button>
            <button onClick={() => setMobileOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 lg:hidden" aria-label="Toggle menu">
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
        {mobileOpen && <div className="border-t border-white/10 bg-[#111] px-5 py-4 lg:hidden">
          <div className="mx-auto grid max-w-[1380px] gap-1">
            {[["Home", "home"], ["Shirts", "shirts"], ["T-Shirts / Polo", "polos"], ["About Us", "about"], ["Contact Us", "contact"]].map(([label, id]) =>
              <button key={id} onClick={() => jumpTo(id)} className="py-3 text-left text-sm text-white/75">{label}</button>
            )}
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 border-t border-white/10 py-4 text-sm font-semibold text-[#61dc8c]"><MessageCircle size={17} /> Order on WhatsApp</a>
          </div>
        </div>}
      </header>

      <main>
        <section id="home" className="relative isolate overflow-hidden border-b border-white/[.06]">
          <div className="absolute -right-44 top-10 -z-10 h-[500px] w-[500px] rounded-full bg-[#E10600]/[.08] blur-[100px]" />
          <div className="mx-auto grid min-h-[610px] max-w-[1380px] items-center gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.08fr_.92fr] md:py-20 lg:px-12">
            <div className="fade-up relative z-10">
              <div className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.23em] text-[#E10600]">
                <span className="h-px w-8 bg-[#E10600]" /> Dhaka, Bangladesh <span className="text-white/30">—</span> Everyday, considered
              </div>
              <h1 className="display-font max-w-[720px] text-[clamp(3.4rem,8vw,7.6rem)] font-extrabold leading-[.91] tracking-[-.075em]">
                Elevate Your<br /><span className="text-white/45">Style with</span><br /><span className="text-[#E10600]">HANGER</span>
              </h1>
              <p className="mt-7 max-w-[390px] text-[14px] leading-7 text-[#9A9A9A] sm:text-[15px]">
                Good fabric. A better fit. Pieces that feel right from the first wear — made for your everyday.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#shirts" className="group inline-flex items-center gap-3 rounded-full bg-[#E10600] px-6 py-3.5 text-[12px] font-bold transition hover:bg-[#bd0803]">
                  Shop Shirts <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                </a>
                <a href="#polos" className="inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-3.5 text-[12px] font-semibold transition hover:border-white/50">
                  Shop T-Shirts / Polos
                </a>
              </div>
              <div className="mt-12 flex items-center gap-5 text-[10px] uppercase tracking-[.15em] text-white/45">
                <span>Premium fabric</span><span className="h-1 w-1 rounded-full bg-[#E10600]" /><span>Made for Dhaka</span>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[510px] md:justify-self-end">
              <div className="absolute -inset-3 rotate-2 rounded-[2rem] border border-white/[.07]" />
              <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#171717]">
                <img src="/products/blue-check.jpg" alt="Blue check premium casual shirt" className="h-[370px] w-full object-cover object-center sm:h-[470px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/0 to-black/5" />
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-6 sm:p-8">
                  <div><p className="text-[9px] font-bold uppercase tracking-[.23em] text-white/60">HANGER essentials</p><p className="display-font mt-2 text-xl font-bold">Everyday, elevated.</p></div>
                  <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/30"><ArrowDown size={16} /></span>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-white/10 bg-[#141414] px-4 py-3 shadow-2xl sm:block">
                <span className="text-[9px] uppercase tracking-[.18em] text-[#9A9A9A]">Premium shirts</span>
                <p className="display-font mt-1 text-sm font-bold">৳2,140 <span className="ml-1 text-[10px] font-normal text-white/40">each</span></p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-px w-[42%] bg-gradient-to-r from-[#E10600]/70 to-transparent" />
        </section>

        <section id="shirts" className="mx-auto max-w-[1380px] scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[.24em] text-[#E10600]">The collection / 01</p>
              <h2 className="display-font text-3xl font-bold tracking-[-.04em] sm:text-4xl">Considered classics.</h2>
              <p className="mt-3 max-w-[500px] text-sm leading-6 text-[#9A9A9A]">Casual full shirts in Indian premium fabric. Easy to wear, hard to forget.</p>
            </div>
              <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/35">{products.filter((p: Product) => p.category === "Casual Full Shirts (Premium Fabrics)").length} pieces / season 01</span>
          </div>
          <div className="mb-8 rounded-2xl border border-white/[.08] bg-[#111] p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  ["All pieces", "All pieces"],
                  ["Casual Full Shirts", "Casual Full Shirts (Premium Fabrics)"],
                  ["Stripe Polo T-Shirts", "Stripe Polo T-Shirts (China Fabrics)"],
                ].map(([label, value]) =>
                  <button key={value} onClick={() => setCategory(value)} className={`rounded-full px-4 py-2 text-[11px] font-semibold transition ${category === value ? "bg-white text-black" : "border border-white/10 text-white/55 hover:border-white/30 hover:text-white"}`}>{label}</button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <label className="flex items-center gap-3 text-[10px] uppercase tracking-[.12em] text-white/55">
                  Size
                  <select value={filterSize} onChange={(event) => setFilterSize(event.target.value)} className="rounded-lg border border-white/10 bg-[#191919] px-3 py-2 text-[11px] normal-case tracking-normal text-white outline-none focus:border-[#E10600]">
                    {["Any size", "M", "L", "XL"].map((size) => <option key={size}>{size}</option>)}
                  </select>
                </label>
                <label className="flex min-w-[190px] items-center gap-3 text-[10px] uppercase tracking-[.12em] text-white/55">
                  Up to {money(maxPrice)}
                  <input aria-label="Maximum price" type="range" min="1250" max="2500" step="10" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} className="h-1 w-24 accent-[#E10600]" />
                </label>
                <button onClick={clearFilters} className="text-[10px] font-semibold text-white/50 underline underline-offset-4 transition hover:text-white">Clear filters</button>
              </div>
            </div>
          </div>
          <div id="polos" className="scroll-mt-24" />
          {visibleProducts.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {visibleProducts.map((product: Product, index: number) => <article key={product.id} className="group overflow-hidden rounded-2xl border border-white/[.09] bg-[#141414] transition duration-300 hover:-translate-y-1 hover:border-[#E10600]/45 hover:shadow-[0_16px_48px_rgba(225,6,0,.09)]" style={{ animationDelay: `${index * 70}ms` }}>
              <div className="relative overflow-hidden bg-[#202020]">
                <img src={product.image} alt={product.name} loading="lazy" className="h-[310px] w-full object-cover transition duration-500 group-hover:scale-[1.035] sm:h-[340px]" />
                <span className="absolute left-3 top-3 rounded-full border border-black/10 bg-[#0b0b0b]/85 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[.12em] text-white/80 backdrop-blur">{product.category === "Casual Full Shirts (Premium Fabrics)" ? "Casual shirt" : "Polo"}</span>
                <span className="absolute bottom-3 right-3 rounded-full bg-[#0b0b0b]/85 px-3 py-1.5 text-[9px] font-semibold text-white/80 backdrop-blur">{product.fabric}</span>
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="line-clamp-2 min-h-[42px] text-[14px] font-semibold leading-[1.5]">{product.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <p className="display-font text-lg font-extrabold">{money(product.price)}</p>
                  <div className="flex gap-1.5">{product.sizes.map((size: string) => <span key={size} className="flex h-7 min-w-7 items-center justify-center rounded-md border border-white/10 px-1.5 text-[9px] font-semibold text-white/55">{size}</span>)}</div>
                </div>
                <div className="mt-4">
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[.14em] text-white/40">Select your size</p>
                  <div className="flex gap-2">
                    {product.sizes.map((size: string) => <button key={size} onClick={() => { setSelectedSizes((prev) => ({ ...prev, [product.id]: size })); setSizeErrors((prev) => ({ ...prev, [product.id]: false })); }} aria-pressed={selectedSizes[product.id] === size} className={`h-9 flex-1 rounded-lg border text-[11px] font-semibold transition ${selectedSizes[product.id] === size ? "border-[#E10600] bg-[#E10600]/15 text-white" : "border-white/10 text-white/65 hover:border-white/35"}`}>{size}</button>)}
                  </div>
                  {sizeErrors[product.id] && <p className="mt-2 text-[10px] text-[#ff6b67]">Please select a size first.</p>}
                </div>
                <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                  <button onClick={() => addToCart(product)} className="flex items-center justify-center gap-2 rounded-lg bg-[#E10600] px-3 py-3 text-[10px] font-bold transition hover:bg-[#bd0803]"><ShoppingBag size={14} /> Add to Cart</button>
                  <button onClick={() => quickBuy(product)} aria-label={`Quick buy ${product.name} on WhatsApp`} className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#2ebd66]/35 text-[#61dc8c] transition hover:bg-[#1b6639]/20"><MessageCircle size={17} /></button>
                </div>
                <button onClick={() => quickBuy(product)} className="mt-2 w-full py-1 text-[10px] font-semibold text-white/45 transition hover:text-white">Quick Buy via WhatsApp</button>
              </div>
            </article>)}
          </div> : <div className="rounded-2xl border border-dashed border-white/15 bg-[#111] px-6 py-16 text-center">
            <Shirt className="mx-auto text-white/35" size={28} />
            <h3 className="display-font mt-4 text-lg font-bold">Nothing in this fit.</h3>
            <p className="mt-2 text-sm text-[#9A9A9A]">Try a wider price range or clear your filters.</p>
            <button onClick={clearFilters} className="mt-5 rounded-full border border-white/20 px-5 py-2.5 text-[11px] font-semibold hover:border-[#E10600]">Clear filters</button>
          </div>}
        </section>

        <section className="relative overflow-hidden border-y border-white/[.07] bg-[#121212]">
          <div className="absolute -right-20 top-[-120px] h-[380px] w-[380px] rounded-full border border-white/[.04]" />
          <div className="absolute -right-4 top-[-60px] h-[260px] w-[260px] rounded-full border border-[#E10600]/10" />
          <div className="mx-auto grid max-w-[1380px] gap-8 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[1fr_auto] md:items-center lg:px-12">
            <div><p className="mb-3 text-[10px] font-bold uppercase tracking-[.22em] text-[#E10600]">The HANGER point of view</p><h2 className="display-font max-w-[660px] text-3xl font-bold leading-tight tracking-[-.04em] sm:text-4xl">Good clothes should feel like you.</h2><p className="mt-4 max-w-[600px] text-sm leading-7 text-[#9A9A9A]">HANGER is a Dhaka-based men's clothing brand built around considered everyday style. We choose quality fabrics and clean, wearable designs — the pieces you reach for again and again.</p></div>
            <a href="#shirts" className="inline-flex w-fit items-center gap-3 rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold transition hover:border-[#E10600]">Find your everyday <ArrowRight size={14} /></a>
          </div>
        </section>

        <section id="about" className="mx-auto grid max-w-[1380px] gap-12 px-5 py-20 sm:px-8 md:grid-cols-[.7fr_1.3fr] md:py-24 lg:px-12">
          <div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#E10600]">About HANGER</p><h2 className="display-font mt-4 text-3xl font-bold tracking-[-.04em] sm:text-4xl">Made to be<br />worn on repeat.</h2></div>
          <div className="max-w-[650px] border-l border-[#E10600]/45 pl-6 sm:pl-9">
            <p className="text-[15px] leading-8 text-white/75">We believe style should feel effortless. HANGER brings thoughtful fabrics and timeless casual silhouettes together for the way men in Dhaka live, move and show up every day.</p>
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
              <div><span className="text-[9px] uppercase tracking-[.18em] text-white/40">Our focus</span><p className="mt-2 text-sm font-semibold">Fabric first. Fit always.</p></div>
              <div><span className="text-[9px] uppercase tracking-[.18em] text-white/40">From</span><p className="mt-2 text-sm font-semibold">Dhaka, Bangladesh</p></div>
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-white/[.07] bg-[#121212]">
          <div className="mx-auto grid max-w-[1380px] gap-9 px-5 py-16 sm:px-8 md:grid-cols-[1fr_1fr] md:py-20 lg:px-12">
            <div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#E10600]">Come say hello</p><h2 className="display-font mt-4 text-3xl font-bold tracking-[-.04em]">We’re right here.</h2><p className="mt-3 max-w-[390px] text-sm leading-6 text-[#9A9A9A]">Questions about sizing, delivery or a piece you have your eye on? Talk to a real person in Dhaka.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <a href="https://maps.google.com/?q=Alom+Tower+Dhaka" target="_blank" rel="noreferrer" className="group rounded-xl border border-white/10 bg-[#171717] p-5 transition hover:border-[#E10600]/40">
                <MapPin size={18} className="text-[#E10600]" /><p className="mt-4 text-[9px] font-bold uppercase tracking-[.17em] text-white/45">Visit the store</p><p className="mt-2 text-[12px] leading-5 text-white/80">{ADDRESS}</p><span className="mt-4 inline-block text-[10px] font-semibold text-white/50 group-hover:text-white">Get directions ↗</span>
              </a>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="group rounded-xl border border-white/10 bg-[#171717] p-5 transition hover:border-[#2ebd66]/40">
                <MessageCircle size={18} className="text-[#61dc8c]" /><p className="mt-4 text-[9px] font-bold uppercase tracking-[.17em] text-white/45">WhatsApp us</p><p className="mt-2 text-[12px] font-semibold">{WHATSAPP_DISPLAY}</p><span className="mt-4 inline-block text-[10px] font-semibold text-[#61dc8c]">Start a conversation ↗</span>
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="group rounded-xl border border-white/10 bg-[#171717] p-5 transition hover:border-white/25 sm:col-span-2">
                <Facebook size={18} className="text-white/75" /><p className="mt-3 text-[9px] font-bold uppercase tracking-[.17em] text-white/45">Follow along</p><p className="mt-1 text-[12px] font-semibold">HANGER on Facebook</p>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#080808]">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-8 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <a href="#home" className="flex items-center gap-3"><img src="/hanger-logo.jpg" alt="HANGER brand mark" className="h-10 w-10 rounded-full object-cover" /><span><span className="display-font block text-[12px] font-extrabold tracking-[.18em]">HANGER</span><span className="mt-1 block text-[8px] tracking-[.15em] text-white/40">{TAGLINE}</span></span></a>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-white/50"><a href="#shirts" className="hover:text-white">Shop shirts</a><a href="#polos" className="hover:text-white">Shop polos</a><a href="#about" className="hover:text-white">About</a><a href="#contact" className="hover:text-white">Contact</a></div>
          <p className="text-[10px] text-white/35">© 2026 HANGER. All rights reserved.</p>
        </div>
      </footer>

      <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" aria-label="Chat with HANGER on WhatsApp" className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#20b75a] text-white shadow-[0_8px_30px_rgba(32,183,90,.25)] transition hover:scale-105 sm:bottom-7 sm:right-7"><MessageCircle size={22} /></a>

      {notice && <div role="status" data-testid="status-notice" className="fade-up fixed bottom-[78px] left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#1a1a1a] px-5 py-3 text-[12px] font-semibold shadow-2xl sm:bottom-8"><Check size={15} className="text-[#61dc8c]" />{notice}</div>}

      {drawerOpen && <div className="fixed inset-0 z-50">
        <button aria-label="Close cart overlay" onClick={() => setDrawerOpen(false)} className="drawer-backdrop absolute inset-0 h-full w-full bg-black/70 backdrop-blur-[2px]" />
        <aside role="dialog" aria-modal="true" aria-label="Your shopping cart" className="drawer-panel absolute right-0 top-0 flex h-full min-h-[100dvh] w-full max-w-[480px] flex-col border-l border-white/10 bg-[#101010] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-7">
            <div><p className="display-font text-lg font-bold">Your bag <span className="ml-1 text-sm font-normal text-white/40">({itemCount})</span></p><p className="mt-1 text-[10px] text-white/40">Thoughtful pieces, on their way.</p></div>
            <button onClick={() => setDrawerOpen(false)} aria-label="Close cart" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 hover:border-white/30"><X size={17} /></button>
          </div>
          {cart.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag size={35} className="text-white/25" strokeWidth={1.4} /><h3 className="display-font mt-5 text-xl font-bold">Your bag is taking a breather.</h3><p className="mt-2 max-w-[250px] text-sm leading-6 text-[#9A9A9A]">Find your new everyday favourite in the collection.</p>
            <button onClick={() => { setDrawerOpen(false); jumpTo("shirts"); }} className="mt-6 rounded-full bg-[#E10600] px-6 py-3 text-[11px] font-bold">Continue Shopping</button>
          </div> : <>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              <div className="space-y-4">
                {cartDetails.map((line) => <div key={`${line.productId}-${line.size}`} className="flex gap-4 border-b border-white/[.08] pb-4">
                  <img src={line.product.image} alt="" className="h-[92px] w-[76px] shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2"><div><p className="line-clamp-2 text-[12px] font-semibold leading-5">{line.product.name}</p><p className="mt-1 text-[10px] text-white/45">Size: {line.size}</p></div><button onClick={() => removeLine(line)} aria-label={`Remove ${line.product.name}, size ${line.size}`} className="p-1 text-white/35 transition hover:text-[#ff514c]"><Trash2 size={14} /></button></div>
                    <div className="mt-3 flex items-center justify-between"><div className="flex items-center rounded-lg border border-white/10"><button onClick={() => changeQty(line, -1)} aria-label="Decrease quantity" className="flex h-7 w-8 items-center justify-center text-white/60 hover:text-white"><Minus size={12} /></button><span className="w-6 text-center text-[11px]">{line.qty}</span><button onClick={() => changeQty(line, 1)} aria-label="Increase quantity" className="flex h-7 w-8 items-center justify-center text-white/60 hover:text-white"><Plus size={12} /></button></div><p className="text-[12px] font-semibold">{money(line.product.price * line.qty)}</p></div>
                  </div>
                </div>)}
              </div>
              <div className="mt-5 space-y-3 border-b border-white/10 pb-5 text-[11px]">
                <div className="flex justify-between text-white/55"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                <div className="flex justify-between text-white/55"><span>Delivery <span className="text-white/35">· {deliveryArea}</span></span><span>{money(delivery)}</span></div>
                <div className="flex justify-between pt-1 text-[14px] font-bold"><span>Total</span><span>{money(total)}</span></div>
              </div>
              <div className="mt-6">
                <p className="display-font text-base font-bold">Delivery details</p>
                <p className="mt-1 text-[10px] text-white/40">We’ll confirm your order on WhatsApp.</p>
                <form onSubmit={(event) => { event.preventDefault(); validateCheckout(); }} className="mt-4 space-y-3" noValidate>
                  <Field label="Full name" value={customer.name} placeholder="Your full name" error={errors.name} onChange={(value) => { setCustomer({ ...customer, name: value }); setErrors({ ...errors, name: "" }); }} />
                  <Field label="Phone number" value={customer.phone} placeholder="01XXXXXXXXX" inputMode="tel" error={errors.phone} onChange={(value) => { setCustomer({ ...customer, phone: value }); setErrors({ ...errors, phone: "" }); }} />
                  <Field label="Full delivery address" value={customer.address} placeholder="House, road, area, district" error={errors.address} onChange={(value) => { setCustomer({ ...customer, address: value }); setErrors({ ...errors, address: "" }); }} />
                  <div>
                    <p className="mb-2 text-[10px] font-semibold text-white/60">Delivery area</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Inside Dhaka", "Outside Dhaka"] as const).map((area) => <button key={area} type="button" onClick={() => setDeliveryArea(area)} className={`rounded-lg border px-2 py-3 text-[10px] font-semibold transition ${deliveryArea === area ? "border-[#E10600]/70 bg-[#E10600]/10 text-white" : "border-white/10 text-white/55"}`}>{area}<span className="ml-1 text-white/40">· {money(area === "Inside Dhaka" ? DELIVERY_INSIDE_DHAKA : DELIVERY_OUTSIDE_DHAKA)}</span></button>)}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-semibold text-white/60">Payment option</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([["COD", "Cash on Delivery"], ["WhatsApp", "Quick Order via WhatsApp"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setPayment(value)} className={`rounded-lg border px-2 py-3 text-[10px] font-semibold transition ${payment === value ? "border-[#E10600]/70 bg-[#E10600]/10 text-white" : "border-white/10 text-white/55"}`}>{label}</button>)}
                    </div>
                  </div>
                  <button type="submit" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E10600] py-3.5 text-[12px] font-bold transition hover:bg-[#bd0803]">Review order <ArrowRight size={15} /></button>
                  <p className="text-center text-[9px] leading-4 text-white/35">No online payment required. Your order is confirmed directly with HANGER.</p>
                </form>
              </div>
            </div>
          </>}
        </aside>
      </div>}

      {confirmationOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
        <div role="dialog" aria-modal="true" aria-labelledby="confirm-heading" className="fade-up max-h-[90dvh] w-full max-w-[480px] overflow-y-auto rounded-2xl border border-white/10 bg-[#151515] p-5 shadow-2xl sm:p-7">
          <div className="flex items-start justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#E10600]">Almost yours</p><h2 id="confirm-heading" className="display-font mt-2 text-2xl font-bold">Review your order</h2></div><button onClick={() => setConfirmationOpen(false)} aria-label="Close order summary" className="rounded-full border border-white/10 p-2 text-white/60"><X size={16} /></button></div>
          <p className="mt-2 text-[12px] text-white/50">Thank you, {customer.name.trim()} — here’s what we’ll send to HANGER.</p>
          <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="space-y-3">{cartDetails.map((line) => <div key={`${line.productId}-${line.size}`} className="flex justify-between gap-4 text-[11px]"><span className="leading-5 text-white/65">{line.product.name}<span className="block text-[10px] text-white/35">Size {line.size} · Qty {line.qty}</span></span><span className="shrink-0 font-semibold">{money(line.product.price * line.qty)}</span></div>)}</div>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-3 text-[10px] text-white/55"><div className="flex justify-between"><span>Delivery · {deliveryArea}</span><span>{money(delivery)}</span></div><div className="flex justify-between text-sm font-bold text-white"><span>Total</span><span>{money(total)}</span></div></div>
          </div>
          <div className="mt-4 space-y-1.5 text-[10px] text-white/50"><p><span className="text-white/35">Deliver to</span> · {customer.name}, {customer.phone}</p><p className="leading-5">{customer.address}</p><p><span className="text-white/35">Payment</span> · {payment === "COD" ? "Cash on Delivery (COD)" : "Quick Order via WhatsApp"}</p></div>
          <p className="mt-5 text-center text-[11px] text-white/65">Thank you for choosing HANGER. See you in WhatsApp.</p>
          <button onClick={submitOrder} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#20b75a] py-3.5 text-[12px] font-bold transition hover:bg-[#18994a]"><MessageCircle size={16} /> Send order on WhatsApp</button>
          <button onClick={() => setConfirmationOpen(false)} className="mt-2 w-full py-2 text-[10px] font-semibold text-white/45 hover:text-white">Back to details</button>
        </div>
      </div>}
    </div>
  );
}

export default App;

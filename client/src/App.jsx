import { useEffect, useMemo, useRef, useState, createContext, useContext } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import productsSeed from './data/products.json';
import storesSeed from './data/pharmacies.json';
import nearestSeed from './data/nearest_pharmacies.json';
import reviewsSeed from './data/reviews.json';

const A = '/assets/figma';
const API = '/api';
const PRODUCT_PLACEHOLDER = '/assets/products/placeholder.svg';
const AuthContext = createContext(null);
const CartContext = createContext(null);
const useAuth = () => useContext(AuthContext);
const useCart = () => useContext(CartContext);
const money = (value) => `৳${Number(value || 0).toFixed(2)}`;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/;
const PASSWORD_PATTERN = /^(?=.*[^A-Za-z0-9]).{8,}$/;
const fixProduct = (p) => ({ ...p, id: String(p.id ?? p.sourceId ?? p._id), price: Number(p.price) || 0, photo: p.photo || PRODUCT_PLACEHOLDER });
const PRODUCTS = productsSeed.filter((product) => !product.duplicateOf).map(fixProduct);
const normalizeStore = (s, i = 0) => ({ ...s, id: String(s.id ?? s._id ?? i), rating: Number(s.rating) || 4, status: s.status || (i % 4 === 2 ? 'CLOSE' : 'OPEN') });
async function getJson(url, fallback) { try { const r = await fetch(url); if (!r.ok) throw new Error('API unavailable'); return await r.json(); } catch { return fallback; } }

function Logo({ inverse = false }) {
  return <Link className={`logo ${inverse ? 'logo-inverse' : ''}`} to="/home" aria-label="E-Pharmacy home"><img src={`${A}/home/imgImage2.png`} alt="" /><span>E-Pharmacy</span></Link>;
}

function Icon({ name, className = '' }) { return <svg className={`icon icon-${name} ${className}`} aria-hidden="true" focusable="false"><use href={`${A}/icons.svg#${name}`} /></svg>; }

function Header({ hero = false }) {
  const { user, logout } = useAuth(); const { count } = useCart(); const [open, setOpen] = useState(false);
  return <header className={`header ${hero ? 'header-hero' : ''}`}>
    <Logo inverse={hero} />
    <nav id="site-navigation" className={`nav-pills ${open ? 'nav-open' : ''}`} aria-label="Main navigation">
      <NavLink to="/home">Home</NavLink><NavLink to="/medicine-store">Medicine store</NavLink><NavLink to="/medicine">Medicine</NavLink>
    </nav>
    <div className="header-actions">
      {user ? <><Link className="cart-shortcut" to="/cart" aria-label={`Cart, ${count} items`}><CartIcon /><sup>{count}</sup></Link><span className="user-dot" title={user.name}>{user.name?.[0]?.toUpperCase() || '1'}</span><button className="logout-btn" onClick={logout}>Log out</button></> : <><Link className="register-btn" to="/register">Register</Link><Link className="login-link" to="/login">Login</Link></>}
    </div>
    <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}><Icon name="menu" /></button>
  </header>;
}

function CartIcon() { return <Icon name="cart" />; }
function Footer() { return <footer className="footer"><div className="footer-main"><div className="footer-brand"><Logo inverse /><p>Get the medicine to help you feel better,<br />get back to your active life, and enjoy<br />every moment.</p></div><nav className="footer-nav"><Link to="/home">Home</Link><Link to="/medicine-store">Medicine store</Link><Link to="/medicine">Medicine</Link></nav><ul className="socials"><li><a href="https://www.facebook.com/goITclub/" target="_blank" rel="noreferrer" aria-label="Facebook"><Icon name="facebook" /></a></li><li><a href="https://www.instagram.com/goitclub/" target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="instagram" /></a></li><li><a href="https://www.youtube.com/c/GoIT" target="_blank" rel="noreferrer" aria-label="YouTube"><Icon name="youtube" /></a></li></ul></div><div className="footer-bottom"><span>© E-Pharmacy 2023. All Rights Reserved</span><Link to="#privacy">Privacy Policy</Link><Link to="#terms">Terms &amp; Conditions</Link></div></footer>; }
function SiteLayout({ children }) { return <><Header /><main>{children}</main><Footer /></>; }

function HomePage() {
  const [stores, setStores] = useState(nearestSeed.slice(0, 6).map(normalizeStore)); const [reviews, setReviews] = useState(reviewsSeed);
  const [offers, setOffers] = useState([{ name: 'Huge Sale', value: '70%', link: 'Shop now' }, { name: 'Secure delivery', value: '100%', link: 'Read more' }, { name: 'Off', value: '35%', link: 'Shop now' }]);
  useEffect(() => {
    getJson(`${API}/stores/nearest`, []).then((x) => Array.isArray(x) && x.length && setStores(x.slice(0, 6).map(normalizeStore)));
    getJson(`${API}/customer-reviews`, []).then((x) => Array.isArray(x) && setReviews(x));
    getJson(`${API}/promo-banners`, null).then((x) => Array.isArray(x) && x.length && setOffers(x.map((offer) => ({ name: offer.title, value: `${offer.discount}%`, link: offer.title === 'Secure delivery' ? 'Read more' : 'Shop now' }))));
  }, []);
  return <>
      <section className="hero"><Header hero /><div className="hero-art"><img src={`${A}/home/hero-1500.webp`} srcSet={`${A}/home/hero-750.webp 750w, ${A}/home/hero-1500.webp 1500w`} sizes="(max-width: 767px) 100vw, 750px" alt="Three white and green capsules" fetchPriority="high" /><h1>Your medication<br />delivered</h1><p>Say goodbye to all your<br />healthcare worries with us</p></div></section>
    <div className="page-container home-content">
      <section className="offer-grid" aria-label="Current offers">{offers.map((offer, i) => <article className="offer-card" key={offer.name}><div className="offer-heading"><span className="offer-number">{i + 1}</span><span>{offer.name}</span></div><div className="offer-bottom"><strong>{offer.value}</strong><Link to={offer.name === 'Secure delivery' ? '/home#features' : `/medicine?discount=${offer.value.replace('%','')}`}>{offer.link}</Link></div></article>)}</section>
      <section className="home-stores"><SectionTitle title="Your Nearest Medicine Store" subtitle="Search for Medicine, Filter by your location" /><div className="home-store-grid">{stores.slice(0, 6).map((s, i) => <StoreCard key={s.id || i} store={s} compact />)}</div></section>
      <section className="pharmacy-promo"><div><h2>Add the medicines<br />you need online now</h2><p>Enjoy the convenience of having your prescriptions filled from home by connecting with your community pharmacy through our online platform.</p><Link className="outline-button" to="/medicine-store">Buy medicine</Link></div><img src={`${A}/home/pharmacy-1200.webp`} srcSet={`${A}/home/pharmacy-640.webp 640w, ${A}/home/pharmacy-1200.webp 1200w`} sizes="(max-width: 767px) 100vw, 600px" alt="A customer using medicine delivery online" loading="lazy" /></section>
      <ul className="features" id="features">{['Take user orders form online', 'Create your shop profile', 'Manage your store', 'Get more orders', 'Storage shed'].map((x, i) => <li key={x}><Icon name="lightning" />{x}</li>)}</ul>
      <section className="review-section" id="reviews"><SectionTitle title="Reviews" subtitle="Search for Medicine, Filter by your location" /><div className="review-grid">{reviews.slice(0, 3).map((r, i) => <ReviewCard key={`${r.name}-${i}`} review={r} index={i} />)}</div></section>
    </div><Footer />
  </>;
}

function SectionTitle({ title, subtitle }) { return <div className="section-title"><h2>{title}</h2><p>{subtitle}</p></div>; }
function StoreCard({ store, compact = false }) { return <Link to={`/pharmacy/${store.id}`} className={`store-card ${compact ? 'store-card-compact' : ''}`}><div className="store-name-row"><h3 title={store.name}>{store.name}</h3><div className="store-score"><Icon name="star" /><span>{store.rating}</span></div></div><div className="store-loc"><Icon name="map-pin" /><span>{store.address}<br />{store.city}</span></div><div className="store-phone"><Icon name="phone" /><span>{store.phone}</span></div>{!compact && <div className="store-card-bottom"><span className="visit-store">Visit Store</span><span className={`status-chip ${store.status === 'CLOSE' ? 'closed' : ''}`}>{store.status}</span></div>}</Link>; }
function ReviewCard({ review, index = 0 }) { const photos = [`${A}/home/imgEllipse1.png`, `${A}/home/imgEllipse2.png`, `${A}/home/imgEllipse3.png`]; return <article className="review-card"><img className="review-avatar" src={review.photo || photos[index % photos.length]} alt="" /><h3>{review.name}</h3><p>{review.testimonial}</p></article>; }

function StoreListPage() {
  const [stores, setStores] = useState(storesSeed.map(normalizeStore));
  useEffect(() => { getJson(`${API}/stores`, stores).then((x) => Array.isArray(x) && x.length && setStores(x.map(normalizeStore))); }, []);
  return <SiteLayout><div className="page-container store-page"><h1 className="page-title">Medicine store</h1><div className="stores-grid">{stores.slice(0, 9).map((s, i) => <StoreCard key={s.id || i} store={s} />)}</div></div></SiteLayout>;
}
function PharmacyPage() { const { id } = useParams(); const [store, setStore] = useState(() => storesSeed.map(normalizeStore).find((s) => s.id === id) || normalizeStore(storesSeed[0])); useEffect(()=>{getJson(`${API}/stores/${id}`,null).then((x)=>x&&setStore(normalizeStore(x)))},[id]); return <SiteLayout><div className="page-container pharmacy-detail"><h1 className="page-title">{store.name}</h1><div className="pharmacy-detail-card"><StoreCard store={store} /><p>{store.address}, {store.city}</p><p>Phone: {store.phone}</p><p>Rating: ★ {store.rating}</p></div></div></SiteLayout>; }

function MedicinePage() {
  const [searchParams, setSearchParams] = useSearchParams(); const [all, setAll] = useState(PRODUCTS);
  const { user } = useAuth();
  const [query, setQuery] = useState(searchParams.get('q') || ''); const [category, setCategory] = useState('All categories'); const [page, setPage] = useState(Number(searchParams.get('page')) || 1); const [pages, setPages] = useState(1); const [pageItems, setPageItems] = useState(null); const [modal, setModal] = useState(false);
  const discount = Number(searchParams.get('discount')) || 0;
  const filtered = useMemo(() => all.filter((x) => (!query || x.name.toLowerCase().includes(query.toLowerCase())) && (category === 'All categories' || x.category === category)), [all, query, category]);
  const items = useMemo(() => pageItems ?? filtered.slice((page - 1) * 12, page * 12), [pageItems, filtered, page]);
  const categories = useMemo(() => ['All categories', ...new Set(all.map((x) => x.category).filter(Boolean))], [all]);
  const load = async () => { const p = new URLSearchParams({ page: String(page), limit: '12' }); if (query) p.set('q', query); if (category !== 'All categories') p.set('category', category); if (discount) p.set('discount', String(discount)); const result = await getJson(`${API}/products?${p}`, null); if (result?.items) { setPageItems(result.items.map(fixProduct)); setPages(result.totalPages || 1); } else { setPageItems(null); setPages(Math.max(1, Math.ceil(filtered.length / 12))); } };
  useEffect(() => { load(); }, [page, category, discount, query]);
  useEffect(() => { setSearchParams((p) => { if (query) p.set('q', query); else p.delete('q'); p.set('page', String(page)); return p; }, { replace: true }); }, [query, page]);
  return <SiteLayout><div className="page-container catalog-page"><h1 className="page-title">Medicine</h1><form className="filters" onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }}><label className="select-wrap"><span className="sr-only">Product category</span><select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}><option>All categories</option>{categories.slice(1).map((x) => <option key={x}>{x}</option>)}</select><span className="chevron">⌄</span></label><label className="search-wrap"><input aria-label="Search medicine" placeholder="Search medicine" value={query} onChange={(e) => setQuery(e.target.value)} /><Icon name="search" /></label><button className="primary-btn filter-btn" type="submit"><Icon name="filter" /> Filter</button></form>
    {items.length ? <div className="product-grid">{items.map((p) => <ProductCard key={p.id} product={p} onAdd={() => { if (!user) setModal(true); else addToCart(p); }} />)}</div> : <div className="empty-results">Nothing was found for your request</div>}
    {pages > 1 && <Pagination page={page} pages={pages} onPage={setPage} />}
  </div><AuthModal open={modal} onClose={() => setModal(false)} /></SiteLayout>;
}
function addToCart(product) { window.dispatchEvent(new CustomEvent('eph-add-cart', { detail: product })); }
function ProductCard({ product, onAdd }) { return <article className="product-card"><Link className="product-image" to={`/product/${product.id}`}><img src={product.photo} alt={product.name} loading="lazy" onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=PRODUCT_PLACEHOLDER}} /></Link><div className="product-info"><div className="product-title-row"><Link to={`/product/${product.id}`}><h2>{product.name}</h2></Link><strong>{money(product.price)}</strong></div><p>{product.suppliers || product.category || 'Medicine'}</p><div className="product-actions"><button className="primary-btn add-btn" onClick={onAdd}>Add to cart</button><Link className="details-link" to={`/product/${product.id}`}>Details</Link></div></div></article>; }
function Pagination({ page, pages, onPage }) { return <nav className="pagination" aria-label="Pagination"><button disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">‹</button>{Array.from({ length: pages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.max(5, page + 2)).map((n) => <button key={n} className={n === page ? 'active' : ''} onClick={() => onPage(n)}>{n}</button>)}<button disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">›</button></nav>; }

function ProductPage() {
  const { id } = useParams(); const { user } = useAuth();
  const [product, setProduct] = useState(() => PRODUCTS.find((p) => p.id === id) || null);
  const [tab, setTab] = useState('Description'); const [quantity, setQuantity] = useState(1); const [modal, setModal] = useState(false);
  const [reviews, setReviews] = useState([]); const [reviewPage, setReviewPage] = useState(1); const [reviewPages, setReviewPages] = useState(1); const [reviewTotal, setReviewTotal] = useState(0);
  useEffect(() => { let alive = true; getJson(`${API}/products/${id}`, PRODUCTS.find((p) => p.id === id) || null).then((item) => { if (alive) setProduct(item ? fixProduct(item) : null); }); return () => { alive = false; }; }, [id]);
  useEffect(() => { let alive = true; getJson(`${API}/products/${id}/reviews?page=${reviewPage}&limit=4`, { items: [], totalPages: 1, total: 0 }).then((result) => { if (!alive) return; setReviews(result?.items || []); setReviewPages(result?.totalPages || 1); setReviewTotal(result?.total || 0); }); return () => { alive = false; }; }, [id, reviewPage]);
  if (!product) return <SiteLayout><div className="page-container empty-results">Product not found.</div></SiteLayout>;
  const rating = Number.isFinite(Number(product.rating)) && product.rating !== null && product.rating !== '' ? Number(product.rating) : null;
  return <SiteLayout><div className="page-container product-detail-page"><div className="product-overview"><div className="product-left"><div className="product-large-image"><img src={product.photo} alt={product.name} onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=PRODUCT_PLACEHOLDER}} /></div><div className="product-summary"><div className="product-title-row"><h1>{product.name}</h1><strong>{money(product.price)}</strong></div><p>Brand: {product.suppliers || 'E-Pharmacy'}</p><div className="product-rating" aria-label={rating === null ? 'No product rating' : `Rated ${rating} out of 5`}>{rating === null ? 'No rating yet' : <><Icon name="star" /> {rating.toFixed(1)} <span>({reviewTotal} reviews)</span></>}</div><div className="summary-actions"><div className="stepper"><button aria-label="Increase quantity" onClick={() => setQuantity(Math.min(99, quantity + 1))}>＋</button><span>{quantity}</span><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button></div><button className="primary-btn" onClick={() => user ? addToCart({ ...product, quantity }) : setModal(true)}>Add to cart</button></div></div></div><div className="tabs-panel"><div className="tab-pills" role="tablist" aria-label="Product information"><button role="tab" aria-selected={tab === 'Description'} className={tab === 'Description' ? 'selected' : ''} onClick={() => setTab('Description')}>Description</button><button role="tab" aria-selected={tab === 'Reviews'} className={tab === 'Reviews' ? 'selected' : ''} onClick={() => setTab('Reviews')}>Reviews</button></div>{tab === 'Description' ? <div className="description-copy" role="tabpanel">{product.description ? <p>{product.description}</p> : <p>Use {product.name} only as directed by its packaging or a qualified healthcare professional. The supplied product data does not include a detailed description.</p>}{product.medicinalUses && <p><b>Medicinal Uses:</b> {product.medicinalUses}</p>}{product.warnings && <p><b>Important:</b> {product.warnings}</p>}</div> : <div className="product-reviews" role="tabpanel">{reviews.length ? reviews.map((review) => <article key={review._id || `${review.name}-${review.createdAt}`}><div className="review-person"><b>{review.name}</b><span aria-label={`${review.rating || 0} out of 5 stars`}>{'★'.repeat(Math.max(0, Math.min(5, Number(review.rating) || 0)))}</span></div>{review.createdAt && <small>{new Date(review.createdAt).toLocaleDateString()}</small>}<p>{review.testimonial}</p></article>) : <p className="empty-reviews">No product reviews yet.</p>}{reviewPages > 1 && <Pagination page={reviewPage} pages={reviewPages} onPage={setReviewPage} />}</div>}</div></div></div><AuthModal open={modal} onClose={() => setModal(false)} /></SiteLayout>;
}

function CartPage() {
  const { items, updateQuantity, remove } = useCart(); const [payment, setPayment] = useState('Cash On Delivery'); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  const total = items.reduce((s, x) => s + x.price * x.quantity, 0);
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { name: user?.name || '', email: user?.email || '', phone: '', address: '' } });
  const placeOrder = async (values) => { setBusy(true); setMessage(''); try { const r = await fetch(`${API}/cart/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('eph-token')}` }, body: JSON.stringify({ ...values, paymentMethod: payment }) }); const data = await r.json(); if (!r.ok) throw new Error(data.message); remove('all'); setMessage('Your order has been placed.'); } catch (e) { setMessage(e.message || 'Unable to place the order.'); } finally { setBusy(false); } };
  return <SiteLayout><div className="page-container cart-page"><h1 className="page-title">Cart</h1><div className="cart-columns"><form className="shipping-card" onSubmit={handleSubmit(placeOrder)}><h2>Enter shipping info</h2><p className="hint">Enter your shipping info where you’ll get the product. You can also send any other location where you need the products.</p><div className="shipping-fields">{[['name','Name'],['email','Email'],['phone','Phone'],['address','Address']].map(([key,label]) => {const rules={required:`${label} is required`};if(key==='name')Object.assign(rules,{minLength:{value:2,message:'Enter at least 2 characters.'},maxLength:{value:80,message:'Name must be 80 characters or fewer.'}});if(key==='email')rules.pattern={value:EMAIL_PATTERN,message:'Enter a valid email address.'};if(key==='phone')rules.pattern={value:PHONE_PATTERN,message:'Enter a valid phone number.'};if(key==='address')rules.minLength={value:5,message:'Enter a complete delivery address.'};return <label key={key}>{label}<input type={key==='email'?'email':key==='phone'?'tel':'text'} autoComplete={key==='name'?'name':key==='email'?'email':key==='phone'?'tel':'street-address'} placeholder="Enter text" aria-invalid={Boolean(errors[key])} {...register(key,rules)}/>{errors[key]&&<small className="field-error" role="alert">{errors[key].message}</small>}</label>})}</div><hr/><h2>Payment method</h2><p className="hint">You can pay us in a multiple way in our payment gateway system.</p><div className="payment-options">{['Cash On Delivery','Bank'].map(x=><label key={x}><input type="radio" name="paymentMethod" checked={payment===x} onChange={()=>setPayment(x)}/>{x}</label>)}</div><hr/><h2>Order details</h2><p className="hint">Shipping and additional costs are calculated based on values you have entered.</p><div className="total-bar"><b>Total:</b><strong>{money(total)}</strong></div><button className="primary-btn place-order" disabled={busy || !items.length}>{busy?'Placing order…':'Place order'}</button>{message&&<p className="form-message" role="status">{message}</p>}</form><div className="cart-items">{items.length ? items.map((x) => <CartRow key={x.id} item={x} update={updateQuantity} remove={remove} />) : <div className="cart-empty">Your cart is empty.<Link to="/medicine">Browse medicines</Link></div>}</div></div></div></SiteLayout>;
}
function CartRow({ item, update, remove }) { return <article className="cart-row"><div className="cart-product-thumb"><img src={item.photo} alt={item.name} onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=PRODUCT_PLACEHOLDER}} /></div><div className="cart-product-desc"><h2>{item.name}</h2><p>{item.suppliers || item.category || 'Medicine'}</p><small>Unit price: {money(item.price)}</small><div className="stepper"><button onClick={() => update(item.id, item.quantity + 1)}>＋</button><span>{item.quantity}</span><button onClick={() => update(item.id, item.quantity - 1)}>−</button></div></div><div className="cart-product-price"><strong>{money(item.price * item.quantity)}</strong><button className="remove-btn" onClick={() => remove(item.id)}>Remove</button></div></article>; }

function AuthPage({ registerPage = false }) {
  const { login } = useAuth(); const navigate = useNavigate(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const submit = async (values) => { setBusy(true); setError(''); try { const r = await fetch(`${API}/user/${registerPage?'register':'login'}`, { method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values) }); const d=await r.json(); if(!r.ok) throw new Error(d.message); login(d); navigate(registerPage ? '/medicine' : '/home'); } catch(e) { setError(e.message || 'Please try again.'); } finally { setBusy(false); } };
  const fieldError = (name) => errors[name] && <small className="field-error" role="alert">{errors[name].message}</small>;
  return <main className="auth-page"><div className="auth-logo"><Logo /></div><div className="auth-layout"><div className="auth-promo"><h1>Your medication,<br/>delivered Say goodbye<br/>to all <em>your healthcare</em><br/>worries with us</h1><img src={`${A}/auth/pill.webp`} alt="" /></div><form className={`auth-form ${registerPage?'register-form':''}`} onSubmit={handleSubmit(submit)} noValidate>
    {registerPage ? <>
      <label><span className="sr-only">User Name</span><input placeholder="User Name" autoComplete="name" aria-invalid={Boolean(errors.name)} {...register('name',{required:'Name is required',minLength:{value:2,message:'Enter at least 2 characters.'},maxLength:{value:80,message:'Name must be 80 characters or fewer.'}})}/>{fieldError('name')}</label>
      <label><span className="sr-only">Email address</span><input placeholder="Email address" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register('email',{required:'Email is required',pattern:{value:EMAIL_PATTERN,message:'Enter a valid email address.'}})}/>{fieldError('email')}</label>
      <label><span className="sr-only">Phone number</span><input placeholder="Phone number" type="tel" autoComplete="tel" aria-invalid={Boolean(errors.phone)} {...register('phone',{required:'Phone number is required',pattern:{value:PHONE_PATTERN,message:'Enter a valid phone number.'}})}/>{fieldError('phone')}</label>
      <label><span className="sr-only">Password</span><input placeholder="Password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} {...register('password',{required:'Password is required',pattern:{value:PASSWORD_PATTERN,message:'Use at least 8 characters and one special character.'}})}/>{fieldError('password')}</label>
    </> : <>
      <label className="auth-full"><span className="sr-only">Email address</span><input placeholder="Email address" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register('email',{required:'Email is required',pattern:{value:EMAIL_PATTERN,message:'Enter a valid email address.'}})}/>{fieldError('email')}</label>
      <label className="auth-full"><span className="sr-only">Password</span><input placeholder="Password" type="password" autoComplete="current-password" aria-invalid={Boolean(errors.password)} {...register('password',{required:'Password is required',minLength:{value:8,message:'Enter at least 8 characters.'}})}/>{fieldError('password')}</label>
    </>}
    {error&&<p className="field-error auth-error" role="alert">{error}</p>}<button className="primary-btn auth-submit" disabled={busy}>{busy?'Please wait…':registerPage?'Register':'Log in'}</button><Link className="auth-switch" to={registerPage?'/login':'/register'}>{registerPage?'Already have an account?':"Don't have an account?"}</Link>
  </form></div></main>;
}

function AuthModal({ open, onClose }) {
  const { login } = useAuth(); const [registerMode, setRegisterMode] = useState(false); const [error, setError] = useState('');
  const dialogRef = useRef(null);
  useEffect(()=>{
    if(!open)return;
    const previous = document.activeElement;
    dialogRef.current?.querySelector('button, input')?.focus();
    const onKey=(e)=>{
      if(e.key==='Escape'){onClose();return;}
      if(e.key==='Tab'){
        const focusable=[...dialogRef.current.querySelectorAll('button:not([disabled]), input:not([disabled])')];
        const first=focusable[0], last=focusable[focusable.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
      }
    };
    window.addEventListener('keydown',onKey);
    return()=>{window.removeEventListener('keydown',onKey);previous?.focus?.();};
  },[open,onClose]);
  if (!open) return null;
  const submit = async (e) => { e.preventDefault(); setError(''); const fd = new FormData(e.currentTarget); const payload = registerMode ? { name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), password: fd.get('password') } : { email: fd.get('email'), password: fd.get('password') }; try { const r=await fetch(`${API}/user/${registerMode?'register':'login'}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw new Error(d.message);login(d);onClose();}catch(e){setError(e.message);} };
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e)=>e.target===e.currentTarget&&onClose()}><section ref={dialogRef} className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title"><button className="modal-close" onClick={onClose} aria-label="Close">×</button><h2 id="auth-modal-title">{registerMode?'Sign Up':'Log in to your account'}</h2><p>{registerMode?'Before proceeding, please register on our site.':'Please login to your account before continuing.'}</p><form onSubmit={submit}>{registerMode&&<input name="name" aria-label="User Name" placeholder="User Name" minLength="2" maxLength="80" required/>}<input type="email" name="email" aria-label="Email address" placeholder="Email address" pattern="[^\s@]+@[^\s@]+\.[^\s@]+" required/>{registerMode&&<input type="tel" name="phone" aria-label="Phone number" placeholder="Phone number" pattern="\+?[\d\s().-]{7,20}" required/>}<input type="password" name="password" aria-label="Password" placeholder="Password" minLength="8" pattern="(?=.*[^A-Za-z0-9]).{8,}" required/>{error&&<small className="field-error" role="alert">{error}</small>}<button className="primary-btn" type="submit">{registerMode?'Sign Up':'Log in'}</button></form><button className="auth-modal-switch" onClick={()=>{setRegisterMode(!registerMode);setError('')}}>{registerMode?'Already have an account?':'Don’t have an account?'}</button></section></div>;
}

function Protected({ children }) { const { user, authReady } = useAuth(); if (!authReady) return <main className="auth-pending" aria-live="polite">Loading your account…</main>; return user ? children : <Navigate to="/login" replace />; }
function Toasts() { const [toast,setToast] = useState(''); useEffect(()=>{const h=async(e)=>{const raw=JSON.parse(localStorage.getItem('eph-cart')||'[]');const p=e.detail;const quantity=p.quantity||1;const found=raw.find(x=>x.id===p.id);if(found)found.quantity=Math.min(99,found.quantity+quantity);else raw.push({...p,quantity});localStorage.setItem('eph-cart',JSON.stringify(raw));window.dispatchEvent(new Event('eph-cart-change'));const token=localStorage.getItem('eph-token');if(token){try{await fetch(`${API}/cart`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({productId:p.id,quantity})})}catch{}}setToast('Added to cart');setTimeout(()=>setToast(''),2200)};window.addEventListener('eph-add-cart',h);return()=>window.removeEventListener('eph-add-cart',h)},[]);return toast?<div className="toast" role="status">{toast}</div>:null; }

function App() {
  const [user, setUser] = useState(null); const [authReady, setAuthReady] = useState(false);
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('eph-cart') || '[]'));
  useEffect(()=>{const token=localStorage.getItem('eph-token');if(!token){localStorage.removeItem('eph-user');setAuthReady(true);return}fetch(`${API}/user/user-info`,{headers:{Authorization:`Bearer ${token}`}}).then(async(r)=>{if(!r.ok)throw new Error('Session expired');return r.json()}).then((info)=>{localStorage.setItem('eph-user',JSON.stringify(info));setUser(info);setAuthReady(true)}).catch(()=>{localStorage.removeItem('eph-token');localStorage.removeItem('eph-user');setUser(null);setAuthReady(true)})},[]);
  useEffect(()=>{const h=()=>setItems(JSON.parse(localStorage.getItem('eph-cart')||'[]'));window.addEventListener('eph-cart-change',h);return()=>window.removeEventListener('eph-cart-change',h)},[]);
  useEffect(()=>{const token=localStorage.getItem('eph-token');if(!user||!token)return;fetch(`${API}/cart`,{headers:{Authorization:`Bearer ${token}`}}).then((r)=>r.ok?r.json():null).then((rows)=>{if(!Array.isArray(rows))return;const synced=rows.filter((x)=>x.product).map((x)=>fixProduct({...x.product,id:x.product.sourceId??x.product._id,quantity:x.quantity}));localStorage.setItem('eph-cart',JSON.stringify(synced));setItems(synced)}).catch(()=>{})},[user]);
  const auth = { user, authReady, login: (data) => { localStorage.setItem('eph-token',data.token);localStorage.setItem('eph-user',JSON.stringify(data.user));setUser(data.user);setAuthReady(true); } , logout: async()=>{try{await fetch(`${API}/user/logout`,{headers:{Authorization:`Bearer ${localStorage.getItem('eph-token')}`}})}catch{}localStorage.removeItem('eph-token');localStorage.removeItem('eph-user');setUser(null);} };
  const cart = { items, count: items.reduce((s,x)=>s+x.quantity,0), updateQuantity:(id,quantity)=>{const next=quantity<1?items.filter(x=>x.id!==id):items.map(x=>x.id===id?{...x,quantity:Math.min(99,quantity)}:x);localStorage.setItem('eph-cart',JSON.stringify(next));setItems(next);const token=localStorage.getItem('eph-token');if(token)fetch(`${API}/cart/update`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({productId:id,quantity})}).catch(()=>{})},remove:(id)=>{const next=id==='all'?[]:items.filter(x=>x.id!==id);localStorage.setItem('eph-cart',JSON.stringify(next));setItems(next);const token=localStorage.getItem('eph-token');if(token&&id!=='all')fetch(`${API}/cart/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}}).catch(()=>{})} };
  return <AuthContext.Provider value={auth}><CartContext.Provider value={cart}><Routes><Route path="/" element={<Navigate to="/home" replace/>}/><Route path="/home" element={<HomePage/>}/><Route path="/register" element={<AuthPage registerPage/>}/><Route path="/login" element={<AuthPage/>}/><Route path="/medicine-store" element={<StoreListPage/>}/><Route path="/pharmacy/:id" element={<PharmacyPage/>}/><Route path="/medicine" element={<Protected><MedicinePage/></Protected>}/><Route path="/product/:id" element={<ProductPage/>}/><Route path="/cart" element={<Protected><CartPage/></Protected>}/><Route path="/reviews" element={<Navigate to="/home#reviews" replace/>}/><Route path="*" element={<Navigate to="/home" replace/>}/></Routes><Toasts/></CartContext.Provider></AuthContext.Provider>;
}

export default App;

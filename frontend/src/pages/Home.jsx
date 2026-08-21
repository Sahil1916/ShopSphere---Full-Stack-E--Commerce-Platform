import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { products as productsApi } from '../services/api';
import { normalizeProduct, deriveCategories, initReveal, showToast } from '../utils/helpers';
import ProductCard from '../components/ProductCard';

const SLIDES = [
  { eyebrow: "New Season — Up to 40% Off",
    title: "Shop the <span class='gradient-word'>Future</span>,<br/>delivered today.",
    sub: "Curated electronics, fashion and home essentials — premium quality at prices that make sense." },
  { eyebrow: "Fresh Drops Every Week",
    title: "Big style.<br/><span class='gradient-word'>Bigger</span> savings.",
    sub: "Fresh fashion drops every week with up to 40% off on new arrivals." },
  { eyebrow: "Home & Living Collection",
    title: "Smarter homes<br/>start <span class='gradient-word'>here</span>.",
    sub: "Discover home essentials that blend comfort with modern design." },
];

const TESTIMONIALS = [
  { name:"Aarav Mehta", role:"Verified Buyer", text:"The quality exceeded my expectations and delivery was lightning fast.", avatar:"https://i.pravatar.cc/100?img=12" },
  { name:"Sneha Kapoor", role:"Verified Buyer", text:"Beautiful packaging, smooth checkout, and the product itself feels premium.", avatar:"https://i.pravatar.cc/100?img=47" },
  { name:"Rohan Iyer",  role:"Verified Buyer", text:"Customer support resolved my query within minutes. Shopping here feels effortless.", avatar:"https://i.pravatar.cc/100?img=33" },
];

const CAT_ICONS = { Electronics:'bi-cpu-fill', Fashion:'bi-bag-heart-fill', Home:'bi-house-heart-fill' };

export default function Home() {
  const [slideIdx, setSlideIdx]   = useState(0);
  const [allProducts, setAll]     = useState([]);
  const [categories, setCategories] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    productsApi.getAll().then(r => {
      const prods = (r.data||[]).map(normalizeProduct);
      setAll(prods);
      setCategories(deriveCategories(prods));
    }).catch(()=>{});
  }, []);

  useEffect(() => { initReveal(); }, [allProducts]);

  useEffect(() => {
    timerRef.current = setInterval(() => setSlideIdx(i => (i+1) % SLIDES.length), 4500);
    return () => clearInterval(timerRef.current);
  }, []);

  const featured = allProducts.slice(0, 12);

const bestsellers = [...allProducts]
  .sort((a, b) => a.qty - b.qty)
  .slice(0, 4);
  const slide       = SLIDES[slideIdx];

  return (<>
    {/* ── Hero ── */}
    <header className="hero">
      <div className="hero-orb" style={{width:340,height:340,top:-100,right:-80,background:'rgba(99,102,241,.3)'}}></div>
      <div className="hero-orb" style={{width:220,height:220,bottom:-60,left:'10%',background:'rgba(236,72,153,.25)',animationDelay:'2s'}}></div>
      <div className="hero-orb" style={{width:160,height:160,top:'40%',left:'30%',background:'rgba(6,182,212,.2)',animationDelay:'4s'}}></div>
      <div className="container">
        <div className="row align-items-center gy-5">
          <div className="col-lg-6 hero-content">
            <div className="tag-pill mb-3">
              <i className="bi bi-stars"></i> {slide.eyebrow}
            </div>
            <h1 className="hero-title mb-0" dangerouslySetInnerHTML={{__html: slide.title}}></h1>
            <p className="hero-sub">{slide.sub}</p>
            <div className="d-flex gap-3 flex-wrap">
              <Link to="/products" className="btn btn-coral btn-lg">
                Shop Now <i className="bi bi-arrow-right ms-1"></i>
              </Link>
              <a href="#categories" className="btn btn-light-soft btn-lg" style={{background:'rgba(255,255,255,.12)',color:'#fff',border:'1.5px solid rgba(255,255,255,.25)'}}>
                Browse Categories
              </a>
            </div>
            <div className="hero-slide-dots">
              {SLIDES.map((_,i)=>(
                <span key={i} className={slideIdx===i?'active':''} onClick={()=>setSlideIdx(i)}></span>
              ))}
            </div>
          </div>
          <div className="col-lg-6 d-none d-lg-block">
            <div className="position-relative" style={{height:440}}>

              {/* Jacket image — top right — with Rating badge inside */}
              <div className="hero-card-float position-absolute" style={{width:260,top:0,right:40,borderRadius:18,overflow:'hidden',border:'3px solid rgba(255,255,255,.2)'}}>
                <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80"
                  className="w-100 d-block" style={{height:260,objectFit:'cover'}} alt="" />
                {/* Rating badge — bottom of jacket image */}
                <div className="glass-dark d-flex align-items-center gap-2 p-2"
                  style={{position:'absolute',bottom:10,left:10,right:10,borderRadius:12,zIndex:3}}>
                  <div style={{width:32,height:32,borderRadius:8,background:'var(--grad-primary)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <i className="bi bi-star-fill text-white" style={{fontSize:'.75rem'}}></i>
                  </div>
                  <div style={{color:'#fff',lineHeight:1.3}}>
                    <div style={{fontSize:'.68rem',opacity:.75}}>Customer Rating</div>
                    <div style={{fontWeight:700,fontFamily:'Plus Jakarta Sans',fontSize:'.95rem'}}>4.9 / 5.0 ⭐</div>
                  </div>
                </div>
              </div>

              {/* Headphones image — bottom left — with Orders badge inside */}
              <div className="hero-card-float position-absolute" style={{width:220,bottom:0,left:0,borderRadius:18,overflow:'hidden',border:'3px solid rgba(255,255,255,.2)',animationDelay:'1.5s'}}>
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
                  className="w-100 d-block" style={{height:220,objectFit:'cover'}} alt="" />
                {/* Orders badge — bottom of headphones image */}
                <div className="glass-dark d-flex align-items-center gap-2 p-2"
                  style={{position:'absolute',bottom:10,left:10,right:10,borderRadius:12,zIndex:3}}>
                  <div style={{width:32,height:32,borderRadius:8,background:'var(--grad-cyan)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <i className="bi bi-bag-check-fill text-white" style={{fontSize:'.75rem'}}></i>
                  </div>
                  <div style={{color:'#fff',lineHeight:1.3}}>
                    <div style={{fontSize:'.68rem',opacity:.75}}>Orders Today</div>
                    <div style={{fontWeight:700,fontFamily:'Plus Jakarta Sans',fontSize:'.95rem'}}>1,248+ 🔥</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </header>

    {/* ── Stats strip ── */}
    <section style={{background:'var(--grad-primary)',padding:'1.5rem 0'}}>
      <div className="container">
        <div className="row g-3 text-white text-center">
          {[['10K+','Happy Customers'],['50K+','Products Sold'],['99%','Satisfaction Rate'],['24/7','Support']].map(([n,l])=>(
            <div key={l} className="col-6 col-md-3">
              <div style={{fontFamily:'Plus Jakarta Sans',fontWeight:800,fontSize:'1.6rem'}}>{n}</div>
              <div style={{fontSize:'.85rem',opacity:.85}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Categories ── */}
   {/* ── Categories ── */}
<section className="section" id="categories">

  <div className="container">

    {/* Section Header */}
    <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">

      <div>
        <span className="eyebrow">Browse</span>

        <h2 className="section-title mb-1">
          Shop by Category
        </h2>

        <p className="section-sub mb-0">
          Find exactly what you need across our most-loved collections.
        </p>
      </div>

      <div className="text-muted small">
        <i className="bi bi-arrow-left-right me-1"></i>
        Scroll to explore
      </div>

    </div>

    {/* Horizontal Categories */}
    {categories.length === 0 ? (

      <div className="text-center text-muted py-4">
        No categories yet.
      </div>

    ) : (

      <div
        className="category-scroll"
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBottom: '12px',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >

        {categories.map(c => (

          <Link
            key={c.name}
            to={`/products?cat=${encodeURIComponent(c.name)}`}
            className="cat-card text-decoration-none"
            style={{
              minWidth: '220px',
              flex: '0 0 220px'
            }}
          >

            <div className="cat-icon">
              <i
                className={`bi ${
                  CAT_ICONS[c.name] || 'bi-grid'
                }`}
              ></i>
            </div>

            <h5
              className="mb-1"
              style={{
                fontFamily: 'Plus Jakarta Sans',
                fontWeight: 700
              }}
            >
              {c.name}
            </h5>

            <p className="text-muted small mb-2">
              {c.count} Products
            </p>

            <span className="tag-pill">
              <i className="bi bi-arrow-right me-1"></i>
              Explore
            </span>

          </Link>

        ))}

      </div>

    )}

  </div>

</section>

    {/* ── Featured ── */}
    <section className="section bg-lilac">
      <div className="container">
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
          <div><span className="eyebrow">Handpicked</span><h2 className="section-title mb-0">Featured Products</h2></div>
          <Link to="/products" className="btn btn-outline-violet">View All <i className="bi bi-arrow-right"></i></Link>
        </div>
        <div className="row g-4">
          {featured.length===0 && <div className="col-12 text-center text-muted py-4">No products available yet.</div>}
          {featured.map(p=><ProductCard key={p.id} p={p}/>)}
        </div>
      </div>
    </section>

    {/* ── Bestsellers ── */}
    <section className="section">
      <div className="container">
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
          <div><span className="eyebrow">Trending</span><h2 className="section-title mb-0">Best-Selling Products</h2></div>
          <Link to="/products" className="btn btn-outline-violet">View All <i className="bi bi-arrow-right"></i></Link>
        </div>
        <div className="row g-4">
          {bestsellers.map(p=><ProductCard key={p.id} p={p}/>)}
        </div>
      </div>
    </section>

    {/* ── Testimonials ── */}
    <section className="section bg-lilac" id="testimonials">
      <div className="container">
        <div className="text-center mx-auto mb-5" style={{maxWidth:560}}>
          <span className="eyebrow justify-content-center w-100">Loved by Customers</span>
          <h2 className="section-title">What Our Shoppers Say</h2>
        </div>
        <div className="row g-4">
          {TESTIMONIALS.map(t=>(
            <div key={t.name} className="col-md-4 reveal">
              <div className="testi-card">
                <div className="mb-3" style={{fontSize:'1.1rem'}}>
                  {'★★★★★'.split('').map((s,i)=>(
                    <span key={i} style={{background:'var(--grad-primary)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{s}</span>
                  ))}
                </div>
                <p className="text-muted mb-3" style={{lineHeight:1.7}}>"{t.text}"</p>
                <div className="d-flex align-items-center gap-2 mt-3">
                  <img src={t.avatar} className="testi-avatar" alt={t.name}/>
                  <div>
                    <strong className="d-block" style={{color:'var(--ink)',fontFamily:'Plus Jakarta Sans'}}>{t.name}</strong>
                    <small className="text-muted">{t.role}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Newsletter ── */}
    <section className="section">
      <div className="container">
        <div className="newsletter-section text-center">
          <div className="position-relative z-2 text-white">
            <div className="tag-pill mx-auto mb-3" style={{background:'rgba(255,255,255,.15)',color:'#fff',border:'1px solid rgba(255,255,255,.2)'}}>
              <i className="bi bi-gift"></i> Limited Time Offer
            </div>
            <h2 className="text-white mb-2" style={{fontFamily:'Plus Jakarta Sans'}}>Get 10% off your first order</h2>
            <p className="mb-4" style={{color:'rgba(255,255,255,.8)'}}>Subscribe to our newsletter for exclusive deals and new arrivals.</p>
            <form className="d-flex justify-content-center gap-2 flex-wrap"
              onSubmit={e=>{e.preventDefault(); showToast('Subscribed! Check your inbox.'); e.target.reset();}}>
              <input type="email" className="form-control" style={{maxWidth:320,borderRadius:999,border:'none'}} placeholder="Enter your email" required/>
              <button className="btn btn-coral" type="submit" style={{background:'rgba(255,255,255,.2)',backdropFilter:'blur(10px)',border:'1.5px solid rgba(255,255,255,.3)',color:'#fff'}}>
                Subscribe <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </>);
}

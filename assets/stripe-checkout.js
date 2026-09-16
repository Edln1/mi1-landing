(async()=>{
const status=document.getElementById('status');
try{
 const settings=await fetch('assets/payment-config.json',{cache:'no-store'}).then(r=>r.json());
 if(!settings.apiBase){status.textContent='Checkout is being connected. No payment has been taken.';return}
 const api=settings.apiBase.replace(/\/$/,'');
 async function request(path,options){const r=await fetch(api+path,options);const d=await r.json();if(!r.ok)throw Error(d.error||'Checkout is temporarily unavailable.');return d}
 const config=await request('/config');
 if(!config.enabled){status.textContent='Checkout is not open yet. No payment has been taken.';return}
 const sessionId=new URLSearchParams(location.search).get('session_id');
 if(sessionId){const result=await request('/checkout/status?session_id='+encodeURIComponent(sessionId));status.textContent=result.paymentStatus==='paid'?'Thank you. Your payment is confirmed.':result.status==='open'?'Payment was not completed. Return to your basket to try again.':'Your payment is still processing. Please check again shortly.';return}
 const items=JSON.parse(localStorage.getItem('nexora-cart-v1')||'[]');
 if(!items.length){status.textContent='Your basket is empty. Add MI-1 before checking out.';return}
 const id=crypto.randomUUID();
 const checkout=await Stripe(config.publishableKey).initEmbeddedCheckout({fetchClientSecret:async()=>{const d=await request('/checkout/sessions',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':id},body:JSON.stringify({items})});return d.clientSecret}});
 status.textContent=config.testMode?'Test checkout — no real charges.':'Enter your delivery and payment details below.';checkout.mount('#checkout');
}catch(e){status.textContent=e.message||'Unable to load checkout. Please try again.'}
})();
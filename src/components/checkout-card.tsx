"use client";

import { FormEvent, useState } from "react";

const products = [
  { id: "developer-pro", name: "Developer Pro License", price: 100 },
  { id: "team-license", name: "Team License", price: 250 },
  { id: "enterprise-license", name: "Enterprise License", price: 500 },
];

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export function CheckoutCard() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [productId, setProductId] = useState(products[0].id);
  const [quantity, setQuantity] = useState<number | "">(1);
  const [coupon, setCoupon] = useState("");
  const [purchased, setPurchased] = useState(false);

  const selectedProduct = products.find((product) => product.id === productId) ?? products[0];
  const effectiveQuantity = quantity === "" ? 1 : quantity;
  const hasDiscount = coupon.trim().toUpperCase() === "SAVE20";
  const subtotal = selectedProduct.price * effectiveQuantity;
  const discount = hasDiscount ? subtotal * 0.2 : 0;
  const total = subtotal - discount;

  function handlePurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPurchased(true);
  }

  if (purchased) {
    return (
      <section className="mx-auto flex min-h-[65vh] max-w-xl items-center justify-center">
        <div className="w-full border border-neutral-300 p-8 text-center sm:p-12">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-black" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" className="size-6">
              <path d="m6 12 4 4 8-8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Purchase complete</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Thank you for your order. Your purchase has been confirmed.</p>
          <p className="mt-6 text-sm text-neutral-500">Order total</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{formatPrice(total)}</p>
          <button type="button" onClick={() => setPurchased(false)} className="mt-8 border border-black px-5 py-2.5 text-sm font-medium transition-colors hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
            Return to checkout
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="border-b border-neutral-300 pb-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">Checkout</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Complete your purchase</h1>
      </header>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
        <section className="py-8 lg:border-r lg:border-neutral-300 lg:py-10 lg:pr-12">
          <h2 className="text-lg font-semibold">Customer details</h2>
          <form id="checkout-form" onSubmit={handlePurchase} className="mt-6 space-y-5">
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium">Full name</label>
              <input id="full-name" name="fullName" type="text" autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Alex Morgan" className="mt-2 w-full border border-neutral-300 bg-white px-3.5 py-3 text-sm text-black outline-none placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@example.com" className="mt-2 w-full border border-neutral-300 bg-white px-3.5 py-3 text-sm text-black outline-none placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black" />
            </div>

            <div className="grid gap-5 sm:grid-cols-[1fr_120px]">
              <div>
                <label htmlFor="product" className="block text-sm font-medium">Product</label>
                <select id="product" name="product" value={productId} onChange={(event) => setProductId(event.target.value)} className="mt-2 w-full border border-neutral-300 bg-white px-3.5 py-3 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black">
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name} — {formatPrice(product.price)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium">Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  max="20"
                  value={quantity}
                  onChange={(event) => {
                    const value = event.target.value;
                    setQuantity(value === "" ? "" : Math.max(1, Math.min(20, Number(value))));
                  }}
                  onBlur={() => {
                    if (quantity === "") setQuantity(1);
                  }}
                  className="mt-2 w-full border border-neutral-300 bg-white px-3.5 py-3 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label htmlFor="coupon" className="block text-sm font-medium">Coupon code <span className="font-normal text-neutral-500">(optional)</span></label>
  
              <input 
                id="coupon" 
                name="coupon" 
                type="text" 
                value={coupon} 
                onChange={(event) => setCoupon(event.target.value)} 
                autoComplete="off" 
                placeholder="Enter coupon code" 
                className="mt-2 w-full border border-neutral-300 bg-white px-3.5 py-3 text-sm uppercase text-black outline-none placeholder:normal-case placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black" 
              />
              <p className="mt-2 min-h-5 text-xs text-neutral-500" aria-live="polite">
                {hasDiscount ? "SAVE20 applied. 20% discount added." : "Use SAVE20 for 20% off."}
              </p>
            </div>
          </form>
        </section>

        <aside className="border-t border-neutral-300 py-8 lg:border-t-0 lg:py-10 lg:pl-12">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <dl className="mt-6 text-sm">
            <div className="flex items-start justify-between gap-6 border-b border-neutral-200 py-4 first:pt-0"><dt className="text-neutral-600">Name</dt><dd className="max-w-[65%] truncate text-right font-medium">{fullName || "—"}</dd></div>
            <div className="flex items-start justify-between gap-6 border-b border-neutral-200 py-4"><dt className="text-neutral-600">Email</dt><dd className="max-w-[65%] truncate text-right font-medium">{email || "—"}</dd></div>
            <div className="flex items-start justify-between gap-6 border-b border-neutral-200 py-4"><dt className="text-neutral-600">Product</dt><dd className="text-right font-medium">{selectedProduct.name}</dd></div>
            <div className="flex justify-between border-b border-neutral-200 py-4"><dt className="text-neutral-600">Price</dt><dd className="font-medium">{formatPrice(selectedProduct.price)}</dd></div>
            <div className="flex justify-between border-b border-neutral-200 py-4"><dt className="text-neutral-600">Quantity</dt><dd className="font-medium">{effectiveQuantity}</dd></div>
            <div className="flex justify-between border-b border-neutral-200 py-4"><dt className="text-neutral-600">Subtotal</dt><dd className="font-medium">{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between border-b border-neutral-200 py-4"><dt className="text-neutral-600">Discount</dt><dd className="font-medium">{discount > 0 ? `−${formatPrice(discount)}` : formatPrice(0)}</dd></div>
            <div className="flex items-end justify-between pt-6"><dt className="text-base font-semibold">Final total</dt><dd className="text-3xl font-semibold tracking-tight">{formatPrice(total)}</dd></div>
          </dl>
          <p className="mt-8 border-t border-neutral-200 pt-5 text-xs leading-5 text-neutral-500">Your order will be confirmed immediately after purchase.</p>
          <button type="submit" form="checkout-form" className="mt-5 w-full bg-black px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
            Purchase — {formatPrice(total)}
          </button>
        </aside>
      </div>
    </div>
  );
}

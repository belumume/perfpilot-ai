// product-page.jsx
import React, { useState, useEffect } from 'react';

// Missing Suspense boundaries for data fetching components
export default function ProductPage({ productId }) {
  return (
    <div className="product-page">
      <ProductInfo productId={productId} />
      <RelatedProducts productId={productId} />
      <ProductReviews productId={productId} />
      <RecommendedProducts userId="current-user" />
    </div>
  );
}

function ProductInfo({ productId }) {
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [productId]);
  
  if (!product) return <p>Loading product info...</p>;
  
  return (
    <div className="product-info">
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p className="price">${product.price}</p>
    </div>
  );
}

function RelatedProducts({ productId }) {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch(`/api/products/${productId}/related`)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, [productId]);
  
  if (products.length === 0) return <p>Loading related products...</p>;
  
  return (
    <div className="related-products">
      <h2>Related Products</h2>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image || "/placeholder.svg"} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  
  useEffect(() => {
    fetch(`/api/products/${productId}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data));
  }, [productId]);
  
  if (reviews.length === 0) return <p>Loading reviews...</p>;
  
  return (
    <div className="product-reviews">
      <h2>Customer Reviews</h2>
      {reviews.map(review => (
        <div key={review.id} className="review">
          <div className="rating">{review.rating} stars</div>
          <p>{review.comment}</p>
          <p className="author">- {review.author}</p>
        </div>
      ))}
    </div>
  );
}

function RecommendedProducts({ userId }) {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch(`/api/users/${userId}/recommendations`)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, [userId]);
  
  if (products.length === 0) return <p>Loading recommendations...</p>;
  
  return (
    <div className="recommended-products">
      <h2>Recommended For You</h2>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image || "/placeholder.svg"} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
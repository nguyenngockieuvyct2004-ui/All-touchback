import React from 'react';
import { Link } from 'react-router-dom';
import { previewUrl, makeSrcSet, defaultSizes } from '../lib/images.js';

export default function ProductCard({ product }){
  return (
    <Link to={`/products/${product._id}`} className="group card card-hover overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-brand-600/5 via-transparent to-brand-600/10 pointer-events-none" />
      <div className="flex flex-col h-full">
        {/* Image */}
        <div className="aspect-video w-full mb-3 overflow-hidden rounded-md bg-muted">
          {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
          <img
            src={previewUrl(product.images?.[0] || 'https://via.placeholder.com/800x450?text=TouchBack')}
            srcSet={product.images?.[0] ? makeSrcSet(product.images[0]) : undefined}
            sizes={defaultSizes('90vw')}
            alt={`Ảnh sản phẩm ${product.name}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        {/* Content */}
        <div className="flex-1">
          <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">{product.description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-brand-600 dark:text-brand-400 font-semibold text-sm">{product.price?.toLocaleString()} đ</div>
          <span className="px-2 py-1 rounded-md text-xs font-medium bg-brand-600/10 text-brand-700 dark:text-brand-300">Xem</span>
        </div>
      </div>
    </Link>
  );
}

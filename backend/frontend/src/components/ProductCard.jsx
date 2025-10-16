import React from 'react';
import { Link } from 'react-router-dom';
import { previewUrl, makeSrcSet, defaultSizes } from '../lib/images.js';

export default function ProductCard({ product }){
  return (
  <Link to={`/products/${product._id}`} className="group card card-hover overflow-hidden bg-[#fffdfa] dark:bg-gray-900 border-black/10 dark:border-gray-800 text-gray-900 dark:text-gray-100">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-black/5 pointer-events-none" />
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
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 transition line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">{product.description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-gray-900 dark:text-gray-100 font-semibold text-sm">{product.price?.toLocaleString()} đ</div>
          <span className="px-3 py-1 rounded-md text-xs font-medium border border-black/40 dark:border-white/30 text-gray-900 dark:text-gray-100 bg-transparent group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-gray-900 transition">Xem</span>
        </div>
      </div>
    </Link>
  );
}

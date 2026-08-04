export interface ProductCategory {
  name: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  images: string
  category: ProductCategory
}

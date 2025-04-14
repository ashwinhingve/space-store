import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import { HomeCard } from '@/components/shared/home/home-card'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import ProductSlider from '@/components/shared/product/product-slider'
import { Card, CardContent } from '@/components/ui/card'

import {
  getProductsForCard,
  getProductsByTag,
  getAllCategories,
} from '@/lib/actions/product.actions'
import { getSetting } from '@/lib/actions/setting.actions'
import { toSlug } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'
import { ICarousel } from '@/types'
import { IProduct } from '@/lib/db/models/product.model'

interface CardItem {
  name: string
  href: string
  image: string
}

export default async function HomePage() {
  const t = await getTranslations('Home')
  
  let carousels: ICarousel[] = []
  let todaysDeals: IProduct[] = []
  let bestSellingProducts: IProduct[] = []
  let categories: string[] = []
  let newArrivals: CardItem[] = []
  let featureds: CardItem[] = []
  let bestSellers: CardItem[] = []
  
  try {
    const { carousels: fetchedCarousels } = await getSetting()
    carousels = fetchedCarousels || []
    
    todaysDeals = await getProductsByTag({ tag: 'todays-deal' })
    bestSellingProducts = await getProductsByTag({ tag: 'best-seller' })
    categories = (await getAllCategories()).slice(0, 4)
    newArrivals = await getProductsForCard({ tag: 'new-arrival' })
    featureds = await getProductsForCard({ tag: 'featured' })
    bestSellers = await getProductsForCard({ tag: 'best-seller' })
  } catch (error) {
    console.error('Error loading home page data:', error)
    // Use empty arrays if there's an error
  }
  
  const cards = [
    {
      title: t('Categories to explore'),
      link: {
        text: t('See More'),
        href: '/search',
      },
      items: categories.map((category) => ({
        name: category,
        image: `/images/${toSlug(category)}.jpg`,
        href: `/search?category=${category}`,
      })),
    },
    {
      title: t('Explore New Arrivals'),
      items: newArrivals,
      link: {
        text: t('View All'),
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: t('Discover Best Sellers'),
      items: bestSellers,
      link: {
        text: t('View All'),
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: t('Featured Products'),
      items: featureds,
      link: {
        text: t('Shop Now'),
        href: '/search?tag=new-arrival',
      },
    },
  ]

  return (
    <>
      <HomeCarousel items={carousels} />
      <div className='md:p-4 md:space-y-4 bg-border'>
        <HomeCard cards={cards} />
        <Card className='w-full rounded-none'>
          <CardContent className='p-4 items-center gap-3'>
            <ProductSlider title={t("Today's Deals")} products={todaysDeals} />
          </CardContent>
        </Card>
        <Card className='w-full rounded-none'>
          <CardContent className='p-4 items-center gap-3'>
            <ProductSlider
              title={t('Best Selling Products')}
              products={bestSellingProducts}
              hideDetails
            />
          </CardContent>
        </Card>
      </div>

      <div className='p-4 bg-background'>
        <BrowsingHistoryList />
      </div>
    </>
  )
}

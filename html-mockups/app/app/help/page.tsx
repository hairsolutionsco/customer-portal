import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function HelpPage() {
  await requireAuth()

  const articles = await prisma.helpArticle.findMany({
    where: { isPublished: true },
    orderBy: [{ featured: 'desc' }, { displayOrder: 'asc' }],
  })

  const categories = [...new Set(articles.map(a => a.category))]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help & Support Articles</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find answers and learn how to care for your hair system
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl">
        <input
          type="search"
          placeholder="Search articles..."
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Browse by Category</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const categoryArticles = articles.filter(a => a.category === category)
            return (
              <div key={category} className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{category}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {categoryArticles.length} {categoryArticles.length === 1 ? 'article' : 'articles'}
                </p>
                <ul className="space-y-2">
                  {categoryArticles.slice(0, 3).map((article) => (
                    <li key={article.id}>
                      <Link
                        href={`/app/help/${article.slug}`}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        {article.title}
                      </Link>
                    </li>
                  ))}
                  {categoryArticles.length > 3 && (
                    <li>
                      <span className="text-sm text-gray-500">
                        +{categoryArticles.length - 3} more
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* Featured articles */}
      {articles.filter(a => a.featured).length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Featured Articles</h2>
          <div className="bg-white shadow rounded-lg divide-y">
            {articles.filter(a => a.featured).map((article) => (
              <Link
                key={article.id}
                href={`/app/help/${article.slug}`}
                className="block p-6 hover:bg-gray-50"
              >
                <h3 className="text-lg font-medium text-gray-900">{article.title}</h3>
                {article.excerpt && (
                  <p className="mt-2 text-sm text-gray-500">{article.excerpt}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

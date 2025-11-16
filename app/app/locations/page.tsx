import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { MapPinIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

export default async function LocationsPage() {
  await requireAuth()

  const locations = await prisma.affiliatedLocation.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Affiliated Locations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find Hair Solutions specialists near you (Private - customer access only)
        </p>
      </div>

      {/* TODO: Add filtering by country/city */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <div key={location.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{location.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {location.city}, {location.state || location.country}
                </p>
              </div>
              {location.isFeatured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Featured
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {location.address && (
                <div className="flex items-start text-sm text-gray-600">
                  <MapPinIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{location.address}</span>
                </div>
              )}
              {location.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{location.phone}</span>
                </div>
              )}
              {location.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <EnvelopeIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{location.email}</span>
                </div>
              )}
              {location.website && (
                <div className="flex items-center text-sm text-gray-600">
                  <GlobeAltIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                  <a href={location.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                    Visit website
                  </a>
                </div>
              )}
            </div>

            {location.servicesOffered.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {location.servicesOffered.slice(0, 3).map((service, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {service}
                    </span>
                  ))}
                  {location.servicesOffered.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-gray-600">
                      +{location.servicesOffered.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

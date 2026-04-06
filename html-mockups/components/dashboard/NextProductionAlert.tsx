import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { ClockIcon } from '@heroicons/react/24/outline'

interface NextProductionAlertProps {
  production: {
    id: string
    scheduledProductionDate: Date
    customizationConfirmed: boolean
    order: {
      orderNumber: string
      productName: string
    }
  }
}

export function NextProductionAlert({ production }: NextProductionAlertProps) {
  const daysUntil = Math.ceil(
    (new Date(production.scheduledProductionDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="bg-primary-50 border-l-4 border-primary-600 p-4 rounded-r-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <ClockIcon className="h-5 w-5 text-primary-600" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-primary-800">
            Next system production scheduled
          </h3>
          <div className="mt-2 text-sm text-primary-700">
            <p>
              Your next hair system is scheduled to enter production on{' '}
              <strong>{formatDate(production.scheduledProductionDate)}</strong>
              {' '}({daysUntil} days from now)
            </p>
          </div>
          <div className="mt-4 flex gap-3">
            {!production.customizationConfirmed ? (
              <>
                <Link
                  href={`/app/orders/${production.order}/confirm`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Confirm customization
                </Link>
                <Link
                  href={`/app/orders/${production.order}/postpone`}
                  className="inline-flex items-center px-3 py-1.5 border border-primary-600 text-xs font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50"
                >
                  Change date
                </Link>
              </>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700">
                ✓ Customization confirmed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'
import { TicketStatus } from '@prisma/client'

export default async function SupportPage() {
  const user = await requireAuth()

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  const statusColors: Record<TicketStatus, string> = {
    OPEN: 'bg-green-100 text-green-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    WAITING_FOR_CUSTOMER: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-purple-100 text-purple-800',
    CLOSED: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Get help from our support team
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/app/support/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            New Ticket
          </Link>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets</h3>
          <p className="text-gray-500 mb-6">
            Need help? Create a support ticket and we&apos;ll get back to you soon.
          </p>
          <Link
            href="/app/support/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Create Ticket
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg divide-y">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/app/support/${ticket.id}`}
              className="block p-6 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-gray-900">{ticket.ticketNumber}</p>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[ticket.status]}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">{ticket.subject}</h3>
                  {ticket.messages[0] && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {ticket.messages[0].content}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Created {formatDateTime(ticket.createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

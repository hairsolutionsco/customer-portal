'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  HomeIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/app', icon: HomeIcon },
  { name: 'Hair Profile', href: '/app/profile-setup', icon: UserCircleIcon },
  { name: 'Orders', href: '/app/orders', icon: ShoppingBagIcon },
  { name: 'Invoices', href: '/app/invoices', icon: DocumentTextIcon },
  { name: 'Customization', href: '/app/customization', icon: PaintBrushIcon },
  { name: 'Plans & Billing', href: '/app/billing', icon: CreditCardIcon },
  { name: 'Shop', href: '/app/shop', icon: ShoppingCartIcon },
  { name: 'Support', href: '/app/support', icon: ChatBubbleLeftRightIcon },
  { name: 'Help', href: '/app/help', icon: QuestionMarkCircleIcon },
  { name: 'Locations', href: '/app/locations', icon: MapPinIcon },
  { name: 'Settings', href: '/app/settings', icon: Cog6ToothIcon },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

function NavLinks() {
  const pathname = usePathname()

  return (
    <ul role="list" className="-mx-2 space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href ||
          (item.href !== '/app' && pathname.startsWith(item.href))

        return (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`
                group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6
                ${isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }
              `}
            >
              <item.icon
                className={`
                  h-6 w-6 shrink-0
                  ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'}
                `}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={mobileOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onMobileClose || (() => {})}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={onMobileClose}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <h1 className="text-xl font-bold text-gray-900">Hair Solutions</h1>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <NavLinks />
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-gray-900">Hair Solutions</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <NavLinks />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

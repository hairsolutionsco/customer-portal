'use client'

import { CustomizationTemplate, HairProfile } from '@prisma/client'

interface CustomizationTemplatesProps {
  templates: CustomizationTemplate[]
  hairProfile: HairProfile | null
  userId: string
}

export function CustomizationTemplates({ templates, hairProfile }: CustomizationTemplatesProps) {
  const handleQuickOrder = (templateId: string) => {
    // Navigate to order creation with pre-selected template
    window.location.href = `/app/orders/new?template=${encodeURIComponent(templateId)}`
  }

  return (
    <div className="space-y-6">
      {/* New Template Button */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Template</h2>
        <p className="text-sm text-gray-500 mb-4">
          Save different configurations for different occasions or needs
        </p>
        <button
          disabled={!hairProfile?.onboardingCompleted}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          New Template
        </button>
      </div>

      {/* Templates List */}
      {templates.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-500">
            Create your first customization template to save your preferences
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {templates.map((template) => (
            <div key={template.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                  {template.isDefault && (
                    <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Default
                    </span>
                  )}
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">Base Type</dt>
                  <dd className="mt-1 text-gray-900">{template.baseType}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Density</dt>
                  <dd className="mt-1 text-gray-900">{template.density}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Hair Color</dt>
                  <dd className="mt-1 text-gray-900">{template.hairColor}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Attachment</dt>
                  <dd className="mt-1 text-gray-900">{template.attachmentMethod}</dd>
                </div>
              </dl>

              {template.notes && (
                <p className="mt-4 text-sm text-gray-500">{template.notes}</p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleQuickOrder(template.id)}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
                >
                  Quick Order
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

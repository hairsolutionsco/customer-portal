'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HairProfile } from '@prisma/client'

interface HairProfileFormProps {
  initialData: HairProfile | null
  userId: string
}

export function HairProfileForm({ initialData }: HairProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(initialData?.onboardingCompleted ? 0 : initialData?.onboardingStep || 0)

  const [formData, setFormData] = useState({
    headCircumference: initialData?.headCircumference || '',
    frontToNape: initialData?.frontToNape || '',
    earToEar: initialData?.earToEar || '',
    templeToTemple: initialData?.templeToTemple || '',
    preferredStyle: initialData?.preferredStyle || '',
    density: initialData?.density || 'Medium',
    hairColor: initialData?.hairColor || '',
    baseType: initialData?.baseType || 'Swiss Lace',
    attachmentMethod: initialData?.attachmentMethod || 'Tape',
    activityLevel: initialData?.activityLevel || 'Moderate',
    sweatingLevel: initialData?.sweatingLevel || 'Moderate',
    workEnvironment: initialData?.workEnvironment || '',
    sportsActivities: initialData?.sportsActivities || [],
    notes: initialData?.notes || '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/profile/hair-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          onboardingCompleted: true,
        }),
      })

      if (!response.ok) throw new Error('Failed to save')

      router.push('/app')
      router.refresh()
    } catch (error) {
      alert('Failed to save profile')
      setLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Measurements */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Head Measurements (cm)</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Head Circumference</label>
            <input
              type="number"
              step="0.1"
              name="headCircumference"
              value={formData.headCircumference}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="57.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Front to Nape</label>
            <input
              type="number"
              step="0.1"
              name="frontToNape"
              value={formData.frontToNape}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="35.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ear to Ear</label>
            <input
              type="number"
              step="0.1"
              name="earToEar"
              value={formData.earToEar}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="32.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Temple to Temple</label>
            <input
              type="number"
              step="0.1"
              name="templeToTemple"
              value={formData.templeToTemple}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="28.0"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Hair Preferences</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Style</label>
            <input
              type="text"
              name="preferredStyle"
              value={formData.preferredStyle}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Natural Wave"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Density</label>
            <select
              name="density"
              value={formData.density}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="Light">Light</option>
              <option value="Medium">Medium</option>
              <option value="Heavy">Heavy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hair Color</label>
            <input
              type="text"
              name="hairColor"
              value={formData.hairColor}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Dark Brown (#3)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Base Type</label>
            <select
              name="baseType"
              value={formData.baseType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="Swiss Lace">Swiss Lace</option>
              <option value="French Lace">French Lace</option>
              <option value="Skin">Skin</option>
              <option value="Mono">Mono</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Attachment Method</label>
            <select
              name="attachmentMethod"
              value={formData.attachmentMethod}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="Tape">Tape</option>
              <option value="Glue">Glue</option>
              <option value="Clips">Clips</option>
              <option value="Combination">Combination</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lifestyle */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Lifestyle</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Activity Level</label>
            <select
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sweating Level</label>
            <select
              name="sweatingLevel"
              value={formData.sweatingLevel}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Work Environment</label>
            <input
              type="text"
              name="workEnvironment"
              value={formData.workEnvironment}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Office, Outdoor, etc."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Any additional information..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  )
}

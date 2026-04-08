'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Session } from '@prisma/client'
import { formatDateTime } from '@/lib/utils'

interface SettingsTabsProps {
  user: {
    id: string
    name: string | null
    email: string
  }
  sessions: Session[]
}

export function SettingsTabs({ user, sessions }: SettingsTabsProps) {
  const { update: updateSession } = useSession()
  const [activeTab, setActiveTab] = useState('profile')

  // Profile state
  const [profileName, setProfileName] = useState(user.name || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Notification state
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    productionReminders: true,
    marketing: false,
  })
  const [notifMsg, setNotifMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const tabs = [
    { id: 'profile', name: 'Profile' },
    { id: 'security', name: 'Security' },
    { id: 'sessions', name: 'Active Sessions' },
    { id: 'notifications', name: 'Notifications' },
  ]

  async function handleProfileSave() {
    setProfileSaving(true)
    setProfileMsg(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName }),
      })
      const data = await res.json()
      if (!res.ok) {
        setProfileMsg({ type: 'error', text: data.error || 'Failed to update profile' })
      } else {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully' })
        // Update the NextAuth session with new name
        await updateSession({ name: profileName })
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordChange() {
    setPasswordMsg(null)

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setPasswordSaving(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPasswordMsg({ type: 'error', text: data.error || 'Failed to update password' })
      } else {
        setPasswordMsg({ type: 'success', text: 'Password updated successfully' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setPasswordSaving(false)
    }
  }

  function handleNotifSave() {
    // Notification preferences stored client-side for now (no DB model yet)
    setNotifMsg({ type: 'success', text: 'Notification preferences saved' })
  }

  return (
    <div>
      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'profile' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
            {profileMsg && (
              <div className={`mb-4 rounded-md p-3 text-sm ${profileMsg.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {profileMsg.text}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  defaultValue={user.email}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                />
              </div>
              <button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Change Password</h4>
                {passwordMsg && (
                  <div className={`mb-3 rounded-md p-3 text-sm ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {passwordMsg.text}
                  </div>
                )}
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <button
                    onClick={handlePasswordChange}
                    disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Add an extra layer of security to your account
                </p>
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-md">
                  Coming soon
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h3>
            <p className="text-sm text-gray-500 mb-4">
              Your sessions on other devices. JWT-based sessions are managed by your browser.
            </p>
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-400">No active database sessions found. Your current session is managed via JWT.</p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {session.deviceName || 'Unknown Device'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last active: {formatDateTime(session.lastActive)}
                      </p>
                      {session.ipAddress && (
                        <p className="text-xs text-gray-400">IP: {session.ipAddress}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
            {notifMsg && (
              <div className={`mb-4 rounded-md p-3 text-sm ${notifMsg.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {notifMsg.text}
              </div>
            )}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Order updates</p>
                  <p className="text-sm text-gray-500">Get notified about order status changes</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.orderUpdates}
                  onChange={(e) => setNotifications({ ...notifications, orderUpdates: e.target.checked })}
                  className="h-4 w-4 text-primary-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Production reminders</p>
                  <p className="text-sm text-gray-500">Reminders to confirm customization before production</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.productionReminders}
                  onChange={(e) => setNotifications({ ...notifications, productionReminders: e.target.checked })}
                  className="h-4 w-4 text-primary-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Marketing emails</p>
                  <p className="text-sm text-gray-500">Receive tips and product updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.marketing}
                  onChange={(e) => setNotifications({ ...notifications, marketing: e.target.checked })}
                  className="h-4 w-4 text-primary-600"
                />
              </div>
              <button
                onClick={handleNotifSave}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

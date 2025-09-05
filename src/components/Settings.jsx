import { useState } from 'react'
import { User, Bell, Shield, CreditCard, Globe, Trash2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useUser } from '../contexts/UserContext'
import InfoCard from './InfoCard'
import LanguageSelector from './LanguageSelector'

const Settings = () => {
  const { t, language } = useLanguage()
  const { user, upgradeSubscription } = useUser()
  const [notifications, setNotifications] = useState({
    encounters: true,
    legal: true,
    updates: false
  })

  const handleUpgrade = () => {
    // In a real app, this would integrate with Stripe
    if (confirm('Upgrade to Premium for $4.99/month?')) {
      upgradeSubscription()
      alert('Successfully upgraded to Premium!')
    }
  }

  const clearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      // In a real app, this would clear user data
      alert('Data cleared successfully')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('settings')}</h1>
        <p className="text-white/80">
          Manage your account preferences and app settings
        </p>
      </div>

      {/* Account Settings */}
      <InfoCard>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary rounded-md">
              <User size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Account</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Status</label>
              <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md">
                <span className={`font-medium ${user.subscriptionStatus === 'premium' ? 'text-accent' : 'text-gray-600'}`}>
                  {user.subscriptionStatus === 'premium' ? 'Premium' : 'Free Plan'}
                </span>
                {user.subscriptionStatus === 'free' && (
                  <button onClick={handleUpgrade} className="btn-accent text-sm">
                    Upgrade Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </InfoCard>

      {/* Language Settings */}
      <InfoCard>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent rounded-md">
              <Globe size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Language</h3>
          </div>
          
          <LanguageSelector />
        </div>
      </InfoCard>

      {/* Notifications */}
      <InfoCard>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500 rounded-md">
              <Bell size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <div>
                <div className="font-medium text-gray-800">Encounter Reminders</div>
                <div className="text-sm text-gray-600">Get reminders to document encounters</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.encounters}
                  onChange={(e) => setNotifications({...notifications, encounters: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <div>
                <div className="font-medium text-gray-800">Legal Updates</div>
                <div className="text-sm text-gray-600">Notifications about law changes</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.legal}
                  onChange={(e) => setNotifications({...notifications, legal: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <div>
                <div className="font-medium text-gray-800">App Updates</div>
                <div className="text-sm text-gray-600">Feature updates and improvements</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.updates}
                  onChange={(e) => setNotifications({...notifications, updates: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </InfoCard>

      {/* Privacy & Security */}
      <InfoCard>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500 rounded-md">
              <Shield size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Privacy & Security</h3>
          </div>
          
          <div className="space-y-3">
            <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-800">Download My Data</div>
              <div className="text-sm text-gray-600">Export all your encounters and data</div>
            </button>
            
            <button 
              onClick={clearData}
              className="w-full text-left p-3 border border-red-200 rounded-md hover:bg-red-50 transition-colors text-red-700"
            >
              <div className="flex items-center gap-2">
                <Trash2 size={16} />
                <span className="font-medium">Clear All Data</span>
              </div>
              <div className="text-sm text-red-600">Permanently delete all encounters and recordings</div>
            </button>
          </div>
        </div>
      </InfoCard>

      {/* Subscription Management */}
      {user.subscriptionStatus === 'premium' && (
        <InfoCard>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent rounded-md">
                <CreditCard size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Subscription</h3>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="font-medium text-green-800">Premium Active</div>
                <div className="text-sm text-green-600">Next billing: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</div>
              </div>
              
              <button className="text-red-600 hover:underline text-sm">
                Cancel Subscription
              </button>
            </div>
          </div>
        </InfoCard>
      )}

      {/* App Information */}
      <InfoCard>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">About PocketLegal</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Version: 1.0.0</p>
            <p>Last Updated: {new Date().toLocaleDateString()}</p>
            <div className="pt-4 space-y-2">
              <a href="#" className="block text-primary hover:underline">Privacy Policy</a>
              <a href="#" className="block text-primary hover:underline">Terms of Service</a>
              <a href="#" className="block text-primary hover:underline">Contact Support</a>
            </div>
          </div>
        </div>
      </InfoCard>
    </div>
  )
}

export default Settings
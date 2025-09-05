import { useState } from 'react'
import { 
  Play, 
  Mic, 
  MapPin, 
  FileText, 
  Star,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useUser } from '../contexts/UserContext'
import InfoCard from './InfoCard'
import ActionMenu from './ActionMenu'

const Dashboard = ({ setActiveSection }) => {
  const { t } = useLanguage()
  const { user, encounters } = useUser()

  const quickActions = [
    {
      id: 'emergency-record',
      title: t('emergencyRecording'),
      description: 'One-tap recording for immediate situations',
      icon: Mic,
      color: 'bg-red-500',
      action: () => setActiveSection('recorder')
    },
    {
      id: 'legal-scripts',
      title: t('legalGuidance'),
      description: 'Get scripts for common scenarios',
      icon: FileText,
      color: 'bg-blue-500',
      action: () => setActiveSection('scripts')
    },
    {
      id: 'location-info',
      title: t('myLocation'),
      description: 'Location-specific legal information',
      icon: MapPin,
      color: 'bg-green-500',
      action: () => setActiveSection('location')
    }
  ]

  const scenarios = [
    { id: 'traffic', name: t('trafficStop'), urgency: 'medium' },
    { id: 'questioning', name: t('questioning'), urgency: 'high' },
    { id: 'search', name: t('searchWarrant'), urgency: 'high' },
    { id: 'arrest', name: t('arrest'), urgency: 'critical' }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
          Welcome to {t('appName')}
        </h1>
        <p className="text-white/80 text-lg">
          {t('tagline')}
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoCard variant="highlighted" className="md:col-span-2 lg:col-span-1">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('quickActions')}</h3>
            <div className="space-y-3">
              {quickActions.map(action => (
                <ActionMenu
                  key={action.id}
                  variant="primary"
                  onClick={action.action}
                  className="w-full justify-start"
                >
                  <div className={`p-2 rounded-md ${action.color} mr-3`}>
                    <action.icon size={16} className="text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-gray-600">{action.description}</div>
                  </div>
                </ActionMenu>
              ))}
            </div>
          </div>
        </InfoCard>

        {/* Know Your Rights Card */}
        <InfoCard>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent rounded-md">
                <FileText size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">{t('knowYourRights')}</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Access legal scripts and guidance for various police interaction scenarios.
            </p>
            <div className="space-y-2">
              {scenarios.map(scenario => (
                <div 
                  key={scenario.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => setActiveSection('scripts')}
                >
                  <span className="text-sm font-medium">{scenario.name}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    scenario.urgency === 'critical' ? 'bg-red-500' :
                    scenario.urgency === 'high' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                </div>
              ))}
            </div>
          </div>
        </InfoCard>

        {/* Recent Activity Card */}
        <InfoCard>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary rounded-md">
                <Clock size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">{t('recentActivity')}</h3>
            </div>
            
            {encounters.length > 0 ? (
              <div className="space-y-3">
                {encounters.slice(0, 3).map(encounter => (
                  <div key={encounter.encounterId} className="border-l-2 border-gray-200 pl-3">
                    <div className="text-sm font-medium">{encounter.type}</div>
                    <div className="text-xs text-gray-500">{encounter.location}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(encounter.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => setActiveSection('history')}
                  className="text-sm text-primary hover:underline"
                >
                  View all encounters
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </div>
        </InfoCard>
      </div>

      {/* Subscription Status */}
      {user.subscriptionStatus === 'free' && (
        <InfoCard variant="highlighted">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="text-yellow-500" size={24} />
              <div>
                <h3 className="text-lg font-bold text-gray-800">{t('upgrade')}</h3>
                <p className="text-gray-600">
                  Unlock unlimited recordings, encrypted storage, and premium features
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="bg-gray-50 p-3 rounded-md flex-1">
                <div className="text-sm font-medium text-gray-800">Current Plan: {t('free')}</div>
                <div className="text-xs text-gray-600">1 saved encounter limit</div>
              </div>
              <div className="bg-accent/10 p-3 rounded-md flex-1">
                <div className="text-sm font-medium text-accent">{t('premium')} - {t('monthlySubscription')}</div>
                <div className="text-xs text-gray-600">Unlimited encounters + more</div>
              </div>
            </div>
            <button className="w-full sm:w-auto mt-4 btn-accent">
              Upgrade Now
            </button>
          </div>
        </InfoCard>
      )}
    </div>
  )
}

export default Dashboard
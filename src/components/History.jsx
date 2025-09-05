import { useState } from 'react'
import { Calendar, MapPin, FileText, Trash2, Eye, Download } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useUser } from '../contexts/UserContext'
import InfoCard from './InfoCard'

const History = () => {
  const { t } = useLanguage()
  const { encounters } = useUser()
  const [selectedEncounter, setSelectedEncounter] = useState(null)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getEncounterTypeColor = (type) => {
    const colors = {
      'traffic-stop': 'bg-blue-100 text-blue-800',
      'questioning': 'bg-yellow-100 text-yellow-800',
      'search-warrant': 'bg-orange-100 text-orange-800',
      'arrest': 'bg-red-100 text-red-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const downloadRecording = (encounter) => {
    if (encounter.recordingUrl) {
      const a = document.createElement('a')
      a.href = encounter.recordingUrl
      a.download = `encounter-${encounter.encounterId}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('history')}</h1>
        <p className="text-white/80">
          View and manage your recorded encounters and legal interactions
        </p>
      </div>

      {encounters.length === 0 ? (
        <InfoCard>
          <div className="p-8 text-center">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Encounters Yet</h3>
            <p className="text-gray-500">
              Your recorded encounters will appear here. Use the Incident Recorder to start documenting interactions.
            </p>
          </div>
        </InfoCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Encounters List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">
              Encounters ({encounters.length})
            </h2>
            
            {encounters.map(encounter => (
              <InfoCard key={encounter.encounterId}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEncounterTypeColor(encounter.type)}`}>
                          {encounter.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{formatDate(encounter.timestamp)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span>{encounter.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedEncounter(encounter)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                  
                  {encounter.notes && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {encounter.notes}
                    </p>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    {encounter.recordingUrl && (
                      <button
                        onClick={() => downloadRecording(encounter)}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-accent text-white rounded hover:bg-green-600 transition-colors"
                      >
                        <Download size={12} />
                        Download
                      </button>
                    )}
                    
                    <button className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </InfoCard>
            ))}
          </div>

          {/* Encounter Details */}
          <div className="lg:sticky lg:top-6">
            {selectedEncounter ? (
              <InfoCard variant="highlighted">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Encounter Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Type</label>
                      <p className="text-gray-800 font-medium">
                        {selectedEncounter.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date & Time</label>
                      <p className="text-gray-800">{formatDate(selectedEncounter.timestamp)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-gray-800">{selectedEncounter.location}</p>
                    </div>
                    
                    {selectedEncounter.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Notes</label>
                        <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
                          {selectedEncounter.notes}
                        </p>
                      </div>
                    )}
                    
                    {selectedEncounter.recordingUrl && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-2">Recording</label>
                        <video 
                          src={selectedEncounter.recordingUrl}
                          controls 
                          className="w-full rounded-md"
                        />
                        <button
                          onClick={() => downloadRecording(selectedEncounter)}
                          className="mt-2 btn-accent text-sm"
                        >
                          <Download size={16} className="mr-2" />
                          Download Recording
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </InfoCard>
            ) : (
              <InfoCard>
                <div className="p-8 text-center">
                  <Eye size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Select an Encounter</h3>
                  <p className="text-gray-500">
                    Click on any encounter from the list to view its details here.
                  </p>
                </div>
              </InfoCard>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default History
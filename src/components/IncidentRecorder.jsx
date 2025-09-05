import { useState, useRef } from 'react'
import { Mic, Square, Save, MapPin, Clock } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useUser } from '../contexts/UserContext'
import InfoCard from './InfoCard'
import RecordButton from './RecordButton'

const IncidentRecorder = () => {
  const { t } = useLanguage()
  const { user, addEncounter } = useUser()
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [location, setLocation] = useState(null)
  const [notes, setNotes] = useState('')
  const [encounterType, setEncounterType] = useState('traffic-stop')
  
  const mediaRecorder = useRef(null)
  const timerRef = useRef(null)

  const startRecording = async () => {
    try {
      // Get location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
            })
          },
          (error) => {
            console.error('Location error:', error)
            setLocation({ address: 'Location unavailable' })
          }
        )
      }

      // Start media recording
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      })
      
      mediaRecorder.current = new MediaRecorder(stream)
      const chunks = []

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        setRecordedBlob(blob)
        
        // Stop all tracks to release camera/microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access camera/microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const saveEncounter = () => {
    if (user.subscriptionStatus === 'free' && user.encounters?.length >= 1) {
      alert('Free plan allows only 1 saved encounter. Upgrade to Premium for unlimited storage.')
      return
    }

    const encounter = {
      type: encounterType,
      location: location?.address || 'Unknown location',
      notes: notes,
      recordingUrl: recordedBlob ? URL.createObjectURL(recordedBlob) : null
    }

    addEncounter(encounter)
    
    // Reset form
    setRecordedBlob(null)
    setNotes('')
    setRecordingTime(0)
    
    alert('Encounter saved successfully!')
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const encounterTypes = [
    { value: 'traffic-stop', label: t('trafficStop') },
    { value: 'questioning', label: t('questioning') },
    { value: 'search-warrant', label: t('searchWarrant') },
    { value: 'arrest', label: t('arrest') }
  ]

  return (
    <div className="space-y-6">
      <div className="text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('incidentRecorder')}</h1>
        <p className="text-white/80">
          Record audio and video evidence with automatic timestamp and location data
        </p>
      </div>

      {/* Recording Controls */}
      <InfoCard variant="highlighted">
        <div className="p-6">
          <div className="text-center space-y-4">
            <RecordButton 
              variant={isRecording ? 'active' : 'inactive'}
              onClick={isRecording ? stopRecording : startRecording}
              className="mx-auto"
            >
              {isRecording ? (
                <>
                  <Square size={24} className="text-white" />
                  <span className="ml-2">{t('stopRecording')}</span>
                </>
              ) : (
                <>
                  <Mic size={24} className="text-white" />
                  <span className="ml-2">{t('startRecording')}</span>
                </>
              )}
            </RecordButton>

            {isRecording && (
              <div className="flex items-center justify-center gap-2 text-red-600 font-medium">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <Clock size={16} />
                <span>{formatTime(recordingTime)}</span>
              </div>
            )}

            {recordedBlob && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800 font-medium">
                  ✓ Recording completed ({formatTime(recordingTime)})
                </p>
                <video 
                  src={URL.createObjectURL(recordedBlob)}
                  controls 
                  className="w-full mt-2 rounded"
                />
              </div>
            )}
          </div>
        </div>
      </InfoCard>

      {/* Encounter Details */}
      <InfoCard>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Encounter Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Encounter Type
              </label>
              <select
                value={encounterType}
                onChange={(e) => setEncounterType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {encounterTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional details about the encounter..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            {location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} />
                <span className="text-sm">{location.address}</span>
              </div>
            )}
          </div>
        </div>
      </InfoCard>

      {/* Save Button */}
      {(recordedBlob || notes) && (
        <InfoCard>
          <div className="p-6 text-center">
            <button
              onClick={saveEncounter}
              className="btn-accent flex items-center gap-2 mx-auto"
            >
              <Save size={20} />
              {t('saveEncounter')}
            </button>
            
            {user.subscriptionStatus === 'free' && (
              <p className="text-sm text-gray-500 mt-2">
                Free plan: 1/1 encounters used. Upgrade for unlimited storage.
              </p>
            )}
          </div>
        </InfoCard>
      )}

      {/* Legal Notice */}
      <InfoCard>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Legal Notice</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Recording laws vary by state. In some states, you need consent from all parties 
            to record conversations. However, you generally have the right to record police 
            interactions in public spaces. This app does not provide legal advice. 
            Consult with an attorney for specific legal guidance.
          </p>
        </div>
      </InfoCard>
    </div>
  )
}

export default IncidentRecorder
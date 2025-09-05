import { useState, useRef } from 'react'
import { Mic, Square, Save, MapPin, Clock, Upload, AlertCircle } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useUser } from '../contexts/UserContext'
import { recordingStorageService } from '../services/pinataService.js'
import { locationDetectionService } from '../services/locationService.js'
import InfoCard from './InfoCard'
import RecordButton from './RecordButton'

const IncidentRecorder = () => {
  const { t } = useLanguage()
  const { user, addEncounter, canCreateEncounter, hasPremiumAccess, apiConfigValid } = useUser()
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [location, setLocation] = useState(null)
  const [notes, setNotes] = useState('')
  const [encounterType, setEncounterType] = useState('traffic-stop')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  
  const mediaRecorder = useRef(null)
  const timerRef = useRef(null)

  const startRecording = async () => {
    try {
      setError(null)
      
      // Check if user can create encounters
      if (!canCreateEncounter()) {
        setError('You have reached the free plan limit. Upgrade to Premium for unlimited recordings.')
        return
      }

      // Get location using enhanced location service
      try {
        const locationResult = await locationDetectionService.getCurrentLocation()
        if (locationResult.success) {
          setLocation({
            lat: locationResult.data.latitude,
            lng: locationResult.data.longitude,
            address: locationResult.data.address?.formattedAddress || 
                    `${locationResult.data.latitude.toFixed(4)}, ${locationResult.data.longitude.toFixed(4)}`,
            accuracy: locationResult.data.accuracy
          })
        } else {
          setLocation({ address: 'Location unavailable' })
        }
      } catch (locationError) {
        console.error('Location error:', locationError)
        setLocation({ address: 'Location unavailable' })
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

  const saveEncounter = async () => {
    if (!recordedBlob && !notes.trim()) {
      setError('Please record something or add notes before saving.')
      return
    }

    if (!canCreateEncounter()) {
      setError('Free plan allows only 1 saved encounter. Upgrade to Premium for unlimited storage.')
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)
      let recordingUrl = null

      // Upload recording to IPFS if available and user has premium or API is configured
      if (recordedBlob && (hasPremiumAccess() || apiConfigValid)) {
        setUploadProgress(25)
        
        const encounterData = {
          encounterId: Date.now().toString(),
          userId: user.userId,
          timestamp: new Date().toISOString(),
          location: location?.address || 'Unknown location',
          type: encounterType,
          duration: recordingTime
        }

        const uploadResult = await recordingStorageService.storeRecording(recordedBlob, encounterData)
        
        if (uploadResult.success) {
          recordingUrl = uploadResult.data.recordingUrl
          setUploadProgress(75)
        } else {
          console.error('Failed to upload recording:', uploadResult.error)
          // Continue with local storage for free users
          recordingUrl = URL.createObjectURL(recordedBlob)
        }
      } else if (recordedBlob) {
        // Use local blob URL for free users or when API is not configured
        recordingUrl = URL.createObjectURL(recordedBlob)
      }

      setUploadProgress(90)

      const encounter = {
        type: encounterType,
        location: location?.address || 'Unknown location',
        notes: notes.trim(),
        recordingUrl: recordingUrl,
        duration: recordingTime,
        coordinates: location ? { lat: location.lat, lng: location.lng } : null,
        accuracy: location?.accuracy || null
      }

      const result = await addEncounter(encounter)
      
      if (result.success) {
        setUploadProgress(100)
        
        // Reset form
        setRecordedBlob(null)
        setNotes('')
        setRecordingTime(0)
        setLocation(null)
        setError(null)
        
        alert('Encounter saved successfully!')
      } else {
        setError('Failed to save encounter: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving encounter:', error)
      setError('Failed to save encounter: ' + error.message)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle size={16} />
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <Upload size={16} />
                  <p className="font-medium">Uploading to secure storage...</p>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-blue-600 mt-1">{uploadProgress}% complete</p>
              </div>
            )}

            {!canCreateEncounter() && !hasPremiumAccess() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle size={16} />
                  <p className="font-medium">
                    Free plan limit reached. Upgrade to Premium for unlimited recordings.
                  </p>
                </div>
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

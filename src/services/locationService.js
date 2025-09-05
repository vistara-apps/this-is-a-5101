// Location Service for PocketLegal
// Handles location detection, geocoding, and location-aware legal information

import axios from 'axios'
import { config, getAuthHeaders } from '../config/api.js'
import { legalSummaryService } from './openaiService.js'

// Location Detection Service
export const locationDetectionService = {
  // Get current location using browser geolocation API
  async getCurrentLocation(options = {}) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }

      const geoOptions = { ...defaultOptions, ...options }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date(position.timestamp).toISOString()
            }

            // Get address information
            const addressInfo = await this.reverseGeocode(
              locationData.latitude, 
              locationData.longitude
            )

            resolve({
              success: true,
              data: {
                ...locationData,
                address: addressInfo.success ? addressInfo.data : null
              }
            })
          } catch (error) {
            resolve({
              success: true,
              data: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date(position.timestamp).toISOString(),
                address: null
              }
            })
          }
        },
        (error) => {
          let errorMessage = 'Unknown location error'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
          }

          reject({
            success: false,
            error: errorMessage,
            code: error.code
          })
        },
        geoOptions
      )
    })
  },

  // Reverse geocoding to get address from coordinates
  async reverseGeocode(latitude, longitude) {
    try {
      // Using a free geocoding service (in production, consider using a paid service)
      const response = await axios.get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      )

      const data = response.data

      return {
        success: true,
        data: {
          formattedAddress: data.locality 
            ? `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`
            : `${data.principalSubdivision}, ${data.countryName}`,
          city: data.locality || data.city,
          state: data.principalSubdivision,
          stateCode: data.principalSubdivisionCode,
          country: data.countryName,
          countryCode: data.countryCode,
          postalCode: data.postcode,
          coordinates: {
            latitude,
            longitude
          }
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return {
        success: false,
        error: 'Failed to get address information'
      }
    }
  },

  // Forward geocoding to get coordinates from address
  async geocodeAddress(address) {
    try {
      // Using Nominatim (OpenStreetMap) for free geocoding
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      )

      if (response.data.length === 0) {
        return {
          success: false,
          error: 'Address not found'
        }
      }

      const result = response.data[0]

      return {
        success: true,
        data: {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          formattedAddress: result.display_name,
          boundingBox: result.boundingbox
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return {
        success: false,
        error: 'Failed to geocode address'
      }
    }
  }
}

// Legal Information Service (location-aware)
export const locationLegalService = {
  // Get legal information based on location
  async getLegalInfoForLocation(location, scenario = 'general') {
    try {
      let stateCode = location.stateCode || location.state
      
      // Normalize state code
      if (stateCode && stateCode.length > 2) {
        stateCode = this.getStateCodeFromName(stateCode)
      }

      // Get state-specific legal information
      const legalInfo = await this.getStateLegalInfo(stateCode, scenario)
      
      // Generate AI-powered summary if needed
      let aiSummary = null
      if (legalInfo.success && legalInfo.data.needsAISummary) {
        const summaryResult = await legalSummaryService.generateSummary(
          location.formattedAddress,
          scenario,
          'en'
        )
        
        if (summaryResult.success) {
          aiSummary = summaryResult.data.summary
        }
      }

      return {
        success: true,
        data: {
          location: location,
          stateCode: stateCode,
          scenario: scenario,
          legalInfo: legalInfo.success ? legalInfo.data : null,
          aiSummary: aiSummary,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Error getting legal info for location:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get state-specific legal information
  async getStateLegalInfo(stateCode, scenario) {
    try {
      // This would typically query a legal database or API
      // For now, we'll use a static dataset with common legal information
      const stateLegalData = this.getStateLegalData()
      
      const stateInfo = stateLegalData[stateCode] || stateLegalData['DEFAULT']
      const scenarioInfo = stateInfo.scenarios[scenario] || stateInfo.scenarios['general']

      return {
        success: true,
        data: {
          state: stateCode,
          stateName: stateInfo.name,
          scenario: scenario,
          rights: scenarioInfo.rights,
          laws: scenarioInfo.laws,
          contacts: stateInfo.contacts,
          resources: stateInfo.resources,
          needsAISummary: scenarioInfo.needsAISummary || false
        }
      }
    } catch (error) {
      console.error('Error getting state legal info:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get state code from state name
  getStateCodeFromName(stateName) {
    const stateMap = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
      'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
      'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
      'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
      'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
      'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
      'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
      'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
      'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
      'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
      'Wisconsin': 'WI', 'Wyoming': 'WY'
    }

    return stateMap[stateName] || stateName
  },

  // Static legal data (in production, this would come from a database)
  getStateLegalData() {
    return {
      'CA': {
        name: 'California',
        scenarios: {
          'general': {
            rights: [
              'Right to remain silent (5th Amendment)',
              'Right to refuse searches without warrant',
              'Right to ask if you are free to leave',
              'Right to an attorney'
            ],
            laws: [
              'California Vehicle Code Section 2800 - Failure to yield to police',
              'Penal Code Section 148 - Resisting arrest',
              'California Constitution Article 1, Section 13 - Search and seizure'
            ],
            needsAISummary: true
          },
          'traffic-stop': {
            rights: [
              'Provide license, registration, and insurance when requested',
              'Right to remain silent beyond identification',
              'Right to refuse vehicle searches without warrant',
              'Right to record the interaction'
            ],
            laws: [
              'Vehicle Code 12951 - License requirement',
              'Vehicle Code 16028 - Insurance requirement',
              'Penal Code 69 - Resisting executive officer'
            ],
            needsAISummary: false
          }
        },
        contacts: {
          'ACLU': '(213) 977-9500',
          'Legal Aid': '(800) 520-2356',
          'Public Defender': '(varies by county)'
        },
        resources: [
          'California Courts Self-Help Center',
          'State Bar of California',
          'California Department of Justice'
        ]
      },
      'DEFAULT': {
        name: 'United States',
        scenarios: {
          'general': {
            rights: [
              'Right to remain silent (5th Amendment)',
              'Right against unreasonable searches (4th Amendment)',
              'Right to an attorney (6th Amendment)',
              'Right to ask if you are free to leave'
            ],
            laws: [
              'U.S. Constitution 4th Amendment - Search and seizure',
              'U.S. Constitution 5th Amendment - Self-incrimination',
              'U.S. Constitution 6th Amendment - Right to counsel'
            ],
            needsAISummary: true
          },
          'traffic-stop': {
            rights: [
              'Provide identification when requested',
              'Right to remain silent beyond identification',
              'Right to refuse vehicle searches without warrant',
              'Right to record the interaction (in most states)'
            ],
            laws: [
              'Terry v. Ohio (1968) - Stop and frisk',
              'Pennsylvania v. Mimms (1977) - Exit vehicle order',
              'Rodriguez v. United States (2015) - Traffic stop duration'
            ],
            needsAISummary: false
          }
        },
        contacts: {
          'ACLU': '(212) 549-2500',
          'Legal Aid': '(varies by location)',
          'Public Defender': '(varies by jurisdiction)'
        },
        resources: [
          'American Civil Liberties Union',
          'National Association for the Advancement of Colored People',
          'Electronic Frontier Foundation'
        ]
      }
    }
  }
}

// Emergency Contacts Service
export const emergencyContactsService = {
  // Get emergency contacts based on location
  async getEmergencyContacts(location) {
    try {
      const stateCode = location.stateCode || location.state
      
      // Get local emergency contacts
      const contacts = {
        emergency: '911',
        police: this.getLocalPoliceNumber(location),
        legal: this.getLegalAidNumber(stateCode),
        aclu: this.getACLUNumber(stateCode),
        family: null // User would set this
      }

      return {
        success: true,
        data: contacts
      }
    } catch (error) {
      console.error('Error getting emergency contacts:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get local police non-emergency number
  getLocalPoliceNumber(location) {
    // In production, this would query a database of local police departments
    return '(varies by location)'
  },

  // Get legal aid number by state
  getLegalAidNumber(stateCode) {
    const legalAidNumbers = {
      'CA': '(800) 520-2356',
      'NY': '(212) 577-3300',
      'TX': '(800) 504-7030',
      'FL': '(800) 405-1417'
    }

    return legalAidNumbers[stateCode] || '(varies by state)'
  },

  // Get ACLU number by state
  getACLUNumber(stateCode) {
    const acluNumbers = {
      'CA': '(213) 977-9500',
      'NY': '(212) 549-2500',
      'TX': '(713) 942-8146',
      'FL': '(786) 363-2714'
    }

    return acluNumbers[stateCode] || '(212) 549-2500'
  }
}

// Location utilities
export const locationUtils = {
  // Calculate distance between two points
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const d = R * c // Distance in kilometers
    return d
  },

  deg2rad(deg) {
    return deg * (Math.PI/180)
  },

  // Format coordinates for display
  formatCoordinates(lat, lng, precision = 4) {
    return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`
  },

  // Check if location is within US
  isWithinUS(latitude, longitude) {
    // Rough bounding box for continental US
    return latitude >= 24.396308 && latitude <= 49.384358 &&
           longitude >= -125.000000 && longitude <= -66.934570
  }
}

// Export all services
export default {
  locationDetectionService,
  locationLegalService,
  emergencyContactsService,
  locationUtils
}

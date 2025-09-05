// Pinata IPFS Service for PocketLegal
// Handles secure, immutable storage of encounter recordings and evidence

import axios from 'axios'
import { config, getAuthHeaders } from '../config/api.js'

// Pinata API client
const pinataAPI = axios.create({
  baseURL: config.pinata.baseURL,
  headers: getAuthHeaders('pinata')
})

// File Storage Service
export const fileStorageService = {
  // Upload file to IPFS via Pinata
  async uploadFile(file, metadata = {}) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Add metadata
      const pinataMetadata = {
        name: metadata.name || file.name,
        keyvalues: {
          type: metadata.type || 'encounter-recording',
          userId: metadata.userId || 'unknown',
          encounterId: metadata.encounterId || '',
          timestamp: metadata.timestamp || new Date().toISOString(),
          ...metadata.customData
        }
      }
      
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata))
      
      // Pinata options for file handling
      const pinataOptions = {
        cidVersion: 1,
        wrapWithDirectory: false
      }
      
      formData.append('pinataOptions', JSON.stringify(pinataOptions))

      const response = await pinataAPI.post('/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      })

      const result = {
        success: true,
        data: {
          ipfsHash: response.data.IpfsHash,
          pinSize: response.data.PinSize,
          timestamp: response.data.Timestamp,
          url: `${config.pinata.gateway}/${response.data.IpfsHash}`,
          metadata: pinataMetadata
        }
      }

      return result
    } catch (error) {
      console.error('Error uploading file to Pinata:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message
      }
    }
  },

  // Upload JSON data to IPFS
  async uploadJSON(jsonData, metadata = {}) {
    try {
      const pinataMetadata = {
        name: metadata.name || 'legal-data',
        keyvalues: {
          type: metadata.type || 'legal-content',
          userId: metadata.userId || 'system',
          timestamp: new Date().toISOString(),
          ...metadata.customData
        }
      }

      const pinataOptions = {
        cidVersion: 1
      }

      const data = {
        pinataContent: jsonData,
        pinataMetadata,
        pinataOptions
      }

      const response = await pinataAPI.post('/pinning/pinJSONToIPFS', data)

      return {
        success: true,
        data: {
          ipfsHash: response.data.IpfsHash,
          pinSize: response.data.PinSize,
          timestamp: response.data.Timestamp,
          url: `${config.pinata.gateway}/${response.data.IpfsHash}`,
          metadata: pinataMetadata
        }
      }
    } catch (error) {
      console.error('Error uploading JSON to Pinata:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message
      }
    }
  },

  // Get file from IPFS
  async getFile(ipfsHash) {
    try {
      const url = `${config.pinata.gateway}/${ipfsHash}`
      const response = await axios.get(url)
      
      return {
        success: true,
        data: response.data,
        url: url
      }
    } catch (error) {
      console.error('Error getting file from IPFS:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // List pinned files
  async listFiles(filters = {}) {
    try {
      const params = {
        status: 'pinned',
        pageLimit: filters.limit || 10,
        pageOffset: filters.offset || 0
      }

      if (filters.userId) {
        params.metadata = JSON.stringify({
          keyvalues: {
            userId: { value: filters.userId, op: 'eq' }
          }
        })
      }

      const response = await pinataAPI.get('/data/pinList', { params })

      return {
        success: true,
        data: {
          files: response.data.rows,
          count: response.data.count
        }
      }
    } catch (error) {
      console.error('Error listing files:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message
      }
    }
  },

  // Unpin file from IPFS
  async unpinFile(ipfsHash) {
    try {
      await pinataAPI.delete(`/pinning/unpin/${ipfsHash}`)
      
      return {
        success: true,
        message: 'File unpinned successfully'
      }
    } catch (error) {
      console.error('Error unpinning file:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message
      }
    }
  }
}

// Recording Storage Service (specialized for encounter recordings)
export const recordingStorageService = {
  // Store encounter recording with encryption metadata
  async storeRecording(recordingBlob, encounterData) {
    try {
      // Create file from blob
      const file = new File([recordingBlob], `encounter-${encounterData.encounterId}.webm`, {
        type: recordingBlob.type
      })

      // Prepare metadata
      const metadata = {
        name: `Encounter Recording - ${encounterData.timestamp}`,
        type: 'encounter-recording',
        userId: encounterData.userId,
        encounterId: encounterData.encounterId,
        timestamp: encounterData.timestamp,
        customData: {
          location: encounterData.location,
          encounterType: encounterData.type,
          duration: encounterData.duration,
          encrypted: false // In production, implement client-side encryption
        }
      }

      const result = await fileStorageService.uploadFile(file, metadata)
      
      if (result.success) {
        // Store reference in encounter data
        return {
          success: true,
          data: {
            recordingUrl: result.data.url,
            ipfsHash: result.data.ipfsHash,
            metadata: result.data.metadata
          }
        }
      }

      return result
    } catch (error) {
      console.error('Error storing recording:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get user's recordings
  async getUserRecordings(userId) {
    try {
      const result = await fileStorageService.listFiles({
        userId,
        limit: 50
      })

      if (result.success) {
        // Filter for recordings only
        const recordings = result.data.files.filter(file => 
          file.metadata?.keyvalues?.type === 'encounter-recording'
        )

        return {
          success: true,
          data: recordings.map(recording => ({
            ipfsHash: recording.ipfs_pin_hash,
            url: `${config.pinata.gateway}/${recording.ipfs_pin_hash}`,
            metadata: recording.metadata,
            size: recording.size,
            timestamp: recording.date_pinned
          }))
        }
      }

      return result
    } catch (error) {
      console.error('Error getting user recordings:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Delete recording
  async deleteRecording(ipfsHash) {
    try {
      return await fileStorageService.unpinFile(ipfsHash)
    } catch (error) {
      console.error('Error deleting recording:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Legal Document Storage Service
export const documentStorageService = {
  // Store legal documents and templates
  async storeLegalDocument(documentData, metadata = {}) {
    try {
      const docMetadata = {
        name: metadata.name || 'Legal Document',
        type: 'legal-document',
        userId: metadata.userId || 'system',
        customData: {
          documentType: metadata.documentType || 'template',
          state: metadata.state,
          language: metadata.language || 'en',
          version: metadata.version || '1.0'
        }
      }

      return await fileStorageService.uploadJSON(documentData, docMetadata)
    } catch (error) {
      console.error('Error storing legal document:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get legal document
  async getLegalDocument(ipfsHash) {
    try {
      return await fileStorageService.getFile(ipfsHash)
    } catch (error) {
      console.error('Error getting legal document:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Utility functions
export const pinataUtils = {
  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Generate IPFS URL
  generateIPFSUrl(hash) {
    return `${config.pinata.gateway}/${hash}`
  },

  // Validate IPFS hash
  isValidIPFSHash(hash) {
    // Basic validation for IPFS hash format
    return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash) || 
           /^baf[a-z0-9]{56}$/.test(hash)
  }
}

// Export all services
export default {
  fileStorageService,
  recordingStorageService,
  documentStorageService,
  pinataUtils
}

import { createContext, useContext, useState } from 'react'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    userId: 'demo-user',
    email: 'demo@pocketlegal.com',
    subscriptionStatus: 'free', // 'free' or 'premium'
    preferredLanguage: 'en'
  })

  const [encounters, setEncounters] = useState([
    {
      encounterId: '1',
      timestamp: new Date().toISOString(),
      location: 'Downtown, Main St',
      type: 'Traffic Stop',
      notes: 'Routine traffic stop, no issues',
      recordingUrl: null
    }
  ])

  const addEncounter = (encounter) => {
    const newEncounter = {
      ...encounter,
      encounterId: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    setEncounters(prev => [newEncounter, ...prev])
  }

  const upgradeSubscription = () => {
    setUser(prev => ({ ...prev, subscriptionStatus: 'premium' }))
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      encounters, 
      addEncounter,
      upgradeSubscription
    }}>
      {children}
    </UserContext.Provider>
  )
}
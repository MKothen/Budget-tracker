import React, { useEffect, useState } from 'react'
import CalendarView from './components/CalendarView'
import { db, auth } from './firebase'
import { collection, onSnapshot, query, orderBy, where, doc, getDoc, setDoc } from 'firebase/firestore'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import { computeDailyBalances, summarizeMonth, forecastCashflow } from './utils'
import Auth from './components/Auth'
import { onAuthStateChanged } from 'firebase/auth'
import ThemeProvider from './contexts/ThemeProvider'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import SavingsGoals from './components/SavingsGoals'
import Settings from './components/Settings'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CashflowChart from './components/CashflowChart'

export default function App() {
  const [events, setEvents] = useState([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [settings, setSettings] = useState({})

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, u => {
      setUser(u)
    })
    return () => unsubAuth()
  }, [])

  useEffect(() => {
    if (!user) {
      setEvents([])
      setSettings({})
      return
    }
    const q = query(collection(db, 'events'), orderBy('date'), where('uid','==', user.uid))
    const unsub = onSnapshot(q, (snap) => {
      const arr = []
      snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }))
      setEvents(arr)
    })
    // load settings
    const loadSettings = async () => {
      const ref = doc(db, 'users', user.uid)
      const snap = await getDoc(ref)
      if (snap.exists()) setSettings(snap.data())
    }
    loadSettings()
    return () => unsub()
  }, [user])

  if (!user) {
    return <Auth onAuth={() => {}} />
  }

  // expose a simple handler for TopBar's menu icon (small screens)
  React.useEffect(() => {
    window.__onMenuClick = () => setSidebarOpen(s => !s)
    return () => { window.__onMenuClick = undefined }
  }, [])

  return (
    <ThemeProvider user={user}>
      <Box sx={{display:'flex'}}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onSettingsClick={() => setSettingsOpen(true)} />
        <Box component="main" sx={{flex:1, ml:28, p:3}}>
          <TopBar user={user} />
          <Container maxWidth="xl">
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2">Net worth</Typography>
                    <Typography variant="h4">€{(summarizeMonth(events).income - summarizeMonth(events).expense).toFixed(2)}</Typography>
                    <Typography variant="body2">This month</Typography>
                  </CardContent>
                </Card>
                <Box sx={{mt:2}}>
                  <Typography variant="h6">Upcoming</Typography>
                  <Paper sx={{p:1, mt:1}}>
                    {/* list upcoming 5 events */}
                    {events.slice(0,5).map(ev => (
                      <Box key={ev.id} sx={{display:'flex', justifyContent:'space-between', py:1}}>
                        <div>
                          <Typography variant="body2">{ev.title || ev.category}</Typography>
                          <Typography variant="caption">{ev.date}</Typography>
                        </div>
                        <Typography>{ev.amount >=0 ? '+' : '-'}€{Math.abs(ev.amount)}</Typography>
                      </Box>
                    ))}
                  </Paper>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper sx={{p:2}}>
                  <CalendarView events={events} user={user} />
                </Paper>
                <Box sx={{mt:2}}>
                  <Typography variant="h6">Cashflow forecast (6 months)</Typography>
                  <CashflowChart events={events} />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{p:2}}>
                  <SavingsGoals user={user} events={events} />
                </Paper>
              </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} user={user} />
    </ThemeProvider>
  )
}

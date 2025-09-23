import React, { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function Settings({ open, onClose, user }) {
  const [settings, setSettings] = useState({ currency: 'EUR', forecastDays: 60 })
  useEffect(() => {
    if (!user || !open) return
    const load = async () => {
      const ref = doc(db, 'users', user.uid)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data().settings || {}
        setSettings(s => ({...s, ...data}))
      }
    }
    load()
  }, [user, open])

  const save = async () => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    await setDoc(ref, { settings }, { merge: true })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Box sx={{display:'flex', flexDirection:'column', gap:2, mt:1}}>
          <TextField label="Currency" value={settings.currency}
            onChange={e => setSettings(s => ({...s, currency: e.target.value}))} />
          <TextField label="Forecast days" type="number" value={settings.forecastDays}
            onChange={e => setSettings(s => ({...s, forecastDays: Number(e.target.value)}))} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={save}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}
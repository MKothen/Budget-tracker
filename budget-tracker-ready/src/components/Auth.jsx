import React, { useState } from 'react'
import { auth, googleProvider } from '../firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export default function Auth({ onAuth }) {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      if (onAuth) onAuth()
    } catch (e) {
      setError(e.message)
    }
  }

  const signInGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      if (onAuth) onAuth()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <Box sx={{maxWidth:360, margin:'24px auto', p:2, bgcolor:'white', borderRadius:2}}>
      <Typography variant="h6" gutterBottom>{isRegister ? 'Register' : 'Sign in'}</Typography>
      <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} fullWidth sx={{mb:1}} />
      <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} fullWidth sx={{mb:1}} />
      {error && <Typography color="error" variant="body2">{error}</Typography>}
      <Box sx={{display:'flex', gap:1, mt:1}}>
        <Button variant="contained" onClick={submit}>{isRegister ? 'Register' : 'Sign in'}</Button>
        <Button onClick={()=>setIsRegister(s=>!s)}>{isRegister ? 'Have an account?' : 'Register'}</Button>
      </Box>
      <Box sx={{mt:2}}>
        <Button variant="outlined" onClick={signInGoogle}>Sign in with Google</Button>
      </Box>
    </Box>
  )
}

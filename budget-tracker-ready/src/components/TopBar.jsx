import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import MenuIcon from '@mui/icons-material/Menu'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import Box from '@mui/material/Box'
import { useAppTheme } from '../contexts/ThemeProvider'
import { auth } from '../firebase'
import Button from '@mui/material/Button'
import { signOut } from 'firebase/auth'

export default function TopBar({ user }) {
  const { mode, toggle } = useAppTheme()

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{mb:2}}>
      <Toolbar>
        <IconButton edge="start" sx={{mr:1, display:{xs:'inline-flex', sm:'none'}}} onClick={() => { if (typeof window.__onMenuClick === 'function') window.__onMenuClick() }}><MenuIcon /></IconButton>
        <Typography variant="h6" sx={{flex:1}}>Budget Calendar</Typography>
        <Box sx={{display:'flex', alignItems:'center', gap:1}}>
          <Tooltip title={mode === 'light' ? 'Switch to dark' : 'Switch to light'}>
            <Switch checked={mode==='dark'} onChange={toggle} />
          </Tooltip>
          <Typography variant="body2">{user.email}</Typography>
          <Button onClick={() => signOut(auth)}>Sign out</Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

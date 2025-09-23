import React from 'react'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import HomeIcon from '@mui/icons-material/Home'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import BarChartIcon from '@mui/icons-material/BarChart'
import SettingsIcon from '@mui/icons-material/Settings'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

export default function Sidebar({ open, onClose, onSettingsClick }) {
  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

  const content = (
    <Box sx={{width: 240, p:1}}>
      <List>
        <ListItem button>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><CalendarTodayIcon /></ListItemIcon>
          <ListItemText primary="Calendar" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><ReceiptLongIcon /></ListItemIcon>
          <ListItemText primary="Transactions" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><BarChartIcon /></ListItemIcon>
          <ListItemText primary="Reports" />
        </ListItem>
        <ListItem button onClick={() => { onSettingsClick && onSettingsClick(); if (onClose) onClose(); }}>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Box>
  )

  if (isSm) {
    return (
      <Drawer
        variant="temporary"
        open={Boolean(open)}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
      >
        {content}
      </Drawer>
    )
  }

  return (
    <Drawer variant="permanent" anchor="left" open>
      {content}
    </Drawer>
  )
}
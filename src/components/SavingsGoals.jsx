import React, { useEffect, useState, useMemo } from 'react'
import { collection, onSnapshot, query, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import AddIcon from '@mui/icons-material/Add'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { TransitionGroup } from 'react-transition-group'
import Collapse from '@mui/material/Collapse'

// Compute saved amount for a goal using event schema:
// event: { id, title, date (ISO), amount (number), type: 'income'|'expense', category?: string }
// Goal schema: { name, target, startDate?, deadline?, category? }
function computeSavedForGoal(goal, events) {
  if (!events || events.length === 0) return 0
  const start = goal.startDate ? new Date(goal.startDate) : null
  const end = goal.deadline ? new Date(goal.deadline) : null

  const relevant = events.filter(e => {
    const d = new Date(e.date)
    if (isNaN(d)) return false
    if (start && d < start) return false
    if (end && d > end) return false

    if (goal.category) {
      return (e.category || '').toLowerCase() === goal.category.toLowerCase()
    }
    // otherwise consider any explicit 'savings' category or direct transfers;
    // but for more accuracy we include incomes and positive transfers
    return true
  })

  // Sum net contributions: income adds, expense subtracts
  const total = relevant.reduce((s, e) => {
    const amt = Number(e.amount || 0)
    if (e.type === 'expense') return s - Math.abs(amt)
    return s + amt
  }, 0)
  return Math.round(total * 100) / 100
}

export default function SavingsGoals({ user, events }) {
  const [goals, setGoals] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name:'', target:0, deadline:'', category:'', startDate:'' })
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'users', user.uid, 'goals'))
    const unsub = onSnapshot(q, snap => {
      const arr = []
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }))
      setGoals(arr)
    })
    return unsub
  }, [user])

  const withProgress = useMemo(() => {
    return goals.map(g => {
      const saved = computeSavedForGoal(g, events || [])
      const pct = g.target ? Math.min(100, Math.round((saved / g.target) * 100)) : 0
      return {...g, saved, pct}
    })
  }, [goals, events])

  const submit = async () => {
    if (!user) return
    const docRef = collection(db, 'users', user.uid, 'goals')
    if (editing) {
      const ref = doc(db, 'users', user.uid, 'goals', editing.id)
      await updateDoc(ref, {...form, target: Number(form.target || 0)})
    } else {
      await addDoc(docRef, {...form, target: Number(form.target || 0), startDate: form.startDate || new Date().toISOString()})
    }
    setForm({ name:'', target:0, deadline:'', category:'', startDate: '' })
    setEditing(null)
    setOpen(false)
  }

  const handleDelete = async (id) => {
    if (!user) return
    if (!confirm('Delete this goal?')) return
    await deleteDoc(doc(db, 'users', user.uid, 'goals', id))
  }

  const handleEdit = (g) => {
    setEditing(g)
    setForm({
      name: g.name || '',
      target: g.target || 0,
      deadline: g.deadline || '',
      category: g.category || '',
      startDate: g.startDate || ''
    })
    setOpen(true)
  }

  return (
    <Box>
      <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', mb:1}}>
        <Typography variant="h6">Savings goals</Typography>
        <Button startIcon={<AddIcon />} onClick={() => { setOpen(true); setEditing(null); setForm({ name:'', target:0, deadline:'', category:'', startDate:'' }) }}>Add goal</Button>
      </Box>

      <TransitionGroup>
        {withProgress.map(g => (
          <Collapse key={g.id}>
            <Paper sx={{p:2, mb:1, position:'relative', overflow:'hidden'}}>
              <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <Box>
                  <Typography variant="subtitle1">{g.name}</Typography>
                  <Typography variant="body2">{g.saved} / {g.target} ({g.pct}%)</Typography>
                  <Typography variant="caption">Deadline: {g.deadline ? new Date(g.deadline).toLocaleDateString() : '—'}</Typography>
                </Box>
                <Box>
                  <IconButton onClick={() => handleEdit(g)} aria-label="edit"><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(g.id)} aria-label="delete"><DeleteIcon /></IconButton>
                </Box>
              </Box>
              <LinearProgress variant="determinate" value={g.pct} sx={{height:10, borderRadius:2, mt:1}} />
            </Paper>
          </Collapse>
        ))}
      </TransitionGroup>

      {withProgress.length === 0 && <Typography variant="body2">No savings goals yet.</Typography>}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editing ? 'Edit goal' : 'Add savings goal'}</DialogTitle>
        <DialogContent>
          <Box sx={{display:'flex', flexDirection:'column', gap:2, mt:1}}>
            <TextField label="Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            <TextField label="Target amount" type="number" value={form.target} onChange={e => setForm(f => ({...f, target: e.target.value}))} />
            <TextField label="Category (optional)" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} />
            <TextField label="Start date (ISO)" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} placeholder="2025-01-01" />
            <TextField label="Deadline (ISO)" value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))} placeholder="2025-12-31" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Button>
          <Button variant="contained" onClick={submit}>{editing ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
import React, { useRef, useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { addDoc, collection, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import { computeAmountFromHours, expandRecurringEvents, computeDailyBalancesFromList } from '../utils'
import CashflowChart from './CashflowChart'
import Stack from '@mui/material/Stack'

const defaultCategories = {
  income: ['Job', 'Toeslagen', 'DUO', 'Family'],
  expense: ['Rent', 'Health Insurance', 'Subscriptions', 'Groceries', 'Other']
}

export default function CalendarView({ events, user }) {
  const calendarRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    id: null,
    title: '',
    date: '',
    type: 'expense',
    category: 'Other',
    amount: '',
    hours: '',
    rate: '',
    recurring: 'none',
    recurringEnds: ''
  })

  const [previewEvents, setPreviewEvents] = useState([])

  useEffect(() => {
    // expand recurring events for calendar preview (next 12 months)
    const expanded = expandRecurringEvents(events, 12)
    setPreviewEvents(expanded)
  }, [events])

  const handleDateClick = (arg) => {
    setForm(f => ({ ...f, id:null, date: arg.dateStr }))
    setOpen(true)
  }

  const handleEventClick = (clickInfo) => {
    const ev = clickInfo.event.extendedProps.original || clickInfo.event.extendedProps
    // populate form for editing
    setForm({
      id: ev.id || null,
      title: ev.title || '',
      date: ev.date,
      type: ev.type || (ev.amount >=0 ? 'income' : 'expense'),
      category: ev.category || '',
      amount: Math.abs(ev.amount) || '',
      hours: ev.hours || '',
      rate: ev.rate || '',
      recurring: ev.recurring || 'none',
      recurringEnds: ev.recurringEnds || ''
    })
    setOpen(true)
  }

  const handleInput = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
  }

  const submit = async () => {
    let amount = parseFloat(form.amount || 0)
    if (form.type === 'income' && form.category === 'Job') {
      const hours = parseFloat(form.hours || 0)
      const rate = parseFloat(form.rate || 0)
      amount = computeAmountFromHours(hours, rate)
    }
    if (form.type === 'expense') amount = -Math.abs(amount)

    const docData = {
      title: form.title || (form.type === 'income' ? 'Income' : 'Expense'),
      date: form.date,
      type: form.type,
      category: form.category,
      amount: Number(amount),
      hours: form.hours ? Number(form.hours) : undefined,
      rate: form.rate ? Number(form.rate) : undefined,
      recurring: form.recurring !== 'none' ? form.recurring : null,
      recurringEnds: form.recurringEnds || null,
      uid: user.uid,
      updatedAt: new Date().toISOString()
    }

    if (form.id) {
      const ref = doc(db, 'events', form.id)
      await updateDoc(ref, docData)
    } else {
      await addDoc(collection(db, 'events'), { ...docData, createdAt: new Date().toISOString() })
    }
    setOpen(false)
    setForm({
      id: null, title:'', date:'', type:'expense', category:'Other', amount:'', hours:'', rate:'', recurring:'none', recurringEnds:''
    })
  }

  const remove = async () => {
    if (!form.id) {
      // not saved yet
      setOpen(false)
      return
    }
    const ref = doc(db, 'events', form.id)
    await deleteDoc(ref)
    setOpen(false)
  }

  const fcEvents = previewEvents.map(e => ({
    title: `${e.category}: €${e.amount}`,
    start: e.date,
    extendedProps: { ...e, original: e.originalEvent }
  }))

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{mb:1}}>
        <Button onClick={() => calendarRef.current.getApi().prev()}>Previous</Button>
        <Button onClick={() => calendarRef.current.getApi().today()}>Today</Button>
        <Button onClick={() => calendarRef.current.getApi().next()}>Next</Button>
      </Stack>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        ref={calendarRef}
        events={fcEvents}
        height="auto"
      />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{form.id ? 'Edit event' : 'Add event'}</DialogTitle>
        <DialogContent>
          <Box sx={{display:'flex', flexDirection:'column', gap:1, width: 420}}>
            <TextField label="Title" value={form.title} onChange={handleInput('title')} />
            <TextField label="Date" type="date" value={form.date} onChange={handleInput('date')} />
            <TextField select label="Type" value={form.type} onChange={handleInput('type')}>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </TextField>

            <TextField select label="Category" value={form.category} onChange={handleInput('category')}>
              {(form.type === 'income' ? defaultCategories.income : defaultCategories.expense).map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>

            {form.type === 'income' && form.category === 'Job' ? (
              <>
                <TextField label="Hours" type="number" value={form.hours} onChange={handleInput('hours')} />
                <TextField label="Hourly rate" type="number" value={form.rate} onChange={handleInput('rate')} />
                <TextField label="Calculated amount" value={computeAmountFromHours(Number(form.hours||0), Number(form.rate||0))} InputProps={{readOnly:true}} />
              </>
            ) : (
              <TextField label="Amount (EUR)" type="number" value={form.amount} onChange={handleInput('amount')} />
            )}

            <TextField select label="Recurring" value={form.recurring} onChange={handleInput('recurring')}>
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="biweekly">Bi-weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </TextField>
            <TextField label="Recurring ends (date)" type="date" value={form.recurringEnds} onChange={handleInput('recurringEnds')} />

            <Box sx={{display:'flex', gap:1, justifyContent:'flex-end', mt:1}}>
              {form.id && <Button color="error" onClick={remove}>Delete</Button>}
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={submit}>Save</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Box sx={{mt:2}}>
        <CashflowChart events={events} />
      </Box>
    </Box>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, Input, Card, CardMedia, CardContent, CardActions, AppBar, Toolbar } from '@mui/material'
import { firestore, storage } from '@/firebase'
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios';

const API_KEY= process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function TrackItems() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [image, setImage] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [recipes, setRecipes] = useState('')
  
  const router = useRouter()

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

 

  const handleUpload = async () => {
    let downloadURL = imageUrl

    if (image) {
      const storageRef = ref(storage, 'products/' + image.name)
      const uploadTask = uploadBytesResumable(storageRef, image)
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log('Upload is ' + progress + '% done')
        },
        (error) => {
          console.error("Upload failed:", error)
        },
        async () => {
          downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          console.log('File available at', downloadURL)
          await addItem(itemName, downloadURL)
          setItemName('')
          setImage(null)
          setImageUrl('')
          handleClose()
        }
      )
    } else {
      await addItem(itemName, downloadURL)
      setItemName('')
      setImageUrl('')
      handleClose()
    }
  }

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'Inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item, imageUrl) => {
    const docRef = doc(collection(firestore, 'Inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1, imageUrl }, { merge: true })
    } else {
      await setDoc(docRef, { quantity: 1, imageUrl })
    }
    await updateInventory()
  }

  const incrementItem = async (item) => {
    const docRef = doc(collection(firestore, 'Inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 }, { merge: true })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'Inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }, { merge: true })
      }
    }
    await updateInventory()
  }


  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    updateInventory()
  }, [])

  return (
    <Box>
      <AppBar position="static" style={{ backgroundColor: 'black' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            InvenTrack
          </Typography>
          <Button color="inherit" component={Link} href="/">Home</Button>
          <Button color="inherit" component={Link} href="/inventory">Track Items</Button>
        </Toolbar>
      </AppBar>

      <Box
        width="100vw"
        height="100vh"
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        gap={2}
        paddingTop={'64px'} // Space for AppBar
      >
        
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack width="100%" direction={'row'} spacing={2}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={handleUpload}
              >
                Add
              </Button>
            </Stack>
            <Stack width="100%" direction={'row'} spacing={2}>
              <Input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleChange}
              />
              <TextField
                id="image-url"
                label="Image URL"
                variant="outlined"
                fullWidth
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </Stack>
          </Box>
        </Modal>
        
        <Typography variant={'h2'} color={'black'} fontStyle={'bold'} textAlign={'center'} padding={'20px'}>
          Inventory Items
        </Typography>
        <TextField
          id="search-bar"
          label="Search Items"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ marginBottom: 2, width: '50%' }}
        />
        <Button variant="contained" onClick={handleOpen} style={{marginBottom: '9%', backgroundColor:'black'}}>
          Add New Item
        </Button>

        <Box width="80%" display={'flex'} flexWrap={'wrap'} paddingBottom={'15%'} gap={2} justifyContent={'center'}>
          {filteredInventory.map(({ name, quantity, imageUrl }) => (
            <Card key={name} sx={{ maxWidth: 345, m: 1 }}>
              {imageUrl && <CardMedia
                component="img"
                height="140"
                image={imageUrl}
                alt={name}
              />}
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quantity: {quantity}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" variant="contained" style={{ backgroundColor:'black'}} onClick={() => incrementItem(name)}>+</Button>
                <Button size="small" variant="contained" style={{ backgroundColor:'black'}} onClick={() => removeItem(name)}>-</Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Box>
      
   
    </Box>
   
  )
}

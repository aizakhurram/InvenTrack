'use client'
import { Box, Typography, Button, AppBar, Toolbar } from '@mui/material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();

  const handleTrackItems = () => {
    router.push('/inventory');
  };

  return (
    <Box>
      <AppBar position="static" style={{backgroundColor: 'black'}}>
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
        justifyContent={'center'}
        alignItems={'center'}
        flexDirection={'column'}
        gap={2}
        // sx={{
        //   backgroundImage: 'url("/invenTrack.avif")', 
        //   backgroundSize: 'cover',
        //   backgroundPosition: 'center',
        // }}
      >
        <Typography variant={'h2'} color={'black'} fontStyle={'bold'} textAlign={'center'} padding={'20px'}>
          Welcome to InvenTrack!
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleTrackItems} 
          style={{ marginBottom: '10%', padding: '10px', width: '15%', backgroundColor:'black'}}
        >
          Track Items
        </Button>
      </Box>
    </Box>
  );
}

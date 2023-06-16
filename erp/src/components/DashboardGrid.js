import Box from '@mui/system/Box';
import { Grid, Typography } from '@mui/material';
import LowStockChart from './DashboardCharts/LowStockChart'

export default function DashboarGrid({jwt}) {
    return(  
        <Box sx={{pt:5}} >
            <Grid container spacing={2}>
                <Grid item md={12} xs={12}>
                    <Typography variant="h2">Articulos con Bajo Stock</Typography>
                        <LowStockChart jwt={jwt} />
                </Grid>
              
            </Grid>
        </Box>
    )   
}
import Box from '@mui/system/Box';
import { Container, Grid, Typography } from '@mui/material';
import LowStockChart from './DashboardCharts/LowStockChart'

export default function DashboarGrid() {
    return(  
        <Container>
            <Grid container spacing={2}>
                <Grid item md={12} xs={12}>
                    <Typography variant="h3">Articulos con Bajo Stock</Typography>
                        <LowStockChart />
                </Grid>
            </Grid>
        </Container>
    )   
}
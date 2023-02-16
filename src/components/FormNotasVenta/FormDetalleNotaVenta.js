import _ from 'lodash'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import { toast } from 'react-toastify';


export default function FormDetalleNotaVenta(props){

   let edit_detalle = null;
   let pos = 0;
   let stk = 0;
   if(props.tipo == "editar"){
    edit_detalle = props.datos; 
    pos = _.findIndex(props.articulos, ['idarticulo', props.datos.idarticulo]);
    let articulo1 = _.find(props.articulos, ['idarticulo',props.datos.idarticulo])
    let stocks = articulo1.stocks
    let _stock = _.pick(stocks, [props.datos.nrolote]);
    stk = _.values(_stock)[0]
  }

    const [articulo, setArticulo] = useState(edit_detalle == null ? null : props.articulos[pos]);
    const [stock, setStock] = useState(edit_detalle == null ? 0 : stk);
    const formik = useFormik({
        initialValues: {
          nrolote: edit_detalle == null ? '' : edit_detalle.nrolote,
          cantidad: edit_detalle == null ? '' : edit_detalle.cantidad,
          precioventa: edit_detalle == null ? '' : edit_detalle.precioventa,
        },
        validationSchema: Yup.object({
          nrolote: Yup.number().typeError('Requerido').required('Requerido'),
          cantidad: Yup.number().typeError('Debe ser un número').integer('Debe ser un número entero').min(0,"Debe ser un número positivo").max(stock,`En stock: ${stock}`).required('Requerido'),
          precioventa: Yup.number().typeError('Debe ser un número').min(0,"Debe ser un número positivo").required('Requerido'),
        }),
        onSubmit: async values => {
          if(articulo != null){
              let precioventa= Number(values.precioventa);
              let subtotal = (values.cantidad*precioventa).toFixed(2)
              let detalle = {
                "id": articulo.idarticulo + " - " + values.nrolote,
                "idarticulo": articulo.idarticulo,
                "nombre": articulo.nombre,
                "nrolote": values.nrolote,
                "cantidad": values.cantidad,
                "precioventa": precioventa.toFixed(2),
                "subtotal": subtotal
              }
              props.submit(detalle);
              if(props.tipo == "nuevo"){
                //values.glosa = "";
                
                values.nrolote = '';
                values.cantidad = '';
                values.precioventa = '';
                setArticulo(null)
                setStock(0)
              }else{
                props.close()
              }
          }else{
            toast.error("Campo Articulo es Obligatorio",{theme: "colored"})
          }
        }
      });

      const handleArticulo = (art) =>{
      if(art != null){
        formik.values.cantidad = '';
        formik.values.precioventa = art.precioventa;
        let articulo1 = _.find(props.articulos, ['idarticulo',art.idarticulo])
        let stocks = articulo1.stocks
        let _stock = _.pick(stocks, [art.lotes[0]]);
        formik.values.nrolote = art.lotes[0];
        setStock(_.values(_stock)[0])
        setArticulo(art)
      }else{
        formik.values.cantidad = '';
        formik.values.nrolote = null;
        formik.values.precioventa = '';
        setStock(0)
        setArticulo(art)
      }
      
      

    }
      const handleLote = (nrolote) =>{
        if(nrolote != null){
          let articulo1 = _.find(props.articulos, ['idarticulo',articulo.idarticulo])
          let stocks = articulo1.stocks
          let _stock = _.pick(stocks, [nrolote]);
          formik.values.nrolote = nrolote;
          setStock(_.values(_stock)[0])
        }else{
          formik.values.cantidad = '';
          formik.values.nrolote = '';
          setStock(0)
        }
        

      }

    return(
      <Container maxWidth="xl">
        <form onSubmit={formik.handleSubmit}>   
            <Box sx={{pb: 1, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <Typography align="center" color="textSecondary" variant="h5">
                {props.tipo === "nuevo" ? "Agregar" : "Editar"} Articulo
              </Typography>
              <Button size="large" color="error" variant="contained" disabled={formik.isSubmitting}  onClick={props.close}>X</Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item md={4} xs={12}>
                <Autocomplete
                    id="combo-box-demo"
                    name="articulo"
                    options={props.articulos}
                    value={articulo}
                    getOptionLabel={(option) => option.nombre}
                    onChange={(event, newValue) => handleArticulo(newValue)}
                    disabled={props.tipo == "editar"}
                    renderInput={(params) => <TextField
                        fullWidth
                        label="Articulo"
                        margin="normal"
                        type="text"
                        disabled={props.tipo == "editar"}
                        variant="outlined"
                        focused
                        {...params} />}
                />
              </Grid>
              <Grid item md={2} xs={12}>
                <Autocomplete
                    id="combo-box-demo"
                    name="nrolote"
                    options={articulo != null ? articulo.lotes  : []}
                    value={formik.values.nrolote}
                    getOptionLabel={(option) => option.toString()}
                    onChange={(event, newValue) => handleLote(newValue)}
                    disabled={props.tipo == "editar"}
                    renderInput={(params) => <TextField
                        error={Boolean(formik.touched.cantidad && formik.errors.nrolote)}
                        fullWidth
                        helperText={formik.touched.cantidad && formik.errors.nrolote}
                        label="# Lote"
                        onBlur={formik.handleBlur}
                        margin="normal"
                        type="number"
                        variant="outlined"
                        focused
                        {...params} />}
                />
              </Grid>
              <Grid item md={2} xs={12}>
                <TextField sx={{textAlign:'right'}}
                  error={Boolean(formik.touched.cantidad && formik.errors.cantidad)}
                  fullWidth
                  helperText={formik.touched.cantidad && formik.errors.cantidad}
                  label="Cantidad"
                  margin="normal"
                  name="cantidad"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="number"
                  value={formik.values.cantidad}
                  variant="outlined"
                  focused
                  disabled={!stock}
                  inputProps={{
                    step:"1",
                    min: 0,
                    max: {stock},
                    lang:"en",
                    style: { textAlign: "right" }
                  }}
                />
              </Grid>
              <Grid item md={2} xs={12}>
                <TextField sx={{textAlign:'right'}}
                 error={Boolean(formik.touched.precioventa && formik.errors.precioventa)}
                 fullWidth
                 helperText={formik.touched.precioventa && formik.errors.precioventa}
                  label="Precio"
                  margin="normal"
                  name="precioventa"
                  onBlur={formik.handleBlur}
                  type="number"
                  value={formik.values.precioventa}
                  variant="outlined"
                  focused
                  disabled
                  inputProps={{
                    step:".01",
                    min: 0,
                    lang:"en",
                    style: { textAlign: "right" }
                  }}
                />
              </Grid>
              <Grid item md={2} xs={12}>
                <TextField sx={{textAlign:'right'}}
                  fullWidth
                  label="Subtotal"
                  margin="normal"
                  name="subtotal"
                  type="number"
                  value={Number(formik.values.cantidad*formik.values.precioventa).toFixed(2)}
                  variant="outlined"
                  disabled
                  inputProps={{
                    step:".01",
                    min: 0,
                    lang:"en",
                    style: { textAlign: "right" }
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ py: 1,display:'flex',justifyContent:'end' }}>
              <Button size="large" color="primary" disabled={formik.isSubmitting} type="submit" variant="contained">
                Guardar
              </Button>
              
            </Box>
          </form>
        </Container>
    )
}
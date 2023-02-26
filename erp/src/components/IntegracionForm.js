import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import Grid from '@mui/material/Grid';
import { useFormik } from 'formik';
import _ from 'lodash';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Autocomplete } from '@mui/material';
import { useState } from 'react';
import theme from '../theme/theme';

async function actualizarIntegracion(datos) {
  return fetch('http://localhost:3000/api/integracion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  })
    .then(result => result.json())
 }


export default function IntegracionForm(props){

    let c = props.cuentas;
    let integracion = props.integracion;


    const[valores, setValores] = useState({
      caja: integracion.caja != null ? integracion.caja : null,
      creditofiscal: integracion.creditofiscal != null ? integracion.creditofiscal : null,
      debitofiscal: integracion.debitofiscal != null ? integracion.debitofiscal : null,
      compras: integracion.compras != null ? integracion.compras : null,
      ventas: integracion.ventas != null ? integracion.ventas : null,
      it: integracion.it != null ? integracion.it : null,
      itxpagar: integracion.itxpagar != null ? integracion.itxpagar : null,
    })

    


    const[cuentas, setCuentas] = useState(c)

    const formik = useFormik({
        initialValues: {
          toggle: integracion.estado == 1 ? true : false,
        },
        onSubmit: async values => {
          if(_.includes(_.values(valores),null)){
            toast.error("Debe seleccionar todas las cuentas", {theme:'colored'})
            return
          }
            let data = {
              estado: values.toggle == true ? 1 : 0,
              caja: valores.caja.id,
              creditofiscal: valores.creditofiscal.id,
              debitofiscal: valores.debitofiscal.id,
              compras: valores.compras.id,
              ventas: valores.ventas.id,
              it: valores.it.id,
              itxpagar: valores.itxpagar.id
            }
            let respuesta = await actualizarIntegracion(data);
            if(respuesta.ok){
              toast.success(respuesta.mensaje, {theme: 'colored'})
              props.submit();
            }else{
              toast.error(respuesta.mensaje, {theme: 'colored'})
            }
            
        }
      });

      const handleSelect = (value, name) => {
        let _valores = _.cloneDeep(valores);
        let _cuentas =  _.without(cuentas,value)
        switch (name) {
          case "caja":
            if(_valores.caja != null) _cuentas.push(_valores.caja)
            _valores.caja = value;
            break;
        case "creditofiscal":
            if(_valores.creditofiscal != null) _cuentas.push(_valores.creditofiscal)
            _valores.creditofiscal = value;
            break;
        case "debitofiscal":
            if(_valores.debitofiscal != null) _cuentas.push(_valores.debitofiscal)
            _valores.debitofiscal = value;
            break;
        case "compras":
            if(_valores.compras != null) _cuentas.push(_valores.compras)
            _valores.compras = value;
            break;
        case "ventas":
            if(_valores.ventas != null) _cuentas.push(_valores.ventas)
            _valores.ventas = value;
              break;
        case "it":
            if(_valores.it != null) _cuentas.push(_valores.it)
            _valores.it = value;
            break;
        case "itxpagar":
            if(_valores.itxpagar != null) _cuentas.push(_valores.itxpagar)
            _valores.itxpagar = value;
            break;
        default: break;
        }
        setCuentas(_.orderBy(_cuentas,['label'],['asc']));
        setValores(_valores);
      }

    return(
      <Container maxWidth="md">
        <form onSubmit={formik.handleSubmit}>   
            <Grid container spacing={2}>
              <Grid item md={6} xs={6}>
              <FormControlLabel control=
              {<Checkbox
                  name="toggle"
                  checked={formik.values.toggle}
                  onChange={formik.handleChange}
                  size="large"
                />} label={<Typography variant="h4" component="h4"> Integracion: </Typography>} labelPlacement="start" />
              </Grid>
              <Grid item md={6} xs={6} sx={{textAlign: 'right'}}>
                <Button sx={{mx: 3, height: '100%'}}  color="success" disabled={formik.isSubmitting} type="submit" variant="contained" >
                <SaveRoundedIcon fontSize='large' />
                </Button>
              </Grid>
              <Grid item md={6} xs={12}>
                <Autocomplete
                    name="caja"
                    options={cuentas}
                    value={valores.caja}
                    isOptionEqualToValue={(option, value) => option.label == value.label}
                    getOptionLabel={(option)=> option.label}
                    onChange={(e, v) => {handleSelect(v,"caja")}}
                    renderInput={(params) => <TextField
                        fullWidth
                        label="Caja"
                        margin="normal"
                        placeholder='Cuenta Caja'
                        type="text"
                        variant="outlined"
                        focused
                        required
                        {...params} />}
                />
                
              </Grid>
              <Grid item md={6}  xs={12}></Grid>
              <Grid item md={6} xs={12}>
                <Autocomplete
                    name="creditofiscal"
                    options={cuentas}
                    value={valores.creditofiscal}
                    isOptionEqualToValue={(option, value) => option.label == value.label}
                    getOptionLabel={(option)=> option.label}
                    onChange={(e, v) => {handleSelect(v,"creditofiscal")}}
                    renderInput={(params) => <TextField
                        fullWidth
                        label="Credito Fiscal"
                        margin="normal"
                        placeholder='Cuenta Credito Fiscal'
                        type="text"
                        variant="outlined"
                        focused
                        required
                        {...params} />}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <Autocomplete
                    name="debitofiscal"
                    options={cuentas}
                    value={valores.debitofiscal}
                    isOptionEqualToValue={(option, value) => option.label == value.label}
                    getOptionLabel={(option)=> option.label}
                    onChange={(e, v) => {handleSelect(v,"debitofiscal")}}
                    renderInput={(params) => <TextField
                        fullWidth
                        label="Debito Fiscal"
                        margin="normal"
                        placeholder='Cuenta Debito Fiscal'
                        type="text"
                        variant="outlined"
                        focused
                        required
                        {...params} />}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <Autocomplete
                    name="compras"
                    options={cuentas}
                    value={valores.compras}
                    isOptionEqualToValue={(option, value) => option.label == value.label}
                    getOptionLabel={(option)=> option.label}
                    onChange={(e, v) => {handleSelect(v,"compras")}}
                    renderInput={(params) => <TextField
                        fullWidth
                        label="Compras"
                        margin="normal"
                        placeholder='Cuenta Compras'
                        type="text"
                        variant="outlined"
                        focused
                        required
                        {...params} />}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <Autocomplete
                    name="ventas"
                    options={cuentas}
                    value={valores.ventas}
                    isOptionEqualToValue={(option, value) => option.label == value.label}
                    getOptionLabel={(option)=> option.label}
                    onChange={(e, v) => {handleSelect(v,"ventas")}}
                    renderInput={(params) => <TextField
                        fullWidth
                        label="Ventas"
                        margin="normal"
                        placeholder='Cuenta Ventas'
                        type="text"
                        variant="outlined"
                        focused
                        required
                        {...params} />}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <Autocomplete
                    name="it"
                    options={cuentas}
                    value={valores.it}
                    isOptionEqualToValue={(option, value) => option.label == value.label}
                    getOptionLabel={(option)=> option.label}
                    onChange={(e, v) => {handleSelect(v,"it")}}
                    renderInput={(params) => <TextField
                        fullWidth
                        label="IT"
                        margin="normal"
                        placeholder='Cuenta IT'
                        type="text"
                        variant="outlined"
                        focused
                        required
                        {...params} />}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <Autocomplete
                    name="itxpagar"
                    options={cuentas}
                    value={valores.itxpagar}
                    isOptionEqualToValue={(option, value) => option.label == value.label}
                    getOptionLabel={(option)=> option.label}
                    onChange={(e, v) => {handleSelect(v,"itxpagar")}}
                    renderInput={(params) => <TextField
                        fullWidth
                        label="IT por Pagar"
                        margin="normal"
                        placeholder='Cuenta IT por Pagar'
                        type="text"
                        variant="outlined"
                        focused
                        required
                        {...params} />}
                />
              </Grid>
            </Grid>
          </form>
          
        </Container>
    )
}
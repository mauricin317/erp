import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import FormDetalleNotaVenta from './FormDetalleNotaVenta';
import { ToastContainer } from 'react-toastify';

const style = {
  position: 'absolute',
  top: '25%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '70%',
  bgcolor: 'background.paper',
  border: '2px solid #333',
  boxShadow: 24,
  py: 1,
};

export default function ModalForm(props) {

 

  return (
    <div>
      <Modal
        open={props.open}
        onClose={props.close}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{overflow: 'auto', backgroundColor: "rgba(0, 0, 0, 0.3)"}}
      >
        <Box sx={style}>
        <FormDetalleNotaVenta close={props.close} tipo={props.tipo} datos={props.datos} submit={props.submit} articulos={props.articulos} />
        </Box>
      </Modal>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover />
    </div>
  );
}
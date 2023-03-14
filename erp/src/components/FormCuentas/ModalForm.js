import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import FormCuenta from './FormCuenta';

import { ToastContainer } from 'react-toastify';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '40%',
  bgcolor: 'background.paper',
  border: '2px solid #333',
  boxShadow: 24,
  p: 4,
};

export default function ModalForm(props) {

 

  return (
    <div>
      <Modal
        open={props.open}
        onClose={props.close}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{overflow: 'auto'}}
      >
        <Box sx={style}>
        <FormCuenta close={props.close} tipo={props.tipo} datos={props.datos} submit={props.submit} niveles={props.niveles} jwt={props.jwt} />
        </Box>
      </Modal>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover />
    </div>
  );
}
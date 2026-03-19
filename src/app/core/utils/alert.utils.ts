import Swal from 'sweetalert2';

export async function ShowSuccessAlert(title: string, text: string): Promise<void> {
  await Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'Aceptar'
  });
}

export async function ShowErrorAlert(title: string, text: string): Promise<void> {
  await Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Aceptar'
  });
}
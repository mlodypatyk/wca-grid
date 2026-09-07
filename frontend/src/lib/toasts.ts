import { Bounce, toast, type ToastOptions } from 'react-toastify'

const baseConfig: ToastOptions = {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
  transition: Bounce,
}

export const toastCopiedSuccess = () => toast.success('Copied to clipboard!', baseConfig)
export const toastCopiedFailed = () => toast.error('Failed to copy.', baseConfig)
export const toastWrongGuess = () => toast.error('Wrong guess!', baseConfig)
export const toastAlreadyGuessed = () => toast.warn('Already guessed.', baseConfig)

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function usePasswordVisibility(value = '') {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setShowPassword((prev) => !prev)
  }

  const passwordVisibilityButton = {
    icon: showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />,
    tooltip: showPassword ? 'Hide password' : 'Show password',
    onClick: togglePasswordVisibility,
    show: Boolean(value && value.length > 0), // Only show when input has content
  }

  return {
    showPassword,
    passwordVisibilityButton,
    inputType: showPassword ? 'text' : 'password',
  }
}

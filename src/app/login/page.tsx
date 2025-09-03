'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { SiGithub, SiGoogle } from '@icons-pack/react-simple-icons'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { TextInput, myToast } from '@/components/custom'
import { usePasswordVisibility } from '@/hooks'
import { isStaticExport, isClientStaticExport } from '@/lib/data-config'
import { signIn } from '@/lib/auth-client'

type LoginForm = {
  email: string
  password: string
}

export default function LoginPage() {
  const t = useTranslations('LoginPage')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { isValid },
    setValue,
    watch,
  } = useForm<LoginForm>({
    mode: 'onChange',
  })

  const emailValue = watch('email') || ''
  const passwordValue = watch('password') || ''

  const { passwordVisibilityButton, inputType } = usePasswordVisibility(passwordValue)

  // Redirect to home if in static mode
  useEffect(() => {
    const isStaticMode = isStaticExport || isClientStaticExport()
    if (isStaticMode) {
      router.replace('/')
    }
  }, [router])

  const onSubmit: SubmitHandler<LoginForm> = ({ email, password }) => {
    signIn.email(
      {
        email,
        password,
      },
      {
        onError: ({ error }) => {
          myToast({ message: error.message })
        },
        onSuccess: () => {
          router.push('/')
        },
      }
    )
  }

  const handleEmailChange = (_event: React.SyntheticEvent | undefined, newValue: string) => {
    setValue('email', newValue, { shouldValidate: true })
  }

  const handlePasswordChange = (_event: React.SyntheticEvent | undefined, newValue: string) => {
    setValue('password', newValue, { shouldValidate: true })
  }

  // Check if we're in static mode (client-side check for render)
  const isStaticMode = isStaticExport || isClientStaticExport()

  // Don't render anything in static mode (while redirecting)
  if (isStaticMode) {
    return null
  }
  return (
    <div className="flex w-full items-start justify-center m-3 mt-16">
      <Card className="max-w-sm w-full flex flex-col items-center">
        <CardHeader className="flex flex-col items-center">
          <CardTitle>{t('signIn')}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow w-full gap-4 flex flex-col">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="email">{t('email')}</Label>
              <TextInput
                id="email"
                type="email"
                value={emailValue}
                onValueChange={handleEmailChange}
                clearable
                {...register('email', {
                  required: 'email is required!!',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Entered value does not match email format',
                  },
                })}
              />
            </div>
            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <TextInput
                id="password"
                type={inputType}
                value={passwordValue}
                onValueChange={handlePasswordChange}
                actionButtons={[passwordVisibilityButton]}
                {...register('password', {
                  required: 'required',
                  minLength: {
                    value: 8,
                    message: 'min length is 8',
                  },
                })}
              />
            </div>
            <Button disabled={!isValid} type="submit">
              {t('signIn')}
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('orContinueWith')}
              </span>
            </div>
          </div>
          <Button variant="outline">
            <SiGoogle />
            {t('google')}
          </Button>
          <Button variant="outline">
            <SiGithub />
            {t('github')}
          </Button>
        </CardContent>
        <CardFooter>
          <span className="text-muted-foreground text-sm">
            {t('noAccountYet')}{' '}
            <Link href="/signup" className="underline hover:text-foreground">
              {t('signUp')}
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}

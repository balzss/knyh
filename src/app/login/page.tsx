'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { SiGithub, SiGoogle } from '@icons-pack/react-simple-icons'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function LoginPage() {
  const t = useTranslations('LoginPage')
  return (
    <div className="flex w-full items-start justify-center m-3 mt-16">
      <Card className="max-w-sm w-full flex flex-col items-center">
        <CardHeader className="flex flex-col items-center">
          <CardTitle>{t('signIn')}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow w-full gap-4 flex flex-col">
          <div>
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" type="email" />
          </div>
          <div>
            <Label htmlFor="password">{t('password')}</Label>
            <Input id="password" type="password" />
          </div>
          <Button asChild>
            <Link href="/">{t('signIn')}</Link>
          </Button>
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

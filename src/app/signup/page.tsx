'use client'

import Link from 'next/link'
import { SiGithub, SiGoogle } from '@icons-pack/react-simple-icons'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="flex w-full items-center justify-center m-3">
      <Card className="max-w-sm w-full flex flex-col items-center">
        <CardHeader className="flex flex-col items-center">
          <CardTitle>Create an account</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow w-full gap-4 flex flex-col">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>
          <Button className="font-bold">Continue</Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button className="font-bold" variant="outline">
            <SiGithub />
            Github
          </Button>
          <Button className="font-bold" variant="outline">
            <SiGoogle />
            Google
          </Button>
        </CardContent>
        <CardFooter>
          <span className="text-muted-foreground ">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:text-foreground">
              Log in
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}

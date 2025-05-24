import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export default function Pricing() {
    const plans = [
        {
            name: 'Single Pitch',
            price: '$6.99',
            subtext: 'Generate one pitch',
            description: 'One-time payment',
            features: [
                '1 APS Pitch Generation',
                'STAR Format Structure',
                'Selection Criteria Alignment',
                'Professional Tone',
                'Secure and Confidential'
            ],
            isPopular: false,
            href: '#'
        },
        {
            name: 'Pitch Pack',
            price: '$12.99',
            subtext: 'Generate five pitches',
            description: 'One-time payment',
            features: [
                '5 APS Pitch Generations',
                'STAR Format Structure',
                'Selection Criteria Alignment',
                'Professional Tone',
                'Secure and Confidential',
                'Save and Edit Pitches'
            ],
            isPopular: true,
            href: '#'
        },
        {
            name: 'Pro Bundle',
            price: '$19.99',
            subtext: 'Generate 15 pitches',
            description: 'One-time payment',
            features: [
                '15 APS Pitch Generations',
                'STAR Format Structure',
                'Selection Criteria Alignment',
                'Professional Tone',
                'Secure and Confidential',
                'Save and Edit Pitches',
                'Priority Support'
            ],
            isPopular: false,
            href: '#'
        }
    ]

    return (
        <section className="bg-white py-16 md:py-32">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mx-auto mb-8 max-w-2xl space-y-6 text-center md:mb-20">
                    <h1 className="text-center text-4xl font-semibold lg:text-5xl">Pay Per Use Pricing</h1>
                    <p className="text-gray-600">Choose the pack that best fits your application needs. One-time payments, generate more when you need them.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {plans.map((plan, index) => (
                        <Card
                            key={index}
                            className={`flex flex-col ${plan.isPopular ? 'border-2 border-black shadow-lg' : 'shadow-md'}`}>
                            {plan.isPopular && (
                                <div className="bg-black text-white text-xs font-semibold py-1 px-3 rounded-t-lg text-center">
                                    Most Popular
                                </div>
                            )}
                            <CardHeader className={plan.isPopular ? 'pt-2' : ''}>
                                <CardTitle className="font-medium">{plan.name}</CardTitle>
                                <span className="my-3 block text-3xl font-bold">{plan.price}</span>
                                <CardDescription className="text-sm">{plan.subtext}</CardDescription>
                            </CardHeader>

                            <CardContent className="flex-grow space-y-4">
                                <hr className="border-dashed" />
                                <p className="text-sm text-gray-500">{plan.description}</p>
                                <ul className="list-outside space-y-3 text-sm">
                                    {plan.features.map((feature, i) => (
                                        <li
                                            key={i}
                                            className="flex items-center gap-2">
                                            <Check className="size-4 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    asChild
                                    className={'mt-4 w-full bg-black hover:bg-gray-800 text-white'}>
                                    <Link href={plan.href}>Get Started</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

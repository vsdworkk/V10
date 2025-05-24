/*
This client component provides the social proof section for the landing page.
*/

"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const SocialProofSection = () => {
  return (
    <section className="bg-white py-16 md:py-32">
      <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12"
        >
          <h2 className="text-4xl font-medium lg:text-5xl">Trusted by APS professionals across Australia</h2>
          <p className="text-gray-600">Real success stories from professionals who transformed their APS applications and landed their dream government roles.</p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="sm:col-span-2 lg:row-span-2"
          >
            <Card className="h-full">
              <CardHeader>
                <div className="h-6 w-fit text-lg font-semibold text-gray-800">
                  Department of Health
                </div>
              </CardHeader>
              <CardContent>
                <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                  <p className="text-xl font-medium">"This platform completely transformed my APS application process. The AI-generated pitch perfectly aligned my experience with the selection criteria using the STAR format. I went from struggling with applications to landing my dream role as a Senior Policy Advisor. The structured approach made all the difference."</p>

                  <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-gray-100 text-gray-600">SJ</AvatarFallback>
                    </Avatar>

                    <div>
                      <cite className="text-sm font-medium">Sarah Johnson</cite>
                      <span className="text-muted-foreground block text-sm">Senior Policy Advisor</span>
                    </div>
                  </div>
                </blockquote>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="md:col-span-2"
          >
            <Card className="h-full">
              <CardContent className="pt-6">
                <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                  <p className="text-xl font-medium">"After 18 months of unsuccessful applications, this tool helped me craft a compelling pitch that showcased my experience in the exact format APS recruiters expect. Landed my role at Services Australia within 3 weeks."</p>

                  <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-gray-100 text-gray-600">MT</AvatarFallback>
                    </Avatar>
                    <div>
                      <cite className="text-sm font-medium">Michael Thompson</cite>
                      <span className="text-muted-foreground block text-sm">Program Manager, Services Australia</span>
                    </div>
                  </div>
                </blockquote>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <Card className="h-full">
              <CardContent className="pt-6">
                <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                  <p>"The AI understood exactly how to present my private sector experience for government roles. My application stood out immediately."</p>

                  <div className="grid items-center gap-3 [grid-template-columns:auto_1fr]">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-gray-100 text-gray-600">JL</AvatarFallback>
                    </Avatar>
                    <div>
                      <cite className="text-sm font-medium">Jessica Lee</cite>
                      <span className="text-muted-foreground block text-sm">Communications Officer</span>
                    </div>
                  </div>
                </blockquote>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <Card className="h-full">
              <CardContent className="pt-6">
                <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                  <p>"Finally, a tool that speaks APS language. The structured STAR responses were exactly what the selection panel was looking for."</p>

                  <div className="grid grid-cols-[auto_1fr] gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-gray-100 text-gray-600">RA</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Robert Anderson</p>
                      <span className="text-muted-foreground block text-sm">Executive Officer, Treasury</span>
                    </div>
                  </div>
                </blockquote>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 
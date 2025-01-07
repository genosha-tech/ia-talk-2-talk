import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(1, "Por favor ingresa tu nombre"),
  age: z.string().min(1, "Por favor ingresa tu edad"),
  gender: z.string().min(1, "Por favor selecciona tu género"),
  location: z.string().min(1, "Por favor ingresa tu ciudad"),
  influencer: z.string().min(1, "Por favor ingresa tu influencer favorito"),
  passion: z.string().min(1, "Por favor ingresa tu pasión"),
});

export type UserProfile = z.infer<typeof formSchema>;

interface InitialFormProps {
  onSubmit: (data: UserProfile) => void;
}

export default function InitialForm({ onSubmit }: InitialFormProps) {
  const form = useForm<UserProfile>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: "",
      gender: "",
      location: "",
      influencer: "",
      passion: "",
    },
  });

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Bienvenido a la Experiencia Interactiva</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Cómo te llamás?</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Qué edad tenés?</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Tu edad" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Cómo te identificás?</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu género" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿De dónde sos?</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu ciudad" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="influencer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Quién es tu influencer o youtuber favorito?</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu influencer favorito" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Cuál es tu pasión en la vida?</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu pasión" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">Comenzar Aventura</Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}

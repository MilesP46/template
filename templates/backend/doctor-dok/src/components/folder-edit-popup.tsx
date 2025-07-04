'use client'
/**
* This code was generated by v0 by Vercel.
* @see https://v0.dev/t/vVUGACvQM0u
* Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
*/

/** Add fonts into your Next.js project:

import { Inter } from 'next/font/google'

inter({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod"
import { FolderContext } from "@/contexts/folder-context"
import { use, useContext, useEffect, useState } from "react"
import { Folder, Record } from "@/data/client/models"
import { Credenza, CredenzaClose, CredenzaContent, CredenzaDescription, CredenzaFooter, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "./credenza"
import { JsonEditor } from 'json-edit-react'
import { useTheme } from "next-themes"
import { or } from "drizzle-orm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"
import { useHookFormMask } from 'use-mask-input';
import defaultJsonData from '@/defaults/folder-data.json'

export function FolderEditPopup() {
  const folderContext = useContext(FolderContext);
  const { theme, systemTheme } = useTheme();
  const currentTheme = (theme === 'system' ? systemTheme : theme)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(2, "Folder name is required"),
        json: z.string().optional(),
      }),
    ),
  })
  const registerWithMask = useHookFormMask(register);


  const [jsonData, setJsonData] = useState(defaultJsonData);

  useEffect(() => {
      if(folderContext?.currentFolder && folderContext?.folderEditOpen && !folderContext?.addingNewFolder) {
        setJsonData(folderContext?.currentFolder.json);
        setValue('name', folderContext?.currentFolder.name);
      }
  }, [folderContext?.currentFolder, folderContext?.folderEditOpen, folderContext?.addingNewFolder, setValue]);

  const onSubmit = (data) => {
    let pr: Folder;
    if (folderContext?.currentFolder  && folderContext?.folderEditOpen && !folderContext?.addingNewFolder) {
      pr = new Folder(folderContext?.currentFolder);
      pr.json = jsonData;
      pr.name = data.name;
      pr.updatedAt = new Date().toISOString();
    } else {
      pr = new Folder({
        name: data.name,
        json: JSON.stringify(jsonData),
        updatedAt: new Date().toISOString()
      });
    }
    folderContext?.updateFolder(pr);
    folderContext?.setFolderEditOpen(false);
    folderContext?.setAddingNewFolder(false);
    reset();
    setJsonData(defaultJsonData);
  }
  return (
    <Credenza open={folderContext?.folderEditOpen} onOpenChange={(e) => { folderContext?.setFolderEditOpen(e); if(!e) folderContext?.setAddingNewFolder(false); }}>
      <div>
      <Button variant="outline" className="absolute right-5 top-7" size="icon" onClick={(e) => {
        folderContext?.setAddingNewFolder(true);
        folderContext?.setFolderEditOpen(true);
      }}>
          <PlusIcon className="w-6 h-6" />
        </Button>
      </div>
      <CredenzaContent className="sm:max-w-[500px] bg-white dark:bg-zinc-950" side="top">
          <div className="p-4 overflow-y-scroll max-h-svh">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general" className="dark:data-[state=active]:bg-zinc-900 data-[state=active]:bg-zinc-100">General</TabsTrigger>
                  <TabsTrigger value="additional" className="dark:data-[state=active]:bg-zinc-900 data-[state=active]:bg-zinc-100">Meta data</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="p-4">
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Folder Name</Label>
                    <Input id="name" autoFocus error={errors.name?.message} {...register("name")} />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="additional" className="p-4">
                <div className="space-y-2">
                  <Label htmlFor="json">Additional Information</Label>
                  <JsonEditor
                    data={jsonData}
                    setData={setJsonData}
                  />
                  </div>
                </TabsContent>
              </Tabs>
              <CredenzaFooter>
                <div className="flex gap-2 place-content-end">
                  <Button type="submit">Save</Button>
                  <CredenzaClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </CredenzaClose>
                </div>
              </CredenzaFooter>
            </form>
          </div>
      </CredenzaContent>
    </Credenza>
  )
}


function PlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

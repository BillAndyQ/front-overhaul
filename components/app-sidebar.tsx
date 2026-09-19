"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { AppWindow, BookText, BookUser, Building2, CameraIcon, CircleHelpIcon, DatabaseIcon, FileChartColumnIcon, FileIcon, FileTextIcon, HomeIcon, ReceiptText, SearchIcon, Settings2Icon, UserLock, UsersIcon, Wrench } from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Inicio",
      url: "/v1/inicio",
      icon: (
        <HomeIcon
        />
      ),
    },
    {
      title: "OT Equipos",
      url: "/v1/ot_equipos",
      icon: (
        <Wrench />
      ),
    },
    {
      title: "OT Personas",
      url: "/v1/ot_personas",
      icon: (
        <UserLock />
      ),
    },
    {
      title: "Facturas",
      url: "/v1/facturas",
      icon: (
        <ReceiptText />
      ),
    },
    {
      title: "Empresas",
      url: "/v1/empresas",
      icon: (
        <Building2 />
      ),
    },
    {
      title: "Cursos",
      url: "/v1/cursos",
      icon: (
        <BookText />
      ),
    },
    {
      title: "Inscripciones",
      url: "/v1/inscripciones",
      icon: (
        <BookUser />
      ),
    },
    {
      title: "Team",
      url: "#",
      icon: (
        <UsersIcon
        />
      ),
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: (
        <CameraIcon
        />
      ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <CircleHelpIcon
        />
      ),
    },
    {
      title: "Search",
      url: "#",
      icon: (
        <SearchIcon
        />
      ),
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: (
        <DatabaseIcon
        />
      ),
    },
    {
      name: "Reports",
      url: "#",
      icon: (
        <FileChartColumnIcon
        />
      ),
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: (
        <FileIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <AppWindow className="size-5!" />
                <img
                  src="/logo_sidebar.png"
                  alt="Image"
                  className="w-[130px] inset-0 w-[90%] ms-6 left-15 top-[-12] object-cover dark:brightness-[0.2] dark:grayscale"
                />
                {/* <span className="text-base font-semibold">Oversite</span> */}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useHasActiveSubscription } from '@/features/subscriptions/hooks/use-subscription';
import { authClient } from '@/lib/auth-client';
import {
  CreditCardIcon,
  ExternalLinkIcon,
  FolderOpenIcon,
  HistoryIcon,
  KeyIcon,
  LogOutIcon,
  StarIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import path from 'path';

const menuItems = [
  {
    title: 'Main',
    items: [
      { title: 'Workflows', icon: FolderOpenIcon, url: '/workflows' },
      { title: 'Credentials', icon: KeyIcon, url: '/credentials' },
      { title: 'Executions', icon: HistoryIcon, url: '/executions' },
    ],
  },
];
export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const { hasActiveSubscription, isLoading } = useHasActiveSubscription();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
              <Link href="/workflows" prefetch>
                <Image src="/logo.svg" alt="Nodebase" width={30} height={30} className="h-auto" />
                <span className="font-semibold text-sm">Nodebase</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={item.url === '/' ? pathname === '/' : pathname.startsWith(item.url)}
                      asChild
                      className="gap-x-4 h-10 px-4"
                    >
                      <Link href={item.url} prefetch>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {!hasActiveSubscription && !isLoading && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Upgrade to Pro"
                className="gap-x-4 h-10 px-4"
                onClick={() => authClient.checkout({ slug: 'pro' })}
              >
                <StarIcon className="size-4" />
                <span>Upgrade to Pro</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Billing portal"
              className="gap-x-4 h-10 px-4"
              onClick={() => authClient.customer.portal()}
            >
              <CreditCardIcon className="size-4" />
              <span>Billing portal</span>
              <ExternalLinkIcon className="size-4 ms-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              className="gap-x-4 h-10 px-4"
              onClick={() =>
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push('/login');
                    },
                  },
                })
              }
            >
              <LogOutIcon className="size-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

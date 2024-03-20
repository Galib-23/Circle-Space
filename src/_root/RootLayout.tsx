import Bottombar from "@/components/shared/Bottombar"
import LeftSidebar from "@/components/shared/LeftSidebar"
import Topbar from "@/components/shared/Topbar"
import { Outlet, useLocation } from "react-router-dom"

const RootLayout = () => {
  const location = useLocation();
  return (
    <div className="w-full md:flex">
      {
        location.pathname.includes('/chats/') ? <></> : <Topbar />
      }
      <LeftSidebar />

      <section className="flex flex-1 h-full">
        <Outlet />
      </section>
      {
        location.pathname.includes('/chats/') ? <></> : <Bottombar />
      }
    </div>
  )
}

export default RootLayout

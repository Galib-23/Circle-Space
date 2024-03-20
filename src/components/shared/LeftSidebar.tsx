import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations"
import { useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";
import { sidebarLinks } from "@/constants";
import { INavLink } from "@/types";
import { Button } from "../ui/button";
import Swal from "sweetalert2";

const LeftSidebar = () => {

  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { pathname } = useLocation();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess])

  const handleSignOut = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Log out!"
    }).then((result) => {
      if (result.isConfirmed) {
        signOut()
        Swal.fire({
          title: "Logged out!",
          text: "You are successfully logged out.",
          icon: "success"
        });
      }
    });
  }

  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11">
        <Link to='/' className="">
          <img
            src="/assets/images/logo.png"
            alt="logo"
            width={200}
            height={100}
          />
        </Link>
        <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
          <img src={user.imageUrl || "/assets/images/profile.png"} alt="profile" className="h-14 w-1/4 rounded-full" />
          <div className="flex flex-col">
            <p className="body-bold">{user.name}</p>
            <p className="small-regular text-light-3">{user.username}</p>
          </div>
        </Link>
        <ul className="flex flex-col gap-6">
          {
            sidebarLinks.map((link: INavLink) => {
              const isActive = pathname === link.route;

              return (
                <li key={link.label} className={`leftsidebar-link group ${isActive && 'bg-primary-500'}`}>
                  <NavLink to={link.route} className='flex gap-4 items-center p-4'>
                    <img src={link.imgURL} alt={link.label} className={`group-hover:invert-white ${isActive && 'invert-white'}`} />
                    {link.label}
                  </NavLink>
                </li>
              )
            })
          }
        </ul>
      </div>

      <Button
        onClick={handleSignOut}
        variant="ghost"
        className="shad-button_ghost">
        <img
          src="/assets/icons/logout.svg"
          alt="logout" />
        <p className="small-medium lg:base-medium">Logout</p>
      </Button>
    </nav>
  )
}

export default LeftSidebar

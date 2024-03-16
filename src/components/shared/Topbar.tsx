import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations"
import { useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";

const Topbar = () => {

  const {mutate: signOut, isSuccess} = useSignOutAccount();
  const navigate = useNavigate();
  const { user } = useUserContext();

  useEffect(() => {
    if(isSuccess) navigate(0);
  }, [isSuccess])
  

  return (
    <section className="topbar overflow-x-hidden">
      <div className="flex-between px-3 py-4">
        <Link to='/' className="flex gap-3 items-center">
          <img 
          src="/assets/images/logo.png" 
          alt="logo"
          width={150}
          height={100}
           />
        </Link>

        <div className="flex gap-4">
          <Button onClick={() => signOut()} variant="ghost" className="shad-button_ghost">
            <img src="/assets/icons/logout.svg" alt="logout" />
          </Button>
          <Link to={`/profile/${user.id}`} className="flex-center gap-3">
            <img src={user.imageUrl || '/assets/images/profile.png'} alt="profile" className="h-8 w-8 rounded-full" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Topbar
